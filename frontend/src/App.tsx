import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Theme, ThemeDetail, ExportLog } from './types';
import { PresetThemes, SpacingPresets, TypographyPresets, RadiusPresets, ShadowPresets } from './utils/presets';
import { generateSajidPalette, getContrastRatio, oklchToRgb, isOklchOutOfGamut, rgbToHex, rgbToOklch } from './utils/colors';
import { PreviewEngine } from './components/PreviewEngine';
import { PreviewGallery } from './components/PreviewGallery';
import { ExportCentre } from './components/ExportCentre';

import * as Bindings from '../wailsjs/go/main/App';
import * as Icons from 'lucide-react';
import lucideTags from './utils/lucide-tags.json';

function App() {
  const [activeScreen, setActiveScreen] = useState<'dashboard' | 'builder' | 'export' | 'settings'>('dashboard');
  const [themes, setThemes] = useState<Theme[]>([]);
  const [activeThemeDetail, setActiveThemeDetail] = useState<ThemeDetail | null>(null);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [previewMode, setPreviewMode] = useState<'dark' | 'light'>('dark');
  
  // Settings/Logs
  const [exportLogs, setExportLogs] = useState<ExportLog[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [pendingImport, setPendingImport] = useState<{ detail: ThemeDetail; fileName: string } | null>(null);

  // Eyedropper / Image Color Picker states
  const [pickerImageSrc, setPickerImageSrc] = useState<string | null>(null);
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);
  const [magnifierStyle, setMagnifierStyle] = useState<React.CSSProperties>({ display: 'none' });
  const [magnifierColor, setMagnifierColor] = useState<string>('#ffffff');
  const [isDraggingJson, setIsDraggingJson] = useState(false);
  const [selectedBlueprintIndex, setSelectedBlueprintIndex] = useState(0);
  const [selectedBlueprintAudience, setSelectedBlueprintAudience] = useState('Operators and managers');
  const [selectedBlueprintScreenSet, setSelectedBlueprintScreenSet] = useState('Dashboard + register + reports');
  const [selectedBlueprintStack, setSelectedBlueprintStack] = useState('Offline Wails desktop');
  const [selectedMappingKey, setSelectedMappingKey] = useState<string>('Dashboard');
  const [iconSearchQuery, setIconSearchQuery] = useState<string>('');
  const [sandboxTranslate, setSandboxTranslate] = useState<boolean>(false);
  const [sandboxTestCurve, setSandboxTestCurve] = useState<'standard' | 'emphasised' | 'bounce'>('bounce');
  const [sandboxCardFlipped, setSandboxCardFlipped] = useState<boolean>(false);
  
  const imageRef = React.useRef<HTMLImageElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPickerImageSrc(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPickerImageSrc(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    const img = imageRef.current;
    if (!img) return;

    const canvas = canvasRef.current || document.createElement('canvas');
    canvasRef.current = canvas;
    
    if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
      }
    }

    const rect = img.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * img.naturalWidth;
    const y = ((e.clientY - rect.top) / rect.height) * img.naturalHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const pixel = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
      const r = pixel[0];
      const g = pixel[1];
      const b = pixel[2];
      const hex = rgbToHex({ r, g, b });
      setHoveredColor(hex);
      
      setMagnifierColor(hex);
      setMagnifierStyle({
        display: 'block',
        left: `${e.clientX - rect.left}px`,
        top: `${e.clientY - rect.top}px`,
        borderColor: hex,
        boxShadow: `0 0 10px rgba(0,0,0,0.5), inset 0 0 0 2px ${hex === '#ffffff' ? '#000000' : '#ffffff'}`
      });
    } catch (err) {
      console.error("Failed to extract color", err);
    }
  };

  const handleImageMouseLeave = () => {
    setMagnifierStyle({ display: 'none' });
    setHoveredColor(null);
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    const img = imageRef.current;
    if (!img || !activeThemeDetail) return;

    const canvas = canvasRef.current || document.createElement('canvas');
    canvasRef.current = canvas;
    
    const rect = img.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * img.naturalWidth;
    const y = ((e.clientY - rect.top) / rect.height) * img.naturalHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const pixel = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
      const r = pixel[0];
      const g = pixel[1];
      const b = pixel[2];
      
      const oklch = rgbToOklch(r, g, b);
      
      const updated = {
        ...activeThemeDetail,
        colour_tokens: {
          ...activeThemeDetail.colour_tokens,
          base_hue: Math.round(oklch.h),
          chroma: parseFloat(Math.min(0.25, Math.max(0, oklch.c)).toFixed(3))
        }
      };
      handleAutosave(updated);
      showNotification(`Extracted base color: #${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')} (Hue: ${Math.round(oklch.h)}°, Chroma: ${oklch.c.toFixed(3)})`, 'success');
    } catch (err) {
      console.error("Failed to extract click color", err);
    }
  };

  // Load themes on startup
  useEffect(() => {
    refreshThemes();
    loadExportHistory();
  }, []);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const renderMappedIcon = (actionKey: string, className = '', overrideSize?: string) => {
    if (!activeThemeDetail) return null;
    const iconName = activeThemeDetail.icon_settings.mappings[actionKey] || 'HelpCircle';
    const IconComponent = (Icons as any)[iconName] || Icons.HelpCircle;
    const size = overrideSize || activeThemeDetail.icon_settings.default_size || '20px';
    const strokeWidth = parseFloat(activeThemeDetail.icon_settings.stroke_width) || 2;
    return (
      <span style={{ width: size, height: size }} className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        <IconComponent strokeWidth={strokeWidth} size="100%" />
      </span>
    );
  };

  const refreshThemes = () => {
    Bindings.ListThemes()
      .then((res) => {
        setThemes(res || []);
      })
      .catch((err) => {
        showNotification(`Database error: ${err}`, 'error');
      });
  };

  const loadExportHistory = () => {
    Bindings.GetExportHistory()
      .then((res) => {
        setExportLogs(res || []);
      })
      .catch(() => {});
  };

  const handleSelectTheme = (themeId: number) => {
    Bindings.GetTheme(themeId)
      .then((detail) => {
        setActiveThemeDetail(detail);
        setPreviewMode(detail.theme.default_mode.toLowerCase() === 'light' ? 'light' : 'dark');
        setActiveScreen('builder');
        setActiveStep(0);
      })
      .catch((err) => {
        showNotification(`Failed to load theme: ${err}`, 'error');
      });
  };

  const blueprintGuides = [
    {
      title: 'Admin dashboard',
      description: 'Best for internal tools, data tables, reports, and operations panels.',
      presetIndex: 0,
      icon: Icons.LayoutDashboard,
    },
    {
      title: 'Technical console',
      description: 'Dense, sharp, high-signal screens for monitoring and system workflows.',
      presetIndex: 1,
      icon: Icons.Terminal,
    },
    {
      title: 'Business SaaS',
      description: 'Clean corporate styling for CRM, finance, client portals, and B2B apps.',
      presetIndex: 2,
      icon: Icons.Briefcase,
    },
    {
      title: 'Friendly client app',
      description: 'Softer spacing and motion for booking, onboarding, wellness, and consumer tools.',
      presetIndex: 3,
      icon: Icons.Sparkles,
    },
  ];

  const blueprintAudiences = [
    'Operators and managers',
    'Business owner',
    'Client-facing users',
    'Technical team',
  ];

  const blueprintScreenSets = [
    'Dashboard + register + reports',
    'Landing + onboarding + settings',
    'CRM detail + tasks + notes',
    'Booking + checkout + profile',
    'Import review + documents + audit',
    'Present mode + briefing + exports',
  ];

  const blueprintStacks = [
    'Offline Wails desktop',
    'React + Tailwind web app',
    'AI handoff only',
    'Template exploration',
  ];

  const handleCreateTheme = (presetIndex = selectedBlueprintIndex) => {
    const template = PresetThemes[presetIndex] || PresetThemes[0];
    const selectedBlueprint = blueprintGuides.find((blueprint) => blueprint.presetIndex === presetIndex) || blueprintGuides[0];
    const appIntent = `${template.app_type} - ${selectedBlueprintScreenSet}`;
    const newDetail: ThemeDetail = {
      theme: {
        id: 0,
        name: `${selectedBlueprint.title} - ${selectedBlueprintStack}`,
        app_type: appIntent,
        style_mood: template.style_mood,
        default_mode: template.default_mode,
        density: template.density,
        border_style: template.border_style,
        component_style: template.component_style,
        ui_mode: "easy",
        created_at: "",
        updated_at: "",
      },
      colour_tokens: template.colour_tokens,
      typography_tokens: template.typography_tokens,
      spacing_tokens: template.spacing_tokens,
      radius_tokens: template.radius_tokens,
      shadow_tokens: template.shadow_tokens,
      icon_settings: template.icon_settings,
      motion_tokens: template.motion_tokens,
      component_styles: {
        styles: {
          blueprint_title: selectedBlueprint.title,
          blueprint_audience: selectedBlueprintAudience,
          blueprint_screen_set: selectedBlueprintScreenSet,
          blueprint_target_stack: selectedBlueprintStack,
        }
      },
    };

    Bindings.SaveTheme(newDetail as any)
      .then((newId) => {
        refreshThemes();
        handleSelectTheme(Number(newId));
        showNotification(`Created ${selectedBlueprint.title} blueprint for ${selectedBlueprintStack}`, "success");
      })
      .catch((err) => {
        showNotification(`Failed to save: ${err}`, 'error');
      });
  };

  const getImportAnalysis = (detail: ThemeDetail) => {
    const template = PresetThemes[0];
    const colorKeys = Object.keys(detail.colour_tokens.overrides || {});
    const spacingKeys = (['page_padding', 'card_padding', 'form_gap', 'table_cell_padding', 'dashboard_grid_gap'] as const)
      .filter((key) => detail.spacing_tokens[key] !== template.spacing_tokens[key]);
    const radiusKeys = (['sm', 'md', 'lg', 'xl'] as const)
      .filter((key) => detail.radius_tokens[key] !== template.radius_tokens[key]);
    const guessed: string[] = [];
    const defaulted: string[] = [];

    if (detail.colour_tokens.base_hue !== template.colour_tokens.base_hue || detail.colour_tokens.chroma !== template.colour_tokens.chroma) {
      guessed.push('base hue/chroma from primary');
    }

    if (colorKeys.length === 0) defaulted.push('colors');
    if (spacingKeys.length === 0) defaulted.push('spacing');
    if (radiusKeys.length === 0) defaulted.push('radius');
    defaulted.push('typography', 'shadows', 'icons', 'motion');

    const detectedGroups = [
      colorKeys.length > 0 ? `${colorKeys.length} colors` : null,
      spacingKeys.length > 0 ? `${spacingKeys.length} spacing` : null,
      radiusKeys.length > 0 ? `${radiusKeys.length} radius` : null,
    ].filter(Boolean);
    const missing = [
      colorKeys.length === 0 ? 'color tokens' : null,
      spacingKeys.length === 0 ? 'spacing tokens' : null,
      radiusKeys.length === 0 ? 'radius tokens' : null,
      'typography tokens',
      'shadow tokens',
    ].filter(Boolean);
    const confidenceScore = (colorKeys.length > 0 ? 2 : 0) + (spacingKeys.length > 0 ? 1 : 0) + (radiusKeys.length > 0 ? 1 : 0);
    const confidence = confidenceScore >= 3 ? 'High' : confidenceScore >= 2 ? 'Medium' : 'Low';

    return {
      colorKeys,
      spacingKeys,
      radiusKeys,
      guessed,
      defaulted,
      detectedGroups,
      missing,
      confidence,
    };
  };

  const getImportSummary = (detail: ThemeDetail) => {
    const analysis = getImportAnalysis(detail);
    return `Import confidence ${analysis.confidence}: detected ${analysis.detectedGroups.join(', ') || 'no direct style tokens'}; missing ${analysis.missing.slice(0, 3).join(', ')}${analysis.missing.length > 3 ? '...' : ''}; guessed ${analysis.guessed.join(', ') || 'none'}; defaulted ${analysis.defaulted.slice(0, 4).join(', ')}${analysis.defaulted.length > 4 ? '...' : ''}.`;
  };

  const parseDesignTokens = (obj: any, defaultName: string): ThemeDetail => {
    const template = PresetThemes[0];
    const newDetail: ThemeDetail = {
      theme: {
        id: 0,
        name: defaultName,
        app_type: "Admin Dashboard",
        style_mood: "Modern",
        default_mode: "Dark",
        density: "Comfortable",
        border_style: "Subtle",
        component_style: "Rounded",
        created_at: "",
        updated_at: "",
      },
      colour_tokens: { ...template.colour_tokens, overrides: {} },
      typography_tokens: { ...template.typography_tokens },
      spacing_tokens: { ...template.spacing_tokens },
      radius_tokens: { ...template.radius_tokens },
      shadow_tokens: { ...template.shadow_tokens },
      icon_settings: { ...template.icon_settings },
      motion_tokens: { ...template.motion_tokens },
      component_styles: { styles: {} },
    };

    const overrides: Record<string, string> = {};
    let foundPrimary = '';

    const applyColorToken = (pathStr: string, value: string) => {
      if (pathStr.includes('primary') || pathStr.includes('brand')) {
        overrides['primary'] = value;
        foundPrimary = value;
      } else if (pathStr.includes('secondary') || pathStr.includes('accent')) {
        overrides['secondary'] = value;
      } else if (pathStr.includes('bg') || pathStr.includes('background') || pathStr.includes('surface')) {
        overrides['bg'] = value;
      } else if (pathStr.includes('text') || pathStr.includes('foreground')) {
        overrides['text'] = value;
      } else if (pathStr.includes('border')) {
        overrides['border'] = value;
      } else if (pathStr.includes('success')) {
        overrides['success'] = value;
      } else if (pathStr.includes('warning')) {
        overrides['warning'] = value;
      } else if (pathStr.includes('danger') || pathStr.includes('error')) {
        overrides['danger'] = value;
      } else if (pathStr.includes('info')) {
        overrides['info'] = value;
      }
    };

    const applyDimensionToken = (pathStr: string, rawValue: string | number) => {
      const pxVal = typeof rawValue === 'number' ? `${rawValue}px` : rawValue;
      if (pathStr.includes('radius') || pathStr.includes('rounded') || pathStr.includes('borderRadius')) {
        if (pathStr.includes('sm')) newDetail.radius_tokens.sm = pxVal;
        else if (pathStr.includes('md') || pathStr.includes('medium')) newDetail.radius_tokens.md = pxVal;
        else if (pathStr.includes('lg') || pathStr.includes('large')) newDetail.radius_tokens.lg = pxVal;
        else if (pathStr.includes('xl')) newDetail.radius_tokens.xl = pxVal;
      } else if (pathStr.includes('spacing') || pathStr.includes('gap') || pathStr.includes('padding') || pathStr.includes('space')) {
        if (pathStr.includes('page')) newDetail.spacing_tokens.page_padding = pxVal;
        else if (pathStr.includes('card')) newDetail.spacing_tokens.card_padding = pxVal;
        else if (pathStr.includes('cell') || pathStr.includes('table')) newDetail.spacing_tokens.table_cell_padding = pxVal;
        else if (pathStr.includes('grid') || pathStr.includes('dashboard')) newDetail.spacing_tokens.dashboard_grid_gap = pxVal;
        else if (pathStr.includes('form')) newDetail.spacing_tokens.form_gap = pxVal;
      }
    };

    const searchObj = (current: any, path: string[] = []) => {
      if (!current || typeof current !== 'object') return;

      for (const key in current) {
        const val = current[key];
        const newPath = [...path, key.toLowerCase()];
        const pathStr = newPath.join('.');

        if (typeof val === 'string' && (val.startsWith('#') || val.startsWith('rgb') || val.startsWith('hsl'))) {
          applyColorToken(pathStr, val);
        }
        else if ((typeof val === 'string' && val.endsWith('px')) || typeof val === 'number') {
          applyDimensionToken(pathStr, val);
        } 
        else if (val && typeof val === 'object' && (val['$value'] !== undefined || val.value !== undefined)) {
          const tokenValue = val['$value'] ?? val.value;
          const tokenType = String(val['$type'] ?? val.type ?? '').toLowerCase();
          if ((tokenType === 'color' || tokenType === 'colorToken' || typeof tokenValue === 'string') && typeof tokenValue === 'string' && (tokenValue.startsWith('#') || tokenValue.startsWith('rgb') || tokenValue.startsWith('hsl'))) {
            applyColorToken(pathStr, tokenValue);
          } else if (tokenType === 'dimension' || tokenType === 'spacing' || tokenType === 'borderRadius' || typeof tokenValue === 'number' || (typeof tokenValue === 'string' && tokenValue.endsWith('px'))) {
            applyDimensionToken(pathStr, tokenValue);
          }
        } else {
          searchObj(val, newPath);
        }
      }
    };

    searchObj(obj);

    if (foundPrimary) {
      newDetail.colour_tokens.overrides = overrides;
      let hex = foundPrimary.trim();
      if (hex.startsWith('#')) hex = hex.slice(1);
      if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
      if (hex.length === 6) {
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        const oklch = rgbToOklch(r, g, b);
        newDetail.colour_tokens.base_hue = Math.round(oklch.h);
        newDetail.colour_tokens.chroma = parseFloat(Math.min(0.25, Math.max(0, oklch.c)).toFixed(3));
      }
    }

    return newDetail;
  };

  const parseCssOrConfigTokens = (text: string, defaultName: string): ThemeDetail => {
    const cssVariableMatches = [...text.matchAll(/--([a-zA-Z0-9-_]+)\s*:\s*([^;}\n]+)/g)];
    const objectValueMatches = [...text.matchAll(/['"]?([a-zA-Z0-9-_]+)['"]?\s*:\s*['"]([^'"]+)['"]/g)];
    const tokenObject: Record<string, any> = {};

    cssVariableMatches.forEach((match) => {
      tokenObject[match[1]] = match[2].trim();
    });

    objectValueMatches.forEach((match) => {
      const value = match[2].trim();
      if (value.startsWith('#') || value.startsWith('rgb') || value.startsWith('hsl') || value.endsWith('px')) {
        tokenObject[match[1]] = value;
      }
    });

    return parseDesignTokens(tokenObject, defaultName);
  };

  const parseImportedThemeFile = (text: string, fileName: string): ThemeDetail => {
    const defaultName = fileName.replace(/\.[^/.]+$/, "");
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension === 'json') {
      return parseDesignTokens(JSON.parse(text), defaultName);
    }
    return parseCssOrConfigTokens(text, defaultName);
  };

  const saveImportedTheme = (importedTheme: ThemeDetail) => {
    Bindings.SaveTheme(importedTheme as any)
      .then((newId) => {
        refreshThemes();
        handleSelectTheme(Number(newId));
        setPendingImport(null);
        showNotification(getImportSummary(importedTheme), 'success');
      })
      .catch((err) => {
        showNotification(`Failed to save imported theme: ${err}`, 'error');
      });
  };

  const previewImportedTheme = (text: string, fileName: string) => {
    setPendingImport({ detail: parseImportedThemeFile(text, fileName), fileName });
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      try {
        previewImportedTheme(text, file.name);
      } catch (err) {
        showNotification(`Failed to parse import file: ${err}`, 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleDragOverJson = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingJson(true);
  };

  const handleDragLeaveJson = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingJson(false);
  };

  const handleDropJson = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingJson(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (/\.(json|css|ts|js|txt)$/i.test(file.name) || file.type === 'application/json' || file.type === 'text/css') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        try {
          previewImportedTheme(text, file.name);
        } catch (err) {
          showNotification(`Failed to parse import file: ${err}`, 'error');
        }
      };
      reader.readAsText(file);
    } else {
      showNotification("Please drop a JSON, CSS, Tailwind TS/JS, or text token file.", "error");
    }
  };

  const handleDuplicateTheme = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    Bindings.DuplicateTheme(id)
      .then(() => {
        refreshThemes();
        showNotification("Theme duplicated", "success");
      })
      .catch((err) => {
        showNotification(`Failed to duplicate: ${err}`, 'error');
      });
  };

  const handleDeleteTheme = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this theme?")) {
      Bindings.DeleteTheme(id)
        .then(() => {
          refreshThemes();
          if (activeThemeDetail?.theme.id === id) {
            setActiveThemeDetail(null);
            setActiveScreen('dashboard');
          }
          showNotification("Theme deleted", "info");
        })
        .catch((err) => {
          showNotification(`Deletion failed: ${err}`, 'error');
        });
    }
  };

  const handleAutosave = useCallback((updatedDetail: ThemeDetail) => {
    // Immediate state update for responsive UI
    setActiveThemeDetail(updatedDetail);
    
    // Debounced SQLite write to prevent rapid disk I/O during slider drags
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(() => {
      Bindings.SaveTheme(updatedDetail as any)
        .then(() => {
          Bindings.ListThemes().then(setThemes);
        })
        .catch((err) => {
          console.error("Autosave error", err);
        });
    }, 300);
  }, []);

  const handleToggleUIMode = (mode: 'easy' | 'advanced') => {
    if (!activeThemeDetail) return;
    const updated = {
      ...activeThemeDetail,
      theme: {
        ...activeThemeDetail.theme,
        ui_mode: mode
      }
    };
    handleAutosave(updated);
  };

  // Color modification
  const handleColorSliderChange = (key: 'base_hue' | 'chroma', val: number) => {
    if (!activeThemeDetail) return;
    const updated = {
      ...activeThemeDetail,
      colour_tokens: {
        ...activeThemeDetail.colour_tokens,
        [key]: val,
      },
    };
    handleAutosave(updated);
  };

  // Override single color value
  const handleColorOverride = (token: string, hex: string) => {
    if (!activeThemeDetail) return;
    const updated = {
      ...activeThemeDetail,
      colour_tokens: {
        ...activeThemeDetail.colour_tokens,
        overrides: {
          ...activeThemeDetail.colour_tokens.overrides,
          [token]: hex,
        },
      },
    };
    handleAutosave(updated);
  };

  const handleResetOverrides = () => {
    if (!activeThemeDetail) return;
    const updated = {
      ...activeThemeDetail,
      colour_tokens: {
        ...activeThemeDetail.colour_tokens,
        overrides: {},
      },
    };
    handleAutosave(updated);
    showNotification("Overrides cleared", "info");
  };

  // Preset Applicators
  const applySpacingPreset = (name: string) => {
    if (!activeThemeDetail || !SpacingPresets[name]) return;
    const updated = {
      ...activeThemeDetail,
      spacing_tokens: SpacingPresets[name],
    };
    handleAutosave(updated);
    showNotification(`Applied Spacing Preset: ${name}`, 'success');
  };

  const applyTypographyPreset = (name: string) => {
    if (!activeThemeDetail || !TypographyPresets[name]) return;
    const updated = {
      ...activeThemeDetail,
      typography_tokens: TypographyPresets[name],
    };
    handleAutosave(updated);
    showNotification(`Applied Typography Preset: ${name}`, 'success');
  };

  const applyRadiusPreset = (name: string) => {
    if (!activeThemeDetail || !RadiusPresets[name]) return;
    const updated = {
      ...activeThemeDetail,
      radius_tokens: RadiusPresets[name],
    };
    handleAutosave(updated);
    showNotification(`Applied Radius Preset: ${name}`, 'success');
  };

  const applyShadowPreset = (name: string) => {
    if (!activeThemeDetail || !ShadowPresets[name]) return;
    const updated = {
      ...activeThemeDetail,
      shadow_tokens: ShadowPresets[name],
    };
    handleAutosave(updated);
    showNotification(`Applied Shadows Preset: ${name}`, 'success');
  };

  const applyPlainEnglishStyle = (action: 'premium' | 'playful' | 'serious' | 'spacious' | 'compact' | 'softer' | 'sharper') => {
    if (!activeThemeDetail) return;

    const updated: ThemeDetail = {
      ...activeThemeDetail,
      theme: { ...activeThemeDetail.theme },
      colour_tokens: { ...activeThemeDetail.colour_tokens },
      typography_tokens: { ...activeThemeDetail.typography_tokens },
      spacing_tokens: { ...activeThemeDetail.spacing_tokens },
      radius_tokens: { ...activeThemeDetail.radius_tokens },
      shadow_tokens: { ...activeThemeDetail.shadow_tokens },
      motion_tokens: { ...activeThemeDetail.motion_tokens },
    };

    switch (action) {
      case 'premium':
        updated.theme.style_mood = 'Modern';
        updated.theme.component_style = 'Rounded';
        updated.theme.border_style = 'Subtle';
        updated.colour_tokens.chroma = Math.min(0.09, Math.max(0.045, updated.colour_tokens.chroma));
        updated.colour_tokens.shadow_intensity = 0.32;
        updated.colour_tokens.highlight_opacity = 0.1;
        updated.radius_tokens = RadiusPresets["Modern Rounded (Standard)"];
        updated.shadow_tokens = ShadowPresets["High Contrast Depth (Sajid Style)"];
        updated.typography_tokens = TypographyPresets["Modern Dashboard"];
        break;
      case 'playful':
        updated.theme.style_mood = 'Soft';
        updated.theme.component_style = 'Pill';
        updated.theme.density = 'Comfortable';
        updated.colour_tokens.chroma = Math.min(0.14, Math.max(0.085, updated.colour_tokens.chroma + 0.025));
        updated.colour_tokens.neutral_vivid = Math.min(1, updated.colour_tokens.neutral_vivid + 0.12);
        updated.spacing_tokens = SpacingPresets["Comfortable (Standard UI)"];
        updated.radius_tokens = RadiusPresets["Pill Soft (Friendly)"];
        updated.typography_tokens = TypographyPresets["Soft & Friendly"];
        break;
      case 'serious':
        updated.theme.style_mood = 'Corporate';
        updated.theme.component_style = 'Rounded';
        updated.theme.border_style = 'Subtle';
        updated.colour_tokens.chroma = Math.max(0.025, Math.min(0.06, updated.colour_tokens.chroma));
        updated.colour_tokens.neutral_vivid = Math.max(0, updated.colour_tokens.neutral_vivid - 0.08);
        updated.radius_tokens = RadiusPresets["Subtle Rounded (Corporate)"];
        updated.shadow_tokens = ShadowPresets["Subtle (Sleek Professional)"];
        updated.typography_tokens = TypographyPresets["Professional Sans"];
        break;
      case 'spacious':
        updated.theme.density = 'Spacious';
        updated.spacing_tokens = SpacingPresets["Spacious (Clean & Relaxed)"];
        break;
      case 'compact':
        updated.theme.density = 'Compact';
        updated.spacing_tokens = SpacingPresets["Compact (Dense & Professional)"];
        break;
      case 'softer':
        updated.theme.component_style = 'Pill';
        updated.radius_tokens = RadiusPresets["Pill Soft (Friendly)"];
        updated.shadow_tokens = ShadowPresets["Subtle (Sleek Professional)"];
        break;
      case 'sharper':
        updated.theme.component_style = 'Sharp';
        updated.theme.style_mood = 'Tactical';
        updated.radius_tokens = RadiusPresets["Sharp (Tactical/Retro)"];
        updated.spacing_tokens = SpacingPresets["Compact (Dense & Professional)"];
        updated.typography_tokens = TypographyPresets["Military/Technical"];
        break;
    }

    handleAutosave(updated);
    showNotification(`Applied: make it ${action}`, 'success');
  };

  const plainEnglishStyleActions = [
    { key: 'premium', label: 'More premium', detail: 'Depth, polish, modern type', icon: Icons.Gem },
    { key: 'playful', label: 'More playful', detail: 'Brighter, softer, friendlier', icon: Icons.Sparkles },
    { key: 'serious', label: 'More serious', detail: 'Calmer, corporate, restrained', icon: Icons.Briefcase },
    { key: 'spacious', label: 'More spacious', detail: 'More breathing room', icon: Icons.Maximize2 },
    { key: 'compact', label: 'More compact', detail: 'Denser tables and panels', icon: Icons.Minimize2 },
    { key: 'softer', label: 'Softer corners', detail: 'Rounder cards and controls', icon: Icons.Circle },
    { key: 'sharper', label: 'Sharper interface', detail: 'Tighter, technical, square', icon: Icons.BoxSelect },
  ] as const;

  const applySmartFix = (fix: 'contrast' | 'vividness' | 'breathing' | 'buttons' | 'corners') => {
    if (!activeThemeDetail) return;

    const updated: ThemeDetail = {
      ...activeThemeDetail,
      theme: { ...activeThemeDetail.theme },
      colour_tokens: {
        ...activeThemeDetail.colour_tokens,
        overrides: { ...activeThemeDetail.colour_tokens.overrides },
      },
      spacing_tokens: { ...activeThemeDetail.spacing_tokens },
      radius_tokens: { ...activeThemeDetail.radius_tokens },
      shadow_tokens: { ...activeThemeDetail.shadow_tokens },
    };

    switch (fix) {
      case 'contrast':
        updated.colour_tokens.overrides = {};
        updated.colour_tokens.chroma = Math.min(0.08, Math.max(0.045, updated.colour_tokens.chroma));
        updated.colour_tokens.neutral_vivid = Math.min(0.18, updated.colour_tokens.neutral_vivid);
        updated.colour_tokens.highlight_opacity = Math.max(0.08, updated.colour_tokens.highlight_opacity);
        break;
      case 'vividness':
        updated.colour_tokens.chroma = Math.max(0.025, updated.colour_tokens.chroma - 0.03);
        updated.colour_tokens.neutral_vivid = Math.max(0, updated.colour_tokens.neutral_vivid - 0.12);
        updated.colour_tokens.highlight_opacity = Math.min(0.08, updated.colour_tokens.highlight_opacity);
        break;
      case 'breathing':
        updated.theme.density = 'Spacious';
        updated.spacing_tokens = SpacingPresets["Spacious (Clean & Relaxed)"];
        break;
      case 'buttons':
        updated.colour_tokens.chroma = Math.max(0.08, updated.colour_tokens.chroma);
        updated.colour_tokens.shadow_intensity = Math.max(0.28, updated.colour_tokens.shadow_intensity);
        updated.shadow_tokens = ShadowPresets["High Contrast Depth (Sajid Style)"];
        break;
      case 'corners':
        updated.theme.component_style = 'Rounded';
        updated.radius_tokens = RadiusPresets["Modern Rounded (Standard)"];
        break;
    }

    handleAutosave(updated);
    showNotification(`Smart fix applied: ${fix}`, 'success');
  };

  const smartFixActions = [
    { key: 'contrast', label: 'Improve contrast', detail: 'Reset color overrides and calm neutrals', icon: Icons.Contrast },
    { key: 'vividness', label: 'Reduce vividness', detail: 'Tone down color intensity', icon: Icons.Droplets },
    { key: 'breathing', label: 'Increase breathing room', detail: 'Apply spacious layout spacing', icon: Icons.Expand },
    { key: 'buttons', label: 'Make buttons clearer', detail: 'Boost action contrast and depth', icon: Icons.MousePointerClick },
    { key: 'corners', label: 'Make corners consistent', detail: 'Restore a clean radius scale', icon: Icons.Scan },
  ] as const;

  // Apply full theme preset
  const applyFullThemePreset = (preset: typeof PresetThemes[0]) => {
    if (!activeThemeDetail) return;
    const updated = {
      ...activeThemeDetail,
      theme: {
        ...activeThemeDetail.theme,
        app_type: preset.app_type,
        style_mood: preset.style_mood,
        default_mode: preset.default_mode,
        density: preset.density,
        border_style: preset.border_style,
        component_style: preset.component_style,
      },
      colour_tokens: preset.colour_tokens,
      typography_tokens: preset.typography_tokens,
      spacing_tokens: preset.spacing_tokens,
      radius_tokens: preset.radius_tokens,
      shadow_tokens: preset.shadow_tokens,
      icon_settings: preset.icon_settings,
      motion_tokens: preset.motion_tokens,
    };
    handleAutosave(updated);
    setPreviewMode(preset.default_mode.toLowerCase() === 'light' ? 'light' : 'dark');
    showNotification("Full theme preset applied!", "success");
  };

  // WCAG contrast validation
  const getContrastReport = () => {
    if (!activeThemeDetail) return { ratioText: 1, ratioMuted: 1, ratioPrimary: 1 };
    const isLight = previewMode === 'light';
    const c = generateSajidPalette(
      activeThemeDetail.colour_tokens.base_hue,
      activeThemeDetail.colour_tokens.chroma,
      isLight,
      activeThemeDetail.colour_tokens.overrides,
      activeThemeDetail.colour_tokens.harmony
    );

    const rgbText = c['text']?.rgb || { r: 255, g: 255, b: 255 };
    const rgbBg = c['bg']?.rgb || { r: 0, g: 0, b: 0 };
    const rgbMuted = c['text-muted']?.rgb || { r: 150, g: 150, b: 150 };
    const rgbPrimary = c['primary']?.rgb || { r: 120, g: 100, b: 220 };
    const rgbWhite = { r: 255, g: 255, b: 255 };

    return {
      ratioText: getContrastRatio(rgbText, rgbBg),
      ratioMuted: getContrastRatio(rgbMuted, rgbBg),
      ratioPrimary: getContrastRatio(rgbPrimary, rgbBg),
    };
  };

  const contrast = getContrastReport();

  const getDesignHealthReport = () => {
    if (!activeThemeDetail) {
      return {
        score: 0,
        status: 'Needs setup',
        summary: 'Create or select a theme to check design health.',
        items: [],
      };
    }

    const baseFont = activeThemeDetail.typography_tokens.base_font_size || 16;
    const tablePadding = parseInt(activeThemeDetail.spacing_tokens.table_cell_padding) || 0;
    const cardPadding = parseInt(activeThemeDetail.spacing_tokens.card_padding) || 0;
    const pagePadding = parseInt(activeThemeDetail.spacing_tokens.page_padding) || 0;
    const formGap = parseInt(activeThemeDetail.spacing_tokens.form_gap) || 0;
    const modalWidth = parseInt(activeThemeDetail.spacing_tokens.modal_width) || 0;
    const radiusSm = parseInt(activeThemeDetail.radius_tokens.sm) || 0;
    const radiusMd = parseInt(activeThemeDetail.radius_tokens.md) || 0;
    const radiusLg = parseInt(activeThemeDetail.radius_tokens.lg) || 0;
    const estimatedControlHeight = baseFont + tablePadding * 2;
    const hasBlueprintContext = Boolean(activeThemeDetail.component_styles?.styles?.blueprint_target_stack);

    const items = [
      {
        label: 'Contrast',
        pass: contrast.ratioText >= 4.5 && contrast.ratioMuted >= 4.5,
        note: contrast.ratioText >= 4.5 && contrast.ratioMuted >= 4.5
          ? `Text contrast passes AA (${contrast.ratioText.toFixed(1)}:1).`
          : `Improve contrast. Text is ${contrast.ratioText.toFixed(1)}:1 and muted text is ${contrast.ratioMuted.toFixed(1)}:1.`,
      },
      {
        label: 'Density',
        pass: pagePadding >= 12 && cardPadding >= 12 && tablePadding >= 6,
        note: pagePadding >= 12 && cardPadding >= 12 && tablePadding >= 6
          ? `${activeThemeDetail.theme.density} density has enough breathing room for app work.`
          : 'Density is too tight. Increase page, card, or table spacing.',
      },
      {
        label: 'Tap Targets',
        pass: estimatedControlHeight >= 36,
        note: estimatedControlHeight >= 36
          ? `Controls estimate around ${estimatedControlHeight}px high, which is usable.`
          : `Controls estimate around ${estimatedControlHeight}px high. Aim for at least 36px, 44px for touch-heavy apps.`,
      },
      {
        label: 'Table Readability',
        pass: baseFont >= 15 && tablePadding >= 6,
        note: baseFont >= 15 && tablePadding >= 6
          ? 'Table text and row padding are readable.'
          : 'Use at least 15px body text and enough table cell padding.',
      },
      {
        label: 'Form Clarity',
        pass: formGap >= 10 && baseFont >= 15,
        note: formGap >= 10 && baseFont >= 15
          ? 'Form fields have enough separation and readable labels.'
          : 'Increase form spacing or base font size so fields do not blur together.',
      },
      {
        label: 'Modal Hierarchy',
        pass: modalWidth >= 420 && modalWidth <= 720 && cardPadding >= 16,
        note: modalWidth >= 420 && modalWidth <= 720 && cardPadding >= 16
          ? 'Modal width and padding support clear decisions.'
          : 'Modal sizing may feel cramped or unfocused. Aim for 420-720px with clear padding.',
      },
      {
        label: 'Consistency',
        pass: radiusSm <= radiusMd && radiusMd <= radiusLg,
        note: radiusSm <= radiusMd && radiusMd <= radiusLg
          ? 'Corner radius scale is consistent.'
          : 'Corner radius values should progress from small to large.',
      },
      {
        label: 'AI Handoff',
        pass: hasBlueprintContext && activeThemeDetail.theme.app_type.length > 0,
        note: hasBlueprintContext
          ? 'Blueprint context is ready for AI briefs.'
          : 'Create from the guided blueprint wizard for stronger AI handoff context.',
      },
    ];

    const passed = items.filter((item) => item.pass).length;
    const score = Math.round((passed / items.length) * 100);
    const status = score >= 85 ? 'Strong' : score >= 65 ? 'Good start' : 'Needs attention';
    const summary = score >= 85
      ? 'This theme is in good shape for AI handoff.'
      : score >= 65
        ? 'This theme is usable, with a few areas to improve before export.'
        : 'Fix the highlighted areas before using this as an app template.';

    return { score, status, summary, items };
  };

  const designHealth = getDesignHealthReport();

  return (
    <div className="flex h-screen bg-[#0b0e17] text-gray-100 overflow-hidden font-sans">
      
      {/* Sidebar navigation */}
      <aside className="w-64 bg-[#0f121e] border-r border-[#202538] flex flex-col justify-between">
        <div className="flex flex-col">
          {/* Header Title */}
          <div className="p-5 border-b border-[#202538] flex items-center gap-3">
            <span className="p-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg">
              <Icons.Paintbrush className="w-5 h-5" />
            </span>
            <div>
              <h1 className="font-bold text-sm tracking-wide text-white uppercase select-none">App Style Studio</h1>
              <span className="text-[10px] text-gray-400 font-mono">v1.1.0 (Portable)</span>
            </div>
          </div>

          {/* Links list */}
          <nav className="p-4 space-y-1 select-none">
            <button
              onClick={() => setActiveScreen('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                activeScreen === 'dashboard' ? 'bg-[#1a1f35] text-[var(--primary)]' : 'text-gray-400 hover:text-gray-200 hover:bg-[#131625]'
              }`}
            >
              <Icons.LayoutDashboard size={16} />
              Dashboard
            </button>
            <button
              disabled={!activeThemeDetail}
              onClick={() => setActiveScreen('builder')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                !activeThemeDetail ? 'opacity-40 cursor-not-allowed' : ''
              } ${
                activeScreen === 'builder' ? 'bg-[#1a1f35] text-[var(--primary)]' : 'text-gray-400 hover:text-gray-200 hover:bg-[#131625]'
              }`}
            >
              <Icons.Palette size={16} />
              Theme Builder
            </button>
            <button
              disabled={!activeThemeDetail}
              onClick={() => setActiveScreen('export')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                !activeThemeDetail ? 'opacity-40 cursor-not-allowed' : ''
              } ${
                activeScreen === 'export' ? 'bg-[#1a1f35] text-[var(--primary)]' : 'text-gray-400 hover:text-gray-200 hover:bg-[#131625]'
              }`}
            >
              <Icons.Download size={16} />
              Export Centre
            </button>
            <button
              onClick={() => setActiveScreen('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                activeScreen === 'settings' ? 'bg-[#1a1f35] text-[var(--primary)]' : 'text-gray-400 hover:text-gray-200 hover:bg-[#131625]'
              }`}
            >
              <Icons.Sliders size={16} />
              Settings & Logs
            </button>
          </nav>
        </div>

        {/* Selected Theme indicator inside sidebar */}
        {activeThemeDetail && (
          <div className="p-4 m-4 bg-[#141829] border border-[#202538] rounded-xl flex flex-col gap-2">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Active Workspace</span>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white max-w-[130px] truncate">{activeThemeDetail.theme.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--primary-muted)] text-white font-semibold">
                {previewMode.toUpperCase()}
              </span>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Notification Toast */}
        {notification && (
          <div className="fixed bottom-6 right-6 z-[100] anim-slide-in-right p-4 rounded-xl shadow-2xl flex items-center gap-3 bg-[#1e243a] border border-[#3b4566] text-white">
            {notification.type === 'success' && <Icons.CheckCircle className="text-green-400 w-5 h-5 shrink-0" />}
            {notification.type === 'error' && <Icons.AlertOctagon className="text-red-400 w-5 h-5 shrink-0" />}
            {notification.type === 'info' && <Icons.Info className="text-blue-400 w-5 h-5 shrink-0" />}
            <span className="text-xs font-bold font-sans">{notification.message}</span>
          </div>
        )}

        {pendingImport && (() => {
          const analysis = getImportAnalysis(pendingImport.detail);
          return (
            <div className="fixed inset-0 z-[95] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
              <div className="w-full max-w-3xl bg-[#111422] border border-[#2a3150] rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-5 border-b border-[#202538] flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--primary)] mb-1">
                      <Icons.FileSearch size={14} />
                      Import preview
                    </div>
                    <h2 className="text-lg font-bold text-white">Review token mappings before save</h2>
                    <p className="text-xs text-gray-400 mt-1">
                      Source: <span className="font-mono text-gray-300">{pendingImport.fileName}</span>
                    </p>
                  </div>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                    analysis.confidence === 'High'
                      ? 'bg-green-500/15 text-green-300'
                      : analysis.confidence === 'Medium'
                        ? 'bg-amber-500/15 text-amber-300'
                        : 'bg-red-500/15 text-red-300'
                  }`}>
                    {analysis.confidence} confidence
                  </span>
                </div>

                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#0c0f1b] border border-[#202538] rounded-xl p-4">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Detected</h3>
                    <div className="space-y-2 text-xs text-gray-300">
                      <p>Colors: <span className="text-[var(--primary)] font-bold">{analysis.colorKeys.length ? analysis.colorKeys.join(', ') : 'none'}</span></p>
                      <p>Spacing: <span className="text-[var(--primary)] font-bold">{analysis.spacingKeys.length ? analysis.spacingKeys.join(', ') : 'none'}</span></p>
                      <p>Radius: <span className="text-[var(--primary)] font-bold">{analysis.radiusKeys.length ? analysis.radiusKeys.join(', ') : 'none'}</span></p>
                    </div>
                  </div>

                  <div className="bg-[#0c0f1b] border border-[#202538] rounded-xl p-4">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Missing / Defaulted</h3>
                    <div className="space-y-2 text-xs text-gray-300">
                      <p>Missing: <span className="text-amber-300 font-bold">{analysis.missing.join(', ')}</span></p>
                      <p>Defaulted: <span className="text-gray-400 font-bold">{analysis.defaulted.join(', ')}</span></p>
                      <p>Guessed: <span className="text-blue-300 font-bold">{analysis.guessed.join(', ') || 'none'}</span></p>
                    </div>
                  </div>

                  <div className="md:col-span-2 bg-[#0c0f1b] border border-[#202538] rounded-xl p-4">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Preview Theme</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div>
                        <p className="text-gray-500 uppercase text-[10px] font-bold">Name</p>
                        <p className="text-white font-bold truncate">{pendingImport.detail.theme.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 uppercase text-[10px] font-bold">Primary</p>
                        <p className="text-white font-mono">{pendingImport.detail.colour_tokens.overrides.primary || 'generated'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 uppercase text-[10px] font-bold">Card padding</p>
                        <p className="text-white font-mono">{pendingImport.detail.spacing_tokens.card_padding}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 uppercase text-[10px] font-bold">Radius md</p>
                        <p className="text-white font-mono">{pendingImport.detail.radius_tokens.md}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 border-t border-[#202538] flex flex-col sm:flex-row sm:justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setPendingImport(null)}
                    className="px-4 py-2 text-xs font-bold rounded-lg border border-[#2d3558] text-gray-300 hover:text-white hover:bg-[#1a1f35] transition-all"
                  >
                    Cancel import
                  </button>
                  <button
                    type="button"
                    onClick={() => saveImportedTheme(pendingImport.detail)}
                    className="px-4 py-2 text-xs font-bold rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white shadow-[var(--shadow-button)] transition-all"
                  >
                    Import theme
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* SCREEN 1: DASHBOARD (THEME MANAGER) */}
        {activeScreen === 'dashboard' && (
          <div 
            className="flex-1 p-8 overflow-y-auto space-y-6 relative"
            onDragOver={handleDragOverJson}
            onDragLeave={handleDragLeaveJson}
            onDrop={handleDropJson}
          >
            {isDraggingJson && (
              <div className="absolute inset-0 bg-[#0c0f1b]/95 border-4 border-dashed border-indigo-600 m-4 rounded-xl flex flex-col items-center justify-center gap-4 z-[90] pointer-events-none transition-all duration-200">
                <Icons.UploadCloud size={48} className="text-indigo-500 animate-bounce" />
                <h3 className="text-lg font-bold text-white">Drop token files here</h3>
                <p className="text-xs text-gray-400">Supports Figma/W3C JSON, Tokens Studio, Style Dictionary-ish JSON, CSS variables, and Tailwind fragments.</p>
              </div>
            )}
            <div className="flex justify-between items-center pb-4 border-b border-[#202538]">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight">Theme Workspace</h1>
                <p className="text-xs text-gray-400">Select, copy, or create reusable design theme systems for your apps.</p>
              </div>
              <div className="flex gap-2">
                <label className="px-4 py-2 text-xs font-semibold bg-[#1a1e32] border border-[#242b47] hover:bg-[#202640] hover:text-white text-gray-300 rounded-lg shadow-[var(--shadow-button)] flex items-center gap-1.5 transition-all cursor-pointer">
                  <Icons.Upload size={14} />
                  Import Tokens
                  <input
                    type="file"
                    accept=".json,.css,.ts,.js,.txt,application/json,text/css"
                    onChange={handleImportJsonFile}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={() => handleCreateTheme()}
                  className="px-4 py-2 text-xs font-semibold bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] rounded-lg shadow-[var(--shadow-button)] flex items-center gap-1.5 transition-all"
                >
                  <Icons.Plus size={16} />
                  Create Blueprint
                </button>
              </div>
            </div>

            {/* Guided blueprint picker */}
            <div className="bg-[#0f121e] border border-[#202538] rounded-xl p-5 space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--primary)] mb-1">
                    <Icons.WandSparkles size={14} />
                    Guided Start
                  </div>
                  <h2 className="text-lg font-bold text-white">What kind of app are you styling?</h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Pick a proven starting point. You can still fine-tune every color, corner, font, and layout later.
                  </p>
                </div>
                <button
                  onClick={() => handleCreateTheme()}
                  className="px-4 py-2 text-xs font-semibold bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] rounded-lg shadow-[var(--shadow-button)] flex items-center gap-1.5 transition-all shrink-0"
                >
                  <Icons.Sparkles size={14} />
                  Start Selected Blueprint
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Who is it for?</span>
                  <select
                    value={selectedBlueprintAudience}
                    onChange={(e) => setSelectedBlueprintAudience(e.target.value)}
                    className="w-full bg-[#121625] border border-[#202538] rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[var(--primary)]"
                  >
                    {blueprintAudiences.map((audience) => (
                      <option key={audience}>{audience}</option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">First screen pack</span>
                  <select
                    value={selectedBlueprintScreenSet}
                    onChange={(e) => setSelectedBlueprintScreenSet(e.target.value)}
                    className="w-full bg-[#121625] border border-[#202538] rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[var(--primary)]"
                  >
                    {blueprintScreenSets.map((screenSet) => (
                      <option key={screenSet}>{screenSet}</option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Build target</span>
                  <select
                    value={selectedBlueprintStack}
                    onChange={(e) => setSelectedBlueprintStack(e.target.value)}
                    className="w-full bg-[#121625] border border-[#202538] rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[var(--primary)]"
                  >
                    {blueprintStacks.map((stack) => (
                      <option key={stack}>{stack}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                {blueprintGuides.map((blueprint) => {
                  const Icon = blueprint.icon;
                  const preset = PresetThemes[blueprint.presetIndex] || PresetThemes[0];
                  const isSelected = selectedBlueprintIndex === blueprint.presetIndex;

                  return (
                    <button
                      key={blueprint.title}
                      type="button"
                      onClick={() => setSelectedBlueprintIndex(blueprint.presetIndex)}
                      className={`text-left p-4 rounded-lg border transition-all group ${
                        isSelected
                          ? 'bg-[#1a1f35] border-[var(--primary)] shadow-[var(--shadow-card)]'
                          : 'bg-[#121625] border-[#202538] hover:bg-[#171c2f] hover:border-[#323a5c]'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-3 mb-3">
                        <span className={`w-9 h-9 rounded-lg flex items-center justify-center border ${
                          isSelected
                            ? 'bg-[var(--primary-muted)] border-[var(--primary)] text-[var(--primary)]'
                            : 'bg-[#0c0f1b] border-[#202538] text-gray-400 group-hover:text-white'
                        }`}>
                          <Icon size={18} />
                        </span>
                        {isSelected && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-[var(--primary)] text-white font-bold uppercase">
                            Selected
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-sm text-white">{blueprint.title}</h3>
                      <p className="text-[11px] text-gray-400 leading-relaxed mt-1 min-h-[42px]">{blueprint.description}</p>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        <span className="text-[9px] px-2 py-0.5 rounded bg-[#1c223c] text-gray-300 font-semibold uppercase">{preset.style_mood}</span>
                        <span className="text-[9px] px-2 py-0.5 rounded bg-[#1c223c] text-gray-300 font-semibold uppercase">{preset.density}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-lg border border-[#202538] bg-[#121625] px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">AI-ready brief preview</div>
                  <p className="text-xs text-gray-300 mt-1">
                    {blueprintGuides.find((blueprint) => blueprint.presetIndex === selectedBlueprintIndex)?.title || 'Selected blueprint'} for {selectedBlueprintAudience.toLowerCase()} using {selectedBlueprintScreenSet.toLowerCase()}.
                  </p>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#1c223c] text-gray-300 font-semibold uppercase shrink-0">
                  {selectedBlueprintStack}
                </span>
              </div>
            </div>

            {/* Themes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {themes.length === 0 ? (
                <div className="col-span-full py-16 text-center bg-[#0f121e] border border-[#202538] rounded-xl flex flex-col items-center justify-center gap-2">
                  <Icons.FolderOpen size={40} className="text-gray-600" />
                  <p className="text-sm font-semibold">No themes created yet</p>
                  <p className="text-xs text-gray-500">Click the 'Create Theme' button to get started.</p>
                </div>
              ) : (
                themes.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleSelectTheme(t.id)}
                    className="p-5 bg-[#0f121e] border border-[#202538] hover:border-[var(--primary)] hover:shadow-2xl rounded-xl cursor-pointer transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-base text-white group-hover:text-[var(--primary)] transition-colors">{t.name}</h3>
                          <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">{t.app_type}</span>
                        </div>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                          t.default_mode.toLowerCase() === 'dark' ? 'bg-indigo-950 text-indigo-400' : 'bg-amber-950/60 text-amber-400'
                        }`}>
                          {t.default_mode}
                        </span>
                      </div>
                      
                      {/* Style mood tags */}
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        <span className="text-[9px] px-2 py-0.5 rounded bg-[#1c223c] text-gray-300 font-semibold uppercase">{t.style_mood}</span>
                        <span className="text-[9px] px-2 py-0.5 rounded bg-[#1c223c] text-gray-300 font-semibold uppercase">{t.density}</span>
                        <span className="text-[9px] px-2 py-0.5 rounded bg-[#1c223c] text-gray-300 font-semibold uppercase">{t.component_style}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-[#202538]">
                      <span className="text-[10px] text-gray-500">Edited {new Date(t.updated_at).toLocaleDateString()}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => handleDuplicateTheme(t.id, e)}
                          title="Duplicate Theme"
                          className="p-1.5 bg-[#171c30] border border-[#232c49] rounded hover:bg-[#202844] text-gray-300 transition-all"
                        >
                          <Icons.Copy size={12} />
                        </button>
                        <button
                          onClick={(e) => handleDeleteTheme(t.id, e)}
                          title="Delete Theme"
                          className="p-1.5 bg-[#171c30] border border-[#232c49] rounded hover:bg-red-950/80 text-red-400 hover:text-red-200 hover:border-red-900 transition-all"
                        >
                          <Icons.Trash size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* SCREEN 2: THEME BUILDER (STEPS & CONTROLS) */}
        {activeScreen === 'builder' && activeThemeDetail && (
          <div className="flex-1 flex overflow-hidden">
            {/* Scoped CSS Injector */}
            <PreviewEngine detail={activeThemeDetail} mode={previewMode} />

            {/* Left Hand Controls Panel */}
            <div className="w-[480px] bg-[#0c0f1b] border-r border-[#202538] flex flex-row overflow-hidden">
              
              {/* Vertical Sidebar Step Navigation (Activity Bar) */}
              <div className="w-16 bg-[#090b14] border-r border-[#202538] flex flex-col items-center py-4 gap-3 shrink-0 select-none">
                {[
                  { index: 0, name: 'Identity', icon: Icons.Tag },
                  { index: 1, name: 'Colours', icon: Icons.Palette },
                  { index: 2, name: 'Fonts', icon: Icons.Type },
                  { index: 3, name: 'Spacing', icon: Icons.Grid },
                  { index: 4, name: 'Elevation', icon: Icons.Layers },
                  { index: 5, name: 'Icons', icon: Icons.Smile },
                  { index: 6, name: 'Motion', icon: Icons.Activity },
                  { index: 7, name: 'Presets', icon: Icons.BookOpen },
                ].map((step) => {
                  const Icon = step.icon;
                  const isActive = activeStep === step.index;
                  return (
                    <button
                      key={step.index}
                      onClick={() => setActiveStep(step.index)}
                      title={step.name}
                      className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer relative ${
                        isActive
                          ? 'bg-[#181d30] text-[var(--primary)]'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-[#121625]'
                      }`}
                    >
                      <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                      <span className="text-[8px] font-medium tracking-tight truncate max-w-full px-1">{step.name}</span>
                      {isActive && (
                        <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-[var(--primary)] rounded-r" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Steps content and form panel */}
              <div className="flex-1 flex flex-col overflow-hidden bg-[#0c0f1b]">
                {/* Segmented Easy/Advanced Toggle Control */}
                <div className="px-6 pt-6 pb-2 shrink-0 border-b border-[#202538] bg-[#0c0f1b]">
                  <div className="flex bg-[#070911] p-1 rounded-xl border border-[#202538]">
                    <button
                      onClick={() => handleToggleUIMode('easy')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        (activeThemeDetail.theme.ui_mode || 'easy') === 'easy'
                          ? 'bg-[#181d30] text-[var(--primary)] shadow-md border border-[#2c3454]'
                          : 'text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <Icons.Star size={12} className={(activeThemeDetail.theme.ui_mode || 'easy') === 'easy' ? 'text-amber-400 fill-amber-400 animate-pulse' : 'text-gray-400'} />
                      Easy Mode
                    </button>
                    <button
                      onClick={() => handleToggleUIMode('advanced')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        activeThemeDetail.theme.ui_mode === 'advanced'
                          ? 'bg-[#181d30] text-[var(--primary)] shadow-md border border-[#2c3454]'
                          : 'text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <Icons.Sliders size={12} />
                      Advanced
                    </button>
                  </div>
                </div>

                <div className="p-6 flex-1 overflow-y-auto space-y-6">
                
                {/* STEP 0: IDENTITY */}
                {activeStep === 0 && (
                  <div className="space-y-4 anim-fade-in">
                    <div>
                      <h3 className="font-bold text-sm text-white uppercase tracking-wider mb-2">App Identity Settings</h3>
                      <p className="text-xs text-gray-400">Describe the basic details and layout mood of your application.</p>
                    </div>

                    {(activeThemeDetail.theme.ui_mode || 'easy') === 'easy' && (
                      <div className="rounded-xl border border-[#202538] bg-[#101422] p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--primary)]">
                              <Icons.WandSparkles size={13} />
                              Plain-English Style Controls
                            </div>
                            <p className="text-[11px] text-gray-400 mt-1">
                              Quick changes for non-coders. These update spacing, corners, shadows, fonts, and color intensity together.
                            </p>
                          </div>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#1c223c] text-gray-300 font-bold uppercase shrink-0">
                            Easy
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {plainEnglishStyleActions.map((action) => {
                            const Icon = action.icon;
                            return (
                              <button
                                key={action.key}
                                type="button"
                                onClick={() => applyPlainEnglishStyle(action.key)}
                                className="text-left rounded-lg border border-[#202538] bg-[#121625] hover:bg-[#171c2f] hover:border-[var(--primary)] transition-all px-3 py-2.5 group"
                              >
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-100">
                                  <Icon size={14} className="text-gray-400 group-hover:text-[var(--primary)]" />
                                  {action.label}
                                </div>
                                <p className="text-[10px] text-gray-500 mt-1 pl-6">{action.detail}</p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {(activeThemeDetail.theme.ui_mode || 'easy') === 'easy' && (
                      <div className="rounded-xl border border-[#202538] bg-[#101422] p-4 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--primary)]">
                              <Icons.Activity size={13} />
                              Design Health
                            </div>
                            <h4 className="text-sm font-bold text-white mt-1">{designHealth.status}</h4>
                            <p className="text-[11px] text-gray-400 mt-1">{designHealth.summary}</p>
                          </div>
                          <div className={`w-14 h-14 rounded-xl border flex flex-col items-center justify-center shrink-0 ${
                            designHealth.score >= 85
                              ? 'bg-green-950/40 border-green-800 text-green-300'
                              : designHealth.score >= 65
                                ? 'bg-amber-950/40 border-amber-800 text-amber-300'
                                : 'bg-red-950/40 border-red-800 text-red-300'
                          }`}>
                            <span className="text-lg font-black leading-none">{designHealth.score}</span>
                            <span className="text-[8px] font-bold uppercase mt-0.5">score</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {designHealth.items.map((item) => (
                            <div key={item.label} className="flex items-start gap-2 rounded-lg bg-[#121625] border border-[#202538] px-3 py-2">
                              {item.pass ? (
                                <Icons.CheckCircle2 size={14} className="text-green-400 shrink-0 mt-0.5" />
                              ) : (
                                <Icons.AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                              )}
                              <div>
                                <div className="text-[11px] font-bold text-gray-200">{item.label}</div>
                                <p className="text-[10px] text-gray-500 leading-relaxed">{item.note}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(activeThemeDetail.theme.ui_mode || 'easy') === 'easy' && (
                      <div className="rounded-xl border border-[#202538] bg-[#101422] p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--primary)]">
                              <Icons.Wrench size={13} />
                              One-Click Smart Fixes
                            </div>
                            <p className="text-[11px] text-gray-400 mt-1">
                              Apply practical corrections without learning the token controls.
                            </p>
                          </div>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#1c223c] text-gray-300 font-bold uppercase shrink-0">
                            Safe fixes
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {smartFixActions.map((fix) => {
                            const Icon = fix.icon;
                            return (
                              <button
                                key={fix.key}
                                type="button"
                                onClick={() => applySmartFix(fix.key)}
                                className="text-left rounded-lg border border-[#202538] bg-[#121625] hover:bg-[#171c2f] hover:border-[var(--primary)] transition-all px-3 py-2.5 group"
                              >
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-100">
                                  <Icon size={14} className="text-gray-400 group-hover:text-[var(--primary)]" />
                                  {fix.label}
                                </div>
                                <p className="text-[10px] text-gray-500 mt-1 pl-6">{fix.detail}</p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">Theme Name</label>
                      <input
                        type="text"
                        value={activeThemeDetail.theme.name}
                        onChange={(e) => handleAutosave({
                          ...activeThemeDetail,
                          theme: { ...activeThemeDetail.theme, name: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-[#121625] border border-[#202538] rounded-lg text-xs focus:outline-none focus:border-[var(--primary)]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">Target App Interface</label>
                      <select
                        value={activeThemeDetail.theme.app_type}
                        onChange={(e) => handleAutosave({
                          ...activeThemeDetail,
                          theme: { ...activeThemeDetail.theme, app_type: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-[#121625] border border-[#202538] rounded-lg text-xs focus:outline-none focus:border-[var(--primary)]"
                      >
                        <option>Admin Dashboard</option>
                        <option>Data Capture App</option>
                        <option>Finance App</option>
                        <option>Tactical Console</option>
                        <option>Hospitality System</option>
                        <option>Client Portal</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">Style Mood</label>
                        <select
                          value={activeThemeDetail.theme.style_mood}
                          onChange={(e) => handleAutosave({
                            ...activeThemeDetail,
                            theme: { ...activeThemeDetail.theme, style_mood: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-[#121625] border border-[#202538] rounded-lg text-xs focus:outline-none"
                        >
                          <option>Modern</option>
                          <option>Corporate</option>
                          <option>Tactical</option>
                          <option>Minimal</option>
                          <option>Soft</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">Density Preset</label>
                        <select
                          value={activeThemeDetail.theme.density}
                          onChange={(e) => {
                            const newDensity = e.target.value;
                            const updated = {
                              ...activeThemeDetail,
                              theme: { ...activeThemeDetail.theme, density: newDensity }
                            };
                            // Also load the spacing tokens preset
                            if (newDensity === "Compact") updated.spacing_tokens = SpacingPresets["Compact (Dense & Professional)"];
                            else if (newDensity === "Comfortable") updated.spacing_tokens = SpacingPresets["Comfortable (Standard UI)"];
                            else updated.spacing_tokens = SpacingPresets["Spacious (Clean & Relaxed)"];
                            
                            handleAutosave(updated);
                          }}
                          className="w-full px-3 py-2 bg-[#121625] border border-[#202538] rounded-lg text-xs focus:outline-none"
                        >
                          <option>Compact</option>
                          <option>Comfortable</option>
                          <option>Spacious</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">Border Strength</label>
                        <select
                          value={activeThemeDetail.theme.border_style}
                          onChange={(e) => handleAutosave({
                            ...activeThemeDetail,
                            theme: { ...activeThemeDetail.theme, border_style: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-[#121625] border border-[#202538] rounded-lg text-xs focus:outline-none"
                        >
                          <option>Subtle</option>
                          <option>Strong</option>
                          <option>Glass</option>
                          <option>Flat</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">Corner Curvature</label>
                        <select
                          value={activeThemeDetail.theme.component_style}
                          onChange={(e) => {
                            const val = e.target.value;
                            const updated = {
                              ...activeThemeDetail,
                              theme: { ...activeThemeDetail.theme, component_style: val }
                            };
                            if (val === "Sharp") updated.radius_tokens = RadiusPresets["Sharp (Tactical/Retro)"];
                            else if (val === "Rounded") updated.radius_tokens = RadiusPresets["Subtle Rounded (Corporate)"];
                            else if (val === "Pill") updated.radius_tokens = RadiusPresets["Pill Soft (Friendly)"];
                            else updated.radius_tokens = RadiusPresets["Modern Rounded (Standard)"];
                            handleAutosave(updated);
                          }}
                          className="w-full px-3 py-2 bg-[#121625] border border-[#202538] rounded-lg text-xs focus:outline-none"
                        >
                          <option>Sharp</option>
                          <option>Rounded</option>
                          <option>Pill</option>
                          <option>Soft Card</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">Default Display Mode</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['Dark', 'Light', 'Both'].map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => {
                              const updated = {
                                ...activeThemeDetail,
                                theme: { ...activeThemeDetail.theme, default_mode: m }
                              };
                              handleAutosave(updated);
                              if (m !== 'Both') setPreviewMode(m.toLowerCase() as any);
                            }}
                            className={`px-3 py-2 border rounded-lg text-xs font-bold transition-all ${
                              activeThemeDetail.theme.default_mode === m
                                ? 'bg-[#1a1f35] border-[var(--primary)] text-[var(--primary)]'
                                : 'border-[#202538] hover:bg-[#121625] text-gray-400'
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 1: COLOUR SYSTEM */}
                {activeStep === 1 && (() => {
                  const isPrimaryOutOfGamut = isOklchOutOfGamut(
                    0.76,
                    activeThemeDetail.colour_tokens.chroma,
                    activeThemeDetail.colour_tokens.base_hue
                  );
                  return (
                    <div className="space-y-6 anim-fade-in">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-sm text-white uppercase tracking-wider mb-2">Sajid OKLCH Generator</h3>
                          <p className="text-xs text-gray-400">Slide controls to automatically build an entire harmonious UI palette.</p>
                        </div>
                        <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase select-none shrink-0 ${
                          isPrimaryOutOfGamut ? 'bg-amber-950 text-amber-400' : 'bg-green-950 text-green-400'
                        }`} title={isPrimaryOutOfGamut ? "This color is in the high-gamut P3 space and might look clipped on standard screens." : "This color is within the standard sRGB gamut, supported on all devices."}>
                          {isPrimaryOutOfGamut ? 'P3 Gamut' : 'sRGB Gamut'}
                        </span>
                      </div>

                      {/* HUE */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-gray-400">Base Color Mood (Hue)</span>
                          <span className="text-[var(--primary)] font-mono">{activeThemeDetail.colour_tokens.base_hue}°</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-amber-500 font-bold uppercase select-none">Warmer</span>
                          <input
                            type="range"
                            min="0"
                            max="360"
                            value={activeThemeDetail.colour_tokens.base_hue}
                            onChange={(e) => handleColorSliderChange('base_hue', parseFloat(e.target.value))}
                            className="flex-1 h-1 bg-[#121625] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
                          />
                          <span className="text-[10px] text-indigo-400 font-bold uppercase select-none">Cooler</span>
                        </div>
                      </div>

                      {/* CHROMA */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-gray-400">Color Vividness (Chroma)</span>
                          <span className="text-[var(--primary)] font-mono">{activeThemeDetail.colour_tokens.chroma}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-gray-500 font-bold uppercase select-none">Neutral</span>
                          <input
                            type="range"
                            min="0"
                            max="0.25"
                            step="0.01"
                            value={activeThemeDetail.colour_tokens.chroma}
                            onChange={(e) => handleColorSliderChange('chroma', parseFloat(e.target.value))}
                            className="flex-1 h-1 bg-[#121625] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
                          />
                          <span className="text-[10px] text-pink-500 font-bold uppercase select-none">Vivid</span>
                        </div>
                      </div>

                      {/* COLOR HARMONY */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-400">Color Harmony Mode</label>
                        <select
                          value={activeThemeDetail.colour_tokens.harmony || 'complementary'}
                          onChange={(e) => handleAutosave({
                            ...activeThemeDetail,
                            colour_tokens: { ...activeThemeDetail.colour_tokens, harmony: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-[#121625] border border-[#202538] rounded-lg text-xs text-gray-200 focus:outline-none focus:border-[var(--primary)]"
                        >
                          <option value="complementary">Complementary (180° Contrast)</option>
                          <option value="analogous">Analogous (+30° Adjacent)</option>
                          <option value="split">Split-Complementary (+150° Split)</option>
                          <option value="monochromatic">Monochromatic (Same Hue, Shifted L)</option>
                        </select>
                      </div>

                      {/* IMAGE COLOR EXTRACTOR */}
                      <div className="space-y-2 border-t border-[#202538] pt-4">
                        <div className="flex justify-between items-center">
                          <label className="block text-xs font-semibold text-gray-400 flex items-center gap-1.5">
                            <Icons.Camera size={14} className="text-[var(--primary)]" />
                            Extract Mood from Image
                          </label>
                          {pickerImageSrc && (
                            <button
                              type="button"
                              onClick={() => setPickerImageSrc(null)}
                              className="text-[10px] text-gray-500 hover:text-gray-300 font-semibold"
                            >
                              Clear Image
                            </button>
                          )}
                        </div>

                        {!pickerImageSrc ? (
                          <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleImageDrop}
                            className="border border-dashed border-[#2d334d] hover:border-[var(--primary)] rounded-lg p-4 transition-all duration-200 text-center bg-[#0d0f1a] hover:bg-[#111424] relative cursor-pointer"
                          >
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <Icons.Image size={24} className="mx-auto text-gray-500 mb-1.5" />
                            <p className="text-[10px] text-gray-400 font-medium">Drag & drop or click to upload image</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="relative group cursor-crosshair overflow-hidden border border-[#202538] rounded-lg bg-[#0d0f1a] flex justify-center items-center h-40">
                              <img
                                ref={imageRef}
                                src={pickerImageSrc}
                                alt="Color Source"
                                onMouseMove={handleImageMouseMove}
                                onMouseLeave={handleImageMouseLeave}
                                onClick={handleImageClick}
                                className="max-w-full max-h-full object-contain pointer-events-auto select-none"
                              />
                              <div
                                className="absolute w-7 h-7 rounded-full border-2 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all shadow-lg"
                                style={{
                                  ...magnifierStyle,
                                  backgroundColor: magnifierColor,
                                  transition: 'none'
                                }}
                              >
                                <div className="w-1 h-1 bg-white rounded-full border border-black" />
                              </div>
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono bg-[#141829] px-2.5 py-1.5 rounded-lg border border-[#202538]">
                              <span>Hover to view, click to extract base palette</span>
                              {hoveredColor && (
                                <span className="flex items-center gap-1">
                                  <span className="w-2.5 h-2.5 rounded-sm border border-black/50" style={{ backgroundColor: hoveredColor }} />
                                  <span className="font-bold text-gray-200">{hoveredColor}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* WCAG Contrast Warning Panel */}
                      <div className="p-4 bg-[#141829] border border-[#202538] rounded-xl space-y-2.5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Contrast Check (WCAG)</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span>Main Body Text</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              contrast.ratioText >= 4.5 ? 'bg-green-950 text-green-400' : 'bg-red-950 text-red-400'
                            }`}>
                              {contrast.ratioText.toFixed(1)}:1 {contrast.ratioText >= 4.5 ? 'PASS (AA)' : 'FAIL'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span>Muted Subtext</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              contrast.ratioMuted >= 4.5 ? 'bg-green-950 text-green-400' : 'bg-red-950 text-red-400'
                            }`}>
                              {contrast.ratioMuted.toFixed(1)}:1 {contrast.ratioMuted >= 4.5 ? 'PASS (AA)' : 'FAIL'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span>Primary Actions</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              contrast.ratioPrimary >= 4.5 ? 'bg-green-950 text-green-400' : 'bg-red-950/60 text-red-400'
                            }`}>
                              {contrast.ratioPrimary.toFixed(1)}:1 {contrast.ratioPrimary >= 4.5 ? 'PASS' : 'LOW CONTRAST'}
                            </span>
                          </div>
                        </div>
                        {contrast.ratioText < 4.5 && (
                          <p className="text-[10px] text-red-400 leading-normal border-t border-[#202538] pt-2">
                            ⚠️ Main text has low readability. Try decreasing Vividness (Chroma) or adjusting preview color modes.
                          </p>
                        )}
                      </div>

                      {/* Easy Mode Assist Panel */}
                      {(activeThemeDetail.theme.ui_mode || 'easy') === 'easy' && (
                        <div className="p-4 bg-[#141829] border border-indigo-950/60 rounded-xl space-y-2 flex items-start gap-3">
                          <Icons.Sparkles className="text-amber-400 w-5 h-5 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-gray-200">Sajid Color Harmonizer Active</h4>
                            <p className="text-[11px] text-gray-400 leading-relaxed">
                              Neutrals, borders, text, and active/hover states are automatically generated to guarantee WCAG contrast compliance.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Manual overrides section */}
                      {activeThemeDetail.theme.ui_mode === 'advanced' && (
                        <div className="border-t border-[#202538] pt-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Manual Color Overrides</h4>
                            <button
                              onClick={handleResetOverrides}
                              className="text-[10px] font-bold text-gray-400 hover:text-[var(--primary)] transition-colors"
                            >
                              Clear Overrides
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            {['primary', 'secondary', 'bg', 'text'].map((token) => (
                              <div key={token} className="flex flex-col gap-1 bg-[#121625] p-2 rounded-lg border border-[#202538]">
                                <span className="text-[10px] text-gray-400 uppercase font-mono">{token}</span>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="color"
                                    value={activeThemeDetail.colour_tokens.overrides[token] || '#000000'}
                                    onChange={(e) => handleColorOverride(token, e.target.value)}
                                    className="w-5 h-5 bg-transparent border-0 cursor-pointer rounded-full"
                                  />
                                  <input
                                    type="text"
                                    value={activeThemeDetail.colour_tokens.overrides[token] || ''}
                                    placeholder="Auto"
                                    onChange={(e) => handleColorOverride(token, e.target.value)}
                                    className="w-full bg-transparent border-0 text-gray-300 text-xs font-mono focus:outline-none"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* STEP 2: FONTS */}
                {activeStep === 2 && (
                  <div className="space-y-4 anim-fade-in">
                    <div>
                      <h3 className="font-bold text-sm text-white uppercase tracking-wider mb-2">Typography Setup</h3>
                      <p className="text-xs text-gray-400">Define headers, labels, and paragraph pairings.</p>
                    </div>

                    {/* Font Pair Presets */}
                    <div className="p-4 bg-[#141829] border border-[#202538] rounded-xl space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Quick Pairing Presets</h4>
                      <div className="space-y-2">
                        {Object.keys(TypographyPresets).map((presetKey) => {
                          const preset = TypographyPresets[presetKey];
                          const isSelected = activeThemeDetail.typography_tokens.preset_name === presetKey;
                          
                          // Map font properties to visual previews
                          let headingFontFamily = 'sans-serif';
                          if (preset.heading_font.toLowerCase().includes('serif')) {
                            headingFontFamily = 'serif';
                          } else if (preset.heading_font.toLowerCase().includes('code') || preset.heading_font.toLowerCase().includes('mono')) {
                            headingFontFamily = 'monospace';
                          }
                          
                          let bodyFontFamily = 'sans-serif';
                          if (preset.body_font.toLowerCase().includes('code') || preset.body_font.toLowerCase().includes('mono') || preset.body_font.toLowerCase().includes('fira')) {
                            bodyFontFamily = 'monospace';
                          }

                          return (
                            <button
                              key={presetKey}
                              type="button"
                              onClick={() => applyTypographyPreset(presetKey)}
                              className={`w-full p-3 text-left border rounded-xl transition-all flex justify-between items-center gap-4 ${
                                isSelected
                                  ? 'bg-[#1a1f35] border-[var(--primary)] text-white shadow-lg'
                                  : 'border-[#202538] bg-[#0f121e] hover:bg-[#121625] text-gray-400 hover:text-gray-200'
                              }`}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-xs text-white">{presetKey}</span>
                                  <span className="text-[9px] px-1.5 py-0.5 bg-[#1e233b] rounded text-gray-400 font-mono">
                                    {preset.heading_font} + {preset.body_font}
                                  </span>
                                </div>
                                <div className="text-[10px] text-gray-400 font-medium">
                                  Ratio: {preset.scale_ratio}x | Weight: {preset.font_weights.bold}
                                </div>
                              </div>
                              
                              {/* Visual Sample Stack Card */}
                              <div className="p-2 bg-[#121625] border border-[#202538] rounded-lg w-28 text-left shrink-0">
                                <div 
                                  style={{ fontFamily: headingFontFamily, fontWeight: 700 }} 
                                  className="text-white text-[11px] leading-none"
                                >
                                  Aa Heading
                                </div>
                                <div 
                                  style={{ fontFamily: bodyFontFamily }} 
                                  className="text-[8px] text-gray-500 mt-1 leading-tight line-clamp-1"
                                >
                                  Body paragraph sample.
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Font Selection */}
                    {activeThemeDetail.theme.ui_mode === 'advanced' && (
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div>
                          <label className="block text-xs font-semibold text-gray-400 mb-1">Heading Font</label>
                          <input
                            type="text"
                            value={activeThemeDetail.typography_tokens.heading_font}
                            onChange={(e) => handleAutosave({
                              ...activeThemeDetail,
                              typography_tokens: { ...activeThemeDetail.typography_tokens, heading_font: e.target.value, preset_name: 'Custom' }
                            })}
                            className="w-full px-3 py-2 bg-[#121625] border border-[#202538] rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-400 mb-1">Body Font</label>
                          <input
                            type="text"
                            value={activeThemeDetail.typography_tokens.body_font}
                            onChange={(e) => handleAutosave({
                              ...activeThemeDetail,
                              typography_tokens: { ...activeThemeDetail.typography_tokens, body_font: e.target.value, preset_name: 'Custom' }
                            })}
                            className="w-full px-3 py-2 bg-[#121625] border border-[#202538] rounded-lg text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {/* Base size control */}
                    <div className="pt-2">
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-gray-400">Base Font Size</span>
                        <span className="text-[var(--primary)] font-mono">{activeThemeDetail.typography_tokens.base_font_size}px</span>
                      </div>
                      <input
                        type="range"
                        min="12"
                        max="24"
                        value={activeThemeDetail.typography_tokens.base_font_size}
                        onChange={(e) => handleAutosave({
                          ...activeThemeDetail,
                          typography_tokens: { ...activeThemeDetail.typography_tokens, base_font_size: parseInt(e.target.value), preset_name: 'Custom' }
                        })}
                        className="w-full h-1 bg-[#121625] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 3: SPACING */}
                {activeStep === 3 && (
                  <div className="space-y-4 anim-fade-in">
                    <div>
                      <h3 className="font-bold text-sm text-white uppercase tracking-wider mb-2">Spacing & Page Densities</h3>
                      <p className="text-xs text-gray-400">Define layouts, sidebars, and gaps. Best practice: multiples of 4px.</p>
                    </div>

                    {/* Easy Mode: Global Density Slider */}
                    {(activeThemeDetail.theme.ui_mode || 'easy') === 'easy' && (
                      <div className="p-5 bg-[#141829] border border-[#202538] rounded-xl space-y-5">
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-gray-300">Global UI Density</span>
                          <span className="text-[var(--primary)] font-bold">
                            {activeThemeDetail.spacing_tokens.preset_name || "Comfortable (Standard UI)"}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="2"
                          step="1"
                          value={
                            activeThemeDetail.spacing_tokens.preset_name?.includes("Compact") ? 0 :
                            activeThemeDetail.spacing_tokens.preset_name?.includes("Spacious") ? 2 : 1
                          }
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            const keys = Object.keys(SpacingPresets);
                            const presetName = keys[val];
                            applySpacingPreset(presetName);
                          }}
                          className="w-full h-1.5 bg-[#121625] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
                        />
                        <div className="flex justify-between text-[9px] text-gray-500 font-bold uppercase tracking-wider">
                          <span>Compact</span>
                          <span>Comfortable</span>
                          <span>Spacious</span>
                        </div>
                        <div className="pt-2 border-t border-[#1c223c] text-[10px] text-gray-400 leading-normal flex items-start gap-2">
                          <Icons.Info size={14} className="text-[var(--primary)] shrink-0 mt-0.5" />
                          <span>Automatically scales page padding, grid gaps, sidebar sizes, and table cell heights to preserve perfect visual balance.</span>
                        </div>
                      </div>
                    )}

                    {/* Advanced Mode Controls */}
                    {activeThemeDetail.theme.ui_mode === 'advanced' && (
                      <>
                        {/* Presets */}
                        <div className="grid grid-cols-3 gap-2">
                          {Object.keys(SpacingPresets).map((sKey) => (
                            <button
                              key={sKey}
                              onClick={() => applySpacingPreset(sKey)}
                              className={`px-3 py-2.5 border rounded-lg text-xs transition-all text-left ${
                                activeThemeDetail.spacing_tokens.preset_name === sKey
                                  ? 'bg-[#1a1f35] border-[var(--primary)] text-[var(--primary)] font-bold'
                                  : 'border-[#202538] hover:bg-[#121625] text-gray-400'
                              }`}
                            >
                              <span className="font-semibold block text-white">{sKey.split(' ')[0]}</span>
                              <span className="text-[9px] text-gray-400 block mt-0.5">Cell: {SpacingPresets[sKey].table_cell_padding}</span>
                            </button>
                          ))}
                        </div>

                        {/* Detailed spacers list */}
                        <div className="space-y-3 pt-3 border-t border-[#202538]">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Layout Spacers (Custom)</h4>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] text-gray-400 font-bold uppercase">Page Padding</label>
                              <input
                                type="text"
                                value={activeThemeDetail.spacing_tokens.page_padding}
                                onChange={(e) => handleAutosave({
                                  ...activeThemeDetail,
                                  spacing_tokens: { ...activeThemeDetail.spacing_tokens, page_padding: e.target.value, preset_name: 'Custom' }
                                })}
                                className="w-full px-3 py-1.5 bg-[#121625] border border-[#202538] rounded-md text-xs focus:outline-none text-gray-300 font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-gray-400 font-bold uppercase">Card Padding</label>
                              <input
                                type="text"
                                value={activeThemeDetail.spacing_tokens.card_padding}
                                onChange={(e) => handleAutosave({
                                  ...activeThemeDetail,
                                  spacing_tokens: { ...activeThemeDetail.spacing_tokens, card_padding: e.target.value, preset_name: 'Custom' }
                                })}
                                className="w-full px-3 py-1.5 bg-[#121625] border border-[#202538] rounded-md text-xs focus:outline-none text-gray-300 font-mono"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] text-gray-400 font-bold uppercase">Sidebar Width</label>
                              <input
                                type="text"
                                value={activeThemeDetail.spacing_tokens.sidebar_width}
                                onChange={(e) => handleAutosave({
                                  ...activeThemeDetail,
                                  spacing_tokens: { ...activeThemeDetail.spacing_tokens, sidebar_width: e.target.value, preset_name: 'Custom' }
                                })}
                                className="w-full px-3 py-1.5 bg-[#121625] border border-[#202538] rounded-md text-xs focus:outline-none text-gray-300 font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-gray-400 font-bold uppercase">Table Cell Padding</label>
                              <input
                                type="text"
                                value={activeThemeDetail.spacing_tokens.table_cell_padding}
                                onChange={(e) => handleAutosave({
                                  ...activeThemeDetail,
                                  spacing_tokens: { ...activeThemeDetail.spacing_tokens, table_cell_padding: e.target.value, preset_name: 'Custom' }
                                })}
                                className="w-full px-3 py-1.5 bg-[#121625] border border-[#202538] rounded-md text-xs focus:outline-none text-gray-300 font-mono"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Range Sliders for Spacing */}
                        <div className="space-y-4 pt-3 mt-3 border-t border-[#202538]">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Layout Spacing Sliders</h4>
                          
                          {/* Card Padding Slider */}
                          <div className="space-y-1" id="slider-card-padding">
                            <div className="flex justify-between text-xs text-gray-300">
                              <span>Card Padding</span>
                              <span className="font-mono font-bold text-[var(--primary)]">{activeThemeDetail.spacing_tokens.card_padding}</span>
                            </div>
                            <input
                              type="range"
                              min="8"
                              max="48"
                              value={parseInt(activeThemeDetail.spacing_tokens.card_padding) || 16}
                              onChange={(e) => handleAutosave({
                                ...activeThemeDetail,
                                spacing_tokens: { ...activeThemeDetail.spacing_tokens, card_padding: `${e.target.value}px`, preset_name: 'Custom' }
                              })}
                              className="w-full h-1 bg-[#121625] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
                            />
                          </div>

                          {/* Table Cell Padding Slider */}
                          <div className="space-y-1" id="slider-table-padding">
                            <div className="flex justify-between text-xs text-gray-300">
                              <span>Table Cell Padding</span>
                              <span className="font-mono font-bold text-[var(--primary)]">{activeThemeDetail.spacing_tokens.table_cell_padding}</span>
                            </div>
                            <input
                              type="range"
                              min="4"
                              max="24"
                              value={parseInt(activeThemeDetail.spacing_tokens.table_cell_padding) || 12}
                              onChange={(e) => handleAutosave({
                                ...activeThemeDetail,
                                spacing_tokens: { ...activeThemeDetail.spacing_tokens, table_cell_padding: `${e.target.value}px`, preset_name: 'Custom' }
                              })}
                              className="w-full h-1 bg-[#121625] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
                            />
                          </div>

                          {/* Form Gap Slider */}
                          <div className="space-y-1" id="slider-form-gap">
                            <div className="flex justify-between text-xs text-gray-300">
                              <span>Form Element Gap</span>
                              <span className="font-mono font-bold text-[var(--primary)]">{activeThemeDetail.spacing_tokens.form_gap}</span>
                            </div>
                            <input
                              type="range"
                              min="8"
                              max="32"
                              value={parseInt(activeThemeDetail.spacing_tokens.form_gap) || 16}
                              onChange={(e) => handleAutosave({
                                ...activeThemeDetail,
                                spacing_tokens: { ...activeThemeDetail.spacing_tokens, form_gap: `${e.target.value}px`, preset_name: 'Custom' }
                              })}
                              className="w-full h-1 bg-[#121625] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
                            />
                          </div>

                          {/* Dashboard Grid Gap Slider */}
                          <div className="space-y-1" id="slider-grid-gap">
                            <div className="flex justify-between text-xs text-gray-300">
                              <span>Dashboard Grid Gap</span>
                              <span className="font-mono font-bold text-[var(--primary)]">{activeThemeDetail.spacing_tokens.dashboard_grid_gap}</span>
                            </div>
                            <input
                              type="range"
                              min="8"
                              max="48"
                              value={parseInt(activeThemeDetail.spacing_tokens.dashboard_grid_gap) || 20}
                              onChange={(e) => handleAutosave({
                                ...activeThemeDetail,
                                spacing_tokens: { ...activeThemeDetail.spacing_tokens, dashboard_grid_gap: `${e.target.value}px`, preset_name: 'Custom' }
                              })}
                              className="w-full h-1 bg-[#121625] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* STEP 4: ELEVATION */}
                {activeStep === 4 && (
                  <div className="space-y-4 anim-fade-in max-h-[60vh] overflow-y-auto pr-1">
                    <div>
                      <h3 className="font-bold text-sm text-white uppercase tracking-wider mb-2">Borders, Radii, and Shadows</h3>
                      <p className="text-xs text-gray-400">Establish the corner style and depth shadows for your app.</p>
                    </div>

                    {/* Radius presets */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Corner Presets</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.keys(RadiusPresets).map((rKey) => (
                          <button
                            key={rKey}
                            onClick={() => applyRadiusPreset(rKey)}
                            className="px-3 py-2 border border-[#202538] hover:border-[var(--primary)] bg-[#121625] text-white hover:text-[var(--primary)] text-xs rounded-lg font-semibold transition-all text-left"
                          >
                            {rKey.split(' ')[0]} ({RadiusPresets[rKey].md})
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Detailed Radii Sliders */}
                    {activeThemeDetail.theme.ui_mode === 'advanced' && (
                      <div className="space-y-4 pt-3 border-t border-[#202538]" id="radii-fine-tuning">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Fine-Tune Corner Radii</h4>
                        
                        {/* Small Corners Slider */}
                        <div className="space-y-1" id="slider-radius-sm">
                          <div className="flex justify-between text-xs text-gray-300">
                            <span>Small Radius (Inputs, Tags)</span>
                            <span className="font-mono font-bold text-[var(--primary)]">{activeThemeDetail.radius_tokens.sm}</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="16"
                            value={parseInt(activeThemeDetail.radius_tokens.sm) || 0}
                            onChange={(e) => handleAutosave({
                              ...activeThemeDetail,
                              radius_tokens: { ...activeThemeDetail.radius_tokens, sm: `${e.target.value}px` }
                            })}
                            className="w-full h-1 bg-[#121625] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
                          />
                        </div>

                        {/* Medium Corners Slider */}
                        <div className="space-y-1" id="slider-radius-md">
                          <div className="flex justify-between text-xs text-gray-300">
                            <span>Medium Radius (Buttons, Alerts)</span>
                            <span className="font-mono font-bold text-[var(--primary)]">{activeThemeDetail.radius_tokens.md}</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="24"
                            value={parseInt(activeThemeDetail.radius_tokens.md) || 0}
                            onChange={(e) => handleAutosave({
                              ...activeThemeDetail,
                              radius_tokens: { ...activeThemeDetail.radius_tokens, md: `${e.target.value}px` }
                            })}
                            className="w-full h-1 bg-[#121625] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
                          />
                        </div>

                        {/* Large Corners Slider */}
                        <div className="space-y-1" id="slider-radius-lg">
                          <div className="flex justify-between text-xs text-gray-300">
                            <span>Large Radius (Cards, Blocks)</span>
                            <span className="font-mono font-bold text-[var(--primary)]">{activeThemeDetail.radius_tokens.lg}</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="32"
                            value={parseInt(activeThemeDetail.radius_tokens.lg) || 0}
                            onChange={(e) => handleAutosave({
                              ...activeThemeDetail,
                              radius_tokens: { ...activeThemeDetail.radius_tokens, lg: `${e.target.value}px` }
                            })}
                            className="w-full h-1 bg-[#121625] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
                          />
                        </div>

                        {/* Extra Large Corners Slider */}
                        <div className="space-y-1" id="slider-radius-xl">
                          <div className="flex justify-between text-xs text-gray-300">
                            <span>Extra Large Radius (Modals, Overlays)</span>
                            <span className="font-mono font-bold text-[var(--primary)]">{activeThemeDetail.radius_tokens.xl}</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="48"
                            value={parseInt(activeThemeDetail.radius_tokens.xl) || 0}
                            onChange={(e) => handleAutosave({
                              ...activeThemeDetail,
                              radius_tokens: { ...activeThemeDetail.radius_tokens, xl: `${e.target.value}px` }
                            })}
                            className="w-full h-1 bg-[#121625] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
                          />
                        </div>
                      </div>
                    )}

                    {/* Shadow presets */}
                    <div className="space-y-2 pt-2 border-t border-[#202538]">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Shadow (Depth) Presets</h4>
                      <div className="space-y-1.5">
                        {Object.keys(ShadowPresets).map((sKey) => (
                          <button
                            key={sKey}
                            onClick={() => applyShadowPreset(sKey)}
                            className="w-full px-3 py-2.5 border border-[#202538] hover:border-[var(--primary)] bg-[#121625] text-white hover:text-[var(--primary)] text-xs rounded-lg font-semibold transition-all text-left flex justify-between"
                          >
                            <span>{sKey}</span>
                            <span className="text-gray-500 text-[10px] font-mono">Button: {ShadowPresets[sKey].button.slice(0, 15)}...</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Shadow Controls */}
                    {activeThemeDetail.theme.ui_mode === 'advanced' && (
                      <div className="space-y-3 pt-2 border-t border-[#202538]">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Ambient Lighting & Shadows</h4>
                        
                        <div className="flex justify-between items-center bg-[#121625] p-2.5 rounded-lg border border-[#202538]">
                          <div>
                            <p className="text-xs font-semibold text-white">Colorize Ambient Shadows</p>
                            <p className="text-[10px] text-gray-400">Tint shadows with the brand's base color</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAutosave({
                              ...activeThemeDetail,
                              colour_tokens: { ...activeThemeDetail.colour_tokens, shadow_colorize: !activeThemeDetail.colour_tokens.shadow_colorize }
                            })}
                            className={`w-10 h-6 rounded-full p-0.5 flex items-center transition-all cursor-pointer ${
                              activeThemeDetail.colour_tokens.shadow_colorize ? 'bg-[var(--primary)] justify-end' : 'bg-gray-700 justify-start'
                            }`}
                          >
                            <span className="w-5 h-5 bg-white rounded-full shadow"></span>
                          </button>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-gray-300">
                            <span>Shadow Intensity</span>
                            <span className="font-mono font-bold text-[var(--primary)]">{(activeThemeDetail.colour_tokens.shadow_intensity ?? 0.25).toFixed(2)}x</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="1.5"
                            step="0.05"
                            value={activeThemeDetail.colour_tokens.shadow_intensity ?? 0.25}
                            onChange={(e) => handleAutosave({
                              ...activeThemeDetail,
                              colour_tokens: { ...activeThemeDetail.colour_tokens, shadow_intensity: parseFloat(e.target.value) }
                            })}
                            className="w-full h-1 bg-[#121625] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-gray-300">
                            <span>Top Highlight Opacity</span>
                            <span className="font-mono font-bold text-[var(--primary)]">{(activeThemeDetail.colour_tokens.highlight_opacity ?? 0.08).toFixed(2)}</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="0.4"
                            step="0.01"
                            value={activeThemeDetail.colour_tokens.highlight_opacity ?? 0.08}
                            onChange={(e) => handleAutosave({
                              ...activeThemeDetail,
                              colour_tokens: { ...activeThemeDetail.colour_tokens, highlight_opacity: parseFloat(e.target.value) }
                            })}
                            className="w-full h-1 bg-[#121625] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
                          />
                        </div>
                      </div>
                    )}

                    {/* Glassmorphism Controls */}
                    <div className="space-y-3 pt-2 border-t border-[#202538]">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Frosted Glass (Glassmorphism)</h4>

                      <div className="flex justify-between items-center bg-[#121625] p-2.5 rounded-lg border border-[#202538]">
                        <div>
                          <p className="text-xs font-semibold text-white">Enable Glassmorphism</p>
                          <p className="text-[10px] text-gray-400">Apply transparent blur effect to cards & panels</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAutosave({
                            ...activeThemeDetail,
                            colour_tokens: { ...activeThemeDetail.colour_tokens, glass_enabled: !activeThemeDetail.colour_tokens.glass_enabled }
                          })}
                          className={`w-10 h-6 rounded-full p-0.5 flex items-center transition-all cursor-pointer ${
                            activeThemeDetail.colour_tokens.glass_enabled ? 'bg-[var(--primary)] justify-end' : 'bg-gray-700 justify-start'
                          }`}
                        >
                          <span className="w-5 h-5 bg-white rounded-full shadow"></span>
                        </button>
                      </div>

                      {activeThemeDetail.colour_tokens.glass_enabled && activeThemeDetail.theme.ui_mode === 'advanced' && (
                        <div className="space-y-3 anim-fade-in">
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-gray-300">
                              <span>Backdrop Blur Strength</span>
                              <span className="font-mono font-bold text-[var(--primary)]">{activeThemeDetail.colour_tokens.glass_blur ?? 12}px</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="32"
                              step="1"
                              value={activeThemeDetail.colour_tokens.glass_blur ?? 12}
                              onChange={(e) => handleAutosave({
                                ...activeThemeDetail,
                                colour_tokens: { ...activeThemeDetail.colour_tokens, glass_blur: parseInt(e.target.value) }
                              })}
                              className="w-full h-1 bg-[#121625] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-gray-300">
                              <span>Surface Opacity (Transparency)</span>
                              <span className="font-mono font-bold text-[var(--primary)]">{Math.round((activeThemeDetail.colour_tokens.glass_opacity ?? 0.25) * 100)}%</span>
                            </div>
                            <input
                              type="range"
                              min="0.05"
                              max="0.95"
                              step="0.05"
                              value={activeThemeDetail.colour_tokens.glass_opacity ?? 0.25}
                              onChange={(e) => handleAutosave({
                                ...activeThemeDetail,
                                colour_tokens: { ...activeThemeDetail.colour_tokens, glass_opacity: parseFloat(e.target.value) }
                              })}
                              className="w-full h-1 bg-[#121625] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 5: ICONS */}
                {activeStep === 5 && (
                  <div className="space-y-4 anim-fade-in pr-1 max-h-[60vh] overflow-y-auto">
                    <div>
                      <h3 className="font-bold text-sm text-white uppercase tracking-wider mb-2">Icon Library Settings</h3>
                      <p className="text-xs text-gray-400">Manage stroke weights, sizes, and interactive UI action mappings.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">Default Library</label>
                        <select
                          value={activeThemeDetail.icon_settings.library}
                          onChange={(e) => handleAutosave({
                            ...activeThemeDetail,
                            icon_settings: { ...activeThemeDetail.icon_settings, library: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-[#121625] border border-[#202538] rounded-lg text-xs"
                        >
                          <option>Lucide</option>
                          <option>Heroicons</option>
                          <option>Phosphor</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">Stroke Width</label>
                        <select
                          value={activeThemeDetail.icon_settings.stroke_width}
                          onChange={(e) => handleAutosave({
                            ...activeThemeDetail,
                            icon_settings: { ...activeThemeDetail.icon_settings, stroke_width: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-[#121625] border border-[#202538] rounded-lg text-xs"
                        >
                          <option>1px</option>
                          <option>1.5px</option>
                          <option>2px</option>
                          <option>2.5px</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">Color Behavior</label>
                      <select
                        value={activeThemeDetail.icon_settings.colour_behaviour}
                        onChange={(e) => handleAutosave({
                          ...activeThemeDetail,
                          icon_settings: { ...activeThemeDetail.icon_settings, colour_behaviour: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-[#121625] border border-[#202538] rounded-lg text-xs focus:outline-none"
                      >
                        <option value="inherit text">Inherit surrounding text color</option>
                        <option value="muted">Always use muted text color</option>
                        <option value="primary">Always use brand primary color</option>
                      </select>
                    </div>

                    {/* Interactive Icon Mapping Customizer */}
                    <div className="space-y-3 border-t border-[#202538] pt-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-400">Target UI Action Mapping</label>
                        <select
                          value={selectedMappingKey}
                          onChange={(e) => setSelectedMappingKey(e.target.value)}
                          className="w-full px-3 py-2 bg-[#121625] border border-[#202538] rounded-lg text-xs focus:outline-none focus:border-[var(--primary)] text-gray-200"
                        >
                          {activeThemeDetail.icon_settings.mappings && Object.keys(activeThemeDetail.icon_settings.mappings).map((key) => (
                            <option key={key} value={key}>
                              {key} ({activeThemeDetail.icon_settings.mappings[key]})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Icon Search & Grid Picker */}
                      <div className="p-4 bg-[#141829] border border-[#202538] rounded-xl space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Search icons for "{selectedMappingKey}"
                          </label>
                          <span className="text-[10px] text-[var(--primary)] font-mono font-semibold">
                            Current: {activeThemeDetail.icon_settings.mappings[selectedMappingKey] || 'HelpCircle'}
                          </span>
                        </div>

                        <div className="relative">
                          <Icons.Search size={14} className="absolute left-3 top-2.5 text-gray-500" />
                          <input
                            type="text"
                            value={iconSearchQuery}
                            onChange={(e) => setIconSearchQuery(e.target.value)}
                            placeholder="Type to search icons (e.g. user, chart, check)..."
                            className="w-full pl-9 pr-4 py-2 bg-[#090b14] border border-[#202538] focus:border-[var(--primary)] rounded-lg text-xs text-gray-200 focus:outline-none"
                          />
                        </div>

                        {/* Scrollable Icon Grid */}
                        <div className="grid grid-cols-4 gap-2 max-h-[180px] overflow-y-auto pr-1">
                          {(() => {
                            const query = iconSearchQuery.toLowerCase().trim();
                            const toKebabCase = (str: string) => {
                              return str
                                .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
                                .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
                                .toLowerCase();
                            };
                            const matchedIcons = Object.keys(Icons).filter(name => {
                              if (typeof (Icons as any)[name] !== 'object') return false;
                              const matchesName = name.toLowerCase().includes(query);
                              const kebabName = toKebabCase(name);
                              const tags = (lucideTags as any)[kebabName] || [];
                              const matchesTags = tags.some((tag: string) => tag.toLowerCase().includes(query));
                              return matchesName || matchesTags;
                            }).slice(0, 32); // Limit to top 32 for performance

                            if (matchedIcons.length === 0) {
                              return <p className="col-span-4 text-[10px] text-center text-gray-500 py-4">No matching icons found</p>;
                            }

                            return matchedIcons.map((iconName) => {
                              const IconComp = (Icons as any)[iconName];
                              const isSelected = activeThemeDetail.icon_settings.mappings[selectedMappingKey] === iconName;
                              return (
                                <button
                                  key={iconName}
                                  type="button"
                                  title={iconName}
                                  onClick={() => {
                                    const updated = {
                                      ...activeThemeDetail,
                                      icon_settings: {
                                        ...activeThemeDetail.icon_settings,
                                        mappings: {
                                          ...activeThemeDetail.icon_settings.mappings,
                                          [selectedMappingKey]: iconName
                                        }
                                      }
                                    };
                                    handleAutosave(updated);
                                    showNotification(`Mapped "${selectedMappingKey}" to ${iconName}`, 'success');
                                  }}
                                  className={`p-2 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                                    isSelected 
                                      ? 'bg-[#181d30] border-[var(--primary)] text-[var(--primary)] shadow-md' 
                                      : 'bg-[#090b14] border-[#202538] hover:border-gray-600 text-gray-400 hover:text-white'
                                  }`}
                                >
                                  <IconComp size={16} />
                                  <span className="text-[7px] text-gray-500 truncate max-w-full font-mono">{iconName}</span>
                                </button>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 6: MOTION */}
                {activeStep === 6 && (
                  <div className="space-y-4 anim-fade-in pr-1 max-h-[60vh] overflow-y-auto">
                    <div>
                      <h3 className="font-bold text-sm text-white uppercase tracking-wider mb-2">Micro-Animations</h3>
                      <p className="text-xs text-gray-400">Control active speed transitions and hover scaling states.</p>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-[#202538]">
                      <div>
                        <p className="text-xs font-semibold text-white">Enable Transitions</p>
                        <p className="text-[10px] text-gray-400">Trigger standard keyframe animations</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAutosave({
                          ...activeThemeDetail,
                          motion_tokens: { ...activeThemeDetail.motion_tokens, enabled: !activeThemeDetail.motion_tokens.enabled }
                        })}
                        className={`w-10 h-6 rounded-full p-0.5 flex transition-all cursor-pointer ${
                          activeThemeDetail.motion_tokens.enabled ? 'bg-[var(--primary)] justify-end' : 'bg-gray-700 justify-start'
                        }`}
                      >
                        <span className="w-5 h-5 bg-white rounded-full shadow"></span>
                      </button>
                    </div>

                    {activeThemeDetail.motion_tokens.enabled && (
                      <div className="space-y-4">
                        {/* EASY MODE */}
                        {activeThemeDetail.theme.ui_mode !== 'advanced' ? (
                          <div className="space-y-3 anim-fade-in">
                            <div>
                              <label className="block text-[11px] font-semibold text-gray-400 mb-1">Easing Preset Curve</label>
                              <select
                                value={
                                  activeThemeDetail.motion_tokens.ease_bounce === 'cubic-bezier(0.3, 0.8, 0.2, 1.3)'
                                    ? 'sajid_bouncy'
                                    : activeThemeDetail.motion_tokens.ease_emphasised === 'cubic-bezier(0.6, 0, 0.2, 1)'
                                    ? 'fluid_emphasized'
                                    : activeThemeDetail.motion_tokens.ease_standard === 'linear'
                                    ? 'linear'
                                    : 'standard_smooth'
                                }
                                onChange={(e) => {
                                  const val = e.target.value;
                                  let ease_standard = 'cubic-bezier(0.4, 0, 0.2, 1)';
                                  let ease_emphasised = 'cubic-bezier(0.2, 0.8, 0.2, 1)';
                                  let ease_bounce = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
                                  
                                  if (val === 'sajid_bouncy') {
                                    ease_standard = 'cubic-bezier(0.4, 0, 0.2, 1)';
                                    ease_emphasised = 'cubic-bezier(0.6, 0, 0.2, 1)';
                                    ease_bounce = 'cubic-bezier(0.3, 0.8, 0.2, 1.3)'; // Sajid's favorite bouncy!
                                  } else if (val === 'fluid_emphasized') {
                                    ease_standard = 'cubic-bezier(0.4, 0, 0.2, 1)';
                                    ease_emphasised = 'cubic-bezier(0.6, 0, 0.2, 1)';
                                    ease_bounce = 'cubic-bezier(0.5, 0, 0, 1.25)';
                                  } else if (val === 'linear') {
                                    ease_standard = 'linear';
                                    ease_emphasised = 'linear';
                                    ease_bounce = 'linear';
                                  }
                                  
                                  handleAutosave({
                                    ...activeThemeDetail,
                                    motion_tokens: {
                                      ...activeThemeDetail.motion_tokens,
                                      ease_standard,
                                      ease_emphasised,
                                      ease_bounce
                                    }
                                  });
                                }}
                                className="w-full px-3 py-2 bg-[#121625] border border-[#202538] rounded-lg text-xs text-gray-200 focus:outline-none"
                              >
                                <option value="sajid_bouncy">🌟 Sajid's Bouncy (Playful & Elastic)</option>
                                <option value="fluid_emphasized">⚡ Fluid Emphasized (Smooth & Premium)</option>
                                <option value="standard_smooth">💫 Standard Smooth (Balanced)</option>
                                <option value="linear">⚙ Linear (Mechanical)</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-gray-400 mb-1">Global Speed Preset</label>
                              <div className="grid grid-cols-3 gap-2">
                                {[
                                  { key: 'fast', label: '⚡ Snappy', f: '100ms', n: '200ms', s: '350ms' },
                                  { key: 'normal', label: '💫 Comfort', f: '150ms', n: '300ms', s: '500ms' },
                                  { key: 'slow', label: '🐢 Slow-mo', f: '250ms', n: '500ms', s: '800ms' }
                                ].map((item) => (
                                  <button
                                    key={item.key}
                                    type="button"
                                    onClick={() => handleAutosave({
                                      ...activeThemeDetail,
                                      motion_tokens: {
                                        ...activeThemeDetail.motion_tokens,
                                        global_speed: item.key,
                                        duration_fast: item.f,
                                        duration_normal: item.n,
                                        duration_slow: item.s
                                      }
                                    })}
                                    className={`px-2 py-1.5 border rounded-lg text-xs font-bold transition-all ${
                                      activeThemeDetail.motion_tokens.global_speed === item.key
                                        ? 'bg-[#1a1f35] border-[var(--primary)] text-[var(--primary)]'
                                        : 'border-[#202538] hover:bg-[#121625] text-gray-400'
                                    }`}
                                  >
                                    {item.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* ADVANCED MODE */
                          <div className="space-y-4 anim-fade-in">
                            <div className="space-y-3 bg-[#121625] p-3 rounded-lg border border-[#202538]">
                              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Fine-tune Easing Curves</h4>
                              <div>
                                <label className="block text-[10px] text-gray-400 mb-1">Standard Curve (ease-standard)</label>
                                <input
                                  type="text"
                                  value={activeThemeDetail.motion_tokens.ease_standard}
                                  onChange={(e) => handleAutosave({
                                    ...activeThemeDetail,
                                    motion_tokens: { ...activeThemeDetail.motion_tokens, ease_standard: e.target.value }
                                  })}
                                  className="w-full px-2.5 py-1.5 bg-[#090b14] border border-[#202538] rounded font-mono text-[10px] text-gray-300 focus:outline-none focus:border-[var(--primary)]"
                                  placeholder="e.g. cubic-bezier(0.4, 0, 0.2, 1)"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] text-gray-400 mb-1">Emphasised Curve (ease-emphasised)</label>
                                <input
                                  type="text"
                                  value={activeThemeDetail.motion_tokens.ease_emphasised}
                                  onChange={(e) => handleAutosave({
                                    ...activeThemeDetail,
                                    motion_tokens: { ...activeThemeDetail.motion_tokens, ease_emphasised: e.target.value }
                                  })}
                                  className="w-full px-2.5 py-1.5 bg-[#090b14] border border-[#202538] rounded font-mono text-[10px] text-gray-300 focus:outline-none focus:border-[var(--primary)]"
                                  placeholder="e.g. cubic-bezier(0.25, 0.8, 0.25, 1)"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] text-gray-400 mb-1">Bounce Curve (ease-bounce)</label>
                                <input
                                  type="text"
                                  value={activeThemeDetail.motion_tokens.ease_bounce}
                                  onChange={(e) => handleAutosave({
                                    ...activeThemeDetail,
                                    motion_tokens: { ...activeThemeDetail.motion_tokens, ease_bounce: e.target.value }
                                  })}
                                  className="w-full px-2.5 py-1.5 bg-[#090b14] border border-[#202538] rounded font-mono text-[10px] text-gray-300 focus:outline-none focus:border-[var(--primary)]"
                                  placeholder="e.g. cubic-bezier(0.3, 0.8, 0.2, 1.3)"
                                />
                              </div>
                            </div>

                            <div className="space-y-3 bg-[#121625] p-3 rounded-lg border border-[#202538]">
                              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Fine-tune Durations</h4>
                              
                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px] text-gray-300">
                                  <span>Fast Duration (hover/press)</span>
                                  <span className="font-mono text-[var(--primary)]">{activeThemeDetail.motion_tokens.duration_fast}</span>
                                </div>
                                <input
                                  type="range"
                                  min="50"
                                  max="500"
                                  step="10"
                                  value={parseInt(activeThemeDetail.motion_tokens.duration_fast) || 150}
                                  onChange={(e) => handleAutosave({
                                    ...activeThemeDetail,
                                    motion_tokens: { ...activeThemeDetail.motion_tokens, duration_fast: `${e.target.value}ms` }
                                  })}
                                  className="w-full h-1 bg-[#090b14] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
                                />
                              </div>

                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px] text-gray-300">
                                  <span>Normal Duration (menus/tabs)</span>
                                  <span className="font-mono text-[var(--primary)]">{activeThemeDetail.motion_tokens.duration_normal}</span>
                                </div>
                                <input
                                  type="range"
                                  min="100"
                                  max="1000"
                                  step="25"
                                  value={parseInt(activeThemeDetail.motion_tokens.duration_normal) || 300}
                                  onChange={(e) => handleAutosave({
                                    ...activeThemeDetail,
                                    motion_tokens: { ...activeThemeDetail.motion_tokens, duration_normal: `${e.target.value}ms` }
                                  })}
                                  className="w-full h-1 bg-[#090b14] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
                                />
                              </div>

                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px] text-gray-300">
                                  <span>Slow Duration (modals/pages)</span>
                                  <span className="font-mono text-[var(--primary)]">{activeThemeDetail.motion_tokens.duration_slow}</span>
                                </div>
                                <input
                                  type="range"
                                  min="200"
                                  max="2000"
                                  step="50"
                                  value={parseInt(activeThemeDetail.motion_tokens.duration_slow) || 500}
                                  onChange={(e) => handleAutosave({
                                    ...activeThemeDetail,
                                    motion_tokens: { ...activeThemeDetail.motion_tokens, duration_slow: `${e.target.value}ms` }
                                  })}
                                  className="w-full h-1 bg-[#090b14] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* INTERACTIVE MOTION SANDBOX */}
                        <div className="p-4 bg-[#141829] border border-[#202538] rounded-xl space-y-4 pt-4 mt-6 preview-scope">
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Sajid Motion Sandbox</h4>
                            <p className="text-[10px] text-gray-400">Interact with components designed on the active animation system.</p>
                          </div>

                          {/* 1. Physics Ease Slider Test */}
                          <div className="bg-[#0c0f1b] p-3 rounded-lg border border-[#202538] space-y-2.5">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold uppercase text-gray-400">Curve Physics Ball</span>
                              <div className="flex gap-1 bg-[#121625] p-0.5 rounded border border-[#202538]">
                                {(['standard', 'emphasised', 'bounce'] as const).map((curve) => (
                                  <button
                                    key={curve}
                                    type="button"
                                    onClick={() => setSandboxTestCurve(curve)}
                                    className={`text-[8px] px-1.5 py-0.5 rounded uppercase font-bold transition-all ${
                                      sandboxTestCurve === curve
                                        ? 'bg-[var(--primary)] text-white'
                                        : 'text-gray-400 hover:text-white'
                                    }`}
                                  >
                                    {curve}
                                  </button>
                                ))}
                              </div>
                            </div>
                            
                            {/* Visual Track */}
                            <div className="relative h-8 bg-[#090b14] rounded-lg border border-[#202538] flex items-center px-2 overflow-hidden">
                              <div 
                                className="w-6 h-6 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] shadow-md transform transition-transform"
                                style={{
                                  transform: sandboxTranslate ? 'translateX(180px)' : 'translateX(0px)',
                                  transitionDuration: 'var(--duration-normal)',
                                  transitionTimingFunction: `var(--ease-${sandboxTestCurve})`
                                }}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => setSandboxTranslate(!sandboxTranslate)}
                              className="w-full py-1.5 bg-[#1a1e32] hover:bg-[#202640] border border-[#242b47] rounded text-[10px] text-gray-300 font-semibold uppercase tracking-wider transition-all"
                            >
                              Run Easing Physics Test
                            </button>
                          </div>

                          {/* 2. Link Hover Showcase */}
                          <div className="bg-[#0c0f1b] p-3 rounded-lg border border-[#202538] space-y-2">
                            <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Fancy Tab/Link Hover</span>
                            <div className="flex gap-4 justify-center items-center py-2">
                              {['Home', 'Profile', 'Billing'].map((tab) => (
                                <a
                                  key={tab}
                                  href="#"
                                  onClick={(e) => e.preventDefault()}
                                  className="text-[11px] font-semibold text-gray-300 hover:text-[var(--primary)] transition-all duration-[var(--duration-fast)] ease-[var(--ease-standard)] relative py-1 group"
                                >
                                  {tab}
                                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[var(--primary)] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-[var(--duration-normal)] ease-[var(--ease-bounce)]" />
                                </a>
                              ))}
                            </div>
                          </div>

                          {/* 3. Button Micro-Animations */}
                          <div className="bg-[#0c0f1b] p-3 rounded-lg border border-[#202538] space-y-2">
                            <span className="text-[10px] font-bold uppercase text-gray-400 block">Interactive Buttons</span>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                className="flex-1 py-1.5 text-[10px] font-bold bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-[var(--radius-md)] shadow-[var(--shadow-button)] transition-all duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:scale-105 active:scale-95 cursor-pointer"
                              >
                                Primary Hover Scale
                              </button>
                              <button
                                type="button"
                                className="px-3 py-1.5 bg-[#121625] border border-[#202538] rounded-[var(--radius-md)] transition-all duration-[var(--duration-fast)] ease-[var(--ease-bounce)] hover:rotate-12 hover:scale-110 active:scale-90 text-red-500 hover:text-red-400 cursor-pointer flex items-center justify-center"
                              >
                                <Icons.Heart size={12} fill="currentColor" />
                              </button>
                            </div>
                          </div>

                          {/* 4. 3D Card Flip */}
                          <div className="bg-[#0c0f1b] p-3 rounded-lg border border-[#202538] space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold uppercase text-gray-400">3D Flip Card (Perspective)</span>
                              <button
                                type="button"
                                onClick={() => setSandboxCardFlipped(!sandboxCardFlipped)}
                                className="text-[9px] font-bold text-[var(--primary)] hover:underline uppercase"
                              >
                                Flip Card
                              </button>
                            </div>
                            
                            {/* 3D Container */}
                            <div className="h-20 w-full" style={{ perspective: '800px' }}>
                              <div
                                className="relative w-full h-full text-center transition-transform"
                                style={{
                                  transformStyle: 'preserve-3d',
                                  transform: sandboxCardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                  transitionDuration: 'var(--duration-slow)',
                                  transitionTimingFunction: 'var(--ease-bounce)'
                                }}
                              >
                                {/* Front */}
                                <div 
                                  className="absolute w-full h-full bg-[#121625] border border-[#202538] rounded-lg p-2.5 flex flex-col justify-center items-start shadow-sm"
                                  style={{ backfaceVisibility: 'hidden' }}
                                >
                                  <p className="text-[9px] text-gray-400 uppercase tracking-widest font-mono">John Wick</p>
                                  <h5 className="text-xs font-bold text-white leading-tight">Master Assassin</h5>
                                </div>
                                
                                {/* Back */}
                                <div 
                                  className="absolute w-full h-full bg-[#1e233d] border border-[var(--primary)] rounded-lg p-2.5 flex flex-col justify-center items-start shadow-md text-left"
                                  style={{ 
                                    backfaceVisibility: 'hidden',
                                    transform: 'rotateY(180deg)'
                                  }}
                                >
                                  <p className="text-[8px] text-[var(--primary)] uppercase font-mono font-bold">Status: Active</p>
                                  <p className="text-[10px] text-gray-200 mt-1">Excommunicado. Bounty: $14M.</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 7: PRESET LIBRARY */}
                {activeStep === 7 && (
                  <div className="space-y-4 anim-fade-in pr-1">
                    <div>
                      <h3 className="font-bold text-sm text-white uppercase tracking-wider mb-2">Preset Theme Library</h3>
                      <p className="text-xs text-gray-400">Overwrite current tokens with an entirely new styled preset theme.</p>
                    </div>

                    <div className="space-y-2">
                      {PresetThemes.map((preset) => (
                        <div
                          key={preset.name}
                          onClick={() => applyFullThemePreset(preset)}
                          className="p-4 bg-[#141829] hover:bg-[#1c213a] border border-[#202538] hover:border-[var(--primary)] rounded-xl cursor-pointer transition-all flex justify-between items-center group"
                        >
                          <div>
                            <span className="font-bold text-xs text-white group-hover:text-[var(--primary)] transition-colors">{preset.name}</span>
                            <p className="text-[10px] text-gray-400 mt-0.5">{preset.app_type} | {preset.style_mood}</p>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[#2a2e4a] text-gray-300 uppercase font-semibold">Load</span>
                        </div>
                      ))}
                    </div>

                    {/* Component Interactive Sandbox */}
                    <div className="p-4 bg-[#141829] border border-[#202538] rounded-xl space-y-4 pt-4 mt-6 preview-scope">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white">Component Sandbox</h4>
                        <p className="text-[10px] text-gray-400">Test roundedness, colors, shadows, and animations dynamically.</p>
                      </div>

                      <div className="flex flex-col gap-3">
                        <div className="flex gap-2">
                          <button 
                            type="button"
                            className="flex-1 px-4 py-2 text-xs font-bold bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] rounded-[var(--radius-sm)] shadow-[var(--shadow-button)] transition-all duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:scale-105 active:scale-95 cursor-pointer"
                          >
                            Primary Button
                          </button>
                          <button 
                            type="button"
                            className="flex-1 px-4 py-2 text-xs font-medium bg-[var(--bg-light)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--border-muted)] rounded-[var(--radius-sm)] shadow-[var(--shadow-button)] transition-all duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:scale-105 active:scale-95 cursor-pointer"
                          >
                            Secondary
                          </button>
                        </div>
                        
                        <div className="flex flex-col gap-1.5">
                          <input 
                            type="text" 
                            placeholder="Focus to test ring highlights..."
                            className="w-full px-3 py-2 bg-[var(--bg-dark)] border border-[var(--border)] text-[var(--text)] rounded-[var(--radius-sm)] text-xs focus:outline-none focus:border-[var(--primary)] focus:shadow-[var(--shadow-focus-ring)] transition-all duration-[var(--duration-fast)]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                </div>

                {/* Bottom save actions */}
                <div className="p-4 bg-[#111422] border-t border-[#202538] flex justify-between items-center">
                  <button
                    onClick={() => {
                      if (confirm("Reset current step changes?")) {
                        // Apply default seed preset to step
                        const defaults = PresetThemes[0];
                        if (activeStep === 1) handleAutosave({ ...activeThemeDetail, colour_tokens: defaults.colour_tokens });
                        else if (activeStep === 2) handleAutosave({ ...activeThemeDetail, typography_tokens: defaults.typography_tokens });
                        else if (activeStep === 3) handleAutosave({ ...activeThemeDetail, spacing_tokens: defaults.spacing_tokens });
                        else if (activeStep === 4) handleAutosave({ ...activeThemeDetail, radius_tokens: defaults.radius_tokens, shadow_tokens: defaults.shadow_tokens });
                        else if (activeStep === 5) handleAutosave({ ...activeThemeDetail, icon_settings: defaults.icon_settings });
                        else if (activeStep === 6) handleAutosave({ ...activeThemeDetail, motion_tokens: defaults.motion_tokens });
                        showNotification("Current step reset to defaults", "info");
                      }
                    }}
                    className="px-3 py-1.5 bg-[#1a1e32] border border-[#242b47] hover:bg-[#202640] rounded text-gray-300 text-xs font-semibold"
                  >
                    Reset Step
                  </button>
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setPreviewMode(previewMode === 'dark' ? 'light' : 'dark')}
                      className="p-2 bg-[#1a1e32] border border-[#242b47] rounded-lg text-gray-300 hover:text-white transition-all flex items-center justify-center"
                      title={`Switch preview to ${previewMode === 'dark' ? 'Light' : 'Dark'} Mode`}
                    >
                      {previewMode === 'dark' ? <Icons.Sun size={14} /> : <Icons.Moon size={14} />}
                    </button>
                    <button
                      onClick={() => {
                        setActiveScreen('export');
                      }}
                      className="px-3.5 py-1.5 bg-[var(--primary)] hover:opacity-90 text-white rounded text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Icons.Download size={13} />
                      Export
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Hand Live Preview Gallery */}
            <div className="flex-1 overflow-hidden">
              <style>{`
                @keyframes pulseGlow {
                  0% { box-shadow: 0 0 0 0px rgba(98, 113, 243, 0.8); outline: 2px solid var(--primary); }
                  50% { box-shadow: 0 0 0 8px rgba(98, 113, 243, 0); outline: 2px solid var(--primary); }
                  100% { box-shadow: 0 0 0 0px rgba(98, 113, 243, 0); outline: none; }
                }
                .pulse-highlight {
                  animation: pulseGlow 1.2s cubic-bezier(0.24, 0, 0.2, 1);
                }
              `}</style>
              <PreviewGallery 
                detail={activeThemeDetail} 
                mode={previewMode} 
                onInspectSection={(stepIndex, elementId) => {
                  setActiveStep(stepIndex);
                  if (elementId) {
                    setTimeout(() => {
                      const el = document.getElementById(elementId);
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        el.classList.add('pulse-highlight');
                        setTimeout(() => el.classList.remove('pulse-highlight'), 1200);
                      }
                    }, 100);
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* SCREEN 3: EXPORT CENTRE SCREEN */}
        {activeScreen === 'export' && activeThemeDetail && (
          <div className="flex-1 overflow-hidden">
            <ExportCentre detail={activeThemeDetail} mode={previewMode} />
          </div>
        )}

        {/* SCREEN 4: SETTINGS SCREEN */}
        {activeScreen === 'settings' && (
          <div className="flex-1 p-8 overflow-y-auto space-y-6">
            <div className="pb-4 border-b border-[#202538]">
              <h1 className="text-2xl font-extrabold tracking-tight">Settings & Logs</h1>
              <p className="text-xs text-gray-400">Verify SQLite databases status and review exported history files.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Database status */}
              <div className="bg-[#0f121e] border border-[#202538] rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">SQLite Database Configuration</h3>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-[#202538]">
                    <span>Status</span>
                    <span className="text-green-400 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                      ACTIVE CONNECTED
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-[#202538]">
                    <span>Active Theme Count</span>
                    <span className="font-mono text-gray-300">{themes.length} Themes</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span>Database Directory</span>
                    <span className="font-mono text-[10px] text-gray-500 select-all bg-[#0a0c14] p-2 rounded border border-[#1b1f31]">
                      AppStyleStudio/app_style_studio.db
                    </span>
                  </div>
                </div>
              </div>

              {/* Export logs */}
              <div className="bg-[#0f121e] border border-[#202538] rounded-xl p-5 space-y-4 flex flex-col h-96">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 shrink-0">Export History Logs</h3>
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 select-none">
                  {exportLogs.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-12">No files have been exported yet in this session.</p>
                  ) : (
                    exportLogs.map((log) => (
                      <div key={log.id} className="flex justify-between items-center p-2.5 bg-[#131728] border border-[#1f253e] rounded-lg text-xs">
                        <div>
                          <span className="font-semibold text-gray-200">{log.theme_name}</span>
                          <span className="text-[10px] text-gray-500 block mt-0.5">Type: {log.export_type}</span>
                        </div>
                        <span className="text-[10px] text-gray-500 font-mono">{new Date(log.exported_at).toLocaleTimeString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;

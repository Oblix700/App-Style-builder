import React, { useState } from 'react';
import { ThemeDetail } from '../types';
import { generateCssVariablesString } from './PreviewEngine';
import { generateSajidPalette, getContrastRatio } from '../utils/colors';
import { SaveExportFile, LogExport, SaveExportZip } from '../../wailsjs/go/main/App';
import * as Icons from 'lucide-react';
import { ExportTabId, aiHandoffTabs, standardExportTabs, wailsStackTabs } from './exportCentreConfig';
import { ExportCentreSidebarSection } from './ExportCentreSidebar';
import { ExportCentreToolbar } from './ExportCentreToolbar';
import { ExportCentreCodeViewer } from './ExportCentreCodeViewer';
import { buildBoilerplateNamingGuide, buildGuardrailsPrompt, buildScreenBuildPrompts } from './exportCentreAiLoopPrompts';
import { buildBaselineFrameworkGuide, buildTemplateStrategy } from './exportCentreMethodologyDocs';
import { buildCoreHandoffPrompts } from './exportCentreCorePrompts';
import { buildAccessibilityNotes, buildDesignRules } from './exportCentreQualityDocs';
import { buildPerToolPrompts } from './exportCentreToolPrompts';
import { buildStackBoilerplates } from './exportCentreStackBoilerplates';
import { buildStarterTemplateFiles } from './exportCentreStarterTemplates';
import { buildExportTabContent } from './exportCentreTabContent';
import { buildAiHandoffZipFiles, buildFullHandoffZipFiles, buildStackZipFiles } from './exportCentreZipFiles';
import { buildIterationNotesMarkdown, createIterationSnapshot, getIterationSnapshotKey } from './exportCentreIterationNotes';

interface ExportCentreProps {
  detail: ThemeDetail;
  mode: 'light' | 'dark';
}

export function ExportCentre({ detail, mode }: ExportCentreProps) {
  const [activeTab, setActiveTab] = useState<ExportTabId>('theme-css');
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [archiveStatus, setArchiveStatus] = useState<string | null>(null);
  const [handoffStatus, setHandoffStatus] = useState<string | null>(null);
  const [fullHandoffStatus, setFullHandoffStatus] = useState<string | null>(null);
  const [starterTemplateStatus, setStarterTemplateStatus] = useState<string | null>(null);

  const colors = generateSajidPalette(
    detail.colour_tokens.base_hue,
    detail.colour_tokens.chroma,
    mode === 'light',
    detail.colour_tokens.overrides,
    detail.colour_tokens.harmony
  );
  const textContrast = getContrastRatio(colors.text?.rgb || { r: 255, g: 255, b: 255 }, colors.bg?.rgb || { r: 0, g: 0, b: 0 });
  const mutedContrast = getContrastRatio(colors['text-muted']?.rgb || { r: 150, g: 150, b: 150 }, colors.bg?.rgb || { r: 0, g: 0, b: 0 });
  const primaryContrast = getContrastRatio(colors.primary?.rgb || { r: 120, g: 100, b: 220 }, colors.bg?.rgb || { r: 0, g: 0, b: 0 });
  const designColorSummary = {
    primary: colors['primary']?.hex,
    primaryHover: colors['primary-hover']?.hex,
    secondary: colors['secondary']?.hex,
    bgDark: colors['bg-dark']?.hex,
    bg: colors['bg']?.hex,
    bgLight: colors['bg-light']?.hex,
    text: colors['text']?.hex,
    textMuted: colors['text-muted']?.hex,
    border: colors['border']?.hex,
    success: colors['success']?.hex,
    warning: colors['warning']?.hex,
    danger: colors['danger']?.hex,
    info: colors['info']?.hex,
  };
  const iterationSnapshotKey = getIterationSnapshotKey(detail);
  const currentIterationSnapshot = createIterationSnapshot(detail, colors);
  const getIterationNotesMarkdown = () => {
    const previousRaw = typeof window !== 'undefined' ? window.localStorage.getItem(iterationSnapshotKey) : null;
    return buildIterationNotesMarkdown(detail, currentIterationSnapshot, previousRaw);
  };

  const screenBuildPrompts = buildScreenBuildPrompts(detail);
  const guardrailsPrompt = buildGuardrailsPrompt(detail);
  const boilerplateNamingGuide = buildBoilerplateNamingGuide(detail);

  // 1. CSS VARIABLES
  const themeCss = `/* theme.css - Design Tokens for ${detail.theme.name} */
:root {
${generateCssVariablesString(detail, mode)}
}`;

  // 2. TAILWIND CONFIG
  const tailwindConfig = `// tailwind.config.ts - Config for ${detail.theme.name}
import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,html}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          dark: 'var(--bg-dark)',
          DEFAULT: 'var(--bg)',
          light: 'var(--bg-light)',
        },
        text: {
          DEFAULT: 'var(--text)',
          muted: 'var(--text-muted)',
        },
        border: {
          highlight: 'var(--border-highlight)',
          DEFAULT: 'var(--border)',
          muted: 'var(--border-muted)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          muted: 'var(--primary-muted)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          hover: 'var(--secondary-hover)',
        },
        danger: 'var(--danger)',
        warning: 'var(--warning)',
        success: 'var(--success)',
        info: 'var(--info)',
      },
      fontFamily: {
        heading: ["'${detail.typography_tokens.heading_font}'", 'sans-serif'],
        body: ["'${detail.typography_tokens.body_font}'", 'sans-serif'],
        mono: ["'${detail.typography_tokens.mono_font}'", 'monospace'],
      },
      borderRadius: {
        app: 'var(--radius-md)',
        'app-sm': 'var(--radius-sm)',
        'app-lg': 'var(--radius-lg)',
        'app-xl': 'var(--radius-xl)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        button: 'var(--shadow-button)',
        modal: 'var(--shadow-modal)',
        dropdown: 'var(--shadow-dropdown)',
      }
    }
  },
  plugins: [],
} satisfies Config;`;

  // 3. TOKENS JSON
  const tokensJson = JSON.stringify({
    themeName: detail.theme.name,
    appType: detail.theme.app_type,
    mood: detail.theme.style_mood,
    mode: mode,
    colors: Object.fromEntries(Object.entries(colors).map(([k, v]) => [k, v.hex])),
    typography: detail.typography_tokens,
    spacing: detail.spacing_tokens,
    radius: detail.radius_tokens,
    shadows: detail.shadow_tokens,
    icons: detail.icon_settings,
    motion: detail.motion_tokens,
  }, null, 2);

  // 4. COMPONENTS CSS
  const componentsCss = `/* components.css - Semantic Styled Classes for ${detail.theme.name} */
.app-bg {
  background-color: var(--bg-dark);
  color: var(--text);
  font-family: var(--font-body);
}

.app-card {
  ${detail.colour_tokens.glass_enabled ? `background: color-mix(in srgb, var(--bg-light) calc(var(--glass-opacity) * 100%), transparent);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-top: 1px solid var(--border-highlight);` : `background-color: var(--bg-light);`}
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--card-padding);
  box-shadow: var(--shadow-card);
  transition: all var(--duration-normal) var(--ease-standard);
}

.app-button-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: var(--primary);
  color: #ffffff;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-button);
  transition: all var(--duration-fast) var(--ease-standard);
  cursor: pointer;
}
.app-button-primary:hover {
  background-color: var(--primary-hover);
}
.app-button-primary:active {
  transform: scale(0.97);
}

.app-button-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-light);
  border: 1px solid var(--border);
  color: var(--text);
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast) var(--ease-standard);
  cursor: pointer;
}
.app-button-secondary:hover {
  background-color: var(--border-muted);
}

.app-input {
  width: 100%;
  background-color: var(--bg-dark);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: var(--radius-sm);
  padding: 0.5rem 0.75rem;
  font-size: var(--font-size-base);
  transition: border-color var(--duration-fast) var(--ease-standard);
}
.app-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: var(--shadow-focus-ring);
}

.app-table {
  width: 100%;
  border-collapse: collapse;
}
.app-table th {
  background-color: var(--bg-dark);
  color: var(--text-muted);
  font-weight: 700;
  padding: var(--table-cell-padding);
  border-bottom: 1px solid var(--border);
}
.app-table td {
  padding: var(--table-cell-padding);
  border-bottom: 1px solid var(--border-muted);
}

.app-alert-danger {
  padding: 1rem;
  background-color: rgba(234, 91, 91, 0.15);
  border: 1px solid var(--danger);
  border-radius: var(--radius-md);
  color: var(--text);
}

.app-select {
  width: 100%;
  background-color: var(--bg-dark);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: var(--radius-sm);
  padding: 0.5rem 0.75rem;
  transition: border-color var(--duration-fast) var(--ease-standard);
  appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
}
.app-select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: var(--shadow-focus-ring);
}

.app-checkbox {
  appearance: none;
  background-color: var(--bg-dark);
  border: 1px solid var(--border);
  width: 1.15rem;
  height: 1.15rem;
  border-radius: var(--radius-sm);
  display: inline-grid;
  place-content: center;
  cursor: pointer;
}
.app-checkbox:checked {
  background-color: var(--primary);
  border-color: var(--primary);
}
.app-checkbox:checked::before {
  content: "";
  width: 0.65rem;
  height: 0.65rem;
  clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
  background-color: white;
}

.app-radio {
  appearance: none;
  background-color: var(--bg-dark);
  border: 1px solid var(--border);
  width: 1.15rem;
  height: 1.15rem;
  border-radius: var(--radius-pill);
  display: inline-grid;
  place-content: center;
  cursor: pointer;
}
.app-radio:checked {
  background-color: var(--primary);
  border-color: var(--primary);
}
.app-radio:checked::before {
  content: "";
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background-color: white;
}

.app-badge-neutral {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: var(--radius-pill);
  background-color: var(--border-muted);
  color: var(--text-muted);
}
.app-badge-primary {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: var(--radius-pill);
  background-color: var(--primary-muted);
  color: var(--primary);
}
.app-badge-success {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: var(--radius-pill);
  background-color: rgba(91, 234, 135, 0.15);
  color: var(--success);
}
.app-badge-warning {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: var(--radius-pill);
  background-color: rgba(234, 171, 91, 0.15);
  color: var(--warning);
}
.app-badge-danger {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: var(--radius-pill);
  background-color: rgba(234, 91, 91, 0.15);
  color: var(--danger);
}

.app-nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 1rem;
  border-radius: var(--radius-md);
  color: var(--text-muted);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all var(--duration-fast) var(--ease-standard);
  cursor: pointer;
}
.app-nav-item:hover {
  background-color: var(--bg-light);
  color: var(--text);
}
.app-nav-item-active {
  background-color: var(--primary-muted);
  color: var(--primary);
  font-weight: 600;
}

.app-spinner {
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid var(--border-muted);
  border-top-color: var(--primary);
  border-radius: var(--radius-pill);
  animation: spin var(--duration-slow) linear infinite;
}

.app-modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}
.app-modal-container {
  width: 100%;
  max-width: var(--modal-width);
  background-color: var(--bg-light);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-modal);
  padding: var(--card-padding);
}
`;

  // 5. MOTION CSS
  const motionCss = `/* motion.css - Animation classes and keyframes */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes fadeInScale {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

.anim-fade-in {
  animation: fadeIn var(--duration-normal) var(--ease-standard) forwards;
}
.anim-fade-in-scale {
  animation: fadeInScale var(--duration-normal) var(--ease-bounce) forwards;
}
.anim-slide-in-left {
  animation: slideInLeft var(--duration-normal) var(--ease-emphasised) forwards;
}
.anim-slide-in-right {
  animation: slideInRight var(--duration-normal) var(--ease-emphasised) forwards;
}`;

  // 6. ICONS MAPPING JSON
  const iconsJson = JSON.stringify(detail.icon_settings, null, 2);

  // 7. DESIGN GUIDE
  const aiStyleGuide = `# Design Guide: ${detail.theme.name}

This guide governs the visual development of the app. Follow the design tokens and structure rules below.

## Colors
- **Main Background**: ${colors['bg-dark']?.hex} (Dark) | ${colors['bg']?.hex} (Surface)
- **Text**: ${colors['text']?.hex} (Primary) | ${colors['text-muted']?.hex} (Muted)
- **Brand Primary**: ${colors['primary']?.hex} | Hover: ${colors['primary-hover']?.hex}
- **Brand Secondary**: ${colors['secondary']?.hex}

## Typography
- **Heading Family**: ${detail.typography_tokens.heading_font}
- **Body Family**: ${detail.typography_tokens.body_font}
- **Scale**: Base ${detail.typography_tokens.base_font_size}px, ratio ${detail.typography_tokens.scale_ratio}

## Spacing (Multiples of 4px)
- **Padding Page**: ${detail.spacing_tokens.page_padding}
- **Card Padding**: ${detail.spacing_tokens.card_padding}
- **Table Cell Padding**: ${detail.spacing_tokens.table_cell_padding}

## Key Rules
1. **Highlight Shading**: Cards should have a thin border \`1px solid var(--border)\`.
2. **Elevations**: Modals use heavy shadow \`var(--shadow-modal)\`.
3. **Motion**: Hovering buttons scales them up slightly (+3%), pressing scales them down (-3%).

---
*Created using App Style Studio.*`;

  // 8. APP PREVIEW HTML
  const appPreviewHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${detail.theme.name} Preview</title>
  <style>
    ${themeCss}
    ${componentsCss}
    body {
      background-color: var(--bg-dark);
      color: var(--text);
      font-family: var(--font-body);
      margin: 0;
      padding: var(--page-padding);
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .demo-container {
      width: 100%;
      max-width: 480px;
    }
  </style>
</head>
<body class="app-bg">
  <div class="demo-container">
    <div class="app-card">
      <h2 style="font-family: var(--font-heading); margin-top: 0; color: var(--primary);">
        ${detail.theme.name}
      </h2>
      <p style="color: var(--text-muted); font-size: var(--font-size-base); margin-bottom: 24px;">
        This is a fully styled export preview. CSS custom properties and components are integrated.
      </p>
      <div style="display: flex; gap: 12px;">
        <button class="app-button-primary">Execute Action</button>
        <button class="app-button-secondary">Dismiss</button>
      </div>
    </div>
  </div>
</body>
</html>`;

  // 10. FIGMA DESIGN TOKENS
  const figmaTokens = {
    color: Object.fromEntries(
      Object.entries(colors).map(([key, val]) => [
        key,
        {
          $value: val.hex,
          $type: "color",
          $description: `Theme ${key} color`
        }
      ])
    ),
    dimension: {
      spacing: Object.fromEntries(
        Object.entries(detail.spacing_tokens)
          .filter(([k]) => k !== 'preset_name')
          .map(([key, val]) => [
            key,
            {
              $value: val,
              $type: "dimension",
              $description: `Spacing token: ${key}`
            }
          ])
      ),
      radius: Object.fromEntries(
        Object.entries(detail.radius_tokens).map(([key, val]) => [
          key,
          {
            $value: val,
            $type: "dimension",
            $description: `Corner radius: ${key}`
          }
        ])
      )
    },
    font: {
      family: {
        heading: { $value: detail.typography_tokens.heading_font, $type: "fontFamily" },
        body: { $value: detail.typography_tokens.body_font, $type: "fontFamily" },
        mono: { $value: detail.typography_tokens.mono_font, $type: "fontFamily" }
      },
      size: {
        base: { $value: `${detail.typography_tokens.base_font_size}px`, $type: "dimension" },
        ...Object.fromEntries(
          Object.entries(detail.typography_tokens.heading_sizes).map(([key, val]) => [
            key,
            { $value: val, $type: "dimension" }
          ])
        )
      }
    }
  };
  const figmaTokensJson = JSON.stringify(figmaTokens, null, 2);
  const w3cDesignTokensJson = JSON.stringify({
    $description: `W3C design tokens export for ${detail.theme.name}`,
    color: figmaTokens.color,
    spacing: figmaTokens.dimension.spacing,
    radius: figmaTokens.dimension.radius,
    typography: figmaTokens.font,
    shadow: Object.fromEntries(
      Object.entries(detail.shadow_tokens).map(([key, val]) => [
        key,
        { $value: val, $type: "shadow", $description: `Shadow token: ${key}` }
      ])
    ),
    motion: {
      duration: {
        fast: { $value: detail.motion_tokens.duration_fast, $type: "duration" },
        normal: { $value: detail.motion_tokens.duration_normal, $type: "duration" },
        slow: { $value: detail.motion_tokens.duration_slow, $type: "duration" },
      },
      easing: {
        standard: { $value: detail.motion_tokens.ease_standard, $type: "cubicBezier" },
        emphasised: { $value: detail.motion_tokens.ease_emphasised, $type: "cubicBezier" },
        bounce: { $value: detail.motion_tokens.ease_bounce, $type: "cubicBezier" },
      }
    }
  }, null, 2);
  const styleDictionaryJson = JSON.stringify({
    color: Object.fromEntries(
      Object.entries(colors).map(([key, val]) => [
        key,
        { value: val.hex, type: "color", comment: `Theme ${key} color` }
      ])
    ),
    size: {
      spacing: Object.fromEntries(
        Object.entries(detail.spacing_tokens)
          .filter(([key]) => key !== 'preset_name')
          .map(([key, val]) => [key, { value: val, type: "dimension", comment: `Spacing token: ${key}` }])
      ),
      radius: Object.fromEntries(
        Object.entries(detail.radius_tokens)
          .map(([key, val]) => [key, { value: val, type: "dimension", comment: `Corner radius: ${key}` }])
      ),
      font: {
        base: { value: `${detail.typography_tokens.base_font_size}px`, type: "dimension" },
        ...Object.fromEntries(
          Object.entries(detail.typography_tokens.heading_sizes).map(([key, val]) => [key, { value: val, type: "dimension" }])
        )
      }
    },
    font: {
      family: {
        heading: { value: detail.typography_tokens.heading_font, type: "fontFamily" },
        body: { value: detail.typography_tokens.body_font, type: "fontFamily" },
        mono: { value: detail.typography_tokens.mono_font, type: "fontFamily" },
      }
    },
    shadow: Object.fromEntries(
      Object.entries(detail.shadow_tokens).map(([key, val]) => [key, { value: val, type: "shadow" }])
    ),
    motion: {
      duration: {
        fast: { value: detail.motion_tokens.duration_fast, type: "duration" },
        normal: { value: detail.motion_tokens.duration_normal, type: "duration" },
        slow: { value: detail.motion_tokens.duration_slow, type: "duration" },
      },
      easing: {
        standard: { value: detail.motion_tokens.ease_standard, type: "cubicBezier" },
        emphasised: { value: detail.motion_tokens.ease_emphasised, type: "cubicBezier" },
        bounce: { value: detail.motion_tokens.ease_bounce, type: "cubicBezier" },
      }
    }
  }, null, 2);

  // 11. ECHARTS THEME JSON
  const echartsThemeJson = JSON.stringify({
    color: [
      colors['primary']?.hex || '#7c66dc',
      colors['secondary']?.hex || '#dc66c5',
      colors['success']?.hex || '#5bea87',
      colors['info']?.hex || '#5bcaea',
      colors['warning']?.hex || '#eaab5b',
      colors['danger']?.hex || '#ea5b5b'
    ],
    backgroundColor: 'rgba(0,0,0,0)',
    textStyle: {
      fontFamily: detail.typography_tokens.body_font,
      color: colors['text']?.hex || '#f3f1fe'
    },
    title: {
      textStyle: {
        fontFamily: detail.typography_tokens.heading_font,
        color: colors['text']?.hex || '#f3f1fe'
      }
    },
    line: {
      itemStyle: {
        borderWidth: 1
      },
      lineStyle: {
        width: 2
      },
      symbolSize: 6,
      symbol: 'circle',
      smooth: true
    },
    categoryAxis: {
      axisLine: {
        show: true,
        lineStyle: {
          color: colors['border']?.hex || '#352c67'
        }
      },
      axisTick: {
        show: true,
        lineStyle: {
          color: colors['border-muted']?.hex || '#241d48'
        }
      },
      axisLabel: {
        show: true,
        color: colors['text-muted']?.hex || '#9f97cc'
      },
      splitLine: {
        show: false
      }
    },
    valueAxis: {
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        show: true,
        color: colors['text-muted']?.hex || '#9f97cc'
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: colors['border-muted']?.hex || '#241d48',
          type: 'dashed'
        }
      }
    },
    tooltip: {
      axisPointer: {
        lineStyle: {
          color: colors['border']?.hex || '#352c67',
          width: 1
        },
        crossStyle: {
          color: colors['border']?.hex || '#352c67',
          width: 1
        }
      }
    }
  }, null, 2);

  // 9. COPYABLE AI PROMPT
  const aiPrompt = `Act as an expert software architect and senior full-stack developer. 
I want you to build/style a desktop application using my design system theme.
=========================================
TARGET TECH STACK:
- Backend: Go (Wails Framework) with SQLite database
- Frontend: React (TypeScript) + Tailwind CSS (v4) + ECharts (for visualizations)
=========================================
THEME NAME: ${detail.theme.name}
STYLE MOOD: ${detail.theme.style_mood}
DEFAULT MODE: ${mode.toUpperCase()}
=========================================
DESIGN TOKENS (JSON):
${tokensJson}

IMPLEMENTATION DIRECTIONS FOR THE AI ENGINE:

1. Setup CSS custom properties inside your global stylesheet (no prefixing):
   - Base background: var(--bg)
   - Dark background: var(--bg-dark)
   - Light background: var(--bg-light)
   - Text colors: var(--text) and var(--text-muted)
   - Borders: var(--border), var(--border-muted), and var(--border-highlight) (reflective highlight)
   - Brand color: var(--primary), var(--primary-hover), and var(--primary-muted)
   - Spacing: var(--space-xs) to var(--space-3xl)
   - Radius: var(--radius-sm) to var(--radius-pill)
   - Shadows: var(--shadow-card), var(--shadow-modal), var(--shadow-button)
   - Motion transitions: var(--duration-normal) with var(--ease-standard)

2. Apply Top border highlights to cards/panels:
   - Cards & Elevated Panels must have:
     \`border-top: 1px solid var(--border-highlight);\`
     and a standard border:
     \`border: 1px solid var(--border);\` (with border-top overridden).
   - Shadows must use the colorized ambient tint specified in the tokens (already pre-calculated inside the CSS variables).

3. Frosted Glassmorphism:
   ${detail.colour_tokens.glass_enabled ? `- Glass mode is ACTIVE. Elements like cards (\`.app-card\`) and modals (\`.modal-box\`) should have:
     \`background: color-mix(in srgb, var(--bg-light) calc(var(--glass-opacity) * 100%), transparent);\`
     \`backdrop-filter: blur(var(--glass-blur));\`
     \`-webkit-backdrop-filter: blur(var(--glass-blur));\`` : `- Glass mode is INACTIVE. Use standard solid backgrounds: \`background-color: var(--bg-light);\``}

4. React + Wails Desktop layout guidelines:
   - Provide a draggable header bar in React using \`className="drag-region"\` (or Wails drag utilities) styled with \`bg-[var(--bg-dark)]\`.
   - SQLite DB tables should store records cleanly, and Go Wails bindings should handle startup/shutdown states.

5. ECharts Integration:
   - Configure ECharts visualizations using the brand hex colors: Primary (\`${colors['primary']?.hex}\`), Secondary (\`${colors['secondary']?.hex}\`), Success (\`${colors['success']?.hex}\`), Info (\`${colors['info']?.hex}\`).
   - Style category/value axes and grids to match your light/dark backgrounds and borders.

6. Micro-interactions:
   - Interactive buttons must scale up on hover (\`transform: scale(1.03)\`) and scale down on press (\`transform: scale(0.97)\`) using transitions: \`transition: all var(--duration-fast) var(--ease-standard)\`.
   - Cards should lift slightly on hover (\`transform: translateY(-4px)\` and elevated shadow).

7. Font Pairings:
   - Heading font: ${detail.typography_tokens.heading_font}
   - Body font: ${detail.typography_tokens.body_font}

8. Semantic Styled Classes:
   Apply the pre-styled CSS classes from components.css for interface consistency:
   - Cards/Containers: \`.app-card\`
   - Buttons: \`.app-button-primary\`, \`.app-button-secondary\`
   - Inputs: \`.app-input\`, \`.app-select\`, \`.app-checkbox\`, \`.app-radio\`
   - Tables: \`.app-table\` with header \`<th>\` and cells \`<td>\`
   - Badges/Pills: \`.app-badge-neutral\`, \`.app-badge-primary\`, \`.app-badge-success\`, \`.app-badge-warning\`, \`.app-badge-danger\`
   - Nav Link Items: \`.app-nav-item\`, \`.app-nav-item-active\`
   - Loaders: \`.app-spinner\`
   - Overlay Dialog Modals: \`.app-modal-overlay\`, \`.app-modal-container\`

Please inspect the styles, configure Tailwind and the Wails project parameters, and apply this design system systematically across all components!`;

  const blueprintMeta = detail.component_styles?.styles || {};
  const blueprintTitle = blueprintMeta.blueprint_title;
  const blueprintAudience = blueprintMeta.blueprint_audience;
  const blueprintScreenSet = blueprintMeta.blueprint_screen_set;
  const blueprintTargetStack = blueprintMeta.blueprint_target_stack;
  const normalizedBlueprintScreenSet = (blueprintScreenSet || detail.theme.app_type || '').toLowerCase();
  const recommendedStarterTemplate = normalizedBlueprintScreenSet.includes('crm') || normalizedBlueprintScreenSet.includes('booking') || normalizedBlueprintScreenSet.includes('checkout')
    ? 'CRM / Booking / Client Portal starter'
    : normalizedBlueprintScreenSet.includes('present') || normalizedBlueprintScreenSet.includes('briefing') || normalizedBlueprintScreenSet.includes('exports')
      ? 'Presentation / Briefing starter'
      : normalizedBlueprintScreenSet.includes('import') || normalizedBlueprintScreenSet.includes('documents') || normalizedBlueprintScreenSet.includes('audit')
        ? 'Document / Register starter'
        : normalizedBlueprintScreenSet.includes('landing') || normalizedBlueprintScreenSet.includes('onboarding')
          ? 'React + Tailwind app shell'
          : 'Core Wails Business App gold baseline';

  const {
    aiBuilderBrief,
    copyOncePrompt,
    tokenSavingsPrompt,
  } = buildCoreHandoffPrompts({
    detail,
    mode,
    blueprintTitle,
    blueprintAudience,
    blueprintScreenSet,
    blueprintTargetStack,
    recommendedStarterTemplate,
    colors: designColorSummary,
  });

  const designRules = buildDesignRules({ detail, mode, colors: designColorSummary });
  const accessibilityNotes = buildAccessibilityNotes({
    detail,
    textContrast,
    mutedContrast,
    primaryContrast,
  });
  const baselineFrameworkGuide = buildBaselineFrameworkGuide(detail);
  const templateStrategy = buildTemplateStrategy(detail);

  const {
    antigravityWorkflow,
    googleAiStudioPrompt,
    codexPrompt,
    chatGptPrompt,
    claudePrompt,
    geminiPrompt,
    cursorPrompt,
    lovablePrompt,
    boltPrompt,
    v0Prompt,
    replitPrompt,
  } = buildPerToolPrompts({
    detail,
    mode,
    blueprintTitle,
    blueprintAudience,
    blueprintScreenSet,
    blueprintTargetStack,
    recommendedStarterTemplate,
    colors: designColorSummary,
  });

  const {
    reactToggleCode,
    reactEChartsCode,
    goDbCode,
    stackReadmeCode,
  } = buildStackBoilerplates(designColorSummary);
  const getZipFileInput = () => ({
    themeName: detail.theme.name,
    themeCss,
    componentsCss,
    motionCss,
    tailwindConfig,
    tokensJson,
    figmaTokensJson,
    w3cDesignTokensJson,
    styleDictionaryJson,
    echartsThemeJson,
    iconsJson,
    appPreviewHtml,
    aiStyleGuide,
    aiPrompt,
    aiBuilderBrief,
    copyOncePrompt,
    tokenSavingsPrompt,
    iterationNotes: getIterationNotesMarkdown(),
    screenBuildPrompts,
    guardrailsPrompt,
    boilerplateNamingGuide,
    designRules,
    accessibilityNotes,
    baselineFrameworkGuide,
    templateStrategy,
    googleAiStudioPrompt,
    antigravityWorkflow,
    codexPrompt,
    chatGptPrompt,
    claudePrompt,
    geminiPrompt,
    cursorPrompt,
    lovablePrompt,
    boltPrompt,
    v0Prompt,
    replitPrompt,
    reactToggleCode,
    reactEChartsCode,
    goDbCode,
    stackReadmeCode,
  });

  const tabContent = buildExportTabContent({
    themeCss,
    tailwindConfig,
    tokensJson,
    figmaTokensJson,
    w3cDesignTokensJson,
    styleDictionaryJson,
    echartsThemeJson,
    componentsCss,
    motionCss,
    iconsJson,
    aiStyleGuide,
    appPreviewHtml,
    aiPrompt,
    copyOncePrompt,
    tokenSavingsPrompt,
    iterationNotes: getIterationNotesMarkdown(),
    screenBuildPrompts,
    guardrailsPrompt,
    boilerplateNamingGuide,
    aiBuilderBrief,
    designRules,
    accessibilityNotes,
    baselineFrameworkGuide,
    templateStrategy,
    googleAiStudioPrompt,
    antigravityWorkflow,
    codexPrompt,
    chatGptPrompt,
    claudePrompt,
    geminiPrompt,
    cursorPrompt,
    lovablePrompt,
    boltPrompt,
    v0Prompt,
    replitPrompt,
    reactToggleCode,
    reactEChartsCode,
    goDbCode,
    stackReadmeCode,
  });

  const current = tabContent[activeTab];

  const handleCopy = () => {
    if (!current) return;
    navigator.clipboard.writeText(current.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveFile = () => {
    if (!current) return;
    setSaveStatus("Saving...");
    SaveExportFile(current.filename, current.text)
      .then((path) => {
        if (activeTab === 'iteration-notes' && typeof window !== 'undefined') {
          window.localStorage.setItem(iterationSnapshotKey, JSON.stringify(currentIterationSnapshot));
        }
        setSaveStatus(`Saved to ${path.split('\\').pop()}`);
        LogExport(detail.theme.id, activeTab);
        setTimeout(() => setSaveStatus(null), 3000);
      })
      .catch((err) => {
        setSaveStatus(err === "save cancelled" ? null : `Error: ${err}`);
        setTimeout(() => setSaveStatus(null), 3000);
      });
  };

  const handleExportZip = () => {
    setArchiveStatus("Archiving...");
    const files = buildStackZipFiles(getZipFileInput());
    const zipName = `${detail.theme.name.toLowerCase().replace(/\s+/g, '_')}_stack_bundle.zip`;
    SaveExportZip(zipName, files)
      .then((path) => {
        setArchiveStatus("Exported!");
        LogExport(detail.theme.id, "stack-zip");
        setTimeout(() => setArchiveStatus(null), 3000);
      })
      .catch((err) => {
        setArchiveStatus(err === "save cancelled" ? null : `Error: ${err}`);
        setTimeout(() => setArchiveStatus(null), 3000);
      });
  };

  const handleExportAiHandoffZip = () => {
    setHandoffStatus("Packing...");
    const files = buildAiHandoffZipFiles(getZipFileInput());
    const zipName = `${detail.theme.name.toLowerCase().replace(/\s+/g, '_')}_ai_handoff_pack.zip`;
    SaveExportZip(zipName, files)
      .then(() => {
        setHandoffStatus("Exported!");
        LogExport(detail.theme.id, "ai-handoff-zip");
        setTimeout(() => setHandoffStatus(null), 3000);
      })
      .catch((err) => {
        setHandoffStatus(err === "save cancelled" ? null : `Error: ${err}`);
        setTimeout(() => setHandoffStatus(null), 3000);
      });
  };

  const handleExportFullHandoffZip = () => {
    setFullHandoffStatus("Packing...");
    const files = buildFullHandoffZipFiles(getZipFileInput());
    const zipName = `${detail.theme.name.toLowerCase().replace(/\s+/g, '_')}_full_handoff_pack.zip`;
    SaveExportZip(zipName, files)
      .then(() => {
        setFullHandoffStatus("Exported!");
        LogExport(detail.theme.id, "full-handoff-zip");
        setTimeout(() => setFullHandoffStatus(null), 3000);
      })
      .catch((err) => {
        setFullHandoffStatus(err === "save cancelled" ? null : `Error: ${err}`);
        setTimeout(() => setFullHandoffStatus(null), 3000);
      });
  };

  const handleExportStarterTemplatesZip = () => {
    setStarterTemplateStatus("Packing...");
    const files = buildStarterTemplateFiles({
      themeName: detail.theme.name,
      themeCss,
      componentsCss,
      motionCss,
      tailwindConfig,
      tokensJson,
      w3cDesignTokensJson,
      styleDictionaryJson,
      copyOncePrompt,
      tokenSavingsPrompt,
      iterationNotes: getIterationNotesMarkdown(),
      screenBuildPrompts,
      guardrailsPrompt,
      boilerplateNamingGuide,
      designRules,
      accessibilityNotes,
      baselineFrameworkGuide,
      templateStrategy,
    });

    const zipName = `${detail.theme.name.toLowerCase().replace(/\s+/g, '_')}_starter_templates.zip`;
    SaveExportZip(zipName, files)
      .then(() => {
        setStarterTemplateStatus("Exported!");
        LogExport(detail.theme.id, "starter-templates-zip");
        setTimeout(() => setStarterTemplateStatus(null), 3000);
      })
      .catch((err) => {
        setStarterTemplateStatus(err === "save cancelled" ? null : `Error: ${err}`);
        setTimeout(() => setStarterTemplateStatus(null), 3000);
      });
  };

  const exportRecommendations: Array<{
    title: string;
    description: string;
    bestFor: string;
    icon: React.ElementType;
    tab: ExportTabId;
    actionLabel: string;
  }> = [
    {
      title: 'Plan in Google AI Studio',
      description: 'Use this when you want AI to turn the style into a clear app plan, screen list, and build prompt.',
      bestFor: 'Planning',
      icon: Icons.Bot,
      tab: 'google-ai-studio-prompt',
      actionLabel: 'Open prompt',
    },
    {
      title: 'Build in Codex or Antigravity',
      description: 'Use this when you are ready to hand the style system to your coding workflow and start implementing.',
      bestFor: 'Building',
      icon: Icons.TerminalSquare,
      tab: 'antigravity-workflow',
      actionLabel: 'Open workflow',
    },
    {
      title: 'Create reusable templates',
      description: 'Use this when you want starter boilerplates for future apps so you can move faster and spend fewer tokens.',
      bestFor: 'Templates',
      icon: Icons.PackagePlus,
      tab: 'template-strategy',
      actionLabel: 'Open strategy',
    },
    {
      title: 'Send to a developer',
      description: 'Use this when someone else needs the full design system, accessibility notes, rules, tokens, and helper files.',
      bestFor: 'Handoff',
      icon: Icons.FileArchive,
      tab: 'ai-builder-brief',
      actionLabel: 'Open brief',
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0f111a] p-6 text-gray-200">
      <div className="mb-4">
        <h2 className="text-xl font-bold tracking-tight">Export Centre</h2>
        <p className="text-xs text-gray-400">Generate, review, copy or save your style files to your application directory.</p>
      </div>

      <div className="mb-4 rounded-xl border border-[#202538] bg-[#101422] p-4 space-y-3 shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--primary)]">
              <Icons.Compass size={13} />
              Export recommendation
            </div>
            <h3 className="text-sm font-bold text-white mt-1">Which export should I use?</h3>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#1c223c] text-gray-300 font-semibold uppercase shrink-0">
            Non-coder path
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {exportRecommendations.map((recommendation) => {
            const Icon = recommendation.icon;
            const isSelected = activeTab === recommendation.tab;

            return (
              <button
                key={recommendation.title}
                type="button"
                onClick={() => setActiveTab(recommendation.tab)}
                className={`text-left rounded-lg border p-3 transition-all ${
                  isSelected
                    ? 'bg-[#1a1f35] border-[var(--primary)]'
                    : 'bg-[#121625] border-[#202538] hover:bg-[#171c2f] hover:border-[var(--primary)]'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#1a1f35] border border-[#252c47] flex items-center justify-center text-[var(--primary)]">
                    <Icon size={16} />
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    isSelected ? 'bg-[var(--primary)] text-white' : 'bg-[#1c223c] text-gray-300'
                  }`}>
                    {recommendation.bestFor}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white">{recommendation.title}</h4>
                <p className="text-[10px] leading-relaxed text-gray-400 mt-1 min-h-[42px]">{recommendation.description}</p>
                <div className="mt-3 text-[10px] font-bold uppercase tracking-wide text-[var(--primary)] flex items-center gap-1">
                  {recommendation.actionLabel}
                  <Icons.ArrowRight size={11} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 overflow-hidden">
        {/* Left selector */}
        <div className="lg:col-span-1 flex flex-col gap-1.5 overflow-y-auto pr-2">
          <ExportCentreSidebarSection title="Standard Exports" items={standardExportTabs} activeTab={activeTab} onSelect={setActiveTab} />
          <ExportCentreSidebarSection title="AI Handoff Pack" items={aiHandoffTabs} activeTab={activeTab} onSelect={setActiveTab} withDivider />
          <ExportCentreSidebarSection title="Wails Stack Harmony" items={wailsStackTabs} activeTab={activeTab} onSelect={setActiveTab} withDivider />
        </div>

        <ExportCentreCodeViewer value={current.text}>
          <ExportCentreToolbar
            filename={current?.filename}
            activeTab={activeTab}
            copied={copied}
            archiveStatus={archiveStatus}
            handoffStatus={handoffStatus}
            fullHandoffStatus={fullHandoffStatus}
            starterTemplateStatus={starterTemplateStatus}
            saveStatus={saveStatus}
            onExportZip={handleExportZip}
            onExportAiHandoffZip={handleExportAiHandoffZip}
            onExportFullHandoffZip={handleExportFullHandoffZip}
            onExportStarterTemplatesZip={handleExportStarterTemplatesZip}
            onCopy={handleCopy}
            onSaveFile={handleSaveFile}
          />
        </ExportCentreCodeViewer>
      </div>
    </div>
  );
}

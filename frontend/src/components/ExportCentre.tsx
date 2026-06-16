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
import { buildAccessibilityNotes, buildDesignRules } from './exportCentreQualityDocs';
import { buildPerToolPrompts } from './exportCentreToolPrompts';

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
    bgDark: colors['bg-dark']?.hex,
    bg: colors['bg']?.hex,
    bgLight: colors['bg-light']?.hex,
    text: colors['text']?.hex,
    textMuted: colors['text-muted']?.hex,
  };
  const iterationSnapshotKey = `app-style-studio:iteration-snapshot:${detail.theme.id || detail.theme.name}`;
  const createIterationSnapshot = () => ({
    theme: {
      name: detail.theme.name,
      app_type: detail.theme.app_type,
      style_mood: detail.theme.style_mood,
      density: detail.theme.density,
      component_style: detail.theme.component_style,
    },
    colors: Object.fromEntries(Object.entries(colors).map(([key, value]) => [key, value.hex])),
    typography: detail.typography_tokens,
    spacing: detail.spacing_tokens,
    radius: detail.radius_tokens,
    shadows: detail.shadow_tokens,
    motion: detail.motion_tokens,
    icons: detail.icon_settings,
  });
  const flattenSnapshot = (value: any, prefix = ''): Record<string, string> => {
    if (value === null || typeof value !== 'object') {
      return { [prefix]: String(value) };
    }

    return Object.entries(value).reduce((acc, [key, child]) => ({
      ...acc,
      ...flattenSnapshot(child, prefix ? `${prefix}.${key}` : key),
    }), {} as Record<string, string>);
  };
  const getIterationNotesMarkdown = () => {
    const currentSnapshot = createIterationSnapshot();
    const currentFlat = flattenSnapshot(currentSnapshot);
    const previousRaw = typeof window !== 'undefined' ? window.localStorage.getItem(iterationSnapshotKey) : null;
    const previousSnapshot = previousRaw ? JSON.parse(previousRaw) : null;
    const previousFlat = previousSnapshot ? flattenSnapshot(previousSnapshot) : {};
    const changed = Object.entries(currentFlat)
      .filter(([key, value]) => previousFlat[key] !== value)
      .map(([key, value]) => ({ key, before: previousFlat[key] || '(not in previous snapshot)', after: value }));

    return `# Iteration Notes - ${detail.theme.name}

Use this after the first full handoff. Send only these changed values to the AI tool instead of resending the whole design system.

## Snapshot
- Theme: ${detail.theme.name}
- Previous snapshot: ${previousSnapshot ? 'Found in this browser' : 'Not found. This export will become the first local comparison baseline after saving.'}
- Changed token paths: ${changed.length}

## Changed Tokens
${changed.length ? changed.map((item) => `- \`${item.key}\`: \`${item.before}\` -> \`${item.after}\``).join('\n') : '- No token changes detected since the previous local iteration snapshot.'}

## Paste To AI
\`\`\`text
Update the app style using only these changed App Style Studio tokens. Do not redesign or restate the full design system. Keep existing components and screens, apply the token deltas above, run the build, and report changed files plus verification.
\`\`\`

## Snapshot Rule
Saving this file updates the local comparison snapshot for this theme.`;
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
  const blueprintContext = [blueprintTitle, blueprintAudience, blueprintScreenSet, blueprintTargetStack].some(Boolean)
    ? `
## Guided Blueprint Context
- Blueprint: ${blueprintTitle || 'Not specified'}
- Audience: ${blueprintAudience || 'Not specified'}
- First screen pack: ${blueprintScreenSet || 'Not specified'}
- Build target: ${blueprintTargetStack || 'Not specified'}
`
    : '';
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

  const aiBuilderBrief = `# AI Builder Brief - ${detail.theme.name}

Use this brief to build an app with an AI coding tool such as Codex, Antigravity, Cursor, Claude, ChatGPT, Gemini, Lovable, Bolt, v0, or Replit.

## Goal
Build a polished ${detail.theme.app_type} using the design system below. Do not invent a new visual style. Treat these tokens, component rules, and UX constraints as the source of truth.
${blueprintContext}

## App Style
- Theme name: ${detail.theme.name}
- App type: ${detail.theme.app_type}
- Mood: ${detail.theme.style_mood}
- Preferred mode: ${mode}
- Density: ${detail.theme.density}
- Component style: ${detail.theme.component_style}
- Border style: ${detail.theme.border_style}

## Design System Rules
1. Use CSS variables from \`theme.css\` for colors, spacing, radius, shadows, typography, and motion.
2. Use semantic tokens instead of hard-coded colors:
   - Background: \`var(--bg-dark)\`, \`var(--bg)\`, \`var(--bg-light)\`
   - Text: \`var(--text)\`, \`var(--text-muted)\`
   - Borders: \`var(--border)\`, \`var(--border-muted)\`, \`var(--border-highlight)\`
   - Actions: \`var(--primary)\`, \`var(--primary-hover)\`, \`var(--primary-muted)\`, \`var(--secondary)\`
   - Alerts: \`var(--danger)\`, \`var(--warning)\`, \`var(--success)\`, \`var(--info)\`
3. Cards and panels should use \`var(--bg-light)\`, \`var(--border)\`, \`var(--radius-lg)\`, \`var(--card-padding)\`, and \`var(--shadow-card)\`.
4. Buttons should use the exported component classes or the same token structure:
   - Primary: \`bg-[var(--primary)]\`, white text, \`var(--radius-sm)\`, \`var(--shadow-button)\`
   - Secondary: \`var(--bg-light)\`, \`var(--border)\`, \`var(--text)\`
5. Forms, tables, modals, alerts, nav items, badges, and loading states should reuse classes from \`components.css\`.
6. Keep the UI consistent across loading, empty, error, disabled, hover, focus, and selected states.
7. Preserve accessibility: visible focus states, readable text, and clear alert colors.

## Token Summary
### Colors
- Primary: ${colors['primary']?.hex}
- Primary hover: ${colors['primary-hover']?.hex}
- Secondary: ${colors['secondary']?.hex}
- Background dark: ${colors['bg-dark']?.hex}
- Background: ${colors['bg']?.hex}
- Surface: ${colors['bg-light']?.hex}
- Text: ${colors['text']?.hex}
- Muted text: ${colors['text-muted']?.hex}
- Border: ${colors['border']?.hex}
- Success: ${colors['success']?.hex}
- Warning: ${colors['warning']?.hex}
- Danger: ${colors['danger']?.hex}
- Info: ${colors['info']?.hex}

### Typography
- Heading font: ${detail.typography_tokens.heading_font}
- Body font: ${detail.typography_tokens.body_font}
- Mono font: ${detail.typography_tokens.mono_font}
- Base size: ${detail.typography_tokens.base_font_size}px

### Layout
- Page padding: ${detail.spacing_tokens.page_padding}
- Card padding: ${detail.spacing_tokens.card_padding}
- Form gap: ${detail.spacing_tokens.form_gap}
- Table cell padding: ${detail.spacing_tokens.table_cell_padding}
- Dashboard grid gap: ${detail.spacing_tokens.dashboard_grid_gap}
- Sidebar width: ${detail.spacing_tokens.sidebar_width}

### Shape and Depth
- Radius sm: ${detail.radius_tokens.sm}
- Radius md: ${detail.radius_tokens.md}
- Radius lg: ${detail.radius_tokens.lg}
- Radius xl: ${detail.radius_tokens.xl}
- Card shadow: ${detail.shadow_tokens.card}
- Modal shadow: ${detail.shadow_tokens.modal}
- Button shadow: ${detail.shadow_tokens.button}

### Motion
- Fast: ${detail.motion_tokens.duration_fast}
- Normal: ${detail.motion_tokens.duration_normal}
- Slow: ${detail.motion_tokens.duration_slow}
- Standard ease: ${detail.motion_tokens.ease_standard}

## Recommended Screens
Build the app shell with these screens first:
- Dashboard overview
- Data table/list page
- Create/edit form
- Detail/report page
- Settings page
- Login/auth screen if relevant
- Empty, loading, error, success, and warning states

## Implementation Instructions
1. Install or create a React + TypeScript + Tailwind project unless the user provides another stack.
2. Add \`theme.css\` and \`components.css\` to the app.
3. Configure Tailwind using the exported \`tailwind.config.ts\`.
4. Build reusable components first: Button, Card, Input, Select, Table, Modal, Badge, Alert, Sidebar, Topbar.
5. Compose screens from those components.
6. Do not change the design system unless the user explicitly asks.

## Token-Saving Prompt
Build a ${detail.theme.app_type} using the attached App Style Studio design system. Use \`theme.css\`, \`components.css\`, and the exported Tailwind config as source of truth. Do not invent new colors, spacing, radii, shadows, or typography. Create reusable components and screens that match the brief above.`;

  const copyOncePrompt = `# Copy Once Prompt - ${detail.theme.name}

You are building a polished app from an App Style Studio export. Use this prompt as the compact source of truth and avoid asking for repeated visual polish instructions.

## Build Target
- App: ${detail.theme.app_type}
- Style: ${detail.theme.style_mood}
- Mode: ${mode}
- Density: ${detail.theme.density}
- Component style: ${detail.theme.component_style}
- Blueprint: ${blueprintTitle || 'Not specified'}
- Audience: ${blueprintAudience || 'Not specified'}
- Screen pack: ${blueprintScreenSet || 'Dashboard + register + reports'}
- Target stack: ${blueprintTargetStack || 'Not specified'}
- Recommended starter: ${recommendedStarterTemplate}

## Baseline Rule
If building an offline Wails desktop app, use \`C:\\Users\\Home\\Desktop\\Test Framework\` as the baseline architecture. Preserve its SQLite, migrations, AppShell, settings, preferences, audit, backup, health checks, table controls, scale controls, density controls, and report/export patterns.

## Required Files
Use these exported files as source of truth:
- \`theme.css\`
- \`components.css\`
- \`tailwind.config.ts\`
- \`AI_BUILDER_BRIEF.md\`
- \`DESIGN_RULES.md\`
- \`ACCESSIBILITY_NOTES.md\`
- \`BASELINE_FRAMEWORK_GUIDE.md\`
- \`TEMPLATE_STRATEGY.md\`

## Non-Negotiable Design Rules
- Do not invent new colors, spacing, radius, shadows, typography, or motion.
- Use CSS variables such as \`var(--primary)\`, \`var(--bg-light)\`, \`var(--text)\`, \`var(--border)\`, \`var(--radius-lg)\`, \`var(--card-padding)\`, and \`var(--shadow-card)\`.
- Use \`components.css\` classes for buttons, cards, inputs, selects, tables, badges, nav items, modals, alerts, and loaders.
- Include loading, empty, error, success, warning, disabled, hover, focus, selected, and destructive states.
- Keep visible focus styles and readable contrast.
- Build reusable primitives before screens: AppShell, Sidebar, Topbar, Button, Card, Input, Select, Table, Modal, Badge, Alert, Tabs, Toast, FileUpload, DatePicker shell, SettingsRow.

## Token Summary
- Primary: ${colors['primary']?.hex}
- Primary hover: ${colors['primary-hover']?.hex}
- Background dark: ${colors['bg-dark']?.hex}
- Background: ${colors['bg']?.hex}
- Surface: ${colors['bg-light']?.hex}
- Text: ${colors['text']?.hex}
- Muted text: ${colors['text-muted']?.hex}
- Border: ${colors['border']?.hex}
- Success: ${colors['success']?.hex}
- Warning: ${colors['warning']?.hex}
- Danger: ${colors['danger']?.hex}
- Info: ${colors['info']?.hex}
- Heading font: ${detail.typography_tokens.heading_font}
- Body font: ${detail.typography_tokens.body_font}
- Page padding: ${detail.spacing_tokens.page_padding}
- Card padding: ${detail.spacing_tokens.card_padding}
- Table padding: ${detail.spacing_tokens.table_cell_padding}
- Radius: ${detail.radius_tokens.sm}, ${detail.radius_tokens.md}, ${detail.radius_tokens.lg}, ${detail.radius_tokens.xl}
- Shadows: card \`${detail.shadow_tokens.card}\`, modal \`${detail.shadow_tokens.modal}\`, button \`${detail.shadow_tokens.button}\`

## First Build Sequence
1. Wire in \`theme.css\`, \`components.css\`, and Tailwind mappings.
2. Create/reuse the component primitives listed above.
3. Build the recommended screen pack first.
4. Verify responsive desktop/tablet/mobile layout and all UI states.
5. Run the project build and report changed files, checks, and remaining gaps.

Do not redesign. Implement the app using this system.`;

  const tokenSavingsPrompt = `# Token Savings Mode - ${detail.theme.name}

Paste this once into an AI coding tool with the exported files. Keep future prompts short.

\`\`\`text
Read these files once and use them as source of truth: theme.css, components.css, tailwind.config.ts, COPY_ONCE_PROMPT.md, DESIGN_RULES.md, ACCESSIBILITY_NOTES.md, BASELINE_FRAMEWORK_GUIDE.md.

Build target: ${detail.theme.app_type}. Blueprint: ${blueprintTitle || 'not specified'}. Screen pack: ${blueprintScreenSet || 'dashboard/register/reports'}. Stack: ${blueprintTargetStack || 'not specified'}.

Design tokens: primary ${colors['primary']?.hex}, bg ${colors['bg-dark']?.hex}/${colors['bg']?.hex}/${colors['bg-light']?.hex}, text ${colors['text']?.hex}/${colors['text-muted']?.hex}, border ${colors['border']?.hex}, font ${detail.typography_tokens.heading_font}/${detail.typography_tokens.body_font}, padding page ${detail.spacing_tokens.page_padding}, card ${detail.spacing_tokens.card_padding}, table ${detail.spacing_tokens.table_cell_padding}, radius ${detail.radius_tokens.sm}/${detail.radius_tokens.md}/${detail.radius_tokens.lg}/${detail.radius_tokens.xl}.

Rules: do not invent new colors, fonts, spacing, radius, shadows, or motion. Use CSS variables and components.css classes. Include loading, empty, error, success, warning, disabled, hover, focus, selected, and destructive states. Build reusable components before screens. If Wails desktop, use C:\\Users\\Home\\Desktop\\Test Framework as baseline and preserve SQLite, migrations, AppShell, settings, audit, backup, health, table controls, scale/density controls, and report exports.

When responding, avoid restating the design system. Give only changed files, commands run, build result, and remaining gaps.
\`\`\``;

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

  // 12. HARMONIZED STACK BOILERPLATES
  const reactToggleCode = `import React, { useEffect, useState } from 'react';
import * as Icons from 'lucide-react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const isDarkClass = document.documentElement.classList.contains('dark');
    const localSetting = localStorage.getItem('theme-mode');
    
    if (localSetting) {
      const wantDark = localSetting === 'dark';
      setIsDark(wantDark);
      if (wantDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      setIsDark(isDarkClass);
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme-mode', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme-mode', 'light');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-[var(--bg-light)] border border-[var(--border)] text-[var(--text)] hover:border-[var(--primary)] transition-all active:scale-95 flex items-center justify-center cursor-pointer"
      aria-label="Toggle theme mode"
    >
      {isDark ? (
        <Icons.Sun size={18} className="text-[var(--primary)]" />
      ) : (
        <Icons.Moon size={18} className="text-[var(--secondary)]" />
      )}
    </button>
  );
}`;

  const reactEChartsCode = `import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface EChartsWrapperProps {
  options: echarts.EChartsOption;
  style?: React.CSSProperties;
  className?: string;
}

export function EChartsWrapper({ options, style, className }: EChartsWrapperProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const themeName = 'app_style_studio_theme';
    echarts.registerTheme(themeName, {
      color: [
        '${colors['primary']?.hex || '#7c66dc'}', 
        '${colors['secondary']?.hex || '#dc66c5'}', 
        '${colors['success']?.hex || '#5bea87'}', 
        '${colors['info']?.hex || '#5bcaea'}', 
        '${colors['warning']?.hex || '#eaab5b'}', 
        '${colors['danger']?.hex || '#ea5b5b'}'
      ],
      backgroundColor: 'transparent',
      textStyle: {
        fontFamily: 'var(--font-body)',
        color: 'var(--text)'
      },
      title: {
        textStyle: {
          fontFamily: 'var(--font-heading)',
          color: 'var(--text)'
        }
      },
      line: {
        smooth: true,
        lineStyle: { width: 3 }
      },
      categoryAxis: {
        axisLine: { lineStyle: { color: 'var(--border)' } },
        axisLabel: { color: 'var(--text-muted)' },
        splitLine: { show: false }
      },
      valueAxis: {
        axisLine: { show: false },
        splitLine: { lineStyle: { color: 'var(--border-muted)', type: 'dashed' } },
        axisLabel: { color: 'var(--text-muted)' }
      }
    });

    const chart = echarts.init(chartRef.current, themeName);
    chartInstance.current = chart;
    chart.setOption(options);

    const observer = new MutationObserver(() => {
      chart.dispose();
      const newChart = echarts.init(chartRef.current!, themeName);
      chartInstance.current = newChart;
      newChart.setOption(options);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    const handleResize = () => {
      chartInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      chart.dispose();
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [options]);

  return (
    <div 
      ref={chartRef} 
      style={{ width: '100%', height: '350px', ...style }} 
      className={className} 
    />
  );
}`;

  const goDbCode = `package database

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	_ "modernc.org/sqlite"
)

type ThemePreferences struct {
	ID        int64  \`json:"id"\`
	ThemeName string \`json:"theme_name"\`
	TokenData string \`json:"token_data"\`
	UpdatedAt string \`json:"updated_at"\`
}

type DBStore struct {
	db *sql.DB
}

func NewDBStore(dbName string) (*DBStore, error) {
	exePath, err := os.Executable()
	var dbDir string
	if err != nil {
		dbDir = "."
	} else {
		dbDir = filepath.Dir(exePath)
	}

	dbPath := filepath.Join(dbDir, dbName)
	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open sqlite database: %w", err)
	}

	store := &DBStore{db: db}
	if err := store.migrate(); err != nil {
		db.Close()
		return nil, err
	}

	return store, nil
}

func (s *DBStore) Close() {
	if s.db != nil {
		s.db.Close()
	}
}

func (s *DBStore) migrate() error {
	query := \`
	CREATE TABLE IF NOT EXISTS theme_preferences (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		theme_name TEXT NOT NULL,
		token_data TEXT NOT NULL,
		updated_at TEXT NOT NULL
	);\`
	_, err := s.db.Exec(query)
	if err != nil {
		return fmt.Errorf("failed to run database migration: %w", err)
	}
	return nil
}

func (s *DBStore) GetPreferences() (*ThemePreferences, error) {
	query := \`SELECT id, theme_name, token_data, updated_at FROM theme_preferences ORDER BY id DESC LIMIT 1\`
	var prefs ThemePreferences
	err := s.db.QueryRow(query).Scan(&prefs.ID, &prefs.ThemeName, &prefs.TokenData, &prefs.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &prefs, nil
}

func (s *DBStore) SavePreferences(themeName string, tokenData interface{}, timestamp string) error {
	jsonData, err := json.Marshal(tokenData)
	if err != nil {
		return fmt.Errorf("failed to marshal token data: %w", err)
	}

	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, _ = tx.Exec(\`DELETE FROM theme_preferences\`)
	_, err = tx.Exec(
		\`INSERT INTO theme_preferences (theme_name, token_data, updated_at) VALUES (?, ?, ?)\`,
		themeName, string(jsonData), timestamp,
	)
	if err != nil {
		return err
	}

	return tx.Commit()
}`;

  const stackReadmeCode = `# App Style Studio - Stack Harmony Bundle

This bundle contains styling files, config setups, and boilerplate files customized for your stack: **React (TS) + Wails + Tailwind + SQLite + ECharts**.

## Folder Contents
- \`styles/theme.css\`: Custom CSS properties for your design palette. Copy this to your CSS folder and import it in \`main.tsx\` or \`index.html\`.
- \`styles/components.css\`: Premium component styles (buttons, card layout, inputs, tables) utilizing the CSS variables.
- \`config/tailwind.config.ts\`: Tailwind settings showing color, border radius, and font-family extensions. Merge these definitions with your current Tailwind config.
- \`components/ThemeToggle.tsx\`: A pre-styled, interactive light/dark mode switch. Place it in your navbar.
- \`components/EChartsWrapper.tsx\`: A React component wrapping ECharts. It registers your color tokens and dynamically updates whenever the theme switches between light and dark mode.
- \`database/theme_store.go\`: A Go SQLite manager for Wails showing how to serialize and persist styling configurations or other app records inside SQLite.

## Quick Integration Steps
1. **Fonts**: Add google font loading in your HTML index file:
   \`<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">\`
2. **Styles**: Import \`theme.css\` and \`components.css\` in your React entry file (e.g. \`main.tsx\`):
   \`\`\`typescript
   import './styles/theme.css';
   import './styles/components.css';
   \`\`\`
3. **Tailwind Config**: Extend your \`tailwind.config\` to use the CSS variable mappings so classes like \`bg-bg\`, \`text-primary\`, and \`border-border\` function out of the box.
4. **Theme Toggle**: Render the \`<ThemeToggle />\` component in your sidebar or header.
5. **Charts**: Wrap your charts inside the \`<EChartsWrapper options={myOptions} />\` to automatically style charts to match the layout.

*Generated with love by App Style Studio.*`;

  // Map tabs to content & suggested filenames
  const getTabContent = () => {
    switch (activeTab) {
      case 'theme-css': return { text: themeCss, filename: 'theme.css' };
      case 'tailwind': return { text: tailwindConfig, filename: 'tailwind.config.ts' };
      case 'json': return { text: tokensJson, filename: 'style-tokens.json' };
      case 'figma-tokens': return { text: figmaTokensJson, filename: 'figma-tokens.json' };
      case 'w3c-tokens': return { text: w3cDesignTokensJson, filename: 'w3c-design-tokens.json' };
      case 'style-dictionary': return { text: styleDictionaryJson, filename: 'style-dictionary-tokens.json' };
      case 'echarts-theme': return { text: echartsThemeJson, filename: 'echarts-theme.json' };
      case 'components': return { text: componentsCss, filename: 'components.css' };
      case 'motion': return { text: motionCss, filename: 'motion.css' };
      case 'icons': return { text: iconsJson, filename: 'icons.json' };
      case 'guide': return { text: aiStyleGuide, filename: 'ai-style-guide.md' };
      case 'preview': return { text: appPreviewHtml, filename: 'app-preview.html' };
      case 'ai-prompt': return { text: aiPrompt, filename: 'ai-prompt.txt' };
      case 'copy-once-prompt': return { text: copyOncePrompt, filename: 'COPY_ONCE_PROMPT.md' };
      case 'token-savings-prompt': return { text: tokenSavingsPrompt, filename: 'TOKEN_SAVINGS_PROMPT.md' };
      case 'iteration-notes': return { text: getIterationNotesMarkdown(), filename: 'ITERATION_NOTES.md' };
      case 'screen-build-prompts': return { text: screenBuildPrompts, filename: 'SCREEN_BUILD_PROMPTS.md' };
      case 'guardrails': return { text: guardrailsPrompt, filename: 'DO_NOT_CHANGE_GUARDRAILS.md' };
      case 'boilerplate-naming-guide': return { text: boilerplateNamingGuide, filename: 'BOILERPLATE_NAMING_GUIDE.md' };
      case 'ai-builder-brief': return { text: aiBuilderBrief, filename: 'AI_BUILDER_BRIEF.md' };
      case 'design-rules': return { text: designRules, filename: 'DESIGN_RULES.md' };
      case 'accessibility-notes': return { text: accessibilityNotes, filename: 'ACCESSIBILITY_NOTES.md' };
      case 'baseline-framework-guide': return { text: baselineFrameworkGuide, filename: 'BASELINE_FRAMEWORK_GUIDE.md' };
      case 'template-strategy': return { text: templateStrategy, filename: 'TEMPLATE_STRATEGY.md' };
      case 'google-ai-studio-prompt': return { text: googleAiStudioPrompt, filename: 'GOOGLE_AI_STUDIO_PROMPT.md' };
      case 'antigravity-workflow': return { text: antigravityWorkflow, filename: 'ANTIGRAVITY_WORKFLOW.md' };
      case 'codex-prompt': return { text: codexPrompt, filename: 'CODEX_PROMPT.md' };
      case 'chatgpt-prompt': return { text: chatGptPrompt, filename: 'CHATGPT_PROMPT.md' };
      case 'claude-prompt': return { text: claudePrompt, filename: 'CLAUDE_PROMPT.md' };
      case 'gemini-prompt': return { text: geminiPrompt, filename: 'GEMINI_PROMPT.md' };
      case 'cursor-prompt': return { text: cursorPrompt, filename: 'CURSOR_PROMPT.md' };
      case 'lovable-prompt': return { text: lovablePrompt, filename: 'LOVABLE_PROMPT.md' };
      case 'bolt-prompt': return { text: boltPrompt, filename: 'BOLT_PROMPT.md' };
      case 'v0-prompt': return { text: v0Prompt, filename: 'V0_PROMPT.md' };
      case 'replit-prompt': return { text: replitPrompt, filename: 'REPLIT_PROMPT.md' };
      case 'react-toggle': return { text: reactToggleCode, filename: 'ThemeToggle.tsx' };
      case 'react-echarts': return { text: reactEChartsCode, filename: 'EChartsWrapper.tsx' };
      case 'go-db': return { text: goDbCode, filename: 'theme_store.go' };
      case 'stack-readme': return { text: stackReadmeCode, filename: 'README.md' };
    }
  };

  const current = getTabContent();

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
          window.localStorage.setItem(iterationSnapshotKey, JSON.stringify(createIterationSnapshot()));
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
    const files = {
      "styles/theme.css": themeCss,
      "styles/components.css": componentsCss,
      "config/tailwind.config.ts": tailwindConfig,
      "components/ThemeToggle.tsx": reactToggleCode,
      "components/EChartsWrapper.tsx": reactEChartsCode,
      "database/theme_store.go": goDbCode,
      "handoff/AI_BUILDER_BRIEF.md": aiBuilderBrief,
      "handoff/COPY_ONCE_PROMPT.md": copyOncePrompt,
      "handoff/TOKEN_SAVINGS_PROMPT.md": tokenSavingsPrompt,
      "handoff/ITERATION_NOTES.md": getIterationNotesMarkdown(),
      "handoff/SCREEN_BUILD_PROMPTS.md": screenBuildPrompts,
      "handoff/DO_NOT_CHANGE_GUARDRAILS.md": guardrailsPrompt,
      "handoff/BOILERPLATE_NAMING_GUIDE.md": boilerplateNamingGuide,
      "handoff/DESIGN_RULES.md": designRules,
      "handoff/ACCESSIBILITY_NOTES.md": accessibilityNotes,
      "handoff/BASELINE_FRAMEWORK_GUIDE.md": baselineFrameworkGuide,
      "handoff/TEMPLATE_STRATEGY.md": templateStrategy,
      "handoff/GOOGLE_AI_STUDIO_PROMPT.md": googleAiStudioPrompt,
      "handoff/ANTIGRAVITY_WORKFLOW.md": antigravityWorkflow,
      "handoff/CODEX_PROMPT.md": codexPrompt,
      "handoff/CHATGPT_PROMPT.md": chatGptPrompt,
      "handoff/CLAUDE_PROMPT.md": claudePrompt,
      "handoff/GEMINI_PROMPT.md": geminiPrompt,
      "handoff/CURSOR_PROMPT.md": cursorPrompt,
      "handoff/LOVABLE_PROMPT.md": lovablePrompt,
      "handoff/BOLT_PROMPT.md": boltPrompt,
      "handoff/V0_PROMPT.md": v0Prompt,
      "handoff/REPLIT_PROMPT.md": replitPrompt,
      "handoff/ai-prompt.txt": aiPrompt,
      "README.md": stackReadmeCode,
    };
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
    const files = {
      "handoff/AI_BUILDER_BRIEF.md": aiBuilderBrief,
      "handoff/COPY_ONCE_PROMPT.md": copyOncePrompt,
      "handoff/TOKEN_SAVINGS_PROMPT.md": tokenSavingsPrompt,
      "handoff/ITERATION_NOTES.md": getIterationNotesMarkdown(),
      "handoff/SCREEN_BUILD_PROMPTS.md": screenBuildPrompts,
      "handoff/DO_NOT_CHANGE_GUARDRAILS.md": guardrailsPrompt,
      "handoff/BOILERPLATE_NAMING_GUIDE.md": boilerplateNamingGuide,
      "handoff/DESIGN_RULES.md": designRules,
      "handoff/ACCESSIBILITY_NOTES.md": accessibilityNotes,
      "handoff/BASELINE_FRAMEWORK_GUIDE.md": baselineFrameworkGuide,
      "handoff/TEMPLATE_STRATEGY.md": templateStrategy,
      "handoff/GOOGLE_AI_STUDIO_PROMPT.md": googleAiStudioPrompt,
      "handoff/ANTIGRAVITY_WORKFLOW.md": antigravityWorkflow,
      "handoff/CODEX_PROMPT.md": codexPrompt,
      "handoff/CHATGPT_PROMPT.md": chatGptPrompt,
      "handoff/CLAUDE_PROMPT.md": claudePrompt,
      "handoff/GEMINI_PROMPT.md": geminiPrompt,
      "handoff/CURSOR_PROMPT.md": cursorPrompt,
      "handoff/LOVABLE_PROMPT.md": lovablePrompt,
      "handoff/BOLT_PROMPT.md": boltPrompt,
      "handoff/V0_PROMPT.md": v0Prompt,
      "handoff/REPLIT_PROMPT.md": replitPrompt,
      "handoff/ai-prompt.txt": aiPrompt,
      "styles/theme.css": themeCss,
      "styles/components.css": componentsCss,
      "styles/motion.css": motionCss,
      "config/tailwind.config.ts": tailwindConfig,
      "tokens/style-tokens.json": tokensJson,
      "tokens/figma-tokens.json": figmaTokensJson,
      "tokens/w3c-design-tokens.json": w3cDesignTokensJson,
      "tokens/style-dictionary-tokens.json": styleDictionaryJson,
      "README.md": `# ${detail.theme.name} - AI Handoff Pack

This offline handoff pack was generated by App Style Studio.

## Recommended Workflow
1. Review \`handoff/AI_BUILDER_BRIEF.md\`.
2. Use \`handoff/COPY_ONCE_PROMPT.md\` when you need the shortest high-signal prompt for token-saving AI work.
3. Review \`handoff/BASELINE_FRAMEWORK_GUIDE.md\` if you are building from the user's Test Framework baseline.
4. Review \`handoff/TEMPLATE_STRATEGY.md\` to keep the gold baseline first and variants second.
5. Use \`handoff/GOOGLE_AI_STUDIO_PROMPT.md\` to generate or refine starter templates.
6. Use the relevant per-tool prompt for ChatGPT, Claude, Gemini, Cursor, Lovable, Bolt, v0, Replit, Antigravity, or Codex.
7. Keep \`handoff/DO_NOT_CHANGE_GUARDRAILS.md\`, \`handoff/BOILERPLATE_NAMING_GUIDE.md\`, \`handoff/DESIGN_RULES.md\`, and \`handoff/ACCESSIBILITY_NOTES.md\` attached so the AI tool does not drift from the design system, file structure, or accessibility requirements.

## Core Files
- \`styles/theme.css\`
- \`styles/components.css\`
- \`config/tailwind.config.ts\`
- \`tokens/style-tokens.json\`
- \`tokens/w3c-design-tokens.json\`
- \`tokens/style-dictionary-tokens.json\`
`,
    };
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
    const files = {
      "README.md": `# ${detail.theme.name} - Full App Style Studio Handoff

This complete handoff pack includes every export needed for deeper implementation, template creation, and AI-assisted app building.

## Recommended Workflow
1. Start with \`handoff/COPY_ONCE_PROMPT.md\` when you want the shortest token-saving prompt.
2. Use \`handoff/AI_BUILDER_BRIEF.md\`, \`handoff/DESIGN_RULES.md\`, and \`handoff/ACCESSIBILITY_NOTES.md\` for complete build guidance.
3. Use \`handoff/BASELINE_FRAMEWORK_GUIDE.md\` if building from \`C:\\Users\\Home\\Desktop\\Test Framework\`.
4. Use \`handoff/TEMPLATE_STRATEGY.md\` to keep the gold baseline first and variants second.
5. Pick the relevant file in \`tool-prompts/\` for your AI tool.
6. Apply \`styles/theme.css\`, \`styles/components.css\`, \`styles/motion.css\`, and \`config/tailwind.config.ts\` before building screens.

## Folder Map
- \`styles/\`: CSS variables, component classes, and motion rules.
- \`config/\`: Tailwind token mapping.
- \`tokens/\`: JSON exports for tools and future imports.
- \`handoff/\`: Core AI handoff documents and guardrails.
- \`tool-prompts/\`: Prompt presets for specific AI builders.
- \`components/\`: Example React helper components.
- \`database/\`: Example Wails/SQLite helper.
- \`previews/\`: Standalone HTML preview.

## Quality Bar
Do not redesign the theme. Build with exported tokens, preserve accessibility states, verify desktop/tablet/mobile layouts, and run the project build before handoff.
`,
      "styles/theme.css": themeCss,
      "styles/components.css": componentsCss,
      "styles/motion.css": motionCss,
      "config/tailwind.config.ts": tailwindConfig,
      "tokens/style-tokens.json": tokensJson,
      "tokens/figma-tokens.json": figmaTokensJson,
      "tokens/w3c-design-tokens.json": w3cDesignTokensJson,
      "tokens/style-dictionary-tokens.json": styleDictionaryJson,
      "tokens/echarts-theme.json": echartsThemeJson,
      "tokens/icons.json": iconsJson,
      "previews/app-preview.html": appPreviewHtml,
      "handoff/AI_BUILDER_BRIEF.md": aiBuilderBrief,
      "handoff/COPY_ONCE_PROMPT.md": copyOncePrompt,
      "handoff/TOKEN_SAVINGS_PROMPT.md": tokenSavingsPrompt,
      "handoff/ITERATION_NOTES.md": getIterationNotesMarkdown(),
      "handoff/SCREEN_BUILD_PROMPTS.md": screenBuildPrompts,
      "handoff/DO_NOT_CHANGE_GUARDRAILS.md": guardrailsPrompt,
      "handoff/BOILERPLATE_NAMING_GUIDE.md": boilerplateNamingGuide,
      "handoff/DESIGN_RULES.md": designRules,
      "handoff/ACCESSIBILITY_NOTES.md": accessibilityNotes,
      "handoff/BASELINE_FRAMEWORK_GUIDE.md": baselineFrameworkGuide,
      "handoff/TEMPLATE_STRATEGY.md": templateStrategy,
      "handoff/AI_STYLE_GUIDE.md": aiStyleGuide,
      "handoff/ai-prompt.txt": aiPrompt,
      "tool-prompts/GOOGLE_AI_STUDIO_PROMPT.md": googleAiStudioPrompt,
      "tool-prompts/ANTIGRAVITY_WORKFLOW.md": antigravityWorkflow,
      "tool-prompts/CODEX_PROMPT.md": codexPrompt,
      "tool-prompts/CHATGPT_PROMPT.md": chatGptPrompt,
      "tool-prompts/CLAUDE_PROMPT.md": claudePrompt,
      "tool-prompts/GEMINI_PROMPT.md": geminiPrompt,
      "tool-prompts/CURSOR_PROMPT.md": cursorPrompt,
      "tool-prompts/LOVABLE_PROMPT.md": lovablePrompt,
      "tool-prompts/BOLT_PROMPT.md": boltPrompt,
      "tool-prompts/V0_PROMPT.md": v0Prompt,
      "tool-prompts/REPLIT_PROMPT.md": replitPrompt,
      "components/ThemeToggle.tsx": reactToggleCode,
      "components/EChartsWrapper.tsx": reactEChartsCode,
      "database/theme_store.go": goDbCode,
      "stack/README.md": stackReadmeCode,
    };
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
    const starterTemplates = [
      {
        id: 'core-wails-business-app',
        title: 'Core Wails Business App',
        baseline: 'Use C:\\Users\\Home\\Desktop\\Test Framework as the gold baseline architecture.',
        screens: ['Dashboard', 'Operations Register', 'Reports', 'Administration Console', 'Settings', 'Complete UI states'],
        components: ['AppShell', 'Sidebar', 'Topbar', 'DataTable', 'ReportBuilder', 'SettingsRows', 'HealthBadges'],
        prompt: 'Create the gold offline Wails + React + SQLite business app baseline. Preserve migrations, settings, preferences, audit logging, backup/restore, health checks, scale controls, density controls, table controls, report exports, and AppShell conventions.',
      },
      {
        id: 'react-tailwind-app-shell',
        title: 'React + Tailwind App Shell',
        baseline: 'Use a clean React + TypeScript + Tailwind structure for web-first prototypes.',
        screens: ['Landing or login', 'Dashboard shell', 'List view', 'Form view', 'Settings', 'Responsive states'],
        components: ['AppShell', 'ResponsiveSidebar', 'Topbar', 'Button', 'Card', 'Input', 'Tabs', 'Toast'],
        prompt: 'Create a web app shell using the exported theme.css, components.css, and Tailwind token mappings. Prioritize responsive layout, reusable primitives, and clean AI-readable file structure.',
      },
      {
        id: 'admin-dashboard',
        title: 'Admin Dashboard Template',
        baseline: 'Use the Core Wails Business App baseline or React shell depending on target stack.',
        screens: ['Overview dashboard', 'Metrics grid', 'Charts', 'Filtered table', 'Alerts', 'Settings'],
        components: ['StatCards', 'ChartPanel', 'FilterBar', 'DataTable', 'AlertList', 'ExportActions'],
        prompt: 'Create an operational dashboard template with metrics, charts, filters, tables, status badges, empty/loading/error states, and export-ready reports.',
      },
      {
        id: 'document-register',
        title: 'Document / Register Template',
        baseline: 'Use Test Framework patterns and borrow mature document workflow ideas from SAAF Contract Manager only as reference.',
        screens: ['Register table', 'Document detail', 'Import review', 'Audit history', 'Reports', 'Missing documents'],
        components: ['RegisterTable', 'DocumentVault', 'ImportReviewPanel', 'AuditTimeline', 'ReportBuilder', 'FileUpload'],
        prompt: 'Create a document/register starter for records, documents, imports, audit history, filters, column controls, and Excel/PDF/Word exports.',
      },
      {
        id: 'presentation-briefing',
        title: 'Presentation / Briefing Template',
        baseline: 'Use the Wails desktop baseline and SAAF Contract Manager as a mature reference for present mode patterns.',
        screens: ['Briefing overview', 'Slide picker', 'Fullscreen present mode', 'Agenda rail', 'Export briefing', 'Settings'],
        components: ['BriefingSlide', 'SlideNavigator', 'PresentModeShell', 'AgendaRail', 'ExportPanel', 'DensityZoomControls'],
        prompt: 'Create a presentation/briefing starter with fullscreen present mode, slide navigation, briefing details, density/zoom controls, and PowerPoint/export workflow guidance.',
      },
      {
        id: 'crm-booking-client-portal',
        title: 'CRM / Booking / Client Portal Template',
        baseline: 'Use the React shell or Wails baseline depending on whether the app is client-facing or offline desktop.',
        screens: ['Client dashboard', 'CRM detail', 'Booking form', 'Profile', 'Tasks/notes', 'Client documents'],
        components: ['ClientCard', 'BookingFlow', 'CRMDetailTabs', 'TaskList', 'NotesPanel', 'DocumentList'],
        prompt: 'Create a CRM/booking/client portal starter with customer records, appointment or booking flow, profile/detail screens, notes, tasks, documents, and clear client-facing states.',
      },
    ];

    const files: Record<string, string> = {
      "README.md": `# ${detail.theme.name} - Starter Template Pack

This pack contains focused starter-template instructions generated from App Style Studio.

## How To Use
1. Pick one folder under \`templates/\`.
2. Open its \`BUILD_PROMPT.md\` in your AI coding tool.
3. Attach or copy the shared files under \`shared/\`.
4. Build the chosen template first, then create variants from that baseline.

## Shared Design Source
- \`shared/styles/theme.css\`
- \`shared/styles/components.css\`
- \`shared/config/tailwind.config.ts\`
- \`shared/handoff/COPY_ONCE_PROMPT.md\`
- \`shared/handoff/DO_NOT_CHANGE_GUARDRAILS.md\`
- \`shared/handoff/BOILERPLATE_NAMING_GUIDE.md\`
- \`shared/handoff/DESIGN_RULES.md\`
- \`shared/handoff/BASELINE_FRAMEWORK_GUIDE.md\`
- \`shared/handoff/TEMPLATE_STRATEGY.md\`

## Recommended Order
1. Core Wails Business App
2. Admin Dashboard
3. Document / Register
4. Presentation / Briefing
5. CRM / Booking / Client Portal
6. React + Tailwind App Shell for web-first variants
`,
      "shared/styles/theme.css": themeCss,
      "shared/styles/components.css": componentsCss,
      "shared/styles/motion.css": motionCss,
      "shared/config/tailwind.config.ts": tailwindConfig,
      "shared/tokens/style-tokens.json": tokensJson,
      "shared/tokens/w3c-design-tokens.json": w3cDesignTokensJson,
      "shared/tokens/style-dictionary-tokens.json": styleDictionaryJson,
      "shared/handoff/COPY_ONCE_PROMPT.md": copyOncePrompt,
      "shared/handoff/TOKEN_SAVINGS_PROMPT.md": tokenSavingsPrompt,
      "shared/handoff/ITERATION_NOTES.md": getIterationNotesMarkdown(),
      "shared/handoff/SCREEN_BUILD_PROMPTS.md": screenBuildPrompts,
      "shared/handoff/DO_NOT_CHANGE_GUARDRAILS.md": guardrailsPrompt,
      "shared/handoff/BOILERPLATE_NAMING_GUIDE.md": boilerplateNamingGuide,
      "shared/handoff/DESIGN_RULES.md": designRules,
      "shared/handoff/ACCESSIBILITY_NOTES.md": accessibilityNotes,
      "shared/handoff/BASELINE_FRAMEWORK_GUIDE.md": baselineFrameworkGuide,
      "shared/handoff/TEMPLATE_STRATEGY.md": templateStrategy,
    };

    starterTemplates.forEach((template) => {
      files[`templates/${template.id}/README.md`] = `# ${template.title}

## Purpose
${template.prompt}

## Baseline
${template.baseline}

## Screens
${template.screens.map((screen) => `- ${screen}`).join('\n')}

## Components
${template.components.map((component) => `- ${component}`).join('\n')}

## Design System
Use the shared App Style Studio files. Do not invent a new palette, spacing scale, radius system, shadow style, or typography system.
`;

      files[`templates/${template.id}/BUILD_PROMPT.md`] = `# Build Prompt - ${template.title}

Use App Style Studio as the design-system source of truth.

## Task
${template.prompt}

## Required Shared Files
- \`shared/styles/theme.css\`
- \`shared/styles/components.css\`
- \`shared/config/tailwind.config.ts\`
- \`shared/handoff/COPY_ONCE_PROMPT.md\`
- \`shared/handoff/DESIGN_RULES.md\`
- \`shared/handoff/ACCESSIBILITY_NOTES.md\`

## Build Rules
- Use CSS variables from \`theme.css\`.
- Use semantic classes from \`components.css\`.
- Include loading, empty, error, success, warning, disabled, hover, focus, selected, and destructive states.
- Build reusable components before screens.
- Run the local build and report changed files.

## First Screens
${template.screens.map((screen) => `- ${screen}`).join('\n')}

## First Components
${template.components.map((component) => `- ${component}`).join('\n')}
`;

      files[`templates/${template.id}/FILE_STRUCTURE.md`] = `# Suggested File Structure - ${template.title}

\`\`\`text
src/
  app/
    AppShell.tsx
    routes.tsx
  components/
${template.components.map((component) => `    ${component}.tsx`).join('\n')}
  screens/
${template.screens.map((screen) => `    ${screen.replace(/[^a-zA-Z0-9]+/g, '')}.tsx`).join('\n')}
  styles/
    theme.css
    components.css
    motion.css
  utils/
    designTokens.ts
\`\`\`
`;
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

  return (
    <div className="flex flex-col h-full bg-[#0f111a] p-6 text-gray-200">
      <div className="mb-4">
        <h2 className="text-xl font-bold tracking-tight">Export Centre</h2>
        <p className="text-xs text-gray-400">Generate, review, copy or save your style files to your application directory.</p>
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

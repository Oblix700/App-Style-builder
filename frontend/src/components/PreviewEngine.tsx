import React, { useEffect } from 'react';
import { ThemeDetail } from '../types';
import { generateSajidPalette } from '../utils/colors';

interface PreviewEngineProps {
  detail: ThemeDetail;
  mode: 'light' | 'dark';
}

export function generateCssVariablesString(detail: ThemeDetail, mode: 'light' | 'dark'): string {
  const isLight = mode === 'light';
  const colors = generateSajidPalette(
    detail.colour_tokens.base_hue,
    detail.colour_tokens.chroma,
    isLight,
    detail.colour_tokens.overrides,
    detail.colour_tokens.harmony
  );

  const primaryRgb = colors['primary']?.rgb || { r: 124, g: 102, b: 220 };
  const shadowIntensity = detail.colour_tokens.shadow_intensity ?? 0.25;
  const shadowColorize = detail.colour_tokens.shadow_colorize ?? true;
  const highlightOpacity = detail.colour_tokens.highlight_opacity ?? 0.08;

  // Helper to compute ambient shadow
  const computeShadow = (baseShadow: string) => {
    if (!baseShadow || baseShadow === 'none') return 'none';
    const rgbaRegex = /rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*([0-9.]+)\s*\)/g;
    
    let r = 0, g = 0, b = 0;
    if (shadowColorize) {
      if (isLight) {
        // Light mode: dark tint of primary brand hue
        r = Math.round(primaryRgb.r * 0.15);
        g = Math.round(primaryRgb.g * 0.15);
        b = Math.round(primaryRgb.b * 0.2);
      } else {
        // Dark mode: saturated dark tint of primary brand hue
        r = Math.round(primaryRgb.r * 0.4);
        g = Math.round(primaryRgb.g * 0.4);
        b = Math.round(primaryRgb.b * 0.5);
      }
    }

    return baseShadow.replace(rgbaRegex, (_, opacityStr) => {
      const originalOpacity = parseFloat(opacityStr) || 0.1;
      const newOpacity = (originalOpacity * shadowIntensity).toFixed(3);
      return `rgba(${r}, ${g}, ${b}, ${newOpacity})`;
    });
  };

  const variables = [
    // Colors
    `  --bg-dark: ${colors['bg-dark']?.hex || colors['bg-dark']?.hsl};`,
    `  --bg: ${colors['bg']?.hex || colors['bg']?.hsl};`,
    `  --bg-light: ${colors['bg-light']?.hex || colors['bg-light']?.hsl};`,
    `  --text: ${colors['text']?.hex || colors['text']?.hsl};`,
    `  --text-muted: ${colors['text-muted']?.hex || colors['text-muted']?.hsl};`,
    `  --border-highlight: rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, ${highlightOpacity});`,
    `  --border: ${colors['border']?.hex || colors['border']?.hsl};`,
    `  --border-muted: ${colors['border-muted']?.hex || colors['border-muted']?.hsl};`,
    `  --primary: ${colors['primary']?.hex || colors['primary']?.hsl};`,
    `  --primary-hover: ${colors['primary-hover']?.hex || colors['primary-hover']?.hsl};`,
    `  --primary-muted: ${colors['primary-muted']?.hex || colors['primary-muted']?.hsl};`,
    `  --secondary: ${colors['secondary']?.hex || colors['secondary']?.hsl};`,
    `  --secondary-hover: ${colors['secondary-hover']?.hex || colors['secondary-hover']?.hsl};`,
    `  --danger: ${colors['danger']?.hex || colors['danger']?.hsl};`,
    `  --warning: ${colors['warning']?.hex || colors['warning']?.hsl};`,
    `  --success: ${colors['success']?.hex || colors['success']?.hsl};`,
    `  --info: ${colors['info']?.hex || colors['info']?.hsl};`,

    // Typography
    `  --font-heading: '${detail.typography_tokens.heading_font}', system-ui, sans-serif;`,
    `  --font-body: '${detail.typography_tokens.body_font}', system-ui, sans-serif;`,
    `  --font-mono: '${detail.typography_tokens.mono_font}', monospace;`,
    `  --font-size-base: ${detail.typography_tokens.base_font_size}px;`,
    `  --font-size-h1: ${detail.typography_tokens.heading_sizes.h1 || '2.25rem'};`,
    `  --font-size-h2: ${detail.typography_tokens.heading_sizes.h2 || '1.875rem'};`,
    `  --font-size-h3: ${detail.typography_tokens.heading_sizes.h3 || '1.5rem'};`,
    `  --font-size-h4: ${detail.typography_tokens.heading_sizes.h4 || '1.25rem'};`,
    `  --font-size-h5: ${detail.typography_tokens.heading_sizes.h5 || '1.125rem'};`,
    `  --font-size-h6: ${detail.typography_tokens.heading_sizes.h6 || '1rem'};`,

    // Spacing
    `  --space-xs: ${detail.spacing_tokens.xs};`,
    `  --space-sm: ${detail.spacing_tokens.sm};`,
    `  --space-md: ${detail.spacing_tokens.md};`,
    `  --space-lg: ${detail.spacing_tokens.lg};`,
    `  --space-xl: ${detail.spacing_tokens.xl};`,
    `  --space-2xl: ${detail.spacing_tokens.xxl};`,
    `  --space-3xl: ${detail.spacing_tokens.xxxl};`,
    `  --page-padding: ${detail.spacing_tokens.page_padding};`,
    `  --section-gap: ${detail.spacing_tokens.section_gap};`,
    `  --card-padding: ${detail.spacing_tokens.card_padding};`,
    `  --form-gap: ${detail.spacing_tokens.form_gap};`,
    `  --table-cell-padding: ${detail.spacing_tokens.table_cell_padding};`,
    `  --sidebar-width: ${detail.spacing_tokens.sidebar_width};`,
    `  --topbar-height: ${detail.spacing_tokens.topbar_height};`,
    `  --modal-width: ${detail.spacing_tokens.modal_width};`,
    `  --dashboard-grid-gap: ${detail.spacing_tokens.dashboard_grid_gap};`,

    // Radii
    `  --radius-none: ${detail.radius_tokens.none};`,
    `  --radius-sm: ${detail.radius_tokens.sm};`,
    `  --radius-md: ${detail.radius_tokens.md};`,
    `  --radius-lg: ${detail.radius_tokens.lg};`,
    `  --radius-xl: ${detail.radius_tokens.xl};`,
    `  --radius-pill: ${detail.radius_tokens.pill};`,

    // Shadows
    `  --shadow-none: ${computeShadow(detail.shadow_tokens.none)};`,
    `  --shadow-sm: ${computeShadow(detail.shadow_tokens.sm)};`,
    `  --shadow-md: ${computeShadow(detail.shadow_tokens.md)};`,
    `  --shadow-lg: ${computeShadow(detail.shadow_tokens.lg)};`,
    `  --shadow-xl: ${computeShadow(detail.shadow_tokens.xl)};`,
    `  --shadow-card: ${computeShadow(detail.shadow_tokens.card)};`,
    `  --shadow-modal: ${computeShadow(detail.shadow_tokens.modal)};`,
    `  --shadow-dropdown: ${computeShadow(detail.shadow_tokens.dropdown)};`,
    `  --shadow-button: ${computeShadow(detail.shadow_tokens.button)};`,
    `  --shadow-focus-ring: ${detail.shadow_tokens.focus_ring};`,

    // Motion
    `  --duration-fast: ${detail.motion_tokens.enabled ? detail.motion_tokens.duration_fast : '0ms'};`,
    `  --duration-normal: ${detail.motion_tokens.enabled ? detail.motion_tokens.duration_normal : '0ms'};`,
    `  --duration-slow: ${detail.motion_tokens.enabled ? detail.motion_tokens.duration_slow : '0ms'};`,
    `  --ease-standard: ${detail.motion_tokens.ease_standard};`,
    `  --ease-emphasised: ${detail.motion_tokens.ease_emphasised};`,
    `  --ease-bounce: ${detail.motion_tokens.ease_bounce};`,

    // Glassmorphism
    `  --glass-enabled: ${detail.colour_tokens.glass_enabled ? 'true' : 'false'};`,
    `  --glass-blur: ${detail.colour_tokens.glass_blur ?? 12}px;`,
    `  --glass-opacity: ${detail.colour_tokens.glass_opacity ?? 0.25};`,
  ];

  return variables.join('\n');
}

export function PreviewEngine({ detail, mode }: PreviewEngineProps) {
  useEffect(() => {
    // Inject dynamic CSS variables inside a scoped style tag
    const styleId = 'dynamic-preview-styles';
    let styleEl = document.getElementById(styleId) as HTMLStyleElement;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    const cssVars = generateCssVariablesString(detail, mode);
    const glassStyle = detail.colour_tokens.glass_enabled ? `
      .preview-scope .app-card, 
      .preview-scope .preview-card,
      .preview-scope [class*="bg-[var(--bg-light)]"],
      .preview-scope [class*="bg-[var(--app-bg-light)]"] {
        background: color-mix(in srgb, var(--bg-light) calc(var(--glass-opacity) * 100%), transparent) !important;
        backdrop-filter: blur(var(--glass-blur)) !important;
        -webkit-backdrop-filter: blur(var(--glass-blur)) !important;
        border-top: 1px solid var(--border-highlight) !important;
      }
    ` : '';
    
    // Inject the scoped style block affecting only .preview-scope container
    styleEl.innerHTML = `
      .preview-scope {
        ${cssVars}
      }
      ${glassStyle}
    `;

    return () => {
      // Keep it, but we clean up if the component unmounts
    };
  }, [detail, mode]);

  return null; // Side effect component
}

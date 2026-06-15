// Color Conversion Utilities

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

// Convert OKLCH to sRGB (clamped to 0..255)
export function oklchToRgb(l: number, c: number, h: number): RGB {
  // Convert H to radians
  const hRad = (h * Math.PI) / 180;
  
  // OKLCH -> OKLab
  const a = c * Math.cos(hRad);
  const labB = c * Math.sin(hRad);
  
  // OKLab -> LMS
  const lLms = l + 0.3963377774 * a + 0.2158037573 * labB;
  const mLms = l - 0.1055613458 * a - 0.0638541728 * labB;
  const sLms = l - 0.0894841775 * a - 1.2914855480 * labB;
  
  // LMS cubed
  const l_ = lLms * lLms * lLms;
  const m_ = mLms * mLms * mLms;
  const s_ = sLms * sLms * sLms;
  
  // LMS cubed -> Linear sRGB
  let rL = +4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_;
  let gL = -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_;
  let bL = -0.0041960863 * l_ - 0.7034186147 * m_ + 1.7076147010 * s_;
  
  // Linear sRGB -> sRGB (gamma correction)
  const gamma = (val: number) => {
    if (val <= 0.0031308) {
      return 12.92 * val;
    }
    return 1.055 * Math.pow(val, 1 / 2.4) - 0.055;
  };
  
  const r = Math.min(255, Math.max(0, Math.round(gamma(rL) * 255)));
  const g = Math.min(255, Math.max(0, Math.round(gamma(gL) * 255)));
  const b = Math.min(255, Math.max(0, Math.round(gamma(bL) * 255)));
  
  return { r, g, b };
}

// Convert RGB to HEX
export function rgbToHex({ r, g, b }: RGB): string {
  const toHex = (c: number) => {
    const hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Convert RGB to HSL
export function rgbToHsl({ r, g, b }: RGB): HSL {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  let l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// Helper to format HSL object to CSS string
export function formatHslStr({ h, s, l }: HSL): string {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

// Parse OKLCH components and convert to Hex & HSL
export function oklchToHexAndHsl(l: number, c: number, h: number): { hex: string; hslStr: string; oklchStr: string } {
  const rgb = oklchToRgb(l, c, h);
  const hex = rgbToHex(rgb);
  const hsl = rgbToHsl(rgb);
  const hslStr = formatHslStr(hsl);
  const oklchStr = `oklch(${(l * 100).toFixed(0)}% ${c.toFixed(3)} ${h.toFixed(1)})`;
  return { hex, hslStr, oklchStr };
}

// WCAG 2.0 Relative Luminance Calculation
export function getRelativeLuminance({ r, g, b }: RGB): number {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

// Calculate WCAG Contrast Ratio
export function getContrastRatio(rgb1: RGB, rgb2: RGB): number {
  const l1 = getRelativeLuminance(rgb1);
  const l2 = getRelativeLuminance(rgb2);
  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  return (brightest + 0.05) / (darkest + 0.05);
}

// Generate the Sajid-style Palette
export interface PaletteResult {
  tokenName: string;
  oklch: string;
  hsl: string;
  hex: string;
  rgb: RGB;
}

export function isOklchOutOfGamut(l: number, c: number, h: number): boolean {
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const labB = c * Math.sin(hRad);
  
  const lLms = l + 0.3963377774 * a + 0.2158037573 * labB;
  const mLms = l - 0.1055613458 * a - 0.0638541728 * labB;
  const sLms = l - 0.0894841775 * a - 1.2914855480 * labB;
  
  const l_ = lLms * lLms * lLms;
  const m_ = mLms * mLms * mLms;
  const s_ = sLms * sLms * sLms;
  
  const rL = +4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_;
  const gL = -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_;
  const bL = -0.0041960863 * l_ - 0.7034186147 * m_ + 1.7076147010 * s_;
  
  // Return true if any linear RGB component is outside [0..1] with small threshold
  return rL < -0.005 || rL > 1.005 || gL < -0.005 || gL > 1.005 || bL < -0.005 || bL > 1.005;
}

export function generateSajidPalette(
  hue: number,
  chroma: number,
  isLightMode: boolean,
  overrides: Record<string, string> = {},
  harmony = 'complementary'
): Record<string, PaletteResult> {
  let hueSecondary = (hue + 180) % 360;
  let lightnessSecondaryShift = 0;

  if (harmony === 'analogous') {
    hueSecondary = (hue + 30) % 360;
  } else if (harmony === 'split') {
    hueSecondary = (hue + 150) % 360;
  } else if (harmony === 'monochromatic') {
    hueSecondary = hue;
    // Shift lightness so monochromatic secondary looks distinct from primary
    lightnessSecondaryShift = isLightMode ? 0.12 : -0.15;
  }

  const chromaBg = +(chroma * 0.5).toFixed(3);
  const chromaText = +Math.min(chroma, 0.08).toFixed(3);
  const chromaAction = +Math.max(chroma, 0.08).toFixed(3);
  const chromaAlert = +Math.max(chroma, 0.05).toFixed(3);

  // Setup standard definitions (L, C, H)
  const specs: Record<string, [number, number, number]> = isLightMode
    ? {
        "bg-dark": [0.92, chromaBg, hue],
        bg: [0.96, chromaBg, hue],
        "bg-light": [1.0, chromaBg, hue],
        text: [0.15, chromaText, hue],
        "text-muted": [0.4, chromaText, hue],
        "border-highlight": [1.0, chroma, hue],
        border: [0.6, chroma, hue],
        "border-muted": [0.7, chroma, hue],
        primary: [0.4, chromaAction, hue],
        "primary-hover": [0.48, chromaAction, hue],
        "primary-muted": [0.85, chromaAction, hue],
        secondary: [Math.min(0.9, Math.max(0.1, 0.4 + lightnessSecondaryShift)), chromaAction, hueSecondary],
        "secondary-hover": [Math.min(0.9, Math.max(0.1, 0.48 + lightnessSecondaryShift)), chromaAction, hueSecondary],
        danger: [0.5, chromaAlert, 30],
        warning: [0.55, chromaAlert, 75],
        success: [0.5, chromaAlert, 145],
        info: [0.5, chromaAlert, 245],
      }
    : {
        "bg-dark": [0.1, chromaBg, hue],
        bg: [0.15, chromaBg, hue],
        "bg-light": [0.2, chromaBg, hue],
        text: [0.96, chromaText, hue],
        "text-muted": [0.76, chromaText, hue],
        "border-highlight": [0.5, chroma, hue],
        border: [0.4, chroma, hue],
        "border-muted": [0.3, chroma, hue],
        primary: [0.76, chromaAction, hue],
        "primary-hover": [0.82, chromaAction, hue],
        "primary-muted": [0.35, chromaAction, hue],
        secondary: [Math.min(0.9, Math.max(0.1, 0.76 + lightnessSecondaryShift)), chromaAction, hueSecondary],
        "secondary-hover": [Math.min(0.9, Math.max(0.1, 0.82 + lightnessSecondaryShift)), chromaAction, hueSecondary],
        danger: [0.7, chromaAlert, 30],
        warning: [0.75, chromaAlert, 75],
        success: [0.7, chromaAlert, 145],
        info: [0.7, chromaAlert, 245],
      };

  const result: Record<string, PaletteResult> = {};

  for (const [key, [l, c, h]] of Object.entries(specs)) {
    // Generate base oklch colors
    const rgb = oklchToRgb(l, c, h);
    const hex = rgbToHex(rgb);
    const hsl = rgbToHsl(rgb);
    
    result[key] = {
      tokenName: key,
      oklch: `oklch(${(l * 100).toFixed(0)}% ${c.toFixed(3)} ${h.toFixed(1)})`,
      hsl: formatHslStr(hsl),
      hex,
      rgb,
    };
  }

  // Handle overrides if provided
  for (const [key, overrideVal] of Object.entries(overrides)) {
    if (overrideVal && result[key]) {
      // Basic HEX override processing (or default fallback)
      if (overrideVal.startsWith("#")) {
        const hex = overrideVal;
        const r = parseInt(hex.slice(1, 3), 16) || 0;
        const g = parseInt(hex.slice(3, 5), 16) || 0;
        const b = parseInt(hex.slice(5, 7), 16) || 0;
        const rgb = { r, g, b };
        const hsl = rgbToHsl(rgb);
        result[key] = {
          tokenName: key,
          oklch: `oklch(L C H override)`, // simplified representation for hex overrides
          hsl: formatHslStr(hsl),
          hex,
          rgb,
        };
      }
    }
  }

  return result;
}

// Convert RGB (0..255) to OKLCH (L 0..1, C 0..0.4, H 0..360)
export function rgbToOklch(r: number, g: number, b: number): { l: number; c: number; h: number } {
  // sRGB -> linear sRGB
  const toLinear = (v: number) => {
    v /= 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const rL = toLinear(r);
  const gL = toLinear(g);
  const bL = toLinear(b);

  // linear sRGB -> LMS
  const lLms = 0.4122214708 * rL + 0.5363325363 * gL + 0.0514459929 * bL;
  const mLms = 0.2119034982 * rL + 0.6806995477 * gL + 0.1073969541 * bL;
  const sLms = 0.0883024619 * rL + 0.2817188376 * gL + 0.6299787005 * bL;

  // LMS cubed
  const l_ = Math.cbrt(lLms);
  const m_ = Math.cbrt(mLms);
  const s_ = Math.cbrt(sLms);

  // LMS cubed -> OKLab
  const lVal = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const aVal = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const bVal = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

  // OKLab -> OKLCH
  const cVal = Math.sqrt(aVal * aVal + bVal * bVal);
  let hVal = 0;
  if (cVal > 0) {
    hVal = (Math.atan2(bVal, aVal) * 180) / Math.PI;
    if (hVal < 0) hVal += 360;
  }

  return { l: lVal, c: cVal, h: hVal };
}

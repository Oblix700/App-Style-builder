import React from 'react';
import { StepPanelProps } from './StepPanelProps';
import { isOklchOutOfGamut } from '../utils/colors';
import * as Icons from 'lucide-react';

interface StepColorsProps extends StepPanelProps {
  contrast: { ratioText: number; ratioMuted: number; ratioPrimary: number };
  // Eyedropper state & handlers
  pickerImageSrc: string | null;
  setPickerImageSrc: (src: string | null) => void;
  hoveredColor: string | null;
  magnifierStyle: React.CSSProperties;
  magnifierColor: string;
  imageRef: React.RefObject<HTMLImageElement>;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleImageDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  handleImageMouseMove: (e: React.MouseEvent<HTMLImageElement>) => void;
  handleImageMouseLeave: () => void;
  handleImageClick: (e: React.MouseEvent<HTMLImageElement>) => void;
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function StepColors({
  detail, onSave, uiMode, contrast,
  pickerImageSrc, setPickerImageSrc, hoveredColor,
  magnifierStyle, magnifierColor, imageRef,
  handleImageUpload, handleImageDrop, handleImageMouseMove,
  handleImageMouseLeave, handleImageClick, showNotification,
}: StepColorsProps) {
  const isPrimaryOutOfGamut = isOklchOutOfGamut(
    0.76,
    detail.colour_tokens.chroma,
    detail.colour_tokens.base_hue
  );

  const handleColorSliderChange = (key: 'base_hue' | 'chroma', val: number) => {
    const updated = {
      ...detail,
      colour_tokens: {
        ...detail.colour_tokens,
        [key]: val,
      },
    };
    onSave(updated);
  };

  const handleColorOverride = (token: string, hex: string) => {
    const updated = {
      ...detail,
      colour_tokens: {
        ...detail.colour_tokens,
        overrides: {
          ...detail.colour_tokens.overrides,
          [token]: hex,
        },
      },
    };
    onSave(updated);
  };

  const handleResetOverrides = () => {
    const updated = {
      ...detail,
      colour_tokens: {
        ...detail.colour_tokens,
        overrides: {},
      },
    };
    onSave(updated);
    showNotification("Overrides cleared", "info");
  };

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
          <span className="text-[var(--primary)] font-mono">{detail.colour_tokens.base_hue}°</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-amber-500 font-bold uppercase select-none">Warmer</span>
          <input
            type="range"
            min="0"
            max="360"
            value={detail.colour_tokens.base_hue}
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
          <span className="text-[var(--primary)] font-mono">{detail.colour_tokens.chroma}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-gray-500 font-bold uppercase select-none">Neutral</span>
          <input
            type="range"
            min="0"
            max="0.25"
            step="0.01"
            value={detail.colour_tokens.chroma}
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
          value={detail.colour_tokens.harmony || 'complementary'}
          onChange={(e) => onSave({
            ...detail,
            colour_tokens: { ...detail.colour_tokens, harmony: e.target.value }
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
                ref={imageRef as any}
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
      {uiMode === 'easy' && (
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
      {uiMode === 'advanced' && (
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
                    value={detail.colour_tokens.overrides[token] || '#000000'}
                    onChange={(e) => handleColorOverride(token, e.target.value)}
                    className="w-5 h-5 bg-transparent border-0 cursor-pointer rounded-full"
                  />
                  <input
                    type="text"
                    value={detail.colour_tokens.overrides[token] || ''}
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
}

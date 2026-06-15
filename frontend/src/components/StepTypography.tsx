import React from 'react';
import { StepPanelWithNotifyProps } from './StepPanelProps';
import { TypographyPresets } from '../utils/presets';

export function StepTypography({ detail, onSave, uiMode, showNotification }: StepPanelWithNotifyProps) {
  const applyTypographyPreset = (name: string) => {
    if (!TypographyPresets[name]) return;
    onSave({ ...detail, typography_tokens: TypographyPresets[name] });
    showNotification(`Applied Typography Preset: ${name}`, 'success');
  };

  return (
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
            const isSelected = detail.typography_tokens.preset_name === presetKey;
            
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
                
                <div className="p-2 bg-[#121625] border border-[#202538] rounded-lg w-28 text-left shrink-0">
                  <div style={{ fontFamily: headingFontFamily, fontWeight: 700 }} className="text-white text-[11px] leading-none">
                    Aa Heading
                  </div>
                  <div style={{ fontFamily: bodyFontFamily }} className="text-[8px] text-gray-500 mt-1 leading-tight line-clamp-1">
                    Body paragraph sample.
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Font Selection */}
      {uiMode === 'advanced' && (
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Heading Font</label>
            <input
              type="text"
              value={detail.typography_tokens.heading_font}
              onChange={(e) => onSave({
                ...detail,
                typography_tokens: { ...detail.typography_tokens, heading_font: e.target.value, preset_name: 'Custom' }
              })}
              className="w-full px-3 py-2 bg-[#121625] border border-[#202538] rounded-lg text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Body Font</label>
            <input
              type="text"
              value={detail.typography_tokens.body_font}
              onChange={(e) => onSave({
                ...detail,
                typography_tokens: { ...detail.typography_tokens, body_font: e.target.value, preset_name: 'Custom' }
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
          <span className="text-[var(--primary)] font-mono">{detail.typography_tokens.base_font_size}px</span>
        </div>
        <input
          type="range"
          min="12"
          max="24"
          value={detail.typography_tokens.base_font_size}
          onChange={(e) => onSave({
            ...detail,
            typography_tokens: { ...detail.typography_tokens, base_font_size: parseInt(e.target.value), preset_name: 'Custom' }
          })}
          className="w-full h-1 bg-[#121625] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
        />
      </div>
    </div>
  );
}

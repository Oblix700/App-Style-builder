import React from 'react';
import { StepPanelWithNotifyProps } from './StepPanelProps';
import { SpacingPresets } from '../utils/presets';
import * as Icons from 'lucide-react';

export function StepSpacing({ detail, onSave, uiMode, showNotification }: StepPanelWithNotifyProps) {
  const applySpacingPreset = (name: string) => {
    if (!SpacingPresets[name]) return;
    onSave({ ...detail, spacing_tokens: SpacingPresets[name] });
    showNotification(`Applied Spacing Preset: ${name}`, 'success');
  };

  return (
    <div className="space-y-4 anim-fade-in">
      <div>
        <h3 className="font-bold text-sm text-white uppercase tracking-wider mb-2">Spacing & Page Densities</h3>
        <p className="text-xs text-gray-400">Define layouts, sidebars, and gaps. Best practice: multiples of 4px.</p>
      </div>

      {/* Easy Mode: Global Density Slider */}
      {uiMode === 'easy' && (
        <div className="p-5 bg-[#141829] border border-[#202538] rounded-xl space-y-5">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-gray-300">Global UI Density</span>
            <span className="text-[var(--primary)] font-bold">
              {detail.spacing_tokens.preset_name || "Comfortable (Standard UI)"}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="2"
            step="1"
            value={
              detail.spacing_tokens.preset_name?.includes("Compact") ? 0 :
              detail.spacing_tokens.preset_name?.includes("Spacious") ? 2 : 1
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
      {uiMode === 'advanced' && (
        <>
          {/* Presets */}
          <div className="grid grid-cols-3 gap-2">
            {Object.keys(SpacingPresets).map((sKey) => (
              <button
                key={sKey}
                onClick={() => applySpacingPreset(sKey)}
                className={`px-3 py-2.5 border rounded-lg text-xs transition-all text-left ${
                  detail.spacing_tokens.preset_name === sKey
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
              {([
                { key: 'page_padding', label: 'Page Padding' },
                { key: 'card_padding', label: 'Card Padding' },
              ] as const).map((item) => (
                <div key={item.key}>
                  <label className="block text-[10px] text-gray-400 font-bold uppercase">{item.label}</label>
                  <input
                    type="text"
                    value={detail.spacing_tokens[item.key]}
                    onChange={(e) => onSave({
                      ...detail,
                      spacing_tokens: { ...detail.spacing_tokens, [item.key]: e.target.value, preset_name: 'Custom' }
                    })}
                    className="w-full px-3 py-1.5 bg-[#121625] border border-[#202538] rounded-md text-xs focus:outline-none text-gray-300 font-mono"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {([
                { key: 'sidebar_width', label: 'Sidebar Width' },
                { key: 'table_cell_padding', label: 'Table Cell Padding' },
              ] as const).map((item) => (
                <div key={item.key}>
                  <label className="block text-[10px] text-gray-400 font-bold uppercase">{item.label}</label>
                  <input
                    type="text"
                    value={detail.spacing_tokens[item.key]}
                    onChange={(e) => onSave({
                      ...detail,
                      spacing_tokens: { ...detail.spacing_tokens, [item.key]: e.target.value, preset_name: 'Custom' }
                    })}
                    className="w-full px-3 py-1.5 bg-[#121625] border border-[#202538] rounded-md text-xs focus:outline-none text-gray-300 font-mono"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Range Sliders for Spacing */}
          <div className="space-y-4 pt-3 mt-3 border-t border-[#202538]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Layout Spacing Sliders</h4>
            
            {([
              { key: 'card_padding', label: 'Card Padding', min: 8, max: 48, id: 'slider-card-padding' },
              { key: 'table_cell_padding', label: 'Table Cell Padding', min: 4, max: 24, id: 'slider-table-padding' },
              { key: 'form_gap', label: 'Form Element Gap', min: 8, max: 32, id: 'slider-form-gap' },
              { key: 'dashboard_grid_gap', label: 'Dashboard Grid Gap', min: 8, max: 48, id: 'slider-grid-gap' },
            ] as const).map((slider) => (
              <div className="space-y-1" id={slider.id} key={slider.key}>
                <div className="flex justify-between text-xs text-gray-300">
                  <span>{slider.label}</span>
                  <span className="font-mono font-bold text-[var(--primary)]">{detail.spacing_tokens[slider.key]}</span>
                </div>
                <input
                  type="range"
                  min={slider.min}
                  max={slider.max}
                  value={parseInt(detail.spacing_tokens[slider.key]) || 16}
                  onChange={(e) => onSave({
                    ...detail,
                    spacing_tokens: { ...detail.spacing_tokens, [slider.key]: `${e.target.value}px`, preset_name: 'Custom' }
                  })}
                  className="w-full h-1 bg-[#121625] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

import React from 'react';
import { StepPanelWithPreviewProps } from './StepPanelProps';
import { SpacingPresets, RadiusPresets } from '../utils/presets';

export function StepMetadata({ detail, onSave, uiMode, previewMode, setPreviewMode }: StepPanelWithPreviewProps) {
  return (
    <div className="space-y-4 anim-fade-in">
      <div>
        <h3 className="font-bold text-sm text-white uppercase tracking-wider mb-2">App Identity Settings</h3>
        <p className="text-xs text-gray-400">Describe the basic details and layout mood of your application.</p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-400 mb-1">Theme Name</label>
        <input
          type="text"
          value={detail.theme.name}
          onChange={(e) => onSave({
            ...detail,
            theme: { ...detail.theme, name: e.target.value }
          })}
          className="w-full px-3 py-2 bg-[#121625] border border-[#202538] rounded-lg text-xs focus:outline-none focus:border-[var(--primary)]"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-400 mb-1">Target App Interface</label>
        <select
          value={detail.theme.app_type}
          onChange={(e) => onSave({
            ...detail,
            theme: { ...detail.theme, app_type: e.target.value }
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
            value={detail.theme.style_mood}
            onChange={(e) => onSave({
              ...detail,
              theme: { ...detail.theme, style_mood: e.target.value }
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
            value={detail.theme.density}
            onChange={(e) => {
              const newDensity = e.target.value;
              const updated = {
                ...detail,
                theme: { ...detail.theme, density: newDensity }
              };
              // Also load the spacing tokens preset
              if (newDensity === "Compact") updated.spacing_tokens = SpacingPresets["Compact (Dense & Professional)"];
              else if (newDensity === "Comfortable") updated.spacing_tokens = SpacingPresets["Comfortable (Standard UI)"];
              else updated.spacing_tokens = SpacingPresets["Spacious (Clean & Relaxed)"];
              
              onSave(updated);
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
            value={detail.theme.border_style}
            onChange={(e) => onSave({
              ...detail,
              theme: { ...detail.theme, border_style: e.target.value }
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
            value={detail.theme.component_style}
            onChange={(e) => {
              const val = e.target.value;
              const updated = {
                ...detail,
                theme: { ...detail.theme, component_style: val }
              };
              if (val === "Sharp") updated.radius_tokens = RadiusPresets["Sharp (Tactical/Retro)"];
              else if (val === "Rounded") updated.radius_tokens = RadiusPresets["Subtle Rounded (Corporate)"];
              else if (val === "Pill") updated.radius_tokens = RadiusPresets["Pill Soft (Friendly)"];
              else updated.radius_tokens = RadiusPresets["Modern Rounded (Standard)"];
              onSave(updated);
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
                  ...detail,
                  theme: { ...detail.theme, default_mode: m }
                };
                onSave(updated);
                if (m !== 'Both') setPreviewMode(m.toLowerCase() as any);
              }}
              className={`px-3 py-2 border rounded-lg text-xs font-bold transition-all ${
                detail.theme.default_mode === m
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
  );
}

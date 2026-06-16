import React from 'react';
import * as Icons from 'lucide-react';
import { PresetThemes } from '../utils/presets';

export interface DashboardBlueprintGuide {
  title: string;
  description: string;
  presetIndex: number;
  icon: React.ElementType;
}

interface DashboardBlueprintPickerProps {
  blueprintGuides: DashboardBlueprintGuide[];
  blueprintAudiences: string[];
  blueprintScreenSets: string[];
  blueprintStacks: string[];
  selectedBlueprintIndex: number;
  selectedBlueprintAudience: string;
  selectedBlueprintScreenSet: string;
  selectedBlueprintStack: string;
  onSelectBlueprintIndex: (presetIndex: number) => void;
  onSelectAudience: (audience: string) => void;
  onSelectScreenSet: (screenSet: string) => void;
  onSelectStack: (stack: string) => void;
  onCreateTheme: () => void;
}

export function DashboardBlueprintPicker({
  blueprintGuides,
  blueprintAudiences,
  blueprintScreenSets,
  blueprintStacks,
  selectedBlueprintIndex,
  selectedBlueprintAudience,
  selectedBlueprintScreenSet,
  selectedBlueprintStack,
  onSelectBlueprintIndex,
  onSelectAudience,
  onSelectScreenSet,
  onSelectStack,
  onCreateTheme,
}: DashboardBlueprintPickerProps) {
  const selectedBlueprint = blueprintGuides.find((blueprint) => blueprint.presetIndex === selectedBlueprintIndex);

  return (
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
          onClick={onCreateTheme}
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
            onChange={(e) => onSelectAudience(e.target.value)}
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
            onChange={(e) => onSelectScreenSet(e.target.value)}
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
            onChange={(e) => onSelectStack(e.target.value)}
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
              onClick={() => onSelectBlueprintIndex(blueprint.presetIndex)}
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
            {selectedBlueprint?.title || 'Selected blueprint'} for {selectedBlueprintAudience.toLowerCase()} using {selectedBlueprintScreenSet.toLowerCase()}.
          </p>
        </div>
        <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#1c223c] text-gray-300 font-semibold uppercase shrink-0">
          {selectedBlueprintStack}
        </span>
      </div>
    </div>
  );
}

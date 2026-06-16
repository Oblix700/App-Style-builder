import React from 'react';
import * as Icons from 'lucide-react';

export interface DashboardGuideItem {
  title: string;
  description: string;
  badge: string;
  icon: React.ElementType;
  needsTheme?: boolean;
  action: () => void;
}

export interface DashboardChecklistItem {
  label: string;
  detail: string;
  status: string;
  icon: React.ElementType;
  needsTheme?: boolean;
  action: () => void;
}

interface DashboardGuidancePanelsProps {
  hasActiveTheme: boolean;
  nextActionGuides: DashboardGuideItem[];
  usabilityChecklist: DashboardChecklistItem[];
}

export function DashboardGuidancePanels({
  hasActiveTheme,
  nextActionGuides,
  usabilityChecklist,
}: DashboardGuidancePanelsProps) {
  return (
    <>
      <div className="bg-[#0f121e] border border-[#202538] rounded-xl p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--primary)] mb-1">
              <Icons.Compass size={14} />
              First-time guide
            </div>
            <h2 className="text-lg font-bold text-white">What do you want to do next?</h2>
            <p className="text-xs text-gray-400 mt-1">
              Pick a path. In Builder, choices on the left update the live preview on the right immediately.
            </p>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#1c223c] text-gray-300 font-semibold uppercase shrink-0">
            WYSIWYG preview
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
          {nextActionGuides.map((guide) => {
            const Icon = guide.icon;
            const disabled = Boolean(guide.needsTheme && !hasActiveTheme);

            return (
              <button
                key={guide.title}
                type="button"
                disabled={disabled}
                onClick={guide.action}
                className={`text-left bg-[#121625] border rounded-lg p-3 transition-all group ${
                  disabled
                    ? 'border-[#202538] opacity-55 cursor-not-allowed'
                    : 'border-[#202538] hover:border-[var(--primary)] hover:bg-[#171c2f] hover:-translate-y-0.5'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#1a1f35] border border-[#252c47] flex items-center justify-center text-[var(--primary)]">
                    <Icon size={16} />
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${
                    disabled ? 'bg-[#202538] text-gray-500' : 'bg-[var(--primary-soft)] text-[var(--primary)]'
                  }`}>
                    {guide.badge}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mb-1">{guide.title}</h3>
                <p className="text-[11px] leading-relaxed text-gray-400">{guide.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-[#0f121e] border border-[#202538] rounded-xl p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--primary)] mb-1">
              <Icons.ClipboardCheck size={14} />
              Non-coder usability checklist
            </div>
            <h2 className="text-lg font-bold text-white">Can someone use this without coding?</h2>
            <p className="text-xs text-gray-400 mt-1">
              Use this as the release test: first action, clear language, live preview, obvious export, and token-saving workflow.
            </p>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-green-950/50 border border-green-800/70 text-green-300 font-semibold uppercase shrink-0">
            Phase 8 covered
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
          {usabilityChecklist.map((item) => {
            const Icon = item.icon;
            const disabled = Boolean(item.needsTheme && !hasActiveTheme);

            return (
              <button
                key={item.label}
                type="button"
                disabled={disabled}
                onClick={item.action}
                className={`text-left rounded-lg border p-3 transition-all ${
                  disabled
                    ? 'bg-[#121625] border-[#202538] opacity-55 cursor-not-allowed'
                    : 'bg-[#121625] border-[#202538] hover:bg-[#171c2f] hover:border-[var(--primary)]'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#1a1f35] border border-[#252c47] flex items-center justify-center text-[var(--primary)]">
                    <Icon size={16} />
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    disabled ? 'bg-[#202538] text-gray-500' : 'bg-green-950/50 text-green-300 border border-green-800/70'
                  }`}>
                    {disabled ? 'Needs theme' : item.status}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white">{item.label}</h3>
                <p className="text-[10px] leading-relaxed text-gray-400 mt-1">{item.detail}</p>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

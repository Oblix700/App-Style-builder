import React from 'react';
import * as Icons from 'lucide-react';
import { ExportTabId } from './exportCentreConfig';

interface ExportRecommendation {
  title: string;
  description: string;
  bestFor: string;
  icon: React.ElementType;
  tab: ExportTabId;
  actionLabel: string;
}

interface ExportRecommendationPanelProps {
  activeTab: ExportTabId;
  onSelect: (tab: ExportTabId) => void;
}

const exportRecommendations: ExportRecommendation[] = [
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

export function ExportRecommendationPanel({ activeTab, onSelect }: ExportRecommendationPanelProps) {
  return (
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
              onClick={() => onSelect(recommendation.tab)}
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
  );
}

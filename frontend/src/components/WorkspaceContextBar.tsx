import React from 'react';
import * as Icons from 'lucide-react';

type WorkspaceScreen = 'dashboard' | 'builder' | 'export' | 'settings';

interface WorkspaceContextBarProps {
  activeScreen: WorkspaceScreen;
  activeStep: number;
  hasActiveTheme: boolean;
  previewMode: 'light' | 'dark';
  designHealthScore: number;
  onNavigate: (screen: WorkspaceScreen) => void;
  onSetBuilderStep: (step: number) => void;
  onTogglePreviewMode: () => void;
  onNotify: (message: string) => void;
}

interface ContextAction {
  label: string;
  icon: React.ElementType;
  disabled?: boolean;
  onClick: () => void;
}

const builderStepLabels = [
  'Identity',
  'Colours',
  'Fonts',
  'Spacing',
  'Elevation',
  'Icons',
  'Motion',
  'Presets',
];

function ContextButton({ action }: { action: ContextAction }) {
  const Icon = action.icon;

  return (
    <button
      type="button"
      disabled={action.disabled}
      onClick={action.onClick}
      className="px-2.5 py-1.5 rounded-md border border-[#252c47] bg-[#121625] text-gray-300 hover:text-white hover:bg-[#171c2f] disabled:opacity-40 disabled:cursor-not-allowed text-[10px] font-semibold flex items-center gap-1.5 transition-all"
    >
      <Icon size={12} />
      {action.label}
    </button>
  );
}

export function WorkspaceContextBar({
  activeScreen,
  activeStep,
  hasActiveTheme,
  previewMode,
  designHealthScore,
  onNavigate,
  onSetBuilderStep,
  onTogglePreviewMode,
  onNotify,
}: WorkspaceContextBarProps) {
  const builderLabel = builderStepLabels[activeStep] || 'Builder';
  const screenCopy: Record<WorkspaceScreen, { title: string; hint: string; icon: React.ElementType }> = {
    dashboard: {
      title: 'Theme Workspace',
      hint: 'Create, import, select, or inspect reusable app style systems.',
      icon: Icons.LayoutDashboard,
    },
    builder: {
      title: `${builderLabel} Options`,
      hint: 'Tune the selected style layer and watch the live preview update on the right.',
      icon: Icons.SlidersHorizontal,
    },
    export: {
      title: 'Export Options',
      hint: 'Choose the right AI handoff, starter template, or token-saving export.',
      icon: Icons.Download,
    },
    settings: {
      title: 'Settings and Logs',
      hint: 'Check local database state and exported history.',
      icon: Icons.Settings,
    },
  };

  const current = screenCopy[activeScreen];
  const Icon = current.icon;

  const actions: ContextAction[] = activeScreen === 'builder'
    ? [
        { label: 'Previous Step', icon: Icons.ChevronLeft, disabled: activeStep <= 0, onClick: () => onSetBuilderStep(Math.max(0, activeStep - 1)) },
        { label: 'Next Step', icon: Icons.ChevronRight, disabled: activeStep >= 7, onClick: () => onSetBuilderStep(Math.min(7, activeStep + 1)) },
        { label: previewMode === 'dark' ? 'Light Preview' : 'Dark Preview', icon: previewMode === 'dark' ? Icons.Sun : Icons.Moon, onClick: onTogglePreviewMode },
        { label: 'Open Export', icon: Icons.Download, onClick: () => onNavigate('export') },
      ]
    : activeScreen === 'export'
      ? [
          { label: 'Back to Builder', icon: Icons.Palette, disabled: !hasActiveTheme, onClick: () => onNavigate('builder') },
          { label: 'Token Savings', icon: Icons.Coins, disabled: !hasActiveTheme, onClick: () => onNotify('Use Token Savings Mode in Export Centre for short follow-up prompts.') },
          { label: 'Full Handoff', icon: Icons.FileArchive, disabled: !hasActiveTheme, onClick: () => onNotify('Use Full Handoff ZIP when a developer or AI tool needs everything.') },
        ]
      : activeScreen === 'dashboard'
        ? [
            { label: 'New Blueprint', icon: Icons.Plus, onClick: () => onNotify('Use the ribbon New command or Guided Start to create a blueprint.') },
            { label: 'Import Tokens', icon: Icons.Upload, onClick: () => document.getElementById('ribbon-token-import')?.click() },
            { label: 'Open Builder', icon: Icons.Palette, disabled: !hasActiveTheme, onClick: () => onNavigate('builder') },
          ]
        : [
            { label: 'Back Home', icon: Icons.LayoutDashboard, onClick: () => onNavigate('dashboard') },
            { label: 'Export Logs', icon: Icons.History, onClick: () => onNotify('Export history is visible in Settings and Logs.') },
          ];

  return (
    <div className="shrink-0 h-11 px-4 bg-[#0b0e17] border-b border-[#202538] flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-7 h-7 rounded-md bg-[#151a2b] border border-[#252c47] text-[var(--primary)] flex items-center justify-center shrink-0">
          <Icon size={14} />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-bold text-white truncate">{current.title}</div>
          <div className="text-[10px] text-gray-500 truncate">{current.hint}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {activeScreen === 'builder' && (
          <span className="text-[10px] px-2 py-1 rounded-full bg-[#1c223c] text-gray-300 font-semibold">
            Health {designHealthScore}
          </span>
        )}
        {actions.map((action) => (
          <ContextButton key={action.label} action={action} />
        ))}
      </div>
    </div>
  );
}

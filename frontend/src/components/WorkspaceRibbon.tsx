import React, { useState } from 'react';
import * as Icons from 'lucide-react';

type WorkspaceScreen = 'dashboard' | 'builder' | 'export' | 'settings';
type RibbonTab = 'file' | 'design' | 'preview' | 'export' | 'view';

interface WorkspaceRibbonProps {
  activeScreen: WorkspaceScreen;
  hasActiveTheme: boolean;
  activeThemeName?: string;
  previewMode: 'light' | 'dark';
  onNavigate: (screen: WorkspaceScreen) => void;
  onCreateBlueprint: () => void;
  onImportTokens: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSetBuilderStep: (step: number) => void;
  onTogglePreviewMode: () => void;
  onNotify: (message: string) => void;
}

interface RibbonCommand {
  label: string;
  detail?: string;
  icon: React.ElementType;
  disabled?: boolean;
  primary?: boolean;
  onClick: () => void;
}

interface RibbonGroup {
  title: string;
  commands: RibbonCommand[];
}

const ribbonTabs: Array<{ id: RibbonTab; label: string }> = [
  { id: 'file', label: 'File' },
  { id: 'design', label: 'Design' },
  { id: 'preview', label: 'Preview' },
  { id: 'export', label: 'Export' },
  { id: 'view', label: 'View' },
];

function RibbonButton({ command }: { command: RibbonCommand }) {
  const Icon = command.icon;

  return (
    <button
      type="button"
      disabled={command.disabled}
      title={command.detail || command.label}
      onClick={command.onClick}
      className={`min-w-[74px] h-[58px] px-2.5 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${
        command.disabled
          ? 'bg-[#101421] border-[#202538] text-gray-600 cursor-not-allowed'
          : command.primary
            ? 'bg-[var(--primary)] border-[var(--primary)] text-white shadow-[var(--shadow-button)] hover:bg-[var(--primary-hover)] active:translate-y-px'
            : 'bg-[#121625] border-[#202538] text-gray-300 hover:text-white hover:bg-[#171c2f] hover:border-[#30385a] active:translate-y-px'
      }`}
    >
      <Icon size={17} />
      <span className="text-[10px] font-semibold leading-none text-center">{command.label}</span>
    </button>
  );
}

export function WorkspaceRibbon({
  activeScreen,
  hasActiveTheme,
  activeThemeName,
  previewMode,
  onNavigate,
  onCreateBlueprint,
  onImportTokens,
  onSetBuilderStep,
  onTogglePreviewMode,
  onNotify,
}: WorkspaceRibbonProps) {
  const [activeTab, setActiveTab] = useState<RibbonTab>('file');

  const commandGroups: Record<RibbonTab, RibbonGroup[]> = {
    file: [
      {
        title: 'Project',
        commands: [
          { label: 'New', detail: 'Create a guided blueprint', icon: Icons.Plus, primary: true, onClick: onCreateBlueprint },
          { label: 'Home', detail: 'Open the theme workspace', icon: Icons.LayoutDashboard, onClick: () => onNavigate('dashboard') },
          { label: 'Settings', detail: 'Open settings and logs', icon: Icons.Sliders, onClick: () => onNavigate('settings') },
        ],
      },
      {
        title: 'Import',
        commands: [
          { label: 'Tokens', detail: 'Import JSON, CSS, Tailwind, or text token files', icon: Icons.Upload, onClick: () => document.getElementById('ribbon-token-import')?.click() },
          { label: 'Reset', detail: 'Reset workspace layout is planned for Phase 9', icon: Icons.RotateCcw, onClick: () => onNotify('Workspace reset will arrive with docked panel layout controls.') },
        ],
      },
    ],
    design: [
      {
        title: 'Style Steps',
        commands: [
          { label: 'Identity', icon: Icons.Tag, disabled: !hasActiveTheme, onClick: () => { onSetBuilderStep(0); onNavigate('builder'); } },
          { label: 'Colours', icon: Icons.Palette, disabled: !hasActiveTheme, onClick: () => { onSetBuilderStep(1); onNavigate('builder'); } },
          { label: 'Fonts', icon: Icons.Type, disabled: !hasActiveTheme, onClick: () => { onSetBuilderStep(2); onNavigate('builder'); } },
          { label: 'Spacing', icon: Icons.Grid, disabled: !hasActiveTheme, onClick: () => { onSetBuilderStep(3); onNavigate('builder'); } },
          { label: 'Effects', icon: Icons.Layers, disabled: !hasActiveTheme, onClick: () => { onSetBuilderStep(4); onNavigate('builder'); } },
          { label: 'Motion', icon: Icons.Activity, disabled: !hasActiveTheme, onClick: () => { onSetBuilderStep(6); onNavigate('builder'); } },
        ],
      },
    ],
    preview: [
      {
        title: 'Canvas',
        commands: [
          { label: previewMode === 'dark' ? 'Light' : 'Dark', detail: 'Toggle preview mode', icon: previewMode === 'dark' ? Icons.Sun : Icons.Moon, disabled: !hasActiveTheme, onClick: onTogglePreviewMode },
          { label: 'Builder', detail: 'Open the live builder and preview', icon: Icons.Monitor, disabled: !hasActiveTheme, onClick: () => onNavigate('builder') },
          { label: 'Present', detail: 'Present mode is planned for Phase 9', icon: Icons.Presentation, disabled: !hasActiveTheme, onClick: () => onNotify('Present mode will use the preview surface as a clean client-facing view.') },
        ],
      },
      {
        title: 'Inspect',
        commands: [
          { label: 'States', detail: 'Inspect loading, empty, error, and other app states', icon: Icons.ListChecks, disabled: !hasActiveTheme, onClick: () => onNotify('Open Builder, then use the preview tabs on the right to inspect States.') },
          { label: 'Patterns', detail: 'Inspect Mobbin-style screen patterns', icon: Icons.LayoutTemplate, disabled: !hasActiveTheme, onClick: () => onNotify('Open Builder, then use the preview tabs on the right to inspect Patterns.') },
        ],
      },
    ],
    export: [
      {
        title: 'AI Handoff',
        commands: [
          { label: 'Export', detail: 'Open Export Centre', icon: Icons.Download, primary: true, disabled: !hasActiveTheme, onClick: () => onNavigate('export') },
          { label: 'Google', detail: 'Use the Google AI Studio prompt', icon: Icons.Bot, disabled: !hasActiveTheme, onClick: () => onNavigate('export') },
          { label: 'Codex', detail: 'Use the Codex prompt', icon: Icons.TerminalSquare, disabled: !hasActiveTheme, onClick: () => onNavigate('export') },
          { label: 'Templates', detail: 'Export starter templates', icon: Icons.PackagePlus, disabled: !hasActiveTheme, onClick: () => onNavigate('export') },
        ],
      },
    ],
    view: [
      {
        title: 'Workspace',
        commands: [
          { label: 'Beginner', detail: 'Beginner density is planned for Phase 9', icon: Icons.UserRound, onClick: () => onNotify('Beginner workspace density will keep guidance visible and panels relaxed.') },
          { label: 'Pro', detail: 'Pro density is planned for Phase 9', icon: Icons.Briefcase, onClick: () => onNotify('Pro workspace density will show more commands and compact panel controls.') },
          { label: 'Compact', detail: 'Compact density is planned for Phase 9', icon: Icons.Minimize2, onClick: () => onNotify('Compact workspace density will preserve more canvas space.') },
          { label: 'Panels', detail: 'Docked panel controls are planned for Phase 9', icon: Icons.PanelRightOpen, onClick: () => onNotify('Docked and collapsible panels are the next shell step.') },
        ],
      },
    ],
  };

  return (
    <div className="shrink-0 bg-[#0f121e] border-b border-[#202538] text-gray-200">
      <input id="ribbon-token-import" type="file" accept=".json,.css,.ts,.js,.txt,application/json,text/css" onChange={onImportTokens} className="hidden" />

      <div className="h-9 px-4 flex items-center justify-between border-b border-[#202538] bg-[#0b0e17]">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-md bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
            <Icons.Paintbrush size={15} />
          </span>
          <span className="text-xs font-bold uppercase tracking-wide text-white">App Style Studio</span>
          <span className="text-[10px] text-gray-500">Portable</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button type="button" title="New blueprint" onClick={onCreateBlueprint} className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-[#171c2f]">
            <Icons.Plus size={14} />
          </button>
          <button type="button" title="Import tokens" onClick={() => document.getElementById('ribbon-token-import')?.click()} className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-[#171c2f]">
            <Icons.Upload size={14} />
          </button>
          <button type="button" title="Export" disabled={!hasActiveTheme} onClick={() => onNavigate('export')} className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-[#171c2f] disabled:opacity-40 disabled:cursor-not-allowed">
            <Icons.Download size={14} />
          </button>
          <div className="h-4 w-px bg-[#2b3352] mx-1" />
          <span className="text-[10px] text-gray-400 max-w-[220px] truncate">
            {activeThemeName || 'No active theme'} / {activeScreen} / {previewMode}
          </span>
        </div>
      </div>

      <div className="px-4 flex items-end gap-1 border-b border-[#202538]">
        {ribbonTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all ${
              activeTab === tab.id
                ? 'bg-[#151a2b] text-white border-x border-t border-[#2a3150]'
                : 'text-gray-400 hover:text-white hover:bg-[#131827]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="px-4 py-3 flex gap-3 overflow-x-auto">
        {commandGroups[activeTab].map((group) => (
          <div key={group.title} className="flex items-stretch gap-2 pr-3 border-r border-[#202538] last:border-r-0">
            <div className="flex gap-2">
              {group.commands.map((command) => (
                <RibbonButton key={`${group.title}-${command.label}`} command={command} />
              ))}
            </div>
            <div className="self-end pb-0.5 text-[9px] font-bold uppercase tracking-wider text-gray-500 min-w-[54px]">
              {group.title}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

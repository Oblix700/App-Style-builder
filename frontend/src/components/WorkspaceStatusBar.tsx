import * as Icons from 'lucide-react';
import type { ElementType } from 'react';

type WorkspaceScreen = 'dashboard' | 'builder' | 'export' | 'settings';

interface WorkspaceStatusBarProps {
  activeScreen: WorkspaceScreen;
  activeThemeName?: string;
  previewMode: 'light' | 'dark';
  designHealthScore: number;
  designHealthStatus: string;
  hasActiveTheme: boolean;
  themeCount: number;
  exportLogCount: number;
}

function StatusItem({
  icon: Icon,
  label,
  value,
  tone = 'neutral',
}: {
  icon: ElementType;
  label: string;
  value: string;
  tone?: 'neutral' | 'success' | 'warning' | 'primary';
}) {
  const toneClass = {
    neutral: 'text-gray-400',
    success: 'text-green-300',
    warning: 'text-amber-300',
    primary: 'text-[var(--primary)]',
  }[tone];

  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <Icon size={12} className={toneClass} />
      <span className="text-gray-500">{label}</span>
      <span className={`font-semibold truncate ${toneClass}`}>{value}</span>
    </div>
  );
}

export function WorkspaceStatusBar({
  activeScreen,
  activeThemeName,
  previewMode,
  designHealthScore,
  designHealthStatus,
  hasActiveTheme,
  themeCount,
  exportLogCount,
}: WorkspaceStatusBarProps) {
  const exportReady = hasActiveTheme && designHealthScore >= 65;
  const healthTone = designHealthScore >= 85 ? 'success' : designHealthScore >= 65 ? 'warning' : 'neutral';

  return (
    <div className="h-7 shrink-0 px-3 bg-[#090c14] border-t border-[#202538] text-[10px] flex items-center justify-between gap-3 select-none">
      <div className="flex items-center gap-4 min-w-0 overflow-hidden">
        <StatusItem
          icon={Icons.Database}
          label="Local DB"
          value="connected"
          tone="success"
        />
        <StatusItem
          icon={Icons.Save}
          label="Autosave"
          value={hasActiveTheme ? 'local' : 'waiting'}
          tone={hasActiveTheme ? 'success' : 'neutral'}
        />
        <StatusItem
          icon={Icons.Paintbrush}
          label="Theme"
          value={activeThemeName || 'none selected'}
          tone={hasActiveTheme ? 'primary' : 'neutral'}
        />
        <StatusItem
          icon={previewMode === 'dark' ? Icons.Moon : Icons.Sun}
          label="Preview"
          value={previewMode}
          tone="primary"
        />
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <StatusItem
          icon={Icons.Activity}
          label="Health"
          value={hasActiveTheme ? `${designHealthScore} ${designHealthStatus}` : 'n/a'}
          tone={hasActiveTheme ? healthTone : 'neutral'}
        />
        <StatusItem
          icon={Icons.PackageCheck}
          label="Export"
          value={exportReady ? 'ready' : 'not ready'}
          tone={exportReady ? 'success' : 'warning'}
        />
        <StatusItem
          icon={Icons.FolderOpen}
          label="Themes"
          value={String(themeCount)}
        />
        <StatusItem
          icon={Icons.History}
          label="Logs"
          value={String(exportLogCount)}
        />
        <span className="px-2 py-0.5 rounded bg-[#151a2b] border border-[#252c47] text-gray-400 uppercase font-bold">
          {activeScreen}
        </span>
      </div>
    </div>
  );
}

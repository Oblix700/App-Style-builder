import * as Icons from 'lucide-react';
import { ExportTabId } from './exportCentreConfig';

interface ExportCentreToolbarProps {
  filename?: string;
  activeTab: ExportTabId;
  copied: boolean;
  archiveStatus: string | null;
  handoffStatus: string | null;
  fullHandoffStatus: string | null;
  starterTemplateStatus: string | null;
  saveStatus: string | null;
  onExportZip: () => void;
  onExportAiHandoffZip: () => void;
  onExportFullHandoffZip: () => void;
  onExportStarterTemplatesZip: () => void;
  onCopy: () => void;
  onSaveFile: () => void;
}

export function ExportCentreToolbar({
  filename,
  activeTab,
  copied,
  archiveStatus,
  handoffStatus,
  fullHandoffStatus,
  starterTemplateStatus,
  saveStatus,
  onExportZip,
  onExportAiHandoffZip,
  onExportFullHandoffZip,
  onExportStarterTemplatesZip,
  onCopy,
  onSaveFile,
}: ExportCentreToolbarProps) {
  return (
    <div className="flex justify-between items-center px-4 py-3 bg-[#181d31] border-b border-[#202538]">
      <span className="text-xs font-semibold text-gray-400 tracking-wider font-mono">{filename}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={onExportZip}
          className="px-3 py-1.5 text-xs font-semibold rounded bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center gap-1.5 active:scale-95 border border-indigo-500 cursor-pointer"
        >
          <Icons.FolderArchive size={14} />
          {archiveStatus ? archiveStatus : 'Export Stack ZIP'}
        </button>
        <button
          onClick={onExportAiHandoffZip}
          className="px-3 py-1.5 text-xs font-semibold rounded bg-[#1e233c] hover:bg-[#252c4a] border border-[#2d3558] text-gray-200 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
        >
          <Icons.Bot size={14} />
          {handoffStatus ? handoffStatus : 'AI Handoff ZIP'}
        </button>
        <button
          onClick={onExportFullHandoffZip}
          className="px-3 py-1.5 text-xs font-semibold rounded bg-emerald-700 hover:bg-emerald-600 border border-emerald-600 text-white transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
        >
          <Icons.PackageCheck size={14} />
          {fullHandoffStatus ? fullHandoffStatus : 'Full Handoff ZIP'}
        </button>
        <button
          onClick={onExportStarterTemplatesZip}
          className="px-3 py-1.5 text-xs font-semibold rounded bg-amber-600 hover:bg-amber-500 border border-amber-500 text-white transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
        >
          <Icons.LayoutTemplate size={14} />
          {starterTemplateStatus ? starterTemplateStatus : 'Starter ZIP'}
        </button>
        <button
          onClick={onCopy}
          className="px-3 py-1.5 text-xs font-semibold rounded bg-[#1e233c] hover:bg-[#252c4a] border border-[#2d3558] text-gray-200 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
        >
          {copied ? <Icons.Check size={14} className="text-green-400" /> : <Icons.Copy size={14} />}
          Copy Code
        </button>
        {activeTab !== 'ai-prompt' && (
          <button
            onClick={onSaveFile}
            className="px-3 py-1.5 text-xs font-semibold rounded bg-[var(--primary)] hover:opacity-90 text-white transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Icons.Save size={14} />
            {saveStatus ? saveStatus : 'Save File'}
          </button>
        )}
      </div>
    </div>
  );
}

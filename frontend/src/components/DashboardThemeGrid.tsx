import React from 'react';
import * as Icons from 'lucide-react';
import { Theme } from '../types';

interface DashboardThemeGridProps {
  themes: Theme[];
  onSelectTheme: (themeId: number) => void;
  onDuplicateTheme: (themeId: number, event: React.MouseEvent) => void;
  onDeleteTheme: (themeId: number, event: React.MouseEvent) => void;
}

export function DashboardThemeGrid({
  themes,
  onSelectTheme,
  onDuplicateTheme,
  onDeleteTheme,
}: DashboardThemeGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {themes.length === 0 ? (
        <div className="col-span-full py-16 text-center bg-[#0f121e] border border-[#202538] rounded-xl flex flex-col items-center justify-center gap-2">
          <Icons.FolderOpen size={40} className="text-gray-600" />
          <p className="text-sm font-semibold">No themes created yet</p>
          <p className="text-xs text-gray-500">Click the 'Create Theme' button to get started.</p>
        </div>
      ) : (
        themes.map((theme) => (
          <div
            key={theme.id}
            onClick={() => onSelectTheme(theme.id)}
            className="p-5 bg-[#0f121e] border border-[#202538] hover:border-[var(--primary)] hover:shadow-2xl rounded-xl cursor-pointer transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-base text-white group-hover:text-[var(--primary)] transition-colors">{theme.name}</h3>
                  <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">{theme.app_type}</span>
                </div>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                  theme.default_mode.toLowerCase() === 'dark' ? 'bg-indigo-950 text-indigo-400' : 'bg-amber-950/60 text-amber-400'
                }`}>
                  {theme.default_mode}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-6">
                <span className="text-[9px] px-2 py-0.5 rounded bg-[#1c223c] text-gray-300 font-semibold uppercase">{theme.style_mood}</span>
                <span className="text-[9px] px-2 py-0.5 rounded bg-[#1c223c] text-gray-300 font-semibold uppercase">{theme.density}</span>
                <span className="text-[9px] px-2 py-0.5 rounded bg-[#1c223c] text-gray-300 font-semibold uppercase">{theme.component_style}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[#202538]">
              <span className="text-[10px] text-gray-500">Edited {new Date(theme.updated_at).toLocaleDateString()}</span>
              <div className="flex gap-2">
                <button
                  onClick={(event) => onDuplicateTheme(theme.id, event)}
                  title="Duplicate Theme"
                  className="p-1.5 bg-[#171c30] border border-[#232c49] rounded hover:bg-[#202844] text-gray-300 transition-all"
                >
                  <Icons.Copy size={12} />
                </button>
                <button
                  onClick={(event) => onDeleteTheme(theme.id, event)}
                  title="Delete Theme"
                  className="p-1.5 bg-[#171c30] border border-[#232c49] rounded hover:bg-red-950/80 text-red-400 hover:text-red-200 hover:border-red-900 transition-all"
                >
                  <Icons.Trash size={12} />
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

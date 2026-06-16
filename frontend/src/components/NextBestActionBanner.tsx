import React from 'react';
import * as Icons from 'lucide-react';

interface NextBestActionBannerProps {
  title: string;
  description: string;
  button: string;
  icon: React.ElementType;
  onAction: () => void;
  secondary?: string;
  onSecondary?: () => void;
}

export function NextBestActionBanner({
  title,
  description,
  button,
  icon: Icon,
  onAction,
  secondary,
  onSecondary,
}: NextBestActionBannerProps) {
  return (
    <div className="rounded-xl border border-[#202538] bg-[#101422] p-4 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#1a1f35] border border-[#252c47] flex items-center justify-center text-[var(--primary)] shrink-0">
          <Icon size={17} />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--primary)]">Next best action</div>
          <h3 className="text-sm font-bold text-white mt-0.5">{title}</h3>
          <p className="text-[11px] text-gray-400 leading-relaxed mt-1">{description}</p>
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        {secondary && onSecondary && (
          <button
            type="button"
            onClick={onSecondary}
            className="px-3 py-1.5 bg-[#1a1e32] border border-[#242b47] hover:bg-[#202640] rounded-lg text-gray-300 text-xs font-semibold"
          >
            {secondary}
          </button>
        )}
        <button
          type="button"
          onClick={onAction}
          className="px-3.5 py-1.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
        >
          {button}
          <Icons.ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}

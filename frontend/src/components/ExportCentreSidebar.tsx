import { ExportTabId, ExportTabItem } from './exportCentreConfig';

interface ExportCentreSidebarSectionProps {
  title: string;
  items: ExportTabItem[];
  activeTab: ExportTabId;
  onSelect: (tab: ExportTabId) => void;
  withDivider?: boolean;
}

export function ExportCentreSidebarSection({
  title,
  items,
  activeTab,
  onSelect,
  withDivider = false,
}: ExportCentreSidebarSectionProps) {
  return (
    <>
      <div className={`text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2 mb-1 ${withDivider ? 'mt-4 border-t border-[#202538] pt-3' : ''}`}>
        {title}
      </div>
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
            activeTab === item.id
              ? 'bg-[#1a1f35] text-[var(--primary)] border-l-4 border-[var(--primary)]'
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#131625]'
          }`}
        >
          {item.name}
        </button>
      ))}
    </>
  );
}

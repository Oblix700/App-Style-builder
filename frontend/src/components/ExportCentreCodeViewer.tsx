import React from 'react';

interface ExportCentreCodeViewerProps {
  value: string;
  children: React.ReactNode;
}

export function ExportCentreCodeViewer({ value, children }: ExportCentreCodeViewerProps) {
  return (
    <div className="lg:col-span-3 flex flex-col bg-[#141829] border border-[#202538] rounded-xl overflow-hidden shadow-2xl">
      {children}
      <div className="flex-1 p-4 overflow-hidden relative">
        <textarea
          readOnly
          value={value}
          className="w-full h-full bg-transparent text-gray-300 font-mono text-xs focus:outline-none resize-none overflow-y-auto leading-relaxed select-all"
        />
      </div>
    </div>
  );
}

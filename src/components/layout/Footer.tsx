import React from 'react';
import { ProvenanceBadge } from '../common/ProvenanceBadge';

export const Footer: React.FC = () => {
  return (
    <footer className="h-16 mt-auto border-t border-white/[0.08] bg-[#080B11]/90 backdrop-blur-xl px-6 flex items-center text-xs text-slate-400 select-none">
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <img src="/respire-emblem.png" alt="RESPIRE" className="w-4 h-4 object-contain" />
          <span className="font-extrabold text-white tracking-tight">RESPIRE</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400 text-[11px]">Greater Chennai Corporation Climate Resilience Platform</span>
        </div>

        <div className="flex items-center flex-wrap gap-2 text-[10px]">
          <span className="text-slate-500 font-mono font-medium">Data Provenance Standards:</span>
          <ProvenanceBadge status="SOURCED" />
          <ProvenanceBadge status="DERIVED" />
          <ProvenanceBadge status="INDICATIVE_ESTIMATE" />
          <ProvenanceBadge status="ASSUMPTION" />
        </div>
      </div>
    </footer>
  );
};

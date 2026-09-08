import React from 'react';

/**
 * Modern High-Tech RESPIRE Risk Band Legend
 * 
 * Accurately displays the 4 quantitative risk bands plus the
 * INSUFFICIENT_EVIDENCE state with modern glassmorphism.
 */
export const RiskLegend: React.FC = () => {
  const bands = [
    {
      label: 'VERY HIGH',
      range: '75 – 100',
      color: 'bg-rose-500',
      glow: 'shadow-rose-500/50',
      border: 'border-rose-400/50',
      badge: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    },
    {
      label: 'HIGH',
      range: '50 – 74.9',
      color: 'bg-orange-500',
      glow: 'shadow-orange-500/50',
      border: 'border-orange-400/50',
      badge: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
    },
    {
      label: 'MODERATE',
      range: '25 – 49.9',
      color: 'bg-amber-400',
      glow: 'shadow-amber-400/50',
      border: 'border-amber-300/50',
      badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    },
    {
      label: 'LOW',
      range: '0 – 24.9',
      color: 'bg-emerald-500',
      glow: 'shadow-emerald-500/50',
      border: 'border-emerald-400/50',
      badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    },
    {
      label: 'INSUFFICIENT',
      range: 'Missing / Null',
      color: 'bg-slate-600',
      glow: 'shadow-slate-500/30',
      border: 'border-dashed border-slate-500',
      badge: 'bg-white/[0.04] text-slate-400 border-white/[0.08]',
    },
  ] as const;

  return (
    <div
      aria-label="Risk Score Legend"
      className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3 flex flex-wrap items-center justify-between gap-3 text-xs backdrop-blur-md"
    >
      <div className="flex items-center space-x-2">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
        <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
          Classification Legend:
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {bands.map((band) => (
          <div key={band.label} className="flex items-center space-x-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${band.color} border ${band.border} shadow-xs ${band.glow} inline-block shrink-0`}
            />
            <span className="font-bold text-[11px] text-slate-300">
              {band.label}
            </span>
            <span className="font-mono text-[10px] text-slate-500">
              ({band.range})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

import React from 'react';
import { TrendingDown, ShieldCheck, ArrowRight, Copy } from 'lucide-react';
import { CardActionMenu } from '../common/CardActionMenu';

interface CostSparklineCardProps {
  onNavigateToPrioritize?: () => void;
}

/**
 * Displays indicative intervention costs and cooling efficiency delta metrics.
 */
export const CostSparklineCard: React.FC<CostSparklineCardProps> = ({
  onNavigateToPrioritize,
}) => {
  return (
    <div
      onClick={onNavigateToPrioritize}
      className="aero-card aero-card-hover p-3.5 select-none flex flex-col justify-between cursor-pointer group h-full overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start justify-between pb-2 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center space-x-1.5">
            <h4 className="text-xs font-bold text-white tracking-tight">
              Cooling Efficiency
            </h4>
            <span className="flex items-center text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/15 px-1.5 py-0.2 rounded border border-emerald-500/30">
              <TrendingDown className="w-2.5 h-2.5 mr-0.5" />
              -4.5°C
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Benchmark Intervention Cost
          </p>
        </div>

        <CardActionMenu
          title="Cooling Cost Efficiency Options"
          items={[
            {
              label: 'Inspect Capital Funding (Phase 4)',
              icon: ArrowRight,
              onClick: () => onNavigateToPrioritize?.(),
            },
            {
              label: 'Copy Efficiency Metrics',
              icon: Copy,
              onClick: () => {
                navigator.clipboard?.writeText(
                  'Cooling Efficiency: -4.5°C reduction per unit intervention (Benchmark: ₹72,000 / site · Indicative Estimate)'
                );
              },
            },
          ]}
        />
      </div>

      {/* Sparkline Graphic (Glowing Emerald Curve matching Jet Fuel in reference) */}
      <div className="my-2 h-14 w-full relative">
        <svg viewBox="0 0 200 60" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Area under curve */}
          <path
            d="M 0 45 Q 35 20, 70 35 T 140 18 T 200 25 L 200 60 L 0 60 Z"
            fill="url(#emeraldGrad)"
          />

          {/* Glowing Stroke Curve */}
          <path
            d="M 0 45 Q 35 20, 70 35 T 140 18 T 200 25"
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="drop-shadow-[0_0_8px_rgba(16,185,129,0.7)]"
          />
        </svg>
      </div>

      {/* Main Metric Stat */}
      <div className="pt-2 border-t border-white/[0.06] flex items-baseline justify-between">
        <div className="flex items-baseline space-x-1.5">
          <span className="text-2xl font-extrabold text-white font-mono tracking-tight">
            ₹72,000
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            / station
          </span>
        </div>

        <div className="flex items-center space-x-1 text-[9px] font-mono text-emerald-400">
          <ShieldCheck className="w-3 h-3" />
          <span>INDICATIVE</span>
        </div>
      </div>
    </div>
  );
};

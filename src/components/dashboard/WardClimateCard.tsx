import React from 'react';
import {
  Wind,
  Sun,
  MapPin,
  Flame,
  Info,
  Copy,
} from 'lucide-react';
import type { ScoredZoneItem } from './RiskSummaryCards';
import { CardActionMenu } from '../common/CardActionMenu';

interface WardClimateCardProps {
  selectedZoneItem?: ScoredZoneItem;
  onNavigateToExplain?: () => void;
}

export const WardClimateCard: React.FC<WardClimateCardProps> = ({
  selectedZoneItem,
  onNavigateToExplain,
}) => {
  const zone = selectedZoneItem?.zone;
  const score = selectedZoneItem?.score;

  const wardId = zone?.wardId || 'ward-045';
  const totalScore = score?.totalScore !== null && score?.totalScore !== undefined ? score.totalScore.toFixed(0) : '—';
  const riskBand = score?.riskBand ?? score?.riskLevel ?? 'VERY_HIGH';

  // Derived or simulated telemetry based on real zone metrics
  const lst = zone?.metrics?.heat?.lst?.value ?? 41.2;
  const highTemp = Math.round(lst + 1.8);
  const lowTemp = Math.round(lst - 10.5);

  const isInsufficient = riskBand === 'INSUFFICIENT_EVIDENCE' || score?.totalScore === null;

  const cleanName = (zone?.zoneName || zone?.name || 'Vyasarpadi').replace(/^(Ward\s*\d+\s*[-–:]\s*)/i, '');
  const displayTitle = `${wardId.toUpperCase()} · ${cleanName}`;

  return (
    <div className="aero-card aero-card-hover p-4 select-none flex flex-col justify-between h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between pb-2 border-b border-white/[0.06]">
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-1.5">
            <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            <h4 className="text-xs font-bold text-white tracking-tight uppercase truncate">
              {displayTitle}
            </h4>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5 truncate">
            GCC Urban Microclimate Telemetry
          </p>
        </div>

        <CardActionMenu
          title="Microclimate Telemetry Options"
          items={[
            {
              label: 'Explain Risk Drivers (Phase 2)',
              icon: Info,
              onClick: () => onNavigateToExplain?.(),
            },
            {
              label: 'Copy Ward Telemetry Data',
              icon: Copy,
              onClick: () => {
                const text = `${displayTitle}: Temp ${lst}°C (H:${highTemp}° L:${lowTemp}°), Risk ${totalScore}/100 [${riskBand}]`;
                navigator.clipboard?.writeText(text);
              },
            },
          ]}
        />
      </div>

      {/* Main Metric: Huge Temp + Condition */}
      <div className="py-2 flex items-center justify-between gap-2">
        <div className="flex items-baseline space-x-2.5 min-w-0">
          <span className="text-4xl font-extrabold text-white tracking-tight font-mono shrink-0">
            {isInsufficient ? '—' : `${lst.toFixed(1)}°`}
          </span>
          <div className="min-w-0">
            <div className="flex items-center space-x-1 text-amber-400 text-xs font-semibold whitespace-nowrap">
              <Sun className="w-3.5 h-3.5 shrink-0" />
              <span>{isInsufficient ? 'Sensors Offline' : 'Extreme Heat'}</span>
            </div>
            {!isInsufficient && (
              <p className="text-[10px] text-slate-400 mt-0.5 font-mono whitespace-nowrap">
                H:{highTemp}° L:{lowTemp}°
              </p>
            )}
          </div>
        </div>

        {/* Risk Score Pill */}
        <div className="text-right shrink-0">
          <span className="text-[9px] text-slate-400 block font-mono">Risk Score</span>
          <span className="text-lg font-extrabold font-mono text-rose-400 block">
            {totalScore} <span className="text-[10px] font-normal text-slate-400">/ 100</span>
          </span>
        </div>
      </div>

      {/* Footer: Wind telemetry + Status Badge (Matching VFR Pill in reference) */}
      <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center space-x-1.5 text-[11px] text-slate-300">
          <Wind className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-mono">SW 14 km/h</span>
        </div>

        {/* Status Pill matching VFR Green Pill in reference */}
        {isInsufficient ? (
          <button
            type="button"
            onClick={onNavigateToExplain}
            className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-400 hover:text-slate-200 font-mono text-[10px] font-bold border border-slate-700 transition-colors cursor-pointer"
            title="Inspect Missing Telemetry"
          >
            INSUFFICIENT DATA
          </button>
        ) : riskBand === 'VERY_HIGH' ? (
          <button
            type="button"
            onClick={onNavigateToExplain}
            className="flex items-center space-x-1 px-2.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 font-mono text-[10px] font-extrabold border border-rose-500/40 transition-colors cursor-pointer"
            title="Explain Very High Risk Drivers"
          >
            <Flame className="w-3 h-3 text-rose-400" />
            <span>CRITICAL RISK</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onNavigateToExplain}
            className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-mono text-[10px] font-extrabold border border-emerald-500/40 transition-colors cursor-pointer"
            title="Explain Risk Drivers"
          >
            {riskBand} RISK
          </button>
        )}
      </div>
    </div>
  );
};

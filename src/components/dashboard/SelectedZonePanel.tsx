import React from 'react';
import { MapPin, Info, AlertTriangle, CheckCircle2, FileQuestion, ArrowRight } from 'lucide-react';
import type { Zone, RiskScoreResult } from '../../types';
import { ScoreBreakdown } from './ScoreBreakdown';

interface SelectedZonePanelProps {
  selectedZone?: Zone;
  score?: RiskScoreResult | null;
  onNavigateToExplain?: () => void;
}

/**
 * Modern High-Tech Municipal Intelligence Panel for Selected Ward
 */
export const SelectedZonePanel: React.FC<SelectedZonePanelProps> = ({
  selectedZone,
  score,
  onNavigateToExplain,
}) => {
  if (!selectedZone) {
    return (
      <div className="aero-card p-6 text-center text-slate-500 space-y-3 shadow-2xl h-full flex flex-col items-center justify-center select-none">
        <div className="h-12 w-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-slate-500">
          <MapPin className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-slate-300">No Ward Selected</p>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          Click any ward node on the Chennai Heat Risk Map or Priority Queue to inspect its spatial and vulnerability profile.
        </p>
      </div>
    );
  }

  const isInsufficient =
    !score ||
    score.totalScore === null ||
    score.riskLevel === 'INSUFFICIENT_DATA' ||
    score.riskLevel === 'INSUFFICIENT_EVIDENCE' ||
    score.riskBand === 'INSUFFICIENT_EVIDENCE';
  const totalScoreVal = score?.totalScore ?? null;

  // Resolve badge styles
  let bandBadgeColor = 'bg-white/[0.06] text-slate-300 border-white/[0.08]';
  let scoreColor = 'text-slate-100';
  let bandLabel = 'INSUFFICIENT EVIDENCE';

  if (!isInsufficient && totalScoreVal !== null) {
    if (score.riskLevel === 'VERY_HIGH') {
      bandBadgeColor = 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      scoreColor = 'text-rose-400';
      bandLabel = 'VERY HIGH RISK';
    } else if (score.riskLevel === 'HIGH') {
      bandBadgeColor = 'bg-orange-500/15 text-orange-300 border-orange-500/30';
      scoreColor = 'text-orange-400';
      bandLabel = 'HIGH RISK';
    } else if (score.riskLevel === 'MODERATE') {
      bandBadgeColor = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      scoreColor = 'text-amber-300';
      bandLabel = 'MODERATE RISK';
    } else {
      bandBadgeColor = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      scoreColor = 'text-emerald-400';
      bandLabel = 'LOW RISK';
    }
  }

  return (
    <div className="aero-card p-4 space-y-3 shadow-2xl transition-all h-full flex flex-col justify-between overflow-y-auto select-none">
      {/* Zone Header Info */}
      <div className="border-b border-white/[0.06] pb-2.5 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/[0.05] text-slate-400 border border-white/[0.08]">
            {selectedZone.zoneId || selectedZone.id}
          </span>
          <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            {selectedZone.dataSourceLabel || 'Illustrative Demo Data'}
          </span>
        </div>

        <h3 className="text-base font-extrabold text-white tracking-tight">
          {selectedZone.zoneName || selectedZone.name}
        </h3>

        <p className="text-xs text-slate-400 flex items-center space-x-1.5">
          <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
          <span className="font-medium">{selectedZone.wardName || `Ward ${selectedZone.wardId}`}</span>
          {selectedZone.areaKm2 && (
            <span className="text-slate-500 font-mono text-[11px]">
              · {selectedZone.areaKm2} km²
            </span>
          )}
        </p>
      </div>

      {/* Primary Score Hero Card */}
      <div className="rounded-xl p-3 bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/[0.08] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Urban Heat Priority Score
          </span>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${bandBadgeColor}`}>
            {bandLabel}
          </span>
        </div>

        <div className="flex items-baseline space-x-2">
          {!isInsufficient ? (
            <>
              <span className={`text-3xl font-extrabold font-mono tracking-tight ${scoreColor}`}>
                {totalScoreVal?.toFixed(1)}
              </span>
              <span className="text-xs text-slate-500 font-mono">/ 100 max</span>
            </>
          ) : (
            <div className="flex items-center space-x-2 py-0.5 text-amber-400">
              <FileQuestion className="w-5 h-5 shrink-0" />
              <span className="text-sm font-semibold">Insufficient Evidence</span>
            </div>
          )}
        </div>

        {/* Modern Segmented Progress Gauge */}
        <div className="space-y-1">
          <div className="relative w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            {!isInsufficient && totalScoreVal !== null ? (
              <div
                className={`h-full ${
                  totalScoreVal >= 75
                    ? 'bg-gradient-to-r from-orange-500 to-rose-500'
                    : totalScoreVal >= 50
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                    : totalScoreVal >= 25
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-500'
                    : 'bg-emerald-500'
                } transition-all duration-500 rounded-full`}
                style={{ width: `${Math.min(100, Math.max(0, totalScoreVal))}%` }}
              />
            ) : (
              <div className="h-full w-full bg-slate-800/60 border-t border-dashed border-slate-600/60" />
            )}
          </div>
          <div className="flex justify-between text-[8px] font-mono text-slate-500">
            <span>0 Low</span>
            <span>25 Mod</span>
            <span>50 High</span>
            <span>75 Very High</span>
            <span>100</span>
          </div>
        </div>
      </div>

      {/* Insufficient Evidence Warning Box */}
      {isInsufficient && (
        <div className="rounded-xl p-3 bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 space-y-1">
          <div className="flex items-center space-x-2 font-semibold text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Missing Data / Ground-Truth Scoping Required</span>
          </div>
          <p className="text-[11px] text-amber-200/80 leading-relaxed">
            Some required physical indicators are unavailable, so a reliable risk score cannot be calculated.
          </p>
          {score?.missingComponents && score.missingComponents.length > 0 && (
            <p className="text-[10px] font-mono text-amber-300/80 pt-1 border-t border-amber-500/20">
              Missing: {score.missingComponents.join(', ')}
            </p>
          )}
        </div>
      )}

      {/* Why This Zone? - Causal Drivers */}
      <div className="rounded-xl p-3 bg-white/[0.02] border border-white/[0.06] space-y-2">
        <div className="flex items-center space-x-1.5">
          <Info className="w-3.5 h-3.5 text-orange-400" />
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
            Why this zone?
          </h4>
        </div>

        {!isInsufficient ? (
          <div className="space-y-1.5 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <span className="text-[8px] text-slate-500 block uppercase font-mono font-semibold">Primary Driver</span>
                <span className="font-bold text-slate-200 text-[11px] mt-0.5 block truncate">
                  {score?.whyThisZone?.primaryDriver || 'Balanced Factors'}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <span className="text-[8px] text-slate-500 block uppercase font-mono font-semibold">Secondary Driver</span>
                <span className="font-bold text-slate-200 text-[11px] mt-0.5 block truncate">
                  {score?.whyThisZone?.secondaryDriver || 'None'}
                </span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed border-t border-white/[0.04] pt-1.5 line-clamp-2">
              {score?.whyThisZone?.priorityRationale || score?.explanation}
            </p>
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">
            Insufficient evidence to determine dominant drivers.
          </p>
        )}
      </div>

      {/* Component Breakdown Component */}
      <ScoreBreakdown score={score ?? null} />

      {/* Direct Flow Link to 02 EXPLAIN */}
      {onNavigateToExplain && (
        <button
          type="button"
          onClick={onNavigateToExplain}
          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-orange-500/15 via-orange-500/10 to-transparent border border-orange-500/30 hover:border-orange-500/60 text-orange-300 hover:text-white text-xs font-bold transition-all flex items-center justify-between cursor-pointer group"
        >
          <span>Deep-Dive Causal Drivers</span>
          <span className="flex items-center gap-1 text-[10px] font-mono group-hover:translate-x-0.5 transition-transform">
            02 EXPLAIN WHY <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </button>
      )}

      {/* Metadata & Completeness Footer */}
      <div className="border-t border-white/[0.06] pt-2 flex items-center justify-between text-[10px] text-slate-500 font-mono">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-slate-400" />
          Completeness: {Math.round((score?.completeness ?? 0) * 100)}%
        </span>
        <span>Confidence: {score?.confidence ?? 'NONE'}</span>
      </div>
    </div>
  );
};

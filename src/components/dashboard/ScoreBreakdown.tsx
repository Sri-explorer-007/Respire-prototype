import React from 'react';
import { Thermometer, Trees, Users2 } from 'lucide-react';
import type { RiskScoreResult } from '../../types';

interface ScoreBreakdownProps {
  score: RiskScoreResult | null;
}

/**
 * Modern Visual Score Breakdown Component
 * 
 * Displays the 3 core scoring dimensions:
 * 1. Heat Exposure (50%)
 * 2. Vegetation Deficit (20%)
 * 3. Social Vulnerability (30%)
 * 
 * CRITICAL INTEGRITY:
 * If an indicator is null/missing, it renders "Unavailable" — NEVER 0!
 */
export const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ score }) => {
  const components = [
    {
      id: 'heat',
      name: 'Heat Exposure',
      weight: 50,
      icon: Thermometer,
      normalized: score?.normalizedInputs.heatExposure,
      contribution: score?.heatScore,
      barColor: 'bg-rose-500',
      accentText: 'text-rose-400',
      bgGlow: 'bg-rose-500/10',
    },
    {
      id: 'vegetation',
      name: 'Vegetation Deficit',
      weight: 20,
      icon: Trees,
      normalized: score?.normalizedInputs.vegetationDeficit,
      contribution: score?.vegetationScore,
      barColor: 'bg-emerald-500',
      accentText: 'text-emerald-400',
      bgGlow: 'bg-emerald-500/10',
    },
    {
      id: 'vulnerability',
      name: 'Social Vulnerability',
      weight: 30,
      icon: Users2,
      normalized: score?.normalizedInputs.socialVulnerability,
      contribution: score?.vulnerabilityScore,
      barColor: 'bg-sky-500',
      accentText: 'text-sky-400',
      bgGlow: 'bg-sky-500/10',
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Component Breakdown (100% Total)
        </h4>
        <span className="text-[10px] text-slate-500 font-mono">
          50% Heat · 20% Veg · 30% Vuln
        </span>
      </div>

      <div className="space-y-1.5">
        {components.map((c) => {
          const Icon = c.icon;
          const isMissing =
            c.normalized === null ||
            c.normalized === undefined ||
            c.contribution === null ||
            c.contribution === undefined;
          const progressPercent = typeof c.normalized === 'number'
            ? Math.min(100, Math.max(0, c.normalized * 100))
            : 0;

          return (
            <div
              key={c.id}
              className="rounded-xl p-2 bg-white/[0.02] border border-white/[0.05] space-y-1.5 hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <div className={`p-1 rounded-md ${c.bgGlow} ${c.accentText}`}>
                    <Icon className="w-3 h-3" />
                  </div>
                  <span className="text-xs font-semibold text-slate-200">{c.name}</span>
                  <span className="text-[9px] text-slate-500 font-mono">
                    ({c.weight}%)
                  </span>
                </div>

                <div className="text-right font-mono text-xs">
                  {isMissing ? (
                    <span className="text-amber-400 font-semibold italic text-[10px]">Unavailable</span>
                  ) : (
                    <span className="font-bold text-slate-200 text-xs">
                      {c.contribution !== null && c.contribution !== undefined
                        ? c.contribution.toFixed(1)
                        : 'Unavailable'}{' '}
                      <span className="text-slate-500 text-[9px] font-normal">/ {c.weight} pts</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                {!isMissing ? (
                  <div
                    className={`h-full ${c.barColor} transition-all duration-500 rounded-full`}
                    style={{ width: `${progressPercent}%` }}
                  />
                ) : (
                  <div className="h-full w-full bg-slate-700/40 border-t border-dashed border-slate-600/50" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

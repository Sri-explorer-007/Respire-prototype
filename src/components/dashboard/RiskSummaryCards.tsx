import React from 'react';
import { Layers, AlertTriangle, Flame, AlertCircle, HelpCircle } from 'lucide-react';
import type { Zone, RiskScoreResult } from '../../types';

export interface ScoredZoneItem {
  zone: Zone;
  score: RiskScoreResult;
}

interface RiskSummaryCardsProps {
  scoredZones: ScoredZoneItem[];
}

/**
 * Modern Risk Overview Metric Cards
 * 
 * Computes live totals from actual scoring engine evaluations:
 * Total Zones, Very High Risk, High Risk, Moderate Risk, and Incomplete/Insufficient Evidence.
 * Does NOT hard-code any values.
 */
export const RiskSummaryCards: React.FC<RiskSummaryCardsProps> = ({ scoredZones }) => {
  const total = scoredZones.length;

  const veryHighCount = scoredZones.filter(
    (item) => (item.score.riskBand ?? item.score.riskLevel) === 'VERY_HIGH'
  ).length;
  const highCount = scoredZones.filter(
    (item) => (item.score.riskBand ?? item.score.riskLevel) === 'HIGH'
  ).length;
  const moderateCount = scoredZones.filter(
    (item) => (item.score.riskBand ?? item.score.riskLevel) === 'MODERATE'
  ).length;
  const insufficientCount = scoredZones.filter(
    (item) =>
      (item.score.riskBand ?? item.score.riskLevel) === 'INSUFFICIENT_EVIDENCE' ||
      item.score.riskLevel === 'INSUFFICIENT_DATA' ||
      item.score.totalScore === null
  ).length;

  const cards = [
    {
      id: 'total',
      title: 'TOTAL WARDS',
      count: total,
      subtitle: `${veryHighCount} Very High · ${insufficientCount} Insufficient`,
      badge: 'Evaluated',
      icon: Layers,
      textColor: 'text-slate-100',
      accentColor: 'from-blue-500/20 to-transparent',
      borderColor: 'border-white/[0.08] hover:border-white/[0.16]',
      bgGradient: 'bg-gradient-to-b from-white/[0.04] to-transparent',
      barColor: 'bg-blue-400',
      ratio: total > 0 ? 1 : 0,
      badgeColor: 'bg-white/[0.06] text-slate-300 border-white/[0.08]',
    },
    {
      id: 'very-high',
      title: 'VERY HIGH RISK',
      count: veryHighCount,
      subtitle: 'Score ≥ 75.0 · Urgent Action',
      badge: `${total > 0 ? Math.round((veryHighCount / total) * 100) : 0}% of Zones`,
      icon: Flame,
      textColor: 'text-rose-400',
      accentColor: 'from-rose-500/20 to-transparent',
      borderColor: 'border-rose-500/30 hover:border-rose-500/50',
      bgGradient: 'bg-gradient-to-b from-rose-500/[0.08] to-transparent',
      barColor: 'bg-rose-500',
      ratio: total > 0 ? veryHighCount / total : 0,
      badgeColor: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    },
    {
      id: 'high',
      title: 'HIGH RISK',
      count: highCount,
      subtitle: 'Score 50.0 – 74.9 · Priority Focus',
      badge: `${total > 0 ? Math.round((highCount / total) * 100) : 0}% of Zones`,
      icon: AlertTriangle,
      textColor: 'text-orange-400',
      accentColor: 'from-orange-500/20 to-transparent',
      borderColor: 'border-orange-500/30 hover:border-orange-500/50',
      bgGradient: 'bg-gradient-to-b from-orange-500/[0.08] to-transparent',
      barColor: 'bg-orange-500',
      ratio: total > 0 ? highCount / total : 0,
      badgeColor: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
    },
    {
      id: 'moderate',
      title: 'MODERATE RISK',
      count: moderateCount,
      subtitle: 'Score 25.0 – 49.9 · Monitoring',
      badge: `${total > 0 ? Math.round((moderateCount / total) * 100) : 0}% of Zones`,
      icon: AlertCircle,
      textColor: 'text-amber-400',
      accentColor: 'from-amber-500/20 to-transparent',
      borderColor: 'border-amber-500/30 hover:border-amber-500/50',
      bgGradient: 'bg-gradient-to-b from-amber-500/[0.08] to-transparent',
      barColor: 'bg-amber-400',
      ratio: total > 0 ? moderateCount / total : 0,
      badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    },
  ];

  return (
    <section aria-label="Risk Summary Overview" className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Risk Classification Overview
          </h2>
        </div>
        {insufficientCount > 0 && (
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 bg-white/[0.03] px-2.5 py-1 rounded-md border border-white/[0.06]">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px]">
              <strong className="text-slate-300 font-mono">{insufficientCount}</strong> zone with insufficient data (null preserved)
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className={`rounded-xl p-4 border ${card.borderColor} ${card.bgGradient} backdrop-blur-md flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  {card.title}
                </span>
                <div className={`p-1.5 rounded-lg bg-white/[0.04] ${card.textColor}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="my-2.5 flex items-baseline justify-between">
                <span className={`text-3xl font-extrabold font-mono tracking-tight ${card.textColor}`}>
                  {card.count}
                </span>
                <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border ${card.badgeColor}`}>
                  {card.badge}
                </span>
              </div>

              <div className="space-y-1.5">
                {/* Visual Ratio Bar */}
                <div className="w-full bg-white/[0.06] h-1 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${card.barColor} transition-all duration-500 rounded-full`}
                    style={{ width: `${Math.max(card.ratio * 100, 4)}%` }}
                  />
                </div>
                <span className="text-[11px] text-slate-400 truncate block">
                  {card.subtitle}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

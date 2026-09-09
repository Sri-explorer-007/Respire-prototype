import React from 'react';
import { ArrowLeftRight, Award, Download, ArrowRight, Flame } from 'lucide-react';
import type { ScoredZoneItem } from './RiskSummaryCards';
import { CardActionMenu } from '../common/CardActionMenu';
import { exportZonesToCsv } from '../../utils/exportTelemetry';

interface PriorityQueueCardProps {
  scoredZones: ScoredZoneItem[];
  selectedZoneId?: string;
  onSelectZone?: (zoneId: string) => void;
  onNavigateToPrioritize?: () => void;
}

/**
 * Summary card presenting top priority zones ranked by multi-criteria urgency score.
 */
export const PriorityQueueCard: React.FC<PriorityQueueCardProps> = ({
  scoredZones,
  selectedZoneId,
  onSelectZone,
  onNavigateToPrioritize,
}) => {
  // Sort by total score descending (highest risk/priority first)
  const rankedCandidates = scoredZones
    .filter((item) => item.score.totalScore !== null)
    .sort((a, b) => (b.score.totalScore ?? 0) - (a.score.totalScore ?? 0))
    .slice(0, 5);

  const getInterventionName = (score: number) => {
    if (score >= 85) return 'Hydration & Cooling Hub';
    if (score >= 80) return 'Cool Roof Cluster Retrofit';
    if (score >= 75) return 'Thermal Canopy Corridors';
    return 'Reflective Surface Treatment';
  };

  return (
    <div className="aero-card aero-card-hover p-3.5 select-none flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
        <div className="flex items-center space-x-2">
          <div className="h-7 w-7 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-tight">
              Priority Intervention Queue
            </h4>
            <p className="text-[10px] text-slate-400">
              Ranked GCC Investment Allocation
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={onNavigateToPrioritize}
            className="text-[10px] font-mono text-blue-400 hover:text-blue-300 font-bold px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 transition-colors cursor-pointer"
          >
            Full Queue ➔
          </button>
          <CardActionMenu
            title="Priority Queue Options"
            items={[
              {
                label: 'Open Phase 4 Funding Dashboard',
                icon: ArrowRight,
                onClick: () => onNavigateToPrioritize?.(),
              },
              {
                label: 'Export Ranked Allocation (CSV)',
                icon: Download,
                onClick: () => exportZonesToCsv(scoredZones, 'gcc_funding_queue.csv'),
              },
              {
                label: 'Select #1 Candidate (Vyasarpadi)',
                icon: Flame,
                onClick: () => onSelectZone?.('ward-045'),
              },
            ]}
          />
        </div>
      </div>

      {/* Queue items (Styled like Recent Flights in reference) */}
      <div className="space-y-1.5 py-1.5 flex-1 flex flex-col justify-around">
        {rankedCandidates.map((item, idx) => {
          const zId = item.zone.zoneId || item.zone.id || '';
          const zName = item.zone.zoneName || item.zone.name || zId;
          const isSelected = selectedZoneId === zId;
          const score = item.score.totalScore ?? 0;
          const intervention = getInterventionName(score);

          return (
            <div
              key={zId}
              onClick={() => onSelectZone?.(zId)}
              className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-between border ${
                isSelected
                  ? 'bg-blue-600/20 border-blue-500/50 shadow-md shadow-blue-500/20'
                  : 'bg-white/[0.02] hover:bg-white/[0.06] border-white/[0.04]'
              }`}
            >
              {/* Left: Ward Name + ID */}
              <div className="min-w-[90px]">
                <span className="text-xs font-bold text-white block truncate">
                  {zName}
                </span>
                <span className="text-[9px] font-mono text-slate-400 block">
                  Rank #{idx + 1} · {item.zone.wardId}
                </span>
              </div>

              {/* Center: Exchange Icon (matching flights transfer icon) */}
              <div className="px-2 text-slate-500 flex items-center justify-center">
                <ArrowLeftRight className="w-3.5 h-3.5 text-blue-400" />
              </div>

              {/* Right: Intervention & Score */}
              <div className="text-right flex-1 truncate pl-2">
                <span className="text-xs font-semibold text-slate-200 block truncate">
                  {intervention}
                </span>
                <div className="flex items-center justify-end space-x-1.5 mt-0.5">
                  <span className="text-[10px] font-mono font-extrabold text-rose-400">
                    {score.toFixed(0)} Risk
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/15 px-1 py-0.2 rounded">
                    ₹72k
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

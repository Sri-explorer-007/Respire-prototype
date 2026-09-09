import React from 'react';
import {
  AlertTriangle,
  FileQuestion,
  ChevronDown,
  ArrowUpDown,
  BadgeInfo,
} from 'lucide-react';
import type { Zone } from '../../types';
import { respirePrioritizationEngine } from '../../core/services/prioritization/prioritizationEngine';
import {
  PRIORITIZATION_LIMITATION_DISCLAIMER,
  CALCULATION_BASIS,
} from '../../core/services/prioritization/prioritizationConstants';
import type { ScoredZoneItem } from './RiskSummaryCards';

interface PrioritizeViewProps {
  zones: Zone[];
  scoredZones?: ScoredZoneItem[];
  selectedZoneId: string;
  onSelectZone: (zoneId: string) => void;
}

/**
 * RESPIRE Phase 04 — PRIORITIZE & FUND (Modern Edition)
 * 
 * Municipal Funding Decision Dashboard
 * Answers: "Given limited municipal funding, which cooling intervention should be funded first, and why?"
 * 
 * Consumes: respirePrioritizationEngine.prioritizeZones(zones)
 * 
 * STRICT CREDIBILITY:
 * - Single source of truth: all ranks, priority scores, and contributions come from respirePrioritizationEngine.
 * - Zero recalculations in React.
 * - Cost and impact are qualified as INDICATIVE ESTIMATES.
 * - Insufficient evidence zones (e.g. Sholinganallur) are isolated as Unranked without fake scores.
 */
export const PrioritizeView: React.FC<PrioritizeViewProps> = ({
  zones,
  scoredZones: _scoredZones,
  selectedZoneId,
  onSelectZone,
}) => {
  // 1. Run domain prioritization engine across zones (deterministic)
  const prioritizationResult = respirePrioritizationEngine.prioritizeZones(zones, {
    documentedDate: '2026-03-01T00:00:00Z',
  });

  const { rankedPriorities, unrankedPriorities } = prioritizationResult;

  // 2. Resolve selected priority item (defaulting to rank #1 if none selected)
  const selectedPriority =
    rankedPriorities.find((p) => p.zoneId === selectedZoneId) ||
    unrankedPriorities.find((p) => p.zoneId === selectedZoneId) ||
    rankedPriorities[0];

  // 3. Indicative Budget Summary Calculation
  const totalRankedCost = rankedPriorities.reduce(
    (acc, p) => acc + (p.indicativeCost ?? 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Page Title & Context Header */}
      <section aria-labelledby="prioritize-header" className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <h2 id="prioritize-header" className="text-xl font-extrabold tracking-tight text-white">
                04 PRIORITIZE & FUND
              </h2>
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-300 border border-orange-500/30">
                Phase 04 Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Given limited municipal funding, which cooling intervention should be funded first, and why?
            </p>
          </div>

          {/* Accessible Zone Switcher Dropdown */}
          <div className="flex items-center space-x-2.5">
            <label htmlFor="zone-select-prio" className="text-xs text-slate-400 font-medium whitespace-nowrap">
              Focus Ward:
            </label>
            <div className="relative inline-block w-64">
              <select
                id="zone-select-prio"
                aria-label="Select Ward to Inspect Prioritization"
                value={selectedPriority?.zoneId || ''}
                onChange={(e) => onSelectZone(e.target.value)}
                className="w-full appearance-none bg-slate-900/90 border border-white/[0.1] rounded-xl px-3 py-2 pr-8 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50 cursor-pointer shadow-lg"
              >
                {rankedPriorities.map((p) => (
                  <option key={p.zoneId} value={p.zoneId} className="bg-slate-900 text-slate-200">
                    #{p.rank} {p.zoneName} (Prio: {p.priorityScore}/100)
                  </option>
                ))}
                {unrankedPriorities.map((p) => (
                  <option key={p.zoneId} value={p.zoneId} className="bg-slate-900 text-slate-400">
                    [Unranked] {p.zoneName}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Quick Indicative Budget & Decision Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-md space-y-1.5 hover:border-white/[0.14] transition-all">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">
              Ranked Funding Candidates
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold font-mono text-orange-400">
                {rankedPriorities.length}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                / {prioritizationResult.totalZonesEvaluated} wards evaluated
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {unrankedPriorities.length} wards separated (insufficient telemetry or no trigger)
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-md space-y-1.5 hover:border-white/[0.14] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">
                Total Indicative Requirement
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                INDICATIVE DEMO TOTAL
              </span>
            </div>
            <div className="text-3xl font-extrabold font-mono text-slate-100">
              ₹{totalRankedCost.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-400">
              Illustrative planning total for top {rankedPriorities.length} ranked interventions
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-md space-y-1.5 hover:border-white/[0.14] transition-all">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">
              Decision Weighting Formula
            </span>
            <div className="text-xs font-mono font-bold text-slate-200 pt-1">
              50% Need · 30% Impact · 20% Cost Eff.
            </div>
            <p className="text-[11px] text-slate-400">
              Deterministic, explainable municipal decision-support model
            </p>
          </div>
        </div>
      </section>

      {/* Main Grid: Left Column (Ranked Funding Table & Unranked) & Right Column (Selected Zone Funding Detail) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (7 cols): Priority Ranking Table & Insufficient Evidence Section */}
        <div className="lg:col-span-7 space-y-6">

          {/* 1. Priority Ranking List */}
          <section
            aria-labelledby="ranking-table-heading"
            className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 backdrop-blur-xl p-5 space-y-4 shadow-xl shadow-black/40"
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3.5">
              <div className="flex items-center space-x-2">
                <ArrowUpDown className="w-4 h-4 text-orange-400" />
                <h3 id="ranking-table-heading" className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  MUNICIPAL FUNDING DECISION RANKING ({rankedPriorities.length} Ranked)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                Sorted by Planning Priority Score
              </span>
            </div>

            <div className="space-y-2.5">
              {rankedPriorities.map((item) => {
                const isSelected = item.zoneId === selectedPriority?.zoneId;
                const isTop1 = item.rank === 1;
                const isTop3 = (item.rank ?? 99) <= 3;

                return (
                  <button
                    key={item.zoneId}
                    type="button"
                    onClick={() => onSelectZone(item.zoneId)}
                    className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                      isSelected
                        ? 'bg-gradient-to-r from-orange-500/15 via-orange-500/10 to-transparent border-orange-500/60 shadow-lg shadow-orange-500/10 ring-1 ring-orange-500/30'
                        : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-start space-x-3.5">
                      {/* Rank Badge */}
                      <div
                        className={`h-9 w-9 rounded-xl flex items-center justify-center font-mono font-extrabold text-sm shrink-0 border ${
                          isTop1
                            ? 'bg-gradient-to-br from-amber-500/30 to-orange-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20'
                            : isTop3
                            ? 'bg-white/[0.08] text-slate-200 border-white/[0.15]'
                            : 'bg-white/[0.04] text-slate-400 border-white/[0.08]'
                        }`}
                      >
                        #{item.rank}
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-extrabold text-white text-sm tracking-tight">
                            {item.zoneName}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/[0.05] text-slate-400 border border-white/[0.08]">
                            {item.wardId || item.zoneId}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 font-medium truncate">
                          {item.interventionName}
                        </p>

                        <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono">
                          <span>Risk: {item.riskScore?.toFixed(0)} ({item.riskBand})</span>
                          <span>·</span>
                          <span>Cost: ₹{item.indicativeCost?.toLocaleString('en-IN')}</span>
                          <span>·</span>
                          <span>Impact: -{item.indicativeImpact?.toFixed(1)}°C</span>
                        </div>
                      </div>
                    </div>

                    {/* Planning Priority Score Pill */}
                    <div className="sm:text-right shrink-0">
                      <span className="text-[9px] font-mono uppercase text-slate-400 font-bold block">
                        Planning Priority
                      </span>
                      <span className="text-2xl font-extrabold font-mono text-orange-400">
                        {item.priorityScore}
                        <span className="text-xs text-slate-500 font-normal"> / 100</span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 2. Insufficient Evidence / Unranked Section */}
          {unrankedPriorities.length > 0 && (
            <section
              aria-labelledby="unranked-heading"
              className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/70 backdrop-blur-xl p-5 space-y-4 shadow-xl shadow-black/40"
            >
              <div className="flex items-center space-x-2 border-b border-white/[0.06] pb-3">
                <FileQuestion className="w-4 h-4 text-amber-400" />
                <h3 id="unranked-heading" className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  UNRANKED / INSUFFICIENT EVIDENCE ({unrankedPriorities.length} Wards)
                </h3>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                These wards are separated from active municipal funding allocation because required physical heat/vegetation telemetry is unavailable, or zone metrics remain below intervention thresholds:
              </p>

              <div className="space-y-2.5">
                {unrankedPriorities.map((item) => {
                  const isSelected = item.zoneId === selectedPriority?.zoneId;
                  const isSholinganallur = item.zoneId === 'ward-198';

                  return (
                    <div
                      key={item.zoneId}
                      onClick={() => onSelectZone(item.zoneId)}
                      className={`p-3.5 rounded-xl border text-xs space-y-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500/50 ring-1 ring-amber-500/30'
                          : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-200">
                            {item.zoneName}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.05] text-slate-400 border border-white/[0.08]">
                            {item.wardId || item.zoneId}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          UNRANKED
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {item.explanation}
                      </p>

                      {isSholinganallur && (
                        <div className="text-[10px] font-mono text-amber-300/90 space-y-0.5 pt-1.5 border-t border-white/[0.06]">
                          <span>Missing Telemetry: Land Surface Temperature (LST), Vegetation Deficit (NDVI)</span>
                          <span className="block text-slate-500">
                            No artificial funding score or intervention is assigned.
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* Right Column (5 cols): Selected Zone Funding Detail, Breakdown & Provenance */}
        <div className="lg:col-span-5 space-y-6">

          {/* 3. Selected Zone Funding Detail Panel */}
          <section
            aria-labelledby="funding-detail-heading"
            className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 backdrop-blur-xl p-5 space-y-4 shadow-xl shadow-black/40"
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3.5">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                  Funding Evaluation Detail
                </span>
                <h3 id="funding-detail-heading" className="text-lg font-extrabold text-white tracking-tight">
                  {selectedPriority?.zoneName}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {selectedPriority?.wardId || selectedPriority?.zoneId} · Greater Chennai Corporation
                </p>
              </div>

              <div className="text-right">
                {selectedPriority?.rank !== null ? (
                  <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40">
                    Rank #{selectedPriority?.rank}
                  </span>
                ) : (
                  <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    Unranked
                  </span>
                )}
              </div>
            </div>

            {/* Score & Recommended Action */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Targeted Intervention:</span>
                <span className="font-bold text-slate-200 text-right">
                  {selectedPriority?.interventionName}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Urban Heat Risk:</span>
                <span className="font-mono text-slate-300">
                  {selectedPriority?.riskScore !== null ? `${selectedPriority?.riskScore?.toFixed(1)} / 100 (${selectedPriority?.riskBand})` : 'Insufficient Evidence'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs border-t border-white/[0.06] pt-2">
                <span className="text-slate-400 font-bold uppercase">Planning Priority Score:</span>
                <span className="text-xl font-extrabold font-mono text-orange-400">
                  {selectedPriority?.priorityScore !== null ? `${selectedPriority?.priorityScore} / 100` : 'None'}
                </span>
              </div>
            </div>

            {/* Component Contribution Breakdown */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                Prioritization Breakdown (100% Total)
              </span>

              {/* Need Component (50%) */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-semibold">Need Component (50% nominal)</span>
                  <span className="font-mono font-bold text-slate-200">
                    {selectedPriority?.breakdown?.needScore !== null && selectedPriority?.breakdown?.needScore !== undefined
                      ? `${(selectedPriority.breakdown.needScore * (selectedPriority.breakdown.effectiveNeedWeight ?? 50)).toFixed(1)} / ${selectedPriority.breakdown.effectiveNeedWeight} pts`
                      : 'Unavailable'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">
                  Driven directly by the zone's Urban Heat Risk Score ({selectedPriority?.riskScore?.toFixed(1) ?? 'null'})
                </p>
              </div>

              {/* Impact Component (30%) */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-semibold">Indicative Impact (30% nominal)</span>
                  <span className="font-mono font-bold text-slate-200">
                    {selectedPriority?.breakdown?.impactScore !== null && selectedPriority?.breakdown?.impactScore !== undefined
                      ? `${(selectedPriority.breakdown.impactScore * (selectedPriority.breakdown.effectiveImpactWeight ?? 30)).toFixed(1)} / ${selectedPriority.breakdown.effectiveImpactWeight} pts`
                      : 'Unavailable'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">
                  Based on intervention's indicative cooling benchmark ({selectedPriority?.indicativeImpact !== null ? `-${selectedPriority?.indicativeImpact}°C` : 'null'})
                </p>
              </div>

              {/* Cost-Efficiency Component (20%) */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-semibold">Indicative Cost Efficiency (20% nominal)</span>
                  <span className="font-mono font-bold text-slate-200">
                    {selectedPriority?.breakdown?.costEfficiencyScore !== null && selectedPriority?.breakdown?.costEfficiencyScore !== undefined
                      ? `${(selectedPriority.breakdown.costEfficiencyScore * (selectedPriority.breakdown.effectiveCostEfficiencyWeight ?? 20)).toFixed(1)} / ${selectedPriority.breakdown.effectiveCostEfficiencyWeight} pts`
                      : 'Unavailable'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">
                  Relative planning comparison using catalogue cost (₹{selectedPriority?.indicativeCost?.toLocaleString('en-IN') ?? 'null'}) and impact
                </p>
              </div>
            </div>

            {/* "Why Fund This?" Explanation */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5 text-xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                Why Fund This Action?
              </span>
              <p className="text-slate-300 leading-relaxed text-xs">
                {selectedPriority?.explanation}
              </p>
            </div>
          </section>

          {/* 4. MANDATORY CREDIBILITY & DISCLAIMER */}
          <section
            aria-labelledby="prio-disclaimer-heading"
            className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 backdrop-blur-xl p-5 space-y-3.5 shadow-xl shadow-black/40"
          >
            <div className="flex items-center space-x-2 border-b border-white/[0.06] pb-3">
              <BadgeInfo className="w-4 h-4 text-orange-400" />
              <h3 id="prio-disclaimer-heading" className="text-xs font-bold uppercase tracking-wider text-slate-300">
                PROVENANCE & CREDIBILITY NOTICE
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5 font-mono text-[11px]">
                <div className="text-slate-400">
                  <span className="text-slate-500">Calculation Basis: </span>
                  {CALCULATION_BASIS}
                </div>
                <div className="text-slate-400">
                  <span className="text-slate-500">Cost & Impact Status: </span>
                  INDICATIVE ESTIMATE (Planning Benchmark)
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200/90 space-y-1.5">
                <div className="font-bold text-amber-300 flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Planning Prioritization Limitation</span>
                </div>
                <p className="leading-relaxed">
                  "{PRIORITIZATION_LIMITATION_DISCLAIMER}"
                </p>
              </div>

              <div className="text-[10px] font-mono text-slate-500 leading-relaxed border-t border-white/[0.06] pt-2">
                Greater Chennai Corporation Planning Rule: This prioritization provides relative ranking to compare candidate interventions under budget constraints. It does not replace municipal engineering design, site feasibility, or formal public procurement.
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

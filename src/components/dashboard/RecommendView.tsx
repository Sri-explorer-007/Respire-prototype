import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  FileQuestion,
  ChevronDown,
  Info,
  ArrowRight,
} from 'lucide-react';
import { respireRecommendationEngine } from '../../core/recommendations/recommendationEngine';
import type { ScoredZoneItem } from './RiskSummaryCards';

interface RecommendViewProps {
  scoredZones: ScoredZoneItem[];
  selectedZoneId: string;
  onSelectZone: (zoneId: string) => void;
  onNavigateToPrioritize?: () => void;
}

/**
 * RESPIRE Phase 03 — RECOMMEND ACTIONS (Modern Edition)
 * 
 * Answers: "WHAT SHOULD THE CITY DO?"
 * Consumes: respireRecommendationEngine.generateRecommendations(zone, score)
 * 
 * STRICT CREDIBILITY:
 * - Single source of truth: all recommendations, trigger conditions, and rationale
 *   come directly from respireRecommendationEngine.
 * - All cost and impact figures are visibly qualified as INDICATIVE ESTIMATES.
 * - Health-related benefits are phrased as "Supports heat-exposure protection planning"
 *   without unsupported clinical claims like "heatstroke prevention".
 * - Sholinganallur (Ward 198) displays NO CONFIDENT RECOMMENDATION with zero invented interventions.
 */
export const RecommendView: React.FC<RecommendViewProps> = ({
  scoredZones,
  selectedZoneId,
  onSelectZone,
  onNavigateToPrioritize,
}) => {
  // 1. Resolve selected zone (deterministic fallback to first zone if missing)
  const currentItem =
    scoredZones.find((item) => (item.zone.zoneId || item.zone.id) === selectedZoneId) ||
    scoredZones[0];

  const zone = currentItem?.zone;
  const score = currentItem?.score;

  // 2. Consume recommendation engine deterministically (no React-level recalculation)
  const recResult = zone
    ? respireRecommendationEngine.generateRecommendations(zone, score ?? undefined)
    : null;

  const hasRecommendation = recResult?.hasConfidentRecommendation && recResult.primaryRecommendation !== null;
  const primaryRec = recResult?.primaryRecommendation ?? null;
  const whyThisAction = recResult?.whyThisAction;

  // 3. Risk tier styling
  const isScoreInsufficient =
    !score ||
    score.totalScore === null ||
    score.riskLevel === 'INSUFFICIENT_DATA' ||
    score.riskLevel === 'INSUFFICIENT_EVIDENCE' ||
    score.riskBand === 'INSUFFICIENT_EVIDENCE';

  const totalScoreVal = score?.totalScore ?? null;

  let bandBadgeColor = 'bg-white/[0.06] text-slate-300 border-white/[0.08]';
  let bandLabel = 'INSUFFICIENT EVIDENCE';

  if (!isScoreInsufficient && totalScoreVal !== null) {
    if (score.riskLevel === 'VERY_HIGH') {
      bandBadgeColor = 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      bandLabel = 'VERY HIGH';
    } else if (score.riskLevel === 'HIGH') {
      bandBadgeColor = 'bg-orange-500/15 text-orange-300 border-orange-500/30';
      bandLabel = 'HIGH';
    } else if (score.riskLevel === 'MODERATE') {
      bandBadgeColor = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      bandLabel = 'MODERATE';
    } else {
      bandBadgeColor = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      bandLabel = 'LOW';
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Context Header */}
      <section aria-labelledby="recommend-header" className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <h2 id="recommend-header" className="text-xl font-extrabold tracking-tight text-white">
                03 RECOMMEND ACTIONS
              </h2>
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-300 border border-orange-500/30">
                Phase 03 Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Targeted cooling interventions evaluated by deterministic municipal rule logic.
            </p>
          </div>

          {/* Accessible Zone Switcher Dropdown */}
          <div className="flex items-center space-x-2.5">
            <label htmlFor="zone-select-rec" className="text-xs text-slate-400 font-medium whitespace-nowrap">
              Focus Ward:
            </label>
            <div className="relative inline-block w-64">
              <select
                id="zone-select-rec"
                aria-label="Select Ward to Inspect Recommendations"
                value={zone?.zoneId || zone?.id || ''}
                onChange={(e) => onSelectZone(e.target.value)}
                className="w-full appearance-none bg-slate-900/90 border border-white/[0.1] rounded-xl px-3 py-2 pr-8 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50 cursor-pointer shadow-lg"
              >
                {Array.from(new Set(scoredZones.map((item) => item.zone.zoneName || 'Greater Chennai Corporation'))).map((zoneGroupName) => {
                  const groupItems = scoredZones.filter(
                    (item) => (item.zone.zoneName || 'Greater Chennai Corporation') === zoneGroupName
                  );
                  return (
                    <optgroup key={zoneGroupName} label={zoneGroupName} className="bg-slate-950 font-bold text-slate-400">
                      {groupItems.map(({ zone: z, score: s }) => {
                        const zId = z.zoneId || z.id || '';
                        const sVal = s.totalScore !== null ? `${s.totalScore.toFixed(0)}/100` : 'Insufficient Data';
                        const tier = s.riskBand ?? s.riskLevel;
                        return (
                          <option key={zId} value={zId} className="bg-slate-900 text-slate-200 font-normal">
                            {z.wardName || z.name || zId} ({tier} · {sVal})
                          </option>
                        );
                      })}
                    </optgroup>
                  );
                })}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Quick Ward Navigation Pill Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar" role="tablist" aria-label="Wards recommendation list">
          {scoredZones.map(({ zone: z, score: s }) => {
            const zId = z.zoneId || z.id || '';
            const isSelected = zId === (zone?.zoneId || zone?.id);
            const isWardInsufficient = s.totalScore === null || s.riskBand === 'INSUFFICIENT_EVIDENCE';

            let pillBadge = 'border-white/[0.06] text-slate-400 hover:border-white/[0.12] bg-white/[0.02]';
            if (isSelected) {
              pillBadge = 'border-orange-500/60 bg-gradient-to-r from-orange-500/20 to-orange-500/10 text-orange-300 ring-1 ring-orange-500/30 font-bold';
            } else if (isWardInsufficient) {
              pillBadge = 'border-amber-500/30 text-amber-300/80 bg-amber-500/10 hover:border-amber-500/50';
            }

            return (
              <button
                key={zId}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => onSelectZone(zId)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all shrink-0 cursor-pointer ${pillBadge}`}
              >
                <span>{z.wardName?.replace('Ward ', 'W-') || zId}</span>
                <span className="ml-1.5 font-mono text-[10px] opacity-80">
                  {isWardInsufficient ? 'No Score' : s.totalScore?.toFixed(0)}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Grid: Left Column (Recommended Intervention Card & Estimates) & Right Column (Why This Action? & Provenance) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (7 cols): Selected Zone Context, Primary Intervention, Planning Estimates */}
        <div className="lg:col-span-7 space-y-6">

          {/* 1. Selected Zone Risk Context Card */}
          <section
            aria-labelledby="zone-context-heading"
            className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 backdrop-blur-xl p-5 space-y-3 shadow-xl shadow-black/40"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/[0.06] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                  Candidate Focus Zone
                </span>
                <h3 id="zone-context-heading" className="text-lg font-extrabold text-white tracking-tight">
                  {zone?.wardName || zone?.zoneName || zone?.name}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {zone?.zoneId || zone?.id} · Greater Chennai Corporation
                </p>
              </div>

              <div className="flex sm:flex-col items-end justify-between gap-1">
                <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${bandBadgeColor}`}>
                  {bandLabel}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Risk: {totalScoreVal !== null ? `${totalScoreVal.toFixed(1)} / 100` : 'Insufficient Data'}
                </span>
              </div>
            </div>

            {/* Quick Context Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[9px] text-slate-500 font-mono uppercase block">Heat Exposure</span>
                <span className="font-bold text-slate-200 mt-0.5 block font-mono">
                  {score?.heatScore !== null && score?.heatScore !== undefined
                    ? `${score.heatScore.toFixed(1)} / 50 pts`
                    : 'Unavailable'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[9px] text-slate-500 font-mono uppercase block">Vegetation Deficit</span>
                <span className="font-bold text-slate-200 mt-0.5 block font-mono">
                  {score?.vegetationScore !== null && score?.vegetationScore !== undefined
                    ? `${score.vegetationScore.toFixed(1)} / 20 pts`
                    : 'Unavailable'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] col-span-2 sm:col-span-1">
                <span className="text-[9px] text-slate-500 font-mono uppercase block">Social Vulnerability</span>
                <span className="font-bold text-slate-200 mt-0.5 block font-mono">
                  {score?.vulnerabilityScore !== null && score?.vulnerabilityScore !== undefined
                    ? `${score.vulnerabilityScore.toFixed(1)} / 30 pts`
                    : 'Unavailable'}
                </span>
              </div>
            </div>
          </section>

          {/* 2. PRIMARY RECOMMENDED INTERVENTION CARD */}
          {hasRecommendation && primaryRec ? (
            <section
              aria-labelledby="rec-card-heading"
              className="rounded-2xl border border-orange-500/40 bg-[#0A0E17]/90 backdrop-blur-xl p-5 space-y-5 shadow-2xl shadow-orange-500/10"
            >
              <div className="border-b border-white/[0.06] pb-4 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40 uppercase">
                      Recommended Intervention
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/[0.08]">
                      {primaryRec.category}
                    </span>
                  </div>

                  {primaryRec.rulePriority && (
                    <span className="text-[10px] font-mono text-orange-400 font-bold">
                      Rule Precedence #{primaryRec.rulePriority}
                    </span>
                  )}
                </div>

                <h3 id="rec-card-heading" className="text-xl font-extrabold text-white tracking-tight">
                  {primaryRec.interventionName}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  {primaryRec.description}
                </p>
              </div>

              {/* Planning Estimates Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Indicative Cost */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      Indicative Cost
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold">
                      INDICATIVE ESTIMATE
                    </span>
                  </div>

                  <div className="text-2xl font-extrabold font-mono text-slate-100">
                    {primaryRec.cost !== null && primaryRec.cost !== undefined
                      ? `₹${primaryRec.cost.toLocaleString('en-IN')}`
                      : 'Not Estimated'}
                  </div>

                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Catalogue planning estimate. Not a verified contractor quotation or final procurement cost.
                  </p>
                </div>

                {/* Indicative Impact */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      Indicative Impact
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold">
                      INDICATIVE ESTIMATE
                    </span>
                  </div>

                  <div className="text-2xl font-extrabold font-mono text-emerald-400">
                    {primaryRec.impact !== null && primaryRec.impact !== undefined
                      ? `-${primaryRec.impact}°C`
                      : 'Not Estimated'}
                  </div>

                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Microclimate shade relief estimate. Not a scientifically guaranteed ambient cooling outcome.
                  </p>
                </div>
              </div>

              {/* Supported Planning Benefits */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                  Municipal Planning Objective
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Supports heat-exposure protection planning for high-vulnerability outdoor workforce clusters under GCC Heat Action Plan.
                </p>
              </div>
            </section>
          ) : (
            /* 3. NO CONFIDENT RECOMMENDATION STATE (e.g. Sholinganallur) */
            <section
              aria-labelledby="no-rec-heading"
              className="rounded-2xl border border-amber-500/30 bg-amber-500/5 backdrop-blur-xl p-6 space-y-4"
            >
              <div className="flex items-center space-x-2.5 text-amber-300 border-b border-amber-500/20 pb-3">
                <FileQuestion className="w-5 h-5 shrink-0" />
                <h3 id="no-rec-heading" className="text-base font-extrabold tracking-tight">
                  NO CONFIDENT RECOMMENDATION
                </h3>
              </div>

              <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                <p>
                  {recResult?.reason ||
                    'Insufficient evidence is currently available to determine a targeted cooling intervention for this zone.'}
                </p>

                <div className="p-3 rounded-xl bg-black/40 border border-amber-500/20 space-y-1 text-xs">
                  <span className="font-bold text-amber-300 block font-mono text-[11px]">
                    Missing Required Telemetry:
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-300 font-mono text-[11px]">
                    <li>Land Surface Temperature (LST) Exposure</li>
                    <li>Vegetation Deficit (NDVI) Inversion</li>
                  </ul>
                </div>

                <p className="text-[11px] text-slate-400 italic">
                  RESPIRE will NOT invent an artificial intervention or budget without sufficient empirical backing.
                </p>
              </div>
            </section>
          )}
        </div>

        {/* Right Column (5 cols): Why This Action? & Provenance / Credibility Notice */}
        <div className="lg:col-span-5 space-y-6">

          {/* 4. WHY THIS ACTION? Section */}
          <section
            aria-labelledby="why-action-heading"
            className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 backdrop-blur-xl p-5 space-y-4 shadow-xl shadow-black/40"
          >
            <div className="flex items-center space-x-2 border-b border-white/[0.06] pb-3">
              <Info className="w-4 h-4 text-orange-400" />
              <h3 id="why-action-heading" className="text-xs font-bold uppercase tracking-wider text-slate-300">
                WHY THIS ACTION?
              </h3>
            </div>

            {/* Matched Rule Conditions */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">
                Trigger Conditions (Domain Engine Evaluation)
              </span>

              {hasRecommendation && whyThisAction?.checkpoints && whyThisAction.checkpoints.length > 0 ? (
                <div className="space-y-1.5">
                  {whyThisAction.checkpoints.map((cond, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center space-x-2 text-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-slate-200 font-medium">{cond}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-slate-400 italic">
                  No active intervention rules satisfied under current zone telemetry.
                </div>
              )}
            </div>

            {/* Recommendation Explanation */}
            <div className="space-y-1.5 border-t border-white/[0.06] pt-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">
                Recommendation Rationale
              </span>
              <p className="text-xs text-slate-300 leading-relaxed p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                {whyThisAction?.reason || recResult?.reason || primaryRec?.reason || 'No rationale available.'}
              </p>
            </div>

            {/* Rule Evaluation Traceability */}
            {primaryRec?.matchedConditions && primaryRec.matchedConditions.length > 0 && (
              <div className="space-y-2 border-t border-white/[0.06] pt-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">
                  Rule Evaluation Traceability
                </span>
                <div className="space-y-1 text-[11px] font-mono">
                  {primaryRec.matchedConditions.map((cond, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-white/[0.01] border border-white/[0.04] flex items-center justify-between"
                    >
                      <span className="text-slate-300 truncate mr-2">{cond.indicator}: {cond.description}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          cond.isSatisfied
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-white/[0.03] text-slate-500'
                        }`}
                      >
                        {cond.isSatisfied ? 'TRIGGERED' : 'NOT MET'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* 5. CREDIBILITY & PROVENANCE NOTICE */}
          <section
            aria-labelledby="rec-credibility-heading"
            className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 backdrop-blur-xl p-5 space-y-3.5 shadow-xl shadow-black/40"
          >
            <div className="flex items-center space-x-2 border-b border-white/[0.06] pb-3">
              <ShieldAlert className="w-4 h-4 text-orange-400" />
              <h3 id="rec-credibility-heading" className="text-xs font-bold uppercase tracking-wider text-slate-300">
                CREDIBILITY & PROVENANCE NOTICE
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1 font-mono text-[11px]">
                <div className="text-slate-400">
                  <span className="text-slate-500">Source: </span>
                  RESPIRE Indicative Planning Catalogue (Illustrative Demo Data)
                </div>
                <div className="text-slate-400">
                  <span className="text-slate-500">Cost Basis: </span>
                  INDICATIVE_ESTIMATE
                </div>
                <div className="text-slate-400">
                  <span className="text-slate-500">Impact Basis: </span>
                  INDICATIVE_ESTIMATE
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200/90 leading-relaxed space-y-1">
                <div className="font-bold text-amber-300 flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Planning Disclaimer</span>
                </div>
                <p>
                  "This is an indicative planning estimate, not a guaranteed scientific impact or cost outcome. Final engineering sizing and municipal procurement must follow detailed field assessment."
                </p>
              </div>

              {/* Forward CTA to 04 PRIORITIZE */}
              {onNavigateToPrioritize && (
                <button
                  type="button"
                  onClick={onNavigateToPrioritize}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-orange-500/15 via-orange-500/10 to-transparent border border-orange-500/30 hover:border-orange-500/60 text-orange-300 hover:text-white text-xs font-bold transition-all flex items-center justify-between cursor-pointer group"
                >
                  <span>Rank Municipal Capital Funding</span>
                  <span className="flex items-center gap-1 text-[11px] font-mono group-hover:translate-x-0.5 transition-transform">
                    04 PRIORITIZE & FUND <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

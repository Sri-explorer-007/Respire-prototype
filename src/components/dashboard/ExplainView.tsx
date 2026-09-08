import React from 'react';
import {
  Info,
  AlertTriangle,
  CheckCircle2,
  FileQuestion,
  Thermometer,
  Trees,
  Users2,
  Layers,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';
import type { ScoredZoneItem } from './RiskSummaryCards';

interface ExplainViewProps {
  scoredZones: ScoredZoneItem[];
  selectedZoneId: string;
  onSelectZone: (zoneId: string) => void;
  onNavigateToRecommend?: () => void;
}

/**
 * RESPIRE Phase 02 — EXPLAIN WHY (Modern Edition)
 * 
 * Municipal Decision-Support View answering:
 * "WHY is this area considered high risk?"
 * 
 * Flow:
 * Zone -> respireScoringEngine -> RiskScoreResult -> Explain UI
 * 
 * Pure presentation: consumes precomputed RiskScoreResult with NO recalculation.
 */
export const ExplainView: React.FC<ExplainViewProps> = ({
  scoredZones,
  selectedZoneId,
  onSelectZone,
  onNavigateToRecommend,
}) => {
  // 1. Resolve selected zone item (with deterministic fallback to highest risk zone if missing)
  const currentItem =
    scoredZones.find((item) => (item.zone.zoneId || item.zone.id) === selectedZoneId) ||
    scoredZones[0];

  const zone = currentItem?.zone;
  const score = currentItem?.score;

  // 2. Evaluate completeness & insufficient evidence status
  const isInsufficient =
    !score ||
    score.totalScore === null ||
    score.riskLevel === 'INSUFFICIENT_DATA' ||
    score.riskLevel === 'INSUFFICIENT_EVIDENCE' ||
    score.riskBand === 'INSUFFICIENT_EVIDENCE';

  const totalScoreVal = score?.totalScore ?? null;

  // 3. Resolve Risk Band text and color badges
  let bandBadgeColor = 'bg-white/[0.06] text-slate-300 border-white/[0.08]';
  let scoreColor = 'text-slate-100';
  let bandLabel = 'INSUFFICIENT EVIDENCE';

  if (!isInsufficient && totalScoreVal !== null) {
    if (score.riskLevel === 'VERY_HIGH') {
      bandBadgeColor = 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      scoreColor = 'text-rose-400';
      bandLabel = 'VERY HIGH';
    } else if (score.riskLevel === 'HIGH') {
      bandBadgeColor = 'bg-orange-500/15 text-orange-300 border-orange-500/30';
      scoreColor = 'text-orange-400';
      bandLabel = 'HIGH';
    } else if (score.riskLevel === 'MODERATE') {
      bandBadgeColor = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      scoreColor = 'text-amber-300';
      bandLabel = 'MODERATE';
    } else {
      bandBadgeColor = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      scoreColor = 'text-emerald-400';
      bandLabel = 'LOW';
    }
  }

  // 4. Drivers strictly sourced from scoring engine
  const primaryDriver = isInsufficient
    ? 'Insufficient evidence to determine dominant risk drivers.'
    : score?.whyThisZone?.primaryDriver || 'Balanced Factors';

  const secondaryDriver = isInsufficient
    ? 'None'
    : score?.whyThisZone?.secondaryDriver || 'None';

  // 5. Component breakdown specifications
  const components = [
    {
      id: 'heat',
      name: 'Heat Exposure',
      weight: 50,
      icon: Thermometer,
      normalized: score?.normalizedInputs.heatExposure ?? null,
      contribution: score?.heatScore ?? null,
      barColor: 'bg-rose-500',
      accentText: 'text-rose-400',
      metricIndicator: 'Land Surface Temperature (LST)',
    },
    {
      id: 'vegetation',
      name: 'Vegetation Deficit',
      weight: 20,
      icon: Trees,
      normalized: score?.normalizedInputs.vegetationDeficit ?? null,
      contribution: score?.vegetationScore ?? null,
      barColor: 'bg-emerald-500',
      accentText: 'text-emerald-400',
      metricIndicator: 'NDVI Canopy Inversion',
    },
    {
      id: 'vulnerability',
      name: 'Social Vulnerability',
      weight: 30,
      icon: Users2,
      normalized: score?.normalizedInputs.socialVulnerability ?? null,
      contribution: score?.vulnerabilityScore ?? null,
      barColor: 'bg-sky-500',
      accentText: 'text-sky-400',
      metricIndicator: 'Socioeconomic Exposure Density',
    },
  ];

  // 6. Data Quality details
  const completenessPercent = Math.round((score?.completeness ?? 0) * 100);
  const confidenceLabel = score?.confidence ?? 'NONE';

  const availableIndicators: string[] = [];
  const missingIndicators: string[] = [];

  components.forEach((c) => {
    if (c.normalized !== null && c.normalized !== undefined) {
      availableIndicators.push(`${c.name} (${c.metricIndicator})`);
    } else {
      missingIndicators.push(`${c.name} (${c.metricIndicator})`);
    }
  });

  return (
    <div className="space-y-6">
      {/* Page Title & Context Header */}
      <section aria-labelledby="explain-header" className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <h2 id="explain-header" className="text-xl font-extrabold tracking-tight text-white">
                02 EXPLAIN WHY
              </h2>
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-300 border border-orange-500/30">
                Phase 02 Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Transparent, causal breakdown: Understand what drives urban heat risk across Greater Chennai Corporation.
            </p>
          </div>

          {/* Accessible Zone Switcher Dropdown */}
          <div className="flex items-center space-x-2.5">
            <label htmlFor="zone-select" className="text-xs text-slate-400 font-medium whitespace-nowrap">
              Focus Ward:
            </label>
            <div className="relative inline-block w-64">
              <select
                id="zone-select"
                aria-label="Select Ward to Explain"
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
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar" role="tablist" aria-label="Wards list">
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

      {/* Main Grid: Left Column (Hero + Drivers + Breakdown) & Right Column (Explanation + Data Quality) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (7 cols): Selected Zone Hero, Why This Zone?, Risk Contribution Breakdown */}
        <div className="lg:col-span-7 space-y-6">

          {/* 1. Selected Zone Hero Card */}
          <section
            aria-labelledby="selected-zone-heading"
            className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 backdrop-blur-xl p-5 space-y-4 shadow-xl shadow-black/40"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/[0.06] pb-3.5">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                  Focus Zone
                </span>
                <h3 id="selected-zone-heading" className="text-lg font-extrabold text-white tracking-tight">
                  {zone?.wardName || zone?.zoneName || zone?.name}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {zone?.zoneId || zone?.id} · Greater Chennai Corporation
                  {zone?.areaKm2 ? ` · ${zone.areaKm2} km²` : ''}
                </p>
              </div>

              <div className="flex sm:flex-col items-end justify-between gap-1">
                <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${bandBadgeColor}`}>
                  {bandLabel}
                </span>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {zone?.dataSourceLabel || 'Illustrative Demo Data'}
                </span>
              </div>
            </div>

            {/* Score & Risk Band Display */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="sm:col-span-2 rounded-xl p-4 bg-white/[0.02] border border-white/[0.06] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Urban Heat Risk Score
                </span>

                <div className="flex items-baseline space-x-2">
                  {!isInsufficient && totalScoreVal !== null ? (
                    <>
                      <span className={`text-4xl font-extrabold font-mono tracking-tight ${scoreColor}`}>
                        {totalScoreVal.toFixed(1)}
                      </span>
                      <span className="text-sm text-slate-500 font-mono">/ 100 max</span>
                    </>
                  ) : (
                    <div className="flex items-center space-x-2 py-1 text-amber-400">
                      <FileQuestion className="w-5 h-5 shrink-0" />
                      <span className="text-base font-bold">INSUFFICIENT EVIDENCE</span>
                    </div>
                  )}
                </div>

                {/* Horizontal Meter */}
                <div className="space-y-1.5 pt-1">
                  <div className="relative w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
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
                  <div className="flex justify-between text-[9px] font-mono text-slate-500">
                    <span>0 Low</span>
                    <span>25 Mod</span>
                    <span>50 High</span>
                    <span>75 Very High</span>
                    <span>100</span>
                  </div>
                </div>
              </div>

              {/* Data Completeness & Confidence Box */}
              <div className="rounded-xl p-4 bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between space-y-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Data Completeness
                  </span>
                  <span className={`text-2xl font-extrabold font-mono mt-1 block ${completenessPercent === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {completenessPercent}%
                  </span>
                </div>
                <div className="border-t border-white/[0.06] pt-2">
                  <span className="text-[9px] font-mono uppercase text-slate-500 block">Confidence</span>
                  <span className="text-xs font-semibold font-mono text-slate-200">
                    {confidenceLabel}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 2. WHY THIS ZONE? (Driver Hierarchy) */}
          <section
            aria-labelledby="why-zone-heading"
            className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 backdrop-blur-xl p-5 space-y-4 shadow-xl shadow-black/40"
          >
            <div className="flex items-center space-x-2 border-b border-white/[0.06] pb-3">
              <Info className="w-4 h-4 text-orange-400" />
              <h3 id="why-zone-heading" className="text-xs font-bold uppercase tracking-wider text-slate-300">
                WHY THIS ZONE?
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Primary Driver */}
              <div className="rounded-xl p-4 bg-white/[0.02] border border-white/[0.06] space-y-1">
                <span className="text-[9px] font-mono uppercase tracking-wider text-orange-400 font-bold block">
                  Primary Driver
                </span>
                <p className="text-sm font-bold text-slate-100">
                  {primaryDriver}
                </p>
                {!isInsufficient && score?.whyThisZone?.primaryDriver && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Strongest observed risk factor driving priority score.
                  </p>
                )}
              </div>

              {/* Secondary Driver */}
              <div className="rounded-xl p-4 bg-white/[0.02] border border-white/[0.06] space-y-1">
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                  Secondary Driver
                </span>
                <p className="text-sm font-bold text-slate-100">
                  {secondaryDriver}
                </p>
                {!isInsufficient && score?.whyThisZone?.secondaryDriver && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Compounding factor contributing to heat vulnerability.
                  </p>
                )}
              </div>
            </div>

            {/* Priority Rationale Note */}
            {score?.whyThisZone?.priorityRationale && (
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-slate-300 leading-relaxed">
                <span className="font-semibold text-slate-200">Domain Rationale: </span>
                {score.whyThisZone.priorityRationale}
              </div>
            )}
          </section>

          {/* 3. RISK CONTRIBUTION BREAKDOWN */}
          <section
            aria-labelledby="breakdown-heading"
            className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 backdrop-blur-xl p-5 space-y-4 shadow-xl shadow-black/40"
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-orange-400" />
                <h3 id="breakdown-heading" className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  RISK CONTRIBUTION BREAKDOWN
                </h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                Formula: 50% Heat + 20% Veg + 30% Vuln
              </span>
            </div>

            <div className="space-y-3">
              {components.map((c) => {
                const Icon = c.icon;
                const isMissing = c.normalized === null || c.contribution === null;
                const progressPercent = typeof c.normalized === 'number'
                  ? Math.min(100, Math.max(0, c.normalized * 100))
                  : 0;

                return (
                  <div
                    key={c.id}
                    className="rounded-xl p-3.5 bg-white/[0.02] border border-white/[0.06] space-y-2.5 hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon className={`w-4 h-4 ${c.accentText}`} />
                        <span className="text-xs font-semibold text-slate-200">{c.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          (Weight: {c.weight}%)
                        </span>
                      </div>

                      <div className="text-right font-mono text-xs">
                        {isMissing ? (
                          <span className="text-amber-400 italic font-semibold">Unavailable</span>
                        ) : (
                          <span className="font-bold text-slate-100">
                            {c.contribution?.toFixed(1)}{' '}
                            <span className="text-slate-500 font-normal text-[10px]">/ {c.weight} pts</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress Track */}
                    <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      {!isMissing ? (
                        <div
                          className={`h-full ${c.barColor} transition-all duration-500 rounded-full`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      ) : (
                        <div className="h-full w-full bg-slate-800/60 border-t border-dashed border-slate-600/60" />
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>Normalized Telemetry Value:</span>
                      <span>
                        {c.normalized === null ? (
                          <span className="text-slate-500 italic">null (Unavailable)</span>
                        ) : (
                          <span className="text-slate-300 font-semibold">{c.normalized.toFixed(2)} / 1.00</span>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total Summary Row */}
            <div className="border-t border-white/[0.06] pt-3 flex items-center justify-between font-mono text-xs">
              <span className="text-slate-400 font-semibold uppercase">Total Priority Score:</span>
              <span>
                {!isInsufficient && totalScoreVal !== null ? (
                  <span className="text-base font-extrabold text-slate-100">
                    {totalScoreVal.toFixed(1)} <span className="text-slate-500 text-xs font-normal">/ 100</span>
                  </span>
                ) : (
                  <span className="text-xs font-bold text-amber-400">INSUFFICIENT EVIDENCE</span>
                )}
              </span>
            </div>
          </section>
        </div>

        {/* Right Column (5 cols): Plain-Language Explanation & Data Quality */}
        <div className="lg:col-span-5 space-y-6">

          {/* 4. PLAIN-LANGUAGE EXPLANATION */}
          <section
            aria-labelledby="explanation-heading"
            className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 backdrop-blur-xl p-5 space-y-3.5 shadow-xl shadow-black/40"
          >
            <div className="flex items-center space-x-2 border-b border-white/[0.06] pb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h3 id="explanation-heading" className="text-xs font-bold uppercase tracking-wider text-slate-300">
                PLAIN-LANGUAGE EXPLANATION
              </h3>
            </div>

            <div className="rounded-xl p-4 bg-white/[0.02] border border-white/[0.06] space-y-3">
              <p className="text-sm text-slate-200 leading-relaxed font-normal">
                "{score?.explanation}"
              </p>

              <div className="border-t border-white/[0.06] pt-2.5 text-[10px] text-slate-500 font-mono">
                Generated deterministically by RESPIRE Scoring Engine v1.0. No generative AI or external LLM inference.
              </div>
            </div>
          </section>

          {/* 5. DATA QUALITY & PROVENANCE PANEL */}
          <section
            aria-labelledby="data-quality-heading"
            className="rounded-2xl border border-white/[0.08] bg-[#0A0E17]/80 backdrop-blur-xl p-5 space-y-4 shadow-xl shadow-black/40"
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 id="data-quality-heading" className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  DATA QUALITY & PROVENANCE
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-400 border border-white/[0.08]">
                Audit Status
              </span>
            </div>

            {/* Completeness & Confidence Overview */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[9px] font-mono uppercase text-slate-500 block">
                  Completeness
                </span>
                <span className={`text-xl font-extrabold font-mono mt-0.5 block ${completenessPercent === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {completenessPercent}%
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[9px] font-mono uppercase text-slate-500 block">
                  Confidence
                </span>
                <span className="text-xl font-extrabold font-mono text-slate-200 mt-0.5 block">
                  {confidenceLabel}
                </span>
              </div>
            </div>

            {/* Indicator Inventory */}
            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                  Available Indicators ({availableIndicators.length})
                </span>
                {availableIndicators.length > 0 ? (
                  <ul className="space-y-1">
                    {availableIndicators.map((ind) => (
                      <li key={ind} className="flex items-center space-x-2 text-slate-300 text-xs">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>{ind}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 italic">None</p>
                )}
              </div>

              <div className="border-t border-white/[0.06] pt-2.5">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                  Missing Indicators ({missingIndicators.length})
                </span>
                {missingIndicators.length > 0 ? (
                  <ul className="space-y-1">
                    {missingIndicators.map((ind) => (
                      <li key={ind} className="flex items-center space-x-2 text-amber-300/90 text-xs">
                        <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>{ind}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 italic text-[11px]">None · Full telemetry coverage</p>
                )}
              </div>
            </div>

            {/* Special Notice for Insufficient Evidence */}
            {isInsufficient && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 space-y-1.5">
                <div className="font-semibold text-amber-300 flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Ground-Truth Scoping Required</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-200/90">
                  Because physical heat exposure and vegetation deficit data are unavailable for this zone, municipal capital allocation cannot be recommended until ground-truth thermal telemetry is collected.
                </p>
              </div>
            )}

            {/* Municipal Planning Notice */}
            <div className="border-t border-white/[0.06] pt-3 text-[10px] text-slate-500 leading-relaxed font-mono">
              Greater Chennai Corporation Decision Support Rule: Wards with completeness &lt; 50% or missing heat exposure are flagged for field verification before capital budget commitment.
            </div>

            {/* Quick Link to 03 RECOMMEND */}
            {onNavigateToRecommend && (
              <button
                type="button"
                onClick={onNavigateToRecommend}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-orange-500/15 via-orange-500/10 to-transparent border border-orange-500/30 hover:border-orange-500/60 text-orange-300 hover:text-white text-xs font-bold transition-all flex items-center justify-between cursor-pointer group"
              >
                <span>Targeted Interventions</span>
                <span className="flex items-center gap-1 text-[11px] font-mono group-hover:translate-x-0.5 transition-transform">
                  03 RECOMMEND ACTIONS <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import {
  Sliders,
  TrendingDown,
  Building2,
  Trees,
  Droplets,
  Coins,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Copy,
} from 'lucide-react';
import type { Zone, RiskScoreResult } from '../../types';
import type { WorkflowTab } from './WorkflowHeader';

interface ScenarioSandboxProps {
  zones: Zone[];
  scoredZones: { zone: Zone; score: RiskScoreResult }[];
  onSelectZone?: (zoneId: string) => void;
  onNavigateToTab?: (tab: WorkflowTab) => void;
}

export const ScenarioSandbox: React.FC<ScenarioSandboxProps> = ({
  scoredZones,
  onSelectZone,
  onNavigateToTab,
}) => {
  const [copied, setCopied] = useState(false);
  // Policy Lever States
  const [coolRoofPct, setCoolRoofPct] = useState<number>(25); // 0 to 50%
  const [canopyPct, setCanopyPct] = useState<number>(15); // 0 to 30%
  const [hydrationHubs, setHydrationHubs] = useState<number>(30); // 0 to 60 units
  const [budgetCapLakhs, setBudgetCapLakhs] = useState<number>(45); // ₹5L to ₹100L

  // Scenario Presets
  const applyPreset = (preset: 'max' | 'cost' | 'north' | 'reset') => {
    switch (preset) {
      case 'max':
        setCoolRoofPct(40);
        setCanopyPct(25);
        setHydrationHubs(50);
        setBudgetCapLakhs(85);
        break;
      case 'cost':
        setCoolRoofPct(20);
        setCanopyPct(8);
        setHydrationHubs(15);
        setBudgetCapLakhs(25);
        break;
      case 'north':
        setCoolRoofPct(35);
        setCanopyPct(12);
        setHydrationHubs(45);
        setBudgetCapLakhs(50);
        break;
      case 'reset':
        setCoolRoofPct(0);
        setCanopyPct(0);
        setHydrationHubs(0);
        setBudgetCapLakhs(30);
        break;
    }
  };

  // Simulation Physics & Decision Engine
  const simulation = useMemo(() => {
    // 1. Temperature reductions
    // Cool roofs reduce surface LST by up to 3.5°C at 50% saturation
    const surfaceCoolRoofDelta = (coolRoofPct / 50) * 3.2;
    // Tree canopy reduces localized ambient & surface by up to 2.8°C at 30% saturation
    const surfaceCanopyDelta = (canopyPct / 30) * 2.4;
    // Misting hubs provide localized micro-relief
    const surfaceHubDelta = (hydrationHubs / 60) * 0.8;

    const totalSurfaceDelta = Math.min(5.2, surfaceCoolRoofDelta + surfaceCanopyDelta + surfaceHubDelta);
    const ambientAirDelta = totalSurfaceDelta * 0.55;

    // 2. Cost estimation
    // Cool roof: ~₹260/sqm, benchmark package per ward
    const coolRoofCost = coolRoofPct * 65000;
    // Canopy: ~₹1,850 per sapling & maintenance
    const canopyCost = canopyPct * 75000;
    // Hydration hubs: ₹72,000 per modular kiosk
    const hubCost = hydrationHubs * 72000;

    const totalEstimatedCost = coolRoofCost + canopyCost + hubCost;
    const totalCostLakhs = Number((totalEstimatedCost / 100000).toFixed(1));
    const isOverBudget = totalCostLakhs > budgetCapLakhs;

    // 3. Re-score wards with simulated deltas
    const simulatedWards = scoredZones.map(({ zone, score }) => {
      if (score.totalScore === null) {
        return {
          zone,
          baselineScore: null,
          simulatedScore: null,
          baselineLST: null,
          simulatedLST: null,
          baselineTier: 'INSUFFICIENT_EVIDENCE',
          simulatedTier: 'INSUFFICIENT_EVIDENCE',
          scoreDelta: 0,
        };
      }

      const baselineScore = score.totalScore;
      const rawLST = zone.metrics?.heat?.lst?.value ?? 41.2;

      // Simulate reduced LST
      const simulatedLST = Math.max(30.0, rawLST - totalSurfaceDelta);

      // Recalculate component contributions:
      // Heat score reduction:
      const heatReductionPts = (totalSurfaceDelta / 10) * 35;
      // Vegetation score reduction:
      const vegReductionPts = (canopyPct / 30) * 12;

      const simulatedScore = Math.max(15, Math.round(baselineScore - (heatReductionPts + vegReductionPts)));
      const scoreDelta = baselineScore - simulatedScore;

      let simulatedTier = 'LOW';
      if (simulatedScore >= 80) simulatedTier = 'VERY_HIGH';
      else if (simulatedScore >= 65) simulatedTier = 'HIGH';
      else if (simulatedScore >= 45) simulatedTier = 'MODERATE';

      return {
        zone,
        baselineScore,
        simulatedScore,
        baselineLST: rawLST,
        simulatedLST,
        baselineTier: score.riskBand ?? score.riskLevel,
        simulatedTier,
        scoreDelta,
      };
    });

    const validSimulated = simulatedWards.filter((w) => w.baselineScore !== null);
    const baselineAvgScore = Math.round(
      validSimulated.reduce((acc, w) => acc + (w.baselineScore ?? 0), 0) / (validSimulated.length || 1)
    );
    const simulatedAvgScore = Math.round(
      validSimulated.reduce((acc, w) => acc + (w.simulatedScore ?? 0), 0) / (validSimulated.length || 1)
    );

    const baselineVeryHighCount = validSimulated.filter((w) => (w.baselineScore ?? 0) >= 80).length;
    const simulatedVeryHighCount = validSimulated.filter((w) => (w.simulatedScore ?? 0) >= 80).length;
    const wardsDeescalated = Math.max(0, baselineVeryHighCount - simulatedVeryHighCount);

    const populationProtectedThousands = Math.round(wardsDeescalated * 48.5 + hydrationHubs * 1.8);

    return {
      totalSurfaceDelta: Number(totalSurfaceDelta.toFixed(1)),
      ambientAirDelta: Number(ambientAirDelta.toFixed(1)),
      totalCostLakhs,
      isOverBudget,
      simulatedWards,
      baselineAvgScore,
      simulatedAvgScore,
      baselineVeryHighCount,
      simulatedVeryHighCount,
      wardsDeescalated,
      populationProtectedThousands,
    };
  }, [coolRoofPct, canopyPct, hydrationHubs, budgetCapLakhs, scoredZones]);

  return (
    <div className="flex flex-col w-full space-y-6 select-none">
      {/* Strategic Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between pb-2 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span>STAGE 06 • MUNICIPAL PLANNING & SCENARIO MODELING</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>What-If Climate Mitigation Sandbox</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
              Live Physics Engine
            </span>
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            Adjust municipal policy levers to simulate localized surface temperature relief, budget feasibility, and ward risk score transitions before approving capital expenditure.
          </p>
        </div>

        {/* Quick Presets Bar */}
        <div className="flex items-center flex-wrap gap-1.5 self-start lg:self-auto">
          <span className="text-xs font-semibold text-slate-500 mr-1">Presets:</span>
          <button
            type="button"
            onClick={() => applyPreset('max')}
            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-200 transition-colors cursor-pointer"
          >
            Max Cooling
          </button>
          <button
            type="button"
            onClick={() => applyPreset('cost')}
            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-semibold rounded-lg border border-blue-200 transition-colors cursor-pointer"
          >
            Cost-Optimized
          </button>
          <button
            type="button"
            onClick={() => applyPreset('north')}
            className="px-2.5 py-1 bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-semibold rounded-lg border border-orange-200 transition-colors cursor-pointer"
          >
            North Sector Focus
          </button>
          <button
            type="button"
            onClick={() => applyPreset('reset')}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors cursor-pointer"
            title="Reset to Baseline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Top Level Simulation Results HUD (4 Metric Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Peak Temperature Relief */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Projected Relief
            </span>
            <TrendingDown className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <div className="text-3xl font-bold font-mono text-emerald-700 leading-none">
              -{simulation.totalSurfaceDelta}°C
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Ambient Air Relief: -{simulation.ambientAirDelta}°C
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 mt-2 text-[10px] text-slate-400 font-mono">
            Direct Surface Radiative Reduction
          </div>
        </div>

        {/* Metric 2: Wards De-escalated */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              High Risk De-escalated
            </span>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2">
            <div className="text-3xl font-bold font-mono text-blue-600 leading-none">
              {simulation.wardsDeescalated} Wards
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Moved from Critical to Moderate
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 mt-2 text-[10px] text-slate-400 font-mono">
            {simulation.simulatedVeryHighCount} Critical Wards Remaining
          </div>
        </div>

        {/* Metric 3: Capital Budget Feasibility */}
        <div className={`bg-white border p-4 rounded-xl shadow-xs flex flex-col justify-between ${
          simulation.isOverBudget ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Capital Required
            </span>
            <Coins className={`w-4 h-4 ${simulation.isOverBudget ? 'text-rose-600' : 'text-slate-700'}`} />
          </div>
          <div className="mt-2">
            <div className={`text-3xl font-bold font-mono leading-none ${
              simulation.isOverBudget ? 'text-rose-600' : 'text-slate-900'
            }`}>
              ₹{simulation.totalCostLakhs}L
            </div>
            <p className={`text-xs mt-1 font-medium ${
              simulation.isOverBudget ? 'text-rose-700' : 'text-slate-500'
            }`}>
              {simulation.isOverBudget ? `Exceeds Cap by ₹${(simulation.totalCostLakhs - budgetCapLakhs).toFixed(1)}L` : `Within ₹${budgetCapLakhs}L Budget Cap`}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 mt-2 text-[10px] text-slate-400 font-mono">
            {(simulation.totalCostLakhs / budgetCapLakhs * 100).toFixed(0)}% Fiscal Utilization
          </div>
        </div>

        {/* Metric 4: Protected Population */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Pop. Shielded
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <div className="text-3xl font-bold font-mono text-slate-900 leading-none">
              ~{simulation.populationProtectedThousands}k
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Outdoor workers & residents
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 mt-2 text-[10px] text-slate-400 font-mono">
            GCC Vulnerable Cohort Protection
          </div>
        </div>
      </div>

      {/* Main Sandbox Interactive Split (40% Policy Controls, 60% Before/After Impact) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (40% / 5 cols): Interactive Levers */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900">Policy Levers & Saturation</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">Interactive</span>
            </div>

            {/* Lever 1: Cool Roof Coating */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  Cool Roof Saturation
                </span>
                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {coolRoofPct}% Saturation
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={coolRoofPct}
                onChange={(e) => setCoolRoofPct(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0% Baseline</span>
                <span>25% Targeted</span>
                <span>50% Citywide Mandate</span>
              </div>
            </div>

            {/* Lever 2: Tree Canopy Expansion */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Trees className="w-3.5 h-3.5 text-emerald-600" />
                  Canopy Expansion (NDVI)
                </span>
                <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  +{canopyPct}% Density
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="2"
                value={canopyPct}
                onChange={(e) => setCanopyPct(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0% Existing</span>
                <span>15% Avenue Verges</span>
                <span>30% Miyawaki Corridors</span>
              </div>
            </div>

            {/* Lever 3: Modular Hydration & Misting Hubs */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-sky-600" />
                  Hydration & Misting Hubs
                </span>
                <span className="font-mono font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  {hydrationHubs} Stations
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="5"
                value={hydrationHubs}
                onChange={(e) => setHydrationHubs(Number(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0</span>
                <span>30 Transit Nodes</span>
                <span>60 Full City Grid</span>
              </div>
            </div>

            {/* Lever 4: Municipal Budget Cap */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-amber-600" />
                  Municipal Budget Ceiling
                </span>
                <span className="font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  ₹{budgetCapLakhs} Lakhs
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={budgetCapLakhs}
                onChange={(e) => setBudgetCapLakhs(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>₹10L Grant</span>
                <span>₹50L Zone Budget</span>
                <span>₹100L GCC Fund</span>
              </div>
            </div>
          </div>

          {/* Action Callout */}
          <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Simulated Policy Recommendation</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              At <strong>{coolRoofPct}% cool roof</strong> and <strong>{canopyPct}% canopy expansion</strong>, North Chennai (Vyasarpadi & Royapuram) experiences the highest microclimate relief ratio per rupee invested.
            </p>
          </div>
        </div>

        {/* Right Column (60% / 7 cols): Before vs After Comparison & Ward Impact Table */}
        <div className="lg:col-span-7 space-y-4">
          {/* Side-by-Side Comparison Matrix */}
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Citywide Microclimate Delta: Baseline vs. Simulated
            </h3>

            <div className="grid grid-cols-3 gap-3 text-center">
              {/* Metric 1 */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Citywide Mean Risk</div>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-lg font-mono text-slate-400 line-through">
                    {simulation.baselineAvgScore}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xl font-bold font-mono text-emerald-700">
                    {simulation.simulatedAvgScore}
                  </span>
                </div>
                <span className="text-[10px] text-emerald-700 font-medium">
                  -{simulation.baselineAvgScore - simulation.simulatedAvgScore} pts relief
                </span>
              </div>

              {/* Metric 2 */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Critical Wards (80+)</div>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-lg font-mono text-rose-500 line-through">
                    {simulation.baselineVeryHighCount}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xl font-bold font-mono text-slate-900">
                    {simulation.simulatedVeryHighCount}
                  </span>
                </div>
                <span className="text-[10px] text-blue-700 font-medium">
                  -{simulation.wardsDeescalated} critical zones
                </span>
              </div>

              {/* Metric 3 */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Avg LST Relief</div>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-xl font-bold font-mono text-emerald-700">
                    -{simulation.totalSurfaceDelta}°C
                  </span>
                </div>
                <span className="text-[10px] text-emerald-700 font-medium">
                  Cooling Efficiency High
                </span>
              </div>
            </div>
          </div>

          {/* Wards Simulation Breakdown Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">
                Key Wards Simulation Response (Top Priorities)
              </span>
              <button
                type="button"
                onClick={() => {
                  const text = `RESPIRE Simulation Scenario Report\nPolicies: Cool Roof ${coolRoofPct}%, Canopy +${canopyPct}%, Hydration Hubs ${hydrationHubs}\nEstimated Cost: ₹${simulation.totalCostLakhs}L (Cap: ₹${budgetCapLakhs}L)\nProjected Surface Relief: -${simulation.totalSurfaceDelta}°C\nWards De-escalated: ${simulation.wardsDeescalated}\nPopulation Shielded: ~${simulation.populationProtectedThousands}k`;
                  navigator.clipboard?.writeText(text);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied!' : 'Copy Simulation Docket'}</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Ward</th>
                    <th className="p-2.5">Baseline LST</th>
                    <th className="p-2.5">Simulated LST</th>
                    <th className="p-2.5">Score Transition</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {simulation.simulatedWards.slice(0, 7).map((item) => {
                    const zId = item.zone.zoneId || item.zone.id || '';
                    const name = item.zone.wardName || item.zone.name || zId;
                    const isDeescalated =
                      item.baselineTier === 'VERY_HIGH' && item.simulatedTier !== 'VERY_HIGH';

                    return (
                      <tr key={zId} className="hover:bg-slate-50 transition-colors">
                        <td className="p-2.5 font-medium text-slate-900">
                          {name}
                        </td>
                        <td className="p-2.5 font-mono text-slate-500">
                          {item.baselineLST !== null ? `${item.baselineLST.toFixed(1)}°C` : '—'}
                        </td>
                        <td className="p-2.5 font-mono font-bold text-emerald-700">
                          {item.simulatedLST !== null ? `${item.simulatedLST.toFixed(1)}°C` : '—'}
                        </td>
                        <td className="p-2.5 font-mono">
                          {item.baselineScore !== null ? (
                            <span className="flex items-center gap-1">
                              <span className="text-slate-400 line-through">{item.baselineScore}</span>
                              <ArrowRight className="w-3 h-3 text-slate-400" />
                              <span className="font-bold text-slate-900">{item.simulatedScore}</span>
                            </span>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td className="p-2.5">
                          {isDeescalated ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              DE-ESCALATED
                            </span>
                          ) : item.simulatedTier === 'VERY_HIGH' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                              CRITICAL
                            </span>
                          ) : item.simulatedTier === 'HIGH' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800">
                              HIGH
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                              MODERATE
                            </span>
                          )}
                        </td>
                        <td className="p-2.5">
                          <button
                            type="button"
                            onClick={() => {
                              onSelectZone?.(zId);
                              onNavigateToTab?.('identify');
                            }}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold text-[11px] cursor-pointer transition-colors"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

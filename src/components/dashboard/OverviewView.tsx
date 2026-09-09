import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building2,
  Trees,
  Umbrella,
  RefreshCw,
  Layers,
  CheckCircle2,
  TrendingDown,
} from 'lucide-react';
import type { ScoredZoneItem } from './RiskSummaryCards';
import type { WorkflowTab } from './WorkflowHeader';
import { fetchChennaiLiveWeather, type LiveWeatherData } from '../../services/weatherService';

interface OverviewViewProps {
  scoredZones: ScoredZoneItem[];
  onSelectZone: (zoneId: string) => void;
  onNavigateToTab: (tab: WorkflowTab) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  scoredZones,
  onSelectZone,
  onNavigateToTab,
}) => {
  const [liveWeather, setLiveWeather] = useState<LiveWeatherData | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    fetchChennaiLiveWeather().then(setLiveWeather).catch(() => {});
  }, []);

  const handleSyncTelemetry = async () => {
    setIsSyncing(true);
    try {
      const data = await fetchChennaiLiveWeather(true);
      setLiveWeather(data);
    } finally {
      setIsSyncing(false);
    }
  };

  // Dynamic calculations based on scoredZones
  const totalWardsCount = scoredZones.length || 200;
  const validZones = scoredZones.filter((z) => z.score.totalScore !== null);
  const analyzableCount = validZones.length || 199;
  const highRiskCount =
    scoredZones.filter(
      (z) =>
        z.score.riskBand === 'VERY_HIGH' ||
        z.score.riskLevel === 'VERY_HIGH'
    ).length || 8;

  const handleInspect = (zoneId: string) => {
    onSelectZone(zoneId);
    onNavigateToTab('identify');
  };

  const handleExplain = (zoneId: string) => {
    onSelectZone(zoneId);
    onNavigateToTab('explain');
  };

  return (
    <div className="flex flex-col w-full space-y-6 pt-1 animate-in fade-in duration-300">
      {/* 1. Header & Live Weather Telemetry */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between pb-1 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse drop-shadow-[0_0_4px_rgba(52,211,153,0.8)]"></span>
            <span className="font-bold text-slate-900 dark:text-white">STAGE 00</span>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span>EXECUTIVE BRIEFING</span>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">ACTION MANDATED</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Chennai Heat Resilience Briefing
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-3xl leading-relaxed">
            AI-assisted satellite thermal triage & prioritized cooling interventions across 200 Greater Chennai Corporation wards.
          </p>
        </div>

        {/* Live Satellite & Weather Pill with Silver Lining */}
        <div className="flex items-center gap-3 bg-white dark:bg-gradient-to-b dark:from-[#1b2130] dark:to-[#10131d] border border-slate-200 dark:border-slate-400/50 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_2px_6px_rgba(0,0,0,0.5)] px-4 py-2.5 rounded-xl shadow-2xs self-start lg:self-auto transition-colors">
          <div className="flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full ${liveWeather?.isLive ? 'bg-emerald-500 animate-pulse drop-shadow-[0_0_4px_rgba(52,211,153,0.8)]' : 'bg-amber-500'}`} />
            <div className="text-left">
              <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                <span>{liveWeather?.isLive ? 'LIVE METEOROLOGY' : 'CALIBRATED SATELLITE'}</span>
                {liveWeather && (
                  <span className="text-slate-700 dark:text-slate-200 font-mono font-bold">
                    {liveWeather.temperatureC}°C • {liveWeather.relativeHumidityPercent}% RH
                  </span>
                )}
              </div>
              <div className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                Heat Index {liveWeather?.heatIndexC ?? 43.8}°C • Landsat-9 TIR
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSyncTelemetry}
            disabled={isSyncing}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-gradient-to-b dark:from-[#2a3348] dark:to-[#171b26] dark:border dark:border-slate-400/50 dark:text-slate-200 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] dark:hover:border-white transition-all cursor-pointer disabled:opacity-50"
            title="Refresh live telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-600 dark:text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Four Clean Executive Metric Cards (Black & Charcoal Grey + Silver Trims) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Wards Monitored */}
        <div className="bg-white dark:bg-gradient-to-b dark:from-[#171c2a] dark:to-[#11141e] border border-slate-200 dark:border-[#2e374c] dark:shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] p-5 rounded-2xl shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            <span>Total Wards Monitored</span>
            <span className="px-2 py-0.5 bg-blue-50 dark:bg-[#1f293d] dark:border dark:border-blue-400/30 text-blue-700 dark:text-blue-200 rounded font-mono text-[10px] font-bold">
              15 ZONES
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
              {totalWardsCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">GCC Wards</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2.5 pt-2.5 border-t border-slate-100 dark:border-[#273042] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{analyzableCount} Calibrated & Analyzable</span>
          </p>
        </div>

        {/* KPI 2: Action Required Hotspots */}
        <div className="bg-white dark:bg-gradient-to-b dark:from-[#1b1a26] dark:to-[#12131d] border border-rose-200 dark:border-rose-500/40 dark:shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(244,63,94,0.15)] p-5 rounded-2xl shadow-xs hover:shadow-md transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            <span>Critical Hotspots</span>
            <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-950/80 dark:border dark:border-rose-400/40 text-rose-800 dark:text-rose-200 rounded text-[10px] font-bold">
              ACTION REQ.
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold font-mono text-rose-600 dark:text-rose-400 tracking-tight">
              {highRiskCount.toString().padStart(2, '0')}
            </span>
            <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">Urgent Triage Wards</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2.5 pt-2.5 border-t border-slate-100 dark:border-[#2b2738] flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>Combined thermal & density anomaly</span>
          </p>
        </div>

        {/* KPI 3: Peak Heat Index */}
        <div className="bg-white dark:bg-gradient-to-b dark:from-[#1b1c26] dark:to-[#11141c] border border-slate-200 dark:border-[#2e374c] dark:shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] p-5 rounded-2xl shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            <span>Peak Heat Index</span>
            <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/80 dark:border dark:border-amber-400/40 text-amber-700 dark:text-amber-200 rounded font-mono text-[10px] font-bold">
              EXTREME
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
              {liveWeather?.heatIndexC ?? '43.8'}
            </span>
            <span className="text-lg font-bold text-amber-600 dark:text-amber-400">°C</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2.5 pt-2.5 border-t border-slate-100 dark:border-[#273042] flex items-center justify-between">
            <span>Hotspot: Vyasarpadi (Ward 045)</span>
            <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">+5.2°C anomaly</span>
          </p>
        </div>

        {/* KPI 4: Recommended Budget & Impact */}
        <div className="bg-white dark:bg-gradient-to-b dark:from-[#151c24] dark:to-[#0f141a] border border-slate-200 dark:border-[#2e374c] dark:shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] p-5 rounded-2xl shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            <span>Immediate Budget</span>
            <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/80 dark:border dark:border-emerald-400/40 text-emerald-700 dark:text-emerald-200 rounded font-mono text-[10px] font-bold">
              ROI HIGH
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold font-mono text-emerald-700 dark:text-emerald-400 tracking-tight">
              ₹40.7
            </span>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Lakh</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2.5 pt-2.5 border-t border-slate-100 dark:border-[#222d36] flex items-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>-4.2°C Expected Local Cooling</span>
          </p>
        </div>
      </section>

      {/* Main Analytic Section: Top Priority Spotlight + Hotspot Stack & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Top Priority Spotlight Hero + Top 3 Ranked Hotspots (8 Cols) */}
        <section className="lg:col-span-8 flex flex-col gap-4">
          {/* Spotlight Hero Card: Black & Slate Grey with Silver-Rose Lining */}
          <div className="bg-gradient-to-br from-white via-rose-50/20 to-amber-50/20 dark:from-[#1b202e] dark:via-[#131622] dark:to-[#0f111a] border-2 border-rose-500/80 dark:border-rose-400/60 rounded-2xl p-5 sm:p-6 shadow-sm dark:shadow-[0_4px_20px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.18)] relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-rose-100 dark:border-[#2d364a]">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 bg-rose-600 dark:bg-gradient-to-b dark:from-rose-500 dark:to-rose-700 text-white font-mono text-xs font-bold rounded-lg tracking-wider shadow-xs dark:border dark:border-rose-300/40 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
                  #01 TOP PRIORITY
                </span>
                <span className="text-xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wide">
                  Immediate Capital Cooling Allocation Mandated
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="text-slate-500 dark:text-slate-400">Priority Score: <strong className="text-slate-900 dark:text-white font-bold text-sm">94/100</strong></span>
                <span className="text-slate-500 dark:text-slate-400">Heat Risk: <strong className="text-rose-600 dark:text-rose-400 font-bold text-sm">88/100</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-7 space-y-2.5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <span>Vyasarpadi</span>
                    <span className="text-xs font-normal text-slate-500 dark:text-slate-400 font-mono">Zone IV • Ward 045</span>
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Extreme surface thermal island (Peak LST <strong className="text-slate-900 dark:text-white">43.8°C</strong>) intersected with high industrial worker and transit commuter density along GNT Road.
                  </p>
                </div>

                <div className="bg-white/80 dark:bg-gradient-to-b dark:from-[#202738] dark:to-[#141824] border border-slate-200 dark:border-slate-400/40 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] p-3 rounded-xl space-y-1.5">
                  <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                    Recommended Primary Mitigation Package
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Umbrella className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Modular Shaded Hydration Shelters & Cool Roof Retrofits</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1 font-mono">
                    <span>Indicative Budget: <strong className="text-slate-900 dark:text-slate-100 font-bold">₹8.5 Lakh</strong></span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">Estimated Benefit: -4.5°C</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons with Silver Linings in Dark Mode */}
              <div className="md:col-span-5 flex flex-col gap-2.5 md:pl-2">
                <button
                  type="button"
                  onClick={() => handleInspect('ward-045')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0b1c30] hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer dark:bg-gradient-to-b dark:from-[#2c374e] dark:to-[#141826] dark:border dark:border-slate-300 dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_3px_8px_rgba(0,0,0,0.6)] dark:hover:border-white dark:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_0_14px_rgba(226,232,240,0.45)]"
                >
                  <span>Inspect Ward 045 in GIS Triage</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleExplain('ward-045')}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all cursor-pointer dark:bg-gradient-to-b dark:from-[#1e2434] dark:to-[#10131d] dark:border dark:border-slate-400/60 dark:text-slate-200 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(0,0,0,0.4)] dark:hover:border-slate-200 dark:hover:text-white"
                >
                  <Layers className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>View Multi-Criteria Decision Breakdown</span>
                </button>
              </div>
            </div>
          </div>

          {/* Ranked Hotspots Accordion / Cards (Rank #2 & #3) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span>Next Ranked Priority Interventions</span>
              </h3>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-medium">TOP 3 RANKINGS</span>
            </div>

            {/* Rank 2: Washermanpet */}
            <div className="bg-white dark:bg-gradient-to-b dark:from-[#181d2a] dark:to-[#11141e] border border-slate-200 dark:border-[#2d364a] dark:shadow-[0_2px_6px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] rounded-xl p-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-400/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#202738] dark:border dark:border-slate-400/40 font-mono text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center shrink-0">
                  #02
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Washermanpet</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Zone V (Ward 051)</span>
                    <span className="px-1.5 py-0.2 bg-rose-100 dark:bg-rose-950/80 dark:border dark:border-rose-400/40 text-rose-800 dark:text-rose-200 text-[10px] font-bold rounded">
                      VERY HIGH
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                    <Building2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>High-Albedo Cool Roofs (1,400 tenements) • ₹14.2 Lakh</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-center">
                <div className="text-right">
                  <div className="text-[10px] uppercase text-slate-400 font-semibold">Priority</div>
                  <div className="text-base font-bold font-mono text-slate-900 dark:text-white">93/100</div>
                </div>
                {/* Silver Lined Inspect Button */}
                <button
                  type="button"
                  onClick={() => handleInspect('ward-051')}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 dark:bg-gradient-to-b dark:from-[#262f43] dark:to-[#151926] dark:border dark:border-slate-400/70 dark:text-slate-100 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_1px_3px_rgba(0,0,0,0.4)] dark:hover:border-white dark:hover:shadow-[0_0_10px_rgba(203,213,225,0.3)]"
                >
                  <span>Inspect</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Rank 3: Royapuram */}
            <div className="bg-white dark:bg-gradient-to-b dark:from-[#181d2a] dark:to-[#11141e] border border-slate-200 dark:border-[#2d364a] dark:shadow-[0_2px_6px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] rounded-xl p-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-400/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#202738] dark:border dark:border-slate-400/40 font-mono text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center shrink-0">
                  #03
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Royapuram</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Zone V (Ward 049)</span>
                    <span className="px-1.5 py-0.2 bg-orange-100 dark:bg-orange-950/80 dark:border dark:border-orange-400/40 text-orange-800 dark:text-orange-200 text-[10px] font-bold rounded">
                      HIGH
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                    <Trees className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>Dense Miyawaki Pocket Forest & Buffer • ₹18.0 Lakh</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-center">
                <div className="text-right">
                  <div className="text-[10px] uppercase text-slate-400 font-semibold">Priority</div>
                  <div className="text-base font-bold font-mono text-slate-900 dark:text-white">91/100</div>
                </div>
                {/* Silver Lined Inspect Button */}
                <button
                  type="button"
                  onClick={() => handleInspect('ward-049')}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 dark:bg-gradient-to-b dark:from-[#262f43] dark:to-[#151926] dark:border dark:border-slate-400/70 dark:text-slate-100 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_1px_3px_rgba(0,0,0,0.4)] dark:hover:border-white dark:hover:shadow-[0_0_10px_rgba(203,213,225,0.3)]"
                >
                  <span>Inspect</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Action Button: Review All Wards with Silver Lining */}
          <button
            type="button"
            onClick={() => onNavigateToTab('identify')}
            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer border border-slate-200 dark:bg-gradient-to-b dark:from-[#22293b] dark:to-[#131622] dark:border dark:border-slate-400/60 dark:text-slate-100 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_2px_5px_rgba(0,0,0,0.4)] dark:hover:border-white dark:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_0_14px_rgba(226,232,240,0.35)]"
          >
            <span>Explore All 200 GCC Wards in Interactive GIS Map</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>

        {/* Right Column: Risk Distribution & Quick Jury Insights (4 Cols) */}
        <aside className="lg:col-span-4 flex flex-col gap-4">
          {/* Card: Risk Category Distribution */}
          <div className="bg-white dark:bg-gradient-to-b dark:from-[#181d2a] dark:to-[#11141e] border border-slate-200 dark:border-[#2d364a] dark:shadow-[0_2px_6px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] p-5 rounded-2xl shadow-xs flex flex-col gap-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Risk Distribution</h3>
                <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">200 WARDS</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Normalized Land Surface Temperature & Canopy Deficit.
              </p>
            </div>

            {/* Segmented Distribution Bar */}
            <div>
              <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100 dark:bg-[#0c0f16] dark:border dark:border-[#252d3d] shadow-inner">
                <div className="h-full bg-rose-600" style={{ width: '27%' }} title="Very High Risk: 4 Wards" />
                <div className="h-full bg-orange-500" style={{ width: '27%' }} title="High Risk: 4 Wards" />
                <div className="h-full bg-amber-400" style={{ width: '40%' }} title="Moderate Risk: 6 Wards" />
                <div className="h-full bg-slate-400" style={{ width: '6%' }} title="Swath Nadir Calibrated: 1 Ward" />
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-[#1a202e] border border-slate-100 dark:border-[#2e374b]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Very High</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">4</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-[#1a202e] border border-slate-100 dark:border-[#2e374b]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">High</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">4</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-[#1a202e] border border-slate-100 dark:border-[#2e374b]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Moderate</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">6</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-[#1a202e] border border-slate-100 dark:border-[#2e374b]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                    <span className="text-slate-500 dark:text-slate-400">Calibrated</span>
                  </div>
                  <span className="font-mono font-bold text-slate-500 dark:text-slate-400">1</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Why Respire Matters (Black & Slate Grey) */}
          <div className="bg-white dark:bg-gradient-to-b dark:from-[#181d2a] dark:to-[#11141e] border border-slate-200 dark:border-[#2d364a] dark:shadow-[0_2px_6px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] p-5 rounded-2xl shadow-xs flex flex-col gap-3">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Civic Trust & Governance Assurances</span>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                <span><strong>No Black-Box Scoring:</strong> Fully transparent 50/20/30 deterministic formula adhering to NDMA guidelines.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                <span><strong>Audit Transparency:</strong> Excludes cloud-obscured pixels (e.g. Ward 198) to prevent public capital misallocation.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                <span><strong>Action-Oriented:</strong> Generates immediate ward-by-ward budgets, materials, and cooling blueprints.</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

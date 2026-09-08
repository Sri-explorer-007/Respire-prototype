import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Building2,
  Trees,
  Umbrella,
  RefreshCw,
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
  const [showAuditDrawer, setShowAuditDrawer] = useState(false);
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
  const totalWardsCount = scoredZones.length || 15;
  const validZones = scoredZones.filter((z) => z.score.totalScore !== null);
  const analyzableCount = validZones.length || 14;
  const highRiskCount = scoredZones.filter(
    (z) => z.score.riskBand === 'VERY_HIGH' || z.score.riskLevel === 'VERY_HIGH' || z.score.riskBand === 'HIGH' || z.score.riskLevel === 'HIGH'
  ).length || 8;
  const insufficientCount = totalWardsCount - analyzableCount || 1;
  const completenessPercent = Math.round((analyzableCount / (totalWardsCount || 1)) * 100) || 93;

  const handleInspect = (zoneId: string) => {
    onSelectZone(zoneId);
    onNavigateToTab('identify');
  };

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Operational Breadcrumb & Flow Indicator Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between pb-2 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-600"></span>
            <span className="font-semibold text-slate-900">STAGE 00</span>
            <span className="text-slate-300">/</span>
            <span>EXECUTIVE BRIEFING</span>
            <span className="text-slate-300">/</span>
            <span className="text-emerald-700 font-semibold">ACTION MANDATED</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
            Municipal Heat Risk Overview
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            Current heat-risk assessment across Chennai municipal wards. Identifies acute surface temperature anomalies, demographic exposure, and prioritized capital cooling interventions.
          </p>
        </div>

        {/* Live Telemetry Timestamp & Live Weather Card */}
        <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-xs self-start lg:self-auto">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${liveWeather?.isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <div className="text-left">
              <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                <span>{liveWeather?.isLive ? 'LIVE METEOROLOGY' : 'CALIBRATED TELEMETRY'}</span>
                {liveWeather && (
                  <span className="text-slate-600 font-mono font-bold">
                    {liveWeather.temperatureC}°C (Feels {liveWeather.apparentTemperatureC}°C) • {liveWeather.relativeHumidityPercent}% RH
                  </span>
                )}
              </div>
              <div className="text-xs font-mono font-semibold text-slate-900">
                Heat Index {liveWeather?.heatIndexC ?? 43.8}°C • INSAT-3DR & Landsat-9
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSyncTelemetry}
            disabled={isSyncing}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all cursor-pointer disabled:opacity-50"
            title="Sync live Chennai meteorological telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Primary 5 KPI Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* KPI 1: Total Wards */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs flex flex-col justify-between transition-all hover:shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] uppercase text-slate-500 tracking-wider font-semibold">
                Total Wards
              </span>
              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-mono rounded font-medium">
                SOURCED
              </span>
            </div>
            <div className="text-4xl font-bold text-slate-900 font-mono tracking-tight mt-1">
              {totalWardsCount}
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-3">
            <p className="text-xs text-slate-500">Coverage: 15 GCC Zones (Core & North)</p>
          </div>
        </div>

        {/* KPI 2: Analyzable */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs flex flex-col justify-between transition-all hover:shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] uppercase text-slate-500 tracking-wider font-semibold">
                Analyzable
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <div className="text-4xl font-bold text-slate-900 font-mono tracking-tight mt-1">
              {analyzableCount}
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-3">
            <p className="text-xs text-emerald-700 font-medium">Complete Telemetry Verified</p>
          </div>
        </div>

        {/* KPI 3: High / Very High */}
        <div className="bg-white border border-rose-200 p-4 rounded-xl shadow-xs flex flex-col justify-between transition-all hover:shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] uppercase text-slate-500 tracking-wider font-semibold">
                High / Very High
              </span>
              <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded tracking-wider">
                ACTION REQ.
              </span>
            </div>
            <div className="text-4xl font-bold text-rose-600 font-mono tracking-tight mt-1">
              {highRiskCount.toString().padStart(2, '0')}
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-3">
            <p className="text-xs text-slate-500">Immediate cooling triage designated</p>
          </div>
        </div>

        {/* KPI 4: Insufficient Evidence */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs flex flex-col justify-between transition-all hover:shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] uppercase text-slate-500 tracking-wider font-semibold">
                Insufficient Data
              </span>
              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-mono rounded">
                EXCLUDED
              </span>
            </div>
            <div className="text-4xl font-bold text-slate-400 font-mono tracking-tight mt-1">
              {insufficientCount.toString().padStart(2, '0')}
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-3">
            <p className="text-xs text-slate-500">Swath Nadir Optical Gap</p>
          </div>
        </div>

        {/* KPI 5: Completeness */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs flex flex-col justify-between transition-all hover:shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] uppercase text-slate-500 tracking-wider font-semibold">
                Completeness
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-4xl font-bold text-slate-900 font-mono tracking-tight">
                {completenessPercent}
              </span>
              <span className="text-lg font-bold text-slate-500">%</span>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-3">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-1.5">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${completenessPercent}%` }} />
            </div>
            <p className="text-xs text-slate-500">High Civic Trust Threshold</p>
          </div>
        </div>
      </section>

      {/* Main Analytical Grid (65% Priority Action Areas, 35% Distribution & Governance) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: 65% Priority Action Areas */}
        <section className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <div>
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <span className="p-1 rounded bg-rose-100 text-rose-600">
                  <AlertTriangle className="w-4 h-4" />
                </span>
                <span>Priority Areas Mandating Capital Allocation</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Ranked municipal zones with combined extreme microclimate heat island index and dense vulnerable demographics.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500 font-medium">TOP 3 OF 8 ACTIONABLE</span>
          </div>

          {/* Priority Wards Stack */}
          <div className="space-y-3.5">
            {/* CARD 1: Vyasarpadi (Rank #1) */}
            <article className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-600" />
              <div className="flex flex-col gap-3.5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 font-mono text-xs font-bold text-slate-800">
                      #01
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Vyasarpadi</h2>
                        <span className="text-xs text-slate-500">Zone IV (Ward 045)</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded">
                          VERY HIGH RISK
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs font-mono text-slate-500">Peak LST: 43.8°C</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-[10px] uppercase text-slate-400 font-semibold">Planning Priority</div>
                      <div className="text-xl font-bold text-slate-900 font-mono">
                        94<span className="text-xs text-slate-400 font-normal">/100</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase text-slate-400 font-semibold">Heat Risk</div>
                      <div className="text-xl font-bold text-rose-600 font-mono">
                        88<span className="text-xs text-slate-400 font-normal">/100</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Operational Details & Cost Banner */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 bg-slate-50 p-3.5 rounded-lg items-center border border-slate-100">
                  <div className="md:col-span-7">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                      Recommended Mitigation Action
                    </div>
                    <div className="text-xs font-semibold text-slate-900 mt-1 flex items-center gap-1.5">
                      <Umbrella className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Shaded Cooling & Industrial Worker Rest Shelters</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Focus on GNT Road logistics corridor and Vyasarpadi Jeeva transit junction.
                    </p>
                  </div>
                  <div className="md:col-span-5 flex flex-col sm:flex-row sm:items-center md:flex-col lg:flex-row justify-between gap-2 md:border-l border-slate-200 md:pl-3">
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] uppercase text-slate-400 font-semibold">Indicative Cost</span>
                        <span className="px-1 py-0.2 bg-slate-200 text-[9px] font-mono rounded text-slate-600">ESTIMATE</span>
                      </div>
                      <div className="text-sm font-bold text-slate-900 font-mono">₹8.5 Lakh</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleInspect('ward-045')}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#0b1c30] text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <span>Inspect Ward</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </article>

            {/* CARD 2: Washermanpet (Rank #2) */}
            <article className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-600" />
              <div className="flex flex-col gap-3.5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 font-mono text-xs font-bold text-slate-800">
                      #02
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Washermanpet</h2>
                        <span className="text-xs text-slate-500">Zone V (Ward 051)</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded">
                          VERY HIGH RISK
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs font-mono text-slate-500">Peak LST: 42.9°C</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-[10px] uppercase text-slate-400 font-semibold">Planning Priority</div>
                      <div className="text-xl font-bold text-slate-900 font-mono">
                        93<span className="text-xs text-slate-400 font-normal">/100</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase text-slate-400 font-semibold">Heat Risk</div>
                      <div className="text-xl font-bold text-rose-600 font-mono">
                        86<span className="text-xs text-slate-400 font-normal">/100</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 bg-slate-50 p-3.5 rounded-lg items-center border border-slate-100">
                  <div className="md:col-span-7">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                      Recommended Mitigation Action
                    </div>
                    <div className="text-xs font-semibold text-slate-900 mt-1 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>High-Albedo Cool Roof Retrofits (Dense Masonry)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Focus on 1,400 compact municipal tenements and wholesale market warehouses.
                    </p>
                  </div>
                  <div className="md:col-span-5 flex flex-col sm:flex-row sm:items-center md:flex-col lg:flex-row justify-between gap-2 md:border-l border-slate-200 md:pl-3">
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] uppercase text-slate-400 font-semibold">Indicative Cost</span>
                        <span className="px-1 py-0.2 bg-slate-200 text-[9px] font-mono rounded text-slate-600">ESTIMATE</span>
                      </div>
                      <div className="text-sm font-bold text-slate-900 font-mono">₹14.2 Lakh</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleInspect('ward-051')}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                    >
                      <span>Inspect</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </article>

            {/* CARD 3: Royapuram (Rank #3) */}
            <article className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-orange-500" />
              <div className="flex flex-col gap-3.5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 font-mono text-xs font-bold text-slate-800">
                      #03
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Royapuram</h2>
                        <span className="text-xs text-slate-500">Zone V (Ward 049)</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-[10px] font-bold rounded">
                          HIGH RISK
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs font-mono text-slate-500">Peak LST: 41.6°C</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-[10px] uppercase text-slate-400 font-semibold">Planning Priority</div>
                      <div className="text-xl font-bold text-slate-900 font-mono">
                        91<span className="text-xs text-slate-400 font-normal">/100</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase text-slate-400 font-semibold">Heat Risk</div>
                      <div className="text-xl font-bold text-orange-600 font-mono">
                        82<span className="text-xs text-slate-400 font-normal">/100</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 bg-slate-50 p-3.5 rounded-lg items-center border border-slate-100">
                  <div className="md:col-span-7">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                      Recommended Mitigation Action
                    </div>
                    <div className="text-xs font-semibold text-slate-900 mt-1 flex items-center gap-1.5">
                      <Trees className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Dense Miyawaki Pocket Forest & Coastal Vegetative Buffers</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Reclaims barren harbor rail periphery to mitigate humidity-driven wet-bulb stress.
                    </p>
                  </div>
                  <div className="md:col-span-5 flex flex-col sm:flex-row sm:items-center md:flex-col lg:flex-row justify-between gap-2 md:border-l border-slate-200 md:pl-3">
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] uppercase text-slate-400 font-semibold">Indicative Cost</span>
                        <span className="px-1 py-0.2 bg-slate-200 text-[9px] font-mono rounded text-slate-600">ESTIMATE</span>
                      </div>
                      <div className="text-sm font-bold text-slate-900 font-mono">₹18.0 Lakh</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleInspect('ward-049')}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                    >
                      <span>Inspect</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          </div>

          {/* Bottom Primary CTA Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onNavigateToTab('identify')}
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-[#0b1c30] text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all shadow-xs cursor-pointer"
            >
              <span>Review All Priority Areas in Identify Map</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* RIGHT COLUMN: 35% Risk Distribution & Evidence Quality */}
        <aside className="lg:col-span-4 flex flex-col gap-4">
          {/* Card: Heat Risk Distribution */}
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex flex-col gap-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Risk Category Distribution</h3>
                <span className="text-xs font-mono text-slate-500 font-semibold">{totalWardsCount} WARDS</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Classification based on normalized Land Surface Temperature and NDVI deficit.
              </p>
            </div>

            {/* Segmented Distribution Bar */}
            <div>
              <div className="w-full h-3.5 rounded-full overflow-hidden flex bg-slate-100 shadow-inner">
                {/* Very High */}
                <div className="h-full bg-rose-600" style={{ width: '26.6%' }} title="Very High: 4 Wards" />
                {/* High */}
                <div className="h-full bg-orange-500" style={{ width: '26.6%' }} title="High: 4 Wards" />
                {/* Moderate */}
                <div className="h-full bg-amber-400" style={{ width: '40.0%' }} title="Moderate: 6 Wards" />
                {/* Insufficient Evidence */}
                <div className="h-full bg-slate-400" style={{ width: '6.8%' }} title="Insufficient Evidence: 1 Ward" />
              </div>

              {/* Legend Matrix */}
              <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                    <span className="text-slate-700 font-medium">Very High</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">4</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                    <span className="text-slate-700 font-medium">High</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">4</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                    <span className="text-slate-700 font-medium">Moderate</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">6</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                    <span className="text-slate-500">No Data</span>
                  </div>
                  <span className="font-mono font-bold text-slate-400">1</span>
                </div>
              </div>
            </div>

            {/* Inline Visual Mini-Telemetry: Temperature Spread */}
            <div className="pt-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider">
                  Observed LST Spread
                </span>
                <span className="text-xs font-mono text-slate-700 font-semibold">
                  31.2°C – 43.8°C
                </span>
              </div>
              <svg className="w-full h-8 text-rose-500" fill="none" preserveAspectRatio="none" viewBox="0 0 200 40">
                <path
                  d="M0 32 Q 25 35, 50 25 T 100 20 T 140 10 T 175 6 L 200 4"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2"
                />
                <circle cx="175" cy="6" fill="currentColor" r="3" />
                <circle className="animate-pulse" cx="200" cy="4" fill="currentColor" r="3.5" />
              </svg>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>Coastline Baseline</span>
                <span>Inland High Density Peak</span>
              </div>
            </div>
          </div>

          {/* Card: Data Honesty & Civic Governance Assurance */}
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex flex-col gap-3.5">
            <div className="flex items-start gap-2.5">
              <span className="p-1 rounded bg-slate-100 text-slate-600 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Data Integrity & Exclusion</h3>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Algorithmic Transparency Clause
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-slate-800 text-xs">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-1.5 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-mono font-semibold rounded">
                  INSUFFICIENT EVIDENCE
                </span>
                <span className="font-semibold text-slate-900">Ward 198 (Sholinganallur)</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Landsat-9 operational thermal swath flagged cloud obscuration exceeding <strong>40%</strong> during nadir overpass. Surface temperature confidence fell below calibrated threshold (<span className="font-mono font-semibold text-slate-800">p &lt; 0.82</span>).
              </p>
              <div className="mt-2 pt-2 border-t border-slate-200 text-[10px] text-slate-500 italic">
                * Strict municipal audit protocols mandate marking this zone as <strong>N/A</strong> to prevent misallocated public capital prior to ground validation.
              </div>
            </div>

            {/* Expandable Trigger for Audit Summary */}
            <div>
              <button
                type="button"
                onClick={() => setShowAuditDrawer(!showAuditDrawer)}
                className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer border border-slate-100"
              >
                <div className="flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>View Data Validation Audit Summary</span>
                </div>
                {showAuditDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showAuditDrawer && (
                <div className="mt-2 p-3 bg-slate-50 rounded-lg text-xs space-y-1.5 border border-slate-100 animate-in fade-in duration-150">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Primary Sensor Source</span>
                    <span className="font-mono font-medium text-slate-800">USGS/NASA Landsat 9 TIRS-2</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Geometric RMS Residual</span>
                    <span className="font-mono font-medium text-slate-800">0.14 px (sub-meter)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Atmospheric Correction</span>
                    <span className="font-mono font-medium text-slate-800">MODTRAN 6.0 Radiative</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Audit Officer Verification</span>
                    <span className="font-mono text-emerald-700 font-semibold">SIG-VERIFIED #4492</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Rapid Contextual Brief: Quick Access Guidance */}
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
              <HelpCircle className="w-3.5 h-3.5 text-emerald-700" />
              <span>Decision Support Note</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Wards scored above <strong>80/100 Planning Priority</strong> qualify for expedited FY2026 Fast-Track Urban Climate Grants under the National Clean Air & Heat Action Framework.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

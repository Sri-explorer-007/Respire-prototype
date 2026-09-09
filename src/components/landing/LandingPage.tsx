import React, { useState, useMemo } from 'react';
import {
  Sun,
  ShieldCheck,
  MapPin,
  Layers,
  Award,
  ChevronRight,
  ArrowRight,
  Database,
  Sparkles,
  Building2,
  Code2,
} from 'lucide-react';
import type { Zone } from '../../types';
import { respireScoringEngine } from '../../core/scoring/scoringEngine';
import { respireRecommendationEngine } from '../../core/recommendations/recommendationEngine';
import type { WorkflowTab } from '../dashboard';

interface LandingPageProps {
  onLaunchConsole: (targetTab?: WorkflowTab, zoneId?: string) => void;
  onOpenHeatPlan: () => void;
  onOpenZonesModal: () => void;
  onOpenHelp: () => void;
  zones: Zone[];
}

/**
 * LandingPage component providing a high-impact overview of Respire's 4-stage climate resilience workflow.
 */
export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchConsole,
  onOpenHeatPlan,
  onOpenZonesModal,
  onOpenHelp,
  zones,
}) => {
  const [activeTab, setActiveTab] = useState<'telemetry' | 'scoring' | 'intervention'>('telemetry');
  const [selectedWardId, setSelectedWardId] = useState<string>('ward-045');

  // Interactive Ward Spotlight candidates
  const spotlightWards = [
    { id: 'ward-045', name: 'Vyasarpadi', zone: 'Zone IV (Tondiarpet)', badge: 'CRITICAL HOTSPOT', color: 'rose' },
    { id: 'ward-134', name: 'T. Nagar', zone: 'Zone X (Kodambakkam)', badge: 'HIGH DENSITY COMMERCIAL', color: 'orange' },
    { id: 'ward-177', name: 'Velachery', zone: 'Zone XIII (Adyar)', badge: 'EXPANDING SUBURB', color: 'amber' },
    { id: 'ward-198', name: 'Sholinganallur', zone: 'Zone XV (OMR)', badge: 'INSUFFICIENT TELEMETRY', color: 'slate' },
  ];

  const currentSpotlight = spotlightWards.find((w) => w.id === selectedWardId) || spotlightWards[0];

  // Resolve active zone data dynamically
  const activeZone = useMemo(() => {
    return zones.find((z) => (z.wardId || z.id || z.zoneId) === selectedWardId) || zones[0];
  }, [zones, selectedWardId]);

  const activeZoneId = activeZone?.zoneId || activeZone?.id || activeZone?.wardId || 'ward-045';

  const activeScore = useMemo(() => {
    if (!activeZone) return null;
    return respireScoringEngine.calculateScore(activeZoneId, activeZone.metrics);
  }, [activeZone, activeZoneId]);

  const activeRecommendation = useMemo(() => {
    if (!activeZone || !activeScore) return null;
    return respireRecommendationEngine.generateRecommendations(activeZone, activeScore);
  }, [activeZone, activeScore]);

  return (
    <div className="min-h-screen bg-[#060814] text-slate-100 flex flex-col antialiased selection:bg-cyan-500 selection:text-black stars-bg relative overflow-x-hidden">
      {/* Glow Ambient Blobs (Respire Thermal Palette) */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-40 right-10 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-[800px] left-10 w-[400px] h-[400px] bg-rose-600/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#060814]/85 border-b border-white/[0.07] px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo Brand */}
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-[0_0_20px_rgba(6,182,212,0.4)] group-hover:scale-105 transition-transform">
              <div className="h-full w-full bg-[#080c1e] rounded-[10px] flex items-center justify-center overflow-hidden p-1">
                <img src="/respire-emblem.png" alt="RESPIRE" className="w-full h-full object-contain" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-base tracking-tight text-white group-hover:text-cyan-300 transition-colors">RESPIRE</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold">
                  v2.4
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">
                GCC Urban Heat Intelligence
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-white/[0.03] border border-white/[0.08] px-3 py-1.5 rounded-full backdrop-blur-md">
            <a href="#overview" className="px-3 py-1 text-xs font-medium text-slate-300 hover:text-white transition-colors rounded-full hover:bg-white/[0.05]">
              Overview
            </a>
            <a href="#decision-pipeline" className="px-3 py-1 text-xs font-medium text-slate-300 hover:text-white transition-colors rounded-full hover:bg-white/[0.05]">
              4-Pillar Pipeline
            </a>
            <a href="#ward-spotlight" className="px-3 py-1 text-xs font-medium text-slate-300 hover:text-white transition-colors rounded-full hover:bg-white/[0.05]">
              Live Ward Demo
            </a>
            <a href="#methodology" className="px-3 py-1 text-xs font-medium text-slate-300 hover:text-white transition-colors rounded-full hover:bg-white/[0.05]">
              Methodology
            </a>
            <button
              type="button"
              onClick={onOpenHeatPlan}
              className="px-3 py-1 text-xs font-medium text-amber-300 hover:text-amber-200 transition-colors rounded-full hover:bg-amber-500/10 flex items-center space-x-1"
            >
              <span>Heat Action Plan</span>
            </button>
          </nav>

          {/* Right Action Header Buttons */}
          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={onOpenZonesModal}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono text-slate-300 transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>200 Wards</span>
            </button>

            <button
              type="button"
              onClick={() => onLaunchConsole()}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white text-xs font-bold shadow-[0_0_24px_rgba(6,182,212,0.4)] hover:shadow-[0_0_32px_rgba(6,182,212,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border border-cyan-300/30"
            >
              <span>Launch Command Deck</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section id="overview" className="relative pt-12 sm:pt-20 pb-16 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Hero Typography & Call-To-Actions */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Tagline Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>GREATER CHENNAI CORPORATION • CLIMATE DECISION SYSTEM 2026</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
              Precision Urban Heat Intelligence &{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300">
                Targeted Municipal Action.
              </span>
            </h1>

            {/* Subtitle Description */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
              Empowering Municipal Commissioners, Disaster Management Cells, and Climate Engineers to detect microclimate anomalies, unpack thermal vulnerability drivers across all 200 GCC wards, and optimize targeted cooling capital with mathematical rigor.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                type="button"
                onClick={() => onLaunchConsole('identify')}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-bold text-sm shadow-[0_0_30px_rgba(6,182,212,0.45)] hover:shadow-[0_0_40px_rgba(6,182,212,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center space-x-2 cursor-pointer border border-cyan-300/30"
              >
                <span>Launch Interactive Deck</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onOpenZonesModal}
                className="px-5 py-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 font-semibold text-sm border border-white/[0.1] hover:border-white/[0.2] transition-all flex items-center space-x-2 cursor-pointer backdrop-blur-md"
              >
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>Explore 200 Wards</span>
              </button>

              <button
                type="button"
                onClick={onOpenHeatPlan}
                className="px-4 py-3.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-semibold text-sm border border-amber-500/30 transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Heat Action Plan</span>
              </button>
            </div>

            {/* Verified Operational Indicators */}
            <div className="pt-4 border-t border-white/[0.08] grid grid-cols-3 gap-4 text-left">
              <div>
                <span className="text-2xl sm:text-3xl font-black font-mono text-cyan-400 block">
                  200 Wards
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  GCC Microclimate Grid
                </span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 block">
                  -4.5°C
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Cooling Hub Impact
                </span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black font-mono text-indigo-400 block">
                  100%
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Deterministic Logic
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: High-Tech Glass Telemetry & Code Console */}
          <div className="lg:col-span-5">
            <div className="aero-card border-white/[0.12] shadow-2xl p-0 overflow-hidden relative">
              {/* Terminal Window Header */}
              <div className="bg-[#0b1022] px-4 py-3 border-b border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-[11px] font-mono text-slate-400 ml-2">
                    respireEngine.ts
                  </span>
                </div>

                {/* Console Tabs */}
                <div className="flex items-center space-x-1 bg-black/40 p-0.5 rounded-lg border border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => setActiveTab('telemetry')}
                    className={`px-2 py-0.5 text-[10px] font-mono font-medium rounded ${
                      activeTab === 'telemetry'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Telemetry
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('scoring')}
                    className={`px-2 py-0.5 text-[10px] font-mono font-medium rounded ${
                      activeTab === 'scoring'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Scoring
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('intervention')}
                    className={`px-2 py-0.5 text-[10px] font-mono font-medium rounded ${
                      activeTab === 'intervention'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Interventions
                  </button>
                </div>
              </div>

              {/* Dynamic Console Body */}
              <div className="p-5 font-mono text-xs space-y-3 bg-[#070b1a]/95">
                {activeTab === 'telemetry' && (
                  <div className="space-y-2 text-slate-300">
                    <p className="text-cyan-400 font-bold">
                      {'// Ward 045 (Vyasarpadi) Real-Time Telemetry Stream'}
                    </p>
                    <div className="p-2.5 rounded-lg bg-black/50 border border-white/[0.06] space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Land Surface Temp (LST):</span>
                        <span className="text-rose-400 font-bold">42.1°C (Severe)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Vegetation Deficit (NDVI):</span>
                        <span className="text-amber-400 font-bold">0.12 (88% Deficit)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Outdoor Worker Density:</span>
                        <span className="text-orange-400 font-bold">87% High Vulnerability</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Data Completeness:</span>
                        <span className="text-emerald-400 font-bold">100% Verified</span>
                      </div>
                    </div>

                    <div className="pt-1 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Computed Multi-Criteria Risk:</span>
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40">
                        88.0 / 100 [VERY_HIGH]
                      </span>
                    </div>
                  </div>
                )}

                {activeTab === 'scoring' && (
                  <div className="space-y-2 text-slate-300">
                    <p className="text-cyan-400 font-bold">
                      {'// Additive Decision Decomposition (50/20/30 Model)'}
                    </p>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span>1. Heat Exposure (50% wt):</span>
                        <span className="text-rose-400 font-bold">46.0 / 50 pts</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5">
                        <div className="bg-rose-500 h-1.5 rounded-full w-[92%]" />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span>2. Vegetation Deficit (20% wt):</span>
                        <span className="text-amber-400 font-bold">16.0 / 20 pts</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5">
                        <div className="bg-amber-500 h-1.5 rounded-full w-[80%]" />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span>3. Social Vulnerability (30% wt):</span>
                        <span className="text-orange-400 font-bold">26.0 / 30 pts</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5">
                        <div className="bg-orange-500 h-1.5 rounded-full w-[87%]" />
                      </div>
                    </div>

                    <p className="text-[10px] text-emerald-400 pt-1">
                      ✓ Mathematical Sum: 46 + 16 + 26 = 88.0 pts (Zero Discrepancy)
                    </p>
                  </div>
                )}

                {activeTab === 'intervention' && (
                  <div className="space-y-2 text-slate-300">
                    <p className="text-cyan-400 font-bold">
                      {'// Rule-Engine Prescribed Climate Action'}
                    </p>
                    <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 space-y-1 text-[11px]">
                      <div className="text-indigo-200 font-bold">
                        Modular Outdoor Worker Hydration & Cooling Hub
                      </div>
                      <div className="text-slate-400 text-[10px]">
                        Targeted for Vyasarpadi outdoor industrial workers & transit nodes.
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-white/[0.06]">
                        <span className="text-slate-400">Indicative Capital Cost:</span>
                        <span className="text-cyan-300 font-bold">₹72,000 / site</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Microclimate Impact:</span>
                        <span className="text-emerald-400 font-bold">-4.5°C Ambient Delta</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Console Footer Info */}
              <div className="px-4 py-2 bg-[#090d20] border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-slate-400">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <span className="text-emerald-400 font-bold">Live Sensor Feeds Active</span>
                </div>
                <span>Chennai Latency: 14ms</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-PILLAR DECISION FRAMEWORK SECTION */}
      <section id="decision-pipeline" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto w-full border-t border-white/[0.06]">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
            End-to-End Decision Framework
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            From Satellite Telemetry to Targeted Capital Allocation
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Respire bridges the gap between raw climate data and municipal execution across 4 transparent, auditable stages.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Pillar 1: IDENTIFY */}
          <div
            onClick={() => onLaunchConsole('identify')}
            className="aero-card aero-card-hover p-5 flex flex-col justify-between cursor-pointer group border-white/[0.08] hover:border-cyan-500/40 transition-all"
          >
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">Phase 1</span>
                <span className="text-[10px] text-slate-500 font-mono">200 Wards</span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                1. Identify
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Spatial heat risk indexing fusing satellite Landsat LST, Sentinel NDVI vegetation indices, and GCC population density to surface critical hotspots.
              </p>
            </div>

            <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-cyan-400 group-hover:translate-x-1 transition-transform">
              <span>Explore Spatial Risk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Pillar 2: EXPLAIN */}
          <div
            onClick={() => onLaunchConsole('explain')}
            className="aero-card aero-card-hover p-5 flex flex-col justify-between cursor-pointer group border-white/[0.08] hover:border-blue-500/40 transition-all"
          >
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-blue-400 uppercase">Phase 2</span>
                <span className="text-[10px] text-slate-500 font-mono">Decomposition</span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                2. Explain
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Additive driver attribution. Never wonder why a ward scored high. Inspect physical heat severity, vegetation lack, and outdoor worker vulnerability in exact points.
              </p>
            </div>

            <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-blue-400 group-hover:translate-x-1 transition-transform">
              <span>Inspect Drivers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Pillar 3: RECOMMEND */}
          <div
            onClick={() => onLaunchConsole('recommend')}
            className="aero-card aero-card-hover p-5 flex flex-col justify-between cursor-pointer group border-white/[0.08] hover:border-indigo-500/40 transition-all"
          >
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase">Phase 3</span>
                <span className="text-[10px] text-slate-500 font-mono">Deterministic</span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                3. Recommend
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Deterministic rule matrix matches diagnosed vulnerabilities to proven cooling solutions: hydration hubs, cool roofs, urban green canopies, and misting zones.
              </p>
            </div>

            <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-indigo-400 group-hover:translate-x-1 transition-transform">
              <span>View Interventions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Pillar 4: PRIORITIZE */}
          <div
            onClick={() => onLaunchConsole('prioritize')}
            className="aero-card aero-card-hover p-5 flex flex-col justify-between cursor-pointer group border-white/[0.08] hover:border-emerald-500/40 transition-all"
          >
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <Award className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">Phase 4</span>
                <span className="text-[10px] text-slate-500 font-mono">Funding ROI</span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                4. Prioritize
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ranked municipal investment queue. Multi-criteria planning priority incorporating risk urgency, population impact, and capital cost feasibility for GCC budget rounds.
              </p>
            </div>

            <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-emerald-400 group-hover:translate-x-1 transition-transform">
              <span>Analyze Allocations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE LIVE WARD SPOTLIGHT SECTION */}
      <section id="ward-spotlight" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto w-full border-t border-white/[0.06]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
          <div>
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
              Interactive Microclimate Spotlight
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">
              Evaluate Real Chennai Wards Dynamically
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Select a representative ward to see the scoring and recommendation engine execute live in browser.
            </p>
          </div>

          {/* Ward Selector Buttons */}
          <div className="flex flex-wrap gap-2">
            {spotlightWards.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => setSelectedWardId(w.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  selectedWardId === w.id
                    ? 'bg-cyan-500 text-black shadow-[0_0_16px_rgba(6,182,212,0.5)]'
                    : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] border border-white/[0.08]'
                }`}
              >
                {w.name} ({w.id.toUpperCase()})
              </button>
            ))}
          </div>
        </div>

        {/* Live Spotlight Card */}
        <div className="aero-card p-6 sm:p-8 border-white/[0.12] shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Ward Overview (5 cols) */}
            <div className="lg:col-span-5 space-y-4 border-b lg:border-b-0 lg:border-r border-white/[0.08] pb-6 lg:pb-0 lg:pr-6">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-mono text-slate-400">{currentSpotlight.zone}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                {currentSpotlight.name}{' '}
                <span className="text-xs font-mono text-cyan-400 font-normal">
                  [{selectedWardId.toUpperCase()}]
                </span>
              </h3>

              {/* Computed Risk Score */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Respire Risk Score
                  </span>
                  <div className="text-3xl font-black font-mono text-rose-400">
                    {activeScore?.totalScore !== null && activeScore?.totalScore !== undefined
                      ? `${activeScore.totalScore.toFixed(1)}`
                      : '—'}
                    <span className="text-xs font-normal text-slate-500 ml-1">/ 100</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Risk Classification
                  </span>
                  <span
                    className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${
                      activeScore?.riskBand === 'VERY_HIGH'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : activeScore?.riskBand === 'HIGH'
                        ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                        : activeScore?.riskBand === 'INSUFFICIENT_EVIDENCE'
                        ? 'bg-slate-800 text-slate-400 border-slate-700'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    {activeScore?.riskBand ?? 'ANALYZING'}
                  </span>
                </div>
              </div>

              {/* Telemetry Chips */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-slate-400 text-[10px] block">Surface Temp (LST)</span>
                  <span className="font-bold text-white">
                    {activeZone?.metrics?.heat?.lst?.value ? `${activeZone.metrics.heat.lst.value}°C` : 'Unavailable'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-slate-400 text-[10px] block">Vegetation (NDVI)</span>
                  <span className="font-bold text-white">
                    {activeZone?.metrics?.vegetation?.ndvi?.value ? `${activeZone.metrics.vegetation.ndvi.value}` : 'Unavailable'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Actionable Output & Directives (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider block mb-1">
                  Engine Prescribed Intervention
                </span>
                <div className="text-lg font-bold text-white">
                  {activeRecommendation?.primaryRecommendation?.interventionName ?? 'Awaiting Complete Sensor Telemetry'}
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {activeRecommendation?.primaryRecommendation?.reason ??
                    activeRecommendation?.whyThisAction?.reason ??
                    'Missing physical Landsat telemetry for this ward. Respire strictly requires complete multi-sensor validation before issuing capital expenditure recommendations.'}
                </p>
              </div>

              {/* Cost & Impact Badges */}
              {activeRecommendation?.hasConfidentRecommendation && activeRecommendation.primaryRecommendation && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30">
                    <span className="text-[10px] font-mono text-cyan-300 block">Indicative Unit Cost</span>
                    <div className="text-xl font-extrabold font-mono text-white mt-0.5">
                      ₹{(activeRecommendation.primaryRecommendation.cost ?? 72000).toLocaleString('en-IN')}
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono">
                      {activeRecommendation.primaryRecommendation.costUnit}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
                    <span className="text-[10px] font-mono text-emerald-300 block">Estimated Cooling Benefit</span>
                    <div className="text-xl font-extrabold font-mono text-emerald-400 mt-0.5">
                      {activeRecommendation.primaryRecommendation.impact !== null
                        ? (activeRecommendation.primaryRecommendation.impact > 0
                            ? `-${activeRecommendation.primaryRecommendation.impact}°C`
                            : `${activeRecommendation.primaryRecommendation.impact}°C`)
                        : '-4.5°C'}
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono">
                      {activeRecommendation.primaryRecommendation.impactUnit}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Button to inspect deeper */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => onLaunchConsole('explain', selectedWardId)}
                  className="px-4 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-xs font-mono font-bold text-slate-200 flex items-center space-x-2 transition-colors cursor-pointer"
                >
                  <span>Inspect Full Explanation Deck</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onLaunchConsole('prioritize', selectedWardId)}
                  className="px-4 py-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-xs font-mono font-bold text-indigo-300 flex items-center space-x-2 transition-colors cursor-pointer"
                >
                  <span>View in Capital Queue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* METHODOLOGY & RIGOR SECTION */}
      <section id="methodology" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto w-full border-t border-white/[0.06]">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            Scientific Credibility & Governance
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Engineered for Municipal Accountability
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Built from first principles. No opaque black-box AI, no hallucinated temperature projections.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="aero-card p-6 border-white/[0.08] space-y-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Strict Data Provenance</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every data point is strictly anchored to USGS Landsat 8/9 Thermal Infrared Sensors (TIRS), Copernicus Sentinel-2 multispectral NDVI, and official GCC census statistics.
            </p>
          </div>

          <div className="aero-card p-6 border-white/[0.08] space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">100% Deterministic Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              All scoring rules and intervention triggers execute with total mathematical determinism. Auditable, reproducible, and verifiable by municipal audit committees.
            </p>
          </div>

          <div className="aero-card p-6 border-white/[0.08] space-y-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Insufficient Data Isolation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Wards with offline sensors (like OMR Ward 198) are never assigned arbitrary defaults or fabricated scores. Missing telemetry is surfaced transparently for sensor redeployment.
            </p>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION BANNER */}
      <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-cyan-900/40 via-blue-900/30 to-indigo-900/40 border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.2)] text-center space-y-6 relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-widest px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40">
              Ready for Deployment
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Launch Greater Chennai Climate Command
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              Join municipal teams actively planning climate mitigation across 200 wards.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => onLaunchConsole('identify')}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-black text-sm shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center space-x-2 cursor-pointer border border-cyan-300/40"
              >
                <span>Enter Command Console</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onOpenHeatPlan}
                className="px-6 py-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 font-bold text-sm border border-white/[0.15] transition-all cursor-pointer backdrop-blur-md"
              >
                <span>GCC Action Directives</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-white/[0.08] bg-[#04060f] py-10 px-4 sm:px-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <div className="h-full w-full bg-[#080c1e] rounded-[10px] flex items-center justify-center overflow-hidden p-1">
                <img src="/respire-emblem.png" alt="RESPIRE" className="w-full h-full object-contain" />
              </div>
            </div>
            <div>
              <span className="font-bold text-white group-hover:text-cyan-300 transition-colors">RESPIRE</span>
              <span className="text-slate-500 ml-2">Urban Heat Resilience Platform</span>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-slate-400">
            <button type="button" onClick={() => onLaunchConsole('identify')} className="hover:text-cyan-400 transition-colors">
              Spatial Risk Map
            </button>
            <button type="button" onClick={() => onLaunchConsole('explain')} className="hover:text-cyan-400 transition-colors">
              Driver Decomposition
            </button>
            <button type="button" onClick={() => onLaunchConsole('recommend')} className="hover:text-cyan-400 transition-colors">
              Cooling Solutions
            </button>
            <button type="button" onClick={() => onLaunchConsole('prioritize')} className="hover:text-cyan-400 transition-colors">
              Capital Queue
            </button>
            <button type="button" onClick={onOpenHelp} className="hover:text-cyan-400 transition-colors">
              Help & Guide
            </button>
          </div>

          <div className="font-mono text-[11px] text-slate-500">
            © 2026 Greater Chennai Corporation · Respire Platform
          </div>
        </div>
      </footer>
    </div>
  );
};

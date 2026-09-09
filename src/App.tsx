import { useState, useEffect, useMemo } from 'react';
import type { Zone } from './types';
import type { DataSourceMode, DataProvenanceSummary } from './data';
import { respireApi } from './services';
import { respireScoringEngine } from './core/scoring/scoringEngine';
import {
  type WorkflowTab,
  OverviewView,
  RiskMap,
  SelectedZonePanel,
  ExplainView,
  RecommendView,
  PrioritizeView,
  ScenarioSandbox,
} from './components/dashboard';
import { LandingPage } from './components/landing';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { Footer } from './components/layout/Footer';
import { HelpGuideModal } from './components/modal/HelpGuideModal';
import { HeatPlanModal } from './components/modal/HeatPlanModal';
import { ChennaiZonesModal } from './components/modal/ChennaiZonesModal';
import { exportZonesToCsv, copySummaryReport } from './utils/exportTelemetry';
import { Download, Copy } from 'lucide-react';

/**
 * Main application container for the RESPIRE Climate Resilience Decision Support Platform.
 */
export function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('respire_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [viewMode, setViewMode] = useState<'landing' | 'console'>('console');
  const [dataSourceMode, setDataSourceMode] = useState<DataSourceMode>('processed');
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<string>('ward-045');
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<WorkflowTab>('overview');
  const [provenanceSummary, setProvenanceSummary] = useState<DataProvenanceSummary>(
    respireApi.getProvenanceMetadata()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showHeatPlanModal, setShowHeatPlanModal] = useState(false);
  const [showChennaiZonesModal, setShowChennaiZonesModal] = useState(false);

  // Sync theme with document.documentElement
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('respire_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Fetch zones on initial mount or when data mode toggles
  useEffect(() => {
    respireApi.setDataSourceMode(dataSourceMode);
    /**
     * Loads spatial zone datasets and synchronizes active telemetry.
     */
    async function loadZones() {
      const data = await respireApi.fetchZones();
      setZones(data);
      if (data.length > 0) {
        setSelectedZoneId((prev) => {
          const stillValid = data.some(
            (z) => (z.zoneId || z.id || z.wardId) === prev
          );
          if (stillValid && prev) return prev;
          return data[0].zoneId || data[0].id || data[0].wardId || '';
        });
      }
      setProvenanceSummary(respireApi.getProvenanceMetadata());
    }
    loadZones();
  }, [dataSourceMode]);

  // Compute domain risk scores dynamically via respireScoringEngine
  const scoredZones = useMemo(() => {
    return zones.map((zone) => {
      const zId = zone.zoneId || zone.id || '';
      const score = respireScoringEngine.calculateScore(zId, zone.metrics);
      return { zone, score };
    });
  }, [zones]);

  const handleModeToggle = (mode: DataSourceMode) => {
    respireApi.setDataSourceMode(mode);
    setDataSourceMode(mode);
  };

  // Filter zones by search query if present
  const filteredScoredZones = useMemo(() => {
    if (!searchQuery.trim()) return scoredZones;
    const q = searchQuery.toLowerCase().trim();
    const cleanNum = q.replace(/^ward\s*/i, '').replace(/^w-?/i, '');
    return scoredZones.filter(({ zone }) => {
      const name = (zone.zoneName || zone.name || '').toLowerCase();
      const wardId = (zone.wardId || '').toLowerCase();
      const wardName = (zone.wardName || '').toLowerCase();
      const zoneId = (zone.zoneId || '').toLowerCase();
      const numMatch =
        cleanNum &&
        /^\d+$/.test(cleanNum) &&
        (wardId === `ward-${cleanNum.padStart(3, '0')}` ||
          wardName.includes(`ward ${cleanNum.padStart(3, '0')}`) ||
          wardName.includes(`ward ${cleanNum}`));

      return (
        name.includes(q) ||
        wardId.includes(q) ||
        wardName.includes(q) ||
        zoneId.includes(q) ||
        numMatch
      );
    });
  }, [scoredZones, searchQuery]);

  // Resolve currently selected zone and its computed score
  const selectedScoredItem = scoredZones.find(
    (item) =>
      (item.zone.zoneId || item.zone.id) === selectedZoneId ||
      item.zone.wardId === selectedZoneId
  );
  const selectedZone = selectedScoredItem?.zone;
  const selectedScore = selectedScoredItem?.score ?? null;

  const handleLaunchConsole = (targetTab?: WorkflowTab, zoneId?: string) => {
    if (targetTab) setActiveWorkflowTab(targetTab);
    if (zoneId) setSelectedZoneId(zoneId);
    setViewMode('console');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] dark:bg-[#080c14] text-slate-900 dark:text-slate-100 flex antialiased selection:bg-slate-800 selection:text-white relative transition-colors duration-200">
      {viewMode === 'landing' ? (
        <LandingPage
          onLaunchConsole={handleLaunchConsole}
          onOpenHeatPlan={() => setShowHeatPlanModal(true)}
          onOpenZonesModal={() => setShowChennaiZonesModal(true)}
          onOpenHelp={() => setShowHelpModal(true)}
          zones={zones}
        />
      ) : (
        <>
          {/* Left Fixed Sidebar (72 width) */}
          <Sidebar
            activeTab={activeWorkflowTab}
            onSelectTab={setActiveWorkflowTab}
            alertCount={5}
            onSelectZone={setSelectedZoneId}
            onOpenHeatPlan={() => setShowHeatPlanModal(true)}
            onOpenHelp={() => setShowHelpModal(true)}
            onOpenZonesModal={() => setShowChennaiZonesModal(true)}
            onNavigateToLanding={() => setViewMode('landing')}
          />

          {/* Main Command Viewport */}
          <div className="pl-72 flex-1 flex flex-col min-w-0 min-h-screen bg-[#f8f9ff] dark:bg-[#080c14] transition-colors duration-200">
            {/* Top Bar Header + Workflow Stepper Ribbon */}
            <TopBar
              dataSourceMode={dataSourceMode}
              onToggleMode={handleModeToggle}
              provenanceSummary={provenanceSummary}
              activeTab={activeWorkflowTab}
              onSelectTab={setActiveWorkflowTab}
              onOpenHelp={() => setShowHelpModal(true)}
              onOpenZonesModal={() => setShowChennaiZonesModal(true)}
              onSelectZone={setSelectedZoneId}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onNavigateToLanding={() => setViewMode('landing')}
              theme={theme}
              onToggleTheme={handleToggleTheme}
            />

            {/* Dynamic Content Workspace */}
            <main className="flex-1 p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
              {activeWorkflowTab === 'overview' ? (
                /* STAGE 00: MUNICIPAL HEAT RISK OVERVIEW */
                <OverviewView
                  scoredZones={scoredZones}
                  onSelectZone={setSelectedZoneId}
                  onNavigateToTab={setActiveWorkflowTab}
                />
              ) : activeWorkflowTab === 'identify' ? (
                /* STAGE 02: IDENTIFY HEAT RISK AREAS (Mockup 1) */
                <div className="flex flex-col w-full space-y-5">
                  {/* Page Header & Strategic Meta */}
                  <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        <span>Stage 02 • Geospatial Triage</span>
                      </div>
                      <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
                        Identify Heat Risk Areas
                      </h1>
                      <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
                        Spatial triage across Greater Chennai Corporation wards derived from high-resolution thermal infrared satellite passovers, canopy deficit indices, and vulnerability weighting.
                      </p>
                    </div>

                    {/* Quick Operational Indicator */}
                    <div className="flex items-center gap-2.5 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-xs self-start lg:self-auto">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <div className="text-left">
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                          Telemetry Synchronized
                        </div>
                        <div className="text-xs font-mono font-semibold text-slate-900">
                          INSAT-3DR & Landsat-9 (14:30 IST)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Primary Workspace: 68% GIS Viewport + 32% Decision Panel */}
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                    {/* LEFT: GIS MAP VIEWPORT (68% / 8 Cols) */}
                    <div className="xl:col-span-8">
                      <RiskMap
                        scoredZones={filteredScoredZones}
                        selectedZoneId={selectedZoneId}
                        onSelectZone={setSelectedZoneId}
                        onOpenHelp={() => setShowHelpModal(true)}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                      />
                    </div>

                    {/* RIGHT: SELECTED WARD DECISION PANEL (32% / 4 Cols) */}
                    <div className="xl:col-span-4">
                      <SelectedZonePanel
                        selectedZone={selectedZone}
                        score={selectedScore}
                        onNavigateToExplain={() => setActiveWorkflowTab('explain')}
                        onSelectZone={setSelectedZoneId}
                        allZones={scoredZones}
                      />
                    </div>
                  </div>
                </div>
              ) : activeWorkflowTab === 'explain' ? (
                /* STAGE 03: EXPLAIN WHY */
                <ExplainView
                  scoredZones={scoredZones}
                  selectedZoneId={selectedZoneId}
                  onSelectZone={setSelectedZoneId}
                  onNavigateToRecommend={() => setActiveWorkflowTab('recommend')}
                />
              ) : activeWorkflowTab === 'recommend' ? (
                /* STAGE 04: RECOMMEND ACTIONS */
                <RecommendView
                  scoredZones={scoredZones}
                  selectedZoneId={selectedZoneId}
                  onSelectZone={setSelectedZoneId}
                  onNavigateToPrioritize={() => setActiveWorkflowTab('prioritize')}
                />
              ) : activeWorkflowTab === 'prioritize' ? (
                /* STAGE 05: PRIORITIZE & FUND */
                <PrioritizeView
                  zones={zones}
                  scoredZones={scoredZones}
                  selectedZoneId={selectedZoneId}
                  onSelectZone={setSelectedZoneId}
                />
              ) : activeWorkflowTab === 'data' ? (
                /* STAGE 01: DATA EXPLORER */
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                        01 Municipal Geospatial & Telemetry Dataset
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Inspect normalized satellite metrics, census vulnerability indicators, and coverage provenance across all wards.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => exportZonesToCsv(scoredZones)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export CSV</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => copySummaryReport(scoredZones)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0b1c30] hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Summary</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="p-3">Ward ID</th>
                            <th className="p-3">Name</th>
                            <th className="p-3">Zone</th>
                            <th className="p-3">Surface LST</th>
                            <th className="p-3">NDVI</th>
                            <th className="p-3">Social Vuln</th>
                            <th className="p-3">Score / 100</th>
                            <th className="p-3">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {scoredZones.slice(0, 20).map(({ zone, score: s }) => {
                            const zId = zone.zoneId || zone.id || zone.wardId || '';
                            const isInsufficient = s.totalScore === null;
                            return (
                              <tr key={zId} className="hover:bg-slate-50/80 transition-colors">
                                <td className="p-3 font-mono font-semibold text-slate-800">{zId}</td>
                                <td className="p-3 font-medium text-slate-900">{zone.wardName || zone.zoneName}</td>
                                <td className="p-3 text-slate-500">{zone.zoneName}</td>
                                <td className="p-3 font-mono text-slate-700">
                                  {isInsufficient ? '—' : `${(zone.metrics?.heat?.lst?.value ?? 41).toFixed(1)}°C`}
                                </td>
                                <td className="p-3 font-mono text-slate-700">
                                  {isInsufficient ? '—' : (zone.metrics?.vegetation?.ndvi?.value ?? 0.12).toFixed(2)}
                                </td>
                                <td className="p-3 font-mono text-slate-700">
                                  {isInsufficient ? '—' : (zone.metrics?.vulnerability?.vulnerabilityScore?.value ?? 0.75).toFixed(2)}
                                </td>
                                <td className="p-3 font-mono font-bold text-rose-600">
                                  {isInsufficient ? 'N/A' : `${s.totalScore?.toFixed(0)}/100`}
                                </td>
                                <td className="p-3">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedZoneId(zId);
                                      setActiveWorkflowTab('identify');
                                    }}
                                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold rounded cursor-pointer transition-colors"
                                  >
                                    View in Map
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
              ) : activeWorkflowTab === 'planning' ? (
                /* STAGE 06: PLANNING & WHAT-IF SCENARIO SANDBOX */
                <ScenarioSandbox
                  zones={zones}
                  scoredZones={scoredZones}
                  onSelectZone={setSelectedZoneId}
                  onNavigateToTab={setActiveWorkflowTab}
                />
              ) : (
                /* STAGE 07: REPORTS */
                <div className="space-y-4">
                  <div className="pb-2 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      07 Municipal Council Dockets & Telemetry Reports
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Export decision summaries, audit logs, and capital investment proposals.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs space-y-3">
                      <h3 className="text-sm font-bold text-slate-900">Full 200 Wards CSV Export</h3>
                      <p className="text-xs text-slate-500">
                        Complete raw telemetry containing LST, NDVI, social vulnerability indices, and calculated priority ranks.
                      </p>
                      <button
                        type="button"
                        onClick={() => exportZonesToCsv(scoredZones)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0b1c30] text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download CSV</span>
                      </button>
                    </div>
                    <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs space-y-3">
                      <h3 className="text-sm font-bold text-slate-900">Executive Briefing Clipboard Summary</h3>
                      <p className="text-xs text-slate-500">
                        Copy formatted text summary for municipal planning dockets and council briefings.
                      </p>
                      <button
                        type="button"
                        onClick={() => copySummaryReport(scoredZones)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy to Clipboard</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </main>

            {/* Global Footer */}
            <Footer />
          </div>
        </>
      )}

      {/* Operational Help Guide Modal */}
      <HelpGuideModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />

      {/* GCC Heat Action Plan Modal */}
      <HeatPlanModal
        isOpen={showHeatPlanModal}
        onClose={() => setShowHeatPlanModal(false)}
      />

      {/* Chennai Administrative Hierarchy (15 Zones / 200 Wards) Modal */}
      <ChennaiZonesModal
        isOpen={showChennaiZonesModal}
        onClose={() => setShowChennaiZonesModal(false)}
        selectedZoneId={selectedZoneId}
        onSelectZone={setSelectedZoneId}
        dataSourceMode={dataSourceMode}
        onToggleMode={handleModeToggle}
      />
    </div>
  );
}

export default App;

import { useState, useEffect, useMemo } from 'react';
import type { Zone } from './types';
import type { DataSourceMode, DataProvenanceSummary } from './data';
import { respireApi } from './services';
import { respireScoringEngine } from './core/scoring/scoringEngine';
import {
  type WorkflowTab,
  RiskMap,
  RiskLegend,
  SelectedZonePanel,
  ExplainView,
  RecommendView,
  PrioritizeView,
  OverviewChartCard,
  WardClimateCard,
  CostSparklineCard,
  PriorityQueueCard,
  SectorClocksCard,
  SevereHeatAlertCard,
  ClimateNewsCard,
} from './components/dashboard';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { Footer } from './components/layout/Footer';
import { HelpGuideModal } from './components/modal/HelpGuideModal';
import { HeatPlanModal } from './components/modal/HeatPlanModal';
import { ChennaiZonesModal } from './components/modal/ChennaiZonesModal';

export function App() {
  const [dataSourceMode, setDataSourceMode] = useState<DataSourceMode>('processed');
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<WorkflowTab>('identify');
  const [provenanceSummary, setProvenanceSummary] = useState<DataProvenanceSummary>(
    respireApi.getProvenanceMetadata()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showHeatPlanModal, setShowHeatPlanModal] = useState(false);
  const [showChennaiZonesModal, setShowChennaiZonesModal] = useState(false);

  // Fetch zones on initial mount or when data mode toggles
  useEffect(() => {
    respireApi.setDataSourceMode(dataSourceMode);
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

  // Filter zones by search query if present (supports ward numbers, names, zones)
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

  return (
    <div className="min-h-screen bg-[#060814] text-slate-100 flex antialiased selection:bg-blue-600 selection:text-white stars-bg relative">
      {/* Left Collapsible Command Sidebar (Matching AirlineSim Reference) */}
      <Sidebar
        activeTab={activeWorkflowTab}
        onSelectTab={setActiveWorkflowTab}
        alertCount={5}
        onSelectZone={setSelectedZoneId}
        onOpenHeatPlan={() => setShowHeatPlanModal(true)}
        onOpenHelp={() => setShowHelpModal(true)}
        onOpenZonesModal={() => setShowChennaiZonesModal(true)}
      />

      {/* Main Command Viewport */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Top Command Bar (Search, Breadcrumbs, Status Chips) */}
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
        />

        {/* Dynamic Workspace Area */}
        <main className="flex-1 p-4 sm:p-6 space-y-5 max-w-[1600px] w-full mx-auto">
          {activeWorkflowTab === 'identify' ? (
            <>
              {/* Emergency Banner (Matching Severe Weather Card from reference) */}
              <SevereHeatAlertCard
                onNavigateToExplain={() => setActiveWorkflowTab('explain')}
              />

              {/* Master Dashboard Grid - Symmetrical Dual-Tier Command Deck */}
              <div className="space-y-5">
                {/* ROW 1: Spatial Risk Map (7 cols) + Selected Ward Decision Panel (5 cols) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                  {/* Left (7 cols): Google Maps Platform Spatial Engine */}
                  <div className="lg:col-span-7 flex flex-col justify-between space-y-2 h-[580px]">
                    <div className="flex-1 min-h-0">
                      <RiskMap
                        scoredZones={filteredScoredZones}
                        selectedZoneId={selectedZoneId}
                        onSelectZone={setSelectedZoneId}
                        onOpenHelp={() => setShowHelpModal(true)}
                      />
                    </div>
                    <RiskLegend />
                  </div>

                  {/* Right (5 cols): Selected Zone Decision-Support Panel */}
                  <div className="lg:col-span-5 h-[580px]">
                    <SelectedZonePanel
                      selectedZone={selectedZone}
                      score={selectedScore}
                      onNavigateToExplain={() => setActiveWorkflowTab('explain')}
                    />
                  </div>
                </div>

                {/* ROW 2: High-Level Telemetry Timeline (6 cols) + Ranked Priority Queue (6 cols) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                  {/* Left (6 cols): Multi-Line Telemetry Chart (Matching Financial Overview Card) */}
                  <div className="lg:col-span-6 h-[390px]">
                    <OverviewChartCard
                      scoredZones={filteredScoredZones}
                      selectedZoneId={selectedZoneId}
                      onSelectZone={setSelectedZoneId}
                    />
                  </div>

                  {/* Right (6 cols): Ranked Priority Queue (Matching Recent Flights Card) */}
                  <div className="lg:col-span-6 h-[390px]">
                    <PriorityQueueCard
                      scoredZones={scoredZones}
                      selectedZoneId={selectedZoneId}
                      onSelectZone={setSelectedZoneId}
                      onNavigateToPrioritize={() => setActiveWorkflowTab('prioritize')}
                    />
                  </div>
                </div>

                {/* ROW 3: Real-Time Operations Telemetry Deck (4 Symmetrical Columns) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
                  {/* Column 1: Microclimate & Heat Weather (Matching OPO Card) */}
                  <div className="h-[220px]">
                    <WardClimateCard
                      selectedZoneItem={selectedScoredItem}
                      onNavigateToExplain={() => setActiveWorkflowTab('explain')}
                    />
                  </div>

                  {/* Column 2: Benchmark Cost & Efficiency (Matching Jet Fuel Card) */}
                  <div className="h-[220px]">
                    <CostSparklineCard
                      onNavigateToPrioritize={() => setActiveWorkflowTab('prioritize')}
                    />
                  </div>

                  {/* Column 3: Sector Telemetry Dials (Matching World's Clock Card) */}
                  <div className="h-[220px]">
                    <SectorClocksCard onSelectZone={setSelectedZoneId} />
                  </div>

                  {/* Column 4: Verified Intelligence Updates (Matching World's News Card) */}
                  <div className="h-[220px]">
                    <ClimateNewsCard />
                  </div>
                </div>
              </div>
            </>
          ) : activeWorkflowTab === 'explain' ? (
            /* Phase 2: EXPLAIN WHY Experience */
            <ExplainView
              scoredZones={scoredZones}
              selectedZoneId={selectedZoneId}
              onSelectZone={setSelectedZoneId}
              onNavigateToRecommend={() => setActiveWorkflowTab('recommend')}
            />
          ) : activeWorkflowTab === 'recommend' ? (
            /* Phase 3: RECOMMEND ACTIONS Experience */
            <RecommendView
              scoredZones={scoredZones}
              selectedZoneId={selectedZoneId}
              onSelectZone={setSelectedZoneId}
              onNavigateToPrioritize={() => setActiveWorkflowTab('prioritize')}
            />
          ) : (
            /* Phase 4: PRIORITIZE & FUND Experience */
            <PrioritizeView
              zones={zones}
              scoredZones={scoredZones}
              selectedZoneId={selectedZoneId}
              onSelectZone={setSelectedZoneId}
            />
          )}
        </main>

        {/* Global Footer */}
        <Footer />
      </div>

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

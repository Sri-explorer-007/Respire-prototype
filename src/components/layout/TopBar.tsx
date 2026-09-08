import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  HelpCircle,
  TrendingUp,
  AlertCircle,
  Flame,
  CheckCircle2,
  MapPin,
} from 'lucide-react';
import type { DataSourceMode, DataProvenanceSummary } from '../../data';
import type { WorkflowTab } from '../dashboard';

interface TopBarProps {
  dataSourceMode: DataSourceMode;
  onToggleMode?: (mode: DataSourceMode) => void;
  provenanceSummary?: DataProvenanceSummary;
  activeTab: WorkflowTab;
  onSelectTab: (tab: WorkflowTab) => void;
  onOpenKeySettings?: () => void;
  onOpenHelp?: () => void;
  onOpenZonesModal?: () => void;
  onSelectZone?: (zoneId: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onNavigateToLanding?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  dataSourceMode,
  onToggleMode,
  provenanceSummary: _provenanceSummary,
  activeTab,
  onSelectTab,
  onOpenKeySettings: _onOpenKeySettings,
  onOpenHelp,
  onOpenZonesModal,
  onSelectZone,
  searchQuery = '',
  onSearchChange,
  onNavigateToLanding,
}) => {
  const [internalSearch, setInternalSearch] = useState(searchQuery);

  const tabs: { id: WorkflowTab; label: string; num: string }[] = [
    { id: 'identify', label: 'Identify', num: '01' },
    { id: 'explain', label: 'Explain', num: '02' },
    { id: 'recommend', label: 'Recommend', num: '03' },
    { id: 'prioritize', label: 'Prioritize', num: '04' },
  ];

  const currentTabIndex = tabs.findIndex((t) => t.id === activeTab);

  const handlePrev = () => {
    if (currentTabIndex > 0) {
      onSelectTab(tabs[currentTabIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentTabIndex < tabs.length - 1) {
      onSelectTab(tabs[currentTabIndex + 1].id);
    }
  };

  return (
    <header className="h-16 border-b border-white/[0.08] bg-[#0A0D1A]/80 backdrop-blur-xl px-4 lg:px-6 flex items-center justify-between gap-3 z-20 select-none shrink-0 sticky top-0 overflow-hidden">
      {/* Left: Interactive RESPIRE Logo (Click to Home) + Sequential Tab Controller & Quick Search */}
      <div className="flex items-center space-x-2.5 min-w-0 flex-1">
        {/* Clickable Logo - Redirects to Home Page */}
        <button
          type="button"
          onClick={onNavigateToLanding}
          className="flex items-center space-x-2 px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono text-cyan-300 transition-all cursor-pointer shrink-0 group hover:border-cyan-500/40"
          title="Click to redirect to Respire Home Page"
        >
          <div className="h-6 w-6 rounded-lg bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-[1px] shadow-[0_0_12px_rgba(6,182,212,0.4)] group-hover:scale-105 transition-transform">
            <div className="h-full w-full bg-[#080c1e] rounded-[7px] flex items-center justify-center">
              <Flame className="w-3.5 h-3.5 text-cyan-400" />
            </div>
          </div>
          <span className="font-extrabold text-xs tracking-tight text-white group-hover:text-cyan-300 transition-colors">
            RESPIRE
          </span>
        </button>

        {/* Step Arrows + Step Pills */}
        <div className="flex items-center space-x-1 shrink-0">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentTabIndex <= 0}
            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
            title="Previous Phase"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Current Step Breadcrumb Pills */}
          <div className="flex items-center space-x-1 px-1 py-0.5 bg-black/40 border border-white/[0.06] rounded-xl shrink-0">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelectTab(tab.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <span className="font-mono text-[10px] opacity-70 mr-1">{tab.num}</span>
                  <span className={isActive ? 'inline' : 'hidden 2xl:inline'}>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleNext}
            disabled={currentTabIndex >= tabs.length - 1}
            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
            title="Next Phase"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Search Pill */}
        <div className="relative w-28 sm:w-36 md:w-40 lg:w-44 shrink min-w-0">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Quick search..."
            value={internalSearch}
            onChange={(e) => {
              setInternalSearch(e.target.value);
              onSearchChange?.(e.target.value);
            }}
            className="w-full pl-9 pr-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.07] focus:bg-white/[0.09] border border-white/[0.08] focus:border-blue-500/50 text-xs text-white placeholder-slate-500 focus:outline-none transition-all shadow-inner truncate"
          />
        </div>
      </div>

      {/* Right: Status Chips & Actions */}
      <div className="flex items-center shrink-0 space-x-2 text-xs">
        {/* Status Chip 1: Max LST */}
        <button
          type="button"
          onClick={() => {
            onSelectTab('explain');
            onSelectZone?.('ward-045');
          }}
          title="Inspect Highest Land Surface Temperature: Ward 045 (42.5°C)"
          className="hidden 2xl:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-300 transition-colors cursor-pointer shrink-0"
        >
          <Flame className="w-3.5 h-3.5 text-orange-400 shrink-0" />
          <span className="font-mono font-bold text-[11px] whitespace-nowrap">42.5°C LST</span>
          <TrendingUp className="w-3 h-3 text-orange-400 shrink-0" />
        </button>

        {/* Status Chip 3: Urgent Warning Chip */}
        <button
          type="button"
          onClick={() => {
            onSelectTab('explain');
            onSelectZone?.('ward-045');
          }}
          title="Inspect 5 Critical Risk Wards in Causal Driver Analysis"
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 transition-colors cursor-pointer shadow-sm shrink-0 whitespace-nowrap"
        >
          <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span className="font-bold text-[11px]">5 Critical</span>
        </button>

        {/* 15 Zones & 200 Wards Directory Button */}
        {onOpenZonesModal && (
          <button
            type="button"
            onClick={onOpenZonesModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 transition-colors cursor-pointer shadow-sm shrink-0 whitespace-nowrap"
            title="Browse All 15 GCC Zones and 200 Municipal Wards"
          >
            <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="font-bold text-[11px]">15 Zones / 200 Wards</span>
          </button>
        )}

        {/* Data Mode Switcher */}
        <button
          type="button"
          onClick={() => onToggleMode && onToggleMode(dataSourceMode === 'demo' ? 'processed' : 'demo')}
          className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 transition-colors cursor-pointer shrink-0"
          title="Toggle between 200 Municipal Wards and 10 Benchmark Wards"
        >
          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
          <span className="text-[11px] font-mono whitespace-nowrap">
            {dataSourceMode === 'processed' ? '200 Wards' : '10 Calibrated Wards'}
          </span>
        </button>

        {/* Help Button */}
        <button
          type="button"
          onClick={onOpenHelp}
          title="Command Guide & Help"
          className="p-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
        >
          <HelpCircle className="w-4 h-4 text-blue-400 shrink-0" />
        </button>
      </div>
    </header>
  );
};

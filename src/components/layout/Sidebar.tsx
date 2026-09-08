import React from 'react';
import {
  AlertTriangle,
  FileText,
  Settings,
  Shield,
  ExternalLink,
  Compass,
  Thermometer,
  Trees,
  BarChart3,
  MapPin,
} from 'lucide-react';
import type { WorkflowTab } from '../dashboard';

interface SidebarProps {
  activeTab: WorkflowTab;
  onSelectTab: (tab: WorkflowTab) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  alertCount?: number;
  onOpenKeySettings?: () => void;
  onSelectZone?: (zoneId: string) => void;
  onOpenHeatPlan?: () => void;
  onOpenHelp?: () => void;
  onOpenZonesModal?: () => void;
  onNavigateToLanding?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  alertCount = 5,
  onOpenKeySettings: _onOpenKeySettings,
  onSelectZone,
  onOpenHeatPlan,
  onOpenHelp,
  onOpenZonesModal,
  onNavigateToLanding,
}) => {
  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col border-r border-white/[0.08] bg-[#0A0D1A]/90 backdrop-blur-2xl z-30 select-none h-screen sticky top-0">
      {/* Brand Header */}
      <div className="h-16 px-4 border-b border-white/[0.08] flex items-center justify-between shrink-0">
        <div
          className="flex items-center space-x-2.5 cursor-pointer group"
          onClick={onNavigateToLanding}
          title="Return to Respire Landing Overview"
        >
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <div className="h-full w-full bg-[#0A0D1A] rounded-[10px] flex items-center justify-center overflow-hidden p-1">
              <img src="/respire-emblem.png" alt="RESPIRE" className="w-full h-full object-contain" />
            </div>
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5 group-hover:text-cyan-300 transition-colors">
              RESPIRE
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30">
                GCC
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">
              Heat Resilience Platform
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onNavigateToLanding}
          className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
          title="Landing Page Overview"
        >
          <Compass className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 py-4 px-3 space-y-6 overflow-y-auto custom-scrollbar">
        {/* Main 4 Phases (Sequential Flow) */}
        <div className="space-y-1">
          <div className="px-3 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold flex items-center justify-between">
            <span>Decision Workflow</span>
            <span className="text-[9px] text-slate-600">4 Phases</span>
          </div>

          {/* Phase 1: IDENTIFY */}
          <button
            type="button"
            onClick={() => onSelectTab('identify')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'identify'
                ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Compass className={`w-4 h-4 ${activeTab === 'identify' ? 'text-white' : 'text-blue-400'}`} />
              <span>01 IDENTIFY</span>
            </div>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
              activeTab === 'identify' ? 'bg-white/20 text-white' : 'bg-white/[0.06] text-slate-400'
            }`}>
              Map
            </span>
          </button>

          {/* Phase 2: EXPLAIN WHY */}
          <button
            type="button"
            onClick={() => onSelectTab('explain')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'explain'
                ? 'bg-orange-600 text-white font-bold shadow-lg shadow-orange-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Thermometer className={`w-4 h-4 ${activeTab === 'explain' ? 'text-white' : 'text-orange-400'}`} />
              <span>02 EXPLAIN WHY</span>
            </div>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
              activeTab === 'explain' ? 'bg-white/20 text-white' : 'bg-white/[0.06] text-slate-400'
            }`}>
              Drivers
            </span>
          </button>

          {/* Phase 3: RECOMMEND */}
          <button
            type="button"
            onClick={() => onSelectTab('recommend')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'recommend'
                ? 'bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Trees className={`w-4 h-4 ${activeTab === 'recommend' ? 'text-white' : 'text-emerald-400'}`} />
              <span>03 RECOMMEND</span>
            </div>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
              activeTab === 'recommend' ? 'bg-white/20 text-white' : 'bg-white/[0.06] text-slate-400'
            }`}>
              Actions
            </span>
          </button>

          {/* Phase 4: PRIORITIZE & FUND */}
          <button
            type="button"
            onClick={() => onSelectTab('prioritize')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'prioritize'
                ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <BarChart3 className={`w-4 h-4 ${activeTab === 'prioritize' ? 'text-white' : 'text-indigo-400'}`} />
              <span>04 PRIORITIZE & FUND</span>
            </div>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
              activeTab === 'prioritize' ? 'bg-white/20 text-white' : 'bg-white/[0.06] text-slate-400'
            }`}>
              ₹5.04L
            </span>
          </button>
        </div>

        {/* Telemetry & Monitoring */}
        <div className="space-y-1">
          <div className="px-3 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
            Telemetry & Monitoring
          </div>

          <button
            type="button"
            onClick={() => {
              onSelectTab('explain');
              onSelectZone?.('ward-045');
            }}
            title="Inspect 5 Critical Wards"
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Heat Emergency</span>
            </div>
            <span className="px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold border border-rose-500/30">
              {alertCount} Urgent
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenHeatPlan}
            title="Open GCC Urban Heat Action Plan 2026"
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-2.5">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>GCC Heat Plan 2026</span>
            </div>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </button>

          <button
            type="button"
            onClick={onOpenHelp}
            title="Open Command Guide & SOPs"
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-2.5">
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Command SOPs & Help</span>
            </div>
          </button>

          {onOpenZonesModal && (
            <button
              type="button"
              onClick={onOpenZonesModal}
              title="Open Complete GCC 15 Zones & 200 Wards Directory"
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-blue-300 hover:text-white bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-all cursor-pointer shadow-sm"
            >
              <div className="flex items-center space-x-2.5">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span className="font-semibold">15 Zones · 200 Wards</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-500/30 text-blue-200 font-bold">
                GCC
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Operator Profile Footer */}
      <div className="h-16 px-3 border-t border-white/[0.08] bg-black/20 flex items-center shrink-0">
        <div className="flex items-center space-x-2.5 px-2.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] w-full">
          <div className="h-7 w-7 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-xs shrink-0">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <div className="truncate flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">GCC Climate Desk</p>
            <p className="text-[10px] text-slate-400 truncate">Zone IV · Live Session</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

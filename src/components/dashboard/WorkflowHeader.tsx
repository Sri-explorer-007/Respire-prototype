import React from 'react';
import {
  ShieldAlert,
  Database,
  MapPin,
  Crosshair,
  Layers,
  Sparkles,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import type { DataSourceMode, DataProvenanceSummary } from '../../data';

export type WorkflowTab =
  | 'overview'
  | 'data'
  | 'identify'
  | 'explain'
  | 'recommend'
  | 'prioritize'
  | 'planning'
  | 'reports';

interface WorkflowHeaderProps {
  dataSourceMode: DataSourceMode;
  onToggleMode?: (mode: DataSourceMode) => void;
  provenanceSummary?: DataProvenanceSummary;
  activeTab?: WorkflowTab;
  onSelectTab?: (tab: WorkflowTab) => void;
}

/**
 * RESPIRE Modern Decision Workflow Header
 * 
 * Features:
 * - Sleek civic command-center aesthetics
 * - Connected 4-phase decision pipeline
 * - Responsive glassmorphism navigation
 */
export const WorkflowHeader: React.FC<WorkflowHeaderProps> = ({
  dataSourceMode,
  onToggleMode,
  provenanceSummary,
  activeTab = 'identify',
  onSelectTab,
}) => {
  const steps = [
    {
      id: 'overview',
      tabKey: 'overview' as const,
      stepNumber: '00',
      title: 'OVERVIEW',
      subtitle: 'Executive Risk Briefing',
      icon: Layers,
    },
    {
      id: 'data',
      tabKey: 'data' as const,
      stepNumber: '01',
      title: 'DATA EXPLORER',
      subtitle: '200 Wards Telemetry',
      icon: Database,
    },
    {
      id: 'identify',
      tabKey: 'identify' as const,
      stepNumber: '02',
      title: 'IDENTIFY RISK',
      subtitle: 'Spatial Heat & Vulnerability Map',
      icon: Crosshair,
    },
    {
      id: 'explain',
      tabKey: 'explain' as const,
      stepNumber: '03',
      title: 'EXPLAIN WHY',
      subtitle: 'Causal Drivers & Breakdown',
      icon: Layers,
    },
    {
      id: 'recommend',
      tabKey: 'recommend' as const,
      stepNumber: '04',
      title: 'RECOMMEND ACTIONS',
      subtitle: 'Intervention Catalogue Rules',
      icon: Sparkles,
    },
    {
      id: 'prioritize',
      tabKey: 'prioritize' as const,
      stepNumber: '05',
      title: 'PRIORITIZE & FUND',
      subtitle: 'Cost + Impact Optimization',
      icon: TrendingUp,
    },
    {
      id: 'planning',
      tabKey: 'planning' as const,
      stepNumber: '06',
      title: 'WHAT-IF SANDBOX',
      subtitle: 'Scenario Policy Modeling',
      icon: Sparkles,
    },
    {
      id: 'reports',
      tabKey: 'reports' as const,
      stepNumber: '07',
      title: 'DOCKETS & REPORTS',
      subtitle: 'Export & Council Summaries',
      icon: CheckCircle2,
    },
  ];

  return (
    <header className="border-b border-white/[0.08] bg-[#080B11]/80 backdrop-blur-xl sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 space-y-3.5">
        {/* Top bar: Brand + Municipal Status Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & Platform identity */}
          <div className="flex items-center space-x-3.5">
            <div className="relative flex items-center justify-center">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500/25 to-amber-600/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-lg shadow-orange-500/10 shrink-0">
                <ShieldAlert className="w-5 h-5 text-orange-400" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500" />
              </span>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  RESPIRE
                </h1>
                <span className="text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/[0.08] uppercase">
                  Decision Support
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Urban Heat Reduction & Climate Resilience Platform
              </p>
            </div>
          </div>

          {/* Right Status Badges */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span className="font-medium text-[11px] text-slate-300">
                Greater Chennai Corporation
              </span>
            </div>

            {/* Offline Demo Dataset Indicator */}
            <button
              type="button"
              onClick={() => onToggleMode && onToggleMode(dataSourceMode === 'demo' ? 'processed' : 'demo')}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/15 transition-colors cursor-pointer text-[11px] font-medium"
              title="Click to toggle data source mode"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{provenanceSummary?.datasetLabel || 'Illustrative Demo Data'}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </button>
          </div>
        </div>

        {/* Sleek Stepper Navigation Bar */}
        <nav aria-label="Decision Workflow Navigation">
          <div className="bg-white/[0.02] p-1 rounded-xl border border-white/[0.06] grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5">
            {steps.map((step) => {
              const isCurrent = step.tabKey === activeTab;
              const Icon = step.icon;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => onSelectTab && onSelectTab(step.tabKey)}
                  aria-current={isCurrent ? 'page' : undefined}
                  className={`group relative rounded-lg p-2.5 sm:p-3 transition-all text-left flex items-center justify-between gap-2.5 cursor-pointer outline-none ${
                    isCurrent
                      ? 'bg-gradient-to-r from-orange-500/15 via-orange-500/10 to-transparent border border-orange-500/40 shadow-sm shadow-orange-500/10'
                      : 'hover:bg-white/[0.04] border border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isCurrent
                          ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                          : 'bg-white/[0.05] text-slate-400 group-hover:text-slate-200 group-hover:bg-white/[0.08]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className={`text-[10px] font-mono font-bold ${isCurrent ? 'text-orange-400' : 'text-slate-500'}`}>
                          {step.stepNumber}
                        </span>
                        <span className={`text-xs font-bold tracking-tight truncate ${isCurrent ? 'text-white' : 'text-slate-300'}`}>
                          {step.title}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 group-hover:text-slate-400 truncate hidden sm:block">
                        {step.subtitle}
                      </p>
                    </div>
                  </div>

                  {isCurrent && (
                    <span className="hidden lg:flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30 shrink-0">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      ACTIVE
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
};

import React from 'react';
import { Building2, HelpCircle, Settings, Sun, Moon } from 'lucide-react';
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
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

/**
 * Navigation top bar component with black & charcoal grey theme and silver-lined buttons.
 */
export const TopBar: React.FC<TopBarProps> = ({
  dataSourceMode,
  onToggleMode,
  activeTab,
  onSelectTab,
  onOpenHelp,
  onOpenZonesModal,
  theme = 'light',
  onToggleTheme,
}) => {
  const steps: { id: WorkflowTab; num: string; label: string }[] = [
    { id: 'overview', num: '00', label: 'OVERVIEW' },
    { id: 'data', num: '01', label: 'DATA' },
    { id: 'identify', num: '02', label: 'IDENTIFY' },
    { id: 'explain', num: '03', label: 'EXPLAIN' },
    { id: 'recommend', num: '04', label: 'RECOMMEND' },
    { id: 'prioritize', num: '05', label: 'PRIORITIZE' },
    { id: 'planning', num: '06', label: 'PLAN' },
    { id: 'reports', num: '07', label: 'REPORT' },
  ];

  const isDark = theme === 'dark';

  return (
    <div className="flex flex-col sticky top-0 z-40 bg-white dark:bg-[#10131d] shadow-2xs select-none transition-colors duration-200">
      {/* Primary Top Header */}
      <header className="h-16 px-6 sm:px-8 border-b border-slate-200 dark:border-[#272f42] flex items-center justify-between gap-4">
        {/* Left: Location & Institutional Badges */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-slate-500 dark:text-slate-300 shrink-0" />
            <span className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Chennai Heat Assessment
            </span>
          </div>

          {/* Mode Badge with Silver Lining in Dark Mode */}
          <button
            type="button"
            onClick={() => onToggleMode?.(dataSourceMode === 'demo' ? 'processed' : 'demo')}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-gradient-to-b dark:from-[#222838] dark:to-[#141824] dark:border dark:border-slate-400/50 dark:text-slate-200 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_1px_3px_rgba(0,0,0,0.4)] dark:hover:border-slate-200 text-[10px] font-bold rounded-md uppercase tracking-wider transition-all cursor-pointer"
            title="Click to toggle data source mode"
          >
            {dataSourceMode === 'processed' ? 'PROCESSED 200 WARDS' : 'ILLUSTRATIVE DEMO DATA'}
          </button>
        </div>

        {/* Right: Theme Toggle (Silver Lining), Quick Actions & Officer Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dark / Light Mode Toggle Button with Silver Lining */}
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-gradient-to-b dark:from-[#262e42] dark:to-[#161a27] dark:border-slate-400/70 dark:text-slate-100 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_2px_5px_rgba(0,0,0,0.5)] dark:hover:border-white dark:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_0_12px_rgba(226,232,240,0.35)] text-xs font-semibold transition-all cursor-pointer"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-300 animate-spin-slow drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]" />
                  <span className="hidden sm:inline font-mono">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-600" />
                  <span className="hidden sm:inline font-mono">Dark Mode</span>
                </>
              )}
            </button>
          )}

          {onOpenHelp && (
            <button
              type="button"
              onClick={onOpenHelp}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-[#1e2436] dark:border dark:border-transparent dark:hover:border-slate-400/50 transition-all cursor-pointer hidden md:flex items-center justify-center"
              title="Help & Documentation"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          )}

          {onOpenZonesModal && (
            <button
              type="button"
              onClick={onOpenZonesModal}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-[#1e2436] dark:border dark:border-transparent dark:hover:border-slate-400/50 transition-all cursor-pointer hidden md:flex items-center justify-center"
              title="15 Zones / 200 Wards Hierarchy"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-200">
              Municipal Planning Officer
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Urban Governance Unit
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-gradient-to-b dark:from-[#2b334a] dark:to-[#171b28] border border-slate-300 dark:border-slate-400/60 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] flex items-center justify-center font-bold text-slate-700 dark:text-slate-100 text-xs shadow-2xs">
            MP
          </div>
        </div>
      </header>

      {/* Secondary Workflow Process Stepper Ribbon */}
      <div className="w-full bg-[#eff4ff] dark:bg-[#141825] px-6 sm:px-8 py-2 border-b border-slate-200 dark:border-[#272f42] overflow-x-auto custom-scrollbar transition-colors">
        <div className="flex items-center gap-4 text-xs font-mono text-slate-500 dark:text-slate-400 min-w-max">
          {steps.map((step, idx) => {
            const isActive = activeTab === step.id;
            return (
              <React.Fragment key={step.id}>
                <button
                  type="button"
                  onClick={() => onSelectTab(step.id)}
                  className={`flex items-center gap-1.5 transition-all cursor-pointer py-0.5 px-1.5 rounded ${
                    isActive
                      ? 'font-bold text-slate-900 dark:text-white dark:bg-[#20273b] dark:border dark:border-slate-400/40 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]'
                      : 'hover:text-slate-800 dark:hover:text-slate-200 text-slate-500 dark:text-slate-400 dark:hover:bg-[#1a2030]'
                  }`}
                >
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse shrink-0 drop-shadow-[0_0_4px_rgba(52,211,153,0.8)]" />
                  )}
                  <span>
                    {step.num} {step.label}
                  </span>
                </button>

                {idx < steps.length - 1 && (
                  <span className="text-slate-300 dark:text-slate-600 font-sans select-none">→</span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

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
 * Navigation top bar component supporting workflow phase switching, theme toggle, and live satellite sync.
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
    <div className="flex flex-col sticky top-0 z-40 bg-white dark:bg-[#0b101b] shadow-2xs select-none transition-colors duration-200">
      {/* Primary Top Header */}
      <header className="h-16 px-6 sm:px-8 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        {/* Left: Location & Institutional Badges */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-slate-500 dark:text-slate-400 shrink-0" />
            <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Chennai Heat Assessment
            </span>
          </div>

          <button
            type="button"
            onClick={() => onToggleMode?.(dataSourceMode === 'demo' ? 'processed' : 'demo')}
            className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold rounded uppercase tracking-wider transition-colors cursor-pointer"
            title="Click to toggle data source mode"
          >
            {dataSourceMode === 'processed' ? 'PROCESSED 200 WARDS' : 'ILLUSTRATIVE DEMO DATA'}
          </button>
        </div>

        {/* Right: Theme Toggle, Quick Actions & Officer Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dark / Light Mode Toggle Button */}
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-600" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </button>
          )}

          {onOpenHelp && (
            <button
              type="button"
              onClick={onOpenHelp}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer hidden md:flex items-center justify-center"
              title="Help & Documentation"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          )}

          {onOpenZonesModal && (
            <button
              type="button"
              onClick={onOpenZonesModal}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer hidden md:flex items-center justify-center"
              title="15 Zones / 200 Wards Hierarchy"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Municipal Planning Officer
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Urban Governance Unit
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-xs shadow-2xs">
            MP
          </div>
        </div>
      </header>

      {/* Secondary Workflow Process Stepper Ribbon */}
      <div className="w-full bg-[#eff4ff] dark:bg-[#0d1424] px-6 sm:px-8 py-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto custom-scrollbar transition-colors">
        <div className="flex items-center gap-4 text-xs font-mono text-slate-500 dark:text-slate-400 min-w-max">
          {steps.map((step, idx) => {
            const isActive = activeTab === step.id;
            return (
              <React.Fragment key={step.id}>
                <button
                  type="button"
                  onClick={() => onSelectTab(step.id)}
                  className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isActive
                      ? 'font-bold text-slate-900 dark:text-white'
                      : 'hover:text-slate-800 dark:hover:text-slate-200 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse shrink-0" />
                  )}
                  <span>
                    {step.num} {step.label}
                  </span>
                </button>

                {idx < steps.length - 1 && (
                  <span className="text-slate-300 dark:text-slate-700 font-sans select-none">→</span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

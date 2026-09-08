import React from 'react';
import {
  LayoutDashboard,
  Database,
  AlertTriangle,
  BarChart3,
  Lightbulb,
  Coins,
  Map,
  FileText,
  HelpCircle,
  Settings,
  User,
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
  onOpenHelp,
  onOpenZonesModal,
  onNavigateToLanding,
}) => {
  const navItems: { id: WorkflowTab; label: string; num: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', num: '00', icon: LayoutDashboard },
    { id: 'data', label: 'Data', num: '01', icon: Database },
    { id: 'identify', label: 'Identify Risk', num: '02', icon: AlertTriangle },
    { id: 'explain', label: 'Explain Risk', num: '03', icon: BarChart3 },
    { id: 'recommend', label: 'Recommend Action', num: '04', icon: Lightbulb },
    { id: 'prioritize', label: 'Prioritize & Fund', num: '05', icon: Coins },
    { id: 'planning', label: 'Planning', num: '06', icon: Map },
    { id: 'reports', label: 'Reports', num: '07', icon: FileText },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-white border-r border-slate-200 z-50 flex flex-col justify-between shadow-xs select-none">
      {/* Brand Header */}
      <div className="flex flex-col">
        <div
          onClick={onNavigateToLanding}
          className="px-6 py-5 flex items-center gap-3 cursor-pointer border-b border-slate-100 hover:bg-slate-50 transition-colors"
          title="RESPIRE - Urban Heat & Climate Resilience"
        >
          <div className="h-9 w-9 rounded-lg bg-[#0b1c30] p-1 flex items-center justify-center shrink-0 shadow-xs">
            <img src="/respire-emblem.png" alt="RESPIRE" className="h-7 w-7 object-contain" />
          </div>
          <div>
            <div className="font-bold text-slate-900 uppercase tracking-wide text-sm flex items-center gap-1.5">
              RESPIRE
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-bold">
                GCC
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              Urban Heat & Climate Resilience
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#0b1c30] text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span className="text-[13px]">{item.label}</span>
                </div>
                <span
                  className={`font-mono text-xs ${
                    isActive ? 'text-slate-300 font-bold' : 'text-slate-400'
                  }`}
                >
                  {item.num}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Utility Links */}
      <div className="px-3 py-4 space-y-1 border-t border-slate-100">
        <button
          type="button"
          onClick={onOpenHelp}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg text-xs font-medium transition-colors cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span className="text-[13px]">Help & Docs</span>
        </button>
        <button
          type="button"
          onClick={onOpenZonesModal}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg text-xs font-medium transition-colors cursor-pointer"
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span className="text-[13px]">Settings & Wards</span>
        </button>
        <div className="flex items-center gap-2.5 px-3.5 py-2 text-slate-600 rounded-lg text-xs">
          <User className="w-4 h-4 text-slate-400" />
          <div className="text-left leading-tight">
            <div className="text-[12px] font-semibold text-slate-800">Officer Profile</div>
            <div className="text-[10px] text-slate-400">Urban Governance Unit</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

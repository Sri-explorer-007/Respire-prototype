import React from 'react';
import { HelpCircle, Shield, CheckCircle2, Layers, BookOpen, X } from 'lucide-react';

interface HelpGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpGuideModal: React.FC<HelpGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="aero-card max-w-2xl w-full max-h-[85vh] flex flex-col border border-white/20 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                RESPIRE Operational Command Guide
              </h3>
              <p className="text-[11px] text-slate-400">
                Greater Chennai Corporation Climate Resilience Platform
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-colors cursor-pointer text-sm font-bold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar text-xs text-slate-300 leading-relaxed">
          {/* Section 1: 4 Decision Phases */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-orange-400" />
              Four-Phase Decision Support Workflow
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                <span className="font-bold text-orange-300 font-mono text-[11px] block">
                  01 IDENTIFY
                </span>
                <p className="text-slate-400 text-[11px]">
                  Explore live geospatial heat risk across Greater Chennai Corporation. Filter by risk tier and inspect telemetry for each ward.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                <span className="font-bold text-amber-300 font-mono text-[11px] block">
                  02 EXPLAIN WHY
                </span>
                <p className="text-slate-400 text-[11px]">
                  Audit the causal drivers: 50% Heat Exposure + 20% Vegetation Deficit + 30% Social Vulnerability. Zero black-box calculations.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                <span className="font-bold text-emerald-300 font-mono text-[11px] block">
                  03 RECOMMEND ACTIONS
                </span>
                <p className="text-slate-400 text-[11px]">
                  Review targeted, rule-based cooling interventions tailored to each ward&apos;s primary stressor (cool roofs, hydration hubs, canopy corridors).
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                <span className="font-bold text-cyan-300 font-mono text-[11px] block">
                  04 PRIORITIZE & FUND
                </span>
                <p className="text-slate-400 text-[11px]">
                  Rank municipal capital allocations using 50% Need + 30% Impact + 20% Cost Efficiency weighting with transparent indicative budgets.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Data Integrity & Ground Truth */}
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-2">
            <div className="flex items-center space-x-2 text-blue-300 font-bold text-xs">
              <Shield className="w-4 h-4" />
              <span>Scientific Data Integrity Standards</span>
            </div>
            <p className="text-[11px] text-blue-100/90 leading-normal">
              All cost and temperature impact metrics are explicitly designated as <strong>Indicative Planning Estimates</strong>. Wards with missing sensor telemetry (such as Sholinganallur Ward 198) display <em>Insufficient Evidence</em> rather than fabricated zero scores.
            </p>
          </div>

          {/* Section 3: Interactive Controls */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              Navigation & Telemetry Controls
            </h4>
            <ul className="space-y-1.5 text-slate-300 text-[11px]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span><strong>Map Navigation:</strong> Click any ward marker to sync climate and telemetry cards across the entire command deck.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span><strong>Radar View:</strong> Toggle ambient radar telemetry sweep at the bottom-right of the map viewport.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span><strong>Top Status Chips:</strong> Click &quot;5 Critical&quot; or &quot;42.5°C LST&quot; to quickly jump to high-risk zones.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span><strong>Data Mode:</strong> Toggle offline demo data vs. processed feeds using the header mode switch.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-white/[0.02] flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-lg shadow-blue-500/20"
          >
            Got it, Return to Command Deck
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { HelpCircle, Shield, Layers, BookOpen, X } from 'lucide-react';

interface HelpGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpGuideModal: React.FC<HelpGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in select-none">
      <div className="bg-white max-w-2xl w-full max-h-[85vh] flex flex-col rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                RESPIRE Operational Command Guide
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Greater Chennai Corporation Climate Resilience Platform
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar text-xs text-slate-700 leading-relaxed bg-[#f8f9ff]">
          {/* Section 1: Decision Workflow Stages */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              Core Municipal Decision Support Workflow
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1 shadow-2xs">
                <span className="font-bold text-slate-900 font-mono text-[11px] block flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  00 OVERVIEW & 01 DATA
                </span>
                <p className="text-slate-600 text-[11px]">
                  Executive briefing summary KPIs and full 200 wards telemetry explorer with Landsat & census provenance.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1 shadow-2xs">
                <span className="font-bold text-slate-900 font-mono text-[11px] block flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                  02 IDENTIFY & 03 EXPLAIN
                </span>
                <p className="text-slate-600 text-[11px]">
                  Interactive GIS map with live meteorology and transparent additive scoring (50% Heat + 20% Veg + 30% Vuln).
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1 shadow-2xs">
                <span className="font-bold text-slate-900 font-mono text-[11px] block flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                  04 RECOMMEND & 05 PRIORITIZE
                </span>
                <p className="text-slate-600 text-[11px]">
                  Rule-based cooling intervention catalogue and multi-criteria capital allocation rankings with transparent budgets.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1 shadow-2xs">
                <span className="font-bold text-slate-900 font-mono text-[11px] block flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  06 PLAN & 07 REPORT
                </span>
                <p className="text-slate-600 text-[11px]">
                  Interactive What-If policy sandbox simulator and printable council briefing dockets with CSV export.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Data Integrity & Ground Truth */}
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-1.5">
            <div className="flex items-center space-x-2 text-blue-900 font-bold text-xs">
              <Shield className="w-4 h-4 text-blue-700" />
              <span>Scientific Data Integrity Standards</span>
            </div>
            <p className="text-[11px] text-blue-800 leading-normal">
              All cost and temperature impact metrics are explicitly designated as <strong>Indicative Planning Estimates</strong>. Wards with missing sensor telemetry (such as Sholinganallur Ward 198) display <em>Insufficient Evidence</em> rather than fabricated zero scores.
            </p>
          </div>

          {/* Section 3: Keyboard & Navigation Controls */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              Keyboard & Navigation Shortcuts
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex justify-between items-center">
                <span className="text-slate-600">Switch Workflow Tabs</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-slate-700 font-bold border border-slate-200">1 – 8</kbd>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex justify-between items-center">
                <span className="text-slate-600">Search Wards / Zones</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-slate-700 font-bold border border-slate-200">/</kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-white flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-500">
            RESPIRE v2.4 · Greater Chennai Corporation
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#0b1c30] hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
          >
            Got it, return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

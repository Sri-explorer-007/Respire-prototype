import React from 'react';
import { FileText, ShieldAlert, MapPin, X } from 'lucide-react';

interface HeatPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HeatPlanModal: React.FC<HeatPlanModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="aero-card max-w-2xl w-full max-h-[85vh] flex flex-col border border-white/20 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                Greater Chennai Corporation Urban Heat Action Plan 2026
              </h3>
              <p className="text-[11px] text-slate-400">
                Official GCC Municipal Resilience Directive · Disaster Management Division
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
          {/* Key Facts Banner */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Operative Period</span>
              <span className="text-sm font-bold text-white font-mono mt-0.5 block">2026 – 2030</span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Alert Status</span>
              <span className="text-sm font-bold text-rose-400 font-mono mt-0.5 block">STAGE 3 ACTIVE</span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Target Wards</span>
              <span className="text-sm font-bold text-amber-300 font-mono mt-0.5 block">15 Zones / 200 Wards</span>
            </div>
          </div>

          {/* Section: Mandates */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-orange-400" />
              Key Municipal Heat Adaptation Mandates
            </h4>
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                <span className="font-bold text-white text-xs">1. Cool Roofs Standard for Commercial & High-Density Residential</span>
                <p className="text-slate-400 text-[11px]">
                  Requires high-albedo solar-reflective white coatings (SRI &gt; 78) across all municipal buildings, slum rehabilitation settlements, and rooftop renovations.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                <span className="font-bold text-white text-xs">2. Modular Outdoor Worker Hydration Stations</span>
                <p className="text-slate-400 text-[11px]">
                  Rapid deployment of shaded hydration hubs equipped with chilled potable water, electrolyte packets, and misting zones along informal transit hubs.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                <span className="font-bold text-white text-xs">3. Urban Forest & Canopy Corridors</span>
                <p className="text-slate-400 text-[11px]">
                  Targeted roadside tree planting with native Tamil Nadu species (Neem, Pungai, Poovarasu) prioritizing wards with NDVI &lt; 0.12.
                </p>
              </div>
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
            <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs">
              <MapPin className="w-4 h-4" />
              <span>GCC Heat Emergency Coordination Center</span>
            </div>
            <p className="text-[11px] text-amber-200/90 leading-normal">
              Ripon Building Central Control Room · Hotline: <strong>1913</strong> (Toll-Free 24/7) · Disaster Management Cell: <strong>044-25619206</strong>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            Ref: GCC/CR-HEAT/2026/04-REV2
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-lg shadow-indigo-500/20"
          >
            Close Heat Plan
          </button>
        </div>
      </div>
    </div>
  );
};

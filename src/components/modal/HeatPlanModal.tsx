import React from 'react';
import { FileText, ShieldAlert, MapPin, X, CheckCircle2 } from 'lucide-react';

interface HeatPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HeatPlanModal: React.FC<HeatPlanModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in select-none">
      <div className="bg-white max-w-2xl w-full max-h-[85vh] flex flex-col rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-orange-600 text-white shadow-md shadow-orange-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                Greater Chennai Corporation Urban Heat Action Plan 2026
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Official GCC Municipal Resilience Directive · Disaster Management Division
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
          {/* Key Facts Banner */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-center shadow-2xs">
              <span className="text-[10px] font-mono text-slate-400 block uppercase font-semibold">Operative Period</span>
              <span className="text-sm font-bold text-slate-900 font-mono mt-0.5 block">2026 – 2030</span>
            </div>
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-center shadow-2xs">
              <span className="text-[10px] font-mono text-rose-600 block uppercase font-semibold">Alert Status</span>
              <span className="text-sm font-bold text-rose-800 font-mono mt-0.5 block">STAGE 3 ACTIVE</span>
            </div>
            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-center shadow-2xs">
              <span className="text-[10px] font-mono text-blue-600 block uppercase font-semibold">Target Wards</span>
              <span className="text-sm font-bold text-blue-900 font-mono mt-0.5 block">15 Zones / 200 Wards</span>
            </div>
          </div>

          {/* Section: Mandates */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-orange-600" />
              Key Municipal Heat Adaptation Mandates
            </h4>
            <div className="space-y-2.5">
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1 shadow-2xs">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  1. Cool Roofs Standard for Commercial & High-Density Residential
                </span>
                <p className="text-slate-600 text-[11px] leading-relaxed pl-5">
                  Requires high-albedo solar-reflective white coatings (SRI &gt; 78) across all municipal buildings, slum rehabilitation settlements, and rooftop renovations.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1 shadow-2xs">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  2. Modular Outdoor Worker Hydration Stations
                </span>
                <p className="text-slate-600 text-[11px] leading-relaxed pl-5">
                  Rapid deployment of shaded hydration hubs equipped with chilled potable water, electrolyte packets, and misting zones along informal transit hubs.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1 shadow-2xs">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  3. Urban Forest & Canopy Corridors
                </span>
                <p className="text-slate-600 text-[11px] leading-relaxed pl-5">
                  Targeted roadside tree planting with native Tamil Nadu species (Neem, Pungai, Poovarasu) prioritizing wards with NDVI &lt; 0.12.
                </p>
              </div>
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-1.5">
            <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs">
              <MapPin className="w-4 h-4 text-amber-700" />
              <span>GCC Heat Emergency Coordination Center</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-normal">
              Ripon Building Central Control Room · Hotline: <strong>1913</strong> (Toll-Free 24/7) · Disaster Management Cell: <strong>044-25619206</strong>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-white flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-500">
            Tamil Nadu State Disaster Management Authority (TNSDMA)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#0b1c30] hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
          >
            Acknowledge Directive
          </button>
        </div>
      </div>
    </div>
  );
};

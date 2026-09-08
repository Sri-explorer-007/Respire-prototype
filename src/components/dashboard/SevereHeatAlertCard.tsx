import React, { useState } from 'react';
import { Flame, ChevronRight, X, AlertTriangle } from 'lucide-react';

interface SevereHeatAlertCardProps {
  onNavigateToExplain?: () => void;
}

export const SevereHeatAlertCard: React.FC<SevereHeatAlertCardProps> = ({
  onNavigateToExplain,
}) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="aero-alert-crimson rounded-2xl p-4 text-white shadow-xl relative select-none flex items-center justify-between gap-4 transition-all">
      {/* Left: Flame / Sun Storm Icon */}
      <div className="flex items-center space-x-3.5">
        <div className="h-11 w-11 rounded-xl bg-black/30 border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
          <div className="relative">
            <Flame className="w-6 h-6 text-amber-300 animate-pulse" />
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 absolute -bottom-1 -right-1" />
          </div>
        </div>

        <div>
          <div className="flex items-center space-x-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">
              Severe Heatwave Emergency
            </h4>
            <span className="px-1.5 py-0.2 rounded bg-white/20 text-white font-mono text-[9px] font-bold">
              STAGE 3 ALERT
            </span>
          </div>
          <p className="text-xs text-rose-100/90 mt-0.5 max-w-xl leading-snug">
            5 Greater Chennai Wards exceed the 75 / 100 Very High Risk threshold. High worker exposure and surface temperatures above 42°C detected.
          </p>
        </div>
      </div>

      {/* Right: CTA Button + Dismiss */}
      <div className="flex items-center space-x-2 shrink-0">
        <button
          type="button"
          onClick={onNavigateToExplain}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
        >
          <span>Review Drivers</span>
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
          title="Dismiss Alert"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

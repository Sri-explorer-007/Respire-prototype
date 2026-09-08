import React from 'react';
import type { Zone } from '../../types';

interface InterventionPanelProps {
  selectedZone?: Zone;
}

/**
 * Intervention recommendations panel placeholder.
 * Rule evaluation engine decoupled in src/core/recommendations/
 */
export const InterventionPanel: React.FC<InterventionPanelProps> = ({ selectedZone }) => {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">
            Explainable Interventions
          </h3>
          <p className="text-xs text-slate-400">
            Rule-based municipal mitigations for {selectedZone ? (selectedZone.zoneName || selectedZone.name) : 'selected zone'}
          </p>
        </div>
        <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
          Rule-Based
        </span>
      </div>

      <div className="rounded-lg border border-dashed border-slate-800 p-6 text-center text-xs text-slate-400">
        <p className="font-medium text-slate-300">Recommendation Engine Contract Established</p>
        <p className="mt-1 text-slate-500">
          Rule engine implementation (e.g. High Heat + Low Vegetation → Targeted Shade Canopy, Dense Built → Cool Roofs)
          will be plugged in via <code className="text-orange-400/90 font-mono">src/core/recommendations/</code> in the subsequent step.
        </p>
      </div>
    </div>
  );
};

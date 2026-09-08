import React from 'react';
import type { Zone } from '../../types';
import { LOCKED_SCORE_WEIGHTS } from '../../types';

interface RiskScoreCardProps {
  selectedZone?: Zone;
}

/**
 * Score breakdown card reflecting the locked 50/20/30 scoring model contract.
 * Note: Algorithm implementation is intentionally deferred to future steps.
 */
export const RiskScoreCard: React.FC<RiskScoreCardProps> = ({ selectedZone }) => {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">
            Explainable Priority Risk Score
          </h3>
          <p className="text-xs text-slate-400">
            {selectedZone ? (selectedZone.zoneName || selectedZone.name) : 'No Zone Selected'}
          </p>
        </div>
        <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
          Contract: 0–100
        </span>
      </div>

      <div className="bg-slate-950/70 rounded-lg p-4 border border-slate-800/80 mb-4 text-center">
        <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
          Zone Priority Score
        </span>
        <div className="text-3xl font-bold text-slate-200 mt-1 font-mono">
          -- <span className="text-sm text-slate-500 font-normal">/ 100</span>
        </div>
        <span className="text-[11px] text-slate-500 mt-1 block">
          Scoring algorithm decoupled in <code className="text-orange-400/90 font-mono">src/core/scoring/</code>
        </span>
      </div>

      <div className="space-y-2.5 text-xs">
        <div className="flex items-center justify-between text-slate-300">
          <span>Heat Exposure ({LOCKED_SCORE_WEIGHTS.heatExposureWeight * 100}%)</span>
          <span className="font-mono text-slate-400">-- / 50</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div className="bg-orange-500 h-1.5 rounded-full w-0" />
        </div>

        <div className="flex items-center justify-between text-slate-300 pt-1">
          <span>Vegetation Deficit ({LOCKED_SCORE_WEIGHTS.vegetationDeficitWeight * 100}%)</span>
          <span className="font-mono text-slate-400">-- / 20</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div className="bg-emerald-500 h-1.5 rounded-full w-0" />
        </div>

        <div className="flex items-center justify-between text-slate-300 pt-1">
          <span>Social Vulnerability ({LOCKED_SCORE_WEIGHTS.socialVulnerabilityWeight * 100}%)</span>
          <span className="font-mono text-slate-400">-- / 30</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div className="bg-blue-500 h-1.5 rounded-full w-0" />
        </div>
      </div>
    </div>
  );
};

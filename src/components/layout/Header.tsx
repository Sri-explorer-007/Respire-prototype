import React from 'react';
import { Database, MapPin } from 'lucide-react';
import type { DataSourceMode, DataProvenanceSummary } from '../../data';

interface HeaderProps {
  dataSourceMode: DataSourceMode;
  onToggleMode?: (mode: DataSourceMode) => void;
  provenanceSummary?: DataProvenanceSummary;
}

export const Header: React.FC<HeaderProps> = ({
  dataSourceMode,
  onToggleMode,
  provenanceSummary,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-red-600/30 via-rose-500/20 to-amber-500/20 border border-red-500/30 flex items-center justify-center p-1.5 shadow-lg shadow-red-500/20">
            <img src="/respire-emblem.png" alt="RESPIRE" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-white m-0">RESPIRE</h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Municipal Decision Support
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Urban Heat Reduction & Climate Resilience Platform
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-3 text-xs">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-orange-400" />
            <span className="font-medium">Target: Greater Chennai Corporation</span>
          </div>

          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-slate-900 border border-slate-800">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-400">Data Mode:</span>
            <button
              type="button"
              onClick={() => onToggleMode && onToggleMode(dataSourceMode === 'demo' ? 'processed' : 'demo')}
              className={`font-semibold cursor-pointer transition-colors ${
                dataSourceMode === 'demo' ? 'text-amber-400 hover:text-amber-300' : 'text-emerald-400 hover:text-emerald-300'
              }`}
              title="Click to toggle between Illustrative Demo Data and Pre-processed Spatial Data"
            >
              {provenanceSummary?.datasetLabel || (dataSourceMode === 'demo' ? 'Illustrative Demo Data' : 'Pre-processed Spatial Data')}
            </button>
            {provenanceSummary?.isDemoFallbackActive && dataSourceMode === 'processed' && (
              <span className="text-[10px] text-amber-500 font-mono">(Fallback Active)</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

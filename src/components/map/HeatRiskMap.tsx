import React from 'react';
import type { Zone } from '../../types';

interface HeatRiskMapProps {
  zones: Zone[];
  selectedZoneId?: string;
  onSelectZone?: (zoneId: string) => void;
}

/**
 * Spatial Heat & Vulnerability Map Container Placeholder
 * Ready for Leaflet / MapLibre integration in future steps.
 */
export const HeatRiskMap: React.FC<HeatRiskMapProps> = ({
  zones,
  selectedZoneId,
  onSelectZone,
}) => {
  return (
    <div className="relative rounded-xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col justify-between min-h-[380px]">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">
            Chennai Spatial Heat & Vulnerability Map
          </h3>
          <p className="text-xs text-slate-400">
            Ward & Zone Boundary Risk Overlay (Placeholder for interactive tile layer)
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-mono">
          {zones.length} Zones Available
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 mb-3">
          🗺️
        </div>
        <p className="text-sm text-slate-300 font-medium">Map Tile Layer Slot</p>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Decoupled map container ready for Chennai Land Surface Temperature and NDVI raster/vector visualization.
        </p>
      </div>

      <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between text-xs text-slate-400">
        <span>Selected Zone: <strong className="text-slate-200">{selectedZoneId || 'None'}</strong></span>
        <div className="flex items-center space-x-2">
          {zones.slice(0, 4).map((z) => {
            const zId = z.zoneId || z.id || '';
            const zName = z.zoneName || z.name || '';
            return (
              <button
                key={zId}
                onClick={() => onSelectZone && onSelectZone(zId)}
                className={`px-2 py-1 rounded border text-[11px] cursor-pointer transition-colors ${
                  selectedZoneId === zId
                    ? 'bg-orange-950/60 border-orange-500 text-orange-300'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                {zName.split(' ')[0]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

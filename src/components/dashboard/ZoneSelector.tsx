import React from 'react';
import type { Zone } from '../../types';

interface ZoneSelectorProps {
  zones: Zone[];
  selectedZoneId?: string;
  onSelectZone: (zoneId: string) => void;
}

export const ZoneSelector: React.FC<ZoneSelectorProps> = ({
  zones,
  selectedZoneId,
  onSelectZone,
}) => {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <label htmlFor="zone-select" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
        Select Municipal Zone
      </label>
      <select
        id="zone-select"
        value={selectedZoneId || ''}
        onChange={(e) => onSelectZone(e.target.value)}
        className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
      >
        <option value="" disabled>
          Select a Zone / Ward Group...
        </option>
        {zones.map((zone) => {
          const zId = zone.zoneId || zone.id || '';
          const zName = zone.zoneName || zone.name || '';
          return (
            <option key={zId} value={zId}>
              {zName} — {zone.wardName} {zone.areaKm2 ? `(${zone.areaKm2} km²)` : ''}
            </option>
          );
        })}
      </select>
    </div>
  );
};

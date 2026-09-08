import React, { useState, useMemo } from 'react';
import { Search, MapPin } from 'lucide-react';
import type { Zone } from '../../types';

interface ZoneSelectorProps {
  zones: Zone[];
  selectedZoneId?: string;
  onSelectZone: (zoneId: string) => void;
  onOpenZonesModal?: () => void;
}

export const ZoneSelector: React.FC<ZoneSelectorProps> = ({
  zones,
  selectedZoneId,
  onSelectZone,
  onOpenZonesModal,
}) => {
  const [filterText, setFilterText] = useState('');

  // Group zones by administrative Zone Name
  const groupedZones = useMemo(() => {
    const groups = new Map<string, Zone[]>();
    const q = filterText.toLowerCase().trim();

    zones.forEach((z) => {
      const zName = z.zoneName || 'Greater Chennai Corporation';
      const wName = z.wardName || '';
      const wId = z.wardId || '';

      if (q) {
        const matches =
          zName.toLowerCase().includes(q) ||
          wName.toLowerCase().includes(q) ||
          wId.toLowerCase().includes(q) ||
          (z.zoneId && z.zoneId.toLowerCase().includes(q));
        if (!matches) return;
      }

      if (!groups.has(zName)) {
        groups.set(zName, []);
      }
      groups.get(zName)!.push(z);
    });

    return Array.from(groups.entries());
  }, [zones, filterText]);

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0A0D1A]/80 backdrop-blur-xl p-4 space-y-3 shadow-xl shadow-black/40">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-orange-400" />
          <label htmlFor="zone-select-unified" className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Select Municipal Zone & Ward
          </label>
        </div>
        {onOpenZonesModal && (
          <button
            type="button"
            onClick={onOpenZonesModal}
            className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30 transition-colors cursor-pointer"
          >
            Browse All 15 Zones ({zones.length} Wards)
          </button>
        )}
      </div>

      {/* Quick Search if more than 10 zones */}
      {zones.length > 10 && (
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Filter wards by number or neighborhood..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-black/40 border border-white/[0.08] focus:border-orange-500/50 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
          />
        </div>
      )}

      <select
        id="zone-select-unified"
        value={selectedZoneId || ''}
        onChange={(e) => onSelectZone(e.target.value)}
        className="w-full rounded-xl bg-slate-950 border border-white/[0.1] px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/40 cursor-pointer shadow-inner"
      >
        <option value="" disabled>
          Select a Zone / Ward...
        </option>
        {groupedZones.map(([groupName, groupWards]) => (
          <optgroup key={groupName} label={groupName} className="bg-slate-950 font-bold text-slate-400">
            {groupWards.map((zone) => {
              const zId = zone.zoneId || zone.id || '';
              return (
                <option key={zId} value={zId} className="bg-slate-900 text-slate-200 font-normal">
                  {zone.wardName} {zone.areaKm2 ? `(${zone.areaKm2} km²)` : ''}
                </option>
              );
            })}
          </optgroup>
        ))}
      </select>
    </div>
  );
};

import React, { useState } from 'react';
import { Clock, RefreshCw, Radio, Compass } from 'lucide-react';
import { CardActionMenu } from '../common/CardActionMenu';

interface SectorClocksCardProps {
  onSelectZone?: (zoneId: string) => void;
}

/**
 * Real-time sector status clocks displaying temperature telemetry and status indicators.
 */
export const SectorClocksCard: React.FC<SectorClocksCardProps> = ({ onSelectZone }) => {
  const [syncedTime, setSyncedTime] = useState('14:30 IST');

  const sectors = [
    { name: 'North', sub: 'Tondiarpet', wardId: 'ward-045', temp: '41.5°C', status: 'CRITICAL', color: '#f43f5e', rot: 135 },
    { name: 'Central', sub: 'Royapuram', wardId: 'ward-052', temp: '39.8°C', status: 'HIGH', color: '#f97316', rot: 90 },
    { name: 'South', sub: 'Adyar', wardId: 'ward-170', temp: '34.2°C', status: 'MODERATE', color: '#eab308', rot: 45 },
    { name: 'OMR', sub: 'IT Corridor', wardId: 'ward-198', temp: '30% Sensor', status: 'OFFLINE', color: '#64748b', rot: 0 },
  ];

  const handleSyncClocks = () => {
    const now = new Date();
    setSyncedTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} IST`);
  };

  return (
    <div className="aero-card aero-card-hover p-3.5 select-none flex flex-col justify-between h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
        <div className="flex items-center space-x-2">
          <div className="h-7 w-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-tight">
              GCC Sector Telemetry Clocks
            </h4>
            <p className="text-[10px] text-slate-400">
              Synchronized Meteorological Feeds · {syncedTime}
            </p>
          </div>
        </div>

        <CardActionMenu
          title="Sector Telemetry Options"
          items={[
            {
              label: 'Sync Live Meteorological Clocks',
              icon: RefreshCw,
              onClick: handleSyncClocks,
            },
            {
              label: 'Focus North Corridor (Vyasarpadi)',
              icon: Compass,
              onClick: () => onSelectZone?.('ward-045'),
            },
            {
              label: 'Inspect Unscored OMR (Ward 198)',
              icon: Radio,
              onClick: () => onSelectZone?.('ward-198'),
            },
          ]}
        />
      </div>

      {/* 4 Circular Dials matching World's Clock from reference */}
      <div className="grid grid-cols-4 gap-1.5 py-1">
        {sectors.map((sec) => (
          <button
            key={sec.name}
            type="button"
            onClick={() => onSelectZone?.(sec.wardId)}
            title={`Select ${sec.name} Sector (${sec.sub})`}
            className="flex flex-col items-center text-center min-w-0 p-1 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer group"
          >
            {/* Clock Dial */}
            <div className="w-10 h-10 rounded-full border-2 border-slate-700 group-hover:border-indigo-400 bg-slate-900/90 shadow-inner relative flex items-center justify-center mb-1 transition-colors shrink-0">
              {/* Dial tick marks */}
              <div className="absolute inset-1 rounded-full border border-white/[0.04]" />
              
              {/* Center point */}
              <div className="w-1.5 h-1.5 rounded-full bg-white z-10" />

              {/* Hour & Minute Hands */}
              <div
                className="absolute w-0.5 h-3.5 bg-white origin-bottom bottom-1/2 left-[calc(50%-1px)] rounded-full transition-transform"
                style={{ transform: `rotate(${sec.rot}deg)` }}
              />
              <div
                className="absolute w-0.5 h-4.5 bg-orange-400 origin-bottom bottom-1/2 left-[calc(50%-1px)] rounded-full transition-transform"
                style={{ transform: `rotate(${sec.rot + 60}deg)` }}
              />
            </div>

            {/* Sector Name & Telemetry */}
            <span className="text-[11px] font-bold text-white block truncate w-full group-hover:text-indigo-300 transition-colors">
              {sec.name}
            </span>
            <span className="text-[9px] font-mono text-slate-400 block truncate w-full">
              {sec.sub}
            </span>
            <span
              className="text-[10px] font-mono font-extrabold mt-0.5"
              style={{ color: sec.color }}
            >
              {sec.temp}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

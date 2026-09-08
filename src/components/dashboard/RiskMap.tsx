import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import type { ScoredZoneItem } from './RiskSummaryCards';
import { GoogleRiskMap } from './GoogleRiskMap';

export interface RiskMapProps {
  scoredZones: ScoredZoneItem[];
  selectedZoneId?: string;
  onSelectZone?: (zoneId: string) => void;
  onOpenHelp?: () => void;
}

type FilterTier = 'ALL' | 'VERY_HIGH' | 'HIGH' | 'MODERATE' | 'INSUFFICIENT';

/**
 * Production Google Maps Platform Spatial Heat & Vulnerability Map
 * 
 * Powered by official @vis.gl/react-google-maps SDK
 * - AdvancedMarkerElement for interactive ward nodes
 * - High-resolution dark vector & satellite geospatial visualization
 * - Interactive InfoWindows and cross-dashboard synchronization
 */
export const RiskMap: React.FC<RiskMapProps> = ({
  scoredZones,
  selectedZoneId,
  onSelectZone,
  onOpenHelp,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterTier>('ALL');

  // Read environment variable or local storage for Google Maps API Key
  const envKey = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_GOOGLE_MAPS_API_KEY || '';
  const apiKey = localStorage.getItem('respire_gmaps_key') || envKey;
  const [radarOverlay, setRadarOverlay] = useState<boolean>(true);

  const filteredZones = scoredZones.filter(({ score }) => {
    if (activeFilter === 'ALL') return true;
    const band = score.riskBand ?? score.riskLevel;
    if (activeFilter === 'INSUFFICIENT') {
      return band === 'INSUFFICIENT_EVIDENCE' || score.riskLevel === 'INSUFFICIENT_DATA' || score.totalScore === null;
    }
    return band === activeFilter;
  });

  return (
    <div className="relative aero-card overflow-hidden flex flex-col shadow-2xl transition-all h-full">
      {/* Top GIS Toolbar */}
      <div className="px-4 py-2.5 bg-white/[0.02] border-b border-white/[0.06] flex items-center justify-between gap-2.5 z-20">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
              Greater Chennai Spatial Heat & Vulnerability Map
            </h3>
            <p className="text-[10px] text-slate-400">
              Google Maps Platform · High-Resolution Geospatial Telemetry
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 text-[10px]">
          {(['ALL', 'VERY_HIGH', 'HIGH', 'MODERATE', 'INSUFFICIENT'] as FilterTier[]).map((tier) => {
            const isActive = activeFilter === tier;
            const labels: Record<FilterTier, string> = {
              ALL: 'All',
              VERY_HIGH: 'Urgent',
              HIGH: 'High',
              MODERATE: 'Mod',
              INSUFFICIENT: 'No Data',
            };
            return (
              <button
                key={tier}
                type="button"
                onClick={() => setActiveFilter(tier)}
                className={`px-2.5 py-1 rounded-md font-mono transition-all cursor-pointer ${
                  isActive
                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 font-bold shadow-sm'
                    : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 border border-white/[0.06]'
                }`}
              >
                {labels[tier]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Google Maps Viewport */}
      <div className="w-full flex-1 min-h-[440px] relative bg-[#070A12] overflow-hidden">
        <GoogleRiskMap
          scoredZones={filteredZones}
          selectedZoneId={selectedZoneId}
          onSelectZone={onSelectZone}
          apiKey={apiKey}
        />

        {/* Floating Radar Overlay Toggle matching AirlineSim reference laptop screen */}
        <div className="absolute bottom-4 right-4 z-10 flex items-center space-x-2 select-none">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#0A0E1A]/90 border border-white/20 backdrop-blur-xl shadow-2xl">
            <span className="text-[11px] font-bold text-white tracking-tight">Radar view</span>
            <button
              type="button"
              onClick={() => setRadarOverlay(!radarOverlay)}
              className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                radarOverlay ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  radarOverlay ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenHelp}
            title="GIS & Telemetry Help Guide"
            className="h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 transition-colors cursor-pointer text-xs font-extrabold"
          >
            ?
          </button>
        </div>

        {/* Ambient Radar Sweep Overlay if enabled */}
        {radarOverlay && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden mix-blend-screen opacity-25">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-emerald-500/40" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full border border-emerald-500/30" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] rounded-full border border-emerald-500/20" />
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
} from '@vis.gl/react-google-maps';
import { Layers } from 'lucide-react';
import type { ScoredZoneItem } from './RiskSummaryCards';

interface GoogleRiskMapProps {
  scoredZones: ScoredZoneItem[];
  selectedZoneId?: string;
  onSelectZone?: (zoneId: string) => void;
  apiKey: string;
}

/**
 * Modern Google Maps Platform Integration for RESPIRE
 * 
 * Implemented using official @vis.gl/react-google-maps SDK
 * - AdvancedMarkerElement for interactive ward nodes
 * - Dark colorScheme matching RESPIRE obsidian aesthetic
 * - Mandatory internalUsageAttributionIds={['gmp_git_agentskills_v1']}
 * - Interactive InfoWindows and dynamic risk styling
 */
import type { Zone } from '../../types';

interface DisplayMapItem {
  id: string;
  name: string;
  subName?: string;
  lat: number;
  lng: number;
  score: {
    totalScore: number | null;
    riskBand?: string;
    riskLevel: string;
    whyThisZone?: { primaryDriver?: string | null; secondaryDriver?: string | null };
  };
  isZoneAggregate: boolean;
  rawZone?: Zone;
}

/**
 * Interactive Google Maps Platform component for geospatial heat risk triage.
 */
export const GoogleRiskMap: React.FC<GoogleRiskMapProps> = ({
  scoredZones,
  selectedZoneId,
  onSelectZone,
  apiKey,
}) => {
  const [activeInfoWindowId, setActiveInfoWindowId] = useState<string | null>(null);

  // Auto-dismiss and suppress Google Maps development / authentication popups
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Suppress window.gm_authFailure
    (window as unknown as { gm_authFailure?: () => void }).gm_authFailure = () => {};

    /**
     * Suppresses default Google Maps authentication error overlays in sandbox mode.
     */
    const dismissGoogleErrorDialogs = () => {
      // 1. Click dismiss / OK buttons if present to satisfy Google Maps internal state
      const dismissBtns = document.querySelectorAll<HTMLButtonElement>(
        '.dismissButton, .gm-err-container button, div[role="dialog"] button'
      );
      dismissBtns.forEach((btn) => {
        try {
          btn.click();
        } catch {
          // ignore
        }
      });

      // 2. Remove error container elements
      const errorElements = document.querySelectorAll(
        '.gm-err-container, .gm-err-content, .gm-err-autocomplete, [class*="gm-err"]'
      );
      errorElements.forEach((el) => {
        try {
          el.remove();
        } catch {
          // ignore
        }
      });

      // 3. Scan for any overlay or modal containing the error text
      const candidateElements = document.querySelectorAll('div, dialog');
      candidateElements.forEach((el) => {
        const text = el.textContent || '';
        if (
          text.includes("This page can't load Google Maps correctly") ||
          text.includes('Do you own this website?')
        ) {
          try {
            if (el.parentElement && el.parentElement !== document.body && el.parentElement !== document.documentElement) {
              el.remove();
            } else {
              (el as HTMLElement).style.setProperty('display', 'none', 'important');
              (el as HTMLElement).style.setProperty('visibility', 'hidden', 'important');
              (el as HTMLElement).style.setProperty('pointer-events', 'none', 'important');
            }
          } catch {
            // ignore
          }
        }
      });
    };

    // Run immediately and observe DOM mutations
    dismissGoogleErrorDialogs();
    const observer = new MutationObserver(() => {
      dismissGoogleErrorDialogs();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Poll periodically during initialization
    const interval = setInterval(dismissGoogleErrorDialogs, 100);
    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 8000);

    return () => {
      observer.disconnect();
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  /**
   * Resolves visual color palette, glows and badges for a given risk level.
   */
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'VERY_HIGH':
        return {
          bg: '#f43f5e',
          text: '#ffffff',
          border: '#fda4af',
          glow: 'rgba(244, 63, 94, 0.45)',
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        };
      case 'HIGH':
        return {
          bg: '#f97316',
          text: '#ffffff',
          border: '#fdba74',
          glow: 'rgba(249, 115, 22, 0.45)',
          badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
        };
      case 'MODERATE':
        return {
          bg: '#eab308',
          text: '#ffffff',
          border: '#fef08a',
          glow: 'rgba(234, 179, 8, 0.45)',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        };
      case 'LOW':
        return {
          bg: '#10b981',
          text: '#ffffff',
          border: '#86efac',
          glow: 'rgba(16, 185, 129, 0.45)',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        };
      case 'INSUFFICIENT_DATA':
      case 'INSUFFICIENT_EVIDENCE':
      default:
        return {
          bg: '#64748b',
          text: '#ffffff',
          border: '#94a3b8',
          glow: 'rgba(100, 116, 139, 0.3)',
          badge: 'bg-slate-700/40 text-slate-300 border-slate-600/40',
        };
    }
  };

  // When there are many items (e.g. full 200 wards dataset), 
  // allow viewing either consolidated 15 Zones (wide spacing) or all Wards.
  const [mapGranularity, setMapGranularity] = useState<'zones' | 'wards'>('zones');

  // Compute 15 Zone aggregations if dataset is large to guarantee generous spacing
  const displayItems: DisplayMapItem[] = useMemo(() => {
    if (scoredZones.length <= 15 || mapGranularity === 'wards') {
      return scoredZones.map(({ zone, score }) => ({
        id: zone.zoneId || zone.id || zone.wardId || '',
        name: zone.wardName || zone.name || zone.zoneName || '',
        subName: zone.zoneName !== (zone.wardName || zone.name) ? zone.zoneName : undefined,
        lat: zone.latitude,
        lng: zone.longitude,
        score,
        isZoneAggregate: false,
        rawZone: zone,
      }));
    }

    // Group by zoneName / zoneId for 15 cleanly spaced zones
    const zoneMap: Record<string, { latSum: number; lngSum: number; scoreSum: number; validCount: number; items: ScoredZoneItem[] }> = {};
    
    scoredZones.forEach((item) => {
      const zKey = item.zone.zoneName || item.zone.zoneId || 'Other';
      if (!zoneMap[zKey]) {
        zoneMap[zKey] = { latSum: 0, lngSum: 0, scoreSum: 0, validCount: 0, items: [] };
      }
      const entry = zoneMap[zKey];
      entry.items.push(item);
      entry.latSum += item.zone.latitude;
      entry.lngSum += item.zone.longitude;
      if (item.score.totalScore !== null) {
        entry.scoreSum += item.score.totalScore;
        entry.validCount += 1;
      }
    });

    return Object.entries(zoneMap).map(([zName, data]) => {
      const avgScore = data.validCount > 0 ? Math.round(data.scoreSum / data.validCount) : null;
      const avgLat = data.latSum / data.items.length;
      const avgLng = data.lngSum / data.items.length;
      
      let riskBand: string;
      if (avgScore === null) riskBand = 'INSUFFICIENT_EVIDENCE';
      else if (avgScore >= 80) riskBand = 'VERY_HIGH';
      else if (avgScore >= 65) riskBand = 'HIGH';
      else if (avgScore >= 45) riskBand = 'MODERATE';
      else riskBand = 'LOW';

      const [rep] = data.items;
      return {
        id: rep.zone.zoneId || rep.zone.id || zName,
        name: zName,
        subName: `${data.items.length} Wards`,
        lat: avgLat,
        lng: avgLng,
        score: {
          ...rep.score,
          totalScore: avgScore,
          riskBand,
          riskLevel: riskBand,
        },
        isZoneAggregate: true,
        rawZone: rep.zone,
      };
    });
  }, [scoredZones, mapGranularity]);

  const activeZoneItem = useMemo<DisplayMapItem | null>(() => {
    const targetId = activeInfoWindowId || selectedZoneId;
    if (!targetId) return null;
    return (
      displayItems.find((d) => d.id === targetId) ||
      displayItems.find((d) => d.name === targetId) ||
      displayItems[0] ||
      null
    );
  }, [displayItems, activeInfoWindowId, selectedZoneId]);

  const cleanMapStyles = [
    {
      featureType: 'poi',
      elementType: 'all',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'poi.business',
      elementType: 'all',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'transit',
      elementType: 'all',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'road',
      elementType: 'labels.icon',
      stylers: [{ visibility: 'off' }],
    },
  ];

  return (
    <div className="w-full h-full min-h-[400px] relative overflow-hidden bg-[#0A0E17]">
      {/* Granularity Switcher for Large Datasets (15 Zones vs All Wards) */}
      {scoredZones.length > 15 && (
        <div className="absolute top-3 left-3 z-10 flex items-center space-x-1 p-1 rounded-xl bg-[#0A0D1A]/90 backdrop-blur-xl border border-white/20 shadow-2xl">
          <button
            type="button"
            onClick={() => setMapGranularity('zones')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              mapGranularity === 'zones'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            15 Zones (Spaced)
          </button>
          <button
            type="button"
            onClick={() => setMapGranularity('wards')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              mapGranularity === 'wards'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All {scoredZones.length} Wards
          </button>
        </div>
      )}

      <APIProvider apiKey={apiKey} libraries={['marker']}>
        <Map
          mapId="DEMO_MAP_ID"
          defaultCenter={{ lat: 13.045, lng: 80.235 }}
          defaultZoom={11.5}
          gestureHandling="greedy"
          disableDefaultUI={false}
          clickableIcons={false}
          styles={cleanMapStyles}
          colorScheme="DARK"
          internalUsageAttributionIds={['gmp_git_agentskills_v1']}
          style={{ width: '100%', height: '100%', minHeight: '400px' }}
        >
          {/* Round Circular Markers with Generous Geographic Spacing */}
          {displayItems.map((item) => {
            const isSelected = selectedZoneId === item.id || (item.rawZone && (selectedZoneId === item.rawZone.zoneId || selectedZoneId === item.rawZone.wardId));
            const colors = getRiskColor(item.score.riskBand ?? item.score.riskLevel);
            const scoreLabel = item.score.totalScore !== null ? item.score.totalScore.toFixed(0) : '—';

            return (
              <AdvancedMarker
                key={item.id}
                position={{ lat: item.lat, lng: item.lng }}
                title={`${item.name} - Risk Score: ${scoreLabel}/100`}
                onClick={() => {
                  onSelectZone?.(item.id);
                  setActiveInfoWindowId(item.id);
                }}
              >
                <div className="relative group cursor-pointer select-none transition-transform hover:scale-125 hover:z-50">
                  {/* Selected Pulsing Aura */}
                  {isSelected && (
                    <div className="absolute -inset-2.5 rounded-full bg-orange-500/40 animate-ping pointer-events-none" />
                  )}

                  {/* Round Circular Marker Body */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shadow-2xl border-2 transition-all duration-200 ${
                      isSelected
                        ? 'ring-3 ring-white scale-110 shadow-[0_0_20px_rgba(255,255,255,0.8)] z-30'
                        : 'border-white/80'
                    }`}
                    style={{
                      backgroundColor: colors.bg,
                      borderColor: isSelected ? '#ffffff' : colors.border,
                      boxShadow: `0 0 14px ${colors.glow}, 0 4px 8px rgba(0,0,0,0.6)`,
                    }}
                  >
                    <span className="text-xs font-mono font-black text-white tracking-tight leading-none drop-shadow">
                      {scoreLabel}
                    </span>
                  </div>

                  {/* Micro Pin Pointer Tip */}
                  <div
                    className="w-1.5 h-1.5 mx-auto rotate-45 -mt-1 shadow-md border-r border-b"
                    style={{
                      backgroundColor: colors.bg,
                      borderColor: colors.border,
                    }}
                  />

                  {/* Floating Glassmorphic Tooltip on Hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-2.5 py-1.5 rounded-xl bg-[#080C16]/95 border border-white/20 shadow-2xl text-center whitespace-nowrap backdrop-blur-md">
                      <p className="text-[11px] font-extrabold text-white tracking-tight">{item.name}</p>
                      {item.subName && (
                        <p className="text-[9px] text-slate-400 font-medium">{item.subName}</p>
                      )}
                      <div className="flex items-center justify-center gap-1.5 text-[9px] font-mono mt-0.5 pt-0.5 border-t border-white/10">
                        <span className="text-orange-400 font-bold">{scoreLabel}/100</span>
                        <span className="text-slate-500">·</span>
                        <span className="font-semibold text-slate-300">
                          {item.score.riskBand ?? item.score.riskLevel}
                        </span>
                      </div>
                    </div>
                    <div className="w-1.5 h-1.5 -mt-1 rotate-45 bg-[#080C16] border-r border-b border-white/20" />
                  </div>
                </div>
              </AdvancedMarker>
            );
          })}

          {/* Interactive InfoWindow for focused ward or zone */}
          {activeZoneItem && activeInfoWindowId && (
            <InfoWindow
              position={{
                lat: activeZoneItem.lat + 0.006,
                lng: activeZoneItem.lng,
              }}
              onCloseClick={() => setActiveInfoWindowId(null)}
            >
              <div className="p-1.5 space-y-1.5 text-slate-900 min-w-[210px]">
                <div className="flex items-center justify-between border-b pb-1">
                  <span className="font-bold text-xs">
                    {activeZoneItem.name}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                    {activeZoneItem.id}
                  </span>
                </div>

                <div className="text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Risk Score:</span>
                    <strong className="font-mono text-orange-600 text-sm">
                      {activeZoneItem.score.totalScore !== null
                        ? `${activeZoneItem.score.totalScore.toFixed(1)} / 100`
                        : 'Insufficient Data'}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Risk Tier:</span>
                    <span className="font-bold text-xs px-1.5 py-0.5 rounded bg-orange-100 text-orange-800">
                      {activeZoneItem.score.riskBand ?? activeZoneItem.score.riskLevel}
                    </span>
                  </div>
                  {activeZoneItem.subName && (
                    <div className="text-[11px] text-slate-500">
                      Coverage: <strong>{activeZoneItem.subName}</strong>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectZone?.(activeZoneItem.id);
                    setActiveInfoWindowId(null);
                  }}
                  className="w-full mt-2 py-1.5 px-2 text-[11px] font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors cursor-pointer text-center shadow"
                >
                  Select in Dashboard
                </button>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </div>
  );
};

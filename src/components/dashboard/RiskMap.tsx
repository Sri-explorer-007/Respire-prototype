import React, { useState } from 'react';
import {
  Navigation,
  Plus,
  Minus,
  Compass,
  Layers,
  HelpCircle,
} from 'lucide-react';
import type { ScoredZoneItem } from './RiskSummaryCards';
import { GoogleRiskMap } from './GoogleRiskMap';

export interface RiskMapProps {
  scoredZones: ScoredZoneItem[];
  selectedZoneId?: string;
  onSelectZone?: (zoneId: string) => void;
  onOpenHelp?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

type FilterTier = 'all' | 'very-high' | 'high' | 'moderate' | 'insufficient';
type LayerType = 'composite' | 'lst' | 'ndvi';
type MapEngine = 'vector' | 'google';

export const RiskMap: React.FC<RiskMapProps> = ({
  scoredZones,
  selectedZoneId = 'ward-045',
  onSelectZone,
  onOpenHelp,
  searchQuery = '',
  onSearchChange,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterTier>('all');
  const [activeLayer, setActiveLayer] = useState<LayerType>('composite');
  const [mapEngine, setMapEngine] = useState<MapEngine>('vector');
  const [zoomLevel, setZoomLevel] = useState(1);

  // Read environment variable or local storage for Google Maps API Key
  const envKey = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_GOOGLE_MAPS_API_KEY || '';
  const apiKey = localStorage.getItem('respire_gmaps_key') || envKey;

  // Filter zones according to tier
  const filteredZones = scoredZones.filter(({ score, zone }) => {
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const zName = (zone.wardName || zone.zoneName || zone.name || '').toLowerCase();
      const zId = (zone.wardId || zone.zoneId || zone.id || '').toLowerCase();
      if (!zName.includes(q) && !zId.includes(q)) return false;
    }

    if (activeFilter === 'all') return true;
    const band = score.riskBand ?? score.riskLevel;
    if (activeFilter === 'insufficient') {
      return band === 'INSUFFICIENT_EVIDENCE' || score.riskLevel === 'INSUFFICIENT_DATA' || score.totalScore === null;
    }
    if (activeFilter === 'very-high') return band === 'VERY_HIGH';
    if (activeFilter === 'high') return band === 'HIGH';
    if (activeFilter === 'moderate') return band === 'MODERATE';
    return true;
  });

  const handlePolygonClick = (wardId: string) => {
    onSelectZone?.(wardId);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Interactive Control Strip (Matching Mockup 1) */}
      <div className="w-full bg-white p-2 sm:p-2.5 rounded-xl border border-slate-200 shadow-xs flex flex-col xl:flex-row items-center justify-between gap-2.5">
        {/* Search Field */}
        <div className="relative w-full xl:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search ward name, code (e.g. Ward 074)..."
            className="w-full pl-3 pr-4 py-1.5 bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:bg-white transition-all"
          />
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full xl:w-auto pb-0.5 xl:pb-0">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-[#0b1c30] text-white font-semibold shadow-xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Wards (15)
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('very-high')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'very-high'
                ? 'bg-rose-700 text-white font-semibold'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-600"></span>
            Very High (4)
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('high')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'high'
                ? 'bg-orange-600 text-white font-semibold'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            High (4)
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('moderate')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'moderate'
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            Moderate (6)
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('insufficient')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'insufficient'
                ? 'bg-slate-700 text-white font-semibold'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            Insufficient (1)
          </button>
        </div>

        {/* Layer Switcher */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg w-full xl:w-auto justify-between xl:justify-start border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveLayer('composite')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
              activeLayer === 'composite'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Composite Risk
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer('lst')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
              activeLayer === 'lst'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Surface Temp (LST)
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer('ndvi')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
              activeLayer === 'ndvi'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Vegetation (NDVI)
          </button>
        </div>
      </div>

      {/* Primary GIS Map Viewport Container */}
      <div className="flex flex-col relative w-full h-[640px] bg-[#dbe8f5] rounded-xl overflow-hidden shadow-xs border border-slate-300 group select-none">
        {/* Coordinate / HUD Ribbon (Top Left) */}
        <div className="absolute top-3.5 left-3.5 z-20 flex items-center gap-2">
          <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-xs border border-slate-200 flex items-center gap-2">
            <Navigation className="w-3.5 h-3.5 text-emerald-600 rotate-45" />
            <span className="font-mono text-xs text-slate-800 font-semibold">13.1092° N, 80.2574° E</span>
            <span className="text-slate-300 text-xs">•</span>
            <span className="font-mono text-xs text-slate-500">North Chennai Sector IV</span>
          </div>
          <div className="hidden md:flex bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-lg shadow-xs border border-slate-200 text-[10px] font-mono text-slate-500 items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            GRID RES: 30M
          </div>
        </div>

        {/* Tactical Map Overlay Tools (Top Right) */}
        <div className="absolute top-3.5 right-3.5 z-20 flex flex-col gap-1 bg-white/95 backdrop-blur-md p-1 rounded-lg shadow-xs border border-slate-200">
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 1.8))}
            className="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.8))}
            className="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel(1)}
            className="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
            title="Reset Orientation"
          >
            <Compass className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setMapEngine(mapEngine === 'vector' ? 'google' : 'vector')}
            className={`w-7 h-7 flex items-center justify-center rounded transition-colors cursor-pointer ${
              mapEngine === 'google' ? 'bg-[#0b1c30] text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
            title="Toggle Google Maps Mode"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
          {onOpenHelp && (
            <button
              type="button"
              onClick={onOpenHelp}
              className="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
              title="Help & Methodology"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Map Rendering Viewport: Vector SVG or Google Maps */}
        {mapEngine === 'google' ? (
          <div className="w-full h-full">
            <GoogleRiskMap
              scoredZones={filteredZones}
              selectedZoneId={selectedZoneId}
              onSelectZone={onSelectZone}
              apiKey={apiKey}
            />
          </div>
        ) : (
          <div className="relative w-full h-full cursor-crosshair overflow-hidden">
            <svg
              className="w-full h-full absolute inset-0 transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel})` }}
              viewBox="0 0 1000 700"
              preserveAspectRatio="none"
            >
              <defs>
                {/* Pattern for Insufficient Evidence */}
                <pattern id="insufficientHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="0" y2="8" stroke="#76777d" strokeWidth="1.8" opacity="0.45" />
                </pattern>
                {/* Technical Grid Pattern */}
                <pattern id="technicalGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#bed0e4" strokeWidth="0.75" strokeDasharray="2 3" opacity="0.7" />
                </pattern>
                {/* Pin Shadow */}
                <filter id="pinShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.3" />
                </filter>
              </defs>

              {/* Technical GIS Grid Background */}
              <rect width="1000" height="700" fill="#e2edfa" />
              <rect width="1000" height="700" fill="url(#technicalGrid)" />

              {/* Bay of Bengal (Eastern Coast) */}
              <path d="M 740,0 C 730,120 745,260 760,390 C 772,500 790,620 810,700 L 1000,700 L 1000,0 Z" fill="#b9d6f3" />
              <path d="M 780,0 C 770,140 788,280 810,410 C 825,510 850,610 880,700" fill="none" stroke="#9bc2e6" strokeWidth="1.5" strokeDasharray="6 4" />
              <text x="890" y="240" fill="#45709a" fontFamily="JetBrains Mono" fontSize="11" letterSpacing="3" opacity="0.8" transform="rotate(78 890 240)">
                BAY OF BENGAL
              </text>

              {/* Chennai Harbour & Port Breakwaters */}
              <path d="M 748,220 L 810,210 L 825,270 L 755,290" fill="#9bc2e6" stroke="#486581" strokeWidth="1.5" opacity="0.6" />
              <text x="760" y="255" fill="#243b53" fontFamily="Inter" fontSize="9" fontWeight="600">
                CHENNAI HARBOUR
              </text>

              {/* Buckingham Canal */}
              <path d="M 450,0 Q 420,180 435,320 T 520,580 L 540,700" fill="none" stroke="#87b3db" strokeWidth="4" strokeLinecap="round" />
              <text x="445" y="160" fill="#45709a" fontFamily="JetBrains Mono" fontSize="8" transform="rotate(82 445 160)">
                BUCKINGHAM CANAL
              </text>

              {/* Major Roads / Railway Lines */}
              <path d="M 120,700 L 380,360 L 510,180 L 560,0" fill="none" stroke="#c0c9d6" strokeWidth="3" />
              <path d="M 120,700 L 380,360 L 510,180 L 560,0" fill="none" stroke="#f8fafc" strokeWidth="1.5" strokeDasharray="4 4" />
              <path d="M 60,320 L 400,340 L 740,330" fill="none" stroke="#cbd5e1" strokeWidth="2.5" />

              {/* ================= WARD POLYGONS ================= */}
              {/* 1. Ward 072 - Perambur (Moderate 42) */}
              <polygon
                points="180,180 320,150 360,260 210,310"
                fill="#fef08a"
                fillOpacity="0.65"
                stroke="#ca8a04"
                strokeWidth="1.5"
                className="transition-all duration-150 cursor-pointer hover:opacity-90"
                onClick={() => handlePolygonClick('ward-072')}
              />
              <text x="250" y="235" textAnchor="middle" fill="#713f12" fontFamily="Inter" fontSize="11" fontWeight="600">Perambur</text>
              <text x="250" y="250" textAnchor="middle" fill="#854d0e" fontFamily="JetBrains Mono" fontSize="9">Score: 42</text>

              {/* 2. Ward 081 - Tondiarpet (High 71) */}
              <polygon
                points="320,80 480,40 540,160 410,210"
                fill="#f97316"
                fillOpacity="0.65"
                stroke="#c2410c"
                strokeWidth="1.5"
                className="transition-all duration-150 cursor-pointer hover:opacity-90"
                onClick={() => handlePolygonClick('ward-081')}
              />
              <text x="430" y="125" textAnchor="middle" fill="#431407" fontFamily="Inter" fontSize="11" fontWeight="600">Tondiarpet</text>
              <text x="430" y="140" textAnchor="middle" fill="#7c2d12" fontFamily="JetBrains Mono" fontSize="9">Score: 71</text>

              {/* 3. Ward 074 / 045 - VYASARPADI (Selected Focus - Very High 88) */}
              <polygon
                points="290,260 430,220 480,360 330,410"
                fill="#ba1a1a"
                fillOpacity="0.2"
                stroke="#ba1a1a"
                strokeWidth="12"
                strokeLinejoin="round"
                opacity="0.6"
              />
              <polygon
                id="wardVyasarpadi"
                points="290,260 430,220 480,360 330,410"
                fill="#ba1a1a"
                fillOpacity="0.85"
                stroke="#7f1d1d"
                strokeWidth="2.5"
                strokeLinejoin="round"
                className="cursor-pointer transition-all duration-150"
                onClick={() => handlePolygonClick('ward-045')}
              />
              <text x="385" y="310" textAnchor="middle" fill="#ffffff" fontFamily="Inter" fontSize="13" fontWeight="700">VYASARPADI</text>
              <text x="385" y="328" textAnchor="middle" fill="#fee2e2" fontFamily="JetBrains Mono" fontSize="11" fontWeight="600">Score: 88 • 41.2°C</text>

              {/* 4. Ward 086 - Washermanpet (Very High 86) */}
              <polygon
                points="430,220 580,180 620,310 480,360"
                fill="#dc2626"
                fillOpacity="0.75"
                stroke="#991b1b"
                strokeWidth="1.5"
                className="transition-all duration-150 cursor-pointer hover:opacity-90"
                onClick={() => handlePolygonClick('ward-086')}
              />
              <text x="525" y="270" textAnchor="middle" fill="#ffffff" fontFamily="Inter" fontSize="11" fontWeight="600">Washermanpet</text>
              <text x="525" y="285" textAnchor="middle" fill="#fecaca" fontFamily="JetBrains Mono" fontSize="9">Score: 86</text>

              {/* 5. Ward 082 / 049 - Royapuram (Very High 82) */}
              <polygon
                points="580,180 740,160 755,290 620,310"
                fill="#ef4444"
                fillOpacity="0.72"
                stroke="#b91c1c"
                strokeWidth="1.5"
                className="transition-all duration-150 cursor-pointer hover:opacity-90"
                onClick={() => handlePolygonClick('ward-049')}
              />
              <text x="665" y="235" textAnchor="middle" fill="#ffffff" fontFamily="Inter" fontSize="11" fontWeight="600">Royapuram</text>
              <text x="665" y="250" textAnchor="middle" fill="#fee2e2" fontFamily="JetBrains Mono" fontSize="9">Score: 82</text>

              {/* 6. Ward 089 - George Town (High 74) */}
              <polygon
                points="480,360 620,310 650,450 510,490"
                fill="#f97316"
                fillOpacity="0.65"
                stroke="#c2410c"
                strokeWidth="1.5"
                className="transition-all duration-150 cursor-pointer hover:opacity-90"
                onClick={() => handlePolygonClick('ward-089')}
              />
              <text x="565" y="400" textAnchor="middle" fill="#431407" fontFamily="Inter" fontSize="11" fontWeight="600">George Town</text>
              <text x="565" y="415" textAnchor="middle" fill="#7c2d12" fontFamily="JetBrains Mono" fontSize="9">Score: 74</text>

              {/* 7. Ward 093 - Chennai Central / Park Town (Moderate 48) */}
              <polygon
                points="330,410 480,360 510,490 370,530"
                fill="#fde047"
                fillOpacity="0.65"
                stroke="#a16207"
                strokeWidth="1.5"
                className="transition-all duration-150 cursor-pointer hover:opacity-90"
                onClick={() => handlePolygonClick('ward-093')}
              />
              <text x="420" y="450" textAnchor="middle" fill="#713f12" fontFamily="Inter" fontSize="11" fontWeight="600">Park Town</text>
              <text x="420" y="465" textAnchor="middle" fill="#854d0e" fontFamily="JetBrains Mono" fontSize="9">Score: 48</text>

              {/* 8. Ward 098 - Choolai (High 68) */}
              <polygon
                points="210,310 330,410 370,530 240,500"
                fill="#fb923c"
                fillOpacity="0.65"
                stroke="#c2410c"
                strokeWidth="1.5"
                className="transition-all duration-150 cursor-pointer hover:opacity-90"
                onClick={() => handlePolygonClick('ward-098')}
              />
              <text x="285" y="420" textAnchor="middle" fill="#431407" fontFamily="Inter" fontSize="11" fontWeight="600">Choolai</text>
              <text x="285" y="435" textAnchor="middle" fill="#7c2d12" fontFamily="JetBrains Mono" fontSize="9">Score: 68</text>

              {/* 9. Ward 101 - Egmore (Moderate 38) */}
              <polygon
                points="240,500 370,530 380,660 260,640"
                fill="#fef08a"
                fillOpacity="0.65"
                stroke="#ca8a04"
                strokeWidth="1.5"
                className="transition-all duration-150 cursor-pointer hover:opacity-90"
                onClick={() => handlePolygonClick('ward-101')}
              />
              <text x="310" y="580" textAnchor="middle" fill="#713f12" fontFamily="Inter" fontSize="11" fontWeight="600">Egmore</text>
              <text x="310" y="595" textAnchor="middle" fill="#854d0e" fontFamily="JetBrains Mono" fontSize="9">Score: 38</text>

              {/* 10. Ward 104 - Chepauk / Triplicane (Moderate 44) */}
              <polygon
                points="510,490 650,450 670,580 540,610"
                fill="#fde047"
                fillOpacity="0.65"
                stroke="#ca8a04"
                strokeWidth="1.5"
                className="transition-all duration-150 cursor-pointer hover:opacity-90"
                onClick={() => handlePolygonClick('ward-104')}
              />
              <text x="590" y="530" textAnchor="middle" fill="#713f12" fontFamily="Inter" fontSize="11" fontWeight="600">Triplicane</text>
              <text x="590" y="545" textAnchor="middle" fill="#854d0e" fontFamily="JetBrains Mono" fontSize="9">Score: 44</text>

              {/* 11. Ward 108 - Marina Coastal Strip (Moderate 31) */}
              <polygon
                points="650,450 760,430 780,590 670,580"
                fill="#86efac"
                fillOpacity="0.55"
                stroke="#15803d"
                strokeWidth="1.5"
                className="transition-all duration-150 cursor-pointer hover:opacity-90"
                onClick={() => handlePolygonClick('ward-108')}
              />
              <text x="710" y="515" textAnchor="middle" fill="#14532d" fontFamily="Inter" fontSize="10" fontWeight="600">Marina Beach</text>
              <text x="710" y="530" textAnchor="middle" fill="#166534" fontFamily="JetBrains Mono" fontSize="9">Score: 31</text>

              {/* 12. Ward 065 - Madhavaram Industrial (Very High 85) */}
              <polygon
                points="80,100 240,60 280,190 120,220"
                fill="#ea580c"
                fillOpacity="0.75"
                stroke="#9a3412"
                strokeWidth="1.5"
                className="transition-all duration-150 cursor-pointer hover:opacity-90"
                onClick={() => handlePolygonClick('ward-065')}
              />
              <text x="180" y="140" textAnchor="middle" fill="#ffffff" fontFamily="Inter" fontSize="11" fontWeight="600">Madhavaram Ind.</text>
              <text x="180" y="155" textAnchor="middle" fill="#ffedd5" fontFamily="JetBrains Mono" fontSize="9">Score: 85</text>

              {/* 13. Ward 055 - Kodungaiyur Dump Basin (High 79) */}
              <polygon
                points="240,60 380,20 440,110 320,150"
                fill="#ea580c"
                fillOpacity="0.7"
                stroke="#9a3412"
                strokeWidth="1.5"
                className="transition-all duration-150 cursor-pointer hover:opacity-90"
                onClick={() => handlePolygonClick('ward-055')}
              />
              <text x="340" y="85" textAnchor="middle" fill="#ffffff" fontFamily="Inter" fontSize="10" fontWeight="600">Kodungaiyur</text>
              <text x="340" y="100" textAnchor="middle" fill="#ffedd5" fontFamily="JetBrains Mono" fontSize="9">Score: 79</text>

              {/* 14. Ward 112 - Thousand Lights (Moderate 39) */}
              <polygon
                points="370,530 540,510 520,680 390,660"
                fill="#fef08a"
                fillOpacity="0.6"
                stroke="#ca8a04"
                strokeWidth="1.5"
                className="transition-all duration-150 cursor-pointer hover:opacity-90"
                onClick={() => handlePolygonClick('ward-112')}
              />
              <text x="450" y="605" textAnchor="middle" fill="#713f12" fontFamily="Inter" fontSize="11" fontWeight="600">Thousand Lights</text>
              <text x="450" y="620" textAnchor="middle" fill="#854d0e" fontFamily="JetBrains Mono" fontSize="9">Score: 39</text>

              {/* 15. Port Trust Restricted Sector - Insufficient Evidence Hatching */}
              <polygon
                points="740,290 830,280 840,400 760,390"
                fill="url(#insufficientHatch)"
                stroke="#76777d"
                strokeWidth="1.5"
                className="transition-all duration-150 cursor-pointer hover:opacity-90"
                onClick={() => handlePolygonClick('ward-198')}
              />
              <text x="785" y="340" textAnchor="middle" fill="#334155" fontFamily="Inter" fontSize="9" fontWeight="600">PORT RESTR.</text>
              <text x="785" y="353" textAnchor="middle" fill="#475569" fontFamily="JetBrains Mono" fontSize="8">NO TELEM</text>

              {/* Tactical Selection Pin On Selected Ward (Default Vyasarpadi 385, 275) */}
              <g filter="url(#pinShadow)" transform="translate(385, 275)">
                <circle cx="0" cy="0" r="16" fill="none" stroke="#ffffff" strokeWidth="2.5" opacity="0.8">
                  <animate attributeName="r" values="12;22;12" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.9;0.1;0.9" dur="2s" repeatCount="indefinite" />
                </circle>
                <path d="M 0,0 L 0,-26" stroke="#0b1c30" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="0" cy="-26" r="11" fill="#0b1c30" stroke="#ffffff" strokeWidth="2" />
                <circle cx="0" cy="-26" r="4" fill="#ff4d4d" />
              </g>
            </svg>

            {/* Dynamic Map Tooltip Anchor */}
            <div className="absolute left-[385px] top-[215px] -translate-x-1/2 -translate-y-full pointer-events-none hidden md:block z-30">
              <div className="bg-[#0b1c30] text-white px-3 py-1.5 rounded-lg shadow-lg text-center whitespace-nowrap">
                <div className="text-[9px] font-mono text-slate-300 uppercase tracking-wider">Active Selection</div>
                <div className="text-xs font-bold">Ward 074 • Vyasarpadi</div>
                <div className="text-[10px] font-mono text-emerald-400">Surface: 41.2°C | Canopy: 3.2%</div>
              </div>
              <div className="w-2 h-2 bg-[#0b1c30] rotate-45 mx-auto -mt-1" />
            </div>
          </div>
        )}

        {/* Bottom Map Status & Cartographic Elements */}
        <div className="absolute bottom-3.5 left-3.5 right-3.5 z-20 flex flex-col md:flex-row items-end md:items-center justify-between gap-2 pointer-events-none">
          {/* Legend Pill */}
          <div className="pointer-events-auto bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl shadow-xs border border-slate-200 flex flex-wrap items-center gap-3.5 text-xs">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              Composite Heat Risk
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-600" />
              <span className="font-mono text-xs text-slate-800">
                Very High <span className="text-slate-400 font-normal">(75–100)</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-orange-500" />
              <span className="font-mono text-xs text-slate-800">
                High <span className="text-slate-400 font-normal">(50–74)</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-400" />
              <span className="font-mono text-xs text-slate-800">
                Moderate <span className="text-slate-400 font-normal">(25–49)</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-300 flex items-center justify-center text-[9px] text-slate-600 font-bold">
                /
              </span>
              <span className="font-mono text-xs text-slate-800">
                Insufficient <span className="text-slate-400 font-normal">(N/A)</span>
              </span>
            </div>
          </div>

          {/* Metric Scale Bar */}
          <div className="pointer-events-auto bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-xs border border-slate-200 flex items-center gap-3">
            <div className="flex flex-col items-center">
              <div className="flex h-1.5 w-20 bg-slate-800">
                <div className="w-10 h-full bg-white border-r border-slate-800" />
              </div>
              <div className="flex justify-between w-20 text-[9px] font-mono text-slate-500 mt-0.5">
                <span>0</span>
                <span>500m</span>
                <span>1 km</span>
              </div>
            </div>
            <span className="font-mono text-[10px] font-semibold text-slate-600">1:25,000</span>
          </div>
        </div>
      </div>
    </div>
  );
};

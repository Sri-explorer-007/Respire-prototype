import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  MapPin,
  Flame,
  Trees,
  Users2,
  ChevronRight,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import { GCC_ZONES_METADATA, CHENNAI_ALL_200_WARDS } from '../../data';
import { respireScoringEngine } from '../../core/scoring/scoringEngine';

interface ChennaiZonesModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedZoneId?: string;
  onSelectZone: (zoneId: string) => void;
  dataSourceMode?: 'demo' | 'processed';
  onToggleMode?: (mode: 'demo' | 'processed') => void;
}

export const ChennaiZonesModal: React.FC<ChennaiZonesModalProps> = ({
  isOpen,
  onClose,
  selectedZoneId,
  onSelectZone,
  dataSourceMode = 'processed',
  onToggleMode,
}) => {
  const [selectedZoneNum, setSelectedZoneNum] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Pre-score all 200 wards for instant lookup & filtering
  const allScoredWards = useMemo(() => {
    return CHENNAI_ALL_200_WARDS.map((zone) => {
      const zId = zone.zoneId || zone.id || '';
      const score = respireScoringEngine.calculateScore(zId, zone.metrics);
      return { zone, score };
    });
  }, []);

  // Filter wards based on selected zone tab and search query
  const displayedWards = useMemo(() => {
    let result = allScoredWards;

    // Filter by Zone if one is selected
    if (selectedZoneNum !== null) {
      const targetZoneMeta = GCC_ZONES_METADATA.find((z) => z.zoneNumber === selectedZoneNum);
      if (targetZoneMeta) {
        const zonePrefix = `zone-${String(targetZoneMeta.zoneNumber).padStart(2, '0')}`;
        result = result.filter(
          (item) => item.zone.zoneId === zonePrefix || item.zone.zoneName.includes(targetZoneMeta.name)
        );
      }
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const cleanNum = q.replace(/^ward\s*/i, '').replace(/^w-?/i, '');
      result = result.filter(({ zone }) => {
        const name = (zone.zoneName || '').toLowerCase();
        const wardId = (zone.wardId || '').toLowerCase();
        const wardName = (zone.wardName || '').toLowerCase();
        const numMatch =
          cleanNum &&
          /^\d+$/.test(cleanNum) &&
          (wardId === `ward-${cleanNum.padStart(3, '0')}` ||
            wardName.toLowerCase().includes(`ward ${cleanNum.padStart(3, '0')}`) ||
            wardName.toLowerCase().includes(`ward ${cleanNum}`));

        return name.includes(q) || wardId.includes(q) || wardName.includes(q) || numMatch;
      });
    }

    return result;
  }, [allScoredWards, selectedZoneNum, searchQuery]);

  if (!isOpen) return null;

  const getRiskBadge = (band: string | null) => {
    switch (band) {
      case 'VERY_HIGH':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MODERATE':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'LOW':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in select-none">
      <div className="bg-white max-w-6xl w-full h-[90vh] flex flex-col rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2 flex-wrap">
                Greater Chennai Corporation (GCC) Administrative Hierarchy
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                  15 Zones · 200 Wards
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Official municipal delimitations, microclimate telemetry & heat risk prioritization
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Mode Switcher */}
            {onToggleMode && (
              <button
                type="button"
                onClick={() => onToggleMode(dataSourceMode === 'demo' ? 'processed' : 'demo')}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
                title="Toggle Active Workspace Data"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
                <span>
                  {dataSourceMode === 'processed' ? 'Active: All 200 Wards' : 'Active: 10 Benchmark Wards'}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by Ward Number (1–200), Neighborhood (e.g., Vyasarpadi, Adyar, T. Nagar), or Zone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-14 py-2 rounded-xl bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 font-semibold cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
            <button
              type="button"
              onClick={() => setSelectedZoneNum(null)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedZoneNum === null
                  ? 'bg-[#0b1c30] text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All 15 Zones ({displayedWards.length})
            </button>
          </div>
        </div>

        {/* Main Body: Left Zone Strip & Right Ward Grid */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
          {/* Left: 15 Zone Navigation List */}
          <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50/70 p-3 overflow-y-auto custom-scrollbar shrink-0 space-y-1.5 max-h-48 lg:max-h-none">
            <div className="px-2 pb-1 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold flex justify-between">
              <span>Administrative Zones</span>
              <span>15 Zones</span>
            </div>

            {GCC_ZONES_METADATA.map((z) => {
              const isSelected = selectedZoneNum === z.zoneNumber;
              return (
                <button
                  key={z.zoneNumber}
                  type="button"
                  onClick={() => setSelectedZoneNum(isSelected ? null : z.zoneNumber)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-2xs ring-1 ring-blue-400/40'
                      : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <div className="space-y-0.5 min-w-0 pr-2">
                    <div className="flex items-center space-x-1.5">
                      <span className={`font-mono text-[10px] font-extrabold px-1.5 py-0.2 rounded ${
                        isSelected ? 'bg-blue-200 text-blue-900' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {z.romanNumber}
                      </span>
                      <span className="font-bold truncate text-slate-900">{z.name}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono truncate">
                      {z.wardRangeDescription}
                    </p>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border shrink-0 ${
                    isSelected ? 'bg-blue-100 border-blue-200 text-blue-800' : 'bg-slate-100 border-slate-200 text-slate-600'
                  }`}>
                    {z.wardCount} Wards
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right: Ward Cards Grid */}
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4 bg-[#f8f9ff]">
            <div className="flex items-center justify-between text-xs text-slate-600 px-1">
              <span>
                Showing <strong className="text-slate-900 font-mono font-bold">{displayedWards.length}</strong> wards
                {selectedZoneNum !== null ? ` in Zone ${GCC_ZONES_METADATA.find((z) => z.zoneNumber === selectedZoneNum)?.romanNumber}` : ''}
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                Click any ward to inspect & prioritize
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {displayedWards.map(({ zone, score }) => {
                const zId = zone.zoneId || zone.id || '';
                const isCurrent = (selectedZoneId === zId) || (selectedZoneId === zone.wardId);
                const band = score.riskBand ?? score.riskLevel;
                const scoreVal = score.totalScore !== null ? score.totalScore.toFixed(0) : '—';
                const lst = zone.metrics.heat.lst.value !== null ? `${zone.metrics.heat.lst.value.toFixed(1)}°C` : 'N/A';
                const ndvi = zone.metrics.vegetation.ndvi.value !== null ? zone.metrics.vegetation.ndvi.value.toFixed(2) : 'N/A';
                const vuln = zone.metrics.vulnerability.vulnerabilityScore.value !== null
                  ? `${Math.round(zone.metrics.vulnerability.vulnerabilityScore.value * 100)}%`
                  : 'N/A';

                return (
                  <div
                    key={zId}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between space-y-3 bg-white shadow-2xs hover:shadow-md ${
                      isCurrent
                        ? 'border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/10'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-start justify-between gap-2 pb-1.5">
                        <div>
                          <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 block font-semibold">
                            {zone.zoneName}
                          </span>
                          <h4 className="font-bold text-sm text-slate-900 tracking-tight leading-snug">
                            {zone.wardName}
                          </h4>
                        </div>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border shrink-0 ${getRiskBadge(
                            band
                          )}`}
                        >
                          {band.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Area & ID */}
                      <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-500 pb-2">
                        <span>{zone.wardId}</span>
                        <span>·</span>
                        <span>{zone.areaKm2 ? `${zone.areaKm2} km²` : 'Area Est.'}</span>
                      </div>

                      {/* Telemetry Chips */}
                      <div className="grid grid-cols-3 gap-1.5 py-1 text-center font-mono">
                        <div className="p-1.5 rounded-lg bg-rose-50/70 border border-rose-100">
                          <span className="text-[9px] text-rose-600 block flex items-center justify-center gap-0.5 font-semibold">
                            <Flame className="w-2.5 h-2.5 text-rose-500" /> LST
                          </span>
                          <span className="text-xs font-bold text-rose-900">{lst}</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-emerald-50/70 border border-emerald-100">
                          <span className="text-[9px] text-emerald-600 block flex items-center justify-center gap-0.5 font-semibold">
                            <Trees className="w-2.5 h-2.5 text-emerald-500" /> NDVI
                          </span>
                          <span className="text-xs font-bold text-emerald-900">{ndvi}</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-blue-50/70 border border-blue-100">
                          <span className="text-[9px] text-blue-600 block flex items-center justify-center gap-0.5 font-semibold">
                            <Users2 className="w-2.5 h-2.5 text-blue-500" /> Vuln
                          </span>
                          <span className="text-xs font-bold text-blue-900">{vuln}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] text-slate-500 font-mono">Score:</span>
                        <span className="text-sm font-bold font-mono text-slate-900">
                          {scoreVal}
                          <span className="text-[10px] text-slate-400 font-normal"> / 100</span>
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onSelectZone(zId);
                          onClose();
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-emerald-700 text-white shadow-sm'
                            : 'bg-[#0b1c30] hover:bg-slate-800 text-white shadow-2xs'
                        }`}
                      >
                        <span>{isCurrent ? 'Active Focus' : 'Focus Ward'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {displayedWards.length === 0 && (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <p className="text-sm font-medium">No wards match your search filter</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedZoneNum(null);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-[#0b1c30] text-white text-xs font-semibold cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Summary */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-600 shrink-0 gap-2">
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              15 Administrative Zones (I to XV)
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              200 Municipal Wards (1 to 200)
            </span>
          </div>

          <p className="text-slate-500 text-[10px] font-mono">
            Greater Chennai Corporation Delimitation Act · GIS Boundary Verification
          </p>
        </div>
      </div>
    </div>
  );
};

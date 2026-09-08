import React, { useState } from 'react';
import {
  Calendar,
  Filter,
  Flame,
  ChevronDown,
  Download,
  Copy,
} from 'lucide-react';
import type { ScoredZoneItem } from './RiskSummaryCards';
import { CardActionMenu } from '../common/CardActionMenu';
import { exportZonesToCsv, copySummaryReport } from '../../utils/exportTelemetry';

interface OverviewChartCardProps {
  scoredZones: ScoredZoneItem[];
  selectedZoneId?: string;
  onSelectZone?: (zoneId: string) => void;
}

export const OverviewChartCard: React.FC<OverviewChartCardProps> = ({
  scoredZones,
  selectedZoneId,
  onSelectZone,
}) => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CRITICAL'>('ALL');
  const [timeRange, setTimeRange] = useState('Summer 2026');

  // Filter valid scored zones
  const completeZones = scoredZones.filter((z) => z.score.totalScore !== null);
  const maxScore = Math.max(...completeZones.map((z) => z.score.totalScore || 0), 88);
  const rankedCount = 7;
  const indicativeCapital = '₹5,04,000';

  // SVG dimensions for multi-curve chart
  const width = 500;
  const height = 180;
  const padding = { top: 20, right: 20, bottom: 30, left: 35 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Generate smooth multi-line data points across zones
  const points = completeZones.map((item, idx) => {
    const x = padding.left + (idx / (completeZones.length - 1 || 1)) * chartW;
    const heatNorm = (item.score.breakdown.heatExposureScore / 50) || 0.5;
    const vegNorm = (item.score.breakdown.vegetationDeficitScore / 20) || 0.5;
    const vulnNorm = (item.score.breakdown.socialVulnerabilityScore / 30) || 0.5;

    return {
      x,
      yHeat: padding.top + chartH * (1 - heatNorm),
      yVeg: padding.top + chartH * (1 - vegNorm),
      yVuln: padding.top + chartH * (1 - vulnNorm),
      zone: item.zone,
      score: item.score,
    };
  });

  const generatePath = (key: 'yHeat' | 'yVeg' | 'yVuln') => {
    if (points.length === 0) return '';
    return points.reduce((acc, pt, i) => {
      if (i === 0) return `M ${pt.x} ${pt[key]}`;
      const prev = points[i - 1];
      const cx1 = prev.x + (pt.x - prev.x) / 2;
      const cy1 = prev[key];
      const cx2 = prev.x + (pt.x - prev.x) / 2;
      const cy2 = pt[key];
      return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${pt.x} ${pt[key]}`;
    }, '');
  };

  const pathHeat = generatePath('yHeat');
  const pathVeg = generatePath('yVeg');
  const pathVuln = generatePath('yVuln');

  return (
    <div className="aero-card aero-card-hover p-4 select-none flex flex-col justify-between h-full">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center space-x-2">
          <div className="h-7 w-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
              Thermal & Vulnerability Overview
            </h4>
          </div>
        </div>

        {/* Dropdowns + More Menu */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setActiveFilter(activeFilter === 'ALL' ? 'CRITICAL' : 'ALL')}
            className="flex items-center space-x-1 px-2 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[10px] text-slate-300 transition-colors cursor-pointer"
          >
            <Filter className="w-2.5 h-2.5 text-blue-400" />
            <span>{activeFilter === 'ALL' ? 'All Wards' : 'Critical Wards'}</span>
            <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
          </button>

          <button
            type="button"
            onClick={() => setTimeRange(timeRange === 'Summer 2026' ? 'Peak Heat' : 'Summer 2026')}
            className="hidden sm:flex items-center space-x-1 px-2 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[10px] text-slate-300 transition-colors cursor-pointer"
          >
            <Calendar className="w-2.5 h-2.5 text-orange-400" />
            <span>{timeRange}</span>
            <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
          </button>

          <CardActionMenu
            title="Overview Telemetry Options"
            items={[
              {
                label: 'Export Telemetry (CSV)',
                icon: Download,
                onClick: () => exportZonesToCsv(scoredZones),
              },
              {
                label: 'Copy Incident Summary',
                icon: Copy,
                onClick: () => copySummaryReport(scoredZones),
              },
              {
                label: 'Focus Hottest Ward (Vyasarpadi)',
                icon: Flame,
                onClick: () => onSelectZone?.('ward-045'),
              },
            ]}
          />
        </div>
      </div>

      {/* Interactive Multi-Line Telemetry Graph */}
      <div className="relative my-2 w-full flex-1 min-h-[140px] overflow-hidden flex items-center justify-center">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
          <defs>
            <linearGradient id="heatAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1].map((lvl) => {
            const y = padding.top + chartH * (1 - lvl);
            return (
              <g key={lvl}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="rgba(255,255,255,0.06)"
                  strokeDasharray="2 3"
                />
                <text
                  x={padding.left - 6}
                  y={y + 3}
                  fill="rgba(255,255,255,0.3)"
                  fontSize="8"
                  textAnchor="end"
                  fontFamily="var(--font-mono)"
                >
                  {(lvl * 100).toFixed(0)}
                </text>
              </g>
            );
          })}

          {/* Area fill for Heat curve */}
          {pathHeat && (
            <path
              d={`${pathHeat} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`}
              fill="url(#heatAreaGrad)"
            />
          )}

          {/* Line 1: Heat Exposure (Cyan) */}
          <path
            d={pathHeat}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2"
            strokeLinecap="round"
            className="drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]"
          />

          {/* Line 2: Vegetation Deficit (Emerald) */}
          <path
            d={pathVeg}
            fill="none"
            stroke="#10b981"
            strokeWidth="1.75"
            strokeLinecap="round"
            className="drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
          />

          {/* Line 3: Social Vulnerability (Amber) */}
          <path
            d={pathVuln}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="1.75"
            strokeLinecap="round"
            className="drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
          />

          {/* Data Points */}
          {points.map((pt) => {
            const zId = pt.zone.zoneId || pt.zone.id;
            const isSelected = selectedZoneId === zId;

            return (
              <g
                key={zId}
                className="cursor-pointer"
                onClick={() => onSelectZone?.(zId || '')}
              >
                {isSelected && (
                  <line
                    x1={pt.x}
                    y1={padding.top}
                    x2={pt.x}
                    y2={padding.top + chartH}
                    stroke="#ffffff"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    opacity="0.5"
                  />
                )}
                <circle
                  cx={pt.x}
                  cy={pt.yHeat}
                  r={isSelected ? 4.5 : 3}
                  fill={isSelected ? '#ffffff' : '#06b6d4'}
                  stroke="#0A0D1A"
                  strokeWidth="1.5"
                  className="transition-all hover:scale-150"
                />
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="absolute top-1 right-2 flex items-center space-x-3 text-[9px] font-mono">
          <div className="flex items-center space-x-1">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            <span className="text-slate-400">Heat Exposure</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-slate-400">Veg Deficit</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span className="text-slate-400">Vulnerability</span>
          </div>
        </div>
      </div>

      {/* 3 Bottom KPI Metrics (Matching Reference Financial Overview) */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/[0.06]">
        <div className="space-y-0.5">
          <span className="text-[10px] text-slate-400 block">Peak Risk Need</span>
          <span className="text-sm font-mono font-extrabold text-rose-400 block tracking-tight">
            {maxScore.toFixed(0)} <span className="text-[10px] font-normal text-slate-400">/ 100</span>
          </span>
        </div>

        <div className="space-y-0.5 border-l border-white/[0.06] pl-3">
          <span className="text-[10px] text-slate-400 block">Ranked Wards</span>
          <span className="text-sm font-mono font-extrabold text-blue-400 block tracking-tight">
            {rankedCount} <span className="text-[10px] font-normal text-slate-400">Candidates</span>
          </span>
        </div>

        <div className="space-y-0.5 border-l border-white/[0.06] pl-3">
          <span className="text-[10px] text-slate-400 block">Planning Capital</span>
          <span className="text-sm font-mono font-extrabold text-emerald-400 block tracking-tight">
            {indicativeCapital}
          </span>
        </div>
      </div>
    </div>
  );
};

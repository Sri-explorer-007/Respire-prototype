import React from 'react';
import type { DataProvenance } from '../../types';

interface ProvenanceBadgeProps {
  status: DataProvenance;
  labelOverride?: string;
  className?: string;
}

export const ProvenanceBadge: React.FC<ProvenanceBadgeProps> = ({
  status,
  labelOverride,
  className = '',
}) => {
  const getBadgeStyle = (prov: DataProvenance) => {
    switch (prov) {
      case 'SOURCED':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25';
      case 'DERIVED':
        return 'bg-sky-500/10 text-sky-300 border-sky-500/25';
      case 'INDICATIVE_ESTIMATE':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/25';
      case 'ASSUMPTION':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/25';
      case 'UNKNOWN':
      default:
        return 'bg-white/[0.04] text-slate-400 border-white/[0.08]';
    }
  };

  const formatText = (prov: DataProvenance) => {
    if (labelOverride) return labelOverride;
    switch (prov) {
      case 'INDICATIVE_ESTIMATE':
        return 'Indicative Estimate';
      case 'ASSUMPTION':
        return 'Assumption';
      case 'SOURCED':
        return 'Sourced';
      case 'DERIVED':
        return 'Derived';
      case 'UNKNOWN':
        return 'Unknown';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border ${getBadgeStyle(
        status
      )} ${className}`}
    >
      {formatText(status)}
    </span>
  );
};

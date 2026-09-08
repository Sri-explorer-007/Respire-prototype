/**
 * RESPIRE - Locked Risk Scoring Configuration & Risk Bands
 * 
 * Final Score Weights (Total = 100%):
 * - Heat Exposure:        50% (Max 50 pts)
 * - Vegetation Deficit:   20% (Max 20 pts)
 * - Social Vulnerability: 30% (Max 30 pts)
 * 
 * Deterministic Risk Bands (0-100 scale):
 * - 0 to 24:   LOW
 * - 25 to 49:  MODERATE
 * - 50 to 74:  HIGH
 * - 75 to 100: VERY_HIGH
 */

export const SCORING_WEIGHTS = {
  heatExposure: 50,
  vegetationDeficit: 20,
  socialVulnerability: 30,
  totalNominal: 100,
} as const;

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH' | 'INSUFFICIENT_DATA' | 'INSUFFICIENT_EVIDENCE';

export interface RiskBandDefinition {
  level: RiskLevel;
  minScore: number;
  maxScore: number;
  label: string;
  description: string;
  badgeStyle: string;
}

export const RISK_BANDS: Record<Exclude<RiskLevel, 'INSUFFICIENT_DATA' | 'INSUFFICIENT_EVIDENCE'>, RiskBandDefinition> = {
  LOW: {
    level: 'LOW',
    minScore: 0,
    maxScore: 24.99,
    label: 'Low Priority Risk',
    description: 'Minimal urban heat exposure or well-buffered canopy/social indicators.',
    badgeStyle: 'bg-emerald-950/70 text-emerald-300 border-emerald-700/60',
  },
  MODERATE: {
    level: 'MODERATE',
    minScore: 25,
    maxScore: 49.99,
    label: 'Moderate Priority Risk',
    description: 'Elevated indicator in at least one category requiring municipal monitoring.',
    badgeStyle: 'bg-blue-950/70 text-blue-300 border-blue-700/60',
  },
  HIGH: {
    level: 'HIGH',
    minScore: 50,
    maxScore: 74.99,
    label: 'High Priority Risk',
    description: 'Substantial heat stress and vulnerability warranting targeted capital allocation.',
    badgeStyle: 'bg-amber-950/70 text-amber-300 border-amber-700/60',
  },
  VERY_HIGH: {
    level: 'VERY_HIGH',
    minScore: 75,
    maxScore: 100,
    label: 'Very High Priority Risk',
    description: 'Acute compound heat, canopy deficit, and social vulnerability requiring immediate mitigation.',
    badgeStyle: 'bg-orange-950/70 text-orange-300 border-orange-600/70',
  },
};

/**
 * Deterministically maps a numeric score (0-100) to a centralized risk band.
 */
export function getRiskLevel(score: number | null): RiskLevel {
  if (score === null || isNaN(score)) {
    return 'INSUFFICIENT_EVIDENCE';
  }

  // Ensure strict bound within 0-100
  const clamped = Math.max(0, Math.min(100, score));

  if (clamped <= RISK_BANDS.LOW.maxScore) {
    return 'LOW';
  }
  if (clamped <= RISK_BANDS.MODERATE.maxScore) {
    return 'MODERATE';
  }
  if (clamped <= RISK_BANDS.HIGH.maxScore) {
    return 'HIGH';
  }
  return 'VERY_HIGH';
}

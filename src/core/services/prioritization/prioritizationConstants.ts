import type { PriorityBand } from '../../types/prioritization';

/**
 * ============================================================================
 * RESPIRE - Centralized Prioritization Constants & Limitations
 * ============================================================================
 * 
 * CORE PRINCIPLE:
 * Transparent, weighted municipal decision-support model combining:
 * - 50% Need (from Risk Score)
 * - 30% Expected Indicative Impact
 * - 20% Indicative Cost-Efficiency
 * 
 * MANDATORY CREDIBILITY LIMITATION NOTICE:
 * Impact and cost-efficiency components are illustrative planning estimates
 * derived from the RESPIRE demo intervention catalogue. They are intended
 * for relative demonstration prioritization only and are not validated
 * scientific effectiveness or ROI estimates.
 * 
 * Do NOT present this prioritization as scientific optimization or empirical proof.
 */

export const PRIORITIZATION_LIMITATION_DISCLAIMER =
  'Impact and cost-efficiency components are illustrative planning estimates derived from the RESPIRE demo intervention catalogue. They are intended for relative demonstration prioritization only and are not validated scientific effectiveness or ROI estimates.';

export const CALCULATION_BASIS =
  'Illustrative planning prioritization using indicative intervention cost and impact estimates.';

export const PRIORITIZATION_WEIGHTS = {
  need: 50,
  impact: 30,
  costEfficiency: 20,
  totalNominal: 100,
} as const;

/**
 * RESPIRE illustrative intervention catalogue normalization reference for indicative impact (°C).
 * Scaling constant derived from the illustrative catalogue's indicative cooling range (0.0°C – 5.0°C).
 * Used solely to normalize localized indicative temperature reduction values into [0.0, 1.0]
 * for relative demonstration prioritization.
 * 
 * CREDIBILITY CONSTRAINT:
 * This reference is strictly a "RESPIRE illustrative intervention catalogue normalization reference".
 * It is NOT a scientific benchmark, industry standard, or validated physical constant.
 */
export const CATALOGUE_IMPACT_NORMALIZATION_REFERENCE = 5.0;

/**
 * RESPIRE illustrative intervention catalogue normalization reference for indicative cost (INR).
 * Scaling reference derived from the illustrative catalogue cost magnitude (₹5,000 reference scale).
 * Used solely to scale indicative expenditure into relative cost-efficiency ratios without
 * extreme numerical distortions.
 * 
 * CREDIBILITY CONSTRAINT:
 * This reference is strictly a "RESPIRE illustrative intervention catalogue normalization reference".
 * It is NOT a validated cost benchmark, industry standard, or public procurement schedule of rates.
 */
export const CATALOGUE_COST_NORMALIZATION_REFERENCE = 5000;

// Backwards compatibility aliases
export const BENCHMARK_MAX_IMPACT = CATALOGUE_IMPACT_NORMALIZATION_REFERENCE;
export const BENCHMARK_COST_SCALE = CATALOGUE_COST_NORMALIZATION_REFERENCE;

/**
 * Standardized Priority Bands matching the RESPIRE framework:
 * 0–24   = LOW
 * 25–49  = MODERATE
 * 50–74  = HIGH
 * 75–100 = VERY_HIGH
 */
export const PRIORITY_BANDS: Record<
  'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH',
  { min: number; max: number; label: PriorityBand }
> = {
  LOW: { min: 0, max: 24.99, label: 'LOW' },
  MODERATE: { min: 25, max: 49.99, label: 'MODERATE' },
  HIGH: { min: 50, max: 74.99, label: 'HIGH' },
  VERY_HIGH: { min: 75, max: 100, label: 'VERY_HIGH' },
};

/**
 * Resolves a 0-100 priority score to a transparent PriorityBand.
 * Returns 'INSUFFICIENT_EVIDENCE' when the score is null or NaN.
 */
export function getPriorityBand(score: number | null): PriorityBand {
  if (score === null || isNaN(score)) {
    return 'INSUFFICIENT_EVIDENCE';
  }
  if (score >= PRIORITY_BANDS.VERY_HIGH.min) return 'VERY_HIGH';
  if (score >= PRIORITY_BANDS.HIGH.min) return 'HIGH';
  if (score >= PRIORITY_BANDS.MODERATE.min) return 'MODERATE';
  return 'LOW';
}

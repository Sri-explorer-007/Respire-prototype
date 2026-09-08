import type { ZoneMetrics, RiskScoreResult, ScoreBreakdown } from '../../types';

/**
 * Interface contract for RESPIRE Explainable Risk Scoring Engine.
 * Must calculate transparent priority scores (0-100) using:
 * Heat Exposure (50%), Vegetation Deficit (20%), Social Vulnerability (30%).
 * 
 * Note: Decoupled from UI and data source layers. Algorithm implementation in subsequent step.
 */
export interface IScoringEngine {
  calculateScore(zoneId: string, metrics: ZoneMetrics): RiskScoreResult;
  calculateBreakdown(metrics: ZoneMetrics): ScoreBreakdown;
  normalizeMetrics(metrics: ZoneMetrics): {
    heatExposure: number | null;
    vegetationDeficit: number | null;
    socialVulnerability: number | null;
  };
}

import type { Zone, RiskScoreResult, RecommendationResult } from '../../types';

/**
 * Interface contract for RESPIRE Rule-Based Explainable Recommendation Engine.
 * Must map risk factors to interventions:
 * - High heat + low vegetation -> Targeted shade / tree canopy
 * - High heat + dense built environment -> Cool-roof intervention
 * - High heat + outdoor-worker exposure -> Shaded cooling / rest area
 * - Moderate heat + low vegetation -> Targeted greening
 * - Insufficient evidence -> No confident recommendation
 * 
 * Note: Decoupled from UI and data source layers. Rule evaluation implementation in subsequent step.
 */
export interface IRecommendationEngine {
  generateRecommendations(zone: Zone, riskScore: RiskScoreResult): RecommendationResult;
}

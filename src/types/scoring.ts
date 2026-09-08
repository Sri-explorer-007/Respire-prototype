import type { RiskLevel } from '../core/scoring/scoringConfig';

/**
 * RESPIRE - Locked Scoring Model Definition
 * 
 * Weights (Total 100%):
 * - Heat Exposure:        50% (Max 50 pts)
 * - Vegetation Deficit:   20% (Max 20 pts)
 * - Social Vulnerability: 30% (Max 30 pts)
 * 
 * Resulting score: 0 to 100
 */

export interface ScoreWeights {
  heatExposureWeight: 0.50;
  vegetationDeficitWeight: 0.20;
  socialVulnerabilityWeight: 0.30;
}

export const LOCKED_SCORE_WEIGHTS: ScoreWeights = {
  heatExposureWeight: 0.50,
  vegetationDeficitWeight: 0.20,
  socialVulnerabilityWeight: 0.30,
};

export type ScoringComponentKey = 'heat' | 'vegetation' | 'vulnerability';

export type ScoringConfidence = 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';

export interface ComponentContribution {
  componentKey: ScoringComponentKey;
  label: string;
  normalizedValue: number | null;
  nominalWeight: number;
  effectiveWeight: number;
  scoreContribution: number | null;
  percentageOfComponentMax: number | null; // 0-100%
  isMissing: boolean;
}

export interface WhyThisZoneAnalysis {
  primaryDriver: string | null;
  secondaryDriver: string | null;
  componentContributions: ComponentContribution[];
  missingEvidence: string[];
  riskLevel: RiskLevel;
  priorityRationale: string;
}

export interface ScoreBreakdown {
  heatExposureScore: number;       // Scaled contribution (e.g. 0 to 50 when all available)
  vegetationDeficitScore: number;  // Scaled contribution (e.g. 0 to 20)
  socialVulnerabilityScore: number; // Scaled contribution (e.g. 0 to 30)
}

/**
 * Comprehensive Explainable Risk Score Result
 */
export interface RiskScoreResult {
  zoneId: string;
  
  // Core Score Outputs (0–100 or null if zero evidence)
  totalScore: number | null;
  heatScore: number | null;
  vegetationScore: number | null;
  vulnerabilityScore: number | null;

  // Weight Allocations
  heatWeight: number;          // Nominal: 50
  vegetationWeight: number;    // Nominal: 20
  vulnerabilityWeight: number; // Nominal: 30
  availableWeight: number;     // Sum of weights for available components

  // Incomplete Data & Confidence Tracking
  missingComponents: ScoringComponentKey[];
  confidence: ScoringConfidence;
  completeness: number;        // 0.0 to 1.0 (availableWeight / 100)
  riskLevel: RiskLevel;
  riskBand?: RiskLevel;
  riskScore?: number | null;

  // Human-Readable Explainability
  explanation: string;
  whyThisZone: WhyThisZoneAnalysis;

  // Backward-compatibility aliases
  totalPriorityScore: number;
  breakdown: ScoreBreakdown;
  normalizedInputs: {
    heatExposure: number | null;
    vegetationDeficit: number | null;
    socialVulnerability: number | null;
  };
  hasIncompleteData?: boolean;
  calculatedAt: string;
  explanationSummary: string;
}

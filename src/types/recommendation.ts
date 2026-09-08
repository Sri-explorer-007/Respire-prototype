import type { Intervention, InterventionCategory } from './intervention';
import type { DataProvenanceMetadata, DataProvenanceStatus } from './provenance';

export type RecommendationConfidence = 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';

/**
 * Inspection detail for an individual metric condition evaluated by a rule.
 */
export interface MatchedCondition {
  indicator: string;
  operator: '>=' | '<=' | '>' | '<' | '==' | '!=';
  threshold: number;
  actualValue: number | null;
  description: string;
  isSatisfied: boolean;
}

/**
 * An intervention item recommended by the engine, enriched with rule matching details,
 * provenance, and human-readable explanation.
 */
export interface RecommendedInterventionItem {
  interventionId: string;
  interventionName: string;
  category: InterventionCategory;
  description: string;
  ruleId: string;
  rulePriority: number; // 1 = Highest priority
  reason: string;
  matchedConditions: MatchedCondition[];
  
  // Cost contract (with provenance)
  cost: number | null;
  costUnit: string;
  costStatus: DataProvenanceStatus;
  
  // Impact contract (with provenance)
  impact: number | null;
  impactUnit: string;
  impactStatus: DataProvenanceStatus;
  
  // Evidence & Transparency
  evidenceReference?: string;
  assumptions: string[];
}

/**
 * Explainability model supporting the "WHY THIS ACTION?" UI card.
 */
export interface WhyThisActionAnalysis {
  headline: string;
  checkpoints: string[]; // e.g. ["✓ High heat exposure (0.90 >= 0.70)", "✓ Low vegetation (0.88 >= 0.65)"]
  recommendedAction: string;
  reason: string;
  assumptionsNotice: string;
}

/**
 * Backwards-compatible structure for existing trigger metrics
 */
export interface TriggerMetricSummary {
  name: string;
  value: string;
  threshold: string;
}

export interface RecommendationExplanation {
  primaryDriver: string;
  justification: string;
  triggerMetrics: TriggerMetricSummary[];
}

/**
 * Strongly typed recommendation engine result for a zone.
 */
export interface RecommendationResult {
  id: string;
  targetZoneId: string;
  zoneId: string; // compatibility alias for targetZoneId
  zoneName: string;
  
  primaryRecommendation: RecommendedInterventionItem | null;
  secondaryRecommendations: RecommendedInterventionItem[];
  
  hasConfidentRecommendation: boolean;
  confidence: RecommendationConfidence;
  
  matchedRules: string[];
  missingEvidence: string[];
  
  whyThisAction: WhyThisActionAnalysis;
  reason: string;
  
  // Backwards compatibility aliases
  recommendedInterventions: Intervention[];
  explanation: RecommendationExplanation;
  evidenceStatus?: DataProvenanceMetadata;
  calculatedAt: string;
}

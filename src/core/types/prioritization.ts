import type { InterventionCategory } from '../../types/intervention';
import type { DataProvenanceStatus } from '../../types/provenance';
import type { RiskLevel } from '../scoring/scoringConfig';

export type PriorityBand = 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH' | 'INSUFFICIENT_EVIDENCE';
export type PrioritizationConfidence = 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';

/**
 * Breakdown of the individual components contributing to the priority score.
 */
export interface PrioritizationBreakdown {
  needScore: number | null;            // 0.0 to 1.0
  impactScore: number | null;          // 0.0 to 1.0
  costEfficiencyScore: number | null;  // 0.0 to 1.0
  effectiveNeedWeight: number;        // e.g. 50 (or rescaled)
  effectiveImpactWeight: number;      // e.g. 30 (or rescaled)
  effectiveCostEfficiencyWeight: number; // e.g. 20 (or rescaled)
}

/**
 * Full provenance record for the prioritization decision.
 */
export interface PrioritizationProvenance {
  costStatus: DataProvenanceStatus;
  impactStatus: DataProvenanceStatus;
  evidenceReference?: string;
  assumptions: string[];
  datasetLabel: string;
}

/**
 * Strongly typed prioritized intervention entry for a zone.
 */
export interface InterventionPriority {
  // Zone identifiers
  zoneId: string;
  zoneName: string;
  wardId?: string;
  wardName?: string;

  // Upstream Risk Context
  riskScore: number | null;
  riskBand: RiskLevel | 'INSUFFICIENT_DATA';

  // Recommended Intervention Details
  interventionId: string;
  interventionName: string;
  interventionType: InterventionCategory;
  category: InterventionCategory; // Alias for interventionType

  // Indicative Cost & Impact
  indicativeCost: number | null;
  costUnit: string;
  indicativeImpact: number | null;
  impactUnit: string;

  // Prioritization Evaluation
  priorityScore: number | null; // 0 to 100 or null if insufficient evidence
  rank: number | null;          // 1, 2, 3... or null if insufficient evidence
  priorityBand: PriorityBand;
  priorityStatus: PriorityBand; // Alias for priorityBand

  // Explainability, Transparency & Credibility Notice
  calculationBasis: string;
  explanation: string;
  breakdown: PrioritizationBreakdown;
  provenance: PrioritizationProvenance;
  completeness: number;         // 0.0 to 1.0
  confidence: PrioritizationConfidence;
  missingFields: string[];
}

/**
 * Complete collection result returned by the prioritization engine.
 */
export interface PrioritizationResult {
  rankedPriorities: InterventionPriority[];
  unrankedPriorities: InterventionPriority[]; // Zones with INSUFFICIENT_EVIDENCE
  totalZonesEvaluated: number;
  evaluationsWithConfidentPriority: number;
  evaluationsWithInsufficientEvidence: number;
  calculationBasis: string;
  calculatedAt: string;
}

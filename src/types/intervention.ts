import type { DataProvenanceStatus } from './provenance';

export type InterventionCategory =
  | 'COOL_ROOF'
  | 'TARGETED_SHADE_CANOPY'
  | 'COOLING_REST_STATION'
  | 'URBAN_GREENING'
  | 'INSUFFICIENT_EVIDENCE';

export interface ApplicabilityCondition {
  metricKey: 'heat.lst' | 'heat.lstNormalized' | 'vegetation.ndvi' | 'vegetation.vegetationDeficitNormalized' | 'vulnerability.vulnerabilityScore';
  operator: '>' | '>=' | '<' | '<=' | '==';
  threshold: number;
  description: string;
}

/**
 * Strongly typed Intervention data model.
 * 
 * Fields strictly support:
 * - interventionId
 * - interventionName
 * - category
 * - description
 * - applicabilityConditions
 * - cost
 * - costUnit
 * - costStatus (SOURCED, DERIVED, INDICATIVE_ESTIMATE, ASSUMPTION, UNKNOWN)
 * - impact
 * - impactUnit
 * - impactStatus (SOURCED, DERIVED, INDICATIVE_ESTIMATE, ASSUMPTION, UNKNOWN)
 * - evidenceReference
 * - assumptions
 */
export interface Intervention {
  interventionId: string;
  interventionName: string;
  category: InterventionCategory;
  description: string;
  applicabilityConditions: ApplicabilityCondition[];

  // Cost
  cost: number | null; // Nullable if unknown
  costUnit: string;    // e.g. "INR / sq.m", "INR / tree", "INR / facility"
  costStatus: DataProvenanceStatus; // Must be 'INDICATIVE_ESTIMATE' for demo planning values

  // Impact
  impact: number | null; // Nullable expected localized temperature reduction or index benefit
  impactUnit: string;    // e.g. "°C surface temp reduction", "°C ambient temp reduction"
  impactStatus: DataProvenanceStatus; // Must be 'INDICATIVE_ESTIMATE' or 'ASSUMPTION' for demo

  // Evidence & Transparency
  evidenceReference?: string;
  assumptions: string[];

  // Backwards compatibility alias
  id?: string;
  title?: string;
}

import type { InterventionCategory } from '../../types';

/**
 * ============================================================================
 * RESPIRE - Centralized Recommendation Engine Thresholds & Rule Configuration
 * ============================================================================
 * 
 * CORE PRINCIPLE:
 * These thresholds are configurable municipal decision-support assumptions
 * operating on normalized domain values [0.0 - 1.0].
 * They DO NOT claim to be immutable empirical scientific constants; rather,
 * they represent policy and planning triggers calibrated for urban cooling
 * intervention prioritization.
 */

// ----------------------------------------------------------------------------
// Named Decision-Support Thresholds (Configurable Assumptions)
// ----------------------------------------------------------------------------

/**
 * High Heat Threshold (Normalized LST >= 0.70).
 * Indicates significant thermal stress requiring active cooling interventions.
 */
export const HIGH_HEAT_THRESHOLD = 0.70;

/**
 * Moderate Heat Threshold (Normalized LST >= 0.45).
 * Indicates elevated temperatures where ecological or passive cooling is beneficial.
 */
export const MODERATE_HEAT_THRESHOLD = 0.45;

/**
 * Low Vegetation Threshold (Normalized Vegetation Deficit >= 0.65).
 * Represents severe tree canopy deficit or high non-vegetated fraction.
 */
export const LOW_VEGETATION_THRESHOLD = 0.65;

/**
 * Significant Vegetation Deficit Threshold (Normalized Deficit >= 0.60).
 * Trigger for pocket greening and permeable bioswale programs.
 */
export const SIGNIFICANT_VEGETATION_DEFICIT_THRESHOLD = 0.60;

/**
 * High Social Vulnerability Threshold (Normalized Score >= 0.70).
 * Identifies wards with heightened socioeconomic susceptibility to heat illness.
 */
export const HIGH_VULNERABILITY_THRESHOLD = 0.70;

/**
 * High Outdoor Worker Exposure Ratio (Ratio >= 0.40).
 * Identifies wards with heavy concentration of street vendors, construction,
 * transport, delivery, or daily wage outdoor laborers.
 */
export const HIGH_OUTDOOR_WORKER_THRESHOLD = 0.40;

/**
 * High Built Environment Density Threshold (Normalized Index >= 0.70).
 * Reflects high impervious surface fraction, dense building geometry,
 * or population density >= 20,000 persons / km².
 */
export const HIGH_BUILT_ENVIRONMENT_THRESHOLD = 0.70;

// ----------------------------------------------------------------------------
// Rule IDs & Deterministic Priorities
// ----------------------------------------------------------------------------

export const RULE_IDS = {
  WORKER_COOLING_STATION: 'RULE_WORKER_COOLING_STATION',
  COOL_ROOF: 'RULE_COOL_ROOF',
  TARGETED_SHADE_CANOPY: 'RULE_TARGETED_SHADE_CANOPY',
  URBAN_GREENING: 'RULE_URBAN_GREENING',
  INSUFFICIENT_EVIDENCE: 'RULE_INSUFFICIENT_EVIDENCE',
} as const;

export type RuleId = (typeof RULE_IDS)[keyof typeof RULE_IDS];

export interface RecommendationRuleDefinition {
  ruleId: RuleId;
  rulePriority: number; // 1 = Highest precedence
  ruleName: string;
  category: InterventionCategory;
  defaultInterventionId: string;
  description: string;
  rationaleTemplate: string;
}

/**
 * Centralized, inspectable recommendation rules list in deterministic priority order:
 * 
 * 1. High heat + outdoor worker exposure -> Modular Outdoor Worker Cooling & Hydration
 * 2. High heat + dense built environment  -> Cool Roof coating
 * 3. High heat + low vegetation           -> Targeted Shade Tree Canopy
 * 4. Moderate/high heat + vegetation deficit -> Urban Pocket Greening
 */
export const RECOMMENDATION_RULES: RecommendationRuleDefinition[] = [
  {
    ruleId: RULE_IDS.WORKER_COOLING_STATION,
    rulePriority: 1,
    ruleName: 'Outdoor Worker Thermal Relief Protocol',
    category: 'COOLING_REST_STATION',
    defaultInterventionId: 'int-worker-rest-03',
    description: 'High heat exposure coincides with elevated outdoor-worker concentration.',
    rationaleTemplate:
      'Recommended because elevated heat exposure ({heat}) coincides with high outdoor-worker exposure ({worker}), creating urgent acute occupational heat risk.',
  },
  {
    ruleId: RULE_IDS.COOL_ROOF,
    rulePriority: 2,
    ruleName: 'Dense Built-Fabric Solar Reflectance Protocol',
    category: 'COOL_ROOF',
    defaultInterventionId: 'int-cool-roof-01',
    description: 'High heat exposure occurs within a dense built environment or unshaded roof corridor.',
    rationaleTemplate:
      'Recommended because high heat exposure ({heat}) occurs in a dense built environment ({built}), where high building thermal mass and solar gain exacerbate night-time heat retention.',
  },
  {
    ruleId: RULE_IDS.TARGETED_SHADE_CANOPY,
    rulePriority: 3,
    ruleName: 'Arterial Corridor Shade Canopy Protocol',
    category: 'TARGETED_SHADE_CANOPY',
    defaultInterventionId: 'int-shade-canopy-02',
    description: 'High heat exposure coincides with severe vegetation and canopy deficit.',
    rationaleTemplate:
      'Recommended because the zone has high heat exposure ({heat}) and a significant vegetation deficit ({vegDeficit}), making targeted tree canopy shading a high-impact long-term intervention.',
  },
  {
    ruleId: RULE_IDS.URBAN_GREENING,
    rulePriority: 4,
    ruleName: 'Urban Pocket Greening & Micro-Oasis Protocol',
    category: 'URBAN_GREENING',
    defaultInterventionId: 'int-urban-greening-04',
    description: 'Moderate to high heat coincides with localized vegetation deficit.',
    rationaleTemplate:
      'Recommended because moderate heat exposure ({heat}) combines with significant vegetation deficit ({vegDeficit}), suitable for localized pocket greening and permeable bioswales.',
  },
];

/**
 * Fallback Definition when evidence is missing or insufficient.
 */
export const INSUFFICIENT_EVIDENCE_RULE: RecommendationRuleDefinition = {
  ruleId: RULE_IDS.INSUFFICIENT_EVIDENCE,
  rulePriority: 99,
  ruleName: 'Ground-Truth Verification Protocol',
  category: 'INSUFFICIENT_EVIDENCE',
  defaultInterventionId: 'int-insufficient-data-05',
  description: 'Evidence is incomplete or missing, precluding confident intervention recommendation.',
  rationaleTemplate:
    'Insufficient heat or environmental evidence to confidently select a targeted intervention.',
};

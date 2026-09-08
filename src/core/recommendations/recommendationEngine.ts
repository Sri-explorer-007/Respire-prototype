import type {
  Zone,
  RiskScoreResult,
  Intervention,
  RecommendationResult,
  RecommendedInterventionItem,
  MatchedCondition,
  WhyThisActionAnalysis,
  RecommendationConfidence,
} from '../../types';
import { ILLUSTRATIVE_INTERVENTIONS } from '../../data/interventions/interventionsData';
import { respireScoringEngine } from '../scoring/scoringEngine';
import {
  HIGH_HEAT_THRESHOLD,
  MODERATE_HEAT_THRESHOLD,
  LOW_VEGETATION_THRESHOLD,
  SIGNIFICANT_VEGETATION_DEFICIT_THRESHOLD,
  HIGH_OUTDOOR_WORKER_THRESHOLD,
  HIGH_BUILT_ENVIRONMENT_THRESHOLD,
  RECOMMENDATION_RULES,
  RULE_IDS,
  type RecommendationRuleDefinition,
} from './recommendationConfig';
import type { IRecommendationEngine } from './recommendationEngine.interface';

/**
 * Normalized indicator extraction container with missing data safety.
 */
export interface ExtractedIndicators {
  lstNormalized: number | null;
  vegetationDeficitNormalized: number | null;
  vulnerabilityScore: number | null;
  outdoorWorkerExposure: number | null;
  builtEnvironment: number | null;
  missingEvidence: string[];
}

/**
 * RESPIRE Explainable Intervention Recommendation Engine
 * 
 * Domain-level, deterministic, rule-based recommendation engine.
 * Inspects granular zone indicators to determine suitable cooling interventions
 * and produces transparent, human-readable explanations.
 * 
 * Free of React, DOM, AI/ML, and external network dependencies.
 */
export class RespireRecommendationEngine implements IRecommendationEngine {
  private readonly interventionCatalog: Map<string, Intervention>;

  constructor(catalog: Intervention[] = ILLUSTRATIVE_INTERVENTIONS) {
    this.interventionCatalog = new Map();
    catalog.forEach((item) => {
      this.interventionCatalog.set(item.interventionId, item);
      if (item.id) {
        this.interventionCatalog.set(item.id, item);
      }
    });
  }

  /**
   * Safely extracts indicators from zone metrics, strictly preserving nulls.
   */
  public extractIndicators(zone: Zone): ExtractedIndicators {
    const missingEvidence: string[] = [];

    // 1. Heat exposure
    const lstNormalized = zone.metrics?.heat?.lstNormalized?.value ?? null;
    if (lstNormalized === null) {
      missingEvidence.push('Land Surface Temperature (LST)');
    }

    // 2. Vegetation deficit
    const vegetationDeficitNormalized = zone.metrics?.vegetation?.vegetationDeficitNormalized?.value ?? null;
    if (vegetationDeficitNormalized === null) {
      missingEvidence.push('Vegetation Deficit (NDVI)');
    }

    // 3. Vulnerability score
    const vulnerabilityScore = zone.metrics?.vulnerability?.vulnerabilityScore?.value ?? null;
    if (vulnerabilityScore === null) {
      missingEvidence.push('Social Vulnerability Index');
    }

    // 4. Outdoor worker exposure
    const components = zone.metrics?.vulnerability?.vulnerabilityComponents;
    const outdoorWorkerExposure =
      components?.outdoorWorkerExposureRatio?.value ??
      components?.outdoorWorkerExposure?.value ??
      null;

    if (outdoorWorkerExposure === null) {
      missingEvidence.push('Outdoor Worker Exposure Ratio');
    }

    // 5. Built environment density proxy
    let builtEnvironment: number | null = null;
    if (components?.builtEnvironmentIndicator?.value !== undefined && components?.builtEnvironmentIndicator?.value !== null) {
      builtEnvironment = components.builtEnvironmentIndicator.value;
    } else if (components?.builtEnvironmentDensity?.value !== undefined && components?.builtEnvironmentDensity?.value !== null) {
      builtEnvironment = components.builtEnvironmentDensity.value;
    } else if (components?.populationDensityPerKm2?.value !== undefined && components?.populationDensityPerKm2?.value !== null) {
      // Benchmark: 28,000+ per km² in old city core is high density (normalized to 1.0 at 30,000)
      builtEnvironment = Number(Math.min(1.0, components.populationDensityPerKm2.value / 30000).toFixed(2));
    } else if (components?.informalSettlementIndicator?.value !== undefined && components?.informalSettlementIndicator?.value !== null) {
      // Informal settlement ratio >= 0.35 indicates dense compact roofing
      builtEnvironment = Number(Math.min(1.0, components.informalSettlementIndicator.value * 2.0).toFixed(2));
    }

    if (builtEnvironment === null) {
      missingEvidence.push('Built Environment & Roof Density');
    }

    return {
      lstNormalized,
      vegetationDeficitNormalized,
      vulnerabilityScore,
      outdoorWorkerExposure,
      builtEnvironment,
      missingEvidence,
    };
  }

  /**
   * Evaluates conditions for a specific rule against extracted indicators.
   * STRICT SAFETY: If any required indicator is null, the rule evaluates to false.
   */
  private evaluateRuleConditions(
    rule: RecommendationRuleDefinition,
    indicators: ExtractedIndicators
  ): { isMatch: boolean; conditions: MatchedCondition[]; reason: string } {
    const { lstNormalized, vegetationDeficitNormalized, outdoorWorkerExposure, builtEnvironment } = indicators;
    const conditions: MatchedCondition[] = [];

    switch (rule.ruleId) {
      case RULE_IDS.WORKER_COOLING_STATION: {
        const heatCond: MatchedCondition = {
          indicator: 'heat.lstNormalized',
          operator: '>=',
          threshold: HIGH_HEAT_THRESHOLD,
          actualValue: lstNormalized,
          description: 'Severe heat exposure threshold',
          isSatisfied: lstNormalized !== null && lstNormalized >= HIGH_HEAT_THRESHOLD,
        };
        const workerCond: MatchedCondition = {
          indicator: 'vulnerability.outdoorWorkerExposure',
          operator: '>=',
          threshold: HIGH_OUTDOOR_WORKER_THRESHOLD,
          actualValue: outdoorWorkerExposure,
          description: 'Elevated outdoor worker exposure',
          isSatisfied: outdoorWorkerExposure !== null && outdoorWorkerExposure >= HIGH_OUTDOOR_WORKER_THRESHOLD,
        };

        conditions.push(heatCond, workerCond);
        const isMatch = heatCond.isSatisfied && workerCond.isSatisfied;
        const reason = isMatch
          ? `Recommended because high heat exposure (${lstNormalized?.toFixed(2)}) coincides with elevated outdoor-worker exposure (${outdoorWorkerExposure?.toFixed(2)}), creating severe acute occupational heat stress.`
          : 'Conditions for outdoor worker cooling station were not fully satisfied.';

        return { isMatch, conditions, reason };
      }

      case RULE_IDS.COOL_ROOF: {
        const heatCond: MatchedCondition = {
          indicator: 'heat.lstNormalized',
          operator: '>=',
          threshold: HIGH_HEAT_THRESHOLD,
          actualValue: lstNormalized,
          description: 'High surface heat exposure',
          isSatisfied: lstNormalized !== null && lstNormalized >= HIGH_HEAT_THRESHOLD,
        };
        const builtCond: MatchedCondition = {
          indicator: 'vulnerability.builtEnvironment',
          operator: '>=',
          threshold: HIGH_BUILT_ENVIRONMENT_THRESHOLD,
          actualValue: builtEnvironment,
          description: 'Dense built environment or high compact roof fraction',
          isSatisfied: builtEnvironment !== null && builtEnvironment >= HIGH_BUILT_ENVIRONMENT_THRESHOLD,
        };

        conditions.push(heatCond, builtCond);
        const isMatch = heatCond.isSatisfied && builtCond.isSatisfied;
        const reason = isMatch
          ? `Recommended because high heat exposure (${lstNormalized?.toFixed(2)}) occurs in a dense built environment (${builtEnvironment?.toFixed(2)}), where high solar absorption on roofs drives thermal buildup.`
          : 'Conditions for cool roof treatment were not fully satisfied.';

        return { isMatch, conditions, reason };
      }

      case RULE_IDS.TARGETED_SHADE_CANOPY: {
        const heatCond: MatchedCondition = {
          indicator: 'heat.lstNormalized',
          operator: '>=',
          threshold: HIGH_HEAT_THRESHOLD,
          actualValue: lstNormalized,
          description: 'High surface heat exposure',
          isSatisfied: lstNormalized !== null && lstNormalized >= HIGH_HEAT_THRESHOLD,
        };
        const vegCond: MatchedCondition = {
          indicator: 'vegetation.vegetationDeficitNormalized',
          operator: '>=',
          threshold: LOW_VEGETATION_THRESHOLD,
          actualValue: vegetationDeficitNormalized,
          description: 'Severe canopy and vegetation deficit',
          isSatisfied: vegetationDeficitNormalized !== null && vegetationDeficitNormalized >= LOW_VEGETATION_THRESHOLD,
        };

        conditions.push(heatCond, vegCond);
        const isMatch = heatCond.isSatisfied && vegCond.isSatisfied;
        const reason = isMatch
          ? `Recommended because the zone has high heat exposure (${lstNormalized?.toFixed(2)}) and a significant vegetation deficit (${vegetationDeficitNormalized?.toFixed(2)}), making targeted shade tree canopy a critical intervention.`
          : 'Conditions for targeted shade canopy were not fully satisfied.';

        return { isMatch, conditions, reason };
      }

      case RULE_IDS.URBAN_GREENING: {
        const heatCond: MatchedCondition = {
          indicator: 'heat.lstNormalized',
          operator: '>=',
          threshold: MODERATE_HEAT_THRESHOLD,
          actualValue: lstNormalized,
          description: 'Moderate to high heat exposure',
          isSatisfied: lstNormalized !== null && lstNormalized >= MODERATE_HEAT_THRESHOLD,
        };
        const vegCond: MatchedCondition = {
          indicator: 'vegetation.vegetationDeficitNormalized',
          operator: '>=',
          threshold: SIGNIFICANT_VEGETATION_DEFICIT_THRESHOLD,
          actualValue: vegetationDeficitNormalized,
          description: 'Significant localized vegetation deficit',
          isSatisfied: vegetationDeficitNormalized !== null && vegetationDeficitNormalized >= SIGNIFICANT_VEGETATION_DEFICIT_THRESHOLD,
        };

        conditions.push(heatCond, vegCond);
        const isMatch = heatCond.isSatisfied && vegCond.isSatisfied;
        const reason = isMatch
          ? `Recommended because moderate heat exposure (${lstNormalized?.toFixed(2)}) combines with significant vegetation deficit (${vegetationDeficitNormalized?.toFixed(2)}), suitable for localized pocket greening.`
          : 'Conditions for urban greening were not fully satisfied.';

        return { isMatch, conditions, reason };
      }

      default:
        return { isMatch: false, conditions: [], reason: 'Unknown rule.' };
    }
  }

  /**
   * Hydrates a rule match into a typed RecommendedInterventionItem.
   */
  private buildRecommendedItem(
    rule: RecommendationRuleDefinition,
    conditions: MatchedCondition[],
    reason: string
  ): RecommendedInterventionItem {
    const catalogItem = this.interventionCatalog.get(rule.defaultInterventionId);

    return {
      interventionId: rule.defaultInterventionId,
      interventionName: catalogItem?.interventionName ?? rule.ruleName,
      category: rule.category,
      description: catalogItem?.description ?? rule.description,
      ruleId: rule.ruleId,
      rulePriority: rule.rulePriority,
      reason,
      matchedConditions: conditions,
      cost: catalogItem?.cost ?? null,
      costUnit: catalogItem?.costUnit ?? 'INR / unit (Indicative planning estimate)',
      costStatus: catalogItem?.costStatus ?? 'INDICATIVE_ESTIMATE',
      impact: catalogItem?.impact ?? null,
      impactUnit: catalogItem?.impactUnit ?? '°C cooling (Indicative planning estimate)',
      impactStatus: catalogItem?.impactStatus ?? 'INDICATIVE_ESTIMATE',
      evidenceReference: catalogItem?.evidenceReference,
      assumptions: catalogItem?.assumptions ?? [
        'Indicative planning estimate based on municipal benchmark models',
        'Detailed engineering survey required prior to budget appropriation',
      ],
    };
  }

  /**
   * Main recommendation generation function.
   */
  public generateRecommendations(
    zone: Zone,
    riskScore?: RiskScoreResult,
    documentedDate?: string
  ): RecommendationResult {
    const zoneId = zone.zoneId || zone.id || 'unknown-zone';
    const zoneName = zone.zoneName || zone.name || zoneId;

    // Use existing scoring engine if score was not provided
    const score = riskScore ?? respireScoringEngine.calculateScore(zoneId, zone.metrics);

    // Extract zone indicators with missing data safety
    const indicators = this.extractIndicators(zone);

    // Evaluate all rules deterministically
    const matchedItems: RecommendedInterventionItem[] = [];
    const matchedRuleIds: string[] = [];

    for (const rule of RECOMMENDATION_RULES) {
      const { isMatch, conditions, reason } = this.evaluateRuleConditions(rule, indicators);
      if (isMatch) {
        matchedItems.push(this.buildRecommendedItem(rule, conditions, reason));
        matchedRuleIds.push(rule.ruleId);
      }
    }

    // Sort matching interventions deterministically by rule priority (1 = highest)
    matchedItems.sort((a, b) => a.rulePriority - b.rulePriority);

    const hasConfidentRecommendation = matchedItems.length > 0;
    const primaryRecommendation = hasConfidentRecommendation ? matchedItems[0] : null;
    const secondaryRecommendations = hasConfidentRecommendation ? matchedItems.slice(1) : [];

    // Determine confidence based on data completeness and provenance
    const confidence = this.determineConfidence(indicators, hasConfidentRecommendation);

    // Format "Why This Action?" explainability analysis
    const whyThisAction = this.buildWhyThisActionAnalysis(
      zoneName,
      indicators,
      score,
      primaryRecommendation,
      hasConfidentRecommendation
    );

    // Backwards-compatible structure
    const recommendedInterventions: Intervention[] = matchedItems.map((item) => {
      const cat = this.interventionCatalog.get(item.interventionId);
      return cat ?? {
        interventionId: item.interventionId,
        interventionName: item.interventionName,
        category: item.category,
        description: item.description,
        applicabilityConditions: [],
        cost: item.cost,
        costUnit: item.costUnit,
        costStatus: item.costStatus,
        impact: item.impact,
        impactUnit: item.impactUnit,
        impactStatus: item.impactStatus,
        evidenceReference: item.evidenceReference,
        assumptions: item.assumptions,
        id: item.interventionId,
        title: item.interventionName,
      };
    });

    const triggerMetrics = primaryRecommendation
      ? primaryRecommendation.matchedConditions.map((c) => ({
          name: c.indicator,
          value: c.actualValue !== null ? c.actualValue.toFixed(2) : 'null',
          threshold: `${c.operator} ${c.threshold}`,
        }))
      : [];

    let overallReason: string;
    if (primaryRecommendation) {
      overallReason = primaryRecommendation.reason;
    } else if (indicators.lstNormalized === null) {
      overallReason = 'Insufficient heat or environmental evidence to confidently select a targeted intervention: missing Land Surface Temperature (LST).';
    } else if (indicators.vegetationDeficitNormalized === null) {
      overallReason = 'Insufficient heat or environmental evidence to confidently select a targeted intervention: missing Vegetation Deficit (NDVI).';
    } else {
      overallReason = 'Observed zone conditions fall below actionable intervention thresholds (heat and vegetation deficit are within acceptable ranges). No targeted cooling intervention required at this time.';
    }

    return {
      id: `rec-${zoneId}-${documentedDate || 'active'}`,
      targetZoneId: zoneId,
      zoneId,
      zoneName,
      primaryRecommendation,
      secondaryRecommendations,
      hasConfidentRecommendation,
      confidence,
      matchedRules: matchedRuleIds,
      missingEvidence: indicators.missingEvidence,
      whyThisAction,
      reason: overallReason,
      recommendedInterventions,
      explanation: {
        primaryDriver: primaryRecommendation?.ruleId ?? 'INSUFFICIENT_DATA',
        justification: overallReason,
        triggerMetrics,
      },
      calculatedAt: documentedDate || new Date().toISOString(),
    };
  }

  /**
   * Constructs the structured "WHY THIS ACTION?" UI explainability block.
   */
  private buildWhyThisActionAnalysis(
    zoneName: string,
    indicators: ExtractedIndicators,
    score: RiskScoreResult,
    primary: RecommendedInterventionItem | null,
    hasConfidentRecommendation: boolean
  ): WhyThisActionAnalysis {
    if (!hasConfidentRecommendation || !primary) {
      const isMissingHeat = indicators.lstNormalized === null;
      const isMissingVeg = indicators.vegetationDeficitNormalized === null;

      const checkpoints: string[] = [];
      if (isMissingHeat) checkpoints.push('✗ Land Surface Temperature (LST) is missing or occluded');
      if (isMissingVeg) checkpoints.push('✗ Vegetation index (NDVI) is missing or occluded');
      if (!isMissingHeat && !isMissingVeg) {
        checkpoints.push(`✓ Heat exposure within normal threshold (${indicators.lstNormalized?.toFixed(2)} < ${HIGH_HEAT_THRESHOLD})`);
        checkpoints.push(`✓ Adequate vegetation canopy (${indicators.vegetationDeficitNormalized?.toFixed(2)} deficit)`);
      }

      return {
        headline: `No Confident Intervention Warranted for ${zoneName}`,
        checkpoints,
        recommendedAction: isMissingHeat || isMissingVeg
          ? 'Ground-Truth Thermal & Field Audit Required (Field Inspection)'
          : 'Routine Ecological Monitoring & Canopy Preservation',
        reason: isMissingHeat || isMissingVeg
          ? 'Insufficient heat or environmental evidence to confidently select a targeted intervention.'
          : 'Zone conditions currently maintain acceptable thermal and vegetative balances below active intervention triggers.',
        assumptionsNotice:
          'Decision-Support Notice: All recommendations require verification against local ward conditions.',
      };
    }

    // Build checkpoints from matched conditions
    const checkpoints: string[] = [];
    if (indicators.lstNormalized !== null && indicators.lstNormalized >= HIGH_HEAT_THRESHOLD) {
      checkpoints.push(`✓ High heat exposure (${indicators.lstNormalized.toFixed(2)} >= ${HIGH_HEAT_THRESHOLD})`);
    } else if (indicators.lstNormalized !== null && indicators.lstNormalized >= MODERATE_HEAT_THRESHOLD) {
      checkpoints.push(`✓ Moderate heat exposure (${indicators.lstNormalized.toFixed(2)} >= ${MODERATE_HEAT_THRESHOLD})`);
    }

    if (indicators.vegetationDeficitNormalized !== null && indicators.vegetationDeficitNormalized >= LOW_VEGETATION_THRESHOLD) {
      checkpoints.push(`✓ Low vegetation / severe canopy deficit (${indicators.vegetationDeficitNormalized.toFixed(2)} >= ${LOW_VEGETATION_THRESHOLD})`);
    } else if (indicators.vegetationDeficitNormalized !== null && indicators.vegetationDeficitNormalized >= SIGNIFICANT_VEGETATION_DEFICIT_THRESHOLD) {
      checkpoints.push(`✓ Significant vegetation deficit (${indicators.vegetationDeficitNormalized.toFixed(2)} >= ${SIGNIFICANT_VEGETATION_DEFICIT_THRESHOLD})`);
    }

    if (indicators.outdoorWorkerExposure !== null && indicators.outdoorWorkerExposure >= HIGH_OUTDOOR_WORKER_THRESHOLD) {
      checkpoints.push(`✓ High outdoor worker exposure (${indicators.outdoorWorkerExposure.toFixed(2)} >= ${HIGH_OUTDOOR_WORKER_THRESHOLD})`);
    }

    if (indicators.builtEnvironment !== null && indicators.builtEnvironment >= HIGH_BUILT_ENVIRONMENT_THRESHOLD) {
      checkpoints.push(`✓ Dense built environment / compact roof area (${indicators.builtEnvironment.toFixed(2)} >= ${HIGH_BUILT_ENVIRONMENT_THRESHOLD})`);
    }

    if (score.totalScore !== null) {
      checkpoints.push(`✓ Risk priority tier: ${score.riskLevel} (${score.totalScore.toFixed(1)}/100)`);
    }

    return {
      headline: `Why This Action: ${primary.interventionName}`,
      checkpoints,
      recommendedAction: primary.interventionName,
      reason: primary.reason,
      assumptionsNotice:
        'Indicative Planning Notice: Cost and temperature impacts are indicative benchmarks and must be field-verified before municipal contracting.',
    };
  }

  /**
   * Qualitative confidence assessment based on evidence availability.
   */
  private determineConfidence(
    indicators: ExtractedIndicators,
    hasConfidentRecommendation: boolean
  ): RecommendationConfidence {
    if (!hasConfidentRecommendation) {
      return 'NONE';
    }

    if (indicators.lstNormalized === null || indicators.vegetationDeficitNormalized === null) {
      return 'NONE';
    }

    if (indicators.missingEvidence.length > 1) {
      return 'LOW';
    }

    if (indicators.missingEvidence.length === 1) {
      return 'MEDIUM';
    }

    return 'HIGH';
  }
}

// Singleton instance for application use
export const respireRecommendationEngine = new RespireRecommendationEngine();

import type {
  Zone,
  RiskScoreResult,
  RecommendedInterventionItem,
  InterventionPriority,
  PrioritizationResult,
  PrioritizationBreakdown,
  PrioritizationConfidence,
  PriorityBand,
} from '../../../types';
import { respireScoringEngine } from '../../scoring/scoringEngine';
import { respireRecommendationEngine } from '../../recommendations/recommendationEngine';
import {
  PRIORITIZATION_WEIGHTS,
  CATALOGUE_IMPACT_NORMALIZATION_REFERENCE,
  CATALOGUE_COST_NORMALIZATION_REFERENCE,
  PRIORITIZATION_LIMITATION_DISCLAIMER,
  CALCULATION_BASIS,
  getPriorityBand,
} from './prioritizationConstants';

/**
 * RESPIRE Municipal Cost + Impact Prioritization Engine
 * 
 * Domain-level, deterministic, zero-dependency prioritization engine.
 * Ranks recommended interventions using a transparent decision-support model:
 * - 50% Need (Risk Score)
 * - 30% Expected Indicative Impact
 * - 20% Indicative Cost-Efficiency
 * 
 * CREDIBILITY LIMITATION:
 * Impact and cost-efficiency components are illustrative planning estimates
 * derived from the RESPIRE demo intervention catalogue. They are intended
 * for relative demonstration prioritization only and are not validated
 * scientific effectiveness or ROI estimates.
 */
export class RespirePrioritizationEngine {
  /**
   * Prioritizes a single zone's recommended intervention.
   */
  public prioritizeZone(
    zone: Zone,
    recommendation?: RecommendedInterventionItem | null,
    riskScore?: RiskScoreResult | null
  ): InterventionPriority {
    const zoneId = zone.zoneId || zone.id || 'unknown-zone';
    const zoneName = zone.zoneName || zone.name || zoneId;

    // 1. Resolve upstream Risk Score
    const score = riskScore !== undefined
      ? riskScore
      : respireScoringEngine.calculateScore(zoneId, zone.metrics);

    // 2. Resolve upstream Recommendation
    let rec = recommendation;
    if (rec === undefined) {
      const recResult = respireRecommendationEngine.generateRecommendations(zone, score ?? undefined);
      rec = recResult.primaryRecommendation;
    }

    const missingFields: string[] = [];

    // Track missing inputs using standardized codes
    if (!score || score.totalScore === null) {
      missingFields.push('RISK_SCORE');
    }
    if (!rec || rec.impact === null) {
      missingFields.push('INDICATIVE_IMPACT');
    }
    if (!rec || rec.cost === null) {
      missingFields.push('INDICATIVE_COST');
    }
    if (
      !rec ||
      rec.cost === null ||
      rec.impact === null ||
      !score ||
      score.totalScore === null
    ) {
      missingFields.push('INDICATIVE_COST_EFFICIENCY');
    }

    // 3. Fallback: If riskScore is missing OR no target intervention is recommended
    if (!score || score.totalScore === null || !rec || rec.category === 'INSUFFICIENT_EVIDENCE') {
      const breakdown: PrioritizationBreakdown = {
        needScore: score?.totalScore !== null && score?.totalScore !== undefined ? Number((score.totalScore / 100).toFixed(2)) : null,
        impactScore: null,
        costEfficiencyScore: null,
        effectiveNeedWeight: 0,
        effectiveImpactWeight: 0,
        effectiveCostEfficiencyWeight: 0,
      };

      const explanation = !score || score.totalScore === null
        ? `Zone ${zoneName} has insufficient heat, vegetation, or vulnerability evidence to establish a relative municipal planning priority.`
        : `Zone ${zoneName} does not currently have an active targeted cooling intervention recommended; relative municipal planning priority cannot be assigned without an intervention.`;

      return {
        zoneId,
        zoneName,
        wardId: zone.wardId,
        wardName: zone.wardName,
        riskScore: score?.totalScore ?? null,
        riskBand: score?.riskLevel ?? 'INSUFFICIENT_DATA',
        interventionId: rec?.interventionId ?? 'int-insufficient-data-05',
        interventionName: rec?.interventionName ?? 'Ground-Truth Verification Required',
        interventionType: rec?.category ?? 'INSUFFICIENT_EVIDENCE',
        category: rec?.category ?? 'INSUFFICIENT_EVIDENCE',
        indicativeCost: rec?.cost ?? null,
        costUnit: rec?.costUnit ?? 'Pending field survey scoping',
        indicativeImpact: rec?.impact ?? null,
        impactUnit: rec?.impactUnit ?? 'Pending measurement',
        priorityScore: null,
        rank: null,
        priorityBand: 'INSUFFICIENT_EVIDENCE',
        priorityStatus: 'INSUFFICIENT_EVIDENCE',
        calculationBasis: CALCULATION_BASIS,
        explanation,
        breakdown,
        provenance: {
          costStatus: rec?.costStatus ?? 'UNKNOWN',
          impactStatus: rec?.impactStatus ?? 'UNKNOWN',
          evidenceReference: rec?.evidenceReference,
          assumptions: [
            ...(rec?.assumptions ?? []),
            PRIORITIZATION_LIMITATION_DISCLAIMER,
          ],
          datasetLabel: zone.dataSourceLabel || 'Illustrative Demo Data',
        },
        completeness: 0,
        confidence: 'NONE',
        missingFields,
      };
    }

    // 4. Calculate Normalized Components
    // A. Need Component (0.0 - 1.0)
    const needScore = Math.max(0, Math.min(1.0, score.totalScore / 100));

    // B. Impact Component (0.0 - 1.0 relative to RESPIRE illustrative catalogue reference)
    let impactScore: number | null = null;
    if (rec && rec.impact !== null && !isNaN(rec.impact)) {
      impactScore = Math.max(0, Math.min(1.0, rec.impact / CATALOGUE_IMPACT_NORMALIZATION_REFERENCE));
    }

    // C. Cost-Efficiency Component (0.0 - 1.0 relative to RESPIRE illustrative catalogue reference)
    let costEfficiencyScore: number | null = null;
    if (
      impactScore !== null &&
      rec &&
      rec.cost !== null &&
      !isNaN(rec.cost) &&
      rec.cost > 0
    ) {
      const normalizedCost = Math.max(0.05, Math.min(1.0, rec.cost / CATALOGUE_COST_NORMALIZATION_REFERENCE));
      const rawEfficiency = impactScore / normalizedCost;
      // Clamped to [0.0, 1.0] to prevent extreme numerical distortions in relative ranking
      costEfficiencyScore = Math.max(0, Math.min(1.0, rawEfficiency / 2.0));
    }

    // 5. Weight Rescaling for Missing Components
    let availableWeight = 0;
    if (needScore !== null) availableWeight += PRIORITIZATION_WEIGHTS.need;
    if (impactScore !== null) availableWeight += PRIORITIZATION_WEIGHTS.impact;
    if (costEfficiencyScore !== null) availableWeight += PRIORITIZATION_WEIGHTS.costEfficiency;

    let priorityScore: number | null = null;
    let priorityBand: PriorityBand = 'INSUFFICIENT_EVIDENCE';

    if (availableWeight > 0) {
      const rawWeightedSum =
        (needScore ?? 0) * PRIORITIZATION_WEIGHTS.need +
        (impactScore ?? 0) * PRIORITIZATION_WEIGHTS.impact +
        (costEfficiencyScore ?? 0) * PRIORITIZATION_WEIGHTS.costEfficiency;

      const scaledScore = (rawWeightedSum / availableWeight) * 100;
      priorityScore = Math.round(Math.max(0, Math.min(100, scaledScore)));
      priorityBand = getPriorityBand(priorityScore);
    }

    const scaleFactor = availableWeight > 0 ? 100 / availableWeight : 0;
    const effectiveNeedWeight = Number((PRIORITIZATION_WEIGHTS.need * scaleFactor).toFixed(1));
    const effectiveImpactWeight = impactScore !== null ? Number((PRIORITIZATION_WEIGHTS.impact * scaleFactor).toFixed(1)) : 0;
    const effectiveCostEfficiencyWeight = costEfficiencyScore !== null ? Number((PRIORITIZATION_WEIGHTS.costEfficiency * scaleFactor).toFixed(1)) : 0;

    const breakdown: PrioritizationBreakdown = {
      needScore: Number(needScore.toFixed(2)),
      impactScore: impactScore !== null ? Number(impactScore.toFixed(2)) : null,
      costEfficiencyScore: costEfficiencyScore !== null ? Number(costEfficiencyScore.toFixed(2)) : null,
      effectiveNeedWeight,
      effectiveImpactWeight,
      effectiveCostEfficiencyWeight,
    };

    const completeness = Number((availableWeight / PRIORITIZATION_WEIGHTS.totalNominal).toFixed(2));
    const confidence: PrioritizationConfidence = determineConfidence(completeness, priorityScore);

    // 6. Generate Human-Readable Explanation adhering to relative planning terminology
    const explanation = generateExplanation(
      zoneName,
      priorityScore,
      priorityBand,
      score.totalScore,
      rec,
      costEfficiencyScore,
      missingFields
    );

    return {
      zoneId,
      zoneName,
      wardId: zone.wardId,
      wardName: zone.wardName,
      riskScore: score.totalScore,
      riskBand: score.riskLevel,
      interventionId: rec?.interventionId ?? 'int-none',
      interventionName: rec?.interventionName ?? 'No Action Specified',
      interventionType: rec?.category ?? 'INSUFFICIENT_EVIDENCE',
      category: rec?.category ?? 'INSUFFICIENT_EVIDENCE',
      indicativeCost: rec?.cost ?? null,
      costUnit: rec?.costUnit ?? 'INR / unit (Indicative planning estimate)',
      indicativeImpact: rec?.impact ?? null,
      impactUnit: rec?.impactUnit ?? '°C cooling (Indicative planning estimate)',
      priorityScore,
      rank: null, // Assigned during batch ranking
      priorityBand,
      priorityStatus: priorityBand,
      calculationBasis: CALCULATION_BASIS,
      explanation,
      breakdown,
      provenance: {
        costStatus: rec?.costStatus ?? 'UNKNOWN',
        impactStatus: rec?.impactStatus ?? 'UNKNOWN',
        evidenceReference: rec?.evidenceReference,
        assumptions: [
          ...(rec?.assumptions ?? []),
          PRIORITIZATION_LIMITATION_DISCLAIMER,
        ],
        datasetLabel: zone.dataSourceLabel || 'Illustrative Demo Data',
      },
      completeness,
      confidence,
      missingFields,
    };
  }

  /**
   * Prioritizes and ranks interventions across multiple zones deterministically.
   */
  public prioritizeZones(
    zones: Zone[],
    options?: { documentedDate?: string }
  ): PrioritizationResult {
    const evaluated: InterventionPriority[] = zones.map((zone) => this.prioritizeZone(zone));

    // Separate valid priorities from insufficient evidence
    const valid = evaluated.filter((p) => p.priorityScore !== null);
    const unranked = evaluated.filter((p) => p.priorityScore === null);

    // Deterministic ranking tie-break order:
    // 1. Higher priorityScore descending
    // 2. Higher riskScore descending
    // 3. Zone ID ascending (alphabetical)
    valid.sort((a, b) => {
      if ((b.priorityScore ?? 0) !== (a.priorityScore ?? 0)) {
        return (b.priorityScore ?? 0) - (a.priorityScore ?? 0);
      }
      if ((b.riskScore ?? 0) !== (a.riskScore ?? 0)) {
        return (b.riskScore ?? 0) - (a.riskScore ?? 0);
      }
      return a.zoneId.localeCompare(b.zoneId);
    });

    // Assign 1-indexed ranks
    valid.forEach((item, index) => {
      item.rank = index + 1;
    });

    unranked.forEach((item) => {
      item.rank = null;
    });

    return {
      rankedPriorities: valid,
      unrankedPriorities: unranked,
      totalZonesEvaluated: zones.length,
      evaluationsWithConfidentPriority: valid.length,
      evaluationsWithInsufficientEvidence: unranked.length,
      calculationBasis: CALCULATION_BASIS,
      calculatedAt: options?.documentedDate || new Date().toISOString(),
    };
  }
}

// ----------------------------------------------------------------------------
// Helper Functions
// ----------------------------------------------------------------------------

function determineConfidence(
  completeness: number,
  priorityScore: number | null
): PrioritizationConfidence {
  if (priorityScore === null || completeness === 0) return 'NONE';
  if (completeness >= 1.0) return 'HIGH';
  if (completeness >= 0.70) return 'MEDIUM';
  return 'LOW';
}

/**
 * Generates an auditable natural language explanation for the relative prioritization result.
 */
function generateExplanation(
  zoneName: string,
  priorityScore: number | null,
  priorityBand: PriorityBand,
  riskScore: number | null,
  rec: RecommendedInterventionItem | null | undefined,
  costEfficiencyScore: number | null,
  missing: string[]
): string {
  if (priorityScore === null) {
    return `Zone ${zoneName} has insufficient risk or environmental data to establish a confident relative planning priority.`;
  }

  const parts: string[] = [];
  if (riskScore !== null) {
    parts.push(`risk urgency (${riskScore.toFixed(1)}/100)`);
  }
  if (rec && rec.impact !== null) {
    parts.push(`an indicative impact estimate of ${rec.impact}°C contributing to the planning score`);
  }
  if (costEfficiencyScore !== null) {
    parts.push('an indicative cost-efficiency estimate contributing to the relative ranking');
  }

  let text = `Assigned ${priorityBand} relative planning priority (${priorityScore}/100) based on ${parts.join(', ')}.`;

  if (missing.length > 0) {
    const readableMissing = missing.map((m) => {
      switch (m) {
        case 'RISK_SCORE': return 'Risk Score';
        case 'INDICATIVE_IMPACT': return 'Indicative Impact';
        case 'INDICATIVE_COST': return 'Indicative Cost';
        case 'INDICATIVE_COST_EFFICIENCY': return 'Indicative Cost-Efficiency';
        default: return m;
      }
    });
    text += ` Caution: Missing ${readableMissing.join(' and ')}; available priority weights were rescaled for this illustrative planning comparison.`;
  }

  return text;
}

// Singleton instance
export const respirePrioritizationEngine = new RespirePrioritizationEngine();

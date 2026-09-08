import type {
  ZoneMetrics,
  RiskScoreResult,
  ScoreBreakdown,
  ScoringComponentKey,
  ScoringConfidence,
  ComponentContribution,
  WhyThisZoneAnalysis,
} from '../../types';
import { SCORING_WEIGHTS, getRiskLevel, type RiskLevel } from './scoringConfig';
import type { IScoringEngine } from './scoringEngine.interface';

export class InvalidNormalizedValueError extends Error {
  constructor(component: string, value: any) {
    super(
      `Invalid normalized value for ${component}: expected a numeric value between 0.0 and 1.0 or null, received ${value}`
    );
    this.name = 'InvalidNormalizedValueError';
  }
}

/**
 * Validates that an input is strictly within [0.0, 1.0] or null.
 */
function validateNormalizedInput(componentName: string, value: number | null): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value !== 'number' || isNaN(value) || value < 0.0 || value > 1.0) {
    throw new InvalidNormalizedValueError(componentName, value);
  }
  return value;
}

/**
 * RESPIRE Explainable Risk Scoring Engine
 * 
 * Domain-level, deterministic, zero-dependency scoring engine.
 * Converts raw/normalized zone metrics into a 0-100 priority score with full breakdown.
 */
export class RespireScoringEngine implements IScoringEngine {
  /**
   * Normalizes and extracts scoring metrics, validating boundaries.
   */
  normalizeMetrics(metrics: ZoneMetrics): {
    heatExposure: number | null;
    vegetationDeficit: number | null;
    socialVulnerability: number | null;
  } {
    const heat = validateNormalizedInput(
      'heat.lstNormalized',
      metrics.heat?.lstNormalized?.value ?? null
    );
    const vegetation = validateNormalizedInput(
      'vegetation.vegetationDeficitNormalized',
      metrics.vegetation?.vegetationDeficitNormalized?.value ?? null
    );
    const vulnerability = validateNormalizedInput(
      'vulnerability.vulnerabilityScore',
      metrics.vulnerability?.vulnerabilityScore?.value ?? null
    );

    return {
      heatExposure: heat,
      vegetationDeficit: vegetation,
      socialVulnerability: vulnerability,
    };
  }

  /**
   * Calculates the nominal score breakdown.
   */
  calculateBreakdown(metrics: ZoneMetrics): ScoreBreakdown {
    const norm = this.normalizeMetrics(metrics);
    return {
      heatExposureScore: norm.heatExposure !== null ? Number((norm.heatExposure * SCORING_WEIGHTS.heatExposure).toFixed(1)) : 0,
      vegetationDeficitScore: norm.vegetationDeficit !== null ? Number((norm.vegetationDeficit * SCORING_WEIGHTS.vegetationDeficit).toFixed(1)) : 0,
      socialVulnerabilityScore: norm.socialVulnerability !== null ? Number((norm.socialVulnerability * SCORING_WEIGHTS.socialVulnerability).toFixed(1)) : 0,
    };
  }

  /**
   * Main scoring calculation implementing proportional rescaling for missing data.
   */
  calculateScore(zoneId: string, metrics: ZoneMetrics, documentedDate?: string): RiskScoreResult {
    const norm = this.normalizeMetrics(metrics);

    // 1. Identify missing and available components
    const missingComponents: ScoringComponentKey[] = [];
    if (norm.heatExposure === null) missingComponents.push('heat');
    if (norm.vegetationDeficit === null) missingComponents.push('vegetation');
    if (norm.socialVulnerability === null) missingComponents.push('vulnerability');

    let availableWeight = 0;
    if (norm.heatExposure !== null) availableWeight += SCORING_WEIGHTS.heatExposure;
    if (norm.vegetationDeficit !== null) availableWeight += SCORING_WEIGHTS.vegetationDeficit;
    if (norm.socialVulnerability !== null) availableWeight += SCORING_WEIGHTS.socialVulnerability;

    const completeness = Number((availableWeight / SCORING_WEIGHTS.totalNominal).toFixed(2));

    // 2. Case: All components missing OR primary physical heat/vegetation evidence missing
    // An urban heat resilience risk score cannot be produced if both heat exposure and vegetation
    // deficit are unavailable (e.g. Sholinganallur with 30% completeness from social vulnerability alone).
    if (availableWeight === 0 || (norm.heatExposure === null && norm.vegetationDeficit === null)) {
      const isCompletelyEmpty = availableWeight === 0;
      const missingEvidence: string[] = [];
      if (norm.heatExposure === null) missingEvidence.push('Land Surface Temperature (LST)');
      if (norm.vegetationDeficit === null) missingEvidence.push('NDVI Vegetation Deficit');
      if (norm.socialVulnerability === null) missingEvidence.push('Social Vulnerability Index');

      const whyThisZone: WhyThisZoneAnalysis = {
        primaryDriver: null,
        secondaryDriver: null,
        componentContributions: [
          createComponentContribution('heat', 'Heat Exposure', null, 50, 0, null),
          createComponentContribution('vegetation', 'Vegetation Deficit', null, 20, 0, null),
          createComponentContribution(
            'vulnerability',
            'Social Vulnerability',
            norm.socialVulnerability,
            30,
            norm.socialVulnerability !== null ? 30 : 0,
            null
          ),
        ],
        missingEvidence,
        riskLevel: isCompletelyEmpty ? 'INSUFFICIENT_DATA' : 'INSUFFICIENT_EVIDENCE',
        priorityRationale: isCompletelyEmpty
          ? 'All indicators are missing or occluded. Scoring cannot proceed without evidence.'
          : 'Insufficient heat and vegetation indicators. An urban heat priority score cannot be produced solely from social vulnerability metrics.',
      };

      const explanation = isCompletelyEmpty
        ? 'All scoring indicators (heat, vegetation, and vulnerability) are unavailable. A confident risk score cannot be produced.'
        : `Physical heat exposure (LST) and vegetation deficit (NDVI) indicators are unavailable for this zone. An urban heat priority score cannot be produced solely from social vulnerability data (data completeness: ${Math.round(completeness * 100)}%).`;

      return {
        zoneId,
        totalScore: null,
        riskScore: null,
        heatScore: null,
        vegetationScore: null,
        vulnerabilityScore: null,
        heatWeight: SCORING_WEIGHTS.heatExposure,
        vegetationWeight: SCORING_WEIGHTS.vegetationDeficit,
        vulnerabilityWeight: SCORING_WEIGHTS.socialVulnerability,
        availableWeight,
        missingComponents,
        confidence: isCompletelyEmpty ? 'NONE' : determineConfidence(metrics, completeness),
        completeness,
        riskLevel: isCompletelyEmpty ? 'INSUFFICIENT_DATA' : 'INSUFFICIENT_EVIDENCE',
        riskBand: 'INSUFFICIENT_EVIDENCE',
        explanation,
        whyThisZone,
        totalPriorityScore: 0,
        breakdown: { heatExposureScore: 0, vegetationDeficitScore: 0, socialVulnerabilityScore: 0 },
        normalizedInputs: norm,
        hasIncompleteData: true,
        calculatedAt: documentedDate || new Date().toISOString(),
        explanationSummary: explanation,
      };
    }

    // 3. Proportional weight rescaling
    // Raw points achieved from available indicators
    const rawHeat = norm.heatExposure !== null ? norm.heatExposure * SCORING_WEIGHTS.heatExposure : 0;
    const rawVeg = norm.vegetationDeficit !== null ? norm.vegetationDeficit * SCORING_WEIGHTS.vegetationDeficit : 0;
    const rawVuln = norm.socialVulnerability !== null ? norm.socialVulnerability * SCORING_WEIGHTS.socialVulnerability : 0;
    const rawSum = rawHeat + rawVeg + rawVuln;

    // Rescale proportionally to 100-point total
    const totalScore = Number(((rawSum / availableWeight) * 100).toFixed(1));

    // Rescaled component contributions representing their share of the 100-point score
    const scaleFactor = 100 / availableWeight;
    const heatScore = norm.heatExposure !== null ? Number((rawHeat * scaleFactor).toFixed(1)) : null;
    const vegetationScore = norm.vegetationDeficit !== null ? Number((rawVeg * scaleFactor).toFixed(1)) : null;
    const vulnerabilityScore = norm.socialVulnerability !== null ? Number((rawVuln * scaleFactor).toFixed(1)) : null;

    // Effective weights allocated to each component in the 100-point score
    const effectiveHeatWeight = norm.heatExposure !== null ? Number((SCORING_WEIGHTS.heatExposure * scaleFactor).toFixed(1)) : 0;
    const effectiveVegWeight = norm.vegetationDeficit !== null ? Number((SCORING_WEIGHTS.vegetationDeficit * scaleFactor).toFixed(1)) : 0;
    const effectiveVulnWeight = norm.socialVulnerability !== null ? Number((SCORING_WEIGHTS.socialVulnerability * scaleFactor).toFixed(1)) : 0;

    // 4. Assess qualitative confidence based on completeness and provenance
    const confidence = determineConfidence(metrics, completeness);
    const riskLevel: RiskLevel = getRiskLevel(totalScore);

    // 5. Structure Driver Analysis ("Why this zone?")
    const contributions: ComponentContribution[] = [
      createComponentContribution('heat', 'Heat Exposure', norm.heatExposure, SCORING_WEIGHTS.heatExposure, effectiveHeatWeight, heatScore),
      createComponentContribution('vegetation', 'Vegetation Deficit', norm.vegetationDeficit, SCORING_WEIGHTS.vegetationDeficit, effectiveVegWeight, vegetationScore),
      createComponentContribution('vulnerability', 'Social Vulnerability', norm.socialVulnerability, SCORING_WEIGHTS.socialVulnerability, effectiveVulnWeight, vulnerabilityScore),
    ];

    // Determine primary and secondary drivers by normalized severity
    const sortedAvailable = contributions
      .filter((c) => !c.isMissing && c.normalizedValue !== null)
      .sort((a, b) => (b.normalizedValue ?? 0) - (a.normalizedValue ?? 0));

    const primaryDriver = sortedAvailable.length > 0 ? formatDriver(sortedAvailable[0]) : null;
    const secondaryDriver = sortedAvailable.length > 1 ? formatDriver(sortedAvailable[1]) : null;

    const missingEvidenceLabels = missingComponents.map((k) => {
      switch (k) {
        case 'heat':
          return 'Land Surface Temperature (LST)';
        case 'vegetation':
          return 'NDVI Vegetation Deficit';
        case 'vulnerability':
          return 'Social Vulnerability Index';
      }
    });

    const priorityRationale = generatePriorityRationale(
      totalScore,
      riskLevel,
      primaryDriver,
      secondaryDriver,
      missingComponents.length > 0
    );

    const whyThisZone: WhyThisZoneAnalysis = {
      primaryDriver,
      secondaryDriver,
      componentContributions: contributions,
      missingEvidence: missingEvidenceLabels,
      riskLevel,
      priorityRationale,
    };

    // 6. Generate human-readable explanation
    const explanation = generateExplanation(
      totalScore,
      riskLevel,
      heatScore,
      vegetationScore,
      vulnerabilityScore,
      effectiveHeatWeight,
      effectiveVegWeight,
      effectiveVulnWeight,
      missingComponents,
      confidence
    );

    return {
      zoneId,
      totalScore,
      riskScore: totalScore,
      heatScore,
      vegetationScore,
      vulnerabilityScore,
      heatWeight: SCORING_WEIGHTS.heatExposure,
      vegetationWeight: SCORING_WEIGHTS.vegetationDeficit,
      vulnerabilityWeight: SCORING_WEIGHTS.socialVulnerability,
      availableWeight,
      missingComponents,
      confidence,
      completeness,
      riskLevel,
      riskBand: riskLevel,
      explanation,
      whyThisZone,
      totalPriorityScore: totalScore,
      breakdown: {
        heatExposureScore: heatScore ?? 0,
        vegetationDeficitScore: vegetationScore ?? 0,
        socialVulnerabilityScore: vulnerabilityScore ?? 0,
      },
      normalizedInputs: norm,
      hasIncompleteData: missingComponents.length > 0,
      calculatedAt: documentedDate || new Date().toISOString(),
      explanationSummary: explanation,
    };
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function createComponentContribution(
  key: ScoringComponentKey,
  label: string,
  normalizedValue: number | null,
  nominalWeight: number,
  effectiveWeight: number,
  scoreContribution: number | null
): ComponentContribution {
  return {
    componentKey: key,
    label,
    normalizedValue,
    nominalWeight,
    effectiveWeight,
    scoreContribution,
    percentageOfComponentMax: normalizedValue !== null ? Number((normalizedValue * 100).toFixed(1)) : null,
    isMissing: normalizedValue === null,
  };
}

function determineConfidence(metrics: ZoneMetrics, completeness: number): ScoringConfidence {
  if (completeness === 0) return 'NONE';
  if (completeness < 1.0) return 'LOW';

  // Check if any source relies on Assumption or Indicative demo data
  const statuses = [
    metrics.heat?.lst?.metadata?.status,
    metrics.vegetation?.ndvi?.metadata?.status,
    metrics.vulnerability?.vulnerabilityScore?.metadata?.status,
  ];

  const hasAssumptionsOrEstimates = statuses.some(
    (s) => s === 'ASSUMPTION' || s === 'INDICATIVE_ESTIMATE' || s === 'UNKNOWN'
  );

  return hasAssumptionsOrEstimates ? 'MEDIUM' : 'HIGH';
}

function formatDriver(comp: ComponentContribution): string {
  const pct = comp.normalizedValue !== null ? Math.round(comp.normalizedValue * 100) : 0;
  return `${comp.label} (${pct}% severity)`;
}

function generatePriorityRationale(
  score: number,
  riskLevel: RiskLevel,
  primary: string | null,
  secondary: string | null,
  isIncomplete: boolean
): string {
  let rationale = `Zone designated as ${riskLevel} priority (${score}/100)`;
  if (primary) {
    rationale += ` driven predominantly by ${primary}`;
  }
  if (secondary) {
    rationale += `, followed by ${secondary}`;
  }
  if (isIncomplete) {
    rationale += `. Caution: Result calculated with missing indicators.`;
  }
  return rationale;
}

function generateExplanation(
  totalScore: number,
  riskLevel: RiskLevel,
  heatScore: number | null,
  vegScore: number | null,
  vulnScore: number | null,
  effectiveHeatWeight: number,
  effectiveVegWeight: number,
  effectiveVulnWeight: number,
  missing: ScoringComponentKey[],
  confidence: ScoringConfidence
): string {
  if (missing.length === 0) {
    return (
      `Priority score: ${totalScore}/100 (${riskLevel}). ` +
      `Heat exposure contributed ${heatScore}/${effectiveHeatWeight} pts. ` +
      `Vegetation deficit contributed ${vegScore}/${effectiveVegWeight} pts. ` +
      `Social vulnerability contributed ${vulnScore}/${effectiveVulnWeight} pts.`
    );
  }

  const missingNames = missing.map((m) => (m === 'heat' ? 'Heat' : m === 'vegetation' ? 'Vegetation' : 'Vulnerability')).join(' & ');

  const activeParts: string[] = [];
  if (heatScore !== null) activeParts.push(`heat exposure (${heatScore}/${effectiveHeatWeight} pts)`);
  if (vegScore !== null) activeParts.push(`vegetation deficit (${vegScore}/${effectiveVegWeight} pts)`);
  if (vulnScore !== null) activeParts.push(`social vulnerability (${vulnScore}/${effectiveVulnWeight} pts)`);

  return (
    `${missingNames} indicator data is unavailable. ` +
    `The priority score (${totalScore}/100, ${riskLevel}) was rescaled proportionally using available ` +
    `${activeParts.join(' and ')}. ` +
    `Confidence is ${confidence} due to incomplete evidence.`
  );
}

// Singleton instance for general use
export const respireScoringEngine = new RespireScoringEngine();

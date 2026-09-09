import type { Zone, RiskScoreResult, RecommendedInterventionItem } from '../../../../types';
import { CHENNAI_DEMO_ZONES } from '../../../../data/demo/chennaiDemoData';
import { respirePrioritizationEngine } from '../prioritizationEngine';
import {
  getPriorityBand,
  PRIORITIZATION_WEIGHTS,
  CATALOGUE_IMPACT_NORMALIZATION_REFERENCE,
  CATALOGUE_COST_NORMALIZATION_REFERENCE,
  PRIORITIZATION_LIMITATION_DISCLAIMER,
  CALCULATION_BASIS,
} from '../prioritizationConstants';

/**
 * Helper to build a test zone with minimal metric data.
 */
function createMockZone(id: string, name: string): Zone {
  return {
    zoneId: id,
    zoneName: name,
    wardId: `ward-${id}`,
    wardName: `Ward ${name}`,
    latitude: 13.0,
    longitude: 80.2,
    areaKm2: 15.0,
    dataSourceLabel: 'Illustrative Demo Data',
    lastUpdated: '2026-03-01T00:00:00Z',
    metrics: {
      heat: {
        lst: { value: 38.0, metadata: { sourceType: 'SYNTHETIC_DEMO', sourceName: 'Demo', confidence: 'MEDIUM', status: 'INDICATIVE_ESTIMATE' } },
        lstNormalized: { value: 0.80, metadata: { sourceType: 'SYNTHETIC_DEMO', sourceName: 'Demo', confidence: 'MEDIUM', status: 'INDICATIVE_ESTIMATE' } },
      },
      vegetation: {
        ndvi: { value: 0.20, metadata: { sourceType: 'SYNTHETIC_DEMO', sourceName: 'Demo', confidence: 'MEDIUM', status: 'INDICATIVE_ESTIMATE' } },
        vegetationDeficitNormalized: { value: 0.75, metadata: { sourceType: 'SYNTHETIC_DEMO', sourceName: 'Demo', confidence: 'MEDIUM', status: 'INDICATIVE_ESTIMATE' } },
      },
      vulnerability: {
        vulnerabilityScore: { value: 0.70, metadata: { sourceType: 'SYNTHETIC_DEMO', sourceName: 'Demo', confidence: 'MEDIUM', status: 'INDICATIVE_ESTIMATE' } },
      },
    },
  };
}

/**
 * Helper to create a mock risk score.
 */
function createMockScore(totalScore: number | null): RiskScoreResult {
  return {
    zoneId: 'test-zone',
    totalScore,
    heatScore: totalScore !== null ? totalScore * 0.5 : null,
    vegetationScore: totalScore !== null ? totalScore * 0.2 : null,
    vulnerabilityScore: totalScore !== null ? totalScore * 0.3 : null,
    heatWeight: 50,
    vegetationWeight: 20,
    vulnerabilityWeight: 30,
    availableWeight: totalScore !== null ? 100 : 0,
    missingComponents: totalScore === null ? ['heat', 'vegetation', 'vulnerability'] : [],
    confidence: totalScore !== null ? 'HIGH' : 'NONE',
    completeness: totalScore !== null ? 1.0 : 0,
    riskLevel: totalScore !== null
      ? totalScore >= 75 ? 'VERY_HIGH' : totalScore >= 50 ? 'HIGH' : totalScore >= 25 ? 'MODERATE' : 'LOW'
      : 'INSUFFICIENT_DATA',
    explanation: 'Mock score explanation',
    whyThisZone: {
      primaryDriver: null,
      secondaryDriver: null,
      componentContributions: [],
      missingEvidence: [],
      riskLevel: 'HIGH',
      priorityRationale: 'Rationale',
    },
    totalPriorityScore: totalScore ?? 0,
    breakdown: { heatExposureScore: 0, vegetationDeficitScore: 0, socialVulnerabilityScore: 0 },
    normalizedInputs: { heatExposure: 0.8, vegetationDeficit: 0.75, socialVulnerability: 0.7 },
    hasIncompleteData: totalScore === null,
    calculatedAt: '2026-03-01T00:00:00Z',
    explanationSummary: 'Mock summary',
  };
}

/**
 * Helper to create a mock recommended intervention item.
 */
function createMockRecommendation(params: {
  cost?: number | null;
  impact?: number | null;
  costStatus?: 'SOURCED' | 'DERIVED' | 'INDICATIVE_ESTIMATE' | 'ASSUMPTION' | 'UNKNOWN';
  impactStatus?: 'SOURCED' | 'DERIVED' | 'INDICATIVE_ESTIMATE' | 'ASSUMPTION' | 'UNKNOWN';
}): RecommendedInterventionItem {
  return {
    interventionId: 'int-test-01',
    interventionName: 'Test Cooling Canopy',
    category: 'TARGETED_SHADE_CANOPY',
    description: 'Test intervention for unit testing',
    ruleId: 'RULE_TARGETED_SHADE_CANOPY',
    rulePriority: 3,
    reason: 'Matched high heat and low vegetation',
    matchedConditions: [],
    cost: params.cost !== undefined ? params.cost : 1850,
    costUnit: 'INR / unit (Indicative planning estimate)',
    costStatus: params.costStatus ?? 'INDICATIVE_ESTIMATE',
    impact: params.impact !== undefined ? params.impact : 3.2,
    impactUnit: '°C localized shaded surface temperature reduction (Indicative planning estimate)',
    impactStatus: params.impactStatus ?? 'INDICATIVE_ESTIMATE',
    evidenceReference: 'Municipal Case Study (Indicative Benchmark)',
    assumptions: ['Indicative planning estimate benchmark'],
  };
}

/**
 * Verification test suite for Respire Prioritization Engine (Step 5A Credibility).
 */
export function runPrioritizationTests() {
  console.log('================================================================');
  console.log('RESPIRE PRIORITIZATION ENGINE - STEP 5A CREDIBILITY TEST SUITE');
  console.log('================================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed += 1;
    } else {
      console.error(`  ❌ [FAIL] ${testName} - ${detail || ''}`);
      failed += 1;
    }
  }

  const engine = respirePrioritizationEngine;

  // 1. Normal prioritization with complete data
  {
    const zone = createMockZone('z1', 'Zone 1');
    const score = createMockScore(80.0);
    const rec = createMockRecommendation({ cost: 1850, impact: 3.2 });

    const priority = engine.prioritizeZone(zone, rec, score);

    assert(
      priority.priorityScore !== null &&
      priority.priorityScore > 0 &&
      priority.priorityBand !== 'INSUFFICIENT_EVIDENCE' &&
      priority.completeness === 1.0 &&
      priority.confidence === 'HIGH' &&
      priority.calculationBasis === CALCULATION_BASIS,
      'Test 1: Normal prioritization with complete data includes calculationBasis'
    );
  }

  // 2. Higher risk increases priority when other factors are equal
  {
    const zoneA = createMockZone('zA', 'Zone A');
    const zoneB = createMockZone('zB', 'Zone B');
    const rec = createMockRecommendation({ cost: 1850, impact: 3.0 });

    const scoreA = createMockScore(90.0); // Higher risk
    const scoreB = createMockScore(40.0); // Lower risk

    const priorityA = engine.prioritizeZone(zoneA, rec, scoreA);
    const priorityB = engine.prioritizeZone(zoneB, rec, scoreB);

    assert(
      (priorityA.priorityScore ?? 0) > (priorityB.priorityScore ?? 0),
      'Test 2: Higher risk increases priority when other factors are equal'
    );
  }

  // 3. Higher indicative impact increases priority when other factors are equal
  {
    const zone = createMockZone('z', 'Zone');
    const score = createMockScore(75.0);

    const highImpactRec = createMockRecommendation({ cost: 2000, impact: 4.5 });
    const lowImpactRec = createMockRecommendation({ cost: 2000, impact: 1.5 });

    const priorityHigh = engine.prioritizeZone(zone, highImpactRec, score);
    const priorityLow = engine.prioritizeZone(zone, lowImpactRec, score);

    assert(
      (priorityHigh.priorityScore ?? 0) > (priorityLow.priorityScore ?? 0),
      'Test 3: Higher indicative impact increases priority when other factors are equal'
    );
  }

  // 4. Cost-efficiency affects priority
  {
    const zone = createMockZone('z', 'Zone');
    const score = createMockScore(75.0);

    // Same impact, but lowCostRec is significantly cheaper -> higher cost-efficiency
    const lowCostRec = createMockRecommendation({ cost: 300, impact: 3.0 });
    const highCostRec = createMockRecommendation({ cost: 50000, impact: 3.0 });

    const priorityLowCost = engine.prioritizeZone(zone, lowCostRec, score);
    const priorityHighCost = engine.prioritizeZone(zone, highCostRec, score);

    assert(
      (priorityLowCost.priorityScore ?? 0) > (priorityHighCost.priorityScore ?? 0) &&
      (priorityLowCost.breakdown.costEfficiencyScore ?? 0) > (priorityHighCost.breakdown.costEfficiencyScore ?? 0),
      'Test 4: Cost-efficiency affects priority'
    );
  }

  // 5. Missing risk produces INSUFFICIENT_EVIDENCE
  {
    const zone = createMockZone('z', 'Zone');
    const score = createMockScore(null); // Missing risk
    const rec = createMockRecommendation({ cost: 1850, impact: 3.2 });

    const priority = engine.prioritizeZone(zone, rec, score);

    assert(
      priority.priorityScore === null &&
      priority.priorityBand === 'INSUFFICIENT_EVIDENCE' &&
      priority.confidence === 'NONE' &&
      priority.missingFields.includes('RISK_SCORE'),
      'Test 5: Missing risk produces INSUFFICIENT_EVIDENCE'
    );
  }

  // 6. Missing impact is not treated as zero
  {
    const zone = createMockZone('z', 'Zone');
    const score = createMockScore(80.0);
    const missingImpactRec = createMockRecommendation({ cost: 1850, impact: null });

    const priority = engine.prioritizeZone(zone, missingImpactRec, score);

    // If impact were treated as 0, score would be heavily penalized (80 * 0.50 = 40)
    // With rescaling, only need weight (50) is used -> rescaled to 80/100
    assert(
      priority.priorityScore === 80 &&
      priority.breakdown.impactScore === null &&
      priority.breakdown.effectiveNeedWeight === 100 &&
      priority.missingFields.includes('INDICATIVE_IMPACT'),
      'Test 6: Missing impact is not treated as zero (rescales available weights)'
    );
  }

  // 7. Missing cost is not treated as zero
  {
    const zone = createMockZone('z', 'Zone');
    const score = createMockScore(80.0);
    const missingCostRec = createMockRecommendation({ cost: null, impact: 3.5 });

    const priority = engine.prioritizeZone(zone, missingCostRec, score);

    // Need (50) and Impact (30) available = 80 total available weight. Rescaled to 100%.
    assert(
      priority.priorityScore !== null &&
      priority.breakdown.costEfficiencyScore === null &&
      priority.breakdown.effectiveNeedWeight === 62.5 && // 50/80 * 100
      priority.breakdown.effectiveImpactWeight === 37.5 && // 30/80 * 100
      priority.missingFields.includes('INDICATIVE_COST'),
      'Test 7: Missing cost is not treated as zero'
    );
  }

  // 8. Missing cost-efficiency is handled through weight rescaling
  {
    const zone = createMockZone('z', 'Zone');
    const score = createMockScore(60.0);
    // When cost is null, costEfficiency cannot be computed
    const rec = createMockRecommendation({ cost: null, impact: 3.0 });

    const priority = engine.prioritizeZone(zone, rec, score);

    const sumWeights = priority.breakdown.effectiveNeedWeight + priority.breakdown.effectiveImpactWeight;
    assert(
      Math.abs(sumWeights - 100) < 0.1 &&
      priority.breakdown.costEfficiencyScore === null &&
      priority.breakdown.effectiveCostEfficiencyWeight === 0,
      'Test 8: Missing cost-efficiency is handled through weight rescaling'
    );
  }

  // 9. All unavailable inputs produce INSUFFICIENT_EVIDENCE
  {
    const zone = createMockZone('z', 'Zone');
    const score = createMockScore(null);
    const rec = createMockRecommendation({ cost: null, impact: null });

    const priority = engine.prioritizeZone(zone, rec, score);

    assert(
      priority.priorityScore === null &&
      priority.priorityBand === 'INSUFFICIENT_EVIDENCE' &&
      priority.confidence === 'NONE' &&
      priority.missingFields.includes('RISK_SCORE') &&
      priority.missingFields.includes('INDICATIVE_IMPACT') &&
      priority.missingFields.includes('INDICATIVE_COST') &&
      priority.missingFields.includes('INDICATIVE_COST_EFFICIENCY'),
      'Test 9: All unavailable inputs produce INSUFFICIENT_EVIDENCE'
    );
  }

  // 10. Priority bands are correct
  {
    assert(
      getPriorityBand(15) === 'LOW' &&
      getPriorityBand(35) === 'MODERATE' &&
      getPriorityBand(60) === 'HIGH' &&
      getPriorityBand(85) === 'VERY_HIGH' &&
      getPriorityBand(null) === 'INSUFFICIENT_EVIDENCE',
      'Test 10: Priority bands are correct (0-24 LOW, 25-49 MOD, 50-74 HIGH, 75-100 VERY_HIGH)'
    );
  }

  // 11. Ranking is deterministic
  {
    const zone1 = createMockZone('z1', 'Zone 1');
    const zone2 = createMockZone('z2', 'Zone 2');

    const result1 = engine.prioritizeZones([zone1, zone2], { documentedDate: '2026-03-01T00:00:00Z' });
    const result2 = engine.prioritizeZones([zone1, zone2], { documentedDate: '2026-03-01T00:00:00Z' });

    assert(
      JSON.stringify(result1) === JSON.stringify(result2),
      'Test 11: Ranking is deterministic across repeated runs'
    );
  }

  // 12. Tie-breaking works deterministically
  {
    const zoneA = createMockZone('zone-b', 'Zone B');
    const zoneB = createMockZone('zone-a', 'Zone A');

    const res = engine.prioritizeZones([zoneA, zoneB]);

    // Alphabetical tie-break on zoneId: zone-a should be rank 1, zone-b rank 2
    assert(
      res.rankedPriorities.length === 2 &&
      res.rankedPriorities[0]?.zoneId === 'zone-a' &&
      res.rankedPriorities[0]?.rank === 1 &&
      res.rankedPriorities[1]?.zoneId === 'zone-b' &&
      res.rankedPriorities[1]?.rank === 2,
      'Test 12: Tie-breaking works deterministically'
    );
  }

  // 13. Provenance is preserved with limitation notice
  {
    const zone = createMockZone('z', 'Zone');
    const rec = createMockRecommendation({
      costStatus: 'INDICATIVE_ESTIMATE',
      impactStatus: 'INDICATIVE_ESTIMATE',
    });

    const priority = engine.prioritizeZone(zone, rec);

    assert(
      priority.provenance.costStatus === 'INDICATIVE_ESTIMATE' &&
      priority.provenance.impactStatus === 'INDICATIVE_ESTIMATE' &&
      priority.provenance.datasetLabel === 'Illustrative Demo Data' &&
      priority.provenance.assumptions.includes(PRIORITIZATION_LIMITATION_DISCLAIMER),
      'Test 13: Provenance is preserved with limitation notice in assumptions'
    );
  }

  // 14. Indicative estimates remain INDICATIVE_ESTIMATE and units indicate planning estimates
  {
    const zone = createMockZone('z', 'Zone');
    const priority = engine.prioritizeZone(zone);

    assert(
      priority.provenance.costStatus === 'INDICATIVE_ESTIMATE' &&
      priority.costUnit.toLowerCase().includes('indicative') &&
      priority.impactUnit.toLowerCase().includes('indicative'),
      'Test 14: Indicative estimates remain INDICATIVE_ESTIMATE in units and provenance'
    );
  }

  // 15. No scientific guarantee or misleading language is generated
  {
    const zone = createMockZone('z', 'Zone');
    const priority = engine.prioritizeZone(zone);

    const explanationLower = priority.explanation.toLowerCase();
    const forbiddenPhrases = [
      'most cost-effective',
      'proven impact',
      'scientifically optimal',
      'best intervention',
      'guaranteed reduction',
      'maximum temperature reduction',
      'highest roi',
      'exact temperature',
    ];

    const hasForbidden = forbiddenPhrases.some((phrase) => explanationLower.includes(phrase));

    assert(
      !hasForbidden &&
      explanationLower.includes('relative planning priority') &&
      explanationLower.includes('indicative impact estimate') &&
      explanationLower.includes('indicative cost-efficiency estimate'),
      'Test 15: Explanation strictly adheres to relative planning priority terminology without misleading scientific claims'
    );
  }

  // 16. Demo data produces deterministic results across all 10 zones
  {
    const audit1 = engine.prioritizeZones(CHENNAI_DEMO_ZONES, { documentedDate: '2026-03-01T00:00:00Z' });
    const audit2 = engine.prioritizeZones(CHENNAI_DEMO_ZONES, { documentedDate: '2026-03-01T00:00:00Z' });

    assert(
      audit1.totalZonesEvaluated === 10 &&
      audit1.rankedPriorities.length > 0 &&
      audit1.unrankedPriorities.length > 0 &&
      audit1.calculationBasis === CALCULATION_BASIS &&
      JSON.stringify(audit1) === JSON.stringify(audit2),
      'Test 16: Demo data produces deterministic results across all 10 zones'
    );
  }

  // 17. Ward 198 - Sholinganallur evaluates to INSUFFICIENT_EVIDENCE with missing components preserved as null
  {
    const sholinganallur: Zone = {
      zoneId: 'chennai-zone-15',
      zoneName: 'Sholinganallur (Zone XV)',
      wardId: 'ward-198',
      wardName: 'Ward 198 - Sholinganallur',
      latitude: 12.9010,
      longitude: 80.2279,
      areaKm2: 35.0,
      dataSourceLabel: 'Illustrative Demo Data',
      lastUpdated: '2026-03-01T00:00:00Z',
      metrics: {
        heat: {
          lst: { value: null, metadata: { sourceType: 'SYNTHETIC_DEMO', sourceName: 'Demo', confidence: 'UNKNOWN', status: 'UNKNOWN' } },
          lstNormalized: { value: null, metadata: { sourceType: 'SYNTHETIC_DEMO', sourceName: 'Demo', confidence: 'UNKNOWN', status: 'UNKNOWN' } },
        },
        vegetation: {
          ndvi: { value: null, metadata: { sourceType: 'SYNTHETIC_DEMO', sourceName: 'Demo', confidence: 'UNKNOWN', status: 'UNKNOWN' } },
          vegetationDeficitNormalized: { value: null, metadata: { sourceType: 'SYNTHETIC_DEMO', sourceName: 'Demo', confidence: 'UNKNOWN', status: 'UNKNOWN' } },
        },
        vulnerability: {
          vulnerabilityScore: { value: null, metadata: { sourceType: 'SYNTHETIC_DEMO', sourceName: 'Demo', confidence: 'UNKNOWN', status: 'UNKNOWN' } },
        },
      },
    };

    const priority = engine.prioritizeZone(sholinganallur);

    assert(
      priority.wardId === 'ward-198' &&
      priority.priorityBand === 'INSUFFICIENT_EVIDENCE' &&
      priority.priorityScore === null &&
      priority.rank === null &&
      priority.riskScore === null &&
      priority.indicativeImpact === null &&
      priority.indicativeCost === null &&
      priority.breakdown.costEfficiencyScore === null &&
      priority.missingFields.includes('RISK_SCORE') &&
      priority.missingFields.includes('INDICATIVE_IMPACT') &&
      priority.missingFields.includes('INDICATIVE_COST') &&
      priority.missingFields.includes('INDICATIVE_COST_EFFICIENCY'),
      'Test 17: Ward 198 - Sholinganallur reports INSUFFICIENT_EVIDENCE with missing fields preserved as null'
    );
  }

  // 18. Weights and Normalization Reference Integrity (Formula Unchanged)
  {
    assert(
      PRIORITIZATION_WEIGHTS.need === 50 &&
      PRIORITIZATION_WEIGHTS.impact === 30 &&
      PRIORITIZATION_WEIGHTS.costEfficiency === 20 &&
      CATALOGUE_IMPACT_NORMALIZATION_REFERENCE === 5.0 &&
      CATALOGUE_COST_NORMALIZATION_REFERENCE === 5000,
      'Test 18: Weights remain locked at 50/30/20 and normalization references are centralized'
    );
  }

  console.log('================================================================');
  console.log(`PRIORITIZATION TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    throw new Error(`${failed} prioritization test(s) failed.`);
  }

  return failed === 0;
}

// Auto-run if executed directly via tsx
declare const process: { argv?: string[] };
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('prioritizationEngine.test')) {
  runPrioritizationTests();
}

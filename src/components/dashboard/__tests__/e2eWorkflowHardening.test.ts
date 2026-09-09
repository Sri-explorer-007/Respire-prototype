import { respireApi } from '../../../services/apiClient';
import { respireScoringEngine } from '../../../core/scoring/scoringEngine';
import { respireRecommendationEngine } from '../../../core/recommendations/recommendationEngine';
import { respirePrioritizationEngine } from '../../../core/services/prioritization/prioritizationEngine';

/**
 * Step 10: RESPIRE FINAL DEMO & JUDGE HARDENING E2E TEST SUITE
 * 
 * Validates the complete decision-support chain:
 * 01 IDENTIFY -> 02 EXPLAIN -> 03 RECOMMEND -> 04 PRIORITIZE & FUND
 * 
 * Verifies Scenarios A (Vyasarpadi), B (T. Nagar), and C (Sholinganallur).
 */
export async function runE2EWorkflowHardeningTests() {
  console.log('================================================================');
  console.log('RESPIRE STEP 10 — END-TO-END DEMO & JUDGE HARDENING TEST SUITE');
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

  const zones = await respireApi.fetchZones();
  assert(zones.length === 10, 'Test 1: Demo dataset contains exactly 10 Greater Chennai Corporation wards');

  // Compute domain models across all 10 zones
  const scoredZones = zones.map((z) => ({
    zone: z,
    score: respireScoringEngine.calculateScore(z.zoneId, z.metrics),
  }));

  const prioResult = respirePrioritizationEngine.prioritizeZones(zones);

  // --------------------------------------------------------------------------
  // SCENARIO A: WARD 045 — VYASARPADI (#1 Priority Candidate)
  // --------------------------------------------------------------------------
  const vyasarpadi = scoredZones.find((z) => z.zone.zoneId === 'ward-045');
  assert(vyasarpadi !== undefined, 'Scenario A: Vyasarpadi is loaded');

  // Stage 01: Identify
  assert(
    vyasarpadi?.score.totalScore === 88.0 &&
    (vyasarpadi?.score.riskBand ?? vyasarpadi?.score.riskLevel) === 'VERY_HIGH',
    'Scenario A (IDENTIFY): Vyasarpadi risk score is 88.0 / 100 VERY_HIGH'
  );

  // Stage 02: Explain
  assert(
    vyasarpadi?.score.whyThisZone.primaryDriver?.includes('Heat Exposure') === true &&
    vyasarpadi?.score.heatScore === 46.0 &&
    vyasarpadi?.score.vegetationScore === 16.0 &&
    vyasarpadi?.score.vulnerabilityScore === 26.0 &&
    vyasarpadi?.score.completeness === 1.0,
    'Scenario A (EXPLAIN): Drivers & 46+16+26=88.0 additive breakdown hold with 100% completeness'
  );

  // Stage 03: Recommend
  const vyRec = respireRecommendationEngine.generateRecommendations(vyasarpadi!.zone, vyasarpadi!.score);
  assert(
    vyRec.hasConfidentRecommendation === true &&
    vyRec.primaryRecommendation?.interventionName.includes('Outdoor Worker') === true &&
    vyRec.primaryRecommendation?.cost === 72000 &&
    vyRec.primaryRecommendation?.impact === 4.5 &&
    vyRec.primaryRecommendation?.costStatus === 'INDICATIVE_ESTIMATE' &&
    vyRec.primaryRecommendation?.impactStatus === 'INDICATIVE_ESTIMATE',
    'Scenario A (RECOMMEND): Recommends Outdoor Worker station with ₹72,000 cost & -4.5°C impact [INDICATIVE ESTIMATE]'
  );

  // Stage 04: Prioritize & Fund
  const vyPrio = prioResult.rankedPriorities.find((p) => p.zoneId === 'ward-045');
  assert(
    vyPrio !== undefined &&
    vyPrio.rank === 1 &&
    vyPrio.priorityScore === 80 &&
    vyPrio.priorityBand === 'VERY_HIGH',
    'Scenario A (PRIORITIZE): Vyasarpadi ranks #1 with Planning Priority Score 80 / 100'
  );

  // --------------------------------------------------------------------------
  // SCENARIO B: WARD 134 — T. NAGAR (Dense Commercial Corridor)
  // --------------------------------------------------------------------------
  const tNagar = scoredZones.find((z) => z.zone.zoneId === 'ward-134');
  const tnPrio = prioResult.rankedPriorities.find((p) => p.zoneId === 'ward-134');

  assert(
    tNagar?.score.totalScore === 81.0 &&
    (tNagar?.score.riskBand ?? tNagar?.score.riskLevel) === 'VERY_HIGH' &&
    tnPrio?.rank === 4 &&
    tnPrio?.priorityScore === 77,
    'Scenario B (T. NAGAR): Risk score 81.0, ranks #4 with Planning Priority Score 77 / 100'
  );

  // --------------------------------------------------------------------------
  // SCENARIO C: WARD 198 — SHOLINGANALLUR (Missing Data / Uncertainty Safety)
  // --------------------------------------------------------------------------
  const shol = scoredZones.find((z) => z.zone.zoneId === 'ward-198');
  const sholRec = respireRecommendationEngine.generateRecommendations(shol!.zone, shol!.score);
  const sholPrio = prioResult.unrankedPriorities.find((p) => p.zoneId === 'ward-198');

  // Stage 01 & 02: Identify & Explain
  assert(
    shol?.score.totalScore === null &&
    shol?.score.riskScore === null &&
    (shol?.score.riskBand === 'INSUFFICIENT_EVIDENCE' || shol?.score.riskLevel === 'INSUFFICIENT_EVIDENCE') &&
    shol?.score.completeness === 0.3 &&
    shol?.score.heatScore === null &&
    shol?.score.vegetationScore === null,
    'Scenario C (IDENTIFY & EXPLAIN): Risk score is null, completeness is 30%, Heat & Veg are null'
  );

  // Stage 03: Recommend
  assert(
    sholRec.hasConfidentRecommendation === false &&
    sholRec.primaryRecommendation === null &&
    sholRec.recommendedInterventions.length === 0,
    'Scenario C (RECOMMEND): Produces NO_CONFIDENT_RECOMMENDATION with zero fabricated interventions'
  );

  // Stage 04: Prioritize & Fund
  assert(
    sholPrio !== undefined &&
    sholPrio.rank === null &&
    sholPrio.priorityScore === null &&
    sholPrio.indicativeCost === null &&
    sholPrio.indicativeImpact === null,
    'Scenario C (PRIORITIZE): Remains unranked with null scores and zero fabricated costs/impacts'
  );

  // --------------------------------------------------------------------------
  // DECISION CHAIN & CREDIBILITY HARDENING CHECKS
  // --------------------------------------------------------------------------
  // Check that all ranked candidates have positive numeric scores and non-null costs/impacts
  const allRankedValid = prioResult.rankedPriorities.every(
    (p) =>
      p.rank !== null &&
      p.priorityScore !== null &&
      p.riskScore !== null &&
      p.indicativeCost !== null &&
      p.indicativeImpact !== null &&
      !isNaN(p.priorityScore) &&
      !isNaN(p.riskScore)
  );
  assert(allRankedValid, 'Test Hardening 1: All ranked priorities contain valid numeric values without NaN or null leaks');

  // Check that offline / demo fallback works without network dependencies
  const provenance = respireApi.getProvenanceMetadata();
  assert(
    provenance.isDemoFallbackActive === true &&
    provenance.datasetLabel === 'Illustrative Demo Data',
    'Test Hardening 2: Offline demo mode is active and properly disclosed'
  );

  console.log('================================================================');
  console.log(`STEP 10 E2E HARDENING TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    throw new Error(`${failed} E2E Hardening test(s) failed.`);
  }

  return failed === 0;
}

// Auto-run if executed directly via tsx
declare const process: { argv?: string[]; exit?: (code?: number) => void };
runE2EWorkflowHardeningTests().catch((err) => {
  console.error(err);
  if (process.exit) {
    process.exit(1);
  }
});

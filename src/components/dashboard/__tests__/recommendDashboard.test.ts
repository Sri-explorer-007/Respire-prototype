import { respireApi } from '../../../services/apiClient';
import { respireScoringEngine } from '../../../core/scoring/scoringEngine';
import { respireRecommendationEngine } from '../../../core/recommendations/recommendationEngine';

/**
 * Step 8 & 8A: RECOMMEND ACTIONS & CREDIBILITY AUDIT TEST SUITE
 * 
 * Verifies that the RECOMMEND ACTIONS dashboard experience consumes the
 * recommendation engine deterministically, displays accurate trigger conditions,
 * preserves INDICATIVE_ESTIMATE provenance, and enforces Step 8A health/credibility rules.
 */
export async function runRecommendDashboardTests() {
  console.log('================================================================');
  console.log('RESPIRE RECOMMEND ACTIONS & CREDIBILITY TEST SUITE (STEP 8 & 8A)');
  console.log('================================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName} - ${detail || ''}`);
      failed++;
    }
  }

  // 1. Data provider delivers demo zones
  const zones = await respireApi.fetchZones();
  assert(zones.length === 10, 'Test 1: Loads all 10 demo wards for recommendation evaluation');

  // 2. Vyasarpadi (Ward 045) receives engine-generated recommendation
  const vyasarpadi = zones.find((z) => (z.zoneId || z.id) === 'ward-045');
  const vyScore = vyasarpadi ? respireScoringEngine.calculateScore(vyasarpadi.zoneId, vyasarpadi.metrics) : null;
  const vyRec = vyasarpadi ? respireRecommendationEngine.generateRecommendations(vyasarpadi, vyScore ?? undefined) : null;

  assert(
    vyRec !== null &&
    vyRec.hasConfidentRecommendation === true &&
    vyRec.primaryRecommendation !== null &&
    vyRec.primaryRecommendation.interventionName.includes('Outdoor Worker'),
    `Test 2: Vyasarpadi displays actual recommendation-engine intervention ("${vyRec?.primaryRecommendation?.interventionName}")`
  );

  // 3. T. Nagar (Ward 134) receives its actual recommendation
  const tNagar = zones.find((z) => (z.zoneId || z.id) === 'ward-134');
  const tnScore = tNagar ? respireScoringEngine.calculateScore(tNagar.zoneId, tNagar.metrics) : null;
  const tnRec = tNagar ? respireRecommendationEngine.generateRecommendations(tNagar, tnScore ?? undefined) : null;

  assert(
    tnRec !== null &&
    tnRec.hasConfidentRecommendation === true &&
    tnRec.primaryRecommendation !== null,
    `Test 3: T. Nagar displays actual recommendation-engine intervention ("${tnRec?.primaryRecommendation?.interventionName}")`
  );

  // 4. Recommendation explanation comes directly from domain result
  const vyReason = vyRec?.primaryRecommendation?.reason;
  assert(
    typeof vyReason === 'string' && vyReason.length > 20 && vyReason.includes('high heat exposure'),
    'Test 4: Recommendation explanation comes directly from domain result'
  );

  // 5. Cost comes from recommendation result with INDICATIVE_ESTIMATE status
  const vyCost = vyRec?.primaryRecommendation?.cost;
  const vyCostStatus = vyRec?.primaryRecommendation?.costStatus;
  assert(
    vyCost === 72000 && vyCostStatus === 'INDICATIVE_ESTIMATE',
    `Test 5: Indicative cost is ₹${vyCost} with status ${vyCostStatus}`
  );

  // 6. Impact comes from recommendation result with INDICATIVE_ESTIMATE status
  const vyImpact = vyRec?.primaryRecommendation?.impact;
  const vyImpactStatus = vyRec?.primaryRecommendation?.impactStatus;
  assert(
    vyImpact === 4.5 && vyImpactStatus === 'INDICATIVE_ESTIMATE',
    `Test 6: Indicative impact is -${vyImpact}°C with status ${vyImpactStatus}`
  );

  // 7. INDICATIVE_ESTIMATE provenance is strictly preserved
  const assumptions = vyRec?.primaryRecommendation?.assumptions;
  assert(
    Array.isArray(assumptions) &&
    assumptions.some((a) => a.includes('Indicative planning estimate')),
    'Test 7: Indicative planning estimate provenance and assumptions are preserved'
  );

  // 8. Switching zones updates the recommendation cleanly
  const adyar = zones.find((z) => (z.zoneId || z.id) === 'ward-175');
  const adyarScore = adyar ? respireScoringEngine.calculateScore(adyar.zoneId, adyar.metrics) : null;
  const adyarRec = adyar ? respireRecommendationEngine.generateRecommendations(adyar, adyarScore ?? undefined) : null;

  assert(
    adyarRec !== null &&
    adyRecDiffers(vyRec, adyarRec),
    'Test 8: Changing zones updates the recommendation without retaining stale zone data'
  );

  function adyRecDiffers(a: any, b: any) {
    return a?.primaryRecommendation?.interventionId !== b?.primaryRecommendation?.interventionId ||
           a?.hasConfidentRecommendation !== b?.hasConfidentRecommendation;
  }

  // 9. Sholinganallur (Ward 198) produces NO_CONFIDENT_RECOMMENDATION
  const shol = zones.find((z) => (z.zoneId || z.id) === 'ward-198');
  const sholScore = shol ? respireScoringEngine.calculateScore(shol.zoneId, shol.metrics) : null;
  const sholRec = shol ? respireRecommendationEngine.generateRecommendations(shol, sholScore ?? undefined) : null;

  assert(
    sholRec !== null &&
    sholRec.hasConfidentRecommendation === false &&
    sholRec.primaryRecommendation === null,
    'Test 9: Sholinganallur produces NO_CONFIDENT_RECOMMENDATION'
  );

  // 10. Sholinganallur does not display fabricated intervention, cost, or impact
  assert(
    sholRec?.primaryRecommendation === null &&
    sholRec?.recommendedInterventions.length === 0,
    'Test 10: Sholinganallur contains no fabricated intervention, cost, or impact'
  );

  // 11. Missing evidence is clearly identified for Sholinganallur
  const missingEv = sholRec?.whyThisAction?.checkpoints;
  assert(
    Array.isArray(missingEv) &&
    missingEv.some((c) => c.includes('Land Surface Temperature')) &&
    missingEv.some((c) => c.includes('Vegetation index')),
    'Test 11: Missing physical heat and vegetation telemetry are explicitly reported'
  );

  // 12. Step 8A Credibility Audit: Unsupported health claims (e.g. "heatstroke prevention") are NOT present
  const whyActionStr = JSON.stringify(vyRec?.whyThisAction ?? {});
  const recStr = JSON.stringify(vyRec ?? {});
  const hasHeatstrokeClaim = whyActionStr.toLowerCase().includes('heatstroke prevention') ||
    recStr.toLowerCase().includes('heatstroke prevention');

  assert(
    !hasHeatstrokeClaim,
    'Test 12: Step 8A Audit: "Heatstroke prevention" is not presented as an unsupported clinical claim'
  );

  // 13. Step 8A Credibility Audit: Rule evaluation traceability reflects actual engine conditions
  const matchedConds = vyRec?.primaryRecommendation?.matchedConditions;
  assert(
    Array.isArray(matchedConds) &&
    matchedConds.length === 2 &&
    matchedConds.every((c) => c.isSatisfied),
    'Test 13: Step 8A Audit: Rule evaluation traceability reflects actual engine outputs (heat and worker exposure satisfied)'
  );

  // 14. Priority ranking precedence comes from domain rulePriority (1 = highest)
  assert(
    vyRec?.primaryRecommendation?.rulePriority === 1,
    'Test 14: Step 8A Audit: Intervention priority rank is consumed from domain rulePriority (1)'
  );

  console.log('================================================================');
  console.log(`RECOMMEND DASHBOARD TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    throw new Error(`${failed} Recommend dashboard test(s) failed.`);
  }

  return failed === 0;
}

// Auto-run if executed directly via tsx
declare const process: { argv?: string[]; exit?: (code?: number) => void };
runRecommendDashboardTests().catch((err) => {
  console.error(err);
  if (process.exit) {
    process.exit(1);
  }
});

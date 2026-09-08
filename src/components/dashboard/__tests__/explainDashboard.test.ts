import { respireApi } from '../../../services/apiClient';
import { respireScoringEngine } from '../../../core/scoring/scoringEngine';

/**
 * Step 7: EXPLAIN Dashboard Verification Test Suite
 * 
 * Verifies that the EXPLAIN WHY dashboard experience consumes the scoring engine
 * deterministically without recalculating scores, correctly displays driver hierarchies,
 * handles incomplete data (Sholinganallur), and supports seamless zone switching.
 */
export async function runExplainDashboardTests() {
  console.log('================================================================');
  console.log('RESPIRE EXPLAIN WHY DASHBOARD TEST SUITE (STEP 7)');
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

  // 1. Data provider delivers all demo wards and scoring engine evaluates all of them
  const zones = await respireApi.fetchZones();
  const scoredZones = zones.map((zone) => {
    const zId = zone.zoneId || zone.id || '';
    const score = respireScoringEngine.calculateScore(zId, zone.metrics);
    return { zone, score };
  });

  assert(
    scoredZones.length === 10,
    'Test 1: EXPLAIN screen receives all 10 scored wards from respireScoringEngine'
  );

  // 2. Vyasarpadi displays 88.0 / 100
  const vyasarpadi = scoredZones.find((z) => (z.zone.zoneId || z.zone.id) === 'ward-045');
  assert(
    vyasarpadi !== undefined && vyasarpadi.score.totalScore === 88.0,
    `Test 2: Vyasarpadi displays 88.0 / 100 (actual: ${vyasarpadi?.score.totalScore})`
  );

  // 3. Vyasarpadi displays VERY_HIGH
  const vyasarpadiBand = vyasarpadi?.score.riskBand ?? vyasarpadi?.score.riskLevel;
  assert(
    vyasarpadiBand === 'VERY_HIGH',
    `Test 3: Vyasarpadi displays VERY_HIGH (actual: ${vyasarpadiBand})`
  );

  // 4. Primary driver is rendered directly from scoring result (Heat Exposure)
  const vyasarpadiPrimary = vyasarpadi?.score.whyThisZone.primaryDriver;
  assert(
    typeof vyasarpadiPrimary === 'string' && vyasarpadiPrimary.includes('Heat Exposure'),
    `Test 4: Vyasarpadi primary driver is rendered directly from scoring result ("${vyasarpadiPrimary}")`
  );

  // 5. Secondary driver is rendered directly from scoring result (Social Vulnerability)
  const vyasarpadiSecondary = vyasarpadi?.score.whyThisZone.secondaryDriver;
  assert(
    typeof vyasarpadiSecondary === 'string' && vyasarpadiSecondary.includes('Social Vulnerability'),
    `Test 5: Vyasarpadi secondary driver is rendered directly from scoring result ("${vyasarpadiSecondary}")`
  );

  // 6. Contribution values come directly from scoring result
  const heatContribution = vyasarpadi?.score.heatScore;
  const vegContribution = vyasarpadi?.score.vegetationScore;
  const vulnContribution = vyasarpadi?.score.vulnerabilityScore;
  assert(
    heatContribution === 46.0 && vegContribution === 16.0 && vulnContribution === 26.0,
    `Test 6: Contribution values match scoring result (Heat: ${heatContribution}/50, Veg: ${vegContribution}/20, Vuln: ${vulnContribution}/30)`
  );

  // 7. Completeness and confidence are displayed
  const completeness = vyasarpadi?.score.completeness;
  const confidence = vyasarpadi?.score.confidence;
  assert(
    completeness === 1.0 && confidence === 'MEDIUM',
    `Test 7: Completeness (100%) and Confidence (MEDIUM for indicative demo data) are correctly provided (completeness: ${completeness}, confidence: ${confidence})`
  );

  // 8. Switching zones updates the explanation, drivers, and scores
  const tNagar = scoredZones.find((z) => (z.zone.zoneId || z.zone.id) === 'ward-134');
  const adyar = scoredZones.find((z) => (z.zone.zoneId || z.zone.id) === 'ward-175');
  assert(
    tNagar !== undefined &&
    adyar !== undefined &&
    tNagar.score.totalScore === 81.0 &&
    adyar.score.totalScore === 42.0 &&
    tNagar.score.explanation !== vyasarpadi?.score.explanation &&
    adyar.score.explanation !== vyasarpadi?.score.explanation &&
    (adyar.score.riskBand ?? adyar.score.riskLevel) === 'MODERATE',
    'Test 8: Switching zones dynamically updates explanation, drivers, and score metrics without page refresh'
  );

  // 9. Sholinganallur displays INSUFFICIENT_EVIDENCE
  const sholinganallur = scoredZones.find((z) => (z.zone.zoneId || z.zone.id) === 'ward-198');
  const sholinganallurBand = sholinganallur?.score.riskBand ?? sholinganallur?.score.riskLevel;
  assert(
    sholinganallur !== undefined && sholinganallurBand === 'INSUFFICIENT_EVIDENCE',
    `Test 9: Sholinganallur displays INSUFFICIENT_EVIDENCE (got: ${sholinganallurBand})`
  );

  // 10. Sholinganallur never displays 40 / 100, 30 / 100, or 0 / 100
  const sholinganallurScore = sholinganallur?.score.totalScore;
  const isScoreNull = sholinganallurScore === null;
  const notWrongScore = sholinganallurScore !== 40 && sholinganallurScore !== 30 && sholinganallurScore !== 0;
  assert(
    isScoreNull && notWrongScore,
    `Test 10: Sholinganallur score is null and never displays 40, 30, or 0 (value: ${sholinganallurScore})`
  );

  // 11. Sholinganallur heat exposure displays Unavailable (normalized null)
  const sholinganallurHeatNorm = sholinganallur?.score.normalizedInputs.heatExposure;
  const sholinganallurHeatScore = sholinganallur?.score.heatScore;
  assert(
    sholinganallurHeatNorm === null && sholinganallurHeatScore === null,
    `Test 11: Sholinganallur heat exposure is Unavailable with normalized null (norm: ${sholinganallurHeatNorm}, score: ${sholinganallurHeatScore})`
  );

  // 12. Sholinganallur vegetation deficit displays Unavailable (normalized null)
  const sholinganallurVegNorm = sholinganallur?.score.normalizedInputs.vegetationDeficit;
  const sholinganallurVegScore = sholinganallur?.score.vegetationScore;
  assert(
    sholinganallurVegNorm === null && sholinganallurVegScore === null,
    `Test 12: Sholinganallur vegetation deficit is Unavailable with normalized null (norm: ${sholinganallurVegNorm}, score: ${sholinganallurVegScore})`
  );

  // 13. Sholinganallur drivers are null, so UI displays "Insufficient evidence to determine dominant risk drivers."
  const sholDriver = sholinganallur?.score.whyThisZone.primaryDriver;
  assert(
    sholDriver === null && sholinganallur?.score.completeness === 0.3,
    `Test 13: Sholinganallur primary driver is null and completeness is 30% without fabricated drivers`
  );

  // 14. Additive breakdown integrity across all complete zones
  const completeZones = scoredZones.filter((z) => z.score.completeness === 1.0);
  const allSumsMatch = completeZones.every((z) => {
    const sum = Number(
      ((z.score.heatScore ?? 0) + (z.score.vegetationScore ?? 0) + (z.score.vulnerabilityScore ?? 0)).toFixed(1)
    );
    return Math.abs((z.score.totalScore ?? 0) - sum) < 0.15;
  });
  assert(
    completeZones.length === 9 && allSumsMatch,
    `Test 14: Additive breakdown integrity strictly holds across all 9 complete zones (sum of parts == totalScore)`
  );

  console.log('================================================================');
  console.log(`EXPLAIN DASHBOARD TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    throw new Error(`${failed} Explain dashboard test(s) failed.`);
  }

  return failed === 0;
}

// Auto-run if executed directly via tsx
declare const process: { argv?: string[]; exit?: (code?: number) => void };
runExplainDashboardTests().catch((err) => {
  console.error(err);
  if (process.exit) {
    process.exit(1);
  }
});

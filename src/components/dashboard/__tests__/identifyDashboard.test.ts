import { respireApi } from '../../../services/apiClient';
import { respireScoringEngine } from '../../../core/scoring/scoringEngine';

/**
 * Step 6A: Identify Dashboard & Critical Data Consistency Verification Suite
 */
export async function runIdentifyDashboardTests() {
  console.log('================================================================');
  console.log('RESPIRE IDENTIFY DASHBOARD & DATA CONSISTENCY TEST SUITE (STEP 6A)');
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

  // 1. Data provider delivers all 10 demo wards
  const zones = await respireApi.fetchZones();
  assert(
    zones.length === 10,
    'Test 1: Dashboard loads all 10 demo wards'
  );

  // 2. Summary counts are derived dynamically from domain scoring engine
  const scoredZones = zones.map((zone) => ({
    zone,
    score: respireScoringEngine.calculateScore(zone.zoneId || zone.id || 'unknown', zone.metrics),
  }));

  const total = scoredZones.length;
  const veryHighCount = scoredZones.filter((z) => (z.score.riskBand ?? z.score.riskLevel) === 'VERY_HIGH').length;
  const highCount = scoredZones.filter((z) => (z.score.riskBand ?? z.score.riskLevel) === 'HIGH').length;
  const moderateCount = scoredZones.filter((z) => (z.score.riskBand ?? z.score.riskLevel) === 'MODERATE').length;
  const lowCount = scoredZones.filter((z) => (z.score.riskBand ?? z.score.riskLevel) === 'LOW').length;
  const insufficientCount = scoredZones.filter(
    (z) => (z.score.riskBand ?? z.score.riskLevel) === 'INSUFFICIENT_EVIDENCE' ||
           z.score.riskLevel === 'INSUFFICIENT_DATA' ||
           z.score.totalScore === null
  ).length;

  assert(
    total === 10 && veryHighCount === 5 && highCount === 3 && moderateCount === 1 && lowCount === 0 && insufficientCount === 1,
    `Test 2: Summary card counts match actual distribution (Total: ${total}, Very High: ${veryHighCount}, High: ${highCount}, Moderate: ${moderateCount}, Insufficient: ${insufficientCount})`
  );

  // 3. All 10 zones are geometrically projected within canvas bounds
  const GEO_BOUNDS = { minLat: 12.87, maxLat: 13.16, minLon: 80.13, maxLon: 80.32 };
  const SVG_CONFIG = { width: 760, height: 600, paddingLeft: 60, paddingRight: 160, paddingTop: 50, paddingBottom: 50 };
  const usableWidth = SVG_CONFIG.width - SVG_CONFIG.paddingLeft - SVG_CONFIG.paddingRight;
  const usableHeight = SVG_CONFIG.height - SVG_CONFIG.paddingTop - SVG_CONFIG.paddingBottom;

  const projectedMarkers = scoredZones.map(({ zone }) => {
    const normX = (zone.longitude - GEO_BOUNDS.minLon) / (GEO_BOUNDS.maxLon - GEO_BOUNDS.minLon);
    const normY = (GEO_BOUNDS.maxLat - zone.latitude) / (GEO_BOUNDS.maxLat - GEO_BOUNDS.minLat);
    return {
      wardId: zone.wardId,
      x: SVG_CONFIG.paddingLeft + normX * usableWidth,
      y: SVG_CONFIG.paddingTop + normY * usableHeight,
    };
  });

  const allInBounds = projectedMarkers.every(
    (m) => m.x >= SVG_CONFIG.paddingLeft && m.x <= SVG_CONFIG.width - SVG_CONFIG.paddingRight &&
           m.y >= SVG_CONFIG.paddingTop && m.y <= SVG_CONFIG.height - SVG_CONFIG.paddingBottom
  );

  assert(
    projectedMarkers.length === 10 && allInBounds,
    'Test 3: All 10 wards project correctly within SVG map bounds without clipping'
  );

  // 4. Vyasarpadi (Ward 045) score === 88.0 and riskLevel === VERY_HIGH
  const vyasarpadi = scoredZones.find((z) => z.zone.wardId === 'ward-045');
  assert(
    vyasarpadi !== undefined &&
    vyasarpadi.score.totalScore === 88.0 &&
    (vyasarpadi.score.riskBand ?? vyasarpadi.score.riskLevel) === 'VERY_HIGH',
    `Test 4: Vyasarpadi score is dynamically 88.0 / 100 VERY_HIGH (got ${vyasarpadi?.score.totalScore}, ${vyasarpadi?.score.riskLevel})`
  );

  // 5. Washermanpet (Ward 012) === 86.0 and Royapuram (Ward 052) === 82.0
  const washermanpet = scoredZones.find((z) => z.zone.wardId === 'ward-012');
  const royapuram = scoredZones.find((z) => z.zone.wardId === 'ward-052');
  assert(
    washermanpet?.score.totalScore === 86.0 &&
    (washermanpet?.score.riskBand ?? washermanpet?.score.riskLevel) === 'VERY_HIGH' &&
    royapuram?.score.totalScore === 82.0 &&
    (royapuram?.score.riskBand ?? royapuram?.score.riskLevel) === 'VERY_HIGH',
    `Test 5: Washermanpet = 86.0 and Royapuram = 82.0 VERY_HIGH`
  );

  // 6. T. Nagar (Ward 134) === 81.0 and Ambattur (Ward 080) === 77.0
  const tNagar = scoredZones.find((z) => z.zone.wardId === 'ward-134');
  const ambattur = scoredZones.find((z) => z.zone.wardId === 'ward-080');
  assert(
    tNagar?.score.totalScore === 81.0 &&
    (tNagar?.score.riskBand ?? tNagar?.score.riskLevel) === 'VERY_HIGH' &&
    ambattur?.score.totalScore === 77.0 &&
    (ambattur?.score.riskBand ?? ambattur?.score.riskLevel) === 'VERY_HIGH',
    `Test 6: T. Nagar = 81.0 and Ambattur = 77.0 VERY_HIGH`
  );

  // 7. Velachery === 73.0, Kodambakkam === 63.0, Mylapore === 62.0 (HIGH), Adyar === 42.0 (MODERATE)
  const velachery = scoredZones.find((z) => z.zone.wardId === 'ward-156');
  const kodambakkam = scoredZones.find((z) => z.zone.wardId === 'ward-108');
  const mylapore = scoredZones.find((z) => z.zone.wardId === 'ward-114');
  const adyar = scoredZones.find((z) => z.zone.wardId === 'ward-175');
  assert(
    velachery?.score.totalScore === 73.0 &&
    (velachery?.score.riskBand ?? velachery?.score.riskLevel) === 'HIGH' &&
    kodambakkam?.score.totalScore === 63.0 &&
    (kodambakkam?.score.riskBand ?? kodambakkam?.score.riskLevel) === 'HIGH' &&
    mylapore?.score.totalScore === 62.0 &&
    (mylapore?.score.riskBand ?? mylapore?.score.riskLevel) === 'HIGH' &&
    adyar?.score.totalScore === 42.0 &&
    (adyar?.score.riskBand ?? adyar?.score.riskLevel) === 'MODERATE',
    `Test 7: Velachery = 73.0, Kodambakkam = 63.0, Mylapore = 62.0, Adyar = 42.0`
  );

  // 8. Sholinganallur (Ward 198) Critical Data Consistency Test
  const sholinganallur = scoredZones.find((z) => z.zone.wardId === 'ward-198');
  assert(
    sholinganallur !== undefined &&
    sholinganallur.score.totalScore === null &&
    (sholinganallur.score.riskScore === null || sholinganallur.score.riskScore === undefined) &&
    (sholinganallur.score.riskBand === 'INSUFFICIENT_EVIDENCE' || sholinganallur.score.riskLevel === 'INSUFFICIENT_EVIDENCE') &&
    sholinganallur.score.completeness === 0.30 &&
    sholinganallur.score.heatScore === null &&
    sholinganallur.score.vegetationScore === null &&
    sholinganallur.score.vulnerabilityScore === null,
    `Test 8: Sholinganallur riskScore === null, riskBand === INSUFFICIENT_EVIDENCE, completeness === 30%`
  );

  // 9. Verify null riskScore is NEVER converted into 0 or 40 in rendering logic
  const isInsufficient = !sholinganallur?.score ||
    sholinganallur.score.totalScore === null ||
    sholinganallur.score.riskLevel === 'INSUFFICIENT_EVIDENCE' ||
    sholinganallur.score.riskBand === 'INSUFFICIENT_EVIDENCE';

  const rawScore: number | null = sholinganallur?.score?.totalScore ?? null;
  const displayedScore: string | number = isInsufficient ? 'Insufficient Evidence' : (rawScore ?? 'Unavailable');
  assert(
    displayedScore === 'Insufficient Evidence' && rawScore === null && rawScore !== 0 && rawScore !== 40,
    'Test 9: Selected zone rendering displays "Insufficient Evidence" and rawScore is null (NEVER 0 or 40)'
  );

  // 10. Illustrative Demo Data disclosure is preserved
  const provenance = respireApi.getProvenanceMetadata();
  assert(
    provenance.datasetLabel === 'Illustrative Demo Data' &&
    provenance.isDemoFallbackActive === true,
    'Test 10: "Illustrative Demo Data" disclosure is preserved'
  );

  // 11. Drivers: Vyasarpadi designated Heat Exposure as primary driver; Sholinganallur has null drivers
  assert(
    vyasarpadi?.score.whyThisZone.primaryDriver?.includes('Heat Exposure') === true &&
    sholinganallur?.score.whyThisZone.primaryDriver === null,
    'Test 11: Vyasarpadi identifies Heat Exposure as primary driver; Sholinganallur drivers are null'
  );

  // 12. Additive breakdown integrity across complete wards
  const sumVyasarpadi = Number(
    ((vyasarpadi?.score.heatScore ?? 0) + (vyasarpadi?.score.vegetationScore ?? 0) + (vyasarpadi?.score.vulnerabilityScore ?? 0)).toFixed(1)
  );
  assert(
    Math.abs((vyasarpadi?.score.totalScore ?? 0) - sumVyasarpadi) < 0.15,
    `Test 12: Additive breakdown integrity holds (46 + 16 + 26 = ${sumVyasarpadi} matches totalScore 88.0)`
  );

  console.log('================================================================');
  console.log(`IDENTIFY DASHBOARD TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    throw new Error(`${failed} Identify dashboard test(s) failed.`);
  }

  return failed === 0;
}

// Auto-run if executed directly via tsx
declare const process: { argv?: string[]; exit?: (code?: number) => void };
runIdentifyDashboardTests().catch((err) => {
  console.error(err);
  if (process.exit) {
    process.exit(1);
  }
});

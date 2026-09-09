import {
  RespireScoringEngine,
  InvalidNormalizedValueError,
} from './scoringEngine';
import type { ZoneMetrics } from '../../types';

const scoringEngine = new RespireScoringEngine();

/**
 * Helper to generate mock ZoneMetrics for unit test scenarios.
 */
function createMockMetrics(
  heatNorm: number | null,
  vegNorm: number | null,
  vulnNorm: number | null,
  status: 'SOURCED' | 'DERIVED' | 'INDICATIVE_ESTIMATE' | 'ASSUMPTION' | 'UNKNOWN' = 'SOURCED'
): ZoneMetrics {
  return {
    heat: {
      lst: {
        value: heatNorm !== null ? 30 + heatNorm * 10 : null,
        metadata: {
          sourceType: 'SATELLITE_THERMAL',
          sourceName: 'Landsat-8 TIRS',
          confidence: 'HIGH',
          status,
        },
      },
      lstNormalized: {
        value: heatNorm,
        metadata: {
          sourceType: 'SATELLITE_THERMAL',
          sourceName: 'Landsat-8 TIRS',
          confidence: 'HIGH',
          status,
        },
      },
    },
    vegetation: {
      ndvi: {
        value: vegNorm !== null ? 0.6 - vegNorm * 0.5 : null,
        metadata: {
          sourceType: 'SATELLITE_MULTISPECTRAL',
          sourceName: 'Sentinel-2 MSI',
          confidence: 'HIGH',
          status,
        },
      },
      vegetationDeficitNormalized: {
        value: vegNorm,
        metadata: {
          sourceType: 'SATELLITE_MULTISPECTRAL',
          sourceName: 'Sentinel-2 MSI',
          confidence: 'HIGH',
          status,
        },
      },
    },
    vulnerability: {
      vulnerabilityScore: {
        value: vulnNorm,
        metadata: {
          sourceType: 'MUNICIPAL_CENSUS',
          sourceName: 'Census 2011 & Socioeconomic Survey',
          confidence: 'HIGH',
          status,
        },
      },
    },
  };
}

/**
 * Runs the complete scoring verification suite across 13 distinct edge cases.
 */
export function runScoringTests() {
  console.log('====================================================');
  console.log('RESPIRE SCORING ENGINE - 13 TEST VERIFICATION SUITE');
  console.log('====================================================');

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

  // --------------------------------------------------------------------------
  // Test 1: Fully Populated High-Risk Zone
  // --------------------------------------------------------------------------
  console.log('\n--- 1. Fully Populated High-Risk Zone ---');
  // heat = 0.90 (45 pts), veg = 0.85 (17 pts), vuln = 0.80 (24 pts) -> Total = 86.0
  const t1 = scoringEngine.calculateScore('zone-high', createMockMetrics(0.90, 0.85, 0.80));
  assert(t1.totalScore === 86.0, 'Calculates correct high risk score', `Expected 86.0, got ${t1.totalScore}`);
  assert(t1.riskLevel === 'VERY_HIGH', 'Maps to VERY_HIGH risk level (>=75)', `Got ${t1.riskLevel}`);
  assert(t1.completeness === 1.0, 'Completeness is 1.0', `Got ${t1.completeness}`);
  assert(t1.missingComponents.length === 0, 'No missing components');
  assert(t1.heatScore === 45.0 && t1.vegetationScore === 17.0 && t1.vulnerabilityScore === 24.0, 'Component breakdown matches 45/17/24');

  // --------------------------------------------------------------------------
  // Test 2: Fully Populated Low-Risk Zone
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Fully Populated Low-Risk Zone ---');
  // heat = 0.20 (10 pts), veg = 0.15 (3 pts), vuln = 0.10 (3 pts) -> Total = 16.0
  const t2 = scoringEngine.calculateScore('zone-low', createMockMetrics(0.20, 0.15, 0.10));
  assert(t2.totalScore === 16.0, 'Calculates correct low risk score (16.0)', `Got ${t2.totalScore}`);
  assert(t2.riskLevel === 'LOW', 'Maps to LOW risk level (0-24)', `Got ${t2.riskLevel}`);
  assert(t2.heatScore === 10.0 && t2.vegetationScore === 3.0 && t2.vulnerabilityScore === 3.0, 'Component breakdown matches 10/3/3');

  // --------------------------------------------------------------------------
  // Test 3: Moderate-Risk Zone
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Moderate-Risk Zone ---');
  // heat = 0.40 (20 pts), veg = 0.35 (7 pts), vuln = 0.30 (9 pts) -> Total = 36.0
  const t3 = scoringEngine.calculateScore('zone-mod', createMockMetrics(0.40, 0.35, 0.30));
  assert(t3.totalScore === 36.0, 'Calculates correct moderate risk score (36.0)', `Got ${t3.totalScore}`);
  assert(t3.riskLevel === 'MODERATE', 'Maps to MODERATE risk level (25-49)', `Got ${t3.riskLevel}`);

  // --------------------------------------------------------------------------
  // Test 4: Missing Heat Data
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Missing Heat Data ---');
  // heat = null, veg = 0.80 (raw 16), vuln = 0.60 (raw 18) -> availableWeight = 50
  // rawSum = 34. Rescaled = (34 / 50) * 100 = 68.0
  const t4 = scoringEngine.calculateScore('zone-no-heat', createMockMetrics(null, 0.80, 0.60));
  assert(t4.totalScore === 68.0, 'Rescales proportionally to 68.0 when heat is null', `Got ${t4.totalScore}`);
  assert(t4.heatScore === null, 'Heat score is null when heat is missing');
  assert(t4.vegetationScore === 32.0, 'Veg component rescaled correctly (16/50 * 100 = 32.0)', `Got ${t4.vegetationScore}`);
  assert(t4.vulnerabilityScore === 36.0, 'Vuln component rescaled correctly (18/50 * 100 = 36.0)', `Got ${t4.vulnerabilityScore}`);
  assert(t4.availableWeight === 50, 'Available weight is 50');
  assert(t4.missingComponents.includes('heat'), 'Missing components list includes "heat"');
  assert(t4.confidence === 'LOW', 'Confidence is LOW due to incomplete data');

  // --------------------------------------------------------------------------
  // Test 5: Missing Vegetation Data
  // --------------------------------------------------------------------------
  console.log('\n--- 5. Missing Vegetation Data ---');
  // heat = 0.70 (raw 35), veg = null, vuln = 0.50 (raw 15) -> availableWeight = 80
  // rawSum = 50. Rescaled = (50 / 80) * 100 = 62.5
  const t5 = scoringEngine.calculateScore('zone-no-veg', createMockMetrics(0.70, null, 0.50));
  assert(t5.totalScore === 62.5, 'Rescales proportionally to 62.5 when vegetation is null', `Got ${t5.totalScore}`);
  assert(t5.vegetationScore === null, 'Vegetation score is null');
  assert(t5.availableWeight === 80, 'Available weight is 80');
  assert(t5.missingComponents.includes('vegetation'), 'Missing components list includes "vegetation"');

  // --------------------------------------------------------------------------
  // Test 6: Missing Vulnerability Data
  // --------------------------------------------------------------------------
  console.log('\n--- 6. Missing Vulnerability Data ---');
  // heat = 0.60 (raw 30), veg = 0.40 (raw 8), vuln = null -> availableWeight = 70
  // rawSum = 38. Rescaled = (38 / 70) * 100 = 54.3
  const t6 = scoringEngine.calculateScore('zone-no-vuln', createMockMetrics(0.60, 0.40, null));
  assert(t6.totalScore === 54.3, 'Rescales proportionally to 54.3 when vulnerability is null', `Got ${t6.totalScore}`);
  assert(t6.vulnerabilityScore === null, 'Vulnerability score is null');
  assert(t6.availableWeight === 70, 'Available weight is 70');
  assert(t6.missingComponents.includes('vulnerability'), 'Missing components list includes "vulnerability"');

  // --------------------------------------------------------------------------
  // Test 7: Multiple Missing Components (Only Heat Available)
  // --------------------------------------------------------------------------
  console.log('\n--- 7. Multiple Missing Components (Only Heat Present) ---');
  // heat = 0.75 (raw 37.5), veg = null, vuln = null -> availableWeight = 50
  // rawSum = 37.5. Rescaled = (37.5 / 50) * 100 = 75.0
  const t7 = scoringEngine.calculateScore('zone-only-heat', createMockMetrics(0.75, null, null));
  assert(t7.totalScore === 75.0, 'Rescales based solely on available heat indicator to 75.0', `Got ${t7.totalScore}`);
  assert(t7.availableWeight === 50, 'Available weight is 50');
  assert(t7.missingComponents.length === 2, 'Two components missing');
  assert(t7.completeness === 0.50, 'Completeness is 0.50');

  // --------------------------------------------------------------------------
  // Test 8: All Scoring Inputs Missing
  // --------------------------------------------------------------------------
  console.log('\n--- 8. All Scoring Inputs Missing ---');
  const t8 = scoringEngine.calculateScore('zone-all-null', createMockMetrics(null, null, null));
  assert(t8.totalScore === null, 'totalScore is null when all components are missing');
  assert(t8.availableWeight === 0, 'availableWeight is 0');
  assert(t8.completeness === 0, 'completeness is 0');
  assert(t8.confidence === 'NONE', 'confidence is NONE');
  assert(t8.riskLevel === 'INSUFFICIENT_DATA', 'riskLevel is INSUFFICIENT_DATA');
  assert(t8.missingComponents.length === 3, 'All 3 components recorded as missing');

  // --------------------------------------------------------------------------
  // Test 9: Boundary Values (Near 0, 25, 50, 75, 100)
  // --------------------------------------------------------------------------
  console.log('\n--- 9. Boundary Values & Risk Bands ---');
  // Exact 0.0 -> Total 0.0 -> LOW
  const b0 = scoringEngine.calculateScore('b0', createMockMetrics(0, 0, 0));
  assert(b0.totalScore === 0.0 && b0.riskLevel === 'LOW', 'Score 0.0 -> LOW risk');

  // Near 24.99 / 25.0 boundary
  // heat = 0.25 (12.5), veg = 0.25 (5.0), vuln = 0.25 (7.5) -> Total = 25.0 -> MODERATE
  const b25 = scoringEngine.calculateScore('b25', createMockMetrics(0.25, 0.25, 0.25));
  assert(b25.totalScore === 25.0 && b25.riskLevel === 'MODERATE', 'Score 25.0 -> MODERATE risk');

  // Exact 50.0 boundary
  // heat = 0.50 (25.0), veg = 0.50 (10.0), vuln = 0.50 (15.0) -> Total = 50.0 -> HIGH
  const b50 = scoringEngine.calculateScore('b50', createMockMetrics(0.50, 0.50, 0.50));
  assert(b50.totalScore === 50.0 && b50.riskLevel === 'HIGH', 'Score 50.0 -> HIGH risk');

  // Exact 75.0 boundary
  // heat = 0.75 (37.5), veg = 0.75 (15.0), vuln = 0.75 (22.5) -> Total = 75.0 -> VERY_HIGH
  const b75 = scoringEngine.calculateScore('b75', createMockMetrics(0.75, 0.75, 0.75));
  assert(b75.totalScore === 75.0 && b75.riskLevel === 'VERY_HIGH', 'Score 75.0 -> VERY_HIGH risk');

  // Exact 100.0 boundary
  // heat = 1.0 (50), veg = 1.0 (20), vuln = 1.0 (30) -> Total = 100.0 -> VERY_HIGH
  const b100 = scoringEngine.calculateScore('b100', createMockMetrics(1.0, 1.0, 1.0));
  assert(b100.totalScore === 100.0 && b100.riskLevel === 'VERY_HIGH', 'Score 100.0 -> VERY_HIGH risk');

  // --------------------------------------------------------------------------
  // Test 10: Invalid Normalized Values
  // --------------------------------------------------------------------------
  console.log('\n--- 10. Invalid Normalized Values ---');
  let threwHigh = false;
  try {
    scoringEngine.calculateScore('err-high', createMockMetrics(1.2, 0.5, 0.5));
  } catch (err: any) {
    if (err instanceof InvalidNormalizedValueError) threwHigh = true;
  }
  assert(threwHigh, 'Throws InvalidNormalizedValueError for normalized value > 1.0');

  let threwLow = false;
  try {
    scoringEngine.calculateScore('err-low', createMockMetrics(0.5, -0.1, 0.5));
  } catch (err: any) {
    if (err instanceof InvalidNormalizedValueError) threwLow = true;
  }
  assert(threwLow, 'Throws InvalidNormalizedValueError for normalized value < 0.0');

  let threwNaN = false;
  try {
    scoringEngine.calculateScore('err-nan', createMockMetrics(NaN, 0.5, 0.5));
  } catch (err: any) {
    if (err instanceof InvalidNormalizedValueError) threwNaN = true;
  }
  assert(threwNaN, 'Throws InvalidNormalizedValueError for NaN');

  // --------------------------------------------------------------------------
  // Test 11: Deterministic Repeated Calculation
  // --------------------------------------------------------------------------
  console.log('\n--- 11. Deterministic Repeated Calculation ---');
  const metricsA = createMockMetrics(0.82, 0.65, 0.44);
  const run1 = scoringEngine.calculateScore('det-zone', metricsA, '2026-03-01T00:00:00Z');
  const run2 = scoringEngine.calculateScore('det-zone', metricsA, '2026-03-01T00:00:00Z');
  assert(
    JSON.stringify(run1) === JSON.stringify(run2),
    'Repeated execution produces bit-for-bit identical result'
  );

  // --------------------------------------------------------------------------
  // Test 12: Correct Component Contribution & Driver Detection
  // --------------------------------------------------------------------------
  console.log('\n--- 12. Correct Component Contribution & Driver Detection ---');
  // heat = 0.90 (highest severity), veg = 0.30, vuln = 0.50
  const t12 = scoringEngine.calculateScore('driver-test', createMockMetrics(0.90, 0.30, 0.50));
  assert(
    t12.whyThisZone.primaryDriver?.includes('Heat Exposure') === true,
    'Correctly designates Heat Exposure as Primary Driver',
    `Got ${t12.whyThisZone.primaryDriver}`
  );
  assert(
    t12.whyThisZone.secondaryDriver?.includes('Social Vulnerability') === true,
    'Correctly designates Social Vulnerability as Secondary Driver',
    `Got ${t12.whyThisZone.secondaryDriver}`
  );

  // --------------------------------------------------------------------------
  // Test 13: Correct Total Score & Additive Integrity
  // --------------------------------------------------------------------------
  console.log('\n--- 13. Correct Total Score & Additive Integrity ---');
  // When complete, heatScore + vegScore + vulnScore == totalScore
  const t13 = scoringEngine.calculateScore('sum-test', createMockMetrics(0.68, 0.55, 0.42));
  const sumOfComponents = Number(((t13.heatScore ?? 0) + (t13.vegetationScore ?? 0) + (t13.vulnerabilityScore ?? 0)).toFixed(1));
  assert(
    Math.abs((t13.totalScore ?? 0) - sumOfComponents) < 0.15,
    'Sum of component scores equals totalScore (additive breakdown integrity)',
    `totalScore: ${t13.totalScore}, sum of components: ${sumOfComponents}`
  );

  // --------------------------------------------------------------------------
  // Summary
  // --------------------------------------------------------------------------
  console.log('\n====================================================');
  console.log(`TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('====================================================\n');

  return failed === 0;
}

// Self-run when invoked directly via tsx
declare const process: { argv?: string[] };
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('scoringEngine.test')) {
  const allPassed = runScoringTests();
  if (!allPassed) {
    throw new Error('Some scoring engine tests failed.');
  }
}

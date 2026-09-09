import type { Zone } from '../../types';
import { CHENNAI_DEMO_ZONES } from '../../data/demo/chennaiDemoData';
import { respireRecommendationEngine } from './recommendationEngine';
import { RULE_IDS } from './recommendationConfig';

/**
 * Factory helper to build synthetic test zones with precise metric values.
 */
function createTestZone(params: {
  zoneId?: string;
  zoneName?: string;
  lstNormalized: number | null;
  vegetationDeficitNormalized: number | null;
  vulnerabilityScore?: number | null;
  outdoorWorkerExposureRatio?: number | null;
  builtEnvironmentIndicator?: number | null;
  populationDensityPerKm2?: number | null;
}): Zone {
  return {
    zoneId: params.zoneId || 'test-zone-01',
    zoneName: params.zoneName || 'Test Zone',
    wardId: 'test-ward-01',
    wardName: 'Test Ward',
    latitude: 13.0827,
    longitude: 80.2707,
    areaKm2: 10.0,
    dataSourceLabel: 'Unit Test Fixture',
    lastUpdated: '2026-03-01T00:00:00Z',
    metrics: {
      heat: {
        lst: {
          value: params.lstNormalized !== null ? 35.0 + params.lstNormalized * 10 : null,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: 'Test Fixture',
            confidence: 'HIGH',
            status: 'INDICATIVE_ESTIMATE',
          },
        },
        lstNormalized: {
          value: params.lstNormalized,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: 'Test Fixture',
            confidence: 'HIGH',
            status: 'INDICATIVE_ESTIMATE',
          },
        },
      },
      vegetation: {
        ndvi: {
          value: params.vegetationDeficitNormalized !== null ? 1.0 - params.vegetationDeficitNormalized : null,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: 'Test Fixture',
            confidence: 'HIGH',
            status: 'INDICATIVE_ESTIMATE',
          },
        },
        vegetationDeficitNormalized: {
          value: params.vegetationDeficitNormalized,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: 'Test Fixture',
            confidence: 'HIGH',
            status: 'INDICATIVE_ESTIMATE',
          },
        },
      },
      vulnerability: {
        vulnerabilityScore: {
          value: params.vulnerabilityScore ?? 0.5,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: 'Test Fixture',
            confidence: 'HIGH',
            status: 'INDICATIVE_ESTIMATE',
          },
        },
        vulnerabilityComponents: {
          outdoorWorkerExposureRatio: params.outdoorWorkerExposureRatio !== undefined
            ? {
                value: params.outdoorWorkerExposureRatio,
                metadata: {
                  sourceType: 'SYNTHETIC_DEMO',
                  sourceName: 'Test Fixture',
                  confidence: 'HIGH',
                  status: 'ASSUMPTION',
                },
              }
            : null,
          builtEnvironmentIndicator: params.builtEnvironmentIndicator !== undefined
            ? {
                value: params.builtEnvironmentIndicator,
                metadata: {
                  sourceType: 'SYNTHETIC_DEMO',
                  sourceName: 'Test Fixture',
                  confidence: 'HIGH',
                  status: 'ASSUMPTION',
                },
              }
            : null,
          populationDensityPerKm2: params.populationDensityPerKm2 !== undefined
            ? {
                value: params.populationDensityPerKm2,
                metadata: {
                  sourceType: 'SYNTHETIC_DEMO',
                  sourceName: 'Test Fixture',
                  confidence: 'HIGH',
                  status: 'ASSUMPTION',
                },
              }
            : null,
        },
      },
    },
  };
}

/**
 * Runs the comprehensive 14-test verification suite for the recommendation engine.
 */
export function runRecommendationTests() {
  console.log('================================================================');
  console.log('RESPIRE RECOMMENDATION ENGINE - 14 TEST VERIFICATION SUITE');
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

  const engine = respireRecommendationEngine;

  // 1. High heat + low vegetation -> shade/greening
  {
    const zone = createTestZone({
      lstNormalized: 0.85,
      vegetationDeficitNormalized: 0.80,
      outdoorWorkerExposureRatio: 0.15,
      builtEnvironmentIndicator: 0.30,
    });
    const result = engine.generateRecommendations(zone);
    assert(
      result.hasConfidentRecommendation === true &&
      result.primaryRecommendation?.category === 'TARGETED_SHADE_CANOPY' &&
      result.primaryRecommendation?.ruleId === RULE_IDS.TARGETED_SHADE_CANOPY &&
      result.primaryRecommendation?.interventionId === 'int-shade-canopy-02',
      'Test 1: High heat + low vegetation triggers targeted shade canopy'
    );
  }

  // 2. High heat + dense built environment -> cool roof
  {
    const zone = createTestZone({
      lstNormalized: 0.85,
      vegetationDeficitNormalized: 0.40,
      outdoorWorkerExposureRatio: 0.20,
      builtEnvironmentIndicator: 0.85,
    });
    const result = engine.generateRecommendations(zone);
    assert(
      result.hasConfidentRecommendation === true &&
      result.primaryRecommendation?.category === 'COOL_ROOF' &&
      result.primaryRecommendation?.ruleId === RULE_IDS.COOL_ROOF &&
      result.primaryRecommendation?.interventionId === 'int-cool-roof-01',
      'Test 2: High heat + dense built environment triggers cool roof intervention'
    );
  }

  // 3. High heat + outdoor worker exposure -> shaded cooling/rest area
  {
    const zone = createTestZone({
      lstNormalized: 0.85,
      vegetationDeficitNormalized: 0.35,
      outdoorWorkerExposureRatio: 0.55,
      builtEnvironmentIndicator: 0.25,
    });
    const result = engine.generateRecommendations(zone);
    assert(
      result.hasConfidentRecommendation === true &&
      result.primaryRecommendation?.category === 'COOLING_REST_STATION' &&
      result.primaryRecommendation?.ruleId === RULE_IDS.WORKER_COOLING_STATION &&
      result.primaryRecommendation?.interventionId === 'int-worker-rest-03',
      'Test 3: High heat + outdoor worker exposure triggers worker cooling rest station'
    );
  }

  // 4. Moderate/high heat + vegetation deficit -> targeted greening
  {
    const zone = createTestZone({
      lstNormalized: 0.55,
      vegetationDeficitNormalized: 0.65,
      outdoorWorkerExposureRatio: 0.20,
      builtEnvironmentIndicator: 0.30,
    });
    const result = engine.generateRecommendations(zone);
    assert(
      result.hasConfidentRecommendation === true &&
      result.primaryRecommendation?.category === 'URBAN_GREENING' &&
      result.primaryRecommendation?.ruleId === RULE_IDS.URBAN_GREENING &&
      result.primaryRecommendation?.interventionId === 'int-urban-greening-04',
      'Test 4: Moderate heat + significant vegetation deficit triggers urban greening'
    );
  }

  // 5. Multiple matching rules -> deterministic primary recommendation
  {
    const zone = createTestZone({
      lstNormalized: 0.90,
      vegetationDeficitNormalized: 0.85,
      outdoorWorkerExposureRatio: 0.60,
      builtEnvironmentIndicator: 0.80,
    });
    const result = engine.generateRecommendations(zone);
    assert(
      result.hasConfidentRecommendation === true &&
      result.primaryRecommendation?.ruleId === RULE_IDS.WORKER_COOLING_STATION &&
      result.primaryRecommendation?.rulePriority === 1 &&
      result.secondaryRecommendations.length === 3 &&
      result.secondaryRecommendations[0]?.ruleId === RULE_IDS.COOL_ROOF &&
      result.secondaryRecommendations[1]?.ruleId === RULE_IDS.TARGETED_SHADE_CANOPY &&
      result.secondaryRecommendations[2]?.ruleId === RULE_IDS.URBAN_GREENING,
      'Test 5: Multiple matching rules yield deterministic priority order'
    );
  }

  // 6. Missing heat -> high-heat rules do not match
  {
    const zone = createTestZone({
      lstNormalized: null,
      vegetationDeficitNormalized: 0.85,
      outdoorWorkerExposureRatio: 0.65,
      builtEnvironmentIndicator: 0.85,
    });
    const result = engine.generateRecommendations(zone);
    assert(
      result.hasConfidentRecommendation === false &&
      result.primaryRecommendation === null &&
      result.matchedRules.length === 0 &&
      result.missingEvidence.includes('Land Surface Temperature (LST)') &&
      result.reason.includes('missing Land Surface Temperature (LST)'),
      'Test 6: Missing heat metric (null) prevents high-heat rules from matching'
    );
  }

  // 7. Missing vegetation -> vegetation-based rules do not match
  {
    const zone = createTestZone({
      lstNormalized: 0.85,
      vegetationDeficitNormalized: null,
      outdoorWorkerExposureRatio: 0.10,
      builtEnvironmentIndicator: 0.20,
    });
    const result = engine.generateRecommendations(zone);
    assert(
      result.hasConfidentRecommendation === false &&
      result.primaryRecommendation === null &&
      result.missingEvidence.includes('Vegetation Deficit (NDVI)') &&
      !result.matchedRules.includes(RULE_IDS.TARGETED_SHADE_CANOPY) &&
      !result.matchedRules.includes(RULE_IDS.URBAN_GREENING),
      'Test 7: Missing vegetation metric (null) prevents vegetation-based rules from matching'
    );
  }

  // 8. Missing outdoor-worker exposure -> worker rule does not match
  {
    const zone = createTestZone({
      lstNormalized: 0.85,
      vegetationDeficitNormalized: 0.80,
      outdoorWorkerExposureRatio: null,
      builtEnvironmentIndicator: 0.20,
    });
    const result = engine.generateRecommendations(zone);
    assert(
      result.hasConfidentRecommendation === true &&
      !result.matchedRules.includes(RULE_IDS.WORKER_COOLING_STATION) &&
      result.primaryRecommendation?.ruleId === RULE_IDS.TARGETED_SHADE_CANOPY &&
      result.missingEvidence.includes('Outdoor Worker Exposure Ratio'),
      'Test 8: Missing outdoor-worker exposure prevents worker rule from matching'
    );
  }

  // 9. Insufficient evidence -> NO_CONFIDENT_RECOMMENDATION
  {
    const zone = createTestZone({
      lstNormalized: null,
      vegetationDeficitNormalized: null,
      vulnerabilityScore: null,
      outdoorWorkerExposureRatio: null,
      builtEnvironmentIndicator: null,
    });
    const result = engine.generateRecommendations(zone);
    assert(
      result.hasConfidentRecommendation === false &&
      result.primaryRecommendation === null &&
      result.confidence === 'NONE' &&
      result.reason.toLowerCase().includes('insufficient') &&
      result.whyThisAction.headline.includes('No Confident Intervention'),
      'Test 9: Insufficient evidence produces NO_CONFIDENT_RECOMMENDATION fallback'
    );
  }

  // 10. Recommendation reason is generated from matched conditions
  {
    const zone = createTestZone({
      lstNormalized: 0.78,
      vegetationDeficitNormalized: 0.72,
      outdoorWorkerExposureRatio: 0.15,
      builtEnvironmentIndicator: 0.25,
    });
    const result = engine.generateRecommendations(zone);
    const reason = result.primaryRecommendation?.reason || '';
    assert(
      reason.includes('0.78') &&
      reason.includes('0.72') &&
      reason.toLowerCase().includes('heat exposure') &&
      reason.toLowerCase().includes('vegetation deficit') &&
      result.whyThisAction.checkpoints.some((c) => c.includes('0.78')) &&
      result.whyThisAction.checkpoints.some((c) => c.includes('0.72')),
      'Test 10: Recommendation reason is synthesized from actual matched indicator values'
    );
  }

  // 11. Cost provenance is preserved
  {
    const zone = createTestZone({
      lstNormalized: 0.85,
      vegetationDeficitNormalized: 0.80,
    });
    const result = engine.generateRecommendations(zone);
    const rec = result.primaryRecommendation;
    assert(
      rec?.costStatus === 'INDICATIVE_ESTIMATE' &&
      rec?.cost !== null &&
      (rec?.cost ?? 0) > 0 &&
      rec?.assumptions.length > 0,
      'Test 11: Cost provenance is preserved with strict non-binding planning status'
    );
  }

  // 12. Impact provenance is preserved
  {
    const zone = createTestZone({
      lstNormalized: 0.85,
      vegetationDeficitNormalized: 0.80,
    });
    const result = engine.generateRecommendations(zone);
    const rec = result.primaryRecommendation;
    assert(
      rec?.impactStatus === 'INDICATIVE_ESTIMATE' &&
      rec?.impact !== null &&
      result.whyThisAction.assumptionsNotice.toLowerCase().includes('indicative'),
      'Test 12: Impact provenance is preserved without unqualified temperature claims'
    );
  }

  // 13. Determinism
  {
    const zone = createTestZone({
      zoneId: 'deterministic-zone-01',
      lstNormalized: 0.92,
      vegetationDeficitNormalized: 0.88,
      outdoorWorkerExposureRatio: 0.52,
      builtEnvironmentIndicator: 0.84,
    });
    const fixedDate = '2026-03-01T12:00:00.000Z';
    const result1 = engine.generateRecommendations(zone, undefined, fixedDate);
    const result2 = engine.generateRecommendations(zone, undefined, fixedDate);
    assert(
      JSON.stringify(result1) === JSON.stringify(result2),
      'Test 13: Determinism - same zone inputs produce identical recommendation results'
    );
  }

  // 14. Existing 10-zone demo dataset can be evaluated without crashing
  {
    let allOk = true;
    let manaliCheck = false;
    let royapuramCheck = false;

    for (const zone of CHENNAI_DEMO_ZONES) {
      try {
        const rec = engine.generateRecommendations(zone);
        if (zone.zoneId === 'chennai-zone-02' || zone.wardId === 'ward-198') {
          manaliCheck = rec.hasConfidentRecommendation === false;
        }
        if (zone.zoneId === 'chennai-zone-05' || zone.wardId === 'ward-052') {
          royapuramCheck = rec.hasConfidentRecommendation === true && rec.matchedRules.length >= 1;
        }
      } catch {
        allOk = false;
      }
    }

    assert(
      allOk && manaliCheck && royapuramCheck,
      'Test 14: All 10 zones in CHENNAI_DEMO_ZONES evaluate cleanly without crashing'
    );
  }

  console.log('================================================================');
  console.log(`RECOMMENDATION TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    throw new Error(`${failed} recommendation engine test(s) failed.`);
  }

  return failed === 0;
}

// Auto-run if executed directly
declare const process: { argv?: string[] };
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('recommendationEngine.test')) {
  runRecommendationTests();
}

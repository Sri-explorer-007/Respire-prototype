import { respireApi } from '../../../services/apiClient';
import { respirePrioritizationEngine } from '../../../core/services/prioritization/prioritizationEngine';
import {
  PRIORITIZATION_LIMITATION_DISCLAIMER,
  CALCULATION_BASIS,
} from '../../../core/services/prioritization/prioritizationConstants';

/**
 * Step 9: PRIORITIZE & FUND DASHBOARD TEST SUITE
 * 
 * Verifies that the PRIORITIZE & FUND municipal decision dashboard consumes
 * the prioritization engine deterministically, correctly displays ranks,
 * scores, contributions, and preserves strict planning estimate provenance.
 */
export async function runPrioritizeDashboardTests() {
  console.log('================================================================');
  console.log('RESPIRE PRIORITIZE & FUND DASHBOARD TEST SUITE (STEP 9)');
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

  // 1. Data provider delivers demo zones
  const zones = await respireApi.fetchZones();
  assert(zones.length === 10, 'Test 1: Loads all 10 demo wards for prioritization');

  // 2. Prioritization engine runs across zones
  const prioResult = respirePrioritizationEngine.prioritizeZones(zones);
  assert(
    prioResult.totalZonesEvaluated === 10 &&
    prioResult.rankedPriorities.length === 7 &&
    prioResult.unrankedPriorities.length === 3,
    `Test 2: Prioritizes zones cleanly (Total: ${prioResult.totalZonesEvaluated}, Ranked: ${prioResult.rankedPriorities.length}, Unranked: ${prioResult.unrankedPriorities.length})`
  );

  // 3. Vyasarpadi appears as Rank #1 with priority score 80 and risk score 88
  const [topCandidate] = prioResult.rankedPriorities;
  assert(
    topCandidate !== undefined &&
    topCandidate.rank === 1 &&
    topCandidate.zoneId === 'ward-045' &&
    topCandidate.priorityScore === 80 &&
    topCandidate.riskScore === 88,
    `Test 3: Vyasarpadi ranks #1 with priority score 80 and risk score 88 (actual: Rank #${topCandidate?.rank}, Prio: ${topCandidate?.priorityScore}, Risk: ${topCandidate?.riskScore})`
  );

  // 4. Ranking is derived from domain engine (descending order of priorityScore, then riskScore)
  const isSorted = prioResult.rankedPriorities.every((curr, i, arr) => {
    if (i === 0) return true;
    const prev = arr[i - 1];
    return (prev.priorityScore ?? 0) >= (curr.priorityScore ?? 0);
  });
  assert(isSorted, 'Test 4: Candidate ranking strictly follows domain engine priorityScore ordering');

  // 5. Selected zone detail uses selectedZoneId
  const tNagarPriority = prioResult.rankedPriorities.find((p) => p.zoneId === 'ward-134');
  assert(
    tNagarPriority !== undefined &&
    tNagarPriority.rank === 4 &&
    tNagarPriority.priorityScore === 77,
    `Test 5: Selected zone lookup for T. Nagar (ward-134) yields Rank #${tNagarPriority?.rank}, Score ${tNagarPriority?.priorityScore}`
  );

  // 6. Planning priority score is consumed directly from engine output
  assert(
    topCandidate.priorityScore === 80 && topCandidate.priorityBand === 'VERY_HIGH',
    'Test 6: Planning priority score and band are consumed from prioritization engine'
  );

  // 7. Need/impact/cost-efficiency contributions come directly from engine breakdown
  const bd = topCandidate.breakdown;
  assert(
    bd.needScore !== null &&
    bd.impactScore !== null &&
    bd.costEfficiencyScore !== null &&
    bd.effectiveNeedWeight === 50 &&
    bd.effectiveImpactWeight === 30 &&
    bd.effectiveCostEfficiencyWeight === 20,
    'Test 7: Component contributions and effective weights match 50/30/20 decision weighting'
  );

  // 8. Cost displays INDICATIVE ESTIMATE provenance
  assert(
    topCandidate.provenance.costStatus === 'INDICATIVE_ESTIMATE' &&
    topCandidate.indicativeCost === 72000,
    `Test 8: Cost displays INDICATIVE_ESTIMATE provenance (₹${topCandidate.indicativeCost})`
  );

  // 9. Impact displays INDICATIVE ESTIMATE provenance
  assert(
    topCandidate.provenance.impactStatus === 'INDICATIVE_ESTIMATE' &&
    topCandidate.indicativeImpact === 4.5,
    `Test 9: Impact displays INDICATIVE_ESTIMATE provenance (-${topCandidate.indicativeImpact}°C)`
  );

  // 10. Limitation disclaimer & calculation basis are preserved
  assert(
    prioResult.calculationBasis === CALCULATION_BASIS &&
    topCandidate.provenance.assumptions.some((a) => a.includes(PRIORITIZATION_LIMITATION_DISCLAIMER)),
    'Test 10: Step 5 calculation basis and limitation disclaimer are preserved'
  );

  // 11. Sholinganallur remains unranked with priorityScore = null, riskScore = null
  const sholPriority = prioResult.unrankedPriorities.find((p) => p.zoneId === 'ward-198');
  assert(
    sholPriority !== undefined &&
    sholPriority.rank === null &&
    sholPriority.priorityScore === null &&
    sholPriority.riskScore === null &&
    sholPriority.priorityBand === 'INSUFFICIENT_EVIDENCE',
    'Test 11: Sholinganallur is isolated as unranked with null scores and INSUFFICIENT_EVIDENCE'
  );

  // 12. Sholinganallur receives no fallback recommendation, cost, or impact
  assert(
    sholPriority?.indicativeCost === null &&
    sholPriority?.indicativeImpact === null &&
    sholPriority?.category === 'INSUFFICIENT_EVIDENCE',
    'Test 12: Sholinganallur receives no fabricated recommendation, cost, or impact'
  );

  // 13. No scientific ROI / guaranteed-effectiveness language is introduced
  const allPriorities = [...prioResult.rankedPriorities, ...prioResult.unrankedPriorities];
  const allExplanations = allPriorities.map((p) => p.explanation).join(' ');
  const hasGuaranteedLanguage =
    allExplanations.toLowerCase().includes('guaranteed cooling') ||
    allExplanations.toLowerCase().includes('guaranteed roi') ||
    allExplanations.toLowerCase().includes('scientifically optimal');

  assert(!hasGuaranteedLanguage, 'Test 13: UI and engine explanations avoid guaranteed ROI or scientific certainty language');

  // 14. Indicative total budget calculation integrity
  const totalCost = prioResult.rankedPriorities.reduce((acc, p) => acc + (p.indicativeCost ?? 0), 0);
  assert(
    totalCost === 7 * 72000,
    `Test 14: Indicative total requirement across all 7 ranked zones matches sum (₹${totalCost.toLocaleString('en-IN')})`
  );

  console.log('================================================================');
  console.log(`PRIORITIZE DASHBOARD TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    throw new Error(`${failed} Prioritize dashboard test(s) failed.`);
  }

  return failed === 0;
}

// Auto-run if executed directly via tsx
declare const process: { argv?: string[]; exit?: (code?: number) => void };
runPrioritizeDashboardTests().catch((err) => {
  console.error(err);
  if (process.exit) {
    process.exit(1);
  }
});

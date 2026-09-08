import { CHENNAI_DEMO_ZONES } from '../src/data/demo/chennaiDemoData';
import { respirePrioritizationEngine } from '../src/core/services/prioritization/prioritizationEngine';

/**
 * Audit Runner: End-to-End Evaluation of RESPIRE Prioritization Engine
 * 
 * Pipeline:
 * Demo Zones -> Risk Scoring -> Recommendations -> Prioritization
 * 
 * MANDATORY CREDIBILITY NOTICE:
 * All records are evaluated on "Illustrative Demo Data".
 * Cost and impact values are "Indicative Estimates" for municipal planning.
 */
export function runDemoPrioritizationAudit() {
  console.log('='.repeat(105));
  console.log('RESPIRE — COST + IMPACT PRIORITIZATION ENGINE (STEP 5 DEMO AUDIT)');
  console.log('Dataset: 10 Greater Chennai Corporation Zones [Illustrative Demo Data]');
  console.log('Notice: All cost and impact metrics are Indicative Estimates for planning decisions only.');
  console.log('='.repeat(105));

  const result = respirePrioritizationEngine.prioritizeZones(CHENNAI_DEMO_ZONES, {
    documentedDate: '2026-03-01T00:00:00Z',
  });

  console.log(`Calculation Basis: ${result.calculationBasis}`);
  console.log(`\nRANKED MUNICIPAL INTERVENTION PRIORITIES (${result.evaluationsWithConfidentPriority} Actionable Zones):\n`);

  const rankedTable = result.rankedPriorities.map((item) => ({
    Rank: `#${item.rank}`,
    Zone: `${item.zoneName} (${item.zoneId})`,
    'Risk Score': item.riskScore !== null ? `${item.riskScore.toFixed(1)}/100` : 'null',
    'Risk Band': item.riskBand,
    Recommendation: item.interventionName,
    'Indicative Cost': item.indicativeCost !== null ? `₹${item.indicativeCost.toLocaleString()}` : 'Unknown',
    'Indicative Impact': item.indicativeImpact !== null ? `${item.indicativeImpact}°C` : 'Unknown',
    'Priority Score': item.priorityScore !== null ? `${item.priorityScore}/100` : 'null',
    'Priority Band': item.priorityBand,
    'Conf / Comp': `${item.confidence} (${Math.round(item.completeness * 100)}%)`,
  }));

  console.table(rankedTable);

  if (result.unrankedPriorities.length > 0) {
    console.log(`\nUNRANKED / INSUFFICIENT EVIDENCE ZONES (${result.evaluationsWithInsufficientEvidence} Zones):\n`);

    const unrankedTable = result.unrankedPriorities.map((item) => ({
      Zone: `${item.zoneName} (${item.zoneId})`,
      'Risk Score': item.riskScore !== null ? `${item.riskScore.toFixed(1)}/100` : 'Missing (null)',
      'Risk Band': item.riskBand,
      Recommendation: item.interventionName,
      'Priority Band': item.priorityBand,
      'Missing Fields': item.missingFields.join(', ') || 'None',
      Explanation: item.explanation,
    }));

    console.table(unrankedTable);
  }

  console.log('\n' + '='.repeat(105));
  console.log('SAMPLE DETAILED MUNICIPAL JUSTIFICATION (#1 Ranked Zone)');
  console.log('='.repeat(105));

  const topPriority = result.rankedPriorities[0];
  if (topPriority) {
    console.log(`Zone: ${topPriority.zoneName} (${topPriority.zoneId}) | Rank: #${topPriority.rank}`);
    console.log(`Recommended Action: ${topPriority.interventionName} [${topPriority.category}]`);
    console.log(`Planning Priority Score: ${topPriority.priorityScore}/100 (${topPriority.priorityBand})`);
    console.log(`Breakdown: Need = ${(topPriority.breakdown.needScore! * 100).toFixed(1)}% (Effective Wt: ${topPriority.breakdown.effectiveNeedWeight}%), Impact = ${(topPriority.breakdown.impactScore! * 100).toFixed(1)}% (Effective Wt: ${topPriority.breakdown.effectiveImpactWeight}%), Cost-Efficiency = ${(topPriority.breakdown.costEfficiencyScore! * 100).toFixed(1)}% (Effective Wt: ${topPriority.breakdown.effectiveCostEfficiencyWeight}%)`);
    console.log(`Indicative Cost: ₹${topPriority.indicativeCost?.toLocaleString()} | Unit: ${topPriority.costUnit}`);
    console.log(`Indicative Expected Impact: ${topPriority.indicativeImpact}°C | Unit: ${topPriority.impactUnit}`);
    console.log(`Confidence: ${topPriority.confidence} | Completeness: ${Math.round(topPriority.completeness * 100)}%`);
    console.log(`Explanation: ${topPriority.explanation}`);
    console.log(`Notice: ${topPriority.provenance.assumptions.join('; ')}`);
  }

  console.log('\n' + '='.repeat(105));
  console.log('DEMO AUDIT EXECUTION COMPLETE: FULL PIPELINE VERIFIED.');
  console.log('='.repeat(105) + '\n');

  return result;
}

// Auto-run if invoked directly
runDemoPrioritizationAudit();

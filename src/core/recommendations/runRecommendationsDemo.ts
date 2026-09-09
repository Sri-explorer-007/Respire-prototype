import { CHENNAI_DEMO_ZONES } from '../../data/demo/chennaiDemoData';
import { respireScoringEngine } from '../scoring/scoringEngine';
import { respireRecommendationEngine } from './recommendationEngine';

/**
 * Audit Runner: Evaluates RESPIRE Recommendation Engine across all 10 Chennai Demo Zones
 * 
 * NOTICE:
 * All evaluations use "Illustrative Demo Data".
 * Results are for technical demonstration and planning decision-support only.
 */
export function runRecommendationsDemoAudit() {
  console.log('='.repeat(100));
  console.log('RESPIRE — EXPLAINABLE INTERVENTION RECOMMENDATION ENGINE (STEP 4 AUDIT)');
  console.log('Dataset: 10 Greater Chennai Corporation Zones [Illustrative Demo Data]');
  console.log('='.repeat(100));

  const results = CHENNAI_DEMO_ZONES.map((zone) => {
    const score = respireScoringEngine.calculateScore(zone.zoneId, zone.metrics);
    const rec = respireRecommendationEngine.generateRecommendations(zone, score);

    const primaryRec = rec.primaryRecommendation
      ? `${rec.primaryRecommendation.interventionName} (${rec.primaryRecommendation.category})`
      : 'NO_CONFIDENT_RECOMMENDATION';

    const secondaryRecs = rec.secondaryRecommendations.length > 0
      ? rec.secondaryRecommendations
          .map((s) => `${s.interventionName} [Priority ${s.rulePriority}]`)
          .join('; ')
      : 'None';

    const missing = rec.missingEvidence.length > 0
      ? rec.missingEvidence.join(', ')
      : 'None (Complete)';

    return {
      Zone: `${zone.zoneName} (${zone.zoneId})`,
      'Priority Score': score.totalScore !== null ? `${score.totalScore}/100` : 'N/A (Missing)',
      'Risk Level': score.riskLevel,
      'Primary Recommendation': primaryRec,
      'Secondary Recommendation(s)': secondaryRecs,
      Reason: rec.reason,
      'Missing Evidence': missing,
      Confidence: rec.confidence,
      whyThisAction: rec.whyThisAction,
    };
  });

  // Display Table
  console.table(
    results.map((r) => ({
      Zone: r.Zone,
      Score: r['Priority Score'],
      Risk: r['Risk Level'],
      Primary: r['Primary Recommendation'],
      Secondaries: r['Secondary Recommendation(s)'],
      Confidence: r.Confidence,
      Missing: r['Missing Evidence'],
    }))
  );

  console.log(`\n${'='.repeat(100)}`);
  console.log('DETAILED RECOMMENDATIONS & "WHY THIS ACTION?" UI SAMPLES (3 Selected Zones)');
  console.log('='.repeat(100));

  const sampleIndices = [0, 1, 4]; // Zone 05 (Royapuram), Zone 04 (Tondiarpet), Zone 06 (Thiru-Vi-Ka Nagar)
  sampleIndices.forEach((idx) => {
    const r = results[idx];
    console.log(`\n--------------------------------------------------------------------------------`);
    console.log(`ZONE: ${r.Zone}`);
    console.log(`RISK TIER: ${r['Risk Level']} | SCORE: ${r['Priority Score']} | CONFIDENCE: ${r.Confidence}`);
    console.log(`PRIMARY RECOMMENDATION: ${r['Primary Recommendation']}`);
    console.log(`SECONDARY RECOMMENDATIONS: ${r['Secondary Recommendation(s)']}`);
    console.log(`FULL REASON: ${r.Reason}`);
    console.log(`\n>>> UI CARD: "WHY THIS ACTION?" <<<`);
    console.log(`Headline: ${r.whyThisAction.headline}`);
    r.whyThisAction.checkpoints.forEach((cp) => console.log(`  ${cp}`));
    console.log(`Recommended: ${r.whyThisAction.recommendedAction}`);
    console.log(`Rationale: ${r.whyThisAction.reason}`);
    console.log(`Notice: ${r.whyThisAction.assumptionsNotice}`);
  });

  // Also display the missing data demo zone (Manali Zone 02)
  const manali = results.find((r) => r.Zone.includes('chennai-zone-02'));
  if (manali) {
    console.log(`\n--------------------------------------------------------------------------------`);
    console.log(`MISSING DATA SAFETY DEMONSTRATION: ${manali.Zone}`);
    console.log(`RISK TIER: ${manali['Risk Level']} | SCORE: ${manali['Priority Score']}`);
    console.log(`PRIMARY RECOMMENDATION: ${manali['Primary Recommendation']}`);
    console.log(`MISSING EVIDENCE: ${manali['Missing Evidence']}`);
    console.log(`REASON: ${manali.Reason}`);
    console.log(`UI HEADLINE: ${manali.whyThisAction.headline}`);
    manali.whyThisAction.checkpoints.forEach((cp) => console.log(`  ${cp}`));
  }

  console.log(`\n${'='.repeat(100)}`);
  console.log('DEMO AUDIT COMPLETED SUCCESSFULLY: 10/10 ZONES EVALUATED.');
  console.log(`${'='.repeat(100)}\n`);

  return results;
}

// Execute directly if run via CLI
runRecommendationsDemoAudit();

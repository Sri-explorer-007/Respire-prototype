import { CHENNAI_DEMO_ZONES, DEMO_DATA_LABEL } from '../../data/demo/chennaiDemoData';
import { respireScoringEngine } from './scoringEngine';

export function runDemoScoringAudit() {
  console.log('========================================================================================');
  console.log(`RESPIRE - DEMO DATA SCORING AUDIT (${DEMO_DATA_LABEL})`);
  console.log('Notice: Synthetic illustrative scores for municipal decision-support workflow testing.');
  console.log('========================================================================================\n');

  console.log(
    '| Zone Name                      | Score  | Risk Level  | Heat (50) | Veg (20) | Vuln (30) | Missing Data | Primary Driver'
  );
  console.log(
    '|--------------------------------|--------|-------------|-----------|----------|-----------|--------------|--------------------------'
  );

  const results = CHENNAI_DEMO_ZONES.map((zone) => {
    const scoreResult = respireScoringEngine.calculateScore(zone.zoneId, zone.metrics);
    return {
      zone,
      scoreResult,
    };
  });

  // Sort by totalScore descending (placing nulls at the end)
  results.sort((a, b) => (b.scoreResult.totalScore ?? -1) - (a.scoreResult.totalScore ?? -1));

  for (const { zone, scoreResult } of results) {
    const name = zone.zoneName.padEnd(30, ' ');
    const score = (scoreResult.totalScore !== null ? `${scoreResult.totalScore.toFixed(1)}` : 'N/A').padStart(6, ' ');
    const level = scoreResult.riskLevel.padEnd(11, ' ');
    const heat = (scoreResult.heatScore !== null ? `${scoreResult.heatScore.toFixed(1)}` : 'null').padStart(9, ' ');
    const veg = (scoreResult.vegetationScore !== null ? `${scoreResult.vegetationScore.toFixed(1)}` : 'null').padStart(8, ' ');
    const vuln = (scoreResult.vulnerabilityScore !== null ? `${scoreResult.vulnerabilityScore.toFixed(1)}` : 'null').padStart(9, ' ');
    const missing = (scoreResult.missingComponents.length > 0 ? scoreResult.missingComponents.join(', ') : 'None').padEnd(12, ' ');
    const driver = (scoreResult.whyThisZone.primaryDriver || 'No Evidence').padEnd(24, ' ');

    console.log(`| ${name} | ${score} | ${level} | ${heat} | ${veg} | ${vuln} | ${missing} | ${driver}`);
  }

  console.log('\n----------------------------------------------------------------------------------------');
  console.log('DETAILED "WHY THIS ZONE?" EXPLANATION SAMPLES:\n');

  // Sample 1: Top Very-High Risk Zone
  const topZone = results[0];
  console.log(`1. Top Priority Zone: ${topZone.zone.zoneName} (${topZone.zone.wardName})`);
  console.log(`   - Priority Score: ${topZone.scoreResult.totalScore}/100 [${topZone.scoreResult.riskLevel}]`);
  console.log(`   - Explanation: "${topZone.scoreResult.explanation}"`);
  console.log(`   - Primary Driver: ${topZone.scoreResult.whyThisZone.primaryDriver}`);
  console.log(`   - Secondary Driver: ${topZone.scoreResult.whyThisZone.secondaryDriver}`);
  console.log(`   - Rationale: ${topZone.scoreResult.whyThisZone.priorityRationale}\n`);

  // Sample 2: Missing Data Case (Manali)
  const missingZone = results.find((r) => r.scoreResult.missingComponents.length > 0);
  if (missingZone) {
    console.log(`2. Missing Evidence Case: ${missingZone.zone.zoneName} (${missingZone.zone.wardName})`);
    console.log(`   - Priority Score: ${missingZone.scoreResult.totalScore}/100 [${missingZone.scoreResult.riskLevel}]`);
    console.log(`   - Completeness: ${missingZone.scoreResult.completeness * 100}% | Confidence: ${missingZone.scoreResult.confidence}`);
    console.log(`   - Missing Components: [${missingZone.scoreResult.missingComponents.join(', ')}]`);
    console.log(`   - Rescaling Rationale: Available weight = ${missingZone.scoreResult.availableWeight}/100. Available components proportionally rescaled.`);
    console.log(`   - Explanation: "${missingZone.scoreResult.explanation}"`);
    console.log(`   - Rationale: ${missingZone.scoreResult.whyThisZone.priorityRationale}\n`);
  }

  // Sample 3: Low Risk Zone (Adyar)
  const lowZone = results.find((r) => r.scoreResult.riskLevel === 'LOW');
  if (lowZone) {
    console.log(`3. Low Priority Zone: ${lowZone.zone.zoneName} (${lowZone.zone.wardName})`);
    console.log(`   - Priority Score: ${lowZone.scoreResult.totalScore}/100 [${lowZone.scoreResult.riskLevel}]`);
    console.log(`   - Explanation: "${lowZone.scoreResult.explanation}"`);
    console.log(`   - Rationale: ${lowZone.scoreResult.whyThisZone.priorityRationale}\n`);
  }

  console.log('========================================================================================');
}

runDemoScoringAudit();

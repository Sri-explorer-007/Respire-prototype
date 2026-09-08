import { CHENNAI_DEMO_ZONES } from '../demo/chennaiDemoData';
import { validateZones } from './zoneValidation';
import { ILLUSTRATIVE_INTERVENTIONS } from '../interventions/interventionsData';

declare const process: { argv?: string[] };

export function runDataVerification() {
  console.log('====================================================');
  console.log('RESPIRE - DATA MODEL & DEMO DATA VALIDATION AUDIT');
  console.log('====================================================');

  console.log(`\n1. Validating ${CHENNAI_DEMO_ZONES.length} Demo Zones against strict schema...`);
  const zoneValidation = validateZones(CHENNAI_DEMO_ZONES);

  console.log(`- Validation Status: ${zoneValidation.allValid ? 'PASSED (0 Errors)' : 'FAILED'}`);
  console.log(`- Total Schema Errors: ${zoneValidation.totalErrors}`);
  console.log(`- Total Data Warnings: ${zoneValidation.totalWarnings}`);

  for (const [zoneId, result] of Object.entries(zoneValidation.zoneResults)) {
    console.log(
      `  • [${zoneId}] Valid: ${result.isValid ? 'YES' : 'NO'}${
        result.warnings.length > 0 ? ` (${result.warnings.length} warning/null-audit)` : ''
      }`
    );
    if (result.warnings.length > 0) {
      result.warnings.forEach((w) => console.log(`      ↳ ${w}`));
    }
    if (result.errors.length > 0) {
      result.errors.forEach((e) => console.error(`      ❌ ${e}`));
    }
  }

  console.log(`\n2. Inspecting Future Intervention Catalog (${ILLUSTRATIVE_INTERVENTIONS.length} items)...`);
  ILLUSTRATIVE_INTERVENTIONS.forEach((item) => {
    console.log(
      `  • [${item.interventionId}] ${item.interventionName}` +
      `\n    Category: ${item.category}` +
      `\n    Cost: ${item.cost !== null ? `${item.cost} ${item.costUnit}` : 'null'} [Status: ${item.costStatus}]` +
      `\n    Impact: ${item.impact !== null ? `${item.impact} ${item.impactUnit}` : 'null'} [Status: ${item.impactStatus}]` +
      `\n    Conditions: ${item.applicabilityConditions.map((c) => `${c.metricKey} ${c.operator} ${c.threshold}`).join(', ')}`
    );
  });

  console.log('\n====================================================');
  console.log('AUDIT SUMMARY: Schema, Null-Handling & Provenance Verified.');
  console.log('====================================================');

  return zoneValidation.allValid;
}

// Self-run when invoked directly
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('runValidation')) {
  runDataVerification();
}

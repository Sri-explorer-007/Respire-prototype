import { CHENNAI_ALL_200_WARDS, GCC_ZONES_METADATA } from '../src/data/processed/chennaiAllWardsData';
import { respireScoringEngine } from '../src/core/scoring/scoringEngine';
import { respireRecommendationEngine } from '../src/core/recommendations/recommendationEngine';
import { respirePrioritizationEngine } from '../src/core/services/prioritization/prioritizationEngine';

console.log('================================================================');
console.log('RESPIRE 200 WARDS & 15 ZONES INTEGRITY & SCORING VERIFICATION');
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

// 1. Total Ward & Zone count
assert(
  CHENNAI_ALL_200_WARDS.length === 200,
  `Test 1: Exactly 200 municipal wards loaded (got ${CHENNAI_ALL_200_WARDS.length})`
);

assert(
  GCC_ZONES_METADATA.length === 15,
  `Test 2: Exactly 15 administrative zones configured (got ${GCC_ZONES_METADATA.length})`
);

// 2. Continuous 1-200 numbering integrity
const wardNumbers = CHENNAI_ALL_200_WARDS.map((w) => {
  const match = w.wardId.match(/ward-(\d+)/);
  return match ? parseInt(match[1], 10) : -1;
}).sort((a, b) => a - b);

const hasAll200 = wardNumbers.length === 200 && wardNumbers[0] === 1 && wardNumbers[199] === 200;
const hasNoDuplicates = new Set(wardNumbers).size === 200;

assert(
  hasAll200 && hasNoDuplicates,
  'Test 3: Every ward number from 1 to 200 is uniquely and contiguously present'
);

// 3. Verify exact zone ward ranges
const zoneExpectedRanges: Record<number, number[]> = {
  1: Array.from({ length: 14 }, (_, i) => i + 1), // 1 to 14
  2: Array.from({ length: 7 }, (_, i) => i + 15), // 15 to 21
  3: Array.from({ length: 12 }, (_, i) => i + 22), // 22 to 33
  4: Array.from({ length: 15 }, (_, i) => i + 34), // 34 to 48
  5: Array.from({ length: 15 }, (_, i) => i + 49), // 49 to 63
  6: Array.from({ length: 15 }, (_, i) => i + 64), // 64 to 78
  7: Array.from({ length: 15 }, (_, i) => i + 79), // 79 to 93
  8: Array.from({ length: 15 }, (_, i) => i + 94), // 94 to 108
  9: Array.from({ length: 18 }, (_, i) => i + 109), // 109 to 126
  10: Array.from({ length: 16 }, (_, i) => i + 127), // 127 to 142
  11: Array.from({ length: 13 }, (_, i) => i + 143), // 143 to 155
  12: Array.from({ length: 12 }, (_, i) => i + 156), // 156 to 167
  13: Array.from({ length: 13 }, (_, i) => i + 170), // 170 to 182
  14: [168, 169, ...Array.from({ length: 9 }, (_, i) => i + 183)], // 168, 169, 183 to 191
  15: Array.from({ length: 9 }, (_, i) => i + 192), // 192 to 200
};

let allRangesMatch = true;
for (const [zNumStr, expectedNums] of Object.entries(zoneExpectedRanges)) {
  const zNum = parseInt(zNumStr, 10);
  const zonePrefix = `zone-${String(zNum).padStart(2, '0')}`;
  const zoneWards = CHENNAI_ALL_200_WARDS.filter((w) => w.zoneId === zonePrefix);
  const actualNums = zoneWards
    .map((w) => parseInt(w.wardId.replace('ward-', ''), 10))
    .sort((a, b) => a - b);

  const matches =
    actualNums.length === expectedNums.length &&
    actualNums.every((num, idx) => num === expectedNums[idx]);

  if (!matches) {
    allRangesMatch = false;
    console.error(`Mismatch in Zone ${zNum}: expected ${expectedNums}, got ${actualNums}`);
  }
}

assert(
  allRangesMatch,
  'Test 4: All 15 Zone ward number ranges strictly match GCC official specifications'
);

// 4. Ward 198 null-safety verification
const ward198 = CHENNAI_ALL_200_WARDS.find((w) => w.wardId === 'ward-198');
const score198 = ward198 ? respireScoringEngine.calculateScore(ward198.wardId, ward198.metrics) : null;
assert(
  score198 !== null &&
    score198.totalScore === null &&
    score198.riskBand === 'INSUFFICIENT_EVIDENCE',
  'Test 5: Ward 198 (Sholinganallur) correctly scores as null with INSUFFICIENT_EVIDENCE'
);

// 5. Scoring & Prioritization across all 200 wards
const scoredItems = CHENNAI_ALL_200_WARDS.map((zone) => {
  const zId = zone.zoneId || zone.id || '';
  const score = respireScoringEngine.calculateScore(zId, zone.metrics);
  const rec = respireRecommendationEngine.generateRecommendations(zone, score);
  return { zone, score, rec };
});

assert(
  scoredItems.length === 200,
  'Test 6: All 200 wards successfully evaluated through scoring and recommendation engines'
);

// Check prioritization
const prioritizedResult = respirePrioritizationEngine.prioritizeZones(CHENNAI_ALL_200_WARDS);

assert(
  prioritizedResult.rankedPriorities.length > 0 &&
    prioritizedResult.unrankedPriorities.some((c) => c.wardId === 'ward-198' || c.zoneId === 'ward-198'),
  `Test 7: Prioritization engine cleanly handles all 200 wards (${prioritizedResult.rankedPriorities.length} ranked, ${prioritizedResult.unrankedPriorities.length} unranked)`
);

console.log('================================================================');
console.log(`INTEGRITY TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
console.log('================================================================');

if (failed > 0) process.exit(1);

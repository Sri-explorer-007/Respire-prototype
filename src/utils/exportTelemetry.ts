import type { ScoredZoneItem } from '../components/dashboard/RiskSummaryCards';

/**
 * Exports current ward telemetry and risk calculations to CSV file download.
 */
export function exportZonesToCsv(scoredZones: ScoredZoneItem[], filename = 'chennai_heat_telemetry.csv') {
  const headers = ['Ward ID', 'Ward Name', 'Zone', 'Risk Score', 'Risk Band', 'LST (°C)', 'NDVI', 'Social Vuln Score', 'Completeness (%)'];
  
  const rows = scoredZones.map(({ zone, score }) => {
    const wardId = zone.wardId || '';
    const name = `"${(zone.wardName || zone.zoneName || zone.name || '').replace(/"/g, '""')}"`;
    const zName = `"${(zone.zoneName || zone.name || wardId).replace(/"/g, '""')}"`;
    const scoreVal = score.totalScore !== null ? score.totalScore.toFixed(1) : 'INSUFFICIENT';
    const band = score.riskBand ?? score.riskLevel ?? 'UNKNOWN';
    const lst = zone.metrics?.heat?.lst?.value?.toFixed(1) ?? 'N/A';
    const ndvi = zone.metrics?.vegetation?.ndvi?.value?.toFixed(2) ?? 'N/A';
    const svi = score.breakdown?.socialVulnerabilityScore?.toFixed(1) ?? 'N/A';
    const completeness = ((score.completeness ?? 0) * 100).toFixed(0);

    return [wardId, name, zName, scoreVal, band, lst, ndvi, svi, completeness].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copies a formatted dispatch text summary to clipboard for incident management.
 */
export function copySummaryReport(scoredZones: ScoredZoneItem[]) {
  const highRiskCount = scoredZones.filter((z) => (z.score.riskBand ?? z.score.riskLevel) === 'VERY_HIGH').length;
  const summary = [
    '=== RESPIRE GREATER CHENNAI HEAT DISPATCH ===',
    `Timestamp: ${new Date().toISOString()}`,
    `Total Monitored Wards: ${scoredZones.length}`,
    `Stage 3 Critical Wards: ${highRiskCount}`,
    'Status: ACTIVE DISASTER MANAGEMENT LEVEL 3',
    'Platform: Greater Chennai Corporation Climate Resilience',
  ].join('\n');

  if (navigator.clipboard) {
    navigator.clipboard.writeText(summary);
  }
  return summary;
}

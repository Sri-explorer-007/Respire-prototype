import type { Zone, Intervention, DataProvenanceStatus, ConfidenceLevel } from '../../types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

const ALLOWED_STATUS_VALUES: DataProvenanceStatus[] = [
  'SOURCED',
  'DERIVED',
  'INDICATIVE_ESTIMATE',
  'ASSUMPTION',
  'UNKNOWN',
];

const ALLOWED_CONFIDENCE_VALUES: ConfidenceLevel[] = [
  'HIGH',
  'MEDIUM',
  'LOW',
  'UNKNOWN',
];

/**
 * Lightweight, zero-dependency validation for Zone records and indicators.
 * Ensures data integrity across both real and illustrative demo sources.
 */
export function validateZone(zone: Zone): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Required Identifiers
  if (!zone.zoneId || typeof zone.zoneId !== 'string' || zone.zoneId.trim() === '') {
    errors.push('Zone missing required non-empty "zoneId".');
  }
  if (!zone.zoneName || typeof zone.zoneName !== 'string' || zone.zoneName.trim() === '') {
    errors.push('Zone missing required non-empty "zoneName".');
  }
  if (!zone.wardId || typeof zone.wardId !== 'string' || zone.wardId.trim() === '') {
    errors.push(`Zone "${zone.zoneId || 'unknown'}" missing required non-empty "wardId".`);
  }
  if (!zone.wardName || typeof zone.wardName !== 'string' || zone.wardName.trim() === '') {
    errors.push(`Zone "${zone.zoneId || 'unknown'}" missing required non-empty "wardName".`);
  }

  // 2. Coordinate Validity
  if (typeof zone.latitude !== 'number' || isNaN(zone.latitude) || zone.latitude < -90 || zone.latitude > 90) {
    errors.push(`Zone "${zone.zoneId}" has invalid latitude: ${zone.latitude}`);
  }
  if (typeof zone.longitude !== 'number' || isNaN(zone.longitude) || zone.longitude < -180 || zone.longitude > 180) {
    errors.push(`Zone "${zone.zoneId}" has invalid longitude: ${zone.longitude}`);
  }

  // Soft Chennai boundary warning (12.8°N - 13.3°N, 80.0°E - 80.4°E)
  if (
    typeof zone.latitude === 'number' &&
    typeof zone.longitude === 'number' &&
    (zone.latitude < 12.8 || zone.latitude > 13.3 || zone.longitude < 80.0 || zone.longitude > 80.4)
  ) {
    warnings.push(
      `Zone "${zone.zoneId}" coordinates (${zone.latitude}, ${zone.longitude}) are outside expected Greater Chennai bounding box.`
    );
  }

  // 3. Metrics Existence
  if (!zone.metrics) {
    errors.push(`Zone "${zone.zoneId}" is missing the "metrics" container.`);
    return { isValid: errors.length === 0, errors, warnings };
  }

  const { heat, vegetation, vulnerability } = zone.metrics;

  // 4. Heat Metric Checks
  if (heat) {
    // LST (allow null, but if numeric must be plausible Celsius)
    if (heat.lst.value !== null && (typeof heat.lst.value !== 'number' || heat.lst.value < 10 || heat.lst.value > 70)) {
      errors.push(`Zone "${zone.zoneId}" LST value out of plausible range (10-70°C): ${heat.lst.value}`);
    }
    // LST Normalized (must be 0.0 to 1.0 or null)
    if (heat.lstNormalized.value !== null && (typeof heat.lstNormalized.value !== 'number' || heat.lstNormalized.value < 0 || heat.lstNormalized.value > 1)) {
      errors.push(`Zone "${zone.zoneId}" lstNormalized must be between 0.0 and 1.0: ${heat.lstNormalized.value}`);
    }
    validateProvenanceMetadata(`Zone "${zone.zoneId}" heat.lst`, heat.lst.metadata, errors);
  } else {
    errors.push(`Zone "${zone.zoneId}" missing heat metrics.`);
  }

  // 5. Vegetation Metric Checks
  if (vegetation) {
    // NDVI (must be -1.0 to 1.0 or null)
    if (vegetation.ndvi.value !== null && (typeof vegetation.ndvi.value !== 'number' || vegetation.ndvi.value < -1 || vegetation.ndvi.value > 1)) {
      errors.push(`Zone "${zone.zoneId}" NDVI out of range (-1.0 to 1.0): ${vegetation.ndvi.value}`);
    }
    // Vegetation Deficit Normalized (must be 0.0 to 1.0 or null)
    if (
      vegetation.vegetationDeficitNormalized.value !== null &&
      (typeof vegetation.vegetationDeficitNormalized.value !== 'number' ||
        vegetation.vegetationDeficitNormalized.value < 0 ||
        vegetation.vegetationDeficitNormalized.value > 1)
    ) {
      errors.push(
        `Zone "${zone.zoneId}" vegetationDeficitNormalized must be between 0.0 and 1.0: ${vegetation.vegetationDeficitNormalized.value}`
      );
    }
    validateProvenanceMetadata(`Zone "${zone.zoneId}" vegetation.ndvi`, vegetation.ndvi.metadata, errors);
  } else {
    errors.push(`Zone "${zone.zoneId}" missing vegetation metrics.`);
  }

  // 6. Vulnerability Metric Checks
  if (vulnerability) {
    if (
      vulnerability.vulnerabilityScore.value !== null &&
      (typeof vulnerability.vulnerabilityScore.value !== 'number' ||
        vulnerability.vulnerabilityScore.value < 0 ||
        vulnerability.vulnerabilityScore.value > 1)
    ) {
      errors.push(
        `Zone "${zone.zoneId}" vulnerabilityScore must be between 0.0 and 1.0: ${vulnerability.vulnerabilityScore.value}`
      );
    }
    validateProvenanceMetadata(
      `Zone "${zone.zoneId}" vulnerability.score`,
      vulnerability.vulnerabilityScore.metadata,
      errors
    );

    // Optional Vulnerability Components checks
    if (vulnerability.vulnerabilityComponents) {
      const comps = vulnerability.vulnerabilityComponents;
      const compList = [
        { name: 'populationDensity', item: comps.populationDensity || comps.populationDensityPerKm2 },
        { name: 'elderlyPopulation', item: comps.elderlyPopulation || comps.elderlyPopulationRatio },
        { name: 'informalSettlementIndicator', item: comps.informalSettlementIndicator },
        { name: 'outdoorWorkerExposure', item: comps.outdoorWorkerExposure || comps.outdoorWorkerExposureRatio },
      ];
      for (const comp of compList) {
        if (comp.item && comp.item.value !== null) {
          if (typeof comp.item.value !== 'number' || isNaN(comp.item.value) || comp.item.value < 0) {
            errors.push(`Zone "${zone.zoneId}" component ${comp.name} must be a valid non-negative number.`);
          }
          validateProvenanceMetadata(`Zone "${zone.zoneId}" component ${comp.name}`, comp.item.metadata, errors);
        }
      }
    }
  } else {
    errors.push(`Zone "${zone.zoneId}" missing vulnerability metrics.`);
  }

  // Missing data audit warning
  const missingIndicators: string[] = [];
  if (heat?.lst.value === null) missingIndicators.push('LST');
  if (vegetation?.ndvi.value === null) missingIndicators.push('NDVI');
  if (vulnerability?.vulnerabilityScore.value === null) missingIndicators.push('VulnerabilityScore');

  if (missingIndicators.length > 0) {
    warnings.push(
      `Zone "${zone.zoneId}" contains null values for [${missingIndicators.join(', ')}]. Preserved as null per missing data policy.`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates data provenance metadata schema, status, and confidence levels.
 */
function validateProvenanceMetadata(
  context: string,
  meta: any,
  errors: string[]
): void {
  if (!meta) {
    errors.push(`${context} is missing provenance metadata.`);
    return;
  }
  if (!ALLOWED_STATUS_VALUES.includes(meta.status)) {
    errors.push(`${context} has invalid provenance status "${meta.status}". Allowed: ${ALLOWED_STATUS_VALUES.join(', ')}`);
  }
  if (!ALLOWED_CONFIDENCE_VALUES.includes(meta.confidence)) {
    errors.push(`${context} has invalid confidence level "${meta.confidence}". Allowed: ${ALLOWED_CONFIDENCE_VALUES.join(', ')}`);
  }
}

/**
 * Validates an array of zones and aggregates results.
 */
export function validateZones(zones: Zone[]): {
  allValid: boolean;
  totalErrors: number;
  totalWarnings: number;
  zoneResults: Record<string, ValidationResult>;
} {
  const zoneResults: Record<string, ValidationResult> = {};
  let totalErrors = 0;
  let totalWarnings = 0;

  for (const zone of zones) {
    const res = validateZone(zone);
    zoneResults[zone.zoneId] = res;
    totalErrors += res.errors.length;
    totalWarnings += res.warnings.length;
  }

  return {
    allValid: totalErrors === 0,
    totalErrors,
    totalWarnings,
    zoneResults,
  };
}

/**
 * Validates a single Intervention specification.
 */
export function validateIntervention(intervention: Intervention): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!intervention.interventionId || typeof intervention.interventionId !== 'string') {
    errors.push('Intervention missing required "interventionId".');
  }
  if (!intervention.interventionName || typeof intervention.interventionName !== 'string') {
    errors.push(`Intervention "${intervention.interventionId || 'unknown'}" missing "interventionName".`);
  }
  if (!intervention.category) {
    errors.push(`Intervention "${intervention.interventionId}" missing "category".`);
  }
  if (!ALLOWED_STATUS_VALUES.includes(intervention.costStatus)) {
    errors.push(`Intervention "${intervention.interventionId}" has invalid costStatus "${intervention.costStatus}".`);
  }
  if (!ALLOWED_STATUS_VALUES.includes(intervention.impactStatus)) {
    errors.push(`Intervention "${intervention.interventionId}" has invalid impactStatus "${intervention.impactStatus}".`);
  }
  if (intervention.cost !== null && (typeof intervention.cost !== 'number' || isNaN(intervention.cost) || intervention.cost < 0)) {
    errors.push(`Intervention "${intervention.interventionId}" cost must be null or a non-negative number.`);
  }
  if (intervention.impact !== null && (typeof intervention.impact !== 'number' || isNaN(intervention.impact))) {
    errors.push(`Intervention "${intervention.interventionId}" impact must be null or a number.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates an array of Interventions.
 */
export function validateInterventions(interventions: Intervention[]): {
  allValid: boolean;
  totalErrors: number;
  totalWarnings: number;
} {
  let totalErrors = 0;
  let totalWarnings = 0;

  for (const item of interventions) {
    const res = validateIntervention(item);
    totalErrors += res.errors.length;
    totalWarnings += res.warnings.length;
  }

  return {
    allValid: totalErrors === 0,
    totalErrors,
    totalWarnings,
  };
}

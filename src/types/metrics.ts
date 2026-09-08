import type { DataProvenanceMetadata } from './provenance';

/**
 * Standard container for any measured or derived indicator.
 * Crucial Rule: Missing values are strictly represented as `null`, NEVER silently converted to 0.
 */
export interface IndicatorMeasurement<T = number> {
  value: T | null;
  metadata: DataProvenanceMetadata;
  notes?: string;
}

/**
 * Granular vulnerability components (all optional/nullable, never invented).
 */
export interface VulnerabilityComponents {
  populationDensity?: IndicatorMeasurement<number> | null;
  populationDensityPerKm2?: IndicatorMeasurement<number> | null;
  elderlyPopulation?: IndicatorMeasurement<number> | null;
  elderlyPopulationRatio?: IndicatorMeasurement<number> | null;
  informalSettlementIndicator?: IndicatorMeasurement<number> | null;
  builtEnvironmentIndicator?: IndicatorMeasurement<number> | null;
  builtEnvironmentDensity?: IndicatorMeasurement<number> | null;
  outdoorWorkerExposure?: IndicatorMeasurement<number> | null;
  outdoorWorkerExposureRatio?: IndicatorMeasurement<number> | null;
}

/**
 * Heat Indicators
 */
export interface HeatMetrics {
  lst: IndicatorMeasurement<number>; // Land Surface Temperature in °C (e.g., Landsat thermal band)
  lstNormalized: IndicatorMeasurement<number>; // Normalized 0.0 to 1.0 (or null if missing)
}

/**
 * Vegetation Indicators
 */
export interface VegetationMetrics {
  ndvi: IndicatorMeasurement<number>; // Normalized Difference Vegetation Index (-1.0 to +1.0)
  vegetationDeficitNormalized: IndicatorMeasurement<number>; // Normalized 0.0 to 1.0 (1 = highest deficit)
}

/**
 * Vulnerability Indicators
 */
export interface VulnerabilityMetrics {
  vulnerabilityScore: IndicatorMeasurement<number>; // Composite normalized 0.0 to 1.0 (or null)
  vulnerabilityComponents?: VulnerabilityComponents | null;
}

/**
 * Complete set of urban climate risk metrics for a zone.
 */
export interface ZoneMetrics {
  heat: HeatMetrics;
  vegetation: VegetationMetrics;
  vulnerability: VulnerabilityMetrics;
}

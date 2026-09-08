/**
 * RESPIRE - Data Provenance & Evidence Contracts
 * 
 * Strict Data Policy:
 * - SOURCED: Directly obtained from documented sources (e.g., Landsat, Sentinel, Census).
 * - DERIVED: Calculated mathematically/statistically from sourced data.
 * - INDICATIVE_ESTIMATE: Planning/demo estimate where empirical field measurements are pending.
 * - ASSUMPTION: Proxy or assumption introduced due to unavailable real-world data.
 * - UNKNOWN: Insufficient evidence or missing data.
 */

export type DataProvenanceStatus =
  | 'SOURCED'
  | 'DERIVED'
  | 'INDICATIVE_ESTIMATE'
  | 'ASSUMPTION'
  | 'UNKNOWN';

// Backward-compatibility alias
export type DataProvenance = DataProvenanceStatus;

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';

export type SourceType =
  | 'SATELLITE_THERMAL'
  | 'SATELLITE_MULTISPECTRAL'
  | 'MUNICIPAL_CENSUS'
  | 'SYNTHETIC_DEMO'
  | 'GIS_BOUNDARY'
  | 'SURVEY_SAMPLE'
  | 'ESTIMATED_MODEL';

export interface DataProvenanceMetadata {
  sourceType: SourceType;
  sourceName: string;
  sourceReference?: string;
  dataDate?: string;
  resolution?: string;
  processingMethod?: string;
  confidence: ConfidenceLevel;
  status: DataProvenanceStatus;
}

export interface ValueWithProvenance<T> {
  value: T;
  provenance: DataProvenanceStatus;
  metadata?: DataProvenanceMetadata;
  sourceLabel?: string;
  notes?: string;
}

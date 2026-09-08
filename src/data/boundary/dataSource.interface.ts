import type { Zone, DataProvenance } from '../../types';

export type DataSourceMode = 'demo' | 'processed';

export interface DataProvenanceSummary {
  mode: DataSourceMode;
  datasetLabel: string;
  sourceDescription: string;
  heatMetricProvenance: DataProvenance;
  vegetationMetricProvenance: DataProvenance;
  socialMetricProvenance: DataProvenance;
  isDemoFallbackActive: boolean;
}

/**
 * Data Boundary Contract
 * Decouples data acquisition from business logic (scoring, recommendations).
 * Guarantees that Demo data passes through the exact same logic as real processed data.
 */
export interface IZoneDataProvider {
  readonly mode: DataSourceMode;
  getZones(): Promise<Zone[]>;
  getZoneById(id: string): Promise<Zone | undefined>;
  getProvenanceSummary(): DataProvenanceSummary;
}

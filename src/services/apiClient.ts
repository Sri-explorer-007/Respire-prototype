import type { Zone } from '../types';
import {
  createZoneDataProvider,
  type DataSourceMode,
  type IZoneDataProvider,
  type DataProvenanceSummary,
  ILLUSTRATIVE_INTERVENTIONS,
  validateZones,
} from '../data';

/**
 * RESPIRE API Client / Backend Bridge
 * 
 * Central service interfacing with data providers and core domain engines.
 * Keeps business logic and data ingestion completely decoupled from UI components.
 */
export class RespireApiClient {
  private dataProvider: IZoneDataProvider;

  constructor(initialMode: DataSourceMode = 'demo') {
    this.dataProvider = createZoneDataProvider(initialMode);
  }

  setDataSourceMode(mode: DataSourceMode): void {
    this.dataProvider = createZoneDataProvider(mode);
  }

  getDataSourceMode(): DataSourceMode {
    return this.dataProvider.mode;
  }

  async fetchZones(): Promise<Zone[]> {
    return this.dataProvider.getZones();
  }

  async fetchZoneById(id: string): Promise<Zone | undefined> {
    return this.dataProvider.getZoneById(id);
  }

  getProvenanceMetadata(): DataProvenanceSummary {
    return this.dataProvider.getProvenanceSummary();
  }

  getInterventions() {
    return ILLUSTRATIVE_INTERVENTIONS;
  }

  async validateData() {
    const zones = await this.fetchZones();
    return validateZones(zones);
  }
}

// Singleton instance for convenient UI consumption
export const respireApi = new RespireApiClient();

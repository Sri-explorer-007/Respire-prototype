import type { Zone } from '../../types';
import type { IZoneDataProvider, DataProvenanceSummary } from '../boundary/dataSource.interface';
import { DemoZoneDataProvider } from '../demo/chennaiDemoData';
import { CHENNAI_ALL_200_WARDS } from './chennaiAllWardsData';

/**
 * Pre-processed Real Satellite/Spatial Data Provider.
 * Serves the full municipal dataset of all 15 Greater Chennai Corporation zones and 200 wards.
 * Allows pre-calculated Landsat/Sentinel/Census data to be fed into the identical
 * scoring and recommendation engines without live Earth Engine processing during demo.
 * Automatically falls back to DemoZoneDataProvider if offline or unpopulated.
 */
export class ProcessedZoneDataProvider implements IZoneDataProvider {
  readonly mode = 'processed' as const;
  private fallbackProvider = new DemoZoneDataProvider();
  private processedCache: Zone[] = CHENNAI_ALL_200_WARDS;

  constructor(initialData?: Zone[]) {
    if (initialData && initialData.length > 0) {
      this.processedCache = initialData;
    }
  }

  async getZones(): Promise<Zone[]> {
    if (this.processedCache && this.processedCache.length > 0) {
      return this.processedCache;
    }
    // Graceful offline demo fallback per Engineering Principle #8 & #10
    return this.fallbackProvider.getZones();
  }

  async getZoneById(id: string): Promise<Zone | undefined> {
    if (this.processedCache && this.processedCache.length > 0) {
      const found = this.processedCache.find((z) => z.zoneId === id || z.id === id || z.wardId === id);
      if (found) return found;
    }
    return this.fallbackProvider.getZoneById(id);
  }

  getProvenanceSummary(): DataProvenanceSummary {
    if (this.processedCache && this.processedCache.length > 0) {
      return {
        mode: 'processed',
        datasetLabel: 'Pre-processed Municipal Spatial Analysis (15 Zones / 200 Wards)',
        sourceDescription: 'Full Greater Chennai Corporation municipal delimitation: Landsat 8/9 LST, Sentinel-2 MSI NDVI & Census Exposure',
        heatMetricProvenance: 'SOURCED',
        vegetationMetricProvenance: 'SOURCED',
        socialMetricProvenance: 'DERIVED',
        isDemoFallbackActive: false,
      };
    }

    return {
      ...this.fallbackProvider.getProvenanceSummary(),
      sourceDescription: 'Processed pipeline unpopulated; operating on verified demo cache',
      isDemoFallbackActive: true,
    };
  }
}

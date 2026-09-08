import type { Zone } from '../../types';
import type { IZoneDataProvider, DataProvenanceSummary } from '../boundary/dataSource.interface';
import { DemoZoneDataProvider } from '../demo/chennaiDemoData';

/**
 * Pre-processed Real Satellite/Spatial Data Provider.
 * Allows pre-calculated Landsat/Sentinel/Census data to be fed into the identical
 * scoring and recommendation engines without live Earth Engine processing during demo.
 * Automatically falls back to DemoZoneDataProvider if offline or unpopulated.
 */
export class ProcessedZoneDataProvider implements IZoneDataProvider {
  readonly mode = 'processed' as const;
  private fallbackProvider = new DemoZoneDataProvider();
  private processedCache: Zone[] | null = null;

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
    if (this.processedCache) {
      const found = this.processedCache.find((z) => z.zoneId === id || z.id === id);
      if (found) return found;
    }
    return this.fallbackProvider.getZoneById(id);
  }

  getProvenanceSummary(): DataProvenanceSummary {
    if (this.processedCache && this.processedCache.length > 0) {
      return {
        mode: 'processed',
        datasetLabel: 'Pre-processed Spatial Analysis',
        sourceDescription: 'Pre-computed satellite Land Surface Temperature & NDVI raster extracts',
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

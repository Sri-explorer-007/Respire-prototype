import type { IZoneDataProvider, DataSourceMode } from './boundary/dataSource.interface';
import { DemoZoneDataProvider } from './demo/chennaiDemoData';
import { ProcessedZoneDataProvider } from './processed/processedDataProvider';

export * from './boundary/dataSource.interface';
export * from './demo/chennaiDemoData';
export * from './processed/processedDataProvider';
export * from './validation/zoneValidation';
export * from './interventions/interventionsData';

/**
 * Data provider factory ensuring consistent data access regardless of source.
 */
export function createZoneDataProvider(mode: DataSourceMode = 'demo'): IZoneDataProvider {
  if (mode === 'processed') {
    return new ProcessedZoneDataProvider();
  }
  return new DemoZoneDataProvider();
}

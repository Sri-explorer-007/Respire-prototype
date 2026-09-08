import type { ZoneMetrics } from './metrics';

export interface GeoGeometryReference {
  type: 'Point' | 'Polygon' | 'MultiPolygon';
  coordinates?: number[][] | number[][][] | number[][][][];
  geojsonUri?: string;
}

/**
 * Strongly-typed municipal Zone data model.
 * Adheres strictly to the RESPIRE Core Zone contract:
 * - Identity: zoneId, zoneName, wardId, wardName, latitude, longitude, geometry reference
 * - Heat: lst, lstNormalized
 * - Vegetation: ndvi, vegetationDeficitNormalized
 * - Vulnerability: vulnerabilityScore, vulnerabilityComponents
 */
export interface Zone {
  // Identity
  zoneId: string;
  zoneName: string;
  wardId: string;
  wardName: string;
  latitude: number;
  longitude: number;
  geometryRef?: GeoGeometryReference;
  areaKm2?: number;

  // Indicators & Measurements
  metrics: ZoneMetrics;

  // Administrative & Source Metadata
  dataSourceLabel: string; // e.g., "Illustrative Demo Data"
  lastUpdated?: string;

  // Compatibility aliases for UI convenience
  id?: string;
  name?: string;
}

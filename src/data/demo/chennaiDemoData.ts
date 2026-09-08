import type { Zone } from '../../types';
import type { IZoneDataProvider, DataProvenanceSummary } from '../boundary/dataSource.interface';

/**
 * RESPIRE - Illustrative Demo Dataset for Greater Chennai Corporation
 * 
 * =========================================================================
 * MANDATORY POLICY NOTICE:
 * This dataset is strictly labeled "Illustrative Demo Data".
 * Values are synthetic and intended solely for platform development,
 * UI testing, and workflow demonstration.
 * They DO NOT represent real empirical measurements of Chennai conditions.
 * =========================================================================
 */
export const DEMO_DATA_LABEL = 'Illustrative Demo Data';

export const CHENNAI_DEMO_ZONES: Zone[] = [
  // 1. Ward 045 - Vyasarpadi: 88 / 100 VERY_HIGH (Heat: 0.92, Veg: 0.80, Vuln: 0.8667)
  {
    zoneId: 'ward-045',
    zoneName: 'Ward 045 - Vyasarpadi',
    wardId: 'ward-045',
    wardName: 'Ward 045 - Vyasarpadi',
    latitude: 13.1165,
    longitude: 80.2570,
    areaKm2: 6.2,
    dataSourceLabel: DEMO_DATA_LABEL,
    lastUpdated: '2026-03-01T00:00:00Z',
    metrics: {
      heat: {
        lst: {
          value: 41.2,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: DEMO_DATA_LABEL,
            confidence: 'MEDIUM',
            status: 'INDICATIVE_ESTIMATE',
            resolution: 'Ward-level Aggregate',
            processingMethod: 'Synthetic baseline for testing acute urban heat island',
          },
          notes: 'High heat stress in dense industrial and rail corridor',
        },
        lstNormalized: {
          value: 0.92,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: DEMO_DATA_LABEL,
            confidence: 'MEDIUM',
            status: 'INDICATIVE_ESTIMATE',
          },
        },
      },
      vegetation: {
        ndvi: {
          value: 0.12,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: DEMO_DATA_LABEL,
            confidence: 'MEDIUM',
            status: 'INDICATIVE_ESTIMATE',
            resolution: 'Ward-level Aggregate',
          },
          notes: 'Severe vegetation deficit in dense built fabric',
        },
        vegetationDeficitNormalized: {
          value: 0.80,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: DEMO_DATA_LABEL,
            confidence: 'MEDIUM',
            status: 'INDICATIVE_ESTIMATE',
          },
        },
      },
      vulnerability: {
        vulnerabilityScore: {
          value: 0.8667,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: DEMO_DATA_LABEL,
            confidence: 'MEDIUM',
            status: 'INDICATIVE_ESTIMATE',
          },
        },
        vulnerabilityComponents: {
          populationDensityPerKm2: {
            value: 31500,
            metadata: {
              sourceType: 'SYNTHETIC_DEMO',
              sourceName: DEMO_DATA_LABEL,
              confidence: 'LOW',
              status: 'ASSUMPTION',
            },
          },
          informalSettlementIndicator: {
            value: 0.58,
            metadata: {
              sourceType: 'SYNTHETIC_DEMO',
              sourceName: DEMO_DATA_LABEL,
              confidence: 'LOW',
              status: 'ASSUMPTION',
            },
          },
          outdoorWorkerExposure: {
            value: 0.65,
            metadata: {
              sourceType: 'SYNTHETIC_DEMO',
              sourceName: DEMO_DATA_LABEL,
              confidence: 'LOW',
              status: 'ASSUMPTION',
            },
          },
        },
      },
    },
    id: 'ward-045',
    name: 'Ward 045 - Vyasarpadi',
  },

  // 2. Ward 012 - Washermanpet: 86 / 100 VERY_HIGH (Heat: 0.90, Veg: 0.85, Vuln: 0.80)
  {
    zoneId: 'ward-012',
    zoneName: 'Ward 012 - Washermanpet',
    wardId: 'ward-012',
    wardName: 'Ward 012 - Washermanpet',
    latitude: 13.1120,
    longitude: 80.2820,
    areaKm2: 5.4,
    dataSourceLabel: DEMO_DATA_LABEL,
    lastUpdated: '2026-03-01T00:00:00Z',
    metrics: {
      heat: {
        lst: {
          value: 40.5,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: DEMO_DATA_LABEL,
            confidence: 'MEDIUM',
            status: 'INDICATIVE_ESTIMATE',
          },
        },
        lstNormalized: {
          value: 0.90,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: DEMO_DATA_LABEL,
            confidence: 'MEDIUM',
            status: 'INDICATIVE_ESTIMATE',
          },
        },
      },
      vegetation: {
        ndvi: {
          value: 0.10,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: DEMO_DATA_LABEL,
            confidence: 'MEDIUM',
            status: 'INDICATIVE_ESTIMATE',
          },
        },
        vegetationDeficitNormalized: {
          value: 0.85,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: DEMO_DATA_LABEL,
            confidence: 'MEDIUM',
            status: 'INDICATIVE_ESTIMATE',
          },
        },
      },
      vulnerability: {
        vulnerabilityScore: {
          value: 0.80,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: DEMO_DATA_LABEL,
            confidence: 'MEDIUM',
            status: 'INDICATIVE_ESTIMATE',
          },
        },
        vulnerabilityComponents: {
          populationDensityPerKm2: {
            value: 29800,
            metadata: {
              sourceType: 'SYNTHETIC_DEMO',
              sourceName: DEMO_DATA_LABEL,
              confidence: 'LOW',
              status: 'ASSUMPTION',
            },
          },
          informalSettlementIndicator: {
            value: 0.52,
            metadata: {
              sourceType: 'SYNTHETIC_DEMO',
              sourceName: DEMO_DATA_LABEL,
              confidence: 'LOW',
              status: 'ASSUMPTION',
            },
          },
          outdoorWorkerExposure: {
            value: 0.60,
            metadata: {
              sourceType: 'SYNTHETIC_DEMO',
              sourceName: DEMO_DATA_LABEL,
              confidence: 'LOW',
              status: 'ASSUMPTION',
            },
          },
        },
      },
    },
    id: 'ward-012',
    name: 'Ward 012 - Washermanpet',
  },

  // 3. Ward 052 - Royapuram: 82 / 100 VERY_HIGH (Heat: 0.86, Veg: 0.75, Vuln: 0.80)
  {
    zoneId: 'ward-052',
    zoneName: 'Ward 052 - Royapuram',
    wardId: 'ward-052',
    wardName: 'Ward 052 - Royapuram',
    latitude: 13.1092,
    longitude: 80.2941,
    areaKm2: 5.8,
    dataSourceLabel: DEMO_DATA_LABEL,
    lastUpdated: '2026-03-01T00:00:00Z',
    metrics: {
      heat: {
        lst: {
          value: 39.5,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: DEMO_DATA_LABEL,
            confidence: 'MEDIUM',
            status: 'INDICATIVE_ESTIMATE',
          },
        },
        lstNormalized: {
          value: 0.86,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: DEMO_DATA_LABEL,
            confidence: 'MEDIUM',
            status: 'INDICATIVE_ESTIMATE',
          },
        },
      },
      vegetation: {
        ndvi: {
          value: 0.14,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: DEMO_DATA_LABEL,
            confidence: 'MEDIUM',
            status: 'INDICATIVE_ESTIMATE',
          },
        },
        vegetationDeficitNormalized: {
          value: 0.75,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: DEMO_DATA_LABEL,
            confidence: 'MEDIUM',
            status: 'INDICATIVE_ESTIMATE',
          },
        },
      },
      vulnerability: {
        vulnerabilityScore: {
          value: 0.80,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: DEMO_DATA_LABEL,
            confidence: 'MEDIUM',
            status: 'INDICATIVE_ESTIMATE',
          },
        },
        vulnerabilityComponents: {
          populationDensityPerKm2: {
            value: 28400,
            metadata: {
              sourceType: 'SYNTHETIC_DEMO',
              sourceName: DEMO_DATA_LABEL,
              confidence: 'LOW',
              status: 'ASSUMPTION',
            },
          },
          informalSettlementIndicator: {
            value: 0.48,
            metadata: {
              sourceType: 'SYNTHETIC_DEMO',
              sourceName: DEMO_DATA_LABEL,
              confidence: 'LOW',
              status: 'ASSUMPTION',
            },
          },
          outdoorWorkerExposure: {
            value: 0.55,
            metadata: {
              sourceType: 'SYNTHETIC_DEMO',
              sourceName: DEMO_DATA_LABEL,
              confidence: 'LOW',
              status: 'ASSUMPTION',
            },
          },
        },
      },
    },
    id: 'chennai-zone-05',
    name: 'Ward 052 - Royapuram',
  },

  // 4. Ward 134 - T. Nagar: 81 / 100 VERY_HIGH (Heat: 0.88, Veg: 0.80, Vuln: 0.70)
  {
    zoneId: 'ward-134',
    zoneName: 'Ward 134 - T. Nagar',
    wardId: 'ward-134',
    wardName: 'Ward 134 - T. Nagar',
    latitude: 13.0418,
    longitude: 80.2340,
    areaKm2: 6.8,
    dataSourceLabel: DEMO_DATA_LABEL,
    lastUpdated: '2026-03-01T00:00:00Z',
    metrics: {
      heat: {
        lst: {
          value: 39.8,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: DEMO_DATA_LABEL,
            confidence: 'MEDIUM',
            status: 'INDICATIVE_ESTIMATE',
          },
        },
        lstNormalized: {
          value: 0.88,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: DEMO_DATA_LABEL,
            confidence: 'MEDIUM',
            status: 'INDICATIVE_ESTIMATE',
          },
        },
      },
      vegetation: {
        ndvi: {
          value: 0.12,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: DEMO_DATA_LABEL,
            confidence: 'MEDIUM',
            status: 'INDICATIVE_ESTIMATE',
          },
        },
        vegetationDeficitNormalized: {
          value: 0.80,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: DEMO_DATA_LABEL,
            confidence: 'MEDIUM',
            status: 'INDICATIVE_ESTIMATE',
          },
        },
      },
      vulnerability: {
        vulnerabilityScore: {
          value: 0.70,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: DEMO_DATA_LABEL,
            confidence: 'MEDIUM',
            status: 'INDICATIVE_ESTIMATE',
          },
        },
        vulnerabilityComponents: {
          populationDensityPerKm2: {
            value: 24500,
            metadata: {
              sourceType: 'SYNTHETIC_DEMO',
              sourceName: DEMO_DATA_LABEL,
              confidence: 'LOW',
              status: 'ASSUMPTION',
            },
          },
          informalSettlementIndicator: {
            value: 0.30,
            metadata: {
              sourceType: 'SYNTHETIC_DEMO',
              sourceName: DEMO_DATA_LABEL,
              confidence: 'LOW',
              status: 'ASSUMPTION',
            },
          },
          outdoorWorkerExposure: {
            value: 0.65,
            metadata: {
              sourceType: 'SYNTHETIC_DEMO',
              sourceName: DEMO_DATA_LABEL,
              confidence: 'LOW',
              status: 'ASSUMPTION',
            },
          },
        },
      },
    },
    id: 'ward-134',
    name: 'Ward 134 - T. Nagar',
  },

  // 5. Ward 080 - Ambattur: 77 / 100 VERY_HIGH (Heat: 0.82, Veg: 0.70, Vuln: 0.7333)
  {
    zoneId: 'ward-080',
    zoneName: 'Ward 080 - Ambattur',
    wardId: 'ward-080',
    wardName: 'Ward 080 - Ambattur',
    latitude: 13.1143,
    longitude: 80.1548,
    areaKm2: 14.2,
    dataSourceLabel: DEMO_DATA_LABEL,
    lastUpdated: '2026-03-01T00:00:00Z',
    metrics: {
      heat: {
        lst: {
          value: 38.5,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: DEMO_DATA_LABEL,
            confidence: 'MEDIUM',
            status: 'INDICATIVE_ESTIMATE',
          },
        },
        lstNormalized: {
          value: 0.82,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: DEMO_DATA_LABEL,
            confidence: 'MEDIUM',
            status: 'INDICATIVE_ESTIMATE',
          },
        },
      },
      vegetation: {
        ndvi: {
          value: 0.16,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: DEMO_DATA_LABEL,
            confidence: 'MEDIUM',
            status: 'INDICATIVE_ESTIMATE',
          },
        },
        vegetationDeficitNormalized: {
          value: 0.70,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: DEMO_DATA_LABEL,
            confidence: 'MEDIUM',
            status: 'INDICATIVE_ESTIMATE',
          },
        },
      },
      vulnerability: {
        vulnerabilityScore: {
          value: 0.7333,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: DEMO_DATA_LABEL,
            confidence: 'MEDIUM',
            status: 'INDICATIVE_ESTIMATE',
          },
        },
        vulnerabilityComponents: {
          populationDensityPerKm2: {
            value: 18200,
            metadata: {
              sourceType: 'SYNTHETIC_DEMO',
              sourceName: DEMO_DATA_LABEL,
              confidence: 'LOW',
              status: 'ASSUMPTION',
            },
          },
          informalSettlementIndicator: {
            value: 0.40,
            metadata: {
              sourceType: 'SYNTHETIC_DEMO',
              sourceName: DEMO_DATA_LABEL,
              confidence: 'LOW',
              status: 'ASSUMPTION',
            },
          },
          outdoorWorkerExposure: {
            value: 0.72,
            metadata: {
              sourceType: 'SYNTHETIC_DEMO',
              sourceName: DEMO_DATA_LABEL,
              confidence: 'LOW',
              status: 'ASSUMPTION',
            },
          },
        },
      },
    },
    id: 'ward-080',
    name: 'Ward 080 - Ambattur',
  },

  // 6. Ward 156 - Velachery: 73 / 100 HIGH (Heat: 0.76, Veg: 0.65, Vuln: 0.7333)
  {
    zoneId: 'ward-156',
    zoneName: 'Ward 156 - Velachery',
    wardId: 'ward-156',
    wardName: 'Ward 156 - Velachery',
    latitude: 12.9815,
    longitude: 80.2180,
    areaKm2: 11.5,
    dataSourceLabel: DEMO_DATA_LABEL,
    lastUpdated: '2026-03-01T00:00:00Z',
    metrics: {
      heat: {
        lst: {
          value: 37.2,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: DEMO_DATA_LABEL,
            confidence: 'MEDIUM',
            status: 'INDICATIVE_ESTIMATE',
          },
        },
        lstNormalized: {
          value: 0.76,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: DEMO_DATA_LABEL,
            confidence: 'MEDIUM',
            status: 'INDICATIVE_ESTIMATE',
          },
        },
      },
      vegetation: {
        ndvi: {
          value: 0.18,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: DEMO_DATA_LABEL,
            confidence: 'MEDIUM',
            status: 'INDICATIVE_ESTIMATE',
          },
        },
        vegetationDeficitNormalized: {
          value: 0.65,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: DEMO_DATA_LABEL,
            confidence: 'MEDIUM',
            status: 'INDICATIVE_ESTIMATE',
          },
        },
      },
      vulnerability: {
        vulnerabilityScore: {
          value: 0.7333,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: DEMO_DATA_LABEL,
            confidence: 'MEDIUM',
            status: 'INDICATIVE_ESTIMATE',
          },
        },
        vulnerabilityComponents: {
          populationDensityPerKm2: {
            value: 19400,
            metadata: {
              sourceType: 'SYNTHETIC_DEMO',
              sourceName: DEMO_DATA_LABEL,
              confidence: 'LOW',
              status: 'ASSUMPTION',
            },
          },
          informalSettlementIndicator: {
            value: 0.35,
            metadata: {
              sourceType: 'SYNTHETIC_DEMO',
              sourceName: DEMO_DATA_LABEL,
              confidence: 'LOW',
              status: 'ASSUMPTION',
            },
          },
          outdoorWorkerExposure: {
            value: 0.45,
            metadata: {
              sourceType: 'SYNTHETIC_DEMO',
              sourceName: DEMO_DATA_LABEL,
              confidence: 'LOW',
              status: 'ASSUMPTION',
            },
          },
        },
      },
    },
    id: 'ward-156',
    name: 'Ward 156 - Velachery',
  },

  // 7. Ward 108 - Kodambakkam: 63 / 100 HIGH (Heat: 0.70, Veg: 0.50, Vuln: 0.60)
  {
    zoneId: 'ward-108',
    zoneName: 'Ward 108 - Kodambakkam',
    wardId: 'ward-108',
    wardName: 'Ward 108 - Kodambakkam',
    latitude: 13.0510,
    longitude: 80.2240,
    areaKm2: 7.9,
    dataSourceLabel: DEMO_DATA_LABEL,
    lastUpdated: '2026-03-01T00:00:00Z',
    metrics: {
      heat: {
        lst: {
          value: 36.0,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: DEMO_DATA_LABEL,
            confidence: 'MEDIUM',
            status: 'INDICATIVE_ESTIMATE',
          },
        },
        lstNormalized: {
          value: 0.70,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: DEMO_DATA_LABEL,
            confidence: 'MEDIUM',
            status: 'INDICATIVE_ESTIMATE',
          },
        },
      },
      vegetation: {
        ndvi: {
          value: 0.22,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: DEMO_DATA_LABEL,
            confidence: 'MEDIUM',
            status: 'INDICATIVE_ESTIMATE',
          },
        },
        vegetationDeficitNormalized: {
          value: 0.50,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: DEMO_DATA_LABEL,
            confidence: 'MEDIUM',
            status: 'INDICATIVE_ESTIMATE',
          },
        },
      },
      vulnerability: {
        vulnerabilityScore: {
          value: 0.60,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: DEMO_DATA_LABEL,
            confidence: 'MEDIUM',
            status: 'INDICATIVE_ESTIMATE',
          },
        },
        vulnerabilityComponents: {
          populationDensityPerKm2: {
            value: 21000,
            metadata: {
              sourceType: 'SYNTHETIC_DEMO',
              sourceName: DEMO_DATA_LABEL,
              confidence: 'LOW',
              status: 'ASSUMPTION',
            },
          },
          informalSettlementIndicator: {
            value: 0.28,
            metadata: {
              sourceType: 'SYNTHETIC_DEMO',
              sourceName: DEMO_DATA_LABEL,
              confidence: 'LOW',
              status: 'ASSUMPTION',
            },
          },
          outdoorWorkerExposure: {
            value: 0.50,
            metadata: {
              sourceType: 'SYNTHETIC_DEMO',
              sourceName: DEMO_DATA_LABEL,
              confidence: 'LOW',
              status: 'ASSUMPTION',
            },
          },
        },
      },
    },
    id: 'ward-108',
    name: 'Ward 108 - Kodambakkam',
  },

  // 8. Ward 114 - Mylapore: 62 / 100 HIGH (Heat: 0.68, Veg: 0.50, Vuln: 0.60)
  {
    zoneId: 'ward-114',
    zoneName: 'Ward 114 - Mylapore',
    wardId: 'ward-114',
    wardName: 'Ward 114 - Mylapore',
    latitude: 13.0330,
    longitude: 80.2680,
    areaKm2: 6.5,
    dataSourceLabel: DEMO_DATA_LABEL,
    lastUpdated: '2026-03-01T00:00:00Z',
    metrics: {
      heat: {
        lst: {
          value: 35.5,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: DEMO_DATA_LABEL,
            confidence: 'MEDIUM',
            status: 'INDICATIVE_ESTIMATE',
          },
        },
        lstNormalized: {
          value: 0.68,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: DEMO_DATA_LABEL,
            confidence: 'MEDIUM',
            status: 'INDICATIVE_ESTIMATE',
          },
        },
      },
      vegetation: {
        ndvi: {
          value: 0.22,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: DEMO_DATA_LABEL,
            confidence: 'MEDIUM',
            status: 'INDICATIVE_ESTIMATE',
          },
        },
        vegetationDeficitNormalized: {
          value: 0.50,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: DEMO_DATA_LABEL,
            confidence: 'MEDIUM',
            status: 'INDICATIVE_ESTIMATE',
          },
        },
      },
      vulnerability: {
        vulnerabilityScore: {
          value: 0.60,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: DEMO_DATA_LABEL,
            confidence: 'MEDIUM',
            status: 'INDICATIVE_ESTIMATE',
          },
        },
        vulnerabilityComponents: {
          populationDensityPerKm2: {
            value: 22600,
            metadata: {
              sourceType: 'SYNTHETIC_DEMO',
              sourceName: DEMO_DATA_LABEL,
              confidence: 'LOW',
              status: 'ASSUMPTION',
            },
          },
          informalSettlementIndicator: {
            value: 0.25,
            metadata: {
              sourceType: 'SYNTHETIC_DEMO',
              sourceName: DEMO_DATA_LABEL,
              confidence: 'LOW',
              status: 'ASSUMPTION',
            },
          },
          outdoorWorkerExposure: {
            value: 0.42,
            metadata: {
              sourceType: 'SYNTHETIC_DEMO',
              sourceName: DEMO_DATA_LABEL,
              confidence: 'LOW',
              status: 'ASSUMPTION',
            },
          },
        },
      },
    },
    id: 'ward-114',
    name: 'Ward 114 - Mylapore',
  },

  // 9. Ward 175 - Adyar: 42 / 100 MODERATE (Heat: 0.46, Veg: 0.35, Vuln: 0.40)
  {
    zoneId: 'ward-175',
    zoneName: 'Ward 175 - Adyar',
    wardId: 'ward-175',
    wardName: 'Ward 175 - Adyar',
    latitude: 13.0012,
    longitude: 80.2565,
    areaKm2: 8.4,
    dataSourceLabel: DEMO_DATA_LABEL,
    lastUpdated: '2026-03-01T00:00:00Z',
    metrics: {
      heat: {
        lst: {
          value: 32.5,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: DEMO_DATA_LABEL,
            confidence: 'MEDIUM',
            status: 'INDICATIVE_ESTIMATE',
          },
        },
        lstNormalized: {
          value: 0.46,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: DEMO_DATA_LABEL,
            confidence: 'MEDIUM',
            status: 'INDICATIVE_ESTIMATE',
          },
        },
      },
      vegetation: {
        ndvi: {
          value: 0.35,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: DEMO_DATA_LABEL,
            confidence: 'MEDIUM',
            status: 'INDICATIVE_ESTIMATE',
          },
        },
        vegetationDeficitNormalized: {
          value: 0.35,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: DEMO_DATA_LABEL,
            confidence: 'MEDIUM',
            status: 'INDICATIVE_ESTIMATE',
          },
        },
      },
      vulnerability: {
        vulnerabilityScore: {
          value: 0.40,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: DEMO_DATA_LABEL,
            confidence: 'MEDIUM',
            status: 'INDICATIVE_ESTIMATE',
          },
        },
        vulnerabilityComponents: {
          populationDensityPerKm2: {
            value: 14800,
            metadata: {
              sourceType: 'SYNTHETIC_DEMO',
              sourceName: DEMO_DATA_LABEL,
              confidence: 'LOW',
              status: 'ASSUMPTION',
            },
          },
          informalSettlementIndicator: {
            value: 0.15,
            metadata: {
              sourceType: 'SYNTHETIC_DEMO',
              sourceName: DEMO_DATA_LABEL,
              confidence: 'LOW',
              status: 'ASSUMPTION',
            },
          },
          outdoorWorkerExposure: {
            value: 0.30,
            metadata: {
              sourceType: 'SYNTHETIC_DEMO',
              sourceName: DEMO_DATA_LABEL,
              confidence: 'LOW',
              status: 'ASSUMPTION',
            },
          },
        },
      },
    },
    id: 'ward-175',
    name: 'Ward 175 - Adyar',
  },

  // 10. Ward 198 - Sholinganallur: NULL / INSUFFICIENT_EVIDENCE (Completeness: 30%, Heat: null, Veg: null, Vuln: 0.40)
  {
    zoneId: 'ward-198',
    zoneName: 'Ward 198 - Sholinganallur',
    wardId: 'ward-198',
    wardName: 'Ward 198 - Sholinganallur',
    latitude: 12.9010,
    longitude: 80.2279,
    areaKm2: 35.0,
    dataSourceLabel: DEMO_DATA_LABEL,
    lastUpdated: '2026-03-01T00:00:00Z',
    metrics: {
      heat: {
        lst: {
          value: null,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: DEMO_DATA_LABEL,
            confidence: 'UNKNOWN',
            status: 'UNKNOWN',
          },
          notes: 'Satellite thermal band occluded by coastal cloud cover',
        },
        lstNormalized: {
          value: null,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: DEMO_DATA_LABEL,
            confidence: 'UNKNOWN',
            status: 'UNKNOWN',
          },
        },
      },
      vegetation: {
        ndvi: {
          value: null,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: DEMO_DATA_LABEL,
            confidence: 'UNKNOWN',
            status: 'UNKNOWN',
          },
          notes: 'Multispectral NDVI raster missing for ward interval',
        },
        vegetationDeficitNormalized: {
          value: null,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: DEMO_DATA_LABEL,
            confidence: 'UNKNOWN',
            status: 'UNKNOWN',
          },
        },
      },
      vulnerability: {
        vulnerabilityScore: {
          value: 0.40,
          metadata: {
            sourceType: 'SYNTHETIC_DEMO',
            sourceName: DEMO_DATA_LABEL,
            confidence: 'MEDIUM',
            status: 'INDICATIVE_ESTIMATE',
          },
        },
        vulnerabilityComponents: {
          populationDensityPerKm2: {
            value: 8500,
            metadata: {
              sourceType: 'SYNTHETIC_DEMO',
              sourceName: DEMO_DATA_LABEL,
              confidence: 'LOW',
              status: 'ASSUMPTION',
            },
          },
          informalSettlementIndicator: {
            value: 0.18,
            metadata: {
              sourceType: 'SYNTHETIC_DEMO',
              sourceName: DEMO_DATA_LABEL,
              confidence: 'LOW',
              status: 'ASSUMPTION',
            },
          },
          outdoorWorkerExposure: {
            value: 0.35,
            metadata: {
              sourceType: 'SYNTHETIC_DEMO',
              sourceName: DEMO_DATA_LABEL,
              confidence: 'LOW',
              status: 'ASSUMPTION',
            },
          },
        },
      },
    },
    id: 'chennai-zone-02',
    name: 'Ward 198 - Sholinganallur',
  },
];

/**
 * Demo Zone Data Provider
 */
export class DemoZoneDataProvider implements IZoneDataProvider {
  readonly mode = 'demo' as const;

  async getZones(): Promise<Zone[]> {
    return CHENNAI_DEMO_ZONES;
  }

  async getZoneById(id: string): Promise<Zone | undefined> {
    return CHENNAI_DEMO_ZONES.find((z) => z.zoneId === id || z.id === id || z.wardId === id);
  }

  getProvenanceSummary(): DataProvenanceSummary {
    return {
      mode: 'demo',
      datasetLabel: DEMO_DATA_LABEL,
      sourceDescription: 'Deterministic synthetic baseline across 10 Greater Chennai Corporation wards',
      heatMetricProvenance: 'INDICATIVE_ESTIMATE',
      vegetationMetricProvenance: 'INDICATIVE_ESTIMATE',
      socialMetricProvenance: 'ASSUMPTION',
      isDemoFallbackActive: true,
    };
  }
}

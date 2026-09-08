import type { Intervention } from '../../types';

/**
 * RESPIRE - Future Intervention Catalog
 * 
 * =========================================================================
 * MANDATORY CREDIBILITY & PROVENANCE NOTICE:
 * 
 * 1. Costs and impacts in this catalogue are strictly planning and demo values.
 * 2. They are labeled either:
 *    - 'INDICATIVE_ESTIMATE': Intentionally retained only as an illustrative
 *      planning/demo benchmark.
 *    - 'UNKNOWN': Where no defensible estimate is configured.
 * 3. NO value is labeled 'DERIVED' or 'SOURCED' because the repository does not
 *    currently contain an empirical peer-reviewed derivation dataset.
 * 4. We strictly avoid presenting unsupported scientific effectiveness as
 *    guaranteed cooling, exact temperature reductions, or official municipal costs.
 * =========================================================================
 */

export const ILLUSTRATIVE_INTERVENTIONS: Intervention[] = [
  {
    interventionId: 'int-cool-roof-01',
    interventionName: 'High-Albedo Reflective Cool Roof Coating',
    category: 'COOL_ROOF',
    description:
      'Application of high-solar-reflectance (SRI > 78) elastomeric coating on non-insulated concrete and sheet roofs in dense built corridors.',
    applicabilityConditions: [
      {
        metricKey: 'heat.lstNormalized',
        operator: '>=',
        threshold: 0.75,
        description: 'Zone exhibits severe normalized land surface temperature',
      },
    ],
    cost: 260,
    costUnit: 'INR / sq.m (Indicative planning estimate)',
    costStatus: 'INDICATIVE_ESTIMATE',
    impact: 2.8,
    impactUnit: '°C indoor ceiling temp reduction (Indicative planning estimate)',
    impactStatus: 'INDICATIVE_ESTIMATE',
    evidenceReference: 'Ahmedabad & GCC Cool Roofs Municipal Case Study (Indicative Benchmark)',
    assumptions: [
      'Indicative planning estimate: microclimate reduction varies by building orientation, ventilation, and roof materials',
      'Accessible flat concrete or corrugated tin roof surfaces required',
      'Community participation agreement for residential informal settlements',
    ],
    id: 'int-cool-roof-01',
    title: 'High-Albedo Reflective Cool Roof Coating',
  },
  {
    interventionId: 'int-shade-canopy-02',
    interventionName: 'Targeted Native Shade Tree Canopy',
    category: 'TARGETED_SHADE_CANOPY',
    description:
      'Avenue planting of native high-transpiration shade trees (Neem, Pongamia pinnata, Peepal) along exposed pedestrian arterial corridors.',
    applicabilityConditions: [
      {
        metricKey: 'heat.lstNormalized',
        operator: '>=',
        threshold: 0.70,
        description: 'Elevated surface heat index',
      },
      {
        metricKey: 'vegetation.vegetationDeficitNormalized',
        operator: '>=',
        threshold: 0.70,
        description: 'Severe canopy deficit in pedestrian right-of-way',
      },
    ],
    cost: 1850,
    costUnit: 'INR / sapling with tree-guard & 1st-year maintenance (Indicative planning estimate)',
    costStatus: 'INDICATIVE_ESTIMATE',
    impact: 3.2,
    impactUnit: '°C localized shaded surface temperature reduction (Indicative planning estimate)',
    impactStatus: 'INDICATIVE_ESTIMATE',
    evidenceReference: 'Urban Greening & Heat Mitigation Planning Manual (Indicative Benchmark)',
    assumptions: [
      'Indicative planning estimate: localized surface temperature relief requires mature crown canopy development',
      'Minimum 1.5m pedestrian pavement verge available without underground utility conflict',
      'Assumes 75% 2-year survival rate with regular municipal watering schedule',
    ],
    id: 'int-shade-canopy-02',
    title: 'Targeted Native Shade Tree Canopy',
  },
  {
    interventionId: 'int-worker-rest-03',
    interventionName: 'Modular Outdoor Worker Hydration & Cooling Station',
    category: 'COOLING_REST_STATION',
    description:
      'Deployment of high-albedo tensile fabric shade kiosks equipped with clean chilled drinking water, misting nozzles, and heat stress signage.',
    applicabilityConditions: [
      {
        metricKey: 'heat.lstNormalized',
        operator: '>=',
        threshold: 0.80,
        description: 'Critical heat exposure threshold',
      },
      {
        metricKey: 'vulnerability.vulnerabilityScore',
        operator: '>=',
        threshold: 0.70,
        description: 'High informal labor and outdoor transit vulnerability',
      },
    ],
    cost: 72000,
    costUnit: 'INR / modular 20-person kiosk (Indicative planning estimate)',
    costStatus: 'INDICATIVE_ESTIMATE',
    impact: 4.5,
    impactUnit: '°C microclimate heat stress relief under canopy (Indicative planning estimate)',
    impactStatus: 'INDICATIVE_ESTIMATE',
    evidenceReference: 'Labour Department Occupational Heat Stress Mitigation Guidelines (Indicative Benchmark)',
    assumptions: [
      'Indicative planning estimate: localized heat stress relief under active misting and tensile shade',
      'Access to municipal potable water and low-voltage electrical connection required',
      'Active daily operational monitoring during peak heat window (11:30 AM – 3:30 PM)',
    ],
    id: 'int-worker-rest-03',
    title: 'Modular Outdoor Worker Hydration & Cooling Station',
  },
  {
    interventionId: 'int-urban-greening-04',
    interventionName: 'Urban Pocket Greening & Permeable Bioswales',
    category: 'URBAN_GREENING',
    description:
      'Transformation of unpaved median strips and vacant municipal buffers into micro-greening gardens for evaporative cooling.',
    applicabilityConditions: [
      {
        metricKey: 'vegetation.vegetationDeficitNormalized',
        operator: '>=',
        threshold: 0.60,
        description: 'Moderate to high vegetation deficit',
      },
    ],
    cost: 1200,
    costUnit: 'INR / sq.m (Indicative planning estimate)',
    costStatus: 'INDICATIVE_ESTIMATE',
    impact: 1.6,
    impactUnit: '°C localized ambient reduction within 40m radius (Indicative planning estimate)',
    impactStatus: 'INDICATIVE_ESTIMATE',
    evidenceReference: 'C40 Urban Nature and Climate Adaptation Compendium (Indicative Benchmark)',
    assumptions: [
      'Indicative planning estimate: cooling radius dependent on soil moisture, vegetation volume, and prevailing wind',
      'Unencumbered municipal property boundary without drainage easement conflicts',
      'Low-maintenance drought-resistant perennial ground cover',
    ],
    id: 'int-urban-greening-04',
    title: 'Urban Pocket Greening & Permeable Bioswales',
  },
  {
    interventionId: 'int-insufficient-data-05',
    interventionName: 'Ground-Truth Thermal & Field Audit Required',
    category: 'INSUFFICIENT_EVIDENCE',
    description:
      'Remote sensing metrics are incomplete, occluded by cloud cover, or missing. Ground field inspection must precede municipal budget allocation.',
    applicabilityConditions: [
      {
        metricKey: 'heat.lst',
        operator: '==',
        threshold: 0,
        description: 'Missing or null heat sensor reading',
      },
    ],
    cost: null,
    costUnit: 'Cost: Unknown — requires ground field survey scoping',
    costStatus: 'UNKNOWN',
    impact: null,
    impactUnit: 'Impact: Unknown — evidence not yet configured',
    impactStatus: 'UNKNOWN',
    evidenceReference: 'RESPIRE Missing Data Safety Protocol',
    assumptions: [
      'No confident intervention recommendation or cost/impact estimate can be issued without complete ground-truth data',
    ],
    id: 'int-insufficient-data-05',
    title: 'Ground-Truth Thermal & Field Audit Required',
  },
];

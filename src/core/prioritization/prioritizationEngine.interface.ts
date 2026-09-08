import type { Zone, Intervention } from '../../types';

export interface PrioritizedInterventionItem {
  rank: number;
  zone: Pick<Zone, 'zoneId' | 'zoneName' | 'wardId' | 'wardName'>;
  intervention: Intervention;
  costImpactRatio: number;
  priorityRationale: string;
}

/**
 * Interface contract for RESPIRE Municipal Prioritization Engine.
 * Answers: "What should the municipality fund first?"
 * 
 * Note: Decoupled from UI and data source layers. Implementation reserved for subsequent step.
 */
export interface IPrioritizationEngine {
  prioritizeInterventions(
    zonesWithInterventions: { zone: Zone; interventions: Intervention[] }[]
  ): PrioritizedInterventionItem[];
}

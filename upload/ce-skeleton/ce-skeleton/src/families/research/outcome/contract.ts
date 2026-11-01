// Gerado por scripts/generate-skeleton.mjs a partir de catalog/service-catalog.v1.json.
// NÃO EDITAR À MÃO — edita o catálogo e regenera.
// Fonte: PROPOSED · CANDIDATE_HOLD · nenhuma autorização de execução.

export type ServiceStatus = 'CANDIDATE_HOLD' | 'ADMITTED' | 'RETIRED';

/** Contrato lógico de Outcome (família Research, camada DOMAIN). */
export interface outcomeContract {
  readonly serviceId: 'research.outcome';
  readonly title: string;
  readonly layer: 'DOMAIN';
  readonly status: ServiceStatus;
  /** Evidência de execução. null enquanto não existir run com hash, data e registo. */
  readonly evidence: string | null;
}

export const outcomeContract = {
  serviceId: 'research.outcome',
  title: 'Outcome',
  layer: 'DOMAIN',
  status: 'CANDIDATE_HOLD',
  evidence: null,
} as const;

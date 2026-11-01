// Gerado por scripts/generate-skeleton.mjs a partir de catalog/service-catalog.v1.json.
// NÃO EDITAR À MÃO — edita o catálogo e regenera.
// Fonte: PROPOSED · CANDIDATE_HOLD · nenhuma autorização de execução.

export type ServiceStatus = 'CANDIDATE_HOLD' | 'ADMITTED' | 'RETIRED';

/** Contrato lógico de PII Classification (família Privacy, camada PLATFORM). */
export interface piiClassificationContract {
  readonly serviceId: 'privacy.pii-classification';
  readonly title: string;
  readonly layer: 'PLATFORM';
  readonly status: ServiceStatus;
  /** Evidência de execução. null enquanto não existir run com hash, data e registo. */
  readonly evidence: string | null;
}

export const piiClassificationContract = {
  serviceId: 'privacy.pii-classification',
  title: 'PII Classification',
  layer: 'PLATFORM',
  status: 'CANDIDATE_HOLD',
  evidence: null,
} as const;

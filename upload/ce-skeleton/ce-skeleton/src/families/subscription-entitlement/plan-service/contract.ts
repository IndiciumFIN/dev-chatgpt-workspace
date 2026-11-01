// Gerado por scripts/generate-skeleton.mjs a partir de catalog/service-catalog.v1.json.
// NÃO EDITAR À MÃO — edita o catálogo e regenera.
// Fonte: PROPOSED · CANDIDATE_HOLD · nenhuma autorização de execução.

export type ServiceStatus = 'CANDIDATE_HOLD' | 'ADMITTED' | 'RETIRED';

/** Contrato lógico de Plan Service (família Subscription & Entitlement, camada PLATFORM). */
export interface planServiceContract {
  readonly serviceId: 'subscription-entitlement.plan-service';
  readonly title: string;
  readonly layer: 'PLATFORM';
  readonly status: ServiceStatus;
  /** Evidência de execução. null enquanto não existir run com hash, data e registo. */
  readonly evidence: string | null;
}

export const planServiceContract = {
  serviceId: 'subscription-entitlement.plan-service',
  title: 'Plan Service',
  layer: 'PLATFORM',
  status: 'CANDIDATE_HOLD',
  evidence: null,
} as const;

// Gerado por scripts/generate-skeleton.mjs a partir de catalog/service-catalog.v1.json.
// NÃO EDITAR À MÃO — edita o catálogo e regenera.
// Fonte: PROPOSED · CANDIDATE_HOLD · nenhuma autorização de execução.

export type ServiceStatus = 'CANDIDATE_HOLD' | 'ADMITTED' | 'RETIRED';

/** Contrato lógico de Content Studio (família Admin / Control Plane, camada DOMAIN). */
export interface contentStudioContract {
  readonly serviceId: 'admin-control-plane.content-studio';
  readonly title: string;
  readonly layer: 'DOMAIN';
  readonly status: ServiceStatus;
  /** Evidência de execução. null enquanto não existir run com hash, data e registo. */
  readonly evidence: string | null;
}

export const contentStudioContract = {
  serviceId: 'admin-control-plane.content-studio',
  title: 'Content Studio',
  layer: 'DOMAIN',
  status: 'CANDIDATE_HOLD',
  evidence: null,
} as const;

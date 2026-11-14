// Gerado por scripts/generate-skeleton.mjs a partir de catalog/service-catalog.v1.json.
// NÃO EDITAR À MÃO — edita o catálogo e regenera.
// Fonte: PROPOSED · CANDIDATE_HOLD · nenhuma autorização de execução.

export type ServiceStatus = 'CANDIDATE_HOLD' | 'ADMITTED' | 'RETIRED';

/** Contrato lógico de Jurisdiction Resolver (família Source & Acquisition, camada DOMAIN). */
export interface jurisdictionResolverContract {
  readonly serviceId: 'source-acquisition.jurisdiction-resolver';
  readonly title: string;
  readonly layer: 'DOMAIN';
  readonly status: ServiceStatus;
  /** Evidência de execução. null enquanto não existir run com hash, data e registo. */
  readonly evidence: string | null;
}

export const jurisdictionResolverContract = {
  serviceId: 'source-acquisition.jurisdiction-resolver',
  title: 'Jurisdiction Resolver',
  layer: 'DOMAIN',
  status: 'CANDIDATE_HOLD',
  evidence: null,
} as const;

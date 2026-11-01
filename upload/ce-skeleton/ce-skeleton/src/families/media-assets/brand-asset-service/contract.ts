// Gerado por scripts/generate-skeleton.mjs a partir de catalog/service-catalog.v1.json.
// NÃO EDITAR À MÃO — edita o catálogo e regenera.
// Fonte: PROPOSED · CANDIDATE_HOLD · nenhuma autorização de execução.

export type ServiceStatus = 'CANDIDATE_HOLD' | 'ADMITTED' | 'RETIRED';

/** Contrato lógico de Brand Asset Service (família Media & Assets, camada CROSS_CUTTING). */
export interface brandAssetServiceContract {
  readonly serviceId: 'media-assets.brand-asset-service';
  readonly title: string;
  readonly layer: 'CROSS_CUTTING';
  readonly status: ServiceStatus;
  /** Evidência de execução. null enquanto não existir run com hash, data e registo. */
  readonly evidence: string | null;
}

export const brandAssetServiceContract = {
  serviceId: 'media-assets.brand-asset-service',
  title: 'Brand Asset Service',
  layer: 'CROSS_CUTTING',
  status: 'CANDIDATE_HOLD',
  evidence: null,
} as const;

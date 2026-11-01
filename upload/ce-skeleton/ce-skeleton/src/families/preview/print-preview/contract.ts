// Gerado por scripts/generate-skeleton.mjs a partir de catalog/service-catalog.v1.json.
// NÃO EDITAR À MÃO — edita o catálogo e regenera.
// Fonte: PROPOSED · CANDIDATE_HOLD · nenhuma autorização de execução.

export type ServiceStatus = 'CANDIDATE_HOLD' | 'ADMITTED' | 'RETIRED';

/** Contrato lógico de Print Preview (família Preview, camada DOMAIN). */
export interface printPreviewContract {
  readonly serviceId: 'preview.print-preview';
  readonly title: string;
  readonly layer: 'DOMAIN';
  readonly status: ServiceStatus;
  /** Evidência de execução. null enquanto não existir run com hash, data e registo. */
  readonly evidence: string | null;
}

export const printPreviewContract = {
  serviceId: 'preview.print-preview',
  title: 'Print Preview',
  layer: 'DOMAIN',
  status: 'CANDIDATE_HOLD',
  evidence: null,
} as const;

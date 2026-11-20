// Gerado por scripts/generate-skeleton.mjs a partir de catalog/service-catalog.v1.json.
// NÃO EDITAR À MÃO — edita o catálogo e regenera.
// Fonte: PROPOSED · CANDIDATE_HOLD · nenhuma autorização de execução.

export type ServiceStatus = 'CANDIDATE_HOLD' | 'ADMITTED' | 'RETIRED';

/** Contrato lógico de Source Eligibility/Licensing (família Source & Acquisition, camada DOMAIN). */
export interface sourceEligibilityLicensingContract {
  readonly serviceId: 'source-acquisition.source-eligibility-licensing';
  readonly title: string;
  readonly layer: 'DOMAIN';
  readonly status: ServiceStatus;
  /** Evidência de execução. null enquanto não existir run com hash, data e registo. */
  readonly evidence: string | null;
}

export const sourceEligibilityLicensingContract = {
  serviceId: 'source-acquisition.source-eligibility-licensing',
  title: 'Source Eligibility/Licensing',
  layer: 'DOMAIN',
  status: 'CANDIDATE_HOLD',
  evidence: null,
} as const;

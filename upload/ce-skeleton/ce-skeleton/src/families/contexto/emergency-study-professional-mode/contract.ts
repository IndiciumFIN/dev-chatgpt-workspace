// Gerado por scripts/generate-skeleton.mjs a partir de catalog/service-catalog.v1.json.
// NÃO EDITAR À MÃO — edita o catálogo e regenera.
// Fonte: PROPOSED · CANDIDATE_HOLD · nenhuma autorização de execução.

export type ServiceStatus = 'CANDIDATE_HOLD' | 'ADMITTED' | 'RETIRED';

/** Contrato lógico de Emergency/Study/Professional mode (família Contexto, camada DOMAIN). */
export interface emergencyStudyProfessionalModeContract {
  readonly serviceId: 'contexto.emergency-study-professional-mode';
  readonly title: string;
  readonly layer: 'DOMAIN';
  readonly status: ServiceStatus;
  /** Evidência de execução. null enquanto não existir run com hash, data e registo. */
  readonly evidence: string | null;
}

export const emergencyStudyProfessionalModeContract = {
  serviceId: 'contexto.emergency-study-professional-mode',
  title: 'Emergency/Study/Professional mode',
  layer: 'DOMAIN',
  status: 'CANDIDATE_HOLD',
  evidence: null,
} as const;

// Gerado por scripts/generate-skeleton.mjs a partir de catalog/service-catalog.v1.json.
// NÃO EDITAR À MÃO — edita o catálogo e regenera.
// Fonte: PROPOSED · CANDIDATE_HOLD · nenhuma autorização de execução.

export type ServiceStatus = 'CANDIDATE_HOLD' | 'ADMITTED' | 'RETIRED';

/** Contrato lógico de Maker/Checker/Auditor separation (família Audit & Assurance, camada CROSS_CUTTING). */
export interface makerCheckerAuditorSeparationContract {
  readonly serviceId: 'audit-assurance.maker-checker-auditor-separation';
  readonly title: string;
  readonly layer: 'CROSS_CUTTING';
  readonly status: ServiceStatus;
  /** Evidência de execução. null enquanto não existir run com hash, data e registo. */
  readonly evidence: string | null;
}

export const makerCheckerAuditorSeparationContract = {
  serviceId: 'audit-assurance.maker-checker-auditor-separation',
  title: 'Maker/Checker/Auditor separation',
  layer: 'CROSS_CUTTING',
  status: 'CANDIDATE_HOLD',
  evidence: null,
} as const;

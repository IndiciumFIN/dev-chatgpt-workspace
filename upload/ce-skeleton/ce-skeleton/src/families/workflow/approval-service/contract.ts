// Gerado por scripts/generate-skeleton.mjs a partir de catalog/service-catalog.v1.json.
// NÃO EDITAR À MÃO — edita o catálogo e regenera.
// Fonte: PROPOSED · CANDIDATE_HOLD · nenhuma autorização de execução.

export type ServiceStatus = 'CANDIDATE_HOLD' | 'ADMITTED' | 'RETIRED';

/** Contrato lógico de Approval Service (família Workflow, camada PLATFORM). */
export interface approvalServiceContract {
  readonly serviceId: 'workflow.approval-service';
  readonly title: string;
  readonly layer: 'PLATFORM';
  readonly status: ServiceStatus;
  /** Evidência de execução. null enquanto não existir run com hash, data e registo. */
  readonly evidence: string | null;
}

export const approvalServiceContract = {
  serviceId: 'workflow.approval-service',
  title: 'Approval Service',
  layer: 'PLATFORM',
  status: 'CANDIDATE_HOLD',
  evidence: null,
} as const;

// Gerado por scripts/generate-skeleton.mjs a partir de catalog/service-catalog.v1.json.
// NÃO EDITAR À MÃO — edita o catálogo e regenera.
// Fonte: PROPOSED · CANDIDATE_HOLD · nenhuma autorização de execução.

export type ServiceStatus = 'CANDIDATE_HOLD' | 'ADMITTED' | 'RETIRED';

/** Contrato lógico de Anonymous/Pseudonymous Workspace (família Identity & Access, camada PLATFORM). */
export interface anonymousPseudonymousWorkspaceContract {
  readonly serviceId: 'identity-access.anonymous-pseudonymous-workspace';
  readonly title: string;
  readonly layer: 'PLATFORM';
  readonly status: ServiceStatus;
  /** Evidência de execução. null enquanto não existir run com hash, data e registo. */
  readonly evidence: string | null;
}

export const anonymousPseudonymousWorkspaceContract = {
  serviceId: 'identity-access.anonymous-pseudonymous-workspace',
  title: 'Anonymous/Pseudonymous Workspace',
  layer: 'PLATFORM',
  status: 'CANDIDATE_HOLD',
  evidence: null,
} as const;

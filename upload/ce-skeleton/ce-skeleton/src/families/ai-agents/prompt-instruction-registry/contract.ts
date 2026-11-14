// Gerado por scripts/generate-skeleton.mjs a partir de catalog/service-catalog.v1.json.
// NÃO EDITAR À MÃO — edita o catálogo e regenera.
// Fonte: PROPOSED · CANDIDATE_HOLD · nenhuma autorização de execução.

export type ServiceStatus = 'CANDIDATE_HOLD' | 'ADMITTED' | 'RETIRED';

/** Contrato lógico de Prompt/Instruction Registry (família AI & Agents, camada PLATFORM). */
export interface promptInstructionRegistryContract {
  readonly serviceId: 'ai-agents.prompt-instruction-registry';
  readonly title: string;
  readonly layer: 'PLATFORM';
  readonly status: ServiceStatus;
  /** Evidência de execução. null enquanto não existir run com hash, data e registo. */
  readonly evidence: string | null;
}

export const promptInstructionRegistryContract = {
  serviceId: 'ai-agents.prompt-instruction-registry',
  title: 'Prompt/Instruction Registry',
  layer: 'PLATFORM',
  status: 'CANDIDATE_HOLD',
  evidence: null,
} as const;

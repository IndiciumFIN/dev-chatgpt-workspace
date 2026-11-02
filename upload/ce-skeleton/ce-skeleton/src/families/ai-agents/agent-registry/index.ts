// Gerado por scripts/generate-skeleton.mjs a partir de catalog/service-catalog.v1.json.
// NÃO EDITAR À MÃO — edita o catálogo e regenera.
// Fonte: PROPOSED · CANDIDATE_HOLD · nenhuma autorização de execução.

import { agentRegistryContract } from './contract';

/**
 * Agent Registry — esqueleto declarado, NÃO implementado.
 * Qualquer chamada tem de falhar de forma explícita até existir admissão + evidência.
 */
export function agentRegistry(): typeof agentRegistryContract {
  if (agentRegistryContract.status !== 'ADMITTED') {
    throw new Error('NOT_IMPLEMENTED_CANDIDATE_HOLD: ai-agents.agent-registry — requer admissão (WO/OPA/Kernel) e evidência.');
  }
  return agentRegistryContract;
}

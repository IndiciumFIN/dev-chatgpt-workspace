// Gerado por scripts/generate-skeleton.mjs a partir de catalog/service-catalog.v1.json.
// NÃO EDITAR À MÃO — edita o catálogo e regenera.
// Fonte: PROPOSED · CANDIDATE_HOLD · nenhuma autorização de execução.

import { entityResolutionContract } from './contract';

/**
 * Entity Resolution — esqueleto declarado, NÃO implementado.
 * Qualquer chamada tem de falhar de forma explícita até existir admissão + evidência.
 */
export function entityResolution(): typeof entityResolutionContract {
  if (entityResolutionContract.status !== 'ADMITTED') {
    throw new Error('NOT_IMPLEMENTED_CANDIDATE_HOLD: canonical-knowledge.entity-resolution — requer admissão (WO/OPA/Kernel) e evidência.');
  }
  return entityResolutionContract;
}

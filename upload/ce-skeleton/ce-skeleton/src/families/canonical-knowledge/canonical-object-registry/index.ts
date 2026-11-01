// Gerado por scripts/generate-skeleton.mjs a partir de catalog/service-catalog.v1.json.
// NÃO EDITAR À MÃO — edita o catálogo e regenera.
// Fonte: PROPOSED · CANDIDATE_HOLD · nenhuma autorização de execução.

import { canonicalObjectRegistryContract } from './contract';

/**
 * Canonical Object Registry — esqueleto declarado, NÃO implementado.
 * Qualquer chamada tem de falhar de forma explícita até existir admissão + evidência.
 */
export function canonicalObjectRegistry(): typeof canonicalObjectRegistryContract {
  if (canonicalObjectRegistryContract.status !== 'ADMITTED') {
    throw new Error('NOT_IMPLEMENTED_CANDIDATE_HOLD: canonical-knowledge.canonical-object-registry — requer admissão (WO/OPA/Kernel) e evidência.');
  }
  return canonicalObjectRegistryContract;
}

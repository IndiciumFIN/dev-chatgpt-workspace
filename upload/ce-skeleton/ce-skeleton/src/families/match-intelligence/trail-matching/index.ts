// Gerado por scripts/generate-skeleton.mjs a partir de catalog/service-catalog.v1.json.
// NÃO EDITAR À MÃO — edita o catálogo e regenera.
// Fonte: PROPOSED · CANDIDATE_HOLD · nenhuma autorização de execução.

import { trailMatchingContract } from './contract';

/**
 * Trail Matching — esqueleto declarado, NÃO implementado.
 * Qualquer chamada tem de falhar de forma explícita até existir admissão + evidência.
 */
export function trailMatching(): typeof trailMatchingContract {
  if (trailMatchingContract.status !== 'ADMITTED') {
    throw new Error('NOT_IMPLEMENTED_CANDIDATE_HOLD: match-intelligence.trail-matching — requer admissão (WO/OPA/Kernel) e evidência.');
  }
  return trailMatchingContract;
}

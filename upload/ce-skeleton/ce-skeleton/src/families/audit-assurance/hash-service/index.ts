// Gerado por scripts/generate-skeleton.mjs a partir de catalog/service-catalog.v1.json.
// NÃO EDITAR À MÃO — edita o catálogo e regenera.
// Fonte: PROPOSED · CANDIDATE_HOLD · nenhuma autorização de execução.

import { hashServiceContract } from './contract';

/**
 * Hash Service — esqueleto declarado, NÃO implementado.
 * Qualquer chamada tem de falhar de forma explícita até existir admissão + evidência.
 */
export function hashService(): typeof hashServiceContract {
  if (hashServiceContract.status !== 'ADMITTED') {
    throw new Error('NOT_IMPLEMENTED_CANDIDATE_HOLD: audit-assurance.hash-service — requer admissão (WO/OPA/Kernel) e evidência.');
  }
  return hashServiceContract;
}

// Gerado por scripts/generate-skeleton.mjs a partir de catalog/service-catalog.v1.json.
// NÃO EDITAR À MÃO — edita o catálogo e regenera.
// Fonte: PROPOSED · CANDIDATE_HOLD · nenhuma autorização de execução.

import { bcp47Contract } from './contract';

/**
 * BCP47 — esqueleto declarado, NÃO implementado.
 * Qualquer chamada tem de falhar de forma explícita até existir admissão + evidência.
 */
export function bcp47(): typeof bcp47Contract {
  if (bcp47Contract.status !== 'ADMITTED') {
    throw new Error('NOT_IMPLEMENTED_CANDIDATE_HOLD: localization.bcp47 — requer admissão (WO/OPA/Kernel) e evidência.');
  }
  return bcp47Contract;
}

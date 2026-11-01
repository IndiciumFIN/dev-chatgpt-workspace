// Gerado por scripts/generate-skeleton.mjs a partir de catalog/service-catalog.v1.json.
// NÃO EDITAR À MÃO — edita o catálogo e regenera.
// Fonte: PROPOSED · CANDIDATE_HOLD · nenhuma autorização de execução.

import { porQueEstouVendoIssoContract } from './contract';

/**
 * “Por que estou vendo isso?” — esqueleto declarado, NÃO implementado.
 * Qualquer chamada tem de falhar de forma explícita até existir admissão + evidência.
 */
export function porQueEstouVendoIsso(): typeof porQueEstouVendoIssoContract {
  if (porQueEstouVendoIssoContract.status !== 'ADMITTED') {
    throw new Error('NOT_IMPLEMENTED_CANDIDATE_HOLD: ajuda-contextual.por-que-estou-vendo-isso — requer admissão (WO/OPA/Kernel) e evidência.');
  }
  return porQueEstouVendoIssoContract;
}

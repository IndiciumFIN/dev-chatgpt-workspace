// Gerado por scripts/generate-skeleton.mjs a partir de catalog/service-catalog.v1.json.
// NÃO EDITAR À MÃO — edita o catálogo e regenera.
// Fonte: PROPOSED · CANDIDATE_HOLD · nenhuma autorização de execução.

import { semanticSearchContract } from './contract';

/**
 * Semantic Search — esqueleto declarado, NÃO implementado.
 * Qualquer chamada tem de falhar de forma explícita até existir admissão + evidência.
 */
export function semanticSearch(): typeof semanticSearchContract {
  if (semanticSearchContract.status !== 'ADMITTED') {
    throw new Error('NOT_IMPLEMENTED_CANDIDATE_HOLD: discovery.semantic-search — requer admissão (WO/OPA/Kernel) e evidência.');
  }
  return semanticSearchContract;
}

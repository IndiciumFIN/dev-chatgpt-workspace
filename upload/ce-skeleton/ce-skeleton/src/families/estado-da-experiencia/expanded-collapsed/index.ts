// Gerado por scripts/generate-skeleton.mjs a partir de catalog/service-catalog.v1.json.
// NÃO EDITAR À MÃO — edita o catálogo e regenera.
// Fonte: PROPOSED · CANDIDATE_HOLD · nenhuma autorização de execução.

import { expandedCollapsedContract } from './contract';

/**
 * Expanded/Collapsed — esqueleto declarado, NÃO implementado.
 * Qualquer chamada tem de falhar de forma explícita até existir admissão + evidência.
 */
export function expandedCollapsed(): typeof expandedCollapsedContract {
  if (expandedCollapsedContract.status !== 'ADMITTED') {
    throw new Error('NOT_IMPLEMENTED_CANDIDATE_HOLD: estado-da-experiencia.expanded-collapsed — requer admissão (WO/OPA/Kernel) e evidência.');
  }
  return expandedCollapsedContract;
}

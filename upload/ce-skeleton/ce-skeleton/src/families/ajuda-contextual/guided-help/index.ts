// Gerado por scripts/generate-skeleton.mjs a partir de catalog/service-catalog.v1.json.
// NÃO EDITAR À MÃO — edita o catálogo e regenera.
// Fonte: PROPOSED · CANDIDATE_HOLD · nenhuma autorização de execução.

import { guidedHelpContract } from './contract';

/**
 * Guided Help — esqueleto declarado, NÃO implementado.
 * Qualquer chamada tem de falhar de forma explícita até existir admissão + evidência.
 */
export function guidedHelp(): typeof guidedHelpContract {
  if (guidedHelpContract.status !== 'ADMITTED') {
    throw new Error('NOT_IMPLEMENTED_CANDIDATE_HOLD: ajuda-contextual.guided-help — requer admissão (WO/OPA/Kernel) e evidência.');
  }
  return guidedHelpContract;
}

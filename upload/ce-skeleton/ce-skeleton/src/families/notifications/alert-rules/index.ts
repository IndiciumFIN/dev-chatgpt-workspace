// Gerado por scripts/generate-skeleton.mjs a partir de catalog/service-catalog.v1.json.
// NÃO EDITAR À MÃO — edita o catálogo e regenera.
// Fonte: PROPOSED · CANDIDATE_HOLD · nenhuma autorização de execução.

import { alertRulesContract } from './contract';

/**
 * Alert Rules — esqueleto declarado, NÃO implementado.
 * Qualquer chamada tem de falhar de forma explícita até existir admissão + evidência.
 */
export function alertRules(): typeof alertRulesContract {
  if (alertRulesContract.status !== 'ADMITTED') {
    throw new Error('NOT_IMPLEMENTED_CANDIDATE_HOLD: notifications.alert-rules — requer admissão (WO/OPA/Kernel) e evidência.');
  }
  return alertRulesContract;
}

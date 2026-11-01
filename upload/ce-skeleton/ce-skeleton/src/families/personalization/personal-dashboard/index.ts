// Gerado por scripts/generate-skeleton.mjs a partir de catalog/service-catalog.v1.json.
// NÃO EDITAR À MÃO — edita o catálogo e regenera.
// Fonte: PROPOSED · CANDIDATE_HOLD · nenhuma autorização de execução.

import { personalDashboardContract } from './contract';

/**
 * Personal Dashboard — esqueleto declarado, NÃO implementado.
 * Qualquer chamada tem de falhar de forma explícita até existir admissão + evidência.
 */
export function personalDashboard(): typeof personalDashboardContract {
  if (personalDashboardContract.status !== 'ADMITTED') {
    throw new Error('NOT_IMPLEMENTED_CANDIDATE_HOLD: personalization.personal-dashboard — requer admissão (WO/OPA/Kernel) e evidência.');
  }
  return personalDashboardContract;
}

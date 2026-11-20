// Gerado por scripts/generate-skeleton.mjs a partir de catalog/service-catalog.v1.json.
// NÃO EDITAR À MÃO — edita o catálogo e regenera.
// Fonte: PROPOSED · CANDIDATE_HOLD · nenhuma autorização de execução.

import { opportunityRegistryContract } from './contract';

/**
 * Opportunity Registry — esqueleto declarado, NÃO implementado.
 * Qualquer chamada tem de falhar de forma explícita até existir admissão + evidência.
 */
export function opportunityRegistry(): typeof opportunityRegistryContract {
  if (opportunityRegistryContract.status !== 'ADMITTED') {
    throw new Error('NOT_IMPLEMENTED_CANDIDATE_HOLD: career.opportunity-registry — requer admissão (WO/OPA/Kernel) e evidência.');
  }
  return opportunityRegistryContract;
}

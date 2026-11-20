// Gerado por scripts/generate-skeleton.mjs a partir de catalog/service-catalog.v1.json.
// NÃO EDITAR À MÃO — edita o catálogo e regenera.
// Fonte: PROPOSED · CANDIDATE_HOLD · nenhuma autorização de execução.

import { validatorRegistryContract } from './contract';

/**
 * Validator Registry — esqueleto declarado, NÃO implementado.
 * Qualquer chamada tem de falhar de forma explícita até existir admissão + evidência.
 */
export function validatorRegistry(): typeof validatorRegistryContract {
  if (validatorRegistryContract.status !== 'ADMITTED') {
    throw new Error('NOT_IMPLEMENTED_CANDIDATE_HOLD: governance.validator-registry — requer admissão (WO/OPA/Kernel) e evidência.');
  }
  return validatorRegistryContract;
}

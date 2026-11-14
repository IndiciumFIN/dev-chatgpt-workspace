// Gerado por scripts/generate-skeleton.mjs a partir de catalog/service-catalog.v1.json.
// NÃO EDITAR À MÃO — edita o catálogo e regenera.
// Fonte: PROPOSED · CANDIDATE_HOLD · nenhuma autorização de execução.

import { scaleRuntimeContract } from './contract';

/**
 * Scale Runtime — esqueleto declarado, NÃO implementado.
 * Qualquer chamada tem de falhar de forma explícita até existir admissão + evidência.
 */
export function scaleRuntime(): typeof scaleRuntimeContract {
  if (scaleRuntimeContract.status !== 'ADMITTED') {
    throw new Error('NOT_IMPLEMENTED_CANDIDATE_HOLD: clinical-practice.scale-runtime — requer admissão (WO/OPA/Kernel) e evidência.');
  }
  return scaleRuntimeContract;
}

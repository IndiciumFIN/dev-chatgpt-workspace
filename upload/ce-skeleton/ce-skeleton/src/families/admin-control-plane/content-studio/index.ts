// Gerado por scripts/generate-skeleton.mjs a partir de catalog/service-catalog.v1.json.
// NÃO EDITAR À MÃO — edita o catálogo e regenera.
// Fonte: PROPOSED · CANDIDATE_HOLD · nenhuma autorização de execução.

import { contentStudioContract } from './contract';

/**
 * Content Studio — esqueleto declarado, NÃO implementado.
 * Qualquer chamada tem de falhar de forma explícita até existir admissão + evidência.
 */
export function contentStudio(): typeof contentStudioContract {
  if (contentStudioContract.status !== 'ADMITTED') {
    throw new Error('NOT_IMPLEMENTED_CANDIDATE_HOLD: admin-control-plane.content-studio — requer admissão (WO/OPA/Kernel) e evidência.');
  }
  return contentStudioContract;
}

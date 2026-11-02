// Gerado por scripts/generate-skeleton.mjs a partir de catalog/service-catalog.v1.json.
// NÃO EDITAR À MÃO — edita o catálogo e regenera.
// Fonte: PROPOSED · CANDIDATE_HOLD · nenhuma autorização de execução.

import { documentComposerContract } from './contract';

/**
 * Document Composer — esqueleto declarado, NÃO implementado.
 * Qualquer chamada tem de falhar de forma explícita até existir admissão + evidência.
 */
export function documentComposer(): typeof documentComposerContract {
  if (documentComposerContract.status !== 'ADMITTED') {
    throw new Error('NOT_IMPLEMENTED_CANDIDATE_HOLD: documents-outputs.document-composer — requer admissão (WO/OPA/Kernel) e evidência.');
  }
  return documentComposerContract;
}

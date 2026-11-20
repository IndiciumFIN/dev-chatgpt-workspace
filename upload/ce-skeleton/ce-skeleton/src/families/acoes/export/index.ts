// Gerado por scripts/generate-skeleton.mjs a partir do catálogo.
// NÃO EDITAR À MÃO — edita o catálogo e regenera.
// Fonte: PROPOSED · CANDIDATE_HOLD · nenhuma autorização de execução.

import { exportContract } from './contract';

/**
 * Export — esqueleto declarado, NÃO implementado.
 * Qualquer chamada tem de falhar de forma explícita até existir admissão + evidência.
 */
export function getExportService(): typeof exportContract {
  if (exportContract.status !== 'ADMITTED') {
    throw new Error('NOT_IMPLEMENTED_CANDIDATE_HOLD: acoes.export — requer admissão (WO/OPA/Kernel) e evidência.');
  }
  return exportContract;
}

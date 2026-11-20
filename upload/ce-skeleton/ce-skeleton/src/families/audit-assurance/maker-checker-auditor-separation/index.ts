// Gerado por scripts/generate-skeleton.mjs a partir de catalog/service-catalog.v1.json.
// NÃO EDITAR À MÃO — edita o catálogo e regenera.
// Fonte: PROPOSED · CANDIDATE_HOLD · nenhuma autorização de execução.

import { makerCheckerAuditorSeparationContract } from './contract';

/**
 * Maker/Checker/Auditor separation — esqueleto declarado, NÃO implementado.
 * Qualquer chamada tem de falhar de forma explícita até existir admissão + evidência.
 */
export function makerCheckerAuditorSeparation(): typeof makerCheckerAuditorSeparationContract {
  if (makerCheckerAuditorSeparationContract.status !== 'ADMITTED') {
    throw new Error('NOT_IMPLEMENTED_CANDIDATE_HOLD: audit-assurance.maker-checker-auditor-separation — requer admissão (WO/OPA/Kernel) e evidência.');
  }
  return makerCheckerAuditorSeparationContract;
}

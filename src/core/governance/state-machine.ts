/**
 * Máquina de estado do pedido. Um estado que não está na lista não tem saída.
 *
 * A forma vem de `origin/preview/central-comando-20261026:src/core/governance/state-machine.ts`
 * (leitura, não checkout). Acrescentei a cadeia do processo de source, que é o
 * caminho que esta rodada fecha: captura → átomo → admissão → publicação.
 */

/** Transições da ordem de serviço (doutrina da plataforma governada). */
export const allowedTransitions: Record<string, string[]> = {
  draft: ["planned"],
  planned: ["pilot"],
  pilot: ["approved_for_development", "rejected"],
  approved_for_development: ["in_development"],
  in_development: ["ready_for_test", "rejected"],
  ready_for_test: ["in_test"],
  in_test: ["approved_for_production", "rejected"],
  approved_for_production: ["in_production"],
  in_production: ["closed", "revoked"],
  rejected: [],
  revoked: [],
  closed: [],
};

/** Estados da cadeia de source. Cada elo só anda com o anterior fechado. */
export const sourceChainStates = [
  "capturado",
  "atomizado",
  "admitido",
  "publicado",
] as const;

export type SourceChainState = (typeof sourceChainStates)[number];

export const allowedSourceTransitions: Record<SourceChainState, SourceChainState[]> = {
  capturado: ["atomizado"],
  atomizado: ["admitido"],
  admitido: ["publicado"],
  publicado: [],
};

/** O elo pode andar? Estado desconhecido não anda: fail-closed. */
export function podeAvancar(de: string, para: string): boolean {
  const saidas = allowedSourceTransitions[de as SourceChainState];
  if (!saidas) return false;
  return saidas.includes(para as SourceChainState);
}

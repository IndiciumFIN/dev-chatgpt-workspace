/**
 * Validadores de compliance. O kernel exige que o pedido traga validadores; este
 * arquivo diz QUEM é validador e o que ele confere.
 *
 * Regra da casa: todo validador falha fechado. Devolve `ok: false` com o motivo
 * quando não consegue provar; nunca devolve `ok: true` por otimismo.
 */

import type { NamedValidator } from "@/core/governance/kernel";
import {
  validarContratoDeFonte,
  type SourceContract,
} from "@/core/governance/source-contract";
import type { Sql } from "@/lib/db";

export type ResultadoDeValidador = { ok: boolean; motivo: string };

export type ValidadorDeFonte = NamedValidator & {
  /** Nome que a pessoa lê. */
  rotulo: string;
  /** O mesmo validador, mas devolvendo o motivo da falha. */
  conferir: () => Promise<ResultadoDeValidador>;
};

function validador(
  id: string,
  rotulo: string,
  conferir: () => Promise<ResultadoDeValidador>,
): ValidadorDeFonte {
  return {
    id,
    rotulo,
    conferir,
    run: async () => (await conferir()).ok,
  };
}

/** sha256 do texto, em hexadecimal. Web Crypto — funciona no servidor e no navegador. */
export async function sha256Hex(texto: string): Promise<string> {
  const bytes = new TextEncoder().encode(texto);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

/** A fonte tem identidade, dono, origem, hash e validadores? */
export function validadorDeFonte(fonte: Partial<SourceContract>): ValidadorDeFonte {
  return validador("fonte.identidade", "Identidade e integridade da fonte", async () => {
    const violacoes = validarContratoDeFonte(fonte);
    if (violacoes.length === 0) return { ok: true, motivo: "a fonte tem identidade, origem e hash" };
    const primeira = violacoes[0];
    return { ok: false, motivo: `${primeira.campo}: ${primeira.motivo}` };
  });
}

/** O trecho literal casa com o sha256 gravado? */
export function validadorDeCitacao(fonte: Partial<SourceContract>): ValidadorDeFonte {
  return validador("fonte.citacao", "Citação literal com pinpoint e hash", async () => {
    const quote = fonte.quote;
    if (typeof quote !== "string" || quote.trim().length === 0) {
      return { ok: false, motivo: "a fonte não tem trecho literal" };
    }
    if (typeof fonte.pinpoint !== "string" || fonte.pinpoint.trim().length === 0) {
      return { ok: false, motivo: "a citação não tem pinpoint" };
    }
    if (typeof fonte.quoteSha256 !== "string" || !/^[a-f0-9]{64}$/.test(fonte.quoteSha256)) {
      return { ok: false, motivo: "a citação não tem sha256 válido" };
    }
    const calculado = await sha256Hex(quote);
    if (calculado !== fonte.quoteSha256) {
      return { ok: false, motivo: "o sha256 do trecho não é o do trecho: a citação foi trocada" };
    }
    return { ok: true, motivo: "o trecho casa com o seu hash" };
  });
}

/** O pedido tem o mínimo para ser avaliado? */
export function validadorDePedido(pedido: {
  id?: string | null;
  owner?: string | null;
  approver?: string | null;
  sourceRef?: string | null;
  policySet?: string[] | null;
  acceptanceCriteria?: string[] | null;
}): ValidadorDeFonte {
  return validador("pedido.estrutura", "Estrutura mínima do pedido", async () => {
    if (!pedido.id?.trim()) return { ok: false, motivo: "o pedido não tem id" };
    if (!pedido.owner?.trim()) return { ok: false, motivo: "o pedido não tem dono" };
    if (!pedido.approver?.trim()) return { ok: false, motivo: "o pedido não tem aprovador" };
    if (pedido.approver.trim() === "kernel") return { ok: false, motivo: "o kernel não é aprovador" };
    if (!pedido.sourceRef?.trim()) return { ok: false, motivo: "o pedido não tem origem declarada" };
    if (!pedido.policySet?.length) return { ok: false, motivo: "o pedido não tem conjunto de política" };
    if (!pedido.acceptanceCriteria?.length) return { ok: false, motivo: "o pedido não tem critério de aceite" };
    return { ok: true, motivo: "o pedido tem dono, origem, política e critério de aceite" };
  });
}

/** O manifesto amarra o pedido? */
export function validadorDeManifesto(
  pedido: { id?: string | null; hash?: string | null },
  manifesto: { serviceOrderId?: string | null; hash?: string | null } | null,
): ValidadorDeFonte {
  return validador("manifesto.integridade", "Manifesto amarrado ao pedido", async () => {
    if (!manifesto) return { ok: false, motivo: "não há manifesto" };
    if (manifesto.serviceOrderId !== pedido.id) {
      return { ok: false, motivo: "o manifesto é de outro pedido" };
    }
    if (typeof manifesto.hash !== "string" || !/^[a-f0-9]{64}$/.test(manifesto.hash)) {
      return { ok: false, motivo: "o manifesto não tem hash sha256" };
    }
    if (pedido.hash && pedido.hash !== manifesto.hash) {
      return { ok: false, motivo: "o hash do manifesto não é o hash do pedido" };
    }
    return { ok: true, motivo: "o manifesto amarra o pedido" };
  });
}

/** O portão de publicação está ligado e o papel pode escrever? */
export function validadorDePortao(
  sql: Sql,
  gateId: string,
  role: string,
): ValidadorDeFonte {
  return validador("portao.publicacao", `Portão ${gateId}`, async () => {
    const gates = await sql.query<{ id: string; enabled: unknown }>(
      "select id, enabled from process where id = $1",
      [gateId],
    );
    if (!gates[0]) return { ok: false, motivo: `o portão ${gateId} não existe no banco` };
    const ligado = gates[0].enabled === true || gates[0].enabled === "t" || gates[0].enabled === "true";
    if (!ligado) return { ok: false, motivo: `o portão ${gateId} está desligado` };
    const settings = await sql.query<{ value: string }>(
      "select value from process_setting where process_id = $1 and key = $2",
      [gateId, "escrita"],
    );
    const escrita = settings[0]?.value?.trim();
    if (escrita && escrita !== role) {
      return { ok: false, motivo: `o portão ${gateId} não abre para o papel ${role}` };
    }
    return { ok: true, motivo: `o portão ${gateId} está ligado e abre para ${role}` };
  });
}

/** Conjunto de validadores de um pedido. Sem validador, o pedido não fecha. */
export function validadoresDoPedido(
  pedido: Parameters<typeof validadorDePedido>[0],
  manifesto: Parameters<typeof validadorDeManifesto>[1],
  fonte?: Partial<SourceContract>,
): ValidadorDeFonte[] {
  const validadores = [validadorDePedido(pedido), validadorDeManifesto(pedido, manifesto)];
  if (fonte) {
    validadores.push(validadorDeFonte(fonte), validadorDeCitacao(fonte));
  }
  return validadores;
}

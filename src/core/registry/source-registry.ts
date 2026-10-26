/**
 * Registro de fontes. Uma fonte entra aqui com identidade, origem, hash,
 * trecho literal e pinpoint. O registro é quem impede que duas fontes diferentes
 * usem o mesmo `sourceCanonicalId`, e quem liga a fonte ao átomo e ao pedido
 * de admissão.
 *
 * O registro é falado em duas vozes: em memória (para o teste e para o uso
 * dentro de um pedido) e no banco (para a evidência que sobrevive ao processo).
 */

import {
  contratoDeFonteEInteiro,
  validarContratoDeFonte,
  type SourceContract,
  type SourceContractViolation,
} from "@/core/governance/source-contract";
import type { Sql } from "@/lib/db";

export type ResultadoDoRegistro = {
  ok: boolean;
  motivo: string;
  violacoes: SourceContractViolation[];
};

export type FiltroDoRegistro = {
  status?: SourceContract["status"];
  kind?: SourceContract["kind"];
  owner?: string;
};

export class SourceRegistry {
  private readonly fontes = new Map<string, SourceContract>();

  /** Registra a fonte. Fonte repetida com o mesmo id e conteúdo diferente é recusada. */
  registrar(contrato: SourceContract): ResultadoDoRegistro {
    const violacoes = validarContratoDeFonte(contrato);
    if (violacoes.length > 0) {
      const primeira = violacoes[0];
      return { ok: false, motivo: `${primeira.campo}: ${primeira.motivo}`, violacoes };
    }
    const anterior = this.fontes.get(contrato.id);
    if (anterior && anterior.hash !== contrato.hash) {
      return {
        ok: false,
        motivo: `a fonte ${contrato.id} já existe com outro hash: a origem mudou por baixo`,
        violacoes: [{ campo: "hash", motivo: "o hash registrado é outro" }],
      };
    }
    this.fontes.set(contrato.id, { ...contrato });
    return { ok: true, motivo: "a fonte foi registrada", violacoes: [] };
  }

  buscar(canonicalId: string): SourceContract | null {
    return this.fontes.get(canonicalId) ?? null;
  }

  listar(filtro: FiltroDoRegistro = {}): SourceContract[] {
    return [...this.fontes.values()]
      .filter((fonte) => (filtro.status ? fonte.status === filtro.status : true))
      .filter((fonte) => (filtro.kind ? fonte.kind === filtro.kind : true))
      .filter((fonte) => (filtro.owner ? fonte.owner === filtro.owner : true))
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  /** Liga a fonte ao átomo do kernel. */
  ligarAtom(canonicalId: string, atomId: string): boolean {
    const fonte = this.fontes.get(canonicalId);
    if (!fonte) return false;
    this.fontes.set(canonicalId, { ...fonte, atomId });
    return true;
  }

  /** Liga a fonte ao pedido de admissão. */
  ligarPedido(canonicalId: string, orderId: string): boolean {
    const fonte = this.fontes.get(canonicalId);
    if (!fonte) return false;
    this.fontes.set(canonicalId, { ...fonte, orderId });
    return true;
  }

  /** O registro só admite fonte que já passou pelos validadores. */
  admitir(canonicalId: string): boolean {
    const fonte = this.fontes.get(canonicalId);
    if (!fonte || !contratoDeFonteEInteiro(fonte)) return false;
    this.fontes.set(canonicalId, { ...fonte, status: "admitted" });
    return true;
  }

  rejeitar(canonicalId: string): boolean {
    const fonte = this.fontes.get(canonicalId);
    if (!fonte) return false;
    this.fontes.set(canonicalId, { ...fonte, status: "rejected" });
    return true;
  }

  get tamanho(): number {
    return this.fontes.size;
  }
}

/** Registro do processo: um só, compartilhado pelos caminhos que pedem fonte. */
export const registroDeFontes = new SourceRegistry();

/** Grava a fonte como átomo do kernel, com o trecho literal e o seu hash. */
export async function gravarAtomaDaFonte(
  sql: Sql,
  contrato: SourceContract,
): Promise<{ ok: boolean; motivo: string; atomId: string }> {
  const violacoes = validarContratoDeFonte(contrato);
  if (violacoes.length > 0) {
    const primeira = violacoes[0];
    return { ok: false, motivo: `${primeira.campo}: ${primeira.motivo}`, atomId: contrato.id };
  }
  const atomId = contrato.atomId ?? contrato.id;
  await sql.query(
    `insert into kernel_atom (id, domain, title, statement, source, status, source_canonical_id, source_quote, pinpoint, source_quote_sha256)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     on conflict (id) do update
     set source_canonical_id = excluded.source_canonical_id,
         source_quote = excluded.source_quote,
         pinpoint = excluded.pinpoint,
         source_quote_sha256 = excluded.source_quote_sha256`,
    [
      atomId,
      contrato.kind,
      contrato.templateId,
      contrato.quote ?? contrato.hash,
      contrato.sourceRef,
      contrato.status === "admitted" ? "admitido" : "candidato",
      contrato.id,
      contrato.quote ?? null,
      contrato.pinpoint ?? null,
      contrato.quoteSha256 ?? null,
    ],
  );
  return { ok: true, motivo: "o átomo da fonte foi gravado", atomId };
}

/** Lê as fontes do banco, na forma do contrato. */
export async function fontesDoBanco(sql: Sql): Promise<SourceContract[]> {
  const linhas = await sql.query<{
    id: string;
    domain: string;
    title: string;
    statement: string;
    source: string;
    status: string;
    source_canonical_id: string | null;
    source_quote: string | null;
    pinpoint: string | null;
    source_quote_sha256: string | null;
  }>(
    `select id, domain, title, statement, source, status,
            source_canonical_id, source_quote, pinpoint, source_quote_sha256
     from kernel_atom
     order by id`,
  );
  return linhas.map((linha) => ({
    id: linha.source_canonical_id ?? linha.id,
    kind: (linha.domain as SourceContract["kind"]) ?? "file",
    owner: "kernel",
    sourceType: linha.domain,
    templateId: linha.title,
    normativeIds: [],
    validators: [],
    status: linha.status === "admitido" ? "admitted" : linha.status === "rejeitado" ? "rejected" : "draft",
    hash: linha.source_quote_sha256 ?? "",
    sourceRef: linha.source,
    createdAt: "",
    updatedAt: "",
    quote: linha.source_quote ?? undefined,
    pinpoint: linha.pinpoint ?? undefined,
    quoteSha256: linha.source_quote_sha256 ?? undefined,
  }));
}

/**
 * Registro de fontes. A prova de que o registro segura e recusa.
 *
 * A regra da casa: todo validador falha fechado. Por isso este teste tem
 * caminho de falha em cada caso — e o caminho que grava no banco é testado
 * contra o schema de verdade, não contra um dublê.
 */

import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";
import type { Sql } from "@/lib/db";
import { validarContratoDeFonte, type SourceContract } from "@/core/governance/source-contract";
import { validadorDeCitacao } from "@/core/compliance/validators";
import { SourceRegistry, fontesDoBanco, gravarAtomaDaFonte } from "./source-registry.ts";

const hash = "a".repeat(64);
const quote = "Trecho literal da norma, com a frase exata do texto.";
/** sha256 do trecho acima. O hash tem que ser o do texto, senão é citação trocada. */
const quoteSha256 = "317121545eba7debca104ffd1db15ddec7738e904106d798fa148c388a5e3fce";

function contrato(overrides: Partial<SourceContract> = {}): SourceContract {
  return {
    id: "transversal-public.lei-12-965-2014.source",
    kind: "file",
    owner: "dono-da-fonte",
    sourceType: "norma",
    templateId: "atom-norma",
    normativeIds: ["lei-12-965-2014"],
    validators: ["fonte.identidade", "fonte.citacao"],
    status: "draft",
    hash,
    sourceRef: "transversal-public.lei-12-965-2014",
    createdAt: "2026-10-26",
    updatedAt: "2026-10-26",
    quote,
    pinpoint: "art. 3, caput",
    quoteSha256,
    ...overrides,
  };
}

async function bancoDeTeste() {
  const db = new PGlite();
  const base = new URL("../../../migrations/", import.meta.url);
  for (const nome of (await readdir(base)).filter((nome) => nome.endsWith(".sql")).sort()) {
    await db.exec(await readFile(new URL(nome, base), "utf8"));
  }
  const sql = (async (strings: TemplateStringsArray, ...values: unknown[]) => {
    let text = strings[0];
    for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
    return (await db.query(text, values)).rows;
  }) as Sql;
  sql.query = async <T = Record<string, unknown>>(text: string, params: unknown[] = []) =>
    (await db.query(text, params)).rows as T[];
  return { db, sql };
}

test("o registro recusa fonte sem identidade, sem dono, sem origem, sem hash e sem validador", () => {
  const violacoes = validarContratoDeFonte({});
  const campos = violacoes.map((violacao) => violacao.campo);
  assert.ok(campos.includes("id"), "fonte sem id não entra");
  assert.ok(campos.includes("owner"), "fonte sem dono não entra");
  assert.ok(campos.includes("sourceRef"), "fonte sem origem não entra");
  assert.ok(campos.includes("hash"), "fonte sem sha256 não entra");
  assert.ok(campos.includes("validators"), "fonte sem validador não entra");
  assert.equal(validarContratoDeFonte(contrato()).length, 0, "a fonte inteira não tem violação");
});

test("citação trocada é violação: o hash tem que ser o do trecho", async () => {
  // O contrato checa a forma do hash e a existência do pinpoint.
  const semPinpoint = validarContratoDeFonte(contrato({ pinpoint: "  " }));
  assert.ok(semPinpoint.some((violacao) => violacao.campo === "pinpoint"));
  const hashForjado = validarContratoDeFonte(contrato({ quoteSha256: "curto" }));
  assert.ok(hashForjado.some((violacao) => violacao.campo === "quoteSha256"));

  // Quem confere a correspondência é o validador: ele recalcula o hash do trecho.
  const validador = validadorDeCitacao(contrato());
  const conforme = await validador.conferir();
  assert.equal(conforme.ok, true, conforme.motivo);

  const trocada = await validadorDeCitacao(
    contrato({ quote: "Outro trecho, com a frase trocada." }),
  ).conferir();
  assert.equal(trocada.ok, false, "citação trocada com o hash velho não passa");
  assert.match(trocada.motivo, /trocada/);

  const semHash = await validadorDeCitacao(contrato({ quoteSha256: "" })).conferir();
  assert.equal(semHash.ok, false);
});

test("fonte repetida com outro hash é recusada: a origem mudou por baixo", () => {
  const registro = new SourceRegistry();
  assert.equal(registro.registrar(contrato()).ok, true);
  const repetida = registro.registrar(contrato({ hash: "d".repeat(64) }));
  assert.equal(repetida.ok, false);
  assert.match(repetida.motivo, /outro hash/);
  assert.equal(registro.buscar(contrato().id)?.hash, hash, "o hash original continua valendo");
});

test("só entra no registro a fonte inteira, e o registro devolve a lista filtrada", () => {
  const registro = new SourceRegistry();
  assert.equal(registro.registrar(contrato({ id: "", status: "draft" })).ok, false);
  assert.equal(registro.tamanho, 0, "fonte recusada não fica no registro");
  registro.registrar(contrato({ id: "a.source" }));
  registro.registrar(contrato({ id: "b.source", status: "admitted" }));
  assert.equal(registro.tamanho, 2);
  assert.equal(registro.listar({ status: "admitted" }).length, 1);
  assert.equal(registro.listar({ owner: "dono-da-fonte" }).length, 2);
  assert.equal(registro.listar({ owner: "ninguem" }).length, 0);
});

test("o registro só admite a fonte que passou pelos validadores", () => {
  const registro = new SourceRegistry();
  registro.registrar(contrato());
  assert.equal(registro.admitir(contrato().id), true);
  assert.equal(registro.buscar(contrato().id)?.status, "admitted");
  assert.equal(registro.rejeitar(contrato().id), true);
  assert.equal(registro.buscar(contrato().id)?.status, "rejected");
  assert.equal(registro.admitir("nao-existe.source"), false, "fonte que não existe não se admite");
});

test("o registro liga a fonte ao átomo e ao pedido, e não liga o que não existe", () => {
  const registro = new SourceRegistry();
  registro.registrar(contrato());
  assert.equal(registro.ligarAtom(contrato().id, "atom-norma"), true);
  assert.equal(registro.ligarPedido(contrato().id, "wo-1"), true);
  assert.equal(registro.buscar(contrato().id)?.atomId, "atom-norma");
  assert.equal(registro.buscar(contrato().id)?.orderId, "wo-1");
  assert.equal(registro.ligarAtom("nao-existe.source", "atom-norma"), false);
});

test("gravar o átomo no banco exige a fonte inteira, e grava o trecho com o seu hash", async () => {
  const { db, sql } = await bancoDeTeste();
  const recusa = await gravarAtomaDaFonte(sql, contrato({ hash: "" }));
  assert.equal(recusa.ok, false);
  assert.match(recusa.motivo, /hash/);
  const linhas = await db.query<{ n: number }>("select count(*)::int n from kernel_atom");
  assert.equal(linhas.rows[0]?.n, 4, "fonte recusada não vira átomo");

  const gravado = await gravarAtomaDaFonte(sql, contrato());
  assert.equal(gravado.ok, true);
  const atomo = await db.query<{
    id: string;
    status: string;
    source_quote: string | null;
    pinpoint: string | null;
    source_quote_sha256: string | null;
    source_canonical_id: string | null;
  }>(
    `select id, status, source_quote, pinpoint, source_quote_sha256, source_canonical_id
     from kernel_atom where id = $1`,
    [gravado.atomId],
  );
  assert.equal(atomo.rows[0]?.source_quote, quote);
  assert.equal(atomo.rows[0]?.pinpoint, "art. 3, caput");
  assert.equal(atomo.rows[0]?.source_quote_sha256, quoteSha256);
  assert.equal(atomo.rows[0]?.source_canonical_id, contrato().id);
  assert.equal(atomo.rows[0]?.status, "candidato", "átomo nasce candidato, não admitido");
  await db.close();
});

test("as fontes do banco voltam no contrato, com o trecho e o hash", async () => {
  const { db, sql } = await bancoDeTeste();
  await gravarAtomaDaFonte(sql, contrato());
  const fontes = await fontesDoBanco(sql);
  const nossa = fontes.find((fonte) => fonte.id === contrato().id);
  assert.ok(nossa, "a fonte gravada volta na leitura");
  assert.equal(nossa?.quote, quote);
  assert.equal(nossa?.pinpoint, "art. 3, caput");
  assert.equal(nossa?.quoteSha256, quoteSha256);
  assert.equal(nossa?.status, "draft");
  await db.close();
});

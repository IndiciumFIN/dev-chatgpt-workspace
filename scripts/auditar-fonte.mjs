#!/usr/bin/env node
/**
 * Portão da recuperação: a fonte está no banco, literal, com a proveniência.
 *
 * A recuperação só vale se o texto no banco for EXATAMENTE o texto da fonte.
 * Um portão que checa "o campo não está vazio" passaria com um texto
 * inventado, resumido ou truncado — e ninguém veria. Este portão compara
 * caractere a caractere com o catálogo, confere que sobrou pendência sem
 * nome, e exige que nenhum gancho "PENDENTE" tenha sobrado.
 *
 * uso: node scripts/auditar-fonte.mjs [--check] [--self-test] [--json]
 */
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { abrirBanco, MARCADOR } from "./preencher-derby.mjs";

const MAPA = new URL("../mappings/recuperacao-fonte.json", import.meta.url);
const CATALOGO = "/workspace/fase1/catalogo-fonte/paginas";
const MIGRATION = new URL("../migrations/0042_recuperar_fonte.sql", import.meta.url);
const RELATORIO = new URL("../artifacts/fonte/auditoria.json", import.meta.url);

const norm = (t) => (t ?? "").replace(/\s+/g, " ").trim();

async function fontePorArquivo() {
  const porArquivo = new Map();
  for (const nome of await readdir(CATALOGO)) {
    const pagina = JSON.parse(await readFile(join(CATALOGO, nome), "utf8"));
    if (pagina.papel === "vivo" && (pagina.idioma ?? "").toLowerCase().startsWith("pt")) {
      porArquivo.set(pagina.arquivo, pagina);
    }
  }
  return porArquivo;
}

function textoEsperado(pagina, titulos) {
  const partes = [];
  for (const titulo of titulos) {
    const secao = pagina.secoes.find((s) => norm(s.titulo) === norm(titulo));
    if (!secao) return null;
    const corpo = norm(secao.corpoPrincipal || secao.corpo || "");
    if (!corpo) return null;
    partes.push(partes.length ? `${titulo}\n${corpo}` : corpo);
  }
  return partes.join("\n\n");
}

export async function auditar(bancoExistente) {
  const mapa = JSON.parse(await readFile(MAPA, "utf8"));
  const fontes = await fontePorArquivo();
  const migration = await readFile(MIGRATION, "utf8");
  // O self-test quebra o MESMO banco que é auditado: quebrar uma instância e
  // auditar outra prova nada.
  const banco = bancoExistente ?? (await abrirBanco());
  const db = banco.db ?? banco; // aceita a instância ou o embrulho { db }
  const proprio = !bancoExistente;
  const violacoes = [];

  // 1) O texto recuperado é o texto da fonte, caractere a caractere.
  for (const c of mapa.correspondencias) {
    const pagina = fontes.get(c.arquivo);
    if (!pagina) {
      violacoes.push({
        tipo: "fonte-inexistente",
        detalhe: `a correspondência ${c.path} #${c.position} aponta para ${c.arquivo}, que não está no catálogo`,
      });
      continue;
    }
    const esperado = textoEsperado(pagina, c.secoesFonte);
    if (esperado === null) {
      violacoes.push({
        tipo: "secao-de-origem-inexistente",
        detalhe: `${c.path} #${c.position}: a seção de origem não existe mais em ${c.arquivo}`,
      });
      continue;
    }
    const atual = await db.query(
      "select body from inst_section where path = $1 and position = $2",
      [c.path, c.position],
    );
    const linha = atual.rows[0];
    if (!linha) {
      violacoes.push({
        tipo: "secao-inexistente",
        detalhe: `${c.path} #${c.position} não existe no banco`,
      });
      continue;
    }
    if (norm(linha.body) !== norm(esperado)) {
      violacoes.push({
        tipo: "texto-divergente-da-fonte",
        detalhe: `${c.path} #${c.position} ("${c.tituloBanco}") não tem o texto de ${c.arquivo}: o banco tem ${String(linha.body).length} caracteres e a fonte tem ${esperado.length}`,
      });
    }
    if (!migration.includes(pagina.sha256)) {
      violacoes.push({
        tipo: "proveniencia-ausente",
        detalhe: `a migration 0042 não cita o sha256 de ${c.arquivo} (${c.path} #${c.position})`,
      });
    }
  }

  // 2) Nenhum gancho do autor sobrou.
  const ganchos = await db.query(
    `select path, position, title, body from inst_section where body like '%PENDENTE%'`,
  );
  for (const g of ganchos.rows) {
    violacoes.push({
      tipo: "gancho-pendente-sobrou",
      detalhe: `${g.path} #${g.position} ("${g.title}") ainda tem o gancho "PENDENTE" no texto`,
    });
  }

  // 3) Toda pendência que sobrou está nomeada como achado.
  const restantes = await db.query(
    `select path, position, title, body from inst_section where body = $1 order by path, position`,
    [MARCADOR],
  );
  const nomeados = new Set(
    mapa.pendenciasSemCorrespondencia.map((p) => `${p.path}#${p.position}`),
  );
  for (const r of restantes.rows) {
    if (!nomeados.has(`${r.path}#${r.position}`)) {
      violacoes.push({
        tipo: "pendencia-sem-nome",
        detalhe: `${r.path} #${r.position} ("${r.title}") ficou com o marcador e ninguém nomeou o achado`,
      });
    }
  }
  for (const chave of nomeados) {
    const [path, position] = chave.split("#");
    const existe = restantes.rows.some((r) => r.path === path && String(r.position) === position);
    if (!existe) {
      violacoes.push({
        tipo: "achado-obsoleto",
        detalhe: `o achado ${chave} está na tabela, mas a pendência não existe mais no banco`,
      });
    }
  }

  // 4) O texto da fonte não foi encurtado: o comprimento no banco bate.
  const comprimentos = await db.query(
    `select count(*)::int as n, coalesce(sum(length(body)), 0)::int as total from inst_section where body <> $1`,
    [MARCADOR],
  );

  if (proprio) await db.close();
  return {
    violacoes,
    recuperadas: mapa.correspondencias.length,
    achados: mapa.pendenciasSemCorrespondencia.length,
    pendentesRestantes: restantes.rows.length,
    secoesComTexto: comprimentos.rows[0].n,
    caracteresPublicados: comprimentos.rows[0].total,
    ganchos: ganchos.rows.length,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const argumentos = process.argv.slice(2);
  const relatorio = await auditar();
  console.log(`[fonte] recuperadas: ${relatorio.recuperadas} · achados: ${relatorio.achados}`);
  console.log(
    `[fonte] seções com texto: ${relatorio.secoesComTexto} · caracteres publicados: ${relatorio.caracteresPublicados}`,
  );
  console.log(`[fonte] pendências restantes: ${relatorio.pendentesRestantes} (todas nomeadas)`);
  if (relatorio.violacoes.length) {
    for (const v of relatorio.violacoes) console.log(`  VIOLAÇÃO ${v.tipo}: ${v.detalhe}`);
  }
  if (argumentos.includes("--json")) console.log(JSON.stringify(relatorio, null, 2));
  if (argumentos.includes("--self-test")) {
    // Quebra duas coisas de propósito: um texto recuperado e o gancho do autor.
    const { db } = await abrirBanco();
    await db.query(
      "update inst_section set body = 'texto inventado' where path = 'assinante/termos-de-uso' and position = 1",
    );
    await db.query(
      "update inst_section set body = 'plano: PENDENTE' where path = 'assinante/planos' and position = 1",
    );
    const quebrado = await auditar(db);
    const acusouTexto = quebrado.violacoes.some((v) => v.tipo === "texto-divergente-da-fonte");
    const acusouGancho = quebrado.violacoes.some((v) => v.tipo === "gancho-pendente-sobrou");
    await db.close();
    const ok = acusouTexto && acusouGancho;
    console.log(
      ok
        ? "[self-test] ok: o portão acusou o texto divergente e o gancho que sobrou."
        : "[self-test] FALHA: o portão não acusou uma das duas quebras.",
    );
    process.exit(ok ? 0 : 1);
  }
  await import("node:fs/promises").then(({ writeFile }) =>
    writeFile(RELATORIO, JSON.stringify(relatorio, null, 2)),
  );
  process.exit(relatorio.violacoes.length === 0 ? 0 : 1);
}

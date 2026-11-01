#!/usr/bin/env node
/**
 * Gera a migration de recuperação do conteúdo perdido na extração.
 *
 * A fonte (o repositório de origem) é a verdade do texto publicado. O banco
 * foi semeado por uma extração com perda: das 142 seções institucionais, 34
 * ficaram sem corpo — umas com o marcador DERBY, outras com o texto "PENDENTE"
 * que o autor deixou como gancho.
 *
 * A tabela `mappings/recuperacao-fonte.json` é a correspondência explícita,
 * revisada, entre a seção pendente do banco e a seção da fonte. Este script:
 *   1. confere que TODA seção pendente está na tabela (mapeada ou nomeada) —
 *      pendência sem dono é erro, e a tabela não pode apodrecer em silêncio;
 *   2. monta a migration com o texto LITERAL da fonte e a proveniência no
 *      comentário (arquivo, sha256, o título da seção de origem, o motivo);
 *   3. mede o antes e o depois e grava o relatório.
 *
 * uso: node scripts/gerar-migration-recuperacao.mjs [--check]
 */
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { abrirBanco, MARCADOR } from "./preencher-derby.mjs";

const MAPA = new URL("../mappings/recuperacao-fonte.json", import.meta.url);
const CATALOGO = "/workspace/fase1/catalogo-fonte/paginas";
const MIGRATION = new URL("../migrations/0042_recuperar_fonte.sql", import.meta.url);
const RELATORIO = new URL("../artifacts/fonte/recuperacao.json", import.meta.url);

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

/** O corpo da seção de origem, literal, com o título quando são várias. */
function textoDaFonte(pagina, titulos) {
  const partes = [];
  for (const titulo of titulos) {
    const secao = pagina.secoes.find((s) => norm(s.titulo) === norm(titulo));
    if (!secao) {
      const disponiveis = pagina.secoes.map((s) => `"${s.titulo}"`).join(", ");
      return {
        erro: `seção de origem não encontrada: "${titulo}" em ${pagina.arquivo} — disponíveis: ${disponiveis}`,
      };
    }
    const corpo = norm(secao.corpoPrincipal || secao.corpo || "");
    if (!corpo) return { erro: `seção de origem sem corpo: "${titulo}" em ${pagina.arquivo}` };
    partes.push(partes.length ? `${titulo}\n${corpo}` : corpo);
  }
  return { texto: partes.join("\n\n") };
}

const escapado = (t) => t.replace(/'/g, "''");

export async function gerar() {
  const mapa = JSON.parse(await readFile(MAPA, "utf8"));
  const fontes = await fontePorArquivo();
  const { db } = await abrirBanco();

  const pendentes = await db.query(
    `select path, position, title, body from inst_section
     where body = $1 or body like '%PENDENTE%'
     order by path, position`,
    [MARCADOR],
  );

  // 1) Toda pendência de seção inteira tem dono: mapeada ou nomeada.
  //    O gancho EMBUTIDO em um texto que sobreviveu é outra coisa: a frase
  //    fica, a lacuna vira marcador — e não precisa de correspondência.
  const cobertas = new Set();
  const erros = [];
  for (const c of mapa.correspondencias) cobertas.add(`${c.path}#${c.position}`);
  for (const p of mapa.pendenciasSemCorrespondencia) cobertas.add(`${p.path}#${p.position}`);
  const inteiras = pendentes.rows.filter(
    (p) => p.body === MARCADOR || String(p.body).startsWith("PENDENTE"),
  );
  for (const p of inteiras) {
    const chave = `${p.path}#${p.position}`;
    if (!cobertas.has(chave)) {
      erros.push(`pendência sem dono na tabela: ${chave} ("${p.title}")`);
    }
  }
  for (const chave of cobertas) {
    const existe = pendentes.rows.some((p) => `${p.path}#${p.position}` === chave);
    if (!existe) erros.push(`a tabela cita uma pendência que não existe mais: ${chave}`);
  }
  if (erros.length) {
    await db.close();
    throw new Error(`a tabela de correspondência está errada:\n  ${erros.join("\n  ")}`);
  }

  // 2) A migration.
  const linhas = [];
  linhas.push("-- Recuperação do conteúdo perdido na extração (fonte confrontada com o banco).");
  linhas.push("--");
  linhas.push("-- A fonte é a verdade do texto publicado: o repositório de origem");
  linhas.push(`-- (${mapa.fonte.repositorio}, commit ${mapa.fonte.commit}) tem o texto íntegro das`);
  linhas.push("-- páginas que o site publica. O banco foi semeado por uma extração com perda e");
  linhas.push("-- 34 das 142 seções institucionais ficaram sem corpo.");
  linhas.push("--");
  linhas.push("-- O que esta migration faz:");
  linhas.push("--   · devolve o texto LITERAL da fonte nas seções cuja correspondência está");
  linhas.push("--     declarada em mappings/recuperacao-fonte.json, com a proveniência");
  linhas.push("--     (arquivo, sha256, seção de origem e o motivo) no comentário;");
  linhas.push("--   · troca o gancho 'PENDENTE' do autor pelo marcador DERBY — o texto que");
  linhas.push("--     sobreviveu continua na frase, e a lacuna fica marcada;");
  linhas.push("--   · NÃO inventa: faixa clínica, número, artigo e prazo que não estejam na");
  linhas.push("--     fonte não entram aqui;");
  linhas.push("--   · NÃO toca nas seções sem correspondência: elas ficam com o marcador e");
  linhas.push("--     são nomeadas como achado em docs/fonte/CONFRONTO.md.");
  linhas.push("--");
  linhas.push("-- Idempotente: o texto só é escrito onde ainda está o marcador ou o gancho;");
  linhas.push("-- rodar duas vezes dá o mesmo resultado.");

  let recuperadas = 0;
  let normalizadas = 0;
  for (const c of mapa.correspondencias) {
    const pagina = fontes.get(c.arquivo);
    if (!pagina) {
      await db.close();
      throw new Error(`arquivo de origem ausente no catálogo: ${c.arquivo}`);
    }
    const { texto, erro } = textoDaFonte(pagina, c.secoesFonte);
    if (erro) {
      await db.close();
      throw new Error(`${erro} (correspondência ${c.path} #${c.position})`);
    }
    linhas.push("");
    linhas.push(`-- ${c.path} · "${c.tituloBanco}"`);
    linhas.push(`-- fonte: ${c.arquivo} · sha256 ${pagina.sha256} · seção ${c.secoesFonte.map((t) => `"${t}"`).join(" + ")}`);
    linhas.push(`-- motivo: ${c.motivo}`);
    linhas.push(
      `update inst_section set body = '${escapado(texto)}' where path = '${escapado(c.path)}' and position = ${c.position} and (body = '${MARCADOR}' or body like 'PENDENTE%');`,
    );
    recuperadas += 1;
  }

  // O gancho "PENDENTE" dentro de um texto que sobreviveu: a frase fica, a
  // lacuna fica marcada.
  const ganchos = pendentes.rows.filter(
    (p) => p.body !== MARCADOR && !String(p.body).startsWith("PENDENTE") && String(p.body).includes("PENDENTE"),
  );
  if (ganchos.length) {
    linhas.push("");
    linhas.push("-- O gancho do autor dentro de um texto que sobreviveu: a frase continua, a");
    linhas.push("-- lacuna fica marcada. (A seção inteira em PENDENTE vira marcador acima.)");
    for (const g of ganchos) {
      linhas.push(
        `-- ${g.path} · "${g.title}"`,
      );
      linhas.push(
        `update inst_section set body = replace(body, 'PENDENTE', '${MARCADOR}') where path = '${escapado(g.path)}' and position = ${g.position} and body like '%PENDENTE%';`,
      );
      normalizadas += 1;
    }
  }
  // As seções que são um gancho inteiro: viram marcador.
  const inteiros = pendentes.rows.filter(
    (p) => p.body !== MARCADOR && String(p.body).startsWith("PENDENTE"),
  );
  if (inteiros.length) {
    linhas.push("");
    linhas.push("-- Seção que era só o gancho do autor: fica com o marcador (achado nomeado).");
    for (const g of inteiros) {
      linhas.push(
        `update inst_section set body = '${MARCADOR}' where path = '${escapado(g.path)}' and position = ${g.position} and body like 'PENDENTE%';`,
      );
      normalizadas += 1;
    }
  }

  const sql = `${linhas.join("\n")}\n`;

  // 3) O antes e o depois, medidos.
  const antes = pendentes.rows.length;
  const { db: db2 } = await abrirBanco();
  await db2.exec(sql);
  const depois = await db2.query(
    `select count(*)::int as n from inst_section where body = $1 or body like '%PENDENTE%'`,
    [MARCADOR],
  );
  const comTexto = await db2.query(
    `select count(*)::int as n from inst_section where body <> $1 and btrim(body) <> ''`,
    [MARCADOR],
  );
  await db2.close();
  await db.close();

  const relatorio = {
    medidoEm: new Date().toISOString(),
    fonte: mapa.fonte,
    pendentesAntes: antes,
    pendentesDepois: depois.rows[0].n,
    recuperadasDaFonte: recuperadas,
    normalizadas: normalizadas,
    secoesComTexto: comTexto.rows[0].n,
    achados: mapa.pendenciasSemCorrespondencia.length,
    migration: "migrations/0042_recuperar_fonte.sql",
  };
  await writeFile(RELATORIO, JSON.stringify({ ...relatorio, tabela: mapa }, null, 2));
  return { relatorio, sql };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { relatorio, sql } = await gerar();
  if (process.argv.includes("--check")) {
    console.log(JSON.stringify(relatorio, null, 2));
    console.log(`[recuperacao] ${sql.split("\n").length} linhas de migration prontas`);
  } else {
    await writeFile(MIGRATION, sql);
    console.log(
      `[recuperacao] ${relatorio.recuperadasDaFonte} seções recuperadas da fonte · ${relatorio.normalizadas} normalizadas · ${relatorio.achados} achados nomeados`,
    );
    console.log(`[recuperacao] pendências: ${relatorio.pendentesAntes} → ${relatorio.pendentesDepois}`);
    console.log(`[recuperacao] migration: ${MIGRATION.pathname}`);
  }
}

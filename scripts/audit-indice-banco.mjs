#!/usr/bin/env node
/**
 * Portão do índice do banco.
 *
 * Toda tabela do dicionário tem um nome que uma pessoa usa — não o nome técnico.
 * Este script conta sozinho: número fixo no código é bug, porque o schema muda.
 *
 * Violação (derruba o portão):
 *   - label vazia, label igual ao nome técnico, label com acento ou caixa alta
 *   - tabela do dicionário sem linha no índice, ou linha do índice sem tabela
 *   - duas tabelas com a mesma label
 *
 * Achado (não derruba, mas sai no relatório e na saída do --self-test):
 *   - tabela do banco que o dicionário não cobre
 *
 * uso: node scripts/audit-indice-banco.mjs [--self-test] [--json]
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

const diretorioMigrations = new URL("../migrations/", import.meta.url);
const arquivoIndice = new URL("../src/lib/banco/indice.ts", import.meta.url);
const arquivoRelatorio = new URL("../artifacts/db-indice.json", import.meta.url);

export function semAcento(texto) {
  return String(texto).normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/** Aplica todas as migrations, em ordem, num PGlite em memória. */
export async function abrirBanco() {
  const nomes = (await readdir(diretorioMigrations))
    .filter((nome) => nome.endsWith(".sql"))
    .sort();
  const db = new PGlite();
  for (const nome of nomes) {
    await db.exec(await readFile(new URL(nome, diretorioMigrations), "utf8"));
  }
  return { db, migrations: nomes };
}

/** Lê os nomes do índice em código. O arquivo é gerado, então o formato é estável. */
export async function nomesDoIndice() {
  const texto = await readFile(arquivoIndice, "utf8");
  return [...texto.matchAll(/name:\s*"([a-z0-9_]+)"/g)].map((achado) => achado[1]);
}

/**
 * @param {object} db        PGlite já com as migrations aplicadas
 * @param {string[]} nomesIndice  nomes de tabela declarados no índice em código
 */
export async function auditar(db, nomesIndice) {
  const violacoes = [];
  const achados = [];

  const entidades = await db.query(
    "select name, label, layer_id, purpose from schema_entity order by name",
  );
  const dicionario = entidades.rows;

  const labelsVistas = new Map();
  for (const entidade of dicionario) {
    const nome = entidade.name;
    const label = String(entidade.label ?? "").trim();

    if (!label) {
      violacoes.push({
        tipo: "label-vazia",
        tabela: nome,
        detalhe: `schema_entity.label de "${nome}" está vazia: a tabela não tem nome de uso.`,
      });
      continue;
    }
    if (label === nome) {
      violacoes.push({
        tipo: "label-eco",
        tabela: nome,
        detalhe: `label "${label}" é igual ao nome técnico: não é um nome de uso.`,
      });
    }
    // Acento e maiúscula são a escrita correta em português. O que é proibido é
    // GRITAR (tudo maiúsculo) ou capitalizar no meio ("Contas De Acesso").
    // Sigla é legítima: "Controles de IA", "URLs do sitemap" passam.
    const palavras = label.split(/\s+/);
    const ehSigla = (palavra) => /^[A-Z]{1,4}s?$/.test(palavra);
    const gritando = palavras.some(
      (palavra) => palavra.length > 1 && palavra === palavra.toUpperCase() && !ehSigla(palavra),
    );
    if (gritando) {
      violacoes.push({
        tipo: "label-gritada",
        tabela: nome,
        detalhe: `label "${label}" está toda em maiúscula.`,
      });
    }
    const capitalNoMeio = palavras.slice(1).some(
      (palavra) => /^[A-Z][a-zà-ÿ]/.test(palavra) && !ehSigla(palavra),
    );
    if (capitalNoMeio) {
      violacoes.push({
        tipo: "label-capital-interno",
        tabela: nome,
        detalhe: `label "${label}" tem palavra capitalizada no meio da frase.`,
      });
    }
    if (!semAcento(label).trim()) {
      violacoes.push({
        tipo: "label-sem-forma",
        tabela: nome,
        detalhe: `label "${label}" não sobra nada depois de tirar o acento.`,
      });
    }
    if (labelsVistas.has(label)) {
      violacoes.push({
        tipo: "label-duplicada",
        tabela: nome,
        detalhe: `label "${label}" já é a de "${labelsVistas.get(label)}".`,
      });
    } else {
      labelsVistas.set(label, nome);
    }
  }

  const nomesDicionario = new Set(dicionario.map((entidade) => entidade.name));
  const nomesIndiceSet = new Set(nomesIndice);

  for (const nome of nomesDicionario) {
    if (!nomesIndiceSet.has(nome)) {
      violacoes.push({
        tipo: "indice-sem-tabela",
        tabela: nome,
        detalhe: `a tabela "${nome}" existe no dicionário e não tem linha em src/lib/banco/indice.ts.`,
      });
    }
  }
  for (const nome of nomesIndiceSet) {
    if (!nomesDicionario.has(nome)) {
      violacoes.push({
        tipo: "indice-tabela-inexistente",
        tabela: nome,
        detalhe: `src/lib/banco/indice.ts declara "${nome}" e essa tabela não está no dicionário.`,
      });
    }
  }

  const tabelas = await db.query(
    `select c.relname as name
     from pg_class c
     join pg_namespace n on n.oid = c.relnamespace
     where c.relkind = 'r' and n.nspname = 'public'
     order by c.relname`,
  );
  for (const tabela of tabelas.rows) {
    if (!nomesDicionario.has(tabela.name)) {
      achados.push({
        tipo: "tabela-fora-do-dicionario",
        tabela: tabela.name,
        detalhe: `a tabela "${tabela.name}" existe no banco e o dicionário não a descreve.`,
      });
    }
  }

  return {
    violacoes,
    achados,
    contagens: {
      tabelasDoBanco: tabelas.rows.length,
      tabelasNoDicionario: dicionario.length,
      linhasNoIndice: nomesIndice.length,
      tabelasComLabel: dicionario.filter((entidade) => String(entidade.label ?? "").trim()).length,
      tabelasForaDoDicionario: achados.length,
    },
  };
}

export function formatar(relatorio) {
  const linhas = [];
  linhas.push(`[índice] tabelas no banco:        ${relatorio.contagens.tabelasDoBanco}`);
  linhas.push(`[índice] tabelas no dicionário:   ${relatorio.contagens.tabelasNoDicionario}`);
  linhas.push(`[índice] linhas no índice:       ${relatorio.contagens.linhasNoIndice}`);
  linhas.push(`[índice] tabelas com label:      ${relatorio.contagens.tabelasComLabel}`);
  linhas.push(`[índice] fora do dicionário:     ${relatorio.contagens.tabelasForaDoDicionario}`);
  for (const achado of relatorio.achados) {
    linhas.push(`  achado  ${achado.tabela}: ${achado.detalhe}`);
  }
  for (const violacao of relatorio.violacoes) {
    linhas.push(`  VIOLAÇÃO ${violacao.tabela}: ${violacao.detalhe}`);
  }
  return linhas.join("\n");
}

async function principal() {
  const argumentos = process.argv.slice(2);
  const selfTest = argumentos.includes("--self-test");
  const json = argumentos.includes("--json");

  const { db, migrations } = await abrirBanco();
  const nomesIndice = await nomesDoIndice();
  let relatorio = await auditar(db, nomesIndice);

  if (selfTest) {
    // Quebra uma coisa de propósito: o portão tem que saber falhar.
    const alvo = relatorio.contagens.tabelasNoDicionario > 0 ? "user" : null;
    if (alvo) {
      await db.query("update schema_entity set label = '' where name = $1", [alvo]);
      relatorio = await auditar(db, nomesIndice);
      console.log(`[self-test] removi a label de "${alvo}". O portão tem que acusar:`);
      console.log(formatar(relatorio));
      const acusou = relatorio.violacoes.some((v) => v.tabela === alvo);
      console.log(
        acusou
          ? `[self-test] ok: o portão falhou e nomeou "${alvo}".`
          : `[self-test] FALHA: o portão não acusou a label removida.`,
      );
      process.exit(acusou ? 0 : 1);
    }
    console.log("[self-test] não há tabela para quebrar.");
    process.exit(1);
  }

  const saida = formatar(relatorio);
  console.log(saida);
  await writeFile(
    arquivoRelatorio,
    JSON.stringify({ migrations: migrations.length, ...relatorio }, null, 2),
  );

  if (json) {
    console.log(JSON.stringify(relatorio, null, 2));
  }
  process.exit(relatorio.violacoes.length === 0 ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await principal();
}

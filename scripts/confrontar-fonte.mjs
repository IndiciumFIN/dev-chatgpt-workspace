#!/usr/bin/env node
/**
 * Confronto da fonte com o banco.
 *
 * O banco foi semeado por uma extraÇÃO COM PERDA. A perda tem nome e forma:
 * frase truncada no meio, seção perdida, corpo vazio, "PENDENTE" gravado
 * como texto. O esqueleto (os títulos) sobreviveu; o corpo, não.
 *
 * Este script mede a perda por família e por página, com NÚMEROS:
 *   casam · divergem · só no banco · só na fonte
 * e, para cada seção, uma das quatro situações:
 *   igual        — o texto do banco é o texto da fonte
 *   derby        — o banco tem o marcador; a fonte tem o texto (RECUPERÁVEL)
 *   prefixo      — o banco tem o texto cortado; a fonte tem o texto inteiro
 *   divergente   — os dois têm texto, e não são o mesmo texto
 *
 * Nada é inventado: a faixa clínica nunca sai daqui, e a comparação é sempre
 * literal, com a proveniência (arquivo, sha256, commit) ao lado.
 *
 * uso: node scripts/confrontar-fonte.mjs [--json] [--migration]
 */
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { abrirBanco, MARCADOR } from "./preencher-derby.mjs";

const CATALOGO = "/workspace/fase1/catalogo-fonte";
const INDICE = new URL("../artifacts/fonte/catalogo.json", import.meta.url);
const RELATORIO = new URL("../artifacts/fonte/confronto.json", import.meta.url);
const MIGRATION = new URL("../migrations/0042_recuperar_fonte.sql", import.meta.url);

/** Sem acento, sem pontuação, minúsculo: a chave de comparação. */
const chave = (texto) =>
  (texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const limpar = (texto) => (texto ?? "").replace(/\s+/g, " ").trim();

async function carregarPaginas() {
  const pasta = join(CATALOGO, "paginas");
  const nomes = await readdir(pasta);
  const paginas = [];
  for (const nome of nomes) {
    paginas.push(JSON.parse(await readFile(join(pasta, nome), "utf8")));
  }
  return paginas;
}

/** Índice de títulos de SEÇÃO normalizados → páginas que os têm. */
function indexarPorSecao(paginas) {
  const indice = new Map();
  for (const pagina of paginas) {
    for (const secao of pagina.secoes ?? []) {
      const k = chave(secao.titulo);
      if (!k) continue;
      if (!indice.has(k)) indice.set(k, []);
      indice.get(k).push(pagina);
    }
  }
  return indice;
}

/** Índice de títulos normalizados → páginas que os têm. */
function indexarPorTitulo(paginas) {
  const indice = new Map();
  for (const pagina of paginas) {
    for (const titulo of [pagina.titulo, pagina.tituloCompleto]) {
      if (!titulo) continue;
      const k = chave(titulo);
      if (!k) continue;
      if (!indice.has(k)) indice.set(k, []);
      indice.get(k).push(pagina);
    }
    for (const secao of pagina.secoes ?? []) {
      const k = chave(secao.titulo);
      if (!k) continue;
      if (!indice.has(k)) indice.set(k, []);
      indice.get(k).push(pagina);
    }
  }
  return indice;
}

/** A página da fonte que casa com a página do banco. */
function casarPagina(instPage, indice, secoesDoBanco, indicePorSecao) {
  // 1) Pelo título exato.
  const candidatos = indice.get(chave(instPage.title)) ?? [];
  const vivos = candidatos.filter((p) => p.papel === "vivo");
  const emPortugues = vivos.filter(
    (p) => !p.idioma || p.idioma.toLowerCase().startsWith("pt"),
  );
  const lista = emPortugues.length ? emPortugues : vivos.length ? vivos : candidatos;
  if (lista.length) {
    const exato =
      lista.find(
        (p) =>
          chave(p.kicker) === chave(instPage.kicker) && chave(p.lead) === chave(instPage.lead),
      ) ?? lista[0];
    return { pagina: exato, por: "titulo", confianca: 1 };
  }

  // 2) Pela impressão digital das SEÇÕES: os títulos das seções sobreviveram
  //    à extração com perda — o que se perdeu foi o corpo. É a assinatura mais
  //    forte de que a página do banco é a página da fonte.
  const titulos = (secoesDoBanco ?? []).map((s) => chave(s.title));
  if (!titulos.length) return null;
  const pontuacoes = new Map();
  for (const titulo of titulos) {
    if (!titulo) continue;
    for (const pagina of indicePorSecao.get(titulo) ?? []) {
      if (pagina.papel !== "vivo") continue;
      if (pagina.idioma && !pagina.idioma.toLowerCase().startsWith("pt")) continue;
      pontuacoes.set(pagina, (pontuacoes.get(pagina) ?? 0) + 1);
    }
  }
  if (!pontuacoes.size) return null;
  const ordenados = [...pontuacoes.entries()].sort((a, b) => b[1] - a[1]);
  const [vencedora, acertos] = ordenados[0];
  const total = titulos.filter(Boolean).length;
  if (acertos < Math.max(1, Math.ceil(total / 3))) return null;
  return { pagina: vencedora, por: "secoes", confianca: acertos / total };
}

/** A seção da fonte que casa com a seção do banco. */
function casarSecao(pagina, instSecao) {
  const k = chave(instSecao.title);
  const opcoes = (pagina.secoes ?? []).filter((s) => chave(s.titulo) === k);
  if (!opcoes.length) return null;
  // A seção cujo corpo tem o mesmo tamanho é a mesma; senão, a primeira.
  const exata = opcoes.find((s) => limpar(s.corpo) === limpar(instSecao.body));
  return exata ?? opcoes[0];
}

function classificar(instSecao, fonte) {
  const doBanco = limpar(instSecao.body);
  const daFonte = limpar(fonte?.corpoPrincipal ?? fonte?.corpo ?? "");
  if (!daFonte) return "fonte-vazia";
  if (doBanco === MARCADOR) return "derby";
  if (!doBanco) return "vazio";
  if (doBanco === daFonte) return "igual";
  if (daFonte.startsWith(doBanco) || daFonte.includes(doBanco)) return "prefixo";
  if (doBanco.startsWith(daFonte)) return "prefixo-invertido";
  return "divergente";
}

export async function confrontar() {
  const paginas = await carregarPaginas();
  const indice = indexarPorTitulo(paginas);
  const indicePorSecao = indexarPorSecao(paginas);
  const { db } = await abrirBanco();

  const instPages = await db.query(
    `select path, title, kicker, lead, kind from inst_page order by path`,
  );
  const instSecoes = await db.query(
    `select path, position, title, body from inst_section order by path, position`,
  );

  const porPath = new Map();
  for (const linha of instSecoes.rows) {
    if (!porPath.has(linha.path)) porPath.set(linha.path, []);
    porPath.get(linha.path).push(linha);
  }

  const paginasBanco = [];
  const secoes = [];
  let casaram = 0;
  let naoCasaram = 0;

  for (const instPage of instPages.rows) {
    const lista = porPath.get(instPage.path) ?? [];
    const casamento = casarPagina(instPage, indice, lista, indicePorSecao);
    const fonte = casamento ? casamento.pagina : null;
    const situacoes = [];
    for (const instSecao of lista) {
      const secaoFonte = fonte ? casarSecao(fonte, instSecao) : null;
      const situacao = classificar(instSecao, secaoFonte);
      situacoes.push(situacao);
      secoes.push({
        path: instPage.path,
        position: instSecao.position,
        tituloBanco: instSecao.title,
        tituloFonte: secaoFonte ? secaoFonte.titulo : null,
        situacao,
        caracteresBanco: instSecao.body?.length ?? 0,
        caracteresFonte: secaoFonte ? (secaoFonte.corpoPrincipal ?? secaoFonte.corpo ?? "").length : 0,
        arquivo: fonte?.arquivo ?? null,
        sha256: fonte?.sha256 ?? null,
        corpoFonte: secaoFonte ? (secaoFonte.corpoPrincipal ?? secaoFonte.corpo ?? "") : null,
        corpoFontePorIdioma: secaoFonte ? secaoFonte.corpoPorIdioma ?? {} : null,
        tituloFontePorIdioma: secaoFonte ? secaoFonte.tituloPorIdioma ?? {} : null,
      });
    }
    const temFonte = Boolean(fonte);
    if (temFonte) casaram += 1;
    else naoCasaram += 1;
    paginasBanco.push({
      path: instPage.path,
      title: instPage.title,
      kind: instPage.kind,
      arquivo: fonte?.arquivo ?? null,
      sha256: fonte?.sha256 ?? null,
      situacao: temFonte ? "casou" : "so-no-banco",
      casamentoPor: casamento ? casamento.por : null,
      confianca: casamento ? casamento.confianca : 0,
      secoes: lista.length,
      porSituacao: situacoes.reduce((acc, s) => {
        acc[s] = (acc[s] ?? 0) + 1;
        return acc;
      }, {}),
    });
  }

  // O que existe na fonte e não existe no banco (páginas de conteúdo).
  const caminhosDoBanco = new Set(paginasBanco.map((p) => p.arquivo).filter(Boolean));
  const soNaFonte = paginas
    .filter((p) => p.papel === "vivo" && !caminhosDoBanco.has(p.arquivo))
    .map((p) => ({
      arquivo: p.arquivo,
      titulo: p.titulo,
      idioma: p.idioma,
      chars: p.textoCompleto?.length ?? 0,
      secoes: p.secoes?.length ?? 0,
    }));

  const contagem = {};
  for (const secao of secoes) contagem[secao.situacao] = (contagem[secao.situacao] ?? 0) + 1;

  const maioresDivergencias = secoes
    .filter((s) => s.situacao === "divergente" || s.situacao === "prefixo" || s.situacao === "prefixo-invertido")
    .map((s) => ({ ...s, delta: s.caracteresFonte - s.caracteresBanco }))
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 10);

  const relatorio = {
    medidoEm: new Date().toISOString(),
    paginas: {
      banco: instPages.rows.length,
      casaram,
      soNoBanco: naoCasaram,
      fonteCatalogadas: paginas.length,
      soNaFonte: soNaFonte.length,
    },
    secoes: {
      total: secoes.length,
      porSituacao: contagem,
      recuperaveis: secoes.filter((s) => s.situacao === "derby" || s.situacao === "prefixo").length,
      divergentes: secoes.filter((s) => s.situacao === "divergente").length,
    },
    maioresDivergencias,
    paginasBanco,
    soNaFonte: soNaFonte.slice(0, 200),
    secoes,
  };
  await writeFile(RELATORIO, JSON.stringify(relatorio, null, 2));
  await db.close();
  return relatorio;
}

/** A migration de recuperação: só o texto literal, e só onde há perda. */
export function gerarMigration(relatorio) {
  const linhas = [];
  linhas.push("-- Recuperação do conteúdo perdido na extração (fonte confrontada com o banco).");
  linhas.push("--");
  linhas.push("-- A fonte é a verdade do conteúdo: o repositório de origem (github.com/kauesp0007/");
  linhas.push("-- calculadoras-de-enfermagem) tem o texto íntegro; o banco foi semeado por uma");
  linhas.push("-- extração com perda. Esta migration devolve o texto LITERAL da fonte onde o");
  linhas.push("-- banco tem o marcador ou o texto cortado.");
  linhas.push("--");
  linhas.push("-- Regras:");
  linhas.push("--   · só escreve onde o corpo é o marcador DERBY ou um prefixo do texto da fonte;");
  linhas.push("--   · o texto vem literal, com a aspas do SQL escapada — nada é reescrito, nada é");
  linhas.push("--     resumido e nenhuma faixa clínica é inventada;");
  linhas.push("--   · a proveniência (arquivo, sha256) fica comentada em cada linha;");
  linhas.push("--   · idempotente: rodar duas vezes dá o mesmo resultado.");
  linhas.push("--");
  const porCaminho = new Map();
  for (const secao of relatorio.secoes) {
    if (secao.situacao !== "derby" && secao.situacao !== "prefixo") continue;
    if (!secao.corpoFonte) continue;
    if (!porCaminho.has(secao.path)) porCaminho.set(secao.path, []);
    porCaminho.get(secao.path).push(secao);
  }
  for (const [path, lista] of porCaminho) {
    linhas.push("");
    linhas.push(`-- ${path}`);
    for (const secao of lista) {
      const texto = secao.corpoFonte;
      const escapado = texto.replace(/'/g, "''");
      linhas.push(
        `-- fonte: ${secao.arquivo} · sha256 ${secao.sha256} · seção "${secao.tituloFonte}"`,
      );
      linhas.push(
        `update inst_section set body = '${escapado}' where path = '${path.replace(/'/g, "''")}' and position = ${secao.position};`,
      );
    }
  }
  return `${linhas.join("\n")}\n`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const argumentos = process.argv.slice(2);
  const relatorio = await confrontar();
  console.log("=== PÁGINAS ===");
  console.log(JSON.stringify(relatorio.paginas, null, 2));
  console.log("=== SEÇÕES ===");
  console.log(JSON.stringify(relatorio.secoes, null, 2));
  if (argumentos.includes("--migration")) {
    const sql = gerarMigration(relatorio);
    await writeFile(MIGRATION, sql);
    console.log(`[confronto] migration escrita: ${MIGRATION.pathname} (${sql.length} bytes)`);
  }
  if (argumentos.includes("--json")) {
    console.log(JSON.stringify(relatorio, null, 2));
  }
  void INDICE;
}

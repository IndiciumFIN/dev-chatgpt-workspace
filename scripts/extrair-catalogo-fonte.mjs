#!/usr/bin/env node
/**
 * Catálogo da fonte: TODO o HTML do repositório de origem, linearizado.
 *
 * O dono pediu "clone tudo": a fonte é a verdade do conteúdo. O banco foi
 * semeado por uma EXTRAÇÃO COM PERDA (frase truncada, seção perdida, corpo
 * vazio, "PENDENTE" gravado como texto). O que se perde é o corpo; o que
 * sobrevive é o esqueleto (os títulos). Então o catálogo precisa guardar o
 * CORPO INTEIRO, com metadados completos — não h1/h2, não um resumo.
 *
 * Regras deste extrator:
 *   · NADA é truncado e nenhuma frase é cortada no meio: o texto é literal.
 *   · O texto é separado por idioma: o elemento com `lang="en"` dentro de uma
 *     página pt-BR vai para o campo em inglês, e o resto fica em português.
 *     A fonte é bilíngue no mesmo arquivo.
 *   · Cada página sai com sha256, bytes, caminho, idioma e papel da pasta —
 *     a proveniência tem que ser auditável, não lembrada.
 *   · O índice (metadados + hashes) fica no repositório; o corpo inteiro de
 *     8.376 páginas fica fora (é grande), mas com o hash que o amarra ao
 *     clone. A migration de recuperação carrega o texto literal no repositório.
 *
 * uso: node scripts/extrair-catalogo-fonte.mjs [--origem DIR] [--saida DIR]
 */
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";

const PADRAO_ORIGEM = "/workspace/fase1/repo-origem";
const PADRAO_SAIDA = "/workspace/fase1/catalogo-fonte";
const INDICE_NO_REPO = new URL("../artifacts/fonte/catalogo.json", import.meta.url);

const VOID = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

/** Pastas que não são a fonte viva do site — o conteúdo que importa. */
const PAPEL = (pasta) => {
  if (pasta === ".") return "vivo";
  if (/^backups?[-_]/i.test(pasta)) return "backup";
  if (/^CATALOGO_/i.test(pasta)) return "documentacao";
  if (/^(auditorias|automacoes|blog-templates)$/i.test(pasta)) return "ferramenta";
  if (/^[a-z]{2}(-[a-z]{2})?$/.test(pasta)) return "traducao";
  return "vivo";
};

const IDIOMA_POR_PASTA = {
  ar: "ar", de: "de", en: "en", es: "es", fr: "fr", hi: "hi", id: "id",
  it: "it", ja: "ja", ko: "ko", nl: "nl", pl: "pl", ru: "ru", sv: "sv",
  tr: "tr", uk: "uk", vi: "vi", zh: "zh",
};

/* ─────────────────────────── o tokenizer ─────────────────────────── */

function atributosDe(bruto) {
  const atributos = {};
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*(?:=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  let m;
  while ((m = re.exec(bruto)) !== null) {
    const valor = m[3] ?? m[4] ?? m[5] ?? "";
    atributos[m[1].toLowerCase()] = valor;
  }
  return atributos;
}

function tokenizar(html) {
  const tokens = [];
  let i = 0;
  while (i < html.length) {
    const lt = html.indexOf("<", i);
    if (lt === -1) {
      tokens.push({ tipo: "texto", valor: html.slice(i) });
      break;
    }
    if (lt > i) tokens.push({ tipo: "texto", valor: html.slice(i, lt) });
    if (html.startsWith("<!--", lt)) {
      const fim = html.indexOf("-->", lt);
      i = fim === -1 ? html.length : fim + 3;
      continue;
    }
    if (html.startsWith("<!", lt) || html.startsWith("<?", lt)) {
      const fim = html.indexOf(">", lt);
      i = fim === -1 ? html.length : fim + 1;
      continue;
    }
    const gt = html.indexOf(">", lt);
    if (gt === -1) {
      tokens.push({ tipo: "texto", valor: html.slice(lt) });
      break;
    }
    const bruto = html.slice(lt + 1, gt);
    const fecha = bruto.startsWith("/");
    const corpo = bruto.replace(/^\//, "").replace(/\/$/, "");
    const m = /^([a-zA-Z][a-zA-Z0-9:-]*)\s*([\s\S]*)$/.exec(corpo);
    const nome = (m ? m[1] : corpo).toLowerCase();
    tokens.push({
      tipo: fecha ? "fecha" : "abre",
      nome,
      atributos: m ? atributosDe(m[2]) : {},
      autoCerrado: bruto.endsWith("/") || VOID.has(nome),
    });
    i = gt + 1;
  }
  return tokens;
}

const normalizar = (texto) =>
  texto
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

/* ─────────────────────────── a árvore ─────────────────────────── */

function construirArvore(tokens) {
  const raiz = { tag: "#raiz", attrs: {}, filhos: [] };
  const pilha = [raiz];
  for (const t of tokens) {
    if (t.tipo === "abre") {
      const no = { tag: t.nome, attrs: t.atributos, filhos: [] };
      pilha[pilha.length - 1].filhos.push(no);
      if (!t.autoCerrado) pilha.push(no);
    } else if (t.tipo === "fecha") {
      // Fecha o elemento correspondente; tolera HTML malformado.
      for (let i = pilha.length - 1; i > 0; i -= 1) {
        if (pilha[i].tag === t.nome) {
          pilha.length = i;
          break;
        }
      }
    } else {
      if (t.valor.trim() !== "") {
        pilha[pilha.length - 1].filhos.push({ tag: "#texto", texto: t.valor });
      }
    }
  }
  return raiz;
}

/** O texto de um nó, com o idioma herdado do ancestral mais próximo. */
function textoDe(no, langAtual, saida) {
  if (no.tag === "#texto") {
    saida.push({ lang: langAtual, texto: no.texto });
    return saida;
  }
  const lang = no.attrs?.lang ?? langAtual;
  for (const filho of no.filhos ?? []) textoDe(filho, lang, saida);
  return saida;
}

function juntar(partes) {
  return normalizar(partes.map((p) => p.texto).join(" "));
}

function porIdioma(partes) {
  const mapa = {};
  for (const parte of partes) {
    const chave = parte.lang ?? "";
    mapa[chave] = mapa[chave] ? `${mapa[chave]} ${normalizar(parte.texto)}` : normalizar(parte.texto);
  }
  return mapa;
}

const BLOCO = new Set(["p", "li", "dd", "dt", "blockquote", "figcaption", "caption"]);

/**
 * O texto no idioma da página e o texto dos demais idiomas. A fonte é
 * bilíngue no mesmo arquivo: o que está em `lang="en"` dentro de uma página
 * pt-BR é a tradução, não a continuação do texto.
 */
function principal(porIdioma, langPagina, completo) {
  const proprio = porIdioma[langPagina] ?? porIdioma[""] ?? "";
  return proprio.trim() ? proprio : completo;
}

/**
 * Percorre a árvore em ordem de documento e devolve: os títulos (com nível) e
 * os blocos de texto (parágrafo, item de lista, célula de tabela).
 */
function percorrer(no, langAtual, itens, contexto) {
  const lang = no.attrs?.lang ?? langAtual;
  if (no.tag === "script" || no.tag === "style" || no.tag === "noscript") return;
  if (/^h[1-4]$/.test(no.tag)) {
    const partes = textoDe(no, lang, []);
    itens.push({
      tipo: "titulo",
      nivel: Number(no.tag[1]),
      texto: juntar(partes),
      porIdioma: porIdioma(partes),
    });
    return;
  }
  if (no.tag === "table") {
    const linhas = [];
    for (const linha of no.filhos) {
      if (linha.tag !== "tr") continue;
      const celulas = linha.filhos
        .filter((c) => c.tag === "td" || c.tag === "th")
        .map((c) => juntar(textoDe(c, lang, [])));
      if (celulas.length) linhas.push(celulas.join(" | "));
    }
    if (linhas.length) {
      itens.push({ tipo: "tabela", texto: linhas.join("\n"), lang });
    }
    return;
  }
  if (BLOCO.has(no.tag)) {
    const partes = textoDe(no, lang, []);
    const texto = juntar(partes);
    if (texto) {
      itens.push({ tipo: "bloco", texto, classes: no.attrs?.class ?? "", porIdioma: porIdioma(partes) });
    }
    return;
  }
  if (no.tag === "input" || no.tag === "select" || no.tag === "textarea") {
    contexto.formularios.push({
      tipo: no.tag,
      nome: no.attrs?.name ?? "",
      id: no.attrs?.id ?? "",
      tipoDeCampo: no.attrs?.type ?? "",
      obrigatorio: "required" in (no.attrs ?? {}),
    });
    return;
  }
  for (const filho of no.filhos ?? []) percorrer(filho, lang, itens, contexto);
}

/* ──────────────────── a leitura da página (linearização) ──────────────────── */

export function linearizar(html) {
  const tokens = tokenizar(html);
  const raiz = construirArvore(tokens);

  const head = {
    title: "",
    description: "",
    keywords: "",
    author: "",
    robots: "",
    canonical: "",
    og: {},
    twitter: {},
  };
  let langHtml = null;
  const contexto = { formularios: [] };

  // O head: metadados, sem descer no corpo.
  const andarPeloHead = (no) => {
    if (no.tag === "html") langHtml = no.attrs?.lang ?? langHtml;
    if (no.tag === "title") {
      head.title = juntar(textoDe(no, langHtml, []));
      return;
    }
    if (no.tag === "meta") {
      const nome = (no.attrs?.name ?? no.attrs?.property ?? "").toLowerCase();
      const conteudo = no.attrs?.content ?? "";
      if (nome === "description") head.description = conteudo;
      else if (nome === "keywords") head.keywords = conteudo;
      else if (nome === "author") head.author = conteudo;
      else if (nome === "robots") head.robots = conteudo;
      else if (nome.startsWith("og:")) head.og[nome.slice(3)] = conteudo;
      else if (nome.startsWith("twitter:")) head.twitter[nome.slice(8)] = conteudo;
      return;
    }
    if (no.tag === "link" && (no.attrs?.rel ?? "").toLowerCase() === "canonical") {
      head.canonical = no.attrs?.href ?? "";
      return;
    }
    for (const filho of no.filhos ?? []) andarPeloHead(filho);
  };
  for (const filho of raiz.filhos) {
    if (filho.tag === "html") {
      langHtml = filho.attrs?.lang ?? null;
      for (const neto of filho.filhos) {
        if (neto.tag === "head") andarPeloHead(neto);
      }
    }
  }

  const itens = [];
  for (const filho of raiz.filhos) {
    if (filho.tag === "html") percorrer(filho, langHtml, itens, contexto);
  }

  // O título da página é o primeiro h1; o kicker é o bloco em versalete que
  // vem antes dele; o lead é o primeiro bloco depois dele.
  const posH1 = itens.findIndex((i) => i.tipo === "titulo" && i.nivel === 1);
  const titulo = posH1 >= 0 ? itens[posH1].texto : "";
  const tituloPorIdioma = posH1 >= 0 ? itens[posH1].porIdioma ?? {} : {};
  let kicker = "";
  if (posH1 > 0) {
    for (let i = posH1 - 1; i >= 0; i -= 1) {
      const item = itens[i];
      if (item.tipo === "bloco" && /uppercase/i.test(item.classes)) {
        kicker = item.texto;
        break;
      }
      if (item.tipo === "titulo") break;
    }
  }
  let lead = "";
  for (let i = Math.max(posH1, 0); i < itens.length; i += 1) {
    const item = itens[i];
    if (item.tipo === "bloco") {
      lead = item.texto;
      break;
    }
    if (item.tipo === "titulo" && item.nivel > 1) break;
  }

  // As seções: cada título abre uma seção; os blocos following entram nela.
  const secoes = [];
  let atual = null;
  for (let i = posH1 + 1; i < itens.length; i += 1) {
    const item = itens[i];
    if (item.tipo === "titulo") {
      atual = {
        nivel: item.nivel,
        titulo: item.texto,
        tituloPrincipal: principal(item.porIdioma ?? {}, langHtml, item.texto),
        tituloPorIdioma: item.porIdioma ?? {},
        corpo: "",
        corpoPrincipal: "",
        corpoPorIdioma: {},
      };
      secoes.push(atual);
      continue;
    }
    if (!atual) continue;
    const texto = item.texto;
    atual.corpo += (atual.corpo ? "\n\n" : "") + texto;
    for (const [idioma, valor] of Object.entries(item.porIdioma ?? {})) {
      atual.corpoPorIdioma[idioma] = atual.corpoPorIdioma[idioma]
        ? `${atual.corpoPorIdioma[idioma]}\n\n${valor}`
        : valor;
    }
  }

  for (const secao of secoes) {
    secao.corpoPrincipal = principal(secao.corpoPorIdioma, langHtml, secao.corpo);
  }

  const textoCompleto = normalizar(
    [
      titulo,
      kicker,
      lead,
      ...secoes.map((s) => `${s.titulo}\n${s.corpo}`),
    ].join("\n\n"),
  );

  return {
    metadados: head,
    idioma: langHtml,
    titulo: principal(tituloPorIdioma, langHtml, titulo) || head.title,
    tituloCompleto: titulo || head.title,
    tituloPorIdioma,
    kicker,
    lead,
    secoes,
    formularios: contexto.formularios,
    textoCompleto,
  };
}

/* ─────────────────────────── o passeio ─────────────────────────── */

async function htmlsDe(diretorio) {
  const encontrados = [];
  const filas = await readdir(diretorio, { withFileTypes: true });
  for (const entrada of filas.sort((a, b) => a.name.localeCompare(b.name))) {
    if (entrada.name === ".git" || entrada.name === "node_modules") continue;
    const caminho = join(diretorio, entrada.name);
    if (entrada.isDirectory()) {
      encontrados.push(...(await htmlsDe(caminho)));
    } else if (entrada.isFile() && entrada.name.toLowerCase().endsWith(".html")) {
      encontrados.push(caminho);
    }
  }
  return encontrados;
}

export async function extrair({ origem = PADRAO_ORIGEM, saida = PADRAO_SAIDA } = {}) {
  const arquivos = await htmlsDe(origem);
  const paginas = [];
  let i = 0;
  for (const caminho of arquivos) {
    i += 1;
    const buffer = await readFile(caminho);
    const html = buffer.toString("utf8");
    const relativo = relative(origem, caminho).split(sep).join("/");
    const pasta = relativo.includes("/") ? relativo.split("/")[0] : ".";
    const linear = linearizar(html);
    const sha256 = createHash("sha256").update(buffer).digest("hex");
    const pagina = {
      arquivo: relativo,
      pasta: pasta === "." ? "" : pasta,
      papel: PAPEL(pasta),
      idioma: linear.idioma ?? IDIOMA_POR_PASTA[pasta] ?? null,
      bytes: buffer.length,
      sha256,
      metadados: linear.metadados,
      titulo: linear.titulo,
      tituloPorIdioma: linear.tituloPorIdioma,
      kicker: linear.kicker,
      lead: linear.lead,
      secoes: linear.secoes,
      formularios: linear.formularios,
      textoCompleto: linear.textoCompleto,
    };
    paginas.push(pagina);
    if (i % 500 === 0) process.stderr.write(`[catalogo] ${i}/${arquivos.length}\n`);
  }
  await mkdir(join(saida, "paginas"), { recursive: true });
  for (const pagina of paginas) {
    await writeFile(join(saida, "paginas", `${pagina.sha256}.json`), JSON.stringify(pagina, null, 2));
  }
  const indice = {
    origem,
    saida,
    total: paginas.length,
    porPapel: paginas.reduce((acc, p) => {
      acc[p.papel] = (acc[p.papel] ?? 0) + 1;
      return acc;
    }, {}),
    porIdioma: paginas.reduce((acc, p) => {
      const chave = p.idioma ?? "(sem idioma)";
      acc[chave] = (acc[chave] ?? 0) + 1;
      return acc;
    }, {}),
    // O índice que vai para o repositório traz a proveniência de TODA página
    // (arquivo, sha256, bytes, idioma) e os metadados completos das páginas
    // que o site publica (vivo e tradução). O índice inteiro, com os metadados
    // de backup e ferramenta, fica fora do repositório, em indice.json.
    paginas: paginas.map((p) => ({
      arquivo: p.arquivo,
      pasta: p.pasta,
      papel: p.papel,
      idioma: p.idioma,
      bytes: p.bytes,
      sha256: p.sha256,
      titulo: p.titulo,
      kicker: p.kicker,
      lead: p.lead,
      secoes: p.secoes.length,
      caracteres: p.textoCompleto.length,
      ...(p.papel === "vivo" || p.papel === "traducao" ? { metadados: p.metadados } : {}),
    })),
  };
  await writeFile(join(saida, "indice.json"), JSON.stringify(indice, null, 2));
  await mkdir(new URL("../artifacts/fonte/", import.meta.url), { recursive: true });
  await writeFile(INDICE_NO_REPO, JSON.stringify(indice, null, 2));
  return indice;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const argumentos = process.argv.slice(2);
  const opcoes = { origem: PADRAO_ORIGEM, saida: PADRAO_SAIDA };
  for (let i = 0; i < argumentos.length; i += 2) {
    if (argumentos[i] === "--origem") opcoes.origem = argumentos[i + 1];
    if (argumentos[i] === "--saida") opcoes.saida = argumentos[i + 1];
  }
  const indice = await extrair(opcoes);
  console.log(
    `[catalogo] ${indice.total} páginas · por papel: ${JSON.stringify(indice.porPapel)}`,
  );
  console.log(`[catalogo] índice: ${INDICE_NO_REPO.pathname}`);
}

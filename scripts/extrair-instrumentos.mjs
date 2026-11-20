/**
 * Extrator de instrumentos — lê a PÁGINA HOMOLOGADA e devolve o contrato
 * que o banco espera (tool_criterion, tool_choice, tool_field, tool_band, ...).
 *
 * Regra do projeto: nada entra no banco que não esteja na página homologada
 * do mesmo objeto. Este script NÃO inventa faixa, NÃO arredonda, NÃO completa.
 * Quando não sabe, devolve `missing` — e a página vira tarefa humana.
 *
 *   node scripts/extrair-instrumentos.mjs --fonte <dir> --saida <json> [--slug x]
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

/* ------------------------------------------------------------------ */
/* leitura de HTML sem dependência                                     */
/* ------------------------------------------------------------------ */

const texto = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, " ")
    .trim();

const meta = (html, name) => {
  const re = new RegExp(
    `<meta[^>]+(?:name|property)=["']${name}["'][^>]*content=["']([^"']*)["']`,
    "i",
  );
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]*(?:name|property)=["']${name}["']`,
    "i",
  );
  return (html.match(re)?.[1] ?? html.match(re2)?.[1] ?? "").trim();
};

const titulo = (html) => {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) return texto(h1[1]);
  const og = meta(html, "og:title");
  if (og) return og;
  return texto(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "").replace(
    /\s*[-|].*$/,
    "",
  );
};

const lead = (html) =>
  meta(html, "description") ||
  meta(html, "og:description") ||
  texto(html.match(/<main[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i)?.[1] ?? "");

/* ------------------------------------------------------------------ */
/* mini scanner de JavaScript (objetos e arrays literais)              */
/* ------------------------------------------------------------------ */

function balanceia(textoBase, inicio) {
  const abre = textoBase[inicio];
  const fecha = { "[": "]", "{": "}" }[abre];
  let prof = 0;
  let emTexto = null;
  for (let i = inicio; i < textoBase.length; i += 1) {
    const c = textoBase[i];
    if (emTexto) {
      if (c === "\\") i += 1;
      else if (c === emTexto) emTexto = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      emTexto = c;
      continue;
    }
    if (c === abre) prof += 1;
    else if (c === fecha) {
      prof -= 1;
      if (prof === 0) return textoBase.slice(inicio, i + 1);
    }
  }
  return "";
}

const stringLiteral = (corpo, chave) => {
  const re = new RegExp(`${chave}\\s*:\\s*("(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*')`, "i");
  const achado = corpo.match(re)?.[1];
  if (!achado) return null;
  return achado
    .slice(1, -1)
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, "\\");
};

const numeroLiteral = (corpo, chave) => {
  const re = new RegExp(`${chave}\\s*:\\s*(-?\\d+(?:\\.\\d+)?)`, "i");
  const achado = corpo.match(re)?.[1];
  return achado === undefined ? null : Number(achado);
};

/** Divide um array de objetos em-Level, respeitando strings e chaves. */
function objetosDoArray(arrayTexto) {
  const itens = [];
  let i = 0;
  while (i < arrayTexto.length) {
    const abre = arrayTexto.indexOf("{", i);
    if (abre === -1) break;
    const bloco = balanceia(arrayTexto, abre);
    if (!bloco) break;
    itens.push(bloco);
    i = abre + bloco.length;
  }
  return itens;
}

/* ------------------------------------------------------------------ */
/* arquétipos                                                          */
/* ------------------------------------------------------------------ */

/** A — escala com critérios: const ITENS_* = [{ id, label, max, desc, opts[] }] */
function arquetipoEscalaComCriterios(html) {
  const m = html.match(/const\s+ITENS_[A-Z_0-9]*\s*=\s*\[/i);
  if (!m) return null;
  const inicio = m.index + m[0].length - 1;
  const array = balanceia(html, inicio);
  if (!array) return null;
  const criterios = [];
  for (const bloco of objetosDoArray(array)) {
    const id = stringLiteral(bloco, "id");
    const label = stringLiteral(bloco, "label");
    if (!id || !label) continue;
    const max = numeroLiteral(bloco, "max");
    const desc = stringLiteral(bloco, "desc");
    const opcoes = [];
    const om = bloco.match(/opts\s*:\s*\[/i);
    if (om) {
      const oinicio = om.index + om[0].length - 1;
      const oarr = balanceia(bloco, oinicio);
      for (const op of objetosDoArray(oarr)) {
        const texto_ = stringLiteral(op, "text");
        const valor = op.match(/val\s*:\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|-?\d+(?:\.\d+)?)/i)?.[1];
        if (texto_ === null || valor === undefined) continue;
        const limpo = valor.startsWith('"') || valor.startsWith("'")
          ? valor.slice(1, -1)
          : Number(valor);
        if (limpo === "") continue; // placeholder "Selecione..."
        if (/selecione|opcione|escolha/i.test(texto_)) continue; // placeholder rotulado
        opcoes.push({ value: limpo, label: texto_ });
      }
    }
    criterios.push({
      id,
      label: label.replace(/^\s*\d+[.)-]\s*/, ""),
      help: desc ?? "",
      max,
      choices: opcoes,
    });
  }
  if (!criterios.length) return null;
  return { tipo: "escala-criterios", criteria: criterios };
}

/** B — escala com fatores: inputs com data-fator / name=fator* */
function arquetipoEscalaComFatores(html) {
  const fatores = [];
  for (const m of html.matchAll(/<input[^>]*data-fator=["']([^"']+)["'][^>]*>/gi)) {
    fatores.push(m[1]);
  }
  if (!fatores.length) return null;
  const opcoes = [];
  for (const m of html.matchAll(
    /<option[^>]*value=["']?(-?\d+)["']?[^>]*>([^<]*)</gi,
  )) {
    const v = Number(m[1]);
    const t = texto(m[2]);
    if (!t || /selecione/i.test(t)) continue;
    opcoes.push({ value: v, label: t });
  }
  if (!opcoes.length) return null;
  return {
    tipo: "escala-fatores",
    criteria: fatores.map((id) => ({
      id,
      label: id.replace(/[_-]+/g, " "),
      help: "",
      max: Math.max(...opcoes.map((o) => o.value)),
      choices: opcoes,
    })),
  };
}

/** C — calculadora com campos: input numérico com id + rótulo resolvido */
function rotuloDoCampo(html, id) {
  const forLabel = html.match(
    new RegExp(`<label[^>]*for=["']${id}["'][^>]*>([\\s\\S]*?)</label>`, "i"),
  );
  if (forLabel) {
    const t = texto(forLabel[1]).replace(/\*/g, "").trim();
    if (t && t.length <= 60) return t;
  }
  // senão: o texto mais próximo antes do input
  const pos = html.search(new RegExp(`id=["']${id}["']`, "i"));
  if (pos === -1) return "";
  const antes = html.slice(Math.max(0, pos - 600), pos);
  const candidatas = [...antes.matchAll(
    /<(?:label|span|p|h[1-6]|legend|div)[^>]*>([\s\S]{0,160}?)<\/(?:label|span|p|h[1-6]|legend|div)>/gi,
  )]
    .map((m) => texto(m[1]).replace(/\*/g, "").trim())
    .filter((t) => t && t.length >= 2 && t.length <= 60 && !/^[\s\W]+$/.test(t));
  return candidatas.at(-1) ?? "";
}

function arquetipoCalculadoraComCampos(html) {
  const campos = [];
  for (const m of html.matchAll(
    /<input[^>]*type=["']number["'][^>]*>/gi,
  )) {
    const input = m[0];
    const id = input.match(/id=["']([^"']+)["']/i)?.[1];
    if (!id) continue;
    if (/pacNome|pacIdade|pacSetor|pacData/i.test(id)) continue; // ficha do paciente
    const rot = rotuloDoCampo(html, id);
    if (!rot) continue;
    campos.push({
      id,
      label: rot,
      min: numeroLiteral(input, "min"),
      max: numeroLiteral(input, "max"),
      step: numeroLiteral(input, "step"),
    });
  }
  if (!campos.length) return null;
  return { tipo: "calculadora-campos", fields: campos };
}

/** D — calculadora com listas suspensas (selects com opções) */
function arquetipoCalculadoraComSelects(html) {
  const selects = [];
  for (const m of html.matchAll(/<select[^>]*id=["']([^"']+)["'][^>]*>([\s\S]*?)<\/select>/gi)) {
    const id = m[1];
    if (/pacNome|pacIdade|pacSetor|pacData/i.test(id)) continue;
    const opcoes = [];
    for (const o of m[2].matchAll(
      /<option[^>]*value=["']?([^"'>]*)["']?[^>]*>([\s\S]*?)<\/option>/gi,
    )) {
      const label = texto(o[2]);
      if (!label || /selecione|opcione|escolha/i.test(label)) continue;
      opcoes.push({ value: o[1], label });
    }
    if (!opcoes.length) continue;
    selects.push({ id, label: rotuloDoCampo(html, id), options: opcoes });
  }
  if (!selects.length) return null;
  return { tipo: "calculadora-selects", selects };
}

/* ------------------------------------------------------------------ */
/* referências e passos                                                 */
/* ------------------------------------------------------------------ */

function referencias(html) {
  // o h3 traz um SVG antes do texto: procura pelo TEXTO do cabeçalho
  for (const m of html.matchAll(/<h([23])[^>]*>([\s\S]{0,4000}?)<\/h\1>/gi)) {
    const cabecalho = texto(m[2]);
    if (!/refer[eê]ncias?\b/i.test(cabecalho)) continue;
    const depois = html.slice(m.index + m[0].length, m.index + m[0].length + 6000);
    const itens = depois
      .match(/<(?:li|p)[^>]*>([\s\S]*?)<\/(?:li|p)>/gi)
      ?.map((x) => texto(x))
      .filter((x) => x.length > 20 && !/refer[eê]ncia cient[ií]fica/i.test(x)) ?? [];
    if (itens.length) return [...new Set(itens)].slice(0, 12);
  }
  return [];
}

function passos(html) {
  for (const m of html.matchAll(/<h([23])[^>]*>([\s\S]{0,4000}?)<\/h\1>/gi)) {
    const cabecalho = texto(m[2]);
    if (!/como usar|como funciona|passo a passo|instruç[õo]es|orientaç[ãa]o/i.test(cabecalho)) continue;
    const depois = html.slice(m.index + m[0].length, m.index + m[0].length + 6000);
    const itens = depois
      .match(/<(?:li|p)[^>]*>([\s\S]*?)<\/(?:li|p)>/gi)
      ?.map((x) => texto(x))
      .filter((x) => x.length > 10) ?? [];
    if (itens.length) return [...new Set(itens)].slice(0, 12);
  }
  return [];
}

/* ------------------------------------------------------------------ */
/* extração por página                                                  */
/* ------------------------------------------------------------------ */

export function extrair(html, slug) {
  const resultado = {
    slug,
    title: titulo(html),
    lead: lead(html),
    archetype: null,
    criteria: [],
    fields: [],
    selects: [],
    bands: [],
    references: referencias(html),
    steps: passos(html),
    missing: [],
    origem: { arquivo: null, bytes: null },
  };

  const escalas =
    arquetipoEscalaComCriterios(html) ?? arquetipoEscalaComFatores(html);
  const calculadora =
    arquetipoCalculadoraComCampos(html) ?? arquetipoCalculadoraComSelects(html);
  const escolhido = escalas ?? calculadora;

  if (!escolhido) {
    resultado.missing.push("arquetipo: nenhum padrão de critério/campo reconhecido");
  } else {
    resultado.archetype = escolhido.tipo;
    resultado.criteria = escolhido.criteria ?? [];
    resultado.fields = escolhido.fields ?? [];
    resultado.selects = escolhido.selects ?? [];
  }
  // a calculadora pode ter campos E listas; a escala, listas raramente
  if (!resultado.fields.length) {
    const c = arquetipoCalculadoraComCampos(html);
    if (c) resultado.fields = c.fields;
  }
  if (!resultado.selects.length) {
    const s = arquetipoCalculadoraComSelects(html);
    if (s) resultado.selects = s.selects;
  }

  if (!resultado.title) resultado.missing.push("title");
  if (!resultado.lead) resultado.missing.push("lead");
  if (escolhido && !resultado.criteria.length && !resultado.fields.length) {
    resultado.missing.push("campos/critérios vazios");
  }
  if (!resultado.references.length) resultado.missing.push("references");
  if (!resultado.steps.length) resultado.missing.push("steps");
  // faixa é o item que NUNCA se inventa: sai daqui como pendência explícita
  resultado.missing.push("bands (revisão humana: limiar na origem, não no código)");

  return resultado;
}

/* ------------------------------------------------------------------ */
/* CLI                                                                  */
/* ------------------------------------------------------------------ */

const args = process.argv.slice(2);
const opcao = (nome, padrao) => {
  const i = args.indexOf(`--${nome}`);
  return i === -1 ? padrao : args[i + 1];
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const fontes = opcao("fonte", "/workspace/fase1/paginas_corrigidas")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const saida = opcao("saida", "/workspace/fase1/extracao.json");
  const apenas = opcao("slug", null);

  // A mesma página pode existir em mais de uma pasta, e uma delas pode ser
  // apenas a casca "conteúdo protegido". Extrai de todas e fica com a mais
  // rica: quem decide é a medida, não o nome do arquivo.
  const candidatos = new Map();
  for (const fonte of fontes) {
    for (const arquivo of (await readdir(fonte)).filter((f) => f.endsWith(".html"))) {
      const slug = arquivo.replace(/\.html$/, "");
      if (apenas && slug !== apenas) continue;
      const html = await readFile(join(fonte, arquivo), "utf8");
      const r = extrair(html, slug);
      r.origem.arquivo = arquivo;
      r.origem.pasta = fonte;
      r.origem.bytes = html.length;
      r.origem.casca = /carregando conte[uú]do protegido/i.test(html);
      const pontos =
        r.criteria.length * 10 +
        r.fields.length * 10 +
        r.selects.length * 5 +
        r.references.length * 3 +
        r.steps.length * 2 +
        (r.title ? 1 : 0);
      const anterior = candidatos.get(slug);
      if (!anterior || pontos > anterior.pontos) candidatos.set(slug, { ...r, pontos });
    }
  }

  const relatorio = [...candidatos.values()].sort((a, b) => a.slug.localeCompare(b.slug));
  await writeFile(saida, JSON.stringify(relatorio, null, 1));

  const contagem = {};
  for (const r of relatorio) {
    const chave = r.archetype ?? "sem-arquetipo";
    contagem[chave] = (contagem[chave] ?? 0) + 1;
  }
  const comConteudo = relatorio.filter(
    (r) => r.criteria.length || r.fields.length || r.selects.length,
  ).length;
  const cascas = relatorio.filter((r) => r.origem.casca).length;

  console.log(`fontes: ${fontes.join(" | ")}`);
  console.log(`slugs únicos: ${relatorio.length} · com conteúdo extraído: ${comConteudo} · cascas "conteúdo protegido": ${cascas}`);
  console.log("por arquétipo:", contagem);
  console.log(
    `com título: ${relatorio.filter((r) => r.title).length} · com critérios: ${relatorio.filter((r) => r.criteria.length).length} · com campos: ${relatorio.filter((r) => r.fields.length).length} · com listas: ${relatorio.filter((r) => r.selects.length).length} · com referências: ${relatorio.filter((r) => r.references.length).length}`,
  );
  console.log(
    `sem conteúdo: ${relatorio.filter((r) => !r.criteria.length && !r.fields.length && !r.selects.length).map((r) => r.slug).join(", ")}`,
  );
  console.log(`relatório: ${saida}`);
}

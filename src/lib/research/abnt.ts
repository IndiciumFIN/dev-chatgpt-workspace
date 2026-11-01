/**
 * Gerador de citações ABNT NBR 6023:2018.
 *
 * Implementa a formatação de referências bibliográficas conforme a norma
 * brasileira. Suporta os 12 `CitationType` do contrato:
 *
 *  - SCIENTIFIC (artigo)
 *  - TEXTBOOK (livro/capítulo)
 *  - LEGAL (lei, resolução)
 *  - TECHNICAL_STANDARD (ABNT, ISO)
 *  - DATASET
 *  - SOFTWARE
 *  - IMAGE
 *  - DIRECT_SHORT / DIRECT_LONG (citação no corpo do texto)
 *  - PARAPHRASE
 *  - APUD (citado por)
 *  - TRANSLATION (tradução)
 *  - AI_DISCLOSURE (uso de IA com disclosure)
 *
 * A função principal é `formatReference(source, reference)` que devolve a
 * string ABNT completa. Há também `formatInText(source, reference)` para
 * citações no corpo do texto (autor-data).
 */

import type { Reference, Source, SourceAuthor } from "./types";

// ============================================================
// Helpers de formatação
// ============================================================

/**
 * Formata um autor no padrão ABNT: SOBRENOME, Nome.
 * Ex.: { surname: "Silva", givenName: "Maria Aparecida da" } -> "SILVA, Maria Aparecida da"
 */
function formatAuthor(author: SourceAuthor): string {
  const surname = author.surname.trim().toUpperCase();
  const given = author.givenName.trim();
  return given ? `${surname}, ${given}` : surname;
}

/**
 * Lista de autores no formato ABNT.
 *  - 1 autor: "SOBRENOME, Nome"
 *  - 2 autores: "SOBRENOME1, Nome1; SOBRENOME2, Nome2"
 *  - 3+ autores: "SOBRENOME1, Nome1 et al."
 */
function formatAuthors(authors: SourceAuthor[]): string {
  if (!authors || authors.length === 0) return "";
  if (authors.length === 1) return formatAuthor(authors[0]);
  if (authors.length === 2) {
    return `${formatAuthor(authors[0])}; ${formatAuthor(authors[1])}`;
  }
  return `${formatAuthor(authors[0])} et al.`;
}

/**
 * Formata o título: em itálico para obras independentes (livros, normas),
 * sem destaque para partes (artigos, capítulos).
 */
function italicTitle(title: string, isIndependentWork: boolean): string {
  if (!title) return "";
  return isIndependentWork ? `*${title}*` : title;
}

/**
 * Converte a data ISO (YYYY-MM-DD) para o formato ABNT de acesso: "dd MMM. aaaa"
 * Ex.: "2024-03-15" -> "15 mar. 2024"
 */
function formatAccessedDate(isoDate: string): string {
  if (!isoDate) return "";
  const meses = ["jan.", "fev.", "mar.", "abr.", "mai.", "jun.", "jul.", "ago.", "set.", "out.", "nov.", "dez."];
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate);
  if (!match) return isoDate;
  const ano = match[1];
  const mes = parseInt(match[2], 10);
  const dia = parseInt(match[3], 10);
  if (mes < 1 || mes > 12) return isoDate;
  return `${dia} ${meses[mes - 1]} ${ano}`;
}

/** Extrai o ano de uma string ISO date ou ano solto. */
function extractYear(dateStr: string): string {
  if (!dateStr) return "s.d.";
  const match = /^(\d{4})/.exec(dateStr);
  return match ? match[1] : dateStr;
}

/** Limpa espaços e normaliza pontuação. */
function clean(s: string): string {
  return (s || "").trim().replace(/\s+/g, " ").replace(/\.\s*$/, "");
}

/** Adiciona ponto final se não houver. */
function ensurePeriod(s: string): string {
  s = clean(s);
  return s ? (s.endsWith(".") ? s : `${s}.`) : "";
}

// ============================================================
// Formatadores por tipo de citação (referência completa)
// ============================================================

/**
 * Artigo científico (SCIENTIFIC).
 *
 * Formato ABNT:
 *   SOBRENOME, Nome. Título do artigo: subtítulo. Título do periódico, Local,
 *   volume, número, páginas, ano. DOI ou URL. Acesso em: data.
 *
 * Como não temos todos os campos de periódico (volume, fascículo) no Source,
 * usamos campos de `notes` ou pedimos ao usuário que complete.
 */
function formatScientific(source: Source, ref: Reference): string {
  const authors = formatAuthors(source.authors);
  const year = source.year || extractYear(source.updatedAt);
  const titleArticle = clean(source.title);
  const journal = clean(source.authority);
  const journalItalic = journal ? `*${journal}*` : "";
  const place = clean(source.place);
  const locator = clean(source.locator.uri);
  const accessed = formatAccessedDate(ref.accessedAt || source.retrievedAt);
  // Localização do artigo (volume, fascículo, páginas) — usa ref.locator se
  // preenchido, senão cai para source.locator.pinpoint.
  const pinpoint = clean(ref.locator || source.locator.pinpoint);

  const parts: string[] = [];
  if (authors) parts.push(authors);
  if (titleArticle) parts.push(ensurePeriod(titleArticle));
  if (journalItalic) parts.push(`${journalItalic}, ${place || "[S.l.]"}`);
  if (pinpoint) parts.push(`${pinpoint}, ${year}.`);
  if (locator) {
    parts.push(`Disponível em: ${locator}.`);
    parts.push(`Acesso em: ${accessed}.`);
  }
  // Junta com espaço e normaliza pontuação (sem quebrar URLs)
  return parts
    .join(" ")
    .replace(/\s+,/g, ",")
    .replace(/\s+\./g, ".")
    .replace(/\.\s*\.\s*/g, ". ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Livro / capítulo (TEXTBOOK).
 *
 * Formato ABNT para livro:
 *   SOBRENOME, Nome. Título: subtítulo. Edição. Local: Editora, ano.
 *
 * Para capítulo:
 *   SOBRENOME, Nome. Título do capítulo. In: AUTOR OBRA. Título da obra.
 *   Local: Editora, ano. cap. X, p. yy-zz.
 */
function formatTextbook(source: Source, ref: Reference): string {
  const authors = formatAuthors(source.authors);
  const year = source.year || extractYear(source.updatedAt);
  const title = clean(source.title);
  const edition = source.edition ? clean(source.edition) : "";
  const place = clean(source.place) || "[S.l.]";
  const publisher = clean(source.publisher || source.authority) || "[s.n.]";
  // Para livro: o pinpoint vem do `source.locator.pinpoint` (cap. X, p. yy-zz)
  // apenas se a referência não trouxer localização própria.
  const pinpoint = clean(ref.locator || source.locator.pinpoint);

  const parts: string[] = [];
  if (authors) parts.push(authors);
  if (title) parts.push(ensurePeriod(italicTitle(title, true)));
  if (edition) parts.push(`${edition}.`);
  parts.push(`${place}: ${publisher}, ${year}.`);
  if (pinpoint) parts.push(pinpoint + ".");
  return parts
    .join(" ")
    .replace(/\s+,/g, ",")
    .replace(/\s+\./g, ".")
    .replace(/\.\s*\.\s*/g, ". ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Documento legal (LEGAL).
 *
 * Formato ABNT:
 *   JURISDIÇÃO. Título. Numeração e data. Descrição. Local de publicação,
 *   data de publicação. Seção/página.
 *
 * Ex.: BRASIL. Lei nº 7.498, de 25 de junho de 1986. Dispõe sobre a
 *   regulamentação do exercício da enfermagem. Diário Oficial da União,
 *   Brasília, DF, 26 jun. 1986. Seção 1, p. 1.
 */
function formatLegal(source: Source, ref: Reference): string {
  // ABNT usa o nome por extenso da jurisdição (Brasil, São Paulo, etc.)
  const jurisdictionMap: Record<string, string> = {
    BR: "BRASIL",
    BRASIL: "BRASIL",
    SP: "SÃO PAULO",
    RJ: "RIO DE JANEIRO",
    US: "ESTADOS UNIDOS",
    INTERNATIONAL: "INTERNACIONAL",
  };
  const jurisdiction = jurisdictionMap[(source.jurisdiction || "BR").toUpperCase()] || source.jurisdiction.toUpperCase();
  const title = clean(source.title);
  const authority = clean(source.authority); // ex.: "Diário Oficial da União"
  const place = clean(source.place) || "Brasília, DF";
  const year = source.year || extractYear(source.effectiveFrom || source.updatedAt);
  const pinpoint = clean(ref.locator || source.locator.pinpoint);
  const locator = clean(source.locator.uri);
  const accessed = formatAccessedDate(ref.accessedAt || source.retrievedAt);

  const parts: string[] = [];
  parts.push(jurisdiction + ".");
  parts.push(ensurePeriod(title));
  if (authority) parts.push(ensurePeriod(authority));
  parts.push(`${place}, ${year}.`);
  if (pinpoint) parts.push(pinpoint + ".");
  if (locator) {
    parts.push(`Disponível em: ${locator}.`);
    parts.push(`Acesso em: ${accessed}.`);
  }
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

/**
 * Norma técnica (TECHNICAL_STANDARD).
 *
 * Formato ABNT:
 *   ÓRGÃO NORMALIZADOR. Número da norma: título. Local, ano.
 *   Ex.: ABNT. NBR 6023:2018: informação e documentação - referências -
 *   elaboração. Rio de Janeiro, 2018.
 */
function formatTechnicalStandard(source: Source, ref: Reference): string {
  const orgao = clean(source.authority).toUpperCase() || "[s.n.]";
  const title = clean(source.title);
  const place = clean(source.place) || "[S.l.]";
  const year = source.year || extractYear(source.updatedAt);
  const locator = clean(source.locator.uri);
  const accessed = formatAccessedDate(ref.accessedAt || source.retrievedAt);

  const parts: string[] = [];
  parts.push(orgao + ".");
  if (title) parts.push(ensurePeriod(italicTitle(title, true)));
  parts.push(`${place}, ${year}.`);
  if (locator) {
    parts.push(`Disponível em: ${locator}.`);
    parts.push(`Acesso em: ${accessed}.`);
  }
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

/**
 * Dataset (DATASET).
 *
 * Formato ABNT adaptado:
 *   AUTOR. Título do dataset. Local: Editora, ano. DOI/URL. Acesso em: data.
 */
function formatDataset(source: Source, ref: Reference): string {
  const authors = formatAuthors(source.authors) || clean(source.authority);
  const title = clean(source.title);
  const place = clean(source.place) || "[S.l.]";
  const publisher = clean(source.publisher || source.authority) || "[s.n.]";
  const year = source.year || extractYear(source.updatedAt);
  const locator = clean(source.locator.uri);
  const accessed = formatAccessedDate(ref.accessedAt || source.retrievedAt);

  const parts: string[] = [];
  if (authors) parts.push(authors + ".");
  if (title) parts.push(ensurePeriod(italicTitle(title, true)));
  parts.push(`${place}: ${publisher}, ${year}.`);
  if (locator) {
    parts.push(`Disponível em: ${locator}.`);
    parts.push(`Acesso em: ${accessed}.`);
  }
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

/**
 * Software (SOFTWARE).
 *
 * Formato ABNT adaptado:
 *   AUTOR. Nome do software: versão. Local, ano. URL. Acesso em: data.
 */
function formatSoftware(source: Source, ref: Reference): string {
  const authors = formatAuthors(source.authors) || clean(source.authority);
  const title = clean(source.title);
  const version = source.edition ? `Versão ${clean(source.edition)}` : "";
  const place = clean(source.place) || "[S.l.]";
  const year = source.year || extractYear(source.updatedAt);
  const locator = clean(source.locator.uri);
  const accessed = formatAccessedDate(ref.accessedAt || source.retrievedAt);

  const parts: string[] = [];
  if (authors) parts.push(authors + ".");
  if (title) parts.push(ensurePeriod(italicTitle(title, true)));
  if (version) parts.push(version + ".");
  parts.push(`${place}, ${year}.`);
  if (locator) {
    parts.push(`Disponível em: ${locator}.`);
    parts.push(`Acesso em: ${accessed}.`);
  }
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

/**
 * Imagem (IMAGE).
 *
 * Formato ABNT adaptado:
 *   AUTOR. Título da imagem. Local, ano. URL. Acesso em: data.
 */
function formatImage(source: Source, ref: Reference): string {
  const authors = formatAuthors(source.authors) || clean(source.authority);
  const title = clean(source.title);
  const place = clean(source.place) || "[S.l.]";
  const year = source.year || extractYear(source.updatedAt);
  const locator = clean(source.locator.uri);
  const accessed = formatAccessedDate(ref.accessedAt || source.retrievedAt);

  const parts: string[] = [];
  if (authors) parts.push(authors + ".");
  if (title) parts.push(ensurePeriod(italicTitle(title, false)));
  parts.push(`${place}, ${year}.`);
  if (locator) {
    parts.push(`Disponível em: ${locator}.`);
    parts.push(`Acesso em: ${accessed}.`);
  }
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

/**
 * Citação direta curta (DIRECT_SHORT) — referência + citação no corpo do texto.
 */
function formatDirectShort(source: Source, ref: Reference): string {
  const base = formatScientific(source, ref);
  const cited = clean(ref.citedText || "");
  const pinpoint = clean(ref.locator);
  if (!cited) return base;
  return `“${cited}” (${pinpoint || "s.p."}).\n\n${base}`;
}

/**
 * Citação direta longa (DIRECT_LONG) — referência + citação com recuo.
 */
function formatDirectLong(source: Source, ref: Reference): string {
  const base = formatScientific(source, ref);
  const cited = clean(ref.citedText || "");
  const pinpoint = clean(ref.locator);
  if (!cited) return base;
  return `> ${cited} (${pinpoint || "s.p."}).\n\n${base}`;
}

/**
 * Paráfrase (PARAPHRASE).
 */
function formatParaphrase(source: Source, ref: Reference): string {
  const base = formatScientific(source, ref);
  const paraphrased = clean(ref.citedText || "");
  const pinpoint = clean(ref.locator);
  if (!paraphrased) return base;
  return `${paraphrased} (${pinpoint || "s.p."}).\n\n${base}`;
}

/**
 * Apud (APUD) — citação indireta via fonte secundária.
 *
 * Ex.: Silva (2001 apud Souza, 2010, p. 23).
 */
function formatApud(
  source: Source,
  ref: Reference,
  secondarySource?: Source,
): string {
  const primaryAuthors = formatAuthors(source.authors);
  const primaryYear = source.year || extractYear(source.updatedAt);
  const pinpoint = clean(ref.locator);

  if (secondarySource) {
    const secondaryAuthors = formatAuthors(secondarySource.authors);
    const secondaryYear = secondarySource.year || extractYear(secondarySource.updatedAt);
    const inText = `${primaryAuthors} (${primaryYear} apud ${secondaryAuthors}, ${secondaryYear}, ${pinpoint || "s.p."})`;
    const secondaryRef = formatScientific(secondarySource, ref);
    return `${inText}.\n\n${secondaryRef}`;
  }
  // Sem fonte secundária cadastrada, alerta o usuário
  return `${primaryAuthors} (${primaryYear} apud [FONTE SECUNDÁRIA NÃO CADASTRADA], ${pinpoint || "s.p."}).\n\n⚠️ Cadastre a fonte secundária para gerar a referência completa.`;
}

/**
 * Tradução (TRANSLATION).
 */
function formatTranslation(source: Source, ref: Reference): string {
  const base = formatScientific(source, ref);
  const cited = clean(ref.citedText || "");
  const pinpoint = clean(ref.locator);
  if (!cited) return `${base} (tradução nossa).`;
  return `“${cited}” (${pinpoint || "s.p."}, tradução nossa).\n\n${base}`;
}

/**
 * Uso de IA com disclosure (AI_DISCLOSURE).
 *
 * Ex.: OpenAI. ChatGPT (GPT-4). Resposta gerada em 15 mar. 2024.
 * Prompt: "Resuma as evidências sobre...". Disponível em: https://...
 */
function formatAIDisclosure(source: Source, ref: Reference): string {
  const authors = formatAuthors(source.authors) || clean(source.authority);
  const tool = clean(ref.aiTool || source.title);
  const accessed = formatAccessedDate(ref.accessedAt || source.retrievedAt);
  const locator = clean(source.locator.uri);
  const prompt = clean(ref.citedText || "");

  const parts: string[] = [];
  if (authors) parts.push(authors + ".");
  if (tool) parts.push(ensurePeriod(italicTitle(tool, true)));
  parts.push(`Resposta gerada em ${accessed}.`);
  if (prompt) parts.push(`Prompt: “${prompt}”.`);
  if (locator) {
    parts.push(`Disponível em: ${locator}.`);
    parts.push(`Acesso em: ${accessed}.`);
  }
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

// ============================================================
// API pública
// ============================================================

/**
 * Gera a referência bibliográfica completa (lista de referências) conforme
 * o `citationType` da referência.
 */
export function formatReference(
  source: Source,
  reference: Reference,
  secondarySource?: Source,
): string {
  // Primeiro os tipos de citação especiais (não dependem do tipo de fonte)
  switch (reference.citationType) {
    case "DIRECT_SHORT":
      return formatDirectShort(source, reference);
    case "DIRECT_LONG":
      return formatDirectLong(source, reference);
    case "PARAPHRASE":
      return formatParaphrase(source, reference);
    case "APUD":
      return formatApud(source, reference, secondarySource);
    case "TRANSLATION":
      return formatTranslation(source, reference);
    case "AI_DISCLOSURE":
      return formatAIDisclosure(source, reference);
  }

  // Para os demais tipos de citação, despachamos conforme o tipo de fonte
  // (que determina o formato ABNT a ser usado) — exceto quando a citação
  // já indica o formato (LEGAL, TECHNICAL_STANDARD, DATASET, SOFTWARE, IMAGE).
  if (reference.citationType === "LEGAL") return formatLegal(source, reference);
  if (reference.citationType === "TECHNICAL_STANDARD") return formatTechnicalStandard(source, reference);
  if (reference.citationType === "DATASET") return formatDataset(source, reference);
  if (reference.citationType === "SOFTWARE") return formatSoftware(source, reference);
  if (reference.citationType === "IMAGE") return formatImage(source, reference);

  // Para SCIENTIFIC e outros, o formato depende do source_type
  if (source.source_type === "TEXTBOOK") return formatTextbook(source, reference);
  return formatScientific(source, reference);
}

/**
 * Gera a citação no corpo do texto (sistema autor-data).
 *
 * Ex.: (Silva, 2001, p. 23) ou Silva (2001, p. 23) ou (SILVA, 2001 apud SOUZA, 2010).
 */
export function formatInText(
  source: Source,
  reference: Reference,
  options: { narrative?: boolean; secondarySource?: Source } = {},
): string {
  const authors = formatAuthors(source.authors);
  // Pega só o sobrenome do primeiro autor para citação no texto
  const firstSurname = source.authors[0]?.surname?.toUpperCase() || authors.split(",")[0] || "ANÔNIMO";
  const year = source.year || extractYear(source.updatedAt);
  const pinpoint = clean(reference.locator);

  if (reference.citationType === "APUD" && options.secondarySource) {
    const secFirstSurname = options.secondarySource.authors[0]?.surname?.toUpperCase() || "ANÔNIMO";
    const secYear = options.secondarySource.year || extractYear(options.secondarySource.updatedAt);
    if (options.narrative) {
      return `${firstSurname} (${year} apud ${secFirstSurname}, ${secYear}${pinpoint ? `, ${pinpoint}` : ""})`;
    }
    return `(${firstSurname}, ${year} apud ${secFirstSurname}, ${secYear}${pinpoint ? `, ${pinpoint}` : ""})`;
  }

  if (reference.citationType === "AI_DISCLOSURE") {
    const tool = reference.aiTool || source.title;
    return options.narrative
      ? `${tool} (acesso em ${formatAccessedDate(reference.accessedAt || source.retrievedAt)})`
      : `(${tool}, acesso em ${formatAccessedDate(reference.accessedAt || source.retrievedAt)})`;
  }

  if (options.narrative) {
    return `${firstSurname} (${year}${pinpoint ? `, ${pinpoint}` : ""})`;
  }
  return `(${firstSurname}, ${year}${pinpoint ? `, ${pinpoint}` : ""})`;
}

/**
 * Conta o número aproximado de linhas de um texto citado. Útil para sugerir
 * ao usuário se a citação é curta (≤3 linhas) ou longa (>3 linhas).
 */
export function estimateLineCount(text: string, charsPerLine = 75): number {
  if (!text) return 0;
  return Math.ceil(text.length / charsPerLine);
}

/**
 * Sugere o tipo de citação direta com base na contagem de linhas.
 */
export function suggestDirectType(text: string): "DIRECT_SHORT" | "DIRECT_LONG" {
  return estimateLineCount(text) <= 3 ? "DIRECT_SHORT" : "DIRECT_LONG";
}

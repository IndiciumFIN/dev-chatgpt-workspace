/** Linha de entrada do site homologado. Classifica o caminho. Não lê o HTML e não copia catálogo protegido. */

import type { Sql } from "@/lib/db";

export const governedSlugs = ["apgar", "braden", "gotejamento", "imc", "morse"] as const;

export type IntakeVerdict = "admitir" | "espera" | "recusar";

export type IntakeRow = {
  locale: string;
  module: string;
  verdict: IntakeVerdict;
  reason: string;
};

const languages = new Set(["ar", "de", "en", "es", "fr", "hi", "id", "it", "ja", "ko", "nl", "pl", "ru", "sv", "tr", "uk", "vi", "zh"]);
const banned = /banco_nanda|banco_nic|banco_noc|livronanda|livronic|livronoc/i;
const media = /\.(webp|png|jpe?g|gif|svg|ico|mp4|webm|pdf|zip|woff2?|ttf|eot)$/i;

export function classifyPath(path: string): IntakeRow {
  const clean = path.replace(/\\/g, "/").replace(/^\.\//, "");
  const parts = clean.split("/").filter(Boolean);
  const top = parts[0] ?? "";
  const locale = languages.has(top) ? top : "pt-BR";
  const base = parts[parts.length - 1] ?? "";
  if (clean.includes(".tradutor_cache/")) {
    return { locale, module: "cache", verdict: "recusar", reason: "Cache de tradução automática. Não é fonte." };
  }
  if (banned.test(clean)) {
    return { locale, module: "catalogo", verdict: "recusar", reason: "Catálogo com direito próprio. Não entra na tabela de conteúdo." };
  }
  if (media.test(base)) {
    return { locale, module: "midia", verdict: "recusar", reason: "Mídia ou pacote. Não vira linha de conteúdo." };
  }
  const slug = base.replace(/\.html$/, "");
  const governed = base.endsWith(".html") && (governedSlugs as readonly string[]).includes(slug);
  if (governed && parts.length === 1) {
    return { locale: "pt-BR", module: "instrumento", verdict: "admitir", reason: "Capa já governada nesta mesa." };
  }
  if (governed) {
    return { locale, module: "instrumento", verdict: "espera", reason: "Mesma chave em outro idioma. O texto ainda não é copiado." };
  }
  if (base.startsWith("formulario") && base.endsWith(".html")) {
    return { locale, module: "formulario", verdict: "espera", reason: "Formulário fica para o módulo seguinte." };
  }
  if (base.endsWith(".html")) {
    return { locale, module: "pagina", verdict: "espera", reason: "Página ainda não tem contrato de tabela." };
  }
  return { locale, module: "outro", verdict: "espera", reason: "Visto na linha. Sem tabela de destino." };
}

export function suggestFromHead(head: string) {
  const title = (head.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "").replace(/\s+/g, " ").trim().slice(0, 180);
  const lead = (
    head.match(/name=["']description["'][^>]*content=["']([^"']*)["']/i)?.[1]
    ?? head.match(/content=["']([^"']*)["'][^>]*name=["']description["']/i)?.[1]
    ?? ""
  ).replace(/\s+/g, " ").trim().slice(0, 400);
  return { title, lead };
}

export function suggestionOf(path: string, row: IntakeRow, head: string) {
  if (row.verdict === "recusar" || !path.endsWith(".html")) return null;
  const found = suggestFromHead(head);
  const base = path.split("/").pop()?.replace(/\.html$/, "") ?? path;
  return { locale: row.locale, module: row.module, title: found.title || base, lead: found.lead };
}

/* ------------------------------------------------------------------ *
 * Gravação do lote.
 *
 * Acima disto a classificação é pura: mesma entrada, mesma resposta.
 * A gravação vem depois, e ela exige origem declarada — de onde veio o
 * lote e em que dia. Lote sem origem não entra no banco.
 * ------------------------------------------------------------------ */

/** Origem declarada de uma passagem sobre o repositório homologado. */
export type IntakeOrigin = {
  /** Caminho de origem. Ex.: `homologado/apgar/index.html`. */
  path: string;
  /** Dia da passagem. Ex.: `2026-10-26`. */
  date: string;
};

export type IntakeSummary = {
  batchId: string;
  origin: IntakeOrigin;
  total: number;
  porVerdict: Record<IntakeVerdict, number>;
  porModulo: Record<string, number>;
  porIdioma: Record<string, number>;
  /** Quantas linhas do lote estão no banco. */
  gravadas: number;
};

/** sha256 em hexadecimal. Web Crypto — não precisa de módulo de node. */
async function sha256Hex(texto: string): Promise<string> {
  const bytes = new TextEncoder().encode(texto);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Identidade do lote. A mesma origem no mesmo dia é o mesmo lote: rodar a
 * passagem duas vezes não cria dois lotes.
 */
export async function idDoLote(origin: IntakeOrigin): Promise<string> {
  const digest = await sha256Hex(`${origin.path}|${origin.date}`);
  return `lote-${digest.slice(0, 16)}`;
}

function contarPor<T extends string>(valores: T[]): Record<string, number> {
  const contagem: Record<string, number> = {};
  for (const valor of valores) contagem[valor] = (contagem[valor] ?? 0) + 1;
  return contagem;
}

/**
 * Grava o lote no banco e devolve o resumo do que ficou gravado.
 *
 * - Sem origem declarada, não grava: devolve erro.
 * - Idempotente: o mesmo lote e os mesmos arquivos não duplicam.
 * - O resumo é lido do banco, não calculado de memória: o número que sai é o
 *   número que está gravado.
 */
export async function gravarLote(
  sql: Sql,
  paths: string[],
  origin: IntakeOrigin,
): Promise<IntakeSummary> {
  const caminho = origin?.path?.trim() ?? "";
  const data = origin?.date?.trim() ?? "";
  if (!caminho || !data) {
    throw new Error("Lote sem origem declarada não grava: falta o caminho de origem ou a data.");
  }

  const origem: IntakeOrigin = { path: caminho, date: data };
  const batchId = await idDoLote(origem);

  await sql.query(
    `insert into intake_batch (id, source, taken_at)
     values ($1, $2, $3)
     on conflict (id) do nothing`,
    [batchId, origem.path, origem.date],
  );

  for (const path of paths) {
    const row = classifyPath(path);
    await sql.query(
      `insert into intake_file (batch_id, path, locale, module, verdict, reason)
       values ($1, $2, $3, $4, $5, $6)
       on conflict (batch_id, path) do update
       set locale = excluded.locale,
           module = excluded.module,
           verdict = excluded.verdict,
           reason = excluded.reason`,
      [batchId, path, row.locale, row.module, row.verdict, row.reason],
    );
  }

  const gravadas = await sql.query<{
    verdict: IntakeVerdict;
    module: string;
    locale: string;
  }>("select verdict, module, locale from intake_file where batch_id = $1", [batchId]);

  const porVerdict: Record<IntakeVerdict, number> = { admitir: 0, espera: 0, recusar: 0 };
  for (const row of gravadas) porVerdict[row.verdict] = (porVerdict[row.verdict] ?? 0) + 1;

  return {
    batchId,
    origin: origem,
    total: gravadas.length,
    porVerdict,
    porModulo: contarPor(gravadas.map((row) => row.module)),
    porIdioma: contarPor(gravadas.map((row) => row.locale)),
    gravadas: gravadas.length,
  };
}

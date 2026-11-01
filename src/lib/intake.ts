/** Linha de entrada do site homologado. Classifica o caminho. Não lê o HTML e não copia catálogo protegido. */

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

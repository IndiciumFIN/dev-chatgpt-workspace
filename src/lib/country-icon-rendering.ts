/** Locale-specific controls supported by observed government practices, never claimed official assets. */
import { countryIconPolicy } from "@/lib/country-icon-policy";
import { fontGlyph } from "@/lib/icon-locale-contract";

export function fontControlVisual(locale: keyof typeof countryIconPolicy, delta: "up" | "down"): string {
  const policy = countryIconPolicy[locale];
  if (locale === "pt-BR") return delta === "up" ? "A+" : "A−";
  // Government examples for China and Indonesia document TEXT actions, not artwork.
  // GOV.UK recommends labeling controls, and Japanese guidance favors icon + label.
  // In all other cases, use a neutral action glyph and a localized visible label.
  //
  // O glifo neutro vem do contrato de ícone/idioma (`fontGlyph`), que antes era
  // um arquivo sem nenhum consumidor — duas fontes de verdade para o mesmo
  // controle, e elas discordavam. Aqui a tabela deixa de ser paralelo morto.
  if (locale === "zh") return delta === "up" ? "字号放大" : "字号缩小";
  if (locale === "id") return delta === "up" ? "Perbesar Teks" : "Perkecil Teks";
  void policy;
  return fontGlyph(locale, delta);
}

export function iconArtworkPermitted(locale: keyof typeof countryIconPolicy): boolean {
  // Zero approved third-party graphical assets in this evidence register.
  return false;
}

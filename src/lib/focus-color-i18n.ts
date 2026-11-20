/** UI-only focus color labels. These are candidate translations, not clinical content. */
import source from "../../registers/i18n/focus-color-locale-register.v1.json";
import type { FocusColor } from "./chrome";

const prefixes: Record<string, string> = {
  "pt-BR": "Cor de foco:",
  en: "Focus color:",
  es: "Color de enfoque:",
  fr: "Couleur de focus :",
};

/** Language candidates are isolated from clinical translation/SEO eligibility. */
export function focusColorName(locale: string, color: FocusColor): string {
  const code = Object.hasOwn(source.colors, locale)
    ? (locale as keyof typeof source.colors)
    : "pt-BR";
  const labelIndex = source.semantics.indexOf(color);
  const label = source.colors[code][labelIndex] ?? source.colors["pt-BR"][labelIndex];
  return `${prefixes[code] ?? prefixes["pt-BR"]} ${label}`;
}

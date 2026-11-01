/** Visual glyphs are design choices, not WCAG prescriptions; accessible names remain translated actions. */
export const fontGlyphByLocale = {
  "pt-BR": "A",
  "en": "A",
  "es": "A",
  "de": "A",
  "it": "A",
  "fr": "A",
  "hi": "अ",
  "zh": "字",
  "ar": "أ",
  "ja": "あ",
  "ru": "А",
  "ko": "가",
  "tr": "A",
  "nl": "A",
  "pl": "A",
  "sv": "A",
  "id": "A",
  "vi": "A",
  "uk": "А"
} as const;
export function fontGlyph(locale: keyof typeof fontGlyphByLocale, delta: "up" | "down") {
  return `${fontGlyphByLocale[locale]}${delta === "up" ? "+" : "−"}`;
}

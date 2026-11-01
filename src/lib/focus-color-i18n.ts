/** Candidate translations: NOT linguistically approved. Stable semantic identifiers, no color conveyed by hue alone. */
export const focusColorLabels = {
  "pt-BR": {
    "yellow": "amarelo",
    "lime": "verde-limão",
    "cyan": "ciano",
    "magenta": "magenta"
  },
  "en": {
    "yellow": "yellow",
    "lime": "lime green",
    "cyan": "cyan",
    "magenta": "magenta"
  },
  "es": {
    "yellow": "amarillo",
    "lime": "verde lima",
    "cyan": "cian",
    "magenta": "magenta"
  },
  "de": {
    "yellow": "Gelb",
    "lime": "Limettengrün",
    "cyan": "Cyan",
    "magenta": "Magenta"
  },
  "it": {
    "yellow": "giallo",
    "lime": "verde lime",
    "cyan": "ciano",
    "magenta": "magenta"
  },
  "fr": {
    "yellow": "jaune",
    "lime": "vert citron",
    "cyan": "cyan",
    "magenta": "magenta"
  },
  "hi": {
    "yellow": "पीला",
    "lime": "हल्का हरा",
    "cyan": "सियान",
    "magenta": "मैजेंटा"
  },
  "zh": {
    "yellow": "黄色",
    "lime": "青柠绿",
    "cyan": "青色",
    "magenta": "品红色"
  },
  "ar": {
    "yellow": "الأصفر",
    "lime": "الأخضر الليموني",
    "cyan": "السماوي",
    "magenta": "الأرجواني"
  },
  "ja": {
    "yellow": "黄色",
    "lime": "ライムグリーン",
    "cyan": "シアン",
    "magenta": "マゼンタ"
  },
  "ru": {
    "yellow": "жёлтый",
    "lime": "лаймово-зелёный",
    "cyan": "голубой (циан)",
    "magenta": "пурпурный"
  },
  "ko": {
    "yellow": "노란색",
    "lime": "라임 그린",
    "cyan": "시안",
    "magenta": "마젠타"
  },
  "tr": {
    "yellow": "sarı",
    "lime": "limon yeşili",
    "cyan": "camgöbeği",
    "magenta": "macenta"
  },
  "nl": {
    "yellow": "geel",
    "lime": "limoengroen",
    "cyan": "cyaan",
    "magenta": "magenta"
  },
  "pl": {
    "yellow": "żółty",
    "lime": "limonkowy",
    "cyan": "cyjan",
    "magenta": "magenta"
  },
  "sv": {
    "yellow": "gul",
    "lime": "limegrön",
    "cyan": "cyan",
    "magenta": "magenta"
  },
  "id": {
    "yellow": "kuning",
    "lime": "hijau limau",
    "cyan": "sian",
    "magenta": "magenta"
  },
  "vi": {
    "yellow": "vàng",
    "lime": "xanh lá chanh",
    "cyan": "xanh lơ",
    "magenta": "đỏ tía"
  },
  "uk": {
    "yellow": "жовтий",
    "lime": "лаймово-зелений",
    "cyan": "ціан",
    "magenta": "маджента"
  }
} as const;
export type FocusLocale = keyof typeof focusColorLabels;
export type FocusColorId = keyof typeof focusColorLabels["en"];
export function focusColorName(locale: string, color: FocusColorId): string {
  if (!Object.prototype.hasOwnProperty.call(focusColorLabels, locale)) throw new Error(`Unregistered locale: ${locale}`);
  return focusColorLabels[locale as FocusLocale][color];
}

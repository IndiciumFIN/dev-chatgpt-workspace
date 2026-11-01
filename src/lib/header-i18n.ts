/* v2.2.0 · Local canonical header accessibility vocabulary. */
import { localeRegistry } from "@/lib/locale-registry";
/**
 * Os 19 idiomas oficiais — o VOCABULARIO da barra de acessibilidade existe em
 * todos eles ("言語", "検索", "アクセシビリティ"…), e a arte do ícone de país
 * tambem. Por isso a lista aqui e completa.
 */
export const headerLocales = localeRegistry;
export type HeaderLocale = typeof headerLocales[number]["id"];

/**
 * Os idiomas que o SITE ENTREGA DE VERDADE.
 *
 * O vocabulario de acessibilidade existe nos 19 idiomas, mas isso nao prova que
 * o restante da interface esteja traduzido. O seletor lista somente os idiomas
 * com dicionario de interface existente; conteudo clinico e SEO nao entram aqui.
 */
export const selectableLocales = localeRegistry.filter((item) => item.interfaceDictionary !== "missing");

export const headerWords: Record<HeaderLocale, Record<"accessibility" | "fontDown" | "fontUp" | "contrast" | "dyslexia" | "dark" | "shortcuts" | "reset" | "search" | "language", string>> = {
  "pt-BR": {
    "accessibility": "Acessibilidade",
    "fontDown": "Diminuir texto",
    "fontUp": "Aumentar texto",
    "contrast": "Contraste",
    "dyslexia": "Fonte para dislexia",
    "dark": "Modo escuro",
    "shortcuts": "Atalhos de teclado",
    "reset": "Redefinir",
    "search": "Pesquisar",
    "language": "Idioma"
  },
  "en": {
    "accessibility": "Accessibility",
    "fontDown": "Decrease text",
    "fontUp": "Increase text",
    "contrast": "Contrast",
    "dyslexia": "Dyslexia-friendly font",
    "dark": "Dark mode",
    "shortcuts": "Keyboard shortcuts",
    "reset": "Reset",
    "search": "Search",
    "language": "Language"
  },
  "es": {
    "accessibility": "Accesibilidad",
    "fontDown": "Reducir texto",
    "fontUp": "Aumentar texto",
    "contrast": "Contraste",
    "dyslexia": "Fuente para dislexia",
    "dark": "Modo oscuro",
    "shortcuts": "Atajos de teclado",
    "reset": "Restablecer",
    "search": "Buscar",
    "language": "Idioma"
  },
  "de": {
    "accessibility": "Barrierefreiheit",
    "fontDown": "Text verkleinern",
    "fontUp": "Text vergrößern",
    "contrast": "Kontrast",
    "dyslexia": "Legasthenie-Schrift",
    "dark": "Dunkelmodus",
    "shortcuts": "Tastenkürzel",
    "reset": "Zurücksetzen",
    "search": "Suchen",
    "language": "Sprache"
  },
  "it": {
    "accessibility": "Accessibilità",
    "fontDown": "Riduci testo",
    "fontUp": "Ingrandisci testo",
    "contrast": "Contrasto",
    "dyslexia": "Carattere per dislessia",
    "dark": "Modalità scura",
    "shortcuts": "Scorciatoie da tastiera",
    "reset": "Ripristina",
    "search": "Cerca",
    "language": "Lingua"
  },
  "fr": {
    "accessibility": "Accessibilité",
    "fontDown": "Réduire le texte",
    "fontUp": "Agrandir le texte",
    "contrast": "Contraste",
    "dyslexia": "Police pour dyslexie",
    "dark": "Mode sombre",
    "shortcuts": "Raccourcis clavier",
    "reset": "Réinitialiser",
    "search": "Rechercher",
    "language": "Langue"
  },
  "hi": {
    "accessibility": "सुगम्यता",
    "fontDown": "पाठ छोटा करें",
    "fontUp": "पाठ बड़ा करें",
    "contrast": "कंट्रास्ट",
    "dyslexia": "डिस्लेक्सिया फ़ॉन्ट",
    "dark": "डार्क मोड",
    "shortcuts": "कीबोर्ड शॉर्टकट",
    "reset": "रीसेट",
    "search": "खोजें",
    "language": "भाषा"
  },
  "zh": {
    "accessibility": "无障碍",
    "fontDown": "缩小文字",
    "fontUp": "放大文字",
    "contrast": "对比度",
    "dyslexia": "阅读障碍字体",
    "dark": "深色模式",
    "shortcuts": "键盘快捷键",
    "reset": "重置",
    "search": "搜索",
    "language": "语言"
  },
  "ar": {
    "accessibility": "إمكانية الوصول",
    "fontDown": "تصغير النص",
    "fontUp": "تكبير النص",
    "contrast": "التباين",
    "dyslexia": "خط عسر القراءة",
    "dark": "الوضع الداكن",
    "shortcuts": "اختصارات لوحة المفاتيح",
    "reset": "إعادة ضبط",
    "search": "بحث",
    "language": "اللغة"
  },
  "ja": {
    "accessibility": "アクセシビリティ",
    "fontDown": "文字を小さく",
    "fontUp": "文字を大きく",
    "contrast": "コントラスト",
    "dyslexia": "ディスレクシア用フォント",
    "dark": "ダークモード",
    "shortcuts": "キーボードショートカット",
    "reset": "リセット",
    "search": "検索",
    "language": "言語"
  },
  "ru": {
    "accessibility": "Доступность",
    "fontDown": "Уменьшить текст",
    "fontUp": "Увеличить текст",
    "contrast": "Контраст",
    "dyslexia": "Шрифт для дислексии",
    "dark": "Тёмная тема",
    "shortcuts": "Горячие клавиши",
    "reset": "Сбросить",
    "search": "Поиск",
    "language": "Язык"
  },
  "ko": {
    "accessibility": "접근성",
    "fontDown": "글자 줄이기",
    "fontUp": "글자 키우기",
    "contrast": "대비",
    "dyslexia": "난독증 글꼴",
    "dark": "다크 모드",
    "shortcuts": "키보드 단축키",
    "reset": "초기화",
    "search": "검색",
    "language": "언어"
  },
  "tr": {
    "accessibility": "Erişilebilirlik",
    "fontDown": "Metni küçült",
    "fontUp": "Metni büyüt",
    "contrast": "Kontrast",
    "dyslexia": "Disleksi yazı tipi",
    "dark": "Koyu mod",
    "shortcuts": "Klavye kısayolları",
    "reset": "Sıfırla",
    "search": "Ara",
    "language": "Dil"
  },
  "nl": {
    "accessibility": "Toegankelijkheid",
    "fontDown": "Tekst verkleinen",
    "fontUp": "Tekst vergroten",
    "contrast": "Contrast",
    "dyslexia": "Dyslexielettertype",
    "dark": "Donkere modus",
    "shortcuts": "Sneltoetsen",
    "reset": "Herstellen",
    "search": "Zoeken",
    "language": "Taal"
  },
  "pl": {
    "accessibility": "Dostępność",
    "fontDown": "Zmniejsz tekst",
    "fontUp": "Powiększ tekst",
    "contrast": "Kontrast",
    "dyslexia": "Czcionka dla dysleksji",
    "dark": "Tryb ciemny",
    "shortcuts": "Skróty klawiaturowe",
    "reset": "Resetuj",
    "search": "Szukaj",
    "language": "Język"
  },
  "sv": {
    "accessibility": "Tillgänglighet",
    "fontDown": "Minska text",
    "fontUp": "Öka text",
    "contrast": "Kontrast",
    "dyslexia": "Dyslexitypsnitt",
    "dark": "Mörkt läge",
    "shortcuts": "Kortkommandon",
    "reset": "Återställ",
    "search": "Sök",
    "language": "Språk"
  },
  "id": {
    "accessibility": "Aksesibilitas",
    "fontDown": "Perkecil teks",
    "fontUp": "Perbesar teks",
    "contrast": "Kontras",
    "dyslexia": "Font disleksia",
    "dark": "Mode gelap",
    "shortcuts": "Pintasan keyboard",
    "reset": "Atur ulang",
    "search": "Cari",
    "language": "Bahasa"
  },
  "vi": {
    "accessibility": "Trợ năng",
    "fontDown": "Giảm cỡ chữ",
    "fontUp": "Tăng cỡ chữ",
    "contrast": "Độ tương phản",
    "dyslexia": "Phông chữ hỗ trợ chứng khó đọc",
    "dark": "Chế độ tối",
    "shortcuts": "Phím tắt",
    "reset": "Đặt lại",
    "search": "Tìm kiếm",
    "language": "Ngôn ngữ"
  },
  "uk": {
    "accessibility": "Доступність",
    "fontDown": "Зменшити текст",
    "fontUp": "Збільшити текст",
    "contrast": "Контраст",
    "dyslexia": "Шрифт для дислексії",
    "dark": "Темна тема",
    "shortcuts": "Клавіатурні скорочення",
    "reset": "Скинути",
    "search": "Пошук",
    "language": "Мова"
  }
};

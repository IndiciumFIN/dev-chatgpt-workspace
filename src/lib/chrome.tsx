import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { parseLocale } from "@/lib/translate";
import { useStored } from "@/lib/stored";

export type Locale = "pt-BR" | "en" | "es" | "fr";
export type FontStep = "sm" | "md" | "lg";
export type FocusColor = "yellow" | "lime" | "cyan" | "magenta";
export type OptionalConsent = { translation: boolean; audience: boolean };
export type Consent = "unknown" | OptionalConsent;
export type ThemeMode = "light" | "dark";

type ChromeState = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  font: FontStep;
  setFont: (font: FontStep) => void;
  contrast: boolean;
  setContrast: (on: boolean) => void;
  focus: FocusColor;
  setFocus: (color: FocusColor) => void;
  dyslexia: boolean;
  setDyslexia: (on: boolean) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  resetA11y: () => void;
  consent: Consent;
  setConsent: (value: Consent) => void;
  t: (key: keyof typeof copy["pt-BR"]) => string;
};

const copy = {
  "pt-BR": {
    home: "Início",
    about: "Sobre Nós",
    calcs: "Calculadoras",
    contents: "Conteúdos",
    jobs: "Sites de Emprego",
    exams: "Simulados",
    library: "Biblioteca de enfermagem",
    contact: "Fale Conosco",
    enter: "Entrar",
    subscribe: "Assine já",
    search: "Buscar calculadoras e escalas",
    menu: "Menu",
    system: "Sistema visual",
    pack: "Pacote de templates",
    skip: "Pular para o conteúdo",
    contrast: "Contraste",
    dyslexia: "Dislexia",
    dark: "Escuro",
    shortcuts: "Atalhos",
    a11y: "Acessibilidade",
    language: "Idioma",
    reset: "Reset",
    fontDown: "A− diminuir fonte",
    fontUp: "A+ aumentar fonte",
    close: "Fechar",
    shortcutsTitle: "Atalhos de teclado",
    goContent: "Ir para o conteúdo",
    goMenu: "Ir para o menu",
    goSearch: "Ir para a busca",
    goFooter: "Ir para o rodapé",
    openList: "Abrir esta lista",
    closePanels: "Fechar painel ou menu",
    cookie: "Usamos cookies para lembrar acessibilidade. A tradução automática e a medição de audiência só acontecem com o seu consentimento.",
    accept: "Aceitar",
    reject: "Recusar opcionais",
    customize: "Personalizar",
    saveCookies: "Salvar escolha",
    cookieNecessary: "Necessários ficam sempre ligados: acessibilidade e o registro desta escolha. A calculadora não depende deles.",
    cookieTranslation: "Tradução automática (MyMemory)",
    cookieAudience: "Medir desempenho desta visita, só neste navegador",
    autoNote: "A interface segue o idioma da URL. Textos institucionais usam tradução automática da MyMemory. Escalas e calculadoras permanecem em português.",
    clinicalLock: "Este instrumento permanece em português. Critérios e pontuação não passam por tradução automática.",
    searchPlaceholder: "Buscar calculadoras, escalas e seções",
    institutional: "Institucional",
    sustainability: "Sustentabilidade Digital",
    commitment: "Nosso Compromisso",
    follow: "Siga-nos",
    commitmentText: "Nosso site adota como princípio de governança o compromisso com altos padrões de acessibilidade digital, sustentabilidade digital e proteção de dados.",
    cookiesManage: "Gerenciar Preferências de Cookies",
  },
  en: {
    home: "Home",
    about: "About",
    calcs: "Calculators",
    contents: "Contents",
    jobs: "Jobs",
    exams: "Quizzes",
    library: "Nursing library",
    contact: "Contact",
    enter: "Sign in",
    subscribe: "Subscribe",
    search: "Search calculators and scales",
    menu: "Menu",
    system: "Visual system",
    pack: "Template pack",
    skip: "Skip to content",
    contrast: "Contrast",
    dyslexia: "Dyslexia",
    dark: "Dark",
    shortcuts: "Shortcuts",
    a11y: "Accessibility",
    language: "Language",
    reset: "Reset",
    fontDown: "A− decrease text",
    fontUp: "A+ increase text",
    close: "Close",
    shortcutsTitle: "Keyboard shortcuts",
    goContent: "Skip to content",
    goMenu: "Skip to menu",
    goSearch: "Skip to search",
    goFooter: "Skip to footer",
    openList: "Open this list",
    closePanels: "Close panel or menu",
    cookie: "We use cookies to remember accessibility. Automatic translation and audience measurement run only with your consent.",
    accept: "Accept",
    reject: "Reject optional",
    customize: "Customize",
    saveCookies: "Save choice",
    cookieNecessary: "Necessary cookies stay on: accessibility and this choice. The calculator does not depend on the optional ones.",
    cookieTranslation: "Automatic translation (MyMemory)",
    cookieAudience: "Measure performance for this visit, only in this browser",
    autoNote: "The interface follows the language in the URL. Institutional text uses MyMemory automatic translation. Scales and calculators stay in Portuguese.",
    clinicalLock: "This instrument stays in Portuguese. Criteria and scores are not machine-translated.",
    searchPlaceholder: "Search calculators, scales and sections",
    institutional: "Institutional",
    sustainability: "Digital sustainability",
    commitment: "Our commitment",
    follow: "Follow us",
    commitmentText: "This site is governed by a commitment to digital accessibility, digital sustainability and data protection.",
    cookiesManage: "Manage cookie preferences",
  },
  es: {
    home: "Inicio",
    about: "Sobre nosotros",
    calcs: "Calculadoras",
    contents: "Contenidos",
    jobs: "Empleo",
    exams: "Simulacros",
    library: "Biblioteca",
    contact: "Contacto",
    enter: "Entrar",
    subscribe: "Suscribirse",
    search: "Buscar calculadoras y escalas",
    menu: "Menú",
    system: "Sistema visual",
    pack: "Paquete de plantillas",
    skip: "Saltar al contenido",
    contrast: "Contraste",
    dyslexia: "Dislexia",
    dark: "Oscuro",
    shortcuts: "Atajos",
    a11y: "Accesibilidad",
    language: "Idioma",
    reset: "Restablecer",
    fontDown: "A− reducir texto",
    fontUp: "A+ aumentar texto",
    close: "Cerrar",
    shortcutsTitle: "Atajos de teclado",
    goContent: "Ir al contenido",
    goMenu: "Ir al menú",
    goSearch: "Ir a la búsqueda",
    goFooter: "Ir al pie",
    openList: "Abrir esta lista",
    closePanels: "Cerrar panel o menú",
    cookie: "Usamos cookies para recordar la accesibilidad. La traducción automática y la medición de audiencia solo ocurren con su consentimiento.",
    accept: "Aceptar",
    reject: "Rechazar opcionales",
    customize: "Personalizar",
    saveCookies: "Guardar elección",
    cookieNecessary: "Los necesarios siguen activos: accesibilidad y esta elección. La calculadora no depende de los opcionales.",
    cookieTranslation: "Traducción automática (MyMemory)",
    cookieAudience: "Medir el rendimiento de esta visita, solo en este navegador",
    autoNote: "La interfaz sigue el idioma de la URL. Los textos institucionales usan traducción automática de MyMemory. Las escalas y calculadoras permanecen en portugués.",
    clinicalLock: "Este instrumento permanece en portugués. Los criterios y la puntuación no se traducen automáticamente.",
    searchPlaceholder: "Buscar calculadoras, escalas y secciones",
    institutional: "Institucional",
    sustainability: "Sostenibilidad digital",
    commitment: "Nuestro compromiso",
    follow: "Síganos",
    commitmentText: "Este sitio se rige por el compromiso con la accesibilidad digital, la sostenibilidad digital y la protección de datos.",
    cookiesManage: "Gestionar preferencias de cookies",
  },
  fr: {
    home: "Accueil",
    about: "À propos",
    calcs: "Calculatrices",
    contents: "Contenus",
    jobs: "Emploi",
    exams: "QCM",
    library: "Bibliothèque",
    contact: "Contact",
    enter: "Connexion",
    subscribe: "S'abonner",
    search: "Rechercher calculateurs et échelles",
    menu: "Menu",
    system: "Système visuel",
    pack: "Pack de modèles",
    skip: "Aller au contenu",
    contrast: "Contraste",
    dyslexia: "Dyslexie",
    dark: "Sombre",
    shortcuts: "Raccourcis",
    a11y: "Accessibilité",
    language: "Langue",
    reset: "Réinitialiser",
    fontDown: "A− réduire le texte",
    fontUp: "A+ agrandir le texte",
    close: "Fermer",
    shortcutsTitle: "Raccourcis clavier",
    goContent: "Aller au contenu",
    goMenu: "Aller au menu",
    goSearch: "Aller à la recherche",
    goFooter: "Aller au pied de page",
    openList: "Ouvrir cette liste",
    closePanels: "Fermer le panneau ou le menu",
    cookie: "Nous utilisons des cookies pour mémoriser l'accessibilité. La traduction automatique et la mesure d'audience ne se font qu'avec votre accord.",
    accept: "Accepter",
    reject: "Refuser les optionnels",
    customize: "Personnaliser",
    saveCookies: "Enregistrer",
    cookieNecessary: "Les cookies nécessaires restent actifs : accessibilité et ce choix. La calculatrice n'en dépend pas.",
    cookieTranslation: "Traduction automatique (MyMemory)",
    cookieAudience: "Mesurer les performances de cette visite, seulement dans ce navigateur",
    autoNote: "L'interface suit la langue de l'URL. Les textes institutionnels utilisent la traduction automatique MyMemory. Les échelles et calculatrices restent en portugais.",
    clinicalLock: "Cet instrument reste en portugais. Les critères et le score ne sont pas traduits automatiquement.",
    searchPlaceholder: "Rechercher calculatrices, échelles et sections",
    institutional: "Institutionnel",
    sustainability: "Durabilité numérique",
    commitment: "Notre engagement",
    follow: "Nous suivre",
    commitmentText: "Ce site est régi par un engagement d'accessibilité numérique, de durabilité numérique et de protection des données.",
    cookiesManage: "Gérer les cookies",
  },
} as const;

const ChromeContext = createContext<ChromeState | null>(null);

export function ChromeProvider({ children }: { children: ReactNode }) {
  const stored = useStored();
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;
  const urlLang = useRouterState({
    select: (state) => parseLocale((state.location.search as { lang?: unknown }).lang),
  });
  const pathLang = useRouterState({
    select: (state) => {
      const top = state.location.pathname.replace(/^\//, "").split("/")[0];
      return top === "en" || top === "es" || top === "fr" ? top : undefined;
    },
  });
  const [locale, setLocaleState] = useState<Locale>(urlLang ?? pathLang ?? "pt-BR");
  const [font, setFontState] = useState<FontStep>("sm");
  const [contrast, setContrastState] = useState(false);
  const [focus, setFocusState] = useState<FocusColor>("yellow");
  const [dyslexia, setDyslexiaState] = useState(false);
  const [theme, setThemeState] = useState<ThemeMode>("light");
  const [consent, setConsentState] = useState<Consent>("unknown");

  useEffect(() => {
    const storedLocale = localStorage.getItem("cde-locale");
    const storedFont = localStorage.getItem("cde-font");
    const storedContrast = localStorage.getItem("cde-contrast");
    const storedFocus = localStorage.getItem("cde-focus");
    const storedDyslexia = localStorage.getItem("cde-dyslexia");
    const storedTheme = localStorage.getItem("cde-theme");
    const storedConsent = localStorage.getItem("cde-consent");
    if (storedFont === "sm" || storedFont === "md" || storedFont === "lg") setFontState(storedFont);
    setContrastState(storedContrast === "1");
    if (storedFocus === "yellow" || storedFocus === "lime" || storedFocus === "cyan" || storedFocus === "magenta") {
      setFocusState(storedFocus);
    }
    setDyslexiaState(storedDyslexia === "1");
    if (storedTheme === "dark" || storedTheme === "light") setThemeState(storedTheme);
    if (storedConsent === "accepted") setConsentState({ translation: true, audience: true });
    else if (storedConsent === "rejected") setConsentState({ translation: false, audience: false });
    else if (storedConsent) {
      try {
        const parsed = JSON.parse(storedConsent) as Partial<OptionalConsent>;
        if (typeof parsed.translation === "boolean" && typeof parsed.audience === "boolean") {
          setConsentState({ translation: parsed.translation, audience: parsed.audience });
        }
      } catch {
        /* ignore a broken preference */
      }
    }
    const fromUrl = parseLocale(new URLSearchParams(window.location.search).get("lang"));
    const top = window.location.pathname.replace(/^\//, "").split("/")[0];
    const fromPath = top === "en" || top === "es" || top === "fr" ? top : undefined;
    if (fromUrl) {
      setLocaleState(fromUrl);
      localStorage.setItem("cde-locale", fromUrl);
    } else if (fromPath) {
      setLocaleState(fromPath);
    } else if (storedLocale === "en" || storedLocale === "es" || storedLocale === "fr") {
      setLocaleState(storedLocale);
      const url = new URL(window.location.href);
      url.searchParams.set("lang", storedLocale);
      void routerRef.current.history.replace(`${url.pathname}${url.search}${url.hash}`);
    }
  }, []);

  useEffect(() => {
    if (urlLang) {
      setLocaleState(urlLang);
      return;
    }
    if (pathLang) setLocaleState(pathLang);
  }, [urlLang, pathLang]);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dataset.font = font;
    root.dataset.contrast = contrast ? "high" : "off";
    root.dataset.focus = focus;
    root.dataset.dyslexia = dyslexia ? "on" : "off";
    root.dataset.theme = theme;
  }, [locale, font, contrast, focus, dyslexia, theme]);

  const value = useMemo<ChromeState>(() => {
    const setLocale = (next: Locale) => {
      setLocaleState(next);
      localStorage.setItem("cde-locale", next);
      const url = new URL(window.location.href);
      if (next === "pt-BR") url.searchParams.delete("lang");
      else url.searchParams.set("lang", next);
      void routerRef.current.history.replace(`${url.pathname}${url.search}${url.hash}`);
    };
    const setFont = (next: FontStep) => {
      setFontState(next);
      localStorage.setItem("cde-font", next);
    };
    const setContrast = (on: boolean) => {
      setContrastState(on);
      localStorage.setItem("cde-contrast", on ? "1" : "0");
    };
    const setFocus = (next: FocusColor) => {
      setFocusState(next);
      localStorage.setItem("cde-focus", next);
    };
    const setDyslexia = (on: boolean) => {
      setDyslexiaState(on);
      localStorage.setItem("cde-dyslexia", on ? "1" : "0");
    };
    const setTheme = (next: ThemeMode) => {
      setThemeState(next);
      localStorage.setItem("cde-theme", next);
    };
    const resetA11y = () => {
      setFont("sm");
      setContrast(false);
      setFocus("yellow");
      setDyslexia(false);
      setTheme("light");
    };
    const setConsent = (next: Consent) => {
      setConsentState(next);
      if (next === "unknown") localStorage.removeItem("cde-consent");
      else localStorage.setItem("cde-consent", JSON.stringify(next));
    };
    return {
      locale,
      setLocale,
      font,
      setFont,
      contrast,
      setContrast,
      focus,
      setFocus,
      dyslexia,
      setDyslexia,
      theme,
      setTheme,
      resetA11y,
      consent,
      setConsent,
      t: (key) => stored.labels.find((row) => row.groupId === "chrome" && row.locale === locale && row.key === key)?.text ?? copy[locale][key],
    };
  }, [locale, font, contrast, focus, dyslexia, theme, consent, stored.labels]);

  return <ChromeContext.Provider value={value}>{children}</ChromeContext.Provider>;
}

export function useChrome() {
  const ctx = useContext(ChromeContext);
  if (!ctx) throw new Error("ChromeProvider missing");
  return ctx;
}

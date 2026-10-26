import { Link } from "@tanstack/react-router";
import { Accessibility, ArrowUp, ChevronDown, Instagram, Linkedin, Menu, Search, X, Youtube } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AccountSlot, MobileNav, SiteNav } from "@/components/site/site-nav";
import { useChrome, type FocusColor, type Locale, type OptionalConsent } from "@/lib/chrome";
import { navLabel } from "@/lib/translate";
import { storedFooter, useStored } from "@/lib/stored";

const locales: { id: Locale; label: string }[] = [
  { id: "pt-BR", label: "Português" },
  { id: "en", label: "English" },
  { id: "es", label: "Español" },
  { id: "fr", label: "Français" },
];

const focusColors: { id: FocusColor; hex: string; label: string }[] = [
  { id: "yellow", hex: "#ff0", label: "Foco amarelo" },
  { id: "lime", hex: "#b6ff00", label: "Foco verde" },
  { id: "cyan", hex: "#22d3ee", label: "Foco ciano" },
  { id: "magenta", hex: "#f0abfc", label: "Foco magenta" },
];

export function Shell({ children, editions = [], currentPath }: { children: ReactNode; editions?: { code: string; label: string; path: string }[]; currentPath?: string }) {
  const chrome = useChrome();
  const stored = useStored();
  const [menu, setMenu] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [a11yOpen, setA11yOpen] = useState(false);
  const [shortcuts, setShortcuts] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [cookieDraft, setCookieDraft] = useState<OptionalConsent>({ translation: false, audience: false });
  const dialogRef = useRef<HTMLDivElement>(null);
  const shortcutBtn = useRef<HTMLButtonElement>(null);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const langBtn = useRef<HTMLButtonElement>(null);
  const langWrap = useRef<HTMLDivElement>(null);
  const a11yBtn = useRef<HTMLButtonElement>(null);
  const a11yBar = useRef<HTMLDivElement>(null);
  const pendingNav = useRef<"menu" | "search" | null>(null);
  const shortcutsRef = useRef(false);
  shortcutsRef.current = shortcuts;

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 360);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onEscape(event: KeyboardEvent) {
      if (event.key !== "Escape" || shortcutsRef.current) return;
      if (langOpen) {
        setLangOpen(false);
        langBtn.current?.focus();
        event.preventDefault();
        return;
      }
      if (a11yOpen) {
        setA11yOpen(false);
        a11yBtn.current?.focus();
        event.preventDefault();
        return;
      }
      if (menu) {
        setMenu(false);
        menuBtn.current?.focus();
        event.preventDefault();
      }
    }
    function onOutside(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (langOpen && !langWrap.current?.contains(target)) setLangOpen(false);
      if (a11yOpen && !a11yBar.current?.contains(target) && !a11yBtn.current?.contains(target)) setA11yOpen(false);
    }
    document.addEventListener("keydown", onEscape);
    document.addEventListener("pointerdown", onOutside);
    return () => {
      document.removeEventListener("keydown", onEscape);
      document.removeEventListener("pointerdown", onOutside);
    };
  }, [langOpen, a11yOpen, menu]);

  useEffect(() => {
    if (!langOpen) return;
    langWrap.current?.querySelector<HTMLElement>("button[aria-current='true']")?.focus();
  }, [langOpen]);

  useEffect(() => {
    if (!menu) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const panel = document.querySelector<HTMLElement>(".off-canvas");
    const selector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    function trap(event: KeyboardEvent) {
      if (event.key !== "Tab" || !panel) return;
      const items = [...panel.querySelectorAll<HTMLElement>(selector)].filter((item) => item.getClientRects().length > 0);
      if (!items.length) {
        event.preventDefault();
        panel.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !panel.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    }
    panel?.addEventListener("keydown", trap);
    return () => {
      document.body.style.overflow = previous;
      panel?.removeEventListener("keydown", trap);
    };
  }, [menu]);

  useEffect(() => {
    if (!menu || !pendingNav.current) return;
    const target = pendingNav.current;
    pendingNav.current = null;
    const frame = requestAnimationFrame(() => {
      const selector = target === "search" ? ".off-search input" : ".off-canvas-body a, .off-canvas-body button";
      const panel = document.querySelector<HTMLElement>(".off-canvas");
      (panel?.querySelector<HTMLElement>(selector) ?? panel)?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [menu]);

  useEffect(() => {
    if (!shortcuts) return;
    dialogRef.current?.querySelector<HTMLElement>("button")?.focus();
  }, [shortcuts]);

  useEffect(() => {
    function visible(selector: string) {
      const el = document.querySelector(selector);
      if (!el) return false;
      return getComputedStyle(el).display !== "none";
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && shortcutsRef.current) {
        event.preventDefault();
        setShortcuts(false);
        shortcutBtn.current?.focus();
      }
      if (!event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const actions: Record<string, () => void> = {
        Digit1: () => document.getElementById("conteudo")?.focus(),
        Digit2: () => {
          if (visible(".hamburger")) {
            pendingNav.current = "menu";
            setMenu(true);
          } else {
            document.querySelector<HTMLElement>("#menu-principal a, #menu-principal button")?.focus();
          }
        },
        Digit3: () => {
          if (visible(".hamburger")) {
            pendingNav.current = "search";
            setMenu(true);
          } else {
            window.dispatchEvent(new Event("cde-open-search"));
          }
        },
        Digit4: () => document.getElementById("rodape")?.focus(),
        Digit0: () => setShortcuts(true),
      };
      const run = actions[event.code];
      if (!run) return;
      event.preventDefault();
      run();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const editionCode = currentPath?.replace(/^\//, "").split("/")[0] ?? "";
  const footer = storedFooter(stored.labels, /^[a-z]{2}$/.test(editionCode) ? editionCode : chrome.locale);

  function openPrefs() {
    setCookieDraft(chrome.consent === "unknown" ? { translation: false, audience: false } : chrome.consent);
    setPrefsOpen(true);
  }

  return (
    <>
      <a className="skip-link" href="#conteudo">
        {chrome.t("skip")}
      </a>
      <div className="sr-only" aria-live="polite">
        {chrome.locale}
      </div>
      <div className="header-utility">
        <div className="header-utility-start">
          <div className="a11y-lang" ref={langWrap}>
            <button
              ref={langBtn}
              className="lang-trigger"
              type="button"
              aria-expanded={langOpen}
              aria-controls="header-language-menu"
              aria-label={chrome.t("language")}
              onClick={() => setLangOpen((v) => !v)}
            >
              {currentPath ? (editions.find((item) => item.path === currentPath)?.code ?? "PT").toUpperCase() : chrome.locale === "pt-BR" ? "PT" : chrome.locale.toUpperCase()}
              <ChevronDown size={12} aria-hidden="true" />
            </button>
            {langOpen ? (
              <div id="header-language-menu" className="lang-menu" role="group" aria-label={chrome.t("language")}>
                {editions.length > 1
                  ? editions.map((item) => (
                      <Link
                        key={item.path}
                        to="/$"
                        params={{ _splat: item.path.slice(1) }}
                        lang={item.code}
                        aria-current={item.path === currentPath ? "page" : undefined}
                        onClick={() => setLangOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))
                  : null}
                {locales.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    lang={item.id}
                    aria-current={chrome.locale === item.id ? "true" : undefined}
                    onClick={() => {
                      chrome.setLocale(item.id);
                      setLangOpen(false);
                      langBtn.current?.focus();
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <button
            className="utility-search"
            type="button"
            aria-label={chrome.t("search")}
            onClick={() => {
              if (window.matchMedia("(max-width: 1179px)").matches) {
                pendingNav.current = "search";
                setMenu(true);
              } else {
                window.dispatchEvent(new Event("cde-open-search"));
              }
            }}
          >
            <Search size={16} aria-hidden="true" />
            <span>{chrome.t("search").split(" ")[0]}</span>
          </button>
        </div>
        <div ref={a11yBar} id="barra-acessibilidade" className={`a11y-tools${a11yOpen ? " is-open" : ""}`} role="toolbar" aria-label={chrome.t("a11y")}>
          <button type="button" disabled={chrome.font === "sm"} aria-label={chrome.t("fontDown")} onClick={() => chrome.setFont(chrome.font === "lg" ? "md" : "sm")}>
            A−
          </button>
          <button type="button" disabled={chrome.font === "lg"} aria-label={chrome.t("fontUp")} onClick={() => chrome.setFont(chrome.font === "sm" ? "md" : "lg")}>
            A+
          </button>
          <button type="button" aria-pressed={chrome.contrast} onClick={() => chrome.setContrast(!chrome.contrast)}>
            {chrome.t("contrast")}
          </button>
          <button type="button" aria-pressed={chrome.dyslexia} onClick={() => chrome.setDyslexia(!chrome.dyslexia)}>
            {chrome.t("dyslexia")}
          </button>
          <button type="button" aria-pressed={chrome.theme === "dark"} onClick={() => chrome.setTheme(chrome.theme === "dark" ? "light" : "dark")}>
            {chrome.t("dark")}
          </button>
          <button ref={shortcutBtn} type="button" aria-expanded={shortcuts} aria-controls="atalhos" onClick={() => setShortcuts((open) => !open)}>
            {chrome.t("shortcuts")}
          </button>
          {focusColors.map((color) => (
            <button
              key={color.id}
              type="button"
              className="focus-dot"
              data-on={chrome.focus === color.id}
              aria-label={color.label}
              style={{ background: color.hex }}
              onClick={() => chrome.setFocus(color.id)}
            />
          ))}
          <button type="button" onClick={chrome.resetA11y}>
            {chrome.t("reset")}
          </button>
        </div>
        <div className="header-utility-end">
          <Link to="/secao/$slug" params={{ slug: "assinatura" }} className="utility-subscribe">
            {chrome.t("subscribe")}
          </Link>
          <AccountSlot className="utility-login" />
          <button
            ref={a11yBtn}
            className="a11y-mobile-toggle"
            type="button"
            aria-expanded={a11yOpen}
            aria-controls="barra-acessibilidade"
            onClick={() => setA11yOpen((open) => !open)}
          >
            <Accessibility size={18} aria-hidden="true" />
            <span>{chrome.t("a11y")}</span>
          </button>
        </div>
      </div>

      {shortcuts ? (
        <div
          id="atalhos"
          ref={dialogRef}
          className="shortcut-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="atalhos-titulo"
          onKeyDown={(event) => {
            if (event.key !== "Tab" || !dialogRef.current) return;
            const items = [...dialogRef.current.querySelectorAll<HTMLElement>("button, a, [href]")];
            const first = items[0];
            const last = items[items.length - 1];
            if (!first || !last) return;
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault();
              last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first.focus();
            }
          }}
        >
          <header>
            <h2 id="atalhos-titulo">{chrome.t("shortcutsTitle")}</h2>
            <button
              type="button"
              onClick={() => {
                setShortcuts(false);
                shortcutBtn.current?.focus();
              }}
            >
              {chrome.t("close")}
            </button>
          </header>
          <dl>
            <div>
              <dt>{chrome.t("goContent")}</dt>
              <dd>
                <kbd>Alt</kbd> + <kbd>1</kbd>
              </dd>
            </div>
            <div>
              <dt>{chrome.t("goMenu")}</dt>
              <dd>
                <kbd>Alt</kbd> + <kbd>2</kbd>
              </dd>
            </div>
            <div>
              <dt>{chrome.t("goSearch")}</dt>
              <dd>
                <kbd>Alt</kbd> + <kbd>3</kbd>
              </dd>
            </div>
            <div>
              <dt>{chrome.t("goFooter")}</dt>
              <dd>
                <kbd>Alt</kbd> + <kbd>4</kbd>
              </dd>
            </div>
            <div>
              <dt>{chrome.t("openList")}</dt>
              <dd>
                <kbd>Alt</kbd> + <kbd>0</kbd>
              </dd>
            </div>
            <div>
              <dt>{chrome.t("closePanels")}</dt>
              <dd>
                <kbd>Esc</kbd>
              </dd>
            </div>
          </dl>
        </div>
      ) : null}

      <header className="site-header">
        <div className="site-header-inner">
          <Link to="/" className="brand" aria-label="Calculadoras de Enfermagem">
            <img src="/brand/logo.webp" alt="" width={48} height={48} />
            <span className="brand-name">
              Calculadoras
              <small>de Enfermagem</small>
            </span>
          </Link>
          <SiteNav />
          <button
            ref={menuBtn}
            className="hamburger"
            type="button"
            aria-label={chrome.t("menu")}
            aria-expanded={menu}
            onClick={() => setMenu(true)}
          >
            <Menu size={18} />
          </button>
        </div>
      </header>

      {menu ? (
        <>
          <button className="menu-overlay" aria-label={chrome.t("close")} onClick={() => { setMenu(false); menuBtn.current?.focus(); }} />
          <nav className="off-canvas" aria-label="Menu" tabIndex={-1}>
            <header>
              <span>{chrome.t("menu")}</span>
              <button
                type="button"
                aria-label={chrome.t("close")}
                onClick={() => {
                  setMenu(false);
                  menuBtn.current?.focus();
                }}
              >
                <X size={22} />
              </button>
            </header>
            <MobileNav menuLabel={chrome.t("menu")} onNavigate={() => setMenu(false)} />
          </nav>
        </>
      ) : null}

      <main id="conteudo" className="site-main" tabIndex={-1}>
        {chrome.locale !== "pt-BR" ? <p className="lang-note">{chrome.t("autoNote")}</p> : null}
        {children}
      </main>

      <footer id="rodape" className="site-footer" tabIndex={-1}>
        <div className="footer-grid">
          <div>
            <h2>{footer.institutional}</h2>
            <Link to="/secao/$slug" params={{ slug: "missao-visao-valores" }}>{footer.about}</Link>
            <Link to="/secao/$slug" params={{ slug: "politicas" }}>{navLabel("politicas", "Políticas do site", chrome.locale)}</Link>
            <Link to="/secao/$slug" params={{ slug: "termos" }}>{footer.terms}</Link>
            <Link to="/secao/$slug" params={{ slug: "acessibilidade" }}>{footer.accessibilityPolicy}</Link>
            <Link to="/secao/$slug" params={{ slug: "politica-editorial" }}>Editorial</Link>
            <Link to="/secao/$slug" params={{ slug: "planos" }}>Assinante</Link>
            <Link to="/secao/$slug" params={{ slug: "contato" }}>{navLabel("contato", "Fale conosco", chrome.locale)}</Link>
            <Link to="/secao/$slug" params={{ slug: "mapa" }}>{footer.siteMap}</Link>
          </div>
          <div>
            <h2>{footer.digitalSustainability}</h2>
            <Link to="/secao/$slug" params={{ slug: "compromisso" }}>{footer.ourCommitment}</Link>
            <Link to="/secao/$slug" params={{ slug: "metodologia-de-medicao" }}>Metodologia</Link>
            <Link to="/secao/$slug" params={{ slug: "relatorios-de-sustentabilidade" }}>{footer.impact}</Link>
          </div>
          <div>
            <h2>{footer.ourCommitment}</h2>
            <p>{footer.commitmentText}</p>
          </div>
          <div>
            <h2>{footer.followUs}</h2>
            <div className="social-row">
              <a href="https://www.instagram.com/calculadorasdeenfermagem/" rel="noreferrer" aria-label="Instagram"><Instagram size={18} aria-hidden="true" /></a>
              <a href="https://www.youtube.com/channel/UC_6runTDHz8u5S1Yab842pg" rel="noreferrer" aria-label="YouTube"><Youtube size={18} aria-hidden="true" /></a>
              <a href="https://linkedin.com/company/calculadoras-de-enfermagem" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={18} aria-hidden="true" /></a>
            </div>
            <button className="linkish" type="button" onClick={openPrefs}>
              {footer.manageCookies}
            </button>
          </div>
        </div>
        <div className="footer-bottom">
          <span>{footer.copyright}</span>
        </div>
      </footer>

      {chrome.consent === "unknown" && !prefsOpen ? (
        <div className="cookie-banner" role="dialog" aria-labelledby="cookie-title">
          <div>
            <p id="cookie-title">{chrome.t("cookie")}</p>
          </div>
          <div className="cookie-actions">
            <button type="button" onClick={() => chrome.setConsent({ translation: true, audience: true })}>
              {chrome.t("accept")}
            </button>
            <button type="button" className="secondary" onClick={() => chrome.setConsent({ translation: false, audience: false })}>
              {chrome.t("reject")}
            </button>
            <button type="button" className="secondary" onClick={openPrefs}>
              {chrome.t("customize")}
            </button>
          </div>
        </div>
      ) : null}

      {prefsOpen ? (
        <div className="cookie-modal" role="presentation" onClick={() => setPrefsOpen(false)}>
          <div
            className="cookie-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-prefs-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="cookie-prefs-title">{chrome.t("cookiesManage")}</h2>
            <p>{chrome.t("cookieNecessary")}</p>
            <fieldset className="cookie-choices">
              <label>
                <input type="checkbox" checked disabled /> {chrome.t("cookieNecessary").split(".")[0]}
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={cookieDraft.translation}
                  onChange={(event) => setCookieDraft({ ...cookieDraft, translation: event.target.checked })}
                />
                {chrome.t("cookieTranslation")}
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={cookieDraft.audience}
                  onChange={(event) => setCookieDraft({ ...cookieDraft, audience: event.target.checked })}
                />
                {chrome.t("cookieAudience")}
              </label>
            </fieldset>
            <div className="cookie-actions">
              <button type="button" onClick={() => { chrome.setConsent(cookieDraft); setPrefsOpen(false); }}>
                {chrome.t("saveCookies")}
              </button>
              <button type="button" className="secondary" onClick={() => setPrefsOpen(false)}>
                {chrome.t("close")}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showTop ? (
        <button className="to-top" type="button" aria-label="Voltar ao topo" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <ArrowUp size={18} aria-hidden="true" />
        </button>
      ) : null}
    </>
  );
}

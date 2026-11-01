import { Link } from "@tanstack/react-router";
import { Accessibility, ArrowUp, BookOpenText, ChevronDown, Contrast, Instagram, Keyboard, Linkedin, Menu, Moon, Search, X, Youtube } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { MobileNav, SiteNav } from "@/components/site/site-nav";
import { brandLogo } from "@/lib/contracts";

import { useChrome, type FocusColor, type Locale, type OptionalConsent } from "@/lib/chrome";
import { navLabel } from "@/lib/translate";
import { headerWords, selectableLocales } from "@/lib/header-i18n";
import { authEnabled } from "@/lib/auth/client";
import { fontControlVisual } from "@/lib/country-icon-rendering";
import { focusColorName } from "@/lib/focus-color-i18n";

const focusColors: { id: FocusColor; hex: string }[] = [
  { id: "yellow", hex: "#ff0" },
  { id: "lime", hex: "#b6ff00" },
  { id: "cyan", hex: "#22d3ee" },
  { id: "magenta", hex: "#f0abfc" },
];

/** Caminho público derivado do contrato de marca (o prefixo `public/` sai fora). */
const brandLogoPublicPath = brandLogo?.file?.replace(/^public/, "") ?? "/brand/logo.svg";

export function Shell({ children }: { children: ReactNode }) {
  const chrome = useChrome();
  const [menu, setMenu] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [a11yOpen, setA11yOpen] = useState(false);
  const hw = headerWords[chrome.locale];
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

  // Close transient header surfaces without losing keyboard context.
  useEffect(() => {
    function onEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (shortcutsRef.current) return; // handled by shortcut dialog
      if (langOpen) { setLangOpen(false); langBtn.current?.focus(); event.preventDefault(); return; }
      if (a11yOpen) { setA11yOpen(false); a11yBtn.current?.focus(); event.preventDefault(); return; }
      if (menu) { setMenu(false); menuBtn.current?.focus(); event.preventDefault(); }
    }
    function onOutside(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (langOpen && !langWrap.current?.contains(target)) setLangOpen(false);
      if (a11yOpen && !a11yBar.current?.contains(target) && !a11yBtn.current?.contains(target)) setA11yOpen(false);
    }
    document.addEventListener("keydown", onEscape);
    document.addEventListener("pointerdown", onOutside);
    return () => { document.removeEventListener("keydown", onEscape); document.removeEventListener("pointerdown", onOutside); };
  }, [langOpen, a11yOpen, menu]);

  useEffect(() => {
    if (!langOpen) return;
    document.querySelector<HTMLElement>("#header-language-menu button[aria-current='true']")?.focus();
  }, [langOpen]);

  useEffect(() => {
    if (!menu) return;
    const target = pendingNav.current;
    pendingNav.current = null;
    const frame = requestAnimationFrame(() => {
      const selector = target === "search" ? ".off-search input" : target === "menu" ? ".off-canvas-body a, .off-canvas-body button" : ".off-canvas header button";
      const panel = document.querySelector<HTMLElement>(".off-canvas");
      (panel?.querySelector<HTMLElement>(selector) ?? panel?.querySelector<HTMLElement>('button') ?? panel)?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [menu]);

  // Prevent background scrolling while the mobile dialog is open.
  useEffect(() => {
    if (!menu) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [menu]);

  // Keep keyboard focus inside the mobile navigation while it is open.
  useEffect(() => {
    if (!menu) return;
    const panel = document.querySelector<HTMLElement>(".off-canvas");
    if (!panel) return;
    const selector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    function trapTab(event: KeyboardEvent) {
      if (event.key !== "Tab" || !panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(selector)).filter((item) => item.getClientRects().length > 0);
      if (!items.length) { event.preventDefault(); panel.focus(); return; }
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !panel.contains(document.activeElement))) {
        event.preventDefault(); first.focus();
      }
    }
    panel.addEventListener("keydown", trapTab);
    return () => panel.removeEventListener("keydown", trapTab);
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
      <div className="header-utility" role="group" aria-label={hw.language}>
        <div className="header-utility-start">
          <div className="a11y-lang" ref={langWrap}>
            <button ref={langBtn} className="lang-trigger" type="button" aria-haspopup="true" aria-label={hw.language} aria-controls="header-language-menu" aria-expanded={langOpen} onClick={() => setLangOpen((v) => !v)}>
              {chrome.locale === "pt-BR" ? "PT" : chrome.locale.toUpperCase()} <ChevronDown size={14} aria-hidden="true" />
            </button>
            {langOpen ? <div id="header-language-menu" className="lang-menu" role="group" aria-label={hw.language}>
              {selectableLocales.map((item) => <button key={item.id} type="button" lang={item.id} aria-current={chrome.locale === item.id ? "true" : undefined} onClick={() => { chrome.setLocale(item.id); setLangOpen(false); langBtn.current?.focus(); }}>{item.label}</button>)}
            </div> : null}
          </div>
          <button className="utility-search" type="button" aria-label={hw.search} onClick={() => { if (window.matchMedia("(max-width: 1179px)").matches) { pendingNav.current = "search"; setMenu(true); } else { window.dispatchEvent(new Event("cde-open-search")); } }}><Search size={17} aria-hidden="true" /><span>{hw.search}</span></button>
        </div>
        <div className="header-utility-end">
          <Link to="/secao/$slug" params={{ slug: "assinatura" }} className="utility-subscribe">{chrome.t("subscribe")}</Link>
          <Link to="/login" className="utility-login" aria-label={chrome.t("enter")}>
            {chrome.t("enter")}
          </Link>
          <button ref={a11yBtn} className="a11y-mobile-toggle" type="button" aria-label={hw.accessibility} aria-controls="header-accessibility-controls" aria-expanded={a11yOpen} onClick={() => setA11yOpen((v) => !v)}><Accessibility size={19} aria-hidden="true" /><span>{hw.accessibility}</span></button>
        </div>
      </div>
      <div ref={a11yBar} id="header-accessibility-controls" className={`a11y-bar ${a11yOpen ? "is-open" : ""}`} role="toolbar" aria-label={hw.accessibility}>
        <button type="button" disabled={chrome.font === "sm"} aria-label={hw.fontDown} onClick={() => chrome.setFont(chrome.font === "lg" ? "md" : "sm")}>
          <span aria-hidden="true">{fontControlVisual(chrome.locale, "down")}</span><span className="a11y-action-label">{hw.fontDown}</span>
        </button>
        <button type="button" disabled={chrome.font === "lg"} aria-label={hw.fontUp} onClick={() => chrome.setFont(chrome.font === "sm" ? "md" : "lg")}>
          <span aria-hidden="true">{fontControlVisual(chrome.locale, "up")}</span><span className="a11y-action-label">{hw.fontUp}</span>
        </button>
        <button type="button" aria-pressed={chrome.contrast} onClick={() => chrome.setContrast(!chrome.contrast)}>
          <Contrast aria-hidden="true" />
          {hw.contrast}
        </button>
        <button type="button" aria-pressed={chrome.dyslexia} onClick={() => chrome.setDyslexia(!chrome.dyslexia)}>
          <BookOpenText aria-hidden="true" />
          {hw.dyslexia}
        </button>
        <button
          type="button"
          aria-pressed={chrome.theme === "dark"}
          onClick={() => chrome.setTheme(chrome.theme === "dark" ? "light" : "dark")}
        >
          <Moon aria-hidden="true" />
          {hw.dark}
        </button>
        <button
          ref={shortcutBtn}
          type="button"
          aria-expanded={shortcuts}
          aria-controls="atalhos"
          onClick={() => setShortcuts((open) => !open)}
        >
          <Keyboard aria-hidden="true" />
          {hw.shortcuts}
        </button>
        {focusColors.map((color) => (
          <button
            key={color.id}
            type="button"
            className="focus-dot"
            data-on={chrome.focus === color.id}
            aria-pressed={chrome.focus === color.id}
            aria-label={`${hw.accessibility}: ${focusColorName(chrome.locale, color.id)}`}
            style={{ background: color.hex }}
            onClick={() => chrome.setFocus(color.id)}
          />
        ))}
        <button type="button" onClick={chrome.resetA11y}>
          {hw.reset}
        </button>
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
            {/* Só o símbolo. O wordmark ao lado do logotipo foi removido por
                decisão do dono do produto: a marca já se identifica pelo ícone
                e o nome completo vive no <title> e no aria-label do link.

                O caminho vem do contrato CE-CONTRACT-BRAND, não de uma string
                solta aqui: se o contrato deixar de declarar um logo live, a
                aplicação não sobe. É o que distingue um contrato de uma nota. */}
            <img src={brandLogoPublicPath} alt="" width={56} height={56} />
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
          <button tabIndex={-1} className="menu-overlay" aria-label={chrome.t("close")} onClick={() => { setMenu(false); menuBtn.current?.focus(); }} />
          <nav className="off-canvas" aria-label={chrome.t("menu")} aria-modal="true" role="dialog" tabIndex={-1}>
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
            <MobileNav menuLabel={chrome.t("menu")} onNavigate={() => { setMenu(false); menuBtn.current?.focus(); }} />
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
            <h2>{chrome.t("institutional")}</h2>
            <Link to="/secao/$slug" params={{ slug: "missao-visao-valores" }}>{chrome.t("about")}</Link>
            <Link to="/secao/$slug" params={{ slug: "politicas" }}>{navLabel("politicas", "Políticas do site", chrome.locale)}</Link>
            <Link to="/secao/$slug" params={{ slug: "termos" }}>{navLabel("termos", "Termos e Condições de Uso", chrome.locale)}</Link>
            <Link to="/secao/$slug" params={{ slug: "acessibilidade" }}>{navLabel("acessibilidade", "Política de Acessibilidade", chrome.locale)}</Link>
            <Link to="/secao/$slug" params={{ slug: "politica-editorial" }}>Editorial</Link>
            <Link to="/secao/$slug" params={{ slug: "planos" }}>Assinante</Link>
            <Link to="/secao/$slug" params={{ slug: "contato" }}>{navLabel("contato", "Fale conosco", chrome.locale)}</Link>
            <Link to="/secao/$slug" params={{ slug: "mapa" }}>{navLabel("mapa", "Mapa do Site", chrome.locale)}</Link>
          </div>
          <div>
            <h2>{chrome.t("sustainability")}</h2>
            <Link to="/secao/$slug" params={{ slug: "compromisso" }}>{chrome.t("commitment")}</Link>
            <Link to="/secao/$slug" params={{ slug: "metodologia-de-medicao" }}>Metodologia</Link>
            <Link to="/secao/$slug" params={{ slug: "relatorios-de-sustentabilidade" }}>Relatórios</Link>
          </div>
          <div>
            <h2>{chrome.t("commitment")}</h2>
            <p>{chrome.t("commitmentText")}</p>
          </div>
          <div>
            <h2>{chrome.t("follow")}</h2>
            <div className="social-row">
              <a href="https://www.instagram.com/calculadorasdeenfermagem/" rel="noreferrer" aria-label="Instagram"><Instagram size={18} aria-hidden="true" /></a>
              <a href="https://www.youtube.com/channel/UC_6runTDHz8u5S1Yab842pg" rel="noreferrer" aria-label="YouTube"><Youtube size={18} aria-hidden="true" /></a>
              <a href="https://linkedin.com/company/calculadoras-de-enfermagem" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={18} aria-hidden="true" /></a>
            </div>
            <button className="linkish" type="button" onClick={openPrefs}>
              {chrome.t("cookiesManage")}
            </button>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Calculadoras de Enfermagem. Todos os direitos reservados.</span>
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

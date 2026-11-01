import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { useRef, type ReactNode } from "react";
import { slugify } from "@/lib/slug";
import { useChrome } from "@/lib/chrome";
import { tileText } from "@/lib/library-copy";
import { cardsOf, storedHome, useStored } from "@/lib/stored";

const icons = {
  calc: "/brand/calc-icon.webp",
  book: "/brand/livro.webp",
  cap: "/brand/chapeu.webp",
} as const;

function Destino({
  slug,
  section,
  hash,
  className,
  ariaLabel,
  children,
}: {
  slug?: string;
  section?: string;
  hash?: string;
  className?: string;
  ariaLabel?: string;
  children: ReactNode;
}) {
  if (slug) {
    return (
      <Link to="/ferramentas/$slug" params={{ slug }} className={className} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }
  return (
    <Link
      to="/secao/$slug"
      params={{ slug: section ?? "calculadoras" }}
      hash={hash}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </Link>
  );
}

function TileLink({ item, section, title, text }: { item: { title: string; slug: string | null; icon: "calc" | "book" | "cap" | null; section?: string | null; hash?: string | null }; section: string; title: string; text: string }) {
  return (
    <Destino
      slug={item.slug ?? undefined}
      section={item.section || section}
      hash={item.hash || (item.slug ? undefined : slugify(item.title))}
      className="calc-tile"
      ariaLabel={title}
    >
      <img src={icons[item.icon ?? "calc"]} alt="" width={56} height={56} />
      <h3>{title}</h3>
      <p>{text}</p>
    </Destino>
  );
}

function SectionBand({
  kicker,
  title,
  subtitle,
  icon,
  labelledBy,
}: {
  kicker: string;
  title: string;
  subtitle: string;
  icon: "calc" | "book" | "cross";
  labelledBy: string;
}) {
  return (
    <section className="section-head" aria-labelledby={labelledBy}>
      <span className="deco-a" aria-hidden="true" />
      <span className="deco-b" aria-hidden="true" />
      <div className="section-head-inner">
        <div>
          <span className="eyebrow">{kicker}</span>
          <h2 className="section-title" id={labelledBy}>
            {title}
          </h2>
          <p className="section-sub">{subtitle}</p>
        </div>
        <div className="ico-circle" aria-hidden="true">
          <img
            src={icon === "book" ? icons.book : icon === "cross" ? "/brand/logo.webp" : icons.calc}
            alt=""
            width={28}
            height={28}
          />
        </div>
      </div>
    </section>
  );
}

export function HomePage({ copyLocale }: { copyLocale?: string }) {
  const chrome = useChrome();
  const stored = useStored();
  const copy = storedHome(stored.labels, copyLocale ?? chrome.locale);
  const specialties = stored.specialties;
  const sideCards = cardsOf(stored.catalog, "home-lateral");
  const resourceCards = cardsOf(stored.catalog, "home-recurso");
  const calculators = cardsOf(stored.catalog, "calculadoras");
  const simulations = cardsOf(stored.catalog, "simulados");
  const scales = cardsOf(stored.catalog, "escalas");
  const ui = copy.ui;

  function labelOf(item: { title: string; text: string; file: string | null }) {
    const hit = tileText(copy, item.file ?? undefined);
    return { title: hit?.title || item.title, text: hit?.text || item.text };
  }
  const scroller = useRef<HTMLDivElement>(null);

  function scrollBy(direction: number) {
    scroller.current?.scrollBy({ top: direction * 140, behavior: "smooth" });
  }

  return (
    <>
      <div className="hero-zone">
        <section className="hero-main" aria-labelledby="home-title">
          <span className="glass-top" aria-hidden="true" />
          <span className="glass-bot" aria-hidden="true" />
          <div style={{ position: "relative", zIndex: 1 }}>
            <p className="hero-kicker">{copy.platform}</p>
            <h1 className="hero-title" id="home-title">
              {copy.title}
            </h1>
            <p className="hero-lead">{copy.lead}</p>
            <div className="library-panel">
              <p className="hero-kicker">{copy.library}</p>
              <div className="library-row">
                <div className="library-ico" aria-hidden="true">
                  <img src="/brand/livro.webp" alt="" width={28} height={28} />
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: 18 }}>{copy.resources}</p>
                  <p style={{ margin: 0, color: "#dbeafe", fontSize: 14 }}>{copy.resourcesLead}</p>
                </div>
              </div>
              <p className="hero-kicker" style={{ marginTop: 14 }}>
                {copy.specialtiesLabel}
              </p>
              <div className="chip-row">
                {specialties.map((name, index) => (
                  <Link key={name} to="/secao/$slug" params={{ slug: "escalas" }} hash={slugify(name)} className="scale-chip">
                    {copy.specialties?.[index] || name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="hero-visual">
          <img
            src="/brand/enfermeira.webp"
            alt={copy.nurseAlt || "Enfermeira utilizando a plataforma de calculadoras clínicas"}
            width={600}
            height={900}
          />
        </div>

        <div className="hero-cards">
          {sideCards.map((card, index) => (
            <Destino key={card.title} slug={card.slug ?? undefined} section={card.section ?? undefined} hash={card.hash ?? undefined} className="nav-card">
            <h3>{copy.cards[index]?.title || card.title}</h3>
            <p>{copy.cards[index]?.text || card.text}</p>
          </Destino>
          ))}
        </div>
      </div>

      <section className="ext-strip" aria-label="Extensões para o navegador">
        <p>
          Instale nossas <a className="inline" href="https://chromewebstore.google.com/" rel="noreferrer">extensões para o navegador</a> e facilite as
          ferramentas no ambiente de trabalho:
        </p>
        <div className="ext-row">
          <a className="ext-card" href="https://chromewebstore.google.com/detail/cddkdjnbmpabgjgdnbgmheojdjfpekgi" rel="noreferrer">
            <img src="/brand/ext-braden.webp" alt="" width={38} height={38} />
            <span>{copy.braden || "Escala de Braden"}</span>
          </a>
          <a className="ext-card" href="https://chromewebstore.google.com/detail/pchjjphfonpnkbinkllcfndnopljnlhm" rel="noreferrer">
            <img src="/brand/ext-gotejamento.webp" alt="" width={38} height={38} />
            <span>{copy.drip || "Calculadora Gotejamento e Medicamento"}</span>
          </a>
          <a className="ext-card" href="https://chromewebstore.google.com/detail/okhenkmaifpmecnanhbacphhfejiopfj" rel="noreferrer">
            <img src="/brand/ext-gasometria.webp" alt="" width={38} height={38} />
            <span>{copy.gas || "Calculadora de Gasometria"}</span>
          </a>
        </div>
      </section>

      <nav className="nav-grid" aria-label="Conteúdos e recursos">
        {resourceCards.map((card, index) => (
          <Link key={card.title} to="/secao/$slug" params={{ slug: card.section ?? "conteudos" }} hash={card.hash ?? undefined} className="nav-card">
            <h3>{copy.resourcesCards?.[index]?.title || card.title}</h3>
            <p>{copy.resourcesCards?.[index]?.text || card.text}</p>
          </Link>
        ))}
      </nav>

      <section aria-labelledby="Calculadoras">
        <div className="section-head">
          <span className="deco-a" aria-hidden="true" />
          <span className="deco-b" aria-hidden="true" />
          <div className="section-head-inner">
            <div>
              <span className="eyebrow">{copy.supportEyebrow || "Ferramentas de Apoio"}</span>
              <h2 className="section-title" id="Calculadoras">
                {copy.calculators || "Calculadoras"}
              </h2>
              <p className="section-sub">{copy.practical || "Enfermagem Prática"}</p>
            </div>
            <div className="ico-circle" aria-hidden="true">
              <img src={icons.calc} alt="" width={28} height={28} />
            </div>
          </div>
        </div>
        <div className="tools-layout">
          <div className="calc-pane">
            <div className="calc-scroller" ref={scroller} tabIndex={0}>
              <ul className="calc-grid">
                {calculators.map((item) => {
                  const label = labelOf(item);
                  return (
                  <li key={item.title}>
                    <TileLink item={item} section="calculadoras" title={label.title} text={label.text} />
                  </li>
                  );
                })}
              </ul>
            </div>
            <div className="scroll-rail">
              <button className="scroll-btn" type="button" aria-label={ui.scrollUp || "Rolar para cima"} onClick={() => scrollBy(-1)}>
                <ChevronUp size={16} />
              </button>
              <button className="scroll-btn" type="button" aria-label={ui.scrollDown || "Rolar para baixo"} onClick={() => scrollBy(1)}>
                <ChevronDown size={16} />
              </button>
            </div>
          </div>
          <article className="form-card">
            <Link to="/secao/$slug" params={{ slug: "biblioteca" }} hash="formularios" className="form-link" aria-label={ui.formLabel || copy.formTitle}>
              <div className="form-head">
                <h3>{copy.formTitle || "Escalas Assistenciais para preencher (salvar/imprimir)"}</h3>
              </div>
              <div className="form-stage">
                <img src="/brand/form-001.webp" alt={ui.formAlt || "Prévia de formulário de escala assistencial"} />
              </div>
            </Link>
            <button className="preview-btn preview-prev" type="button" aria-label={ui.previousForm || "Formulário anterior"} disabled>
              <ChevronLeft size={16} />
            </button>
            <button className="preview-btn preview-next" type="button" aria-label={ui.nextForm || "Próximo formulário"} disabled>
              <ChevronRight size={16} />
            </button>
            <span className="preview-counter">1/1</span>
          </article>
        </div>
      </section>

      <SectionBand
        kicker={copy.bands?.[0]?.kicker || "Preparatório"}
        title={copy.bands?.[0]?.title || "Simulados de Enfermagem"}
        subtitle={copy.bands?.[0]?.sub || "Bancas e Instituições"}
        icon="book"
        labelledBy="simulados"
      />
      <ul className="tile-grid">
        {simulations.map((item) => {
          const label = labelOf(item);
          return (
          <li key={item.title}>
            <TileLink item={item} section="simulados" title={label.title} text={label.text} />
          </li>
          );
        })}
      </ul>
      <p className="section-sub">
        <Link to="/estudo">Estúdio de simulados</Link>
        {" · "}
        <Link to="/viladocuidado">Vila do Cuidado</Link>
      </p>

      <SectionBand
        kicker={copy.bands?.[1]?.kicker || "Protocolos"}
        title={copy.bands?.[1]?.title || "Escalas para Avaliação"}
        subtitle={copy.bands?.[1]?.sub || "Avaliação de Pacientes"}
        icon="cross"
        labelledBy="escalas"
      />
      <ul className="tile-grid">
        {scales.map((item) => {
          const label = labelOf(item);
          return (
          <li key={item.title}>
            <TileLink item={item} section="escalas" title={label.title} text={label.text} />
          </li>
          );
        })}
      </ul>
    </>
  );
}

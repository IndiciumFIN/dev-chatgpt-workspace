import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { useRef, type ReactNode } from "react";
import { slugify } from "@/lib/slug";
import { Translated } from "@/components/site/translated";
import {
  calculators,
  resourceCards,
  scales,
  sideCards,
  simulations,
  specialties,
  type Tile,
} from "@/lib/site-data";

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

function TileLink({ item, section }: { item: Tile; section: string }) {
  return (
    <Destino
      slug={item.slug}
      section={section}
      hash={item.slug ? undefined : slugify(item.title)}
      className="calc-tile"
      ariaLabel={`Acessar ${item.title}`}
    >
      <img src={icons[item.icon]} alt="" width={56} height={56} />
      <h3>{item.title}</h3>
      <p>{item.text}</p>
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

export function HomePage() {
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
            <p className="hero-kicker">Plataforma Clínica</p>
            <h1 className="hero-title" id="home-title">
              Calculadoras de Enfermagem
            </h1>
            <p className="hero-lead">
              <Translated text="Conhecimento baseado em evidências, escalas, protocolos, calculadoras clínicas e recursos digitais para apoiar a prática de enfermagem." />
            </p>
            <div className="library-panel">
              <p className="hero-kicker">Biblioteca Digital</p>
              <div className="library-row">
                <div className="library-ico" aria-hidden="true">
                  <img src="/brand/livro.webp" alt="" width={28} height={28} />
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: 18 }}>+400 Conteúdos</p>
                  <p style={{ margin: 0, color: "#dbeafe", fontSize: 14 }}>
                    <Translated text="Protocolos, artigos, PDFs e materiais clínicos." />
                  </p>
                </div>
              </div>
              <p className="hero-kicker" style={{ marginTop: 14 }}>
                Escalas por Especialidade
              </p>
              <div className="chip-row">
                {specialties.map((name) => (
                  <Link key={name} to="/secao/$slug" params={{ slug: "escalas" }} hash={slugify(name)} className="scale-chip">
                    {name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="hero-visual">
          <img
            src="/brand/enfermeira.webp"
            alt="Enfermeira utilizando a plataforma de calculadoras clínicas"
            width={600}
            height={900}
          />
        </div>

        <div className="hero-cards">
          {sideCards.map((card) => (
            <Destino key={card.title} slug={card.slug} section={card.section} hash={card.hash} className="nav-card">
            <h3>{card.title}</h3>
            <p>{card.text}</p>
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
            <span>Escala de Braden</span>
          </a>
          <a className="ext-card" href="https://chromewebstore.google.com/detail/pchjjphfonpnkbinkllcfndnopljnlhm" rel="noreferrer">
            <img src="/brand/ext-gotejamento.webp" alt="" width={38} height={38} />
            <span>Calculadora Gotejamento e Medicamento</span>
          </a>
          <a className="ext-card" href="https://chromewebstore.google.com/detail/okhenkmaifpmecnanhbacphhfejiopfj" rel="noreferrer">
            <img src="/brand/ext-gasometria.webp" alt="" width={38} height={38} />
            <span>Calculadora de Gasometria</span>
          </a>
        </div>
      </section>

      <nav className="nav-grid" aria-label="Conteúdos e recursos">
        {resourceCards.map((card) => (
          <Link key={card.title} to="/secao/$slug" params={{ slug: card.section }} hash={card.hash} className="nav-card">
            <h3>{card.title}</h3>
            <p>{card.text}</p>
          </Link>
        ))}
      </nav>

      <section aria-labelledby="Calculadoras">
        <div className="section-head">
          <span className="deco-a" aria-hidden="true" />
          <span className="deco-b" aria-hidden="true" />
          <div className="section-head-inner">
            <div>
              <span className="eyebrow">Ferramentas de Apoio</span>
              <h2 className="section-title" id="Calculadoras">
                Calculadoras
              </h2>
              <p className="section-sub">Enfermagem Prática</p>
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
                {calculators.map((item) => (
                  <li key={item.title}>
                    <TileLink item={item} section="calculadoras" />
                  </li>
                ))}
              </ul>
            </div>
            <div className="scroll-rail">
              <button className="scroll-btn" type="button" aria-label="Rolar para cima" onClick={() => scrollBy(-1)}>
                <ChevronUp size={16} />
              </button>
              <button className="scroll-btn" type="button" aria-label="Rolar para baixo" onClick={() => scrollBy(1)}>
                <ChevronDown size={16} />
              </button>
            </div>
          </div>
          <article className="form-card">
            <Link to="/secao/$slug" params={{ slug: "biblioteca" }} hash="formularios" className="form-link" aria-label="Escalas assistenciais para preencher">
              <div className="form-head">
                <h3>Escalas Assistenciais para preencher (salvar/imprimir)</h3>
              </div>
              <div className="form-stage">
                <img src="/brand/form-001.webp" alt="Prévia de formulário de escala assistencial" />
              </div>
            </Link>
            <button className="preview-btn preview-prev" type="button" aria-label="Formulário anterior" disabled>
              <ChevronLeft size={16} />
            </button>
            <button className="preview-btn preview-next" type="button" aria-label="Próximo formulário" disabled>
              <ChevronRight size={16} />
            </button>
            <span className="preview-counter">1/1</span>
          </article>
        </div>
      </section>

      <SectionBand
        kicker="Preparatório"
        title="Simulados de Enfermagem"
        subtitle="Bancas e Instituições"
        icon="book"
        labelledBy="simulados"
      />
      <ul className="tile-grid">
        {simulations.map((item) => (
          <li key={item.title}>
            <TileLink item={item} section="simulados" />
          </li>
        ))}
      </ul>

      <SectionBand
        kicker="Protocolos"
        title="Escalas para Avaliação"
        subtitle="Avaliação de Pacientes"
        icon="cross"
        labelledBy="escalas"
      />
      <ul className="tile-grid">
        {scales.map((item) => (
          <li key={item.title}>
            <TileLink item={item} section="escalas" />
          </li>
        ))}
      </ul>
    </>
  );
}

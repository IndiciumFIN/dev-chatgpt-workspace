import type { ReactNode } from "react";

/**
 * Hero canonico do site.
 *
 * A variante com midia (`image`) e OPT-IN e so entra no DOM quando a imagem
 * e informada. Sem imagem, o markup e IDENTICO ao que sempre foi — mesmo
 * `className`, mesma ordem de filhos, sem wrapper. Isso nao e preferencia
 * estetica: e o que garante que a consistencia visual das paginas existentes
 * nao muda quando um novo consumidor (a biblioteca) passa a usar este
 * componente. O wrapper extra so existe na variante com imagem, e o CSS dele
 * vive escopado sob `.ce-lib`.
 */
export function PageHero({
  eyebrow,
  title,
  lead,
  titleId = "hero-h",
  image,
  imageAlt = "",
  badges = [],
  facts = [],
  badgesBeforeTitle = false,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  titleId?: string;
  image?: string;
  imageAlt?: string;
  badges?: string[];
  facts?: { label: string; value: string }[];
  badgesBeforeTitle?: boolean;
}) {
  const media = Boolean(image);
  return (
    <header className={media ? "inst-hero ce-hero--media" : "inst-hero"} aria-labelledby={titleId}>
      {media ? (
        <>
          <div className="ce-hero-image">
            <img src={image} alt={imageAlt} width="760" height="460" fetchPriority="high" decoding="async" />
          </div>
          <div className="ce-hero-body">
            {eyebrow ? <p className="inst-eyebrow">{eyebrow}</p> : null}
            {badgesBeforeTitle && badges.length ? (
              <div className="ce-hero-badges">{badges.map((t) => <span key={t}>{t}</span>)}</div>
            ) : null}
            <h1 id={titleId}>{title}</h1>
            {lead ? <p className="inst-lead">{lead}</p> : null}
            {!badgesBeforeTitle && badges.length ? (
              <div className="ce-hero-badges">{badges.map((t) => <span key={t}>{t}</span>)}</div>
            ) : null}
            {facts.length ? (
              <dl className="ce-hero-facts">
                {facts.map((f) => (
                  <div key={f.label}>
                    <dt>{f.label}</dt>
                    <dd>{f.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
        </>
      ) : (
        <>
          {eyebrow ? <p className="inst-eyebrow">{eyebrow}</p> : null}
          <h1 id={titleId}>{title}</h1>
          {lead ? <p className="inst-lead">{lead}</p> : null}
        </>
      )}
    </header>
  );
}

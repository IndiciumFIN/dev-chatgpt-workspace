import type { ReactNode } from "react";

export function PageHero({ eyebrow, title, lead, titleId = "hero-h" }: { eyebrow?: ReactNode; title: ReactNode; lead?: ReactNode; titleId?: string }) {
  return (
    <header className="inst-hero" aria-labelledby={titleId}>
      {eyebrow ? <p className="inst-eyebrow">{eyebrow}</p> : null}
      <h1 id={titleId}>{title}</h1>
      {lead ? <p className="inst-lead">{lead}</p> : null}
    </header>
  );
}

import type { ReactNode } from "react";
import { Breadcrumb, type Crumb } from "@/components/site/breadcrumb";
import { PageHero } from "@/components/site/page-hero";
import { PageToc } from "@/components/site/page-toc";
import { PageTools } from "@/components/site/page-tools";
import { contractOf, type TemplateKind } from "@/lib/template-contract";

export function ArticlePage({
  kind,
  crumbs,
  eyebrow,
  title,
  titleId = "hero-h",
  lead,
  pdfHref,
  extras,
  actions,
  toc,
  children,
  related,
  footer,
}: {
  kind: TemplateKind;
  crumbs: Crumb[];
  eyebrow: ReactNode;
  title: ReactNode;
  titleId?: string;
  lead: ReactNode;
  pdfHref?: string;
  extras?: { href: string; label: string }[];
  actions?: { href: string; label: string }[];
  toc?: { id: string; label: string }[];
  children: ReactNode;
  related?: ReactNode;
  footer?: ReactNode;
}) {
  const contract = contractOf(kind);
  const index = toc ?? [];
  return (
    <div className={kind === "secao" ? "artigo is-secao" : "artigo"}>
      <div className="inst-wrap is-longa">
        {contract.crumbs ? <Breadcrumb items={crumbs} /> : null}
        {contract.hero === "page" ? <PageHero eyebrow={eyebrow} title={title} lead={lead} titleId={titleId} /> : null}
        <PageTools kind={kind} pdfHref={pdfHref} extras={extras} />
        {actions?.length ? (
          <nav className="gt-actionbar no-print" aria-label="Ações rápidas">
            <ul>{actions.map((action) => <li key={action.href}><a href={action.href}>{action.label}</a></li>)}</ul>
          </nav>
        ) : null}
        <div className="gt-layout">
          <article className="inst-article" data-readable>{children}</article>
          {contract.toc === "sidebar" && index.length > 0 ? (
            <aside className="gt-sidebar no-print" aria-label="Nesta página">
              <PageToc items={index} />
            </aside>
          ) : null}
        </div>
        {contract.related ? related : null}
        {footer}
      </div>
    </div>
  );
}
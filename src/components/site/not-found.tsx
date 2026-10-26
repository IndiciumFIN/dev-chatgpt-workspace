import { Link } from "@tanstack/react-router";
import { Breadcrumb } from "@/components/site/breadcrumb";
import { PageHero } from "@/components/site/page-hero";
import { Shell } from "@/components/site/shell";

export function NotFound() {
  return (
    <Shell>
      <article className="page-narrow">
        <Breadcrumb items={[{ label: "Início", to: "/" }, { label: "Página não encontrada" }]} />
        <PageHero eyebrow="404" title="Página não encontrada" lead="Esse endereço não faz parte da etapa atual do pacote." />
        <Link to="/" className="btn-navy">
          Voltar ao início
        </Link>
      </article>
    </Shell>
  );
}
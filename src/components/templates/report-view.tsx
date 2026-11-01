import { ArticlePage } from "@/components/article/article-page";
import { ClinicalSheet } from "@/components/tools/clinical-sheet";
import { Callout } from "@/components/site/callout";
import { RelatedContent } from "@/components/site/related-content";
import { lorem } from "@/lib/lorem";
import { evaluateScale } from "@/lib/tools/engine";
import { getTool } from "@/lib/tools/catalog";

const tool = getTool("braden");

export function ReportView() {
  if (!tool) return null;
  const answers = Object.fromEntries((tool.criteria ?? []).map((item) => [item.id, 3]));
  const result = evaluateScale(tool, answers);
  return (
    <ArticlePage
      kind="editorial"
      crumbs={[{ label: "Início", to: "/" }, { label: "Templates", to: "/modelos" }, { label: "Laudo" }]}
      eyebrow="Amostra visual"
      title="Laudo"
      lead={lorem("Folha de resultado na tela. A escala publicada abre em Calculadoras e Escalas.")}
      toc={[{ id: "folha", label: "Folha" }]}
      related={
        <RelatedContent
          items={[
            { to: "/modelos/$id", params: { id: "formulario" }, title: "Formulário", text: "Checklist preenchível, separado do laudo." },
            { to: "/ferramentas/$slug", params: { slug: "braden" }, title: "Escala de Braden", text: "Abre a ferramenta que gera esta folha." },
          ]}
        />
      }
    >
      <Callout>{lorem("Nome e setor abaixo são amostra. A escala publicada não é esta página.")}</Callout>
      <section className="inst-sec specimen-sheet" id="folha" aria-labelledby="folha-h">
        <h2 id="folha-h">Folha</h2>
        <ClinicalSheet
          tool={tool}
          patient={{ nome: "Lorem ipsum", idade: "", setor: "Lorem", data: "", meta: {} }}
          raw={{}}
          answers={answers}
          notes=""
          result={result}
        />
      </section>
    </ArticlePage>
  );
}

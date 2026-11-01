import { useState, type FormEvent } from "react";
import { ArticlePage } from "@/components/article/article-page";
import { Callout } from "@/components/site/callout";
import { RelatedContent } from "@/components/site/related-content";
import { lorem } from "@/lib/lorem";

const checks = [lorem("Item um"), lorem("Item dois"), lorem("Item três"), lorem("Item quatro"), lorem("Item cinco")];

export function FormView() {
  const [sent, setSent] = useState(false);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <ArticlePage
      kind="editorial"
      crumbs={[{ label: "Início", to: "/" }, { label: "Templates", to: "/modelos" }, { label: "Formulário" }]}
      eyebrow="Amostra visual"
      title="Formulário"
      lead={lorem("Checklist preenchível. O que for digitado fica só nesta tela. O impresso da instituição fica na seção.")}
      related={
        <RelatedContent
          items={[
            { to: "/modelos/$id", params: { id: "laudo" }, title: "Laudo", text: "Folha de resultado da escala, separada do formulário." },
            { to: "/ferramentas/$slug", params: { slug: "braden" }, title: "Escala de Braden", text: "A ferramenta de verdade, com o mesmo laudo na impressão." },
          ]}
        />
      }
    >
      <Callout>
        <strong>{lorem("Amostra")}</strong> {lorem("Os campos desta tela não gravam e não substituem o impresso da seção.")}
      </Callout>
      {sent ? (
        <p>Conferência anotada só nesta tela. Nada foi enviado.</p>
      ) : (
        <form onSubmit={onSubmit}>
          <section className="inst-sec" id="identificacao" aria-labelledby="identificacao-h">
            <h2 id="identificacao-h">Identificação</h2>
            <div className="patient-grid">
              <label className="field"><span>Unidade</span><input name="unidade" required autoComplete="off" /></label>
              <label className="field"><span>Carrinho</span><input name="carrinho" required autoComplete="off" /></label>
              <label className="field"><span>Data</span><input name="data" type="date" required /></label>
              <label className="field"><span>Plantão</span><input name="plantao" required autoComplete="off" /></label>
            </div>
          </section>
          <section className="inst-sec" id="conferencia" aria-labelledby="conferencia-h">
            <h2 id="conferencia-h">Conferência</h2>
            <ul className="choice-list">
              {checks.map((item) => (
                <li key={item}>
                  <label className="choice"><input type="checkbox" name="item" value={item} /><span>{item}</span></label>
                </li>
              ))}
            </ul>
            <label className="field">
              <span>Não conformidade</span>
              <textarea name="nc" rows={3} />
            </label>
            <button className="btn-navy" type="submit">Registrar nesta tela</button>
          </section>
        </form>
      )}
    </ArticlePage>
  );
}

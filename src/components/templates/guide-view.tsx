import { ArticlePage } from "@/components/article/article-page";
import { ReferenceList } from "@/components/article/pieces";
import { Callout } from "@/components/site/callout";
import { RelatedContent } from "@/components/site/related-content";
import { lorem } from "@/lib/lorem";

export function GuideView() {
  return (
    <ArticlePage
      kind="guia"
      crumbs={[{ label: "Início", to: "/" }, { label: "Templates", to: "/modelos" }, { label: "Guia" }]}
      eyebrow="Amostra visual"
      title="Guia"
      lead={lorem("Página longa com hero, figura, cartões, fluxo e referências. O texto publicado fica na seção.")}
      toc={[{ id: "s0", label: "Abertura" }, { id: "s1", label: "1. Blocos" }, { id: "s2", label: "2. Grades" }, { id: "s3", label: "3. Fluxo" }, { id: "referencias", label: "Referências" }]}
      related={
        <RelatedContent
          items={[{ to: "/secao/$slug", params: { slug: "conteudos" }, title: "Conteúdos", text: "A seção dos guias publicados." }]}
        />
      }
    >
      <section className="inst-sec" id="s0" aria-labelledby="s0-h">
        <h2 id="s0-h">Abertura</h2>
        <p>{lorem("Parágrafo de abertura do molde de guia, com uma figura ao lado e uma lista numerada.")}</p>
        <div className="inst-split is-fig-esquerda">
          <figure className="inst-fig has-frame">
            <img src="/artigos/sepse-reconhecimento.svg" alt="" />
            <figcaption>{lorem("Legenda da figura de amostra")}</figcaption>
          </figure>
          <div className="ue-visual-panel">
            <h3>{lorem("Lista ao lado")}</h3>
            <ol className="ue-legend">
              {["Um", "Dois", "Três", "Quatro", "Cinco"].map((item, index) => (
                <li key={item}><span className="ue-num">{index + 1}</span><span>{lorem(`${item} item da legenda visual`)}</span></li>
              ))}
            </ol>
          </div>
        </div>
        <Callout>{lorem("Nota do molde, sem instrução clínica.")}</Callout>
      </section>
      <section className="inst-sec" id="s1" aria-labelledby="s1-h">
        <h2 id="s1-h"><span className="n">1.</span> Blocos</h2>
        <p>{lorem("Três cartões no mesmo grid das páginas longas.")}</p>
        <ul className="inst-cards cols-3 is-compact">
          {["Um", "Dois", "Três"].map((item) => (
            <li key={item} className="inst-card"><h3>{lorem(item)}</h3><p>{lorem("Texto curto do cartão de amostra.")}</p></li>
          ))}
        </ul>
      </section>
      <section className="inst-sec" id="s2" aria-labelledby="s2-h">
        <h2 id="s2-h"><span className="n">2.</span> Grades</h2>
        <p>{lorem("Grade de três peças e um aviso.")}</p>
        <div className="ue-scoregrid">
          {["Um", "Dois", "Três"].map((item) => (
            <article key={item} className="ue-score"><span className="ue-role">{lorem("Rótulo")}</span><h3>{lorem(item)}</h3><p>{lorem("Linha da grade de amostra.")}</p></article>
          ))}
        </div>
        <Callout tone="warn">{lorem("Aviso visual do molde.")}</Callout>
      </section>
      <section className="inst-sec" id="s3" aria-labelledby="s3-h">
        <h2 id="s3-h"><span className="n">3.</span> Fluxo</h2>
        <ol className="inst-flow">
          {["Um", "Dois", "Três", "Quatro", "Cinco"].map((item) => <li key={item}>{lorem(item)}</li>)}
        </ol>
        <div className="ue-pathways">
          <article className="ue-path is-critical"><strong>{lorem("Caminho um")}</strong><p>{lorem("Texto do primeiro caminho.")}</p></article>
          <article className="ue-path is-ok"><strong>{lorem("Caminho dois")}</strong><p>{lorem("Texto do segundo caminho.")}</p></article>
        </div>
      </section>
      <section className="inst-sec inst-refs" id="referencias" aria-labelledby="ref-h">
        <h2 id="ref-h">Referências</h2>
        <ReferenceList items={[lorem("Primeira referência de amostra"), lorem("Segunda referência de amostra")]} />
      </section>
    </ArticlePage>
  );
}

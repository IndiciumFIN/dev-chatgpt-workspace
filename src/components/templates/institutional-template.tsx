import { ArticlePage } from "@/components/article/article-page";
import { Callout } from "@/components/site/callout";
import { RelatedContent } from "@/components/site/related-content";

export function InstitutionalTemplate() {
  return (
    <ArticlePage
      kind="artigo"
      crumbs={[{ label: "Início", to: "/" }, { label: "Templates", to: "/modelos" }, { label: "Institucional" }]}
      eyebrow="Página longa"
      title="Página institucional"
      lead="Trilha, hero, ferramentas, seções e cards relacionados. É o mesmo frame do artigo e das páginas do site, não um contrato à parte."
      toc={[{ id: "reune", label: "O que reúne" }, { id: "fora", label: "O que fica de fora" }]}
      related={
        <RelatedContent
          items={[
            { to: "/secao/$slug", params: { slug: "missao-visao-valores" }, title: "Missão", text: "A página institucional publicada." },
            { to: "/modelos/$id", params: { id: "formulario" }, title: "Formulário", text: "Documento preenchível do mesmo pacote." },
            { to: "/modelos/$id", params: { id: "laudo" }, title: "Laudo", text: "Folha de resultado da escala." },
          ]}
        />
      }
    >
      <section className="inst-sec" id="reune" aria-labelledby="reune-h">
        <h2 id="reune-h">O que reúne</h2>
        <p>Cabeçalho do site, trilha, título, ferramentas de leitura, índice lateral e conteúdo relacionado no mesmo card das outras páginas.</p>
      </section>
      <section className="inst-sec" id="fora" aria-labelledby="fora-h">
        <h2 id="fora-h">O que fica de fora</h2>
        <p>Esta página não repete o menu e não lista governança no lugar do conteúdo.</p>
        <Callout>O texto de cada página publicada continua na própria seção. Este endereço só mostra o molde.</Callout>
      </section>
    </ArticlePage>
  );
}

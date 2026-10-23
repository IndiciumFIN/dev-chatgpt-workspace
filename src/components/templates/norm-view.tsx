import specimen from "@/content/norm-specimen.json";
import { ArticlePage } from "@/components/article/article-page";

export function NormView() {
  return (
    <ArticlePage
      kind="norma"
      crumbs={[{ label: "Início", to: "/" }, { label: "Templates", to: "/modelos" }, { label: "Lei 7.498/1986" }]}
      eyebrow="Biblioteca normativa"
      title={specimen.title}
      lead={specimen.lead}
      extras={[{ href: "#art_1", label: "Artigo 1º" }]}
      toc={specimen.articles.map((article) => {
        const label = article.text.match(/^Art\.\s*\d+º?/)?.[0] ?? article.text;
        return { id: article.id, label };
      })}
    >
      {specimen.articles.map((article) => {
        const heading = article.text.match(/^Art\.\s*\d+º?/)?.[0] ?? "Artigo";
        const body = article.text.replace(/^Art\.\s*\d+º?\s*/, "");
        return (
          <section key={article.id} className="inst-sec" id={article.id} aria-labelledby={`${article.id}-h`}>
            <h2 id={`${article.id}-h`}>{heading}</h2>
            <p>{body}</p>
          </section>
        );
      })}
      <p className="sheet-note">{specimen.source} Amostra dos oito primeiros artigos. A lei completa permanece no pacote normativo.</p>
    </ArticlePage>
  );
}

import { ArticlePage } from "@/components/article/article-page";
import { lorem } from "@/lib/lorem";

const articles = ["art_1", "art_2", "art_3", "art_4"];

export function NormView() {
  return (
    <ArticlePage
      kind="norma"
      crumbs={[{ label: "Início", to: "/" }, { label: "Templates", to: "/modelos" }, { label: "Norma" }]}
      eyebrow="Amostra visual"
      title="Norma"
      lead={lorem("Leitura contínua com índice. O texto da norma publicada fica na seção e no acervo.")}
      toc={articles.map((id, index) => ({ id, label: `Artigo ${index + 1}` }))}
    >
      {articles.map((id, index) => (
        <section key={id} className="inst-sec" id={id} aria-labelledby={`${id}-h`}>
          <h2 id={`${id}-h`}>Artigo {index + 1}</h2>
          <p>{lorem("Parágrafo de amostra do artigo, no mesmo ritmo da leitura contínua.")}</p>
        </section>
      ))}
    </ArticlePage>
  );
}


import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/site/shell";
import { ArticlePage } from "@/components/article/article-page";
import { curiosityCatalog, curiosityCategoryLabels } from "@/lib/content/curiosidades/catalog";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Curiosidades de Enfermagem · Prévia editorial" },
      { name: "description", content: "Catálogo de prévia dos 87 artigos de curiosidades de enfermagem." },
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const categories = Object.entries(curiosityCategoryLabels).filter(([id]) => curiosityCatalog.some((item) => item.category === id));
  const previewEnabled = import.meta.env.DEV && import.meta.env.VITE_CURIOSIDADES_MEM_PREVIEW === "true";
  const filtered = curiosityCatalog.filter((item) => {
    const matchesCategory = category === "all" || item.category === category;
    const matchesQuery = (item.title + " " + item.category).toLocaleLowerCase("pt-BR").includes(query.trim().toLocaleLowerCase("pt-BR"));
    return matchesCategory && matchesQuery;
  });
  if (!previewEnabled) {
    return (
      <Shell>
        <ArticlePage kind="secao"
          crumbs={[{ label: "Início", to: "/" }, { label: "Curiosidades" }]}
          eyebrow="Blog de Enfermagem"
          title="Curiosidades de Enfermagem"
          lead="O acervo editorial está em preparação.">
          <section className="inst-sec">
            <h2>Acervo em revisão</h2>
            <p>Os artigos estão em revisão de fontes, direitos e qualidade. Novos conteúdos aparecerão aqui após aprovação editorial.</p>
          </section>
        </ArticlePage>
      </Shell>
    );
  }
  return (
    <Shell>
      <ArticlePage
        kind="secao"
        crumbs={[{ label: "Início", to: "/" }, { label: "Curiosidades" }]}
        eyebrow="Blog · Acervo editorial"
        title="Curiosidades de Enfermagem"
        lead="Conheça histórias, profissionais, expressões, símbolos e fatos da enfermagem. Acervo em preparação e revisão editorial."
      >
        <section className="inst-sec" aria-labelledby="blog-explore">
          <h2 id="blog-explore">Explore o acervo</h2>
          <p>São {curiosityCatalog.length} artigos preparados para prévia. Todos aguardam liberação dos controles editoriais.</p>
          <div className="patient-grid">
            <label className="field">
              <span>Buscar por palavra-chave</span>
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ex.: Nightingale, símbolos, história" />
            </label>
            <label className="field">
              <span>Categoria</span>
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                <option value="all">Todas as categorias</option>
                {categories.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
              </select>
            </label>
          </div>
          <p aria-live="polite">{filtered.length} artigo(s) encontrado(s).</p>
          <ul className="related-grid">
            {filtered.map((item) => (
              <li key={item.slug}>
                <Link className="nav-card" to="/blog/$slug" params={{ slug: item.slug }}>
                  <h3>{item.title}</h3>
                  <p>{curiosityCategoryLabels[item.category] ?? item.category} · Prévia pendente de aprovação</p>
                </Link>
              </li>
            ))}
          </ul>
          {filtered.length === 0 ? <p>Nenhum artigo corresponde à busca. Experimente outro termo.</p> : null}
        </section>
      </ArticlePage>
    </Shell>
  );
}

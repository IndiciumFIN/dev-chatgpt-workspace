import { ArticlePage } from "@/components/article/article-page";
import { RelatedContent } from "@/components/site/related-content";
import { LibrarySpecimen } from "@/components/templates/library-shelves";
import { lorem } from "@/lib/lorem";

const slots = [
  { id: "grade", label: "Grade" },
  { id: "lista", label: "Lista" },
  { id: "tabela", label: "Tabela" },
  { id: "painel", label: "Painel" },
];

export function LibraryView() {
  return (
    <ArticlePage
      kind="biblioteca"
      crumbs={[{ label: "Início", to: "/" }, { label: "Templates", to: "/modelos" }, { label: "Biblioteca" }]}
      eyebrow="Amostra visual"
      title="Biblioteca"
      lead={lorem("Molde da biblioteca com módulos e prateleiras. O acervo publicado fica na seção.")}
      toc={[...slots, { id: "prancha", label: "Prancha" }, { id: "dispositivo", label: "Dispositivo" }, { id: "imagem", label: "Imagem" }, { id: "capa", label: "Capa" }, { id: "arquivo", label: "Arquivo" }, { id: "lamina", label: "Lâmina" }, { id: "sintese", label: "Painel" }]}
      related={
        <RelatedContent
          items={[
            { to: "/secao/$slug", params: { slug: "biblioteca" }, title: "Biblioteca", text: "A seção com as fichas publicadas." },
          ]}
        />
      }
    >
      {slots.map((slot) => (
        <section key={slot.id} className="inst-sec" id={slot.id}>
          <h2>{slot.label}</h2>
          <ul className="guide-cards">
            <li><b>{lorem("Título do cartão")}</b><span>{lorem("Linha de apoio do módulo")}</span></li>
            <li><b>{lorem("Segundo cartão")}</b><span>{lorem("Outra linha de apoio")}</span></li>
          </ul>
        </section>
      ))}
      <LibrarySpecimen />
    </ArticlePage>
  );
}

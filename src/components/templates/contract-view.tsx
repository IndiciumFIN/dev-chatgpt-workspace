import { ArticlePage } from "@/components/article/article-page";
import { Callout } from "@/components/site/callout";
import { contractOf } from "@/lib/template-contract";
import { lorem } from "@/lib/lorem";
import type { TemplateCatalogo } from "@/lib/template-catalog";

export function ContractView({ row }: { row: TemplateCatalogo }) {
  const contract = contractOf(row.kind);
  return (
    <ArticlePage
      kind={row.kind}
      crumbs={[{ label: "Início", to: "/" }, { label: "Templates", to: "/modelos" }, { label: row.nome }]}
      eyebrow="Contrato visual"
      title={row.nome}
      lead={lorem(`${row.nome}. ${row.materiaPrima}`)}
      toc={[{ id: "contrato", label: "Contrato" }, { id: "amostra", label: "Amostra" }]}
    >
      <section className="inst-sec" id="contrato">
        <h2>Contrato</h2>
        <ul className="guide-cards">
          <li><b>Kind</b><span>{row.kind}</span></li>
          <li><b>Frame</b><span>{row.frame}</span></li>
          <li><b>Hero</b><span>{contract.hero}</span></li>
          <li><b>Índice</b><span>{contract.toc}</span></li>
          <li><b>Nota</b><span>{row.note}</span></li>
          <li><b>Ferramentas</b><span>{contract.tools.length ? contract.tools.join(", ") : "nenhuma"}</span></li>
          <li><b>Situação</b><span>{row.situacao === "montagem" ? "Página existente" : "Molde, sem motor"}</span></li>
        </ul>
        {row.situacao !== "montagem" ? <Callout>Este backup não trouxe conteúdo governado para este repositório. A página mostra o contrato, não um cálculo nem uma lista clínica.</Callout> : null}
      </section>
      <section className="inst-sec" id="amostra">
        <h2>Amostra</h2>
        <p>{lorem("Bloco de amostra no frame deste contrato, com o mesmo hero, a mesma trilha e as mesmas ferramentas da família.")}</p>
        <p>{lorem("Segundo bloco para ver o ritmo do texto longo quando o contrato pede página de artigo ou de guia.")}</p>
      </section>
    </ArticlePage>
  );
}

import { ReferenceList } from "@/components/article/pieces";
import { hasBlock, hasLaudo } from "@/lib/component-contract";
import { formatNumber, type ToolFailure, type ToolSuccess } from "@/lib/tools/engine";
import { disclaimer, type ClinicalTool } from "@/lib/tools/types";
import { paraFicha } from "@/lib/tools/privacy";
import type { ClinicalPatient } from "@/components/tools/clinical-form";

export function ClinicalSheet({
  tool,
  patient,
  raw,
  answers,
  notes,
  result,
}: {
  tool: ClinicalTool;
  patient: ClinicalPatient;
  raw: Record<string, string>;
  answers: Record<string, number>;
  notes: string;
  result: ToolSuccess | ToolFailure | null;
}) {
  const nanda = result?.ok && result.band ? result.band.nanda : [];
  return (
    <article className="calc-sheet print-sheet">
      <p className="sheet-badge">{tool.kind === "escala" ? "ESCALA CLÍNICA" : "CALCULADORA CLÍNICA"} · {tool.category}</p>
      <header className="sheet-head">
        <div>
          <h2 className="sheet-name">{tool.title}</h2>
          <p className="sheet-sub">{tool.lead}</p>
        </div>
      </header>
      <div className="sheet-warning"><b>Uso profissional.</b> {disclaimer}</div>
      {hasBlock(tool.kind, "paciente") ? (
      <section className="sheet-section">
        <h3><span>1</span>Dados do paciente</h3>
        <p>Nome: {paraFicha("nome", patient.nome)}. Idade: {paraFicha("idade", patient.idade)}. Unidade / leito: {paraFicha("setor", patient.setor)}. Data: {paraFicha("data", patient.data)}.</p>
        {(tool.metaFields ?? []).map((field) => (
          <p key={field.id}>{field.label}: {field.options.find((option) => option.value === patient.meta[field.id])?.label ?? "Não informado"}.</p>
        ))}
      </section>
      ) : null}
      <section className="sheet-section">
        <h3><span>2</span>{tool.kind === "escala" ? "Critérios" : "Dados para cálculo"}</h3>
        <table className="calc-table">
          <thead><tr><th>Item</th><th>Registro</th></tr></thead>
          <tbody>
            {tool.kind === "escala"
              ? (tool.criteria ?? []).map((criterion) => {
                  const choice = criterion.choices.find((item) => item.value === answers[criterion.id]);
                  return <tr key={criterion.id}><td>{criterion.label}</td><td>{choice ? `${choice.value} — ${choice.label}` : "Não marcado"}</td></tr>;
                })
              : (
                <>
                  {(tool.fields ?? []).map((field) => <tr key={field.id}><td>{field.label}</td><td>{raw[field.id] || "—"} {field.unit}</td></tr>)}
                  {(tool.selects ?? []).map((field) => <tr key={field.id}><td>{field.label}</td><td>{field.options.find((option) => String(option.value) === raw[field.id])?.label ?? "—"}</td></tr>)}
                </>
              )}
          </tbody>
        </table>
      </section>
      <section className="sheet-section">
        <h3><span>3</span>Resultado e memória</h3>
        {result?.ok && result.outputs
          ? result.outputs.map((output) => <p key={output.id}><b>{output.label}:</b> {formatNumber(output.value, output.digits)} {output.unit}</p>)
          : <p><b>{result?.ok ? result.totalLabel : "Resultado"}:</b> {result?.ok ? `${result.total}${result.max !== undefined ? ` / ${result.max}` : ""}` : "Não calculado"}</p>}
        {result?.ok && result.band ? <p><b>Interpretação:</b> {result.band.label}. {result.band.note}</p> : null}
        {result?.ok ? (
          <table className="calc-table memory">
            <thead><tr><th>Item</th><th>Obtido</th><th>Máx</th></tr></thead>
            <tbody>{result.rows.map((row) => <tr key={row.label}><td>{row.label}</td><td>{row.value}</td><td>{row.max}</td></tr>)}</tbody>
          </table>
        ) : null}
        {hasBlock(tool.kind, "nanda") ? (
          <>
            <h4>NANDA</h4>
            {tool.nandaMode === "nao-fechar" ? <p>Este cálculo não fecha diagnóstico de enfermagem.</p> : nanda.length > 0 ? <ul>{nanda.map((item) => <li key={item}>{item}</li>)}</ul> : <p>Sem sugestão para esta faixa, ou ainda sem cálculo.</p>}
          </>
        ) : null}
      </section>
      {hasLaudo(tool.kind, "observacao") ? (
      <section className="sheet-section">
        <h3><span>4</span>Observações</h3>
        <p>{notes.trim() || "Sem observações nesta tela."}</p>
        {hasLaudo(tool.kind, "assinatura") ? <div className="sheet-signs"><span>Profissional</span><span>COREN</span><span>Data e hora</span></div> : null}
      </section>
      ) : null}
      <section className="sheet-section">
        <h3><span>5</span>Referências</h3>
        <ReferenceList items={tool.references} />
      </section>
      <footer className="sheet-foot">
        <span><b>Calculadoras de Enfermagem · {tool.title}</b></span>
        <span>Folha de apoio. Conferir antes de registrar.</span>
      </footer>
    </article>
  );
}

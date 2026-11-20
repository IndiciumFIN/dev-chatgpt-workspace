import { useMemo, useState } from "react";
import { ReferenceList } from "@/components/article/pieces";
import { ClinicalForm, type ClinicalPatient } from "@/components/tools/clinical-form";
import { hasBlock } from "@/lib/component-contract";
import { contractOf } from "@/lib/template-contract";
import { ClinicalSheet } from "@/components/tools/clinical-sheet";
import { ToolEcosystem, ToolFeedback, ToolMeta, ToolTutorial, ToolViewBar, useToolView } from "@/components/tools/tool-desk";
import { Breadcrumb } from "@/components/site/breadcrumb";
import { RelatedContent } from "@/components/site/related-content";
import { PageHero } from "@/components/site/page-hero";
import { PageTools } from "@/components/site/page-tools";
import { evaluateFormula, evaluateScale, formatNumber, type ToolFailure, type ToolSuccess } from "@/lib/tools/engine";
import { getTool, tools } from "@/lib/tools/catalog";
import { disclaimer, type ClinicalTool } from "@/lib/tools/types";
import { downloadDocx } from "@/lib/docx";
import { paraFicha } from "@/lib/tools/privacy";
import { useChrome } from "@/lib/chrome";

type Patient = ClinicalPatient;

function resultText(result: ToolSuccess) {
  const base = result.outputs
    ? result.outputs.map((output) => `${output.label}: ${formatNumber(output.value, output.digits)} ${output.unit}`).join(" · ")
    : `${result.totalLabel}: ${result.total}`;
  return result.band ? `${base} · ${result.band.label}` : base;
}

function today() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function emptyPatient(tool: ClinicalTool): Patient {
  const meta: Record<string, string> = {};
  for (const field of tool.metaFields ?? []) meta[field.id] = field.options[0]?.value ?? "";
  return { nome: "", idade: "", setor: "", data: today(), meta };
}

export function ClinicalToolPage({ tool, area = "public" }: { tool: ClinicalTool; area?: "public" | "assinante" }) {
  const { locale, t } = useChrome();
  const { view, change, compact } = useToolView();
  const [patient, setPatient] = useState<Patient>(() => emptyPatient(tool));
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [raw, setRaw] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const field of tool.selects ?? []) initial[field.id] = String(field.options[0]?.value ?? "");
    return initial;
  });
  const [result, setResult] = useState<ToolSuccess | ToolFailure | null>(null);
  const [notes, setNotes] = useState("");

  const filled = (tool.criteria ?? []).filter((criterion) => answers[criterion.id] !== undefined).length;
  const related = useMemo(
    () => tool.related.map((slug) => getTool(slug)).filter((item): item is ClinicalTool => Boolean(item)),
    [tool],
  );

  function calculate() {
    const next = tool.kind === "escala" ? evaluateScale(tool, answers) : evaluateFormula(tool, raw);
    setResult(next);
    if (!next.ok) {
      const missingId = next.missing?.[0];
      const fieldId = next.fieldErrors ? Object.keys(next.fieldErrors)[0] : undefined;
      const target = missingId ? `criterio-${missingId}` : fieldId ? `campo-${fieldId}` : "resultado";
      document.getElementById(target)?.focus();
    } else {
      document.getElementById("resultado")?.focus();
    }
  }

  function saveDoc() {
    downloadDocx(`${tool.slug}-laudo.docx`, [
      { text: "Calculadoras de Enfermagem", bold: true },
      { text: tool.title, bold: true },
      ...(hasBlock(tool.kind, "paciente")
        ? [
            { text: `Paciente: ${paraFicha("nome", patient.nome)}` },
            { text: `Idade: ${paraFicha("idade", patient.idade)}` },
            { text: `Unidade / leito: ${paraFicha("setor", patient.setor)}` },
            { text: `Data: ${paraFicha("data", patient.data)}` },
          ]
        : []),
      ...(tool.metaFields ?? []).map((field) => ({
        text: `${field.label}: ${field.options.find((option) => option.value === patient.meta[field.id])?.label ?? "Não informado"}`,
      })),
      { text: `Resultado: ${result?.ok ? resultText(result) : "Não calculado"}`, bold: true },
      ...(result?.ok && result.band ? [{ text: `Faixa: ${result.band.label}. ${result.band.note}` }] : []),
      ...(result?.ok && result.steps ? result.steps.map((step) => ({ text: step })) : []),
      ...(result?.ok ? result.rows.map((row) => ({ text: `${row.label}: ${row.value} (máx. ${row.max})` })) : []),
      ...(result?.ok && tool.kind === "escala" && result.band?.nanda.length ? [{ text: `NANDA, só no laudo: ${result.band.nanda.join("; ")}` }] : []),
      ...(notes.trim() ? [{ text: `Observações: ${notes.trim()}` }] : []),
      { text: disclaimer },
    ]);
  }

  function clearCalc() {
    setAnswers({});
    setRaw(() => {
      const initial: Record<string, string> = {};
      for (const field of tool.selects ?? []) initial[field.id] = String(field.options[0]?.value ?? "");
      return initial;
    });
    setResult(null);
  }

  const extras = (
    <>
      {tool.specific?.length ? (
        <section className="paper tool-block no-print">
          <h2>Desta ferramenta</h2>
          <ul className="plain-list">{tool.specific.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
      ) : null}
      {compact ? (
        <section className="paper tool-block no-print">
          <h2>Referências</h2>
          <ReferenceList items={tool.references} />
        </section>
      ) : null}
      <section className="paper tool-block no-print">
        <h2>Como usar</h2>
        <ol className="plain-list">{tool.howTo.map((step) => <li key={step}>{step}</li>)}</ol>
      </section>
      <section className="paper tool-block no-print">
        <h2>Dúvidas frequentes</h2>
        {tool.faqs.map((faq) => (
          <details key={faq.q}>
            <summary>{faq.q}</summary>
            <p>{faq.a}</p>
          </details>
        ))}
      </section>
      <RelatedContent
        items={related.map((item) => ({
          title: item.title,
          text: item.category,
          to: area === "assinante" ? "/assinante/ferramentas/$slug" as const : "/ferramentas/$slug" as const,
          params: { slug: item.slug },
        }))}
      />
      <ToolEcosystem compact={false} />
    </>
  );

  return (
    <>
      {locale !== "pt-BR" ? <p className="lang-note">{t("clinicalLock")}</p> : null}
      <article className="tool-page" lang="pt-BR">
      <Breadcrumb
        items={area === "assinante"
          ? [{ label: "Área do assinante", to: "/assinante" }, { label: tool.title }]
          : [
              { label: "Início", to: "/" },
              { label: tool.kind === "escala" ? "Escalas" : "Calculadoras", to: "/secao/$slug", params: { slug: tool.kind === "escala" ? "escalas" : "calculadoras" } },
              { label: tool.title },
            ]}
      />
      <PageHero eyebrow={tool.category} title={tool.title} lead={tool.lead} />
      <PageTools kind="ferramenta" onDocx={saveDoc} onClear={clearCalc} />

      {contractOf("ferramenta").resources.includes("formulario") ? (
      <ClinicalForm
        tool={tool}
        patient={patient}
        onPatient={setPatient}
        raw={raw}
        onRaw={setRaw}
        answers={answers}
        onAnswer={setAnswers}
        result={result}
        filled={filled}
        onCalculate={calculate}
        onClearCalc={clearCalc}
        onClearPatient={() => setPatient(emptyPatient(tool))}
        compact={compact}
      />
      ) : null}
      {contractOf("ferramenta").resources.includes("laudo") ? (
        <ClinicalSheet tool={tool} patient={patient} raw={raw} answers={answers} notes={notes} result={result} />
      ) : null}
      <ToolMeta tool={tool} />
      <ToolViewBar view={view} onChange={change} />
      <div className="tool-switch no-print">
        <ToolTutorial kind={tool.kind} />
        <ToolFeedback />
      </div>

      {compact ? (
        <details className="tool-more no-print">
          <summary>Mais</summary>
          {extras}
        </details>
      ) : extras}
      </article>
    </>
  );
}

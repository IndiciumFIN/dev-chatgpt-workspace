import { useEffect, useMemo, useState } from "react";
import { EditIcon, TrashIcon, PlusIcon, CopyIcon, CheckIcon } from "lucide-react";
import { useResearchMethods, useSources, useReferences } from "@/lib/research/store";
import { formatInText } from "@/lib/research/abnt";
import { getTool, tools as catalogToolsList } from "@/lib/tools/catalog";
import {
  ETHICS_LABELS,
  RESEARCH_TYPE_LABELS,
  generateId,
  type EthicsReviewPolicy,
  type ResearchMethod,
  type ResearchType,
} from "@/lib/research/types";

function emptyMethod(): ResearchMethod {
  return {
    id: generateId("RM"),
    version: "1.0.0",
    status: "CANDIDATE",
    updatedAt: new Date().toISOString().slice(0, 10),
    title: "",
    researcher: "",
    institution: "",
    researchType: "QUANTITATIVE",
    question: { population: "", intervention: "", comparison: "", outcome: "", timing: "", setting: "" },
    questionNarrative: "",
    studyDesign: "",
    hypothesis: "",
    ethicsReviewPolicy: "REQUIRES_HUMAN_CHECK",
    ethicsApprovalNumber: "",
    instrumentRefs: [],
    populationSampling: "",
    sampleSize: undefined,
    inclusionCriteria: "",
    exclusionCriteria: "",
    analysisPlan: "",
    sourceRefs: [],
    referenceRefs: [],
    calculationEngineRefs: [],
    notes: "",
  };
}

export function PicoPanel() {
  const { items, upsert, remove } = useResearchMethods();
  const [editing, setEditing] = useState<ResearchMethod | null>(null);
  const [viewing, setViewing] = useState<ResearchMethod | null>(null);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <h3 style={{ margin: 0, fontSize: "1.1rem" }}>
          Caderno PICO — {items.length} projeto{items.length === 1 ? "" : "s"}
        </h3>
        <button
          onClick={() => {
            setEditing(emptyMethod());
            setViewing(null);
          }}
          className="ce-btn ce-btn-primary"
          style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
        >
          <PlusIcon size={16} /> Novo projeto
        </button>
      </div>

      {editing && (
        <MethodForm
          method={editing}
          onSave={(m) => {
            upsert({ ...m, updatedAt: new Date().toISOString().slice(0, 10) });
            setEditing(null);
          }}
          onCancel={() => setEditing(null)}
        />
      )}

      {!editing && !viewing && (
        <>
          {items.length === 0 ? (
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                color: "var(--muted, #666)",
                border: "1px dashed var(--border, #ccc)",
                borderRadius: "0.4rem",
              }}
            >
              Nenhum projeto de pesquisa cadastrado. Clique em "Novo projeto" para estruturar sua pergunta PICO.
            </div>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.5rem" }}>
              {items.map((m) => (
                <li
                  key={m.id}
                  style={{
                    border: "1px solid var(--border, #e0e0e0)",
                    borderRadius: "0.4rem",
                    padding: "0.75rem 1rem",
                    background: "var(--surface, #fff)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", alignItems: "flex-start" }}>
                    <button
                      onClick={() => setViewing(m)}
                      style={{
                        textAlign: "left",
                        flex: 1,
                        minWidth: 0,
                        background: "transparent",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--muted, #666)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {RESEARCH_TYPE_LABELS[m.researchType]} · {m.studyDesign || "—"}
                      </div>
                      <div style={{ fontWeight: 600, marginTop: "0.15rem" }}>{m.title || "[Sem título]"}</div>
                      <div style={{ fontSize: "0.85rem", color: "var(--muted, #666)", marginTop: "0.15rem" }}>
                        {m.researcher}
                        {m.institution ? ` — ${m.institution}` : ""}
                      </div>
                    </button>
                    <div style={{ display: "flex", gap: "0.25rem", flexShrink: 0 }}>
                      <button onClick={() => setEditing(m)} className="ce-btn ce-btn-ghost ce-btn-icon" aria-label="Editar">
                        <EditIcon size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Excluir "${m.title}"?`)) remove(m.id);
                        }}
                        className="ce-btn ce-btn-ghost ce-btn-icon"
                        style={{ color: "var(--danger, #c0392b)" }}
                        aria-label="Excluir"
                      >
                        <TrashIcon size={16} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {viewing && !editing && <MethodViewer method={viewing} onEdit={() => setEditing(viewing)} onClose={() => setViewing(null)} />}
    </div>
  );
}

// ============================================================
// Formulário completo (Caderno de Pesquisa)
// ============================================================

function MethodForm({
  method,
  onSave,
  onCancel,
}: {
  method: ResearchMethod;
  onSave: (m: ResearchMethod) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<ResearchMethod>(method);
  const { items: sources } = useSources();
  const { items: references } = useReferences();
  const [instrumentInput, setInstrumentInput] = useState("");
  const [copied, setCopied] = useState(false);

  // Lista de escalas/ferramentas do catálogo (importadas estaticamente)
  const tools = useMemo(() => {
    return (catalogToolsList as Array<{ slug: string; title: string; kind: string }>)
      .filter((t) => t.kind === "escala" || t.kind === "calculadora")
      .map((t) => ({ slug: t.slug, title: t.title }));
  }, []);

  function patch<K extends keyof ResearchMethod>(key: K, value: ResearchMethod[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }
  function patchQuestion<K extends keyof ResearchMethod["question"]>(key: K, value: string) {
    setDraft((d) => ({ ...d, question: { ...d.question, [key]: value } }));
  }
  function toggleSourceRef(id: string) {
    setDraft((d) => ({
      ...d,
      sourceRefs: d.sourceRefs.includes(id)
        ? d.sourceRefs.filter((x) => x !== id)
        : [...d.sourceRefs, id],
    }));
  }
  function toggleReferenceRef(id: string) {
    setDraft((d) => ({
      ...d,
      referenceRefs: d.referenceRefs.includes(id)
        ? d.referenceRefs.filter((x) => x !== id)
        : [...d.referenceRefs, id],
    }));
  }
  function toggleInstrument(slug: string) {
    setDraft((d) => ({
      ...d,
      instrumentRefs: d.instrumentRefs.includes(slug)
        ? d.instrumentRefs.filter((x) => x !== slug)
        : [...d.instrumentRefs, slug],
    }));
  }

  // Gera pergunta narrativa a partir do PICO
  const pico = draft.question;
  const autoNarrative = useMemo(() => {
    return [
      "Em",
      pico.population || "[população]",
      pico.comparison ? `comparando ${pico.intervention || "[intervenção]"} com ${pico.comparison}` : `recebendo ${pico.intervention || "[intervenção]"}`,
      `${pico.outcome ? `para avaliar ${pico.outcome}` : ""}`,
      pico.timing ? `em ${pico.timing}` : "",
      pico.setting ? `no contexto ${pico.setting}` : "",
    ]
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim() + "?";
  }, [pico]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(draft);
      }}
      style={{
        border: "1px solid var(--border, #ccc)",
        borderRadius: "0.4rem",
        padding: "1.25rem",
        background: "var(--surface, #fafafa)",
        marginBottom: "1rem",
      }}
    >
      <h4 style={{ marginTop: 0, marginBottom: "1rem" }}>
        {method.title ? "Editar projeto" : "Novo projeto de pesquisa"}
      </h4>

      <div style={{ display: "grid", gap: "1rem" }}>
        <fieldset style={fieldsetStyle}>
          <legend style={legendStyle}>Identificação</legend>
          <Field label="Título do projeto" required>
            <input
              type="text"
              value={draft.title}
              onChange={(e) => patch("title", e.target.value)}
              style={inputStyle}
              placeholder="Ex.: Avaliação da escala de Braden em UTI oncológica"
              required
            />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <Field label="Pesquisador responsável" required>
              <input
                type="text"
                value={draft.researcher}
                onChange={(e) => patch("researcher", e.target.value)}
                style={inputStyle}
                placeholder="Nome completo"
                required
              />
            </Field>
            <Field label="Instituição">
              <input
                type="text"
                value={draft.institution || ""}
                onChange={(e) => patch("institution", e.target.value)}
                style={inputStyle}
                placeholder="Universidade / Hospital"
              />
            </Field>
          </div>
        </fieldset>

        <fieldset style={fieldsetStyle}>
          <legend style={legendStyle}>Pergunta PICO</legend>
          <Field label="P — População/Paciente" required>
            <input
              type="text"
              value={pico.population}
              onChange={(e) => patchQuestion("population", e.target.value)}
              style={inputStyle}
              placeholder="Ex.: Pacientes adultos internados em UTI oncológica"
              required
            />
          </Field>
          <Field label="I — Intervenção/Indicador" required>
            <input
              type="text"
              value={pico.intervention}
              onChange={(e) => patchQuestion("intervention", e.target.value)}
              style={inputStyle}
              placeholder="Ex.: Aplicação diária da escala de Braden"
              required
            />
          </Field>
          <Field label="C — Comparação/Controle">
            <input
              type="text"
              value={pico.comparison}
              onChange={(e) => patchQuestion("comparison", e.target.value)}
              style={inputStyle}
              placeholder="Ex.: Avaliação clínica de enfermeira sem escala"
            />
          </Field>
          <Field label="O — Outcome/Desfecho" required>
            <input
              type="text"
              value={pico.outcome}
              onChange={(e) => patchQuestion("outcome", e.target.value)}
              style={inputStyle}
              placeholder="Ex.: Incidência de lesão por pressão"
              required
            />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <Field label="T — Timing (opcional)">
              <input
                type="text"
                value={pico.timing || ""}
                onChange={(e) => patchQuestion("timing", e.target.value)}
                style={inputStyle}
                placeholder="Ex.: Em 30 dias de internação"
              />
            </Field>
            <Field label="S — Setting/Contexto (opcional)">
              <input
                type="text"
                value={pico.setting || ""}
                onChange={(e) => patchQuestion("setting", e.target.value)}
                style={inputStyle}
                placeholder="Ex.: Hospital público terciário"
              />
            </Field>
          </div>
          <div
            style={{
              background: "var(--accent-soft, #f5f8fc)",
              border: "1px solid var(--border, #e0e0e0)",
              padding: "0.6rem 0.75rem",
              borderRadius: "0.3rem",
              marginTop: "0.5rem",
              fontSize: "0.9rem",
            }}
          >
            <strong>Pergunta narrativa (auto-gerada):</strong> {autoNarrative}
            <button
              type="button"
              onClick={() => patch("questionNarrative", autoNarrative)}
              className="ce-btn ce-btn-ghost"
              style={{ marginLeft: "0.5rem", padding: "0.1rem 0.4rem", fontSize: "0.75rem" }}
            >
              Usar
            </button>
            {copied && <CheckIcon size={12} style={{ marginLeft: "0.4rem", color: "green" }} />}
          </div>
          <Field label="Pergunta narrativa editável" required>
            <textarea
              value={draft.questionNarrative}
              onChange={(e) => patch("questionNarrative", e.target.value)}
              style={{ ...inputStyle, minHeight: "3rem", resize: "vertical" }}
              required
            />
          </Field>
        </fieldset>

        <fieldset style={fieldsetStyle}>
          <legend style={legendStyle}>Delineamento</legend>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <Field label="Tipo de pesquisa" required>
              <select
                value={draft.researchType}
                onChange={(e) => patch("researchType", e.target.value as ResearchType)}
                style={inputStyle}
              >
                {Object.entries(RESEARCH_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Delineamento" required>
              <select
                value={draft.studyDesign}
                onChange={(e) => patch("studyDesign", e.target.value)}
                style={inputStyle}
                required
              >
                <option value="">Selecione...</option>
                <option value="RCT">Ensaio clínico randomizado (RCT)</option>
                <option value="coorte-prosp">Coorte prospectivo</option>
                <option value="coorte-retro">Coorte retrospectivo</option>
                <option value="caso-controle">Caso-controle</option>
                <option value="transversal">Transversal</option>
                <option value="serie-casos">Série de casos</option>
                <option value="qualitativo-fenomenologico">Fenomenológico</option>
                <option value="qualitativo-etnografico">Etnográfico</option>
                <option value="qualitativo-teorico">Teoria fundamentada</option>
                <option value="revisao-sistematica">Revisão sistemática</option>
                <option value="metanalise">Metanálise</option>
                <option value="scoping">Scoping review</option>
                <option value="outro">Outro</option>
              </select>
            </Field>
          </div>
          <Field label="Hipótese principal (se aplicável)">
            <input
              type="text"
              value={draft.hypothesis || ""}
              onChange={(e) => patch("hypothesis", e.target.value)}
              style={inputStyle}
              placeholder="Ex.: A escala de Braden tem sensibilidade > 70% para LPP em UTI oncológica"
            />
          </Field>
        </fieldset>

        <fieldset style={fieldsetStyle}>
          <legend style={legendStyle}>Ética (CEP/CONEP)</legend>
          <Field label="Política de ética" required>
            <select
              value={draft.ethicsReviewPolicy}
              onChange={(e) => patch("ethicsReviewPolicy", e.target.value as EthicsReviewPolicy)}
              style={inputStyle}
            >
              {Object.entries(ETHICS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </Field>
          {draft.ethicsReviewPolicy === "APPROVED" && (
            <Field label="Número do Parecer CEP/CONEP">
              <input
                type="text"
                value={draft.ethicsApprovalNumber || ""}
                onChange={(e) => patch("ethicsApprovalNumber", e.target.value)}
                style={inputStyle}
                placeholder="Ex.: CAAE 12345678.0.0000.0000 / Parecer 5.432.100"
              />
            </Field>
          )}
        </fieldset>

        <fieldset style={fieldsetStyle}>
          <legend style={legendStyle}>População e amostra</legend>
          <Field label="Descrição da população e amostragem" required>
            <textarea
              value={draft.populationSampling}
              onChange={(e) => patch("populationSampling", e.target.value)}
              style={{ ...inputStyle, minHeight: "3rem", resize: "vertical" }}
              placeholder="Ex.: Amostra de conveniência de 200 pacientes adultos internados em UTI oncológica por >48h"
              required
            />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
            <Field label="Tamanho amostral (n)">
              <input
                type="number"
                min={0}
                value={draft.sampleSize || ""}
                onChange={(e) => patch("sampleSize", e.target.value ? Number(e.target.value) : undefined)}
                style={inputStyle}
                placeholder="Ex.: 200"
              />
            </Field>
            <Field label="Critérios de inclusão">
              <input
                type="text"
                value={draft.inclusionCriteria || ""}
                onChange={(e) => patch("inclusionCriteria", e.target.value)}
                style={inputStyle}
                placeholder="Ex.: >18 anos, internação >48h"
              />
            </Field>
            <Field label="Critérios de exclusão">
              <input
                type="text"
                value={draft.exclusionCriteria || ""}
                onChange={(e) => patch("exclusionCriteria", e.target.value)}
                style={inputStyle}
                placeholder="Ex.: Lesão prévia à admissão"
              />
            </Field>
          </div>
        </fieldset>

        <fieldset style={fieldsetStyle}>
          <legend style={legendStyle}>Instrumentos (escalas/ferramentas)</legend>
          <small style={{ color: "var(--muted, #666)" }}>
            Vincule escalas do site (Braden, Glasgow, etc.) usadas como instrumentos de coleta.
          </small>
          <div style={{ marginTop: "0.5rem" }}>
            <input
              type="text"
              value={instrumentInput}
              onChange={(e) => setInstrumentInput(e.target.value)}
              placeholder="Filtrar..."
              style={inputStyle}
            />
            <div
              style={{
                maxHeight: "10rem",
                overflowY: "auto",
                border: "1px solid var(--border, #ccc)",
                borderRadius: "0.3rem",
                marginTop: "0.25rem",
              }}
            >
              {tools
                .filter((t) =>
                  instrumentInput
                    ? t.title.toLowerCase().includes(instrumentInput.toLowerCase()) ||
                      t.slug.includes(instrumentInput.toLowerCase())
                    : true,
                )
                .slice(0, 50)
                .map((t) => (
                  <label
                    key={t.slug}
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      padding: "0.3rem 0.5rem",
                      borderBottom: "1px solid var(--border, #f0f0f0)",
                      cursor: "pointer",
                      background: draft.instrumentRefs.includes(t.slug) ? "var(--accent-soft, #e8f0fe)" : "transparent",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={draft.instrumentRefs.includes(t.slug)}
                      onChange={() => toggleInstrument(t.slug)}
                    />
                    <span style={{ fontSize: "0.85rem" }}>{t.title}</span>
                  </label>
                ))}
            </div>
          </div>
          {draft.instrumentRefs.length > 0 && (
            <div style={{ marginTop: "0.5rem", fontSize: "0.85rem" }}>
              <strong>{draft.instrumentRefs.length} instrumento(s) vinculado(s):</strong>{" "}
              {draft.instrumentRefs.map((slug) => {
                const t = tools.find((x) => x.slug === slug);
                return t?.title || slug;
              }).join(", ")}
            </div>
          )}
        </fieldset>

        <fieldset style={fieldsetStyle}>
          <legend style={legendStyle}>Plano de análise</legend>
          <Field label="Plano analítico pré-especificado" required>
            <textarea
              value={draft.analysisPlan}
              onChange={(e) => patch("analysisPlan", e.target.value)}
              style={{ ...inputStyle, minHeight: "4rem", resize: "vertical" }}
              placeholder="Ex.: Estatística descritiva (média/DP). Teste qui-quadrado para associação. Sensibilidade, especificidade e IC95% calculados viaWilson. Software R 4.3."
              required
            />
          </Field>
        </fieldset>

        {sources.length > 0 && (
          <fieldset style={fieldsetStyle}>
            <legend style={legendStyle}>Fontes vinculadas ({draft.sourceRefs.length} de {sources.length})</legend>
            <details>
              <summary style={{ cursor: "pointer", fontSize: "0.85rem" }}>
                Marcar fontes da biblioteca
              </summary>
              <div style={{ marginTop: "0.5rem" }}>
                {sources.map((s) => (
                  <label
                    key={s.id}
                    style={{ display: "flex", gap: "0.5rem", padding: "0.2rem 0", cursor: "pointer" }}
                  >
                    <input
                      type="checkbox"
                      checked={draft.sourceRefs.includes(s.id)}
                      onChange={() => toggleSourceRef(s.id)}
                    />
                    <span style={{ fontSize: "0.85rem" }}>
                      {s.title.slice(0, 80)}{s.title.length > 80 ? "..." : ""} ({s.year})
                    </span>
                  </label>
                ))}
              </div>
            </details>
          </fieldset>
        )}

        <fieldset style={fieldsetStyle}>
          <legend style={legendStyle}>Notas gerais</legend>
          <textarea
            value={draft.notes || ""}
            onChange={(e) => patch("notes", e.target.value)}
            style={{ ...inputStyle, minHeight: "3rem", resize: "vertical" }}
            placeholder="Anotações gerais sobre o projeto, cronograma, etc."
          />
        </fieldset>

        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
          <button type="button" onClick={onCancel} className="ce-btn ce-btn-ghost">
            Cancelar
          </button>
          <button type="submit" className="ce-btn ce-btn-primary">
            Salvar projeto
          </button>
        </div>
      </div>
    </form>
  );
}

// ============================================================
// Visualizador (resumo do projeto)
// ============================================================

function MethodViewer({
  method,
  onEdit,
  onClose,
}: {
  method: ResearchMethod;
  onEdit: () => void;
  onClose: () => void;
}) {
  const { items: sources } = useSources();
  const { items: references } = useReferences();
  const [copied, setCopied] = useState(false);

  const instrumentTools = method.instrumentRefs
    .map((slug) => getTool(slug))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  // Resumo formatado (exportável como texto)
  const summary = useMemo(() => {
    const lines: string[] = [];
    lines.push(`# ${method.title}`);
    lines.push("");
    lines.push(`**Pesquisador:** ${method.researcher}`);
    if (method.institution) lines.push(`**Instituição:** ${method.institution}`);
    lines.push(`**Tipo:** ${RESEARCH_TYPE_LABELS[method.researchType]}`);
    lines.push(`**Delineamento:** ${method.studyDesign}`);
    lines.push("");
    lines.push("## Pergunta PICO");
    lines.push(`- **P:** ${method.question.population}`);
    lines.push(`- **I:** ${method.question.intervention}`);
    if (method.question.comparison) lines.push(`- **C:** ${method.question.comparison}`);
    lines.push(`- **O:** ${method.question.outcome}`);
    if (method.question.timing) lines.push(`- **T:** ${method.question.timing}`);
    if (method.question.setting) lines.push(`- **S:** ${method.question.setting}`);
    lines.push("");
    lines.push(`**Pergunta narrativa:** ${method.questionNarrative}`);
    if (method.hypothesis) {
      lines.push("");
      lines.push(`**Hipótese:** ${method.hypothesis}`);
    }
    lines.push("");
    lines.push("## Ética");
    lines.push(`- **Política:** ${ETHICS_LABELS[method.ethicsReviewPolicy]}`);
    if (method.ethicsApprovalNumber) lines.push(`- **Parecer CEP/CONEP:** ${method.ethicsApprovalNumber}`);
    lines.push("");
    lines.push("## Amostra");
    lines.push(`- **População:** ${method.populationSampling}`);
    if (method.sampleSize) lines.push(`- **n calculado:** ${method.sampleSize}`);
    if (method.inclusionCriteria) lines.push(`- **Inclusão:** ${method.inclusionCriteria}`);
    if (method.exclusionCriteria) lines.push(`- **Exclusão:** ${method.exclusionCriteria}`);
    lines.push("");
    lines.push("## Instrumentos");
    if (instrumentTools.length === 0) {
      lines.push("- Nenhum instrumento vinculado.");
    } else {
      instrumentTools.forEach((t) => {
        lines.push(`- ${t.title} (\`/ferramentas/${t.slug}\`)`);
      });
    }
    lines.push("");
    lines.push("## Plano de análise");
    lines.push(method.analysisPlan);
    lines.push("");
    if (method.notes) {
      lines.push("## Notas");
      lines.push(method.notes);
    }
    return lines.join("\n");
  }, [method, instrumentTools]);

  function copySummary() {
    navigator.clipboard.writeText(summary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div
      style={{
        border: "1px solid var(--border, #ccc)",
        borderRadius: "0.4rem",
        padding: "1.25rem",
        background: "var(--surface, #fff)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "1rem" }}>
        <div>
          <div style={{ fontSize: "0.75rem", color: "var(--muted, #666)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {RESEARCH_TYPE_LABELS[method.researchType]} · {method.studyDesign}
          </div>
          <h3 style={{ margin: "0.2rem 0 0 0" }}>{method.title}</h3>
          <div style={{ fontSize: "0.85rem", color: "var(--muted, #666)" }}>
            {method.researcher}
            {method.institution ? ` — ${method.institution}` : ""}
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
          <button onClick={copySummary} className="ce-btn ce-btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
            {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
            {copied ? "Copiado!" : "Copiar resumo"}
          </button>
          <button onClick={onEdit} className="ce-btn ce-btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
            <EditIcon size={14} /> Editar
          </button>
          <button onClick={onClose} className="ce-btn ce-btn-ghost">
            Fechar
          </button>
        </div>
      </div>

      <section style={{ marginBottom: "1rem" }}>
        <h4 style={subTitle}>Pergunta PICO</h4>
        <table style={tableStyle}>
          <tbody>
            <PicoRow label="P — População" value={method.question.population} />
            <PicoRow label="I — Intervenção" value={method.question.intervention} />
            {method.question.comparison && (
              <PicoRow label="C — Comparação" value={method.question.comparison} />
            )}
            <PicoRow label="O — Outcome" value={method.question.outcome} />
            {method.question.timing && <PicoRow label="T — Timing" value={method.question.timing} />}
            {method.question.setting && <PicoRow label="S — Setting" value={method.question.setting} />}
          </tbody>
        </table>
        <p style={{ marginTop: "0.5rem", fontStyle: "italic", color: "var(--muted, #555)" }}>
          {method.questionNarrative}
        </p>
        {method.hypothesis && (
          <p>
            <strong>Hipótese:</strong> {method.hypothesis}
          </p>
        )}
      </section>

      <section style={{ marginBottom: "1rem" }}>
        <h4 style={subTitle}>Ética</h4>
        <p>
          <strong>Política:</strong> {ETHICS_LABELS[method.ethicsReviewPolicy]}
          {method.ethicsApprovalNumber && (
            <>
              {" — "}
              <strong>Parecer:</strong> {method.ethicsApprovalNumber}
            </>
          )}
        </p>
      </section>

      <section style={{ marginBottom: "1rem" }}>
        <h4 style={subTitle}>Amostra</h4>
        <p>{method.populationSampling}</p>
        <ul style={{ fontSize: "0.9rem", marginTop: "0.25rem" }}>
          {method.sampleSize !== undefined && <li>Tamanho amostral (n): {method.sampleSize}</li>}
          {method.inclusionCriteria && <li>Inclusão: {method.inclusionCriteria}</li>}
          {method.exclusionCriteria && <li>Exclusão: {method.exclusionCriteria}</li>}
        </ul>
      </section>

      <section style={{ marginBottom: "1rem" }}>
        <h4 style={subTitle}>Instrumentos</h4>
        {instrumentTools.length === 0 ? (
          <p style={{ color: "var(--muted, #666)" }}>Nenhum instrumento vinculado.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.25rem" }}>
            {instrumentTools.map((t) => (
              <li key={t.slug}>
                <a href={`/ferramentas/${t.slug}`} style={{ color: "var(--accent, #0a66c2)" }}>
                  {t.title}
                </a>
                <span style={{ color: "var(--muted, #888)", fontSize: "0.85rem" }}> · /ferramentas/{t.slug}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginBottom: "1rem" }}>
        <h4 style={subTitle}>Plano de análise</h4>
        <p>{method.analysisPlan}</p>
      </section>

      {method.sourceRefs.length > 0 && (
        <section style={{ marginBottom: "1rem" }}>
          <h4 style={subTitle}>Fontes vinculadas ({method.sourceRefs.length})</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {method.sourceRefs.map((id) => {
              const s = sources.find((x) => x.id === id);
              return s ? (
                <li key={id} style={{ fontSize: "0.85rem", padding: "0.2rem 0" }}>
                  {s.title} ({s.year})
                </li>
              ) : null;
            })}
          </ul>
        </section>
      )}

      {method.notes && (
        <section style={{ marginBottom: "1rem" }}>
          <h4 style={subTitle}>Notas</h4>
          <p>{method.notes}</p>
        </section>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.5rem 0.6rem",
  border: "1px solid var(--border, #ccc)",
  borderRadius: "0.3rem",
  fontSize: "0.95rem",
  background: "var(--surface, #fff)",
};

const fieldsetStyle: React.CSSProperties = {
  border: "1px solid var(--border, #ddd)",
  borderRadius: "0.4rem",
  padding: "0.75rem 1rem 1rem",
  margin: 0,
};

const legendStyle: React.CSSProperties = {
  fontWeight: 600,
  padding: "0 0.4rem",
  fontSize: "0.9rem",
};

const subTitle: React.CSSProperties = {
  fontSize: "1rem",
  marginTop: 0,
  marginBottom: "0.5rem",
  paddingBottom: "0.25rem",
  borderBottom: "1px solid var(--border, #eee)",
};

const tableStyle: React.CSSProperties = {
  borderCollapse: "collapse",
  width: "100%",
};

function PicoRow({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td style={{ padding: "0.25rem 0.5rem 0.25rem 0", fontWeight: 600, fontSize: "0.85rem", width: "12rem", verticalAlign: "top" }}>
        {label}
      </td>
      <td style={{ padding: "0.25rem 0", fontSize: "0.95rem" }}>{value}</td>
    </tr>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.25rem" }}>
        {label}
        {required && <span style={{ color: "var(--danger, #c0392b)" }}> *</span>}
      </label>
      {children}
    </div>
  );
}

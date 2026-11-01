import { useState } from "react";
import { EditIcon, TrashIcon, PlusIcon, PlayIcon, FileTextIcon } from "lucide-react";
import { useAssessmentItems, useSimulados } from "@/lib/education/store";
import {
  ANSWER_EXPOSURE_LABELS,
  createEmptyQuizDeck,
  type AssessmentItem,
  type Simulado,
  type AnswerExposurePolicy,
} from "@/lib/education/types";
import { QuizRunner } from "./quiz-runner";

/** Converte um QuizDeck vazio em Simulado vazio. */
function createEmptySimulado(): Simulado {
  return {
    ...createEmptyQuizDeck(),
    canonical_id: `SIM-${Date.now().toString(36).toUpperCase()}`,
    time_limit_seconds: 60 * 60, // 1h padrão para simulado
    passing_score: 60,
    default_answer_exposure: "ON_SUBMIT",
    shuffle_items: true,
    shuffle_options: true,
  };
}

export function SimuladosPanel() {
  const { items: assessmentItems } = useAssessmentItems();
  const { items: simulados, upsert, remove } = useSimulados();
  const [editing, setEditing] = useState<Simulado | null>(null);
  const [running, setRunning] = useState<Simulado | null>(null);

  if (running) {
    const items = assessmentItems.filter((i) => running.item_refs.includes(i.canonical_id));
    return <QuizRunner deck={running} items={items} onClose={() => setRunning(null)} />;
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", gap: "0.5rem", flexWrap: "wrap" }}>
        <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Simulados — {simulados.length}</h3>
        <button onClick={() => setEditing(createEmptySimulado())} className="ce-btn ce-btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
          <PlusIcon size={14} /> Novo simulado
        </button>
      </div>

      {editing && (
        <SimuladoForm
          simulado={editing}
          items={assessmentItems}
          onSave={(s) => { upsert(s); setEditing(null); }}
          onCancel={() => setEditing(null)}
        />
      )}

      {!editing && simulados.length === 0 && (
        <div style={{ padding: "2rem", textAlign: "center", color: "var(--muted, #666)", border: "1px dashed var(--border, #ccc)", borderRadius: "0.4rem" }}>
          Nenhum simulado cadastrado. Simulados são provas completas com banca, cargo, número de vagas e tempo limite cronometrado.
        </div>
      )}

      {!editing && simulados.length > 0 && (
        <ul style={listStyle}>
          {simulados.map((s) => (
            <li key={s.canonical_id} style={listItemStyle}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{s.title || "[Sem título]"}</div>
                <div style={{ fontSize: "0.85rem", color: "var(--muted, #666)" }}>
                  {s.banca ? `${s.banca} · ` : ""}{s.cargo || "Sem cargo"}{s.ano_edital ? ` · ${s.ano_edital}` : ""}{s.vagas ? ` · ${s.vagas} vaga(s)` : ""}
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--muted, #888)" }}>
                  {s.item_refs.length} questão(ões) · {s.time_limit_seconds ? `${Math.floor(s.time_limit_seconds / 60)}min` : "sem tempo"} · corte {s.passing_score || 60}%
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.25rem" }}>
                <button onClick={() => setRunning(s)} className="ce-btn ce-btn-ghost ce-btn-icon" disabled={s.item_refs.length === 0} title="Iniciar simulado"><PlayIcon size={14} /></button>
                <button onClick={() => setEditing(s)} className="ce-btn ce-btn-ghost ce-btn-icon" title="Editar"><EditIcon size={14} /></button>
                <button onClick={() => { if (confirm(`Excluir simulado "${s.title}"?`)) remove(s.canonical_id); }} className="ce-btn ce-btn-ghost ce-btn-icon" style={{ color: "var(--danger, #c0392b)" }} title="Excluir"><TrashIcon size={14} /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SimuladoForm({ simulado, items, onSave, onCancel }: {
  simulado: Simulado;
  items: AssessmentItem[];
  onSave: (s: Simulado) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<Simulado>(simulado);
  const [query, setQuery] = useState("");

  function patch<K extends keyof Simulado>(k: K, v: Simulado[K]) {
    setDraft((d) => ({ ...d, [k]: v }));
  }
  function toggleItem(id: string) {
    const next = draft.item_refs.includes(id) ? draft.item_refs.filter((x) => x !== id) : [...draft.item_refs, id];
    setDraft((d) => ({ ...d, item_refs: next }));
  }

  const filtered = items.filter((i) => !query || i.prompt_key.toLowerCase().includes(query.toLowerCase()) || i.topic?.toLowerCase().includes(query.toLowerCase()) || i.subject?.toLowerCase().includes(query.toLowerCase()));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({ ...draft, updated_at: new Date().toISOString().slice(0, 10) }); }} style={formStyle}>
      <h5 style={{ marginTop: 0 }}>{simulado.title ? "Editar simulado" : "Novo simulado"}</h5>
      <div style={{ display: "grid", gap: "0.75rem" }}>
        <Field label="Título do simulado" required>
          <input type="text" value={draft.title} onChange={(e) => patch("title", e.target.value)} style={inputStyle} placeholder="Ex.: Simulado COREN-SP Enfermeiro 2024" required />
        </Field>
        <Field label="Descrição">
          <textarea value={draft.description || ""} onChange={(e) => patch("description", e.target.value)} style={{ ...inputStyle, minHeight: "2.5rem", resize: "vertical" }} placeholder="Ex.: Simulado com 50 questões baseadas no edital COREN-SP 2024." />
        </Field>

        {/* Campos específicos de simulado */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0.5rem" }}>
          <Field label="Banca">
            <input type="text" value={draft.banca || ""} onChange={(e) => patch("banca", e.target.value)} style={inputStyle} placeholder="Ex.: VUNESP, FGV, CESPE" />
          </Field>
          <Field label="Cargo">
            <input type="text" value={draft.cargo || ""} onChange={(e) => patch("cargo", e.target.value)} style={inputStyle} placeholder="Ex.: Enfermeiro" />
          </Field>
          <Field label="Ano do edital">
            <input type="number" min={2000} max={2100} value={draft.ano_edital || ""} onChange={(e) => patch("ano_edital", e.target.value ? Number(e.target.value) : undefined)} style={inputStyle} placeholder="Ex.: 2024" />
          </Field>
          <Field label="Nº de vagas">
            <input type="number" min={0} value={draft.vagas || ""} onChange={(e) => patch("vagas", e.target.value ? Number(e.target.value) : undefined)} style={inputStyle} placeholder="Ex.: 50" />
          </Field>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
          <Field label="Tempo limite (min)">
            <input type="number" min={0} value={draft.time_limit_seconds ? Math.floor(draft.time_limit_seconds / 60) : ""} onChange={(e) => patch("time_limit_seconds", e.target.value ? Number(e.target.value) * 60 : undefined)} style={inputStyle} placeholder="Ex.: 60" />
          </Field>
          <Field label="Nota de aprovação (%)">
            <input type="number" min={0} max={100} value={draft.passing_score ?? 60} onChange={(e) => patch("passing_score", e.target.value ? Number(e.target.value) : undefined)} style={inputStyle} />
          </Field>
          <Field label="Exposição de respostas">
            <select value={draft.default_answer_exposure} onChange={(e) => patch("default_answer_exposure", e.target.value as AnswerExposurePolicy)} style={inputStyle}>
              {Object.entries(ANSWER_EXPOSURE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </Field>
        </div>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.9rem" }}>
            <input type="checkbox" checked={draft.shuffle_items} onChange={(e) => patch("shuffle_items", e.target.checked)} /> Embaralhar questões
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.9rem" }}>
            <input type="checkbox" checked={draft.shuffle_options} onChange={(e) => patch("shuffle_options", e.target.checked)} /> Embaralhar alternativas
          </label>
        </div>

        {/* Seleção de questões */}
        <div>
          <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>Questões selecionadas: {draft.item_refs.length}</label>
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} style={{ ...inputStyle, marginTop: "0.25rem" }} placeholder="Filtrar por enunciado, tópico ou disciplina..." />
          <div style={{ marginTop: "0.5rem", maxHeight: "15rem", overflowY: "auto", border: "1px solid var(--border, #ccc)", borderRadius: "0.3rem" }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "1rem", textAlign: "center", color: "var(--muted, #666)", fontSize: "0.85rem" }}>
                Nenhuma questão cadastrada. Cadastre questões na aba Quizzes primeiro.
              </div>
            ) : (
              filtered.map((item) => (
                <label key={item.canonical_id} style={{ display: "flex", gap: "0.5rem", padding: "0.3rem 0.5rem", borderBottom: "1px solid var(--border, #f0f0f0)", cursor: "pointer", background: draft.item_refs.includes(item.canonical_id) ? "var(--accent-soft, #e8f0fe)" : "transparent" }}>
                  <input type="checkbox" checked={draft.item_refs.includes(item.canonical_id)} onChange={() => toggleItem(item.canonical_id)} />
                  <span style={{ fontSize: "0.85rem", flex: 1 }}>
                    {item.prompt_key.slice(0, 100)}{item.prompt_key.length > 100 ? "..." : ""}
                    {item.topic && <span style={{ color: "var(--muted, #888)" }}> · {item.topic}</span>}
                  </span>
                </label>
              ))
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
          <button type="button" onClick={onCancel} className="ce-btn ce-btn-ghost">Cancelar</button>
          <button type="submit" className="ce-btn ce-btn-primary" disabled={draft.item_refs.length === 0}>Salvar simulado</button>
        </div>
      </div>
    </form>
  );
}

const listStyle: React.CSSProperties = { listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.4rem" };
const listItemStyle: React.CSSProperties = { border: "1px solid var(--border, #e0e0e0)", borderRadius: "0.4rem", padding: "0.6rem 0.75rem", background: "var(--surface, #fff)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" };
const inputStyle: React.CSSProperties = { width: "100%", padding: "0.5rem 0.6rem", border: "1px solid var(--border, #ccc)", borderRadius: "0.3rem", fontSize: "0.95rem", background: "var(--surface, #fff)" };
const formStyle: React.CSSProperties = { border: "1px solid var(--border, #ccc)", borderRadius: "0.4rem", padding: "1rem", marginBottom: "0.75rem", background: "var(--surface, #fafafa)" };

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.25rem" }}>
        {label}{required && <span style={{ color: "var(--danger, #c0392b)" }}> *</span>}
      </label>
      {children}
    </div>
  );
}

import { useState } from "react";
import { EditIcon, TrashIcon, PlusIcon, BookOpenIcon, PlayIcon } from "lucide-react";
import { useAssessmentItems, useQuizDecks } from "@/lib/education/store";
import {
  ITEM_TYPE_LABELS,
  ANSWER_EXPOSURE_LABELS,
  SHUFFLE_POLICY_LABELS,
  createEmptyAssessmentItem,
  createEmptyQuizDeck,
  type AssessmentItem,
  type ItemType,
  type QuizDeck,
  type ShufflePolicy,
  type AnswerExposurePolicy,
} from "@/lib/education/types";
import { QuizRunner } from "./quiz-runner";

export function QuizzesPanel() {
  const { items: assessmentItems, upsert: upsertItem, remove: removeItem } = useAssessmentItems();
  const { items: decks, upsert: upsertDeck, remove: removeDeck } = useQuizDecks();
  const [editingItem, setEditingItem] = useState<AssessmentItem | null>(null);
  const [editingDeck, setEditingDeck] = useState<QuizDeck | null>(null);
  const [runningDeck, setRunningDeck] = useState<QuizDeck | null>(null);
  const [filterTag, setFilterTag] = useState<string>("ALL");

  const allTags = Array.from(new Set(assessmentItems.flatMap((i) => i.tags || []))).sort();

  const filteredItems = filterTag === "ALL"
    ? assessmentItems
    : assessmentItems.filter((i) => i.tags?.includes(filterTag));

  if (runningDeck) {
    return <QuizRunner deck={runningDeck} items={assessmentItems.filter((i) => runningDeck.item_refs.includes(i.canonical_id))} onClose={() => setRunningDeck(null)} />;
  }

  return (
    <div>
      <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem" }}>Quizzes</h3>

      {/* Seção Decks */}
      <section style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", gap: "0.5rem" }}>
          <h4 style={{ margin: 0, fontSize: "1rem" }}>Quizzes montados — {decks.length}</h4>
          <button onClick={() => setEditingDeck(createEmptyQuizDeck())} className="ce-btn ce-btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            <PlusIcon size={14} /> Novo quiz
          </button>
        </div>

        {editingDeck && (
          <DeckForm deck={editingDeck} items={assessmentItems} onSave={(d) => { upsertDeck(d); setEditingDeck(null); }} onCancel={() => setEditingDeck(null)} />
        )}

        {decks.length === 0 && !editingDeck ? (
          <EmptyState text="Nenhum quiz montado. Monte um quiz selecionando questões cadastradas." />
        ) : (
          <ul style={listStyle}>
            {decks.map((d) => (
              <li key={d.canonical_id} style={listItemStyle}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{d.title || "[Sem título]"}</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--muted, #666)" }}>
                    {d.item_refs.length} questão(ões) · {d.time_limit_seconds ? `${Math.floor(d.time_limit_seconds / 60)}min` : "sem tempo"} · {d.passing_score || 0}% aprovação
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.25rem" }}>
                  <button onClick={() => setRunningDeck(d)} className="ce-btn ce-btn-ghost ce-btn-icon" disabled={d.item_refs.length === 0} title="Iniciar quiz"><PlayIcon size={14} /></button>
                  <button onClick={() => setEditingDeck(d)} className="ce-btn ce-btn-ghost ce-btn-icon" title="Editar"><EditIcon size={14} /></button>
                  <button onClick={() => { if (confirm(`Excluir quiz "${d.title}"?`)) removeDeck(d.canonical_id); }} className="ce-btn ce-btn-ghost ce-btn-icon" style={{ color: "var(--danger, #c0392b)" }} title="Excluir"><TrashIcon size={14} /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Seção Questões */}
      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", gap: "0.5rem", flexWrap: "wrap" }}>
          <h4 style={{ margin: 0, fontSize: "1rem" }}>Banco de questões — {filteredItems.length}</h4>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {allTags.length > 0 && (
              <select value={filterTag} onChange={(e) => setFilterTag(e.target.value)} style={{ padding: "0.4rem", borderRadius: "0.3rem", border: "1px solid var(--border, #ccc)" }}>
                <option value="ALL">Todas as tags</option>
                {allTags.map((t) => <option key={t} value={t}>#{t}</option>)}
              </select>
            )}
            <button onClick={() => setEditingItem(createEmptyAssessmentItem())} className="ce-btn ce-btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
              <PlusIcon size={14} /> Nova questão
            </button>
          </div>
        </div>

        {editingItem && (
          <ItemForm item={editingItem} onSave={(i) => { upsertItem(i); setEditingItem(null); }} onCancel={() => setEditingItem(null)} />
        )}

        {filteredItems.length === 0 && !editingItem ? (
          <EmptyState text="Nenhuma questão cadastrada." />
        ) : (
          <ul style={listStyle}>
            {filteredItems.map((item) => (
              <li key={item.canonical_id} style={listItemStyle}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.7rem", color: "var(--muted, #888)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {ITEM_TYPE_LABELS[item.item_type]}{item.topic ? ` · ${item.topic}` : ""}
                  </div>
                  <div style={{ marginTop: "0.15rem" }}>{item.prompt_key}</div>
                  {item.tags && item.tags.length > 0 && (
                    <div style={{ marginTop: "0.25rem", display: "flex", gap: "0.2rem", flexWrap: "wrap" }}>
                      {item.tags.map((t) => (
                        <span key={t} style={tagStyle}>#{t}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: "0.25rem" }}>
                  <button onClick={() => setEditingItem(item)} className="ce-btn ce-btn-ghost ce-btn-icon" title="Editar"><EditIcon size={14} /></button>
                  <button onClick={() => { if (confirm("Excluir questão?")) removeItem(item.canonical_id); }} className="ce-btn ce-btn-ghost ce-btn-icon" style={{ color: "var(--danger, #c0392b)" }} title="Excluir"><TrashIcon size={14} /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

// ============================================================
// Formulário de questão
// ============================================================

function ItemForm({ item, onSave, onCancel }: { item: AssessmentItem; onSave: (i: AssessmentItem) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState<AssessmentItem>(item);
  const [tagInput, setTagInput] = useState("");

  function patch<K extends keyof AssessmentItem>(k: K, v: AssessmentItem[K]) { setDraft((d) => ({ ...d, [k]: v })); }
  function patchOption(idx: number, value: string) {
    const next = [...draft.prompt_options];
    next[idx] = value;
    patch("prompt_options", next);
  }
  function addOption() { patch("prompt_options", [...draft.prompt_options, ""]); }
  function removeOption(idx: number) {
    if (draft.prompt_options.length <= 2) return;
    const next = draft.prompt_options.filter((_, i) => i !== idx);
    // Ajusta correct_answer_index se removida antes ou igual
    let newCorrect = draft.correct_answer_index;
    if (idx === newCorrect) newCorrect = 0;
    else if (idx < newCorrect) newCorrect -= 1;
    patch("prompt_options", next);
    patch("correct_answer_index", newCorrect);
  }
  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (!t || (draft.tags || []).includes(t)) return;
    patch("tags", [...(draft.tags || []), t]);
    setTagInput("");
  }
  function removeTag(t: string) {
    patch("tags", (draft.tags || []).filter((x) => x !== t));
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({ ...draft, updated_at: new Date().toISOString().slice(0, 10) }); }} style={formStyle}>
      <h5 style={{ marginTop: 0 }}>{item.prompt_key ? "Editar questão" : "Nova questão"}</h5>
      <div style={{ display: "grid", gap: "0.75rem" }}>
        <Field label="Enunciado" required>
          <textarea value={draft.prompt_key} onChange={(e) => patch("prompt_key", e.target.value)} style={{ ...inputStyle, minHeight: "3rem", resize: "vertical" }} placeholder="Ex.: Na Escala de Braden, um escore menor indica:" required />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
          <Field label="Tipo" required>
            <select value={draft.item_type} onChange={(e) => patch("item_type", e.target.value as ItemType)} style={inputStyle}>
              {Object.entries(ITEM_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </Field>
          <Field label="Política de shuffle">
            <select value={draft.shuffle_policy || "SHUFFLE_ALL"} onChange={(e) => patch("shuffle_policy", e.target.value as ShufflePolicy)} style={inputStyle}>
              {Object.entries(SHUFFLE_POLICY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </Field>
          <Field label="Exposição da resposta">
            <select value={draft.answer_exposure_policy || "ON_SUBMIT"} onChange={(e) => patch("answer_exposure_policy", e.target.value as AnswerExposurePolicy)} style={inputStyle}>
              {Object.entries(ANSWER_EXPOSURE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </Field>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
          <Field label="Tópico">
            <input type="text" value={draft.topic || ""} onChange={(e) => patch("topic", e.target.value)} style={inputStyle} placeholder="Ex.: Lesão por pressão" />
          </Field>
          <Field label="Disciplina">
            <input type="text" value={draft.subject || ""} onChange={(e) => patch("subject", e.target.value)} style={inputStyle} placeholder="Ex.: Enfermagem em UTI" />
          </Field>
          <Field label="Ferramenta vinculada (slug)">
            <input type="text" value={draft.linked_tool_slug || ""} onChange={(e) => patch("linked_tool_slug", e.target.value)} style={inputStyle} placeholder="Ex.: braden" />
          </Field>
        </div>

        {/* Opções */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>Alternativas *</label>
            <button type="button" onClick={addOption} className="ce-btn ce-btn-ghost" style={{ padding: "0.2rem 0.5rem", fontSize: "0.8rem" }}>+ Alternativa</button>
          </div>
          {draft.prompt_options.map((opt, idx) => (
            <div key={idx} style={{ display: "flex", gap: "0.4rem", marginBottom: "0.4rem", alignItems: "center" }}>
              <input type="radio" name="correct" checked={draft.correct_answer_index === idx} onChange={() => patch("correct_answer_index", idx)} title="Marcar como correta" />
              <input type="text" value={opt} onChange={(e) => patchOption(idx, e.target.value)} style={inputStyle} placeholder={`Alternativa ${String.fromCharCode(65 + idx)}`} required />
              {draft.prompt_options.length > 2 && (
                <button type="button" onClick={() => removeOption(idx)} className="ce-btn ce-btn-ghost ce-btn-icon"><TrashIcon size={12} /></button>
              )}
            </div>
          ))}
          <small style={{ color: "var(--muted, #666)" }}>Marque o radio da alternativa correta.</small>
        </div>

        <Field label="Justificativa (exibida na revisão)" required>
          <textarea value={draft.rationale_text} onChange={(e) => patch("rationale_text", e.target.value)} style={{ ...inputStyle, minHeight: "3rem", resize: "vertical" }} placeholder="Explique por que a alternativa correta está certa e por que as outras estão erradas." required />
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
          <Field label="Objetivo de aprendizagem (ID)" required>
            <input type="text" value={draft.learning_objective_ref} onChange={(e) => patch("learning_objective_ref", e.target.value)} style={inputStyle} placeholder="Ex.: LO-BRADEN-RISCO-PRESSAO" required />
          </Field>
          <Field label="Tempo estimado (segundos)">
            <input type="number" min={10} max={1800} value={draft.estimated_time_seconds || ""} onChange={(e) => patch("estimated_time_seconds", e.target.value ? Number(e.target.value) : undefined)} style={inputStyle} placeholder="Ex.: 30" />
          </Field>
        </div>

        <Field label="Tags (separadas por Enter)">
          <div style={{ display: "flex", gap: "0.4rem" }}>
            <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} style={inputStyle} placeholder="Ex.: braden, uti" />
            <button type="button" onClick={addTag} className="ce-btn ce-btn-ghost">+</button>
          </div>
          {(draft.tags || []).length > 0 && (
            <div style={{ marginTop: "0.4rem", display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
              {(draft.tags || []).map((t) => (
                <button key={t} type="button" onClick={() => removeTag(t)} style={tagButtonStyle}>#{t} ×</button>
              ))}
            </div>
          )}
        </Field>

        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
          <button type="button" onClick={onCancel} className="ce-btn ce-btn-ghost">Cancelar</button>
          <button type="submit" className="ce-btn ce-btn-primary">Salvar questão</button>
        </div>
      </div>
    </form>
  );
}

// ============================================================
// Formulário de Deck (montagem do quiz)
// ============================================================

function DeckForm({ deck, items, onSave, onCancel }: { deck: QuizDeck; items: AssessmentItem[]; onSave: (d: QuizDeck) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState<QuizDeck>(deck);
  const [query, setQuery] = useState("");

  function patch<K extends keyof QuizDeck>(k: K, v: QuizDeck[K]) { setDraft((d) => ({ ...d, [k]: v })); }
  function toggleItem(id: string) {
    const next = draft.item_refs.includes(id) ? draft.item_refs.filter((x) => x !== id) : [...draft.item_refs, id];
    patch("item_refs", next);
  }

  const filtered = items.filter((i) => !query || i.prompt_key.toLowerCase().includes(query.toLowerCase()) || i.topic?.toLowerCase().includes(query.toLowerCase()));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({ ...draft, updated_at: new Date().toISOString().slice(0, 10) }); }} style={formStyle}>
      <h5 style={{ marginTop: 0 }}>{deck.title ? "Editar quiz" : "Novo quiz"}</h5>
      <div style={{ display: "grid", gap: "0.75rem" }}>
        <Field label="Título do quiz" required>
          <input type="text" value={draft.title} onChange={(e) => patch("title", e.target.value)} style={inputStyle} placeholder="Ex.: Quiz — Escalas de risco de queda" required />
        </Field>
        <Field label="Descrição">
          <textarea value={draft.description || ""} onChange={(e) => patch("description", e.target.value)} style={{ ...inputStyle, minHeight: "2.5rem", resize: "vertical" }} placeholder="Ex.: 10 questões sobre escalas de risco de queda para revisão de prova." />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
          <Field label="Tempo limite (min)">
            <input type="number" min={0} value={draft.time_limit_seconds ? Math.floor(draft.time_limit_seconds / 60) : ""} onChange={(e) => patch("time_limit_seconds", e.target.value ? Number(e.target.value) * 60 : undefined)} style={inputStyle} placeholder="0 = sem limite" />
          </Field>
          <Field label="Nota de aprovação (%)">
            <input type="number" min={0} max={100} value={draft.passing_score ?? 70} onChange={(e) => patch("passing_score", e.target.value ? Number(e.target.value) : undefined)} style={inputStyle} />
          </Field>
          <Field label="Exposição padrão">
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
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} style={{ ...inputStyle, marginTop: "0.25rem" }} placeholder="Filtrar questões..." />
          <div style={{ marginTop: "0.5rem", maxHeight: "12rem", overflowY: "auto", border: "1px solid var(--border, #ccc)", borderRadius: "0.3rem" }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "1rem", textAlign: "center", color: "var(--muted, #666)", fontSize: "0.85rem" }}>Nenhuma questão cadastrada. Cadastre questões primeiro.</div>
            ) : (
              filtered.map((item) => (
                <label key={item.canonical_id} style={{ display: "flex", gap: "0.5rem", padding: "0.3rem 0.5rem", borderBottom: "1px solid var(--border, #f0f0f0)", cursor: "pointer", background: draft.item_refs.includes(item.canonical_id) ? "var(--accent-soft, #e8f0fe)" : "transparent" }}>
                  <input type="checkbox" checked={draft.item_refs.includes(item.canonical_id)} onChange={() => toggleItem(item.canonical_id)} />
                  <span style={{ fontSize: "0.85rem", flex: 1 }}>{item.prompt_key.slice(0, 100)}{item.prompt_key.length > 100 ? "..." : ""}</span>
                </label>
              ))
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
          <button type="button" onClick={onCancel} className="ce-btn ce-btn-ghost">Cancelar</button>
          <button type="submit" className="ce-btn ce-btn-primary" disabled={draft.item_refs.length === 0}>Salvar quiz</button>
        </div>
      </div>
    </form>
  );
}

// ============================================================
// Helpers / estilos compartilhados
// ============================================================

const listStyle: React.CSSProperties = { listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.4rem" };
const listItemStyle: React.CSSProperties = { border: "1px solid var(--border, #e0e0e0)", borderRadius: "0.4rem", padding: "0.6rem 0.75rem", background: "var(--surface, #fff)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" };
const inputStyle: React.CSSProperties = { width: "100%", padding: "0.5rem 0.6rem", border: "1px solid var(--border, #ccc)", borderRadius: "0.3rem", fontSize: "0.95rem", background: "var(--surface, #fff)" };
const formStyle: React.CSSProperties = { border: "1px solid var(--border, #ccc)", borderRadius: "0.4rem", padding: "1rem", marginBottom: "0.75rem", background: "var(--surface, #fafafa)" };
const tagStyle: React.CSSProperties = { fontSize: "0.7rem", padding: "0.1rem 0.4rem", background: "var(--accent-soft, #e8f0fe)", color: "var(--accent, #0a66c2)", borderRadius: "0.2rem" };
const tagButtonStyle: React.CSSProperties = { border: "1px solid var(--border, #ccc)", background: "var(--accent-soft, #e8f0fe)", color: "var(--accent, #0a66c2)", borderRadius: "0.3rem", padding: "0.1rem 0.5rem", fontSize: "0.75rem", cursor: "pointer" };

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

function EmptyState({ text }: { text: string }) {
  return <div style={{ padding: "1rem", textAlign: "center", color: "var(--muted, #888)", fontSize: "0.9rem" }}>{text}</div>;
}

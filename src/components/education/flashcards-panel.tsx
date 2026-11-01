import { useMemo, useState } from "react";
import { EditIcon, TrashIcon, PlusIcon, LayersIcon, CheckIcon, XIcon, RotateCwIcon, CalendarIcon } from "lucide-react";
import { useFlashcards } from "@/lib/education/store";
import {
  DIFFICULTY_LABELS,
  DIFFICULTY_TONE,
  createEmptyFlashcard,
  type Flashcard,
  type DifficultyLevel,
} from "@/lib/education/types";
import {
  sortFlashcardsByDue,
  isDueForReview,
  updateSpacedRepetition,
  LEITNER_INTERVALS_DAYS,
} from "@/lib/education/quiz-engine";

export function FlashcardsPanel() {
  const { items, upsert, remove } = useFlashcards();
  const [editing, setEditing] = useState<Flashcard | null>(null);
  const [filterTopic, setFilterTopic] = useState<string>("ALL");
  const [reviewMode, setReviewMode] = useState(false);

  const allTopics = Array.from(new Set(items.map((c) => c.topic).filter(Boolean) as string[])).sort();

  const filtered = useMemo(() => {
    const list = filterTopic === "ALL" ? items : items.filter((c) => c.topic === filterTopic);
    return sortFlashcardsByDue(list);
  }, [items, filterTopic]);

  const dueCount = items.filter(isDueForReview).length;

  if (reviewMode) {
    return <FlashcardReviewer cards={filtered} onReview={(card, success) => {
      const updated: Flashcard = {
        ...card,
        spaced_repetition_state: updateSpacedRepetition(card.spaced_repetition_state, success),
        updated_at: new Date().toISOString().slice(0, 10),
      };
      upsert(updated);
    }} onClose={() => setReviewMode(false)} />;
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Flashcards — {items.length}</h3>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={() => setReviewMode(true)}
            className="ce-btn ce-btn-primary"
            disabled={dueCount === 0}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
            title="Iniciar sessão de revisão (cartões vencidos)"
          >
            <LayersIcon size={14} /> Revisar ({dueCount})
          </button>
          <button
            onClick={() => setEditing(createEmptyFlashcard())}
            className="ce-btn ce-btn-ghost"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <PlusIcon size={14} /> Novo cartão
          </button>
        </div>
      </div>

      {editing && (
        <FlashcardForm
          card={editing}
          onSave={(c) => { upsert(c); setEditing(null); }}
          onCancel={() => setEditing(null)}
        />
      )}

      {!editing && items.length === 0 && (
        <div style={{ padding: "2rem", textAlign: "center", color: "var(--muted, #666)", border: "1px dashed var(--border, #ccc)", borderRadius: "0.4rem" }}>
          Nenhum flashcard cadastrado. Crie cartões com frente/verso para revisão espaçada.
        </div>
      )}

      {!editing && items.length > 0 && (
        <>
          {/* Estatísticas Leitner */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.25rem", marginBottom: "1rem" }}>
            {LEITNER_INTERVALS_DAYS.map((interval, boxIdx) => {
              const box = boxIdx + 1;
              const count = items.filter((c) => (c.spaced_repetition_state?.box || 1) === box).length;
              return (
                <div key={box} style={{ border: "1px solid var(--border, #e0e0e0)", borderRadius: "0.3rem", padding: "0.4rem", textAlign: "center", background: "var(--surface, #fff)" }}>
                  <div style={{ fontSize: "0.7rem", color: "var(--muted, #666)" }}>Caixa {box}</div>
                  <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>{count}</div>
                  <div style={{ fontSize: "0.65rem", color: "var(--muted, #888)" }}>
                    {box === 7 ? "30 dias" : `${interval}d`}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Filtro */}
          {allTopics.length > 0 && (
            <select value={filterTopic} onChange={(e) => setFilterTopic(e.target.value)} style={{ padding: "0.4rem", marginBottom: "0.75rem", borderRadius: "0.3rem", border: "1px solid var(--border, #ccc)" }}>
              <option value="ALL">Todos os tópicos ({items.length})</option>
              {allTopics.map((t) => <option key={t} value={t}>{t} ({items.filter((c) => c.topic === t).length})</option>)}
            </select>
          )}

          {/* Lista de cartões */}
          <ul style={listStyle}>
            {filtered.map((card) => {
              const due = isDueForReview(card);
              const box = card.spaced_repetition_state?.box || 1;
              const success = card.spaced_repetition_state?.success_count || 0;
              const fail = card.spaced_repetition_state?.fail_count || 0;
              return (
                <li key={card.canonical_id} style={{ ...listItemStyle, borderLeft: `3px solid ${due ? "var(--warn, #c47b00)" : "transparent"}` }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.2rem", flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>{card.front_text}</span>
                      {card.difficulty && (
                        <span style={{
                          fontSize: "0.7rem",
                          padding: "0.1rem 0.4rem",
                          borderRadius: "0.2rem",
                          background: DIFFICULTY_TONE[card.difficulty] === "danger" ? "var(--danger-soft, #fde8e8)" : DIFFICULTY_TONE[card.difficulty] === "warn" ? "var(--warn-soft, #fff3e0)" : "var(--accent-soft, #e8f0fe)",
                          color: DIFFICULTY_TONE[card.difficulty] === "danger" ? "var(--danger, #c0392b)" : DIFFICULTY_TONE[card.difficulty] === "warn" ? "var(--warn, #c47b00)" : "var(--accent, #0a66c2)",
                        }}>
                          {DIFFICULTY_LABELS[card.difficulty]}
                        </span>
                      )}
                      {due && (
                        <span style={{ fontSize: "0.7rem", padding: "0.1rem 0.4rem", borderRadius: "0.2rem", background: "var(--warn-soft, #fff3e0)", color: "var(--warn, #c47b00)" }}>
                          Vencido
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "var(--muted, #666)" }}>{card.back_text.slice(0, 120)}{card.back_text.length > 120 ? "..." : ""}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--muted, #888)", marginTop: "0.25rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <span>Caixa {box}/7</span>
                      <span>· ✓{success} ✗{fail}</span>
                      {card.spaced_repetition_state?.next_review_at && (
                        <span>· <CalendarIcon size={11} style={{ verticalAlign: "middle" }} /> {card.spaced_repetition_state.next_review_at}</span>
                      )}
                      {card.linked_tool_slug && <span>· <a href={`/ferramentas/${card.linked_tool_slug}`} style={{ color: "var(--accent, #0a66c2)" }}>{card.linked_tool_slug}</a></span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.25rem", flexShrink: 0 }}>
                    <button onClick={() => setEditing(card)} className="ce-btn ce-btn-ghost ce-btn-icon" title="Editar"><EditIcon size={14} /></button>
                    <button onClick={() => { if (confirm("Excluir flashcard?")) remove(card.canonical_id); }} className="ce-btn ce-btn-ghost ce-btn-icon" style={{ color: "var(--danger, #c0392b)" }} title="Excluir"><TrashIcon size={14} /></button>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

// ============================================================
// Formulário de flashcard
// ============================================================

function FlashcardForm({ card, onSave, onCancel }: { card: Flashcard; onSave: (c: Flashcard) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState<Flashcard>(card);
  const [tagInput, setTagInput] = useState("");

  function patch<K extends keyof Flashcard>(k: K, v: Flashcard[K]) { setDraft((d) => ({ ...d, [k]: v })); }
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
      <h5 style={{ marginTop: 0 }}>{card.front_text ? "Editar cartão" : "Novo cartão"}</h5>
      <div style={{ display: "grid", gap: "0.75rem" }}>
        <Field label="Frente (pergunta/conceito)" required>
          <textarea value={draft.front_text} onChange={(e) => patch("front_text", e.target.value)} style={{ ...inputStyle, minHeight: "3rem", resize: "vertical" }} placeholder="Ex.: Escala de Braden" required />
        </Field>
        <Field label="Verso (resposta/explicação)" required>
          <textarea value={draft.back_text} onChange={(e) => patch("back_text", e.target.value)} style={{ ...inputStyle, minHeight: "4rem", resize: "vertical" }} placeholder="Ex.: Avalia risco de lesão por pressão. 6 domínios, escore 6-23..." required />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
          <Field label="Dificuldade">
            <select value={draft.difficulty || "BASIC"} onChange={(e) => patch("difficulty", e.target.value as DifficultyLevel)} style={inputStyle}>
              {Object.entries(DIFFICULTY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </Field>
          <Field label="Tópico">
            <input type="text" value={draft.topic || ""} onChange={(e) => patch("topic", e.target.value)} style={inputStyle} placeholder="Ex.: Lesão por pressão" />
          </Field>
          <Field label="Disciplina">
            <input type="text" value={draft.subject || ""} onChange={(e) => patch("subject", e.target.value)} style={inputStyle} placeholder="Ex.: Enfermagem em UTI" />
          </Field>
        </div>
        <Field label="Ferramenta vinculada (slug)">
          <input type="text" value={draft.linked_tool_slug || ""} onChange={(e) => patch("linked_tool_slug", e.target.value)} style={inputStyle} placeholder="Ex.: braden" />
        </Field>
        <Field label="Objetivo de aprendizagem (ID)" required>
          <input type="text" value={draft.learning_objective_ref} onChange={(e) => patch("learning_objective_ref", e.target.value)} style={inputStyle} placeholder="Ex.: LO-BRADEN-RISCO-PRESSAO" required />
        </Field>
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
          <button type="submit" className="ce-btn ce-btn-primary">Salvar cartão</button>
        </div>
      </div>
    </form>
  );
}

// ============================================================
// Revisor de flashcards (estilo Anki)
// ============================================================

function FlashcardReviewer({
  cards,
  onReview,
  onClose,
}: {
  cards: Flashcard[];
  onReview: (card: Flashcard, success: boolean) => void;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  const current = cards[idx];

  if (!current) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <h3 style={{ marginTop: 0 }}>Revisão concluída!</h3>
        <p style={{ color: "var(--muted, #666)" }}>{reviewedCount} cartão(ões) revisado(s) nesta sessão.</p>
        <button onClick={onClose} className="ce-btn ce-btn-primary">Voltar</button>
      </div>
    );
  }

  function handleReview(success: boolean) {
    onReview(current, success);
    setReviewedCount((c) => c + 1);
    setFlipped(false);
    setIdx((i) => i + 1);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", gap: "0.5rem" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Revisão</h3>
          <div style={{ fontSize: "0.85rem", color: "var(--muted, #666)" }}>
            Cartão {idx + 1} de {cards.length} · {reviewedCount} revisado(s)
          </div>
        </div>
        <button onClick={onClose} className="ce-btn ce-btn-ghost">Encerrar</button>
      </div>

      {/* Cartão flip */}
      <button
        onClick={() => setFlipped(!flipped)}
        style={{
          width: "100%",
          minHeight: "12rem",
          padding: "1.5rem",
          background: flipped ? "var(--accent-soft, #f0f6ff)" : "var(--surface, #fff)",
          border: "2px solid var(--accent, #0a66c2)",
          borderRadius: "0.5rem",
          cursor: "pointer",
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        <div style={{ fontSize: "0.75rem", color: "var(--muted, #666)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {flipped ? "Verso · clique para virar" : "Frente · clique para ver resposta"}
        </div>
        <div style={{ fontSize: "1.1rem", lineHeight: 1.5, fontFamily: flipped ? "Georgia, serif" : "inherit" }}>
          {flipped ? current.back_text : current.front_text}
        </div>
        {!flipped && current.difficulty && (
          <span style={{ fontSize: "0.7rem", padding: "0.1rem 0.4rem", background: "var(--accent-soft, #e8f0fe)", color: "var(--accent, #0a66c2)", borderRadius: "0.2rem" }}>
            {DIFFICULTY_LABELS[current.difficulty]}
          </span>
        )}
        {flipped && current.linked_tool_slug && (
          <div style={{ marginTop: "0.5rem" }}>
            <a href={`/ferramentas/${current.linked_tool_slug}`} onClick={(e) => e.stopPropagation()} style={{ color: "var(--accent, #0a66c2)", fontSize: "0.85rem" }}>
              Ver ferramenta vinculada →
            </a>
          </div>
        )}
      </button>

      {/* Botões de avaliação (só aparecem após flip) */}
      {flipped && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginTop: "1rem" }}>
          <button onClick={() => handleReview(false)} className="ce-btn" style={{ background: "var(--danger-soft, #fde8e8)", color: "var(--danger, #c0392b)", border: "1px solid var(--danger, #c0392b)", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", padding: "0.75rem" }}>
            <XIcon size={16} /> Errei — volta para caixa 1
          </button>
          <button onClick={() => handleReview(true)} className="ce-btn" style={{ background: "var(--success-soft, #e8f5e8)", color: "var(--success, #2e7d32)", border: "1px solid var(--success, #2e7d32)", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", padding: "0.75rem" }}>
            <CheckIcon size={16} /> Acertei — avança caixa
          </button>
        </div>
      )}

      {!flipped && (
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <button onClick={() => setFlipped(true)} className="ce-btn ce-btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            <RotateCwIcon size={14} /> Virar cartão
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Estilos compartilhados
// ============================================================

const listStyle: React.CSSProperties = { listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.4rem" };
const listItemStyle: React.CSSProperties = { border: "1px solid var(--border, #e0e0e0)", borderRadius: "0.4rem", padding: "0.6rem 0.75rem", background: "var(--surface, #fff)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" };
const inputStyle: React.CSSProperties = { width: "100%", padding: "0.5rem 0.6rem", border: "1px solid var(--border, #ccc)", borderRadius: "0.3rem", fontSize: "0.95rem", background: "var(--surface, #fff)" };
const formStyle: React.CSSProperties = { border: "1px solid var(--border, #ccc)", borderRadius: "0.4rem", padding: "1rem", marginBottom: "0.75rem", background: "var(--surface, #fafafa)" };
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

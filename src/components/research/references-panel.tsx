import { useMemo, useState } from "react";
import { EditIcon, TrashIcon, PlusIcon, CopyIcon, CheckIcon } from "lucide-react";
import { useReferences, useSources } from "@/lib/research/store";
import { formatReference, formatInText, suggestDirectType, estimateLineCount } from "@/lib/research/abnt";
import {
  CITATION_TYPE_LABELS,
  generateId,
  type CitationType,
  type Reference,
} from "@/lib/research/types";

function emptyReference(sourceId: string): Reference {
  return {
    id: generateId("REF"),
    sourceId,
    citationStyle: "ABNT_6023_2018",
    citationType: "SCIENTIFIC",
    citedText: "",
    locator: "",
    accessedAt: new Date().toISOString().slice(0, 10),
    rightsStatus: "UNKNOWN",
  };
}

export function ReferencesPanel() {
  const { items: refs, upsert, remove } = useReferences();
  const { items: sources } = useSources();
  const [editing, setEditing] = useState<Reference | null>(null);
  const [filterSourceId, setFilterSourceId] = useState<string>("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const sourcesById = useMemo(() => {
    const map = new Map(sources.map((s) => [s.id, s]));
    return map;
  }, [sources]);

  const filtered = useMemo(() => {
    if (filterSourceId === "ALL") return refs;
    return refs.filter((r) => r.sourceId === filterSourceId);
  }, [refs, filterSourceId]);

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  }

  if (sources.length === 0) {
    return (
      <div
        style={{
          padding: "2rem",
          textAlign: "center",
          color: "var(--muted, #666)",
          border: "1px dashed var(--border, #ccc)",
          borderRadius: "0.4rem",
        }}
      >
        <p style={{ marginBottom: "0.5rem" }}>
          Para gerar citações você precisa primeiro cadastrar pelo menos uma fonte.
        </p>
        <p>Vá para a aba <strong>Biblioteca de Fontes</strong> e cadastre um artigo, livro, lei ou diretriz.</p>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "1rem",
          flexWrap: "wrap",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "1.1rem" }}>
          Citações ABNT — {refs.length} cadastrada{refs.length === 1 ? "" : "s"}
        </h3>
        <button
          onClick={() => setEditing(emptyReference(sources[0].id))}
          className="ce-btn ce-btn-primary"
          style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
        >
          <PlusIcon size={16} /> Nova citação
        </button>
      </div>

      {editing && (
        <ReferenceForm
          reference={editing}
          sources={sources}
          onSave={(r) => {
            upsert(r);
            setEditing(null);
          }}
          onCancel={() => setEditing(null)}
        />
      )}

      {!editing && (
        <>
          <div style={{ marginBottom: "1rem" }}>
            <select
              value={filterSourceId}
              onChange={(e) => setFilterSourceId(e.target.value)}
              style={{ padding: "0.4rem", border: "1px solid var(--border, #ccc)", borderRadius: "0.3rem" }}
            >
              <option value="ALL">Todas as fontes ({refs.length})</option>
              {sources.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title.slice(0, 60)}
                  {s.title.length > 60 ? "..." : ""} ({refs.filter((r) => r.sourceId === s.id).length})
                </option>
              ))}
            </select>
          </div>

          {filtered.length === 0 ? (
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                color: "var(--muted, #666)",
                border: "1px dashed var(--border, #ccc)",
                borderRadius: "0.4rem",
              }}
            >
              Nenhuma citação cadastrada. Clique em "Nova citação" para gerar uma referência ABNT.
            </div>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.75rem" }}>
              {filtered.map((r) => {
                const source = sourcesById.get(r.sourceId);
                if (!source) {
                  return (
                    <li
                      key={r.id}
                      style={{
                        border: "1px solid var(--danger, #c0392b)",
                        borderRadius: "0.4rem",
                        padding: "0.75rem",
                        background: "var(--danger-soft, #fde8e8)",
                      }}
                    >
                      ⚠️ Citação órfã: fonte {r.sourceId} não existe mais. Edite ou exclua.
                      <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.25rem" }}>
                        <button onClick={() => setEditing(r)} className="ce-btn ce-btn-ghost ce-btn-icon">
                          <EditIcon size={14} />
                        </button>
                        <button
                          onClick={() => remove(r.id)}
                          className="ce-btn ce-btn-ghost ce-btn-icon"
                          style={{ color: "var(--danger, #c0392b)" }}
                        >
                          <TrashIcon size={14} />
                        </button>
                      </div>
                    </li>
                  );
                }
                const secondary = r.secondarySourceId ? sourcesById.get(r.secondarySourceId) : undefined;
                const fullRef = formatReference(source, r, secondary);
                const inText = formatInText(source, r, { narrative: false, secondarySource: secondary });
                return (
                  <li
                    key={r.id}
                    style={{
                      border: "1px solid var(--border, #e0e0e0)",
                      borderRadius: "0.4rem",
                      padding: "0.75rem 1rem",
                      background: "var(--surface, #fff)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "0.5rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span
                          style={{
                            fontSize: "0.7rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            color: "var(--muted, #666)",
                            fontWeight: 600,
                          }}
                        >
                          {CITATION_TYPE_LABELS[r.citationType]}
                        </span>
                        <div style={{ fontSize: "0.85rem", color: "var(--muted, #666)" }}>
                          Fonte: <strong>{source.title.slice(0, 80)}{source.title.length > 80 ? "..." : ""}</strong>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "0.25rem", flexShrink: 0 }}>
                        <button
                          onClick={() => copyToClipboard(fullRef, r.id + "-full")}
                          className="ce-btn ce-btn-ghost ce-btn-icon"
                          aria-label="Copiar referência completa"
                          title="Copiar referência completa"
                        >
                          {copiedId === r.id + "-full" ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                        </button>
                        <button onClick={() => setEditing(r)} className="ce-btn ce-btn-ghost ce-btn-icon" aria-label="Editar">
                          <EditIcon size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Excluir citação?")) remove(r.id);
                          }}
                          className="ce-btn ce-btn-ghost ce-btn-icon"
                          aria-label="Excluir"
                          style={{ color: "var(--danger, #c0392b)" }}
                        >
                          <TrashIcon size={14} />
                        </button>
                      </div>
                    </div>
                    <div
                      style={{
                        background: "var(--accent-soft, #f5f8fc)",
                        padding: "0.6rem 0.75rem",
                        borderRadius: "0.3rem",
                        fontSize: "0.92rem",
                        lineHeight: 1.5,
                        whiteSpace: "pre-wrap",
                        fontFamily: "Georgia, 'Times New Roman', serif",
                      }}
                    >
                      {fullRef}
                    </div>
                    <div
                      style={{
                        marginTop: "0.4rem",
                        fontSize: "0.85rem",
                        display: "flex",
                        gap: "0.5rem",
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <span style={{ color: "var(--muted, #666)" }}>Citação no corpo do texto:</span>
                      <code
                        style={{
                          background: "var(--accent-soft, #e8f0fe)",
                          padding: "0.1rem 0.4rem",
                          borderRadius: "0.2rem",
                          fontFamily: "monospace",
                        }}
                      >
                        {inText}
                      </code>
                      <button
                        onClick={() => copyToClipboard(inText, r.id + "-inline")}
                        className="ce-btn ce-btn-ghost ce-btn-icon"
                        style={{ padding: "0.1rem 0.3rem" }}
                        aria-label="Copiar citação no texto"
                      >
                        {copiedId === r.id + "-inline" ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {filtered.length > 0 && (
            <details style={{ marginTop: "1rem" }}>
              <summary style={{ cursor: "pointer", fontSize: "0.9rem", color: "var(--muted, #555)" }}>
                Ver lista de referências (formato ABNT para colar no Word)
              </summary>
              <div
                style={{
                  background: "var(--surface, #fafafa)",
                  border: "1px solid var(--border, #ccc)",
                  borderRadius: "0.4rem",
                  padding: "1rem",
                  marginTop: "0.5rem",
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: "0.95rem",
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                }}
              >
                {filtered
                  .map((r) => {
                    const s = sourcesById.get(r.sourceId);
                    if (!s) return null;
                    const sec = r.secondarySourceId ? sourcesById.get(r.secondarySourceId) : undefined;
                    return formatReference(s, r, sec);
                  })
                  .filter(Boolean)
                  .join("\n\n")}
              </div>
            </details>
          )}
        </>
      )}
    </div>
  );
}

function ReferenceForm({
  reference,
  sources,
  onSave,
  onCancel,
}: {
  reference: Reference;
  sources: Array<{ id: string; title: string; authors: Array<{ surname: string; givenName: string }>; year: string; source_type: string }>;
  onSave: (r: Reference) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<Reference>(reference);
  const source = sources.find((s) => s.id === draft.sourceId);

  function patch<K extends keyof Reference>(key: K, value: Reference[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  // Sugere DIRECT_SHORT/LONG automaticamente com base no texto citado
  function handleCitedTextChange(text: string) {
    patch("citedText", text);
    if (text.length > 0) {
      const lines = estimateLineCount(text);
      if (lines > 3 && draft.citationType === "DIRECT_SHORT") {
        patch("citationType", "DIRECT_LONG");
      } else if (lines <= 3 && draft.citationType === "DIRECT_LONG") {
        patch("citationType", "DIRECT_SHORT");
      }
    }
  }

  const requiresCitedText = ["DIRECT_SHORT", "DIRECT_LONG", "PARAPHRASE", "TRANSLATION", "AI_DISCLOSURE"].includes(
    draft.citationType,
  );
  const requiresSecondary = draft.citationType === "APUD";
  const requiresAITool = draft.citationType === "AI_DISCLOSURE";

  // Pré-visualização
  const previewSource = source
    ? ({
        ...source,
        locator: { uri: "", pinpoint: "" },
        authors: source.authors || [],
        place: "",
        publisher: "",
        year: source.year || "s.d.",
      } as any)
    : null;

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
        {reference.sourceId ? "Editar citação" : "Nova citação"}
      </h4>

      <div style={{ display: "grid", gap: "0.75rem" }}>
        <Field label="Fonte" required>
          <select
            value={draft.sourceId}
            onChange={(e) => patch("sourceId", e.target.value)}
            style={inputStyle}
            required
          >
            <option value="">Selecione uma fonte...</option>
            {sources.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title.slice(0, 80)}
                {s.title.length > 80 ? "..." : ""} ({s.year || "s.d."})
              </option>
            ))}
          </select>
        </Field>

        <Field label="Tipo de citação" required>
          <select
            value={draft.citationType}
            onChange={(e) => patch("citationType", e.target.value as CitationType)}
            style={inputStyle}
          >
            {Object.entries(CITATION_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <small style={{ color: "var(--muted, #666)" }}>
            {draft.citationType === "DIRECT_SHORT" && "Citação curta no corpo do texto, em aspas. Até 3 linhas."}
            {draft.citationType === "DIRECT_LONG" && "Citação com recuo de 4 cm, sem aspas, tamanho menor. Mais de 3 linhas."}
            {draft.citationType === "PARAPHRASE" && "Reformulação com suas palavras. Sem aspas."}
            {draft.citationType === "APUD" && "Citação de uma fonte através de outra (fonte secundária)."}
            {draft.citationType === "TRANSLATION" && "Tradução de trecho estrangeiro. Adicionar (tradução nossa)."}
            {draft.citationType === "AI_DISCLOSURE" && "Uso de IA generativa (ChatGPT, Claude, etc.). Disclosure exigido."}
          </small>
        </Field>

        {requiresCitedText && (
          <Field
            label={
              draft.citationType === "AI_DISCLOSURE"
                ? "Prompt enviado à IA"
                : draft.citationType === "PARAPHRASE"
                  ? "Texto parafraseado"
                  : "Texto citado"
            }
            required
          >
            <textarea
              value={draft.citedText || ""}
              onChange={(e) => handleCitedTextChange(e.target.value)}
              style={{ ...inputStyle, minHeight: "5rem", resize: "vertical" }}
              placeholder={
                draft.citationType === "AI_DISCLOSURE"
                  ? "Ex.: Resuma as evidências sobre prevenção de lesão por pressão em UTI"
                  : "Cole aqui o trecho exato da fonte"
              }
              required={requiresCitedText}
            />
            {draft.citedText && (
              <small style={{ color: "var(--muted, #666)" }}>
                ≈ {estimateLineCount(draft.citedText)} linha(ões).{" "}
                {suggestDirectType(draft.citedText) === "DIRECT_SHORT"
                  ? "Citação curta (≤3 linhas)."
                  : "Citação longa (>3 linhas) — considerar recuo."}
              </small>
            )}
          </Field>
        )}

        {requiresAITool && (
          <Field label="Ferramenta de IA usada" required>
            <input
              type="text"
              value={draft.aiTool || ""}
              onChange={(e) => patch("aiTool", e.target.value)}
              style={inputStyle}
              placeholder="Ex.: ChatGPT (GPT-4), Claude 3.5 Sonnet, Gemini Pro"
              required
            />
          </Field>
        )}

        {requiresSecondary && (
          <Field label="Fonte secundária (que citou a primária)" required>
            <select
              value={draft.secondarySourceId || ""}
              onChange={(e) => patch("secondarySourceId", e.target.value)}
              style={inputStyle}
              required
            >
              <option value="">Selecione a fonte secundária...</option>
              {sources
                .filter((s) => s.id !== draft.sourceId)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title.slice(0, 80)}
                    {s.title.length > 80 ? "..." : ""}
                  </option>
                ))}
            </select>
          </Field>
        )}

        <Field label="Localização (página, artigo, capítulo)" required>
          <input
            type="text"
            value={draft.locator}
            onChange={(e) => patch("locator", e.target.value)}
            style={inputStyle}
            placeholder="Ex.: p. 45 / art. 12 / cap. 4"
            required
          />
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <Field label="Data de acesso">
            <input
              type="date"
              value={draft.accessedAt}
              onChange={(e) => patch("accessedAt", e.target.value)}
              style={inputStyle}
              required
            />
          </Field>
          <Field label="URL direta (se diferente da fonte)">
            <input
              type="url"
              value={draft.directUri || ""}
              onChange={(e) => patch("directUri", e.target.value)}
              style={inputStyle}
              placeholder="https://..."
            />
          </Field>
        </div>

        <Field label="Notas (sobre esta citação)">
          <textarea
            value={draft.notes || ""}
            onChange={(e) => patch("notes", e.target.value)}
            style={{ ...inputStyle, minHeight: "3rem", resize: "vertical" }}
            placeholder="Ex.: Definição-chave usada na seção de discussão"
          />
        </Field>

        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "0.5rem" }}>
          <button type="button" onClick={onCancel} className="ce-btn ce-btn-ghost">
            Cancelar
          </button>
          <button type="submit" className="ce-btn ce-btn-primary">
            Salvar citação
          </button>
        </div>
      </div>
    </form>
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

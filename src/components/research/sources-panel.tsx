import { useMemo, useState } from "react";
import { EditIcon, TrashIcon, PlusIcon, SearchIcon } from "lucide-react";
import {
  useSources,
} from "@/lib/research/store";
import {
  RIGHTS_LABELS,
  SOURCE_TYPE_LABELS,
  generateId,
  type Source,
  type SourceType,
} from "@/lib/research/types";

function emptySource(): Source {
  return {
    id: generateId("SRC"),
    version: "1.0.0",
    status: "CANDIDATE",
    updatedAt: new Date().toISOString().slice(0, 10),
    source_type: "PRIMARY_STUDY",
    title: "",
    authority: "",
    authors: [{ surname: "", givenName: "" }],
    place: "",
    publisher: "",
    year: String(new Date().getFullYear()),
    edition: "",
    locator: { uri: "", pinpoint: "" },
    rights: "UNKNOWN",
    jurisdiction: "BR",
    retrievedAt: new Date().toISOString().slice(0, 10),
    language: "pt-BR",
    tags: [],
    notes: "",
  };
}

export function SourcesPanel() {
  const { items, upsert, remove } = useSources();
  const [editing, setEditing] = useState<Source | null>(null);
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<SourceType | "ALL">("ALL");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((s) => {
      if (filterType !== "ALL" && s.source_type !== filterType) return false;
      if (!q) return true;
      return (
        s.title.toLowerCase().includes(q) ||
        s.authority.toLowerCase().includes(q) ||
        s.authors.some((a) => `${a.surname} ${a.givenName}`.toLowerCase().includes(q)) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [items, query, filterType]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <h3 style={{ margin: 0, fontSize: "1.1rem" }}>
          Biblioteca de Fontes — {items.length} cadastrada{items.length === 1 ? "" : "s"}
        </h3>
        <button
          onClick={() => setEditing(emptySource())}
          className="ce-btn ce-btn-primary"
          style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
        >
          <PlusIcon size={16} /> Nova fonte
        </button>
      </div>

      {editing && (
        <SourceForm
          source={editing}
          onSave={(s) => {
            upsert({ ...s, updatedAt: new Date().toISOString().slice(0, 10) });
            setEditing(null);
          }}
          onCancel={() => setEditing(null)}
        />
      )}

      {!editing && (
        <>
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: "1 1 280px" }}>
              <SearchIcon
                size={16}
                style={{
                  position: "absolute",
                  left: "0.6rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--muted, #888)",
                }}
              />
              <input
                type="search"
                placeholder="Buscar por título, autor, tag..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem 0.5rem 0.5rem 2rem",
                  border: "1px solid var(--border, #ccc)",
                  borderRadius: "0.3rem",
                }}
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as SourceType | "ALL")}
              style={{ padding: "0.5rem", border: "1px solid var(--border, #ccc)", borderRadius: "0.3rem" }}
            >
              <option value="ALL">Todos os tipos</option>
              {Object.entries(SOURCE_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
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
              {items.length === 0
                ? "Nenhuma fonte cadastrada. Clique em \"Nova fonte\" para começar."
                : "Nenhuma fonte corresponde à busca."}
            </div>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.5rem" }}>
              {filtered.map((s) => (
                <li
                  key={s.id}
                  style={{
                    border: "1px solid var(--border, #e0e0e0)",
                    borderRadius: "0.4rem",
                    padding: "0.75rem 1rem",
                    background: "var(--surface, #fff)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", alignItems: "flex-start" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--muted, #666)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {SOURCE_TYPE_LABELS[s.source_type]} · {s.year || "s.d."}
                      </div>
                      <div style={{ fontWeight: 600, marginTop: "0.15rem" }}>{s.title || "[Sem título]"}</div>
                      <div style={{ fontSize: "0.85rem", color: "var(--muted, #666)", marginTop: "0.15rem" }}>
                        {s.authors.length > 0
                          ? s.authors.map((a) => `${a.surname}, ${a.givenName}`.trim()).join("; ")
                          : s.authority}
                        {s.authority && s.authors.length > 0 ? ` — ${s.authority}` : ""}
                      </div>
                      {s.tags.length > 0 && (
                        <div style={{ marginTop: "0.4rem", display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
                          {s.tags.map((t) => (
                            <span
                              key={t}
                              style={{
                                fontSize: "0.7rem",
                                padding: "0.1rem 0.4rem",
                                background: "var(--accent-soft, #e8f0fe)",
                                color: "var(--accent, #0a66c2)",
                                borderRadius: "0.2rem",
                              }}
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: "0.25rem", flexShrink: 0 }}>
                      <button
                        onClick={() => setEditing(s)}
                        className="ce-btn ce-btn-ghost ce-btn-icon"
                        aria-label="Editar"
                        title="Editar"
                      >
                        <EditIcon size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Excluir "${s.title}"?`)) remove(s.id);
                        }}
                        className="ce-btn ce-btn-ghost ce-btn-icon"
                        aria-label="Excluir"
                        title="Excluir"
                        style={{ color: "var(--danger, #c0392b)" }}
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
    </div>
  );
}

// ============================================================
// Formulário de fonte
// ============================================================

function SourceForm({
  source,
  onSave,
  onCancel,
}: {
  source: Source;
  onSave: (s: Source) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<Source>(source);
  const [tagInput, setTagInput] = useState("");

  function patch<K extends keyof Source>(key: K, value: Source[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function patchAuthor(idx: number, key: "surname" | "givenName", value: string) {
    setDraft((d) => {
      const next = [...d.authors];
      next[idx] = { ...next[idx], [key]: value };
      return { ...d, authors: next };
    });
  }

  function addAuthor() {
    setDraft((d) => ({ ...d, authors: [...d.authors, { surname: "", givenName: "" }] }));
  }

  function removeAuthor(idx: number) {
    setDraft((d) => ({
      ...d,
      authors: d.authors.filter((_, i) => i !== idx),
    }));
  }

  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (!t || draft.tags.includes(t)) return;
    patch("tags", [...draft.tags, t]);
    setTagInput("");
  }

  function removeTag(t: string) {
    patch(
      "tags",
      draft.tags.filter((x) => x !== t),
    );
  }

  const isTextbook = draft.source_type === "TEXTBOOK";
  const isLegal = draft.source_type === "OFFICIAL_LAW";
  const isStandard = draft.source_type === "STANDARD";

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
        {source.title ? "Editar fonte" : "Nova fonte"}
      </h4>

      <div style={{ display: "grid", gap: "0.75rem" }}>
        <Field label="Tipo de fonte" required>
          <select
            value={draft.source_type}
            onChange={(e) => patch("source_type", e.target.value as SourceType)}
            style={inputStyle}
          >
            {Object.entries(SOURCE_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Título" required>
          <input
            type="text"
            value={draft.title}
            onChange={(e) => patch("title", e.target.value)}
            style={inputStyle}
            placeholder="Ex.: Assessing pain in critically ill sedated patients"
            required
          />
        </Field>

        <Field label={isLegal ? "Emissor / Veículo de publicação (ex.: Diário Oficial da União)" : "Autoridade / Periódico / Editora"}>
          <input
            type="text"
            value={draft.authority}
            onChange={(e) => patch("authority", e.target.value)}
            style={inputStyle}
            placeholder={isLegal ? "Diário Oficial da União" : isTextbook ? "Editora Atheneu" : "Critical Care Medicine"}
          />
        </Field>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>Autores (sobrenome primeiro, ABNT)</label>
            <button type="button" onClick={addAuthor} className="ce-btn ce-btn-ghost" style={{ padding: "0.2rem 0.5rem", fontSize: "0.8rem" }}>
              + Autor
            </button>
          </div>
          {draft.authors.map((a, i) => (
            <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.4rem" }}>
              <input
                type="text"
                value={a.surname}
                onChange={(e) => patchAuthor(i, "surname", e.target.value)}
                style={{ ...inputStyle, flex: "1 1 30%" }}
                placeholder="Sobrenome (ex.: Silva)"
              />
              <input
                type="text"
                value={a.givenName}
                onChange={(e) => patchAuthor(i, "givenName", e.target.value)}
                style={{ ...inputStyle, flex: "1 1 50%" }}
                placeholder="Nome (ex.: Maria Aparecida da)"
              />
              {draft.authors.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeAuthor(i)}
                  className="ce-btn ce-btn-ghost ce-btn-icon"
                  aria-label="Remover autor"
                >
                  <TrashIcon size={14} />
                </button>
              )}
            </div>
          ))}
          <small style={{ color: "var(--muted, #666)" }}>
            Para 3+ autores, apenas o primeiro aparece; os demais entram como "et al." na citação.
          </small>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.75rem" }}>
          <Field label="Local (cidade)">
            <input
              type="text"
              value={draft.place}
              onChange={(e) => patch("place", e.target.value)}
              style={inputStyle}
              placeholder="Rio de Janeiro"
            />
          </Field>
          <Field label="Ano">
            <input
              type="text"
              value={draft.year}
              onChange={(e) => patch("year", e.target.value)}
              style={inputStyle}
              placeholder="2024"
            />
          </Field>
          {(isTextbook || isStandard) && (
            <Field label="Edição / Versão">
              <input
                type="text"
                value={draft.edition || ""}
                onChange={(e) => patch("edition", e.target.value)}
                style={inputStyle}
                placeholder="3. ed."
              />
            </Field>
          )}
          {isTextbook && (
            <Field label="Editora">
              <input
                type="text"
                value={draft.publisher || ""}
                onChange={(e) => patch("publisher", e.target.value)}
                style={inputStyle}
                placeholder="Atheneu"
              />
            </Field>
          )}
        </div>

        <Field label="URL / DOI">
          <input
            type="url"
            value={draft.locator.uri}
            onChange={(e) => patch("locator", { ...draft.locator, uri: e.target.value })}
            style={inputStyle}
            placeholder="https://doi.org/10.1097/01.CCM.00000..."
          />
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.75rem" }}>
          <Field label="Direitos">
            <select
              value={draft.rights}
              onChange={(e) => patch("rights", e.target.value as Source["rights"])}
              style={inputStyle}
            >
              {Object.entries(RIGHTS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Jurisdição">
            <input
              type="text"
              value={draft.jurisdiction}
              onChange={(e) => patch("jurisdiction", e.target.value)}
              style={inputStyle}
              placeholder="BR / US / International"
            />
          </Field>
          <Field label="Idioma">
            <input
              type="text"
              value={draft.language}
              onChange={(e) => patch("language", e.target.value)}
              style={inputStyle}
              placeholder="pt-BR / en / es"
            />
          </Field>
        </div>

        {(isLegal || draft.source_type === "GUIDELINE") && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <Field label="Vigência a partir de">
              <input
                type="date"
                value={draft.effectiveFrom || ""}
                onChange={(e) => patch("effectiveFrom", e.target.value)}
                style={inputStyle}
              />
            </Field>
            <Field label="Vigência até (se revogada)">
              <input
                type="date"
                value={draft.effectiveUntil || ""}
                onChange={(e) => patch("effectiveUntil", e.target.value)}
                style={inputStyle}
              />
            </Field>
          </div>
        )}

        <Field label="DOI (identificador persistente)">
          <input
            type="text"
            value={draft.doi || ""}
            onChange={(e) => patch("doi", e.target.value)}
            style={inputStyle}
            placeholder="10.1097/01.CCM.00000..."
          />
        </Field>

        <Field label="Tags (separadas por Enter ou vírgula)">
          <div style={{ display: "flex", gap: "0.4rem" }}>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addTag();
                }
              }}
              style={inputStyle}
              placeholder="dor, uti, ventilação mecânica"
            />
            <button type="button" onClick={addTag} className="ce-btn ce-btn-ghost">
              +
            </button>
          </div>
          {draft.tags.length > 0 && (
            <div style={{ marginTop: "0.4rem", display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
              {draft.tags.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => removeTag(t)}
                  style={{
                    border: "1px solid var(--border, #ccc)",
                    background: "var(--accent-soft, #e8f0fe)",
                    color: "var(--accent, #0a66c2)",
                    borderRadius: "0.3rem",
                    padding: "0.1rem 0.5rem",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                  }}
                >
                  #{t} ×
                </button>
              ))}
            </div>
          )}
        </Field>

        <Field label="Notas (para você lembrar desta fonte)">
          <textarea
            value={draft.notes || ""}
            onChange={(e) => patch("notes", e.target.value)}
            style={{ ...inputStyle, minHeight: "4rem", resize: "vertical" }}
            placeholder="Ex.: Estudo fundamental que validou a BPS. Coorte de 30 UTIs francesas."
          />
        </Field>

        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "0.5rem" }}>
          <button type="button" onClick={onCancel} className="ce-btn ce-btn-ghost">
            Cancelar
          </button>
          <button type="submit" className="ce-btn ce-btn-primary">
            Salvar fonte
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

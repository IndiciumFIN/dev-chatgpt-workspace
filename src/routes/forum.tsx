import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/site/shell";
import { PageHero } from "@/components/site/page-hero";
import { PlusIcon, SearchIcon, TrashIcon, EditIcon, ChevronLeftIcon, ChevronRightIcon, ThumbsUpIcon, EyeIcon, MessageCircleIcon, PinIcon, DownloadIcon, UploadIcon } from "lucide-react";
import {
  useForumThreads, exportAll, importAll, generateReplyId,
} from "@/lib/editorial/forum.store";
import {
  AUTHOR_ROLE_LABELS, FORUM_CATEGORY_LABELS, VISIBILITY_LABELS,
  createEmptyThread, generateId,
  type ForumCategory, type AuthorRole, type Visibility, type ForumThread, type ForumReply,
} from "@/lib/editorial/forum-types";

export const Route = createFileRoute("/forum")({
  component: ForumPage,
  head: () => ({
    meta: [
      { title: "Fórum de Enfermagem · Calculadoras de Enfermagem" },
      {
        name: "description",
        content:
          "Fórum local de discussão para profissionais de enfermagem. Tópicos e respostas ficam salvos no seu navegador (localStorage) — exporte/importe em JSON.",
      },
    ],
  }),
});

function ForumPage() {
  const { items, upsert, remove, addReply, incrementViews, likeThread, likeReply } = useForumThreads();
  const [query, setQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<ForumCategory | "ALL">("ALL");
  const [editing, setEditing] = useState<ForumThread | null>(null);
  const [viewing, setViewing] = useState<ForumThread | null>(null);
  // Identidade do usuário local (não é login — fica no localStorage)
  const [userId] = useState(() => localStorage.getItem("ce-forum/user-id") || (() => {
    const id = `local-${generateId("USER")}`;
    localStorage.setItem("ce-forum/user-id", id);
    return id;
  })());
  const [userName, setUserName] = useState(() => localStorage.getItem("ce-forum/user-name") || "");
  const [userRole, setUserRole] = useState<AuthorRole>(() => (localStorage.getItem("ce-forum/user-role") as AuthorRole) || "NURSE");

  useEffect(() => {
    localStorage.setItem("ce-forum/user-name", userName);
    localStorage.setItem("ce-forum/user-role", userRole);
  }, [userName, userRole]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = items.filter((t) => {
      if (filterCategory !== "ALL" && t.category !== filterCategory) return false;
      if (t.moderation_status !== "APPROVED") return false;
      if (!q) return true;
      return t.title.toLowerCase().includes(q) || t.body_text.toLowerCase().includes(q) || (t.tags || []).some((tg) => tg.toLowerCase().includes(q));
    });
    // Pinned primeiro, depois por updated_at
    return list.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return (b.updated_at || "").localeCompare(a.updated_at || "");
    });
  }, [items, query, filterCategory]);

  function handleExport() {
    const backup = exportAll();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `forum-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const backup = JSON.parse(String(reader.result));
        const n = importAll(backup);
        alert(`${n} tópicos importados.`);
      } catch (e) {
        alert(`Falha: ${e instanceof Error ? e.message : String(e)}`);
      }
    };
    reader.readAsText(file);
    ev.target.value = "";
  }

  if (viewing) {
    return <ThreadView thread={viewing} userId={userId} userName={userName} userRole={userRole} onBack={() => setViewing(null)} onReply={(r) => { addReply(viewing.canonical_id, r); const updated = { ...viewing, replies: [...viewing.replies, r] }; setViewing(updated); }} onLikeThread={() => { likeThread(viewing.canonical_id); }} onLikeReply={(rid) => { likeReply(viewing.canonical_id, rid); }} />;
  }

  return (
    <Shell>
      <main id="conteudo" className="page-wide">
        <PageHero
          eyebrow="Comunidade · Discussão local"
          title="Fórum de Enfermagem"
          lead="Espaço de discussão para profissionais, estudantes e docentes. Tópicos e respostas ficam salvos localmente no seu navegador. Use exportar/importar para sincronizar entre dispositivos."
        />

        <section style={{ marginTop: "1.5rem" }}>
          {/* Identidade do usuário */}
          <div style={{ border: "1px solid var(--border, #e0e0e0)", borderRadius: "0.4rem", padding: "0.75rem 1rem", marginBottom: "1rem", background: "var(--surface, #fff)", display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ flex: "1 1 200px" }}>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--muted, #666)", marginBottom: "0.2rem" }}>Seu nome (visível nas postagens)</label>
              <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Ex.: Maria Silva" style={{ width: "100%", padding: "0.4rem 0.5rem", border: "1px solid var(--border, #ccc)", borderRadius: "0.3rem", fontSize: "0.9rem" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--muted, #666)", marginBottom: "0.2rem" }}>Sua função</label>
              <select value={userRole} onChange={(e) => setUserRole(e.target.value as AuthorRole)} style={{ padding: "0.4rem 0.5rem", border: "1px solid var(--border, #ccc)", borderRadius: "0.3rem", fontSize: "0.9rem" }}>
                {Object.entries(AUTHOR_ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--muted, #888)", padding: "0 0.5rem" }}>
              ID: <code>{userId.slice(0, 12)}…</code>
            </div>
          </div>

          {/* Barra */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", gap: "0.5rem", flexWrap: "wrap" }}>
            <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Tópicos — {filtered.length}</h3>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <button onClick={() => setEditing(createEmptyThread(userId, userName, userRole))} className="ce-btn ce-btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }} disabled={!userName.trim()}>
                <PlusIcon size={14} /> Novo tópico
              </button>
              <button onClick={handleExport} className="ce-btn ce-btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                <DownloadIcon size={14} /> Exportar
              </button>
              <label className="ce-btn ce-btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", cursor: "pointer" }}>
                <UploadIcon size={14} /> Importar
                <input type="file" accept="application/json" onChange={handleImport} hidden />
              </label>
            </div>
          </div>

          {/* Filtros */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: "1 1 280px" }}>
              <SearchIcon size={16} style={{ position: "absolute", left: "0.6rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted, #888)" }} />
              <input type="search" placeholder="Buscar tópicos..." value={query} onChange={(e) => setQuery(e.target.value)} style={{ width: "100%", padding: "0.5rem 0.5rem 0.5rem 2rem", border: "1px solid var(--border, #ccc)", borderRadius: "0.3rem", fontSize: "0.95rem" }} />
            </div>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value as ForumCategory | "ALL")} style={{ padding: "0.5rem", border: "1px solid var(--border, #ccc)", borderRadius: "0.3rem" }}>
              <option value="ALL">Todas as categorias</option>
              {Object.entries(FORUM_CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>

          {editing && (
            <ThreadForm
              thread={editing}
              onSave={(t) => { upsert(t); setEditing(null); }}
              onCancel={() => setEditing(null)}
            />
          )}

          {/* Lista de tópicos */}
          {filtered.length === 0 && !editing ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--muted, #666)", border: "1px dashed var(--border, #ccc)", borderRadius: "0.4rem" }}>
              Nenhum tópico. Clique em "Novo tópico" para iniciar uma discussão.
            </div>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.5rem" }}>
              {filtered.map((t) => {
                const isAuthor = t.author_id === userId;
                return (
                  <li key={t.canonical_id} style={{ border: "1px solid var(--border, #e0e0e0)", borderLeft: t.pinned ? "3px solid var(--warn, #c47b00)" : "3px solid transparent", borderRadius: "0.4rem", background: "var(--surface, #fff)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", padding: "0.75rem 1rem" }}>
                      <button onClick={() => { setViewing(t); incrementViews(t.canonical_id); }} style={{ flex: 1, textAlign: "left", background: "transparent", border: "none", cursor: "pointer", minWidth: 0 }}>
                        <div style={{ fontSize: "0.7rem", color: "var(--muted, #888)", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", gap: "0.5rem", alignItems: "center" }}>
                          {t.pinned && <PinIcon size={11} style={{ color: "var(--warn, #c47b00)" }} />}
                          {FORUM_CATEGORY_LABELS[t.category]}
                          {t.closed && <span style={{ color: "var(--danger, #c0392b)" }}>· fechado</span>}
                        </div>
                        <div style={{ fontWeight: 600, marginTop: "0.15rem" }}>{t.title}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--muted, #666)", marginTop: "0.2rem" }}>
                          por <strong>{t.author_display_name || t.author_id}</strong> {t.author_role && `· ${AUTHOR_ROLE_LABELS[t.author_role]}`} · {new Date(t.updated_at).toLocaleDateString("pt-BR")}
                        </div>
                        <div style={{ marginTop: "0.4rem", display: "flex", gap: "0.75rem", fontSize: "0.75rem", color: "var(--muted, #888)" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.2rem" }}><MessageCircleIcon size={12} /> {t.replies.length}</span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.2rem" }}><ThumbsUpIcon size={12} /> {t.likes_count || 0}</span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.2rem" }}><EyeIcon size={12} /> {t.views_count || 0}</span>
                        </div>
                      </button>
                      {isAuthor && (
                        <div style={{ display: "flex", gap: "0.25rem", flexShrink: 0 }}>
                          <button onClick={() => setEditing(t)} className="ce-btn ce-btn-ghost ce-btn-icon" title="Editar"><EditIcon size={14} /></button>
                          <button onClick={() => { if (confirm("Excluir tópico?")) remove(t.canonical_id); }} className="ce-btn ce-btn-ghost ce-btn-icon" style={{ color: "var(--danger, #c0392b)" }} title="Excluir"><TrashIcon size={14} /></button>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <div style={{ marginTop: "2rem", padding: "0.75rem 1rem", background: "var(--accent-soft, #f5f8fc)", borderRadius: "0.4rem", fontSize: "0.85rem", color: "var(--muted, #555)" }}>
            <strong>Como funciona:</strong> O fórum é 100% client-side. Tópicos e respostas ficam no seu navegador (localStorage). Não há backend nem moderação centralizada — use com responsabilidade e respeite o sigilo profissional. Para casos clínicos, <strong>nunca</strong> identifique pacientes. Use a visibilidade 'Profissionais only' para tópicos sensíveis.
          </div>
        </section>
      </main>
    </Shell>
  );
}

// ============================================================
// Form de thread
// ============================================================

function ThreadForm({ thread, onSave, onCancel }: { thread: ForumThread; onSave: (t: ForumThread) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState<ForumThread>(thread);
  const [tagInput, setTagInput] = useState("");

  function patch<K extends keyof ForumThread>(k: K, v: ForumThread[K]) { setDraft((d) => ({ ...d, [k]: v })); }
  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (!t || (draft.tags || []).includes(t)) return;
    patch("tags", [...(draft.tags || []), t]);
    setTagInput("");
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({ ...draft, updated_at: new Date().toISOString().slice(0, 10) }); }} style={{ border: "1px solid var(--border, #ccc)", borderRadius: "0.4rem", padding: "1rem", marginBottom: "1rem", background: "var(--surface, #fafafa)" }}>
      <h4 style={{ marginTop: 0 }}>{thread.title ? "Editar tópico" : "Novo tópico"}</h4>
      <div style={{ display: "grid", gap: "0.75rem" }}>
        <Field label="Título" required>
          <input type="text" value={draft.title} onChange={(e) => patch("title", e.target.value)} style={inputStyle} placeholder="Ex.: Como vocês aplicam a escala de Braden na sua unidade?" required minLength={5} maxLength={200} />
        </Field>
        <Field label="Categoria" required>
          <select value={draft.category} onChange={(e) => patch("category", e.target.value as ForumCategory)} style={inputStyle}>
            {Object.entries(FORUM_CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Field>
        <Field label="Mensagem" required>
          <textarea value={draft.body_text} onChange={(e) => patch("body_text", e.target.value)} style={{ ...inputStyle, minHeight: "5rem", resize: "vertical" }} placeholder="Descreva o tópico. Para casos clínicos, não identifique pacientes." required minLength={10} />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
          <Field label="Visibilidade">
            <select value={draft.visibility} onChange={(e) => patch("visibility", e.target.value as Visibility)} style={inputStyle}>
              {Object.entries(VISIBILITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </Field>
          <Field label="Fixar no topo?">
            <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 0", fontSize: "0.9rem" }}>
              <input type="checkbox" checked={draft.pinned || false} onChange={(e) => patch("pinned", e.target.checked)} /> Tópico fixado
            </label>
          </Field>
        </div>
        <Field label="Tags (Enter para adicionar)">
          <div style={{ display: "flex", gap: "0.4rem" }}>
            <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} style={inputStyle} placeholder="Ex.: braden, uti, lesao-por-pressao" />
            <button type="button" onClick={addTag} className="ce-btn ce-btn-ghost">+</button>
          </div>
          {(draft.tags || []).length > 0 && (
            <div style={{ marginTop: "0.4rem", display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
              {(draft.tags || []).map((t) => (
                <button key={t} type="button" onClick={() => patch("tags", (draft.tags || []).filter((x) => x !== t))} style={{ border: "1px solid var(--border, #ccc)", background: "var(--accent-soft, #e8f0fe)", color: "var(--accent, #0a66c2)", borderRadius: "0.3rem", padding: "0.1rem 0.5rem", fontSize: "0.75rem", cursor: "pointer" }}>#{t} ×</button>
              ))}
            </div>
          )}
        </Field>
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
          <button type="button" onClick={onCancel} className="ce-btn ce-btn-ghost">Cancelar</button>
          <button type="submit" className="ce-btn ce-btn-primary">Salvar tópico</button>
        </div>
      </div>
    </form>
  );
}

// ============================================================
// Visualização de thread + respostas
// ============================================================

function ThreadView({ thread, userId, userName, userRole, onBack, onReply, onLikeThread, onLikeReply }: {
  thread: ForumThread;
  userId: string;
  userName: string;
  userRole: AuthorRole;
  onBack: () => void;
  onReply: (r: ForumReply) => void;
  onLikeThread: () => void;
  onLikeReply: (replyId: string) => void;
}) {
  const [replyText, setReplyText] = useState("");

  function submitReply() {
    if (!replyText.trim()) return;
    const r: ForumReply = {
      id: generateReplyId(),
      author_id: userId,
      author_display_name: userName || "Anônimo",
      author_role: userRole,
      body_text: replyText.trim(),
      posted_at: new Date().toISOString(),
      moderation_status: "APPROVED",
      likes_count: 0,
    };
    onReply(r);
    setReplyText("");
  }

  return (
    <div>
      <button onClick={onBack} className="ce-btn ce-btn-ghost" style={{ marginBottom: "1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
        <ChevronLeftIcon size={14} /> Voltar à lista
      </button>

      <div style={{ border: "1px solid var(--border, #e0e0e0)", borderRadius: "0.4rem", padding: "1.25rem", background: "var(--surface, #fff)", marginBottom: "1rem" }}>
        <div style={{ fontSize: "0.7rem", color: "var(--muted, #888)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {FORUM_CATEGORY_LABELS[thread.category]} · {VISIBILITY_LABELS[thread.visibility]}
        </div>
        <h2 style={{ marginTop: "0.25rem", marginBottom: "0.5rem" }}>{thread.title}</h2>
        <div style={{ fontSize: "0.85rem", color: "var(--muted, #666)", marginBottom: "0.75rem" }}>
          por <strong>{thread.author_display_name || thread.author_id}</strong> {thread.author_role && `· ${AUTHOR_ROLE_LABELS[thread.author_role]}`} · {new Date(thread.updated_at).toLocaleString("pt-BR")}
        </div>
        <div style={{ fontSize: "0.95rem", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{thread.body_text}</div>
        {thread.tags && thread.tags.length > 0 && (
          <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
            {thread.tags.map((t) => <span key={t} style={{ fontSize: "0.7rem", padding: "0.1rem 0.4rem", background: "var(--accent-soft, #e8f0fe)", color: "var(--accent, #0a66c2)", borderRadius: "0.2rem" }}>#{t}</span>)}
          </div>
        )}
        <div style={{ marginTop: "0.75rem", display: "flex", gap: "1rem", fontSize: "0.85rem", color: "var(--muted, #666)" }}>
          <button onClick={onLikeThread} className="ce-btn ce-btn-ghost" style={{ padding: "0.2rem 0.5rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
            <ThumbsUpIcon size={14} /> {thread.likes_count || 0}
          </button>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.2rem 0" }}>
            <EyeIcon size={14} /> {thread.views_count || 0} visualizações
          </span>
        </div>
      </div>

      {/* Respostas */}
      <h3 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>{thread.replies.length} resposta(s)</h3>
      {thread.replies.length === 0 ? (
        <div style={{ padding: "1rem", textAlign: "center", color: "var(--muted, #888)", border: "1px dashed var(--border, #ccc)", borderRadius: "0.4rem", marginBottom: "1rem" }}>
          Seja o primeiro a responder.
        </div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1rem 0", display: "grid", gap: "0.5rem" }}>
          {thread.replies.map((r) => (
            <li key={r.id} style={{ border: "1px solid var(--border, #e0e0e0)", borderRadius: "0.4rem", padding: "0.75rem 1rem", background: "var(--surface, #fff)" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--muted, #666)", marginBottom: "0.4rem" }}>
                <strong>{r.author_display_name || r.author_id}</strong> {r.author_role && `· ${AUTHOR_ROLE_LABELS[r.author_role]}`} · {new Date(r.posted_at).toLocaleString("pt-BR")}
              </div>
              <div style={{ fontSize: "0.92rem", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{r.body_text}</div>
              <button onClick={() => onLikeReply(r.id)} className="ce-btn ce-btn-ghost" style={{ marginTop: "0.4rem", padding: "0.15rem 0.4rem", fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                <ThumbsUpIcon size={12} /> {r.likes_count || 0}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Form de resposta */}
      {!thread.closed && (
        <div style={{ border: "1px solid var(--border, #e0e0e0)", borderRadius: "0.4rem", padding: "0.75rem 1rem", background: "var(--surface, #fafafa)" }}>
          <div style={{ fontSize: "0.85rem", marginBottom: "0.4rem", color: "var(--muted, #666)" }}>
            Respondendo como <strong>{userName || "Anônimo"}</strong> · {AUTHOR_ROLE_LABELS[userRole]}
          </div>
          <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Escreva sua resposta..." style={{ ...inputStyle, minHeight: "4rem", resize: "vertical" }} disabled={!userName.trim()} />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
            <button onClick={submitReply} className="ce-btn ce-btn-primary" disabled={!replyText.trim() || !userName.trim()}>Enviar resposta</button>
          </div>
          {!userName.trim() && <small style={{ color: "var(--warn, #c47b00)" }}>Defina seu nome no topo da página para responder.</small>}
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = { width: "100%", padding: "0.5rem 0.6rem", border: "1px solid var(--border, #ccc)", borderRadius: "0.3rem", fontSize: "0.95rem", background: "var(--surface, #fff)" };

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

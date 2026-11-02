import { Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { communityBoard, hidePost, planQueue, publishPost, decidePlan, type CommunityPost, type PlanStatus } from "@/lib/community.functions";

export function CommunityBoard({ moderate = false }: { moderate?: boolean }) {
  const [locked, setLocked] = useState(false);
  const [posts, setPosts] = useState<CommunityPost[] | null>(null);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  function reload() {
    return communityBoard()
      .then((board) => {
        setLocked(board.locked);
        setPosts(board.posts);
      })
      .catch((err: Error) => setError(err.message));
  }

  useEffect(() => {
    void reload();
  }, []);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    publishPost({ data: { body } })
      .then(() => {
        setBody("");
        return reload();
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setPending(false));
  }

  return (
    <section className="tool-block" id="comunidade">
      <h2>Comunidade</h2>
      <p className="tool-help">Recados sobre o estudo. Não escreva nome, idade ou leito de paciente.</p>
      {error ? <p className="err">{error}</p> : null}
      {posts === null ? <p className="tool-help">Abrindo o quadro…</p> : null}
      {locked ? (
        <p>
          O quadro abre quando a assinatura está ativa. O pedido fica em <Link to="/secao/$slug" params={{ slug: "assinatura" }}>Assine já</Link>.
        </p>
      ) : null}
      {!locked && posts ? (
        <>
          <form className="paper admin-card" onSubmit={onSubmit}>
            <label className="field">
              <span>Recado</span>
              <textarea value={body} onChange={(event) => setBody(event.target.value)} minLength={8} maxLength={500} required rows={3} />
            </label>
            <button className="btn-navy btn-sm" type="submit" disabled={pending}>
              {pending ? "Publicando…" : "Publicar"}
            </button>
          </form>
          <ul className="admin-list">
            {posts.map((post) => (
              <li key={post.id} className="paper admin-card">
                <p>
                  <b>{post.author}</b>
                </p>
                <p>{post.body}</p>
                {post.hidden ? <p className="tool-help">Oculto para o assinante</p> : null}
                {moderate ? (
                  <button
                    className="btn-ghost btn-sm"
                    type="button"
                    onClick={() => {
                      hidePost({ data: { id: post.id, hidden: !post.hidden } })
                        .then(() => reload())
                        .catch((err: Error) => setError(err.message));
                    }}
                  >
                    {post.hidden ? "Mostrar de novo" : "Ocultar"}
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
          {posts.length === 0 ? <p className="tool-help">Nenhum recado ainda.</p> : null}
        </>
      ) : null}
    </section>
  );
}

type QueueItem = { userId: string; status: PlanStatus; name: string; email: string };

export function PlanQueue() {
  const [rows, setRows] = useState<QueueItem[] | null>(null);
  const [error, setError] = useState("");

  function reload() {
    return planQueue()
      .then(setRows)
      .catch((err: Error) => setError(err.message));
  }

  useEffect(() => {
    void reload();
  }, []);

  return (
    <section className="tool-block" id="pedidos">
      <h2>Pedidos de assinatura</h2>
      <p className="tool-help">Ativar abre a comunidade. Não cobra e não mexe nas calculadoras públicas.</p>
      {error ? <p className="err">{error}</p> : null}
      {rows === null ? <p className="tool-help">Lendo pedidos…</p> : null}
      <ul className="admin-list">
        {(rows ?? []).map((row) => (
          <li key={row.userId} className="paper admin-card">
            <p>
              <b>{row.name}</b>
            </p>
            <p className="tool-help">
              {row.email || row.userId} · {row.status}
            </p>
            <div className="login-providers">
              <button className="btn-navy btn-sm" type="button" onClick={() => decidePlan({ data: { userId: row.userId, status: "ativo" } }).then(() => reload())}>
                Ativar
              </button>
              <button className="btn-ghost btn-sm" type="button" onClick={() => decidePlan({ data: { userId: row.userId, status: "recusado" } }).then(() => reload())}>
                Recusar
              </button>
            </div>
          </li>
        ))}
      </ul>
      {rows && rows.length === 0 ? <p className="tool-help">Nenhum pedido.</p> : null}
    </section>
  );
}

import { Link } from "@tanstack/react-router";

export type RelatedItem = {
  title: string;
  text?: string;
  to: "/secao/$slug" | "/ferramentas/$slug" | "/assinante/ferramentas/$slug" | "/blog/$slug" | "/blog/mary-eliza-mahoney" | "/modelos" | "/modelos/$id";
  params?: { slug?: string; id?: string };
  hash?: string;
};

export function RelatedContent({ title = "Conteúdo relacionado", items }: { title?: string; items: RelatedItem[] }) {
  if (items.length === 0) return null;
  return (
    <section className="inst-sec no-print">
      <h2>{title}</h2>
      <ul className="related-grid">
        {items.map((item) => (
          <li key={`${item.to}-${item.title}`}>
            {item.to === "/modelos/$id" ? (
              <Link className="nav-card" to="/modelos/$id" params={{ id: item.params?.id ?? "" }}>
                <h3>{item.title}</h3>
                {item.text ? <p>{item.text}</p> : null}
              </Link>
            ) : item.to === "/blog/$slug" ? (
              <Link className="nav-card" to="/blog/$slug" params={{ slug: item.params?.slug ?? "" }}>
                <h3>{item.title}</h3>
                {item.text ? <p>{item.text}</p> : null}
              </Link>
            ) : item.to === "/secao/$slug" || item.to === "/ferramentas/$slug" || item.to === "/assinante/ferramentas/$slug" ? (
              <Link className="nav-card" to={item.to} params={{ slug: item.params?.slug ?? "" }} hash={item.hash}>
                <h3>{item.title}</h3>
                {item.text ? <p>{item.text}</p> : null}
              </Link>
            ) : (
              <Link className="nav-card" to={item.to}>
                <h3>{item.title}</h3>
                {item.text ? <p>{item.text}</p> : null}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

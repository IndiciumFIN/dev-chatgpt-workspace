export function PageToc({ title = "Nesta página", items }: { title?: string; items: { id: string; label: string }[] }) {
  return (
    <details className="inst-toc" open>
      <summary>{title}</summary>
      <ol>
        {items.map((item) => (
          <li key={item.id}><a href={`#${item.id}`}>{item.label}</a></li>
        ))}
      </ol>
    </details>
  );
}

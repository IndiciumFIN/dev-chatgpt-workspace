import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/site/shell";
import { PageHero } from "@/components/site/page-hero";
import { SearchIcon, BookIcon, ChevronDownIcon, ChevronRightIcon, FilterIcon } from "lucide-react";
import { FUN_FACTS_SEED, FUN_FACTS_TOTAL } from "@/lib/editorial/fun-facts.seed";
import {
  FACT_TYPE_LABELS,
  FACT_CATEGORY_LABELS,
  RIGHTS_LABELS,
  type FactType,
  type FactCategory,
} from "@/lib/editorial/types";

export const Route = createFileRoute("/curiosidades")({
  component: CuriosidadesPage,
  head: () => ({
    meta: [
      { title: "Curiosidades de Enfermagem · Calculadoras de Enfermagem" },
      {
        name: "description",
        content:
          "Curiosidades, fatos históricos e biografias da enfermagem. Conheça Florence Nightingale, Anna Nery, Mary Mahoney e a história da profissão.",
      },
    ],
  }),
});

function CuriosidadesPage() {
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<FactType | "ALL">("ALL");
  const [filterCategory, setFilterCategory] = useState<FactCategory | "ALL">("ALL");
  const [onlyReleased, setOnlyReleased] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FUN_FACTS_SEED.filter((f) => {
      if (onlyReleased && f.status !== "RELEASED") return false;
      if (filterType !== "ALL" && f.fact_type !== filterType) return false;
      if (filterCategory !== "ALL" && f.category !== filterCategory) return false;
      if (!q) return true;
      return (
        f.title.toLowerCase().includes(q) ||
        f.body_text.toLowerCase().includes(q) ||
        f.person_ref?.toLowerCase().includes(q) ||
        (f.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [query, filterType, filterCategory, onlyReleased]);

  const releasedCount = FUN_FACTS_SEED.filter((f) => f.status === "RELEASED").length;

  return (
    <Shell>
      <main id="conteudo" className="page-wide">
        <PageHero
          eyebrow="Editorial · Curiosidades"
          title="Curiosidades de Enfermagem"
          lead={`${releasedCount} fatos curados e publicados sobre a história, pioneiras, profissão e cultura da enfermagem. ${FUN_FACTS_TOTAL - releasedCount} slots adicionais aguardam curadoria.`}
        />

        <section style={{ marginTop: "1.5rem" }}>
          {/* Barra de busca + filtros */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: "1 1 280px" }}>
              <SearchIcon size={16} style={{ position: "absolute", left: "0.6rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted, #888)" }} />
              <input
                type="search"
                placeholder="Buscar curiosidade..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ width: "100%", padding: "0.5rem 0.5rem 0.5rem 2rem", border: "1px solid var(--border, #ccc)", borderRadius: "0.3rem", fontSize: "0.95rem" }}
              />
            </div>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value as FactType | "ALL")} style={{ padding: "0.5rem", border: "1px solid var(--border, #ccc)", borderRadius: "0.3rem" }}>
              <option value="ALL">Todos os tipos</option>
              {Object.entries(FACT_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value as FactCategory | "ALL")} style={{ padding: "0.5rem", border: "1px solid var(--border, #ccc)", borderRadius: "0.3rem" }}>
              <option value="ALL">Todas as categorias</option>
              {Object.entries(FACT_CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <label style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.85rem", padding: "0 0.5rem", cursor: "pointer" }}>
              <input type="checkbox" checked={onlyReleased} onChange={(e) => setOnlyReleased(e.target.checked)} /> Só publicados
            </label>
          </div>

          <div style={{ fontSize: "0.85rem", color: "var(--muted, #666)", marginBottom: "0.75rem" }}>
            Mostrando <strong>{filtered.length}</strong> de {releasedCount} curiosidades publicadas.
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--muted, #666)", border: "1px dashed var(--border, #ccc)", borderRadius: "0.4rem" }}>
              Nenhuma curiosidade corresponde à busca.
            </div>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.5rem" }}>
              {filtered.map((fact) => {
                const isExpanded = expanded === fact.canonical_id;
                return (
                  <li key={fact.canonical_id} style={{ border: "1px solid var(--border, #e0e0e0)", borderRadius: "0.4rem", background: "var(--surface, #fff)" }}>
                    <button
                      onClick={() => setExpanded(isExpanded ? null : fact.canonical_id)}
                      style={{ width: "100%", textAlign: "left", padding: "0.75rem 1rem", background: "transparent", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.7rem", color: "var(--muted, #888)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          {FACT_TYPE_LABELS[fact.fact_type]} · {FACT_CATEGORY_LABELS[fact.category]}
                          {fact.year_ref && ` · ${fact.year_ref}`}
                          {fact.person_ref && ` · ${fact.person_ref}`}
                        </div>
                        <div style={{ fontWeight: 600, marginTop: "0.15rem" }}>{fact.title}</div>
                      </div>
                      {isExpanded ? <ChevronDownIcon size={16} /> : <ChevronRightIcon size={16} />}
                    </button>
                    {isExpanded && (
                      <div style={{ padding: "0 1rem 0.75rem", borderTop: "1px solid var(--border, #f0f0f0)" }}>
                        <p style={{ fontSize: "0.92rem", lineHeight: 1.6, margin: "0.75rem 0 0.5rem", color: "var(--muted, #333)" }}>{fact.body_text}</p>
                        {fact.tags && fact.tags.length > 0 && (
                          <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                            {fact.tags.map((t) => (
                              <span key={t} style={{ fontSize: "0.7rem", padding: "0.1rem 0.4rem", background: "var(--accent-soft, #e8f0fe)", color: "var(--accent, #0a66c2)", borderRadius: "0.2rem" }}>#{t}</span>
                            ))}
                          </div>
                        )}
                        <div style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--muted, #888)", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                          <span>Status: <code>{fact.status}</code></span>
                          <span>Direitos: {RIGHTS_LABELS[fact.rights_status]}</span>
                          {fact.estimated_reading_seconds && <span>≈ {Math.ceil(fact.estimated_reading_seconds / 60)} min de leitura</span>}
                          <span>Fonte: {fact.source_id}</span>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <div style={{ marginTop: "2rem", padding: "0.75rem 1rem", background: "var(--accent-soft, #f5f8fc)", borderRadius: "0.4rem", fontSize: "0.85rem", color: "var(--muted, #555)" }}>
            <strong>Curadoria:</strong> Para um fato passar de <code>CANDIDATE</code> para <code>RELEASED</code>, é preciso preencher <code>source_id</code> com uma fonte canônica confiável (COFEN, ABEn, OMS, lei vigente). Os slots reservados aguardam curadoria humana — entrarão no índice público somente após qualificação.
          </div>
        </section>
      </main>
    </Shell>
  );
}

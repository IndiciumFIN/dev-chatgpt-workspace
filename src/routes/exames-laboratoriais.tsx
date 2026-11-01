import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/site/shell";
import { PageHero } from "@/components/site/page-hero";
import { SearchIcon, AlertTriangleIcon, CheckCircleIcon, ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import { examesData, type Exame } from "@/lib/tools/exames-laboratoriais.data";

export const Route = createFileRoute("/exames-laboratoriais")({
  component: ExamesPage,
  head: () => ({
    meta: [
      { title: "Exames Laboratoriais · Calculadoras de Enfermagem" },
      {
        name: "description",
        content:
          "Catálogo de 149 exames laboratoriais com faixas de referência por sexo. Interpretador automático de valores inseridos.",
      },
    ],
  }),
});

function ExamesPage() {
  const [query, setQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [expandedExame, setExpandedExame] = useState<string | null>(null);
  // Estado dos valores digitados: exameId -> { sexo, valor }
  const [values, setValues] = useState<Record<string, { sexo: "H" | "M"; valor: string }>>({});

  const categorias = useMemo(() => {
    return Array.from(new Set(examesData.map((e) => e.categoria))).sort();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return examesData.filter((e) => {
      if (filterCategory !== "ALL" && e.categoria !== filterCategory) return false;
      if (!q) return true;
      return (
        e.nome.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q) ||
        e.categoria.toLowerCase().includes(q) ||
        e.descricao.toLowerCase().includes(q)
      );
    });
  }, [query, filterCategory]);

  // Agrupa por categoria
  const grouped = useMemo(() => {
    const map = new Map<string, Exame[]>();
    filtered.forEach((e) => {
      const list = map.get(e.categoria) || [];
      list.push(e);
      map.set(e.categoria, list);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  function setValue(exameId: string, field: "sexo" | "valor", value: string) {
    setValues((v) => ({
      ...v,
      [exameId]: { sexo: field === "sexo" ? (value as "H" | "M") : (v[exameId]?.sexo || "H"), valor: field === "valor" ? value : (v[exameId]?.valor || "") },
    }));
  }

  function interpretar(exame: Exame, valor: number, sexo: "H" | "M"): "BAIXO" | "NORMAL" | "ALTO" | "INDEFINIDO" {
    const ref = exame.ref;
    if (ref.porSexo) {
      const min = sexo === "H" ? ref.minH : ref.minM;
      const max = sexo === "H" ? ref.maxH : ref.maxM;
      if (min === null && max === null) return "INDEFINIDO";
      if (min !== null && valor < min) return "BAIXO";
      if (max !== null && valor > max) return "ALTO";
      return "NORMAL";
    }
    if (ref.min === null && ref.max === null) return "INDEFINIDO";
    if (ref.min !== null && valor < ref.min) return "BAIXO";
    if (ref.max !== null && valor > ref.max) return "ALTO";
    return "NORMAL";
  }

  return (
    <Shell>
      <main id="conteudo" className="page-wide">
        <PageHero
          eyebrow="Catálogo clínico"
          title="Exames Laboratoriais"
          lead="149 exames laboratoriais em 21 categorias, com faixas de referência por sexo e interpretador automático. Digite o valor do paciente para ver se está baixo, normal ou alto."
        />

        <section style={{ marginTop: "1.5rem" }}>
          {/* Barra de busca e filtro */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: "1 1 280px" }}>
              <SearchIcon
                size={16}
                style={{ position: "absolute", left: "0.6rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted, #888)" }}
              />
              <input
                type="search"
                placeholder="Buscar por exame, categoria ou descrição..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem 0.5rem 0.5rem 2rem",
                  border: "1px solid var(--border, #ccc)",
                  borderRadius: "0.3rem",
                  fontSize: "0.95rem",
                }}
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{ padding: "0.5rem", border: "1px solid var(--border, #ccc)", borderRadius: "0.3rem" }}
            >
              <option value="ALL">Todas as categorias ({examesData.length})</option>
              {categorias.map((c) => (
                <option key={c} value={c}>
                  {c} ({examesData.filter((e) => e.categoria === c).length})
                </option>
              ))}
            </select>
          </div>

          <div style={{ fontSize: "0.85rem", color: "var(--muted, #666)", marginBottom: "0.75rem" }}>
            Mostrando <strong>{filtered.length}</strong> de {examesData.length} exames em {grouped.length} categoria(s).
          </div>

          {/* Lista agrupada por categoria */}
          {grouped.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--muted, #666)", border: "1px dashed var(--border, #ccc)", borderRadius: "0.4rem" }}>
              Nenhum exame corresponde à busca.
            </div>
          ) : (
            grouped.map(([categoria, exames]) => (
              <div key={categoria} style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1rem", marginBottom: "0.5rem", paddingBottom: "0.25rem", borderBottom: "1px solid var(--border, #eee)" }}>
                  {categoria} <span style={{ color: "var(--muted, #888)", fontWeight: 400, fontSize: "0.85rem" }}>({exames.length})</span>
                </h3>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.4rem" }}>
                  {exames.map((exame) => {
                    const isExpanded = expandedExame === exame.id;
                    const val = values[exame.id];
                    const parsedValue = val?.valor ? parseFloat(val.valor.replace(",", ".")) : NaN;
                    const interpretation = !isNaN(parsedValue) ? interpretar(exame, parsedValue, val?.sexo || "H") : null;
                    return (
                      <li key={exame.id} style={{ border: "1px solid var(--border, #e0e0e0)", borderRadius: "0.4rem", background: "var(--surface, #fff)" }}>
                        <button
                          onClick={() => setExpandedExame(isExpanded ? null : exame.id)}
                          style={{ width: "100%", textAlign: "left", padding: "0.6rem 0.75rem", background: "transparent", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{exame.nome}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--muted, #666)" }}>
                              {exame.ref.porSexo
                                ? `H: ${exame.ref.minH ?? "—"} a ${exame.ref.maxH ?? "—"} · M: ${exame.ref.minM ?? "—"} a ${exame.ref.maxM ?? "—"} ${exame.ref.unidade}`
                                : `${exame.ref.min ?? "—"} a ${exame.ref.max ?? "—"} ${exame.ref.unidade || ""}`}
                            </div>
                          </div>
                          {isExpanded ? <ChevronDownIcon size={16} /> : <ChevronRightIcon size={16} />}
                        </button>
                        {isExpanded && (
                          <div style={{ padding: "0 0.75rem 0.75rem", borderTop: "1px solid var(--border, #f0f0f0)" }}>
                            <p style={{ fontSize: "0.85rem", color: "var(--muted, #555)", margin: "0.5rem 0 0.75rem" }}>{exame.descricao}</p>
                            <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", flexWrap: "wrap" }}>
                              {exame.ref.porSexo && (
                                <div>
                                  <label style={{ display: "block", fontSize: "0.75rem", color: "var(--muted, #666)", marginBottom: "0.2rem" }}>Sexo</label>
                                  <select value={val?.sexo || "H"} onChange={(e) => setValue(exame.id, "sexo", e.target.value)} style={{ padding: "0.4rem", border: "1px solid var(--border, #ccc)", borderRadius: "0.3rem" }}>
                                    <option value="H">Masculino</option>
                                    <option value="M">Feminino</option>
                                  </select>
                                </div>
                              )}
                              <div style={{ flex: "1 1 200px" }}>
                                <label style={{ display: "block", fontSize: "0.75rem", color: "var(--muted, #666)", marginBottom: "0.2rem" }}>
                                  Valor do paciente {exame.ref.unidade ? `(${exame.ref.unidade})` : ""}
                                </label>
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  value={val?.valor || ""}
                                  onChange={(e) => setValue(exame.id, "valor", e.target.value)}
                                  placeholder="Digite o valor..."
                                  style={{ width: "100%", padding: "0.4rem 0.5rem", border: "1px solid var(--border, #ccc)", borderRadius: "0.3rem", fontSize: "0.95rem" }}
                                />
                              </div>
                              {interpretation && (
                                <div style={{ padding: "0.4rem 0.6rem", borderRadius: "0.3rem", fontWeight: 600, fontSize: "0.85rem", background: interpretationBg(interpretation), color: interpretationColor(interpretation) }}>
                                  {interpretation === "BAIXO" || interpretation === "ALTO" ? <AlertTriangleIcon size={14} style={{ verticalAlign: "middle", marginRight: "0.25rem" }} /> : <CheckCircleIcon size={14} style={{ verticalAlign: "middle", marginRight: "0.25rem" }} />}
                                  {interpretation === "BAIXO" ? "Abaixo da referência" : interpretation === "ALTO" ? "Acima da referência" : interpretation === "NORMAL" ? "Dentro da referência" : "Sem referência"}
                                </div>
                              )}
                            </div>
                            {/* Faixa visual */}
                            <div style={{ marginTop: "0.75rem", fontSize: "0.75rem", color: "var(--muted, #666)" }}>
                              <strong>Faixa de referência:</strong>{" "}
                              {exame.ref.porSexo
                                ? `Masculino: ${exame.ref.minH ?? "—"} a ${exame.ref.maxH ?? "—"} · Feminino: ${exame.ref.minM ?? "—"} a ${exame.ref.maxM ?? "—"} ${exame.ref.unidade}`
                                : `${exame.ref.min ?? "—"} a ${exame.ref.max ?? "—"} ${exame.ref.unidade}`}
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}

          <div style={{ marginTop: "2rem", padding: "0.75rem 1rem", background: "var(--accent-soft, #f5f8fc)", borderRadius: "0.4rem", fontSize: "0.85rem", color: "var(--muted, #555)" }}>
            <strong>Aviso:</strong> As faixas de referência podem variar conforme o laboratório e o método utilizado. Consulte sempre a referência fornecida pelo laboratório que realizou o exame. Este interpretador é ferramenta de apoio didático e não substitui avaliação clínica.
          </div>
        </section>
      </main>
    </Shell>
  );
}

function interpretationBg(i: string): string {
  if (i === "BAIXO" || i === "ALTO") return "var(--warn-soft, #fff3e0)";
  if (i === "NORMAL") return "var(--success-soft, #e8f5e8)";
  return "var(--surface-2, #f5f5f5)";
}
function interpretationColor(i: string): string {
  if (i === "BAIXO" || i === "ALTO") return "var(--warn, #c47b00)";
  if (i === "NORMAL") return "var(--success, #2e7d32)";
  return "var(--muted, #666)";
}

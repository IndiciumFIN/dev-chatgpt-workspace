import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/site/shell";
import { PageHero } from "@/components/site/page-hero";
import { SearchIcon, ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import { examesData, type Exame } from "@/lib/tools/exames-laboratoriais.data";
import { interpretar, parseResultado, mensagensReferencia } from "@/lib/tools/exames-reference";

export const Route = createFileRoute("/exames-laboratoriais")({
  component: ExamesPage,
  head: () => ({
    meta: [
      { title: "Exames Laboratoriais · Calculadoras de Enfermagem" },
      {
        name: "description",
        content:
          "Catálogo educacional de 149 exames com limites históricos; comparação matemática, sem diagnóstico.",
      },
    ],
  }),
});

function ExamesPage() {
  const [query, setQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [expandedExame, setExpandedExame] = useState<string | null>(null);
  // Estado dos valores digitados: exameId -> { sexo, valor }
  const [values, setValues] = useState<Record<string, { sexo: "H" | "M" | ""; valor: string }>>({});

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
      [exameId]: { sexo: field === "sexo" ? (value as "H" | "M" | "") : (v[exameId]?.sexo || ""), valor: field === "valor" ? value : (v[exameId]?.valor || "") },
    }));
  }


  return (
    <Shell>
      <main id="conteudo" className="page-wide">
        <PageHero
          eyebrow="Catálogo clínico"
          title="Exames Laboratoriais"
          lead="149 exames em 21 categorias. Compare um valor fictício com os limites históricos informados; a base ainda não possui homologação clínica individual."
        />

        <section style={{ marginTop: "1.5rem" }}>
          <p role="note">Apenas comparação matemática educativa. Use a referência do laudo para avaliação clínica; idade, gestação, método, unidade e população podem alterar os limites. Não informe dados identificáveis.</p>
          {/* Barra de busca e filtro */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: "1 1 280px" }}>
              <SearchIcon
                size={16}
                style={{ position: "absolute", left: "0.6rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted, #888)" }}
              />
              <input
                type="search"
                aria-label="Buscar exame"
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
              aria-label="Filtrar categoria"
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
                    const parsedValue = parseResultado(val?.valor ?? "");
                    const invalidValue = !!val?.valor.trim() && parsedValue === undefined;
                    const missingSex = exame.ref.porSexo && !val?.sexo;
                    const interpretation = parsedValue === undefined ? null : interpretar(exame, parsedValue, val?.sexo === "H" ? "homem" : val?.sexo === "M" ? "mulher" : "nao-informado");

                    return (
                      <li key={exame.id} style={{ border: "1px solid var(--border, #e0e0e0)", borderRadius: "0.4rem", background: "var(--surface, #fff)" }}>
                        <button
                          aria-expanded={isExpanded}
                          aria-controls={`exame-${exame.id}-painel`}
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
                          <div id={`exame-${exame.id}-painel`} style={{ padding: "0 0.75rem 0.75rem", borderTop: "1px solid var(--border, #f0f0f0)" }}>
                            <p style={{ fontSize: "0.85rem", color: "var(--muted, #555)", margin: "0.5rem 0 0.75rem" }}>{exame.descricao}</p>
                            <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", flexWrap: "wrap" }}>
                              {exame.ref.porSexo && (
                                <div>
                                  <label htmlFor={`sexo-${exame.id}`} style={{ display: "block", fontSize: "0.75rem", color: "var(--muted, #666)", marginBottom: "0.2rem" }}>Sexo de referência</label>
                                  <select id={`sexo-${exame.id}`} value={val?.sexo || ""} onChange={(e) => setValue(exame.id, "sexo", e.target.value)} style={{ padding: "0.4rem", border: "1px solid var(--border, #ccc)", borderRadius: "0.3rem" }}>
                                    <option value="">Não informado</option>
                                    <option value="H">Masculino</option>
                                    <option value="M">Feminino</option>
                                  </select>
                                </div>
                              )}
                              <div style={{ flex: "1 1 200px" }}>
                                <label htmlFor={`valor-${exame.id}`} style={{ display: "block", fontSize: "0.75rem", color: "var(--muted, #666)", marginBottom: "0.2rem" }}>
                                  Valor para comparação {exame.ref.unidade ? `(${exame.ref.unidade})` : ""}
                                </label>
                                <input
                                  type="text"
                                  id={`valor-${exame.id}`}
                                  aria-invalid={invalidValue}
                                  aria-describedby={`resultado-${exame.id}`}
                                  inputMode="decimal"
                                  value={val?.valor || ""}
                                  onChange={(e) => setValue(exame.id, "valor", e.target.value)}
                                  placeholder="Digite o valor..."
                                  style={{ width: "100%", padding: "0.4rem 0.5rem", border: "1px solid var(--border, #ccc)", borderRadius: "0.3rem", fontSize: "0.95rem" }}
                                />
                              </div>
                              <div id={`resultado-${exame.id}`} role="status" aria-live="polite" style={{ fontSize:"0.85rem", padding:"0.4rem 0.6rem" }}>
                                {invalidValue ? "Número inválido. Use apenas um valor decimal sem separador de milhares." : parsedValue !== undefined && missingSex ? "Selecione o sexo de referência; comparação indisponível." : interpretation ? mensagensReferencia[interpretation.situacao] : ""}
                              </div>
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


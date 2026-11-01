import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/site/shell";
import { PageHero } from "@/components/site/page-hero";
import { SearchIcon, AlertTriangleIcon, ChevronDownIcon, ChevronRightIcon, ClockIcon } from "lucide-react";
import {
  DOENCAS_COMPULSORIAS,
  GRUPO_LABELS,
  PERIODICIDADE_LABELS,
  type DoencaCompulsoria,
  type GrupoNotificacao,
} from "@/lib/saude-publica/doencas-compulsorias.data";

export const Route = createFileRoute("/doencas-compulsorias")({
  component: DoencasPage,
  head: () => ({
    meta: [
      { title: "Doenças de Notificação Compulsória · Calculadoras de Enfermagem" },
      {
        name: "description",
        content:
          "Lista de doenças e agravos de notificação compulsória conforme Portaria MS/GM nº 3.220/2024. Agrupada por prazo (imediata, semanal, mensal) com medidas de controle.",
      },
    ],
  }),
});

function DoencasPage() {
  const [query, setQuery] = useState("");
  const [filterGrupo, setFilterGrupo] = useState<GrupoNotificacao | "ALL">("ALL");
  const [filterCategoria, setFilterCategoria] = useState<string>("ALL");
  const [expanded, setExpanded] = useState<string | null>(null);

  const categorias = useMemo(() => {
    return Array.from(new Set(DOENCAS_COMPULSORIAS.map((d) => d.categoria))).sort();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DOENCAS_COMPULSORIAS.filter((d) => {
      if (filterGrupo !== "ALL" && d.grupo !== filterGrupo) return false;
      if (filterCategoria !== "ALL" && d.categoria !== filterCategoria) return false;
      if (!q) return true;
      return (
        d.nome.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q) ||
        d.cid10?.toLowerCase().includes(q) ||
        d.descricao.toLowerCase().includes(q) ||
        d.categoria.toLowerCase().includes(q)
      );
    });
  }, [query, filterGrupo, filterCategoria]);

  // Agrupa por grupo
  const grouped = useMemo(() => {
    const map = new Map<GrupoNotificacao, DoencaCompulsoria[]>();
    filtered.forEach((d) => {
      const list = map.get(d.grupo) || [];
      list.push(d);
      map.set(d.grupo, list);
    });
    return (["I", "II", "III", "IV"] as GrupoNotificacao[])
      .filter((g) => map.has(g))
      .map((g) => [g, map.get(g)!] as const);
  }, [filtered]);

  const counts = useMemo(() => {
    const map: Record<GrupoNotificacao, number> = { I: 0, II: 0, III: 0, IV: 0 };
    DOENCAS_COMPULSORIAS.forEach((d) => (map[d.grupo] += 1));
    return map;
  }, []);

  return (
    <Shell>
      <main id="conteudo" className="page-wide">
        <PageHero
          eyebrow="Saúde Pública · Vigilância Epidemiológica"
          title="Doenças de Notificação Compulsória"
          lead="Lista oficial conforme Portaria MS/GM nº 3.220/2024. Agrupada por prazo de notificação (imediata/semanal/mensal) com medidas de controle para cada agravo."
        />

        <section style={{ marginTop: "1.5rem" }}>
          {/* Cards por grupo */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.5rem", marginBottom: "1.25rem" }}>
            {(["I", "II", "III", "IV"] as GrupoNotificacao[]).map((g) => {
              const active = filterGrupo === g;
              return (
                <button
                  key={g}
                  onClick={() => setFilterGrupo(active ? "ALL" : g)}
                  style={{
                    border: "1px solid " + (active ? "var(--accent, #0a66c2)" : "var(--border, #e0e0e0)"),
                    background: active ? "var(--accent-soft, #e8f0fe)" : "var(--surface, #fff)",
                    padding: "0.75rem 1rem",
                    borderRadius: "0.4rem",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div style={{ fontWeight: 600, color: active ? "var(--accent, #0a66c2)" : "inherit", fontSize: "0.85rem" }}>
                    {GRUPO_LABELS[g].split("—")[0].trim()}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--muted, #666)", marginTop: "0.2rem" }}>
                    {GRUPO_LABELS[g].split("—")[1]?.trim()}
                  </div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: "0.3rem", color: active ? "var(--accent, #0a66c2)" : "inherit" }}>
                    {counts[g]}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Barra de busca */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: "1 1 280px" }}>
              <SearchIcon size={16} style={{ position: "absolute", left: "0.6rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted, #888)" }} />
              <input
                type="search"
                placeholder="Buscar por nome, CID-10 ou descrição..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ width: "100%", padding: "0.5rem 0.5rem 0.5rem 2rem", border: "1px solid var(--border, #ccc)", borderRadius: "0.3rem", fontSize: "0.95rem" }}
              />
            </div>
            <select value={filterCategoria} onChange={(e) => setFilterCategoria(e.target.value)} style={{ padding: "0.5rem", border: "1px solid var(--border, #ccc)", borderRadius: "0.3rem" }}>
              <option value="ALL">Todas as categorias</option>
              {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ fontSize: "0.85rem", color: "var(--muted, #666)", marginBottom: "0.75rem" }}>
            Mostrando <strong>{filtered.length}</strong> de {DOENCAS_COMPULSORIAS.length} doenças.
          </div>

          {grouped.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--muted, #666)", border: "1px dashed var(--border, #ccc)", borderRadius: "0.4rem" }}>
              Nenhuma doença corresponde à busca.
            </div>
          ) : (
            grouped.map(([grupo, doencas]) => (
              <div key={grupo} style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1rem", marginBottom: "0.5rem", paddingBottom: "0.25rem", borderBottom: "1px solid var(--border, #eee)" }}>
                  {GRUPO_LABELS[grupo]} <span style={{ color: "var(--muted, #888)", fontWeight: 400, fontSize: "0.85rem" }}>({doencas.length})</span>
                </h3>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.4rem" }}>
                  {doencas.map((d) => {
                    const isExpanded = expanded === d.id;
                    const isImmediate = d.periodicidade === "IMEDIATA";
                    return (
                      <li key={d.id} style={{ border: "1px solid var(--border, #e0e0e0)", borderLeft: `3px solid ${isImmediate ? "var(--danger, #c0392b)" : "var(--accent, #0a66c2)"}`, borderRadius: "0.4rem", background: "var(--surface, #fff)" }}>
                        <button onClick={() => setExpanded(isExpanded ? null : d.id)} style={{ width: "100%", textAlign: "left", padding: "0.6rem 0.75rem", background: "transparent", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{d.nome}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--muted, #666)" }}>
                              {d.cid10 && <span>CID-10: {d.cid10} · </span>}
                              {d.categoria}
                            </div>
                          </div>
                          {isImmediate && d.prazoHoras && (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.7rem", padding: "0.15rem 0.4rem", background: "var(--danger-soft, #fde8e8)", color: "var(--danger, #c0392b)", borderRadius: "0.2rem", fontWeight: 600 }} title={`Notificar em até ${d.prazoHoras}h`}>
                              <ClockIcon size={11} /> {d.prazoHoras}h
                            </span>
                          )}
                          {isExpanded ? <ChevronDownIcon size={16} /> : <ChevronRightIcon size={16} />}
                        </button>
                        {isExpanded && (
                          <div style={{ padding: "0 0.75rem 0.75rem", borderTop: "1px solid var(--border, #f0f0f0)" }}>
                            <p style={{ fontSize: "0.85rem", color: "var(--muted, #555)", margin: "0.5rem 0 0.5rem" }}>{d.descricao}</p>
                            <div style={{ fontSize: "0.8rem", display: "grid", gap: "0.2rem" }}>
                              <div><strong>Periodicidade:</strong> {PERIODICIDADE_LABELS[d.periodicidade]}</div>
                              {d.prazoHoras && <div><strong>Prazo máximo:</strong> {d.prazoHoras} horas</div>}
                              {d.cid10 && <div><strong>CID-10:</strong> {d.cid10}</div>}
                              {d.medidasControle && d.medidasControle.length > 0 && (
                                <div style={{ marginTop: "0.3rem" }}>
                                  <strong>Medidas de controle:</strong>
                                  <ul style={{ margin: "0.2rem 0 0 1rem", padding: 0 }}>
                                    {d.medidasControle.map((m, i) => <li key={i} style={{ fontSize: "0.8rem", marginTop: "0.15rem" }}>{m}</li>)}
                                  </ul>
                                </div>
                              )}
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
            <strong>Fonte primária:</strong> BRASIL. Ministério da Saúde. Portaria GM/MS nº 3.220, de 30 de dezembro de 2024. Dispõe sobre a relação de doenças, agravos e eventos em saúde pública de notificação compulsória. Diário Oficial da União, Brasília, DF, 31 dez. 2024.
            <br /><br />
            <strong>Aviso:</strong> Esta lista deve ser revisada anualmente conforme atualizações do Ministério da Saúde. Confira sempre a versão vigente da Portaria antes de decisão clínica.
          </div>
        </section>
      </main>
    </Shell>
  );
}

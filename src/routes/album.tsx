import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/site/shell";
import { PageHero } from "@/components/site/page-hero";
import { SearchIcon, ImageIcon, XIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import {
  ALBUM_ITEMS_SEED,
  ALBUM_TOTAL,
  SPECIALTY_LABELS,
  CATEGORY_LABELS,
  ALBUM_RIGHTS_LABELS,
  type AlbumItem,
  type AlbumSpecialty,
  type AlbumCategory,
} from "@/lib/editorial/album.seed";

export const Route = createFileRoute("/album")({
  component: AlbumPage,
  head: () => ({
    meta: [
      { title: "Álbum de Enfermagem · Calculadoras de Enfermagem" },
      {
        name: "description",
        content:
          "Álbum visual de momentos, retratos históricos e equipamentos da enfermagem. Florence Nightingale, Anna Nery, Mary Mahoney e mais.",
      },
    ],
  }),
});

function AlbumPage() {
  const [query, setQuery] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState<AlbumSpecialty | "ALL">("ALL");
  const [filterCategory, setFilterCategory] = useState<AlbumCategory | "ALL">("ALL");
  const [viewingIdx, setViewingIdx] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALBUM_ITEMS_SEED.filter((item) => {
      if (item.status !== "RELEASED") return false;
      if (filterSpecialty !== "ALL" && item.specialty !== filterSpecialty) return false;
      if (filterCategory !== "ALL" && item.category !== filterCategory) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.caption.toLowerCase().includes(q) ||
        (item.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [query, filterSpecialty, filterCategory]);

  // Modal de visualização
  const viewing = viewingIdx !== null ? filtered[viewingIdx] : null;

  function navigate(delta: number) {
    if (viewingIdx === null) return;
    const next = (viewingIdx + delta + filtered.length) % filtered.length;
    setViewingIdx(next);
  }

  return (
    <Shell>
      <main id="conteudo" className="page-wide">
        <PageHero
          eyebrow="Editorial · Álbum visual"
          title="Álbum de Enfermagem"
          lead={`${ALBUM_TOTAL} imagens curadas: retratos históricos, equipamentos, procedimentos e momentos da profissão.`}
        />

        <section style={{ marginTop: "1.5rem" }}>
          {/* Filtros */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: "1 1 280px" }}>
              <SearchIcon size={16} style={{ position: "absolute", left: "0.6rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted, #888)" }} />
              <input
                type="search"
                placeholder="Buscar por título, legenda ou tag..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ width: "100%", padding: "0.5rem 0.5rem 0.5rem 2rem", border: "1px solid var(--border, #ccc)", borderRadius: "0.3rem", fontSize: "0.95rem" }}
              />
            </div>
            <select value={filterSpecialty} onChange={(e) => setFilterSpecialty(e.target.value as AlbumSpecialty | "ALL")} style={{ padding: "0.5rem", border: "1px solid var(--border, #ccc)", borderRadius: "0.3rem" }}>
              <option value="ALL">Todas as especialidades</option>
              {Object.entries(SPECIALTY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value as AlbumCategory | "ALL")} style={{ padding: "0.5rem", border: "1px solid var(--border, #ccc)", borderRadius: "0.3rem" }}>
              <option value="ALL">Todas as categorias</option>
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>

          <div style={{ fontSize: "0.85rem", color: "var(--muted, #666)", marginBottom: "0.75rem" }}>
            Mostrando <strong>{filtered.length}</strong> de {ALBUM_TOTAL} imagens.
          </div>

          {/* Grid de imagens */}
          {filtered.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--muted, #666)", border: "1px dashed var(--border, #ccc)", borderRadius: "0.4rem" }}>
              <ImageIcon size={32} style={{ opacity: 0.4, marginBottom: "0.5rem" }} />
              <p>Nenhuma imagem corresponde à busca.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0.75rem" }}>
              {filtered.map((item, idx) => (
                <button
                  key={item.canonical_id}
                  onClick={() => setViewingIdx(idx)}
                  style={{ border: "1px solid var(--border, #e0e0e0)", borderRadius: "0.4rem", padding: 0, background: "var(--surface, #fff)", cursor: "pointer", overflow: "hidden", textAlign: "left", display: "flex", flexDirection: "column" }}
                >
                  <div style={{ aspectRatio: "4/3", background: "var(--surface-2, #f0f0f0)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <img src={item.image_uri} alt={item.image_alt || item.title} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ padding: "0.5rem 0.6rem" }}>
                    <div style={{ fontSize: "0.7rem", color: "var(--muted, #888)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {CATEGORY_LABELS[item.category]}{item.year ? ` · ${item.year}` : ""}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: "0.85rem", marginTop: "0.1rem", lineHeight: 1.3 }}>{item.title}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Modal de visualização */}
          {viewing && (
            <div
              onClick={() => setViewingIdx(null)}
              style={{
                position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem",
              }}
            >
              <button onClick={(e) => { e.stopPropagation(); setViewingIdx(null); }} style={{ position: "absolute", top: "1rem", right: "1rem", background: "transparent", border: "none", color: "white", cursor: "pointer", padding: "0.5rem" }} aria-label="Fechar">
                <XIcon size={28} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); navigate(-1); }} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.1)", border: "none", color: "white", cursor: "pointer", padding: "0.75rem", borderRadius: "50%" }} aria-label="Anterior">
                <ChevronLeftIcon size={24} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); navigate(1); }} style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.1)", border: "none", color: "white", cursor: "pointer", padding: "0.75rem", borderRadius: "50%" }} aria-label="Próxima">
                <ChevronRightIcon size={24} />
              </button>
              <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: "900px", maxHeight: "85vh", overflowY: "auto", background: "var(--surface, #fff)", borderRadius: "0.4rem", padding: "1rem" }}>
                <img src={viewing.image_uri} alt={viewing.image_alt || viewing.title} style={{ width: "100%", maxHeight: "60vh", objectFit: "contain", borderRadius: "0.3rem", background: "#f5f5f5" }} />
                <div style={{ marginTop: "0.75rem" }}>
                  <div style={{ fontSize: "0.7rem", color: "var(--muted, #888)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {CATEGORY_LABELS[viewing.category]} · {viewing.specialty ? SPECIALTY_LABELS[viewing.specialty] : ""}
                    {viewing.year ? ` · ${viewing.year}` : ""} · {viewing.country || ""}
                  </div>
                  <h3 style={{ margin: "0.2rem 0 0.5rem 0" }}>{viewing.title}</h3>
                  <p style={{ fontSize: "0.92rem", lineHeight: 1.6, margin: "0 0 0.75rem 0", color: "var(--muted, #333)" }}>{viewing.caption}</p>
                  {viewing.tags && viewing.tags.length > 0 && (
                    <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                      {viewing.tags.map((t) => <span key={t} style={{ fontSize: "0.7rem", padding: "0.1rem 0.4rem", background: "var(--accent-soft, #e8f0fe)", color: "var(--accent, #0a66c2)", borderRadius: "0.2rem" }}>#{t}</span>)}
                    </div>
                  )}
                  <div style={{ fontSize: "0.75rem", color: "var(--muted, #888)" }}>
                    <div><strong>Licença:</strong> {viewing.license_ref}</div>
                    <div><strong>Direitos:</strong> {ALBUM_RIGHTS_LABELS[viewing.rights_status]}</div>
                    {viewing.location && <div><strong>Local:</strong> {viewing.location}</div>}
                    {viewing.source_id && <div><strong>Fonte:</strong> {viewing.source_id}</div>}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div style={{ marginTop: "2rem", padding: "0.75rem 1rem", background: "var(--accent-soft, #f5f8fc)", borderRadius: "0.4rem", fontSize: "0.85rem", color: "var(--muted, #555)" }}>
            <strong>Direitos de imagem:</strong> Todas as imagens são provenientes de fontes com licenças compatíveis (domínio público para obras históricas, Creative Commons para contemporâneas). Cada item declara sua licença e fonte de origem. Para uso editorial, verifique a licença específica.
          </div>
        </section>
      </main>
    </Shell>
  );
}

import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/site/shell";
import { PageHero } from "@/components/site/page-hero";
import { BookmarkIcon, FileTextIcon, FolderIcon, QuoteIcon, DatabaseIcon, FlaskConicalIcon, DownloadIcon, UploadIcon } from "lucide-react";
import { SourcesPanel } from "@/components/research/sources-panel";
import { ReferencesPanel } from "@/components/research/references-panel";
import { PicoPanel } from "@/components/research/pico-panel";
import { exportAll, importAll } from "@/lib/research/store";
import type { ResearchBackup } from "@/lib/research/store";

export const Route = createFileRoute("/ferramentas-pesquisa")({
  component: ResearchPage,
  head: () => ({
    meta: [
      { title: "Ferramentas de Pesquisa · Calculadoras de Enfermagem" },
      {
        name: "description",
        content:
          "Gerador de citações ABNT NBR 6023:2018, gerenciador de fontes e estruturador de PICO para pesquisadores em enfermagem.",
      },
    ],
  }),
});

type Tab = "references" | "sources" | "pico";

const TABS: { id: Tab; label: string; icon: typeof QuoteIcon; description: string }[] = [
  {
    id: "references",
    label: "Citações ABNT",
    icon: QuoteIcon,
    description: "Gere citações no padrão NBR 6023:2018 (12 tipos)",
  },
  {
    id: "sources",
    label: "Biblioteca de Fontes",
    icon: DatabaseIcon,
    description: "Cadastre e organize fontes bibliográficas (artigos, leis, diretrizes)",
  },
  {
    id: "pico",
    label: "Caderno PICO",
    icon: FlaskConicalIcon,
    description: "Estruture perguntas de pesquisa e projetos com PICO",
  },
];

function ResearchPage() {
  const [tab, setTab] = useState<Tab>("references");

  function handleExport() {
    const backup = exportAll();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pesquisa-enfermagem-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const backup = JSON.parse(String(reader.result)) as ResearchBackup;
        const counts = importAll(backup);
        alert(
          `Importação concluída: ${counts.sources} fontes, ${counts.references} citações, ${counts.methods} projetos.`,
        );
      } catch (e) {
        alert(`Falha ao importar: ${e instanceof Error ? e.message : String(e)}`);
      }
    };
    reader.readAsText(file);
    ev.target.value = "";
  }

  return (
    <Shell>
      <main id="conteudo" className="page-wide">
        <PageHero
          eyebrow="Ferramentas · Pesquisador Científico"
          title="Ferramentas de Pesquisa Acadêmica"
          lead="Gerador de citações ABNT NBR 6023:2018, gerenciador de fontes bibliográficas e estruturador de PICO — voltado para pesquisadores, pós-graduandos e profissionais de enfermagem com produção científica."
        />

        <section className="ce-admin-panel" style={{ marginTop: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2 style={{ marginTop: 0, fontSize: "1.25rem" }}>Três ferramentas integradas</h2>
              <p style={{ color: "var(--muted, #555)", marginBottom: 0, maxWidth: "60ch" }}>
                Os dados são salvos localmente no seu navegador (localStorage). Faça backup
                exportando o JSON e importe em outro dispositivo quando precisar. O modelo de
                dados segue os contratos canônicos CKO, então pode subir para um backend
                governado sem reshape.
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
              <button
                onClick={handleExport}
                className="ce-btn ce-btn-ghost"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
              >
                <DownloadIcon size={16} /> Exportar JSON
              </button>
              <label
                className="ce-btn ce-btn-ghost"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", cursor: "pointer" }}
              >
                <UploadIcon size={16} /> Importar JSON
                <input type="file" accept="application/json" onChange={handleImport} hidden />
              </label>
            </div>
          </div>
        </section>

        <nav
          className="ce-tabs"
          role="tablist"
          aria-label="Ferramentas de pesquisa"
          style={{
            display: "flex",
            gap: "0.25rem",
            marginTop: "1.5rem",
            borderBottom: "1px solid var(--border, #ddd)",
            flexWrap: "wrap",
          }}
        >
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                style={{
                  background: active ? "var(--accent, #0a66c2)" : "transparent",
                  color: active ? "white" : "inherit",
                  border: "1px solid " + (active ? "var(--accent, #0a66c2)" : "var(--border, #ddd)"),
                  borderBottom: active ? "none" : "1px solid var(--border, #ddd)",
                  padding: "0.6rem 1rem",
                  borderRadius: "0.4rem 0.4rem 0 0",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontWeight: active ? 600 : 400,
                }}
              >
                <Icon size={16} />
                {t.label}
              </button>
            );
          })}
        </nav>

        <section style={{ marginTop: "1.5rem" }}>
          {tab === "references" && <ReferencesPanel />}
          {tab === "sources" && <SourcesPanel />}
          {tab === "pico" && <PicoPanel />}
        </section>
      </main>
    </Shell>
  );
}

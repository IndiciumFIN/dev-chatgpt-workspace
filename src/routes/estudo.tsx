import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/site/shell";
import { PageHero } from "@/components/site/page-hero";
import { BookOpenIcon, LayersIcon, FileTextIcon, DownloadIcon, UploadIcon, HistoryIcon, TrashIcon } from "lucide-react";
import { QuizzesPanel } from "@/components/education/quizzes-panel";
import { FlashcardsPanel } from "@/components/education/flashcards-panel";
import { SimuladosPanel } from "@/components/education/simulados-panel";
import { exportAll, importAll, useSessionHistory } from "@/lib/education/store";

export const Route = createFileRoute("/estudo")({
  component: EstudoPage,
  head: () => ({
    meta: [
      {
        title: "Estudo · Quizzes, Flashcards e Simulados · Calculadoras de Enfermagem",
      },
      {
        name: "description",
        content:
          "Plataforma de aprendizagem: crie quizzes com cronômetro, flashcards com repetição espaçada (sistema Leitner) e simulados para concursos. Modelo de dados canônico conforme assessment_item.schema.json e flashcard.schema.json.",
      },
    ],
  }),
});

type Tab = "quizzes" | "flashcards" | "simulados" | "historico";

const TABS: { id: Tab; label: string; icon: typeof BookOpenIcon; description: string }[] = [
  {
    id: "quizzes",
    label: "Quizzes",
    icon: BookOpenIcon,
    description: "Banco de questões + monte quizzes com cronômetro",
  },
  {
    id: "flashcards",
    label: "Flashcards",
    icon: LayersIcon,
    description: "Cartões frente/verso com repetição espaçada (Leitner 7 caixas)",
  },
  {
    id: "simulados",
    label: "Simulados",
    icon: FileTextIcon,
    description: "Provas completas com banca, cronômetro e nota de corte",
  },
  {
    id: "historico",
    label: "Histórico",
    icon: HistoryIcon,
    description: "Suas últimas tentativas e pontuações",
  },
];

function EstudoPage() {
  const [tab, setTab] = useState<Tab>("quizzes");
  const { history, clearHistory } = useSessionHistory();

  function handleExport() {
    const backup = exportAll();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `estudo-enfermagem-${new Date().toISOString().slice(0, 10)}.json`;
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
        const counts = importAll(backup);
        alert(`Importação concluída: ${counts.items} questões, ${counts.flashcards} flashcards, ${counts.decks} quizzes, ${counts.simulados} simulados, ${counts.history} registros de histórico.`);
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
          eyebrow="Ferramentas Educacionais"
          title="Plataforma de Estudo"
          lead="Crie quizzes com cronômetro, flashcards com repetição espaçada e simulados para concursos. Cada questão pode vincular-se a uma escala clínica do site. Os dados são salvos localmente no seu navegador."
        />

        <section className="ce-admin-panel" style={{ marginTop: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
            <div>
              <h2 style={{ marginTop: 0, fontSize: "1.25rem" }}>Três ferramentas integradas + histórico</h2>
              <p style={{ color: "var(--muted, #555)", marginBottom: 0, maxWidth: "60ch" }}>
                Quizzes montam bancos de questões com shuffle e cronômetro. Flashcards usam sistema Leitner
                de 7 caixas para repetição espaçada. Simulados são quizzes com banca/cargo para concursos.
                O histórico guarda as últimas 200 tentativas.
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
              <button onClick={handleExport} className="ce-btn ce-btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                <DownloadIcon size={16} /> Exportar
              </button>
              <label className="ce-btn ce-btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", cursor: "pointer" }}>
                <UploadIcon size={16} /> Importar
                <input type="file" accept="application/json" onChange={handleImport} hidden />
              </label>
            </div>
          </div>
        </section>

        <nav
          className="ce-tabs"
          role="tablist"
          aria-label="Ferramentas de estudo"
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
                {t.id === "historico" && history.length > 0 && (
                  <span style={{ background: "var(--accent-soft, #e8f0fe)", color: "var(--accent, #0a66c2)", padding: "0.1rem 0.4rem", borderRadius: "0.2rem", fontSize: "0.7rem" }}>
                    {history.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <section style={{ marginTop: "1.5rem" }}>
          {tab === "quizzes" && <QuizzesPanel />}
          {tab === "flashcards" && <FlashcardsPanel />}
          {tab === "simulados" && <SimuladosPanel />}
          {tab === "historico" && <HistoricoPanel onClear={clearHistory} />}
        </section>
      </main>
    </Shell>
  );
}

function HistoricoPanel({ onClear }: { onClear: () => void }) {
  const { history } = useSessionHistory();

  if (history.length === 0) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "var(--muted, #666)", border: "1px dashed var(--border, #ccc)", borderRadius: "0.4rem" }}>
        Nenhuma tentativa registrada. Faça um quiz ou simulado para ver seu histórico aqui.
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Histórico — {history.length} tentativa(s)</h3>
        <button onClick={() => { if (confirm("Limpar todo o histórico?")) onClear(); }} className="ce-btn ce-btn-ghost" style={{ color: "var(--danger, #c0392b)", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
          <TrashIcon size={14} /> Limpar histórico
        </button>
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.5rem" }}>
        {history.map((h) => (
          <li key={h.sessionId} style={{ border: "1px solid var(--border, #e0e0e0)", borderRadius: "0.4rem", padding: "0.6rem 0.75rem", background: "var(--surface, #fff)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{h.deckTitle}</div>
              <div style={{ fontSize: "0.85rem", color: "var(--muted, #666)" }}>
                {new Date(h.date).toLocaleString("pt-BR")} · {h.correct}/{h.total} acertos · {Math.floor(h.timeSpentSeconds / 60)}min{h.timeSpentSeconds % 60 > 0 ? `${h.timeSpentSeconds % 60}s` : ""}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "1.25rem", fontWeight: 700, color: h.passed ? "var(--success, #2e7d32)" : "var(--danger, #c0392b)" }}>
                {h.score}
              </div>
              <div style={{ fontSize: "0.7rem", color: h.passed ? "var(--success, #2e7d32)" : "var(--danger, #c0392b)" }}>
                {h.passed ? "APROVADO" : "REPROVADO"}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

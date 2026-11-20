import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/site/shell";
import { ArticlePage } from "@/components/article/article-page";
import { contractReport } from "@/lib/contract";
import { held, phases, rejected, tokens } from "@/lib/site-data";

export const Route = createFileRoute("/sistema")({
  component: Sistema,
  head: () => ({
    meta: [
      { title: "Sistema visual · Calculadoras de Enfermagem" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function Sistema() {
  return (
    <Shell>
      <ArticlePage
        kind="secao"
        crumbs={[{ label: "Início", to: "/" }, { label: "Sistema visual" }]}
        eyebrow="Etapa F5 · auditoria visual"
        title="Sistema visual institucional"
        lead="Extraído da home em produção, não do rascunho anterior. A interface antiga usava azul-céu e índigo, fonte de sistema e cartões genéricos. O site real é marinha, Inter e cartões brancos com borda fria."
      >
        <section className="paper" style={{ marginBottom: 16 }}>
          <h2>O que a auditoria corrigiu</h2>
          <ul style={{ margin: 0, paddingLeft: 18, color: "var(--color-slate)", lineHeight: 1.6 }}>
            <li>Primária é #1A3E74, não #0EA5E9. O gradiente céu-índigo fica só no botão Assine já.</li>
            <li>Títulos da home são Inter 900. Nunito Sans fica no menu e como fonte de apoio, não em todo heading.</li>
            <li>Foco padrão é amarelo (#FF0), como na barra de acessibilidade publicada.</li>
            <li>Hero, faixa de extensões, grade de calculadoras e prévia de formulário seguem o mesmo bloco.</li>
          </ul>
        </section>

        <h2>Tokens homologados</h2>
        <div className="swatch-grid" style={{ marginBottom: 24 }}>
          {tokens.map((token) => (
            <figure key={token.hex} className="swatch">
              <div className="swatch-chip" style={{ background: token.hex }} />
              <figcaption>
                <strong>{token.name}</strong>
                <span>{token.hex}</span>
                <div>{token.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>

        <h2>Descartar do rascunho F4</h2>
        <div className="swatch-grid" style={{ marginBottom: 24 }}>
          {rejected.map((token) => (
            <figure key={token.name} className="swatch wrong">
              <div className="swatch-chip" style={{ background: token.hex }} />
              <figcaption>
                <strong>{token.name}</strong>
                <span>{token.hex}</span>
                <div>{token.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>

        <h2>Componentes desta etapa</h2>
        <div className="spec-grid" style={{ marginBottom: 24 }}>
          <div className="paper">
            <h3 style={{ marginTop: 0 }}>Botões</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <button className="btn-navy" type="button">
                Calcular
              </button>
              <button className="btn-ghost" type="button">
                Limpar
              </button>
              <button className="btn-danger" type="button">
                Excluir
              </button>
              <span className="btn-assine">Assine já</span>
            </div>
          </div>
          <div className="paper">
            <h3 style={{ marginTop: 0 }}>Campo e resultado</h3>
            <label className="field">
              <span>Volume (mL)</span>
              <input defaultValue="500" readOnly />
              <small>Número inteiro, sem unidade no campo.</small>
            </label>
            <div className="result-block" style={{ marginTop: 12 }}>
              <span>Macrogotas / min</span>
              <b>21</b>
            </div>
          </div>
          <div className="paper">
            <h3 style={{ marginTop: 0 }}>Selos</h3>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span className="badge badge-info">Neonatal</span>
              <span className="badge badge-ok">Baixo risco</span>
              <span className="badge badge-warn">Moderado</span>
              <span className="badge badge-danger">Alto risco</span>
            </div>
          </div>
          <div className="paper">
            <h3 style={{ marginTop: 0 }}>Tipografia</h3>
            <p style={{ fontWeight: 900, fontSize: 28, margin: "0 0 6px", color: "var(--color-navy)" }}>
              Inter 900 — título de seção
            </p>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, margin: "0 0 6px" }}>
              Nunito Sans — menu e apoio
            </p>
            <p style={{ margin: 0, color: "var(--color-slate)" }}>Inter 400 — texto de leitura clínica, 16px.</p>
          </div>
        </div>

        <h2>Fila do pacote</h2>
        <div className="phase-list">
          {phases.map((phase) => (
            <div key={phase.id} className="phase-row">
              <b>
                {phase.id} · {phase.name}
              </b>
              <span>
                {phase.status} — {phase.detail}
              </span>
            </div>
          ))}
        </div>

        <h2>Contrato desta versão</h2>
        <ul className="contract-list">
          {contractReport().map((check) => (
            <li key={check.id} className={check.ok ? "is-ok" : "is-bad"}>
              <b>{check.ok ? "Conferido" : "Pendente"}</b>
              <span>{check.detail}</span>
            </li>
          ))}
        </ul>

        <h2>Fora desta stack</h2>
        <div className="phase-list">
          {held.map((phase) => (
            <div key={phase.id} className="phase-row">
              <b>
                {phase.id} · {phase.name}
              </b>
              <span>{phase.detail}</span>
            </div>
          ))}
        </div>
      </ArticlePage>
    </Shell>
  );
}

import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RelatedContent } from "@/components/site/related-content";
import { toolViews, type ToolView } from "@/lib/component-contract";
import type { ClinicalTool } from "@/lib/tools/types";

const viewKey = "cde-vista";

export function readToolView(): ToolView {
  try {
    const stored = sessionStorage.getItem(viewKey);
    if (stored === "beira" || stored === "offline" || stored === "padrao") return stored;
  } catch {
    /* a vista não é dado clínico */
  }
  return "padrao";
}

export function ToolViewBar({ view, onChange }: { view: ToolView; onChange: (view: ToolView) => void }) {
  return (
    <div className="view-bar no-print" role="group" aria-label="Vista da ferramenta">
      <span className="view-bar-label">Modo de visualização:</span>
      {(Object.keys(toolViews) as ToolView[]).map((id) => (
        <button key={id} className={view === id ? "btn-navy btn-sm" : "btn-ghost btn-sm"} type="button" aria-pressed={view === id} onClick={() => onChange(id)}>
          {toolViews[id].label}
        </button>
      ))}
      {view === "offline" ? <p className="tool-help">O cálculo roda neste aparelho. Não precisa de rede.</p> : null}
      {view === "beira" ? <p className="tool-help">Só o cálculo. O resto fica em Mais.</p> : null}
    </div>
  );
}

export function rememberView(view: ToolView) {
  try {
    sessionStorage.setItem(viewKey, view);
  } catch {
    /* ignora */
  }
  document.documentElement.dataset.vista = view;
}

export function ToolMeta({ tool }: { tool: ClinicalTool }) {
  if (!tool.version && !tool.evidence) return null;
  return (
    <p className="tool-meta no-print">
      {tool.version ? <span>Versão {tool.version}</span> : null}
      {tool.evidence ? <span>Evidência: {tool.evidence}</span> : null}
    </p>
  );
}

const steps = {
  escala: ["Marque cada critério.", "Selecione Calcular.", "A impressão leva o laudo, com NANDA e observação. A tela não."],
  calculadora: ["Preencha os campos dentro do mínimo e do máximo.", "Selecione Calcular.", "Confira o resultado e a memória do cálculo."],
} as const;

export function ToolTutorial({ kind }: { kind: ClinicalTool["kind"] }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const list = steps[kind];
  return (
    <div className="tool-tutorial no-print">
      <button className="btn-ghost btn-sm" type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>Tutorial</button>
      {open ? (
        <div className="paper tool-block">
          <p><b>Passo {step + 1} de {list.length}.</b> {list[step]}</p>
          <div className="tool-actions">
            <button className="btn-ghost btn-sm" type="button" onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0}>Anterior</button>
            <button className="btn-navy btn-sm" type="button" onClick={() => setStep((value) => Math.min(list.length - 1, value + 1))} disabled={step === list.length - 1}>Próximo</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ToolFeedback() {
  const [useful, setUseful] = useState(false);
  return (
    <div className="tool-feedback no-print">
      <button className="btn-ghost btn-sm" type="button" aria-pressed={useful} onClick={() => setUseful(true)}>Útil</button>
      <Link className="btn-ghost btn-sm" to="/secao/$slug" params={{ slug: "contato" }}>Corrigir</Link>
      {useful ? <p className="tool-help">Anotado nesta visita. Sem dado de paciente e sem cookie.</p> : null}
    </div>
  );
}

export function ToolEcosystem({ compact }: { compact: boolean }) {
  if (compact) return null;
  return (
    <RelatedContent
      title="No ecossistema"
      items={[
        { title: "Biblioteca", text: "Acervo e textos.", to: "/secao/$slug", params: { slug: "biblioteca" } },
        { title: "Formulários", text: "Folhas em branco.", to: "/secao/$slug", params: { slug: "biblioteca" }, hash: "formularios" },
      ]}
    />
  );
}

export function useToolView() {
  const [view, setView] = useState<ToolView>("padrao");
  useEffect(() => {
    const next = readToolView();
    setView(next);
    document.documentElement.dataset.vista = next;
  }, []);
  function change(next: ToolView) {
    setView(next);
    rememberView(next);
  }
  return { view, change, compact: !toolViews[view].extras };
}

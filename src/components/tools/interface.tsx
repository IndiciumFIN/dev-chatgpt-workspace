import { useEffect, useState, type ReactNode } from "react";
import { formatNumber, type ToolSuccess } from "@/lib/tools/engine";

export function Meter({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, Math.round((value / max) * 100))) : 0;
  return (
    <div className="meter" aria-hidden="true">
      <span className="meter-bar" style={{ width: `${pct}%` }} />
      <span className="sr-only">{label}: {pct}%</span>
    </div>
  );
}

export function ScoreCard({ result }: { result: ToolSuccess }) {
  const tone = result.band?.tone ?? "info";
  return (
    <div className={`score-card tone-bg-${tone}`}>
      {result.outputs ? (
        result.outputs.map((output) => (
          <p key={output.id} className="score-line">
            <b className="score-num">{formatNumber(output.value, output.digits)}</b>
            <span>{output.label} · {output.unit}</span>
          </p>
        ))
      ) : (
        <p className="score-line">
          <b className="score-num">{result.total}{result.max !== undefined ? <small>/{result.max}</small> : null}</b>
          <span>{result.totalLabel}</span>
        </p>
      )}
      {result.band ? <span className={`score-pill tone-bg-${result.band.tone}`}>{result.band.label}</span> : null}
    </div>
  );
}

export function MemoryTable({ result }: { result: ToolSuccess }) {
  if (result.rows.length === 0) return null;
  return (
    <table className="calc-table memory">
      <thead><tr><th>Item</th><th>Obtido</th><th>Máx</th></tr></thead>
      <tbody>
        {result.rows.map((row) => (
          <tr key={row.label}><td>{row.label}</td><td>{row.value}</td><td>{row.max}</td></tr>
        ))}
      </tbody>
    </table>
  );
}

export function CalcMemory({ steps }: { steps: string[] }) {
  if (steps.length === 0) return null;
  return (
    <ol className="calc-steps">
      {steps.map((step) => <li key={step}>{step}</li>)}
    </ol>
  );
}

export function Hint({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="hint">
      <button className="hint-btn" type="button" aria-expanded={open} title={text} onClick={() => setOpen((value) => !value)}>?</button>
      {open ? <span className="hint-box" role="tooltip">{text}</span> : null}
    </span>
  );
}

export function Toast({ message }: { message: string | null }) {
  const [text, setText] = useState<string | null>(null);
  useEffect(() => {
    if (!message) return;
    setText(message);
    const timer = window.setTimeout(() => setText(null), 3200);
    return () => window.clearTimeout(timer);
  }, [message]);
  if (!text) return null;
  return <div className="toaster" role="status">{text}</div>;
}

export function Panel({ title, note, children }: { title: string; note?: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <section className="paper tool-block">
      <div className="section-row">
        <h2>{title}</h2>
        <button className="btn-ghost btn-sm" type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>{open ? "Recolher" : "Abrir"}</button>
      </div>
      {note}
      {open ? children : null}
    </section>
  );
}

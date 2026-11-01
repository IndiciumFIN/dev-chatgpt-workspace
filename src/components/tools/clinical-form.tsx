import { Calculator, Eraser } from "lucide-react";
import { ReferenceList } from "@/components/article/pieces";
import { CalcMemory, Hint, MemoryTable, Meter, Panel, ScoreCard, Toast } from "@/components/tools/interface";
import { hasBlock } from "@/lib/component-contract";
import type { ToolFailure, ToolSuccess } from "@/lib/tools/engine";
import type { ClinicalTool } from "@/lib/tools/types";

export type ClinicalPatient = { nome: string; idade: string; setor: string; data: string; meta: Record<string, string> };

export function ClinicalForm({
  tool,
  patient,
  onPatient,
  raw,
  onRaw,
  answers,
  onAnswer,
  result,
  filled,
  onCalculate,
  onClearCalc,
  onClearPatient,
  compact = false,
}: {
  tool: ClinicalTool;
  patient: ClinicalPatient;
  onPatient: (patient: ClinicalPatient) => void;
  raw: Record<string, string>;
  onRaw: (raw: Record<string, string>) => void;
  answers: Record<string, number>;
  onAnswer: (answers: Record<string, number>) => void;
  result: ToolSuccess | ToolFailure | null;
  filled: number;
  onCalculate: () => void;
  onClearCalc: () => void;
  onClearPatient: () => void;
  compact?: boolean;
}) {
  const showPatient = hasBlock(tool.kind, "paciente");
  const criteria = tool.criteria ?? [];
  const toastMessage = result && !result.ok ? result.message : result?.ok ? "Cálculo pronto." : null;
  return (
    <div className="clinical-form tool-layout">
      <div className="tool-stack">
        {showPatient ? (
        <Panel title="Dados do paciente" note={<p className="tool-help">Fica só nesta tela. Não entra em cookie nem no navegador.</p>}>
          <div className="patient-grid">
            <label className="field"><span>Nome</span><input autoComplete="off" value={patient.nome} onChange={(event) => onPatient({ ...patient, nome: event.target.value })} /></label>
            <label className="field"><span>Idade</span><input value={patient.idade} onChange={(event) => onPatient({ ...patient, idade: event.target.value })} /></label>
            <label className="field"><span>Unidade / leito</span><input value={patient.setor} onChange={(event) => onPatient({ ...patient, setor: event.target.value })} /></label>
            <label className="field"><span>Data</span><input type="date" value={patient.data} onChange={(event) => onPatient({ ...patient, data: event.target.value })} /></label>
            {(tool.metaFields ?? []).map((field) => (
              <label key={field.id} className="field">
                <span>{field.label}</span>
                <select value={patient.meta[field.id] ?? ""} onChange={(event) => onPatient({ ...patient, meta: { ...patient.meta, [field.id]: event.target.value } })}>
                  {field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
            ))}
          </div>
        </Panel>
        ) : null}
        <section className="paper tool-block">
          <div className="section-row">
            <h2>{tool.kind === "escala" ? "Critérios" : "Dados para cálculo"}</h2>
            {tool.kind === "escala" ? <p className="tool-help">{filled}/{criteria.length}</p> : null}
          </div>
          {tool.kind === "escala" ? <Meter value={filled} max={criteria.length} label="Critérios preenchidos" /> : null}
          {tool.kind === "escala"
            ? criteria.map((criterion) => {
                const max = Math.max(...criterion.choices.map((choice) => choice.value));
                const value = answers[criterion.id] ?? 0;
                return (
                <fieldset key={criterion.id} className={result && !result.ok && result.missing?.includes(criterion.id) ? "criterion criterion-miss" : "criterion"} aria-invalid={result && !result.ok && result.missing?.includes(criterion.id) ? true : undefined}>
                  <legend>{criterion.label} <Hint text={criterion.help} /></legend>
                  <Meter value={answers[criterion.id] === undefined ? 0 : value} max={max} label={criterion.label} />
                  <div className="choice-list">
                    {criterion.choices.map((choice) => {
                      const selected = answers[criterion.id] === choice.value;
                      return (
                        <label key={choice.value} className={selected ? "choice choice-on" : "choice"}>
                          <input
                            id={choice.value === criterion.choices[0]?.value ? `criterio-${criterion.id}` : undefined}
                            type="radio"
                            name={criterion.id}
                            value={choice.value}
                            checked={selected}
                            onChange={() => onAnswer({ ...answers, [criterion.id]: choice.value })}
                          />
                          <b>{choice.value}</b>
                          <span>{choice.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
                );
              })
            : (
              <>
                {(tool.fields ?? []).map((field) => (
                  <label key={field.id} className="field">
                    <span>{field.label} ({field.unit}) <abbr title="Obrigatório">*</abbr></span>
                    <input
                      id={`campo-${field.id}`}
                      inputMode="decimal"
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      aria-required="true"
                      aria-invalid={result && !result.ok && result.fieldErrors?.[field.id] ? true : undefined}
                      aria-describedby={result && !result.ok && result.fieldErrors?.[field.id] ? `limite-${field.id} erro-${field.id}` : `limite-${field.id}`}
                      title={`De ${field.min} a ${field.max} ${field.unit}`}
                      value={raw[field.id] ?? ""}
                      aria-label={field.label}
                      onChange={(event) => onRaw({ ...raw, [field.id]: event.target.value })}
                    />
                    <small id={`limite-${field.id}`} className="tool-help">De {field.min} a {field.max} {field.unit}.</small>
                    {result && !result.ok && result.fieldErrors?.[field.id] ? <small id={`erro-${field.id}`} className="err">{result.fieldErrors[field.id]}</small> : null}
                  </label>
                ))}
                {(tool.selects ?? []).map((field) => (
                  <fieldset key={field.id} className="criterion">
                    <legend>{field.label}</legend>
                    <div className="choice-list">
                      {field.options.map((option, index) => {
                        const selected = raw[field.id] === String(option.value);
                        return (
                          <label key={option.value} className={selected ? "choice choice-on" : "choice"}>
                            <input
                              id={index === 0 ? `campo-${field.id}` : undefined}
                              type="radio"
                              name={field.id}
                              checked={selected}
                              onChange={() => onRaw({ ...raw, [field.id]: String(option.value) })}
                            />
                            <span>{option.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                ))}
              </>
            )}
          <div className="tool-actions">
            <button className="btn-navy btn-sm" type="button" onClick={onCalculate}><Calculator size={16} aria-hidden="true" /> Calcular</button>
            <button className="btn-ghost btn-sm" type="button" onClick={onClearCalc}><Eraser size={16} aria-hidden="true" /> Limpar cálculo</button>
            {showPatient ? <button className="btn-ghost btn-sm" type="button" onClick={onClearPatient}>Limpar paciente</button> : null}
          </div>
        </section>
      </div>
      <aside className="paper tool-result" id="resultado" tabIndex={-1} aria-live="polite">
        <h2>Resultado</h2>
        {!result ? (
          <div className="tool-result-placeholder">
            <p className="tool-help">Aguardando cálculo. Confira o preenchimento antes de calcular.</p>
            {tool.kind === "escala" ? <p className="tool-help">Critérios preenchidos: {filled} de {criteria.length}.</p> : <p className="tool-help">O resultado e a memória do cálculo aparecem aqui depois da validação.</p>}
          </div>
        ) : null}
        {result && !result.ok ? <p className="err" role="alert">{result.message}</p> : null}
        {result?.ok ? <ScoreCard result={result} /> : null}
        {result?.ok && result.band ? <p className={`tone-${result.band.tone}`}><b>Interpretação:</b> {result.band.note}</p> : null}
        {result?.ok && hasBlock(tool.kind, "memoria") ? <MemoryTable result={result} /> : null}
        {result?.ok && result.steps && hasBlock(tool.kind, "memoria-calculo") ? <CalcMemory steps={result.steps} /> : null}
      </aside>
      {compact || !hasBlock(tool.kind, "referencia") ? null : (
        <section className="paper tool-block tool-refs">
          <h2>Referências</h2>
          <ReferenceList items={tool.references} />
        </section>
      )}
      <Toast message={toastMessage} />
    </div>
  );
}

import { useRef, useState, type FormEvent } from 'react';
import { validateRecord, type FieldDef, type Values } from '../lib/validate.ts';

type Props = { fields: FieldDef[]; initial: Values; rules?: (v: Values) => Record<string, string>; submitLabel: string; onSubmit: (v: Values) => void; onCancel: () => void; onDirty?: (dirty: boolean) => void };

/** Formulário governado: label sempre visível, obrigatório/opcional, ajuda, validação inline e resumo com foco no primeiro erro. */
export function RecordForm({ fields, initial, rules, submitLabel, onSubmit, onCancel, onDirty }: Props) {
  const [values, setValues] = useState<Values>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const summary = useRef<HTMLDivElement>(null);
  const set = (k: string, v: unknown) => { setValues(p => ({ ...p, [k]: v })); onDirty?.(true); };
  function submit(e: FormEvent) {
    e.preventDefault();
    const out: Values = {};
    for (const f of fields) {
      const raw = values[f.key];
      out[f.key] = f.type === 'bool' ? raw === true : f.type === 'number' ? (raw === '' || raw === undefined || raw === null ? undefined : Number(raw)) : typeof raw === 'string' ? raw.trim() : raw;
    }
    const errs = { ...validateRecord(fields, out), ...(rules?.(out) ?? {}) };
    setErrors(errs);
    if (Object.keys(errs).length) { setTimeout(() => summary.current?.focus(), 0); return; }
    onSubmit(out);
  }
  const errList = Object.entries(errors);
  return <form className="form" onSubmit={submit} noValidate>
    {errList.length > 0 && <div className="errsum wide" role="alert" tabIndex={-1} ref={summary}><strong>{errList.length} campo(s) a corrigir:</strong><ul>{errList.map(([k, m]) => <li key={k}><a href={`#f-${k}`} onClick={ev => { ev.preventDefault(); document.getElementById(`f-${k}`)?.focus(); }}>{fields.find(f => f.key === k)?.label ?? k}</a>: {m}</li>)}</ul></div>}
    {fields.map(f => {
      const err = errors[f.key]; const id = `f-${f.key}`; const hid = `${id}-h`;
      const common = { id, 'aria-invalid': err ? true : undefined, 'aria-describedby': `${f.help ? hid : ''} ${err ? `${id}-e` : ''}`.trim() || undefined } as const;
      const wide = f.type === 'textarea';
      return <div key={f.key} className={`field${f.type === 'bool' ? ' check' : ''}${wide ? ' wide' : ''}`}>
        {f.type === 'bool' ? <label><input type="checkbox" {...common} checked={values[f.key] === true} onChange={e => set(f.key, e.target.checked)} />{f.label}</label> : <label htmlFor={id}>{f.label} <span style={{ fontWeight: 400, color: 'var(--color-muted)' }}>{f.required ? '(obrigatório)' : '(opcional)'}</span></label>}
        {f.type === 'textarea' ? <textarea {...common} value={String(values[f.key] ?? '')} onChange={e => set(f.key, e.target.value)} />
          : f.type === 'select' ? <select {...common} value={String(values[f.key] ?? '')} onChange={e => set(f.key, e.target.value)}><option value="">Selecione…</option>{f.options?.map(o => <option key={o} value={o}>{o.replaceAll('_', ' ')}</option>)}</select>
          : f.type === 'bool' ? null : <input {...common} type={f.type === 'date' ? 'date' : f.type === 'number' ? 'number' : 'text'} step={f.type === 'number' ? 'any' : undefined} value={String(values[f.key] ?? '')} onChange={e => set(f.key, e.target.value)} />}
        {f.help && <span className="help" id={hid}>{f.help}</span>}{err && <span className="err" id={`${id}-e`}>{err}</span>}
      </div>;
    })}
    <div className="row wide" style={{ justifyContent: 'flex-end' }}><button type="button" className="btn" onClick={onCancel}>Cancelar</button><button type="submit" className="btn primary">{submitLabel}</button></div>
  </form>;
}

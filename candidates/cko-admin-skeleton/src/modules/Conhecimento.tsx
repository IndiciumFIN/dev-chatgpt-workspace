import { useState } from 'react';
import { CrudModule } from './Crud.tsx';
import { EmptyState, Panel, StatusBadge, SyntheticTag, Tabs, Tag, useToast } from '../ds/ui.tsx';
import { schemas } from '../data/schemas.ts';
import { runReferenceTest } from '../lib/formulas.ts';
import { useCollection, type Row } from '../lib/local-db.ts';
import { validateRecord } from '../lib/validate.ts';

export function Atoms() {
  const [tab, setTab] = useState('revisao'); const col = useCollection<Row>('atoms', 'ATM'); const toast = useToast();
  const pending = col.rows.filter(a => !a.archived && a.status === 'pendente');
  const [selId, setSelId] = useState<string | null>(null); const [extracted, setExtracted] = useState(''); const [note, setNote] = useState(''); const [err, setErr] = useState('');
  const sel = pending.find(a => a.id === selId) ?? pending[0];
  function decide(status: 'aceito' | 'corrigido' | 'rejeitado') {
    if (!sel) return;
    const next = { ...sel, status, extracted: status === 'corrigido' ? extracted || String(sel.extracted) : sel.extracted, reviewNote: note };
    const errs = { ...validateRecord(schemas.atoms.fields, next), ...(schemas.atoms.rules?.(next) ?? {}) };
    if (Object.keys(errs).length) return setErr(Object.values(errs).join(' '));
    col.save({ status, extracted: next.extracted, reviewNote: note }, String(sel.id)); setErr(''); setNote(''); setExtracted(''); toast(`${String(sel.id)}: ${status}`);
  }
  return <div className="grid"><Tabs label="Extração" value={tab} onChange={setTab} tabs={[{ id: 'revisao', label: `Revisão (${pending.length})` }, { id: 'cadastro', label: 'Cadastro' }]} />
    {tab === 'cadastro' ? <CrudModule schemaName="atoms" /> : !sel ? <EmptyState title="Nenhuma extração pendente.">Sem pipeline de extração conectado: cadastre átomos manualmente na aba Cadastro.</EmptyState> :
      <div className="grid g2" style={{ alignItems: 'start' }}>
        <Panel title="Fila de revisão"><ul className="attn">{pending.map(a => <li key={String(a.id)} className="media"><div className="grow"><button type="button" className="btn" aria-pressed={a.id === sel.id} onClick={() => { setSelId(String(a.id)); setExtracted(''); setNote(''); setErr(''); }}>{String(a.id)} · {String(a.locator)}</button> {Boolean(a.synthetic) && <SyntheticTag />}</div></li>)}</ul></Panel>
        <Panel title={`${String(sel.id)} · ${String(sel.locator)}`} subtitle={`Fonte ${String(sel.sourceId)}`}>
          <div className="cmp"><div><strong>Texto original</strong><pre className="diff" style={{ display: 'block' }}>{String(sel.original)}</pre></div><div><strong>Átomo extraído</strong><div className="field"><label className="sr" htmlFor="atom-x">Átomo extraído (editável)</label><textarea id="atom-x" value={extracted || String(sel.extracted)} onChange={e => setExtracted(e.target.value)} /></div></div></div>
          <div className="field" style={{ marginTop: 10 }}><label htmlFor="atom-n">Nota de revisão <span style={{ fontWeight: 400 }}>(obrigatória ao corrigir ou rejeitar)</span></label><textarea id="atom-n" value={note} onChange={e => setNote(e.target.value)} aria-invalid={err ? true : undefined} /></div>
          {err && <div className="errsum" role="alert">{err}</div>}
          <div className="row" style={{ marginTop: 10 }}><button type="button" className="btn primary" onClick={() => decide('aceito')}>Aceitar</button><button type="button" className="btn" onClick={() => decide('corrigido')}>Corrigir e aceitar</button><button type="button" className="btn danger" onClick={() => decide('rejeitado')}>Rejeitar</button></div>
          <p className="note">Aceite humano não vira homologação clínica; a revisão clínica é registrada em “Revisão clínica”.</p>
        </Panel></div>}
  </div>;
}

export function RefTests() {
  const toast = useToast();
  return <CrudModule schemaName="reftests" headerExtra={({ rows, save }) => <button type="button" className="btn" onClick={() => { let f = 0; rows.filter(r => !r.archived).forEach(r => { const o = runReferenceTest({ formulaId: String(r.formulaId), inputsJson: String(r.inputsJson), expected: Number(r.expected), tolerance: Number(r.tolerance) }); if (o.result !== 'passou') f += 1; save({ lastResult: o.result, lastMessage: o.message, lastRunAt: new Date().toISOString() }, String(r.id)); }); toast(f ? `${f} teste(s) não passaram` : 'Todos os testes passaram', f ? 'err' : 'ok'); }}>Executar todos</button>}
    detailExtra={(row, { save }) => <div className="grid"><div className="row"><StatusBadge value={String(row.lastResult ?? 'nao_executado')} />{Boolean(row.lastMessage) && <span style={{ fontSize: '.8rem' }}>{String(row.lastMessage)}</span>}</div>
      <button type="button" className="btn" onClick={() => { const o = runReferenceTest({ formulaId: String(row.formulaId), inputsJson: String(row.inputsJson), expected: Number(row.expected), tolerance: Number(row.tolerance) }); save({ lastResult: o.result, lastMessage: o.message, lastRunAt: new Date().toISOString() }, String(row.id)); }}>Executar este caso</button></div>} />;
}

export function Apis() {
  return <CrudModule schemaName="apis" detailExtra={row => {
    const q = Number(row.quotaMonthly); const u = Number(row.quotaUsed); const pct = q > 0 ? Math.round((u / q) * 100) : null;
    return <div className="grid"><div className="row">{pct !== null && <Tag tone={pct >= 100 ? 'danger' : pct >= 80 ? 'warn' : 'ok'}>Cota: {pct}% ({u}/{q})</Tag>}{row.status === 'quarentena' && <Tag tone="warn">Dados entram como candidatos</Tag>}{row.status === 'sombra' && <Tag tone="info">Roda em paralelo, sem publicar</Tag>}</div>
      <p className="note">O valor da credencial não é guardado nem exibido neste console.</p></div>;
  }} />;
}

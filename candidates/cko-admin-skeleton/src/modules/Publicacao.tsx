import { useMemo, useState } from 'react';
import { CrudModule } from './Crud.tsx';
import { ConfirmDialog, EmptyState, Panel, SourceStamp, StatusBadge, Stat, Tabs, Tag, Timeline, useToast } from '../ds/ui.tsx';
import { FieldDiff } from '../ds/viz.tsx';
import { todayISO } from '../core/state.ts';
import { sha256Hex } from '../lib/hash-chain.ts';
import { logAudit, useCollection, useKey, type Row } from '../lib/local-db.ts';
import { DIFF_FIELDS, diffSnapshots, evaluateGates, type Snapshot } from '../lib/publication-gates.ts';
import { redirectIssue } from '../lib/redirects.ts';

const EMPTY_SNAP: Snapshot[] = [];
type R = Record<string, unknown>;
const s = (r: R, k: string) => String(r[k] ?? '');

export function Publication() {
  const pages = useCollection<Row>('pages', 'PAG').rows; const seo = useCollection<Row>('seo', 'SEO').rows; const reviews = useCollection<Row>('reviews', 'REV').rows;
  const sources = useCollection<Row>('sources', 'FONTE').rows; const reftests = useCollection<Row>('reftests', 'TST').rows;
  const [snaps, setSnaps] = useKey<Snapshot[]>('publication:snapshots', EMPTY_SNAP); const toast = useToast();
  const [tab, setTab] = useState('ensaio'); const [ack, setAck] = useState(false); const [rollback, setRollback] = useState<Snapshot | null>(null);
  const report = useMemo(() => evaluateGates({ today: todayISO(), pages, seo, reviews, sources, reftests }), [pages, seo, reviews, sources, reftests]);
  const included = useMemo(() => pages.filter(p => !p.archived && p.include === true), [pages]);
  const last = snaps[snaps.length - 1]; const diffs = diffSnapshots(last?.pages, included);
  async function commit(label: string, content: R[]) {
    const prevHash = last?.hash ?? '0'.repeat(64); const rev = snaps.length + 1;
    const hash = await sha256Hex(JSON.stringify([rev, prevHash, content.map(p => [s(p, 'slug'), s(p, 'title'), s(p, 'lead'), s(p, 'template'), s(p, 'sourceIds'), s(p, 'status')])]));
    setSnaps(p => [...p, { rev, at: new Date().toISOString(), label, pages: content, hash, prevHash }]);
    await logAudit('PUBLICAR', `publication/rev-${rev}`, `${label} (${content.length} página(s)).`); toast(`Projeção local rev. ${rev} registrada.`);
  }
  const canPublish = !report.blocked && diffs.length > 0 && ack;
  return <div className="grid">
    <div className="grid g4"><Stat label="Páginas incluídas" value={included.length} note="No rascunho" /><Stat label="Mudanças vs. publicado" value={diffs.length} /><Stat label="Bloqueios" value={report.perPage.reduce((n, p) => n + p.blockers.length, 0) + report.global.length} /><Stat label="md_gate" value="fechado" note="RELEASED indisponível" /></div>
    <Tabs label="Publicação" value={tab} onChange={setTab} tabs={[{ id: 'ensaio', label: 'Ensaio (dry-run)' }, { id: 'gates', label: 'Gates' }, { id: 'hist', label: `Histórico (${snaps.length})` }, { id: 'proj', label: 'Projeção publicada' }]} />
    {tab === 'ensaio' && <Panel title="Ensaio de publicação" subtitle="Mostra exatamente o que mudaria, sem gravar nada.">
      {diffs.length === 0 ? <EmptyState title="Sem diferenças em relação à última projeção.">Inclua páginas no rascunho ou altere campos para ver o diff.</EmptyState> :
        diffs.map(d => <div key={d.slug} style={{ marginBottom: 14 }}><Tag tone={d.kind === 'removido' ? 'danger' : d.kind === 'novo' ? 'ok' : 'info'}>{d.kind}</Tag> <strong>{d.slug}</strong>{d.kind === 'alterado' && <FieldDiff before={d.before} after={d.after} fields={DIFF_FIELDS} />}</div>)}
      {report.blocked && <div className="errsum" role="alert">Publicação bloqueada pelos gates (aba Gates).</div>}
      <div className="row" style={{ marginTop: 12 }}><label className="row" style={{ minHeight: 44 }}><input type="checkbox" checked={ack} onChange={e => setAck(e.target.checked)} />Entendo que isto é uma projeção local e não publica em produção.</label>
        <button type="button" className="btn primary" disabled={!canPublish} onClick={() => { void commit('Projeção local', included); setAck(false); }}>Registrar projeção local</button></div>
      {!canPublish && <p className="note">Habilita quando: sem bloqueios, com diferenças e com a confirmação marcada.</p>}
    </Panel>}
    {tab === 'gates' && <Panel title="Gates de pré-publicação" subtitle="Fonte declarada e vigente, SEO coerente, candidata noindex, revisão válida, testes de referência.">
      {report.global.map(g => <div key={g} className="errsum" role="alert" style={{ marginBottom: 8 }}>{g}</div>)}
      {report.perPage.length === 0 ? <EmptyState title="Nenhuma página incluída.">Marque “Incluir na próxima publicação” em Conteúdos.</EmptyState> :
        <ul className="attn">{report.perPage.map(p => <li key={p.slug} className={p.blockers.length ? 'critica' : p.warnings.length ? 'media' : 'baixa'}><div className="grow"><strong>{p.slug}</strong>{p.blockers.map(b => <small key={b}>⛔ {b}</small>)}{p.warnings.map(w => <small key={w}>⚠ {w}</small>)}{!p.blockers.length && !p.warnings.length && <small>Sem bloqueios nem avisos.</small>}</div><Tag tone={p.blockers.length ? 'danger' : 'ok'}>{p.blockers.length ? 'bloqueada' : 'liberada'}</Tag></li>)}</ul>}
      <p className="note">Gate <code>md_gate</code>: fechado. Nenhuma página vai a RELEASED a partir daqui.</p></Panel>}
    {tab === 'hist' && <Panel title="Histórico de projeções" subtitle="Hash encadeado por revisão. Reverter cria uma NOVA revisão; nada é sobrescrito.">
      {snaps.length === 0 ? <EmptyState title="Nenhuma projeção registrada." /> : <Timeline items={[...snaps].reverse().map(x => ({ at: x.at, title: `rev. ${x.rev} · ${x.label} · ${x.pages.length} página(s)`, detail: `hash ${x.hash.slice(0, 16)}… ← ${x.prevHash.slice(0, 8)}…` }))} />}
      <div className="row" style={{ marginTop: 12 }}>{snaps.slice(0, -1).map(x => <button key={x.rev} type="button" className="btn" onClick={() => setRollback(x)}>Reverter para rev. {x.rev}</button>)}</div></Panel>}
    {tab === 'proj' && <Panel title="Projeção publicada (local)" subtitle="O que o site local exibiria e o que entra no sitemap.">
      {!last ? <EmptyState title="Nada publicado ainda." /> : <div className="tablewrap"><table><thead><tr><th>Slug</th><th>Título</th><th>Situação</th><th>Sitemap</th></tr></thead><tbody>{last.pages.map(p => { const m = seo.find(x => x.route === `/ferramentas/${s(p, 'slug')}`); const idx = m && m.noindex !== true && s(p, 'status') === 'homologada'; return <tr key={s(p, 'slug')}><td>{s(p, 'slug')}</td><td>{s(p, 'title')}</td><td><StatusBadge value={s(p, 'status')} /></td><td>{idx ? 'no sitemap' : 'fora do índice (noindex)'}</td></tr>; })}</tbody></table></div>}
      {last && <SourceStamp source="publication:snapshots" revision={last.rev} date={last.at.slice(0, 10)} />}</Panel>}
    {rollback && <ConfirmDialog title={`Reverter para rev. ${rollback.rev}?`} confirmLabel="Criar nova revisão" onCancel={() => setRollback(null)} onConfirm={() => { void commit(`Reversão ao conteúdo da rev. ${rollback.rev}`, rollback.pages); setRollback(null); }}>Cria uma nova revisão com o conteúdo da rev. {rollback.rev}. O rascunho atual não é alterado.</ConfirmDialog>}
  </div>;
}

type Locale = { code: string; enabled: boolean; isDefault: boolean };
const DEFAULT_LOCALES: Locale[] = [{ code: 'pt-BR', enabled: true, isDefault: true }, { code: 'en', enabled: false, isDefault: false }, { code: 'es', enabled: false, isDefault: false }];

export function Site() {
  const [tab, setTab] = useState('seo'); const seo = useCollection<Row>('seo', 'SEO').rows; const [locales, setLocales] = useKey<Locale[]>('site:locales', DEFAULT_LOCALES); const [code, setCode] = useState(''); const [err, setErr] = useState('');
  const add = () => { if (!/^[a-z]{2}(-[A-Z]{2})?$/.test(code)) return setErr('Use um código como “fr” ou “pt-PT”.'); if (locales.some(l => l.code === code)) return setErr('Locale já cadastrado.'); setErr(''); setLocales(p => [...p, { code, enabled: false, isDefault: false }]); setCode(''); void logAudit('CRIAR', `site:locales/${code}`, 'Locale adicionado.'); };
  return <div className="grid"><Tabs label="Configuração do site" value={tab} onChange={setTab} tabs={[{ id: 'seo', label: 'SEO e JSON-LD' }, { id: 'red', label: 'Redirecionamentos' }, { id: 'map', label: 'Sitemap' }, { id: 'loc', label: 'Idiomas' }]} />
    {tab === 'seo' && <CrudModule schemaName="seo" />}
    {tab === 'red' && <CrudModule schemaName="redirects" extraRules={(v, rows, id): Record<string, string> => { const i = redirectIssue(rows, { from: String(v.from ?? ''), to: String(v.to ?? '') }, id); return i ? { to: i } : {}; }} />}
    {tab === 'map' && <Panel title="Sitemap derivado" subtitle="Somente páginas homologadas e indexáveis entram; candidatas ficam fora.">
      {seo.filter(x => !x.archived).length === 0 ? <EmptyState title="Sem metadados cadastrados." /> : <div className="tablewrap"><table><thead><tr><th>Rota</th><th>Situação</th><th>Sitemap</th></tr></thead><tbody>{seo.filter(x => !x.archived).map(x => <tr key={s(x, 'id')}><td>{s(x, 'route')}</td><td><StatusBadge value={s(x, 'status')} /></td><td>{x.noindex !== true && s(x, 'status') === 'homologada' ? 'incluída' : 'fora do índice'}</td></tr>)}</tbody></table></div>}</Panel>}
    {tab === 'loc' && <Panel title="Idiomas" subtitle="O CKO atende 19 idiomas; cadastre os códigos aqui. Cobertura de tradução exige o pipeline (não conectado).">
      <ul className="attn">{locales.map(l => <li key={l.code} className="baixa"><div className="grow"><strong>{l.code}</strong> {l.isDefault && <Tag tone="info">padrão</Tag>}</div>
        <label className="row" style={{ minHeight: 44 }}><input type="checkbox" checked={l.enabled} disabled={l.isDefault} onChange={() => setLocales(p => p.map(x => x.code === l.code ? { ...x, enabled: !x.enabled } : x))} />Habilitado</label>
        {!l.isDefault && <button type="button" className="btn" onClick={() => setLocales(p => p.map(x => ({ ...x, isDefault: x.code === l.code, enabled: x.code === l.code ? true : x.enabled })))}>Tornar padrão</button>}</li>)}</ul>
      <div className="row" style={{ marginTop: 10, alignItems: 'flex-end' }}><div className="field"><label htmlFor="loc-new">Novo idioma</label><input id="loc-new" value={code} onChange={e => setCode(e.target.value)} aria-invalid={err ? true : undefined} />{err && <span className="err">{err}</span>}</div><button type="button" className="btn" onClick={add}>Adicionar</button></div></Panel>}
  </div>;
}

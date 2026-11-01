import { useMemo, useState } from 'react';
import { DataTable } from '../ds/DataTable.tsx';
import { EmptyState, KeyValue, Panel, Stat, StatusBadge, Tabs, Tag, useToast, type Tone } from '../ds/ui.tsx';
import { GraphView } from '../ds/viz.tsx';
import { useAuditStatus, useChangeEvents, useDecisions, useEdges, useLedger } from '../core/state.ts';
import { sha256Hex } from '../lib/hash-chain.ts';
import {
  DEFAULT_SEVERITY_MATRIX, analyzeImpact, buildTriageDrafts, classifyChange, computeCoverage, pendingSuggestions, processChangeEvent, validateDecision,
  type ChangeClass, type ChangeEvent, type DependencyEdge, type ImpactCandidate, type ImpactDecision, type NodeKind, type NodeRef, type RelationType, type Severity,
} from '../lib/impact-engine.ts';
import { exportAllKeys, logAudit, useCollection, type Row } from '../lib/local-db.ts';

const KINDS: NodeKind[] = ['normativo', 'dispositivo', 'atomo_normativo', 'atomo_editorial', 'formula', 'template', 'composicao', 'pagina', 'publicacao'];
const CLASSES: ChangeClass[] = ['metadados', 'estrutura_apresentacao', 'redacao_editorial', 'requisito', 'valor_dado', 'formula', 'aplicabilidade', 'validade', 'direitos_uso', 'revogacao', 'indeterminada'];
const RELS: RelationType[] = ['derivado_de', 'explica', 'resume', 'contrapoe', 'usa_como_dado', 'usa_template', 'usa_formula', 'compoe', 'publica'];
const SEV: Record<Severity, Tone> = { critica: 'danger', alta: 'warn', media: 'info', baixa: 'neutral' };
const ref = (n: NodeRef) => `${n.kind}:${n.id}@${n.version}`;
const sel = (id: string, label: string, value: string, set: (v: string) => void, opts: readonly string[]) => <div className="field"><label htmlFor={id}>{label}</label><select id={id} value={value} onChange={e => set(e.target.value)}>{opts.map(o => <option key={o}>{o}</option>)}</select></div>;
const inp = (id: string, label: string, value: string, set: (v: string) => void, help?: string) => <div className="field"><label htmlFor={id}>{label}</label><input id={id} value={value} onChange={e => set(e.target.value)} />{help && <span className="help">{help}</span>}</div>;

export function Impact() {
  const [tab, setTab] = useState('eventos'); const toast = useToast();
  const [edges, setEdges] = useEdges(); const [events, setEvents] = useChangeEvents(); const [ledger, setLedger] = useLedger(); const [decisions, setDecisions] = useDecisions();
  const pages = useCollection<Row>('pages', 'PAG').rows;
  // formulário de evento
  const [kind, setKind] = useState<NodeKind>('dispositivo'); const [oid, setOid] = useState('DISP-1'); const [nv, setNv] = useState('2'); const [pv, setPv] = useState('1');
  const [fields, setFields] = useState('requirement'); const [cls, setCls] = useState<ChangeClass | 'auto'>('auto'); const [by, setBy] = useState('autor-demo'); const [classifier, setClassifier] = useState('');
  const [msg, setMsg] = useState('');
  const candidates = Object.values(ledger.candidates); const decided = new Set(decisions.map(d => d.candidateKey));
  const nodes = useMemo(() => { const m = new Map<string, NodeRef>(); edges.forEach(e => { m.set(ref(e.source), e.source); m.set(ref(e.dependent), e.dependent); }); return [...m.values()]; }, [edges]);
  const computedClass = classifyChange(fields.split(',').map(x => x.trim()).filter(Boolean));

  function process() {
    if (!oid.trim() || !nv.trim() || !pv.trim() || !by.trim()) return setMsg('Preencha objeto, versões e autor da mudança.');
    if (nv === pv) return setMsg('A nova versão deve diferir da anterior.');
    const ev: ChangeEvent = { eventId: `EV-${String(events.length + 1).padStart(3, '0')}`, object: { kind, id: oid.trim(), version: nv.trim() }, previousVersion: pv.trim(), changeClass: cls === 'auto' ? computedClass : cls, classifiedBy: classifier.trim() || undefined, changedBy: by.trim(), changedAt: new Date().toISOString() };
    const r = processChangeEvent(ledger, edges, ev);
    setEvents(p => [...p, ev]); setLedger(r.ledger); setMsg('');
    void logAudit('IMPACTO', `impact/${ev.eventId}`, `Evento ${r.status}: ${r.created.length} candidato(s) (${ev.changeClass}).`);
    toast(`${ev.eventId}: ${r.status} · ${r.created.length} candidato(s)`, r.status === 'falhou' ? 'err' : 'ok');
  }
  return <div className="grid">
    <div className="grid g4"><Stat label="Relações no grafo" value={edges.length} /><Stat label="Eventos" value={events.length} /><Stat label="Candidatos" value={candidates.length} note={`${candidates.filter(c => !decided.has(c.idempotencyKey)).length} sem decisão`} /><Stat label="Matriz de severidade" value="proposta" note={`${DEFAULT_SEVERITY_MATRIX.version} · não aprovada`} /></div>
    <Tabs label="Impacto" value={tab} onChange={setTab} tabs={[{ id: 'eventos', label: 'Registrar mudança' }, { id: 'cand', label: `Candidatos (${candidates.length})` }, { id: 'grafo', label: 'Grafo' }, { id: 'sim', label: 'Simulador “e se”' }, { id: 'cob', label: 'Cobertura' }]} />
    {tab === 'eventos' && <div className="grid g2" style={{ alignItems: 'start' }}>
      <Panel title="Nova mudança de versão" subtitle="O motor percorre só relações validadas. Não reescreve, publica nem suspende nada.">
        <div className="form">{sel('ev-kind', 'Tipo do objeto', kind, v => setKind(v as NodeKind), KINDS)}{inp('ev-id', 'ID do objeto', oid, setOid)}{inp('ev-nv', 'Nova versão', nv, setNv)}{inp('ev-pv', 'Versão anterior', pv, setPv)}
          {inp('ev-f', 'Campos alterados (vírgula)', fields, setFields, `Classe sugerida pelas regras: ${computedClass}. Campo desconhecido vira “indeterminada”.`)}{sel('ev-c', 'Classe', cls, v => setCls(v as ChangeClass | 'auto'), ['auto', ...CLASSES])}
          {inp('ev-by', 'Autor da mudança (Maker)', by, setBy)}{inp('ev-cl', 'Classificação confirmada por', classifier, setClassifier, 'Obrigatório para classes de alto risco.')}</div>
        {msg && <div className="errsum" role="alert" style={{ marginTop: 8 }}>{msg}</div>}
        <div className="row" style={{ marginTop: 10 }}><button type="button" className="btn primary" onClick={process}>Processar mudança</button></div>
        <p className="note">Matriz de severidade PROPOSTA (não aprovada pelos donos de conteúdo/risco).</p>
      </Panel>
      <Panel title="Eventos processados" subtitle="Idempotentes: reprocessar não duplica candidatos.">
        {events.length === 0 ? <EmptyState title="Nenhum evento." /> : <ul className="attn">{events.map(e => { const r = ledger.events[e.eventId]; return <li key={e.eventId} className="baixa"><div className="grow"><strong>{e.eventId} · {ref(e.object)}</strong><small>{e.changeClass} · anterior {e.previousVersion} · tentativas {r?.attempts ?? 0}</small></div><StatusBadge value={r?.state ?? 'nao_executado'} /></li>; })}</ul>}</Panel>
    </div>}
    {tab === 'cand' && <Candidates candidates={candidates} decisions={decisions} onDecide={d => { setDecisions(p => [...p, d]); void logAudit('DECISAO', `impact/${d.candidateKey}`, `${d.outcome} por ${d.reviewerId}.`); toast('Decisão registrada.'); }} />}
    {tab === 'grafo' && <GraphTab edges={edges} setEdges={setEdges} />}
    {tab === 'sim' && <Simulator edges={edges} nodes={nodes} />}
    {tab === 'cob' && (() => { const slugs = pages.filter(p => !p.archived && p.include === true).map(p => String(p.slug)); const r = computeCoverage(slugs, edges, nodes);
      return <Panel title="Cobertura" subtitle="Com numerador e denominador. Nunca um “100% rastreável” sem definir a regra."><div className="grid g3"><Stat label="Páginas com cadeia validada até norma" value={`${r.pagesWithValidatedSource} / ${r.publishedPages}`} /><Stat label="Relações sugeridas pendentes" value={r.suggestedEdgesPending} /><Stat label="Relações com nó fora do registro" value={r.danglingEdges} /></div>
        {r.pagesWithoutSource.length > 0 && <p>Sem fonte rastreável: {r.pagesWithoutSource.join(', ')}</p>}<p className="note">{r.note}</p></Panel>; })()}
  </div>;
}

function Candidates({ candidates, decisions, onDecide }: { candidates: ImpactCandidate[]; decisions: ImpactDecision[]; onDecide: (d: ImpactDecision) => void }) {
  const [key, setKey] = useState(''); const [outcome, setOutcome] = useState<ImpactDecision['outcome']>('impacta'); const [rev, setRev] = useState(''); const [maker, setMaker] = useState('autor-demo'); const [just, setJust] = useState(''); const [evid, setEvid] = useState(''); const [errs, setErrs] = useState<string[]>([]);
  const decided = new Set(decisions.map(d => d.candidateKey)); const c = candidates.find(x => x.idempotencyKey === key);
  const drafts = buildTriageDrafts(candidates, () => undefined);
  if (!candidates.length) return <EmptyState title="Nenhum candidato de impacto.">Registre uma mudança que alcance ativos pelo grafo.</EmptyState>;
  return <div className="grid g2" style={{ alignItems: 'start' }}>
    <Panel title="Candidatos" subtitle="Cada um com severidade, motivo e caminho de dependência.">
      <ul className="attn">{candidates.map(x => <li key={x.idempotencyKey} className={x.severity}><div className="grow"><strong>{ref(x.asset)}</strong><small>{x.reason}</small><small>Caminho: {x.path.map(p => p.node.id).join(' → ')}</small></div><div className="grid"><Tag tone={SEV[x.severity]}>{x.severity}</Tag>{x.blocksPublication && <Tag tone="danger">bloqueia publicação</Tag>}{decided.has(x.idempotencyKey) ? <Tag tone="ok">decidido</Tag> : <button type="button" className="btn" onClick={() => { setKey(x.idempotencyKey); setErrs([]); }}>Decidir</button>}</div></li>)}</ul>
      <h3 style={{ marginTop: 14, fontSize: '.9rem' }}>Rascunhos de OS de triagem</h3><p className="note">Agrupados por responsável e origem. Apenas rascunho: criar a OS exige o fluxo governado.</p>
      <ul>{drafts.map(d => <li key={d.draftId}><code>{d.groupKey}</code> · {d.candidateKeys.length} candidato(s) · {d.severity} · {d.note}</li>)}</ul></Panel>
    <Panel title={c ? `Decisão: ${ref(c.asset)}` : 'Decisão'} subtitle="Impacta · Não impacta · Escalar · Incerto. Maker ≠ Checker.">
      {!c ? <p className="note">Escolha um candidato.</p> : <form className="grid" noValidate onSubmit={e => { e.preventDefault(); const d: ImpactDecision = { candidateKey: c.idempotencyKey, outcome, reviewerId: rev.trim(), makerId: maker.trim(), justification: just, evidenceRefs: evid.split(',').map(x => x.trim()).filter(Boolean), decidedAt: new Date().toISOString() }; const v = validateDecision(c, d); setErrs(v.errors); if (v.ok) { onDecide(d); setKey(''); setJust(''); setEvid(''); } }}>
        <KeyValue items={[['Severidade', c.severity], ['Motivo', c.reason], ['Classificação humana pendente', c.requiresHumanClassification ? 'sim' : 'não']]} />
        {sel('d-o', 'Resultado', outcome, v => setOutcome(v as ImpactDecision['outcome']), ['impacta', 'nao_impacta', 'escalar', 'incerto'])}{inp('d-r', 'Revisor (Checker)', rev, setRev)}{inp('d-m', 'Autor da mudança (Maker)', maker, setMaker)}
        <div className="field"><label htmlFor="d-j">Justificativa</label><textarea id="d-j" value={just} onChange={e => setJust(e.target.value)} /></div>{inp('d-e', 'Evidências (referências, vírgula)', evid, setEvid)}
        {errs.length > 0 && <div className="errsum" role="alert"><ul>{errs.map(e => <li key={e}>{e}</li>)}</ul></div>}
        <div className="row"><button type="submit" className="btn primary">Registrar decisão</button><button type="button" className="btn" onClick={() => setKey('')}>Cancelar</button></div></form>}
      {decisions.length > 0 && <><h3 style={{ marginTop: 14, fontSize: '.9rem' }}>Decisões registradas</h3><ul>{decisions.map(d => <li key={d.candidateKey}><code>{d.candidateKey.split('|').pop()}</code> — {d.outcome} por {d.reviewerId}</li>)}</ul></>}
    </Panel></div>;
}

function GraphTab({ edges, setEdges }: { edges: DependencyEdge[]; setEdges: (v: DependencyEdge[] | ((p: DependencyEdge[]) => DependencyEdge[])) => void }) {
  const toast = useToast();
  const [sk, setSk] = useState<NodeKind>('dispositivo'); const [si, setSi] = useState(''); const [sv, setSv] = useState('1'); const [dk, setDk] = useState<NodeKind>('atomo_normativo'); const [di, setDi] = useState(''); const [dv, setDv] = useState('1'); const [rel, setRel] = useState<RelationType>('derivado_de'); const [loc, setLoc] = useState(''); const [by, setBy] = useState(''); const [err, setErr] = useState('');
  const ev: ChangeEvent = { eventId: 'x', object: { kind: 'dispositivo', id: 'DISP-1', version: '2' }, previousVersion: '1', changeClass: 'requisito', changedBy: '-', changedAt: new Date().toISOString() };
  const sugg = pendingSuggestions(edges, ev);
  const add = () => { if (!si.trim() || !di.trim() || !by.trim()) return setErr('Informe origem, dependente e quem valida.'); setErr(''); setEdges(p => [...p, { source: { kind: sk, id: si.trim(), version: sv }, dependent: { kind: dk, id: di.trim(), version: dv }, relation: rel, locale: loc || undefined, status: 'validada', validatedBy: by.trim(), validatedAt: new Date().toISOString() }]); void logAudit('CRIAR', `impact:edges/${si}->${di}`, 'Relação validada adicionada.'); toast('Relação adicionada.'); };
  return <div className="grid"><Panel title="Grafo de dependências" subtitle="Linhas tracejadas são sugestões não validadas: não propagam impacto."><GraphView edges={edges} /></Panel>
    <Panel title="Nova relação validada" subtitle="Origem → dependente, com versão exata fixada.">
      <div className="form">{sel('g-sk', 'Origem: tipo', sk, v => setSk(v as NodeKind), KINDS)}{inp('g-si', 'Origem: ID', si, setSi)}{inp('g-sv', 'Origem: versão', sv, setSv)}{sel('g-dk', 'Dependente: tipo', dk, v => setDk(v as NodeKind), KINDS)}{inp('g-di', 'Dependente: ID', di, setDi)}{inp('g-dv', 'Dependente: versão', dv, setDv)}{sel('g-r', 'Relação', rel, v => setRel(v as RelationType), RELS)}{inp('g-l', 'Locale (opcional)', loc, setLoc)}{inp('g-b', 'Validada por', by, setBy)}</div>
      {err && <div className="errsum" role="alert">{err}</div>}<div className="row" style={{ marginTop: 10 }}><button type="button" className="btn primary" onClick={add}>Adicionar relação</button></div></Panel>
    {edges.some(e => e.status === 'sugerida') && <Panel title="Sugestões aguardando curador" subtitle="Busca lexical/semântica ou IA só sugere.">
      <ul className="attn">{edges.map((e, i) => e.status === 'sugerida' ? <li key={i} className="media"><div className="grow">{ref(e.source)} → {ref(e.dependent)}</div><button type="button" className="btn" onClick={() => { const who = window.prompt('Quem valida esta relação?'); if (who?.trim()) { setEdges(p => p.map((x, j) => j === i ? { ...x, status: 'validada', validatedBy: who.trim(), validatedAt: new Date().toISOString() } : x)); void logAudit('VALIDAR', 'impact:edges', 'Sugestão validada por curador.'); } }}>Validar</button><button type="button" className="btn danger" onClick={() => setEdges(p => p.filter((_, j) => j !== i))}>Descartar</button></li> : null)}</ul>{sugg.length > 0 && <p className="note">{sugg.length} sugestão(ões) tocam o objeto-exemplo DISP-1.</p>}</Panel>}
  </div>;
}

function Simulator({ edges, nodes }: { edges: DependencyEdge[]; nodes: NodeRef[] }) {
  const sources = nodes.filter(n => edges.some(e => ref(e.source) === ref(n)));
  const [pick, setPick] = useState(''); const [cls, setCls] = useState<ChangeClass>('revogacao');
  const node = sources.find(n => ref(n) === pick) ?? sources[0];
  const result = useMemo(() => node ? analyzeImpact(edges, { eventId: 'SIMULACAO', object: { ...node, version: `${node.version}-novo` }, previousVersion: node.version, changeClass: cls, classifiedBy: 'simulador', changedBy: 'simulador', changedAt: new Date().toISOString() }) : [], [edges, node, cls]);
  if (!node) return <EmptyState title="Grafo sem origens.">Cadastre relações ou carregue os dados sintéticos para simular.</EmptyState>;
  return <Panel title="Simulador “e se”" subtitle="Roda o motor sem gravar nada: o que sai do ar e o que fica sem fonte se isto mudar?">
    <div className="form">{sel('s-n', 'Se esta origem mudar', ref(node), setPick, sources.map(ref))}{sel('s-c', 'Classe da mudança', cls, v => setCls(v as ChangeClass), CLASSES)}</div>
    <p className="count" role="status" aria-live="polite">{result.length} ativo(s) alcançado(s) · {result.filter(r => r.blocksPublication).length} bloqueariam publicação</p>
    {result.length === 0 ? <EmptyState title="Nenhum ativo alcançado." /> : <GraphView edges={edges} highlight={new Set(result.map(r => ref(r.asset)))} />}
    <ul className="attn" style={{ marginTop: 10 }}>{result.map(r => <li key={r.idempotencyKey} className={r.severity}><div className="grow"><strong>{ref(r.asset)}</strong><small>{r.path.map(p => p.node.id).join(' → ')}</small></div><Tag tone={SEV[r.severity]}>{r.severity}</Tag></li>)}</ul>
    <p className="note">Simulação: nada é gravado, publicado ou suspenso.</p></Panel>;
}

export function Audit() {
  const { audit, status } = useAuditStatus();
  const rows = audit.map(a => ({ ...a, id: String(a.seq), short: `${a.hash.slice(0, 12)}…` })) as unknown as Record<string, unknown>[];
  const download = () => { const blob = new Blob([JSON.stringify({ geradoEm: new Date().toISOString(), aviso: 'Trilha local: detecta adulteração do encadeamento; não é auditoria imutável de servidor.', verificacao: status, trilha: audit }, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'trilha-auditoria-local.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); };
  return <div className="grid"><div className="grid g3"><Stat label="Eventos registrados" value={audit.length} /><Stat label="Verificação do encadeamento" value={status ? (status.ok ? 'íntegra' : 'QUEBRADA') : '…'} note={status?.ok === false ? `Elo ${status.brokenAt}: ${status.reason}` : 'SHA-256 de cada elo'} /><Stat label="Ator" value="não autenticado" note="Sem identidade neste ambiente" /></div>
    <Panel title="Trilha de auditoria local" subtitle="Cada mutação neste console gera um elo com hash do anterior." action={<button type="button" className="btn" onClick={download} disabled={!audit.length}>Exportar JSON</button>}>
      <DataTable id="audit" rows={rows} columns={[{ key: 'seq', label: 'Seq' }, { key: 'at', label: 'Quando' }, { key: 'action', label: 'Ação' }, { key: 'objectRef', label: 'Objeto' }, { key: 'summary', label: 'Resumo' }, { key: 'short', label: 'Hash' }]} searchFields={['id', 'action', 'objectRef', 'summary']} statusKey="action" pageSize={10} sourceLabel="audit (localStorage)" emptyHint="Nenhuma ação registrada ainda." defaultSort={{ key: 'seq', dir: 'desc' }} />
      <p className="note">Limite: quem tem acesso ao navegador pode apagar a trilha inteira. Auditoria imutável exige servidor.</p></Panel></div>;
}

export function Auditor() {
  const { audit, status } = useAuditStatus(); const [manifest, setManifest] = useState<Record<string, string> | null>(null);
  const all = exportAllKeys();
  const build = async () => { const m: Record<string, string> = {}; for (const [k, v] of Object.entries(all)) m[k] = await sha256Hex(JSON.stringify(v)); setManifest(m); };
  const download = async () => { const m: Record<string, string> = {}; for (const [k, v] of Object.entries(all)) m[k] = await sha256Hex(JSON.stringify(v)); const pack = { geradoEm: new Date().toISOString(), aviso: 'Pacote NÃO assinado, gerado em ambiente local sem identidade. Dados sintéticos estão marcados em cada linha.', verificacaoDaTrilha: status, manifestoSha256: m, dados: all }; const blob = new Blob([JSON.stringify(pack, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'pacote-de-evidencia-local.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); };
  const count = (k: string) => (Array.isArray(all[k]) ? (all[k] as unknown[]).length : 0);
  return <div className="grid"><Panel title="Modo auditor (somente leitura)" subtitle="Tudo que um auditor pediria, em um pacote. Sem editar, sem ações.">
    <div className="grid g4">{['col:sources', 'col:apis', 'col:reviews', 'col:controls', 'col:pages', 'col:atoms', 'impact:decisions', 'publication:snapshots'].map(k => <Stat key={k} label={k} value={count(k)} />)}</div>
    <div className="row" style={{ marginTop: 12 }}><button type="button" className="btn" onClick={() => void build()}>Calcular manifesto de hashes</button><button type="button" className="btn primary" onClick={() => void download()}>Baixar pacote de evidência (JSON)</button></div>
    {manifest && <div className="tablewrap" style={{ marginTop: 10 }}><table><thead><tr><th>Chave</th><th>SHA-256</th></tr></thead><tbody>{Object.entries(manifest).map(([k, h]) => <tr key={k}><td>{k}</td><td><code>{h}</code></td></tr>)}</tbody></table></div>}
    <p className="note">Trilha: {status ? (status.ok ? `íntegra (${audit.length} elos)` : 'QUEBRADA') : 'verificando'}. O pacote não é assinado.</p></Panel></div>;
}

import { useMemo, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { DataTable } from '../ds/DataTable.tsx';
import { Drawer, DisabledAction, EmptyState, KeyValue, ModeBadge, Panel, SourceStamp, Stat, Stepper, StatusBadge, Tabs, Tag, Timeline, type Tone } from '../ds/ui.tsx';
import { playbooks } from '../data/playbooks.ts';
import { demoCollections, demoEdges } from '../data/demo.ts';
import { modules, MODE_LABEL } from '../core/modules.ts';
import { queue, todayISO, useAttention, useAuditStatus, useEdges, type QueueItem } from '../core/state.ts';
import { setKey, useKey, getKey, type Row } from '../lib/local-db.ts';
import { logAudit } from '../lib/local-db.ts';
import { useToast } from '../ds/ui.tsx';
import type { Severity } from '../lib/impact-engine.ts';
import { useCollection } from '../lib/local-db.ts';

const SEV_TONE: Record<Severity, Tone> = { critica: 'danger', alta: 'warn', media: 'info', baixa: 'neutral' };
type Go = (id: string) => void;

export function AttentionList({ items, go, limit }: { items: ReturnType<typeof useAttention>; go: Go; limit?: number }) {
  const shown = limit ? items.slice(0, limit) : items;
  if (!items.length) return <EmptyState title="Nada exige atenção nos registros atuais.">Isto não prova conformidade: apenas que nenhuma regra de alerta disparou sobre os dados existentes.</EmptyState>;
  return <ul className="attn">{shown.map(a => <li key={a.id} className={a.severity}><Tag tone={SEV_TONE[a.severity]}>{a.severity}</Tag><div className="grow"><strong>{a.title}</strong><small>{a.detail} · Fonte: {a.source}</small></div><button type="button" className="btn" onClick={() => go(a.moduleId)}>Abrir<ArrowUpRight size={14} aria-hidden="true" /></button></li>)}</ul>;
}

function DemoControls() {
  const toast = useToast();
  const load = () => {
    for (const [name, rows] of Object.entries(demoCollections)) {
      const cur = getKey<Row[]>(`col:${name}`, []);
      const ids = new Set(cur.map(r => r.id));
      setKey(`col:${name}`, [...cur, ...rows.filter(r => !ids.has(r.id))]);
    }
    setKey('impact:edges', [...getKey('impact:edges', []), ...demoEdges.filter(e => !getKey<typeof demoEdges>('impact:edges', []).some(x => JSON.stringify(x) === JSON.stringify(e)))]);
    void logAudit('DEMO', 'demo', 'Dados de demonstração (sintéticos) carregados.'); toast('Dados sintéticos carregados e rotulados.');
  };
  const clear = () => {
    for (const name of Object.keys(demoCollections)) setKey(`col:${name}`, getKey<Row[]>(`col:${name}`, []).filter(r => !r.synthetic));
    const demoKeys = new Set(demoEdges.map(e => JSON.stringify(e)));
    setKey('impact:edges', getKey<typeof demoEdges>('impact:edges', []).filter(e => !demoKeys.has(JSON.stringify(e))));
    void logAudit('DEMO', 'demo', 'Dados sintéticos removidos.'); toast('Dados sintéticos removidos.');
  };
  return <div className="row"><button type="button" className="btn" onClick={load}>Carregar dados de demonstração (sintéticos)</button><button type="button" className="btn" onClick={clear}>Remover dados sintéticos</button></div>;
}

export function Overview({ go }: { go: Go }) {
  const attention = useAttention(); const { status } = useAuditStatus();
  const count = (s: string) => queue.items.filter(i => i.status === s).length;
  const [edges] = useEdges();
  const journey = [
    ['Governança', 'controls'], ['Ordem de serviço', 'pmo'], ['Fonte / versão', 'sources'], ['Extração → átomo', 'atoms'], ['Template / página', 'pages'], ['Revisão / publicação', 'publication'], ['Impacto → nova ordem', 'impact'],
  ] as const;
  return <div className="grid">
    <div className="grid g4">
      <Stat label="Ordens controladas" value={queue.items.length} note={`PMO rev. ${queue.revision} · ${queue.updatedOn}`} />
      <Stat label="Em execução / na fila" value={`${count('IN_PROGRESS')} / ${count('QUEUED')}`} note="Sem percentuais presumidos" />
      <Stat label="Exigem atenção" value={attention.length} note="Derivado de regras sobre registros" />
      <Stat label="Trilha de auditoria local" value={status ? (status.ok ? 'íntegra' : 'QUEBRADA') : '…'} note={status ? `${status.checked} elo(s) verificados` : 'verificando'} />
    </div>
    <Panel title="O que exige atenção hoje" subtitle="Cada item mostra a fonte do dado e leva ao módulo." action={<button type="button" className="btn" onClick={() => go('alerts')}>Ver todos</button>}><AttentionList items={attention} go={go} limit={6} /></Panel>
    <Panel title="Jornada completa, com o estado real de cada etapa" subtitle="Governança → OS → Fonte → Átomo → Página → Publicação → Impacto → nova OS.">
      <ol className="flow">{journey.map(([label, id]) => { const m = modules.find(x => x.id === id)!; return <li key={id}><strong>{label}</strong><ModeBadge mode={m.mode} /><small>{m.limits}</small><button type="button" className="btn" onClick={() => go(id)}>Abrir</button></li>; })}</ol>
    </Panel>
    <div className="grid g2">
      <Panel title="Limites deste ambiente" subtitle="Evita ler um preview como se fosse produção.">
        <ul>
          <li>Autenticação: <strong>desligada</strong> (política do backup público).</li><li>Banco: <strong>desligado</strong>; dados só neste navegador.</li>
          <li>Kernel, LLM, agentes e OPA: <strong>não conectados</strong>.</li><li>Publicação: <strong>projeção local</strong>; <code>md_gate</code> fechado.</li>
          <li>Grafo de impacto local: {edges.length} relação(ões).</li>
        </ul>
      </Panel>
      <Panel title="Dados de demonstração" subtitle="Para conhecer o esqueleto. Todas as linhas ficam marcadas como SINTÉTICO."><DemoControls /><p className="note">Dados sintéticos não representam fornecedores, normas, páginas ou revisões reais.</p></Panel>
    </div>
  </div>;
}

export function Alerts({ go }: { go: Go }) {
  const all = useAttention(); const [sev, setSev] = useState('todas');
  const items = sev === 'todas' ? all : all.filter(a => a.severity === sev);
  return <div className="grid">
    <Panel title="Central de alertas" subtitle="Derivada de registros existentes. Sem leitura, adiamento ou resolução: exige eventos, prazos e persistência reais."
      action={<div className="field" style={{ minWidth: 180 }}><label htmlFor="sev">Severidade</label><select id="sev" value={sev} onChange={e => setSev(e.target.value)}>{['todas', 'critica', 'alta', 'media', 'baixa'].map(x => <option key={x}>{x}</option>)}</select></div>}>
      <p className="count" role="status" aria-live="polite">{items.length} de {all.length} alertas</p><AttentionList items={items} go={go} />
    </Panel>
  </div>;
}

export function Pmo() {
  const [open, setOpen] = useState<QueueItem | null>(null); const [tab, setTab] = useState('geral');
  const events = open ? queue.events.filter(e => e.workId === open.id) : [];
  const rows = queue.items as unknown as Record<string, unknown>[];
  return <div className="grid">
    <div className="grid g3">
      <Stat label="Ordens controladas" value={queue.items.length} note="Registro único versionado" />
      <Stat label="Aprovação humana" value={queue.items.filter(i => i.status === 'HOLD_HUMAN').length} note="Aguardam decisão" />
      <Stat label="Revisão do registro" value={`#${queue.revision}`} note={`Atualizado em ${queue.updatedOn}`} />
    </div>
    <Panel title="Fila única de execução" subtitle="Leitura de registro versionado. Alterações exigem commit, evidência e gates — não aprovação por IA.">
      <DataTable id="pmo" rows={rows} columns={[{ key: 'order', label: 'Ordem' }, { key: 'id', label: 'ID' }, { key: 'title', label: 'Título' }, { key: 'priority', label: 'Prioridade' }, { key: 'status', label: 'Situação' }, { key: 'owner', label: 'Responsável' }]}
        searchFields={['id', 'title', 'owner']} statusKey="status" pageSize={5} sourceLabel={`${queue.canonicalSource} (rev. ${queue.revision})`} emptyHint="Registro vazio." onOpen={r => { setOpen(r as unknown as QueueItem); setTab('geral'); }} defaultSort={{ key: 'order', dir: 'asc' }} />
      <SourceStamp source={queue.canonicalSource} revision={queue.revision} date={queue.updatedOn} />
    </Panel>
    {open && <Drawer title={`${open.id} · ${open.title}`} onClose={() => setOpen(null)}>
      <div className="row"><StatusBadge value={open.status} /><Tag>{open.priority}</Tag><Tag>#{open.order}</Tag></div>
      <Tabs label="Seções da ordem" value={tab} onChange={setTab} tabs={[{ id: 'geral', label: 'Visão geral' }, { id: 'rel', label: 'Relações' }, { id: 'ev', label: 'Evidências' }, { id: 'hist', label: `Eventos (${events.length})` }]} />
      {tab === 'geral' && <KeyValue items={[['Responsável', open.owner], ['Critério de aceite', open.criteria], ['Próximo passo', open.next], ['Atualizado em', open.updatedOn], ['Prazo', 'não definido (sem SLA aprovado)']]} />}
      {tab === 'rel' && (open.dependencies.length ? <ul>{open.dependencies.map(d => <li key={d}><code>{d}</code></li>)}</ul> : <p className="note">Sem dependências registradas.</p>)}
      {tab === 'ev' && (open.evidence.length ? <ul>{open.evidence.map((u, i) => <li key={u}><a href={u} target="_blank" rel="noopener noreferrer">Evidência {i + 1}<ArrowUpRight size={13} aria-hidden="true" /></a></li>)}</ul> : <p className="note"><strong>Nenhuma evidência anexada: não é PASS.</strong></p>)}
      {tab === 'hist' && (events.length ? <Timeline items={events.map(e => ({ at: e.date, title: `${e.workId} → ${e.to}`, detail: e.reason }))} /> : <p className="note">Sem eventos para esta ordem.</p>)}
      <div className="row"><DisabledAction label="Editar ordem" reason="Somente leitura: a fila é alterada por commit versionado." /><DisabledAction label="Aprovar" reason="Aprovação exige identidade, RBAC e Checker ≠ Maker no servidor." /></div>
    </Drawer>}
  </div>;
}

export function Agenda() {
  const reviews = useCollection<Row>('reviews', 'REV').rows; const apis = useCollection<Row>('apis', 'API').rows; const sources = useCollection<Row>('sources', 'FONTE').rows;
  const items = useMemo(() => {
    const out: { at: string; title: string; detail: string }[] = queue.events.map(e => ({ at: e.date, title: `${e.workId} → ${e.to}`, detail: `PMO: ${e.reason}` }));
    reviews.filter(r => !r.archived && r.validUntil).forEach(r => out.push({ at: String(r.validUntil), title: `Validade da revisão de ${String(r.objectRef)}`, detail: 'Coleção reviews' }));
    apis.filter(a => !a.archived && a.credentialExpiresAt).forEach(a => out.push({ at: String(a.credentialExpiresAt), title: `Credencial de ${String(a.name)} expira`, detail: 'Coleção apis' }));
    sources.filter(s => !s.archived && s.effectiveTo).forEach(s => out.push({ at: String(s.effectiveTo), title: `Fim de vigência: ${String(s.title)}`, detail: 'Coleção sources' }));
    return out.sort((a, b) => b.at.localeCompare(a.at));
  }, [reviews, apis, sources]);
  const today = todayISO();
  return <div className="grid"><Panel title="Agenda e linha do tempo" subtitle="Somente datas registradas. Ordens sem prazo aparecem como “não definido”; nenhuma data é inferida do histórico.">
    <p className="count">Hoje: {today}. Futuros: {items.filter(i => i.at >= today).length} · Passados: {items.filter(i => i.at < today).length}</p><Timeline items={items} />
  </Panel></div>;
}

export function Playbooks() {
  const [id, setId] = useState(playbooks[0].id); const [done, setDone] = useKey<Record<string, number[]>>('playbooks:progress', {});
  const pb = playbooks.find(p => p.id === id)!; const d = done[id] ?? [];
  return <div className="grid g2" style={{ alignItems: 'start' }}>
    <Panel title="Roteiros" subtitle="Apoio ao processo; não é política aprovada.">
      <div className="grid">{playbooks.map(p => <button key={p.id} type="button" className="btn" aria-pressed={p.id === id} onClick={() => setId(p.id)} style={{ justifyContent: 'flex-start', textAlign: 'left' }}>{p.title}</button>)}</div>
    </Panel>
    <Panel title={pb.title} subtitle={`Quando usar: ${pb.when}`} action={<button type="button" className="btn" onClick={() => setDone(p => ({ ...p, [id]: [] }))}>Reiniciar</button>}>
      <Stepper steps={pb.steps} done={d} onToggle={i => setDone(p => ({ ...p, [id]: (p[id] ?? []).includes(i) ? (p[id] ?? []).filter(x => x !== i) : [...(p[id] ?? []), i] }))} />
      <p className="note">Progresso: {d.length} de {pb.steps.length} (marcação local, sem efeito sobre registros).</p>
    </Panel>
  </div>;
}

export function Commander() {
  const [objective, setObjective] = useState(''); const [scope, setScope] = useState(''); const [draft, setDraft] = useState<null | { objective: string; scope: string; at: string }>(null); const [err, setErr] = useState('');
  const prepare = () => {
    const o = objective.trim();
    if (o.length < 24 || o.length > 800) return setErr('O objetivo deve ter entre 24 e 800 caracteres.');
    if (scope.length > 800) return setErr('O escopo deve ter até 800 caracteres.');
    setErr(''); setDraft({ objective: o, scope: scope.trim(), at: new Date().toLocaleString('pt-BR') });
  };
  const caps: [string, string][] = [['LLM', 'não conectado'], ['Kernel (admissão)', 'não invocado'], ['Agentes e equipes', 'não conectados'], ['Criação de OS', 'indisponível'], ['Persistência', 'nenhuma — memória da página']];
  return <div className="grid g2" style={{ alignItems: 'start' }}>
    <Panel title="Preparar solicitação" subtitle="Nada é enviado nem salvo. Não inclua dados de pacientes, credenciais ou material normativo não autorizado.">
      <form className="grid" onSubmit={e => { e.preventDefault(); prepare(); }} noValidate>
        <div className="field"><label htmlFor="cmd-o">Objetivo <span style={{ fontWeight: 400, color: 'var(--color-muted)' }}>(obrigatório, 24–800)</span></label><textarea id="cmd-o" value={objective} onChange={e => setObjective(e.target.value)} aria-invalid={err ? true : undefined} /></div>
        <div className="field"><label htmlFor="cmd-s">Escopo <span style={{ fontWeight: 400, color: 'var(--color-muted)' }}>(opcional, até 800)</span></label><textarea id="cmd-s" value={scope} onChange={e => setScope(e.target.value)} /></div>
        {err && <div className="errsum" role="alert">{err}</div>}
        <div className="row"><button type="submit" className="btn primary">Preparar rascunho local</button><button type="button" className="btn" onClick={() => { setObjective(''); setScope(''); setDraft(null); setErr(''); }}>Limpar</button></div>
      </form>
      {draft ? <div style={{ marginTop: 14 }}><Tag tone="warn">Rascunho em memória · não enviado</Tag><KeyValue items={[['Objetivo', draft.objective], ['Escopo', draft.scope], ['Preparado em', draft.at]]} /></div> : <p className="note">Nenhum rascunho preparado.</p>}
    </Panel>
    <div className="grid">
      <Panel title="Capacidades" subtitle="Estado real, sem promessa."><dl className="kv">{caps.map(([k, v]) => <div key={k} style={{ display: 'contents' }}><dt>{k}</dt><dd><Tag tone="warn">{v}</Tag></dd></div>)}</dl></Panel>
      <Panel title="Ações protegidas" subtitle="Inativas de verdade; o motivo está fora do botão.">
        <div className="grid"><DisabledAction label="Enviar ao Commander" reason="Sem LLM/Kernel conectados; um prompt nunca sai deste navegador." /><DisabledAction label="Despachar a agente" reason="Exige OS válida, manifesto, admissão do Kernel e agente registrado." /><DisabledAction label="Aprovar e publicar" reason="LLM não aprova impacto clínico/legal nem publicação; exige humano autorizado." /></div>
      </Panel>
    </div>
  </div>;
}

export function Templates() {
  return <div className="grid"><Panel title="Inventário canônico de templates" subtitle="Derivado de templateCatalog (catalog.ts). Esta tela não altera contratos.">
    <DataTable id="templates" rows={templateRows} columns={[{ key: 'id', label: 'ID' }, { key: 'kind', label: 'Tipo' }, { key: 'owner', label: 'Responsável' }]} searchFields={['id', 'kind', 'owner']} statusKey="kind" pageSize={8} sourceLabel="templateCatalog (catalog.ts)" emptyHint="Inventário vazio." />
    <p className="note">Modo: {MODE_LABEL.leitura}.</p></Panel></div>;
}
import { templateCatalog } from '../data/master.ts';
const templateRows = templateCatalog as unknown as Record<string, unknown>[];

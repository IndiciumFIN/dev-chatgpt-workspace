import { createFileRoute, Link } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import {
  Activity, ArrowLeft, ArrowRight, Bot, CheckCircle2, CircleAlert, ClipboardCheck,
  Database, FileWarning, GitBranch, LockKeyhole, MessageSquareText,
  PanelTop, Play, Search, Send, ShieldCheck, Table2, TerminalSquare, XCircle,
} from 'lucide-react';
import queue from '../../registers/pmo/queue.v1.json';
import candidates from '../../registers/governance/imports/cko-coren-cofen-20261023/pending-candidates.v1.json';
import { proposedTables, tableDomains } from '@/lib/central-command-tables';
import '@/styles/command-center.css';

type Channel = 'llm' | 'agents' | 'kernel';
type Mode = 'CONSULTA' | 'PREPARAÇÃO' | 'EXECUÇÃO CONTROLADA';
type Metric = 'registered' | 'homologated' | 'active' | 'holds' | 'finds' | 'agents' | 'gates' | 'tables';
const labels: Record<string,string> = {
  DONE:'Concluída no registro', IN_PROGRESS:'Em andamento no registro',
  QUEUED:'Na fila', PAUSED:'Pausada', HOLD_HUMAN:'Aguarda decisão humana', BLOCKED:'Bloqueada',
};
const groups = [
  '01 · Estratégia e Governança', '02 · Gestão e Execução', '03 · Dados e Conhecimento',
  '04 · Produtos e Experiência', '05 · Relacionamento e Negócios',
  '06 · Tecnologia e Operações', '07 · Qualidade e Auditoria',
];
const metrics: Array<{id:Metric; name:string; note:string}> = [
  {id:'registered',name:'WOs no registro',note:'PMO versionado'},
  {id:'homologated',name:'WOs homologadas',note:'Sem homologação comprovada'},
  {id:'active',name:'Em andamento',note:'Estado declarado na fila'},
  {id:'holds',name:'Pausadas / HOLD',note:'Requerem resolução'},
  {id:'finds',name:'FINDs candidatos',note:'Não admitidos no Kernel'},
  {id:'agents',name:'Agentes conectados',note:'Telemetria indisponível'},
  {id:'gates',name:'Gates de execução',note:'Sem motor integrado'},
  {id:'tables',name:'Tabelas propostas',note:'Não são tabelas implantadas'},
];
const safeStatus = (s:string) => labels[s] ?? s;
const itemType = (s:string) => s === 'DONE' ? 'done' : s === 'PAUSED' || s === 'HOLD_HUMAN' || s === 'BLOCKED' ? 'hold' : 'normal';

export const Route = createFileRoute('/central-comando')({
  component: CommandCenter,
  head: () => ({ meta: [
    { title: 'Central de Comando — Prévia administrativa | Calculadoras de Enfermagem' },
    { name: 'robots', content: 'noindex, nofollow' },
    { name: 'description', content: 'Prévia isolada de monitoramento e consulta do PMO, com execução e conexões externas bloqueadas.' },
  ] }),
});

function CommandCenter() {
  const [selectedId,setSelectedId] = useState(queue.items[0]?.id ?? '');
  const [channel,setChannel] = useState<Channel>('llm');
  const [mode,setMode] = useState<Mode>('CONSULTA');
  const [prompt,setPrompt] = useState('');
  const [preview,setPreview] = useState<string|null>(null);
  const [activeMetric,setActiveMetric] = useState<Metric>('registered');
  const [filter,setFilter] = useState('');
  const [domain,setDomain] = useState('todos');
  const [phase,setPhase] = useState('todos');
  const [visibleTableCount,setVisibleTableCount] = useState(12);
  const [onlyProblems,setOnlyProblems] = useState(false);
  const selected = queue.items.find(item=>item.id===selectedId) ?? queue.items[0];
  const filteredTables = useMemo(()=>proposedTables.filter(t=>
    (domain==='todos'||t.domain===domain) &&
    (phase==='todos'||t.phase===phase) &&
    t.name.toLowerCase().includes(filter.toLowerCase().trim())
  ),[domain,phase,filter]);
  const metricsCount: Record<Metric,string|number> = {
    registered:queue.items.length,
    homologated:queue.items.filter(i=>String(i.status)==='HOMOLOGATED').length,
    active:queue.items.filter(i=>i.status==='IN_PROGRESS').length,
    holds:queue.items.filter(i=>['PAUSED','HOLD_HUMAN','BLOCKED'].includes(i.status)).length,
    finds:candidates.items.length,
    agents:'—',gates:'—',tables:proposedTables.length,
  };
  const displayed = onlyProblems ? queue.items.filter(i=>['PAUSED','HOLD_HUMAN','BLOCKED'].includes(i.status)) : queue.items;
  const events = queue.events.filter(e=>e.workId===selectedId);
  const unavailableReason = 'Execução indisponível: não há comprovação de homologação vigente, runner autenticado, política efetiva nem gates revalidados.';
  function inspectPrompt(){
    const normalized=prompt.trim();
    if(!normalized) return;
    setPreview(
      mode==='EXECUÇÃO CONTROLADA'
        ? 'BLOQUEADO — O texto foi analisado apenas nesta interface. Nenhuma WO foi executada e nenhum serviço foi acionado.'
        : 'PRÉVIA LOCAL — O comando foi preparado apenas neste navegador. LLM, agente e Kernel não foram acionados.'
    );
  }
  return <main id="conteudo" className="cc-page page-wide" aria-labelledby="cc-title">
    <div className="cc-breadcrumb"><Link to="/admin"><ArrowLeft size={15}/> Administração</Link><span>/</span><strong>Central de Comando</strong></div>
    <header className="cc-heading">
      <div>
        <div className="cc-eyebrow"><TerminalSquare size={16}/> OPERAÇÃO · OBSERVAÇÃO CONTROLADA</div>
        <h1 id="cc-title">Central de Comando</h1>
        <p>Uma visão para PMO, execução, comunicação e contratos — sem alterar a fonte canônica.</p>
      </div>
      <div className="cc-heading-badges"><span className="cc-pill">Prévia Git / Vercel</span><span className="cc-pill cc-pill-hold"><LockKeyhole size={14}/> Escrita remota bloqueada</span></div>
    </header>
    <div className="cc-scope" role="note"><CircleAlert size={20}/><div><strong>Fonte verificada nesta versão: registros JSON do próprio repositório.</strong>
      <p>Os estados abaixo são fotografias do último commit. Não são telemetria em tempo real. Sem conexão LLM, Kernel, Supabase ou runners; nenhuma WO pode ser executada aqui.</p>
    </div></div>

    <div className="cc-two-column">
      <section className="cc-panel cc-monitor" aria-labelledby="monitor-title">
        <div className="cc-panel-title"><div><span className="cc-section-kicker">01 · OPERAÇÃO</span><h2 id="monitor-title"><Activity size={19}/> Tela operacional</h2></div><span className="cc-source">PMO / somente leitura</span></div>
        {selected && <div className="cc-active-wo">
          <div className="cc-wo-heading"><div><small>{selected.id} · {selected.priority}</small><h3>{selected.title}</h3></div><span className={'cc-state cc-state-'+itemType(selected.status)}>{safeStatus(selected.status)}</span></div>
          <div className="cc-facts"><div><small>Responsável declarado</small><strong>{selected.owner}</strong></div><div><small>Atualização da fila</small><strong>{selected.updatedOn}</strong></div><div><small>Dependências</small><strong>{selected.dependencies.length}</strong></div></div>
          <p className="cc-next"><strong>Próxima ação:</strong> {selected.next}</p>
          <div className="cc-monitor-steps"><div><CheckCircle2 size={18}/> Registro identificado no Git</div><div><CircleAlert size={18}/> Homologação não verificada nesta fonte</div><div><LockKeyhole size={18}/> Runner e telemetria não disponíveis</div></div>
        </div>}
        <div className="cc-subhead"><h3>Movimentações registradas</h3><span>{events.length} evento(s)</span></div>
        <div className="cc-timeline" aria-label="Eventos versionados da WO selecionada">
          {events.length ? [...events].reverse().slice(0,4).map(event=><div key={event.seq} className="cc-event"><span className="cc-dot"/><div><strong>{safeStatus(event.to)}</strong><small>{event.date} · Seq. {event.seq}</small><p>{event.reason}</p></div></div>) : <p className="cc-empty">Nenhum evento registrado para esta WO no arquivo atual.</p>}
        </div>
      </section>
      <section className="cc-panel cc-conversation" aria-labelledby="conversation-title">
        <div className="cc-panel-title"><div><span className="cc-section-kicker">01 · COMUNICAÇÃO</span><h2 id="conversation-title"><MessageSquareText size={19}/> Comunicação</h2></div><span className="cc-source">Canais não conectados</span></div>
        <div className="cc-tabs" role="tablist" aria-label="Canal de comunicação">
          {([['llm','LLM'],['agents','Agentes'],['kernel','Kernel']] as const).map(([id,label])=><button type="button" key={id} role="tab" aria-selected={channel===id} onClick={()=>setChannel(id)}>{id==='llm'?<MessageSquareText size={15}/>:id==='agents'?<Bot size={15}/>:<Database size={15}/>} {label}</button>)}
        </div>
        <div className="cc-conversation-body" role="tabpanel">
          <div className="cc-channel-icon">{channel==='llm'?<MessageSquareText size={25}/>:channel==='agents'?<Bot size={25}/>:<Database size={25}/>}</div>
          <h3>{channel==='llm'?'Console de modelos':channel==='agents'?'Central de agentes':'Observatório do Kernel'}</h3>
          <p>{channel==='llm'?'Sem provedor/modelo autenticado nesta prévia.':channel==='agents'?'Sem agente, permissões de ferramenta ou runner habilitados.':'Sem acesso autorizado ao banco, admission gate ou fontes clínicas.'}</p>
          <div className="cc-conversation-meta"><span>WO contextual</span><strong>{selectedId||'Não selecionada'}</strong></div>
          <span className="cc-disconnected"><XCircle size={15}/> Canal indisponível neste ambiente</span>
        </div>
      </section>
    </div>

    <section className="cc-panel" aria-labelledby="prompt-title">
      <div className="cc-panel-title"><div><span className="cc-section-kicker">02 · COMANDOS</span><h2 id="prompt-title"><TerminalSquare size={19}/> Caixa de comando</h2></div><span className="cc-source">Pré-checagem local · não envia</span></div>
      <div className="cc-mode" role="group" aria-label="Modo do comando">
        {(['CONSULTA','PREPARAÇÃO','EXECUÇÃO CONTROLADA'] as Mode[]).map(m=><button type="button" key={m} aria-pressed={mode===m} onClick={()=>{setMode(m);setPreview(null)}}>{m}</button>)}
      </div>
      <label className="cc-prompt-label" htmlFor="command-prompt">Instrução relacionada a {selectedId}</label>
      <textarea id="command-prompt" value={prompt} maxLength={4000} rows={3} onChange={e=>{setPrompt(e.target.value);setPreview(null)}} placeholder="Descreva a consulta, o diagnóstico ou o plano a preparar (não incluir dados sensíveis)." />
      <div className="cc-prompt-foot"><span>Sem persistência ou transmissão. Não incluir senhas, tokens, dados de pacientes ou informações sigilosas.</span><button className="cc-primary" type="button" disabled={!prompt.trim()} onClick={inspectPrompt}><Send size={16}/> Pré-checar</button></div>
      {preview && <div className="cc-result" role="status"><ShieldCheck size={18}/><div><strong>Resultado da pré-checagem</strong><p>{preview}</p><small>Texto digitado: {prompt.trim().length} caracteres; nenhuma solicitação remota.</small></div></div>}
    </section>

    <section className="cc-panel" aria-labelledby="wo-title">
      <div className="cc-panel-title"><div><span className="cc-section-kicker">03 · ORDENS DE TRABALHO</span><h2 id="wo-title"><ClipboardCheck size={19}/> WO · Tarefas homologadas (executar)</h2></div><span className="cc-source">Registro: {queue.registryId} · revisão {queue.revision}</span></div>
      <p className="cc-muted">A fila real está visível abaixo. Nenhum registro nesta fonte comprova os requisitos para a execução autorizada.</p>
      <div className="cc-wo-options">
        <label>Selecionar WO <select value={selectedId} onChange={e=>{setSelectedId(e.target.value);setPreview(null)}}>
          {queue.items.map(item=><option key={item.id} value={item.id}>{item.id} · {item.title}</option>)}
        </select></label>
        <button className="cc-disabled-action" disabled type="button" title={unavailableReason}><Play size={16}/> Executar WO</button>
      </div>
      <div className="cc-gate-message" role="status"><LockKeyhole size={17}/>{unavailableReason}</div>
    </section>

    <section className="cc-dashboard" aria-labelledby="dash-title">
      <div className="cc-dashboard-heading"><div><span className="cc-section-kicker">04 · INDICADORES</span><h2 id="dash-title">Dashboard de totais</h2></div><span>Selecione um card para abrir a aba de detalhamento</span></div>
      <div className="cc-metric-grid">
        {metrics.map(m=><button key={m.id} type="button" aria-pressed={activeMetric===m.id} className={'cc-metric'+(activeMetric===m.id?' is-active':'')} onClick={()=>setActiveMetric(m.id)}>
          <span>{m.id==='tables'?<Table2 size={19}/>:m.id==='agents'?<Bot size={19}/>:m.id==='finds'?<FileWarning size={19}/>:m.id==='active'?<Activity size={19}/>:m.id==='holds'?<CircleAlert size={19}/>:m.id==='gates'?<ShieldCheck size={19}/>:<ClipboardCheck size={19}/>}</span>
          <strong>{metricsCount[m.id]}</strong><span className="cc-metric-title">{m.name}</span><small>{m.note}</small>
        </button>)}
      </div>
      <section className="cc-panel cc-detail" aria-live="polite" aria-labelledby="detail-title">
        <div className="cc-panel-title"><div><span className="cc-section-kicker">DETALHAMENTO · {metrics.find(x=>x.id===activeMetric)?.name}</span><h2 id="detail-title">{activeMetric==='tables'?'Inventário lógico v1.0':activeMetric==='finds'?'Achados candidatos':activeMetric==='agents'?'Conexão de agentes':activeMetric==='gates'?'Gates de execução':'Lista vinculada ao PMO'}</h2></div><span className="cc-source">{activeMetric==='tables'?'Catálogo proposto, não aplicado':'Leitura de registros locais do build'}</span></div>
        {activeMetric==='tables' ? <>
          <div className="cc-filter-row"><label><Search size={17}/><span className="sr-only">Pesquisar tabela</span><input type="search" value={filter} onChange={e=>{setFilter(e.target.value);setVisibleTableCount(12)}} placeholder="Buscar tabela ou entidade"/></label>
          <label>Domínio<select value={domain} onChange={e=>{setDomain(e.target.value);setVisibleTableCount(12)}}><option value="todos">Todos</option>{tableDomains.map(d=><option key={d} value={d}>{d}</option>)}</select></label>
          <label>Onda<select value={phase} onChange={e=>{setPhase(e.target.value);setVisibleTableCount(12)}}><option value="todos">Todas</option><option value="B0">B0 · Fundação</option><option value="B1">B1 · Ampliação</option></select></label></div>
          <p className="cc-muted">Exibindo {filteredTables.length} de {proposedTables.length} tabelas propostas (B0: {proposedTables.filter(t=>t.phase==='B0').length}; B1: {proposedTables.filter(t=>t.phase==='B1').length}). Antes de qualquer migration, reconciliar com o schema existente.</p>
          <div className="cc-table-wrap"><table><thead><tr><th>Domínio</th><th>Tabela lógica proposta</th><th>Fase</th><th>Estado de implantação</th></tr></thead><tbody>{filteredTables.slice(0,visibleTableCount).map(t=><tr key={t.name}><td data-label="Domínio">{t.domain}</td><td data-label="Tabela"><code>{t.name}</code></td><td data-label="Fase">{t.phase}</td><td data-label="Estado">Não verificado</td></tr>)}</tbody></table></div>
          {filteredTables.length>visibleTableCount && <button className="cc-load-more" type="button" onClick={()=>setVisibleTableCount(n=>n+12)}>Mostrar mais 12 tabelas ({Math.min(visibleTableCount,filteredTables.length)} de {filteredTables.length})</button>}
        </> : activeMetric==='agents'||activeMetric==='gates' ? <div className="cc-empty-detail"><LockKeyhole size={23}/><strong>Indicador indisponível</strong><p>Não há integração autenticada para apurar este total. Não exibimos números fictícios.</p></div>
        : activeMetric==='finds' ? <div className="cc-records">{candidates.items.map(item=><details key={item.id}><summary>{item.id} · {item.title}<span className="cc-state cc-state-hold">{item.priority}</span></summary><p><strong>Estado:</strong> {item.state}</p><p><strong>Ação:</strong> {item.next_action}</p></details>)}</div>
        : <><div className="cc-filter-checkbox"><label><input type="checkbox" checked={onlyProblems} onChange={e=>setOnlyProblems(e.target.checked)}/> Apenas pausadas e HOLD</label></div>
          <div className="cc-records">{displayed.filter(i=>activeMetric==='registered'||(activeMetric==='homologated'?String(i.status)==='HOMOLOGATED':activeMetric==='active'?i.status==='IN_PROGRESS': ['PAUSED','HOLD_HUMAN','BLOCKED'].includes(i.status))).map(item=><button type="button" key={item.id} onClick={()=>{setSelectedId(item.id);window.scrollTo({top:0,behavior:'smooth'})}}><span><strong>{item.id}</strong><small>{item.title}</small></span><span className={'cc-state cc-state-'+itemType(item.status)}>{safeStatus(item.status)}</span><ArrowRight size={17}/></button>)}</div>
          {activeMetric==='homologated' && <p className="cc-empty">Nenhuma WO apresenta homologação comprovada nesta fonte. Os requisitos de execução permanecem bloqueados.</p>}
        </>}
      </section>
    </section>
    <footer className="cc-footer"><GitBranch size={15}/> Fonte do PMO: <code>{queue.canonicalSource}</code>. Central de observação (R3 preliminar); sem autorização de release clínico, alterações de Kernel ou acesso a serviços remotos.</footer>
    <details className="cc-architecture"><summary><PanelTop size={16}/> Macrogrupos administrativos planejados</summary><ol>{groups.map(g=><li key={g}>{g}</li>)}</ol></details>
  </main>;
}

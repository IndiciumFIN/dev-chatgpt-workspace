import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Bell, CircleHelp, LockKeyhole, Search, UserRound } from 'lucide-react';
import { groups, modules, type ModuleDef } from './core/modules.ts';
import { queue, useAttention } from './core/state.ts';
import { fold } from './lib/list-query.ts';
import { Breadcrumbs, EmptyState, Footer, Icon, ToastProvider } from './ds/ui.tsx';
import { PageHero } from './ds/PageHero.tsx';
import { MODE_LABEL } from './core/modules.ts';
import { ModuleErrorBoundary } from './ds/ErrorBoundary.tsx';

const DesignSystem = lazy(() => import('./modules/DesignSystem.tsx').then(m => ({ default: m.DesignSystem })));
const Operacao = lazy(() => import('./modules/Operacao.tsx').then(m => ({
  default: function OperacaoView({ view, go }: { view: string; go: (next: string) => void }) {
    if (view === 'overview') return <m.Overview go={go} />;
    if (view === 'alerts') return <m.Alerts go={go} />;
    if (view === 'pmo') return <m.Pmo />;
    if (view === 'agenda') return <m.Agenda />;
    if (view === 'playbooks') return <m.Playbooks />;
    if (view === 'commander') return <m.Commander />;
    return <m.Templates />;
  },
})));
const CrudModule = lazy(() => import('./modules/Crud.tsx').then(m => ({ default: m.CrudModule })));
const Conhecimento = lazy(() => import('./modules/Conhecimento.tsx').then(m => ({
  default: function ConhecimentoView({ view }: { view: string }) {
    if (view === 'reftests') return <m.RefTests />;
    if (view === 'apis') return <m.Apis />;
    return <m.Atoms />;
  },
})));
const Publicacao = lazy(() => import('./modules/Publicacao.tsx').then(m => ({
  default: function PublicacaoView({ view }: { view: string }) {
    return view === 'publication' ? <m.Publication /> : <m.Site />;
  },
})));
const Risco = lazy(() => import('./modules/Risco.tsx').then(m => ({
  default: function RiscoView({ view }: { view: string }) {
    if (view === 'impact') return <m.Impact />;
    if (view === 'audit') return <m.Audit />;
    return <m.Auditor />;
  },
})));
const Sistema = lazy(() => import('./modules/Sistema.tsx').then(m => ({
  default: function SistemaView({ view }: { view: string }) {
    return view === 'settings' ? <m.Settings /> : <m.Profile />;
  },
})));

function ModuleView({ id, go }: { id: string; go: (next: string) => void }) {
  switch (id) {
    case 'overview': return <Operacao go={go} view="overview" />;
    case 'alerts': return <Operacao go={go} view="alerts" />;
    case 'pmo': return <Operacao go={go} view="pmo" />;
    case 'agenda': return <Operacao go={go} view="agenda" />;
    case 'playbooks': return <Operacao go={go} view="playbooks" />;
    case 'controls': return <CrudModule schemaName="controls" />;
    case 'commander': return <Operacao go={go} view="commander" />;
    case 'reviews': return <CrudModule schemaName="reviews" />;
    case 'reftests': return <Conhecimento view="reftests" />;
    case 'sources': return <CrudModule schemaName="sources" />;
    case 'apis': return <Conhecimento view="apis" />;
    case 'atoms': return <Conhecimento view="atoms" />;
    case 'templates': return <Operacao go={go} view="templates" />;
    case 'media': return <CrudModule schemaName="media" />;
    case 'pages': return <CrudModule schemaName="pages" />;
    case 'publication': return <Publicacao view="publication" />;
    case 'site': return <Publicacao view="site" />;
    case 'impact': return <Risco view="impact" />;
    case 'audit': return <Risco view="audit" />;
    case 'auditor': return <Risco view="auditor" />;
    case 'ds': return <DesignSystem />;
    case 'settings': return <Sistema view="settings" />;
    case 'profile': return <Sistema view="profile" />;
    default: return null;
  }
}

const fromHash = () => { const id = window.location.hash.replace(/^#\/?/, ''); return modules.some(m => m.id === id) ? id : 'overview'; };

function Shell() {
  const [id, setId] = useState(fromHash); const [term, setTerm] = useState('');
  const attention = useAttention();
  const go = (next: string) => { window.location.hash = `/${next}`; };
  useEffect(() => { const on = () => { setId(fromHash()); const h = document.getElementById('page-title'); h?.setAttribute('tabindex', '-1'); h?.focus(); }; window.addEventListener('hashchange', on); return () => window.removeEventListener('hashchange', on); }, []);
  const mod = modules.find(m => m.id === id) as ModuleDef;
  const matches = useMemo(() => { const n = fold(term).trim(); return n ? modules.filter(m => fold(`${m.label} ${m.hint}`).includes(n)).slice(0, 6) : []; }, [term]);
  const pending = queue.items.filter(i => i.status === 'HOLD_HUMAN' || i.status === 'BLOCKED').length;
  useEffect(() => { document.title = `${mod.label} · Administração governada (modo local)`; }, [mod]);
  return <div className="shell">
    <a className="skip" href="#conteudo">Ir para o conteúdo</a>
    <nav className="side" aria-label="Módulos da administração">
      <div className="brand"><strong>Administração governada</strong><span>CKO · Calculadoras de Enfermagem</span></div>
      {groups.map(g => <div key={g}><p className="navlabel">{g}</p>{modules.filter(m => m.group === g).map(m => <button key={m.id} type="button" className="navitem" aria-current={m.id === id ? 'page' : undefined} onClick={() => go(m.id)}><Icon name={m.icon} /><span><strong>{m.label}</strong><small>{m.hint}</small></span>{m.id === 'alerts' && attention.length > 0 && <span className="count" aria-label={`${attention.length} alertas`}>{attention.length}</span>}</button>)}</div>)}
    </nav>
    <div className="mainwrap">
      <header className="topbar" aria-label="Barra do console">
        <div className="crumbs"><span>Administração</span><span aria-hidden="true">/</span><span aria-current="page">{mod.label}</span></div>
        <div className="gsearch" role="search"><label className="sr" htmlFor="gs">Buscar módulo</label><Search size={16} aria-hidden="true" />
          <input id="gs" type="search" placeholder="Ir para um módulo…" value={term} autoComplete="off" aria-controls="gs-r" onChange={e => setTerm(e.target.value)} onKeyDown={e => { if (e.key === 'Escape') setTerm(''); if (e.key === 'Enter' && matches[0]) { go(matches[0].id); setTerm(''); } }} />
          <ul id="gs-r" className="gresults" hidden={matches.length === 0}>{matches.map(m => <li key={m.id}><button type="button" onClick={() => { go(m.id); setTerm(''); }}><strong>{m.label}</strong><small>{m.hint}</small></button></li>)}</ul></div>
        <div className="tools">
          <span className="env"><LockKeyhole size={14} aria-hidden="true" />Modo local · sem login</span>
          <details className="pop"><summary className="iconbtn" aria-label="Ajuda"><CircleHelp size={18} aria-hidden="true" /></summary><div className="panelpop" role="group" aria-label="Ajuda"><p><strong>Como ler este console.</strong> Cada módulo informa a fonte do dado e se a função está conectada.</p><p>Nada aqui aprova, publica ou executa fora deste navegador.</p></div></details>
          <button type="button" className="iconbtn" onClick={() => go('alerts')} aria-label={`Alertas derivados: ${attention.length}. Ordens aguardando decisão humana: ${pending}. Abrir central de alertas`}><Bell size={18} aria-hidden="true" />{attention.length > 0 && <span className="badge">{attention.length}</span>}</button>
          <details className="pop"><summary className="iconbtn" aria-label="Perfil e sessão"><UserRound size={18} aria-hidden="true" /></summary><div className="panelpop" role="group" aria-label="Perfil e sessão"><p><strong>Sem identidade neste ambiente.</strong> Não há usuário, equipe ou papel.</p><button type="button" className="btn" disabled>Sair</button><p className="note">Indisponível: não existe sessão para encerrar.</p></div></details>
        </div>
      </header>
      <label className="mobilenav"><span className="sr">Seção administrativa</span><select value={id} onChange={e => go(e.target.value)}>{groups.map(g => <optgroup key={g} label={g}>{modules.filter(m => m.group === g).map(m => <option key={m.id} value={m.id}>{m.label}</option>)}</optgroup>)}</select></label>
      <main id="conteudo" tabIndex={-1}>
        <div className="scope" role="note"><LockKeyhole size={18} aria-hidden="true" /><div><strong>Ambiente local — não é a autoridade corporativa.</strong> <span>{mod.limits}</span></div></div>
        <Breadcrumbs items={[{ label: 'Início', href: '#/overview' }, { label: 'Administração', href: '#/overview' }, { label: mod.group.charAt(0) + mod.group.slice(1).toLowerCase() }, { label: mod.label }]} />
        <PageHero titleId="page-title" eyebrow={mod.group} title={mod.label} lead={`${mod.hint}. Fonte: ${mod.source}.`} badges={[MODE_LABEL[mod.mode]]} />
        <ModuleErrorBoundary moduleName={mod.label} resetKey={id}>
          <Suspense fallback={<EmptyState title="Carregando este módulo">O restante do console permanece disponível.</EmptyState>}>
            <ModuleView id={id} go={go} />
          </Suspense>
        </ModuleErrorBoundary>
      </main>
      <Footer />
    </div>
  </div>;
}
export default function App() { return <ToastProvider><Shell /></ToastProvider>; }

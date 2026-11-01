import { Link } from '@tanstack/react-router';
import {
  AlertCircle, ArrowUpRight, BookOpenCheck, BookOpenText, Bot, Check, ChevronDown, ChevronRight,
  ClipboardCheck, Download, Eye, FileClock, FileInput, FileText, Layers3,
  LayoutDashboard, ListTodo, LockKeyhole, Menu, Search, ShieldCheck, SlidersHorizontal, Smartphone, X,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import { PageHero } from '@/components/site/page-hero';
import { Breadcrumb } from '@/components/site/breadcrumb';
import { tools } from '@/lib/tools/catalog';
import {
  initialWorkbench, validateWorkbench, exportWorkbench,
  type LocalToolPublication, type LocalWorkbench,
} from '@/lib/local-workbench-store';
import {
  readPublicationRegister, saveLocalDraft, publishLocalDraft, exportPublicationRegister,
  type PublicationEvent,
} from '@/lib/local-publication-register';
import { PmoPanel } from '@/components/admin/pmo-panel';
import { AdminErrorBoundary } from '@/components/admin/admin-error-boundary';
import { AdminOverviewModule } from '@/components/admin/modules/admin-overview-module';
import { TemplatesPanel } from '@/components/admin/templates-panel';
import { SourcesPanel } from '@/components/admin/sources-panel';
import { AdminModuleWorkspace } from '@/components/admin/admin-module-workspace';
import { CommanderPanel } from '@/components/admin/commander-panel';
import { AdminSidebarTree } from '@/components/admin/admin-sidebar-tree';
import { getAdminModule, type AdminModuleId, type AdminSurface } from '@/lib/admin-module-registry';
import { ModuleBoundary } from '@/components/admin/module-boundary';
import '@/styles/admin-console.css';

type Tab = 'overview' | 'pmo' | 'commander' | 'content' | 'templates' | 'sources' | 'publication' | 'module-detail';
type PreviewAudience = 'publico' | 'assinante';
type PreviewVersion = 'draft' | 'published';
const surfaceTabs: Partial<Record<AdminSurface, Tab>> = {
  overview: 'overview',
  pmo: 'pmo',
  content: 'content',
  templates: 'templates',
  sources: 'sources',
  publication: 'publication',
};
const tabs: { id: Tab; label: string; icon: LucideIcon; hint: string }[] = [
  { id: 'pmo', label: 'PMO · fila', icon: ListTodo, hint: 'Ordens, status e evidências' },
  { id: 'overview', label: 'Visão geral', icon: LayoutDashboard, hint: 'Protótipo congelado' },
  { id: 'commander', label: 'Commander', icon: Bot, hint: 'Preparação e limites de execução' },
  { id: 'content', label: 'Conteúdos', icon: BookOpenText, hint: 'Editar instrumentos' },
  { id: 'templates', label: 'Templates', icon: Layers3, hint: 'Contratos de apresentação' },
  { id: 'sources', label: 'Fontes e controle', icon: ShieldCheck, hint: 'Rastreabilidade' },
  { id: 'publication', label: 'Publicação', icon: FileClock, hint: 'Revisões e exportação' },
];

function Panel({ children, title, subtitle, action }: { children: ReactNode; title: string; subtitle?: string; action?: ReactNode }) {
  return <section className="ce-admin-panel">
    <div className="ce-admin-panel-heading"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{action}</div>
    {children}
  </section>;
}
function Indicator({ tone, children }: { tone: 'ok' | 'warn' | 'neutral'; children: ReactNode }) {
  return <span className={`ce-admin-indicator ce-admin-indicator--${tone}`}>{children}</span>;
}

export function AdminConsole() {
  const [model, setModel] = useState<LocalWorkbench>(initialWorkbench);
  const [published, setPublished] = useState<LocalWorkbench>(initialWorkbench);
  const [revision, setRevision] = useState(0);
  const [events, setEvents] = useState<PublicationEvent[]>([]);
  const [tab, setTab] = useState<Tab>('pmo');
  const [selectedModule, setSelectedModule] = useState<AdminModuleId>('M03');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileDialogRef = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<string>(() => initialWorkbench().tools[0]?.slug ?? '');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'publicado' | 'oculto'>('todos');
  const [previewAudience, setPreviewAudience] = useState<PreviewAudience>('publico');
  const [previewVersion, setPreviewVersion] = useState<PreviewVersion>('draft');
  const [dirty, setDirty] = useState(false);
  const [externalChange, setExternalChange] = useState(false);
  const [confirmation, setConfirmation] = useState(false);
  const [status, setStatus] = useState('Carregando o registro do navegador…');
  const [statusError, setStatusError] = useState(false);
  const [loadingFailed, setLoadingFailed] = useState(false);

  useEffect(() => {
    const dialog = mobileDialogRef.current;
    if (!dialog) return;
    if (mobileMenuOpen && !dialog.open) dialog.showModal();
    if (!mobileMenuOpen && dialog.open) dialog.close();
  }, [mobileMenuOpen]);

  function navigateModule(id: AdminModuleId) {
    setSelectedModule(id);
    const surface = getAdminModule(id).surface;
    setTab(surface ? surfaceTabs[surface] ?? 'module-detail' : 'module-detail');
    setMobileMenuOpen(false);
  }
  function showOverview() {
    setTab('overview');
    setMobileMenuOpen(false);
  }

  useEffect(() => {
    try {
      const register = readPublicationRegister();
      setModel(register.draft); setPublished(register.published); setRevision(register.revision);
      setEvents(register.events); setDirty(false); setStatus('Registro local carregado.');
      setSelected((s) => register.draft.tools.some(t => t.slug === s) ? s : register.draft.tools[0]?.slug ?? '');
    } catch {
      setLoadingFailed(true); setStatusError(true);
      setStatus('Registro local inválido: nenhuma informação foi sobrescrita. Exporte os dados pelo navegador antes de recuperar.');
    }
  }, []);
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== 'cde-backup-public:publication-register:v2' && event.key !== null) return;
      try {
        if (readPublicationRegister().revision === revision) return;
      } catch { /* Registro adulterado também impede prosseguir. */ }
      setExternalChange(true); setStatusError(true);
      setStatus('Outra aba alterou o registro. Seus campos foram preservados. Recarregue para reconciliar antes de salvar.');
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [revision]);

  function applyRegister(register: ReturnType<typeof readPublicationRegister>) {
    setModel(register.draft); setPublished(register.published); setRevision(register.revision);
    setEvents(register.events); setDirty(false); setConfirmation(false); setExternalChange(false); setStatusError(false);
  }
  function save() {
    try {
      if (loadingFailed || externalChange) throw new Error('Registro indisponível ou alterado em outra aba. Recarregue antes de persistir.');
      const register = saveLocalDraft(model, revision);
      applyRegister(register); setStatus('Rascunho salvo com nova revisão. A projeção publicada não foi alterada.');
    } catch (error) { setStatusError(true); setStatus(error instanceof Error ? error.message : 'Falha ao salvar o rascunho.'); }
  }
  function publish() {
    try {
      if (loadingFailed || externalChange) throw new Error('Registro indisponível ou desatualizado.');
      if (dirty) throw new Error('Salve o rascunho antes de publicar.');
      if (!confirmation) throw new Error('Confirme que entende o alcance local desta publicação.');
      const register = publishLocalDraft(revision);
      applyRegister(register); setPreviewVersion('published'); setStatus('Projeção LOCAL publicada. Não houve homologação clínica nem deploy remoto.');
    } catch (error) { setStatusError(true); setStatus(error instanceof Error ? error.message : 'Publicação bloqueada.'); }
  }
  function edit(next: LocalToolPublication) {
    setModel((current) => ({ ...current, tools: current.tools.map((item) => item.slug === next.slug ? next : item) }));
    setDirty(true); setConfirmation(false); setStatusError(false); setStatus('Há alterações não salvas.');
  }
  async function importFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (loadingFailed || externalChange) throw new Error('Recarregue antes de importar para preservar a revisão atual.');
      if (file.size > 100_000) throw new Error('Arquivo excede 100 KB.');
      const imported = validateWorkbench(JSON.parse(await file.text()) as unknown);
      setModel(imported); setDirty(true); setConfirmation(false); setStatusError(false);
      setStatus('JSON validado e carregado somente como rascunho. Nenhuma publicação foi realizada.');
      setTab('content');
    } catch (error) { setStatusError(true); setStatus(error instanceof Error ? error.message : 'Importação rejeitada.'); }
    event.target.value = '';
  }
  const dataIsValid = useMemo(() => {
    try { validateWorkbench(model); return true; } catch { return false; }
  }, [model]);
  const visibleTools = useMemo(() => model.tools.filter((item) => {
    const match = `${item.title} ${item.slug} ${item.lead}`.toLocaleLowerCase('pt-BR').includes(query.trim().toLocaleLowerCase('pt-BR'));
    return match && (statusFilter === 'todos' || (statusFilter === 'publicado' ? item.published : !item.published));
  }), [model.tools, query, statusFilter]);
  const edited = model.tools.find(x => x.slug === selected);
  const preview = (previewVersion === 'draft' ? model : published).tools.find(x => x.slug === selected);
  const base = tools.find(x => x.slug === selected);
  const publishedCount = published.tools.filter(x => x.published).length;
  const draftCount = model.tools.filter(x => x.published).length;
  const showRisk = dirty || loadingFailed || externalChange || !dataIsValid;
  const activeModule = getAdminModule(selectedModule);
  const pageHeading = tab === 'module-detail' ? activeModule.title : tabs.find(x => x.id === tab)?.label;

  return <main id="conteudo" className="page-wide ce-admin" aria-labelledby="admin-heading">
    <Breadcrumb items={[{ label: 'Início', to: '/' }, { label: 'Administração' }]} />
    <PageHero title="Centro de administração" titleId="admin-heading" eyebrow="Gestão canônica · ambiente isolado" lead="Organize, edite, confira evidências e veja o resultado como um usuário final — antes de qualquer publicação." />
    <div className="ce-admin-scope" role="note"><LockKeyhole size={18} aria-hidden="true" /><div>
      {tab === 'pmo' ? <>
        <strong>PMO oficial da execução — fonte versionada no GitHub.</strong>
        <span>A fila é somente leitura aqui. Alterações exigem commit, evidência e gates; não aprovações por inteligência artificial.</span>
      </> : tab === 'commander' ? <>
        <strong>Commander em modo de preparação local.</strong>
        <span>Esta tela não envia solicitações a LLM, Kernel ou agentes, não cria ordem de serviço e não persiste dados.</span>
      </> : <>
        <strong>Prévia administrativa local — não é a autoridade corporativa.</strong>
        <span>Este navegador mantém rascunho, projeção publicada e revisões. Sem sincronização entre usuários, sem banco remoto e sem aprovação clínica automática.</span>
      </>}
    </div></div>
    <div className="ce-admin-mobile-nav">
      <button type="button" className="ce-admin-mobile-launch" aria-haspopup="dialog" aria-controls="ce-admin-mobile-menu" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen(true)}>
        <Menu size={18} aria-hidden="true" />
        <span><strong>{tab === 'overview' ? 'Visão geral' : activeModule.title}</strong><small>7 grupos · 22 módulos</small></span>
        <ChevronDown size={17} aria-hidden="true" />
      </button>
    </div>
    <dialog id="ce-admin-mobile-menu" ref={mobileDialogRef} className="ce-admin-mobile-dialog" aria-label="Acesso rápido da administração" onClose={() => setMobileMenuOpen(false)}>
      <div className="ce-admin-mobile-dialog-head">
        <strong>Acesso à administração</strong>
        <button type="button" aria-label="Fechar navegação" onClick={() => setMobileMenuOpen(false)}><X size={19} aria-hidden="true" /></button>
      </div>
      <AdminSidebarTree selectedId={selectedModule} onSelect={navigateModule} onOverview={showOverview} overviewActive={tab === 'overview'} idPrefix="mobile" />
    </dialog>
    <div className="ce-admin-layout">
      <aside className="ce-admin-sidebar">
        <AdminSidebarTree selectedId={selectedModule} onSelect={navigateModule} onOverview={showOverview} overviewActive={tab === 'overview'} idPrefix="desktop" />
      </aside>
      <div className="ce-admin-body">
        <div className="ce-admin-toolbar">
          <div><span className="ce-admin-toolbar-caption">Ambiente / Calculadoras de Enfermagem</span><h2>{pageHeading}</h2></div>
          <div className="ce-admin-toolbar-actions">
            <Indicator tone={tab === 'pmo' ? 'neutral' : tab === 'commander' ? 'warn' : showRisk ? 'warn' : 'ok'}>{tab === 'pmo' ? 'PMO versionado' : tab === 'commander' ? 'Execução não conectada' : loadingFailed ? 'Registro bloqueado' : externalChange ? 'Conflito entre abas' : dirty ? 'Alterações pendentes' : 'Revisão ' + revision}</Indicator>
            <Link className="ce-admin-site-link" to="/">Ver site <ArrowUpRight size={15} aria-hidden="true" /></Link>
          </div>
        </div>
        <ModuleBoundary resetKey={`${tab}:${selectedModule}`}>
        {tab !== 'pmo' && tab !== 'commander' && <div className={`ce-admin-feedback${statusError ? ' ce-admin-feedback--error' : ''}`} role="status" aria-live="polite"><AlertCircle size={17} aria-hidden="true" /><span>{status}</span></div>}
        {tab === 'pmo' && <AdminErrorBoundary moduleName="PMO"><PmoPanel /></AdminErrorBoundary>}
        {tab === 'commander' && <AdminErrorBoundary moduleName="Commander"><CommanderPanel /></AdminErrorBoundary>}
        {tab === 'module-detail' && <AdminErrorBoundary moduleName={activeModule.title}>
          <AdminModuleWorkspace key={selectedModule} moduleId={selectedModule}
            onOpenExisting={(view) => { if (view === 'governance') { setSelectedModule('M04'); setTab('module-detail'); } else { setTab(view); } }}
            onEditRecord={id => {setSelected(id);setPreviewVersion('draft');setTab('content');}}/>
        </AdminErrorBoundary>}
        {tab === 'overview' && <AdminErrorBoundary moduleName="Visão geral"><AdminOverviewModule model={model} published={published} revision={revision}
          onOpenContent={() => setTab('content')} onOpenSources={() => setTab('sources')}
          onSelectPublished={slug => { setSelected(slug); setPreviewVersion('published'); setTab('content'); }} /></AdminErrorBoundary>}
        {tab === 'content' && <AdminErrorBoundary moduleName="content">
          <div className="ce-admin-content-grid">
            <Panel title="Catálogo de instrumentos" subtitle={`${visibleTools.length} de ${model.tools.length} itens no registro local.`}>
              <div className="ce-admin-filterbar">
                <label className="ce-admin-search"><Search size={17} aria-hidden="true" /><span className="sr-only">Pesquisar instrumentos</span><input type="search" placeholder="Buscar por título ou identificador" value={query} onChange={e => setQuery(e.target.value)} /></label>
                <label className="ce-admin-select"><SlidersHorizontal size={16} aria-hidden="true"/><span className="sr-only">Filtrar status</span><select value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}><option value="todos">Todos</option><option value="publicado">Marcados para publicação</option><option value="oculto">Ocultos</option></select></label>
              </div>
              <div className="ce-admin-tool-list" role="list">
                {visibleTools.map(item => <button role="listitem" type="button" key={item.slug} className={`ce-admin-tool-row${selected === item.slug ? ' is-selected' : ''}`} onClick={() => { setSelected(item.slug); setPreviewVersion('draft'); }} aria-pressed={selected === item.slug}>
                  <span className="ce-admin-tool-glyph"><BookOpenText size={18} aria-hidden="true" /></span><span className="ce-admin-tool-meta"><strong>{item.title}</strong><small>{item.slug}</small></span><Indicator tone={item.published ? 'ok' : 'neutral'}>{item.published ? 'Visível' : 'Oculto'}</Indicator>
                </button>)}
                {visibleTools.length === 0 && <p className="ce-admin-empty">Nenhum instrumento atende aos filtros.</p>}
              </div>
            </Panel>
            <Panel title={edited ? `Editar · ${edited.title}` : 'Selecione um instrumento'} subtitle="Somente título, descrição e intenção de visibilidade são editáveis nesta fase. Regras clínicas não são editadas aqui.">
              {edited && <div className="ce-admin-editor">
                <div className="ce-admin-keyline"><span>ID canônico</span><code>{edited.slug}</code><Indicator tone="neutral">Metadados editoriais</Indicator></div>
                <label className="ce-admin-field" htmlFor="admin-tool-title"><span>Título de exibição <em>Obrigatório</em></span><input id="admin-tool-title" value={edited.title} maxLength={80} onChange={e => edit({ ...edited, title: e.target.value })} aria-invalid={edited.title.trim().length < 3} /><small>{edited.title.length}/80 caracteres · mínimo de 3</small></label>
                <label className="ce-admin-field" htmlFor="admin-tool-lead"><span>Descrição de abertura <em>Obrigatória</em></span><textarea id="admin-tool-lead" rows={4} value={edited.lead} maxLength={400} onChange={e => edit({ ...edited, lead: e.target.value })} aria-invalid={edited.lead.trim().length < 10} /><small>{edited.lead.length}/400 caracteres · mínimo de 10</small></label>
                <label className="ce-admin-switch"><input type="checkbox" checked={edited.published} onChange={e => edit({ ...edited, published: e.target.checked })} /><span><strong>Habilitar na projeção local</strong><small>Não significa aprovação para publicação clínica ou publicação remota.</small></span></label>
                <div className="ce-admin-editor-buttons"><button type="button" className="ce-admin-btn ce-admin-btn--primary" onClick={save} disabled={!dirty || !dataIsValid || externalChange || loadingFailed}><Check size={16}/> Salvar rascunho</button><Indicator tone={dataIsValid ? 'ok' : 'warn'}>{dataIsValid ? 'Campos válidos' : 'Revise os campos'}</Indicator></div>
              </div>}
            </Panel>
          </div>
          <Panel title="Prévia — experiência do usuário final" subtitle="Selecione público/assinante e rascunho/publicado para comparar sem afetar outras pessoas." action={<Smartphone size={20} aria-hidden="true" />}>
            {preview && <div className="ce-admin-preview-wrapper">
              <div className="ce-admin-preview-controls">
                <fieldset><legend>Público da prévia</legend><label><input type="radio" name="admin-audience" checked={previewAudience === 'publico'} onChange={() => setPreviewAudience('publico')}/> Público</label><label><input type="radio" name="admin-audience" checked={previewAudience === 'assinante'} onChange={() => setPreviewAudience('assinante')}/> Assinante</label></fieldset>
                <fieldset><legend>Versão de conteúdo</legend><label><input type="radio" name="admin-version" checked={previewVersion === 'draft'} onChange={() => setPreviewVersion('draft')}/> Rascunho</label><label><input type="radio" name="admin-version" checked={previewVersion === 'published'} onChange={() => setPreviewVersion('published')}/> Publicado local</label></fieldset>
              </div>
              <div className="ce-admin-preview-frame">
                <div className="ce-admin-preview-top"><strong>Calculadoras de Enfermagem</strong><span>{previewAudience === 'publico' ? 'Site público' : 'Área do assinante'}</span></div>
                {preview.published ? <article className="ce-admin-preview-content"><span className="ce-admin-card-kicker">{base?.category ?? 'Ferramenta'} · {preview.slug}</span><h3>{preview.title}</h3><p>{preview.lead}</p><div className="ce-admin-preview-notice">Apenas apresentação editorial. O cálculo real, as regras clínicas e a autenticação não são simulados.</div>
                  {previewVersion === 'published' && <Link className="ce-admin-site-link" to={previewAudience === 'publico' ? '/ferramentas/$slug' : '/assinante/ferramentas/$slug'} params={{ slug: preview.slug }}>Abrir rota real <ArrowUpRight size={15}/></Link>}
                </article> : <div className="ce-admin-preview-hidden"><Eye size={21}/><strong>Conteúdo não visível</strong><p>Este instrumento está oculto na versão escolhida.</p></div>}
              </div>
            </div>}
          </Panel>
        </AdminErrorBoundary>}
        {tab === 'templates' && <AdminErrorBoundary moduleName="Templates"><TemplatesPanel /></AdminErrorBoundary>}
        {tab === 'sources' && <AdminErrorBoundary moduleName="Fontes"><SourcesPanel /></AdminErrorBoundary>}
        {tab === 'publication' && <>
          <Panel title="Controle de alterações e publicação" subtitle="O ato de publicar aqui altera apenas a projeção deste navegador. Não aciona GitHub, Vercel ou Supabase.">
            <div className="ce-admin-publication-state"><div><span>Rascunho marcado para exibição</span><strong>{draftCount} / {model.tools.length}</strong></div><div><span>Publicado no navegador</span><strong>{publishedCount} / {published.tools.length}</strong></div><div><span>Última revisão</span><strong>#{revision}</strong></div></div>
            <div className="ce-admin-publish-actions"><button type="button" className="ce-admin-btn ce-admin-btn--primary" onClick={save} disabled={!dirty || !dataIsValid || externalChange || loadingFailed}><Check size={16}/> Salvar rascunho local</button>
              <label className="ce-admin-confirm"><input type="checkbox" checked={confirmation} onChange={e => setConfirmation(e.target.checked)} disabled={dirty || loadingFailed || externalChange} /><span>Entendo que esta publicação é apenas local e não constitui homologação clínica.</span></label>
              <button type="button" className="ce-admin-btn" onClick={publish} disabled={dirty || !confirmation || !dataIsValid || externalChange || loadingFailed}><Eye size={16}/> Publicar rascunho salvo (local)</button>
              <p className="ce-admin-detail-note">A publicação exige confirmação explícita; alterações ainda não salvas, conflito de revisão e registro inválido bloqueiam a operação.</p>
            </div>
          </Panel>
          <Panel title="Exportar ou importar" subtitle="Backups de metadados não sensíveis, sem pacientes, tokens ou segredos.">
            <div className="ce-admin-export-actions"><button type="button" className="ce-admin-btn" onClick={() => exportWorkbench(model)} disabled={!dataIsValid}><Download size={16}/> Exportar rascunho JSON</button>
              <button type="button" className="ce-admin-btn" onClick={exportPublicationRegister} disabled={loadingFailed}><FileText size={16}/> Exportar registro e eventos</button>
              <label className="ce-admin-import"><FileInput size={17}/><span>Importar rascunho JSON</span><input type="file" accept=".json,application/json" onChange={e => void importFile(e)} disabled={loadingFailed || externalChange}/></label></div>
          </Panel>
          <Panel title="Histórico de revisões" subtitle="Até 500 eventos validados por sequência e ID no navegador. Não é auditoria imutável de servidor.">
            {events.length ? <ol className="ce-admin-history">{[...events].reverse().slice(0,20).map(event => <li key={event.id}><ClipboardCheck size={18}/><div><strong>{event.action === 'PUBLISHED' ? 'Publicação local' : 'Rascunho salvo'}</strong><small>{event.at} · Revisão {event.revision} · anterior {event.previousRevision}</small></div></li>)}</ol> : <p>Nenhuma alteração registrada nesta instalação.</p>}
          </Panel>
        </>}
        </ModuleBoundary>
      </div>
    </div>
  </main>;
}

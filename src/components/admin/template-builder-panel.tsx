import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import {
  AlertCircle, Copy, Download, Eye, FilePlus2, FolderOpen, Layers3,
  LockKeyhole, Save, Trash2
} from 'lucide-react';
import { templateCatalog } from '@/lib/template-catalog';
import { templateContracts } from '@/lib/template-contract';
import {
  createPreviewDraft, emptyLocalRegister, exportPreviewDraft, filterCanonicalTemplates,
  importPreviewDraft, removeLocalPreview, upsertLocalPreview, validateLocalRegister,
  validatePreviewDraft, type TemplatePreviewDraft, type LocalPreviewRegister,
  type PreviewContent
} from '@/lib/template-builder/model';
import '@/styles/admin-template-builder.css';

/** Editor LOCAL de apresentação, dentro do console canônico.
 * Não altera templates, campos clínicos, direitos, autorização ou release.
 */
const KEY = 'ce-admin:template-previews:1';
const catalog = templateCatalog;
const kinds = [...new Set(catalog.map(x=>x.kind))].sort();
const timestamp = () => new Date().toISOString();
const instanceId = () => 'ce_preview_' + crypto.randomUUID().replaceAll('-','');
function readRegister(): LocalPreviewRegister {
  const text = localStorage.getItem(KEY);
  return text===null ? emptyLocalRegister() : validateLocalRegister(JSON.parse(text) as unknown,catalog);
}
function writeRegister(next: LocalPreviewRegister, expectedRevision: number) {
  if(readRegister().revision!==expectedRevision) throw new Error('Conflito com outra aba. Recarregue.');
  const verified=validateLocalRegister(next,catalog);
  localStorage.setItem(KEY,JSON.stringify(verified));
  return verified;
}
function saveJson(filename:string, text:string) {
  const url=URL.createObjectURL(new Blob([text],{type:'application/json;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download=filename;a.click();
  window.setTimeout(()=>URL.revokeObjectURL(url),500);
}
export function TemplateBuilderPanel() {
  const [query,setQuery]=useState('');
  const [kind,setKind]=useState('all');
  const [sort,setSort]=useState<'name'|'kind'|'id'>('name');
  const [selectedId,setSelectedId]=useState(catalog[0]?.id ?? '');
  const [viewport,setViewport]=useState<'mobile'|'desktop'>('mobile');
  const [audience,setAudience]=useState<'publico'|'assinante'>('publico');
  const [register,setRegister]=useState<LocalPreviewRegister>(emptyLocalRegister);
  const [draft,setDraft]=useState<TemplatePreviewDraft|null>(null);
  const [changed,setChanged]=useState(false);
  const [conflict,setConflict]=useState(false);
  const [failed,setFailed]=useState(false);
  const [confirmDelete,setConfirmDelete]=useState(false);
  const [message,setMessage]=useState('Prévia local: publicação indisponível.');
  const fileInput=useRef<HTMLInputElement>(null);
  const filtered=useMemo(()=>filterCanonicalTemplates(catalog,query,kind,sort),[query,kind,sort]);
  const selected=catalog.find(t=>t.id===selectedId);
  const contract=selected?templateContracts[selected.kind]:null;
  const validation=useMemo(()=>{
    if(!draft)return 'Selecione um template.';
    try{validatePreviewDraft(draft,catalog);return '';}
    catch(e){return e instanceof Error?e.message:'Rascunho inválido.';}
  },[draft]);

  useEffect(()=>{
    try{
      setRegister(readRegister());
      if(catalog[0])setDraft(createPreviewDraft(catalog[0],instanceId(),timestamp()));
    }catch(e){
      setFailed(true);
      setMessage(e instanceof Error?e.message:'Não foi possível ler o registro local. Dados preservados.');
    }
    const onStorage=(e:StorageEvent)=>{
      if(e.key===KEY || e.key===null){
        setConflict(true);
        setMessage('Outra aba modificou os rascunhos. Recarregue antes de salvar.');
      }
    };
    window.addEventListener('storage',onStorage);
    return()=>window.removeEventListener('storage',onStorage);
  },[]);

  function selectTemplate(id:string) {
    const t=catalog.find(x=>x.id===id);
    if(!t)return;
    if(changed && !window.confirm('Descartar alterações não salvas?'))return;
    setSelectedId(id);
    setDraft(createPreviewDraft(t,instanceId(),timestamp()));
    setChanged(false);setConfirmDelete(false);setMessage('Nova prévia não salva.');
  }
  function selectSaved(d:TemplatePreviewDraft) {
    try{
      if(changed && !window.confirm('Descartar alterações não salvas?'))return;
      validatePreviewDraft(d,catalog);
      setSelectedId(d.templateId);setDraft(structuredClone(d));
      setChanged(false);setConfirmDelete(false);setMessage('Rascunho local selecionado.');
    }catch(e){setMessage(e instanceof Error?e.message:'Rascunho incompatível.');}
  }
  function edit(key:keyof PreviewContent,value:string){
    setDraft(d=>d?{...d,content:{...d.content,[key]:value}}:null);
    setChanged(true);setConfirmDelete(false);
  }
  function save(){
    try{
      if(!draft || failed || conflict)throw new Error('Operação local bloqueada.');
      validatePreviewDraft(draft,catalog);
      const persisted=writeRegister(upsertLocalPreview(register,draft,catalog,timestamp()),register.revision);
      setRegister(persisted);
      const saved=persisted.drafts.find(x=>x.instanceId===draft.instanceId);
      if(saved)setDraft(structuredClone(saved));
      setChanged(false);setMessage('Rascunho salvo somente neste navegador. Nenhum conteúdo foi publicado.');
    }catch(e){setMessage(e instanceof Error?e.message:'Não foi possível salvar.');}
  }
  function duplicate(){
    if(!draft)return;
    setDraft({...draft,instanceId:instanceId(),revision:0,updatedAt:timestamp()});
    setChanged(true);setConfirmDelete(false);setMessage('Cópia criada. Salve para incluí-la nos rascunhos.');
  }
  function remove(){
    try{
      if(!draft || !confirmDelete || failed || conflict)throw new Error('Exclusão local não autorizada.');
      const persisted=writeRegister(removeLocalPreview(register,draft.instanceId,catalog),register.revision);
      setRegister(persisted);
      if(selected)setDraft(createPreviewDraft(selected,instanceId(),timestamp()));
      setChanged(false);setConfirmDelete(false);setMessage('Rascunho local excluído. Nenhum registro remoto foi alterado.');
    }catch(e){setMessage(e instanceof Error?e.message:'Exclusão bloqueada.');}
  }
  function download(){
    try{
      if(!draft)throw new Error('Rascunho ausente.');
      saveJson(draft.templateId+'-'+draft.instanceId+'.json',exportPreviewDraft(draft,catalog));
      setMessage('JSON exportado como prévia local; não é publicação.');
    }catch(e){setMessage(e instanceof Error?e.message:'Exportação bloqueada.');}
  }
  async function importFile(e:ChangeEvent<HTMLInputElement>){
    const file=e.target.files?.[0];if(!file)return;
    try{
      if(failed || conflict)throw new Error('Registro local indisponível.');
      if(file.size>32768)throw new Error('Tamanho máximo: 32 KiB.');
      const imported=importPreviewDraft(await file.text(),catalog);
      if(changed && !window.confirm('Descartar alterações não salvas?'))return;
      setSelectedId(imported.templateId);
      setDraft({...imported,instanceId:instanceId(),revision:0,updatedAt:timestamp()});
      setChanged(true);setMessage('Importado como uma nova prévia não publicada.');
    }catch(error){setMessage(error instanceof Error?error.message:'Arquivo não reconhecido.');}
    finally{if(fileInput.current)fileInput.current.value='';}
  }

  return <section className="ce-admin-tbuilder" aria-label="Builder visual por templates">
    <header className="ce-admin-tbuilder__top">
      <div>
        <h3>Editor por templates</h3>
        <p>Use o catálogo canônico. Edite somente a apresentação de um rascunho local.</p>
      </div>
      <strong className="ce-admin-tbuilder__hold"><LockKeyhole size={16} aria-hidden="true"/> Publicação bloqueada</strong>
    </header>
    <div className="ce-admin-tbuilder__grid">
      <section className="ce-admin-tbuilder__card" aria-labelledby="ce-builder-catalog-title">
        <h4 id="ce-builder-catalog-title"><Layers3 size={17} aria-hidden="true"/> Templates <small>{filtered.length}/{catalog.length}</small></h4>
        <label>Buscar templates<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Nome, categoria ou ID"/></label>
        <div className="ce-admin-tbuilder__filters">
          <label>Família<select value={kind} onChange={e=>setKind(e.target.value)}>
            <option value="all">Todas</option>{kinds.map(x=><option value={x} key={x}>{x}</option>)}
          </select></label>
          <label>Ordenar<select value={sort} onChange={e=>setSort(e.target.value as typeof sort)}>
            <option value="name">Nome</option><option value="kind">Família</option><option value="id">ID</option>
          </select></label>
        </div>
        <div className="ce-admin-tbuilder__items" aria-label="Templates disponíveis">
          {filtered.map(t=><button type="button" key={t.id} className={selectedId===t.id?'is-active':''} aria-pressed={selectedId===t.id} onClick={()=>selectTemplate(t.id)}>
            <span><b>{t.name}</b><small>{t.kind} · {t.id}</small></span><span aria-hidden="true">›</span>
          </button>)}
          {!filtered.length&&<p>Nenhum template encontrado.</p>}
        </div>
        <h4><FolderOpen size={17} aria-hidden="true"/> Rascunhos locais <small>{register.drafts.length}/50</small></h4>
        <div className="ce-admin-tbuilder__items ce-admin-tbuilder__saved">
          {register.drafts.map(d=><button key={d.instanceId} type="button" onClick={()=>selectSaved(d)}>
            <span><b>{d.content.title}</b><small>{d.templateId} · revisão {d.revision}</small></span><span>Editar</span>
          </button>)}
          {!register.drafts.length&&<p>Nenhum rascunho salvo.</p>}
        </div>
      </section>
      <section className="ce-admin-tbuilder__card" aria-labelledby="ce-builder-edit-title">
        <h4 id="ce-builder-edit-title"><FilePlus2 size={17} aria-hidden="true"/> Apresentação</h4>
        {draft&&<>
          <p className="ce-admin-tbuilder__context">Template: <b>{selected?.id}</b> · rota: <code>{selected?.href}</code></p>
          <div className="ce-admin-tbuilder__fields">
            <label>Chamada curta <small>até 40 caracteres</small><input maxLength={40} value={draft.content.eyebrow} onChange={e=>edit('eyebrow',e.target.value)}/></label>
            <label>Título <small>3 a 100 caracteres</small><input required maxLength={100} value={draft.content.title} onChange={e=>edit('title',e.target.value)}/></label>
            <label>Resumo <small>até 320 caracteres</small><textarea rows={4} maxLength={320} value={draft.content.summary} onChange={e=>edit('summary',e.target.value)}/></label>
            <label>Texto da ação <small>2 a 48 caracteres</small><input required maxLength={48} value={draft.content.actionLabel} onChange={e=>edit('actionLabel',e.target.value)}/></label>
          </div>
          {validation?<p className="ce-admin-tbuilder__error" role="alert">{validation}</p>:
            <p className="ce-admin-tbuilder__valid">Campos válidos para prévia; sem aprovação de conteúdo.</p>}
          <div className="ce-admin-tbuilder__actions">
            <button type="button" disabled={!!validation||failed||conflict} onClick={save}><Save size={16}/> Salvar</button>
            <button type="button" onClick={duplicate}><Copy size={16}/> Duplicar</button>
            <button type="button" disabled={!!validation} onClick={download}><Download size={16}/> Exportar</button>
            <button type="button" onClick={()=>fileInput.current?.click()}><FolderOpen size={16}/> Importar</button>
            <input ref={fileInput} type="file" accept=".json,application/json" hidden onChange={importFile}/>
          </div>
          {register.drafts.some(x=>x.instanceId===draft.instanceId)&&<div className="ce-admin-tbuilder__remove">
            {!confirmDelete?<button type="button" onClick={()=>setConfirmDelete(true)}><Trash2 size={16}/> Excluir rascunho</button>:<>
              <strong>Excluir apenas a cópia local?</strong>
              <button type="button" onClick={remove}>Confirmar</button>
              <button type="button" onClick={()=>setConfirmDelete(false)}>Cancelar</button>
            </>}
          </div>}
          <p role="status" aria-live="polite" className="ce-admin-tbuilder__status">{message}{changed?' · Alterações não salvas.':''}</p>
        </>}
      </section>
      <section className="ce-admin-tbuilder__card ce-admin-tbuilder__preview-card" aria-labelledby="ce-builder-preview-title">
        <h4 id="ce-builder-preview-title"><Eye size={17} aria-hidden="true"/> Prévia</h4>
        <div className="ce-admin-tbuilder__filters">
          <label>Dispositivo<select value={viewport} onChange={e=>setViewport(e.target.value as typeof viewport)}>
            <option value="mobile">Celular</option><option value="desktop">Desktop</option>
          </select></label>
          <label>Público<select value={audience} onChange={e=>setAudience(e.target.value as typeof audience)}>
            <option value="publico">Visitante</option><option value="assinante">Assinante</option>
          </select></label>
        </div>
        <div className={'ce-admin-tbuilder__viewport ce-admin-tbuilder__viewport--'+viewport}>
          <div className="ce-admin-tbuilder__preview-header">Prévia · {audience==='publico'?'Público':'Assinante'}</div>
          {contract?.crumbs&&<p className="ce-admin-tbuilder__crumb">Início / {selected?.kind} / {selected?.name}</p>}
          {contract?.hero!=='none'?<div className="ce-admin-tbuilder__hero">
            {draft?.content.eyebrow&&<small>{draft.content.eyebrow}</small>}
            <h5>{draft?.content.title||selected?.name}</h5>
            <p>{draft?.content.summary||'Prévia sem conteúdo governado.'}</p>
          </div>:<h5 className="ce-admin-tbuilder__nohero">{draft?.content.title||selected?.name}</h5>}
          <div className="ce-admin-tbuilder__preview-content">
            <p>Dados clínicos, evidências e regras não são editáveis nesta prévia.</p>
            <span>{draft?.content.actionLabel}</span>
          </div>
        </div>
        {contract&&<details className="ce-admin-tbuilder__contract">
          <summary>Contrato do template — somente leitura</summary>
          <dl>
            <div><dt>Família</dt><dd>{selected?.kind}</dd></div>
            <div><dt>Hero</dt><dd>{contract.hero}</dd></div>
            <div><dt>Breadcrumb</dt><dd>{String(contract.crumbs)}</dd></div>
            <div><dt>Ações</dt><dd>{contract.tools.join(', ')||'Nenhuma'}</dd></div>
            <div><dt>Recursos</dt><dd>{contract.resources.join(', ')||'Nenhum'}</dd></div>
          </dl>
        </details>}
        <p className="ce-admin-tbuilder__notice"><AlertCircle size={16} aria-hidden="true"/> Sem gravação remota, sem alterar evidências e sem publicação.</p>
      </section>
    </div>
  </section>;
}

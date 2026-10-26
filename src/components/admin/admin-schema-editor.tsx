import { useId, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, ChevronDown, ClipboardList, Download, FileJson, LockKeyhole, ShieldCheck } from 'lucide-react';
import { getAdminModule, type AdminModuleId } from '@/lib/admin-module-registry';
import { displayLabel, getTemplate, moduleFormTemplates, type JsonField } from '@/lib/admin-form-template-registry';
import '@/styles/admin-schema-editor.css';

type Field={path:string;schema:JsonField;required:boolean;group:'identidade'|'referencias'|'atributos'};
type Values=Record<string,string>;
const idPattern=/^[A-Za-z0-9][A-Za-z0-9._:/@-]*$/;
const statusAllowlist=new Set(['CANDIDATE','DRAFT']);
function groupFor(path:string):Field['group']{
  if(['schema_version','canonical_id','version','status','updated_at','object_type','source_type'].includes(path))return 'identidade';
  return /(^|_)(ref|refs|id|ids)$/.test(path)||/ref(s)?$/.test(path)||/provenance|authority_binding|license/.test(path)?'referencias':'atributos';
}
function flatten(properties:Record<string,JsonField>,required:readonly string[]=[],prefix=''):Field[]{
  return Object.entries(properties).flatMap(([name,schema])=>{
    const path=prefix?prefix+'.'+name:name;
    const isRequired=required.includes(name);
    if(schema.type==='object'&&schema.properties)return flatten(schema.properties,schema.required??[],path).map(f=>({...f,required:f.required&&isRequired}));
    return [{path,schema,required:isRequired,group:groupFor(path)}];
  });
}
function fieldVisible(field:Field,values:Values){
  if(field.path==='license_ref')return ['LICENSED','RESTRICTED'].includes(values.rights??'');
  if(field.path==='effective_until')return Boolean(values.effective_from);
  return true;
}
function asOutput(field:Field,raw:string):unknown{
  const {schema}=field;
  if(schema.const!==undefined)return schema.const;
  if(schema.type==='boolean')return raw==='true';
  if(schema.type==='integer'||schema.type==='number')return Number(raw);
  if(schema.type==='array'){
    if(schema.items?.type==='object')return JSON.parse(raw);
    return raw.split('\n').map(s=>s.trim()).filter(Boolean).map(v=>schema.items?.type==='integer'?Number(v):schema.items?.type==='number'?Number(v):v);
  }
  if(schema.type==='object')return JSON.parse(raw);
  if(schema.format==='date-time')return new Date(raw).toISOString();
  return raw.trim();
}
function hasContent(field:Field,value:string){
  if(field.schema.const!==undefined)return true;
  if(field.schema.type==='boolean')return value==='true'||value==='false';
  if(field.schema.type==='array'){
    if(field.schema.items?.type==='object')return value.trim()!==''&&value.trim()!=='[]';
    return value.split('\n').some(s=>s.trim());
  }
  return value.trim()!=='';
}
function validate(field:Field,value:string):string|null{
  const schema=field.schema;
  const v=value.trim();
  if(field.required&&!hasContent(field,value))return 'Campo obrigatório pelo schema original.';
  if(!hasContent(field,value))return null;
  if(field.path==='canonical_id'&&!idPattern.test(v))return 'Use apenas letras, números, ponto, hífen, sublinhado, dois-pontos, barra ou @. Sem espaços.';
  if(field.path==='status'&&!statusAllowlist.has(v))return 'Nesta prévia só é possível preparar candidatos e rascunhos, sem simular aprovação.';
  if(schema.enum&&!(schema.enum as unknown[]).some(e=>String(e)===v))return 'Valor fora do conjunto permitido pelo contrato.';
  if(schema.pattern){try{if(!new RegExp(schema.pattern).test(v))return 'Formato inválido. Regra: '+schema.pattern;}catch{return 'Padrão do schema indisponível: revisão técnica necessária.';}}
  if(schema.minLength!==undefined&&v.length<schema.minLength)return 'Mínimo de '+schema.minLength+' caracteres.';
  if(schema.maxLength!==undefined&&v.length>schema.maxLength)return 'Máximo de '+schema.maxLength+' caracteres.';
  if(schema.type==='integer'||schema.type==='number'){
    const n=Number(v);
    if(!Number.isFinite(n)||(schema.type==='integer'&&!Number.isInteger(n)))return schema.type==='integer'?'Informe um número inteiro.':'Informe um número válido.';
    if(schema.minimum!==undefined&&n<schema.minimum)return 'Valor mínimo: '+schema.minimum;
    if(schema.maximum!==undefined&&n>schema.maximum)return 'Valor máximo: '+schema.maximum;
  }
  if(schema.format==='date'&&!/^\d{4}-\d{2}-\d{2}$/.test(v))return 'Informe data válida (DD/MM/AAAA na interface; ISO 8601 no JSON).';
  if(schema.format==='date-time'&&Number.isNaN(new Date(v).getTime()))return 'Informe data e hora válidas.';
  if(schema.format==='uri'||schema.format==='url'){try{const u=new URL(v);if(!['https:','http:'].includes(u.protocol))return 'Use URL HTTP ou HTTPS.';}catch{return 'Informe URL válida.';}}
  if((schema.type==='object'||schema.items?.type==='object'&&schema.type==='array')){
    try{const obj=JSON.parse(v);if(schema.type==='array'&&!Array.isArray(obj))return 'Informe um array JSON.';if(schema.type==='object'&&(obj===null||Array.isArray(obj)||typeof obj!=='object'))return 'Informe objeto JSON.';}catch{return 'JSON inválido: corrija a estrutura.';}
  }
  if(schema.type==='array'&&schema.items?.type==='integer'&&v.split('\n').some(x=>x.trim()&&!Number.isInteger(Number(x))))return 'Use um número inteiro por linha.';
  return null;
}
function outputTree(fields:Field[],values:Values){
  const obj:Record<string,unknown>={};
  for(const field of fields){
    if(!fieldVisible(field,values)||!hasContent(field,values[field.path]??'')&&field.schema.const===undefined)continue;
    const parts=field.path.split('.');
    let cursor:Record<string,unknown>=obj;
    for(const p of parts.slice(0,-1)){const nested=cursor[p];if(!nested||typeof nested!=='object'||Array.isArray(nested))cursor[p]={};cursor=cursor[p] as Record<string,unknown>;}
    cursor[parts[parts.length-1]]=asOutput(field,values[field.path]??'');
  }
  return obj;
}
function fieldHelp(field:Field){
  const {path,schema}=field;
  if(schema.const!==undefined)return 'Valor fixo definido no schema canônico.';
  if(path==='canonical_id')return 'Ex.: CKO:OBJ-001. Persistido sem espaços e com caracteres restritos.';
  if(schema.format==='date')return 'Exibição conforme o navegador (pt-BR: DD/MM/AAAA); persistência: YYYY-MM-DD.';
  if(schema.format==='date-time')return 'Data/hora local na interface; exportação RFC 3339 em UTC.';
  if(schema.type==='array'&&schema.items?.type!=='object')return 'Um identificador ou valor por linha. IDs devem vir de registros governados.';
  if(schema.type==='array')return 'Array JSON. Estrutura validada localmente; relações reais exigem validação do serviço proprietário.';
  if(schema.type==='object')return 'Objeto JSON conforme o schema de referência.';
  if(/ref(s)?$|_id$/.test(path))return 'Informe ID existente no cadastro canônico. A disponibilidade desse ID não é verificada nesta prévia.';
  if(schema.pattern)return 'Caracteres e formato limitados pelo schema.';
  return schema.description??'Campo derivado do contrato canônico existente.';
}
function FieldEditor({field,value,onChange,id}:{field:Field;value:string;onChange:(s:string)=>void;id:string}){
  const {schema,path}=field;
  const error=validate(field,value);
  const common={id,value,onChange:(e:React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>)=>onChange(e.target.value),'aria-invalid':Boolean(error)};
  const label=displayLabel(path.split('.').at(-1)??path);
  const fixed=schema.const!==undefined;
  const enums=schema.enum?.filter(o=>path!=='status'||statusAllowlist.has(String(o)));
  const isJson=schema.type==='object'||schema.type==='array'&&schema.items?.type==='object';
  const isMultiline=schema.type==='array'||isJson;
  return <div className="ce-schema-field">
    <label htmlFor={id}><strong>{label}</strong>{field.required&&<span className="ce-schema-required">Obrigatório</span>}</label>
    <span className="ce-schema-field-key"><code>{path}</code> · {schema.type??'string'}{schema.format?' · '+schema.format:''}</span>
    {fixed?<input id={id} value={String(schema.const)} readOnly aria-readonly="true" />:
      enums?<select {...common}><option value="">Selecione…</option>{enums.map(option=><option key={String(option)} value={String(option)}>{String(option).replaceAll('_',' ')}</option>)}</select>:
      schema.type==='boolean'?<select {...common}><option value="">Selecione…</option><option value="true">Sim</option><option value="false">Não</option></select>:
      isMultiline?<textarea {...common} rows={schema.type==='array'?3:4} placeholder={isJson?(schema.type==='array'?'[]':'{}'):'Um por linha'} spellCheck={false}/>:
      <input {...common} type={schema.format==='date'?'date':schema.format==='date-time'?'datetime-local':schema.type==='number'||schema.type==='integer'?'number':schema.format==='uri'?'url':'text'}
        step={schema.type==='integer'?'1':schema.type==='number'?'any':undefined}
        min={schema.minimum} max={schema.maximum} maxLength={schema.maxLength}
        placeholder={/ref(s)?$|_id$/.test(path)?'ID canônico':schema.format==='uri'?'https://…':''}
        spellCheck={false}/>}
    <small>{fieldHelp(field)}</small>
    {error&&<span className="ce-schema-error" role="alert">{error}</span>}
  </div>;
}
function initialValues(fields:Field[]):Values{
  const today=new Date();
  const yyyy=today.getFullYear(),mm=String(today.getMonth()+1).padStart(2,'0'),dd=String(today.getDate()).padStart(2,'0');
  const obj:Values={};
  for(const f of fields){if(f.schema.const!==undefined)obj[f.path]=String(f.schema.const);else if(f.path==='status'&&f.schema.enum?.includes('DRAFT'))obj[f.path]='DRAFT';else if(f.path==='updated_at')obj[f.path]=yyyy+'-'+mm+'-'+dd;else obj[f.path]='';}
  return obj;
}
function downloadJson(filename:string,obj:unknown){
  const blob=new Blob([JSON.stringify(obj,null,2)+'\n'],{type:'application/json;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const element=document.createElement('a');element.href=url;element.download=filename;element.click();URL.revokeObjectURL(url);
}
type SessionDraft = {id:string;templateKey:string;values:Values;updatedAt:string};
export function AdminSchemaEditor({moduleId,submodule}:{moduleId:AdminModuleId;submodule:string}){
  const templates=moduleFormTemplates[moduleId];
  const [drafts,setDrafts]=useState<SessionDraft[]>([]);
  const [editing,setEditing]=useState<string|null>(null);
  const [deletion,setDeletion]=useState<string|null>(null);
  const [templateKey,setTemplateKey]=useState(templates[0].key);
  const [values,setValues]=useState<Values>(()=>initialValues(flatten(templates[0].schema.properties,templates[0].schema.required??[])));
  const [review,setReview]=useState(false);
  const [notice,setNotice]=useState('');
  const uid=useId().replace(/:/g,'');
  const current=getTemplate(moduleId,templateKey);
  const fields=useMemo(()=>flatten(current.schema.properties,current.schema.required??[]),[current]);
  const visible=useMemo(()=>fields.filter(field=>fieldVisible(field,values)),[fields,values]);
  const errors=visible.filter(f=>validate(f,values[f.path]??'')!==null);
  const valid=errors.length===0;
  const complete=visible.filter(f=>f.required&&hasContent(f,values[f.path]??'')).length;
  const required=visible.filter(f=>f.required).length;
  function selectTemplate(key:string){setTemplateKey(key);const entry=getTemplate(moduleId,key);setValues(initialValues(flatten(entry.schema.properties,entry.schema.required??[])));setEditing(null);setDeletion(null);setReview(false);setNotice('');}
  function newDraft(){setValues(initialValues(fields));setEditing(null);setDeletion(null);setReview(false);setNotice('Novo rascunho iniciado nesta sessão.');}
  function saveSessionDraft(){
    setReview(true);
    if(!valid){setNotice('Corrija os campos destacados antes de salvar.');return;}
    const id=(values.canonical_id??'').trim();
    if(!id){setNotice('Informe um identificador canônico antes de salvar.');return;}
    if(editing&&editing!==current.key+'::'+id){setNotice('Para alterar o identificador, crie outro rascunho.');return;}
    const record:SessionDraft={id,templateKey:current.key,values:{...values},updatedAt:new Date().toISOString()};
    setDrafts(old=>[...old.filter(x=>x.templateKey+'::'+x.id!==current.key+'::'+id),record]);
    setEditing(current.key+'::'+id);setNotice('Rascunho salvo na memória desta tela, sem persistência remota.');
  }
  function loadDraft(entry:SessionDraft){
    setTemplateKey(entry.templateKey);setValues({...entry.values});setEditing(entry.templateKey+'::'+entry.id);setDeletion(null);setReview(false);setNotice('Rascunho carregado para edição nesta sessão.');
  }
  function removeDraft(entry:SessionDraft){
    const key=entry.templateKey+'::'+entry.id;
    if(deletion!==key){setDeletion(key);setNotice('Confirme a exclusão do rascunho da sessão. Nenhum registro canônico será alterado.');return;}
    setDrafts(old=>old.filter(x=>x.templateKey+'::'+x.id!==key));if(editing===key)newDraft();setDeletion(null);setNotice('Rascunho descartado desta sessão.');
  }
  function set(path:string,value:string){
    setValues(old=>{
      const next={...old,[path]:value};
      if(path==='rights'&&!['LICENSED','RESTRICTED'].includes(value))next.license_ref='';
      if(path==='effective_from'&&!value)next.effective_until='';
      return next;
    });setReview(false);setNotice('');
  }
  function exportDraft(){
    setReview(true);
    if(!valid){setNotice('Há campos inválidos ou obrigatórios pendentes. Corrija antes de exportar.');return;}
    const payload=outputTree(visible,values);
    const draft={_preview_notice:'RASCUNHO LOCAL NAO ADMITIDO; sem aprovacoes, execucao ou persistencia no Kernel',_module_id:moduleId,_submodule:submodule,_schema_ref:current.schema.$id,_template_key:current.key,object:payload};
    downloadJson('rascunho-'+moduleId.toLowerCase()+'-'+current.key+'.json',draft);
    setNotice('Rascunho exportado neste dispositivo; nenhum serviço remoto foi acionado.');
  }
  return <section className="ce-schema" aria-labelledby={uid+'-heading'}>
    <div className="ce-schema-head"><div>
      <span className="ce-modules-eyebrow">FORMULÁRIO GOVERNADO · SOMENTE RASCUNHO</span>
      <h3 id={uid+'-heading'}>Campos e templates — {moduleId}</h3>
      <p>Campos derivados dos JSON Schemas existentes no repositório, com labels de apresentação e validação local.</p>
    </div><span className="ce-schema-state"><LockKeyhole size={15}/> Sem escrita remota</span></div>
    <div className="ce-schema-template-select">
      <div className="ce-schema-submodule"><strong>Submódulo selecionado</strong><span>{submodule}</span></div>
      <label htmlFor={uid+'-template'}>Template / contrato
        <select id={uid+'-template'} value={current.key} onChange={e=>selectTemplate(e.target.value)}>{templates.map(t=><option key={t.key} value={t.key}>{t.label}</option>)}</select>
      </label>
    </div>
    <div className="ce-schema-contract"><FileJson size={17}/><div><strong>{current.label}</strong><code>{current.schema.$id}</code><span>{current.scope}</span>{current.gap&&<span className="ce-schema-gap"><AlertCircle size={14}/>{current.gap}</span>}</div></div>
    <div className="ce-schema-progress"><span>{complete} de {required} campos obrigatórios preenchidos</span><strong>{errors.length===0?'Verificação local sem erros':'Campos a revisar: '+errors.length}</strong></div>
    <div className="ce-schema-bar" role="progressbar" aria-valuemin={0} aria-valuemax={Math.max(required,1)} aria-valuenow={complete} aria-label="Campos obrigatórios preenchidos"><span style={{width:(required?100*complete/required:100)+'%'}}/></div>
    {(['identidade','atributos','referencias'] as const).map((g,i)=>{
      const members=visible.filter(f=>f.group===g);
      if(!members.length)return null;
      return <details key={g} className="ce-schema-section" open={i===0 || undefined}>
        <summary><span>{i+1} · {g==='identidade'?'Identificação e versionamento':g==='atributos'?'Dados do objeto':'Vínculos e referências'}</span><small>{members.length} campos</small><ChevronDown size={17}/></summary>
        <div className="ce-schema-fields">
          {members.map((f,j)=><FieldEditor key={f.path} id={uid+'-'+g+'-'+j} field={f} value={values[f.path]??''} onChange={v=>set(f.path,v)}/>)}
        </div>
      </details>;
    })}
    <div className="ce-schema-footer">
      <p><ShieldCheck size={17}/> IDs de referência não são verificados contra cadastros remotos nesta prévia. Campos condicionais são apresentação; aprovação e validação definitiva dependem dos contratos e serviços proprietários.</p>
      <div className="ce-schema-drafts" aria-label="Rascunhos da sessão"><div><strong>Rascunhos nesta sessão ({drafts.length})</strong><small>São descartados ao sair desta tela. Exporte o JSON para guardar.</small></div><button type="button" onClick={newDraft}>Criar novo rascunho</button>{drafts.map(item=><div className="ce-schema-draft-row" key={item.templateKey+'::'+item.id}><span><strong>{item.id}</strong><small>{item.templateKey} · {item.updatedAt.slice(0,16).replace('T',' ')}</small></span><button type="button" onClick={()=>loadDraft(item)}>Editar</button><button type="button" onClick={()=>removeDraft(item)}>{deletion===item.templateKey+'::'+item.id?'Confirmar exclusão':'Excluir'}</button></div>)}</div>
      <div className="ce-schema-actions"><button type="button" className="ce-schema-review" onClick={saveSessionDraft} disabled={!valid}>Salvar rascunho na sessão</button><button type="button" className="ce-schema-review" onClick={()=>{setReview(v=>!v);setNotice('')}}><ClipboardList size={16}/>{review?'Ocultar revisão':'Revisar rascunho'}</button>
        <button type="button" className="ce-schema-export" onClick={exportDraft} disabled={!valid}><Download size={16}/> Exportar JSON de rascunho</button></div>
      {review&&<div className="ce-schema-review-panel" role="status"><strong>Revisão local</strong><p>{valid?'Campos obrigatórios preenchidos de acordo com as verificações implementadas.':'Há '+errors.length+' erro(s) de formulário.'} Não são verificados vínculos, permissões, licenças, políticas, RLS ou homologação clínica.</p><pre>{JSON.stringify(valid?outputTree(visible,values):Object.fromEntries(errors.map(f=>[f.path,validate(f,values[f.path]??'')])),null,2)}</pre></div>}
      {notice&&<p role="status" className="ce-schema-notice">{notice}</p>}
    </div>
  </section>;
}

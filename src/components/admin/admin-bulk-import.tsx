import { useMemo, useRef, useState, type ChangeEvent } from 'react';
import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, FileUp, LockKeyhole, RotateCcw } from 'lucide-react';
import {
  LIMITS, csvTemplate, importProfiles, parseBulkImport, reviewBulkImport, suggestedMapping,
  type ImportProfile, type ImportReview, type ParsedImport,
} from '@/core/governance/bulk-import';
import '@/styles/admin-bulk-import.css';

type Step = 'choose'|'map'|'review';
type StagedPackage = {
  schema_version:'0.1.0';
  type:'CKO_STAGING_IMPORT_CANDIDATE';
  source:{name:string;format:string;size_bytes:number;sha256:string};
  profile:{key:string;destination:string;version:'CANDIDATE'};
  mapping:Record<string,string>;
  summary:{total:number;candidates:number;held:number;duplicates:number};
  chunk_size:250;
  chunks:{index:number;first_row:number;last_row:number;sha256:string}[];
  rows:ImportReview['records'];
  findings:ImportReview['issues'];
  status:'NOT_SUBMITTED';
  has_remote_write:false;
};
function toHex(data:ArrayBuffer){return [...new Uint8Array(data)].map(byte=>byte.toString(16).padStart(2,'0')).join('');}
async function hash(data:ArrayBuffer|string){
  const bytes=typeof data==='string'?new TextEncoder().encode(data):data;
  if(!crypto?.subtle)throw Error('Este navegador não oferece cálculo criptográfico seguro.');
  return toHex(await crypto.subtle.digest('SHA-256',bytes));
}
function download(name:string,content:string,mime:string){
  const url=URL.createObjectURL(new Blob([content],{type:mime}));
  const link=document.createElement('a');link.href=url;link.download=name;link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export function AdminBulkImport(){
  const [profileId,setProfileId]=useState<ImportProfile['id']>('sources');
  const [filename,setFilename]=useState('');
  const [fileSize,setFileSize]=useState(0);
  const [fileHash,setFileHash]=useState('');
  const [parsed,setParsed]=useState<ParsedImport|null>(null);
  const [mapping,setMapping]=useState<Record<string,string>>({});
  const [review,setReview]=useState<ImportReview|null>(null);
  const [pkg,setPkg]=useState<StagedPackage|null>(null);
  const [step,setStep]=useState<Step>('choose');
  const [progress,setProgress]=useState(0);
  const [working,setWorking]=useState(false);
  const [error,setError]=useState('');
  const [filter,setFilter]=useState<'all'|'CANDIDATE'|'HOLD'>('all');
  const [page,setPage]=useState(0);
  const fileInput=useRef<HTMLInputElement>(null);
  const profile=importProfiles.find(x=>x.id===profileId)!;
  const items=useMemo(()=>review?.records.filter(x=>filter==='all'||x.state===filter)??[],[review,filter]);
  function reset(){
    setParsed(null);setMapping({});setReview(null);setPkg(null);setFilename('');setFileHash('');
    setProgress(0);setError('');setPage(0);setFilter('all');setStep('choose');
    if(fileInput.current)fileInput.current.value='';
  }
  async function receive(e:ChangeEvent<HTMLInputElement>){
    const file=e.target.files?.[0];if(!file)return;
    reset();setWorking(true);
    try{
      if(file.size>LIMITS.maxBytes)throw Error('O arquivo ultrapassa o limite de 5 MiB.');
      setProgress(10);
      const bytes=await file.arrayBuffer();
      const text=new TextDecoder('utf-8',{fatal:true}).decode(bytes);
      setProgress(35);
      const imported=parseBulkImport(file.name,text);
      setProgress(65);
      const digest=await hash(bytes);
      setFilename(file.name);setFileSize(file.size);setFileHash(digest);
      setParsed(imported);setMapping(suggestedMapping(imported,profile));
      setStep('map');setProgress(100);
    }catch(err){setError(err instanceof Error?err.message:'Não foi possível ler este arquivo.');setProgress(0);}
    finally{setWorking(false);}
  }
  async function prepare(){
    if(!parsed||!filename||!fileHash)return;
    setWorking(true);setError('');setProgress(10);
    try{
      const checked=reviewBulkImport(parsed,profile,mapping);
      setProgress(35);
      const chunks:StagedPackage['chunks']=[];
      for(let i=0;i<checked.records.length;i+=250){
        const records=checked.records.slice(i,i+250);
        chunks.push({
          index:Math.floor(i/250),first_row:records[0].line,
          last_row:records[records.length-1].line,
          sha256:await hash(JSON.stringify(records)),
        });
        setProgress(35+Math.round(65*Math.min(i+250,checked.records.length)/checked.records.length));
      }
      const prepared:StagedPackage={
        schema_version:'0.1.0',type:'CKO_STAGING_IMPORT_CANDIDATE',
        source:{name:filename,format:parsed.format,size_bytes:fileSize,sha256:fileHash},
        profile:{key:profile.id,destination:profile.destination,version:'CANDIDATE'},
        mapping:{...mapping},
        summary:{total:checked.total,candidates:checked.candidates,held:checked.held,duplicates:checked.duplicates},
        chunk_size:250,chunks,rows:checked.records,findings:checked.issues,
        status:'NOT_SUBMITTED',has_remote_write:false,
      };
      setPkg(prepared);setReview(checked);setStep('review');setFilter('all');setPage(0);setProgress(100);
    }catch(err){setError(err instanceof Error?err.message:'Falha na validação do lote.');setProgress(0);}
    finally{setWorking(false);}
  }
  function exportPackage(){
    if(!pkg)return;
    download('CKO-IMPORT-'+pkg.profile.key+'-'+pkg.source.sha256.slice(0,12)+'.json',JSON.stringify(pkg,null,2)+'\n','application/json;charset=utf-8');
  }
  function exportTemplate(){
    download('modelo-'+profile.id+'.csv',csvTemplate(profile),'text/csv;charset=utf-8');
  }
  return <section className="ce-import" aria-labelledby="ce-import-title">
    <header className="ce-import-intro"><div><h4 id="ce-import-title">Preparar importação</h4><p>Carregue um arquivo, associe as colunas ao cadastro existente e revise as linhas antes de gerar o pacote de staging.</p></div><span className="ce-import-locked"><LockKeyhole size={15}/> Gravação bloqueada</span></header>
    <ol className="ce-import-steps" aria-label="Etapas da importação">
      <li aria-current={step==='choose'?'step':undefined}>1. Arquivo</li>
      <li aria-current={step==='map'?'step':undefined}>2. Mapeamento</li>
      <li aria-current={step==='review'?'step':undefined}>3. Revisão</li>
    </ol>
    <div className="ce-import-pane">
      {step==='choose'&&<>
        <label className="ce-import-label" htmlFor="ce-import-profile">Tipo de cadastro
          <select id="ce-import-profile" value={profileId} disabled={working} onChange={e=>{setProfileId(e.target.value as ImportProfile['id']);reset();}}>
            {importProfiles.map(x=><option key={x.id} value={x.id}>{x.label}</option>)}
          </select>
        </label>
        <p className="ce-import-description">Destino estrutural: <code>{profile.destination}</code>. Somente candidatos; nenhum registro é enviado ao Supabase.</p>
        <button type="button" className="ce-import-secondary" onClick={exportTemplate}><Download size={16}/> Baixar modelo CSV</button>
        <label className="ce-import-upload" htmlFor="ce-import-file"><FileUp size={22}/><strong>Selecionar arquivo CSV, TSV ou JSON</strong><span>UTF-8 · até 5 MiB · 10.000 linhas · 60 colunas</span>
          <input ref={fileInput} id="ce-import-file" type="file" accept=".csv,.tsv,.json,text/csv,text/tab-separated-values,application/json" disabled={working} onChange={e=>void receive(e)}/>
        </label>
      </>}
      {step==='map'&&parsed&&<>
        <div className="ce-import-meta"><FileSpreadsheet size={18}/><strong>{filename}</strong><span>{parsed.rows.length} linhas · SHA-256: {fileHash.slice(0,16)}…</span></div>
        <p>Associe cada campo do cadastro à coluna do arquivo. Campos obrigatórios são marcados com *.</p>
        <div className="ce-import-map">
          {profile.fields.map(field=><label key={field.key} htmlFor={'ce-import-col-'+field.key}>{field.label}{field.required?' *':''}
            <select id={'ce-import-col-'+field.key} value={mapping[field.key]??''} disabled={working} onChange={e=>setMapping(old=>({...old,[field.key]:e.target.value}))}>
              <option value="">Não mapear</option>{parsed.headers.map(header=><option value={header} key={header}>{header}</option>)}
            </select>
          </label>)}
        </div>
        <div className="ce-import-actions"><button type="button" className="ce-import-secondary" onClick={()=>{reset();setStep('choose');}}>Trocar arquivo</button><button type="button" disabled={working} onClick={()=>void prepare()}>Validar lote</button></div>
      </>}
      {step==='review'&&review&&pkg&&<>
        <div className="ce-import-stats" aria-label="Resultado da validação">
          <div><strong>{review.total}</strong><span>Linhas</span></div>
          <div><strong>{review.candidates}</strong><span>Candidatas</span></div>
          <div><strong>{review.held}</strong><span>Bloqueadas</span></div>
          <div><strong>{review.duplicates}</strong><span>Duplicadas</span></div>
        </div>
        <p className="ce-import-description">Resultado prévio do arquivo, sem validação de existência, licença, vínculos ou permissões no banco. Todas as linhas seguem sem admissão no Kernel.</p>
        <label className="ce-import-label" htmlFor="ce-import-filter">Exibir
          <select id="ce-import-filter" value={filter} onChange={e=>{setFilter(e.target.value as typeof filter);setPage(0);}}>
            <option value="all">Todas as linhas</option><option value="CANDIDATE">Candidatas</option><option value="HOLD">Bloqueadas</option>
          </select>
        </label>
        <div className="ce-import-table"><table><thead><tr><th>Linha</th><th>ID</th><th>Estado</th><th>Validação</th></tr></thead><tbody>{items.slice(page*10,page*10+10).map((row,i)=><tr key={row.line+'-'+i}><td data-label="Linha">{row.line}</td><td data-label="ID">{row.identifier||'—'}</td><td data-label="Estado">{row.state==='HOLD'?'Bloqueada':'Candidata'}</td><td data-label="Validação">{row.issues.length?row.issues.map(x=>x.column+': '+x.message).join(' · '):'Campos locais válidos'}</td></tr>)}</tbody></table></div>
        <div className="ce-import-pagination"><button type="button" disabled={page===0} onClick={()=>setPage(n=>n-1)}>Anterior</button><span>{items.length?Math.min(page*10+1,items.length):0}–{Math.min((page+1)*10,items.length)} de {items.length}</span><button type="button" disabled={(page+1)*10>=items.length} onClick={()=>setPage(n=>n+1)}>Próxima</button></div>
        <div className="ce-import-actions"><button className="ce-import-secondary" type="button" onClick={()=>setStep('map')}>Revisar mapeamento</button><button type="button" onClick={exportPackage}><Download size={17}/> Exportar pacote JSON</button></div>
        <p className="ce-import-description"><CheckCircle2 size={15}/> Pacote com hash do arquivo, hash de cada lote de 250 registros, erros por linha e estado <code>NOT_SUBMITTED</code>.</p>
      </>}
    </div>
    {working||progress>0&&step!=='review'?<div className="ce-import-progress" role="status"><span>Processamento: {progress}%</span><progress max={100} value={progress}/></div>:null}
    {error&&<p className="ce-import-error" role="alert"><AlertCircle size={17}/>{error}</p>}
    {step==='review'&&<button type="button" className="ce-import-reset" onClick={reset}><RotateCcw size={15}/> Nova importação</button>}
  </section>;
}

import {parseNFeXML,parseEFDText,auditCrossCheck,findingsCSV,MAX_XML_BYTES,MAX_EFD_BYTES,assessInputReadiness,incompleteAuditReport} from './audit.js';
import {demoXMLs,demoEFD} from './fixtures.js';
import {createTriageLedger,recordTriage,TRIAGE_LABELS,dossierWithTriage,findingsCSVWithTriage,MAX_REVIEW_NOTE} from './triage.js';
import {paginateFindings,FINDINGS_PAGE_SIZE} from './findings-pagination.js';
const $=id=>document.getElementById(id);
const fmtMoney=value => Number(value??0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const labels={overview:'Visão geral',import:'Importar dados',audit:'Execução de auditoria',findings:'Achados e investigação',sources:'Fontes e contratos',governance:'Governança e WOs'};
let xmlInputs=demoXMLs.map((content,i)=>({name:`nfe-ficticia-${i+1}.xml`,content}));
let efdInput={name:'efd-ficticia.txt',content:demoEFD};
let report=null;let selectedId=null;let currentView='overview';let toastTimer=null;
let xmlSelectionCount=xmlInputs.length;let xmlErrors=[];let efdErrors=[];let lastAttemptInvalid=false;
let xmlReadVersion=0;let efdReadVersion=0;
let triageLedger=createTriageLedger();
let findingsPage=0;
function clearTriage(){triageLedger=createTriageLedger();}
function showToast(message){const el=$('toast');el.textContent=message;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{el.hidden=true},4500)}
function go(view){
 if(!labels[view])return;
 currentView=view;
 document.querySelectorAll('[data-panel]').forEach(el=>el.classList.toggle('active',el.dataset.panel===view));
 document.querySelectorAll('nav [data-view]').forEach(el=>{const active=el.dataset.view===view;el.classList.toggle('active',active);if(active)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current')});
 $('breadcrumb-current').textContent=labels[view];
 $('sidebar').classList.remove('open');
 $('menu-toggle').setAttribute('aria-expanded','false');
 if(view==='findings'){
  const index=report?.findings.findIndex(f=>f.id===selectedId)??-1;
  if(index>=0)findingsPage=Math.floor(index/FINDINGS_PAGE_SIZE);
  renderFindings();
 }
 window.scrollTo({top:0,behavior:'instant'});
}
function renderWarnings(target,lines){
 const el=$(target);el.replaceChildren();
 if(!lines.length){const d=document.createElement('div');d.textContent='Sem advertências adicionais neste lote. O leiaute fiscal continua não homologado.';el.append(d);return}
 for(const line of lines){const d=document.createElement('div');d.textContent=line;el.append(d)}
}
function statusChip(value){const chip=document.createElement('span');chip.className=`severity-chip ${value}`;chip.textContent=value==='HIGH'?'ALTA':value==='MEDIUM'?'MÉDIA':'NÃO AVALIADA';return chip}
function recentFinding(f){const b=document.createElement('button');b.className='recent-item';b.append(statusChip(f.severity));const t=document.createElement('strong');t.textContent=f.title;const d=document.createElement('small');d.textContent=f.description;b.append(t,d);b.addEventListener('click',()=>{selectedId=f.id;go('findings')});return b}
function renderOverview(){
 if(!report)return;
 $('metric-xml').textContent=report.input.xmlCount;
 $('metric-efd').textContent=report.input.c100Count;
 $('metric-matches').textContent=report.matches;
 $('metric-findings').textContent=report.summary.findings;
 $('severity-high').textContent=report.summary.high;
 $('severity-medium').textContent=report.summary.medium;
 $('sidebar-count').textContent=report.summary.findings;
 const denominator=Math.max(1,report.summary.findings);
 $('bar-high').style.width=`${report.summary.high/denominator*100}%`;
 $('bar-medium').style.width=`${report.summary.medium/denominator*100}%`;
 const recent=$('overview-findings');recent.replaceChildren();
 if(!report.findings.length){const p=document.createElement('p');p.className='no-findings';p.textContent='Nenhuma diferença estrutural identificada neste conjunto de dados.';recent.append(p)}
 else report.findings.slice(0,3).forEach(f=>recent.append(recentFinding(f)));
 $('last-run-time').textContent=new Date(report.generatedAt).toLocaleString('pt-BR');
 $('last-run-match').textContent=report.status==='INCOMPLETE'?'NÃO EXECUTADO — entradas incompletas':`${report.matches} correspondência(s)`;
 renderWarnings('audit-warnings',report.warnings);
}
function safeLinkText(value){return String(value??'')}
function renderFindingDetail(f){
 const root=$('finding-detail');root.replaceChildren();
 if(!f){const e=document.createElement('p');e.className='empty-state';e.textContent='Selecione um achado para explorar as evidências.';root.append(e);return}
 const chip=statusChip(f.severity);const h=document.createElement('h2');h.className='detail-title';h.textContent=f.title;
 const desc=document.createElement('p');desc.className='detail-description';desc.textContent=f.description;
 root.append(chip,h,desc);
 const blocks=[
 ['EVIDÊNCIA ESTRUTURAL',Object.entries(f.context||{}).map(([key,value])=>`${key}: ${safeLinkText(value)}`).join(' • ')||'Sem detalhes adicionais'],
 ['HIPÓTESE, NÃO CAUSA CONFIRMADA',f.hypothesis||'Ainda não há hipótese.'],
 ['CONCLUSÃO FISCAL','NÃO AVALIADA. Exige fonte normativa, vigência e revisão independente.'],
 ['REVISÃO','ABERTA. O piloto não grava decisões nem aprovações.']
 ];
 blocks.forEach(([label,value])=>{const sec=document.createElement('section');sec.className='detail-section';const t=document.createElement('h3');t.textContent=label;const v=document.createElement('p');v.textContent=value;sec.append(t,v);root.append(sec)});
 const current=triageLedger.reviews.get(f.id);
 const sec=document.createElement('section');sec.className='detail-section triage-section';
 const title=document.createElement('h3');title.textContent='ANOTAÇÃO DE REVISÃO · SOMENTE NESTA SESSÃO';
 const note=document.createElement('p');note.className='triage-disclaimer';note.textContent='Registro de teste sem aprovação, sem validação fiscal e sem salvamento no servidor. Exporte o dossiê antes de fechar esta página.';
 const form=document.createElement('form');form.className='triage-form';form.id='triage-form';
 const selectLabel=document.createElement('label');selectLabel.htmlFor='triage-status';selectLabel.textContent='Situação da investigação';
 const select=document.createElement('select');select.id='triage-status';
 Object.entries(TRIAGE_LABELS).forEach(([value,label])=>{const option=document.createElement('option');option.value=value;option.textContent=label;select.append(option)});
 select.value=current?.status||'PENDING';
 const noteLabel=document.createElement('label');noteLabel.htmlFor='triage-note';noteLabel.textContent='Observação (não representa conclusão fiscal)';
 const area=document.createElement('textarea');area.id='triage-note';area.rows=4;area.maxLength=MAX_REVIEW_NOTE;
 area.placeholder='Descreva o que precisa ser investigado. Não insira dados empresariais reais.';area.value=current?.note||'';
 const action=document.createElement('button');action.type='submit';action.className='button button-dark';action.textContent='Registrar anotação local';
 const hint=document.createElement('small');hint.className='triage-hint';hint.textContent=current?`Revisão local nº ${current.sequence}. Recarregar a página elimina as notas.`:'Ainda não existe anotação para este achado.';
 form.append(selectLabel,select,noteLabel,area,action,hint);
 form.addEventListener('submit',event=>{
  event.preventDefault();
  try{recordTriage(triageLedger,report,f.id,select.value,area.value);renderFindings();showToast('Anotação registrada apenas nesta sessão. Não é aprovação fiscal.');}
  catch(err){showToast(err.message);select.focus();}
 });
 sec.append(title,note,form);root.append(sec);
}
function renderFindings(){
 if(!report)return;
 const term=$('finding-search').value.trim().toLowerCase(), severity=$('severity-filter').value,triage=$('triage-filter').value;
 const found=report.findings.filter(f=>(severity==='ALL'||f.severity===severity)&&(triage==='ALL'||(triageLedger.reviews.get(f.id)?.status||'PENDING')===triage)&&
  [f.id,f.title,f.description,f.kind,f.context?.key,f.hypothesis].some(v=>String(v||'').toLowerCase().includes(term)));
 const page=paginateFindings(found,findingsPage);
 findingsPage=page.page;
 $('result-count').textContent=`${found.length} achado(s) · exibindo ${page.total?page.from+1:0}–${page.to}`;
 $('findings-empty').hidden=Boolean(found.length);
 $('findings-page-status').textContent=`Página ${page.page+1} de ${page.pages}`;
 $('findings-prev').disabled=!page.hasPrevious;
 $('findings-next').disabled=!page.hasNext;
 const table=$('findings-table');table.replaceChildren();
 page.items.forEach(f=>{
  const row=document.createElement('tr');row.classList.toggle('selected',f.id===selectedId);
  const first=document.createElement('td');const open=document.createElement('button');
  open.type='button';open.className='table-open';open.setAttribute('aria-label',`Investigar ${f.title}`);
  const title=document.createElement('strong');title.textContent=f.title;
  const sub=document.createElement('small');sub.textContent=f.id;
  open.append(title,sub);first.append(open);
  const second=document.createElement('td');second.append(statusChip(f.severity));
  const third=document.createElement('td');third.textContent=TRIAGE_LABELS[triageLedger.reviews.get(f.id)?.status||'PENDING'];
  const fourth=document.createElement('td');fourth.textContent='→';row.append(first,second,third,fourth);
  open.addEventListener('click',()=>{selectedId=f.id;renderFindings()});table.append(row);
 });
 const selected=page.items.find(f=>f.id===selectedId)||page.items[0]||null;
 if(selected)selectedId=selected.id;
 renderFindingDetail(selected);
}
function doAudit(){
 const xmls=[],parsingWarnings=[...xmlErrors,...efdErrors];
 for(const item of xmlInputs){try{xmls.push({...parseNFeXML(item.content),sourceFile:item.name})}catch(e){parsingWarnings.push(`${item.name}: ${e.message}`)}}
 let efd=null;
 if(efdInput) try{efd=parseEFDText(efdInput.content)}catch(e){parsingWarnings.push(`EFD: ${e.message}`)}
 const readiness=assessInputReadiness({selectedXmlCount:xmlSelectionCount,parsedXmls:xmls,efd,errors:parsingWarnings});
 if(!readiness.ready){
  report=incompleteAuditReport({selectedXmlCount:xmlSelectionCount,c100Count:efd?.c100?.length||0,
   warnings:[...readiness.reasons,...(efd?.warnings||[])]});
  lastAttemptInvalid=true;
 } else {
  report=auditCrossCheck(xmls,efd);
  lastAttemptInvalid=false;
 }
 report.demoOnly=true;report.sourceFiles={xml:xmlInputs.map(x=>x.name),efd:efdInput?.name??null};
 selectedId=report.findings[0]?.id??null;
 findingsPage=0;
 renderOverview();renderFindings();renderWarnings('import-warnings',report.warnings);
 $('xml-selected').textContent=xmlErrors.length?'Lote XML incompleto — consulte as advertências':`${xmlInputs.length} XML(s) selecionado(s)`;
 $('efd-selected').textContent=efdInput?.name||'Nenhuma EFD selecionada';
 $('import-state').textContent=lastAttemptInvalid?'LOTE INCOMPLETO':'PROCESSAMENTO LOCAL';
 $('export-csv').disabled=lastAttemptInvalid;
 $('export-json').disabled=lastAttemptInvalid;
 if(lastAttemptInvalid)showToast('Auditoria suspensa: verifique as entradas. Nenhum achado inferido.');
 else showToast(`Cruzamento concluído: ${report.findings.length} achado(s), ${report.matches} correspondência(s).`);
}
function saveBlob(name,contents,type){const blob=new Blob([contents],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500)}
async function readXmlFiles(fileList){
 if(!fileList?.length)return;
 const version=++xmlReadVersion, expected=fileList.length, nextInputs=[], nextErrors=[];
 // Preserve errors from the *other* source. One valid file must not erase a failed sibling.
 clearTriage();xmlSelectionCount=expected;xmlInputs=[];xmlErrors=['XMLs em leitura: cruzamento suspenso.'];
 doAudit();
 if(expected>10)nextErrors.push('Selecione até 10 XMLs por lote.');
 else for(const f of Array.from(fileList)){
  if(f.size>MAX_XML_BYTES){nextErrors.push(`${f.name}: máximo 2 MB.`);continue}
  if(!/\.xml$/i.test(f.name)){nextErrors.push(`${f.name}: apenas arquivos .xml.`);continue}
  try{nextInputs.push({name:f.name,content:await f.text()})}
  catch{nextErrors.push(`${f.name}: falha de leitura do arquivo.`)}
 }
 if(version!==xmlReadVersion)return; // a newer selection superseded this asynchronous read
 xmlInputs=nextInputs;xmlErrors=nextErrors;
 showToast(xmlErrors.length?'Lote XML incompleto: cruzamento suspenso.':'XMLs carregados localmente.');
 doAudit();
}
async function readEFD(files){
 const f=files?.[0];if(!f)return;
 const version=++efdReadVersion;
 clearTriage();efdInput=null;efdErrors=['EFD em leitura: cruzamento suspenso.'];doAudit();
 const nextErrors=[];let nextInput=null;
 if(f.size>MAX_EFD_BYTES)nextErrors.push('EFD: tamanho máximo 4 MB.');
 else if(!/\.txt$/i.test(f.name))nextErrors.push('EFD: apenas arquivos .txt.');
 else try{nextInput={name:f.name,content:await f.text()}}catch{nextErrors.push('EFD: falha de leitura.');}
 if(version!==efdReadVersion)return;
 efdInput=nextInput;efdErrors=nextErrors;
 showToast(efdErrors.length?'EFD rejeitada.':'TXT carregado localmente.');
 doAudit();
}
function init(){
 document.querySelectorAll('[data-view]').forEach(el=>el.addEventListener('click',()=>go(el.dataset.view)));
 $('menu-toggle').addEventListener('click',()=>{const open=$('sidebar').classList.toggle('open');$('menu-toggle').setAttribute('aria-expanded',String(open))});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('sidebar').classList.remove('open');$('menu-toggle').setAttribute('aria-expanded','false')}});
 $('select-xml-button').addEventListener('click',()=>$('xml-files').click());
 $('select-efd-button').addEventListener('click',()=>$('efd-file').click());
 $('run-demo-top').addEventListener('click',()=>{doAudit();go('audit')});
 $('run-import').addEventListener('click',()=>{doAudit();go('audit')});
 $('run-again').addEventListener('click',doAudit);
 $('reset-demo').addEventListener('click',()=>{clearTriage();xmlInputs=demoXMLs.map((content,i)=>({name:`nfe-ficticia-${i+1}.xml`,content}));efdInput={name:'efd-ficticia.txt',content:demoEFD};xmlSelectionCount=xmlInputs.length;xmlErrors=[];efdErrors=[];xmlReadVersion++;efdReadVersion++;$('xml-files').value='';$('efd-file').value='';doAudit()});
 $('xml-files').addEventListener('change',e=>readXmlFiles(e.target.files));
 $('efd-file').addEventListener('change',e=>readEFD(e.target.files));
 const resetFindingPage=()=>{findingsPage=0;selectedId=null;renderFindings()};
 $('finding-search').addEventListener('input',resetFindingPage);
 $('severity-filter').addEventListener('change',resetFindingPage);
 $('triage-filter').addEventListener('change',resetFindingPage);
 $('findings-prev').addEventListener('click',()=>{findingsPage=Math.max(0,findingsPage-1);selectedId=null;renderFindings()});
 $('findings-next').addEventListener('click',()=>{findingsPage++;selectedId=null;renderFindings()});
 $('export-csv').addEventListener('click',()=>{if(report){saveBlob('wutrib-achados-ficticios.csv',findingsCSVWithTriage(report,triageLedger),'text/csv;charset=utf-8');showToast('CSV demonstrativo exportado.')}});
 $('export-json').addEventListener('click',()=>{if(report){saveBlob('wutrib-dossie-demonstrativo.json',JSON.stringify(dossierWithTriage(report,triageLedger),null,2),'application/json;charset=utf-8');showToast('Dossiê JSON demonstrativo exportado.')}});
 doAudit();go('overview');
}
init();

import {parseNFeXML,parseEFDText,auditCrossCheck,findingsCSV,MAX_XML_BYTES,MAX_EFD_BYTES} from './audit.js';
import {demoXMLs,demoEFD} from './fixtures.js';
const $=id=>document.getElementById(id);
const fmtMoney=value => Number(value??0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const labels={overview:'Visão geral',import:'Importar dados',audit:'Execução de auditoria',findings:'Achados e investigação',sources:'Fontes e contratos',governance:'Governança e WOs'};
let xmlInputs=demoXMLs.map((content,i)=>({name:`nfe-ficticia-${i+1}.xml`,content}));
let efdInput={name:'efd-ficticia.txt',content:demoEFD};
let report=null;let selectedId=null;let currentView='overview';let toastTimer=null;
function showToast(message){const el=$('toast');el.textContent=message;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{el.hidden=true},4500)}
function go(view){
 if(!labels[view])return;
 currentView=view;
 document.querySelectorAll('[data-panel]').forEach(el=>el.classList.toggle('active',el.dataset.panel===view));
 document.querySelectorAll('nav [data-view]').forEach(el=>el.classList.toggle('active',el.dataset.view===view));
 $('breadcrumb-current').textContent=labels[view];
 $('sidebar').classList.remove('open');
 if(view==='findings')renderFindings();
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
 $('last-run-match').textContent=`${report.matches} correspondência(s)`;
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
}
function renderFindings(){
 if(!report)return;
 const term=$('finding-search').value.trim().toLowerCase(), severity=$('severity-filter').value;
 const found=report.findings.filter(f=>(severity==='ALL'||f.severity===severity)&&
  [f.id,f.title,f.description,f.kind,f.context?.key,f.hypothesis].some(v=>String(v||'').toLowerCase().includes(term)));
 $('result-count').textContent=`${found.length} achado(s)`;
 $('findings-empty').hidden=Boolean(found.length);
 const table=$('findings-table');table.replaceChildren();
 found.forEach(f=>{const row=document.createElement('tr');row.classList.toggle('selected',f.id===selectedId);row.tabIndex=0;row.setAttribute('aria-label',`Abrir achado ${f.title}`);
  const first=document.createElement('td');const title=document.createElement('strong');title.textContent=f.title;const sub=document.createElement('small');sub.textContent=f.id;first.append(title,sub);
  const second=document.createElement('td');second.append(statusChip(f.severity));const third=document.createElement('td');third.textContent='Investigar';const fourth=document.createElement('td');fourth.textContent='→';row.append(first,second,third,fourth);
  const select=()=>{selectedId=f.id;renderFindings()};row.addEventListener('click',select);row.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select()}});table.append(row)
 });
 const selected=found.find(f=>f.id===selectedId)||found[0]||null;
 if(selected)selectedId=selected.id;
 renderFindingDetail(selected);
}
function doAudit(){
 const xmls=[],parsingWarnings=[];
 for(const item of xmlInputs){try{xmls.push(parseNFeXML(item.content))}catch(e){parsingWarnings.push(`${item.name}: ${e.message}`)}}
 let efd={c100:[],warnings:['EFD não fornecida.']};
 if(efdInput)try{efd=parseEFDText(efdInput.content)}catch(e){parsingWarnings.push(`EFD: ${e.message}`)}
 report=auditCrossCheck(xmls,efd);
 report.warnings=[...parsingWarnings,...report.warnings];
 report.demoOnly=true;report.sourceFiles={xml:xmlInputs.map(x=>x.name),efd:efdInput?.name??null};
 selectedId=report.findings[0]?.id??null;
 renderOverview();renderFindings();renderWarnings('import-warnings',report.warnings);
 $('xml-selected').textContent=`${xmlInputs.length} XML(s) selecionado(s)`;
 $('efd-selected').textContent=efdInput?.name||'Nenhuma EFD selecionada';
 $('import-state').textContent=parsingWarnings.length?'VERIFICAR ENTRADAS':'PROCESSAMENTO LOCAL';
 showToast(`Cruzamento concluído: ${report.findings.length} achado(s), ${report.matches} correspondência(s).`);
}
function saveBlob(name,contents,type){const blob=new Blob([contents],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500)}
async function readXmlFiles(fileList){
 if(!fileList?.length)return;
 if(fileList.length>10){showToast('Selecione até 10 XMLs por lote.');return}
 const all=[];
 for(const f of fileList){
  if(f.size>MAX_XML_BYTES){showToast(`${f.name}: máximo 2 MB.`);return}
  if(!/\.xml$/i.test(f.name)){showToast('Apenas arquivos .xml neste campo.');return}
  all.push({name:f.name,content:await f.text()});
 }
 xmlInputs=all;$('xml-selected').textContent=`${all.length} XML(s) pronto(s)`;showToast('XMLs carregados localmente. Execute o cruzamento.');
}
async function readEFD(files){const f=files?.[0];if(!f)return;if(f.size>MAX_EFD_BYTES){showToast('EFD: tamanho máximo 4 MB.');return}if(!/\.txt$/i.test(f.name)){showToast('Apenas TXT no campo EFD.');return}efdInput={name:f.name,content:await f.text()};$('efd-selected').textContent=f.name;showToast('TXT carregado localmente. Execute o cruzamento.')}
function init(){
 document.querySelectorAll('[data-view]').forEach(el=>el.addEventListener('click',()=>go(el.dataset.view)));
 $('menu-toggle').addEventListener('click',()=>{$('sidebar').classList.toggle('open')});
 $('run-demo-top').addEventListener('click',()=>{doAudit();go('audit')});
 $('run-import').addEventListener('click',()=>{doAudit();go('audit')});
 $('run-again').addEventListener('click',doAudit);
 $('reset-demo').addEventListener('click',()=>{xmlInputs=demoXMLs.map((content,i)=>({name:`nfe-ficticia-${i+1}.xml`,content}));efdInput={name:'efd-ficticia.txt',content:demoEFD};$('xml-files').value='';$('efd-file').value='';doAudit()});
 $('xml-files').addEventListener('change',e=>readXmlFiles(e.target.files));
 $('efd-file').addEventListener('change',e=>readEFD(e.target.files));
 $('finding-search').addEventListener('input',renderFindings);
 $('severity-filter').addEventListener('change',renderFindings);
 $('export-csv').addEventListener('click',()=>{if(report){saveBlob('wutrib-achados-ficticios.csv',findingsCSV(report),'text/csv;charset=utf-8');showToast('CSV demonstrativo exportado.')}});
 $('export-json').addEventListener('click',()=>{if(report){saveBlob('wutrib-dossie-demonstrativo.json',JSON.stringify(report,null,2),'application/json;charset=utf-8');showToast('Dossiê JSON demonstrativo exportado.')}});
 doAudit();go('overview');
}
init();
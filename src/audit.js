/**
 * WU-TRIB Pilot — client-only structural cross-check.
 * No fiscal/legal conformity judgments. No network operations.
 */
export const MAX_XML_BYTES = 2 * 1024 * 1024;
export const MAX_EFD_BYTES = 4 * 1024 * 1024;
export const KEY_RE = /^\d{44}$/;

function direct(parent, localName) {
  return parent && Array.from(parent.children || []).find(n => n.localName === localName) || null;
}
function nested(parent, ...path) { return path.reduce((node, segment) => direct(node, segment), parent); }
function txt(parent, ...path) { return (nested(parent, ...path)?.textContent || '').trim(); }
function allDesc(node, local) {return Array.from(node?.getElementsByTagName('*') || []).filter(x => x.localName === local);}
function parseBRNumber(v) {
  if (!v || !/^[-+]?\d+(?:[,.]\d+)?$/.test(String(v).trim())) return null;
  const n = Number(String(v).replace(',', '.'));
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
}
function isTextSafe(value) {return String(value || '').replace(/[\r\n\t]/g,' ').slice(0,200)}
function issue(id, kind, severity, title, description, context = {}, hypothesis = '') {
  return {id,kind,severity,title,description,context,hypothesis,
    fiscalConformity:'NOT_EVALUATED',causeStatus:'HYPOTHESIS_NOT_CONFIRMED',reviewStatus:'OPEN'};
}

/** Parse NF-e XML with a DOMParser-compatible implementation supplied by caller. */
export function parseNFeXML(source, parserFactory = () => new DOMParser()) {
  if (typeof source !== 'string' || !source.trim()) throw new Error('XML vazio.');
  if (new TextEncoder().encode(source).length > MAX_XML_BYTES) throw new Error('XML excede 2 MB.');
  if (/<!\s*(?:DOCTYPE|ENTITY)\b/i.test(source)) throw new Error('DTD/ENTITY não permitidos no piloto.');
  const doc = parserFactory().parseFromString(source, 'application/xml');
  if (allDesc(doc,'parsererror').length) throw new Error('XML malformado.');
  const inf = allDesc(doc,'infNFe')[0];
  if (!inf) throw new Error('Estrutura infNFe não encontrada.');
  const key = (inf.getAttribute('Id') || '').replace(/^NFe/, '');
  if (!KEY_RE.test(key)) throw new Error('Chave NF-e sintática inválida: são esperados 44 dígitos.');
  const ide = direct(inf, 'ide'), total = nested(inf, 'total', 'ICMSTot');
  const number = txt(ide,'nNF');
  const amount = parseBRNumber(txt(total,'vNF'));
  if (!number || amount === null) throw new Error('Número da NF-e ou total vNF ausente/inválido.');
  const items = allDesc(inf, 'det').map((det,i) => ({
    item: Number(det.getAttribute('nItem') || i + 1),
    description: isTextSafe(txt(det,'prod','xProd')),
    cfop: txt(det,'prod','CFOP'),
    ncm: txt(det,'prod','NCM'),
    amount: parseBRNumber(txt(det,'prod','vProd'))
  }));
  return {
    key,number,amount,issuedAt:txt(ide,'dhEmi') || txt(ide,'dEmi'),
    issuer:txt(inf,'emit','xNome'),recipient:txt(inf,'dest','xNome'),
    items,kind:'NFE',source:'XML_NFE',syntacticOnly:true
  };
}

/** EFD C100 extract (not a complete official layout validator). */
export function parseEFDText(source) {
  if (typeof source !== 'string' || !source.trim()) throw new Error('EFD vazia.');
  if (new TextEncoder().encode(source).length > MAX_EFD_BYTES) throw new Error('TXT excede 4 MB.');
  const lines=source.replace(/^\uFEFF/,'').split(/\r?\n/);
  const c100=[]; const warnings=[];
  let headerSeen=false;
  lines.forEach((line,i)=>{
    if (!line.trim()) return;
    if (!line.startsWith('|') || !line.endsWith('|')) {warnings.push(`Linha ${i+1}: delimitadores não reconhecidos`);return;}
    const cols=line.split('|');
    if(cols[1]==='0000') headerSeen=true;
    if(cols[1]!=='C100') return;
    const key=(cols[9]||'').trim(), number=(cols[8]||'').trim();
    const amount=parseBRNumber(cols[12]);
    if(!KEY_RE.test(key)) {warnings.push(`Linha ${i+1}: chave C100 ausente/inválida`);return;}
    if(amount===null) {warnings.push(`Linha ${i+1}: valor C100 não numérico`);return;}
    c100.push({key,number,amount,line:i+1,kind:'C100',source:'EFD_ICMS_IPI',syntacticOnly:true});
  });
  if(!headerSeen) warnings.push('Registro 0000 não localizado; leiaute/versão não homologados.');
  if(!c100.length) warnings.push('Nenhum C100 com chave e valor utilizáveis.');
  return {c100,warnings,headerSeen,format:'EFD_ICMS_IPI',syntacticOnly:true};
}

export function auditCrossCheck(xmlDocuments, efdInput, opts={}) {
  const xmls=Array.isArray(xmlDocuments)?xmlDocuments:[];
  const c100=Array.isArray(efdInput)?efdInput:(efdInput?.c100||[]);
  const tolerance=opts.tolerance ?? 0.01;
  const xmlByKey=new Map(), efdByKey=new Map(), findings=[];
  const add=(r)=>findings.push(r);
  for(const d of xmls){const a=xmlByKey.get(d.key)||[];a.push(d);xmlByKey.set(d.key,a)}
  for(const d of c100){const a=efdByKey.get(d.key)||[];a.push(d);efdByKey.set(d.key,a)}
  let matches=0;
  for(const [key,xmlRows] of xmlByKey){
    const efdRows=efdByKey.get(key)||[];
    if(xmlRows.length!==1){add(issue(`DUP-X-${key.slice(-8)}`,'DUPLICATE','HIGH','NF-e XML duplicada',
      `${xmlRows.length} documentos XML compartilham a mesma chave.`,{key,quantity:xmlRows.length},'Arquivos repetidos no lote'));continue}
    if(!efdRows.length){add(issue(`MISS-EFD-${key.slice(-8)}`,'MISSING_EFD','HIGH','NF-e sem C100 no lote EFD',
      'A chave do XML não foi localizada nos registros C100 importados.',{key,xmlValue:xmlRows[0].amount},
      'O arquivo EFD pode estar incompleto, abranger outro período ou não incluir a operação.'));continue}
    if(efdRows.length!==1){add(issue(`DUP-E-${key.slice(-8)}`,'DUPLICATE','HIGH','Chave repetida em C100',
      `${efdRows.length} registros C100 com a mesma chave.`,{key,quantity:efdRows.length},'Duplicidade ou estrutura de arquivo não interpretada.'));continue}
    const delta=Math.round((xmlRows[0].amount-efdRows[0].amount)*100)/100;
    if(Math.abs(delta)>tolerance){add(issue(`DIFF-${key.slice(-8)}`,'VALUE_DIFFERENCE','MEDIUM','Diferença entre XML e C100',
      'Os totais vNF (XML) e VL_DOC (C100) divergem neste conjunto de teste.',
      {key,xmlValue:xmlRows[0].amount,efdValue:efdRows[0].amount,delta},
      'Diferença de origem, versão, conteúdo ou regra de escrituração; requer investigação.'));
    }else matches++;
  }
  for(const [key,efdRows] of efdByKey){
    if(xmlByKey.has(key)) continue;
    add(issue(`MISS-XML-${key.slice(-8)}`,'MISSING_XML','MEDIUM','C100 sem XML no lote',
      'A chave C100 não foi encontrada entre os XMLs fornecidos.',
      {key,efdValue:efdRows[0].amount},'Conjunto de XMLs pode estar incompleto.'));
  }
  const warnings=Array.isArray(efdInput?.warnings)?efdInput.warnings:[];
  return {runId:`LOCAL-${Date.now()}`,generatedAt:new Date().toISOString(),
    mode:'DEMONSTRATION_CLIENT_ONLY',taxConformity:'NOT_EVALUATED',layoutCertification:'NOT_PERFORMED',
    input:{xmlCount:xmls.length,c100Count:c100.length},matches,findings,warnings,
    summary:{findings:findings.length,high:findings.filter(f=>f.severity==='HIGH').length,
      medium:findings.filter(f=>f.severity==='MEDIUM').length}};
}

export function escapeCSVCell(value){
  const str=String(value ?? '');
  // spreadsheet formula injection guard
  const safe=/^[\s]*[=+\-@\t\r]/.test(str)?`'${str}`:str;
  return `"${safe.replaceAll('"','""')}"`;
}
export function findingsCSV(report){
  const rows=[['ID','Severidade','Tipo','Título','Chave','Diferença','Conformidade fiscal','Hipótese']];
  for(const f of report.findings)rows.push([f.id,f.severity,f.kind,f.title,f.context?.key||'',f.context?.delta??'',f.fiscalConformity,f.hypothesis]);
  return '\uFEFF'+rows.map(row=>row.map(escapeCSVCell).join(';')).join('\r\n');
}

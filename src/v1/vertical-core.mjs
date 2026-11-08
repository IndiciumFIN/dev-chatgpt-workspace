/**
 * WU-TRIB v1 vertical slice — normalized synthetic records only.
 * Node 22, offline, deterministic. No tax conformity, no automatic approval.
 * Not a general NF-e XML, EFD, Protheus, XSD or tax-law validator.
 */
import {createHash} from 'node:crypto';
export const CONTRACT='wutrib.v1.synthetic.vertical.v1';
export const AMOUNT_RE=/^(?:0|[1-9]\d{0,12})\.\d{2}$/;
export const ACCESS_KEY_RE=/^\d{44}$/;
const MAX_EFD_BYTES=1024*1024;
const MAX_RECORDS=30000;
const MAX_DOCUMENTS=1000;
const hash=value=>createHash('sha256').update(value).digest('hex');
const serial=value=>JSON.stringify(value);
const fail=(message)=>{throw new Error('V1_CONTRACT_BLOCKED: '+message);};
const sanitize=s=>String(s).replace(/[\r\n|\u0000-\u001f]/g,' ').slice(0,180);
export function cents(text) {
  if(typeof text!=='string'||!AMOUNT_RE.test(text))fail('Valor decimal exige string não negativa, duas casas e até 13 dígitos inteiros.');
  const [integer,decimal]=text.split('.');
  return BigInt(integer)*100n+BigInt(decimal);
}
export function money(value) {
  const sign=value<0n?'-':'',abs=value<0n?-value:value;
  return sign+(abs/100n).toString()+'.'+(abs%100n).toString().padStart(2,'0');
}
export function nfeDigit(first43) {
  if(typeof first43!=='string'||!/^\d{43}$/.test(first43))fail('Base NF-e precisa de 43 dígitos.');
  let sum=0,weight=2;
  for(let i=42;i>=0;i--) {sum+=Number(first43[i])*weight;weight=weight===9?2:weight+1;}
  const mod=sum%11;
  return String(mod<2?0:11-mod);
}
export function validKey(key) {
  return typeof key==='string'&&ACCESS_KEY_RE.test(key)&&nfeDigit(key.slice(0,43))===key[43];
}
function requireKey(key,source) {if(!validKey(key))fail(source+': chave de 44 dígitos com DV inválido.');}
function strictContext(metadata) {
  if(!metadata||metadata.contract!==CONTRACT||metadata.syntheticOnly!==true)fail('Contrato synthetic-only não confirmado.');
  if(typeof metadata.organization!=='string'||!/^SYNTH-[A-Z0-9-]{3,40}$/.test(metadata.organization))fail('Organização não sintética ou ausente.');
  if(!/^\d{4}-\d\d$/.test(metadata.period||'')||!/^20\d\d-\d\d$/.test(metadata.period))fail('Competência inválida.');
  if(!/^\d{3}$/.test(metadata.codVer||''))fail('COD_VER ausente.');
  if(!/^SYNTH-[A-Z0-9.]{3,40}$/.test(metadata.erpRelease||''))fail('Release ERP precisa ser sintético.');
  if(!['SP','RJ','MG','PR','RS','SC','BA','ES','PE','CE'].includes(metadata.uf))fail('UF fora do contrato sintético piloto.');
}
function colsOf(line) {if(!line.startsWith('|')||!line.endsWith('|'))fail('Linha EFD sem delimitadores.');return line.split('|');}
function validEfdDate(value) {return /^\d{8}$/.test(value||'');}
export function parseEfdSubset(text,ctx){
  if(typeof text!=='string'||!text.trim())fail('Fonte EFD vazia.');
  const bytes=Buffer.byteLength(text,'utf8');
  if(bytes>MAX_EFD_BYTES)fail('EFD excede limite offline de 1 MiB.');
  const lines=text.replace(/^\uFEFF/,'').split(/\r?\n/).filter(x=>x.length);
  if(lines.length>MAX_RECORDS)fail('Total de registros excede capacidade declarada do piloto.');
  let header=null,last=null,unsupported=0,c170=0,ignored=0,c190=0;
  const documents=[];
  for(let i=0;i<lines.length;i++){
    const parts=colsOf(lines[i]);const type=parts[1];const line=i+1;
    if(type==='0000'){
      if(header||i!==0)fail('Registro 0000 duplicado ou não inicial.');
      header={codVer:parts[2],initialDate:parts[4],finalDate:parts[5],line};
      if(header.codVer!==ctx.codVer)fail('COD_VER informado não corresponde ao contrato.');
      if(!validEfdDate(header.initialDate)||!validEfdDate(header.finalDate))fail('Competência/datas do 0000 inválidas.');
      const first=header.initialDate, lastDate=header.finalDate;
      if(first.slice(2,4)!==ctx.period.slice(5,7)||first.slice(4)!==ctx.period.slice(0,4)||
        lastDate.slice(2,4)!==ctx.period.slice(5,7)||lastDate.slice(4)!==ctx.period.slice(0,4))
        fail('Datas do cabeçalho EFD não pertencem à competência do contrato.');
      continue;
    }
    if(!header)fail('Ausência de cabeçalho EFD 0000 anterior aos registros.');
    if(type==='C100'){
      if(parts.length<14)fail('Registro C100 incompleto na linha '+line);
      const key=parts[9],status=parts[6],model=parts[5],direction=parts[2],issuer=parts[3];
      if(model!=='55'){unsupported++;last=null;continue;}
      requireKey(key,'EFD C100 linha '+line);
      const entry={key,amount:parts[12].replace(',','.'),line,c170:0,c190:0,direction,issuer,status,model,supported:direction==='1'&&issuer==='0'&&status==='00'};
      cents(entry.amount);
      if(!entry.supported)unsupported++;
      documents.push(entry);last=entry;continue;
    }
    if(type==='C190'){
      c190++;
      if(!last)fail('C190 sem C100 antecedente no subconjunto suportado, linha '+line);
      last.c190++;continue;
    }
    if(type==='C170'){
      c170++;
      if(!last)fail('C170 órfão no subconjunto, linha '+line);
      last.c170++;continue;
    }
    // All other EFD record families remain expressly NOT_SUPPORTED.
    ignored++;
  }
  if(!header||!documents.length)fail('Arquivo sem C100 modelo 55 interpretável.');
  const duplicateLineKeys=new Set(),duplicates=[];
  for(const x of documents){
    if(duplicateLineKeys.has(x.key))duplicates.push(x.key);
    duplicateLineKeys.add(x.key);
  }
  return {header,documents,counts:{recordLines:lines.length,c100:documents.length,c190,c170,unsupported,notInterpreted:ignored,duplicateC100Keys:duplicates.length},digest:hash(Buffer.from(text,'utf8')),parseScope:'C100_AND_CHILD_COUNTS_ONLY_NOT_EFD_LAYOUT_CERTIFICATION'};
}
export function validateNFeRows(rows,ctx){
  if(!Array.isArray(rows)||rows.length>MAX_DOCUMENTS)fail('Quantidade de NF-e inválida.');
  return rows.map((r,i)=>{
    if(!r||r.sourceType!=='NORMALIZED_SYNTHETIC_NFE'||r.organization!==ctx.organization||r.period!==ctx.period)
      fail('Identidade ou origem sintética NF-e incompatível, posição '+i);
    requireKey(r.key,'NF-e sintética');
    cents(r.amount);
    if(r.status!=='SYNTHETIC_NO_SEFAZ_AUTHORIZATION')fail('NF-e sintética não pode ser declarada autorizada.');
    if(typeof r.sourceId!=='string'||!/^NFE-SYN-\d{3}$/.test(r.sourceId))fail('Identificador de fonte inválido.');
    return {key:r.key,amount:r.amount,sourceId:r.sourceId,synthetic:true};
  });
}
export function validateERP(rows,ctx) {
  if(!Array.isArray(rows)||rows.length>MAX_DOCUMENTS)fail('Tamanho de snapshot ERP inválido.');
  return rows.map((r,i)=>{
    if(!r||r.sourceType!=='PROTHEUS_SYNTHETIC_SNAPSHOT'||r.organization!==ctx.organization||r.period!==ctx.period||r.release!==ctx.erpRelease)
      fail('Snapshot Protheus sem versão/período/organização coerente, linha '+i);
    requireKey(r.key,'Protheus sintético');
    cents(r.amount);
    if(!['SD1','SD2','SFT'].includes(r.table))fail('Tabela Protheus não incluída no piloto.');
    if(typeof r.field!=='string'||!({SD1:'D1_IDTRIB',SD2:'D2_IDTRIB',SFT:'FT_IDTRIB'}[r.table]===r.field))
      fail('Campo IDTRIB não corresponde à tabela TOTVS.');
    if(r.idtrib!==null&&(typeof r.idtrib!=='string'||!/^[A-Z0-9_-]{1,30}$/.test(r.idtrib)))
      fail('IDTRIB inválido.');
    const taxSource=r.idtrib===null?'UNKNOWN_NO_IDTRIB_EVIDENCE':(r.f2dRuleRef&&r.f2bRuleRef?'FISA170_CANDIDATE_LINKED':'FISA170_CANDIDATE_UNRESOLVED');
    return {key:r.key,amount:r.amount,table:r.table,field:r.field,idtrib:r.idtrib,
      taxSource,evidenceRefs:[r.f2dRuleRef||null,r.f2bRuleRef||null].filter(Boolean),synthetic:true};
  });
}
function indexed(rows){const m=new Map();for(const x of rows){const z=m.get(x.key)||[];z.push(x);m.set(x.key,z);}return m;}
function finding(kind,key,details,sourceRefs=[]){
 return {id:'F-'+kind+'-'+key,kind,key,details,sourceRefs,
  technicalStatus:'INVESTIGATE',fiscalConformity:'NOT_EVALUATED',
  rootCause:'HYPOTHESIS',reviewStatus:'OPEN_NOT_APPROVED'};
}
export function reconcileThreeWays(nfe,efd,erp){
 const maps=[indexed(nfe),indexed(efd.documents.filter(x=>x.supported)),indexed(erp)];
 const allKeys=[...new Set([...maps[0].keys(),...maps[1].keys(),...maps[2].keys()])].sort();
 const issues=[],matched=[];
 for(const key of allKeys){
  const [a,b,c]=maps.map(m=>m.get(key)||[]);
  const quantities={nfe:a.length,efd:b.length,erp:c.length};
  if(Math.max(...Object.values(quantities))>1){
   issues.push(finding('CARDINALITY_BLOCKED',key,quantities));continue;
  }
  if(!a.length||!b.length||!c.length){
   issues.push(finding('MISSING_IN_SUPPLIED_POPULATION',key,quantities));continue;
  }
  if(b[0].c190===0){
   issues.push(finding('C190_ABSENT_IN_SUPPORTED_CONTEXT',key,{line:b[0].line,context:'OWN_ISSUED_MODEL55_REGULAR'}));continue;
  }
  const [x,y,z]=[cents(a[0].amount),cents(b[0].amount),cents(c[0].amount)];
  if(x!==y||y!==z){
   issues.push(finding('THREE_WAY_AMOUNT_DIFFERENCE',key,{
    nfe:money(x),efd:money(y),erp:money(z),
    nfeMinusEfd:money(x-y),efdMinusErp:money(y-z)
   },[a[0].sourceId,b[0].line]));continue;
  }
  matched.push({key,amount:money(x),nfeSource:a[0].sourceId,efdLine:b[0].line,
    erpTable:c[0].table,taxSource:c[0].taxSource,technicalScope:'THREE_WAY_AMOUNT_ONLY'});
 }
 return {matched,findings:issues,coverage:{keysConsidered:allKeys.length,nfeRows:nfe.length,efdEligible:maps[1].values().reduce((n,arr)=>n+arr.length,0),erpRows:erp.length,nonEligibleEfd:efd.counts.unsupported}};
}
export function executeSyntheticSlice(bundle){
 if(!bundle||typeof bundle!=='object')fail('Payload obrigatório.');
 const ctx=bundle.context;strictContext(ctx);
 const efd=parseEfdSubset(bundle.efdText,ctx);
 const nfe=validateNFeRows(bundle.nfe||[],ctx);
 const erp=validateERP(bundle.erp||[],ctx);
 if(!nfe.length||!erp.length)fail('Fonte NF-e ou ERP ausente; não gerar conformidade vazia.');
 const input={contract:CONTRACT,context:ctx,nfe,efdDigest:efd.digest,erp,efdSummary:{header:efd.header,counts:efd.counts,documents:efd.documents}};
 const inputDigest=hash(serial(input));
 const outcome=reconcileThreeWays(nfe,efd,erp);
 const warnings=[];
 if(efd.counts.unsupported)warnings.push('Há C100 fora do contexto emissão própria/saída/regular: não foram conciliados.');
 if(efd.counts.notInterpreted)warnings.push('EFD parcial: famílias de registros não interpretadas.');
 if(efd.counts.c170===0)warnings.push('Ausência de C170 não é erro universal para NF-e de emissão própria.');
 return {
  schemaVersion:'wutrib.v1.synthetic.result.v1',runId:'SYNTH-RUN-'+inputDigest.slice(0,20),
  status:'COMPLETED_TECHNICAL_SCOPE',syntheticOnly:true,
  fiscalConformity:'NOT_EVALUATED',sefazAuthorization:'NOT_CHECKED',layoutCertification:'NOT_PERFORMED',
  noAutomaticApproval:true,context:ctx,
  provenance:{inputDigest,efdRawSha256:efd.digest,nfeNormalizedSha256:hash(serial(nfe)),erpNormalizedSha256:hash(serial(erp)),
    sourceKinds:['SYNTHETIC_NFE_NORMALIZED','EFD_TEXT_SUBSET','SYNTHETIC_PROTHEUS_SNAPSHOT'],
    limitations:['NFE_XML_AND_XSD_NOT_VALIDATED','EFD_LAYOUT_NOT_VALIDATED_IN_FULL','TOTVS_CONFIG_NOT_AUTHENTICATED','TAX_RULES_NOT_EVALUATED']},
  totals:{nfe:nfe.length,efd:efd.counts.c100,erp:erp.length,matched:outcome.matched.length,findings:outcome.findings.length},
  ...outcome,
  efdCounts:efd.counts,
  warnings,
  workpaper:{state:'OPEN_FOR_HUMAN_REVIEW',reviewedBy:null,approvedBy:null,decision:null,sourceHash:inputDigest}
 };
}

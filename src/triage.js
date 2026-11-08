/**
 * WU-TRIB — ephemeral, user-entered triage of synthetic findings.
 * No storage, network, fiscal approval, causal confirmation or signing.
 */
import {escapeCSVCell} from './audit.js';

export const TRIAGE_STATES=Object.freeze(['PENDING','INVESTIGATING','NEEDS_EVIDENCE','REVIEW_NOTE']);
export const TRIAGE_LABELS=Object.freeze({
  PENDING:'A revisar',
  INVESTIGATING:'Em investigação',
  NEEDS_EVIDENCE:'Solicitar evidências',
  REVIEW_NOTE:'Anotação registrada'
});
export const MAX_REVIEW_NOTE=1200;
export function createTriageLedger(){return {reviews:new Map(),events:[],revision:0}}
export function recordTriage(ledger,report,findingId,status,note,clock=()=>new Date().toISOString()){
  if(!report || report.status!=='COMPLETED' || !Array.isArray(report.findings) || !report.findings.some(f=>f.id===findingId))
    throw new Error('O achado não pertence a uma auditoria completa.');
  if(!TRIAGE_STATES.includes(status))throw new Error('Estado de triagem inválido.');
  if(typeof note!=='string' || [...note].length>MAX_REVIEW_NOTE || /\u0000/.test(note))
    throw new Error('Nota inválida ou acima de 1.200 caracteres.');
  const trimmed=note.trim();
  if(status!=='PENDING' && !trimmed)throw new Error('Informe uma observação para registrar a revisão.');
  if(ledger.events.length>=500) throw new Error('Limite da sessão demonstrativa alcançado. Exporte o dossiê.');
  const entry={findingId,status,note:trimmed,sequence:++ledger.revision,recordedAt:clock(),
    approval:'NOT_APPROVED',fiscalConformity:'NOT_EVALUATED',causeStatus:'HYPOTHESIS_NOT_CONFIRMED'};
  ledger.reviews.set(findingId,entry);
  ledger.events.push({...entry});
  return {...entry};
}
export function dossierWithTriage(report,ledger){
  if(!report || report.status!=='COMPLETED') throw new Error('Lote incompleto não permite exportação.');
  const known=new Set(report.findings.map(x=>x.id));
  const reviews=[...ledger.reviews.values()].filter(x=>known.has(x.findingId));
  const events=ledger.events.filter(x=>known.has(x.findingId));
  return {
    format:'wutrib.synthetic.casefile.v1',
    legalStatus:'NOT_AUDITED_OR_CERTIFIED',
    triageMode:'EPHEMERAL_CLIENT_ONLY',
    persistence:'NONE',
    generatedAt:new Date().toISOString(),
    audit:report,
    reviews,
    reviewEvents:events,
    reviewerIdentity:'NOT_VERIFIED',
    approval:'NOT_APPROVED'
  };
}
export function findingsCSVWithTriage(report,ledger){
  if(!report || report.status!=='COMPLETED') throw new Error('Lote incompleto não permite exportação.');
  const rows=[['ID','Severidade','Tipo','Título','Chave','Diferença','Conformidade fiscal','Hipótese','Estado da revisão (local)','Nota de revisão (não homologada)']];
  for(const f of report.findings){
    const r=ledger.reviews.get(f.id);
    rows.push([f.id,f.severity,f.kind,f.title,f.context?.key||'',f.context?.delta??'',
      f.fiscalConformity,f.hypothesis,TRIAGE_LABELS[r?.status||'PENDING'],r?.note||'']);
  }
  return '\uFEFF'+rows.map(row=>row.map(escapeCSVCell).join(';')).join('\r\n');
}

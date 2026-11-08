import {keys} from './fixtures.js';
import {TRIAGE_STATES,MAX_REVIEW_NOTE} from './triage.js';
export const DEMO_FIXTURE_CODE='WU-TRIB-SYNTHETIC-V03';
export const DEMO_WO_CODE='WUTRIB-WO-PLAN-016';
export const ALLOWED_FINDINGS=Object.freeze(['DIFF-'+keys.diff,'MISS-EFD-'+keys.xmlOnly,'MISS-XML-'+keys.efdOnly]);
const known=new Set(ALLOWED_FINDINGS),states=new Set(TRIAGE_STATES);
function exact(obj,fields){return obj!==null&&typeof obj==='object'&&!Array.isArray(obj)&&Object.keys(obj).every(k=>fields.includes(k))&&fields.every(k=>Object.hasOwn(obj,k));}
export class DemoContractError extends Error{constructor(s){super(s);this.name='DemoContractError';}}
export function normalizeDemoSubmission(input){
 if(!exact(input,['fixtureCode','reviews'])||input.fixtureCode!==DEMO_FIXTURE_CODE)throw new DemoContractError('Unknown synthetic fixture');
 if(!Array.isArray(input.reviews)||input.reviews.length>known.size)throw new DemoContractError('Invalid review count');
 const seen=new Set();
 const reviews=input.reviews.map(r=>{
  if(!exact(r,['findingId','status','note'])||!known.has(r.findingId)||seen.has(r.findingId))throw new DemoContractError('Unknown/duplicate finding');
  if(!states.has(r.status))throw new DemoContractError('Invalid state');
  if(typeof r.note!=='string'||[...r.note].length>MAX_REVIEW_NOTE||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(r.note))throw new DemoContractError('Invalid note');
  const note=r.note.trim();if(r.status!=='PENDING'&&!note)throw new DemoContractError('Note required');
  seen.add(r.findingId);
  return {findingId:r.findingId,status:r.status,note,approval:'NOT_APPROVED',fiscalConformity:'NOT_EVALUATED',causeStatus:'HYPOTHESIS_NOT_CONFIRMED'};
 }).sort((a,b)=>a.findingId.localeCompare(b.findingId,'en'));
 return {format:'wutrib.synthetic.casefile.v2',projectCode:'WU-TRIB',woCode:DEMO_WO_CODE,fixtureCode:DEMO_FIXTURE_CODE,source:'SERVER_VALIDATED_SYNTHETIC_FIXTURE',reviewerIdentity:'UNVERIFIED_OPERATOR',approval:'NOT_APPROVED',taxConformity:'NOT_EVALUATED',layoutCertification:'NOT_PERFORMED',reviews};
}

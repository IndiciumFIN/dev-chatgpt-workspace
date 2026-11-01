/** Read-only projection boundary. Never grants authority or mutates PMO. */
export type CommanderQueue = {
  readOnly: boolean; canonicalSource: string;
  items: {id: string;order:number;status:string;dependencies:string[];evidence:unknown[];title?:string;priority?:string}[];
  events: {seq:number;workId:string;to:string}[];
};
export type CommanderLanes = {governance:{dispatchImplemented:boolean;remoteWritesAllowed:boolean};lanes:{id:string;workOrderId:string;dispatched:boolean;status:string;sourceCommit:string;issueUrl:string}[]};
const STATES=new Set(['PAUSED','IN_PROGRESS','QUEUED','HOLD_HUMAN','DONE','BLOCKED']);
const isObject=(x:unknown):x is Record<string,unknown>=>x!==null&&typeof x==='object'&&!Array.isArray(x);
export function validateCommanderReadModel(queue:unknown,lanes?:unknown):string[]{
 const errors:string[]=[];const fail=(valid:boolean,message:string)=>{if(!valid)errors.push(message)};
 if(!isObject(queue)||(lanes!==undefined&&!isObject(lanes)))return ['MODEL_MISSING'];
 const laneModel=isObject(lanes)?lanes:null;
 fail(queue.readOnly===true,'PMO_NOT_READ_ONLY');
 fail(queue.canonicalSource==='registers/pmo/queue.v1.json','PMO_WRONG_AUTHORITY');
 if(!Array.isArray(queue.items)||!Array.isArray(queue.events)||(laneModel&&!Array.isArray(laneModel.lanes)))return [...errors,'INVALID_COLLECTIONS'];
 const items=queue.items as unknown[], events=queue.events as unknown[], laneItems=laneModel?(laneModel.lanes as unknown[]):[];
 const ids=new Set<string>();
 for(let i=0;i<items.length;i++){
  const w=items[i];if(!isObject(w)){errors.push('INVALID_WO');continue}
  fail(typeof w.id==='string'&&/^WO-[A-Z0-9-]+$/.test(w.id),'INVALID_WO_ID');
  fail(!ids.has(String(w.id)),'DUPLICATE_WO');ids.add(String(w.id));
  fail(w.order===i,'UNORDERED_WO');fail(STATES.has(String(w.status)),'UNKNOWN_WO_STATE');
  fail(Array.isArray(w.dependencies),'DEPENDENCIES_MISSING');fail(Array.isArray(w.evidence),'EVIDENCE_MISSING');
  if(w.status==='DONE')fail(Array.isArray(w.evidence)&&w.evidence.length>0,'DONE_NO_EVIDENCE');
 }
 const byId=new Map(items.filter(isObject).map(w=>[String(w.id),w]));
 for(const w of items){if(!isObject(w)||!Array.isArray(w.dependencies))continue;for(const dep of w.dependencies){fail(ids.has(String(dep))&&dep!==w.id,'BAD_DEPENDENCY')}}
 const visiting=new Set<string>(),done=new Set<string>();
 const visit=(id:string)=>{if(visiting.has(id)){errors.push('DEPENDENCY_CYCLE');return}if(done.has(id))return;visiting.add(id);for(const dep of (byId.get(id)?.dependencies as string[]|undefined)||[])if(byId.has(dep))visit(dep);visiting.delete(id);done.add(id)};
 for(const id of ids)visit(id);
 const last=new Map<string,string>();
 for(let i=0;i<events.length;i++){const e=events[i];if(!isObject(e)){errors.push('INVALID_EVENT');continue}fail(e.seq===i+1,'BAD_EVENT_SEQUENCE');fail(ids.has(String(e.workId)),'UNKNOWN_EVENT_WO');fail(STATES.has(String(e.to)),'UNKNOWN_EVENT_STATUS');last.set(String(e.workId),String(e.to))}
 for(const w of items)if(isObject(w)&&last.has(String(w.id)))fail(last.get(String(w.id))===w.status,'EVENT_STATUS_MISMATCH');
 const gov=laneModel?.governance;if(laneModel)fail(isObject(gov)&&gov.dispatchImplemented===false&&gov.remoteWritesAllowed===false,'UNAUTHORIZED_DISPATCH');
 const laneIds=new Set<string>(), issueUrls=new Set<string>();
 for(const x of laneItems){if(!isObject(x)){errors.push('INVALID_LANE');continue}
  fail(typeof x.id==='string'&&!laneIds.has(x.id),'DUPLICATE_LANE');laneIds.add(String(x.id));
  fail(ids.has(String(x.workOrderId)),'UNKNOWN_LANE_WO');fail(x.dispatched===false&&x.status==='CANDIDATE','LANE_NOT_CANDIDATE');
  fail(typeof x.sourceCommit==='string'&&/^[a-f0-9]{40}$/.test(x.sourceCommit),'INVALID_SOURCE_SHA');
  fail(typeof x.issueUrl==='string'&&/^https:\/\/github\.com\/IndiciumFIN\/dev-chatgpt-workspace\/issues\/[0-9]+$/.test(x.issueUrl)&&!issueUrls.has(x.issueUrl),'INVALID_LANE_ISSUE');issueUrls.add(String(x.issueUrl));
 }
 return [...new Set(errors)];
}

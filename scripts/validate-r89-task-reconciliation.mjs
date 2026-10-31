/** R89: read-only, fail-closed reconciliation of Git-pinned plan 112 task candidates.
 * NOT a Kernel election or corporate approval. Never changes a WO status.
 */
export const R89_SOURCE_SHA='b1fadfcb68717d5086ca4630498d0b6dddf9fbf5';
export const R89_SOURCE_HEAD='35f603277ec3dde4f7de703ad0f870f4f2dae065';
export const R89_AMENDED_IDS=['TASK-PLAN-090','TASK-PLAN-091','TASK-PLAN-092','TASK-PLAN-107','TASK-PLAN-113'];
export const R89_EXTRA_IDS=Array.from({length:20},(_,i)=>'TASK-PLAN-'+String(i+114).padStart(3,'0'));
const keys=['id','title','wo','status','phase','owner','deps','artifacts','acceptance'];
const compare=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const fail=(code)=>{throw Error(code);};
export function validateR89Reconciliation(plan,woIds){
 const d=plan?.r89ScopedTaskReconciliation;
 if(!d)return 0;
 if(d.recordType!=='R89_READ_ONLY_RECONCILIATION_OF_CONCURRENT_CANDIDATE_TASKS'||d.state!=='CANDIDATE_ONLY_NOT_ADMITTED'||d.sourcePlanBlobSha!==R89_SOURCE_SHA||d.sourceBranchHeadSha!==R89_SOURCE_HEAD||d.sourceType!=='PINNED_GIT_BLOB_SNAPSHOT_NOT_CORPORATE_APPROVAL')fail('R89_SOURCE_UNVERIFIED');
 if(d.historicalTaskCount!==92||d.additionalTaskCount!==20||d.totalTaskCount!==112||d.preservedR79SourceCandidates!==31||d.preservedR87Candidates!==24||plan.tasks?.length!==112)fail('R89_POPULATION_DRIFT');
 const a=d.authority;
 if(!a||a.ownerIdentityVerified!==false||a.independentCheckerVerified!==false||a.kernelAdmission!=='NOT_VERIFIED'||a.canonicalPmoElected!==false||a.taskCompletionAuthorized!==false||a.releaseGate!=='HOLD_HUMAN'||plan.releaseGate!=='HOLD_HUMAN')fail('R89_UNAUTHORIZED_PROMOTION');
 if(!compare(d.pendingDuplicateScopes,['094/108','095/109','096/110','097/111','098/112','099/113']))fail('R89_DUPLICATE_SCOPE_ERASURE');
 if(!Array.isArray(d.amendments)||d.amendments.map(x=>x.id).join(',')!==R89_AMENDED_IDS.join(','))fail('R89_AMENDMENT_LIST_DRIFT');
 const allowed={
  'TASK-PLAN-090':['acceptance'],'TASK-PLAN-091':['acceptance'],'TASK-PLAN-092':['status','acceptance'],
  'TASK-PLAN-107':['title','acceptance'],'TASK-PLAN-113':['title','status','acceptance']
 };
 const baseline=plan.r87ScopedTaskExpansion?.tasks;
 if(!Array.isArray(baseline)||baseline.length!==24)fail('R89_R87_BASELINE_MISSING');
 const map=new Map(d.amendments.map(x=>[x.id,x.changes]));
 for(let i=0;i<24;i++){
  const old=baseline[i],now=plan.tasks[68+i],am=map.get(old.id);
  if(old.id!==now?.id)fail('R89_OLDER_ORDER_DRIFT');
  if(am&&(!compare(Object.keys(am),allowed[old.id])||Object.values(am).some(x=>x===null)))fail('R89_UNREGISTERED_AMENDMENT:'+old.id);
  for(const key of ['title','status','acceptance','wo','deps','artifacts']){
   const want=am && Object.hasOwn(am,key)?am[key]:old[key];
   if(!compare(now[key]??null,want??null))fail('R89_HISTORIC_SCOPE_DRIFT:'+old.id+':'+key);
  }
  if(now.status!=='PROPOSTO'&&now.status!=='BLOCKED'&&!(now.id==='TASK-PLAN-092'&&now.status==='DELIVERED_PENDING_GATE'))fail('R89_FALSE_COMPLETION:'+old.id);
  if(!woIds.has(now.wo))fail('R89_UNKNOWN_WO:'+old.id);
  if(now.authorization?.approval==='APPROVED'||now.authorization?.kernelAdmission==='ADMITTED')fail('R89_FALSE_ADMISSION:'+old.id);
 }
 if(!Array.isArray(d.additionalTasks)||d.additionalTasks.map(x=>x.id).join(',')!==R89_EXTRA_IDS.join(',')||plan.tasks.slice(92).map(x=>x.id).join(',')!==R89_EXTRA_IDS.join(','))fail('R89_NEW_TASK_IDS_DRIFT');
 for(let i=0;i<20;i++){
  const ref=d.additionalTasks[i],t=plan.tasks[92+i];
  if(!compare(keys.map(k=>t[k]??(k==='deps'||k==='artifacts'?[]:null)),keys.map(k=>ref[k]??(k==='deps'||k==='artifacts'?[]:null))))fail('R89_NEW_TASK_DRIFT:'+ref.id);
  if(!['PROPOSTO','BLOCKED'].includes(t.status))fail('R89_NEW_TASK_UNAUTHORIZED_STATUS:'+ref.id);
  if(!woIds.has(t.wo)||t.authorization?.approval==='APPROVED'||t.authorization?.kernelAdmission==='ADMITTED'||t.authorization?.releaseGate==='PASS')fail('R89_NEW_TASK_FALSE_ADMISSION:'+ref.id);
 }
 return 20;
}

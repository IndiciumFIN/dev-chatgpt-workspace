/** PMO pre-triage only: not an OPA decision, no promotion authority. */
export const CANONICAL_SOURCE_CANDIDATES={
  'src/components/site/shell.tsx':{
    sourceBranch:'fix/governed-activities-cli-20261026',
    evidence:'https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/41227928335',
    rationale:'Entrar link to canonical /login passed typecheck and integrated admin tests; not production admission.'
  },
  'src/routes/login.tsx':{
    sourceBranch:'fix/governed-activities-cli-20261026',
    evidence:'https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/41227928335',
    rationale:'Disabled-auth message is accessible and does not create a session.'
  },
  'vercel.json':{
    sourceBranch:'main',
    evidence:'https://github.com/IndiciumFIN/dev-chatgpt-workspace/pull/27',
    rationale:'Main omits unsupported nodeVersion field; prior Vercel preview rejected that field.'
  },
};
export function triageCanonicalConflict(path,{equivalent=false}={}){
  let wo=null,priority='P2',domain='GENERAL';
  if(/^registers\/i18n\//.test(path)){
    wo='WO-DS-001';priority='P1';domain='I18N';
  }else if(path==='package.json'||path==='package-lock.json'||/^src\/lib\/(?:auth|db)(?:\/|\.)/.test(path)){
    wo='WO-SEC-001';priority='P0';domain='SECURITY';
  }else if(/(?:^|\/)(?:kernel|opa|governance)(?:\/|\.)|^src\/core\/governance\//.test(path)){
    wo='WO-GOV-TRANS-001';priority='P0';domain='KERNEL';
  }else if(path==='registers/pmo/queue.v1.json'||/^\.github\/workflows\//.test(path)){
    wo='WO-PMO-001';priority='P0';domain='PMO_CI';
  }else if(/^src\/(?:components\/site|components\/admin|routes|styles)/.test(path)||path==='vercel.json'){
    wo='WO-ADM-001';priority='P1';domain='SITE_UI';
  }else if(/^src\/lib\/(?:route-registry|sections|template-catalog|nav)\.ts/.test(path)){
    wo='WO-CKO-001';priority='P1';domain='ROUTE_CONTENT';
  }else if(/^contracts\//.test(path)){
    wo='WO-CKO-001';priority='P1';domain='CONTRACT';
  }else if(/^docs\/handoffs\//.test(path)){
    wo='WO-PMO-001';priority='P2';domain='DOCUMENTARY_HANDOFF';
  }
  const candidate=CANONICAL_SOURCE_CANDIDATES[path]??null;
  return {
    path,domain,priority,
    proposedWo:wo,
    mappingStatus:wo?'CANDIDATE_WO_MAPPING':'WO_MAPPING_REQUIRED',
    preliminaryDisposition:equivalent?'SEMANTIC_EQUIVALENT_NOT_ADMITTED':'CONFLICT_REQUIRES_REVIEW',
    candidateSource:candidate,
    decision:'NOT_APPROVED',
    kernelAdmission:'NOT_VERIFIED',
    releaseGate:'HOLD_HUMAN'
  };
}
export function buildCanonicalTriage(collisions,semantic){
  if(!Array.isArray(collisions)||!semantic||!Array.isArray(semantic.equivalent))throw Error('MISSING_EVIDENCE');
  if(new Set(collisions.map(x=>x.path)).size!==collisions.length)throw Error('DUPLICATE_PATH');
  const equivalentPaths=new Set(semantic.equivalent.map(x=>x.path));
  const knownPaths=new Set(collisions.map(x=>x.path));
  if([...equivalentPaths].some(p=>!knownPaths.has(p)))throw Error('UNKNOWN_SEMANTIC_PATH');
  const items=collisions.map(x=>({...triageCanonicalConflict(x.path,{equivalent:equivalentPaths.has(x.path)}),
    sources:x.sources.map(s=>({branch:s.branch,blob:s.blob})),
  })).sort((a,b)=>a.path.localeCompare(b.path));
  const counts={
    total:items.length,
    semanticEquivalent:items.filter(x=>x.preliminaryDisposition==='SEMANTIC_EQUIVALENT_NOT_ADMITTED').length,
    needingReview:items.filter(x=>x.preliminaryDisposition==='CONFLICT_REQUIRES_REVIEW').length,
    candidateWoMappings:items.filter(x=>x.mappingStatus==='CANDIDATE_WO_MAPPING').length,
    unresolvedWoMappings:items.filter(x=>x.mappingStatus==='WO_MAPPING_REQUIRED').length,
    testedSourceSuggestions:items.filter(x=>x.candidateSource).length,
    formallyApproved:0
  };
  if(counts.total!==counts.semanticEquivalent+counts.needingReview)throw Error('INCOMPLETE_DISPOSITION');
  return {schemaVersion:'1.0.0',sourceType:'READ_ONLY_PRE_TRIAGE',counts,items,releaseGate:'HOLD_HUMAN',mainUpdated:false};
}

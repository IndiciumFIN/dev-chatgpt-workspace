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
  // Explicitly triage the 28 paths without an owner in the first inventory.
  // These are *candidate* WO mappings, subject to PMO reconciliation/Kernel.
  if(!wo){
    if(path==='.gitignore'||/^scripts\/(?:alias-hook|grok-pwa-plugin|grok-pwa-shared|migration-plan|with-app-env|write-atomic)(?:\.test)?\.mjs$/.test(path)){
      wo='WO-AUTO-001';priority='P1';domain='BUILD_AUTOMATION';
    }else if(path==='scripts/header-entry.test.mjs'){
      wo='WO-ADM-001';priority='P1';domain='ADMIN_HEADER_TEST';
    }else if(/^scripts\/(?:admin-ux-e2e|test-admin-console)\.mjs$/.test(path)){
      wo='WO-E2E-001';priority='P1';domain='ADMIN_TESTING';
    }else if(/^scripts\/brand-check\.test\.mjs$/.test(path)||/^src\/lib\/(?:chrome\.tsx|dictionary\.test\.ts)$/.test(path)){
      wo='WO-DS-001';priority='P1';domain='DESIGN_SYSTEM';
    }else if(/^scripts\/check-auth-invariant\.test\.mjs$/.test(path)||/^src\/lib\/(?:app-data\/client\.server\.ts|it-controls\.test\.ts)$/.test(path)){
      wo='WO-SEC-001';priority='P0';domain='SECURITY_CONTROLS';
    }else if(/^src\/core\/compliance\/validators\.ts$/.test(path)||/^src\/lib\/(?:kernel-admit(?:\.test)?\.ts|policy-decision\.ts)$/.test(path)){
      wo='WO-GOV-TRANS-001';priority='P0';domain='KERNEL_CONTROLS';
    }else if(path==='registers/canonical/surface-contracts.v2.json'){
      wo='WO-DS-001';priority='P1';domain='SURFACE_CONTRACT';
    }else if(path==='registers/canonical/route-contracts.v1.json'||path==='src/routeTree.gen.ts'){
      wo='WO-ADM-001';priority='P1';domain='CANONICAL_ROUTING';
    }else if(path==='it-book/docs/normalizacao.md'||/^src\/core\/registry\/source-registry\.ts$/.test(path)||/^src\/lib\/(?:intake(?:\.test)?\.ts|source\.functions\.ts|stored\.functions\.ts)$/.test(path)){
      wo='WO-CKO-001';priority='P1';domain='KNOWLEDGE_SOURCE';
    }
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
  const items=collisions.map(x=>{
    if(!Array.isArray(x.sources)||x.sources.length<2)throw Error('MISSING_CONFLICT_LINEAGE');
    if(x.sources.some(source=>typeof source.branch!=='string'||!/^([a-f0-9]{40}|[a-f0-9]{64})$/.test(source.blob??''))){
      throw Error('INVALID_BLOB_LINEAGE');
    }
    const row=triageCanonicalConflict(x.path,{equivalent:equivalentPaths.has(x.path)});
    if(row.candidateSource&&row.candidateSource.sourceBranch!=='main' &&
       !x.sources.some(source=>source.branch===row.candidateSource.sourceBranch)){
      throw Error('CANDIDATE_SOURCE_NOT_IN_CONFLICT');
    }
    return {...row,sources:x.sources.map(source=>({branch:source.branch,blob:source.blob}))};
  }).sort((a,b)=>a.path.localeCompare(b.path));
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

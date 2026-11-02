#!/usr/bin/env node
/** Fail-closed canonical foundation inventory; uses only pinned database snapshots and recovered source evidence. */
import {readFileSync,readdirSync,mkdirSync,writeFileSync} from 'node:fs';
import {join,resolve,dirname} from 'node:path';
const root=resolve(import.meta.dirname,'../..');
const base=join(root,'audit-evidence/supabase-canonical/20261101/schemas');
const evidence=join(root,'audit-evidence/mof-foundation-recovery/20261102/sources');
const out=join(root,'artifacts/ce-agents/mof-foundation-parity.json');
const docs=readdirSync(base).filter(n=>n.endsWith('.json')).sort().map(n=>JSON.parse(readFileSync(join(base,n),'utf8')));
if(docs.length!==45)throw Error('BASELINE_NOT_45_SCHEMAS');
const tableMap=new Map(docs.flatMap(d=>d.tables.map(t=>[d.origin.schema+'.'+t.name,{t,managed:d.isManagedSchema}])));
const groups={
  normative:['cko_governance.normative_reference_catalog','cko_governance.normative_document_extractions','cko_governance.artifact_normative_bindings','cko_governance.field_normative_bindings'],
  metadata:['cko_governance.metadata_framework_registry','cko_governance.metadata_profile_registry','cko_governance.metadata_field_registry','cko_governance.field_catalog','cko_governance.reference_data_registry'],
  agents:['cko_governance.agent_registry','cko_governance.agent_job_profiles','cko_governance.agent_work_items','cko_governance.agent_execution_waves'],
  process:['cko_flow.processes','cko_orch.workflow_instances','cko_governance.pipeline_stages','cko_governance.change_requests'],
  architecture:['cko_governance.architecture_layer_catalog','cko_governance.layer_dependencies','cko_governance.platform_capabilities','ce_platform.object_types','ce_platform.object_relations'],
  controls:['cko_governance.control_frameworks','cko_governance.control_framework_nodes','cko_governance.control_framework_mappings','cko_governance.assurance_checkpoints']
};
const gaps=[];
const coverage={};
for(const [name,items] of Object.entries(groups)){
  coverage[name]=items.map(id=>{
    const v=tableMap.get(id);
    if(!v)gaps.push('MISSING_TABLE:'+id);
    return {table:id,found:!!v,columns:v?.t.columns.length??0,constraints:v?.t.constraints.length??0,rls:v?.t.rls??null};
  });
}
for(const id of ['cko_governance.normative_reference_catalog','cko_governance.field_catalog','cko_governance.agent_registry']){
  const t=tableMap.get(id)?.t;
  if(!t||!t.constraints.some(c=>c.type==='p'||/PRIMARY KEY/i.test(JSON.stringify(c))))gaps.push('PRIMARY_KEY_UNVERIFIED:'+id);
}
const cross=JSON.parse(readFileSync(join(evidence,'M3_NORMATIVE_CROSSWALK.json'),'utf8'));
const reg=JSON.parse(readFileSync(join(evidence,'SOURCE_REGISTRY.json'),'utf8'));
if(cross.status.canonical_status!=='PRE_CANONICAL'||cross.status.production_admission!=='DENY')gaps.push('HISTORICAL_M3_PROMOTION_STATUS_CHANGED');
const mof=cross.rows.find(x=>x.reference==='OMG MOF 2.5.1');
if(!mof||mof.claim_level!=='REFERENCE_ONLY')gaps.push('MOF_UNSUPPORTED_CONFORMANCE_CLAIM');
const regIds=new Set(reg.map(s=>s.source_id));
for(const id of ['SRC-OMG-MOF-2.5.1','SRC-ISO-11179-3-2023','SRC-ISO-11179-35-2023'])if(!regIds.has(id))gaps.push('MISSING_SOURCE_REGISTRY:'+id);
const n=docs.reduce((s,d)=>s+d.tables.length,0),cols=docs.reduce((s,d)=>s+d.tables.reduce((a,t)=>a+t.columns.length,0),0);
if(n!==606||cols!==6486)gaps.push('DATABASE_SNAPSHOT_COUNT_DRIFT');
const record={
  recordType:'CKO_MOF_M3_M2_M1_M0_RECOVERY_AND_EXISTING_SCHEMA_RECONCILIATION',
  workOrder:'WO-CE-DB-SKELETON-001',referenceModel:'OMG MOF 2.5.1 (REFERENCE_ONLY)',
  normativePrimary:['ISO/IEC 11179-3:2023','ISO/IEC 11179-35:2023','ISO/IEC 11179-3:2023/Amd 1:2026'],
  basis:'source metadata only; no licensed texts; no claims of clause compliance',
  snapshot:{schemas:docs.length,tables:n,columns:cols},existing:coverage,
  mappings:{M3:'meta-metamodel grammar / validation',M2:'governed metamodel and vocabulary',M1:'declarative or executable model',M0:'instances and audit evidence'},
  sourceRegistryCount:reg.length,crosswalkCount:cross.rows.length,findings:gaps,
  note:'No new MOF table created: semantic equivalence with existing structural entities must be validated first.',
  release:'HOLD_HUMAN',productionWrite:false,fullDdlParity:false
};
mkdirSync(dirname(out),{recursive:true});
writeFileSync(out,JSON.stringify(record,null,2)+'\n');
console.log(JSON.stringify({status:gaps.length?'FAIL':'FOUNDATION_SNAPSHOT_RECONCILED',groups:Object.keys(groups).length,objects:Object.values(groups).flat().length,findings:gaps,release:record.release}));
if(gaps.length)process.exitCode=2;

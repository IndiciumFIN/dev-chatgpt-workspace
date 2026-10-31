#!/usr/bin/env node
/** R90: deterministic vocabulary audit. Read-only; NEVER executes or admits services.
 * Usage: node scripts/check-r90-service-boundaries.mjs
 * Emits a PASS only for inventory fidelity, NOT for clinical or release readiness.
 */
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT=resolve(fileURLToPath(new URL('..',import.meta.url)));
const SOURCE_PATH='docs/evidence/experience-platform-skeleton-2026-10-31/catalog/service-catalog.v1.json';
const RECORD_PATH='registers/governance/r90-service-boundary-candidates.v1.json';
export const SOURCE_GIT_BLOB_SHA='e93506ee9963469e15450a4019c44a4d4c29b13b';
export const SOURCE_SHA256='37106a8b76e1c80faef65b69ff11170471580006e5ef605bc0473eb49b71b2cc';
export const EXACT_ID_COLLISIONS=Object.freeze({
  'connector-registry':['source-acquisition/connector-registry','integrations/connector-registry'],
  'read-later':['personalization/read-later','acoes/read-later'],
  subscription:['subscription-entitlement/subscription','contexto/subscription'],
  print:['outputs/print','acoes/print']
});
const EXPECTED_OVERLAPS=Object.freeze({
 CONTROL_AUTHORITY_AND_REVIEW:['governance/policy-registry','governance/validator-registry','governance/kernel-admission-adapter','governance/work-order','workflow/approval-service','admin-control-plane/review-queue'],
 SCHEMA_REGISTRY_AND_ADMIN_MANAGEMENT:['canonical-knowledge/schema-registry','canonical-knowledge/metadata-registry','governance/validator-registry','admin-control-plane/registry-management'],
 TASK_EXECUTION_AND_ORCHESTRATION:['workflow/workflow-engine','workflow/task-orchestrator','operations/job-scheduler','operations/queue','governance/task-registry'],
 AUDIT_EVIDENCE_VS_TELEMETRY:['audit-assurance/audit-evidence','observability/audit-log','observability/event-log','ai-agents/agent-audit'],
 POLICY_RULE_RELEASE:['governance/policy-as-code','rules/rule-engine','rules/applicability-engine','governance/release-gate'],
 SOURCE_CONNECTORS_AND_INTEGRATION:['source-acquisition/source-registry','source-acquisition/connector-registry','integrations/connector-registry','integrations/external-provider-adapter']
});
const CANDIDATE_BOUNDARIES=Object.freeze({
 'connector-registry':'PLATFORM_ADAPTER_REGISTRY_VS_SOURCE_ACQUISITION_CONSUMER',
 'read-later':'PERSONALIZATION_STATE_VS_USER_ACTION',
 subscription:'SUBSCRIPTION_ENTITLEMENT_VS_CONTEXT_PROJECTION',
 print:'OUTPUT_FORMAT_VS_UI_ACTION'
});
const OWNERSHIP=Object.freeze({
 governance:'KERNEL_CONTROL_AUTHORITY_INTERFACE_ONLY',
 'audit-assurance':'INDEPENDENT_EVIDENCE_AND_CHECKER_SUPPORT',
 observability:'TELEMETRY_AND_OPERATIONAL_HEALTH',
 'admin-control-plane':'CONTROL_PLANE_UI_READ_MODEL_CANDIDATE'
});
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function reject(code){throw Error(code);}
const blobHash=b=>createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');
export function validateR90(catalog,record,{sourceBytes}={}){
 if(record?.schemaVersion!=='1.0.0'||record?.recordId!=='CE-R90-SERVICE-BOUNDARY-CANDIDATES-20261031'||record.recordType!=='GIT_PINNED_CANDIDATE_INVENTORY_NOT_ADMISSION'||record.state!=='OPEN_REVIEW_HOLD')reject('R90_RECORD_UNTRUSTED');
 if(sourceBytes && (blobHash(sourceBytes)!==SOURCE_GIT_BLOB_SHA||createHash('sha256').update(sourceBytes).digest('hex')!==SOURCE_SHA256))reject('R90_SOURCE_BYTES_DRIFT');
 if(record.source?.gitBlobSha!==SOURCE_GIT_BLOB_SHA||record.source.sha256!==SOURCE_SHA256||record.source.catalogPath!==SOURCE_PATH||record.source.capabilitySourcePr!==21||record.source.capabilityCountFromCandidate!==201||record.source.objectBindingCountFromCandidate!==16)reject('R90_SOURCE_PIN_DRIFT');
 if(catalog?.schemaVersion!=='1.0.0'||catalog?.status!=='CANDIDATE_HOLD'||catalog?.authority?.value!=='PROPOSED'||!Array.isArray(catalog.families)||catalog.families.length!==45)reject('R90_CATALOG_UNTRUSTED');
 const all=[],families=new Set(),layerCounts={DOMAIN:0,PLATFORM:0,CROSS_CUTTING:0},kindCounts={LOGICAL_SERVICE:0,EXPERIENCE_CAPABILITY_GROUP:0};
 for(const f of catalog.families){
  if(typeof f.id!=='string'||families.has(f.id)||!['DOMAIN','PLATFORM','CROSS_CUTTING'].includes(f.layer)||f.status!=='CANDIDATE_HOLD'||!Array.isArray(f.services)||f.services.length<1)reject('R90_FAMILY_DRIFT');
  families.add(f.id);
  for(const s of f.services){
   if(typeof s.id!=='string'||typeof s.title!=='string'||s.status!=='CANDIDATE_HOLD'||!['LOGICAL_SERVICE','EXPERIENCE_CAPABILITY_GROUP'].includes(s.kind))reject('R90_SERVICE_PROMOTION');
   all.push({key:f.id+'/'+s.id,family:f.id,serviceId:s.id,title:s.title,layer:f.layer,kind:s.kind});
   layerCounts[f.layer]++;
   kindCounts[s.kind]++;
  }
 }
 const keys=new Set(all.map(x=>x.key)),groups=new Map();
 for(const item of all){const z=groups.get(item.serviceId)||[];z.push(item.key);groups.set(item.serviceId,z);}
 if(all.length!==410||keys.size!==410||groups.size!==406||!eq(layerCounts,{DOMAIN:274,PLATFORM:97,CROSS_CUTTING:39})||!eq(kindCounts,{LOGICAL_SERVICE:305,EXPERIENCE_CAPABILITY_GROUP:105}))reject('R90_POPULATION_DRIFT');
 if(!eq(record.coverage,{familyCount:45,serviceCount:410,layerCounts,uniqueQualifiedKeys:410,uniqueUnqualifiedIds:406,exactDuplicateIdGroups:4,adjacentBoundaryGroups:6,logicalServiceCount:305,experienceCapabilityGroupCount:105,kindCounts}))reject('R90_COVERAGE_DRIFT');
 const fs=catalog.families.map(f=>({id:f.id,layer:f.layer,serviceCount:f.services.length}));
 if(!eq(record.familyInventory,fs)||!eq(record.serviceEntries,all))reject('R90_SERVICE_CROSSWALK_DRIFT');
 const duplicate=[...groups.entries()].filter(([,v])=>v.length>1);
 if(duplicate.length!==4||!eq(Object.keys(EXACT_ID_COLLISIONS).sort(),duplicate.map(x=>x[0]).sort()))reject('R90_UNEXPECTED_COLLISION');
 if(!Array.isArray(record.exactIdCollisions)||record.exactIdCollisions.length!==4||new Set(record.exactIdCollisions.map(x=>x.serviceId)).size!==4)reject('R90_COLLISION_REGISTER_DRIFT');
 for(const c of record.exactIdCollisions){
  if(!EXACT_ID_COLLISIONS[c.serviceId]||!eq(c.occurrences,EXACT_ID_COLLISIONS[c.serviceId])||!eq(groups.get(c.serviceId),c.occurrences)||c.candidateBoundary!==CANDIDATE_BOUNDARIES[c.serviceId]||c.review!=='REQUIRES_INDEPENDENT_BOUNDARY_DECISION'||c.mergeApplied!==false||typeof c.proposedDirection!=='string'||c.proposedDirection.length<40)reject('R90_COLLISION_SCOPE_DRIFT');
 }
 if(!Array.isArray(record.adjacentBoundaryGroups)||record.adjacentBoundaryGroups.length!==6||new Set(record.adjacentBoundaryGroups.map(x=>x.groupId)).size!==6)reject('R90_ADJACENT_GROUP_DRIFT');
 for(const g of record.adjacentBoundaryGroups){
  if(!EXPECTED_OVERLAPS[g.groupId]||!eq(g.keys,EXPECTED_OVERLAPS[g.groupId])||g.keys.some(k=>!keys.has(k))||g.relation!=='POTENTIAL_BOUNDARY_OVERLAP_NOT_EQUIVALENCE'||g.review!=='PENDING'||g.mergeApplied!==false||typeof g.risk!=='string'||g.risk.length<25)reject('R90_FALSE_SEMANTIC_EQUIVALENCE');
 }
 if(!Array.isArray(record.ownershipPrinciples)||record.ownershipPrinciples.length!==4||new Set(record.ownershipPrinciples.map(x=>x.family)).size!==4)reject('R90_AUTHORITY_LAYER_DRIFT');
 for(const x of record.ownershipPrinciples){if(OWNERSHIP[x.family]!==x.role||typeof x.limit!=='string'||x.limit.length<30)reject('R90_AUTHORITY_LAYER_DRIFT');}
 const a=record.authority;
 if(record.relatedOpenFind!=='FIND-EXP-CAP-REF-001'||a?.ownerIdentityVerified!==false||a?.reviewerIndependent!==false||a?.policyVerified!==false||a?.woAdmitted!==false||a?.kernelAdmission!=='NOT_VERIFIED'||a?.mergeAllowed!==false||a?.mainTouched!==false||a?.releaseGate!=='HOLD_HUMAN')reject('R90_FALSE_RELEASE_AUTHORITY');
 return {families:45,catalogEntries:410,logicalServices:305,experienceCapabilityGroups:105,qualifiedKeys:410,ambiguousRawIds:4,semanticBoundaryGroups:6,releaseGate:'HOLD_HUMAN'};
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const raw=readFileSync(resolve(ROOT,SOURCE_PATH));
 const c=JSON.parse(raw.toString('utf8'));
 const r=JSON.parse(readFileSync(resolve(ROOT,RECORD_PATH),'utf8'));
 console.log('R90 CANDIDATE INVENTORY PASS '+JSON.stringify(validateR90(c,r,{sourceBytes:raw})));
}

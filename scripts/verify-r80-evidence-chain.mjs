#!/usr/bin/env node
/**
 * R80 read-only candidate evidence-chain validator.
 * Anchors 18 issue snapshots and 13 Simulados source documents.
 * Evidence existence != FIND registration, policy applicability, validator PASS or Kernel admission.
 */
import {readFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

function ensure(ok,code){if(!ok)throw new Error(code);}
export function gitBlobSha(bytes){return createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex');}
const shaFormat=/^[0-9a-f]{40}$/;
export function validate({record,r79,findRegister,policy,sourceBytes={}}){
 ensure(record?.type==='EVIDENCE_INTAKE_NOT_FORMAL_ADMISSION' && record?.schemaVersion==='1.0.0','R80_INVALID_RECORD');
 ensure(r79?.recordType==='CANDIDATE_DOMAIN_WO_ASSIGNMENTS_NOT_ADMISSION','R79_NOT_CANDIDATE');
 ensure(Array.isArray(record.rows)&&Array.isArray(r79.candidates)&&record.rows.length===r79.candidates.length&&record.rows.length===31,'R80_INCOMPLETE_ROWS');
 ensure(findRegister?.status==='DRAFT_FOR_GOVERNED_REVIEW' && Array.isArray(findRegister.finds),'FIND_REGISTER_STATUS_DRIFT');
 ensure(policy?.populationStatus==='TODO','POLICY_ACTIVATION_REQUIRES_REVIEW');
 ensure(record.source.findRegisterStatus===findRegister.status && record.source.policyPopulationStatus===policy.populationStatus,'SOURCE_POLICY_STATUS_DRIFT');
 const registeredIds=new Set(findRegister.finds.map(f=>f.canonical_id));
 const candidates=new Map(r79.candidates.map(c=>[c.sourceId,c]));
 ensure(candidates.size===31,'DUPLICATE_R79_IDS');
 let issues=0,docs=0,registered=0,docPins=new Set();
 const ids=new Set(),tasks=new Set();
 for(const row of record.rows){
  ensure(!ids.has(row.sourceId)&&!tasks.has(row.proposedTask),'DUPLICATE_R80_ID');
  ids.add(row.sourceId);tasks.add(row.proposedTask);
  const candidate=candidates.get(row.sourceId);
  ensure(candidate && candidate.proposedTask===row.proposedTask && candidate.proposedWo===row.proposedWo,'R79_LINK_MISMATCH:'+row.sourceId);
  ensure(row.policy.modelPath===record.source.woModelPath && row.policy.modelBlobSha===record.source.woModelBlobSha && row.policy.auditPolicyPath===record.source.policyPath && row.policy.auditPolicyBlobSha===record.source.policyBlobSha && row.policy.applicability==='NOT_VALIDATED' && row.policy.auditPolicyPopulationStatus==='TODO','UNVERIFIED_POLICY_PROMOTION:'+row.sourceId);
  ensure(row.governance.findAdmission==='NOT_VERIFIED' && row.governance.policyApproved==='NOT_VERIFIED' && row.governance.validatorPassed==='NOT_RUN_BY_R80' && row.governance.kernelAdmission==='NOT_VERIFIED' && row.governance.sourceWo==='UNRECONCILED' && row.governance.release==='HOLD_HUMAN','FALSE_AUTHORITY:'+row.sourceId);
  ensure(row.source && Array.isArray(row.source.findIdsDeclaredInIssue)&&Array.isArray(row.source.findIdsInOfficialRegister),'BAD_FIND_ANNOTATION:'+row.sourceId);
  const claimed=row.source.findIdsDeclaredInIssue.filter(id=>registeredIds.has(id)).sort();
  ensure(claimed.join('|')===row.source.findIdsInOfficialRegister.slice().sort().join('|'),'FALSE_REGISTERED_FIND:'+row.sourceId);
  registered+=claimed.length;
  if(candidate.sourceType==='issue'){
   issues++;
   const n=Number(row.sourceId.slice(3));
   ensure(row.source.kind==='OPEN_GITHUB_ISSUE_VERIFIED'&&row.source.number===n&&row.source.path==='issues/'+n&&row.source.url==='https://github.com/IndiciumFIN/dev-chatgpt-workspace/issues/'+n&&row.source.bodyPresent===true && /^2026-/.test(row.source.updatedAt),'ISSUE_METADATA_MISSING:'+row.sourceId);
   ensure(row.validator.status==='ITEM_VALIDATOR_NOT_BOUND'&&row.validator.path===null,'FALSE_VALIDATOR_BINDING:'+row.sourceId);
  }else if(candidate.sourceType==='simulados'){
   docs++;
   const s=row.source;
   ensure(s.kind==='SIMULADOS_VERSIONED_DOCUMENT_VERIFIED'&&s.branch===record.source.simuladosBranch&&/^docs\/simulados-enfermagem\/[A-Za-z0-9._-]+$/.test(s.path)&&shaFormat.test(s.blobSha)&&s.documentPurpose==='CANDIDATE_EVIDENCE_NOT_AUTHORITY','SOURCE_DOC_INVALID:'+row.sourceId);
   docPins.add(s.path);
   if(Object.hasOwn(sourceBytes,s.path))ensure(gitBlobSha(sourceBytes[s.path])===s.blobSha,'SOURCE_DOCUMENT_BYTES_DRIFT:'+row.sourceId);
   if(row.sourceId==='P0-04'){
    ensure(row.validator.status==='STATIC_VALIDATOR_SOURCE_PINNED_NOT_EXECUTED_BY_R80' && row.validator.path==='scripts/spe_audit_rpc_answers.py' && row.validator.testPath==='scripts/test_spe_audit_rpc_answers.py' && shaFormat.test(row.validator.blobSha) && shaFormat.test(row.validator.testBlobSha),'P004_STATIC_AUDITOR_EVIDENCE_MISSING');
    for(const [path,sha] of [[row.validator.path,row.validator.blobSha],[row.validator.testPath,row.validator.testBlobSha]])
     if(Object.hasOwn(sourceBytes,path))ensure(gitBlobSha(sourceBytes[path])===sha,'STATIC_VALIDATOR_BYTES_DRIFT:'+path);
   }else ensure(row.validator.status==='ITEM_VALIDATOR_NOT_BOUND'&&row.validator.path===null,'FALSE_VALIDATOR_BINDING:'+row.sourceId);
  }else ensure(false,'UNKNOWN_SOURCE_TYPE');
 }
 ensure(issues===18 && docs===13 && registered===0,'COVERAGE_OR_FIND_REGISTRATION_DRIFT');
 const counts=record.counts;
 ensure(counts.candidateRows===31 && counts.openIssueBodiesAndTitlesVerified===issues && counts.sourceDocsBlobPinned===docs && counts.officialRegisteredAdmittedFindMatches===0 && counts.validatedApplicablePolicies===0 && counts.independentValidatorsExecuted===0 && counts.kernelAdmitted===0 && counts.sourceWoUnreconciled===31,'FALSE_R80_COUNTS');
 ensure(record.releaseGate==='HOLD_HUMAN'&&record.mainModified===false&&record.sourceModified===false,'FALSE_RELEASE_STATE');
 return {candidateRows:31,issueSnapshots:issues,documentsPinned:docs,uniqueDocuments:docPins.size,registeredFindMatches:registered,fullyAdmitted:0,releaseGate:'HOLD_HUMAN'};
}
function main(){
 const root=resolve(process.argv[2]??'.'),sourceRoot=process.argv[3]?resolve(process.argv[3]):null;
 const bytes={};
 const read=p=>readFileSync(join(root,p));
 const recordBytes=read('registers/governance/r80-pending-evidence-chain-20261031.v1.json');
 const record=JSON.parse(recordBytes.toString());
 const r79Bytes=read('registers/governance/r79-domain-wo-mapping-20261031.v1.json');
 const findBytes=read('registers/governance/find-register.v1.json');
 const policyBytes=read('registers/governance/audit-policy.v1.json');
 const modelBytes=read('docs/governance/04-work-order-model.md');
 for(const [actual,declared,id] of [
   [gitBlobSha(r79Bytes),record.source.r79BlobSha,'R79'],
   [gitBlobSha(findBytes),record.source.findRegisterBlobSha,'FIND'],
   [gitBlobSha(policyBytes),record.source.policyBlobSha,'POLICY'],
   [gitBlobSha(modelBytes),record.source.woModelBlobSha,'WO_MODEL']
 ])ensure(actual===declared,'PINNED_'+id+'_BLOB_DRIFT');
 if(sourceRoot){
  for(const row of record.rows){
   if(row.source.kind==='SIMULADOS_VERSIONED_DOCUMENT_VERIFIED')bytes[row.source.path]=readFileSync(join(sourceRoot,row.source.path));
   if(row.sourceId==='P0-04'){
    bytes[row.validator.path]=readFileSync(join(sourceRoot,row.validator.path));
    bytes[row.validator.testPath]=readFileSync(join(sourceRoot,row.validator.testPath));
   }
  }
 }
 const result=validate({record,r79:JSON.parse(r79Bytes),findRegister:JSON.parse(findBytes),policy:JSON.parse(policyBytes),sourceBytes:bytes});
 if(!sourceRoot)console.log('[R80] SOURCE_DOC_BYTES_NOT_CHECKED: pass source checkout as second argument for complete static source test');
 console.log('[R80] PASS '+JSON.stringify(result));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))main();

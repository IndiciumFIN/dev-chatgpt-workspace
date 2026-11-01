#!/usr/bin/env node
/**
 * CE v1: offline, read-only admission receipt preflight.
 * A PASS proves only that an externally supplied Ed25519 signature matches
 * a uniquely scoped request. It NEVER admits a work order or authorizes writes.
 * The kernel server must verify actual persisted WO, FIND, TASK, policies,
 * segregation, approvals and validator runs with its own trust configuration.
 */
import {createHash, createPublicKey, verify} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';

const hex40=/^[a-f0-9]{40}$/;
const hex64=/^[a-f0-9]{64}$/;
const nonempty=s=>typeof s==='string'&&s.trim().length>0&&s.trim()===s;

export function canonical(value){
  if(value===null||typeof value==='string'||typeof value==='boolean')return JSON.stringify(value);
  if(typeof value==='number'&&Number.isFinite(value))return JSON.stringify(value);
  if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';
  if(value&&typeof value==='object')return '{'+Object.keys(value).sort().map(k=>{
    if(value[k]===undefined)throw Error('UNDEFINED_CANONICAL_VALUE');
    return JSON.stringify(k)+':'+canonical(value[k]);
  }).join(',')+'}';
  throw Error('UNSUPPORTED_CANONICAL_VALUE');
}
export function domainSeparatedBytes(payload){return Buffer.from('CE-KERNEL-CANDIDATE-PREFLIGHT-v1\n'+canonical(payload),'utf8')}
function uniqueNonempty(arr){return Array.isArray(arr)&&arr.length>0&&arr.every(nonempty)&&new Set(arr).size===arr.length}

export function validateClaim(claim,expected,now=new Date()){
 const errors=[];
 if(!claim||typeof claim!=='object'||Array.isArray(claim))return ['INVALID_CLAIM'];
 const keys=['schemaVersion','kind','decision','repository','targetBranch','expectedHead','archiveSha256','manifestSha256','workOrderId','findRef','taskRef','policyBundleId','policyVersion','ownerId','approverId','validatorRefs','evidenceRefs','issuedAt','expiresAt','executionRequested'];
 if(keys.sort().join('|')!==Object.keys(claim).sort().join('|'))errors.push('CLAIM_FIELDS_NOT_EXACT');
 if(claim.schemaVersion!==1||claim.kind!=='CE_KERNEL_CANDIDATE_PATCH_V1'||claim.decision!=='ADMIT_CANDIDATE_PATCH')errors.push('UNSUPPORTED_DECISION');
 if(claim.repository!==expected.repository||claim.targetBranch!==expected.targetBranch)errors.push('WRONG_REPOSITORY_OR_BRANCH');
 if(!hex40.test(claim.expectedHead)||claim.expectedHead!==expected.expectedHead)errors.push('STALE_TARGET_SHA');
 if(!hex64.test(claim.archiveSha256)||claim.archiveSha256!==expected.archiveSha256)errors.push('ARCHIVE_MISMATCH');
 if(!hex64.test(claim.manifestSha256)||claim.manifestSha256!==expected.manifestSha256)errors.push('MANIFEST_MISMATCH');
 for(const k of ['workOrderId','findRef','taskRef','policyBundleId','policyVersion','ownerId','approverId'])if(!nonempty(claim[k]))errors.push('MISSING_'+k.toUpperCase());
 if(!claim.ownerId||claim.ownerId===claim.approverId)errors.push('MAKER_CHECKER_NOT_SEGREGATED');
 if(!uniqueNonempty(claim.validatorRefs))errors.push('VALIDATORS_MISSING_OR_DUPLICATE');
 if(!uniqueNonempty(claim.evidenceRefs))errors.push('EVIDENCE_MISSING_OR_DUPLICATE');
 if(claim.executionRequested!==false)errors.push('EXECUTION_MUST_NOT_BE_REQUESTED_BY_PREFLIGHT');
 const start=Date.parse(claim.issuedAt),expiry=Date.parse(claim.expiresAt),moment=now.getTime();
 if(!Number.isFinite(start)||!Number.isFinite(expiry)||!Number.isFinite(moment)||expiry<=start||start>moment||moment>=expiry||expiry-start>24*3600*1000)errors.push('INVALID_EXPIRED_OR_FUTURE_WINDOW');
 return [...new Set(errors)];
}
export function preflight(receipt,expected,trust,now=new Date()){
 const blockers=[];
 if(!expected||!hex40.test(expected.expectedHead)||!hex64.test(expected.archiveSha256)||!hex64.test(expected.manifestSha256)||!nonempty(expected.repository)||!nonempty(expected.targetBranch))blockers.push('UNTRUSTED_EXPECTED_SCOPE');
 if(!receipt||typeof receipt!=='object'||!receipt.claim){blockers.push('ADMISSION_RECEIPT_ABSENT');return {outcome:'HOLD',blockers};}
 blockers.push(...validateClaim(receipt.claim,expected??{},now));
 if(!trust||!nonempty(trust.keyId)||typeof trust.publicKeyPem!=="string"||trust.publicKeyPem.trim().length===0||!hex64.test(trust.keyFingerprintSha256))blockers.push('TRUST_ANCHOR_NOT_PROVISIONED');
 if(receipt.algorithm!=='Ed25519'||receipt.keyId!==trust?.keyId)blockers.push('SIGNATURE_ALGORITHM_OR_KEY_ID');
 if(typeof receipt.signatureBase64!=='string'||!/^[A-Za-z0-9+/]{86}==$/.test(receipt.signatureBase64))blockers.push('MALFORMED_SIGNATURE');
 if(!blockers.length){
  try{
   const k=createPublicKey(trust.publicKeyPem);
   const got=createHash('sha256').update(k.export({format:'der',type:'spki'})).digest('hex');
   if(k.asymmetricKeyType!=='ed25519'||got!==trust.keyFingerprintSha256)blockers.push('UNTRUSTED_KEY_FINGERPRINT');
   else if(!verify(null,domainSeparatedBytes(receipt.claim),k,Buffer.from(receipt.signatureBase64,'base64')))blockers.push('INVALID_DETACHED_SIGNATURE');
  }catch{blockers.push('SIGNATURE_VERIFY_ERROR')}
 }
 return blockers.length?{outcome:'HOLD',blockers}:{outcome:'PRECHECK_OK_KERNEL_LOOKUP_REQUIRED',blockers:[],writeAuthorized:false,releaseAuthorized:false};
}

if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){
 try{
  if(process.argv.includes('--apply'))throw Error('EXECUTION_NOT_SUPPORTED_BY_PREFLIGHT');
  const args=process.argv.slice(2);
  const file=args.find(x=>x.endsWith('.json'));
  if(!file)throw Error('USAGE: node verify-admission-preflight.mjs request.json [receipt.json]');
  const request=JSON.parse(readFileSync(file,'utf8'));
  const expected=request.expected;
  // Trust anchors NEVER come from a request, a repository file, or an env toggle.
  // Only a separately provisioned trusted Kernel adapter can supply them.
  const verdict=preflight(null,expected,null);
  console.log(JSON.stringify({...verdict,requestFile:file,remoteAdmission:'NOT_CHECKED',note:'Kernel adapter not installed; no override accepted'},null,2));
  process.exitCode=2;
 }catch(e){console.error('HOLD:'+e.message);process.exitCode=2}
}

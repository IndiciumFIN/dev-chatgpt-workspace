/** Deterministic semantic comparison; never authorizes a branch/file winner. */
import {createHash} from 'node:crypto';

const REGISTRY_PREFIX = 'registers/i18n/incoming/de/contracts/';
const JSON_SUFFIX = '.json';

/**
 * A provenance_refs list is a set of citations, not an ordered history.
 * Do not sort any other array: order may be clinically or operationally significant.
 */
export function normalizeCanonicalJson(value, key = '') {
  if (Array.isArray(value)) {
    const values=value.map(item=>normalizeCanonicalJson(item));
    if(key === 'provenance_refs') {
      if (!values.every(x=>typeof x==='string') || new Set(values).size!==values.length) {
        throw Error('AMBIGUOUS_PROVENANCE_REFS');
      }
      return [...values].sort();
    }
    return values;
  }
  if(value !== null && typeof value === 'object') {
    const sorted={};
    for(const k of Object.keys(value).sort()) sorted[k]=normalizeCanonicalJson(value[k], k);
    return sorted;
  }
  return value;
}

export function normalizedJsonEvidence(path, raw) {
  if(!path.startsWith(REGISTRY_PREFIX) || !path.endsWith(JSON_SUFFIX)) throw Error('PATH_NOT_ALLOWLISTED');
  if(typeof raw!=='string' || raw.length>1024*1024) throw Error('UNSAFE_JSON_SIZE');
  const original=JSON.parse(raw);
  if(original?.locale!=='de'||typeof original?.canonical_id!=='string'||!original.canonical_id.startsWith('cko:i18n:de:')) throw Error('UNEXPECTED_RECORD_ID');
  if(!Array.isArray(original.provenance_refs)) throw Error('MISSING_PROVENANCE_REFS');
  const normalized=JSON.stringify(normalizeCanonicalJson(original));
  return {
    hash:createHash('sha256').update(normalized).digest('hex'),
    canonicalId:original.canonical_id,
    status:original.status??null,
    translationStatus:original.translation_status??null,
    version:original.version??null,
    hasExplicitHumanApproval:original.status==='APPROVED' && original.translation_status==='APPROVED',
  };
}

/** readBlob must return the exact content identified by Git blob SHA. */
export function analyzeSemanticI18nCollisions(collisions, readBlob) {
  const equivalent=[];
  const substantive=[];
  const unableToVerify=[];
  for(const collision of collisions) {
    if(!collision.path.startsWith(REGISTRY_PREFIX)||!collision.path.endsWith(JSON_SUFFIX)){
      substantive.push({path:collision.path, reason:'NOT_ALLOWLISTED'});
      continue;
    }
    const blobs=[...new Set(collision.sources.map(source=>source.blob))];
    if(blobs.some(sha=>!/^[a-f0-9]{40,64}$/.test(sha??''))){
      unableToVerify.push({path:collision.path,reason:'MISSING_BLOB'});
      continue;
    }
    try{
      const evidences=blobs.map(sha=>({blob:sha,...normalizedJsonEvidence(collision.path,readBlob(sha))}));
      const unique=new Set(evidences.map(x=>x.hash));
      if(unique.size===1){
        equivalent.push({
          path:collision.path,
          canonicalId:evidences[0].canonicalId,
          semanticSha256:evidences[0].hash,
          originalBlobs:blobs,
          sources:collision.sources.map(x=>x.branch),
          approvalState:evidences.every(x=>x.hasExplicitHumanApproval)?'SOURCE_APPROVED':'DRAFT_OR_UNVERIFIED',
          outcome:'SEMANTIC_EQUIVALENCE_ONLY_NO_CANONICAL_WINNER',
        });
      }else {
        substantive.push({path:collision.path,reason:'SEMANTIC_DIFFERENCE',blobs});
      }
    }catch(e){ unableToVerify.push({path:collision.path,reason:String(e.message).slice(0,130)}); }
  }
  return {equivalent,substantive,unableToVerify,
    counts:{sourceCollisions:collisions.length,semanticEquivalents:equivalent.length,
      substantiveOrNonAllowlisted:substantive.length,unverifiable:unableToVerify.length},
    releaseGate:'HOLD_HUMAN'};
}

/** Reconciliation preflight for CSV/TSV/JSON staging packages.
 * Pure business logic: no network, SQL, mutations, approvals or execution.
 *
 * The catalog snapshot is obtained by a FUTURE authenticated server-side
 * read adapter. This module cannot attest that the reader is trustworthy.
 * Every result remains review-only, including NEW and IDENTICAL.
 */
import type { ImportProfile, ImportRecord, ImportReview } from './bulk-import';

export type CatalogRow = {identifier:string;data:Record<string,unknown>;versionRef?:string};
export type CatalogLookupResponse = {
  destination:string;
  primaryKey:string;
  requestedIds:readonly string[];
  rows:readonly CatalogRow[];
  snapshotRef:string;
  capturedAt:string;
};
export type ReadOnlyCatalogLookup = (request:{
  destination:string;primaryKey:string;identifiers:readonly string[];
})=>Promise<CatalogLookupResponse>;
export type ReconcileClass =
  | 'HOLD_INVALID_ROW'
  | 'HOLD_NO_CATALOG'
  | 'HOLD_INCOMPLETE_LOOKUP'
  | 'NEW_CANDIDATE'
  | 'UNCHANGED_CANDIDATE'
  | 'CONFLICT_HOLD';
export type ReconciledRow={
  line:number;
  identifier:string;
  classification:ReconcileClass;
  differingFields:readonly string[];
  existingVersionRef?:string;
  /** Visibility only; never treat the string as an authorization. */
  snapshotRef?:string;
};
export type ReconciliationReport={
  type:'CKO_IMPORT_RECONCILIATION_CANDIDATE';
  destination:string;
  profileId:ImportProfile['id'];
  counts:Record<ReconcileClass,number>;
  rows:ReconciledRow[];
  catalogReadPerformed:boolean;
  authorization:'NOT_REQUESTED';
  databaseMutation:false;
  admission:'NOT_SUBMITTED';
};
const CHUNK=250;
const classes:readonly ReconcileClass[]=[
 'HOLD_INVALID_ROW','HOLD_NO_CATALOG','HOLD_INCOMPLETE_LOOKUP',
 'NEW_CANDIDATE','UNCHANGED_CANDIDATE','CONFLICT_HOLD',
];
function stable(value:unknown):string{
  if(value===null||typeof value!=='object')return JSON.stringify(value)??'undefined';
  if(Array.isArray(value))return '['+value.map(stable).join(',')+']';
  const fields=Object.keys(value as Record<string,unknown>).sort();
  return '{'+fields.map(k=>JSON.stringify(k)+':'+stable((value as Record<string,unknown>)[k])).join(',')+'}';
}
function equalSet(a:readonly string[],b:readonly string[]):boolean{
 return a.length===b.length && new Set(a).size===a.length &&
  new Set(b).size===b.length && a.every(x=>b.includes(x));
}
function isValidSnapshot(response:CatalogLookupResponse,requested:readonly string[],profile:ImportProfile):boolean{
  if(!response||response.destination!==profile.destination||response.primaryKey!==profile.primaryKey||
     !equalSet(response.requestedIds,requested)||!response.snapshotRef?.trim()||
     !response.capturedAt||Number.isNaN(Date.parse(response.capturedAt))||
     !Array.isArray(response.rows))return false;
  const ids=response.rows.map(r=>r?.identifier);
  if(ids.some(x=>typeof x!=='string'||!requested.includes(x))||
     new Set(ids).size!==ids.length)return false;
  return response.rows.every(r=>r.data&&typeof r.data==='object'&&!Array.isArray(r.data) &&
    r.data[profile.primaryKey]===r.identifier);
}
/** Reconcile only records already locally validated.
 * Missing catalog, partial responses, or read failures are always HOLD.
 * A complete response is a *claimed* read snapshot, not an OPA or Kernel proof.
 */
export async function reconcileImportReview(
  review:ImportReview,
  profile:ImportProfile,
  lookup?:ReadOnlyCatalogLookup,
):Promise<ReconciliationReport>{
  if(review.profileId!==profile.id||review.destination!==profile.destination||
     !Array.isArray(review.records)||review.records.length>10000)
    throw new Error('Contrato de importação e perfil incompatíveis.');
  const rows:ReconciledRow[]=review.records.map(r=>({
    line:r.line,identifier:r.identifier,
    classification:r.state!=='CANDIDATE'||r.issues.length?'HOLD_INVALID_ROW':'HOLD_NO_CATALOG',
    differingFields:[],
  }));
  if(lookup){
    for(let i=0;i<rows.length;i+=CHUNK){
      const candidates=rows.slice(i,i+CHUNK).filter(r=>r.classification==='HOLD_NO_CATALOG');
      const identifiers=[...new Set(candidates.map(x=>x.identifier).filter(Boolean))];
      if(!identifiers.length)continue;
      let result:CatalogLookupResponse|undefined;
      try{result=await lookup({destination:profile.destination,primaryKey:profile.primaryKey,identifiers});}
      catch{ /* fail closed; never infer a new record from an offline reader */ }
      if(!result||!isValidSnapshot(result,identifiers,profile)){
        for(const candidate of candidates)candidate.classification='HOLD_INCOMPLETE_LOOKUP';
        continue;
      }
      const existing=new Map(result.rows.map(r=>[r.identifier,r]));
      for(const candidate of candidates){
        candidate.snapshotRef=result.snapshotRef;
        const matched=existing.get(candidate.identifier);
        if(!matched){candidate.classification='NEW_CANDIDATE';continue;}
        candidate.existingVersionRef=matched.versionRef;
        const original=review.records.find(r=>r.line===candidate.line) as ImportRecord;
        const changed=Object.entries(original.data)
          .filter(([key,value])=>key!==profile.primaryKey && stable(value)!==stable(matched.data[key]))
          .map(([key])=>key);
        candidate.differingFields=changed;
        candidate.classification=changed.length?'CONFLICT_HOLD':'UNCHANGED_CANDIDATE';
      }
    }
  }
  const counts=Object.fromEntries(classes.map(c=>[c,rows.filter(r=>r.classification===c).length])) as Record<ReconcileClass,number>;
  return {
    type:'CKO_IMPORT_RECONCILIATION_CANDIDATE',profileId:profile.id,
    destination:profile.destination,rows,counts,
    catalogReadPerformed:rows.some(r=>Boolean(r.snapshotRef)),
    authorization:'NOT_REQUESTED',databaseMutation:false,admission:'NOT_SUBMITTED',
  };
}
/** Safe allowlist for a future server adapter, never execute this in browser.
 * $1 MUST be a parameterized text[] array; no arbitrary SQL identifiers.
 */
export function catalogLookupSql(profile:ImportProfile):string{
  const supported:Record<ImportProfile['id'],string>={
    sources:'select source_id,source_type,title,publisher,official_uri,host,jurisdiction,authority_level,accreditation_status,accepted_for,review_due,attributes,created_at from cko_evidence.sources where source_id = any($1::text[])',
    policies:'select policy_id,version,category,description,severity_on_violation,action_on_violation,rule_json,active,created_at from cko_orch.policy_registry where policy_id = any($1::text[])',
    validators:'select validator_id,name,domain,version,blocking,input_types,requirements,severity_policy,owner_function,status,current_version_ref from cko_validation.validators where validator_id = any($1::text[])',
  };
  if(profile.destination!==({sources:'cko_evidence.sources',policies:'cko_orch.policy_registry',validators:'cko_validation.validators'} as Record<string,string>)[profile.id])
    throw new Error('Perfil não autorizado.');
  return supported[profile.id];
}

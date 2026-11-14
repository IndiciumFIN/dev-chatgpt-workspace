/**
 * Metadata-only reconciliation of existing CKO/Supabase source identities.
 * No new canonical IDs, no inference of normative authority from URLs or SQL.
 */
export function auditSourceUniverse(snapshot,{articleIndex,clinicalSources,editorialPages=0}={}) {
 const errors=[],holds=[],edges=[],scopeExcluded=[];
 const fail=(code,detail)=>errors.push({code,detail});
 const hold=(code,detail)=>holds.push({code,detail});
 if(snapshot.noDatabaseMutation!==true||snapshot.noPublicationAuthorization!==true||snapshot.noAutomaticAdmissions!==true)
   fail("READ_ONLY_INVARIANTS_CHANGED","The source snapshot must not grant publication or remote writes");
 const d=snapshot.datasets||{};
 for(const key of ["normatives","evidenceSources","extractions","snapshots","fragments","assertions","claims","atomizations","sourceLineage","fieldBindingRefs"]){
   if(!Array.isArray(d[key])){fail("DATASET_MISSING",key);continue;}
   if(d[key].length!==snapshot.counts?.[key])fail("DATASET_COUNT_DRIFT",key);
 }
 if(errors.length)return {errors,holds,edges,scopeExcluded,counts:{},releaseGate:"HOLD_HUMAN"};
 const accounting=(n)=>/^(CFC|NBC|CPC|IFRS|IFAC|CTA|CTG|ITG|TG|ISA)[-_ ]/i.test(n.normative_ref||"")||
   /cfc\.org\.br|ifrs\.org|cpc\.org\.br/i.test(n.official_uri||"")||
   /cont[aá]bil|demonstra[cç][oõ]es financeiras/i.test(n.title||"");
 const normativeRefs=new Set();
 for(const n of d.normatives){
   if(normativeRefs.has(n.normative_ref))fail("DUPLICATE_NORMATIVE_REFERENCE",n.normative_ref);
   normativeRefs.add(n.normative_ref);
   if(accounting(n))fail("ACCOUNTING_RECORD_IN_CE_SCOPE",n.normative_ref);
 }
 const sourceIds=new Set();
 for(const s of d.evidenceSources){
   if(sourceIds.has(s.source_id))fail("DUPLICATE_EVIDENCE_SOURCE",s.source_id);
   sourceIds.add(s.source_id);
 }
 const snapIds=new Set(d.snapshots.map(s=>s.snapshot_id));
 const fragmentIds=new Set(d.fragments.map(f=>f.fragment_id));
 const assertionIds=new Set(d.assertions.map(a=>a.assertion_id));
 const noSha=(v)=>typeof v!=="string"||!/^[0-9a-f]{64}$/i.test(v)||/^0{64}$/i.test(v);
 for(const s of d.snapshots){
   if(!sourceIds.has(s.source_id))fail("SNAPSHOT_UNKNOWN_SOURCE",s.snapshot_id);
   if(noSha(s.content_sha256))hold("SNAPSHOT_UNVERIFIED_BYTES",s.snapshot_id);
   edges.push({from:s.snapshot_id,to:s.source_id,relation:"snapshot.source_id"});
 }
 for(const f of d.fragments){
   if(!snapIds.has(f.snapshot_id))fail("FRAGMENT_UNKNOWN_SNAPSHOT",f.fragment_id);
   if(noSha(f.fragment_sha256))hold("FRAGMENT_UNVERIFIED_HASH",f.fragment_id);
   edges.push({from:f.fragment_id,to:f.snapshot_id,relation:"fragment.snapshot_id"});
 }
 for(const a of d.assertions){
   if(!fragmentIds.has(a.source_fragment_id))fail("ASSERTION_UNKNOWN_FRAGMENT",a.assertion_id);
   edges.push({from:a.assertion_id,to:a.source_fragment_id,relation:"assertion.source_fragment_id"});
 }
 let claimsWithoutAssertion=0;
 for(const c of d.claims){
   const refs=Array.isArray(c.assertion_refs)?c.assertion_refs:[];
   if(refs.length===0)claimsWithoutAssertion++;
   for(const id of refs){
     if(!assertionIds.has(id))fail("CLAIM_UNKNOWN_ASSERTION",c.claim_id+" -> "+id);
     else edges.push({from:c.claim_id,to:id,relation:"claim.assertion_refs"});
   }
 }
 if(claimsWithoutAssertion)hold("CLAIMS_WITHOUT_ATOM_ASSERTION_LINK",String(claimsWithoutAssertion));
 const bindingTotal=d.fieldBindingRefs.reduce((n,b)=>{
   if(!normativeRefs.has(b.normative_ref))fail("FIELD_BINDING_UNKNOWN_NORMATIVE",b.normative_ref);
   edges.push({from:"field-bindings:"+b.normative_ref,to:b.normative_ref,relation:"normative_ref",count:b.binding_count});
   return n+Number(b.binding_count||0);
 },0);
 const unverifiedLineage=d.sourceLineage.filter(s=>s.verified!==true);
 if(unverifiedLineage.length)hold("SOURCE_LINEAGE_UNVERIFIED",String(unverifiedLineage.length));
 const notPublished=d.atomizations.filter(a=>a.publication_allowed!==true||a.clinical_signoff!=="APPROVED");
 if(notPublished.length)hold("ATOMIZATION_NOT_APPROVED_FOR_PUBLICATION",String(notPublished.length));
 const pendingExtractions=d.extractions.filter(e=>!e.checked_at);
 if(pendingExtractions.length)hold("EXTRACTIONS_WITHOUT_INDEPENDENT_CHECK",String(pendingExtractions.length));
 for(const a of d.atomizations){
   if(noSha(a.source_pdf_sha256)||noSha(a.atomized_jsonl_sha256))
     hold("ATOMIZATION_HASH_REVIEW_REQUIRED",a.release_id);
 }
 let urlCandidates=0;
 const maybeNorm=new Set(d.normatives.map(n=>n.normative_ref));
 for(const m of snapshot.matchingCandidates||[]){
   if(!maybeNorm.has(m.normative_ref)||!sourceIds.has(m.source_id))
     fail("CROSSWALK_TARGET_NOT_FOUND",m.normative_ref+" <> "+m.source_id);
   if(m.identityApproved!==false)
     fail("UNAUTHORIZED_CANONICAL_MERGE",m.normative_ref+" <> "+m.source_id);
   edges.push({from:m.normative_ref,to:m.source_id,relation:"possible_same_source_uri_NOT_APPROVED"});
   urlCandidates++;
 }
 if(articleIndex){
   if(articleIndex.approvalOrRelease!==false||articleIndex.extractionReviewed!==false)
     hold("GITHUB_SOURCE_INDEX_STATE_CHANGED_REVIEW_REQUIRED","Inspect evidence before using as reviewed");
   if(!Array.isArray(articleIndex.items))fail("GITHUB_SOURCE_INDEX_MISSING","No source index");
   else for(const s of articleIndex.items){
      if(!s.sourceCanonicalId||!s.indexPath)fail("GITHUB_SOURCE_UNIDENTIFIED",s.identifier||"?");
   }
   if(articleIndex.extractionReviewed!==true)
     hold("GITHUB_ARTICLE_OCCURRENCES_UNREVIEWED",String(articleIndex.items?.reduce((n,x)=>n+Number(x.articleOccurrences||0),0)||0));
 }
 const clinicalPlaceholder=(clinicalSources||[]).filter(s=>noSha(s.integrity?.sha256)||/PENDING/i.test(s.integrity?.snapshot_ref||""));
 if(clinicalPlaceholder.length)hold("CLINICAL_SOURCE_PLACEHOLDER_NOT_QUALIFIED",String(clinicalPlaceholder.length));
 if(editorialPages>0)hold("EDITORIAL_PROJECTIONS_REQUIRE_CLAIM_LINK_VALIDATION",String(editorialPages));
 const counts={
   normativesNonAccounting:d.normatives.length,accountingCatalogExcluded:snapshot.historicalAccountingReferencesExcluded,
   evidenceSources:d.evidenceSources.length,snapshots:d.snapshots.length,fragments:d.fragments.length,
   assertions:d.assertions.length,claims:d.claims.length,claimsWithoutAssertion,
   extractedDocuments:d.atomizations.length,textAtomsRecorded:d.atomizations.reduce((n,x)=>n+Number(x.literal_text_atoms||0),0),
   visualReferenceAtomsRecorded:d.atomizations.reduce((n,x)=>n+Number(x.visual_reference_atoms||0),0),
   unverifiedLineage:unverifiedLineage.length,unapprovedAtomizations:notPublished.length,
   fieldBindingRefs:d.fieldBindingRefs.length,fieldBindings:bindingTotal,
   candidateUriCrosswalk:urlCandidates,articleSourceIndexes:articleIndex?.items?.length||0,
   articleOccurrences:articleIndex?.items?.reduce((n,x)=>n+Number(x.articleOccurrences||0),0)||0,
   clinicalSourcePlaceholders:clinicalPlaceholder.length,editorialPages
 };
 return {errors,holds,edges,scopeExcluded,counts,releaseGate:(errors.length||holds.length)?"HOLD_HUMAN":"EVIDENCE_ONLY_NOT_RELEASE"};
}

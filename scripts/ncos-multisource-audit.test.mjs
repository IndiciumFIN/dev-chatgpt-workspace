import test from "node:test";
import assert from "node:assert/strict";
import {auditSourceUniverse} from "./lib/ncos-multisource-audit.mjs";
const sha="a".repeat(64);
const base=()=>({
  noDatabaseMutation:true,noPublicationAuthorization:true,noAutomaticAdmissions:true,historicalAccountingReferencesExcluded:0,
  counts:{normatives:1,evidenceSources:1,extractions:0,snapshots:1,fragments:1,assertions:1,claims:1,atomizations:0,sourceLineage:0,fieldBindingRefs:1},
  datasets:{
    normatives:[{normative_ref:"Lei 7.498/1986"}],
    evidenceSources:[{source_id:"SRC-1"}],extractions:[],
    snapshots:[{snapshot_id:"S",source_id:"SRC-1",content_sha256:sha}],
    fragments:[{fragment_id:"F",snapshot_id:"S",fragment_sha256:sha}],
    assertions:[{assertion_id:"A",source_fragment_id:"F"}],
    claims:[{claim_id:"C",assertion_refs:["A"]}],atomizations:[],sourceLineage:[],
    fieldBindingRefs:[{normative_ref:"Lei 7.498/1986",binding_count:1}]
  },
  matchingCandidates:[{normative_ref:"Lei 7.498/1986",source_id:"SRC-1",identityApproved:false}]
});
test("valid lineage keeps evidence distinct from canonical authority",()=>{
 const r=auditSourceUniverse(base());
 assert.equal(r.errors.length,0);assert.equal(r.counts.fieldBindings,1);
 assert.ok(r.edges.some(e=>e.relation==="claim.assertion_refs"));
});
test("accounting normative is blocked even in mixed catalog",()=>{
 const a=base();a.datasets.normatives[0].normative_ref="CFC-NBC-01";a.datasets.fieldBindingRefs[0].normative_ref="CFC-NBC-01";
 assert.ok(auditSourceUniverse(a).errors.some(x=>x.code==="ACCOUNTING_RECORD_IN_CE_SCOPE"));
});
test("dangling fragment blocks canonical relationship",()=>{
 const a=base();a.datasets.assertions[0].source_fragment_id="MISSING";
 assert.ok(auditSourceUniverse(a).errors.some(x=>x.code==="ASSERTION_UNKNOWN_FRAGMENT"));
});
test("same URL cannot approve a canonical merge",()=>{
 const a=base();a.matchingCandidates[0].identityApproved=true;
 assert.ok(auditSourceUniverse(a).errors.some(x=>x.code==="UNAUTHORIZED_CANONICAL_MERGE"));
});
test("unreviewed atomization and source lineage always HOLD",()=>{
 const a=base();a.datasets.atomizations=[{release_id:"r1",literal_text_atoms:100,publication_allowed:false,clinical_signoff:"PENDING",source_pdf_sha256:sha,atomized_jsonl_sha256:sha}];
 a.counts.atomizations=1;a.datasets.sourceLineage=[{verified:false}];a.counts.sourceLineage=1;
 const r=auditSourceUniverse(a);
 assert.ok(r.holds.some(x=>x.code==="ATOMIZATION_NOT_APPROVED_FOR_PUBLICATION"));
 assert.ok(r.holds.some(x=>x.code==="SOURCE_LINEAGE_UNVERIFIED"));
});
test("field authority must reference a known non-accounting normative",()=>{
 const a=base();a.datasets.fieldBindingRefs[0].normative_ref="MISSING";
 assert.ok(auditSourceUniverse(a).errors.some(x=>x.code==="FIELD_BINDING_UNKNOWN_NORMATIVE"));
});

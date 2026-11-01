#!/usr/bin/env node
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import {PGlite} from "@electric-sql/pglite";

let failures=0;
const read=p=>readFileSync(p,"utf8");
const check=(id,ok,detail="")=>{console.log(`${ok?"PASS":"FAIL"} CAREER PROMOTION: ${id}${detail?` — ${detail}`:""}`);if(!ok)failures++};
const sha=s=>createHash("sha256").update(s).digest("hex");

const registry=JSON.parse(read("registers/career/promotion-control.v1.json"));
const dossier=JSON.parse(read("registers/governance/candidates/ADMISSION-CAREER-YOUTH-001.json"));
const releaseSchema=JSON.parse(read("contracts/cko-schemas/release_gate.schema.json"));
const publicationSchema=JSON.parse(read("contracts/cko-schemas/publication.schema.json"));
const reviewSchema=JSON.parse(read("schemas/career-review-item.schema.json"));
const dossierSchema=JSON.parse(read("schemas/career-admission-dossier.schema.json"));

check("registry-hold",registry.status==="HOLD_HUMAN");
check("review-queue-counts",registry.reviewQueue?.claimItems===19&&registry.reviewQueue?.editorialItems===17&&registry.reviewQueue?.totalItems===36);
check("six-release-gates",registry.releaseGates?.length===6,String(registry.releaseGates?.length??0));
check("two-publications",registry.publications?.length===2,String(registry.publications?.length??0));
check("dossier-not-submitted",dossier.status==="HOLD_COMPATIBILITY"&&dossier.kernel_admission==="NOT_SUBMITTED"&&dossier.manifest_status==="NOT_MATERIALIZED"&&dossier.compatibility?.compatible===false);
check("dossier-blocker",dossier.submission_blocker==="KERNEL_WORK_ORDER_MODEL_ADAPTER_MISSING");
for(const p of dossier.candidate_validators??[])check("dossier-validator-exists",Boolean(p&&readFileSync(p,"utf8")),p);

const pg=new PGlite();await pg.waitReady;
for(const p of ["migrations/0004_career_youth_candidate.sql","migrations/0005_career_editorial_content_candidate.sql","migrations/0006_career_atomization_candidate.sql","migrations/0007_career_promotion_control_candidate.sql"])await pg.exec(read(p));

const q=async(sql,params=[])=>await pg.query(sql,params);
const count=async(table)=>Number((await q(`select count(*)::int as n from ${table}`)).rows[0].n);

check("review-items-36",await count("career_review_item_candidate")===36,String(await count("career_review_item_candidate")));
const claimReviews=Number((await q("select count(*)::int as n from career_review_item_candidate where item_kind='CLAIM'")).rows[0].n);
const editorialReviews=Number((await q("select count(*)::int as n from career_review_item_candidate where item_kind='EDITORIAL_DOCUMENT'")).rows[0].n);
check("claim-reviews-19",claimReviews===19,String(claimReviews));
check("editorial-reviews-17",editorialReviews===17,String(editorialReviews));
const pendingReviews=Number((await q("select count(*)::int as n from career_review_item_candidate where decision='PENDING' and status='REVIEW_REQUIRED'")).rows[0].n);
check("all-reviews-pending",pendingReviews===36,String(pendingReviews));
const reviewedWithoutEvidence=Number((await q("select count(*)::int as n from career_review_item_candidate where decision in ('APPROVED','REJECTED') and (evidence_ref is null or reviewed_at is null)")).rows[0].n);
check("no-review-without-evidence",reviewedWithoutEvidence===0,String(reviewedWithoutEvidence));

const gates=(await q("select * from career_release_gate_candidate order by canonical_id")).rows;
check("db-six-gates",gates.length===6,String(gates.length));
for(const g of gates){
 const payload={
  schema_version:"0.1.0",canonical_id:g.canonical_id,version:g.version,status:g.status,updated_at:String(g.updated_at).slice(0,10),
  provenance_refs:g.provenance_refs,upstream_gate_refs:g.upstream_gate_refs,required_approvals:g.required_approvals,
  evidence_bundle_refs:g.evidence_bundle_refs,decision:g.decision,replay_hash:g.replay_hash,deployment_scope:g.deployment_scope
 };
 for(const field of releaseSchema.required)check("release-gate-required",payload[field]!==undefined&&payload[field]!==null,`${g.canonical_id}.${field}`);
 check("release-gate-held",g.decision==="HOLD"&&g.status==="HOLD_HUMAN",g.canonical_id);
 const replay=[g.canonical_id,"HOLD",(g.upstream_gate_refs??[]).join(","),(g.required_approvals??[]).join(","),g.deployment_scope].join("|");
 check("release-gate-replay-hash",sha(replay)===g.replay_hash,g.canonical_id);
}
const releaseApproved=Number((await q("select count(*)::int as n from career_release_gate_candidate where decision='APPROVED' or status in ('ELIGIBLE_FOR_RELEASE','RELEASED')")).rows[0].n);
check("no-release-gate-approved",releaseApproved===0,String(releaseApproved));

const pubs=(await q("select * from career_publication_candidate order by canonical_id")).rows;
check("db-two-publications",pubs.length===2,String(pubs.length));
for(const p of pubs){
 const payload={
  schema_version:"0.1.0",canonical_id:p.canonical_id,version:p.version,status:p.status,updated_at:String(p.updated_at).slice(0,10),
  provenance_refs:p.provenance_refs,artifact_id:p.artifact_id,resolved_projection_id:p.resolved_projection_id,
  required_gate_ids:p.required_gate_ids,gate_results:p.gate_results,human_approval:p.human_approval,output_sha256:p.output_sha256
 };
 for(const field of publicationSchema.required)check("publication-required",payload[field]!==undefined&&payload[field]!==null,`${p.canonical_id}.${field}`);
 check("publication-held",p.status==="HOLD_HUMAN"&&p.human_approval==="PENDING",p.canonical_id);
 check("publication-all-gates-hold",Array.isArray(p.gate_results)&&p.gate_results.length===6&&p.gate_results.every(x=>x.result==="HOLD"),p.canonical_id);
}
const promotedPubs=Number((await q("select count(*)::int as n from career_publication_candidate where human_approval='APPROVED' or status in ('ELIGIBLE_FOR_RELEASE','RELEASED')")).rows[0].n);
check("no-publication-promoted",promotedPubs===0,String(promotedPubs));

const pendingClaims=Number((await q("select count(*)::int as n from career_claim_candidate where review='PENDING' or status='REVIEW_REQUIRED'")).rows[0].n);
const pendingDocs=Number((await q("select count(*)::int as n from career_editorial_document_candidate where human_gate='HOLD'")).rows[0].n);
check("promotion-blocked-by-claims",pendingClaims===19,String(pendingClaims));
check("promotion-blocked-by-docs",pendingDocs===17,String(pendingDocs));

check("review-schema-draft",reviewSchema.$schema==="https://json-schema.org/draft/2020-12/schema");
check("dossier-schema-draft",dossierSchema.$schema==="https://json-schema.org/draft/2020-12/schema");

await pg.close();
if(failures){console.error(`BLOCKED: ${failures} promotion-control finding(s).`);process.exit(1)}
console.log("OK: promotion control is fail-closed — 36 reviews pending, 6 release gates HOLD, 2 publications blocked, Kernel NOT_SUBMITTED.");

#!/usr/bin/env node
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import {PGlite} from "@electric-sql/pglite";

let failures=0;
const read=p=>readFileSync(p,"utf8");
const check=(id,ok,detail="")=>{console.log(`${ok?"PASS":"FAIL"} CAREER ATOM: ${id}${detail?` — ${detail}`:""}`);if(!ok)failures++};
const sha=s=>createHash("sha256").update(s).digest("hex");

const snapshots=JSON.parse(read("registers/career/source-snapshots.v1.json"));
const registry=JSON.parse(read("registers/career/atomization.v1.json"));
const claimSchema=JSON.parse(read("contracts/cko-schemas/claim.schema.json"));

check("registry-state",registry.status==="CANDIDATE_HOLD");
check("registry-counts",registry.counts?.fragments===19&&registry.counts?.atomicFacts===19&&registry.counts?.claims===19&&registry.counts?.evidenceBundles===19&&registry.counts?.authorityBindings===16,JSON.stringify(registry.counts));
check("claim-schema-ref",registry.ckoClaimSchemaRef==="contracts/cko-schemas/claim.schema.json");
check("atom-count",registry.atoms?.length===19,String(registry.atoms?.length??0));

const pg=new PGlite();await pg.waitReady;
for(const p of ["migrations/0004_career_youth_candidate.sql","migrations/0005_career_editorial_content_candidate.sql","migrations/0006_career_atomization_candidate.sql"]) await pg.exec(read(p));

const count=async table=>Number((await pg.query(`select count(*)::int as n from ${table}`)).rows[0].n);
check("fragments-19",await count("career_source_fragment_candidate")===19,String(await count("career_source_fragment_candidate")));
check("facts-19",await count("career_atomic_fact_candidate")===19,String(await count("career_atomic_fact_candidate")));
check("claims-19",await count("career_claim_candidate")===19,String(await count("career_claim_candidate")));
check("evidence-19",await count("career_evidence_bundle_candidate")===19,String(await count("career_evidence_bundle_candidate")));
const atomicBindings=Number((await pg.query("select count(*)::int as n from career_authority_binding_candidate where claim_id is not null")).rows[0].n);
check("authority-bindings-16",atomicBindings===16,String(atomicBindings));

let snapshotFacts=0;
for(const source of snapshots.sources){
  for(let i=0;i<source.facts.length;i++){
    snapshotFacts++;
    const fact=source.facts[i];
    const rows=(await pg.query("select id,normalized_text,source_sha256,fragment_sha256 from career_source_fragment_candidate where source_id=$1 and fact_index=$2",[source.id,i+1])).rows;
    check("snapshot-fact-one-fragment",rows.length===1,`${source.id}#${i+1}`);
    if(rows[0]){
      check("fragment-text-exact",rows[0].normalized_text===fact,`${source.id}#${i+1}`);
      check("fragment-source-sha",rows[0].source_sha256===source.sha256,`${source.id}#${i+1}`);
    }
  }
}
check("snapshot-fact-total",snapshotFacts===19,String(snapshotFacts));

for(const atom of registry.atoms){
  const fragment=(await pg.query("select * from career_source_fragment_candidate where id=$1",[atom.fragment_id])).rows[0];
  const fact=(await pg.query("select * from career_atomic_fact_candidate where id=$1",[atom.atomic_fact_id])).rows[0];
  const claim=(await pg.query("select * from career_claim_candidate where canonical_id=$1",[atom.claim_id])).rows[0];
  const evidence=(await pg.query("select * from career_evidence_bundle_candidate where id=$1",[atom.evidence_bundle_id])).rows[0];
  check("fragment-exists",Boolean(fragment),atom.fragment_id);
  check("fact-exists",Boolean(fact),atom.atomic_fact_id);
  check("claim-exists",Boolean(claim),atom.claim_id);
  check("evidence-exists",Boolean(evidence),atom.evidence_bundle_id);
  if(fragment&&fact){
    check("fact-fragment-link",fact.fragment_id===fragment.id,atom.atomic_fact_id);
    check("fact-sha",sha(fact.normalized_statement)===fact.sha256,atom.atomic_fact_id);
  }
  if(claim){
    const payload={
      schema_version:"0.1.0",canonical_id:claim.canonical_id,version:claim.version,status:claim.status,
      updated_at:String(claim.updated_at).slice(0,10),provenance_refs:claim.provenance_refs,
      object_id:claim.object_id,assertion_key:claim.assertion_key,source_ids:claim.source_ids,
      binding_ids:claim.binding_ids,jurisdiction:claim.jurisdiction,applicability:claim.applicability,
      review:claim.review,claim_type:claim.claim_type
    };
    for(const field of claimSchema.required) check("cko-claim-required",payload[field]!==undefined&&payload[field]!==null,`${claim.canonical_id}.${field}`);
    check("cko-claim-status",claimSchema.properties.status.enum.includes(payload.status),claim.canonical_id);
    check("cko-claim-review",claimSchema.properties.review.enum.includes(payload.review),claim.canonical_id);
    check("cko-claim-type",claimSchema.properties.claim_type.enum.includes(payload.claim_type),claim.canonical_id);
    check("cko-claim-source",Array.isArray(payload.source_ids)&&payload.source_ids.length>=1,claim.canonical_id);
    check("claim-not-approved",payload.review==="PENDING"&&payload.status==="REVIEW_REQUIRED",claim.canonical_id);
  }
  if(evidence&&claim&&fragment&&fact){
    check("evidence-lineage",evidence.claim_id===claim.canonical_id&&evidence.fragment_id===fragment.id&&evidence.atomic_fact_id===fact.id,atom.evidence_bundle_id);
    check("evidence-hashes",evidence.source_sha256===atom.source_sha256&&evidence.fragment_sha256===atom.fragment_sha256&&evidence.fact_sha256===atom.fact_sha256,atom.evidence_bundle_id);
    check("evidence-human-held",evidence.status==="HOLD_HUMAN"&&evidence.review==="PENDING",atom.evidence_bundle_id);
  }
  if(atom.authority_binding_id){
    const b=(await pg.query("select * from career_authority_binding_candidate where id=$1",[atom.authority_binding_id])).rows[0];
    check("authority-binding-exists",Boolean(b),atom.authority_binding_id);
    if(b){
      check("authority-binding-claim",b.claim_id===atom.claim_id,atom.authority_binding_id);
      check("authority-binding-held",b.decision==="HOLD_HUMAN"&&b.status==="HOLD_HUMAN",atom.authority_binding_id);
      check("authority-evidence-link",Array.isArray(b.evidence_bundle_ids_json)&&b.evidence_bundle_ids_json.includes(atom.evidence_bundle_id),atom.authority_binding_id);
    }
  }else{
    check("unbound-claim-held",claim?.status==="REVIEW_REQUIRED"&&Array.isArray(claim?.binding_ids)&&claim.binding_ids.length===0,atom.claim_id);
  }
}

const factualBlocks=(await pg.query("select document_id,block_id,block_type from career_editorial_block_candidate where source_mode='evidence' and block_type<>'references' order by document_id,block_id")).rows;
for(const block of factualBlocks){
  const supports=Number((await pg.query("select count(*)::int as n from career_content_claim_binding_candidate where document_id=$1 and block_id=$2 and binding_role='SUPPORTS'",[block.document_id,block.block_id])).rows[0].n);
  check("factual-block-has-supporting-claim",supports>=1,`${block.document_id}/${block.block_id}:${supports}`);
}
const orphanBindings=Number((await pg.query("select count(*)::int as n from career_content_claim_binding_candidate b left join career_claim_candidate c on c.canonical_id=b.claim_id left join career_editorial_block_candidate e on e.document_id=b.document_id and e.block_id=b.block_id where c.canonical_id is null or e.block_id is null")).rows[0].n);
check("content-claim-no-orphans",orphanBindings===0,String(orphanBindings));

const approved=Number((await pg.query("select count(*)::int as n from career_claim_candidate where review in ('CLINICAL_APPROVED','EDITORIAL_APPROVED') or status in ('ASSURED','ELIGIBLE_FOR_RELEASE','RELEASED')")).rows[0].n);
check("no-claim-self-promotion",approved===0,String(approved));

await pg.close();
if(failures){console.error(`BLOCKED: ${failures} atomization finding(s).`);process.exit(1)}
console.log("OK: 19 facts atomized end-to-end with CKO claims, evidence lineage and claim-level content bindings.");

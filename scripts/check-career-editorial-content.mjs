#!/usr/bin/env node
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import {PGlite} from "@electric-sql/pglite";

let failures=0;
function check(id,ok,detail=""){console.log(`${ok?"PASS":"FAIL"} CAREER CONTENT: ${id}${detail?` — ${detail}`:""}`);if(!ok)failures++}
const read=p=>readFileSync(p,"utf8");

const snapshots=JSON.parse(read("registers/career/source-snapshots.v1.json"));
check("snapshot-registry-status",snapshots.status==="CANDIDATE_EVIDENCE_SNAPSHOTS");
check("snapshot-count",snapshots.sources?.length===6,String(snapshots.sources?.length??0));
for(const source of snapshots.sources??[]){
 const normalized={
  snapshot_version:source.snapshot_version,
  retrieved_at:source.retrieved_at,
  uri:source.uri,
  title:source.title,
  authority:source.authority,
  facts:source.facts,
 };
 const digest=createHash("sha256").update(JSON.stringify(normalized,null,2)+"\n").digest("hex");
 check("snapshot-sha256",digest===source.sha256,source.id);
}

const pg=new PGlite();await pg.waitReady;
for(const path of ["migrations/0004_career_youth_candidate.sql","migrations/0005_career_editorial_content_candidate.sql"])await pg.exec(read(path));

const count=async(table)=>Number((await pg.query(`select count(*)::int as n from ${table}`)).rows[0].n);
check("document-count",await count("career_editorial_document_candidate")===17,String(await count("career_editorial_document_candidate")));
check("source-count",await count("career_source_candidate")===6,String(await count("career_source_candidate")));

const docs=(await pg.query("select id,source_gate,human_gate,status from career_editorial_document_candidate order by id")).rows;
for(const doc of docs){
 const blockCount=Number((await pg.query("select count(*)::int as n from career_editorial_block_candidate where document_id=$1",[doc.id])).rows[0].n);
 check("document-minimum-blocks",blockCount>=4,`${doc.id}:${blockCount}`);
 check("human-review-not-bypassed",doc.human_gate==="HOLD"&&doc.status!=="ASSURED",doc.id);
}
const evidenceBlocks=(await pg.query("select document_id,block_id,source_refs_json from career_editorial_block_candidate where source_mode='evidence'")).rows;
check("evidence-blocks-exist",evidenceBlocks.length>0,String(evidenceBlocks.length));
for(const block of evidenceBlocks){
 const refs=Array.isArray(block.source_refs_json)?block.source_refs_json:[];
 check("evidence-block-has-source",refs.length>0,`${block.document_id}/${block.block_id}`);
 for(const id of refs){
  const found=Number((await pg.query("select count(*)::int as n from career_source_candidate where id=$1",[id])).rows[0].n);
  check("evidence-source-resolves",found===1,`${block.block_id}->${id}`);
 }
}
const staticWithRefs=Number((await pg.query("select count(*)::int as n from career_editorial_block_candidate where source_mode='static_nontechnical_copy' and jsonb_array_length(source_refs_json)>0")).rows[0].n);
check("static-copy-no-source-smuggling",staticWithRefs===0,String(staticWithRefs));
const sourcePromotions=Number((await pg.query("select count(*)::int as n from career_source_candidate where status='SOURCE_QUALIFIED'")).rows[0].n);
check("sources-not-self-qualified",sourcePromotions===0,String(sourcePromotions));
const factualPass=Number((await pg.query("select count(*)::int as n from career_editorial_document_candidate d where d.source_gate='PASS' and exists(select 1 from career_editorial_block_candidate b where b.document_id=d.id and b.source_mode='evidence')")).rows[0].n);
check("factual-docs-held",factualPass===0,String(factualPass));
const orphanDocs=Number((await pg.query("select count(*)::int as n from career_editorial_document_candidate d left join career_editorial_candidate e on e.id=d.editorial_id where e.id is null")).rows[0].n);
check("documents-linked-to-editorial-registry",orphanDocs===0,String(orphanDocs));

await pg.close();
if(failures){console.error(`BLOCKED: ${failures} content finding(s).`);process.exit(1)}
console.log("OK: 17 Career/Youth editorial documents are DB-materialized, source-bounded and human-held.");

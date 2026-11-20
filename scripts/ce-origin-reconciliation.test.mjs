import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
const root=new URL("../",import.meta.url);
const read=(path)=>JSON.parse(readFileSync(new URL(path,root),"utf8"));
const rec=read("registers/governance/ce-origin-reconciliation-20261120.v1.json");
const sources=read("registers/governance/ce-source-contracts-intake-20261120.v1.json");
const policies=read("registers/governance/ce-kernel-policies-intake-20261120.v1.json");
const blobSha=(b)=>createHash("sha1").update(Buffer.from("blob "+b.length+"\0")).update(b).digest("hex");
test("CE source main inventory is closed, status-counted and free of duplicates",()=>{
 assert.equal(rec.counts.total,176);assert.equal(rec.records.length,176);
 assert.equal(new Set(rec.records.map(x=>x.path)).size,176);
 const counts=rec.records.reduce((m,x)=>(m[x.status]=(m[x.status]||0)+1,m),{});
 for(const [state,n] of Object.entries(counts))assert.equal(rec.counts[state],n,state);
 assert.equal(rec.policy.overwriteConflicts,false);
 assert.equal(rec.policy.archiveIsAdmission,false);
});
test("all archived CE origin files retain source Git blob SHA and are never admitted",()=>{
 const archived=rec.records.filter(x=>x.status==="ARCHIVED_SOURCE_EXACT");
 assert.equal(archived.length,rec.counts.ARCHIVED_SOURCE_EXACT);
 assert.ok(archived.length>=40);
 for(const row of archived){
  assert.equal(row.archivePath,"intake/legacy-ce/"+row.path);
  const bytes=readFileSync(new URL(row.archivePath,root));
  assert.equal(bytes.length,row.bytes,row.path);
  assert.equal(blobSha(bytes),row.sourceBlobSha,row.path);
 }

 assert.equal(sources.records.length,20);assert.equal(policies.records.length,20);
 const intake=[...sources.records,...policies.records];
 for(const entry of intake){
  const row=rec.records.find(x=>x.path===entry.sourcePath);
  assert.ok(row,entry.sourcePath);
  assert.equal(row.status,"ARCHIVED_SOURCE_EXACT");
  assert.equal(row.sourceBlobSha,entry.sourceBlobSha);
  assert.equal(row.archivePath,entry.targetPath);
  const bytes=readFileSync(new URL(row.archivePath,root));
  assert.equal(bytes.length,row.bytes);
  assert.equal(blobSha(bytes),row.sourceBlobSha,entry.sourcePath);
  assert.equal(entry.admitted,false);
 }
 assert.equal(rec.counts.COLLISION_MANUAL_RECONCILIATION,6);
 assert.equal(rec.counts.PENDING_TRIAGE+rec.counts.ARCHIVED_SOURCE_EXACT+rec.counts.COLLISION_MANUAL_RECONCILIATION,rec.counts.total);
});

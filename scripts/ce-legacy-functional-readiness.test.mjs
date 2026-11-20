import { test } from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const root=new URL("../",import.meta.url);
const txt=(p)=>readFileSync(new URL(p,root),"utf8");
const manifest=JSON.parse(txt("registers/governance/ce-origin-reconciliation-20261120.v1.json"));
const gates=JSON.parse(txt("registers/governance/ce-legacy-functional-readiness-20261120.v1.json"));
const groups=gates.groups;
const all=groups.flatMap(g=>g.paths);
test("CE 38 legacy source artifacts are archived exactly once without functional admission",()=>{
 assert.equal(all.length,38);
 assert.equal(new Set(all).size,38);
 assert.equal(manifest.counts.total,176);
 assert.equal(manifest.counts.PENDING_TRIAGE,0);
 for(const path of all){
  const r=manifest.records.find(x=>x.path===path);
  assert.ok(r,path);
  assert.equal(r.status,"ARCHIVED_SOURCE_EXACT",path);
  assert.equal(r.archivePath,"intake/legacy-ce/"+path,path);
  assert.equal(r.admitted,false,path);
  assert.equal(r.preservationProof,"SOURCE_GIT_BLOB_EXACT",path);
 }
 assert.equal(gates.counts.filesFunctionallyAdmitted,0);
 assert.equal(gates.policy.archiveIsAdmission,false);
});
test("CE nine legacy validators that accept anything remain explicit HOLD and cannot be promoted",()=>{
 const risk=gates.criticalFindings.find(f=>f.code==="LEGACY_VALIDATOR_UNCONDITIONAL_ACCEPT");
 assert.ok(risk);
 assert.equal(risk.affectedPaths.length,9);
 for(const path of risk.affectedPaths){
  assert.match(txt("intake/legacy-ce/"+path),/def validate\([^\n]*:\s*\n[ \t]+return True, None\b/,path);
  assert.equal(manifest.records.find(x=>x.path===path).admitted,false);
 }
});
test("CE old migrations and malformed authorizations are archive-only, never executable",()=>{
 const db=groups.find(g=>g.id==="MIGRATIONS_SQL");
 assert.equal(db.paths.length,2);
 for(const path of db.paths){
  assert.match(txt("intake/legacy-ce/"+path),/using\s*\(true\)/i,path);
 }
 const approvals=groups.find(g=>g.id==="LEGACY_WO");
 assert.equal(approvals.paths.length,4);
 for(const path of approvals.paths){
  assert.throws(()=>JSON.parse(txt("intake/legacy-ce/"+path)),SyntaxError,path);
  assert.match(txt("intake/legacy-ce/"+path),/MCP_RELIABILITY_PADDING_FOR_SMALL_FILE_WORKAROUND/);
 }
 assert.match(txt(".vercelignore"),/^intake\/legacy-ce\/$/m);
 assert.equal(gates.policy.applyArchivedSql,false);
 assert.equal(gates.policy.runArchivedCode,false);
});

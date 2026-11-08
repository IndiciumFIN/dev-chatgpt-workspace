/**
 * WU-TRIB document-only integrity gate.
 * Reads repository-local metadata and templates. No app tests, network calls,
 * Supabase queries, CI secret access, fiscal assessment, or automatic sign-off.
 */
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {createHash} from "node:crypto";
import {resolve} from "node:path";
const root=process.cwd();
const relRoot="docs/homologacao/v1/";
const json=p=>JSON.parse(readFileSync(resolve(root,p),"utf8"));
const txt=p=>readFileSync(resolve(root,p),"utf8");
const registry=json(relRoot+"registro-documental.v1.json");
const normative=json(relRoot+"referencias-normativas.v1.json");
const keySet=new Set(normative.entries.map(n=>n.id));
const digest=createHash("sha256");
function fm(source){
 const m=/^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(source);
 assert.ok(m,"Missing or malformed YAML frontmatter");
 const o={};
 for(const line of m[1].split(/\r?\n/)){
  const index=line.indexOf(":");
  assert.ok(index>0,"Malformed frontmatter line");
  const k=line.slice(0,index).trim(),v=line.slice(index+1).trim();
  assert.ok(!Object.hasOwn(o,k),"Duplicate metadata key "+k);
  o[k]=v;
 }
 return o;
}
assert.equal(registry.schemaVersion,"wutrib.document.registry.v1.0.0");
assert.equal(registry.recordState,"DRAFT");
assert.equal(registry.inventory.requiredTemplates,50);
assert.equal(registry.inventory.templates.length,50);
assert.equal(registry.inventory.governanceDocs.length,4);
assert.equal(registry.documentaryCoverage.approvedTemplates,0);
assert.equal(registry.documentaryCoverage.evaluatedHumanSignoffs,0);
assert.equal(registry.documentaryCoverage.applicableDocsApproved,0);
assert.ok(registry.disclaimer.includes("not compliance"));
assert.ok(registry.inventory.legacySOT.length>=14);
assert.ok(registry.inventory.legacyGitPaths.length>=13);
const ids=new Set(),paths=new Set(),all=[];
function register(e){
 const id=e.id||e.documentId;
 assert.ok(id);
 assert.ok(!ids.has(id),"Duplicate document ID "+id);ids.add(id);
 assert.ok(!paths.has(e.path),"Duplicate path "+e.path);paths.add(e.path);
 assert.ok(e.path.startsWith(relRoot)&&e.path.endsWith(".md"));
 assert.ok(existsSync(resolve(root,e.path)),"Missing document "+e.path);
 const content=txt(e.path),meta=fm(content);
 assert.equal(meta.document_id,id);
 assert.equal(meta.version,e.version);
 assert.equal(meta.status,e.state);
 assert.ok(["TEMPLATE","DRAFT"].includes(meta.status));
 assert.equal(meta.wo,registry.canonicalWO);
 assert.equal(meta.approved_by,"NONE");
 assert.equal(meta.approved_at,"NONE");
 assert.equal(meta.classification,"INTERNAL");
 if(e.documentId){
  assert.equal(meta.document_type,"ARTIFACT_TEMPLATE");
  assert.equal(meta.gate,e.gate);
  assert.equal(meta.owner_role,e.ownerRole);
  assert.equal(meta.reviewer_role,e.reviewerRole);
  assert.ok(["PILOT_SYNTHETIC","ENTERPRISE_FISCAL","CONDITIONAL_DECISION"].some(scope=>e.mandatoryFor.includes(scope)));
  assert.ok(e.sourceRefs.length>0&&e.sourceRefs.every(source=>keySet.has(source)));
  assert.ok(e.minimumContent.length>=4);
  for(const part of e.minimumContent)assert.ok(content.includes(part),"Missing checklist item "+id+": "+part);
  assert.ok(content.includes("PENDENTE"));
  assert.ok(content.includes("HOLD")||content.includes("HOLD_HUMAN"));
  assert.equal(e.approvedBy,null);
  assert.equal(e.signedSha256,null);
  assert.ok(Array.isArray(e.evidenceRefs)&&e.evidenceRefs.length===0);
  assert.equal(e.contentCompletion,"NOT_STARTED");
 }
 const hash=createHash("sha256").update(content).digest("hex");
 digest.update(id+"|"+e.path+"|"+hash+"\n");
 all.push({id,hash,gate:e.gate||"GOVERNANCE"});
}
registry.inventory.governanceDocs.forEach(register);
registry.inventory.templates.forEach(register);
assert.equal(all.length,54);
assert.equal(ids.size,54);
for(const x of registry.inventory.legacyGitPaths){
 assert.ok(existsSync(resolve(root,x.path)),"Legacy file missing: "+x.path);
 assert.equal(x.action,"MAP_TO_CANONICAL_ARTIFACT_WITHOUT_OVERWRITING");
}
const normIds=new Set();
for(const n of normative.entries){
 assert.ok(!normIds.has(n.id));normIds.add(n.id);
 assert.equal(new URL(n.url).protocol,"https:");
 assert.equal(n.verifiedDocumentBody,false);
 assert.equal(n.legalApplicability,"TO_ASSESS");
 assert.ok(["REFERENCE_METADATA","HOLD_SOURCE_CHECK"].includes(n.status));
}
const byGate={};
for(const x of registry.inventory.templates)byGate[x.gate]=(byGate[x.gate]||0)+1;
for(const gate of registry.gates)assert.ok(byGate[gate]>0,"Gate without documentation: "+gate);
const output={
 check:"WUTRIB_DOCUMENTATION_INTEGRITY_ONLY",result:"PASS",
 registryVersion:registry.version,wo:registry.canonicalWO,
 templates:registry.inventory.templates.length,governance:registry.inventory.governanceDocs.length,
 allFilesVerified:all.length,legacyGitSources:registry.inventory.legacyGitPaths.length,
 legacySotSnapshots:registry.inventory.legacySOT.length,normativeReferences:normative.entries.length,
 byGate,documentBundleSha256:digest.digest("hex"),
 filledDocuments:0,approvedDocuments:0,
 note:"File/hash/schema coverage only. No functional, fiscal, UX, security, load tests, review or human homologation executed."
};
console.log("WUTRIB_DOCUMENTATION_CHECK="+JSON.stringify(output));

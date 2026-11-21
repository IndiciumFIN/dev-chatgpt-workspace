#!/usr/bin/env node
/** W2.6 clinical diff ledger: repository local, read-only, development-only. */
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {resolve} from "node:path";
import {pathToFileURL} from "node:url";
const base=new URL("../",import.meta.url);
const names={
 manifest:"registers/governance/ce-w26-grook-full-delta-20261121.v1.json",
 p1:"registers/governance/ce-w26-grook-p1-test-disposition-20261121.v1.json",
 s1:"registers/governance/ce-w26-grook-p0-security-s1-20261121.v1.json",
 s2:"registers/governance/ce-w26-grook-security-s2-20261121.v1.json",
 cross:"registers/governance/ce-w26-grook-78-tools-crosswalk-20261121.v1.json",
 clinical:"registers/governance/ce-w26-grook-clinical-c1-20261121.v1.json"
};
const read=p=>readFileSync(new URL(p,base),"utf8");
const j=p=>JSON.parse(read(p));
const gitsha=s=>{const b=Buffer.from(s,"utf8");return createHash("sha1").update("blob "+b.length+"\0").update(b).digest("hex");};
const issha=s=>typeof s==="string"&&/^[a-f0-9]{40}$/.test(s);
function guard(cond,msg){if(!cond)throw Error("CE_W26_CLINICAL_C1_HOLD:"+msg);}
const wanted=[
"src/components/tools/clinical-tool.tsx",
"src/lib/contract.ts",
"src/lib/kernel-admit.test.ts",
"src/lib/kernel-admit.ts",
"src/lib/template-contract.ts"
].sort();
export function validateClinicalC1(d,m,p1,s1,s2,c,files=read){
 guard(d?.protocol==="CE.W2.6.G2.CLINICAL.C1.v1"&&d.task_issue===115&&d.parent_issue===106&&d.followup_catalog_issue===116&&d.phase==="DEVELOPMENT","identity/scope");
 guard(m?.counts?.divergent===48&&m.tree_truncated===false&&d.source?.commit===m.source.commit&&d.source?.tree===m.source.tree&&d.source?.branch===m.source.branch,"origin completeness");
 guard(issha(d.baseline?.commit)&&issha(d.baseline?.tree)&&d.baseline.branch==="main","baseline");
 guard(d.source_manifest===names.manifest&&JSON.stringify(d.prior_ledgers)===JSON.stringify([names.p1,names.s1,names.s2])&&d.crosswalk_path===names.cross,"evidence references");
 const n=d.counts;
 guard(n.total===48&&n.prior_dev_disposed===15&&n.new_dev_code_disposed===5&&n.total_dev_disposed===20&&
 n.holds===2&&n.other_pending===26&&n.total_unresolved===28&&n.security_unresolved===1&&n.clinical_unresolved===1&&
 n.runtime_unresolved===16&&n.ui_unresolved===10&&n.branches_sealed===0,"counts or fake SEALED");
 guard(d.new_decisions?.length===5&&d.previous_dev_dispositions?.length===15&&d.holds?.length===2&&d.other_pending_paths?.length===26,"coverage");
 guard(JSON.stringify(d.new_decisions.map(x=>x.path).sort())===JSON.stringify(wanted),"five file scope");
 const immutable=new Map(m.divergences.map(x=>[x.path,x]));
 const all=[...d.new_decisions,...d.previous_dev_dispositions,...d.holds,...d.other_pending_paths];
 guard(immutable.size===48&&all.length===48&&new Set(all.map(x=>x.path)).size===48&&all.every(x=>immutable.has(x.path)),"48/48 duplicate or missing paths");
 const old=[...p1.dispositions.map(x=>({path:x.path,issue:109,decision:x.decision,source_git_blob_sha:x.source_git_blob_sha,canonical_git_blob_sha:x.canonical_git_blob_sha})),
 ...s1.new_decisions.map(x=>({path:x.path,issue:111,decision:x.decision,source_git_blob_sha:x.source_git_blob_sha,canonical_git_blob_sha:x.canonical_git_blob_sha})),
 ...s2.new_decisions.map(x=>({path:x.path,issue:113,decision:x.decision,source_git_blob_sha:x.source_git_blob_sha,canonical_git_blob_sha:x.canonical_git_blob_sha}))];
 guard(old.length===15,"prior ledger count");
 for(const x of d.previous_dev_dispositions){
  const p=old.find(y=>y.path===x.path);
  guard(p&&x.issue===p.issue&&x.decision===p.decision&&x.source_git_blob_sha===p.source_git_blob_sha&&x.canonical_git_blob_sha===p.canonical_git_blob_sha,"earlier proof mutation");
 }
 for(const x of d.new_decisions){
  const orig=immutable.get(x.path);
  guard(orig.risk_preliminary==="P0_CLINICAL"&&x.risk==="P0_CLINICAL"&&x.decision==="SUPERSEDED_WITH_PROOF"&&
  x.evidence_status==="SEMANTICALLY_DISPOSED_DEV_CODE_ONLY"&&x.clinical_approval===false&&x.rights_state==="HOLD","false clinical approval");
  guard(x.source_git_blob_sha===orig.source_git_blob_sha&&x.canonical_git_blob_sha===orig.main_git_blob_sha,"new blob mapping");
  guard(typeof x.reason==="string"&&x.reason.length>100&&typeof x.residual==="string"&&x.residual.length>75&&
  Array.isArray(x.dependencies)&&x.dependencies.length>=2&&Array.isArray(x.tests)&&x.tests.length>=1&&x.rollback.includes("PR"),"missing justification");
  const current=files(x.path);
  guard(gitsha(current)===x.canonical_git_blob_sha,"current file drift: "+x.path);
  guard(current.includes(x.new_marker)&&!current.includes(x.old_marker),"legacy condition restored: "+x.path);
 }
 const issuer=d.holds.find(x=>x.path==="src/lib/auth/preview.ts");
 guard(issuer?.decision==="HOLD_ISSUER_ROTATION_AND_HISTORY_SCAN"&&issuer.origin_issue===113&&
 issuer.security_incident_open===true&&issuer.release_allowed===false&&
 issuer.source_git_blob_sha===s2.hold_issuer.source_git_blob_sha&&issuer.canonical_git_blob_sha===s2.hold_issuer.canonical_git_blob_sha,"issuer hold displaced");
 const clin=d.holds.find(x=>x.path==="src/lib/contract-index.generated.ts");
 const orig=immutable.get(clin?.path);
 guard(clin?.decision==="HOLD_CONTRACT_COMPLETENESS_AND_RIGHTS"&&clin?.risk==="P0_CLINICAL"&&
 clin.source_git_blob_sha===orig.source_git_blob_sha&&clin.canonical_git_blob_sha===orig.main_git_blob_sha&&
 clin.crosswalk_path===names.cross&&clin.crosswalk_issue===116&&clin.release_allowed===false&&clin.clinical_approval===false,"catalog HOLD displaced");
 guard(gitsha(files(clin.path))===clin.canonical_git_blob_sha,"generated code drift");
 guard(c.protocol==="CE.W2.6.G2.C1.TOOLS_CROSSWALK.v1"&&c.source.commit===d.source.commit&&
 c.canonical.commit===d.baseline.commit&&c.source.blob===clin.source_git_blob_sha&&c.canonical.generated_blob===clin.canonical_git_blob_sha,"catalog provenance");
 const cc=c.counts;
 guard(cc.historical_tools===83&&cc.main_published_tools===5&&cc.common===5&&cc.old_only===78&&
 cc.candidate_not_indexed===2&&cc.potential_out_of_scope===4&&cc.unmapped===72&&cc.new_only===0&&
 c.historical_only?.length===78&&c.main_indexed?.length===5,"catalog count drift");
 guard(new Set(c.historical_only.map(x=>x.id)).size===78&&new Set(c.main_indexed.map(x=>x.id)).size===5&&
 c.historical_only.every(x=>!c.main_indexed.some(y=>y.id===x.id)),"catalog missing/duplicate ID");
 guard(c.release?.clinical_go===false&&c.release?.branch_sealed===false&&c.release?.regulatory_classification==="NOT_DETERMINED","falsely promoted catalog");
 for(const x of d.other_pending_paths){
  const old=immutable.get(x.path);
  guard(x.decision==="PENDING_SEMANTIC"&&x.risk===old.risk_preliminary&&x.source_git_blob_sha===old.source_git_blob_sha&&x.baseline_git_blob_sha===old.main_git_blob_sha,"pending prematurely closed");
 }
 const norms=d.normative_sources;
 guard(Array.isArray(norms)&&norms.length===2&&norms.some(x=>x.identifier==="Resolução Cofen 736/2024"&&x.clinical_clearance===false&&x.url.includes("cofen.gov.br"))&&
 norms.some(x=>x.identifier.includes("RDC 657/2022")&&x.clinical_clearance===false&&x.status.includes("UNDETERMINED")),"normative source/approval");
 const release=d.release;
 guard(release?.owner_approval==="NOT_REQUESTED_DEFERRED"&&Object.entries(release).filter(([k])=>k!=="owner_approval").every(([,v])=>v===false),"fake release");
 guard(d.testing?.dedicated_kernel_test_required_in_ci===true&&d.testing?.postmerge_verify_required===true&&
 d.testing?.baseline_verify?.sha===d.baseline.commit&&d.testing?.baseline_verify?.conclusion==="success","CI trace");
 return {phase:"DEV_ONLY",prior_disposed:15,new_disposed:5,cumulative_disposed:20,unresolved:28,holds:2,catalog_old_only:78,branches_sealed:0};
}
export function verify(){return validateClinicalC1(j(names.clinical),j(names.manifest),j(names.p1),j(names.s1),j(names.s2),j(names.cross));}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url)
 try{console.log(JSON.stringify(verify()));}catch(e){console.error(String(e?.message||e));process.exitCode=2;}

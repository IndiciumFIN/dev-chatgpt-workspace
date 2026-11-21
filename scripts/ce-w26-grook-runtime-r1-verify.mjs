#!/usr/bin/env node
/** W2.6 runtime R1: read-only ledger, 48 exact Git blobs, no false releases. */
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {resolve} from "node:path";
import {pathToFileURL} from "node:url";
const root=new URL("../",import.meta.url);
const paths={
 m:"registers/governance/ce-w26-grook-full-delta-20261121.v1.json",
 prior:"registers/governance/ce-w26-grook-clinical-c1-20261121.v1.json",
 now:"registers/governance/ce-w26-grook-runtime-r1-20261121.v1.json"
};
const read=p=>readFileSync(new URL(p,root));
const json=p=>JSON.parse(read(p).toString("utf8"));
const sha=b=>createHash("sha1").update(Buffer.from("blob "+b.length+"\0")).update(b).digest("hex");
function guard(ok,msg){if(!ok)throw Error("CE_W26_RUNTIME_R1_HOLD:"+msg);}
const expectedRuntime=[
"package-lock.json","package.json","public/sitemap.xml","scripts/alias-hook.mjs","scripts/grok-pwa-plugin.test.mjs",
"scripts/grok-pwa-shared.mjs","scripts/migrate.mjs","scripts/migration-plan.test.mjs","src/lib/header-i18n.ts",
"src/lib/locale-registry.ts","src/lib/seo.ts","src/lib/template-catalog.ts","src/router.tsx","src/routeTree.gen.ts",
"vercel.json","vite.config.ts"
].sort();
const expectedHolds=["vercel.json","vite.config.ts"].sort();
export function validateRuntimeR1(d,m,p,files=read){
 guard(d?.protocol==="CE.W2.6.G2.RUNTIME.R1.v1"&&d.task_issue===118&&d.parent_issue===106,"identifier");
 guard(d.source?.commit===m.source.commit&&d.source?.tree===m.source.tree&&d.baseline?.branch==="main"&&
 d.baseline?.commit==="f49496b050b77c366d7614a717fdf29f97d47346"&&m?.counts?.divergent===48&&m.tree_truncated===false,"source");
 guard(d.source_manifest===paths.m&&d.previous_ledger===paths.prior,"source paths");
 const n=d.counts;
 guard(n.total===48&&n.prior_dev_disposed===20&&n.new_dev_disposed===14&&n.total_dev_disposed===34&&
 n.prior_holds===2&&n.new_holds===2&&n.total_holds===4&&n.other_pending===10&&n.total_unresolved===14&&
 n.runtime_unresolved===2&&n.ui_unresolved===10&&n.clinical_unresolved===1&&n.security_unresolved===1&&n.branches_sealed===0,"counts");
 guard(d.new_decisions?.length===14&&d.new_holds?.length===2&&d.prior_dispositions?.length===20&&
 d.prior_holds?.length===2&&d.other_pending_paths?.length===10,"group sizes");
 guard(JSON.stringify([...d.new_decisions,...d.new_holds].map(x=>x.path).sort())===JSON.stringify(expectedRuntime),"runtime scope");
 guard(JSON.stringify(d.new_holds.map(x=>x.path).sort())===JSON.stringify(expectedHolds),"required Vercel holds");
 guard(JSON.stringify(d.other_pending_paths.map(x=>x.path).sort())===JSON.stringify(p.other_pending_paths.filter(x=>x.risk==="P1_UI").map(x=>x.path).sort()),"pending UI preserved");
 const old=[...p.previous_dev_dispositions,...p.new_decisions];
 const historical=new Map(m.divergences.map(x=>[x.path,x]));
 const all=[...d.new_decisions,...d.new_holds,...d.prior_dispositions,...d.prior_holds,...d.other_pending_paths];
 guard(historical.size===48&&all.length===48&&new Set(all.map(x=>x.path)).size===48&&all.every(x=>historical.has(x.path)),"48/48 source preservation");
 for(const x of d.prior_dispositions){
  const y=old.find(z=>z.path===x.path);
  guard(y&&x.decision===y.decision&&x.source_git_blob_sha===y.source_git_blob_sha&&x.canonical_git_blob_sha===y.canonical_git_blob_sha,"prior dispositions mutated");
 }
 for(const x of d.prior_holds){
  const y=p.holds.find(z=>z.path===x.path);
  guard(y&&x.decision===y.decision&&x.source_git_blob_sha===y.source_git_blob_sha&&x.canonical_git_blob_sha===y.canonical_git_blob_sha&&x.release_allowed===false,"prior HOLD cleared");
 }
 for(const x of d.new_decisions){
  const y=historical.get(x.path);
  guard(x.risk==="P1_RUNTIME"&&y.risk_preliminary==="P1_RUNTIME"&&x.decision==="SUPERSEDED_WITH_PROOF"&&
  x.evidence_status==="DEV_CODE_ONLY"&&x.deployment_verified===false&&x.release_authorized===false,"runtime decision release misrepresented");
  guard(x.source_git_blob_sha===y.source_git_blob_sha&&x.canonical_git_blob_sha===y.main_git_blob_sha&&
  sha(files(x.path))===x.canonical_git_blob_sha,"code blob drift "+x.path);
  const content=files(x.path).toString("utf8");
  guard(content.includes(x.new_marker),"new invariant absent "+x.path);
  guard(x.path==="src/router.tsx"||x.path==="src/lib/template-catalog.ts"||x.path==="src/routeTree.gen.ts"||
  !content.includes(x.old_marker),"legacy unsafe mechanism still present "+x.path);
  guard(x.reason?.length>85&&x.residual?.length>80&&x.scope_limit==="CODE_SEMANTICS_ONLY_NO_DEPLOY_OR_REGULATORY_ATTESTATION","unsupported proof");
 }
 for(const x of d.new_holds){
  const y=historical.get(x.path);
  guard(y.risk_preliminary==="P1_RUNTIME"&&x.decision.startsWith("HOLD_")&&x.release_authorized===false&&
  x.deployment_verified===false&&x.external_issue===96&&x.requested_evidence?.length>75,"Vercel preview prematurely cleared");
  guard(x.source_git_blob_sha===y.source_git_blob_sha&&x.canonical_git_blob_sha===y.main_git_blob_sha&&
  sha(files(x.path))===x.canonical_git_blob_sha,"Vercel config drift");
 }
 for(const x of d.other_pending_paths){
  const y=historical.get(x.path);
  guard(x.risk==="P1_UI"&&x.decision==="PENDING_SEMANTIC"&&x.baseline_git_blob_sha===y.main_git_blob_sha,"remaining UI prematurely cleared");
 }
 const release=d.release;
 guard(release?.owner_approval==="NOT_REQUESTED_DEFERRED"&&Object.entries(release).filter(([k])=>k!=="owner_approval").every(([,v])=>v===false),"false release clearance");
 guard(d.normative_sources?.length===2&&d.normative_sources.every(x=>x.release_clearance===false)&&
 d.testing?.postmerge_verify_required===true&&d.testing?.adversarial_migration_test_required===true&&d.testing?.baseline_sha===d.baseline.commit,"evidence context");
 return {scope:"DEV_CODE_ONLY",prior:20,new:14,disposed:34,holds:4,pending_ui:10,unresolved:14,sealed:0};
}
export function verify(){return validateRuntimeR1(json(paths.now),json(paths.m),json(paths.prior));}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url)
 try{console.log(JSON.stringify(verify()));}catch(err){console.error(String(err?.message||err));process.exitCode=2;}

#!/usr/bin/env node
/** CE W2.6 UI U1 — 48/48 immutable scope, 76 semantic color labels, six release HOLDs. */
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {pathToFileURL} from "node:url";
import {resolve} from "node:path";
const root=new URL("../",import.meta.url);
const paths={
 manifest:"registers/governance/ce-w26-grook-full-delta-20261121.v1.json",
 prev:"registers/governance/ce-w26-grook-runtime-r1-20261121.v1.json",
 u1:"registers/governance/ce-w26-grook-ui-u1-20261121.v1.json"
};
const read=p=>readFileSync(new URL(p,root));
const json=p=>JSON.parse(read(p).toString("utf8"));
const gitsha=b=>createHash("sha1").update("blob "+b.length+"\0").update(b).digest("hex");
const assert=(p,msg)=>{if(!p)throw Error("CE_W26_UI_U1_HOLD:"+msg);};
const UI=[
".gitignore","src/components/admin/registry.tsx","src/components/site/areas.tsx",
"src/components/site/related-content.tsx","src/components/site/shell.tsx","src/components/templates/contract-view.tsx",
"src/lib/ecosystem-audit.ts","src/lib/focus-color-i18n.ts","src/lib/sections.ts","src/styles.css"
].sort();
export function validateUIU1(d,m,p,files=read){
 assert(d?.protocol==="CE.W2.6.G2.UI.U1.v1"&&d.task_issue===120&&d.parent_issue===106,"identity");
 assert(d.source?.commit===m.source.commit&&d.source?.tree===m.source.tree&&d.source?.branch===m.source.branch&&
 d.baseline?.branch==="main"&&d.baseline?.commit==="f1492de899ba5d252a33bc13f9884ee2080b2307"&&
 m.counts?.divergent===48&&m.tree_truncated===false,"immutable origin");
 assert(d.source_manifest===paths.manifest&&d.previous_ledger===paths.prev,"ledger chain");
 const n=d.counts;
 assert(n.total===48&&n.prior_dev_disposed===34&&n.new_dev_disposed===8&&n.total_dev_disposed===42&&
 n.prior_holds===4&&n.new_holds===2&&n.total_holds===6&&n.unresolved===6&&
 n.ui_unresolved===2&&n.security_unresolved===2&&n.clinical_unresolved===1&&n.vercel_runtime_unresolved===2&&
 n.branches_sealed===0,"sum and no SEALED");
 assert(d.prior_dispositions?.length===34&&d.prior_holds?.length===4&&d.new_decisions?.length===8&&
 d.new_holds?.length===2&&d.remaining_pending_paths?.length===0,"ledger lengths");
 assert(JSON.stringify([...d.new_decisions,...d.new_holds].map(x=>x.path).sort())===JSON.stringify(UI),"UI exact scope");
 assert(JSON.stringify(d.new_holds.map(x=>x.path).sort())===JSON.stringify([".gitignore","src/styles.css"].sort()),"UI holds changed");
 const old=[...p.prior_dispositions,...p.new_decisions],oldHolds=[...p.prior_holds,...p.new_holds];
 const original=new Map(m.divergences.map(x=>[x.path,x]));
 const all=[...d.prior_dispositions,...d.prior_holds,...d.new_decisions,...d.new_holds];
 assert(original.size===48&&all.length===48&&new Set(all.map(x=>x.path)).size===48&&all.every(x=>original.has(x.path)),"source 48/48 collision or loss");
 for(const x of d.prior_dispositions){
  const y=old.find(z=>z.path===x.path);
  assert(y&&x.decision===y.decision&&x.source_git_blob_sha===y.source_git_blob_sha&&x.canonical_git_blob_sha===y.canonical_git_blob_sha,"old decisions silently changed");
 }
 for(const x of d.prior_holds){
  const y=oldHolds.find(z=>z.path===x.path);
  assert(y&&x.decision===y.decision&&x.source_git_blob_sha===y.source_git_blob_sha&&x.canonical_git_blob_sha===y.canonical_git_blob_sha&&
  x.release_authorized===false,"historical HOLD cleared");
 }
 for(const x of d.new_decisions){
  const orig=original.get(x.path);
  assert(orig.risk_preliminary==="P1_UI"&&x.decision==="SUPERSEDED_WITH_PROOF"&&x.evidence_status==="DEV_CODE_ONLY"&&
  x.risk==="P1_UI"&&x.visual_approval===false&&x.clinical_approval===false&&x.release_authorized===false,"UI fake acceptance");
  assert(x.source_git_blob_sha===orig.source_git_blob_sha&&x.canonical_git_blob_sha===orig.main_git_blob_sha&&
  gitsha(files(x.path))===x.canonical_git_blob_sha,"UI code source mismatch "+x.path);
  const content=files(x.path).toString("utf8");
  assert(content.includes(x.new_marker),"UI behavior marker missing "+x.path);
  if(x.path!=="src/lib/sections.ts")assert(!content.includes(x.old_marker),"unsafe UI old behavior remains "+x.path);
  assert(x.reason?.length>75&&x.residual?.length>75,"UI reason/residual insufficient");
 }
 for(const x of d.new_holds){
  const orig=original.get(x.path);
  assert(orig.risk_preliminary==="P1_UI"&&x.decision.startsWith("HOLD_")&&
  x.release_authorized===false&&x.visual_approval===false&&x.requested_evidence?.length>70,"UI HOLD fake closure");
  assert(x.source_git_blob_sha===orig.source_git_blob_sha&&x.canonical_git_blob_sha===orig.main_git_blob_sha&&
  gitsha(files(x.path))===x.canonical_git_blob_sha,"UI HOLD diff not pinned "+x.path);
 }
 const c=d.focus_color_cross_proof;
 assert(c?.source_git_blob_sha===original.get("src/lib/focus-color-i18n.ts").source_git_blob_sha&&
 c.current_register==="registers/i18n/focus-color-locale-register.v1.json"&&
 c.labels_exactly_matching===76&&c.labels_differing===0&&c.locale_count===19&&c.translation_approved===false,"color label trace");
 const labelFile=files(c.current_register);
 assert(gitsha(labelFile)===c.current_register_git_blob_sha,"focus color registered data drift");
 const reg=JSON.parse(labelFile.toString("utf8"));
 assert(Object.keys(reg.colors).length===19&&
 JSON.stringify(reg.semantics)===JSON.stringify(["yellow","lime","cyan","magenta"])&&
 Object.values(reg.colors).every(v=>Array.isArray(v)&&v.length===4&&v.every(t=>typeof t==="string"&&t.length>0)),"19x4 semantics incomplete");
 assert(d.css_delta?.added_lines===25&&d.css_delta?.removed_lines===0&&d.css_delta?.visual_review==="HOLD","CSS visual approval false");
 const css=files("src/styles.css").toString("utf8");
 assert(css.split("\n").length===3019&&css.includes(".header-utility .focus-dot { width: 44px;")&&css.includes("[dir=\"rtl\"] .header-utility .lang-menu"),"CSS a11y markers changed");
 const ignore=files(".gitignore").toString("utf8");
 assert(ignore.includes("!.grok/app-env.json")&&ignore.includes("*.pem"),"ignore exception not audited");
 const rel=d.release;
 assert(rel?.owner_approval==="NOT_REQUESTED_DEFERRED"&&Object.entries(rel).filter(([k])=>k!=="owner_approval").every(([,v])=>v===false),"false release state");
 assert(d.testing?.postmerge_verify_required===true&&d.testing?.area_access_regression_required===true&&d.testing?.baseline_sha===d.baseline.commit,"regression missing");
 return {phase:"DEV_CODE_ONLY",disposed:42,remaining:6,holds:6,ui_release_approved:false,branches_sealed:0};
}
export function verify(){return validateUIU1(json(paths.u1),json(paths.manifest),json(paths.prev));}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url)
 try{console.log(JSON.stringify(verify()));}catch(e){console.error(String(e?.message||e));process.exitCode=2;}

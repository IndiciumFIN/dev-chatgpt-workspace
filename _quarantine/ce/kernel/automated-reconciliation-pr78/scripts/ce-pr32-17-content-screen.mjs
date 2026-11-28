#!/usr/bin/env node
/** CE PR32: exact 17-file historical divergence content audit.
 * Reads pinned, already-public Git blobs only. Never executes historical code,
 * fetches external sources or promotes clinical/semantic decisions.
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const shas=/^[0-9a-f]{40}$/;
const git=(args,opts={})=>execFileSync("git",args,{cwd:root,maxBuffer:40*1024*1024,...opts});
const readBlob=sha=>{
  if(!shas.test(sha)) throw Error("INVALID_BLOB_SHA");
  const buffer=git(["cat-file","blob",sha]);
  const digest=createHash("sha1").update(Buffer.from("blob "+buffer.length+"\0")).update(buffer).digest("hex");
  if(digest!==sha)throw Error("GIT_BLOB_SHA_MISMATCH");
  return buffer;
};
const hash256=b=>createHash("sha256").update(b).digest("hex");
const same=(x,y)=>Buffer.compare(x,y)===0;
const raw=buf=>buf.toString("utf8");
const unique=(arr)=>[...new Set(arr)].sort();
const idSet=source=>unique([...source.matchAll(/"id"\s*:\s*"([^"]+)"/g)].map(x=>x[1]));
const config={
  "registers/canonical/route-contracts.v1.json":["P1","ROUTE_REGISTRY_SUPERSET"],
  "registers/canonical/surface-contracts.v2.json":["P0","SURFACE_BINDINGS_CHANGED"],
  "scripts/header-entry.test.mjs":["P0","AUTHORIZATION_TEST_EVOLVED"],
  "scripts/test-locale-registry.mjs":["P1","LOCALE_CONTRACT_TEST_EVOLVED"],
  "src/components/site/shell.tsx":["P0","ACCOUNT_SLOT_AND_A11Y_REVIEW"],
  "src/lib/contract-index.generated.ts":["P0","GENERATED_CLINICAL_IDS_REVIEW"],
  "src/lib/header-i18n.ts":["P1","HEADER_TRANSLATION_SCOPE"],
  "src/lib/locale-registry.ts":["P1","LOCALE_REGISTRY_SCOPE"],
  "src/lib/vila-assets.ts":["P1","VILA_ASSET_IMPORT_RELOCATION"],
  "src/lib/vila-canonical.ts":["P2","GIT_MODE_ONLY_IDENTICAL_BYTES"],
  "src/routeTree.gen.ts":["P1","GENERATED_ROUTE_TREE_EVOLUTION"],
  "src/routes/blog.$slug.tsx":["P0","EDITORIAL_PREVIEW_GATING"],
  "src/routes/kids.$section.tsx":["P0","VILA_SECTION_ROUTE_WIRING"],
  "src/routes/kids.index.tsx":["P0","VILA_HOME_ROUTE_WIRING"],
  "src/routes/kids.tsx":["P2","ROUTER_OUTLET_WRAPPER_CHANGE"],
  "src/routes/login.tsx":["P0","AUTHENTICATION_ROUTE_AND_SESSION_GATING"],
  "src/routes/viladocuidado.tsx":["P1","VILA_PAGE_IMPORT_RELOCATION"],
};
export function staticDecision(path,source,main,sourceMode,mainMode){
 const info=config[path];
 if(!info) throw Error("UNREGISTERED_DIVERGENCE_PATH: "+path);
 const [priority,family]=info;
 const src=raw(source),dst=raw(main);
 const flags={same_bytes:same(source,main),mode_changed:sourceMode!==mainMode};
 const findings=[];
 if(path==="registers/canonical/route-contracts.v1.json"){
   const a=JSON.parse(src),b=JSON.parse(dst);
   const ak=Object.keys(a.routes||{}),bk=Object.keys(b.routes||{});
   const missing=ak.filter(x=>!Object.hasOwn(b.routes,x));
   const changed=ak.filter(x=>Object.hasOwn(b.routes,x)&&JSON.stringify(a.routes[x])!==JSON.stringify(b.routes[x]));
   findings.push({rule:"route_contracts",source:ak.length,main:bk.length,source_missing:missing,source_changed:changed,
      structural_superset_verified:missing.length===0&&changed.length===0});
 }else if(path==="registers/canonical/surface-contracts.v2.json"){
   const a=JSON.parse(src),b=JSON.parse(dst);
   const keys=Object.keys(a.entries||{});
   const missing=keys.filter(x=>!Object.hasOwn(b.entries,x));
   const changed=keys.filter(x=>Object.hasOwn(b.entries,x)&&JSON.stringify(a.entries[x])!==JSON.stringify(b.entries[x]));
   findings.push({rule:"surface_contracts",source:keys.length,main:Object.keys(b.entries||{}).length,source_missing:missing,source_changed:changed});
 }else if(path==="src/lib/contract-index.generated.ts"){
   const a=idSet(src),b=idSet(dst);
   findings.push({rule:"generated_ids",source:a.length,main:b.length,missing_in_main:a.filter(x=>!b.includes(x)),added_in_main_count:b.filter(x=>!a.includes(x)).length});
 }else if(path==="src/lib/locale-registry.ts"){
   findings.push({rule:"locale_regression_guard",source_missing:(src.match(/"interfaceDictionary": "missing"/g)||[]).length,
     main_header_only:(dst.match(/"interfaceDictionary": "header_only"/g)||[]).length,
     main_interface_ready:(dst.match(/"interfaceDictionary": "interface_ready"/g)||[]).length});
 }else if(path==="src/lib/vila-canonical.ts"){
   findings.push({rule:"mode_only",bytes_equal:flags.same_bytes,source_mode:sourceMode,main_mode:mainMode});
 }else if(path==="src/routes/kids.$section.tsx"||path==="src/routes/kids.index.tsx"){
   findings.push({rule:"vila_hub_route",historic_uses_vila_hub:src.includes("<VilaHub"),
     main_uses_vila_hub:dst.includes("<VilaHub"),main_uses_placeholder_hero:dst.includes("<PageHero")});
 }else if(path==="src/routes/blog.$slug.tsx"){
   findings.push({rule:"editorial_preview",historic_preview_opt_in:src.includes("VITE_CURIOSIDADES_MEM_PREVIEW"),main_preview_opt_in:dst.includes("VITE_CURIOSIDADES_MEM_PREVIEW")});
 }else if(path==="src/routes/login.tsx"){
   findings.push({rule:"auth_flow",main_has_auth_enabled_gate:dst.includes("authEnabled ?"),main_has_signin_gate:dst.includes("<SignInGate"),historic_preserves_origin_param:src.includes("ENTRADA_ROTULOS")});
 }else if(path==="src/components/site/shell.tsx"){
   findings.push({rule:"account_slot",main_has_account_slot:dst.includes("<AccountSlot"),historic_has_account_slot:src.includes("<AccountSlot")});
 }
 return {priority,family,...flags,findings,semantic_decision:"HOLD_INDEPENDENT_REVIEW",auto_merge:false};
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const diagPath=resolve(root,"audit-evidence/ce-live-reconciliation/pr32-baseline-diagnostic.json");
  const diag=JSON.parse(readFileSync(diagPath,"utf8"));
  if(diag.protocol!=="CE.CROSS.PR32.BASELINE_DIAGNOSTIC.v1"||diag.pr_number!==32||diag.decision!=="BASELINE_DRIFT_EXPLAINS_REST_COUNT_GAP_NOT_MISSING_FILES")throw Error("PR32_DIAGNOSTIC_NOT_READY");
  if(diag.comparison.historicalOnlyCount!==486||diag.historical_only_vs_current_main_presence.EXACT!==469||
     diag.historical_only_vs_current_main_presence.PRESENT_DIFFERENT!==17||
     diag.historical_only_review_required.length!==17)throw Error("PR32_COHORT_CHANGED_NEEDS_REVIEW");
  const main=git(["rev-parse","refs/remotes/origin/main"],{encoding:"utf8"}).trim();
  const branch=git(["rev-parse","refs/remotes/origin/canonical/local-20261101"],{encoding:"utf8"}).trim();
  if(main!==diag.live_main_sha||branch!==diag.head_pinned)throw Error("GIT_REFS_MOVED_SINCE_DIAGNOSTIC");
  const rows=[];
  for(const item of diag.historical_only_review_required){
    if(item.relation!=="PRESENT_DIFFERENT")throw Error("NOT_A_DIFF_FILE");
    const source=readBlob(item.source_git_blob_sha),target=readBlob(item.main_git_blob_sha);
    const check=staticDecision(item.path,source,target,item.source_mode,item.main_mode);
    rows.push({path:item.path,source_blob:item.source_git_blob_sha,main_blob:item.main_git_blob_sha,
      source_content_sha256:hash256(source),main_content_sha256:hash256(target),
      source_size:source.length,main_size:target.length,source_mode:item.source_mode,main_mode:item.main_mode,...check});
  }
  if(new Set(rows.map(x=>x.path)).size!==17||rows.length!==Object.keys(config).length)throw Error("SEMANTIC_COHORT_MISSING_OR_DUPLICATED");
  const presence={historical_only:486,exact_unchanged:469,existing_different:17,source_only_missing_main:0};
  const summary={total:17,bytes_identical:rows.filter(x=>x.same_bytes).length,mode_changed:rows.filter(x=>x.mode_changed).length,
    priorities:Object.fromEntries(["P0","P1","P2"].map(p=>[p,rows.filter(x=>x.priority===p).length])),
    structural_superset_routes:rows.find(x=>x.path==="registers/canonical/route-contracts.v1.json")?.findings[0].structural_superset_verified||false,
    semantic_decisions_final:0,merge_authorized:false,source_branch_sealed:false};
  const report={protocol:"CE.CROSS.PR32.SEMANTIC_SCREEN.v1",source_head:branch,main_head:main,
    diagnostic_sha256:diag.sha256,git_only:true,read_only:true,presence,summary,rows,
    cross_supabase_complete:false,cross_drive_complete:false,security_approval:false,clinical_release:false,
    decision:"HOLD_INDEPENDENT_SEMANTIC_REVIEW"};
  report.sha256=hash256(Buffer.from(JSON.stringify(report)));
  const out=resolve(root,"audit-evidence/ce-live-reconciliation/pr32-17-content-screen.json");
  mkdirSync(dirname(out),{recursive:true});writeFileSync(out,JSON.stringify(report,null,2)+"\n");
  console.log("PR32_17_CONTENT_SCREEN",JSON.stringify({sha256:report.sha256,...summary,
    findings:rows.filter(x=>x.findings.length).map(x=>({path:x.path,findings:x.findings}))}));
}

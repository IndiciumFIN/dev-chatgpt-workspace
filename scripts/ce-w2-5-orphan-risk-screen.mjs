import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
const root = new URL("../", import.meta.url);
const read = p => JSON.parse(readFileSync(new URL(p,root),"utf8"));
const indexPath = "registers/governance/ce-w2-4-orphan-full-file-index-20261120.v1.json";

export function classifyPath(path) {
 if (/(^|\/)(auth|oauth|security)(\/|\.|-)/i.test(path) || /(^|\/)(\.env|credentials?|secrets?)(\.|\/|$)/i.test(path)) return ["P0","AUTH_AND_SECRETS"];
 if (path.startsWith(".github/workflows/") || path.startsWith("migrations/") || path.includes("/opa/") ||
 path.includes("kernel") || path.includes("rls") || path.includes("policy-signature") || path.includes("migration-plan") ||
 path.startsWith("src/core/governance/") || path.startsWith("infra/") || path === "scripts/migrate.mjs") return ["P0","MIGRATIONS_GOVERNANCE_CI"];
 if (path.startsWith("docs/evidence/") || path.endsWith(".pdf") || /(^|\/)LICENSE(\.|$)/i.test(path)) return ["P0","NORMATIVE_LICENSE"];
 if (path==="package.json" || path==="package-lock.json" || path.startsWith("contracts/") ||
 path.startsWith("src/") || path.startsWith("scripts/") || path.startsWith("tests/") ||
 path.startsWith("registers/canonical/")) return ["P1","APPLICATION_CKO_TESTS"];
 return ["P2","STATIC_HISTORY_DOCS"];
}
export function screenOrphanRisk() {
 const index=read(indexPath);
 if (index.counts.branches !== 23 || index.counts.distinct_source_sha !== 22) throw Error("W2.4 census mismatch");
 const totals={P0:0,P1:0,P2:0},objects=new Map(),by_source=[];
 let all_rows=0,nonidentical=0,matching=0,canonical_only=0;
 for(const batch of index.batches) {
  const manifest=read(batch.path);
  for(const s of manifest.sources) {
   const counts={P0:0,P1:0,P2:0},by_area={};
   for (const item of s.rows) {
    all_rows++;
    const [path,relationship,sha]=item;
    if(relationship==="E") {matching++;continue;}
    if(relationship==="C") {canonical_only++;continue;}
    if(!["D","S","T"].includes(relationship)) throw Error("unknown tree relation "+relationship);
    const [priority,area]=classifyPath(path);
    nonidentical++;totals[priority]++;counts[priority]++;by_area[area]=(by_area[area]??0)+1;
    const key=JSON.stringify([path,sha,relationship==="T"?item[4]:""]);
    const existing=objects.get(key);
    if(existing)existing.occurrences++;else objects.set(key,{priority,area,occurrences:1});
   }
   by_source.push({source_sha:s.source_sha,branches:s.branches,needs_review:s.counts.D+s.counts.S+s.counts.T,priorities:counts,by_area});
  }
 }
 const shared_objects=[...objects.values()].reduce((n,v)=>n+(v.occurrences>1?1:0),0);
 const quick_start=[...by_source].sort((a,b)=>a.needs_review-b.needs_review).slice(0,8);
 return {protocol:"CE.CROSS.W2.5.RISK_SCREEN",
  inventory_index_git_blob_sha:"c68c54599d4b464be5dc3e701585288932c5da7f",
  original_baseline_sha:index.full_file_main_sha,
  counted_branches:by_source.reduce((s,x)=>s+x.branches.length,0),
  counted_unique_sources:by_source.length,
  all_file_rows:all_rows,exact_blob_occurrences:matching,canonical_only_occurrences:canonical_only,
  needs_semantic_review_occurrences:nonidentical,
  unique_path_blob_review_objects:objects.size,
  reused_path_blob_review_objects:shared_objects,
  priority_totals:totals,by_source,quick_start,
  final_semantic_decisions:0,admitted_runtime_components:0,
  cross_supabase_drive_complete:false,independent_review_complete:false,
  closure_status:"OPEN",no_revisit:false};
}
const direct = process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href;
if(direct) console.log(JSON.stringify(screenOrphanRisk()));

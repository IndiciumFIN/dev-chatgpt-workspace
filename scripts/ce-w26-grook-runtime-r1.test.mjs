import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {spawnSync} from "node:child_process";
import {fileURLToPath} from "node:url";
import {validateRuntimeR1,verify} from "./ce-w26-grook-runtime-r1-verify.mjs";
const root=new URL("../",import.meta.url);
const read=p=>readFileSync(new URL(p,root),"utf8");
const json=p=>JSON.parse(read(p));
const ledger=json("registers/governance/ce-w26-grook-runtime-r1-20261121.v1.json");
const manifest=json("registers/governance/ce-w26-grook-full-delta-20261121.v1.json");
const prior=json("registers/governance/ce-w26-grook-clinical-c1-20261121.v1.json");
const copy=v=>structuredClone(v);
const check=v=>validateRuntimeR1(v,manifest,prior);
test("R1 exact 48/48, 14 runtime code proofs, 4 HOLDs, 10 UI pending",()=>{
 assert.deepEqual(verify(),{scope:"DEV_CODE_ONLY",prior:20,new:14,disposed:34,holds:4,pending_ui:10,unresolved:14,sealed:0});
});
test("one false SHA or removal of old HOLD is rejected",()=>{
 const a=copy(ledger);a.new_decisions[0].canonical_git_blob_sha="f".repeat(40);
 assert.throws(()=>check(a),/code blob drift/);
 const b=copy(ledger);b.prior_holds[0].decision="CLEARED";
 assert.throws(()=>check(b),/prior HOLD cleared/);
 const c=copy(ledger);c.new_holds[1].decision="SUPERSEDED_WITH_PROOF";
 assert.throws(()=>check(c),/Vercel preview prematurely cleared/);
 const d=copy(ledger);d.release.production_deployment=true;
 assert.throws(()=>check(d),/false release clearance/);
});
test("migrations are explicit, not invoked by build or CI",()=>{
 const pkg=json("package.json");
 assert.equal(pkg.scripts.build.includes("migrate"),false);
 assert.equal(pkg.scripts["build:spa"],"npm run build");
 assert.equal(pkg.scripts["db:migrate"],"node scripts/migrate.mjs");
 const migrate=read("scripts/migrate.mjs");
 assert.match(migrate,/CE_DB_MIGRATION_APPROVED/);
 assert.match(migrate,/process\.env\.CI === "true" \|\| process\.env\.GITHUB_ACTIONS === "true"/);
 assert.match(migrate,/process\.argv\.slice\(2\)\.length === 1/);
 const trial=spawnSync(process.execPath,["scripts/migrate.mjs","--approved"],{
  cwd:fileURLToPath(root),encoding:"utf8",timeout:30000,
  env:{...process.env,GITHUB_ACTIONS:"true",CI:"true",CE_DB_MIGRATION_APPROVED:"true",DATABASE_URL:""}
 });
 assert.equal(trial.error,undefined,"safe subprocess failed to execute");
 assert.equal(trial.status,2,"CI migration must fail-closed");
 assert.match(trial.stderr,/HOLD_DB_MIGRATION_CI_FORBIDDEN/);
});
test("real dependency lock and installed root versions agree",()=>{
 const pkg=json("package.json"),lock=json("package-lock.json");
 assert.equal(lock.lockfileVersion,3);
 assert.equal(lock.packages[""].dependencies["better-auth"],pkg.dependencies["better-auth"]);
 assert.equal(lock.packages[""].dependencies.zod,pkg.dependencies.zod);
 assert.equal(lock.packages["node_modules/better-auth"].version,"1.7.15");
 assert.equal(lock.packages["node_modules/zod"].version,"4.6.7");
});
test("PWA duplicate metadata and CE brand regression use semantic rel and isolated fixture",()=>{
 const shared=read("scripts/grok-pwa-shared.mjs"),spec=read("scripts/grok-pwa-plugin.test.mjs");
 assert.match(shared,/function hasLinkRelation\(html, relation\)/);
 assert.match(shared,/value\.toLowerCase\(\)\.split\(\/\\s\+\/\)\.includes\(relation\)/);
 assert.match(shared,/hasLinkRelation\(next, "manifest"\)/);
 assert.match(shared,/hasLinkRelation\(next, "apple-touch-icon"\)/);
 assert.match(spec,/TEMPLATE_FIXTURE_ROOT/);
 assert.match(spec,/CE identity from site\.json outranks an unrelated preview host/);
});
test("4 partial existing and 15 header only, no fabricated language readiness",()=>{
 const locales=read("src/lib/locale-registry.ts");
 const fields=[...locales.matchAll(/"interfaceDictionary": "(header_only|partial_existing)"/g)].map(x=>x[1]);
 assert.equal(fields.length,19);
 assert.equal(fields.filter(x=>x==="partial_existing").length,4);
 assert.equal(fields.filter(x=>x==="header_only").length,15);
 assert.match(locales,/interfaceDictionary === "partial_existing"/);
 assert.match(read("src/lib/header-i18n.ts"),/item\.interfaceDictionary === "partial_existing"/);
 const seo=read("src/lib/seo.ts");
 assert.match(seo,/alternateLocales, canonicalLocale, routeEntry/);
 assert.doesNotMatch(seo,/const offered =/);
});
test("router generated 53 route imports with three newer imports; template catalog compatible",()=>{
 const rt=read("src/routeTree.gen.ts");
 const imported=[...rt.matchAll(/^import \{ Route as \w+ \} from '\.\/routes\/([^']+)'/gm)].map(x=>x[1]);
 assert.equal(imported.length,53);
 for(const name of ["central-comando","oficina-local","blog.index"])assert.ok(imported.includes(name),name);
 assert.match(read("src/router.tsx"),/routeIds\.some\(\(route\) => route\.file === "src\/routes\/index\.tsx"\)/);
 assert.match(read("src/lib/template-catalog.ts"),/export const templateCatalogo = templateCatalog\.map/);
});
test("external Vercel and Nitro remain unresolved despite code build",()=>{
 const vercel=json("vercel.json"),vite=read("vite.config.ts");
 assert.equal(vercel.framework,"tanstack-start");
 assert.equal(Object.hasOwn(vercel,"installCommand"),false);
 assert.match(vite,/copyPgliteRuntimeFiles\(process\.cwd\(\)\)/);
 assert.match(vite,/pglite\.data.*pglite\.wasm.*initdb\.wasm/);
 assert.deepEqual(ledger.new_holds.map(x=>x.path).sort(),["vercel.json","vite.config.ts"].sort());
});

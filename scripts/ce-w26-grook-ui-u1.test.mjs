import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {spawnSync} from "node:child_process";
import {fileURLToPath} from "node:url";
import {verify,validateUIU1} from "./ce-w26-grook-ui-u1-verify.mjs";
const root=new URL("../",import.meta.url);
const read=p=>readFileSync(new URL(p,root),"utf8");
const json=p=>JSON.parse(read(p));
const ledger=json("registers/governance/ce-w26-grook-ui-u1-20261121.v1.json");
const manifest=json("registers/governance/ce-w26-grook-full-delta-20261121.v1.json");
const previous=json("registers/governance/ce-w26-grook-runtime-r1-20261121.v1.json");
const copy=x=>structuredClone(x),check=x=>validateUIU1(x,manifest,previous);
test("UI U1 48/48 exact, 42 DEV code-level, six honest HOLDs",()=>{
 assert.deepEqual(verify(),{phase:"DEV_CODE_ONLY",disposed:42,remaining:6,holds:6,ui_release_approved:false,branches_sealed:0});
});
test("cannot fake visual acceptance, change previous OAuth/catalog/Vercel HOLDs or CSS HOLD",()=>{
 const a=copy(ledger);a.release.visual_approval=true;
 assert.throws(()=>check(a),/false release state/);
 const b=copy(ledger);b.prior_holds[0].decision="CLEARED";
 assert.throws(()=>check(b),/historical HOLD cleared/);
 const c=copy(ledger);c.new_holds[1].decision="SUPERSEDED_WITH_PROOF";
 assert.throws(()=>check(c),/UI HOLD fake closure/);
 const d=copy(ledger);d.counts.branches_sealed=1;
 assert.throws(()=>check(d),/sum and no SEALED/);
});
test("fail-closed UI access policy is tested against actual TS code",()=>{
 const source=read("src/components/site/areas.tsx");
 assert.match(source,/resolvedRole && user && resolvedRole\.userId === user\.id/);
 assert.match(source,/evaluateAreaAccess\(\{ allow, userId: user\?\.id \?\? null, role, isPending \}\)/);
 assert.doesNotMatch(source,/if \(!authEnabled && allow === "member"\) return/);
 const run=spawnSync(process.execPath,["--test","scripts/ce-area-access-policy.test.mjs"],{
   cwd:fileURLToPath(root),encoding:"utf8",timeout:90000,env:{...process.env,DATABASE_URL:"",VITE_AUTH_ENABLED:"false"},maxBuffer:1024*1024
 });
 assert.equal(run.error,undefined,String(run.error?.message));
 assert.equal(run.status,0,"actual area-access policy suite failed: "+String(run.stderr||run.stdout).slice(-1500));
});
test("page frames are sourced by page catalog rather than removed TemplateContract.frame",()=>{
 const adm=read("src/components/admin/registry.tsx");
 const view=read("src/components/templates/contract-view.tsx");
 const catalog=read("src/lib/template-catalog.ts");
 assert.match(adm,/templateCatalogo\.find\(\(item\) => item\.kind === kind\)\?\.frame/);
 assert.match(view,/\{row\.frame\}/);
 assert.match(catalog,/export const templateCatalogo = templateCatalog\.map/);
 assert.doesNotMatch(view,/\{contract\.frame\}/);
});
test("dynamic articles route directly; locale and color labels derive shared sources",()=>{
 const related=read("src/components/site/related-content.tsx");
 const shell=read("src/components/site/shell.tsx");
 const colors=read("src/lib/focus-color-i18n.ts");
 assert.match(related,/item\.to === "\/blog\/\$slug"/);
 assert.match(related,/to="\/blog\/\$slug"/);
 assert.match(shell,/selectableLocales\.map\(\(item\) =>/);
 assert.match(shell,/focusColorName\(chrome\.locale, color\.id\)/);
 assert.match(colors,/registers\/i18n\/focus-color-locale-register\.v1\.json/);
 const reg=json("registers/i18n/focus-color-locale-register.v1.json");
 assert.equal(Object.keys(reg.colors).length,19);
 assert.deepEqual(reg.semantics,["yellow","lime","cyan","magenta"]);
 assert.equal(Object.values(reg.colors).flat().length,76);
});
test("sections have canonical source and de-duplicate slug; node audit avoids vite router alias",()=>{
 const sections=read("src/lib/sections.ts"),audit=read("src/lib/ecosystem-audit.ts");
 assert.match(sections,/import \{ extraSections \} from "@\/lib\/institutional-sections"/);
 assert.match(sections,/if \(seen\.has\(section\.slug\)\) continue/);
 assert.match(sections,/for \(const section of \[\.\.\.coreSections, \.\.\.extraSections\(\)\]\)/);
 assert.match(audit,/import \{ localesWithInterface \} from "\.\/locale-registry\.ts"/);
 assert.doesNotMatch(audit,/import \{ languageLinks \} from "\.\/seo\.ts"/);
});
test("CSS and ignore exceptions are still explicit HOLDs, not silently removed",()=>{
 const css=read("src/styles.css"),gitignore=read(".gitignore");
 assert.match(css,/--chrome-utility: 44px/);
 assert.match(css,/\[dir="rtl"\] \.header-utility \.lang-menu/);
 assert.match(css,/\.header-utility \.focus-dot \{ width: 44px/);
 assert.match(gitignore,/!\.grok\/app-env\.json/);
 assert.deepEqual(ledger.new_holds.map(x=>x.path).sort(),[".gitignore","src/styles.css"].sort());
 assert.equal(ledger.focus_color_cross_proof.translation_approved,false);
});

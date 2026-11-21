import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {verifyVercelNitroConfig,validateVercelNitroConfig} from "./ce-vercel-nitro-config.mjs";
const root=new URL("../",import.meta.url);
const config=JSON.parse(readFileSync(new URL("vercel.json",root),"utf8"));
const vite=readFileSync(new URL("vite.config.ts",root),"utf8");
const pkg=JSON.parse(readFileSync(new URL("package.json",root),"utf8"));
test("V6-A06: TanStack Start + Nitro Vercel detection present; no deploy claim",()=>{
 const r=verifyVercelNitroConfig();
 assert.equal(r.state,"PASS_CONFIG_ONLY_NO_DEPLOY");
 assert.equal(r.framework,"tanstack-start");
 assert.equal(r.build_output_expected,".vercel/output");
 assert.equal(r.deploy_verified,false);
 assert.equal(r.production_release_authorized,false);
});
test("V6-A06: reject legacy static dist, null framework and unsupported output overrides",()=>{
 for(const bad of [{...config,framework:null},{...config,framework:"vite"},
   {...config,outputDirectory:"dist"},{...config,outputDirectory:".vercel/output/static"},
   {...config,buildCommand:"npm run build"},{...config,installCommand:"npm install --omit=dev"},
   {...config,builds:[{src:"package.json",use:"@vercel/static-build"}]}]){
  assert.throws(()=>validateVercelNitroConfig(bad,vite,pkg),/CE_VERCEL_PRESET_HOLD/);
 }
});
test("V6-A06: fail closed for disabled Nitro/vercel preset or lost runtime dependency",()=>{
 assert.throws(()=>validateVercelNitroConfig(config,vite.replace('preset: "vercel"','preset: "static"'),pkg),/Nitro Vercel preset/);
 assert.throws(()=>validateVercelNitroConfig(config,vite,{...pkg,dependencies:{...pkg.dependencies,nitro:undefined}}),/dependencies/);
});

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const config=JSON.parse(readFileSync(new URL("../vercel.json",import.meta.url),"utf8"));
const pkg=JSON.parse(readFileSync(new URL("../package.json",import.meta.url),"utf8"));
test("TanStack Start on Vercel uses native preset without competing output overrides",()=>{
 assert.equal(config.framework,"tanstack-start");
 for(const key of ["outputDirectory","buildCommand","installCommand"]){
  assert.ok(!Object.hasOwn(config,key),"Do not override Vercel TanStack/Nitro: "+key);
 }
 assert.ok(typeof pkg.scripts?.build==="string");
 assert.doesNotMatch(pkg.scripts.build,/db:migrate|supabase\s+db|migration/i);
});

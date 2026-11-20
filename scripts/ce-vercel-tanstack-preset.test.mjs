import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const config=JSON.parse(readFileSync(new URL("../vercel.json",import.meta.url),"utf8"));
test("Nitro SSR build must use the TanStack Start Vercel preset",()=>{
 assert.equal(config.framework,"tanstack-start");
 assert.equal(config.buildCommand,"npm run build");
 assert.ok(!Object.hasOwn(config,"outputDirectory"),
   "Use native Vercel Build Output API from Nitro, not a hardcoded dist");
 assert.doesNotMatch(config.buildCommand,/db:migrate|supabase\s+db|migration/i);
});

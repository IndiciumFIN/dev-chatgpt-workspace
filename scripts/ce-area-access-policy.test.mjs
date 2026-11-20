import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
const root = new URL("../", import.meta.url);
test("AreaGuard does not grant privileged UI merely because auth is disabled", () => {
 const source=readFileSync(new URL("src/components/site/areas.tsx",root),"utf8");
 assert.doesNotMatch(source,/if\s*\(!authEnabled\)\s*return\s*<>{children}<\/\s*>/);
 assert.match(source,/evaluateAreaAccess\(\{\s*allow,/);
 assert.match(source,/resolvedRole\?\.userId === user\?\.id/);
 assert.match(source,/setResolvedRole\(\{ userId, role: result\.role \}\)/);
 assert.match(source,/if \(outcome === "login"\) return <Navigate to="\/login" \/>/);
 assert.match(source,/if \(outcome === "member"\) return <Navigate to="\/assinante" \/>/);
});
test("area access decision table denies anonymous, missing and subscriber admin access", () => {
 const program = [
  'import { evaluateAreaAccess } from "./src/components/site/area-access-policy.ts";',
  'const cases = [',
  ' {allow:"admin",userId:null,role:null,isPending:false},',
  ' {allow:"admin",userId:"dev-user",role:null,isPending:false},',
  ' {allow:"admin",userId:"member-1",role:"subscriber",isPending:false},',
  ' {allow:"member",userId:"member-1",role:"subscriber",isPending:false},',
  ' {allow:"admin",userId:"admin-1",role:"admin",isPending:false},',
  ' {allow:"admin",userId:"admin-1",role:"admin",isPending:true},',
  ' {allow:"admin",userId:"dev-user",role:"admin",isPending:false},',
  '];',
  'console.log(JSON.stringify(cases.map(evaluateAreaAccess)));'
 ].join("\n");
 const res=execFileSync(process.execPath,["--experimental-strip-types","--input-type=module","-e",program],{cwd:new URL("../",import.meta.url),encoding:"utf8"});
 assert.deepEqual(JSON.parse(res.trim()),["login","login","member","allow","allow","loading","allow"]);
});
test("CI synthetic admin remains server guarded and isolated from remote DB", () => {
 const source=readFileSync(new URL("src/lib/source.functions.ts",root),"utf8");
 const verify=readFileSync(new URL("src/lib/auth/verify.server.ts",root),"utf8");
 assert.match(source,/if \(dbSource !== "pglite"\) return/);
 assert.match(source,/CE_ADMIN_E2E_FIXTURE === "true"/);
 assert.match(source,/GITHUB_ACTIONS === "true"/);
 assert.match(source,/!process\.env\.DATABASE_URL\?\.trim\(\)/);
 assert.match(source,/if \(rows\[0\]\?\.role !== "admin"\) throw new Error/);
 assert.match(verify,/!process\.env\.VERCEL/);
 assert.match(verify,/!databaseConfigured/);
});

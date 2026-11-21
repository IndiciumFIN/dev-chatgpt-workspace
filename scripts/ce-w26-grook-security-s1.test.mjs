import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {validateSecurityS1,verify} from "./ce-w26-grook-security-s1-verify.mjs";
import {authEnabledFromEnvValue,compareAuthInvariant} from "./check-auth-invariant.mjs";
import {assertDatabaseConfiguredForDeployment} from "./ce-db-deployment-guard.mjs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const orig=read("registers/governance/ce-w26-grook-full-delta-20261121.v1.json");
const prior=read("registers/governance/ce-w26-grook-p1-test-disposition-20261121.v1.json");
const ledger=read("registers/governance/ce-w26-grook-p0-security-s1-20261121.v1.json");
const cp=x=>structuredClone(x);
test("6 security code differences + 3 earlier tests + 39 open, no SEALED",()=>{
 assert.deepEqual(verify(),{validated:true,security_disposed:6,all_disposed:9,unresolved:39,branches_sealed:0});
});
test("SHA spoofing, duplicated and missing security rows fail closed",()=>{
 const a=cp(ledger);a.new_decisions[0].canonical_git_blob_sha="a".repeat(40);
 assert.throws(()=>validateSecurityS1(a,orig,prior),/blob mapping/);
 const b=cp(ledger);b.pending_paths[0].path=b.new_decisions[0].path;
 assert.throws(()=>validateSecurityS1(b,orig,prior),/duplicate\/missing/);
 const c=cp(ledger);c.pending_paths.pop();
 assert.throws(()=>validateSecurityS1(c,orig,prior),/48 rows/);
});
test("cannot forge issuer rotation, production readiness, branch close or approval",()=>{
 const a=cp(ledger);a.closure.historical_branch_dev_reconciled=true;
 assert.throws(()=>validateSecurityS1(a,orig,prior),/false release\/branch closure/);
 const b=cp(ledger);b.decision_evidence.secret_history_scanned=true;
 assert.throws(()=>validateSecurityS1(b,orig,prior),/false operational security evidence/);
 const c=cp(ledger);c.closure.secret_rotation_proven=true;
 assert.throws(()=>validateSecurityS1(c,orig,prior),/false release\/branch closure/);
});
test("authentication off without exact true and mismatch signals stay fail closed",()=>{
 for(const value of [undefined,null,"false","TRUE","1","",true])assert.equal(authEnabledFromEnvValue(value),false);
 assert.equal(authEnabledFromEnvValue("true"),true);
 assert.equal(compareAuthInvariant({devAuthEnabled:false,buildAuthEnabled:true}).status,"diverged");
 assert.equal(compareAuthInvariant({devAuthEnabled:null,buildAuthEnabled:false}).status,"indeterminate");
});
test("actual imported deployment guard denies Vercel with no real DB configured",()=>{
 for(const env of ["production","preview","development"])for(const value of [undefined,"","  "])
  assert.throws(()=>assertDatabaseConfiguredForDeployment({VERCEL_ENV:env,DATABASE_URL:value}),/CE_DB_DEPLOYMENT_CONNECTION_REQUIRED/);
 assert.throws(()=>assertDatabaseConfiguredForDeployment({VERCEL:"1",DATABASE_URL:""}),/CE_DB_DEPLOYMENT_CONNECTION_REQUIRED/);
 assert.doesNotThrow(()=>assertDatabaseConfiguredForDeployment({NODE_ENV:"development"}));
});
test("SSR identity fallback only in isolated dev, canonical fail-closed guard remains",()=>{
 const source=readFileSync(new URL("../src/lib/auth/verify.server.ts",import.meta.url),"utf8");
 for(const needle of ['process.env.NODE_ENV === "development"',"!process.env.VERCEL","!process.env.VERCEL_ENV","!databaseConfigured","if (!devFallbackAllowed)","throw new UnauthorizedError();"])
  assert.ok(source.includes(needle),"identity source no longer guards "+needle);
 const server=readFileSync(new URL("../src/lib/auth/server.ts",import.meta.url),"utf8");
 assert.ok(server.includes('const authDisabled = env("VITE_AUTH_ENABLED") !== "true";'));
 const db=readFileSync(new URL("../src/lib/db.ts",import.meta.url),"utf8");
 const a=db.indexOf("assertDatabaseConfiguredForDeployment(process.env);"),b=db.indexOf('return dbSource === "neon" ? createNeonSql() : createPgliteSql();');
 assert.ok(a>0&&b>a,"deployment guard must precede storage selection");
});

import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {validateSecurityS2,verify} from "./ce-w26-grook-security-s2-verify.mjs";
import {authEnabledFromEnvValue} from "./check-auth-invariant.mjs";
const raw=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const json=p=>JSON.parse(raw(p));
const root="registers/governance/";
const m=json(root+"ce-w26-grook-full-delta-20261121.v1.json");
const p1=json(root+"ce-w26-grook-p1-test-disposition-20261121.v1.json");
const s1=json(root+"ce-w26-grook-p0-security-s1-20261121.v1.json");
const d=json(root+"ce-w26-grook-security-s2-20261121.v1.json");
const cp=x=>structuredClone(x);
const check=x=>validateSecurityS2(x,m,p1,s1);
test("cumulative 48/48 evidence: 15 code decisions, issuer HOLD, 32 remaining",()=>{
 assert.deepEqual(verify(),{status:"PASS_DEV_CODE_ONLY",total:48,disposed:15,pending:33,issuer_hold:1,branches_sealed:0});
});
test("fabricated sha, missing row and prior ledger mutation fail closed",()=>{
 const a=cp(d);a.new_decisions[0].canonical_git_blob_sha="f".repeat(40);
 assert.throws(()=>check(a),/blob chain/);
 const b=cp(d);b.pending_paths.pop();
 assert.throws(()=>check(b),/48 objects/);
 const c=cp(d);c.prior_dispositions[0].decision="EXACT_IN_CANONICAL";
 assert.throws(()=>check(c),/previous disposition/);
});
test("unproven issuer revocation, E2E, seal and rights cannot be forged",()=>{
 const a=cp(d);a.evidence_gates.external_issuer_revocation_verified=true;
 assert.throws(()=>check(a),/false external/);
 const b=cp(d);b.hold_issuer.decision="SUPERSEDED_WITH_PROOF";
 assert.throws(()=>check(b),/issuer hold/);
 const c=cp(d);c.branch_closure.grook_sealed=true;
 assert.throws(()=>check(c),/false branch closure/);
 const e=cp(d);e.counts.branches_sealed=1;
 assert.throws(()=>check(e),/counts/);
});
test("Better Auth generic OAuth migration contract matches locked v1.7",()=>{
 const pkg=json("package.json");
 assert.equal(pkg.dependencies["better-auth"],"1.7.15");
 const client=raw("src/lib/auth/client.ts");
 const popup=raw("src/lib/auth/popup.server.ts");
 const providers=raw("src/lib/auth/providers.ts");
 assert.match(client,/authClient\.signIn\.social\(\{/);
 assert.match(popup,/auth\.api\.signInSocial\(\{/);
 assert.doesNotMatch(client,/signIn\.oauth2\(/);
 assert.doesNotMatch(popup,/signInWithOAuth2\(/);
 assert.match(providers,/\/api\/auth\/callback\/<providerId>/);
 assert.equal(authEnabledFromEnvValue(undefined),false);
});
test("first admin cannot be automatically promoted; synthetic fixture confined",()=>{
 const source=raw("src/lib/source.functions.ts");
 assert.match(source,/values \(\$\{context\.userId\}, 'subscriber'\)/);
 assert.doesNotMatch(source,/case when exists \(select 1 from member where role = 'admin'\)/);
 for(const guard of ['if (dbSource !== "pglite") return','CE_ADMIN_E2E_FIXTURE === "true"','GITHUB_ACTIONS === "true"','!process.env.DATABASE_URL?.trim()'])
  assert.ok(source.includes(guard),"isolated fixture gate absent: "+guard);
});
test("login auth-off panel cannot advertise direct restricted access",()=>{
 const page=raw("src/routes/login.tsx");
 assert.match(page,/role="status" aria-live="polite"/);
 assert.doesNotMatch(page,/Abrir a área do assinante/);
});
test("preview OAuth historical exposure remains explicit HOLD; current file no literal",()=>{
 const preview=raw("src/lib/auth/preview.ts");
 assert.match(preview,/PREVIEW_CLIENT_SECRET\s*=\s*process\.env\.GROK_PREVIEW_CLIENT_SECRET/);
 assert.doesNotMatch(preview,/PREVIEW_CLIENT_SECRET\s*=\s*["'][A-Za-z0-9_-]{16,}["']/);
 assert.equal(d.hold_issuer.operational_evidence,"NO_ISSUER_REVOCATION_RECEIPT");
});

test("rights-only successor is pinned; arbitrary mutation and first-admin regression remain denied",()=>{
 const path="src/lib/source.functions.ts";
 const current=raw(path);
 assert.doesNotThrow(()=>validateSecurityS2(d,m,p1,s1));
 for(const changed of [current+"\\n// unauthorized change",current.replace("values (${context.userId}, 'subscriber')","values (${context.userId}, 'admin')")])
  assert.throws(()=>validateSecurityS2(d,m,p1,s1,p=>p===path?changed:raw(p)),/canonical file changed/);
});

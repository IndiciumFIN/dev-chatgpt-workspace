import test from "node:test";
import assert from "node:assert/strict";
import {staticDecision} from "./ce-pr32-17-content-screen.mjs";
const b=s=>Buffer.from(s,"utf8");
test("route registry superset is structural evidence, never release approval",()=>{
 const a=JSON.stringify({routes:{a:{path:"/a"}}});
 const c=JSON.stringify({routes:{a:{path:"/a"},b:{path:"/b"}}});
 const r=staticDecision("registers/canonical/route-contracts.v1.json",b(a),b(c),"100644","100644");
 assert.equal(r.findings[0].structural_superset_verified,true);
 assert.equal(r.semantic_decision,"HOLD_INDEPENDENT_REVIEW");
 assert.equal(r.auto_merge,false);
});
test("route contract silent overwrite is independently identified",()=>{
 const r=staticDecision("registers/canonical/route-contracts.v1.json",b('{"routes":{"x":{"path":"/a"}}}'),b('{"routes":{"x":{"path":"/b"}}}'),"100644","100644");
 assert.equal(r.findings[0].structural_superset_verified,false);
 assert.deepEqual(r.findings[0].source_changed,["x"]);
});
test("same blob with mode changed is not falsely admitted",()=>{
 const a=b("export const a=1;");
 const r=staticDecision("src/lib/vila-canonical.ts",a,a,"100644","100755");
 assert.equal(r.same_bytes,true);assert.equal(r.mode_changed,true);
 assert.equal(r.semantic_decision,"HOLD_INDEPENDENT_REVIEW");
});
test("generated catalog detects source-only IDs and preserves hold",()=>{
 const r=staticDecision("src/lib/contract-index.generated.ts",b('{"id":"CE-TOOL-aldrete"}'),b('{"id":"CE-ROUTE-aldrete"}'),"100644","100644");
 assert.deepEqual(r.findings[0].missing_in_main,["CE-TOOL-aldrete"]);
 assert.equal(r.priority,"P0");
});
test("Vila route moves from live hub to placeholder: mandatory functional review",()=>{
 const r=staticDecision("src/routes/kids.index.tsx",b("return <VilaHub/>"),b("return <PageHero/>"),"100644","100755");
 assert.equal(r.findings[0].historic_uses_vila_hub,true);
 assert.equal(r.findings[0].main_uses_placeholder_hero,true);
 assert.equal(r.semantic_decision,"HOLD_INDEPENDENT_REVIEW");
});
test("auth difference never auto-merges",()=>{
 const r=staticDecision("src/routes/login.tsx",b("ENTRADA_ROTULOS"),b("authEnabled ? <SignInGate/> : null"),"100644","100644");
 assert.equal(r.priority,"P0");
 assert.equal(r.findings[0].main_has_signin_gate,true);
 assert.equal(r.auto_merge,false);
});
test("arbitrary files cannot enter the 17 without a classified path",()=>{
 assert.throws(()=>staticDecision("src/lib/auth/secret.ts",b("x"),b("y"),"100644","100644"),/UNREGISTERED/);
});

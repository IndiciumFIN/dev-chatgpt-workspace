import test from "node:test";
import assert from "node:assert/strict";
import {summarizeEslintReport} from "./ce-eslint-observation.mjs";
const mk=(errors,warnings,messages)=>({filePath:"/tmp/private/secret-path.ts",errorCount:errors,
 warningCount:warnings,fatalErrorCount:0,messages});
test("V6-A04: parse actual ESLint summary without publishing code or paths",()=>{
 const r=summarizeEslintReport([mk(1,1,[{ruleId:"react-hooks/rules-of-hooks",severity:2,message:"do not print"},
    {ruleId:"no-console",severity:1,message:"path"}])],1);
 assert.equal(r.state,"HOLD_LINT_ERRORS");
 assert.equal(r.errors,1);assert.equal(r.warnings,1);
 assert.equal(r.paths_exported,false);assert.equal(r.source_snippets_exported,false);
 assert.ok(!JSON.stringify(r).includes("secret-path"));
 assert.ok(!JSON.stringify(r).includes("do not print"));
});
test("V6-A04: zero errors is not automatic closure of outstanding warnings",()=>{
 const r=summarizeEslintReport([mk(0,2,[{ruleId:"react-refresh/only-export-components",severity:1}])],0);
 assert.equal(r.state,"PASS_LINT_ZERO_ERRORS");
 assert.equal(r.all_issues_fixed,false);
});
test("V6-A04: reject non-JSON, malformed or false-success lint outcomes",()=>{
 assert.throws(()=>summarizeEslintReport({},0),/JSON result/);
 assert.throws(()=>summarizeEslintReport([mk(2,0,[])],0),/exit status/);
 assert.throws(()=>summarizeEslintReport([mk(0,0,[])],1),/exit status/);
});

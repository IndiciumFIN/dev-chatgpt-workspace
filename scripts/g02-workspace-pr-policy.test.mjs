import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const text=readFileSync(new URL("../WORKSPACE.md",import.meta.url),"utf8");
test("Workspace policy acknowledges active G02 PR-only flow",()=>{
 assert.match(text,/## Regra operacional vigente \(20\/11\/2026\): main protegida e PR obrigatório/);
 assert.match(text,/branch temporária → commit com diff restrito → PR contra `main`/);
 assert.match(text,/GitHub Actions \*\*`verify`\*\*/);
 assert.match(text,/`MERGE_ELIGIBLE`/);
 assert.match(text,/sem bloqueios relevantes/);
 assert.match(text,/A existência de PR ou CI verde não autoriza release clínico/);
 assert.doesNotMatch(text,/## Regra operacional: nenhuma branch nova/);
});

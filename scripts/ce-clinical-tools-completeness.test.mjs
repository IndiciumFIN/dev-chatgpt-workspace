import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
test("clinical tools: real TypeScript engine, catalog and rights regressions", () => {
  const result = spawnSync(process.execPath, ["--experimental-strip-types","--import","./scripts/alias-hook.mjs","--test", "src/lib/tools/engine.test.ts","src/lib/tools/rights-boundary.test.ts","src/lib/tools/exames-laboratoriais.test.ts","src/lib/tools/clinical-completeness.test.ts","src/lib/tools/bridge.test.ts","src/lib/tools/write-sheet.test.ts"], {encoding:"utf8"});
  assert.equal(result.status, 0, [result.error?.message,result.stdout,result.stderr].filter(Boolean).join("\n"));
});

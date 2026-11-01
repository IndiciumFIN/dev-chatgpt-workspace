import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("a mesa lista M01 a M22 e a leitura não reaprova", () => {
  const catalog = readFileSync("src/lib/admin-catalog.ts", "utf8");
  const source = readFileSync("src/lib/source.functions.ts", "utf8");
  const layout = readFileSync("src/components/admin/admin-layout.tsx", "utf8");
  const doc = readFileSync("docs/console-administrativo.md", "utf8");
  for (let n = 1; n <= 22; n += 1) assert.match(catalog, new RegExp(`id: "M${String(n).padStart(2, "0")}"`));
  assert.equal(source.includes('if (item.status === "aprovado") await approveItemTx'), false);
  assert.equal(layout.includes("Conteúdo canônico desta mesa"), false);
  assert.match(doc, /M01 a M22/);
  assert.match(doc, /não faz deploy/);
  assert.equal(doc.includes("super_admin"), false);
});

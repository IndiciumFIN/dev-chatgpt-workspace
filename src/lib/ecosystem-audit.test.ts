import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { auditEcosystem } from "./ecosystem-audit.ts";

// Achados abertos. Não são bloqueio e não se fecham por aprovação em lote:
// alt em en/es/fr ainda é rascunho, o hreflang dos 4 idiomas de interface
// anuncia chrome traduzido com corpo clínico em pt-BR, e a regra de negócio
// continua em rascunho depois da reversão da aprovação automática.
const known = ["I18N-ALT", "I18N-HREFLANG", "REG-RASCUNHO"];

test("a auditoria bloqueia o que não pode ir ao ar e registra o que ainda não fecha", async () => {
  const db = new PGlite();
  const names = (await readdir(new URL("../../migrations/", import.meta.url))).filter((name) => name.endsWith(".sql")).sort();
  for (const name of names) await db.exec(await readFile(new URL(`../../migrations/${name}`, import.meta.url), "utf8"));
  const findings = await auditEcosystem(db);
  assert.deepEqual(findings.filter((item) => item.level === "bloqueio"), []);
  assert.deepEqual(findings.map((item) => item.id), known);
  assert.equal(findings.every((item) => item.norm.length > 0 && item.evidence.length > 0), true);
});

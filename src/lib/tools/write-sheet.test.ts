import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";
import type { ClinicalTool } from "./types.ts";
import { restoreCopyTx, saveSheetTx } from "./write-sheet.ts";

function tagged(query: (text: string, params: unknown[]) => Promise<unknown[]>) {
  return async <T>(strings: TemplateStringsArray, ...values: unknown[]) => {
    let text = strings[0];
    for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
    return query(text, values) as Promise<T[]>;
  };
}

const tool: ClinicalTool = {
  slug: "braden",
  kind: "escala",
  category: "Pele",
  title: "Braden gravada",
  lead: "Texto longo o bastante.",
  criteria: [{ id: "sensorial", label: "Percepção", help: "Reação ao estímulo.", choices: [{ value: 1, label: "Limitada" }] }],
  bands: [{ min: 6, max: 9, label: "Alto", tone: "danger", note: "Reavalie.", nanda: ["Risco de lesão por pressão"] }],
  nandaMode: "sugerir",
  howTo: ["Marque um item por critério."],
  faqs: [{ q: "Fecha diagnóstico?", a: "Não." }],
  references: ["Bergstrom N, Braden BJ, Laguzza A, Holman V. Nurs Res. 1987."],
  related: ["morse"],
};

test("grava a ficha inteira e recusa quando o processo está desligado", async () => {
  const db = new PGlite();
  await db.exec(await readFile(new URL("../../../migrations/0002_source.sql", import.meta.url), "utf8"));
  await db.exec(await readFile(new URL("../../../migrations/0004_metamodel.sql", import.meta.url), "utf8"));
  await db.exec(await readFile(new URL("../../../migrations/0005_controls.sql", import.meta.url), "utf8"));
  await db.exec("insert into source_tool (slug, kind, title, lead) values ('braden', 'escala', 'Braden', 'Texto longo o bastante.')");
  const sql = tagged(async (text, params) => (await db.query(text, params)).rows);
  await saveSheetTx(sql, tool, true, "admin-1");
  const criteria = await db.query("select id from tool_criterion where tool_slug = 'braden'");
  const cover = await db.query("select title, updated_by from source_tool where slug = 'braden'");
  assert.equal(criteria.rows.length, 1);
  assert.equal((cover.rows[0] as { title: string }).title, "Braden gravada");
  assert.equal((cover.rows[0] as { updated_by: string }).updated_by, "admin-1");
  await saveSheetTx(sql, { ...tool, title: "Braden'; drop table source_tool;--" }, true, "admin-1");
  const quoted = await db.query("select title from source_tool where slug = 'braden'");
  assert.equal((quoted.rows[0] as { title: string }).title, "Braden'; drop table source_tool;--");
  const still = await db.query("select id from tool_criterion where tool_slug = 'braden'");
  assert.equal(still.rows.length, 1);
  await db.exec("update process set enabled = false where id = 'publicar_ferramenta'");
  await assert.rejects(() => saveSheetTx(sql, { ...tool, title: "Não pode" }, true, "admin-1"), /desligado/);
  const kept = await db.query("select title from source_tool where slug = 'braden'");
  assert.equal((kept.rows[0] as { title: string }).title, "Braden'; drop table source_tool;--");
});

test("a cópia devolve o título e registra restaurar", async () => {
  const db = new PGlite();
  await db.exec(await readFile(new URL("../../../migrations/0002_source.sql", import.meta.url), "utf8"));
  await db.exec(await readFile(new URL("../../../migrations/0004_metamodel.sql", import.meta.url), "utf8"));
  await db.exec(await readFile(new URL("../../../migrations/0005_controls.sql", import.meta.url), "utf8"));
  await db.exec("insert into source_tool (slug, kind, title, lead) values ('braden', 'escala', 'Braden', 'Texto longo o bastante.')");
  const sql = tagged(async (text, params) => (await db.query(text, params)).rows);
  const copy = {
    process: [
      { id: "publicar_ferramenta", enabled: true },
      { id: "assinatura", enabled: true },
      { id: "comunidade", enabled: false },
    ],
    tools: [{ slug: tool.slug, title: tool.title, lead: tool.lead, published: true }],
  };
  await saveSheetTx(sql, tool, true, "admin-1");
  await saveSheetTx(sql, { ...tool, title: "Titulo alterado" }, true, "admin-1");
  await restoreCopyTx(sql, copy, "admin-1");
  const title = await db.query("select title from source_tool where slug = 'braden'");
  const trail = await db.query("select action from audit_event where action = 'restaurar'");
  const community = await db.query("select enabled from process where id = 'comunidade'");
  assert.equal((title.rows[0] as { title: string }).title, "Braden gravada");
  assert.equal(trail.rows.length, 1);
  assert.equal((community.rows[0] as { enabled: boolean }).enabled, false);
});

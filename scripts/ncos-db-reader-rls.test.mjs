import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

// Synthetic/in-memory integration proof only; NO DATABASE_URL or external database.
test("NCOS candidate: RLS denies drafts and writes to read-only role (PGlite)", async () => {
  const db = new PGlite();
  try {
    const folder = new URL("../migrations/", import.meta.url);
    const names = (await readdir(folder)).filter((name) => name.endsWith(".sql")).sort();
    assert.ok(names.length > 0, "MIGRATIONS_NOT_FOUND");
    for (const name of names) {
      await db.exec(await readFile(new URL(name, folder), "utf8"));
    }
    const ownerDrafts = await db.query(
      "select count(*)::int as n from content_text where status <> 'publicado'"
    );
    const ownerPublished = await db.query(
      "select count(*)::int as n from content_text where status = 'publicado'"
    );
    assert.ok(ownerDrafts.rows[0].n > 0, "NO_DRAFT_FIXTURE: cannot prove RLS on unpublished content");
    await db.transaction(async (tx) => {
      await tx.exec("set local role leitor");
      const unpublished = await tx.query(
        "select count(*)::int as n from content_text where status <> 'publicado'"
      );
      assert.equal(unpublished.rows[0].n, 0, "RLS_LEAK_UNPUBLISHED_CONTENT");
      const visible = await tx.query("select count(*)::int as n from content_text");
      assert.equal(visible.rows[0].n, ownerPublished.rows[0].n, "RLS_PUBLISHED_SET_MISMATCH");
      await assert.rejects(
        tx.query("update content_text set status = 'rascunho' where status = 'publicado'"),
        /permission denied|insufficient privilege/i,
        "READER_WAS_ALLOWED_TO_MODIFY_CONTENT"
      );
    });
    // This verifies in-memory PostgreSQL semantics, not Neon production grants or OAuth.
  } finally {
    await db.close();
  }
});

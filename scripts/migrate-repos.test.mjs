import assert from "node:assert/strict";
import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import { createGunzip } from "node:zlib";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";

const manifest = JSON.parse(await readFile(new URL("../registers/repo-intake-manifest.json", import.meta.url), "utf8"));

test("o inventário não exclui repositório nem publica", async () => {
  assert.equal(manifest.exclusion, 0);
  assert.equal(manifest.published, 0);
  assert.equal(manifest.canonicalRef, "origin/canonical/local-20261101");
  const ids = manifest.repos.map((repo) => repo.id);
  assert.deepEqual(ids, [
    "canonical/local-20261101",
    "workspace",
    "principal",
    "backup",
    "auditeduca-site",
    "auditeduca-teste",
    "teste-enf",
  ]);
  const teste = manifest.repos.find((repo) => repo.id === "auditeduca-teste");
  assert.equal(teste.branches, 0);
  assert.equal(teste.files, 0);
  const principal = manifest.repos.find((repo) => repo.id === "principal");
  const backup = manifest.repos.find((repo) => repo.id === "backup");
  assert.equal(principal.files, backup.files);
  assert.equal(principal.igual, 0);
  const total = manifest.repos.reduce((sum, repo) => sum + repo.files, 0);
  let lines = 0;
  const input = createReadStream(new URL("../registers/repo-intake.jsonl.gz", import.meta.url)).pipe(createGunzip());
  let rest = "";
  for await (const chunk of input) {
    rest += chunk.toString();
    let cut = rest.lastIndexOf("\n");
    if (cut < 0) continue;
    lines += rest.slice(0, cut + 1).split("\n").length - 1;
    rest = rest.slice(cut + 1);
  }
  if (rest.trim()) lines += 1;
  assert.equal(lines, total);
  assert.equal(total > 700000, true);
});

test("a tabela recusa aprovação e status diferente de revisão", async () => {
  const db = new PGlite();
  const names = ["0006_governance.sql", "0008_canonical.sql", "0025_dictionary.sql", "0036_repo_intake.sql"];
  for (const name of names) {
    await db.exec(await readFile(new URL(`../migrations/${name}`, import.meta.url), "utf8"));
  }
  await db.exec("insert into repo_source (repo, note) values ('workspace', 'teste')");
  await db.exec(
    "insert into repo_file (repo, branch, path, blob, commit, face) values ('workspace', 'grook_10_26', 'a.txt', 'abc', 'def', 'so_na_origem')",
  );
  await assert.rejects(db.exec("update repo_file set aprovado = true"));
  await assert.rejects(db.exec("update repo_file set review_status = 'publicado'"));
});

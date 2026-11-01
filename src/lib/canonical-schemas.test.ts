import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../..", import.meta.url));
const srcDir = path.join(root, "src");
const contractsDir = path.join(srcDir, "data/contracts");
const indexFile = path.join(contractsDir, "canonical-index.json");
const selfFile = fileURLToPath(import.meta.url);
const desk = "src/data/contracts/cko-schemas";

type NameEntry = {
  canonical: string | null;
  status?: string;
  copies: string[];
};

function posix(file: string) {
  return file.split(path.sep).join("/");
}

async function walkFiles(dir: string, visit: (file: string) => Promise<void>) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walkFiles(full, visit);
    else if (entry.isFile()) await visit(full);
  }
}

function importsSkeletonTree(source: string) {
  return /(?:\bfrom\s+|\bimport\s*\(\s*|\brequire\s*\(\s*|\bimport\s+)["'`][^"'`]*cko-skeletons?(?:\/|["'`])/.test(
    source,
  );
}

test("só cko-schemas é fonte publicada dos schemas duplicados", async () => {
  const index = JSON.parse(await readFile(indexFile, "utf8")) as {
    names: Record<string, NameEntry>;
  };
  const onDisk = new Map<string, string[]>();

  await walkFiles(contractsDir, async (file) => {
    if (!file.endsWith(".schema.json")) return;
    const rel = posix(path.relative(root, file));
    const list = onDisk.get(path.basename(file)) ?? [];
    list.push(rel);
    onDisk.set(path.basename(file), list);
  });

  for (const [name, entry] of Object.entries(index.names)) {
    if (entry.canonical != null) {
      assert.equal(entry.canonical, `${desk}/${name}`);
    }
    assert.equal(Array.isArray(entry.copies), true);
    for (const copy of entry.copies) {
      assert.equal(typeof copy, "string");
      assert.notEqual(copy, entry.canonical);
    }
  }

  for (const [name, paths] of onDisk) {
    const canonical = `${desk}/${name}`;
    if (paths.length < 2 || !paths.includes(canonical)) continue;
    const entry = index.names[name];
    assert.ok(entry, `${name} duplicado não entrou no índice`);
    assert.notEqual(entry.canonical, null, `${name} duplicado ficou sem fonte`);
    assert.equal(entry.canonical, canonical);
  }

  const offenders: string[] = [];
  await walkFiles(srcDir, async (file) => {
    const resolved = path.resolve(file);
    if (resolved === path.resolve(indexFile) || resolved === path.resolve(selfFile)) return;
    const text = await readFile(file, "utf8");
    if (importsSkeletonTree(text)) offenders.push(posix(path.relative(root, file)));
  });
  assert.deepEqual(offenders, []);
});

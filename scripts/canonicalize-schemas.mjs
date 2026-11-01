#!/usr/bin/env node
/**
 * One published source for every *.schema.json name under src/data/contracts.
 *
 * The desk copy is src/data/contracts/cko-schemas/<name>. The same filename
 * under cko-skeleton, cko-skeletons, cko-editorial, or cko-bibliotecas stays
 * on disk as provenance and is listed under "copies" — never as canonical.
 * A name that never lands in cko-schemas is canonical null, status "sem-fonte".
 *
 * Paths only. Schema bodies are not read, so nothing in them is rewritten
 * or pretty-printed.
 */
import { readdir, writeFile } from "node:fs/promises";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONTRACTS = join(ROOT, "src/data/contracts");
const OUT = join(CONTRACTS, "canonical-index.json");
const DESK = "src/data/contracts/cko-schemas";

function posix(file) {
  return sep === "/" ? file : file.split(sep).join("/");
}

async function schemaFiles(dir) {
  const found = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await schemaFiles(full)));
    else if (entry.isFile() && entry.name.endsWith(".schema.json")) {
      found.push(posix(relative(ROOT, full)));
    }
  }
  return found;
}

const groups = new Map();
for (const file of await schemaFiles(CONTRACTS)) {
  const name = file.slice(file.lastIndexOf("/") + 1);
  const list = groups.get(name);
  if (list) list.push(file);
  else groups.set(name, [file]);
}

/** @type {Record<string, { canonical: string | null, status?: string, copies: string[] }>} */
const names = {};
let withCanonical = 0;
let semFonte = 0;
for (const name of [...groups.keys()].sort()) {
  const paths = [...groups.get(name)].sort();
  const canonical = `${DESK}/${name}`;
  const copies = paths.filter((file) => file !== canonical);
  if (paths.includes(canonical)) {
    names[name] = { canonical, copies };
    withCanonical += 1;
  } else {
    names[name] = { canonical: null, status: "sem-fonte", copies };
    semFonte += 1;
  }
}

await writeFile(OUT, `${JSON.stringify({ names }, null, 2)}\n`);
console.log(JSON.stringify({ withCanonical, semFonte }));

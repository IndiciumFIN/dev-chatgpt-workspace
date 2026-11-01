#!/usr/bin/env node
/**
 * Inventário de todos os repositórios contra canonical/local-20261101.
 * Grava cada arquivo de cada branch. Não apaga origem, não baixa corpo e não publica.
 *
 * Uso: node scripts/migrate-repos.mjs
 * Os clones sem corpo ficam em /tmp/repo-intake. O workspace já está em /workspace.
 */
import { execFileSync } from "node:child_process";
import { createWriteStream } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { createGzip } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "registers");
const canonicalRef = "origin/canonical/local-20261101";

const repos = [
  { id: "workspace", git: root, note: "IndiciumFIN/dev-chatgpt-workspace" },
  { id: "principal", git: "/tmp/repo-intake/principal.git", note: "IndiciumFIN/calculadorasdeenfermagem" },
  { id: "backup", git: "/tmp/repo-intake/backup.git", note: "IndiciumFIN/calculadorasdeenfermagem-backup-20261031" },
  { id: "auditeduca-site", git: "/tmp/repo-intake/auditeduca-site.git", note: "auditeduca/Calculadoras-de-Enfermagem" },
  { id: "auditeduca-teste", git: "/tmp/repo-intake/auditeduca-teste.git", note: "auditeduca/teste" },
  { id: "teste-enf", git: "/tmp/repo-intake/teste-enf.git", note: "auditeduca/teste-enf" },
];

function git(cwd, args) {
  return execFileSync("git", args, { cwd, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
}

function heads(cwd, remote) {
  const ref = remote ? "refs/remotes/origin" : "refs/heads";
  const text = git(cwd, ["for-each-ref", "--format=%(refname:short) %(objectname)", ref]);
  return text
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const space = line.lastIndexOf(" ");
      let branch = line.slice(0, space);
      if (remote && branch.startsWith("origin/")) branch = branch.slice("origin/".length);
      return { branch, commit: line.slice(space + 1) };
    })
    .filter((head) => head.branch !== "HEAD" && head.branch !== "canonical/local-20261101");
}

function tree(cwd, commit) {
  const text = git(cwd, ["ls-tree", "-r", commit]);
  const rows = [];
  for (const line of text.split("\n")) {
    if (!line) continue;
    const tab = line.indexOf("\t");
    if (tab < 0) continue;
    const meta = line.slice(0, tab).split(" ");
    rows.push({ blob: meta[2], path: line.slice(tab + 1) });
  }
  return rows;
}

const canonicalCommit = git(root, ["rev-parse", canonicalRef]).trim();
const canonical = new Map();
for (const row of tree(root, canonicalCommit)) canonical.set(row.path, row.blob);

await mkdir(outDir, { recursive: true });
const gzip = createGzip();
const stream = createWriteStream(join(outDir, "repo-intake.jsonl.gz"));
gzip.pipe(stream);
const done = new Promise((resolve, reject) => {
  stream.on("finish", resolve);
  stream.on("error", reject);
  gzip.on("error", reject);
});

const summary = {
  canonicalRef,
  canonicalCommit,
  canonicalFiles: canonical.size,
  generatedAt: new Date().toISOString(),
  exclusion: 0,
  published: 0,
  repos: [],
};

function writeRow(row) {
  gzip.write(JSON.stringify(row) + "\n");
}

for (const [path, blob] of canonical) {
  writeRow({
    repo: "workspace",
    note: "IndiciumFIN/dev-chatgpt-workspace",
    branch: "canonical/local-20261101",
    commit: canonicalCommit,
    path,
    blob,
    face: "canonical",
  });
}
summary.repos.push({
  id: "canonical/local-20261101",
  note: "IndiciumFIN/dev-chatgpt-workspace",
  branches: 1,
  files: canonical.size,
  igual: canonical.size,
  divergente: 0,
  soNaOrigem: 0,
});

for (const repo of repos) {
  let branchRows = [];
  try {
    branchRows = heads(repo.git, repo.id === "workspace");
  } catch {
    branchRows = [];
  }
  const bucket = { id: repo.id, note: repo.note, branches: branchRows.length, files: 0, igual: 0, divergente: 0, soNaOrigem: 0, commits: [] };
  for (const head of branchRows) {
    if (repo.id === "workspace" && head.branch === "canonical/local-20261101") continue;
    const files = tree(repo.git, head.commit);
    bucket.commits.push(head.commit);
    for (const file of files) {
      const known = canonical.get(file.path);
      const face = known === undefined ? "so_na_origem" : known === file.blob ? "igual" : "divergente";
      if (face === "igual") bucket.igual += 1;
      else if (face === "divergente") bucket.divergente += 1;
      else bucket.soNaOrigem += 1;
      bucket.files += 1;
      writeRow({ repo: repo.id, note: repo.note, branch: head.branch, commit: head.commit, path: file.path, blob: file.blob, face });
    }
  }
  summary.repos.push(bucket);
  console.log(`${repo.id}: branches ${bucket.branches} files ${bucket.files} igual ${bucket.igual} divergente ${bucket.divergente} so_na_origem ${bucket.soNaOrigem}`);
}

gzip.end();
await done;
await writeFile(join(outDir, "repo-intake-manifest.json"), JSON.stringify(summary, null, 2));
console.log("wrote registers/repo-intake.jsonl.gz");

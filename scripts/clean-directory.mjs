import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, basename } from 'node:path';

const root = new URL('../', import.meta.url).pathname;
const register = JSON.parse(readFileSync(join(root, 'audit/registers/current.json'), 'utf8'));
const files = register.files;
const sourcePaths = files.filter((f) => /\.(?:tsx?|mjs|css|html|json|md)$/.test(f.path));
const texts = sourcePaths.map((f) => {
  try { return [f.path, readFileSync(join(root, f.path), 'utf8')]; } catch { return [f.path, '']; }
});
const groups = new Map();
for (const file of files) groups.set(file.sha256, [...(groups.get(file.sha256) ?? []), file.path]);
const candidates = [];
for (const [hash, paths] of groups) {
  if (paths.length > 1) candidates.push({ kind: 'EXACT_DUPLICATE', paths, sha256: hash, disposition: 'HOLD_HUMAN', reason: 'Same bytes; references and intended purpose not yet proven interchangeable' });
}
for (const file of files.filter((f) => f.path.startsWith('public/') && !f.path.startsWith('public/__grok/'))) {
  const url = '/' + file.path.slice('public/'.length);
  const mentioned = texts.some(([path, text]) => path !== file.path && (text.includes(url) || text.includes(basename(file.path))));
  if (!mentioned) candidates.push({ kind: 'POSSIBLY_UNUSED_ASSET', paths: [file.path], sha256: file.sha256, disposition: 'REVIEW', reason: 'No literal reference in text sources; dynamic URLs, CMS and CSS-generated links not ruled out' });
}
for (const path of ['.node_modules.lock']) {
  const item = files.find((f) => f.path === path);
  if (item) candidates.push({ kind: 'ENVIRONMENT_ARTIFACT', paths: [path], sha256: item.sha256, disposition: 'REVIEW', reason: 'Zero-byte environment marker, not established as redundant' });
}
const output = {
  schemaVersion: '1.0.0',
  mode: 'DRY_RUN_ONLY',
  sourceSnapshotId: register.id,
  sourceDigest: register.digest,
  totalFiles: files.length,
  candidateCount: candidates.length,
  pendingKernelAdmission: true,
  deletionCount: 0,
  candidates,
};
const dir = join(root, 'audit', 'cleanup');
mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, 'candidates-v0.1.0.json'), JSON.stringify(output, null, 2) + '\n');
process.stdout.write(JSON.stringify({ mode: output.mode, totalFiles: files.length, candidates: candidates.length, duplicateGroups: candidates.filter((c) => c.kind === 'EXACT_DUPLICATE').length, possiblyUnusedAssets: candidates.filter((c) => c.kind === 'POSSIBLY_UNUSED_ASSET').length, deleted: 0 }) + '\n');

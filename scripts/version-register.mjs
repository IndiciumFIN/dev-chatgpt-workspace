import { createHash, randomUUID } from 'node:crypto';
import { readdirSync, readFileSync, existsSync, mkdirSync, writeFileSync, renameSync, appendFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = new URL('../', import.meta.url).pathname;
const target = join(root, 'audit', 'registers');
const ignoredRoots = new Set(['audit', 'node_modules', '.git', '.vercel', '.output', '.tanstack', '.vite', 'dist', 'build', 'coverage', 'screenshots']);
const hiddenExcluded = new Set(['.env', '.env.local', '.env.production', '.env.development']);
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
function classify(path) {
  if (path.startsWith('src/routes/')) return 'routes';
  if (path.startsWith('src/components/templates/') || path.includes('template-contract') || path.includes('component-contract')) return 'templates';
  if (path.startsWith('src/content/') || path.startsWith('src/lib/tools/') || path.startsWith('src/lib/sections')) return 'content';
  if (path.startsWith('public/')) return 'media';
  if (path.startsWith('src/') || path.startsWith('server/')) return 'application';
  return 'operations';
}
function safeWalk(dir = root) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const abs = join(dir, entry.name);
    const rel = relative(root, abs).replaceAll('\\', '/');
    if (entry.isSymbolicLink()) return [];
    if (entry.isDirectory()) return dir === root && ignoredRoots.has(entry.name) ? [] : safeWalk(abs);
    if (!entry.isFile() || hiddenExcluded.has(entry.name) || /^\.env\./.test(entry.name)) return [];
    return [rel];
  });
}
function writeAtomic(path, data) {
  const temp = `${path}.${process.pid}.${randomUUID()}.tmp`;
  writeFileSync(temp, data, { mode: 0o600 });
  renameSync(temp, path);
}
function readCurrent() {
  try { return JSON.parse(readFileSync(join(target, 'current.json'), 'utf8')); } catch { return null; }
}
function scan() {
  return safeWalk().map((path) => {
    const bytes = readFileSync(join(root, path));
    return { path, sha256: sha(bytes), bytes: bytes.length, register: classify(path) };
  }).sort((a, b) => a.path.localeCompare(b.path));
}
function makeDelta(previous, next) {
  const old = new Map((previous?.files ?? []).map((file) => [file.path, file.sha256]));
  const fresh = new Map(next.map((file) => [file.path, file.sha256]));
  return {
    added: next.filter((file) => !old.has(file.path)).map((file) => file.path),
    modified: next.filter((file) => old.has(file.path) && old.get(file.path) !== file.sha256).map((file) => file.path),
    removed: [...old.keys()].filter((path) => !fresh.has(path)),
  };
}
function record(phase, script, extra = {}) {
  mkdirSync(target, { recursive: true });
  const previous = readCurrent();
  const files = scan();
  const at = new Date().toISOString();
  const id = `${at.replaceAll(':', '-').replaceAll('.', '-')}-${process.pid}-${randomUUID().slice(0, 8)}`;
  const delta = makeDelta(previous, files);
  const changed = delta.added.length + delta.modified.length + delta.removed.length > 0;
  const revision = (previous?.revision ?? 0) + (changed ? 1 : 0);
  const register = { schemaVersion: '1.0.0', id, at, phase, script, ...extra, revision, changed, fileCount: files.length, digest: sha(JSON.stringify(files)), delta };
  writeAtomic(join(target, 'current.json'), JSON.stringify({ ...register, files }, null, 2) + '\n');
  for (const kind of ['routes', 'templates', 'content', 'media', 'application', 'operations']) {
    const subset = files.filter((file) => file.register === kind);
    const info = { schemaVersion: '1.0.0', kind, snapshotId: id, revision, count: subset.length, digest: sha(JSON.stringify(subset)), files: subset };
    writeAtomic(join(target, `${kind}-current.json`), JSON.stringify(info, null, 2) + '\n');
  }
  const event = JSON.stringify({ ...register, eventHash: sha(JSON.stringify(register)) }) + '\n';
  appendFileSync(join(target, 'events.jsonl'), event);
  for (const category of ['added', 'modified', 'removed']) {
    for (const path of delta[category]) appendFileSync(join(target, 'file-changes.jsonl'), JSON.stringify({ id, at, script, phase, operation: category, path }) + '\n');
  }
  process.stdout.write(`[register] ${phase} ${script}: ${files.length} files; +${delta.added.length} ~${delta.modified.length} -${delta.removed.length}\n`);
  return register;
}
const [command, name, ...args] = process.argv.slice(2);
if (command === 'snapshot') {
  if (process.env.CE_AUDIT_WRAPPED === '1') process.exit(0);
  record(args[0] ?? 'manual', name ?? 'manual');
} else if (command === 'run') {
  if (!name || name.startsWith('pre') || name.startsWith('post') || name === 'audit:run') {
    process.stderr.write('Usage: npm run audit:run -- <npm-script> [args]\n'); process.exit(2);
  }
  const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  if (!Object.hasOwn(packageJson.scripts, name)) {
    process.stderr.write(`Unknown npm script: ${name}\n`); process.exit(2);
  }
  const before = record('before', name, { method: 'wrapper' });
  const child = spawnSync('npm', ['run', name, ...args], { cwd: root, stdio: 'inherit', env: { ...process.env, CE_AUDIT_WRAPPED: '1' }, shell: process.platform === 'win32' });
  const exitCode = child.status ?? (child.error ? 1 : 128 + (child.signal === 'SIGINT' ? 2 : 15));
  record('after', name, { method: 'wrapper', invocationId: before.id, exitCode, signal: child.signal ?? null });
  process.exit(exitCode);
} else if (command === 'verify') {
  const current = readCurrent();
  if (!current) { process.stderr.write('No current register\n'); process.exit(1); }
  const entries = scan();
  const good = current.digest === sha(JSON.stringify(entries));
  process.stdout.write(JSON.stringify({ ok: good, expected: current.digest, observed: sha(JSON.stringify(entries)), count: entries.length }) + '\n');
  if (!good) process.exitCode = 1;
} else {
  process.stderr.write('Usage: version-register.mjs snapshot <name> [phase] | run <script> | verify\n');
  process.exitCode = 2;
}

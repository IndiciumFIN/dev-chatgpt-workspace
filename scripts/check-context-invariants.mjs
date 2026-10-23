import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../', import.meta.url).pathname;
const instructions = join(root, 'AGENTS.project.md');
const baseline = join(root, 'audit/baseline/v0.1.0/file-register.json');
const latest = join(root, 'audit/registers/current.json');
const conditions = [
  ['project-instructions-present', existsSync(instructions)],
  ['baseline-present', existsSync(baseline)],
  ['version-register-present', existsSync(latest)],
  ['no-git-metadata-in-worktree', !existsSync(join(root, '.git'))],
];
if (existsSync(baseline)) {
  const registry = JSON.parse(readFileSync(baseline, 'utf8'));
  conditions.push(['baseline-origin-is-backup', registry.authority === 'THIS_BACKUP_ONLY']);
  conditions.push(['baseline-has-204-paths', registry.snapshotFileCount === 204 && new Set(registry.records.map((r) => r.path)).size === 204]);
  conditions.push(['crosswalk-deferred', registry.githubCrosswalk === 'DEFERRED_BY_OWNER']);
}
const result = { checks: conditions.map(([id, pass]) => ({ id, pass })), passed: conditions.filter(([, p]) => p).length, failed: conditions.filter(([, p]) => !p).length };
process.stdout.write(JSON.stringify(result, null, 2) + '\n');
if (result.failed) process.exitCode = 1;

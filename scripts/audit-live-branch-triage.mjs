#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildLiveBranchTriage } from './lib/live-branch-triage.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(name);
  return index < 0 ? fallback : args[index + 1];
};
const auditPath = resolve(
  root,
  option('--report', 'audit/branch-canonicalization/current.json'),
);
const outputPath = resolve(
  root,
  option('--output', 'audit/branch-canonicalization/current-triage.json'),
);
const auditReport = JSON.parse(readFileSync(auditPath, 'utf8'));

function git(args) {
  return execFileSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trimEnd();
}

function verifySnapshot() {
  const branch = git(['branch', '--show-current']);
  const head = git(['rev-parse', 'HEAD']);
  if (auditReport.candidate?.branch !== branch || auditReport.candidate?.commit !== head) {
    throw new Error('STALE_LIVE_BRANCH_AUDIT');
  }

  const refs = git([
    'for-each-ref',
    '--format=%(refname)%09%(objectname)%09%(symref)',
    'refs/remotes/origin',
  ])
    .split('\n')
    .filter(Boolean)
    .map(line => line.split('\t'))
    .filter(([, , symref]) => !symref);
  const expected = new Map([
    ['main', auditReport.baseline.commit],
    ...auditReport.sourceBranches.map(source => [source.name, source.commit]),
  ]);
  const candidateRef = `refs/remotes/origin/${branch}`;
  const candidateRemote = refs.find(([ref]) => ref === candidateRef);
  if (
    refs.length !== expected.size + 1 ||
    !candidateRemote ||
    refs.some(([ref, sha]) => {
      if (ref === candidateRef) return false;
      const prefix = 'refs/remotes/origin/';
      return !ref.startsWith(prefix) || expected.get(ref.slice(prefix.length)) !== sha;
    })
  ) {
    throw new Error('REMOTE_BRANCHES_CHANGED_SINCE_AUDIT');
  }
  try {
    git(['merge-base', '--is-ancestor', candidateRemote[1], head]);
  } catch (error) {
    if (error.status !== 1) throw error;
    throw new Error('REMOTE_CANDIDATE_NOT_ANCESTOR_OF_AUDITED_HEAD');
  }
}

verifySnapshot();
const report = buildLiveBranchTriage(auditReport);
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(
  JSON.stringify(
    {
      counts: report.counts,
      byWorkOrder: report.byWorkOrder,
      report: outputPath,
      releaseGate: report.releaseGate,
    },
    null,
    2,
  ),
);

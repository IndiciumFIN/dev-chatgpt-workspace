#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { lstatSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { canonicalizeEquivalentDraft } from './lib/canonical-i18n-records.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const reportPath = resolve(root, 'audit/branch-canonicalization/current.json');
const manifestPath = resolve(root, 'audit/branch-canonicalization/i18n-materialization.json');
const report = JSON.parse(readFileSync(reportPath, 'utf8'));

function git(args, encoding = 'utf8') {
  return execFileSync('git', args, {
    cwd: root,
    encoding,
    maxBuffer: 128 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function verifyReportIsCurrent() {
  const branch = git(['branch', '--show-current']).trim();
  const commit = git(['rev-parse', 'HEAD']).trim();
  if (
    report.reportType !== 'READ_ONLY_BRANCH_CANONICALIZATION_INVENTORY' ||
    report.candidate?.branch !== branch ||
    report.candidate?.commit !== commit ||
    report.baseline?.ref !== 'refs/remotes/origin/main'
  ) {
    throw new Error('STALE_OR_UNRELATED_CANONICALIZATION_REPORT');
  }

  const refs = git([
    'for-each-ref',
    '--format=%(refname)%09%(objectname)%09%(symref)',
    'refs/remotes/origin',
  ])
    .trimEnd()
    .split('\n')
    .filter(Boolean)
    .map(line => line.split('\t'))
    .filter(([, , symref]) => !symref);
  const expected = new Map([
    ['main', report.baseline.commit],
    [report.candidate.branch, report.candidate.commit],
    ...report.sourceBranches.map(source => [source.name, source.commit]),
  ]);
  if (
    refs.length !== expected.size ||
    refs.some(([ref, commit]) => {
      const prefix = 'refs/remotes/origin/';
      return !ref.startsWith(prefix) || expected.get(ref.slice(prefix.length)) !== commit;
    })
  ) {
    throw new Error('REMOTE_BRANCHES_CHANGED_SINCE_AUDIT');
  }
}

function readSafeDestination(destination) {
  const relativeDirectory = relative(root, dirname(destination));
  if (relativeDirectory.startsWith('..') || relativeDirectory === '') {
    throw new Error('INVALID_OUTPUT_DIRECTORY');
  }
  let directory = root;
  for (const segment of relativeDirectory.split(sep)) {
    directory = join(directory, segment);
    try {
      const stats = lstatSync(directory);
      if (stats.isSymbolicLink() || !stats.isDirectory()) {
        throw new Error(`UNSAFE_OUTPUT_DIRECTORY:${directory}`);
      }
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }

  try {
    const stats = lstatSync(destination);
    if (stats.isSymbolicLink() || !stats.isFile()) {
      throw new Error(`UNSAFE_OUTPUT_FILE:${destination}`);
    }
    return readFileSync(destination, 'utf8');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return null;
  }
}

verifyReportIsCurrent();

const equivalents = new Map(
  (report.semanticI18n?.equivalent ?? []).map(item => [item.path, item]),
);
const eligible = report.records.filter(record => equivalents.has(record.path));
if (
  eligible.length !== equivalents.size ||
  !Array.isArray(report.semanticI18n?.equivalent) ||
  report.semanticI18n.counts?.substantiveOrNonAllowlisted !== 0 ||
  report.semanticI18n.counts?.unverifiable !== 0
) {
  throw new Error('INCOMPLETE_SEMANTIC_I18N_AUDIT');
}

const planned = eligible.map(record => {
  const semantic = equivalents.get(record.path);
  if (
    !record.path.startsWith('registers/i18n/incoming/de/contracts/') ||
    !record.path.endsWith('.json') ||
    record.riskGroup !== 'I18N_VALIDATE' ||
    record.sourceVersionCount < 2 ||
    semantic.approvalState !== 'DRAFT_OR_UNVERIFIED'
  ) {
    throw new Error(`INELIGIBLE_I18N_RECORD:${record.path}`);
  }

  const sources = record.sourceEntries.filter(source => source.entry?.type === 'blob');
  const blobs = sources.map(source => source.entry.oid);
  if (
    new Set(blobs).size !== semantic.originalBlobs.length ||
    semantic.originalBlobs.some(blob => !blobs.includes(blob))
  ) {
    throw new Error(`SOURCE_BLOB_MISMATCH:${record.path}`);
  }

  const result = canonicalizeEquivalentDraft({
    path: record.path,
    blobs,
    readBlob: blob => git(['cat-file', 'blob', blob]),
    expectedSemanticSha256: semantic.semanticSha256,
  });
  const destination = resolve(root, record.path);
  if (!destination.startsWith(`${root}${sep}`)) throw new Error('INVALID_OUTPUT_PATH');

  const existing = readSafeDestination(destination);
  if (existing !== null && existing !== result.content) {
    throw new Error(`DESTINATION_CONFLICT:${record.path}`);
  }

  return {
    path: record.path,
    destination,
    content: result.content,
    contentSha256: result.contentSha256,
    semanticSha256: result.semanticSha256,
    sourceBlobs: result.sourceBlobs,
    sourceBranches: sources.map(source => source.branch).sort(),
    state: existing === null ? 'CREATED_DRAFT' : 'ALREADY_CANONICAL_DRAFT',
  };
});

for (const item of planned) {
  if (item.state === 'ALREADY_CANONICAL_DRAFT') continue;
  mkdirSync(dirname(item.destination), { recursive: true });
  if (readSafeDestination(item.destination) !== null) {
    throw new Error(`DESTINATION_CHANGED_DURING_CANONICALIZATION:${item.path}`);
  }
  writeFileSync(item.destination, item.content, { flag: 'wx' });
}

const manifest = {
  schemaVersion: '1.0.0',
  reportType: 'CANONICALIZED_INCOMING_I18N_DRAFTS',
  auditGeneratedAt: report.generatedAt,
  candidate: report.candidate,
  canonicalization: 'SORT_OBJECT_KEYS_AND_PROVENANCE_REFS_ONLY',
  approvalChanged: false,
  releaseGate: 'HOLD_HUMAN',
  entries: planned.map(
    ({ path, contentSha256, semanticSha256, sourceBlobs, sourceBranches, state }) => ({
      path,
      contentSha256,
      semanticSha256,
      sourceBlobs,
      sourceBranches,
      state,
    }),
  ),
};
mkdirSync(dirname(manifestPath), { recursive: true });
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(
  JSON.stringify(
    {
      created: planned.filter(entry => entry.state === 'CREATED_DRAFT').length,
      alreadyCanonical: planned.filter(entry => entry.state === 'ALREADY_CANONICAL_DRAFT').length,
      releaseGate: manifest.releaseGate,
      manifest: manifestPath,
    },
    null,
    2,
  ),
);

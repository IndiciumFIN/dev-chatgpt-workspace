#!/usr/bin/env node
/** Read-only source-branch inventory. Identical Git objects are reusable; conflicts are not auto-selected. */
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseTreeEntries, entryKey, summarizePath } from './lib/branch-canonicalization.mjs';
import { classifyCandidateRisk } from './lib/main-migration-core.mjs';
import { analyzeSemanticI18nCollisions } from './lib/semantic-collision-audit.mjs';
import { auditSourceSecuritySignals } from './lib/source-security-signals.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const defaultOutput = resolve(root, 'audit/branch-canonicalization/current.json');
const outputFlag = process.argv.indexOf('--output');
const output = outputFlag >= 0 ? resolve(process.cwd(), process.argv[outputFlag + 1] ?? '') : defaultOutput;
if (!output || output === process.cwd()) throw new Error('INVALID_REPORT_PATH');

function git(args, encoding = 'utf8') {
  return execFileSync('git', args, {
    cwd: root,
    encoding,
    maxBuffer: 128 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function readRemoteHeads() {
  const lines = git([
    'for-each-ref',
    '--format=%(refname)%09%(objectname)%09%(symref)',
    'refs/remotes/origin',
  ]).trimEnd().split('\n');
  const refs = new Map();
  for (const line of lines) {
    if (!line) continue;
    const [ref, commit, symref] = line.split('\t');
    if (symref) continue;
    const prefix = 'refs/remotes/origin/';
    if (!ref.startsWith(prefix) || !/^[a-f0-9]{40,64}$/.test(commit ?? '')) {
      throw new Error(`INVALID_REMOTE_REF:${line}`);
    }
    refs.set(ref.slice(prefix.length), commit);
  }
  return refs;
}

function tree(ref) {
  return parseTreeEntries(git(['ls-tree', '-r', '-z', '--full-tree', ref], null));
}

function summarizeCounts(records, sourceChangeCount, sourceCount) {
  const totals = {
    distinctChangedPaths: records.length,
    sourcePathChanges: sourceChangeCount,
    singleSourcePaths: 0,
    sharedIdenticalPaths: 0,
    divergentPaths: 0,
    candidateMatchesCommonSourcePaths: 0,
    candidateMatchesAnySourcePaths: 0,
    candidateAbsentWhileSourceHasFilePaths: 0,
    baselineMatchesAnySourcePaths: 0,
    sourceDeletions: 0,
    sourceDeletionEntries: 0,
  };
  const directories = {};
  const extensions = {};
  const riskGroups = {};
  for (const record of records) {
    if (record.sourceBranchCount === 1) totals.singleSourcePaths++;
    else if (record.sourceBranchesAgree) totals.sharedIdenticalPaths++;
    else totals.divergentPaths++;
    if (record.candidateMatchesCommonSource) totals.candidateMatchesCommonSourcePaths++;
    if (record.candidateMatchesAnySource) totals.candidateMatchesAnySourcePaths++;
    if (
      record.candidateEntry === null &&
      record.sourceEntries.some(source => source.entry !== null)
    ) {
      totals.candidateAbsentWhileSourceHasFilePaths++;
    }
    if (
      record.sourceEntries.some(
        source => entryKey(source.entry) === entryKey(record.baselineEntry),
      )
    ) {
      totals.baselineMatchesAnySourcePaths++;
    }
    if (record.sourceBranchesAgree && record.commonSourceEntry === null) totals.sourceDeletions++;
    totals.sourceDeletionEntries += record.sourceEntries.filter(source => source.entry === null).length;
    const firstDirectory = record.path.split('/').slice(0, 2).join('/');
    const directory = directories[firstDirectory] ?? {
      paths: 0,
      singleSourcePaths: 0,
      sharedIdenticalPaths: 0,
      divergentPaths: 0,
      candidateMatchesCommonSourcePaths: 0,
      candidateMatchesAnySourcePaths: 0,
      candidateAbsentWhileSourceHasFilePaths: 0,
    };
    directory.paths++;
    if (record.sourceBranchCount === 1) directory.singleSourcePaths++;
    else if (record.sourceBranchesAgree) directory.sharedIdenticalPaths++;
    else directory.divergentPaths++;
    if (record.candidateMatchesCommonSource) directory.candidateMatchesCommonSourcePaths++;
    if (record.candidateMatchesAnySource) directory.candidateMatchesAnySourcePaths++;
    if (record.candidateEntry === null && record.sourceEntries.some(source => source.entry !== null)) {
      directory.candidateAbsentWhileSourceHasFilePaths++;
    }
    directories[firstDirectory] = directory;
    const extension = record.path.match(/\.[^/.]+$/)?.[0] ?? '[none]';
    extensions[extension] = (extensions[extension] ?? 0) + 1;
    riskGroups[record.riskGroup] = (riskGroups[record.riskGroup] ?? 0) + 1;
  }
  if (totals.singleSourcePaths + totals.sharedIdenticalPaths + totals.divergentPaths !== records.length) {
    throw new Error('PATH_TOTALS_DO_NOT_RECONCILE');
  }
  return {
    sourceBranches: sourceCount,
    ...totals,
    pathsByTopDirectory: Object.fromEntries(
      Object.entries(directories)
        .sort((a, b) => b[1].paths - a[1].paths || a[0].localeCompare(b[0])),
    ),
    pathsByExtension: Object.fromEntries(
      Object.entries(extensions).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
    ),
    pathsByExistingRiskGroup: Object.fromEntries(
      Object.entries(riskGroups).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
    ),
  };
}

const currentBranch = git(['branch', '--show-current']).trim();
const baselineRef = 'refs/remotes/origin/main';
const candidateRef = `refs/heads/${currentBranch}`;
if (!currentBranch || currentBranch === 'main') throw new Error('CANDIDATE_BRANCH_REQUIRED');
const baselineCommit = git(['rev-parse', '--verify', baselineRef]).trim();
const candidateCommit = git(['rev-parse', '--verify', candidateRef]).trim();
const remoteHeadsBefore = readRemoteHeads();
const candidateBranch = currentBranch;
const sourceBranches = [...remoteHeadsBefore]
  .filter(([name]) => name !== 'main' && name !== candidateBranch)
  .map(([name, commit]) => ({ name, commit, ref: `refs/remotes/origin/${name}` }))
  .sort((a, b) => a.name.localeCompare(b.name));
if (sourceBranches.length === 0) throw new Error('NO_SOURCE_BRANCHES');

const baselineTree = tree(baselineRef);
const candidateTree = tree(candidateRef);
const treeCache = new Map([[baselineCommit, baselineTree], [candidateCommit, candidateTree]]);
const treeAt = ref => {
  const commit = git(['rev-parse', '--verify', ref]).trim();
  if (!treeCache.has(commit)) treeCache.set(commit, tree(commit));
  return { commit, entries: treeCache.get(commit) };
};
const byPath = new Map();
let sourcePathChanges = 0;
for (const source of sourceBranches) {
  let mergeBaseSha = null;
  try {
    mergeBaseSha = git(['merge-base', baselineRef, source.ref]).trim();
  } catch {
    // Unrelated history is compared to the current baseline by path and blob.
  }
  const comparisonBase = treeAt(mergeBaseSha ?? baselineRef);
  const sourceTree = treeAt(source.ref);
  source.comparisonBaseCommit = comparisonBase.commit;
  source.comparedToMainTree = mergeBaseSha === null;
  const paths = new Set([...comparisonBase.entries.keys(), ...sourceTree.entries.keys()]);
  for (const path of paths) {
    const comparisonBaseEntry = comparisonBase.entries.get(path) ?? null;
    const sourceEntry = sourceTree.entries.get(path) ?? null;
    if (entryKey(comparisonBaseEntry) === entryKey(sourceEntry)) continue;
    sourcePathChanges++;
    const item = byPath.get(path) ?? {
      baselineEntry: baselineTree.get(path) ?? null,
      candidateEntry: candidateTree.get(path) ?? null,
      sourceEntries: [],
    };
    item.sourceEntries.push({
      branch: source.name,
      commit: source.commit,
      comparisonBaseCommit: comparisonBase.commit,
      comparisonBaseEntry,
      entry: sourceEntry,
    });
    byPath.set(path, item);
  }
}

const records = [...byPath]
  .map(([path, entries]) => ({
    ...summarizePath({ path, ...entries }),
    riskGroup: classifyCandidateRisk(path),
  }))
  .sort((a, b) => a.path.localeCompare(b.path));
const semanticI18n = analyzeSemanticI18nCollisions(
  records
    .filter(
      record =>
        record.sourceVersionCount > 1 &&
        record.path.startsWith('registers/i18n/incoming/de/contracts/') &&
        record.path.endsWith('.json'),
    )
    .map(record => ({
      path: record.path,
      sources: record.sourceEntries.map(source => ({
        branch: source.branch,
        blob: source.entry?.type === 'blob' ? source.entry.oid : null,
      })),
    })),
  blob => git(['cat-file', 'blob', blob]),
);
const sourceSecuritySignals = auditSourceSecuritySignals(
  records,
  blob => git(['cat-file', 'blob', blob]),
);
const remoteHeadsAfter = readRemoteHeads();
if (
  remoteHeadsBefore.size !== remoteHeadsAfter.size ||
  [...remoteHeadsBefore].some(([name, sha]) => remoteHeadsAfter.get(name) !== sha)
) {
  throw new Error('REMOTE_BRANCH_MOVED_DURING_AUDIT');
}
const report = {
  schemaVersion: '1.0.0',
  reportType: 'READ_ONLY_BRANCH_CANONICALIZATION_INVENTORY',
  repository: 'IndiciumFIN/dev-chatgpt-workspace',
  generatedAt: new Date().toISOString(),
  baseline: { ref: baselineRef, commit: baselineCommit },
  candidate: { branch: candidateBranch, commit: candidateCommit },
  sourceBranches: sourceBranches.map(({ name, commit, comparisonBaseCommit, comparedToMainTree }) => ({
    name,
    commit,
    comparisonBaseCommit,
    comparedToMainTree,
  })),
  summary: summarizeCounts(records, sourcePathChanges, sourceBranches.length),
  semanticI18n: {
    counts: semanticI18n.counts,
    equivalent: semanticI18n.equivalent,
    substantive: semanticI18n.substantive,
    unableToVerify: semanticI18n.unableToVerify,
    canonicalWinnerSelected: false,
  },
  sourceSecuritySignals,
  records,
  limitations: [
    'A matching Git tree entry proves byte and mode identity only; it does not prove correctness, ownership, clinical validity or rights.',
    'Different source versions are inventoried with lineage; this report does not select a winner.',
    'Source deletion is recorded as a candidate change and is not authorization to delete.',
    'This inventory does not establish runtime, visual, legal or production homologation.',
  ],
};

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
const conciseSummary = { ...report.summary };
delete conciseSummary.pathsByTopDirectory;
delete conciseSummary.pathsByExtension;
console.log(JSON.stringify({
  summary: conciseSummary,
  topDirectories: Object.entries(report.summary.pathsByTopDirectory).slice(0, 12),
  report: output,
}));

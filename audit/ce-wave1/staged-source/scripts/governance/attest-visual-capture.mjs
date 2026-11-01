#!/usr/bin/env node
/** Attest actual screenshots & bind run SHA; visual review remains HOLD. */
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import assert from 'node:assert/strict';
const directory = path.resolve('audit/visual/current');
const report = JSON.parse(readFileSync(path.join(directory, 'evidence.json'), 'utf8'));
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
assert.equal(report.source, 'real chromium browser');
assert.equal(report.verdict, 'CAPTURED_REVIEW_REQUIRED');
assert.equal(report.errors?.length, 0);
assert.equal(report.captures?.length, 9);
const names = new Set();
for (const item of report.captures) {
  assert(/^[a-z0-9-]+\.png$/i.test(item.file), 'Only local PNG filenames permitted');
  assert(!names.has(item.file), 'Duplicate capture'); names.add(item.file);
  const pathname = path.join(directory, item.file);
  assert(existsSync(pathname), 'Missing screenshot: ' + item.file);
  const bytes = readFileSync(pathname);
  assert.equal(bytes.length, item.bytes, 'Screenshot byte count changed');
  assert.equal(sha256(bytes), item.sha256, 'Screenshot SHA changed');
  assert(item.status >= 200 && item.status < 400);
}
const commit = process.env.GITHUB_SHA;
assert(/^[a-f0-9]{40}$/.test(commit ?? ''), 'GITHUB_SHA required for run linkage');
const run = process.env.GITHUB_RUN_ID;
assert(/^\d+$/.test(run ?? ''), 'GITHUB_RUN_ID required for run linkage');
const evidence = {
  schemaVersion: 1, sourceCommit: commit, githubRunId: run,
  captureReportSha256: sha256(readFileSync(path.join(directory, 'evidence.json'))),
  images: report.captures.map(x => ({ file: x.file, sha256: x.sha256 })),
  captureVerdict: 'CAPTURED_REVIEW_REQUIRED',
  independentVisualReview: 'NOT_RUN', releaseGate: 'HOLD_HUMAN',
};
writeFileSync(path.join(directory, 'ci-provenance.json'), JSON.stringify(evidence, null, 2) + '\n');
console.log(JSON.stringify({ sourceCommit: commit, run, captureCount: names.size, visualApproval: false, verdict: 'EVIDENCE_BOUND_REVIEW_REQUIRED' }));

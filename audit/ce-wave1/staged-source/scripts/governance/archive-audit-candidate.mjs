#!/usr/bin/env node
/**
 * Create a compact, integrity-checked CI artifact OUTSIDE the repository.
 * Historical report is NEVER deleted or rewritten. No automatic promotion.
 * Usage: node scripts/governance/archive-audit-candidate.mjs /tmp/ce-audit-evidence
 */
import { createHash } from 'node:crypto';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
const out = resolve(process.argv[2] || '/tmp/ce-audit-evidence');
const reportPath = 'audit/branch-canonicalization/current.json';
const source = readFileSync(reportPath);
const report = JSON.parse(source.toString('utf8'));
const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const sha256 = data => createHash('sha256').update(data).digest('hex');
const compressed = gzipSync(source, { level: 9, mtime: 0 });
mkdirSync(out, { recursive: true });
writeFileSync(resolve(out, 'branch-audit.json.gz'), compressed, { flag: 'wx' });
const manifest = {
  schemaVersion: 1, sourceCommit, auditCandidateCommit: report.candidate?.commit,
  reportType: report.reportType, sourcePath: reportPath,
  plainBytes: source.length, compressedBytes: compressed.length,
  sourceSha256: sha256(source), archiveSha256: sha256(compressed),
  retention: 'CI_ARTIFACT_CANDIDATE_ONLY', releaseGate: 'HOLD_HUMAN',
};
writeFileSync(resolve(out, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify({ output: out, ...manifest }, null, 2));

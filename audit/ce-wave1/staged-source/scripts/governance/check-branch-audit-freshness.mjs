#!/usr/bin/env node
/** Candidate audit freshness, including detached-HEAD GitHub PR checkouts.
 * Never grants approval; checks both canonical snapshot/triage and current tree.
 */
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';

export function validateFreshness({src, triage, actualHead, sourceBranch, targetSha,
  sourceRepo, expectedRepo, mainHead, sourceRefHead}) {
  const hex = /^[a-f0-9]{40}$/;
  assert(hex.test(actualHead) && hex.test(targetSha), 'INVALID_SHA');
  assert.equal(actualHead, targetSha, 'CI checkout must equal the precise candidate SHA');
  assert.equal(sourceRepo, expectedRepo, 'UNTRUSTED_PR_SOURCE_REPOSITORY');
  assert.equal(src.candidate?.branch, sourceBranch, 'AUDIT_WRONG_SOURCE_BRANCH');
  assert.equal(triage.candidate?.branch, sourceBranch, 'TRIAGE_WRONG_SOURCE_BRANCH');
  assert.equal(src.candidate?.commit, actualHead, 'STALE_CANONICAL_AUDIT');
  assert.equal(triage.candidate?.commit, actualHead, 'STALE_CONFLICT_TRIAGE');
  assert.equal(src.baseline?.commit, mainHead, 'BASELINE_DRIFT');
  assert.equal(triage.baseline?.commit, mainHead, 'TRIAGE_BASELINE_DRIFT');
  if (sourceRefHead) assert.equal(sourceRefHead, actualHead, 'SOURCE_BRANCH_MOVED');
  assert(Number.isSafeInteger(triage.counts?.total) && triage.counts.total >= 0,
    'INVALID_TRIAGE_COUNT');
  assert.equal(triage.counts.total, triage.items?.length, 'INCOMPLETE_TRIAGE');
  assert.equal(triage.counts.formallyApproved, 0, 'FALSE_APPROVAL_CLAIM');
  assert.equal(triage.releaseGate,'HOLD_HUMAN', 'RELEASE_GATE_CHANGED');
  assert(triage.items.every(x => x.decision === 'NOT_APPROVED' &&
    x.kernelAdmission === 'NOT_VERIFIED'), 'UNTRUSTED_ADMISSION_CLAIM');
  return {verdict:'CURRENT_HOLD_AUDIT', head:actualHead,
    conflicts:triage.counts.total, authorization:'NOT_GRANTED'};
}

if (process.argv[1]?.endsWith('check-branch-audit-freshness.mjs')) {
  const git = (...args) => execFileSync('git',args,{encoding:'utf8'}).trim();
  const src = JSON.parse(readFileSync('audit/branch-canonicalization/current.json','utf8'));
  const triage = JSON.parse(readFileSync('audit/branch-canonicalization/current-triage.json','utf8'));
  const actualHead = git('rev-parse','HEAD');
  const branch = git('branch','--show-current');
  const ci = Boolean(process.env.GITHUB_ACTIONS);
  const targetSha = ci ? process.env.CI_TARGET_SHA : actualHead;
  const sourceBranch = ci ? process.env.CI_SOURCE_BRANCH : branch;
  const sourceRepo = ci ? process.env.CI_SOURCE_REPO : 'IndiciumFIN/dev-chatgpt-workspace';
  if (!sourceBranch || !targetSha || (ci && !process.env.CI_SOURCE_REPO))
    throw Error('MISSING_TRUSTED_CI_CONTEXT');
  // Validate baseline from local fetched origin/main. No inference from status.
  const mainHead = git('rev-parse','--verify','refs/remotes/origin/main');
  const remote = `refs/remotes/origin/${sourceBranch}`;
  let sourceRefHead;
  try { sourceRefHead = git('rev-parse','--verify',remote); }
  catch { if (!ci) throw Error('SOURCE_REF_NOT_FETCHED'); }
  console.log(JSON.stringify(validateFreshness({src,triage,actualHead,sourceBranch,targetSha,
    sourceRepo,expectedRepo:'IndiciumFIN/dev-chatgpt-workspace',mainHead,
    sourceRefHead}),null,2));
}

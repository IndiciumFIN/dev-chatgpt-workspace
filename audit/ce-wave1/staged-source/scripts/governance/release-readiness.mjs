#!/usr/bin/env node
/** Release is NEVER inferred from a CI PASS, visual screenshot or local manifest. */
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

export function assessRelease(input) {
  const blockers = [];
  const head = input.head;
  if (!/^[a-f0-9]{40}$/.test(head ?? '')) blockers.push('INVALID_HEAD');
  if (input.candidateSha !== head || input.triageSha !== head) blockers.push('STALE_BRANCH_AUDIT');
  if (input.unresolvedFinds > 0) blockers.push('UNRESOLVED_FINDS');
  if (input.unreviewedConflicts > 0) blockers.push('CONFLICT_REVIEW_INCOMPLETE');
  if (!input.memCI) blockers.push('MEM_CI_NOT_GREEN');
  if (!input.ciComplete) blockers.push('FULL_CI_NOT_GREEN');
  if (input.visualCapture !== 'CAPTURED_REVIEW_REQUIRED' || !input.visualReviewed) blockers.push('VISUAL_NOT_HOMOLOGATED');
  if (!input.databaseIsolated) blockers.push('DB_ISOLATION_NOT_VALIDATED');
  if (!input.branchProtected) blockers.push('MAIN_NOT_PROTECTED');
  if (!input.independentReview) blockers.push('INDEPENDENT_REVIEW_REQUIRED');
  if (!input.authenticatedKernelAdmission) blockers.push('TRUSTED_KERNEL_ADMISSION_REQUIRED');
  if (!input.signedPolicyVerified) blockers.push('SIGNED_POLICY_NOT_VERIFIED');
  if (!input.rightsCleared) blockers.push('SOURCE_RIGHTS_NOT_CLEARED');
  return { outcome: blockers.length ? 'HOLD' : 'CANDIDATE_READY_FOR_EXTERNAL_AUTHORIZATION', blockers };
}

if (process.argv[1]?.endsWith('release-readiness.mjs')) {
  const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
  const get = p => JSON.parse(readFileSync(p, 'utf8'));
  const head = git('rev-parse', 'HEAD');
  const audit = get('audit/branch-canonicalization/current.json');
  const triage = get('audit/branch-canonicalization/current-triage.json');
  // Unverified external claims are always false; do not allow env overrides.
  const outcome = assessRelease({
    head, candidateSha: audit.candidate?.commit, triageSha: triage.candidate?.commit,
    unresolvedFinds: Number.MAX_SAFE_INTEGER, unreviewedConflicts: triage.counts?.total ?? 1,
    memCI: false, ciComplete: false, visualCapture: 'NOT_RUN', visualReviewed: false,
    databaseIsolated: false, branchProtected: false, independentReview: false,
    authenticatedKernelAdmission: false, signedPolicyVerified: false, rightsCleared: false,
  });
  console.log(JSON.stringify({ ...outcome, note: 'External signed admission is deliberately not emulated by this CLI' }, null, 2));
  if (outcome.outcome === 'HOLD') process.exitCode = 2;
}

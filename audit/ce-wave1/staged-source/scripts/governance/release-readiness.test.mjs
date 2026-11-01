import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assessRelease } from './release-readiness.mjs';
const head = 'a'.repeat(40);
const good = {
  head, candidateSha: head, triageSha: head, unresolvedFinds: 0, unreviewedConflicts: 0,
  memCI: true, ciComplete: true, visualCapture: 'CAPTURED_REVIEW_REQUIRED', visualReviewed: true,
  databaseIsolated: true, branchProtected: true, independentReview: true,
  authenticatedKernelAdmission: true, signedPolicyVerified: true, rightsCleared: true,
};
test('no candidate without authenticated admission', () => {
  assert(assessRelease({ ...good, authenticatedKernelAdmission: false }).blockers.includes('TRUSTED_KERNEL_ADMISSION_REQUIRED'));
});
test('zero implicit approval from capture-only CI', () => {
  assert(assessRelease({ ...good, visualReviewed: false }).blockers.includes('VISUAL_NOT_HOMOLOGATED'));
});
test('stale report blocks promotion', () => {
  assert(assessRelease({ ...good, triageSha: 'b'.repeat(40) }).blockers.includes('STALE_BRANCH_AUDIT'));
});
test('even all predicates only yield readiness for external authorization, not release', () => {
  assert.equal(assessRelease(good).outcome, 'CANDIDATE_READY_FOR_EXTERNAL_AUTHORIZATION');
});

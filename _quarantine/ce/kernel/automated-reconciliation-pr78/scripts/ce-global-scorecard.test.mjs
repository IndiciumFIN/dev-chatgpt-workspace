import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildCeScorecard } from './ce-global-scorecard.mjs';
const fixture=()=>({
  ledger:{
    protocol:'CE.BRANCH.CLOSURE.v1',
    counts:{ce_branches:48,ce_sealed:0,with_pr_complete:23},
    rows:Array.from({length:48},(_,i)=>({
      scope:'CE_CKO_NCOS_REVIEW',closure_status:'OPEN',pr_number:i<25?i+1:null
    }))
  },
  git:{ledger_ce_branches:48,source_comparison_complete:true,
    canonical_main_sha:'a'.repeat(40),
    coverage:{branches_with_tree:48,branches_missing_tree:0}},
  baseline:{protocol:'CE.CROSS.PR32.BASELINE_DIAGNOSTIC.v1',
    live_main_sha:'a'.repeat(40),comparison:{historicalOnlyCount:486},
    historical_only_vs_current_main_presence:{
      EXACT:469,PRESENT_DIFFERENT:17,SOURCE_ONLY:0,ABSENT_IN_BOTH:0,MAIN_ONLY:0
    },decision:'BASELINE_DRIFT_EXPLAINS_REST_COUNT_GAP_NOT_MISSING_FILES'},
  screen:{protocol:'CE.CROSS.PR32.SEMANTIC_SCREEN.v1',
    main_head:'a'.repeat(40),
    summary:{total:17,semantic_decisions_final:0,merge_authorized:false,
      source_branch_sealed:false},
    decision:'HOLD_INDEPENDENT_SEMANTIC_REVIEW'}
});
test('Git 48/48 is only one of ten gates, never 100% platform development',()=>{
  const out=buildCeScorecard(fixture());
  assert.deepEqual(out.gate_completion,{passed:1,total:10,percent:10});
  assert.equal(out.implementation_completion_percent,null);
  assert.equal(out.counts.pr32_semantic_approved,0);
  assert.equal(out.counts.pr32_missing,0);
  assert.equal(out.ready_to_release,false);
  assert.equal(out.gates[1].status,'HOLD');
});
test('one missing historical Git tree with honest counts removes G01',()=>{
  const f=fixture();f.git.coverage.branches_with_tree=47;
  f.git.coverage.branches_missing_tree=1;
  assert.equal(buildCeScorecard(f).gate_completion.percent,0);
});
test('invented full inventory with missing tree fails denominator',()=>{
  const f=fixture();f.git.coverage.branches_missing_tree=1;
  assert.throws(()=>buildCeScorecard(f),/CE_BRANCH_DENOMINATOR_MISMATCH/);
});
test('486 baseline count drift blocks report',()=>{
  const f=fixture();f.baseline.historical_only_vs_current_main_presence.EXACT=468;
  assert.throws(()=>buildCeScorecard(f),/PR32_486_COHORT_DRIFT/);
});
test('automated/static comparison never invents semantic approval',()=>{
  const f=fixture();f.screen.summary.semantic_decisions_final=1;
  assert.throws(()=>buildCeScorecard(f),/UNVERIFIED_SEMANTIC_APPROVAL/);
});
test('mixed main SHAs block report',()=>{
  const f=fixture();f.screen.main_head='b'.repeat(40);
  assert.throws(()=>buildCeScorecard(f),/MIXED_MAIN_BASELINES/);
});
test('branch SEALED tally mismatch blocks report',()=>{
  const f=fixture();f.ledger.rows[0].closure_status='SEALED';
  assert.throws(()=>buildCeScorecard(f),/SEALED_LEDGER_DISAGREEMENT/);
});
test('unrecognized input protocol blocks scorecard',()=>{
  const f=fixture();f.ledger.protocol='unknown';
  assert.throws(()=>buildCeScorecard(f),/UNRECOGNIZED_EVIDENCE_PROTOCOL/);
});

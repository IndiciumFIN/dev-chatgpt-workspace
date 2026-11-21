#!/usr/bin/env node
/**
 * CE/NCOS strict readiness scorecard. Public Git-only evidence.
 * Static comparison and passing CI never authorize RBAC, publication or release.
 */
import { readFileSync, mkdirSync, writeFileSync, appendFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => JSON.parse(readFileSync(resolve(ROOT, path), 'utf8'));
const count = (v, key) => {
  if (!Number.isSafeInteger(v) || v < 0) throw Error('INVALID_COUNT_' + key);
  return v;
};
const hold = (id, description) => ({id, status:'HOLD', description, proof:null});
export function buildCeScorecard({ledger, git, baseline, screen}) {
  if (ledger.protocol !== 'CE.BRANCH.CLOSURE.v1' ||
      baseline.protocol !== 'CE.CROSS.PR32.BASELINE_DIAGNOSTIC.v1' ||
      screen.protocol !== 'CE.CROSS.PR32.SEMANTIC_SCREEN.v1')
    throw Error('UNRECOGNIZED_EVIDENCE_PROTOCOL');
  const rows = ledger.rows.filter(r => r.scope === 'CE_CKO_NCOS_REVIEW');
  const pinned = count(git.ledger_ce_branches, 'GIT_PINNED');
  const compared = count(git.coverage?.branches_with_tree, 'GIT_COMPARED');
  const missingTrees = count(git.coverage?.branches_missing_tree, 'MISSING_TREES');
  if (rows.length !== ledger.counts.ce_branches || pinned !== rows.length ||
      compared > pinned || missingTrees + compared !== pinned)
    throw Error('CE_BRANCH_DENOMINATOR_MISMATCH');
  const sealed = rows.filter(x => x.closure_status === 'SEALED').length;
  if (sealed !== ledger.counts.ce_sealed) throw Error('SEALED_LEDGER_DISAGREEMENT');
  const presence = baseline.historical_only_vs_current_main_presence;
  const oldOnly = count(baseline.comparison?.historicalOnlyCount, 'HISTORICAL_ONLY');
  const exact = count(presence.EXACT, 'EXACT');
  const different = count(presence.PRESENT_DIFFERENT, 'DIFFERENT');
  const missing = count(presence.SOURCE_ONLY, 'SOURCE_ONLY') +
      count(presence.ABSENT_IN_BOTH, 'ABSENT_IN_BOTH');
  const mainOnly = count(presence.MAIN_ONLY, 'MAIN_ONLY');
  if (oldOnly !== 486 || exact !== 469 || different !== 17 || missing || mainOnly ||
      exact + different + missing + mainOnly !== oldOnly ||
      baseline.decision !== 'BASELINE_DRIFT_EXPLAINS_REST_COUNT_GAP_NOT_MISSING_FILES')
    throw Error('PR32_486_COHORT_DRIFT_REQUIRES_NEW_REVIEW');
  const reviewed = count(screen.summary?.total, 'SCREEN_TOTAL');
  const approved = count(screen.summary?.semantic_decisions_final, 'APPROVED');
  if (reviewed !== 17 || approved !== 0 || screen.summary?.merge_authorized !== false ||
      screen.summary?.source_branch_sealed !== false ||
      screen.decision !== 'HOLD_INDEPENDENT_SEMANTIC_REVIEW')
    throw Error('UNVERIFIED_SEMANTIC_APPROVAL');
  if (git.canonical_main_sha !== baseline.live_main_sha ||
      baseline.live_main_sha !== screen.main_head)
    throw Error('MIXED_MAIN_BASELINES');
  if (git.source_comparison_complete !== true)
    throw Error('GIT_EVIDENCE_INSUFFICIENT');
  const gates = [
    {id:'G01',status:compared===pinned && missingTrees===0?'EVIDENCE_PASS':'HOLD',
      description:'Native Git source-tree coverage',proof:'Git reconciliation report'},
    hold('G02','17 semantic decisions, E2E and independent review'),
    hold('G03','Auth, real RBAC, first-admin authority and OAuth'),
    hold('G04','Operational database identity per deployment'),
    hold('G05','Migrations, constraints, RLS and data integrity'),
    hold('G06','Clinical rights, evidence and publication admission'),
    hold('G07','CKO/NCOS norms, provenance, licenses and independent reviews'),
    hold('G08','Vila, Research, Simulados, i18n, a11y and UX parity'),
    hold('G09','Vercel SSR preview and production READY on approved SHA'),
    hold('G10','GitHub/Supabase/Drive semantic cross and branch SEALED')
  ];
  const passed = gates.filter(g => g.status==='EVIDENCE_PASS').length;
  return {
    protocol:'CE.NCOS.READINESS.SCORECARD.v1', evidence_scope:'PUBLIC_GIT_ONLY',
    main_sha:git.canonical_main_sha,
    counts:{git_branches_compared:compared,git_branches_total:pinned,
      pr32_historical_count_gap:oldOnly,pr32_exact:exact,
      pr32_present_different:different,pr32_missing:missing,
      pr32_pairs_compared:reviewed,pr32_semantic_approved:approved,
      branches_sealed:sealed,pr_lists_complete:ledger.counts.with_pr_complete,
      pr_lists_total:rows.filter(r=>r.pr_number!==null).length},
    gates,gate_completion:{passed,total:gates.length,percent:Number((100*passed/gates.length).toFixed(1))},
    implementation_completion_percent:null,
    real_auth_e2e_verified:false,operational_database_verified:false,
    clinical_publication_authorized:false,ready_to_merge:false,
    ready_to_release:false,ready_to_seal_branches:false,
    limitations:['This measures validated readiness gates, not application implementation.',
      'Local browser tests cannot approve real RBAC or remote clinical publishing.',
      'Private Supabase/Drive/Neon evidence and independent approvals are not included.']
  };
}
if (process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const result=buildCeScorecard({
    ledger:read('registers/governance/ce-branch-completion-20261120.v1.json'),
    git:read('audit-evidence/ce-live-reconciliation/summary.json'),
    baseline:read('audit-evidence/ce-live-reconciliation/pr32-baseline-diagnostic.json'),
    screen:read('audit-evidence/ce-live-reconciliation/pr32-17-content-screen.json')
  });
  const path=resolve(ROOT,'audit-evidence/ce-live-reconciliation/platform-readiness.json');
  mkdirSync(dirname(path),{recursive:true});
  writeFileSync(path,JSON.stringify(result,null,2)+'\n');
  console.log('CE_GLOBAL_SCORECARD',JSON.stringify({
    main_sha:result.main_sha,counts:result.counts,gates:result.gate_completion}));
  if (process.env.GITHUB_STEP_SUMMARY) {
    const c=result.counts;
    appendFileSync(process.env.GITHUB_STEP_SUMMARY,[
      '### CE/NCOS — verified release-readiness gates (not code-completion)',
      '- Verified gates: **'+result.gate_completion.passed+'/'+result.gate_completion.total+
        ' ('+result.gate_completion.percent+'%)**',
      '- Git trees: '+c.git_branches_compared+'/'+c.git_branches_total+
        '; 486 explained: '+c.pr32_exact+' exact + '+c.pr32_present_different+' changed; '+c.pr32_missing+' missing',
      '- Semantic approvals: '+c.pr32_semantic_approved+'/'+c.pr32_pairs_compared+
        '; SEALED: '+c.branches_sealed+'/'+c.git_branches_total,
      '- RBAC, deployment DB, clinical rights, E2E visual parity and Vercel remain HOLD.',
      '- No auto merge, DB writes, clinical publishing or branch deletion.\n'
    ].join('\n'));
  }
}

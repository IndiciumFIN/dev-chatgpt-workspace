import { createHash } from 'node:crypto';

const HASH40 = /^[0-9a-f]{40}$/;
const DOMAIN = 'CE_CKO_NCOS_REVIEW';

export function classifyCEPath(path) {
  if (/(^|\/)(auth|oauth|security)(\/|\.|-)/i.test(path) || /(^|\/)(\.env|credentials?|secrets?)(\.|\/|$)/i.test(path)) return ['P0', 'AUTH_AND_SECRETS'];
  if (path.startsWith('.github/workflows/') || path.startsWith('migrations/') || path.includes('/opa/') || path.includes('kernel') || path.includes('rls') || path.includes('policy-signature') || path.includes('migration-plan') || path.startsWith('src/core/governance/') || path.startsWith('infra/') || path === 'scripts/migrate.mjs') return ['P0', 'MIGRATIONS_GOVERNANCE_CI'];
  if (path.startsWith('docs/evidence/') || path.endsWith('.pdf') || /(^|\/)LICENSE(\.|$)/i.test(path)) return ['P0', 'NORMATIVE_LICENSE'];
  if (path === 'package.json' || path === 'package-lock.json' || path.startsWith('contracts/') || path.startsWith('src/') || path.startsWith('scripts/') || path.startsWith('tests/') || path.startsWith('registers/canonical/')) return ['P1', 'APPLICATION_CKO_TESTS'];
  return ['P2', 'STATIC_HISTORY_DOCS'];
}

export function parseGitLsTree(bytes) {
  if (!Buffer.isBuffer(bytes)) throw new TypeError('ls-tree must provide raw bytes');
  const out = new Map();
  let begin = 0;
  while (begin < bytes.length) {
    const end = bytes.indexOf(0, begin);
    if (end === -1) throw Error('UNCLOSED_GIT_TREE_RECORD');
    const record = bytes.subarray(begin, end);
    const tab = record.indexOf(9);
    if (tab <= 0) throw Error('MALFORMED_GIT_TREE_RECORD');
    const metadata = record.subarray(0, tab).toString('ascii');
    const m = /^(\d{6}) (blob|commit) ([0-9a-f]{40})$/.exec(metadata);
    if (!m) throw Error('UNEXPECTED_GIT_TREE_RECORD');
    const path = record.subarray(tab + 1).toString('utf8');
    if (!path || path.includes('\ufffd') || out.has(path)) throw Error('INVALID_OR_DUPLICATE_GIT_PATH');
    out.set(path, { mode: m[1], type: m[2], sha: m[3] });
    begin = end + 1;
  }
  return out;
}

export function reconcileBranchTrees({ledger, currentMainSha, remoteRefs, treesBySha, maxDetails=20000}) {
  if (!ledger || ledger.protocol !== 'CE.BRANCH.CLOSURE.v1' || !Array.isArray(ledger.rows)) throw Error('INVALID_PINNED_LEDGER');
  if (!HASH40.test(currentMainSha) || remoteRefs.get('main') !== currentMainSha) throw Error('CANONICAL_MAIN_REF_MISMATCH');
  const ce = ledger.rows.filter(x => x.scope === DOMAIN);
  if (ce.length !== ledger.counts?.ce_branches || new Set(ce.map(x=>x.branch)).size !== ce.length) throw Error('CE_LEDGER_COUNT_OR_DUPLICATE');
  const isolated = ledger.rows.filter(x=>x.scope === 'WUTRIB_ISOLATED');
  if (isolated.length !== ledger.counts?.other_domain_isolated) throw Error('OTHER_DOMAIN_LEDGER_COUNT_DRIFT');
  const mainTree = treesBySha.get(currentMainSha);
  if (!(mainTree instanceof Map)) throw Error('MISSING_CURRENT_MAIN_TREE');
  const details = new Map(), branchRows = [], changedRefs = [], missingRefs = [], unavailableTrees = [];
  const statusCounts = { EXACT:0, SOURCE_ONLY:0, DIFFERENT_BLOB:0, MODE_OR_TYPE_CHANGED:0, CANONICAL_ONLY:0 };
  const candidatesByPriority = { P0:0, P1:0, P2:0 };
  for (const row of ce) {
    if (!HASH40.test(row.source_commit_sha)) throw Error('INVALID_PINNED_SOURCE_SHA');
    const observed = remoteRefs.get(row.branch) || null;
    if (!observed) missingRefs.push(row.branch);
    else if (observed !== row.source_commit_sha) changedRefs.push({branch:row.branch,expected_sha:row.source_commit_sha,observed_sha:observed});
    const sourceTree = treesBySha.get(row.source_commit_sha);
    if (!(sourceTree instanceof Map)) { unavailableTrees.push(row.branch); continue; }
    const counts = { exact:0, source_only:0, different_blob:0, mode_or_type_changed:0, canonical_only:0, source_files:sourceTree.size };
    for (const [path, object] of sourceTree.entries()) {
      if (!HASH40.test(object.sha) || !/^\d{6}$/.test(object.mode)) throw Error('INVALID_GIT_OBJECT');
      const incumbent = mainTree.get(path);
      if (incumbent?.sha === object.sha && incumbent?.mode === object.mode && incumbent?.type === object.type) { counts.exact++; statusCounts.EXACT++; continue; }
      const relation = incumbent == null ? 'SOURCE_ONLY' : incumbent.mode !== object.mode || incumbent.type !== object.type ? 'MODE_OR_TYPE_CHANGED' : 'DIFFERENT_BLOB';
      if (relation === 'SOURCE_ONLY') counts.source_only++;
      else if (relation === 'MODE_OR_TYPE_CHANGED') counts.mode_or_type_changed++;
      else counts.different_blob++;
      statusCounts[relation]++;
      const [priority, area] = classifyCEPath(path);
      candidatesByPriority[priority]++;
      const identity = JSON.stringify([path,object.sha,object.mode,object.type,relation,incumbent?.sha??null,incumbent?.mode??null]);
      let candidate = details.get(identity);
      if (!candidate) {
        candidate = {id:createHash('sha256').update(identity).digest('hex'),path,source_git_blob_sha:object.sha,source_mode:object.mode,source_type:object.type,relation,main_git_blob_sha:incumbent?.sha??null,main_mode:incumbent?.mode??null,priority,area,branches:[],decision:'HOLD_SEMANTIC_REVIEW',admitted:false};
        details.set(identity,candidate);
      }
      candidate.branches.push(row.branch);
    }
    for (const path of mainTree.keys()) if (!sourceTree.has(path)) {counts.canonical_only++;statusCounts.CANONICAL_ONLY++;}
    const expected = counts.exact+counts.source_only+counts.different_blob+counts.mode_or_type_changed;
    if (expected !== sourceTree.size) throw Error('SOURCE_TREE_COVERAGE_LOSS');
    branchRows.push({branch:row.branch,pinned_sha:row.source_commit_sha,observed_sha:observed,sha_matches_pinned:observed===row.source_commit_sha,pr_number:row.pr_number,scan_status:row.scan_status,source_files:counts.source_files,counts,semantic_admission:'HOLD',sealed:row.closure_status === 'SEALED'});
  }
  if (details.size > maxDetails && maxDetails > 0) throw Error('REVIEW_OBJECT_LIMIT_REACHED_MUST_SHARD');
  const recordedNames = new Set(ledger.rows.map(x=>x.branch));
  const unclassified = [...remoteRefs.keys()].filter(x=>!recordedNames.has(x)).sort();
  const report = {
    protocol:'CE.CROSS.LIVE_GIT.v1',source:'Git-only immutable content inventory; never clinical admission',
    canonical_main_sha:currentMainSha,ledger_main_historical_sha:ledger.baseline_main_sha,
    ledger_ce_branches:ce.length,ledger_other_domain_excluded:isolated.length,
    coverage:{branches_with_tree:branchRows.length,branches_missing_tree:unavailableTrees.length,pinned_branches_missing_live_ref:missingRefs.length,branches_with_moved_head:changedRefs.length,unclassified_current_refs:unclassified.length},
    status_counts:statusCounts,priority_occurrences:candidatesByPriority,
    unique_review_objects:details.size,review_occurrences:statusCounts.SOURCE_ONLY+statusCounts.DIFFERENT_BLOB+statusCounts.MODE_OR_TYPE_CHANGED,
    branches:branchRows,missing_refs:missingRefs,changed_refs:changedRefs,unavailable_trees:unavailableTrees,unclassified_refs:unclassified,
    review_queue:[...details.values()].sort((a,b)=>a.priority.localeCompare(b.priority)||a.path.localeCompare(b.path)||a.id.localeCompare(b.id)),
    source_comparison_complete:branchRows.length===ce.length,
    branch_heads_fresh:missingRefs.length===0&&changedRefs.length===0,
    cross_supabase_complete:false,cross_drive_complete:false,
    semantic_approved:false,auto_merge:false,release_eligible:false,source_branches_sealed:false,
    release_gate:'HOLD_MULTISOURCE_AND_REVIEW',
  };
  const core = JSON.stringify(report);
  report.report_sha256 = createHash('sha256').update(core).digest('hex');
  return report;
}

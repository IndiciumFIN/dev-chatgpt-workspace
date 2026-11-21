import test from 'node:test';
import assert from 'node:assert/strict';
import { parseGitLsTree, reconcileBranchTrees, classifyCEPath } from './lib/ce-live-branch-reconcile-core.mjs';

const sha = s => s.repeat(40);
const obj = (s, mode='100644') => ({sha:sha(s),mode,type:'blob'});
function fixture() {
 const ledger={
   protocol:'CE.BRANCH.CLOSURE.v1',
   counts:{ce_branches:2,other_domain_isolated:1},
   baseline_main_sha:sha('d'),
   rows:[
     {branch:'ce-a',scope:'CE_CKO_NCOS_REVIEW',source_commit_sha:sha('a'),scan_status:'ROOT_TREE_SCANNED',closure_status:'OPEN',pr_number:null},
     {branch:'ce-b',scope:'CE_CKO_NCOS_REVIEW',source_commit_sha:sha('b'),scan_status:'PR_FILES_INCOMPLETE_API_LIMIT',closure_status:'OPEN',pr_number:32},
     {branch:'wutrib/a',scope:'WUTRIB_ISOLATED',source_commit_sha:sha('c')},
     {branch:'main',scope:'CANONICAL_MAIN',source_commit_sha:sha('d')}
   ]
 };
 const main=new Map([['src/shared.ts',obj('1')],['src/change.ts',obj('2')],['docs/only-in-main.md',obj('3')]]);
 const one=new Map([['src/shared.ts',obj('1')],['src/change.ts',obj('4')],['docs/source.md',obj('5')]]);
 const two=new Map([['src/shared.ts',obj('1')],['src/change.ts',obj('4')],['docs/source.md',obj('5')],['migrations/lock.sql',obj('6','100755')]]);
 return {ledger,currentMainSha:sha('f'),remoteRefs:new Map([['main',sha('f')],['ce-a',sha('a')],['ce-b',sha('b')],['wutrib/a',sha('c')],['gate/review',sha('e')]]),treesBySha:new Map([[sha('f'),main],[sha('a'),one],[sha('b'),two]])};
}
test('NUL-delimited Git tree retains spaces, tabs and UTF-8 paths',()=>{
 const r=parseGitLsTree(Buffer.from('100644 blob '+sha('a')+'\tfiles/á b\t1.txt\0','utf8'));
 assert.deepEqual(r.get('files/á b\t1.txt'),obj('a'));
});
test('reject malformed or duplicate tree records',()=>{
 assert.throws(()=>parseGitLsTree(Buffer.from('100644 blob '+sha('a')+'\tfoo')),/UNCLOSED/);
 const row='100644 blob '+sha('a')+'\tfoo\0';
 assert.throws(()=>parseGitLsTree(Buffer.from(row+row)),/DUPLICATE/);
});
test('compare every source by blob and mode; isolate WU-TRIB; deduplicate repeated objects',()=>{
 const r=reconcileBranchTrees(fixture());
 assert.equal(r.ledger_ce_branches,2);
 assert.equal(r.ledger_other_domain_excluded,1);
 assert.equal(r.coverage.branches_with_tree,2);
 assert.equal(r.status_counts.EXACT,2);
 assert.equal(r.status_counts.DIFFERENT_BLOB,2);
 assert.equal(r.status_counts.SOURCE_ONLY,3);
 assert.equal(r.status_counts.CANONICAL_ONLY,2);
 assert.equal(r.unique_review_objects,3);
 assert.equal(r.review_occurrences,5);
 assert.equal(r.review_queue.find(x=>x.path==='migrations/lock.sql').priority,'P0');
 assert.equal(r.review_queue.find(x=>x.path==='src/change.ts').branches.length,2);
 assert.deepEqual(r.unclassified_refs,['gate/review']);
 assert.equal(r.auto_merge,false);
 assert.equal(r.release_eligible,false);
 assert.equal(r.cross_drive_complete,false);
 assert.ok(r.branches.every(x=>x.semantic_admission==='HOLD'));
});
test('SHA drift and missing live ref are HOLD, not automatic repinning',()=>{
 const f=fixture();
 f.remoteRefs.set('ce-a',sha('e'));
 f.remoteRefs.delete('ce-b');
 const r=reconcileBranchTrees(f);
 assert.equal(r.coverage.branches_with_moved_head,1);
 assert.equal(r.coverage.pinned_branches_missing_live_ref,1);
 assert.equal(r.branch_heads_fresh,false);
 assert.equal(r.release_eligible,false);
});
test('missing pinned source tree never counts as complete',()=>{
 const f=fixture();
 f.treesBySha.delete(sha('b'));
 const r=reconcileBranchTrees(f);
 assert.equal(r.source_comparison_complete,false);
 assert.deepEqual(r.unavailable_trees,['ce-b']);
 assert.equal(r.coverage.branches_with_tree,1);
});
test('tampered branch count or stale main is rejected',()=>{
 const f=fixture();
 f.ledger.counts.ce_branches=3;
 assert.throws(()=>reconcileBranchTrees(f),/CE_LEDGER/);
 const g=fixture();
 g.remoteRefs.set('main',sha('1'));
 assert.throws(()=>reconcileBranchTrees(g),/CANONICAL_MAIN_REF_MISMATCH/);
});
test('prioritization identifies sensitive paths without admitting content',()=>{
 assert.deepEqual(classifyCEPath('src/lib/auth/preview.ts'),['P0','AUTH_AND_SECRETS']);
 assert.equal(classifyCEPath('migrations/test.sql')[0],'P0');
 assert.equal(classifyCEPath('src/components/a.tsx')[0],'P1');
});

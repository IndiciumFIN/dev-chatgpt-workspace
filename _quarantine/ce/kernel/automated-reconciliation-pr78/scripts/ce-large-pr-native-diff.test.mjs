import test from 'node:test';
import assert from 'node:assert/strict';
import { parseNameStatus, analyzeLargePR } from './ce-large-pr-native-diff.mjs';
const sha='a'.repeat(40);
const row={pr_number:32,branch:'canonical/local-20261101',source_commit_sha:sha,scan_status:'PR_FILES_INCOMPLETE_API_LIMIT',observed_files:500,expected_pr_changes:3};
test('Git native -z diff parses full names, unicode and whitespace',()=>{
 const a=parseNameStatus(Buffer.from('A\0one file\0M\0src/á.ts\0D\0dropped\0'));
 assert.deepEqual(a,[{status:'A',path:'one file'},{status:'M',path:'src/á.ts'},{status:'D',path:'dropped'}]);
});
test('full count is candidate and never semantic PR completion',()=>{
 const r=analyzeLargePR({row,currentMainSha:sha,observedSha:sha,mergeBaseSha:sha,files:[{status:'A',path:'a'},{status:'M',path:'b'},{status:'D',path:'c'}]});
 assert.equal(r.counts_match_original_api,true);
 assert.equal(r.status,'FULL_NATIVE_DIFF_CANDIDATE_NEEDS_REVIEW');
 assert.equal(r.git_api_changed_files_completeness_not_overwritten,true);
 assert.equal(r.auto_merge,false);
});
test('head drift or API-count mismatch must remain HOLD',()=>{
 const r=analyzeLargePR({row,currentMainSha:sha,observedSha:'b'.repeat(40),mergeBaseSha:sha,files:[{status:'A',path:'a'}]});
 assert.equal(r.status,'HOLD_COUNT_OR_HEAD_DRIFT');
});
test('malformed statuses, unfinished record or repeated path are rejected',()=>{
 assert.throws(()=>parseNameStatus(Buffer.from('R100\0a\0')),/INVALID/);
 assert.throws(()=>parseNameStatus(Buffer.from('M\0a')),/UNTERMINATED/);
 assert.throws(()=>parseNameStatus(Buffer.from('M\0a\0M\0a\0')),/DUPLICATE/);
});

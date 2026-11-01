#!/usr/bin/env node
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,sep} from 'node:path';
import assert from 'node:assert/strict';
const root=process.cwd(), x=JSON.parse(readFileSync('registers/canonical/recovery-crosswalk.20261101.v1.json','utf8'));
const m=JSON.parse(readFileSync('audit/ce-continuity/CE_MASTER_RECOVERY_REGISTER_20261101.json','utf8'));
assert.equal(x.authority,'EVIDENCE_ONLY_CANDIDATE_HOLD');
assert.equal(x.branch_heads.length,29);assert.equal(new Set(x.branch_heads.map(v=>v.name)).size,29);
assert.equal(m.sources.length,9);assert.equal(m.lineage.length,6);
const blob=b=>createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');
const stats={};let checked=0;const keys=new Set();
for(const e of x.entries){
 assert.match(e.blob_sha,/^[a-f0-9]{40}$/);assert.equal(e.kernel_admitted,false);assert.notEqual(e.disposition,'ADMITTED');
 const k=[e.kind,e.source_ref,e.source_path,e.canonical_path].join('|');assert(!keys.has(k),'Duplicate '+k);keys.add(k);
 stats[e.disposition]=(stats[e.disposition]||0)+1;
 if(e.disposition==='SOURCE_ONLY_HOLD'){assert.equal(e.canonical_path,null);continue;}
 assert(e.canonical_path&&!e.canonical_path.startsWith('/')&&!e.canonical_path.split('/').includes('..'));
 const dest=resolve(root,e.canonical_path);assert(dest.startsWith(root+sep)&&existsSync(dest),'Missing '+e.canonical_path);
 assert.equal(blob(readFileSync(dest)),e.blob_sha,'Drift '+e.canonical_path);checked++;
 if(e.disposition==='MIRROR_IDENTICAL_HOLD'){
  assert(existsSync(e.source_path),'Mirror missing '+e.source_path);
  assert.equal(blob(readFileSync(e.source_path)),e.blob_sha,'Mirror drift '+e.source_path);
 }
}
assert.equal(stats.MIRROR_IDENTICAL_HOLD,57);assert.equal(stats.ALIAS_SAME_BLOB_HOLD,40);assert.equal(stats.SOURCE_ONLY_HOLD,3);
assert.equal(x.entries.filter(e=>e.kind==='UI_TEMPLATE').length,12);
assert.equal(x.entries.filter(e=>e.kind==='PROFILE').length,8);
console.log('PASS: '+checked+' blobs checked; 57 mirrors, 40 legacy aliases, 3 registry variants HOLD, 9 backups');

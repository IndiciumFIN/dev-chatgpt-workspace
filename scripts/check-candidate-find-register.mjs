import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
const reg=JSON.parse(readFileSync('registers/governance/find-register.v1.json','utf8'));
const q=JSON.parse(readFileSync('registers/pmo/queue.v1.json','utf8'));
const batch=reg.candidate_batches?.find(x=>x.batch_id==='CKO-COREN-COFEN-AUDIT-20261023');
assert(batch && batch.status==='CANDIDATE_HOLD' && batch.admission==='NOT_ADMITTED' && batch.write_permission===false);
assert.equal(batch.cko_workspace_zip_received,false);
const original=JSON.parse(readFileSync(batch.items_ref,'utf8'));
assert.equal(batch.source_archive_sha256,original.sourcePackageSha256);
assert.equal(original.itemCount,17);
assert.equal(original.items.length,17);
assert.equal(batch.count,17);
assert.equal(batch.p0,9);assert.equal(batch.p1,8);
assert.deepEqual(original.items.map(x=>x.id),batch.item_ids);
assert.equal(new Set(batch.item_ids).size,17);
assert(original.items.every(x=>['P0','P1'].includes(x.priority) && ['title','state','evidence','acceptance','next_action','owner','origin'].every(k=>typeof x[k]==='string'&&x[k].trim().length>1)));
assert.equal(reg.finds.filter(x=>batch.item_ids.includes(x.canonical_id)).length,0,'Candidato promovido sem admissão');
assert.equal(q.items.filter(x=>x.id===batch.related_wo).length,1);
assert.equal(q.items.find(x=>x.id===batch.related_wo).status,'QUEUED');
assert.equal(q.items.at(-1).id,'WO-HOM-001');
for(const file of batch.checked_content_sha256) {
  assert.equal(createHash('sha256').update(readFileSync(file.path)).digest('hex'),file.sha256,'Divergência hash '+file.path);
}
const panel=readFileSync('src/components/admin/pmo-panel.tsx','utf8');
assert(panel.includes('data-testid="pmo-candidate-finds"')&&panel.includes('candidates.items.map('));
console.log('PASS candidate FINDs: 17 (9 P0, 8 P1), 4 hashes, PMO vinculado, sem admissão');

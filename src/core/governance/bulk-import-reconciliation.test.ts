import {describe,it} from 'node:test';
import assert from 'node:assert/strict';
import {importProfiles,parseBulkImport,reviewBulkImport,suggestedMapping} from './bulk-import.ts';
import {catalogLookupSql,reconcileImportReview,type ReadOnlyCatalogLookup} from './bulk-import-reconciliation.ts';
const profile=importProfiles.find(p=>p.id==='policies')!;
const csv='policy_id;version;category;description;severity_on_violation;action_on_violation;rule_json;active\n'+
 'POL-1;1.0.0;governance;Sem alteração;D2;BLOCK;"{""permit"":false}";false\n'+
 'POL-2;1.0.0;governance;Novo;D2;BLOCK;"{""permit"":false}";false\n'+
 'POL-3;1.0.0;governance;Alterada;D2;BLOCK;"{""permit"":false}";false\n'+
 'POL-4;1.0.0;governance;=2+2;D2;BLOCK;"{""permit"":false}";false\n';
const parsed=parseBulkImport('policy.csv',csv);
const review=reviewBulkImport(parsed,profile,suggestedMapping(parsed,profile));
const existing={
 policy_id:'POL-1',version:'1.0.0',category:'governance',description:'Sem alteração',
 severity_on_violation:'D2',action_on_violation:'BLOCK',rule_json:{permit:false},active:false,
};
const altered={...existing,policy_id:'POL-3',description:'Versão anterior'};
const complete:ReadOnlyCatalogLookup=async request=>({
 destination:request.destination,primaryKey:request.primaryKey,requestedIds:request.identifiers,
 rows:[{identifier:'POL-1',data:existing,versionRef:'rev-A'}, {identifier:'POL-3',data:altered,versionRef:'rev-C'}],
 snapshotRef:'snapshot-read-only-001',capturedAt:'2026-10-26T12:00:00Z',
});
describe('reconciliation never admits an import',()=>{
 it('without a live reader, nothing is presumed NEW',async()=>{
   const report=await reconcileImportReview(review,profile);
   assert.equal(report.counts.HOLD_NO_CATALOG,3);
   assert.equal(report.counts.HOLD_INVALID_ROW,1);
   assert.equal(report.counts.NEW_CANDIDATE,0);
   assert.equal(report.databaseMutation,false);
   assert.equal(report.admission,'NOT_SUBMITTED');
 });
 it('recognizes same values, new IDs and conflicting revisions without writing',async()=>{
   const report=await reconcileImportReview(review,profile,complete);
   assert.deepEqual(report.rows.map(r=>r.classification),[
     'UNCHANGED_CANDIDATE','NEW_CANDIDATE','CONFLICT_HOLD','HOLD_INVALID_ROW',
   ]);
   assert.equal(report.rows[0].existingVersionRef,'rev-A');
   assert.deepEqual(report.rows[2].differingFields,['description']);
   assert.equal(report.authorization,'NOT_REQUESTED');
   assert.equal(report.databaseMutation,false);
   assert.equal(report.admission,'NOT_SUBMITTED');
 });
 it('treats missing requested IDs or malformed responses as HOLD, not NEW',async()=>{
   const result=await reconcileImportReview(review,profile,async request=>({
     destination:request.destination,primaryKey:request.primaryKey,requestedIds:['POL-1'],
     rows:[],snapshotRef:'partial',capturedAt:'2026-10-26T12:00:00Z',
   }));
   assert.equal(result.counts.HOLD_INCOMPLETE_LOOKUP,3);
   assert.equal(result.counts.NEW_CANDIDATE,0);
 });
 it('rejects duplicated canonical records and unauthorized extra IDs',async()=>{
   const result=await reconcileImportReview(review,profile,async request=>({
     destination:request.destination,primaryKey:request.primaryKey,requestedIds:request.identifiers,
     rows:[{identifier:'POL-1',data:existing},{identifier:'POL-1',data:existing}],
     snapshotRef:'dup',capturedAt:'2026-10-26T12:00:00Z',
   }));
   assert.equal(result.counts.HOLD_INCOMPLETE_LOOKUP,3);
 });
 it('fails closed when reader throws/offline',async()=>{
   const result=await reconcileImportReview(review,profile,async ()=>{throw Error('offline');});
   assert.equal(result.counts.HOLD_INCOMPLETE_LOOKUP,3);
 });
 it('detects invalid source and mismatched profile',async()=>{
   await assert.rejects(()=>reconcileImportReview(review,importProfiles[0]),/incompatíveis/);
 });
 it('uses allowlisted, parameterized, bounded-role server SQL only',()=>{
   for(const p of importProfiles){
     const sql=catalogLookupSql(p);
     assert.match(sql,/where \w+ = any\(\$1::text\[\]\)/);
     assert.doesNotMatch(sql,/\b(update|insert|delete|drop)\b/i);
     assert.equal(sql.split(' where ').length,2);
   }
   assert.throws(()=>catalogLookupSql({...profile,destination:'public.secrets'}),/não autorizado/);
 });
 it('does not infer equality when submitted fields differ or JSON ordering varies',async()=>{
   const result=await reconcileImportReview(review,profile,async request=>({
     destination:request.destination,primaryKey:request.primaryKey,requestedIds:request.identifiers,
     rows:[{identifier:'POL-1',data:{...existing,rule_json:{permit:false}}}],
     snapshotRef:'snap',capturedAt:'2026-10-26T12:00:00Z',
   }));
   assert.equal(result.rows[0].classification,'UNCHANGED_CANDIDATE');
 });
});

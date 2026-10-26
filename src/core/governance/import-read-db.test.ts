import {describe,it} from 'node:test';
import assert from 'node:assert/strict';
import {importProfiles,parseBulkImport,reviewBulkImport,suggestedMapping} from './bulk-import.ts';
import {withImportReadOnlySnapshot,type QueryClient} from './import-read-db.server.ts';
const profile=importProfiles.find(x=>x.id==='policies')!;
const file='policy_id;version;category;description;severity_on_violation;action_on_violation;rule_json;active\nP1;1;governance;Test;D2;BLOCK;{};false\n';
const parsed=parseBulkImport('p.csv',file);
const review=reviewBulkImport(parsed,profile,suggestedMapping(parsed,profile));
const actor={actorId:'trusted',authentication:'SERVER_SESSION_VERIFIED' as const,permissions:['governance:imports:reconcile']};
const settings={databaseUrl:'postgresql://readonly:secret@example.test/cko',expectedRole:'cko_import_reader'};
function fakeClient(role='cko_import_reader',throwOnSelect=false,overrides:Record<string,unknown>={}){
 const calls:string[]=[];
 let released=0;
 const client={
  async query(sql:string,params?:unknown[]){
   calls.push(sql);
   if(sql.startsWith('select current_user'))return{rows:[{reader_role:role,snapshot_ref:'1:2:',tx_mode:'on',elevated_role:false,can_mutate_catalogs:false,can_create_in_catalogs:false,...overrides}]};
   if(sql.startsWith('select policy_id')){
     if(throwOnSelect)throw Error('backend unavailable');
     assert.deepEqual(params,[['P1']]);
     return{rows:[]};
   }
   return{rows:[]};
  },
  release(){released++;},
 } as unknown as QueryClient;
 return{client,calls,released:()=>released};
}
describe('read-only PostgreSQL transaction discipline',()=>{
 it('starts repeatable-read, read-only transaction and verifies DB role',async()=>{
  const fake=fakeClient();
  const report=await withImportReadOnlySnapshot(actor,profile,review,settings,async()=>fake.client);
  assert.equal(report.counts.NEW_CANDIDATE,1);
  assert.equal(report.databaseMutation,false);
  assert.match(fake.calls[0],/READ ONLY/);
  assert.ok(fake.calls.some(x=>x.startsWith('select current_user')));
  assert.equal(fake.calls.at(-1),'COMMIT');
  assert.equal(fake.released(),1);
  assert.ok(fake.calls.every(sql=>!/^\s*(insert|update|delete|drop|truncate)\b/i.test(sql)));
 });
 it('rejects unexpected DB role, rolls back and releases connection',async()=>{
  const fake=fakeClient('postgres');
  await assert.rejects(withImportReadOnlySnapshot(actor,profile,review,settings,async()=>fake.client),/não verificado/);
  assert.equal(fake.calls.at(-1),'ROLLBACK');
  assert.equal(fake.released(),1);
 });
 it('rejects elevated, writable, DDL-capable or non-read-only sessions',async()=>{
  for(const overrides of [
   {elevated_role:true},{can_mutate_catalogs:true},
   {can_create_in_catalogs:true},{tx_mode:'off'},
   {can_mutate_catalogs:undefined},
  ]){
   const fake=fakeClient('cko_import_reader',false,overrides);
   await assert.rejects(withImportReadOnlySnapshot(actor,profile,review,settings,async()=>fake.client),/não verificado/);
   assert.equal(fake.calls.at(-1),'ROLLBACK');
   assert.equal(fake.released(),1);
  }
 });
 it('fails closed on DB read error, with HOLD classifications',async()=>{
  const fake=fakeClient('cko_import_reader',true);
  const result=await withImportReadOnlySnapshot(actor,profile,review,settings,async()=>fake.client);
  assert.equal(result.counts.HOLD_INCOMPLETE_LOOKUP,1);
  assert.equal(result.counts.NEW_CANDIDATE,0);
  assert.equal(fake.calls.at(-1),'COMMIT');
 });
 it('rejects caller without privilege before DB connection',async()=>{
  let called=false;
  await assert.rejects(withImportReadOnlySnapshot({...actor,permissions:[]},profile,review,settings,async()=>{called=true;return fakeClient().client;}),/não autorizada/);
  assert.equal(called,false);
 });
});

import {describe,it} from 'node:test';
import assert from 'node:assert/strict';
import {importProfiles} from './bulk-import.ts';
import {createCatalogReconciliationReader} from './import-read-service.ts';
const profile=importProfiles.find(p=>p.id==='sources')!;
const actor={actorId:'trusted-operator',authentication:'SERVER_SESSION_VERIFIED' as const,
 permissions:['governance:imports:reconcile'] as const};
describe('service read adapter — explicit authorization and bounded queries',()=>{
 it('denies unverified actors or missing backend permission',()=>{
   const factory=async()=>({snapshotRef:'s',query:async()=>[]});
   assert.throws(()=>createCatalogReconciliationReader({...actor,authentication:'USER_ASSERTED' as never},profile,factory),/não autorizada/);
   assert.throws(()=>createCatalogReconciliationReader({...actor,permissions:[]},profile,factory),/não autorizada/);
 });
 it('performs a single parameterized allowlisted SELECT without mutations',async()=>{
   let sql='',lookups:readonly string[]=[];
   const reader=createCatalogReconciliationReader(actor,profile,async()=>({
     snapshotRef:'tx-001',query:async(query,params)=>{
       sql=query;lookups=params[0];
       return [{source_id:'SRC-1',source_type:'official',title:'Reference'}];
     },
   }));
   const snapshot=await reader({destination:profile.destination,primaryKey:'source_id',identifiers:['SRC-1']});
   assert.match(sql,/^select /i);assert.doesNotMatch(sql,/\binsert\b|\bupdate\b|\bdelete\b/i);
   assert.deepEqual(lookups,['SRC-1']);
   assert.equal(snapshot.snapshotRef,'tx-001');
   assert.equal(snapshot.rows[0].identifier,'SRC-1');
 });
 it('rejects unknown table, 251 IDs, duplicates and lookup leakage',async()=>{
   const factory=async()=>({snapshotRef:'snap',query:async()=>[]});
   const reader=createCatalogReconciliationReader(actor,profile,factory);
   await assert.rejects(reader({destination:'public.users',primaryKey:'source_id',identifiers:['SRC-1']}),/fora do contrato/);
   await assert.rejects(reader({destination:profile.destination,primaryKey:'source_id',identifiers:Array.from({length:251},(_,i)=>'ID-'+i)}),/fora do contrato/);
   await assert.rejects(reader({destination:profile.destination,primaryKey:'source_id',identifiers:['SRC-1','SRC-1']}),/fora do contrato/);
   await assert.rejects(reader({destination:profile.destination,primaryKey:'source_id',identifiers:['SRC-1;DROP TABLE x']}),/fora do contrato/);
   const leaky=createCatalogReconciliationReader(actor,profile,async()=>({
     snapshotRef:'snap',query:async()=>[{source_id:'SRC-OTHER'}],
   }));
   await assert.rejects(leaky({destination:profile.destination,primaryKey:'source_id',identifiers:['SRC-1']}),/fora do escopo/);
 });
 it('does not fabricate a snapshot when database snapshot token is missing',async()=>{
   const reader=createCatalogReconciliationReader(actor,profile,async()=>({
     snapshotRef:'',query:async()=>[],
   }));
   await assert.rejects(reader({destination:profile.destination,primaryKey:'source_id',identifiers:['SRC-1']}),/Snapshot/);
 });
});

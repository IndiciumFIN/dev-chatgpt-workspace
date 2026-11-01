import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,copyFileSync,writeFileSync,rmSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {auditMigrationFiles} from './check-governance-placeholders.mjs';
const fixture=()=>mkdtempSync(join(tmpdir(),'ce-gov-'));
const historicalSql="update governance_item set approved_by = 'derby-normalizacao' where approved_by is null;\n";
const b=Buffer.from(historicalSql);
const expectedHistoricalBlob=createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');
const forward=new URL('../migrations/0048_governance_placeholder_quarantine.sql',import.meta.url);
function pair(dir){
 const a=join(dir,'0037_preencher_derby.sql'),b=join(dir,'0048_governance_placeholder_quarantine.sql');
 writeFileSync(a,historicalSql);copyFileSync(forward,b);return [a,b];
}
test('sealed legacy and scoped correction pass',()=>{const d=fixture();try{assert.deepEqual(auditMigrationFiles(pair(d),{expectedHistoricalBlob}).violations,[])}finally{rmSync(d,{recursive:true,force:true})}});
test('remediation missing fails closed',()=>{const d=fixture();try{const [a]=pair(d);assert.ok(auditMigrationFiles([a],{expectedHistoricalBlob}).violations.includes('MISSING_CORRECTIVE_0048'))}finally{rmSync(d,{recursive:true,force:true})}});
test('new synthetic approval fails closed',()=>{const d=fixture();try{const files=pair(d),p=join(d,'0049_bad.sql');writeFileSync(p,"update governance_item set approved_by = 'derby-normalizacao', status = 'aprovado';");assert.ok(auditMigrationFiles([...files,p],{expectedHistoricalBlob}).violations.some(x=>x.startsWith('SYNTHETIC_AUTHORITY:')))}finally{rmSync(d,{recursive:true,force:true})}});
test('modified historical migration rejected',()=>{const d=fixture();try{const files=pair(d);writeFileSync(files[0],'-- tampered\n');assert.ok(auditMigrationFiles(files,{expectedHistoricalBlob}).violations.includes('HISTORICAL_0037_MODIFIED'))}finally{rmSync(d,{recursive:true,force:true})}});

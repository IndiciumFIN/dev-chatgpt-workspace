import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,copyFileSync,writeFileSync,rmSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {auditMigrationFiles} from './check-governance-placeholders.mjs';
const fixture=()=>mkdtempSync(join(tmpdir(),'ce-gov-'));
const historical={
 '0037_preencher_derby.sql':"update governance_item set approved_by = 'derby-normalizacao' where approved_by is null;\n",
 '0041_passa_de_aprovacao.sql':"update ai_control set approved_by = 'derby-normalizacao' where approved_by is null;\n",
 '0043_listas_viram_tabelas.sql':"update data_specification set approved_by = 'derby-normalizacao' where status = 'rascunho';\n",
};
function gitSha(s){const b=Buffer.from(s);return createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');}
const expectedHistoricalBlobs=Object.fromEntries(Object.entries(historical).map(([k,v])=>[k,gitSha(v)]));
const options={expectedHistoricalBlobs};
const forward=new URL('../migrations/0048_governance_placeholder_quarantine.sql',import.meta.url);
function fixtures(dir){const files=[];for(const [name,sql] of Object.entries(historical)){const p=join(dir,name);writeFileSync(p,sql);files.push(p);}const b=join(dir,'0048_governance_placeholder_quarantine.sql');copyFileSync(forward,b);return [...files,b];}
test('three sealed legacy migrations and scoped correction pass',()=>{const d=fixture();try{assert.deepEqual(auditMigrationFiles(fixtures(d),options).violations,[])}finally{rmSync(d,{recursive:true,force:true})}});
test('forward remediation missing fails closed',()=>{const d=fixture();try{const files=fixtures(d).filter(p=>!p.includes('0048_'));assert.ok(auditMigrationFiles(files,options).violations.includes('MISSING_CORRECTIVE_0048'))}finally{rmSync(d,{recursive:true,force:true})}});
test('a new synthetic approval fails closed',()=>{const d=fixture();try{const files=fixtures(d),p=join(d,'0049_bad.sql');writeFileSync(p,"update governance_item set approved_by = 'derby-normalizacao', status = 'aprovado';");assert.ok(auditMigrationFiles([...files,p],options).violations.some(x=>x.startsWith('SYNTHETIC_AUTHORITY:')))}finally{rmSync(d,{recursive:true,force:true})}});
test('mutated sealed history fails closed',()=>{const d=fixture();try{const files=fixtures(d);writeFileSync(files[1],'-- tampered\n');assert.ok(auditMigrationFiles(files,options).violations.includes('HISTORICAL_MODIFIED:0041_passa_de_aprovacao.sql'))}finally{rmSync(d,{recursive:true,force:true})}});

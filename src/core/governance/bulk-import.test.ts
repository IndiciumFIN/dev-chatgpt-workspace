import {describe,it} from 'node:test';
import assert from 'node:assert/strict';
import {csvTemplate,importProfiles,LIMITS,parseBulkImport,reviewBulkImport,suggestedMapping} from './bulk-import.ts';
const policy=importProfiles.find(x=>x.id==='policies')!;
const good='policy_id;version;category;description;severity_on_violation;action_on_violation;rule_json;active\nP-1;1.0.0;governance;"Teste; com separador";D2;BLOCK;"{""deny"":true}";false\n';
describe('governed import preflight — no persistence',()=>{
 it('uses only the three canonical existing table profiles',()=>assert.deepEqual(importProfiles.map(x=>x.destination),[
  'cko_evidence.sources','cko_orch.policy_registry','cko_validation.validators'
 ]));
 it('parses semicolon and multiline quoted fields',()=>{
  const input=good.replace('Teste; com separador','Teste; com\nquebra de linha');
  const parsed=parseBulkImport('politicas.csv',input);
  assert.equal(parsed.rows.length,1);
  assert.match(parsed.rows[0].cells[3],/\n/);
  assert.equal(parsed.rows[0].line,2);
 });
 it('parses comma CSV and tab-delimited files',()=>{
  assert.equal(parseBulkImport('x.csv','policy_id,version\nP-1,1\n').delimiter,',');
  assert.equal(parseBulkImport('x.tsv','policy_id\tversion\nP-1\t1\n').format,'tsv');
 });
 it('parses JSON array of flat records',()=>{
  const parsed=parseBulkImport('x.json',JSON.stringify([{policy_id:'P-1',active:false,rule_json:{deny:true}}]));
  assert.equal(parsed.rows[0].cells[parsed.headers.indexOf('rule_json')],'{\"deny\":true}');
 });
 it('rejects exotic file types, ambiguous headers and broken quotes',()=>{
  assert.throws(()=>parseBulkImport('x.xlsx','sheet data'),/Somente CSV/);
  assert.throws(()=>parseBulkImport('x.csv','a;a\n1;2\n'),/Cabeçalhos duplicados/);
  assert.throws(()=>parseBulkImport('x.csv','a;b\n"unclosed;2'),/aspas não fechadas/);
  assert.throws(()=>parseBulkImport('x.csv','a,b;c\n1,2;3'),/ambíguo/);
 });
 it('limits file size, rows and number of columns',()=>{
  assert.throws(()=>parseBulkImport('x.csv','a,b\n'+('x'.repeat(LIMITS.maxBytes))),/5 MiB/);
  assert.throws(()=>parseBulkImport('x.csv',Array.from({length:LIMITS.maxRows+2},(_,i)=>i?'x;y':'a;b').join('\n')),/linhas/);
  assert.throws(()=>parseBulkImport('x.csv',Array.from({length:LIMITS.maxColumns+1},(_,i)=>'c'+i).join(';')+'\n'+Array.from({length:LIMITS.maxColumns+1},()=>'v').join(';')),/colunas/);
 });
 it('can auto-map canonical and localized column names',()=>{
  const parsed=parseBulkImport('x.csv','ID da política;version\nP-1;1\n');
  const map=suggestedMapping(parsed,policy);
  assert.equal(map.policy_id,'ID da política');
  assert.equal(map.version,'version');
 });
 it('marks complete policy data as candidate, never published or admitted',()=>{
  const parsed=parseBulkImport('x.csv',good);
  const out=reviewBulkImport(parsed,policy,suggestedMapping(parsed,policy));
  assert.equal(out.total,1);assert.equal(out.candidates,1);assert.equal(out.held,0);
  assert.equal(out.writeEnabled,false);assert.equal(out.admission,'NOT_SUBMITTED');
  assert.equal(out.records[0].data.active,false);
  assert.deepEqual(out.records[0].data.rule_json,{deny:true});
 });
 it('flags missing required fields, duplicated IDs, invalid JSON and formula prefixes',()=>{
  const invalid=good+'P-1;1.0.0;governance;=2+2;D2;BLOCK;{};true\nP-2;1;gov;X;D2;BLOCK;not-json;true\n';
  const result=reviewBulkImport(parseBulkImport('x.csv',invalid),policy,suggestedMapping(parseBulkImport('x.csv',invalid),policy));
  assert.equal(result.duplicates,1);
  assert.equal(result.held,2);
  assert.ok(result.issues.some(i=>i.code==='DUPLICATE_IN_BATCH'));
  assert.ok(result.issues.some(i=>i.code==='INVALID'));
  assert.equal(result.records.length,3);
 });
 it('never allows two target fields to map to same input column',()=>{
  const parsed=parseBulkImport('x.csv',good);
  assert.throws(()=>reviewBulkImport(parsed,policy,{policy_id:'version',version:'version'}),/dois campos/);
 });
 it('fails closed if required canonical columns have not been mapped',()=>{
  const parsed=parseBulkImport('x.csv','policy_id;version\nP-1;1\n');
  const result=reviewBulkImport(parsed,policy,suggestedMapping(parsed,policy));
  assert.equal(result.candidates,0);
  assert.equal(result.records[0].state,'HOLD');
  assert.ok(result.issues.some(i=>i.column==='rule_json'&&i.code==='REQUIRED'));
 });
 it('offers a controlled CSV template with no fake data',()=>{
  const template=csvTemplate(policy);
  assert.match(template,/policy_id/);
  assert.equal(template.split('\r\n').length,2);
 });
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { inspectScaleAnswers, invalidFormulaOutputIds, findClinicalBand } from '../src/lib/tools/clinical-invariants.mjs';

const root=new URL('../',import.meta.url);
const read=p=>readFileSync(new URL(p,root),'utf8');
const twoChoices=[{id:'sensorial',label:'S',help:'',choices:[{value:1,label:'A'},{value:2,label:'B'}]},
 {id:'friccao',label:'F',help:'',choices:[{value:1,label:'A'},{value:2,label:'B'},{value:3,label:'C'}]}];

test('complete valid scale selections pass; unknown answers never become a score',()=>{
 assert.deepEqual(inspectScaleAnswers(twoChoices,{sensorial:1,friccao:3}),{missing:[],invalid:[]});
 assert.deepEqual(inspectScaleAnswers(twoChoices,{sensorial:1}),{missing:['friccao'],invalid:[]});
 for(const bad of [0,99,1.5,NaN,Infinity,-Infinity]){
  const result=inspectScaleAnswers(twoChoices,{sensorial:bad,friccao:3});
  assert.deepEqual(result.invalid,['sensorial'],String(bad));
 }
});

test('numeric formula outputs must exist and be finite, including band source',()=>{
 const tool={outputs:[{id:'mlh'},{id:'gotas'}],bandFrom:'mlh'};
 assert.deepEqual(invalidFormulaOutputIds(tool,{mlh:250,gotas:83}),[]);
 assert.deepEqual(invalidFormulaOutputIds(tool,{mlh:250}),['gotas']);
 assert.deepEqual(invalidFormulaOutputIds(tool,{mlh:NaN,gotas:83}),['mlh']);
 assert.deepEqual(invalidFormulaOutputIds(tool,{mlh:Infinity,gotas:83}),['mlh']);
 assert.deepEqual(invalidFormulaOutputIds(tool,{mlh:0,gotas:0}),[],'legitimate zero is never rewritten');
});

test('continuous adult BMI thresholds are gap-free and choose the higher band at the boundary',()=>{
 const bands=[
  {min:0,max:18.5,label:'Baixo peso'},
  {min:18.5,max:25,label:'Adequado'},
  {min:25,max:30,label:'Sobrepeso'},
  {min:30,max:35,label:'Obesidade I'},
  {min:35,max:40,label:'Obesidade II'},
  {min:40,max:200,label:'Obesidade III'}
 ];
 for(const [v,expected] of [
  [18.495,'Baixo peso'],[18.5,'Adequado'],[24.995,'Adequado'],
  [25,'Sobrepeso'],[29.995,'Sobrepeso'],[30,'Obesidade I'],
  [34.995,'Obesidade I'],[35,'Obesidade II'],[39.995,'Obesidade II'],
  [40,'Obesidade III']
 ]) assert.equal(findClinicalBand(bands,v)?.label,expected,String(v));
 assert.equal(findClinicalBand(bands,Number.NaN),undefined);
 const source=read('src/lib/tools/catalog.ts');
 const imc=source.slice(source.indexOf('const imc: ClinicalTool'),source.indexOf('export const tools: ClinicalTool[]'));
 for(const bound of ['max: 18.5,','max: 25,','max: 30,','max: 35,','max: 40,'])
  assert.ok(imc.includes(bound),'raw BMI tool band must match continuous cutoffs: '+bound);
});

test('engine uses fail-closed validation and never fabricates zero on a missing output',()=>{
 const src=read('src/lib/tools/engine.ts');
 assert.match(src,/inspectScaleAnswers\(criteria, answers\)/);
 assert.match(src,/invalidFormulaOutputIds\(tool, computed.outputs\)/);
 assert.match(src,/findClinicalBand\(tool.bands, total\)/);
 assert.doesNotMatch(src,/computed\.outputs\[output\.id\]\s*\?\?\s*0/);
});

test('revoked normative link FF-009 is quarantined, not labelled RELEASED',()=>{
 const src=read('src/lib/editorial/fun-facts.seed.ts');
 const start=src.indexOf('canonical_id: "FF-009"'),end=src.indexOf('canonical_id: "FF-010"',start);
 assert.ok(start>=0&&end>start);
 const block=src.slice(start,end);
 assert.match(block,/status: "HOLD_HUMAN"/);
 assert.match(block,/rights_status: "HOLD"/);
 assert.match(block,/SRC-COFEN-736-2024/);
 assert.match(block,/Avaliação de Enfermagem/);
 assert.match(block,/Evolução de Enfermagem/);
 assert.match(block,/art\. 6º/);
 assert.doesNotMatch(block,/SRC-COFEN-RES-543|543\/2017|status: "RELEASED"/);
});

test('historical imported content stays immutable and blocked rather than silently paraphrased',()=>{
 const page=JSON.parse(read('src/lib/content/curiosidades/pages/enfermeiro-pode-prescrever-medicamentos-o-que-a-legislacao-brasileira-realmente-preve.json'));
 assert.equal(page.content_status,'BLOCKED_SOURCE');
 assert.match(JSON.stringify(page),/358\/2009/);
});


test('public editorial route always enforces RELEASED without a visitor override',()=>{
 const route=read('src/routes/curiosidades.tsx');
 assert.match(route,/if \(f\.status !== "RELEASED"\) return false/);
 assert.doesNotMatch(route,/onlyReleased|setOnlyReleased/);
 assert.doesNotMatch(route,/checked=\{onlyReleased\}/);
});

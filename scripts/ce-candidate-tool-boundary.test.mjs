import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

const catalog=read('src/lib/tools/catalog.ts');
const formulas=read('src/lib/tools/formulas.ts');
const candidates=read('src/lib/tools/candidates.review-only.ts');
const routes=read('src/lib/route-registry.ts');
const laboratoryRoute=read('src/routes/exames-laboratoriais.tsx');

test('published catalog has exactly five allowed tools and no unapproved runtime imports',()=>{
 assert.match(catalog,/export const tools: ClinicalTool\[\] = \[braden, morse, apgar, gotejamento, imc\]/);
 for(const forbidden of ['exames-laboratoriais','const aldrete:','candidateTools','examesLaboratoriais']) {
  assert.equal(catalog.includes(forbidden),false,'candidate leaked into public tool catalog: '+forbidden);
 }
 assert.match(catalog,/export function getTool\(slug: string\) \{\s*return tools\.find\(/);
});
test('public formula engine contains only approved implementations',()=>{
 for(const forbidden of ['exames-laboratoriais','examePorIndice','interpretar','leituraExame']) {
  assert.equal(formulas.includes(forbidden),false,'candidate leaked into public formulas: '+forbidden);
 }
 assert.match(formulas,/gotejamento: \(values\) =>/);
 assert.match(formulas,/imc: \(values\) =>/);
});
test('candidate Aldrete and laboratory interpretations are preserved for isolated review only',()=>{
 assert.match(candidates,/const aldrete: ClinicalTool =/);
 assert.match(candidates,/publicacao: "candidata"/);
 assert.match(candidates,/export const candidateTools: ClinicalTool\[\] = \[aldrete, examesLaboratoriais\]/);
 assert.match(candidates,/export const candidateFormulas/);
 assert.match(candidates,/examePorIndice\(values\.exame\)/);
 for(const path of ['src/lib/tools/catalog.ts','src/lib/tools/formulas.ts',
   'src/lib/route-registry.ts','src/components/tools/clinical-tool.tsx']) {
  const code=read(path);
  assert.equal(code.includes('candidates.review-only'),false,'public runtime imported review candidate: '+path);
 }
});
test('candidate routes remain known, noindex and devoid of clinical payload',()=>{
 assert.match(routes,/import \{ tools \} from "@\/lib\/tools\/catalog"/);
 assert.doesNotMatch(routes,/import .*candidateTools|import .*candidates\.review-only/);
 for(const slug of ['aldrete','exames-laboratoriais']) {
  const anchor='path: "/ferramentas/'+slug+'"';
  const i=routes.indexOf(anchor);
  assert.ok(i>=0,'known candidate route missing: '+slug);
  const item=routes.slice(i,routes.indexOf('},',i)+2);
  assert.match(item,/indexavel: false/);
 }
});
test('independent public laboratory reference library is not conflated with the unapproved tool',()=>{
 assert.match(laboratoryRoute,/from "@\/lib\/tools\/exames-laboratoriais\.data"/);
 assert.match(laboratoryRoute,/createFileRoute\("\/exames-laboratoriais"\)/);
 assert.doesNotMatch(laboratoryRoute,/candidates\.review-only/);
 const lab=read('src/lib/tools/exames-laboratoriais.data.ts');
 assert.match(lab,/export const examesData/);
});

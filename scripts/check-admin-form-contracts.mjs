#!/usr/bin/env node
/* Cobertura de labels/campos sem duplicar os schemas CKO. Sem rede e sem alteração de dados. */
import {readFileSync,existsSync} from 'node:fs';
import assert from 'node:assert/strict';
const registry=readFileSync('src/lib/admin-form-template-registry.ts','utf8');
const schemas=[...registry.matchAll(/from '\.\.\/\.\.\/contracts\/cko-schemas\/([^']+\.schema\.json)'/g)].map(m=>m[1]);
assert.ok(schemas.length>=25,'faltam templates para domínios da administração');
const map=registry.match(/export const moduleFormTemplates:[\s\S]+?\n\};/);
assert.ok(map,'catálogo módulo-template ausente');
const modules=[...map[0].matchAll(/(?:^|\n)\s*(M\d\d):\[/g)].map(m=>m[1]);
assert.equal(modules.length,21,'cada um dos 21 módulos precisa de contrato');
assert.equal(new Set(modules).size,21,'módulo duplicado');
assert.equal(new Set(schemas).size,schemas.length,'schema importado mais de uma vez');
const labelsSection=registry.slice(registry.indexOf('export const FIELD_LABELS:'),registry.indexOf('export function displayLabel'));
const keys=new Set([...labelsSection.matchAll(/(?:^|[,\n])\s*([a-z]\w*):'/gm)].map(m=>m[1]));
const fields=new Set(),required=new Set(),nested=[];
for(const filename of schemas){
 const path='contracts/cko-schemas/'+filename;
 assert.ok(existsSync(path),path+' não encontrado');
 const json=JSON.parse(readFileSync(path,'utf8'));
 assert.ok(json.$id&&json.properties&&json.required,filename+' sem estrutura mínima');
 for(const [key,value] of Object.entries(json.properties)){
  fields.add(key);
  if(json.required.includes(key))required.add(key);
  if(value?.properties){for(const nestedName of Object.keys(value.properties)){fields.add(nestedName);nested.push(filename+':'+nestedName);}}
 }
}
const missing=[...fields].filter(x=>!keys.has(x)).sort();
const requiredMissing=[...required].filter(x=>!keys.has(x));
const coverage=(fields.size-missing.length)/fields.size;
console.log(JSON.stringify({modules:modules.length,schemas:schemas.length,fields:fields.size,labelCoverage:(100*coverage).toFixed(1)+'%',requiredUnlabeled:requiredMissing,missing},null,2));
assert.deepEqual(requiredMissing,[],'labels obrigatórios ainda não foram definidos');
assert.ok(coverage>=.98,'meta de 98% dos labels canônicos não atingida');
console.log('PASS ADMIN FORMS: templates originam-se dos schemas canônicos, sem duplicar atributos.');

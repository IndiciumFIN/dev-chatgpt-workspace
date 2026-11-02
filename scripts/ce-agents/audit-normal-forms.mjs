#!/usr/bin/env node
/** Source-grounded structural indicators for 1NF→5NF; never certifies data normal forms. */
import {readFileSync,readdirSync,mkdirSync,writeFileSync} from 'node:fs';
import {join,resolve,dirname} from 'node:path';
const root=resolve(import.meta.dirname,'../..');
const dir=join(root,'audit-evidence/supabase-canonical/20261101/schemas');
const dest=join(root,'artifacts/ce-agents/relational-normal-forms-precheck.json');
const files=readdirSync(dir).filter(x=>x.endsWith('.json')).sort();
const schemas=files.map(f=>JSON.parse(readFileSync(join(dir,f),'utf8')));
const app=schemas.filter(d=>!d.isManagedSchema);
const rows=app.flatMap(d=>d.tables.map(t=>({...t,schema:d.origin.schema})));
if(schemas.length!==45||app.length!==35||rows.length!==562)throw Error('PINNED_DB_CATALOG_DRIFT');
const counts={tables:rows.length,withPrimaryKey:0,withoutPrimaryKey:0,compositePrimaryKey:0,arrays:0,jsonOrJsonb:0,repeatingGroupsSuspicion:0,missingPrimaryKeys:[],suspectedRepeatFields:[],arrayColumns:[],jsonColumns:[]};
function identifier(s){return /^[a-z_][a-z0-9_]*$/i.test(s)}
function check(t){
 const id=t.schema+'.'+t.name;
 const pk=t.constraints.filter(c=>c.type==='p');
 if(pk.length>1)throw Error('MULTIPLE_PRIMARY_KEYS:'+id);
 if(pk.length===0){counts.withoutPrimaryKey++;counts.missingPrimaryKeys.push(id);}else{
  counts.withPrimaryKey++;
  const cols=(pk[0].definition.match(/\(([^()]*)\)/)||[])[1]||'';
  if(cols.includes(','))counts.compositePrimaryKey++;
 }
 const series=new Map();
 for(const c of t.columns){
  if(!identifier(c.name))throw Error('UNSAFE_COLUMN_NAME:'+id);
  if(/\[\]$/.test(c.type)||/^_/.test(c.type)){
   counts.arrays++;counts.arrayColumns.push(id+'.'+c.name);
  }
  if(/^(json|jsonb)$/i.test(c.type)){counts.jsonOrJsonb++;counts.jsonColumns.push(id+'.'+c.name);}
  const m=c.name.match(/^(.+?)(?:_?)([1-9][0-9]?)$/);
  if(m){const k=m[1];series.set(k,(series.get(k)||[]).concat(c.name));}
 }
 for(const [k,fields] of series){
   if(fields.length>=2){counts.repeatingGroupsSuspicion++;counts.suspectedRepeatFields.push({table:id,prefix:k,fields});}
 }
}
for(const t of rows)check(t);
const report={
 recordType:'RELATIONAL_NORMAL_FORMS_SOURCE_FIRST_PRECHECK',
 source:"2026-11-01 pinned live 45-schema snapshot; local Git candidate",
 workOrder:'WO-CE-DB-SKELETON-001',reference:"IBM 1NF-5NF https://www.ibm.com/br-pt/think/topics/database-normalization",
 status:'PRECHECK_NOT_CONFORMANCE',release:'HOLD_HUMAN',counts,
 formalConformance:{'1NF':'NOT_PROVEN','2NF':'NOT_PROVEN','3NF':'NOT_PROVEN','BCNF':'NOT_PROVEN','4NF':'NOT_PROVEN','5NF':'NOT_PROVEN'},
 constraints:[
  'Absence of declared primary key is not proof of lack of logical candidate key',
  'JSONB/array use is not by itself evidence of a 1NF violation; inspect domain semantics',
  '2NF/3NF/BCNF need functional-dependency evidence; 4NF/5NF require multivalued/join dependencies',
  'Do not restructure tables based on heuristics alone; all edits require canonical WO, Kernel gates and tests',
  'No source business data or normative copyrighted texts are included.'
 ],
 originSchemas:app.map(x=>x.origin.schema).sort(),generatedFromDataTables:rows.length
};
mkdirSync(dirname(dest),{recursive:true});
writeFileSync(dest,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,counts:{tables:counts.tables,withoutPrimaryKey:counts.withoutPrimaryKey,compositePrimaryKey:counts.compositePrimaryKey,arrays:counts.arrays,jsonOrJsonb:counts.jsonOrJsonb,repeatingGroupsSuspicion:counts.repeatingGroupsSuspicion},release:'HOLD_HUMAN'}));

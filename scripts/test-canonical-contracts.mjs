import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const path=resolve(root,'registers/canonical/route-contracts.v1.json');
const original=readFileSync(path,'utf8');
try{
 const registry=JSON.parse(original);
 const missing=Object.keys(registry.routes)[0];
 delete registry.routes[missing];
 writeFileSync(path,JSON.stringify(registry));
 const result=spawnSync(process.execPath,[resolve(root,'scripts/audit-canonical-bindings.mjs')],{cwd:root,encoding:'utf8'});
 if(result.status===0||!(result.stderr??'').includes('UNREGISTERED_ROUTE_FILE'))throw Error('FAIL: missing route was not blocked');
 console.log('PASS negative test: missing route blocks canonical audit');
}finally{writeFileSync(path,original);}
const result=spawnSync(process.execPath,[resolve(root,'scripts/audit-canonical-bindings.mjs')],{cwd:root,encoding:'utf8'});
if(result.status!==0)throw Error(result.stderr||'baseline audit failed');
console.log('PASS positive test: restored contracts pass');

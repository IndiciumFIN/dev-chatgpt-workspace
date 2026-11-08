import {readFileSync, existsSync} from 'node:fs';
import {resolve} from 'node:path';
export const root=resolve(import.meta.dirname,'..');
export const file=path=>readFileSync(resolve(root,path),'utf8');
export const exists=path=>existsSync(resolve(root,path));
export function verifyAgent(name, checks){
 const findings=checks.map(({control,pass,description})=>({control,result:pass?'PASS':'FAIL',description}));
 const pass=findings.every(x=>x.result==='PASS');
 console.log(JSON.stringify({agent:name,result:pass?'PASS':'FAIL',findings},null,2));
 if(!pass)process.exitCode=1;
}
export function check(control,pass,description){return {control,pass:Boolean(pass),description}}

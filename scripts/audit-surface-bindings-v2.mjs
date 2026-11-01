import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { createHash } from 'node:crypto';
const root=resolve(import.meta.dirname,'..');
const reg=JSON.parse(readFileSync(resolve(root,'registers/canonical/surface-contracts.v2.json'),'utf8'));
const routeReg=JSON.parse(readFileSync(resolve(root,'registers/canonical/route-contracts.v1.json'),'utf8'));
const directory=resolve(root,'src/routes');
function filesAt(dir, prefix='') {
 return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?filesAt(resolve(dir,e.name),prefix+e.name+'/'):/\.(tsx|ts)$/.test(e.name)?[prefix+e.name]:[]);
}
const actual=filesAt(directory).sort(); const expected=Object.keys(reg.entries).sort();
const findings=[]; const records=[];
for(const x of actual) if(!reg.entries[x]) findings.push({id:'UNKNOWN_ROUTE',route:x});
for(const x of expected) if(!actual.includes(x)) findings.push({id:'MISSING_ROUTE',route:x});
for(const file of expected.filter(x=>actual.includes(x))){
 const spec=reg.entries[file], body=readFileSync(resolve(directory,file),'utf8');
 const imports=[...body.matchAll(/from\s+['"]([^'"]+)['"]|^\s*import\s+['"]([^'"]+)['"]/gm)].map(m=>m[1]??m[2]);
 const missing=spec.requiredImports.filter(x=>!imports.includes(x));
 for(const x of missing) findings.push({id:'MISSING_REQUIRED_IMPORT',route:file,import:x});
 if(spec.kind==='endpoint'&&spec.templateKind!==null)findings.push({id:'ENDPOINT_VISUAL_TEMPLATE',route:file});
 if(spec.role!==routeReg.routes[file]?.role || spec.templateKind!==routeReg.routes[file]?.templateKind)findings.push({id:'CONTRACT_DISAGREEMENT',route:file});
 if(spec.kind==='layout'&&!/<Outlet\b|component\s*:\s*Outlet\b/.test(body))findings.push({id:'LAYOUT_WITHOUT_OUTLET',route:file});
 if(spec.kind==='redirect'&&!/redirect\(|<Navigate/.test(body))findings.push({id:'REDIRECT_NOT_FOUND',route:file});
 if(spec.role==='administrator-local'&&/@\/lib\/(db|admin-data)/.test(body))findings.push({id:'ADMIN_REMOTE_ACCESS',route:file});
 records.push({file,kind:spec.kind,role:spec.role,templateKind:spec.templateKind,sourceSha256:createHash('sha256').update(body).digest('hex'),requiredImports:spec.requiredImports,missingImports:missing,status:missing.length?'FAIL':'STATIC_PASS'});
}
const report={schemaVersion:'2.0.0',scope:reg.scope,generatedAt:new Date().toISOString(),status:findings.length?'FAIL':'STATIC_PASS_NOT_VISUAL',summary:{total:actual.length,withExplicitContracts:records.length,findings:findings.length,visualHomologations:0},records,findings};
writeFileSync(resolve(root,'registers/canonical/surface-binding-register.v2.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report.summary));
if(findings.length){console.error(JSON.stringify(findings,null,2));process.exitCode=1;}

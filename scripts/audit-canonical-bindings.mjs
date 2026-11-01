import {readdirSync, readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {resolve, relative} from 'node:path';
import {createHash} from 'node:crypto';
const root=resolve(import.meta.dirname,'..');
const routeDir=resolve(root,'src/routes');
const files=readdirSync(routeDir,{recursive:true,withFileTypes:true}).filter(x=>x.isFile()&&/\.(tsx|ts)$/.test(x.name)).map(x=>resolve(x.parentPath,x.name)).sort();
const kinds=[...readFileSync(resolve(root,'src/lib/template-contract.ts'),'utf8').matchAll(/^\s{2}([a-z]+): \{ hero:/gm)].map(m=>m[1]);
const contracts=JSON.parse(readFileSync(resolve(root,'registers/canonical/route-contracts.v1.json'),'utf8'));
if(contracts.scope!=='CE_PUBLIC_BACKUP_ONLY'||contracts.schemaVersion!=='1.0.0')throw Error('Invalid route contracts scope/version');
const allowedRoles=new Set(['public','subscriber','administrator-local','account','authentication','system']);
const errors=[];
const records=files.map(file=>{
 const body=readFileSync(file,'utf8');
 const path=relative(root,file).replaceAll('\\','/');
 const id=relative(routeDir,file).replaceAll('\\','/');
 const match=body.match(/createFileRoute\(\s*['"`]([^'"`]+)['"`]\s*\)/);
 const actual=match?.[1]??null;
 const spec=contracts.routes[id];
 if(!spec){errors.push(`UNREGISTERED_ROUTE_FILE ${id}`);}
 else{
  if(spec.path!==actual)errors.push(`ROUTE_PATH_MISMATCH ${id}: ${actual} vs ${spec.path}`);
  if(!allowedRoles.has(spec.role))errors.push(`UNKNOWN_ROLE ${id}`);
  if(spec.templateKind!==null&&!kinds.includes(spec.templateKind))errors.push(`INVALID_TEMPLATE ${id}`);
  if(spec.templateKind===null&&!['api','layout'].includes(spec.surface))errors.push(`UNBOUND_VISUAL_ROUTE ${id}`);
  if(spec.templateKind!==null&&spec.surface!=='page')errors.push(`INVALID_SURFACE ${id}`);
 }
 return {id:`route:${id}`,file:path,route:actual,role:spec?.role??null,surface:spec?.surface??null,templateKind:spec?.templateKind??null,templateBindingStatus:spec?.templateKind?'DECLARED_UNTESTED':spec?'NOT_APPLICABLE':'UNREGISTERED',sourceSha256:createHash('sha256').update(body).digest('hex'),imports:[...body.matchAll(/from\s+['"]([^'"]+)['"]/g)].map(m=>m[1]).sort()};
});
const actualIds=new Set(records.map(r=>r.id.slice(6)));
for(const id of Object.keys(contracts.routes))if(!actualIds.has(id))errors.push(`REGISTERED_FILE_MISSING ${id}`);
const byPath=new Map();for(const r of records)if(r.route){if(byPath.has(r.route))errors.push(`DUPLICATE_ROUTE ${r.route}`);byPath.set(r.route,r.id)}
const snapshot={schemaVersion:'1.1.0',scope:'CE_PUBLIC_BACKUP_ONLY',generatedAt:new Date().toISOString(),authority:'explicit-route-contracts-no-runtime-or-visual-homologation',templateKinds:kinds,summary:{files:records.length,routesWithDefinition:records.filter(r=>r.route).length,declaredVisualBindings:records.filter(r=>r.templateKind).length,nonvisual:records.filter(r=>r.templateBindingStatus==='NOT_APPLICABLE').length,unregistered:records.filter(r=>r.templateBindingStatus==='UNREGISTERED').length,errors:errors.length},records,findings:{errors}};
const dir=resolve(root,'registers/canonical');mkdirSync(dir,{recursive:true});writeFileSync(resolve(dir,'route-template-register.v1.json'),JSON.stringify(snapshot,null,2)+'\n');
console.log(JSON.stringify(snapshot.summary,null,2));if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}

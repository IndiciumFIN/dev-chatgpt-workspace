#!/usr/bin/env node
/**
 * CE mechanical route/component source parity gate.
 * Reads committed inventory and actual source files only. Never writes, never
 * grants clinical authority, and never accepts legacy --fix behavior.
 */
import {readFileSync,readdirSync} from "node:fs";
import {resolve} from "node:path";
import {fileURLToPath,pathToFileURL} from "node:url";
const base=new URL("../",import.meta.url);
const spec=[
 {label:"routes",dir:"src/routes",contract:"contracts/entities/routes.v1.json",
  code:"CE-ROUTE-",domain:"canonical",accept:n=>n.endsWith(".tsx")&&!n.startsWith("__")},
 {label:"components",dir:"src/components/site",contract:"contracts/entities/components.v1.json",
  code:"CE-COMP-",domain:"ui",accept:n=>n.endsWith(".tsx")}
];
export function compareParity(spec,filenames,contract){
 const failures=[];
 const need=(good,why)=>{if(!good)failures.push(why);};
 need(contract?.schemaVersion===1,"schemaVersion");
 need(contract?.contract===(spec.label==="routes"?"CE-CONTRACT-ROUTES":"CE-CONTRACT-COMPONENTS"),"contract type");
 need(contract?.domain===spec.domain&&contract?.authority===spec.dir+"/","contract source authority");
 need(contract?.generatedBy==="scripts/generate-entity-contracts.mjs","generator provenance");
 need(Array.isArray(contract?.items),"items array");
 const items=Array.isArray(contract?.items)?contract.items:[];
 const expected=filenames.filter(spec.accept).sort().map(name=>({
  id:spec.code+name.slice(0,-4),file:spec.dir+"/"+name
 }));
 const seen=new Set(),paths=new Set();
 for(const item of items){
  need(item&&typeof item.id==="string"&&typeof item.file==="string","item fields");
  if(!item)continue;
  need(Object.keys(item).length===2&&Object.hasOwn(item,"id")&&Object.hasOwn(item,"file"),
    "inventory must not imply clinical authority or entitlement");
  need(!seen.has(item.id),"duplicate id");seen.add(item.id);
  need(!paths.has(item.file),"duplicate file");paths.add(item.file);
 }
 need(JSON.stringify(expected)===JSON.stringify(items),"source vs inventory mismatched");
 const crossDomain=expected.filter(x=>/calculadoras-trabalhistas/.test(x.file)).map(x=>x.file);
 return {label:spec.label,source_files:expected.length,inventory_files:items.length,
  equal:failures.length===0,failures,cross_domain_routes:crossDomain,
  clinical_authority_granted:false,release_eligible:false,write_count:0};
}
export function verifyParity(){
 const reports=spec.map(s=>{
  const filenames=readdirSync(new URL(s.dir+"/",base),{withFileTypes:true})
    .filter(entry=>entry.isFile()).map(entry=>entry.name);
  const stored=JSON.parse(readFileSync(new URL(s.contract,base),"utf8"));
  return compareParity(s,filenames,stored);
 });
 const result={protocol:"CE.SOURCE_INVENTORY.PARITY.v1",
  state:"READ_ONLY_NO_ADMISSION",reports,
  count:reports.reduce((n,r)=>n+r.source_files,0),
  failures:reports.flatMap(r=>r.failures.map(f=>r.label+":"+f)),
  remote_db_write:false,deployment_authorized:false};
 if(result.failures.length)throw Error("CE_ROUTE_COMPONENT_DRIFT:"+result.failures.join(","));
 return result;
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
 if(process.argv.length!==2){console.error("CE_ROUTE_COMPONENT_READ_ONLY: no options accepted");process.exitCode=2;}
 else try{console.log(JSON.stringify(verifyParity()));}
 catch(e){console.error(String(e?.message||e));process.exitCode=1;}
}

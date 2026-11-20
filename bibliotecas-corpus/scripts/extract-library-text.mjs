#!/usr/bin/env node
// BIB01: extract existing source text with JSON pointer. --write fails on conflicting content.
import {readFileSync,existsSync,mkdirSync,writeFileSync} from "node:fs";
import {dirname,resolve,join} from "node:path";
import {fileURLToPath} from "node:url";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"../..");
const slugs=["anatomia-fisiologia","seringa-referencia","curativos","ferimentos"];
function classify(key,value){if(/^(https?:\/\/|\/|\.{1,2}\/)/.test(value)||/\.(png|jpg|jpeg|webp|avif|svg|pdf)$/i.test(value))return"RESOURCE_REF";if(/(^|_)(id|icon|tone|type|slug|target|href|src|status|code|color|state|unit)$/.test(key))return"STRUCTURAL";return"TEXT_CANDIDATE_UNREVIEWED"}
function walk(value,pointer,key,out){if(typeof value==="string"){if(value.trim())out.push({pointer,key:key||"item",text:value,classification:classify(key||"item",value)});return;}if(Array.isArray(value)){value.forEach((v,i)=>walk(v,`${pointer}/${i}`,key,out));return;}if(value&&typeof value==="object")for(const[k,v]of Object.entries(value))walk(v,`${pointer}/${k.replace(/~/g,"~0").replace(/\//g,"~1")}`,k,out);}
const atoms=[],sources=[];
for(const slug of slugs){
 const path=`contracts/cko-bibliotecas/bindings/content/${slug}.content.json`;
 const j=JSON.parse(readFileSync(join(root,path),"utf8"));
 if(!Array.isArray(j.modules))throw Error("modules ausente: "+path);
 let n=0;
 for(let m=0;m<j.modules.length;m++){
  const mod=j.modules[m],a=[];
  walk(mod.title,`/modules/${m}/title`,"title",a);
  walk(mod.payload,`/modules/${m}/payload`,"payload",a);
  for(const row of a){n++;atoms.push({traceId:`BIB01-LOCAL-${slug}-${String(n).padStart(4,"0")}`,sourceFile:path,sourcePointer:row.pointer,libraryCandidate:`cko.library.${slug}`,moduleId:mod.module_id,fieldKey:row.key,value:row.text,classification:row.classification,evidenceStatus:"NOT_VERIFIED",publication:"HOLD_HUMAN"})}
 }
 sources.push({slug,source:path,modules:j.modules.length,atoms:n});
}
const result={schemaVersion:"1.0.0",status:"CANDIDATE_ONLY",workId:"BIB-01-TEXT",extraction:"DETERMINISTIC_JSON_POINTER_NO_GENERATIVE_SUMMARY",canonicalIdsAssigned:false,sourceLocales:["pt-BR"],sources,counts:{atoms:atoms.length,textCandidate:atoms.filter(a=>a.classification==="TEXT_CANDIDATE_UNREVIEWED").length,resourceRefs:atoms.filter(a=>a.classification==="RESOURCE_REF").length,structural:atoms.filter(a=>a.classification==="STRUCTURAL").length},items:atoms};
const out=join(root,"bibliotecas-corpus/normalized/library-content-atoms.v1.json"),serialized=JSON.stringify(result,null,2)+"\n";
if(process.argv.includes("--write")){
 if(existsSync(out)&&readFileSync(out,"utf8")!==serialized)throw Error("Divergência com corpus gerado. Não sobrescreveu.");
 if(!existsSync(out)){mkdirSync(dirname(out),{recursive:true});writeFileSync(out,serialized,"utf8")}
}
console.log(JSON.stringify({ok:true,sources,counts:result.counts,mode:process.argv.includes("--write")?"WRITE_IF_ABSENT":"VERIFY_ONLY"},null,2));

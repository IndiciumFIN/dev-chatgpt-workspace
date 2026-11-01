#!/usr/bin/env node
/**
 * Deterministic P1 evidence for root migrations. READ ONLY; no SQL execution.
 * Never infer whether a file ran in a remote database from its name or hash.
 */
import {readdirSync,readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {join,basename} from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../migrations/',import.meta.url));
const report=fileURLToPath(new URL('../artifacts/migration-collision-evidence.json',import.meta.url));
const sha256=value=>createHash('sha256').update(value).digest('hex');
const sqlBody=sql=>sql.replace(/\/\*[\s\S]*?\*\//g,'').replace(/--[^\r\n]*/g,'');
export function inventoryMigrations(entries){
 const files=entries.filter(x=>/^\d{4}_.+\.sql$/.test(x.name)).map(({name,content})=>{
  const body=sqlBody(content);
  const entities=[...body.matchAll(/\bcreate\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?"?([a-z][a-z0-9_]*)"?/gi)]
    .map(x=>x[1].toLowerCase());
  return {path:'migrations/'+basename(name),number:name.slice(0,4),sha256:sha256(content),
   statements:(body.match(/;/g)||[]).length,createdTables:[...new Set(entities)].sort(),
   hasPlainCreateTable:/\bcreate\s+table\s+(?!if\s+not\s+exists\b)/i.test(body)};
 }).sort((a,b)=>a.path.localeCompare(b.path,'en'));
 const groups=new Map();
 for(const file of files){if(!groups.has(file.number))groups.set(file.number,[]);groups.get(file.number).push(file);}
 const collisions=[...groups].filter(([,versions])=>versions.length>1).sort(([a],[b])=>a.localeCompare(b))
   .map(([number,versions])=>({number,files:versions,tableNames:[...new Set(versions.flatMap(x=>x.createdTables))].sort(),
   sameContent:versions.every(x=>x.sha256===versions[0].sha256),decision:'HOLD_HUMAN'}));
 return {schemaVersion:'1.0.0',kind:'P1_MIGRATION_NUMBER_AND_SHA_INVENTORY',
  migrationFiles:files.length,uniqueNumbers:groups.size,collidingNumbers:collisions.length,
  collisions,releaseGate:'HOLD_HUMAN',remoteDatabaseAppliedStatus:'NOT_VERIFIED',
  notes:['Not an approval to renumber, delete, apply or roll back any migration',
   'All SQL is inspected but never executed by this inventory',
   'Duplicate numbers may have independent histories; compare remote migration ledger before migration']};
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
 const entries=readdirSync(root).filter(x=>x.endsWith('.sql')).sort().map(name=>({
  name,content:readFileSync(join(root,name),'utf8')
 }));
 const inventory=inventoryMigrations(entries);
 mkdirSync(fileURLToPath(new URL('../artifacts/',import.meta.url)),{recursive:true});
 writeFileSync(report,JSON.stringify(inventory,null,2)+'\n');
 console.log(JSON.stringify({files:inventory.migrationFiles,numbers:inventory.uniqueNumbers,
  collisionGroups:inventory.collidingNumbers,gate:inventory.releaseGate,evidence:report}));
 if(process.argv.includes('--release-gate')&&inventory.collidingNumbers>0)process.exitCode=1;
}

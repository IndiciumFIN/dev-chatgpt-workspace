#!/usr/bin/env node
/** NCOS physical catalog -> metadata candidates and relationship graph.
 * Only an ephemeral PGlite instance; no network, no real DB migrations.
 */
import { PGlite } from "@electric-sql/pglite";
import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { checkRelationalModel, classifyReference } from "./lib/ncos-schema-check.mjs";

const out = new URL("../audit-evidence/ncos-relational/", import.meta.url);
const digest = input => createHash("sha256").update(input).digest("hex");
if (process.env.DATABASE_URL?.trim() || process.env.PGHOST?.trim())
  throw new Error("REFUSED_REMOTE_DB_ENV: only isolated PGlite is permitted");
const db = new PGlite();
try {
  const dir = new URL("../migrations/", import.meta.url);
  const names = (await readdir(dir)).filter(x=>x.endsWith(".sql")).sort();
  if (names.length===0)throw new Error("NO_MIGRATIONS");
  const provenance=[];
  for (const name of names){
    const sql=await readFile(new URL(name,dir),"utf8");
    try{await db.exec(sql);}catch(e){throw new Error("REPLAY_FAILED "+name+": "+e.message);}
    provenance.push({file:"migrations/"+name,sha256:digest(sql)});
  }
  const rows=async sql=>(await db.query(sql)).rows;
  const tables=await rows([
    "select c.relname::text as table_name, c.relrowsecurity as rls_enabled,",
    "c.relforcerowsecurity as rls_forced",
    "from pg_class c join pg_namespace n on n.oid=c.relnamespace",
    "where n.nspname='public' and c.relkind in ('r','p') order by c.relname"
  ].join(" "));
  const columns=await rows([
    "select c.relname::text as table_name,a.attname::text as column_name,",
    "format_type(a.atttypid,a.atttypmod) as data_type, a.attnotnull as required,",
    "pg_get_expr(d.adbin,d.adrelid) as default_expression",
    "from pg_attribute a join pg_class c on c.oid=a.attrelid",
    "join pg_namespace n on n.oid=c.relnamespace",
    "left join pg_attrdef d on d.adrelid=a.attrelid and d.adnum=a.attnum",
    "where n.nspname='public' and c.relkind in ('r','p')",
    "and a.attnum>0 and not a.attisdropped order by c.relname,a.attnum"
  ].join(" "));
  const constraints=await rows([
    "select child.relname::text as table_name,",
    "c.conname::text as name,c.contype::text as kind,",
    "parent.relname::text as target_table,",
    "pg_get_constraintdef(c.oid,true) as definition, c.convalidated as validated,",
    "c.condeferrable as deferrable,",
    "array(select a.attname::text from unnest(c.conkey) with ordinality as x(num,ord)",
    "join pg_attribute a on a.attrelid=c.conrelid and a.attnum=x.num order by x.ord) as from_columns,",
    "array(select a.attname::text from unnest(c.confkey) with ordinality as x(num,ord)",
    "join pg_attribute a on a.attrelid=c.confrelid and a.attnum=x.num order by x.ord) as to_columns",
    "from pg_constraint c join pg_class child on child.oid=c.conrelid",
    "join pg_namespace n on n.oid=child.relnamespace",
    "left join pg_class parent on parent.oid=c.confrelid",
    "where n.nspname='public' and child.relkind in ('r','p')",
    "order by child.relname,c.conname"
  ].join(" "));
  const policies=await rows([
    "select tablename::text as table_name,policyname::text as policy_name,",
    "cmd,roles::text as roles,qual,with_check",
    "from pg_policies where schemaname='public' order by tablename,policyname"
  ].join(" "));
  const entities=await rows("select name,layer_id,primary_key,purpose,links from schema_entity order by name");
  const dictionary=await rows("select entity,name,data_type,required,key_part,ref_entity,definition,syntax,unit from schema_column order by entity,name");
  const checked=checkRelationalModel({tables,columns,constraints,entities,dictionary,policies});
  const fks=constraints.filter(x=>x.kind==="f");
  const entityMeta=new Map(entities.map(e=>[e.name,e]));
  const colMeta=new Map(dictionary.map(e=>[e.entity+"."+e.name,e]));
  const pkMap=new Map(constraints.filter(e=>e.kind==="p").map(e=>[e.table_name,e.from_columns]));
  const generated=tables.map(t=>({
    name:t.table_name,primaryKey:pkMap.get(t.table_name)||[],
    layer:entityMeta.get(t.table_name)?.layer_id||"HOLD_LAYER_REVIEW",
    purpose:entityMeta.get(t.table_name)?.purpose||null,
    rlsEnabled:t.rls_enabled,columns:columns.filter(c=>c.table_name===t.table_name).map(c=>({
      ...c,
      primaryKeyPart:(pkMap.get(t.table_name)||[]).includes(c.column_name),
      referencedByForeignKeys:fks.filter(f=>f.table_name===t.table_name&&f.from_columns.includes(c.column_name)).map(f=>({
        constraint:f.name,parentTable:f.target_table,parentColumns:f.to_columns,childColumns:f.from_columns
      })),
      legacyRefEntity:colMeta.get(t.table_name+"."+c.column_name)?.ref_entity||null,
      definition:colMeta.get(t.table_name+"."+c.column_name)?.definition||null,
      metadataStatus:colMeta.has(t.table_name+"."+c.column_name)?"LEGACY_DOCUMENTED":"HOLD_MISSING_DEFINITION"
    }))
  }));
  const relations=fks.map(f=>({
    kind:"PHYSICAL_FK",child:f.table_name,parent:f.target_table,
    childColumns:f.from_columns,parentColumns:f.to_columns,
    name:f.name,definition:f.definition,validated:f.validated
  }));
  const declaredLinks=dictionary.filter(x=>x.ref_entity).map(d=>({
    kind:"DECLARED_DICTIONARY_REFERENCE",child:d.entity,parent:d.ref_entity,
    column:d.name,enforcement:classifyReference(fks,d.entity,d.name,d.ref_entity), physicallyEnforced:classifyReference(fks,d.entity,d.name,d.ref_entity)!=="UNBACKED_DECLARATION"
  }));
  let orphanBlocked=false;
  await db.exec("begin");
  try {
    await db.query("insert into tool_criterion (tool_slug,id,label,position) values ($1,$2,$3,$4)",
      ["__ncos_missing_parent_proof__","__ncos_probe__","Synthetic",1]);
  }catch(e){orphanBlocked=e?.code==="23503";}
  finally{await db.exec("rollback");}
  if(!orphanBlocked)checked.errors.push({id:"FK_ORPHAN_REJECTION_FAILED",table:"tool_criterion"});
  const gate=(checked.errors.length||checked.gaps.length||checked.holds.length)
    ?"HOLD_SCHEMA_DICTIONARY_CONSISTENCY":"SCHEMA_STATIC_PASS_NOT_RELEASE";
  const summary={
    migrations:names.length,tables:tables.length,columns:columns.length,
    primaryKeys:constraints.filter(x=>x.kind==="p").length,
    foreignKeys:fks.length,checks:constraints.filter(x=>x.kind==="c").length,
    legacyDictionaryEntities:entities.length,legacyDictionaryColumns:dictionary.length,
    errors:checked.errors.length,gaps:checked.gaps.length,
    declaredRelationsWithoutFk:checked.holds.length,orphanProbeRejected:orphanBlocked
  };
  const base={
    schemaVersion:"1.0.0",scope:"NCOS_INTEGRATED_CANDIDATE",
    source:"migrations/*.sql replayed in isolated PGlite; introspected via PostgreSQL pg_catalog",
    sourceDigest:digest(provenance.map(x=>x.file+":"+x.sha256).join("\n")),
    sourceProvenance:provenance,sourceSha:process.env.GITHUB_SHA||null,
    approved:false,productionVerified:false,releaseGate:gate
  };
  const graph={...base,kind:"RELATIONSHIP_GRAPH",physicalForeignKeys:relations,declaredLinks};
  const result={...base,kind:"SCHEMA_DICTIONARY_GOVERNANCE",summary,...checked,gate};
  const candidate={...base,kind:"GENERATED_DICTIONARY_CANDIDATE",entities:generated,
    missingDescriptionsAreNotInvented:true};
  const catalog={...base,kind:"PHYSICAL_CATALOG",tables,columns,constraints,policies};
  const delta={...base,kind:"AUTO_GENERATED_DICTIONARY_DELTA_CANDIDATE",
    missingEntities:generated.filter(t=>t.layer==="HOLD_LAYER_REVIEW").map(t=>({name:t.name,purpose:null,review:"HOLD_HUMAN"})),
    missingColumns:generated.flatMap(t=>t.columns.filter(c=>c.metadataStatus==="HOLD_MISSING_DEFINITION").map(c=>({
      entity:t.name,name:c.column_name,physicalType:c.data_type,required:c.required,
      keyPart:c.primaryKeyPart,physicalForeignKeys:c.referencedByForeignKeys,
      definition:null,review:"HOLD_DEFINITION_AND_OWNER"
    }))),
    mode:"PROPOSAL_ONLY_NO_REMOTE_WRITES",
    caveat:"Missing semantic descriptions are not inferred and no production schema_column upserts are executed."};
  const mermaid=["erDiagram",...relations.map(f=>
    "  "+f.parent.replace(/[^A-Za-z0-9_]/g,"_")+
    " ||--o{ "+f.child.replace(/[^A-Za-z0-9_]/g,"_")+
    " : "+f.name.replace(/[^A-Za-z0-9_]/g,"_")
  )].join("\n")+"\n";
  await mkdir(out,{recursive:true});
  for(const [name,content] of [
    ["catalog.v1.json",catalog],["dictionary-candidate.v1.json",candidate],
    ["relationships.v1.json",graph],["gate.v1.json",result],
    ["dictionary-delta.v1.json",delta]
  ])await writeFile(new URL(name,out),JSON.stringify(content,null,2)+"\n");
  await writeFile(new URL("relationships.v1.mmd",out),mermaid);
  console.log("NCOS_RELATIONAL_SUMMARY "+JSON.stringify(summary));
  console.log("NCOS_RELATIONAL_GATE "+gate);
  if(process.argv.includes("--enforce")&&gate!=="SCHEMA_STATIC_PASS_NOT_RELEASE")process.exitCode=1;
}finally{await db.close();}

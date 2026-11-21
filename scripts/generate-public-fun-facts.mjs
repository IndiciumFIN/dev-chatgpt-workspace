#!/usr/bin/env node
/**
 * Deterministic release-only client module. The full seed is an editorial
 * input, not a dependency of the public route. This DOES NOT grant release.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const src=resolve(root,'src/lib/editorial/fun-facts.seed.ts');
const dest=resolve(root,'src/lib/editorial/fun-facts.public.generated.ts');
const releaseRights=new Set(['PUBLIC_DOMAIN','CLEAR','LICENSED']);

export function renderPublicFacts(source) {
 const start=source.indexOf('export const FUN_FACTS_SEED: FunFact[] = [');
 if(start<0) throw Error('SOURCE_SEED_DECLARATION_MISSING');
 const end=source.indexOf('\n];',start);
 if(end<0) throw Error('SOURCE_SEED_ARRAY_END_MISSING');
 const list=source.slice(start,end);
 const blocks=[...list.matchAll(/^  \{[\s\S]*?^  \},?/gm)].map(x=>x[0].replace(/,\s*$/,''));
 const target=source.match(/const TARGET_COUNT = (\d+);/);
 if(blocks.length<1 || !target || Number(target[1])<blocks.length) throw Error('SOURCE_SCHEMA_OR_TARGET_UNEXPECTED');
 const ids=new Set();
 const accepted=[];
 for(const block of blocks) {
  const id=block.match(/^\s+canonical_id: "([^"]+)"/m)?.[1];
  const status=block.match(/^\s+status: "([^"]+)"/m)?.[1];
  const rights=block.match(/^\s+rights_status: "([^"]+)"/m)?.[1];
  const sourceId=block.match(/^\s+source_id: "([^"]+)"/m)?.[1];
  if(!id||!status||!rights||!sourceId||ids.has(id)) throw Error('BAD_OR_DUPLICATED_FACT');
  ids.add(id);
  if(status!=='RELEASED') continue;
  if(!releaseRights.has(rights)||sourceId==='SRC-A-QUALIFICAR')
    throw Error('RELEASED_WITH_UNVERIFIED_RIGHTS_OR_SOURCE_'+id);
  accepted.push(block);
 }
 const header='/**\n * GENERATED from editorial seed. Do not edit by hand.\n * This public-only file must NEVER import the full seed or include candidates.\n * Run: node scripts/generate-public-fun-facts.mjs [--check]\n * Existing RELEASED labels are not independent clinical/legal approval.\n */\n';
 return header+'import type { FunFact } from "./types";\n\n'+
   'export const PUBLIC_FUN_FACTS: FunFact[] = [\n'+accepted.join(',\n')+'\n];\n\n'+
   'export const FUN_FACTS_TOTAL = '+Number(target[1])+';\n';
}

const cli=process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url);
if(cli) {
 const generated=renderPublicFacts(readFileSync(src,'utf8'));
 if(process.argv.includes('--check')) {
  let actual='';
  try { actual=readFileSync(dest,'utf8'); }catch{}
  if(actual!==generated) {console.error('PUBLIC_FACTS_GENERATED_DRIFT');process.exitCode=1;}
  else console.log('PUBLIC_FACTS_RELEASE_ONLY_CHECK_PASS');
 } else {
  writeFileSync(dest,generated);
  console.log('PUBLIC_FACTS_GENERATED');
 }
}

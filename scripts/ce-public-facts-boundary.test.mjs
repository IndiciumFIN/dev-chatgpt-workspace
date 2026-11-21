import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderPublicFacts } from './generate-public-fun-facts.mjs';

const read=(path)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const seed=read('src/lib/editorial/fun-facts.seed.ts');
const published=read('src/lib/editorial/fun-facts.public.generated.ts');

test('public-only generated content is reproducible from the current governed seed',()=>{
 assert.equal(published,renderPublicFacts(seed),'release-only snapshot must be regenerated on every reviewed source change');
 assert.match(published,/export const PUBLIC_FUN_FACTS: FunFact\[\]/);
 assert.match(published,/export const FUN_FACTS_TOTAL = 87/);
});

test('no quarantined article or draft object appears in the compiled public data module',()=>{
 for(const forbidden of ['canonical_id: "FF-009"','status: "HOLD_HUMAN"','status: "CANDIDATE"',
  'SRC-COFEN-RES-543','SRC-A-QUALIFICAR','[Curiosidade 11 — a curar]']){
  assert.equal(published.includes(forbidden),false,'unreleased client payload leaked: '+forbidden);
 }
 assert.equal((published.match(/status: "RELEASED"/g)||[]).length,9);
});

test('public route imports generated client-safe snapshot, not full candidate seed',()=>{
 const route=read('src/routes/curiosidades.tsx');
 assert.match(route,/from "@\/lib\/editorial\/fun-facts\.public\.generated"/);
 assert.doesNotMatch(route,/fun-facts\.seed/);
 assert.doesNotMatch(route,/\bFUN_FACTS_SEED\b/);
 assert.match(route,/if \(f\.status !== "RELEASED"\) return false/);
 assert.doesNotMatch(route,/onlyReleased|setOnlyReleased/);
});

test('canonical public route contract enforces release-only import without changing route authority',()=>{
 const registry=JSON.parse(read('registers/canonical/surface-contracts.v2.json'));
 const entry=registry.entries?.['curiosidades.tsx'];
 assert.ok(entry,'curiosidades contract missing');
 assert.equal(entry.role,'public');
 assert.ok(entry.requiredImports.includes('@/lib/editorial/fun-facts.public.generated'));
 assert.equal(entry.requiredImports.includes('@/lib/editorial/fun-facts.seed'),false);
});

test('release-only generator fails closed on missing rights, duplicates and removed approval',()=>{
 const changed=seed.replace('rights_status: "PUBLIC_DOMAIN"','rights_status: "HOLD"');
 assert.notEqual(changed,seed);
 assert.throws(()=>renderPublicFacts(changed),/RELEASED_WITH_UNVERIFIED_RIGHTS/);
 const duplicated=seed.replace('canonical_id: "FF-002"','canonical_id: "FF-001"');
 assert.notEqual(duplicated,seed);
 assert.throws(()=>renderPublicFacts(duplicated),/BAD_OR_DUPLICATED_FACT/);
 const revoked=seed.replace(/canonical_id: "FF-001"([\s\S]*?)status: "RELEASED"/, 'canonical_id: "FF-001"$1status: "HOLD_HUMAN"');
 assert.notEqual(revoked,seed);
 assert.doesNotMatch(renderPublicFacts(revoked),/canonical_id: "FF-001"/);
});

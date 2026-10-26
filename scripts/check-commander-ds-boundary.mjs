#!/usr/bin/env node
/** Deterministic DS boundary audit; never updates frozen authority. */
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const read=p=>readFileSync(p,'utf8');
const contract=JSON.parse(read('contracts/entities/design-tokens.v1.json'));
const css=read('src/styles/admin-console.css');
const commander=read('src/components/admin/commander-panel.tsx');
const failures=[];
const check=(ok,code)=>{if(!ok)failures.push(code)};
check(contract.frozen===true,'DS_CONTRACT_NOT_FROZEN');
check(contract.authority==='src/lib/site-data.ts','DS_AUTHORITY_CHANGED');
const canonical=contract.items.filter(x=>x.role==='canonical');
const rejected=new Set(contract.items.filter(x=>x.role==='rejected').map(x=>x.hex.toUpperCase()));
check(canonical.length>0,'DS_NO_CANONICAL_TOKENS');
check(!/--color-[\w-]+\s*:/.test(css),'ADMIN_OVERRIDES_GLOBAL_DS_TOKENS');
check(!/#[0-9a-fA-F]{6}\b/.test(commander),'COMMANDER_LITERAL_HEX_COLOR');
const localDefinitions=[...css.matchAll(/(^|[;{\\s])(--(?:color|radius|font|space)-[\\w-]+)\\s*:/gm)].map(m=>m[2]);
check(localDefinitions.length===0,'ADMIN_LOCAL_DS_DEFINITIONS');
const forbiddenInComponent=/(?:style=\\{\\{|#[0-9a-fA-F]{3,8}\\b|className=\\{`[^\\`]*bg-\\[)/;
check(!forbiddenInComponent.test(commander),'COMMANDER_INLINE_DESIGN_OVERRIDE');
check(!/\b(fetch|axios)\s*\(/.test(commander),'COMMANDER_REMOTE_CALL');
for(const item of canonical) check(!rejected.has(item.hex.toUpperCase()),'DS_CANONICAL_REJECTED_COLLISION');
const report={status:failures.length?'FAIL':'PASS',scope:'STRUCTURAL_ONLY',authority:contract.authority,frozen:true,canonicalTokens:canonical.map(x=>x.id),unresolvedDecision:'DS_BLACK_WHITE_OWNER_DIRECTION_NOT_REFLECTED_IN_FROZEN_NAVY_CONTRACT',promotion:'HOLD_HUMAN',failures};
console.log(JSON.stringify(report,null,2));
assert.equal(failures.length,0,failures.join(','));

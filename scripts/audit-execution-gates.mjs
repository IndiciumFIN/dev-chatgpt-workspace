#!/usr/bin/env node
// Offline, fail-closed release evidence; no network or database access.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root = process.cwd();
const cases = [
  ['isolation', ['scripts/check-isolation.mjs']],
  ['context', ['scripts/check-context-invariants.mjs']],
  ['publication-structure', ['scripts/check-local-publication.mjs']],
  ['publication-behavior', ['--experimental-strip-types','scripts/test-local-publication.mjs']],
  ['surface-bindings', ['scripts/audit-surface-bindings-v2.mjs']],
  ['header-p0', ['scripts/test-header-p0.mjs']],
  ['mobile-focus', ['scripts/test-mobile-focus.mjs']],
  ['header-contracts', ['scripts/test-header-contracts.mjs']],
  ['locale-registry', ['scripts/test-locale-registry.mjs']],
  ['focus-color-i18n', ['scripts/test-focus-colors-i18n.mjs']],
  ['country-icons-a11y', ['scripts/test-country-icon-a11y.mjs']],
  ['template-contract', ['--experimental-strip-types','--import','./scripts/alias-hook.mjs','scripts/check-template-contract.mjs']],
];
const results = cases.map(([id,args])=>{ const r=spawnSync(process.execPath,args,{cwd:root,encoding:'utf8',timeout:20000});return {id,command:['node',...args].join(' '),status:r.status===0?'PASS':'FAIL',exitCode:r.status,error:r.error?.message??null,output:(r.stdout+r.stderr).slice(-1800)};});
for (const [id,path] of [['vite-bin','node_modules/.bin/vite'],['tsc-bin','node_modules/.bin/tsc'],['playwright-package','node_modules/playwright']]) results.push({id,status:existsSync(resolve(root,path))?'PRESENT':'BLOCKED',reason:'local dependency required for build/render'});
const report={schemaVersion:1,scope:'CE_PUBLIC_BACKUP_ONLY',base:'v2.6.9',generatedAt:new Date().toISOString(),remoteIntegration:'PROHIBITED',results,releaseGate:'BLOCKED'};
const out=resolve(root,'audit/execution/execution-gates-latest.json');mkdirSync(resolve(root,'audit/execution'),{recursive:true});writeFileSync(out,JSON.stringify(report,null,2)+'\n');
for(const r of results) console.log(`${r.status} ${r.id}`);
process.exit(results.every(x=>x.status==='PASS')?0:1);

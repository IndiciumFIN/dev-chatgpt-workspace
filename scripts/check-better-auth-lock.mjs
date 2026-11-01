#!/usr/bin/env node
/**
 * R82: lockfile integrity for the narrowly cherry-picked Better Auth 1.7.15 fix.
 * This static assertion does not replace npm audit or runtime OAuth tests.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
export function validate({manifest,lock}){
 assert.equal(manifest.dependencies?.['better-auth'],'1.7.15','BETTER_AUTH_MANIFEST_DRIFT');
 assert.equal(lock.lockfileVersion,3,'LOCK_SCHEMA_DRIFT');
 assert.equal(lock.packages?.['']?.dependencies?.['better-auth'],'1.7.15','LOCK_ROOT_DEPENDENCY_DRIFT');
 const keys=['better-auth','@better-auth/core','@better-auth/drizzle-adapter','@better-auth/kysely-adapter'];
 for(const key of keys){
  const dependency=lock.packages?.['node_modules/'+key];
  assert(dependency,'LOCK_DEPENDENCY_MISSING:'+key);
  assert.equal(dependency.version,'1.7.15','LOCK_SECURITY_VERSION_DRIFT:'+key);
  assert(typeof dependency.integrity==='string'&&dependency.integrity.startsWith('sha512-'),'LOCK_INTEGRITY_MISSING:'+key);
 }
 return {betterAuth:'1.7.15',verifiedDependencies:keys.length,
  auditStatus:'REQUIRES_SEPARATE_NPM_AUDIT',oauthRuntimeStatus:'NOT_VERIFIED'};
}
const current=process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url);
if(current){
 const manifest=JSON.parse(readFileSync('package.json','utf8'));
 const lock=JSON.parse(readFileSync('package-lock.json','utf8'));
 console.log('[R82-auth-lock] PASS '+JSON.stringify(validate({manifest,lock})));
}

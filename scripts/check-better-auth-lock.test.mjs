import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validate} from './check-better-auth-lock.mjs';
const load=()=>({
 manifest:JSON.parse(readFileSync('package.json','utf8')),
 lock:JSON.parse(readFileSync('package-lock.json','utf8'))
});
test('R82: Better Auth direct, root lock and adapter integrity are consistent',()=>{
 const r=validate(load());assert.equal(r.betterAuth,'1.7.14');assert.equal(r.verifiedDependencies,4);
 assert.equal(r.oauthRuntimeStatus,'NOT_VERIFIED');
});
test('R82: updating only package manifest fails closed',()=>{
 const x=load();x.manifest.dependencies['better-auth']='~1.6.30';
 assert.throws(()=>validate(x),/BETTER_AUTH_MANIFEST_DRIFT/);
});
test('R82: stale lockfile root dependency fails closed',()=>{
 const x=load();x.lock.packages[''].dependencies['better-auth']='~1.6.30';
 assert.throws(()=>validate(x),/LOCK_ROOT_DEPENDENCY_DRIFT/);
});
test('R82: vulnerable indirect adapter cannot hide under fixed direct dep',()=>{
 const x=load();x.lock.packages['node_modules/@better-auth/drizzle-adapter'].version='1.7.6';
 assert.throws(()=>validate(x),/LOCK_SECURITY_VERSION_DRIFT/);
});
test('R82: missing immutable package integrity cannot count as verified',()=>{
 const x=load();delete x.lock.packages['node_modules/better-auth'].integrity;
 assert.throws(()=>validate(x),/LOCK_INTEGRITY_MISSING/);
});

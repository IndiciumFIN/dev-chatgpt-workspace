#!/usr/bin/env node
// Historical recovery is a source integrity check, not clinical approval.
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const root='upload/ce-skeleton/ce-skeleton/';
const legacy={
 'resolver.ts':'4fb21137a302525b21d2a4a5c6d1f21ccf9564dd',
 'metamodel.ts':'beb509a9a55d31ea9501079c1e62bbbe4fe316f4',
 'profile-contracts.ts':'832bda4417c63c7cd8ef64527c1f15275f744a8f',
 'module-status.ts':'d15573b35af8f80f253447d2170a2996c31fe27f',
 'state.ts':'2719b68cfa096e6edc13aaf784d705fb43250c5c',
};
let failures=0;
for(const [name,expected] of Object.entries(legacy)){
 const path=root+'src/core/experience/'+name;
 if(!existsSync(path)){console.error('RECOVERY_MISSING',path);failures++;continue}
 const data=readFileSync(path);
 const actual=createHash('sha1').update('blob '+data.length+'\0').update(data).digest('hex');
 if(actual!==expected){console.error('RECOVERY_DRIFT',path,actual);failures++}
 if(!data.toString('utf8').includes('CANDIDATE_HOLD')){console.error('RECOVERY_STATUS_INVALID',path);failures++}
}
try {
 execFileSync(process.execPath,[root+'scripts/generate-skeleton.mjs','--check'],{stdio:'inherit'});
} catch {failures++}
if(existsSync('src/families')){
 console.error('RECOVERY_RUNTIME_COLLISION: families directory exists outside archived staging');
 failures++;
}
const status=failures?'HOLD_HUMAN':'ARCHIVE_INTEGRITY_PASS_RELEASE_STILL_HOLD';
console.log(JSON.stringify({status,historicalFamilies:865,experienceStubs:5,failures}));
if(failures)process.exitCode=1;

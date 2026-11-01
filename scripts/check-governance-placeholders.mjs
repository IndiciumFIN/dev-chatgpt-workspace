#!/usr/bin/env node
/** Fail closed when DERBY appears near approval/admission fields in migration SQL. */
import {readFileSync} from 'node:fs';
const files=process.argv.slice(2);
if(!files.length){console.error('Provide migration SQL paths');process.exit(2)}
const fields=['approved_by','approved_at','admitted_by','admitted_at','accepted_at','owner_user_id'];
let violations=0;
for(const file of files){const source=readFileSync(file,'utf8');for(const field of fields){const re=new RegExp('(?:\\b'+field+'\\b[^;]{0,500}?\\bDERBY\\b|\\bDERBY\\b[^;]{0,500}?\\b'+field+'\\b)','gi');for(const hit of source.matchAll(re)){console.error('GOVERNANCE_PLACEHOLDER',file,field,hit.index);violations++}}}
console.log(JSON.stringify({files:files.length,violations,gate:violations?'HOLD_HUMAN':'STATIC_PASS_NOT_AUTHORIZATION'}));
if(violations)process.exit(1);

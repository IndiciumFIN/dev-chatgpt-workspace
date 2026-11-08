import test from 'node:test';
import assert from 'node:assert/strict';
import {auditCrossCheck, parseEFDText,assessInputReadiness} from '../src/audit.js';
import {keys,demoEFD} from '../src/fixtures.js';
const efd=parseEFDText(demoEFD);

test('file-and-line provenance in difference finding without fiscal conformity',()=>{
 const xml=[{key:keys.diff,amount:250,sourceFile:'nfe-ficticia-2.xml'}];
 const result=auditCrossCheck(xml,efd);
 const diff=result.findings.find(f=>f.kind==='VALUE_DIFFERENCE');
 assert.ok(diff);assert.equal(diff.context.xmlFile,'nfe-ficticia-2.xml');
 assert.equal(diff.context.efdLine,3);
 assert.equal(diff.fiscalConformity,'NOT_EVALUATED');
 assert.equal(diff.causeStatus,'HYPOTHESIS_NOT_CONFIRMED');
});
test('missing XML finding links to EFD source line',()=>{
 const result=auditCrossCheck([],efd);
 const orphan=result.findings.find(f=>f.kind==='MISSING_XML' && f.context.key===keys.efdOnly);
 assert.ok(orphan);
 assert.equal(orphan.context.efdLine,4);
});
test('missing EFD finding links to XML source name',()=>{
 const result=auditCrossCheck([{key:keys.xmlOnly,amount:100,sourceFile:'only.xml'}],efd);
 const orphan=result.findings.find(f=>f.kind==='MISSING_EFD');
 assert.ok(orphan);
 assert.equal(orphan.context.xmlFile,'only.xml');
});
test('partial selected batch is incomplete even after the other source was reloaded',()=>{
 const one=[{key:keys.ok,amount:120}];
 const gate=assessInputReadiness({selectedXmlCount:2,parsedXmls:one,efd,errors:[]});
 assert.equal(gate.ready,false);
 assert.match(gate.reasons.join(' '),/parcialmente/);
});
test('fictional EFD fixture period coheres with fictional XML month',()=>{
 assert.match(demoEFD,/\|01112026\|30112026\|/);
 assert.equal(efd.c100.length,3);
});

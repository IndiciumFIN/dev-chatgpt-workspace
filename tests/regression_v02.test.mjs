import test from 'node:test';
import assert from 'node:assert/strict';
import {auditCrossCheck,assessInputReadiness,incompleteAuditReport,parseEFDText,findingsCSV} from '../src/audit.js';
import {keys,demoEFD} from '../src/fixtures.js';
const goodEFD=parseEFDText(demoEFD);
const goodXml=[{key:keys.ok,amount:120},{key:keys.diff,amount:250},{key:keys.xmlOnly,amount:100}];

test('readiness: complete fixture is valid',()=>{
  assert.deepEqual(assessInputReadiness({selectedXmlCount:3,parsedXmls:goodXml,efd:goodEFD}),{ready:true,reasons:[]});
});
test('readiness: broken XML blocks false missing-XML findings',()=>{
  const gate=assessInputReadiness({selectedXmlCount:3,parsedXmls:goodXml.slice(0,2),efd:goodEFD,errors:['XML malformado']});
  assert.equal(gate.ready,false); assert.match(gate.reasons.join(' '),/parcialmente/);
});
test('readiness: zero XML blocked',()=>assert.equal(assessInputReadiness({selectedXmlCount:0,parsedXmls:[],efd:goodEFD}).ready,false));
test('readiness: EFD missing blocks findings',()=>assert.equal(assessInputReadiness({selectedXmlCount:3,parsedXmls:goodXml,efd:null}).ready,false));
test('readiness: invalid header blocked',()=>{
  const efd={c100:goodEFD.c100,warnings:[],headerSeen:false};
  assert.equal(assessInputReadiness({selectedXmlCount:3,parsedXmls:goodXml,efd}).ready,false);
});
test('readiness: malformed C100 line blocks',()=>{
  const txt=demoEFD+'\n|C100|1|0|PART|55|00|1|1000|bad|01112026|01112026|123,00|';
  const efd=parseEFDText(txt);assert.ok(efd.warnings.length);
  assert.equal(assessInputReadiness({selectedXmlCount:3,parsedXmls:goodXml,efd}).ready,false);
});
test('incomplete report cannot claim matches or findings',()=>{
  const report=incompleteAuditReport({selectedXmlCount:3,c100Count:2,warnings:['XML inválido']});
  assert.equal(report.status,'INCOMPLETE');assert.equal(report.matches,0);assert.deepEqual(report.findings,[]);
  assert.equal(report.taxConformity,'NOT_EVALUATED');
});
test('cross-check rejects malformed entry rather than silently matching NaN',()=>{
  assert.throws(()=>auditCrossCheck([{key:keys.ok,amount:NaN}],[{key:keys.ok,amount:120}]),/inválido/);
});
test('cross-check rejects negative or non-numeric tolerances',()=>{
  assert.throws(()=>auditCrossCheck(goodXml,goodEFD,{tolerance:-1}),/Tolerância/);
  assert.throws(()=>auditCrossCheck(goodXml,goodEFD,{tolerance:'0.01'}),/Tolerância/);
});
test('key-based finding IDs remain unique even if keys share final eight digits',()=>{
  const suffix=keys.ok.slice(-8);
  const a='1'.repeat(36)+suffix, b='2'.repeat(36)+suffix;
  const result=auditCrossCheck([{key:a,amount:3},{key:b,amount:3}],[]);
  assert.equal(result.findings.length,2);
  assert.equal(new Set(result.findings.map(f=>f.id)).size,2);
});
test('orphan duplicate C100 creates duplicate finding and missing-XML finding',()=>{
  const result=auditCrossCheck([],[{key:keys.ok,amount:12},{key:keys.ok,amount:12}]);
  assert.deepEqual(result.findings.map(f=>f.kind).sort(),['DUPLICATE','MISSING_XML']);
});
test('CSV from incomplete report has no speculative finding',()=>{
  const report=incompleteAuditReport({warnings:['invalid']});
  const csv=findingsCSV(report);
  assert.ok(!csv.includes('MISSING_XML'));
});
test('cross-check output remains advisory regardless of matching',()=>{
  const report=auditCrossCheck([{key:keys.ok,amount:120}],[{key:keys.ok,amount:120}]);
  assert.equal(report.status,'COMPLETED');assert.equal(report.taxConformity,'NOT_EVALUATED');
  assert.equal(report.matches,1);assert.equal(report.findings.length,0);
});

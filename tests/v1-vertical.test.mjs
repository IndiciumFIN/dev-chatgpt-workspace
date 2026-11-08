import test from 'node:test';
import assert from 'node:assert/strict';
import {cents,money,nfeDigit,validKey,parseEfdSubset,validateERP,reconcileThreeWays,executeSyntheticSlice} from '../src/v1/vertical-core.mjs';
import {casefile,keys,context,efdHeader,c100,c190,nfe,erp} from './fixtures/v1-synthetic-case.mjs';
const copy=x=>structuredClone(x);

test('Synthetic NF-e keys preserve leading zeros and validate modulo-11 DV',()=>{
 assert.equal(keys.a.length,44);
 assert.equal(validKey(keys.a),true);
 assert.equal(validKey(keys.a.slice(0,43)+(Number(keys.a.at(-1))+1)%10),false);
 assert.equal(nfeDigit(keys.a.slice(0,43)),keys.a.at(-1));
});
test('Monetary strings are exact cents without binary float',()=>{
 assert.equal(money(cents('0.01')+cents('0.02')),'0.03');
 assert.equal(money(cents('120.00')-cents('119.99')),'0.01');
 assert.equal(money(cents('0.00')-cents('1.00')),'-1.00');
});
test('Invalid monetary quantities cannot be silently rounded',()=>{
 for(const s of ['1','0,1','0.001','NaN','-1.00','1e9',1.23,'','000.01'])assert.throws(()=>cents(s),/V1_CONTRACT_BLOCKED/);
});
test('Baseline synthetic vertical slice crosschecks three sources',()=>{
 const result=executeSyntheticSlice(casefile());
 assert.equal(result.status,'COMPLETED_TECHNICAL_SCOPE');
 assert.equal(result.totals.matched,1);
 assert.equal(result.totals.findings,3);
 assert.deepEqual(result.findings.map(x=>x.kind).sort(),
  ['MISSING_IN_SUPPLIED_POPULATION','MISSING_IN_SUPPLIED_POPULATION','THREE_WAY_AMOUNT_DIFFERENCE']);
 assert.equal(result.fiscalConformity,'NOT_EVALUATED');
 assert.equal(result.noAutomaticApproval,true);
 assert.equal(result.workpaper.approvedBy,null);
});
test('Normalized source provenance includes real deterministic digests',()=>{
 const r=executeSyntheticSlice(casefile());
 assert.match(r.provenance.efdRawSha256,/^[a-f0-9]{64}$/);
 assert.match(r.provenance.inputDigest,/^[a-f0-9]{64}$/);
 assert.deepEqual(executeSyntheticSlice(casefile()),r);
});
test('Changing EFD amount changes digest and technical reconciliation',()=>{
 const b=casefile(),a=executeSyntheticSlice(b);
 b.efdText=b.efdText.replace('249,00','250,00');
 const z=executeSyntheticSlice(b);
 assert.notEqual(z.provenance.efdRawSha256,a.provenance.efdRawSha256);
 assert.notEqual(z.runId,a.runId);
 assert.equal(z.totals.matched,2);
});
test('Missing C170 in regular own-issued NF-e never creates a false tax violation',()=>{
 const r=executeSyntheticSlice(casefile());
 assert.equal(r.efdCounts.c170,0);
 assert.ok(r.warnings.some(x=>x.includes('C170')));
 assert.equal(r.findings.some(x=>x.kind.includes('C170')),false);
});
test('Explicit C170 attaches to C100 but is not a tax-law validation',()=>{
 const b=casefile();b.efdText=b.efdText.replace(c190(), '|C170|1|P001|0|1,0|UN|120,00|0|0|0|0|'+ '\n' + c190());
 const r=executeSyntheticSlice(b);assert.equal(r.efdCounts.c170,1);
 assert.equal(r.fiscalConformity,'NOT_EVALUATED');
});
test('Missing C190 in supported own-issued document is an investigation only',()=>{
 const b=casefile(); b.efdText=b.efdText.replace(c100(keys.a,'120.00')+'\n'+c190(),c100(keys.a,'120.00'));
 const r=executeSyntheticSlice(b);
 assert.equal(r.findings.some(x=>x.kind==='C190_ABSENT_IN_SUPPORTED_CONTEXT'),true);
 assert.equal(r.findings.find(x=>x.kind==='C190_ABSENT_IN_SUPPORTED_CONTEXT').fiscalConformity,'NOT_EVALUATED');
});
test('An unsupported COD_SIT is not falsely called missing',()=>{
 const b=casefile();
 b.efdText=b.efdText.replace(c100(keys.a,'120.00'),c100(keys.a,'120.00',{status:'02'}));
 const r=executeSyntheticSlice(b);
 assert.ok(r.findings.some(x=>x.kind==='OUT_OF_SCOPE_EFD_CONTEXT'&&x.key===keys.a));
 assert.equal(r.warnings.some(x=>x.includes('fora do contexto')),true);
});
test('EFD COD_VER mismatch blocks entire run',()=>{
 const b=casefile();b.efdText=b.efdText.replace('|0000|020|','|0000|999|');
 assert.throws(()=>executeSyntheticSlice(b),/COD_VER/);
});
test('EFD missing header blocks entire run',()=>{
 const b=casefile();b.efdText=b.efdText.split('\n').slice(1).join('\n');
 assert.throws(()=>executeSyntheticSlice(b),/0000|cabeçalho/i);
});
test('EFD malformed delimiters block rather than silently skip',()=>{
 const b=casefile();b.efdText=b.efdText.replace(c190(),'C190|invalid|');
 assert.throws(()=>executeSyntheticSlice(b),/delimitadores/);
});
test('EFD model 65 explicitly outside pilot, without false claim',()=>{
 const b=casefile();b.efdText=b.efdText.replace(c100(keys.a,'120.00'),c100(keys.a,'120.00',{model:'65'}));
 const r=executeSyntheticSlice(b);
 assert.ok(r.warnings.some(x=>x.includes('C100 fora')));
 assert.ok(r.findings.some(x=>x.kind==='MISSING_IN_SUPPLIED_POPULATION'&&x.key===keys.a));
});
test('A duplicate ERP row triggers cardinality blocking rather than inflated totals',()=>{
 const b=casefile(); b.erp.push(copy(b.erp[0]));
 const r=executeSyntheticSlice(b);
 assert.equal(r.findings.some(x=>x.kind==='CARDINALITY_BLOCKED'&&x.key===keys.a),true);
 assert.equal(r.totals.matched,0);
});
test('A duplicate EFD C100 triggers cardinality blocking',()=>{
 const b=casefile();b.efdText+='\n'+c100(keys.a,'120.00')+'\n'+c190();
 const r=executeSyntheticSlice(b);
 assert.equal(r.efdCounts.duplicateC100Keys,1);
 assert.equal(r.findings.some(x=>x.kind==='CARDINALITY_BLOCKED'),true);
});
test('IDTRIB linkage yields only CANDIDATE, never confirmed tax calculation',()=>{
 const b=casefile(),r=executeSyntheticSlice(b);
 assert.equal(r.matched[0].taxSource,'FISA170_CANDIDATE_LINKED');
 assert.equal(r.fiscalConformity,'NOT_EVALUATED');
});
test('Missing IDTRIB is UNKNOWN, not an automatic assumption of TES',()=>{
 const b=casefile();b.erp[0].idtrib=null;b.erp[0].f2dRuleRef=null;b.erp[0].f2bRuleRef=null;
 const r=executeSyntheticSlice(b);
 assert.equal(r.matched[0].taxSource,'UNKNOWN_NO_IDTRIB_EVIDENCE');
});
test('IDTRIB field must match its documented TOTVS table',()=>{
 const b=casefile();b.erp[0].field='FT_IDTRIB';
 assert.throws(()=>executeSyntheticSlice(b),/não corresponde à tabela/);
});
test('Cross-organization, release or period contamination is rejected',()=>{
 for(const key of ['organization','period','release']){
  const b=casefile();b.erp[0][key]='OTHER';assert.throws(()=>executeSyntheticSlice(b),/incoerente/);
 }
});
test('No fake authenticated or authorized NF-e may enter synthetic casefile',()=>{
 const b=casefile();b.nfe[0].status='AUTHORIZED_BY_SEFAZ';
 assert.throws(()=>executeSyntheticSlice(b),/autorizada/);
});
test('Selected unsupported source model/without C100 is blocked',()=>{
 const b=casefile();b.efdText=efdHeader()+'\n|9999|2|';
 assert.throws(()=>executeSyntheticSlice(b),/sem C100/);
});
test('Unknown source organization blocks all evaluation',()=>{
 const b=casefile();b.context.organization='REAL-CLIENT';
 assert.throws(()=>executeSyntheticSlice(b),/sintética/);
});
test('Very large EFD is bounded without any benchmark claim',()=>{
 const b=casefile();b.efdText+=' ' .repeat(1048577);
 assert.throws(()=>executeSyntheticSlice(b),/1 MiB/);
});
test('Controlled accounting scope does not turn absence into fiscal conformity',()=>{
 const b=casefile(),r=executeSyntheticSlice(b);
 assert.equal(r.totals.findings,3);
 assert.ok(r.findings.every(x=>x.reviewStatus==='OPEN_NOT_APPROVED'));
 assert.ok(r.findings.every(x=>x.rootCause==='HYPOTHESIS'));
});

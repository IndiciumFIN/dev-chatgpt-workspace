import test from 'node:test';import assert from 'node:assert/strict';
import {parseEFDText,parseNFeXML,auditCrossCheck,findingsCSV,escapeCSVCell} from '../src/audit.js';
import {demoXMLs,demoEFD,keys} from '../src/fixtures.js';
function minimalDOM(key){
 const el=(name,value='',children=[],attrs={})=>({localName:name,textContent:value,children,getAttribute:(key)=>attrs[key]||null,getElementsByTagName:(tag)=>tag==='*'?children.flatMap(c=>[c,...c.getElementsByTagName('*')]):[]});
 const amount=el('vNF','120.00');const totals=el('ICMSTot','',[amount]);const total=el('total','',[totals]);const ide=el('ide','',[el('nNF','1001'),el('dhEmi','2026-11-08T09:00:00-03:00')]);const prod=el('prod','',[el('xProd','Produto fictício'),el('CFOP','5102'),el('NCM','84713012'),el('vProd','120.00')]);const det=el('det','',[prod],{nItem:'1'});const inf=el('infNFe','',[ide,total,det,el('emit','',[el('xNome','EXEMPLO')])],{Id:`NFe${key}`});const root=el('NFe','',[inf]);return {parseFromString:()=>({getElementsByTagName:()=>[root,inf,...inf.getElementsByTagName('*')]})};
}
test('demo EFD has 3 C100 and header',()=>{const r=parseEFDText(demoEFD);assert.equal(r.c100.length,3);assert.equal(r.headerSeen,true);assert.equal(r.warnings.length,0)});
test('demo finding profile: one match and three findings',()=>{const r=parseEFDText(demoEFD);const xmls=[{key:keys.ok,amount:120},{key:keys.diff,amount:250},{key:keys.xmlOnly,amount:100}];const result=auditCrossCheck(xmls,r);assert.equal(result.matches,1);assert.equal(result.findings.length,3);assert.deepEqual(result.findings.map(x=>x.kind).sort(),['MISSING_EFD','MISSING_XML','VALUE_DIFFERENCE']);assert.equal(result.taxConformity,'NOT_EVALUATED')});
test('difference amount is correct and does not imply tax conformity',()=>{const r=auditCrossCheck([{key:keys.diff,amount:250}], [{key:keys.diff,amount:249}]);assert.equal(r.findings[0].context.delta,1);assert.equal(r.findings[0].fiscalConformity,'NOT_EVALUATED');assert.equal(r.findings[0].causeStatus,'HYPOTHESIS_NOT_CONFIRMED')});
test('duplicate XML cannot be treated as match',()=>{const r=auditCrossCheck([{key:keys.ok,amount:120},{key:keys.ok,amount:120}],[{key:keys.ok,amount:120}]);assert.equal(r.matches,0);assert.equal(r.findings[0].kind,'DUPLICATE')});
test('duplicate EFD C100 cannot be treated as match',()=>{const r=auditCrossCheck([{key:keys.ok,amount:120}],[{key:keys.ok,amount:120},{key:keys.ok,amount:120}]);assert.equal(r.matches,0);assert.equal(r.findings[0].kind,'DUPLICATE')});
test('tolerance one cent',()=>{const r=auditCrossCheck([{key:keys.ok,amount:120}],[{key:keys.ok,amount:120.01}]);assert.equal(r.matches,1)});
test('rejected oversized EFD',()=>{assert.throws(()=>parseEFDText('A'.repeat(4*1024*1024+1)),/4 MB/)});
test('EFD malformed lines detected as warnings, not compliance',()=>{const r=parseEFDText('bad\n|C100|');assert.ok(r.warnings.length>=2)});
test('bad C100 key excluded',()=>{const r=parseEFDText('|0000|\n|C100|1|0|PARC|55|00|1|1001|invalid|08012026|08012026|120,00|');assert.equal(r.c100.length,0);assert.ok(r.warnings.some(x=>x.includes('chave')))});
test('XML DTD/ENTITY blocked before parser',()=>{assert.throws(()=>parseNFeXML('<!DOCTYPE foo [<!ENTITY x SYSTEM "file:///etc/passwd">]><foo/>'),/DTD/)});
test('XML missing string rejected',()=>{assert.throws(()=>parseNFeXML(''),/vazio/)});
test('XML oversized rejected',()=>{assert.throws(()=>parseNFeXML('X'.repeat(2*1024*1024+1)),/2 MB/)});
test('XML parses fields using injected DOM compatible parser',()=>{const r=parseNFeXML(demoXMLs[0],()=>minimalDOM(keys.ok));assert.equal(r.key,keys.ok);assert.equal(r.number,'1001');assert.equal(r.amount,120);assert.equal(r.items[0].cfop,'5102');assert.equal(r.source,'XML_NFE')});
test('CSV formula guard prevents sheet injection',()=>{for(const v of ['=SUM(1,2)','+1+1','-2+3','@NOW()','\t=CMD']) assert.ok(escapeCSVCell(v).includes("'"))});
test('CSV generated with explicit NOT_EVALUATED status',()=>{const c=findingsCSV(auditCrossCheck([{key:keys.xmlOnly,amount:100}],[]));assert.match(c,/NOT_EVALUATED/);assert.match(c,/MISSING_EFD/)});
test('incomplete EFD without 0000 is warning',()=>{const r=parseEFDText(`|C100|1|0|PART|55|00|1|1001|${keys.ok}|01012026|01012026|120,00|`);assert.equal(r.headerSeen,false);assert.ok(r.warnings.length>0)});
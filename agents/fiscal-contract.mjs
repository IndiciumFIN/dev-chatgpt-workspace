import {parseEFDText,auditCrossCheck,assessInputReadiness} from '../src/audit.js';
import {demoEFD,keys} from '../src/fixtures.js';
import {verifyAgent,check} from './_agent.mjs';
const efd=parseEFDText(demoEFD);
const xml=[{key:keys.ok,amount:120},{key:keys.diff,amount:250},{key:keys.xmlOnly,amount:100}];
const report=auditCrossCheck(xml,efd);
const incomplete=assessInputReadiness({selectedXmlCount:3,parsedXmls:xml.slice(0,2),efd,errors:['XML inválido']});
const duplicate=auditCrossCheck([],[{key:keys.ok,amount:120},{key:keys.ok,amount:120}]);
verifyAgent('fiscal-contract',[ 
 check('FC-001',efd.headerSeen&&efd.c100.length===3,'EFD fixture retains syntactic header and three C100'),
 check('FC-002',report.matches===1&&report.findings.length===3,'Fixture maps to one match and three findings'),
 check('FC-003',report.findings.every(f=>f.fiscalConformity==='NOT_EVALUATED'&&f.causeStatus==='HYPOTHESIS_NOT_CONFIRMED'),'No tax conformity or cause assertions'),
 check('FC-004',!incomplete.ready,'Incomplete XML batch blocks cross-check'),
 check('FC-005',duplicate.findings.some(x=>x.kind==='DUPLICATE'),'Orphan duplicate C100 is explicitly reported'),
 check('FC-006',report.findings.every(f=>f.context?.key?.length===44),'Every observed finding has a complete key'),
 check('FC-007',auditCrossCheck([{key:keys.diff,amount:250,sourceFile:'teste.xml'}],efd).findings.some(f=>f.kind==='VALUE_DIFFERENCE'&&f.context.xmlFile==='teste.xml'&&f.context.efdLine===3),'Difference finding has XML file and EFD line provenance'),
]);

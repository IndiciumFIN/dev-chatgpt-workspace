import test from 'node:test';
import assert from 'node:assert/strict';
import {auditCrossCheck,incompleteAuditReport} from '../src/audit.js';
import {demoEFD, keys} from '../src/fixtures.js';
import {parseEFDText} from '../src/audit.js';
import {createTriageLedger,recordTriage,dossierWithTriage,findingsCSVWithTriage,TRIAGE_LABELS} from '../src/triage.js';
const efd=parseEFDText(demoEFD);
const report=auditCrossCheck([{key:keys.diff,amount:250,sourceFile:'teste-ficticio.xml'}],efd);
const findingId=report.findings[0].id;
const time=()=> '2026-11-08T12:00:00.000Z';

test('triage notes are exported with no approval, no causal confirmation, no persistence',()=>{
 const ledger=createTriageLedger();
 const note=recordTriage(ledger,report,findingId,'INVESTIGATING','Verificar o arquivo fictício.',time);
 assert.equal(note.approval,'NOT_APPROVED');
 assert.equal(note.causeStatus,'HYPOTHESIS_NOT_CONFIRMED');
 const dossier=dossierWithTriage(report,ledger);
 assert.equal(dossier.format,'wutrib.synthetic.casefile.v1');
 assert.equal(dossier.persistence,'NONE');
 assert.equal(dossier.approval,'NOT_APPROVED');
 assert.equal(dossier.reviews[0].note,'Verificar o arquivo fictício.');
 assert.equal(dossier.reviewEvents.length,1);
 assert.equal(dossier.audit.taxConformity,'NOT_EVALUATED');
 assert.equal(createTriageLedger().reviews.size,0);
});
test('unrecognized triage status cannot approve/close a finding',()=>{
 const ledger=createTriageLedger();
 for(const status of ['APPROVED','CLOSED','CONFIRMED','RESOLVED']){
  assert.throws(()=>recordTriage(ledger,report,findingId,status,'Nota fictícia',time),/Estado/);
 }
 assert.equal(ledger.events.length,0);
});
test('changing triage away from pending requires an actual note',()=>{
 const ledger=createTriageLedger();
 assert.throws(()=>recordTriage(ledger,report,findingId,'NEEDS_EVIDENCE','   ',time),/observação/);
 assert.equal(ledger.revision,0);
});
test('a triage entry is forbidden for a nonfinding or an incomplete input batch',()=>{
 const ledger=createTriageLedger();
 assert.throws(()=>recordTriage(ledger,report,'not-existing','PENDING','',time),/não pertence/);
 assert.throws(()=>recordTriage(ledger,incompleteAuditReport(),'not-existing','PENDING','',time),/não pertence/);
 assert.throws(()=>dossierWithTriage(incompleteAuditReport(),ledger),/Lote incompleto/);
 assert.throws(()=>findingsCSVWithTriage(incompleteAuditReport(),ledger),/Lote incompleto/);
});
test('oversized notes and NUL characters are rejected',()=>{
 const ledger=createTriageLedger();
 assert.throws(()=>recordTriage(ledger,report,findingId,'REVIEW_NOTE','x'.repeat(1201),time),/acima/);
 assert.throws(()=>recordTriage(ledger,report,findingId,'REVIEW_NOTE','texto\u0000inseguro',time),/inválida/);
});
test('CSV triage note neutralizes spreadsheet formulas and preserves header labels',()=>{
 const ledger=createTriageLedger();
 recordTriage(ledger,report,findingId,'REVIEW_NOTE','=HYPERLINK("https://exemplo.invalid")',time);
 const csv=findingsCSVWithTriage(report,ledger);
 assert.match(csv,/Nota de revisão/);
 assert.ok(csv.includes("'=HYPERLINK"));
 assert.equal(TRIAGE_LABELS.REVIEW_NOTE,'Anotação registrada');
});
test('revising a finding preserves an ordered in-memory event history',()=>{
 const ledger=createTriageLedger();
 recordTriage(ledger,report,findingId,'INVESTIGATING','Investigando',time);
 recordTriage(ledger,report,findingId,'NEEDS_EVIDENCE','Solicitar dados fictícios',time);
 const dossier=dossierWithTriage(report,ledger);
 assert.equal(ledger.reviews.size,1);
 assert.equal(dossier.reviewEvents.length,2);
 assert.deepEqual(dossier.reviewEvents.map(x=>x.sequence),[1,2]);
 assert.equal(dossier.reviews[0].status,'NEEDS_EVIDENCE');
});
test('dossier exports no reviews unrelated to the selected complete audit',()=>{
 const ledger=createTriageLedger();
 recordTriage(ledger,report,findingId,'REVIEW_NOTE','Nota antiga',time);
 const other=auditCrossCheck([{key:keys.ok,amount:120}], [{key:keys.ok,amount:110}]);
 const dossier=dossierWithTriage(other,ledger);
 assert.equal(dossier.reviews.length,0);
 assert.equal(dossier.reviewEvents.length,0);
});

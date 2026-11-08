import {verifyAgent,check,file} from './_agent.mjs';
const ui=file('src/ui.js'),triage=file('src/triage.js'),html=file('index.html'),pkg=JSON.parse(file('package.json'));
verifyAgent('triage',[
 check('TRI-001',triage.includes('EPHEMERAL_CLIENT_ONLY')&&triage.includes("persistence:'NONE'"),'Triage is expressly session-only with no server persistence'),
 check('TRI-002',triage.includes("approval:'NOT_APPROVED'")&&triage.includes("fiscalConformity:'NOT_EVALUATED'")&&triage.includes("causeStatus:'HYPOTHESIS_NOT_CONFIRMED'"),'Triage cannot grant approvals or tax conformity'),
 check('TRI-003',ui.includes('clearTriage();xmlSelectionCount')&&ui.includes('clearTriage();efdInput')&&ui.includes("clearTriage();xmlInputs="),'Change of source discards stale notes'),
 check('TRI-004',ui.includes('dossierWithTriage(report,triageLedger)')&&ui.includes('findingsCSVWithTriage(report,triageLedger)'),'Both exports reflect local triage'),
 check('TRI-005',pkg.version==='0.3.0'&&html.includes('id="triage-filter"'),'Triage release and filter are declared'),
]);

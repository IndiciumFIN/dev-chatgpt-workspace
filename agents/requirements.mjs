import {verifyAgent,check,file} from './_agent.mjs';
const requirements=JSON.parse(file('contracts/functional-requirements.v1.json'));
const sources=JSON.parse(file('contracts/official-source-registry.v1.json'));
const totvs=JSON.parse(file('contracts/totvs-fisa170-table-registry.candidate.json'));
const ids=new Set(sources.sources.map(s=>s.id));
const rows=requirements.requirements;
const fiscal=rows.filter(r=>r.scope==='FISCAL');
const placeholders=rows.filter(r=>r.status==='HOLD'||r.status==='PARTIAL');
verifyAgent('requirements',[
 check('REQ-001',requirements.reviewState==='CANDIDATE_NOT_HOMOLOGATED'&&rows.length>=30,'Release gate cannot be inferred from green CI'),
 check('REQ-002',new Set(rows.map(r=>r.id)).size===rows.length,'Requirement IDs unique'),
 check('REQ-003',fiscal.length>=6&&fiscal.every(r=>r.status==='HOLD'),'All fiscal compliance gates remain HOLD'),
 check('REQ-004',rows.every(r=>r.sourceIds.length>0&&r.sourceIds.every(id=>ids.has(id))),'Every required capability points to evidence sources'),
 check('REQ-005',sources.sourceFileHashes==='NOT_CAPTURED'&&sources.sources.every(s=>s.validity!=='CERTIFIED'),'No fabricated provenance hashes or certifications'),
 check('REQ-006',totvs.customerSnapshot==='NOT_AVAILABLE'&&totvs.tables.every(t=>t.verificationStatus==='VENDOR_REFERENCE_ONLY'&&t.columnMapping.length===0),'Candidate Protheus table catalog cannot masquerade as customer SX3'),
 check('REQ-007',placeholders.length>=10,'Known implementation gaps retained rather than silently closed'),
 check('REQ-008',file('src/ui.js').includes('paginateFindings')&&file('index.html').includes('findings-page-status'),'50-row pagination integration present'),
 check('REQ-009',file('db/wutrib_demo_v043_fk_indexes.sql').includes('demo_org_casefiles_membership_fk_v043_idx'),'Index correction tied to migration evidence')
]);

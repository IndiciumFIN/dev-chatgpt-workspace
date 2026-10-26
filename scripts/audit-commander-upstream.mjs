#!/usr/bin/env node
/** READ-ONLY inventory of upstream CKO admission. No inferred approvals. */
import {readFileSync} from 'node:fs';
const load=p=>JSON.parse(readFileSync(p,'utf8'));
const queue=load('registers/pmo/queue.v1.json');
const finds=load('registers/governance/find-register.v1.json');
const taskSchema=load('contracts/cko-schemas/task.schema.json');
const formal=['id','type','title','objective','scope','owner','approver','sourceRef','policySet','riskLevel','dataClassification','securityImpact','environment','status','manifestId','evidence','approvals'];
const taskRequired=['find_ref','policy_ref','validator_ref','depends_on','acceptance_tests','executor_role','work_order_ref'];
const error=[];
if(queue.canonicalSource!=='registers/pmo/queue.v1.json'||queue.readOnly!==true)error.push('PMO_AUTHORITY');
if(!Array.isArray(queue.items)||!Array.isArray(finds.finds))error.push('MISSING_REGISTERS');
for(const k of taskRequired)if(!taskSchema.required.includes(k))error.push('TASK_SCHEMA_MISSING_'+k);
const workOrders=Array.isArray(queue.items)?queue.items:[];
const findings=Array.isArray(finds.finds)?finds.finds:[];
const gaps=workOrders.map(w=>({workOrderId:w.id,missingFormalFields:formal.filter(k=>w[k]===undefined),admitted:false}));
const result={
 schemaVersion:'1.0.0',mode:'READ_ONLY_PRE_ADMISSION_AUDIT',
 authority:{pmo:queue.canonicalSource,finds:'registers/governance/find-register.v1.json',task:'contracts/cko-schemas/task.schema.json',formalWO:'docs/governance/04-work-order-model.md'},
 sequence:['DEMAND','CLASSIFICATION','SCOPE','PLANNING','SOURCE_QUALIFICATION','FIND','POLICY','VALIDATOR','TASK','WO','OPA','KERNEL','ISOLATED_EXECUTION','TESTS','INDEPENDENT_AUDIT','AUTHORIZED_PROMOTION'],
 counts:{pmoQueueEntries:workOrders.length,findCandidates:findings.length,formalWOReady:gaps.filter(g=>g.missingFormalFields.length===0).length},
 status:error.length?'INVALID':'HOLD_HUMAN',
 note:'PMO queue entry is not proof of formal WO admission. No Kernel/OPA authorization is inferred.',
 gaps,errors:error
};
console.log(JSON.stringify(result,null,2));
if(error.length)process.exitCode=1;

#!/usr/bin/env node
/** Decision register policy test, never implies MOF conformance or environment promotion. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {join,resolve} from 'node:path';
const root=resolve(import.meta.dirname,'../..');
const j=JSON.parse(readFileSync(join(root,'registers/canonical/mof-profile-decision.v1.json'),'utf8'));
assert.equal(j.registryId,'CE-MOF-IMPLEMENTATION-PROFILE-CANDIDATE');
assert.equal(j.workOrder,'WO-CE-DB-SKELETON-001');
assert.equal(j.releaseGate,'HOLD_HUMAN');
assert.equal(j.status,'PRE_CANONICAL');
assert.equal(j.variantDecision.base,'EMOF_SEMANTIC_SUBSET_PROFILE');
assert.equal(j.variantDecision.formalCompliance,'NOT_ESTABLISHED');
assert.equal(j.variantDecision.cmof,'OPTIONAL_PER_CAPABILITY_WITH_INDEPENDENT_GATES');
assert.equal(j.variantDecision.ecoreIsEMOF,'FALSE_DIFFERENT_BUT_INTEROPERABLE_CONCEPTS');
assert.equal(j.variantDecision.mofSupportsDifferentNumberOfMetaLevels,true);
assert.equal(j.variantDecision.relationalNormalization,'INDEPENDENT_OF_MOF_REQUIREMENTS_1NF_THROUGH_5NF');
assert.ok(j.variantDecision.cmofTriggers.length>=3);
for(const name of ['noNewTablesWithoutSemanticGap','noProductionWrites','noMergeToMain','doNotCommitCopyrightedPdf','doNotClaimMOFConformance','requireExternalAuthoritativeSources'])assert.equal(j.constraints[name],true);
assert.equal(j.constraints.promoteBy,'KERNEL_PLUS_AUTHORIZED_HUMAN');
const pdf=j.sourceVersions.find(x=>x.ref==='OMG-MOF-2.0');
const latest=j.sourceVersions.find(x=>x.ref==='OMG-MOF-2.5.1');
assert.ok(pdf?.pages===88&&pdf.sha256==='8c4486b83c3d204a3a8ae93113b6f7ab7e546ecf534aea915340eaf0d8df2cdc');
assert.equal(pdf.storedInGit,false);
assert.equal(latest.fileIdentifier,'formal/19-10-01');
assert.equal(latest.storedInGit,false);
for(const s of j.sourceVersions)if(s.artifact)assert.ok(existsSync(join(root,s.artifact)));
const schemas=['cko_governance','ce_platform'];
const names=new Set();
for(const schema of schemas){
 const file=join(root,'audit-evidence/supabase-canonical/20261101/schemas/'+schema+'.json');
 const content=JSON.parse(readFileSync(file,'utf8'));
 assert.equal(content.origin.schema,schema);
 for(const t of content.tables)names.add(schema+'.'+t.name);
}
for(const b of j.existingStructuralBindings)assert.ok(names.has(b.physical),'Existing table missing: '+b.physical);
const pmo=JSON.parse(readFileSync(join(root,'registers/pmo/queue.v1.json'),'utf8'));
const wo=pmo.items.find(x=>x.id===j.workOrder);
assert.ok(wo&&wo.status!=='DONE','WO cannot be missing or falsely closed');
console.log(JSON.stringify({result:'PASS_POLICY_CANDIDATE_ONLY',profile:j.variantDecision.base,sourcePages:pdf.pages,existingStructures:j.existingStructuralBindings.length,woStatus:wo.status,formalCompliance:j.variantDecision.formalCompliance,release:j.releaseGate}));

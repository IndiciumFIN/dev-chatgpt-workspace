import {describe,it} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateContinuity} from './check-governance-continuity.mjs';

const data=JSON.parse(readFileSync('docs/governance/FOUNDATION_CONTINUITY_MANIFEST_20261026.json','utf8'));
const copy=()=>structuredClone(data);
describe('governance continuity and deployment evidence — fail closed',()=>{
  it('matches the committed candidate inventory without claiming deployment',()=>{
    assert.deepEqual(validateContinuity(copy()),[]);
  });
  it('rejects silent promotion and claimed database application',()=>{
    const promoted=copy();promoted.scope.release_gate='OPEN';
    assert.match(validateContinuity(promoted).join(';'),'HOLD gate unexpectedly relaxed');
    const db=copy();db.verified_remote_state.supabase.candidate_tables_verified_applied=true;
    assert.match(validateContinuity(db).join(';'),'External availability claim');
  });
  it('rejects missing or suspiciously encoded source paths',()=>{
    const missing=copy();missing.capabilities[0].required_files.push('src/never-existed-governance.ts');
    assert.match(validateContinuity(missing).join(';'),'Missing/unsafe artifact');
    const traversal=copy();traversal.capabilities[0].required_files.push('../private-key');
    assert.match(validateContinuity(traversal).join(';'),'Missing/unsafe artifact');
  });
  it('detects unapproved HTTP route and deleted hold findings',()=>{
    const promoted=copy();
    const errors=validateContinuity(promoted,{
      pathExists:(p)=>p==='src/routes/api/admin.import.reconcile.ts'||true,
    });
    // Existing checkout still wins; simulate a newly created route.
    assert.ok(errors.some(e=>e.includes('Unapproved import HTTP route')));
    const findings=copy();findings.blocking_findings[0].state='DONE';
    assert.match(validateContinuity(findings).join(';'),'Required blocking FIND lost');
  });
  it('rejects missing real-engine CI verification',()=>{
    const errors=validateContinuity(copy(),{
      fileContent:(p)=>p==='.github/workflows/verify-bibliotecas.yml'?'no opa in workflow':readFileSync(p,'utf8'),
    });
    assert.ok(errors.some(x=>x.includes('OPA real')));
  });
});

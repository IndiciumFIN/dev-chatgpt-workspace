#!/usr/bin/env node
/**
 * Check the checked-out governance foundation against the explicit continuity
 * manifest. This is a REPO integrity check, NOT proof of live OPA, database
 * schema deployment, user authorization, RLS or Kernel admission.
 *
 * Must fail closed when a required artifact goes missing, when HOLD gates
 * silently change, or when a blocked API route appears without governance.
 */
import {existsSync,readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const filename='docs/governance/FOUNDATION_CONTINUITY_MANIFEST_20261026.json';
const read=(p)=>readFileSync(p,'utf8');
const safePath=(p)=>typeof p==='string' && !path.isAbsolute(p) &&
  p.length>0 && !p.split(/[\\/]/).some(x=>x==='..') && /^[a-zA-Z0-9._/-]+$/.test(p);
const isRecord=(x)=>x!==null && typeof x==='object' && !Array.isArray(x);

export function validateContinuity(manifest,{
  pathExists=existsSync,fileContent=read,
}={}){
  const errors=[];
  if(!isRecord(manifest)||manifest.schema_version!=='1.0.0'){
    return ['Invalid continuity manifest schema'];
  }
  if(manifest.scope?.repository!=='IndiciumFIN/dev-chatgpt-workspace'||
     manifest.scope?.working_branch!=='preview/central-comando-20261026')
    errors.push('Unexpected canonical repository/branch');
  if(manifest.scope?.release_gate!=='HOLD_HUMAN' ||
     manifest.scope?.main_write_authorized!==false ||
     manifest.scope?.supabase_write_authorized!==false ||
     manifest.scope?.production_deploy_authorized!==false)
    errors.push('HOLD gate unexpectedly relaxed');
  if(!Array.isArray(manifest.capabilities)||manifest.capabilities.length<7)
    errors.push('Missing implementation inventory');
  else for(const item of manifest.capabilities){
    if(!item.id || !Array.isArray(item.required_files)||!item.required_files.length)
      errors.push('Incomplete capability entry');
    if(/^(PRODUCTION_DEPLOYED|CORPORATE_ADMITTED|REMOTE_WRITE_ACTIVE)$/.test(item.state??''))
      errors.push('Unverified operational claim '+item.id);
    for(const p of item.required_files??[]){
      if(!safePath(p)||!pathExists(p))errors.push('Missing/unsafe artifact '+p);
    }
  }
  if(!Array.isArray(manifest.blocking_findings)||manifest.blocking_findings.length<6||
     manifest.blocking_findings.some(f=>f.state!=='HOLD_HUMAN'))
    errors.push('Required blocking FIND lost');
  if(manifest.verified_remote_state?.supabase?.candidate_tables_verified_applied!==false ||
     manifest.verified_remote_state?.supabase?.private_role_verified_created!==false ||
     manifest.verified_remote_state?.vercel?.current_head_deployment_verified!==false)
    errors.push('External availability claim is not grounded in new evidence');
  // The absence of a route is an explicit PRE-RELEASE invariant. If
  // authorization later allows a route, a formal FIND/WO must change the
  // manifest+test together; a surprise route fails CI now.
  const disallowedRoutes=[
    'src/routes/api/admin.import.reconcile.ts',
    'src/routes/api/admin/import/reconcile.ts',
    'src/routes/api/admin/import/reconcile/index.ts',
  ];
  for(const route of disallowedRoutes)if(pathExists(route))
    errors.push('Unapproved import HTTP route exists: '+route);
  const prerequisites=[
    ['src/core/governance/import-reconcile-http.server.ts',/process\.env\.CKO_IMPORT_READ_ENABLED\s*===\s*'true'/,
      'No opt-in gate for HTTP read service'],
    ['src/core/governance/import-read-db.server.ts',/BEGIN ISOLATION LEVEL REPEATABLE READ, READ ONLY/,
      'PostgreSQL transaction no longer read-only'],
    ['src/core/governance/import-opa-read.server.ts',/policy-denied-or-unverified/,
      'OPA deny-by-default behavior missing'],
    ['src/components/admin/admin-bulk-import.tsx',/has_remote_write:false/,
      'Import admin no longer read-only candidate'],
    ['.github/workflows/verify-bibliotecas.yml',/opa" test --fail-on-empty/,
      'OPA real policy tests no longer required'],
    ['.github/workflows/verify-bibliotecas.yml',/verification-key/,
      'OPA real bundle signature verification disappeared'],
  ];
  for(const [p,pattern,message] of prerequisites){
    if(!pathExists(p)||!pattern.test(fileContent(p)))errors.push(message);
  }
  for(const p of [
    'migrations/candidates/20261026_governance_kernel_opa_agents.sql',
    'migrations/candidates/20261026_governed_admin_bulk_import.sql',
    'migrations/candidates/20261026_governed_import_reconciliation.sql',
    'migrations/candidates/20261026_import_readonly_role.sql',
    'migrations/candidates/20261026_import_read_evidence_receipts.sql',
  ]){
    if(!pathExists(p)){errors.push('Missing SQL candidate '+p);continue;}
    const contents=fileContent(p);
    if(!contents.slice(0,500).includes('CANDIDATE') ||
       /\bgrant\s+(insert|update|delete|all)\b/i.test(contents) ||
       /\bdrop\s+(table|schema)\b/i.test(contents))
      errors.push('Potentially ungoverned candidate SQL: '+p);
  }
  return errors;
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const data=JSON.parse(read(filename));
  const failures=validateContinuity(data);
  if(failures.length){
    for(const f of failures)console.error('FAIL CONTINUITY: '+f);
    process.exitCode=1;
  }else{
    console.log('PASS CONTINUITY: versioned artifacts present; HOLD preserved; no live deployment/DB claims asserted.');
    console.log('CAVEAT: this verifies the Git checkout, NOT remote Supabase/Vercel/OPA readiness.');
  }
}

import {verifyAgent,check,file} from './_agent.mjs';
const api=file('api/demo-casefiles.js'),v04=file('db/wutrib_demo_v04.sql');
const v041=file('db/wutrib_demo_v041_hardening.sql');
const tests=file('tests/demo-persistence.test.mjs'),migration=file('scripts/bootstrap_wutrib_repo.sh');
verifyAgent('persistence',[
 check('PERS-001',v04.includes('enable row level security')&&v04.includes('security invoker'),'Original RLS and RPC invoker remain explicit'),
 check('PERS-002',v041.includes('demo_casefiles_strict_fixture_v041')&&v041.includes('demo_casefile_valid_v1'),'Database verifies synthetic fixture fields and state invariants'),
 check('PERS-003',v041.includes('wutrib_demo_casefile_save_v2')&&v041.includes('extensions.digest')&&v041.includes('revoke execute on function public.wutrib_demo_casefile_save_v1'),'Server-computed content digest and retired legacy write RPC'),
 check('PERS-004',v041.includes('demo_operator_rate_limits')&&v041.includes('request_count<30')&&v041.includes('wutrib_demo_request_gate_v1'),'Durable operator quota enforced in SQL'),
 check('PERS-005',api.includes('DEMO_PERSISTENCE_DISABLED')&&api.includes('DEMO_RATE_LIMITED')&&api.includes('wutrib_demo_casefile_save_v2')&&api.includes('wutrib_demo_request_gate_v1'),'Fail-closed API and rate limit use server-only functions'),
 check('PERS-006',!file('src/ui.js').includes('WUTRIB_OPERATOR_TOKEN')&&!file('index.html').includes('WUTRIB_SUPABASE_SERVICE_ROLE_KEY'),'Public client does not receive operator or database credentials'),
 check('PERS-007',tests.includes('global quota rejects')&&tests.includes('backend unavailable always fails closed'),'Negative regression coverage exists'),
 check('PERS-008',migration.includes('--private')&&migration.includes('--single-branch')&&!migration.includes('--mirror'),'Standalone repo migration is private, source branch only, never full CE mirror')
]);

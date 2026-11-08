import {verifyAgent,check,file} from './_agent.mjs';
const api=file('api/demo-casefiles.js'),v04=file('db/wutrib_demo_v04.sql');
const v041=file('db/wutrib_demo_v041_hardening.sql');
const v042=file('db/wutrib_demo_v042_org_auth.sql');
const tests=file('tests/demo-persistence.test.mjs'),migration=file('scripts/bootstrap_wutrib_repo.sh');
verifyAgent('persistence',[
 check('PERS-001',v04.includes('enable row level security')&&v04.includes('security invoker'),'Original RLS and RPC invoker remain explicit'),
 check('PERS-002',v041.includes('demo_casefiles_strict_fixture_v041')&&v041.includes('demo_casefile_valid_v1'),'DB validates fixture fields and invariants'),
 check('PERS-003',v041.includes('extensions.digest')&&v042.includes('extensions.digest'),'DB produces canonical idempotency digest'),
 check('PERS-004',v041.includes('demo_operator_rate_limits')&&v041.includes('request_count<30'),'Durable operator quota'),
 check('PERS-005',api.includes('DEMO_PERSISTENCE_DISABLED')&&api.includes('DEMO_RATE_LIMITED')&&api.includes('wutrib_demo_org_authorize_v1'),'Authorization and quota fail closed'),
 check('PERS-006',!file('src/ui.js').includes('WUTRIB_SUPABASE_SERVICE_ROLE_KEY')&&!file('index.html').includes('WUTRIB_SUPABASE_SERVICE_ROLE_KEY'),'Client receives no private keys'),
 check('PERS-007',tests.includes('cross-tenant GET rejected')&&tests.includes('forged identity')&&tests.includes('Auth service 503'),'Negative RBAC and Auth tests present'),
 check('PERS-008',migration.includes('--private')&&migration.includes('--single-branch')&&!migration.includes('--mirror'),'Independent private repo bootstrap, not a mirror'),
 check('PERS-009',v042.includes('demo_organizations_v1')&&v042.includes('demo_org_memberships_v1')&&v042.includes('demo_org_casefiles_v1'),'Tenant membership and isolated persistence tables'),
 check('PERS-010',v042.includes("o.status='ACTIVE'")&&v042.includes("m.active=true")&&v042.includes("m.role_code='INVESTIGATOR'"),'Grant checks include active org, approved user, role'),
 check('PERS-011',v042.includes('demo_org_audit_events_v1')&&v042.includes("'SAVE'")&&v042.includes("'READ'"),'Audited reads and writes'),
 check('PERS-012',v042.includes('revoke execute on function public.wutrib_demo_casefile_get_v1')&&v042.includes('revoke execute on function public.wutrib_demo_casefile_save_v2'),'Legacy unscoped RPCs cannot execute via service_role')
]);

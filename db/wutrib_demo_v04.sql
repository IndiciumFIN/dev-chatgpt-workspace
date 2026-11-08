-- WUTRIB-WO-PLAN-016; additive candidate, SOT project hcqukuotfwflmebjygam only.
-- Does not modify existing audit_runs/audit_findings/investigations.
create table if not exists wutrib.demo_casefiles (
 id uuid primary key default gen_random_uuid(),
 project_code text not null default 'WU-TRIB' references wutrib.project_registry(project_code),
 wo_code text not null default 'WUTRIB-WO-PLAN-016' references wutrib.work_orders(wo_code),
 fixture_code text not null default 'WU-TRIB-SYNTHETIC-V03' check(fixture_code='WU-TRIB-SYNTHETIC-V03'),
 idempotency_hash text not null unique check(idempotency_hash ~ '^[0-9a-f]{64}$'),
 dossier jsonb not null check(
  jsonb_typeof(dossier)='object'
  and dossier->>'format'='wutrib.synthetic.casefile.v2'
  and dossier->>'fixtureCode'='WU-TRIB-SYNTHETIC-V03'
  and dossier->>'projectCode'='WU-TRIB'
  and dossier->>'woCode'='WUTRIB-WO-PLAN-016'
  and dossier->>'approval'='NOT_APPROVED'
  and dossier->>'taxConformity'='NOT_EVALUATED'
  and jsonb_typeof(dossier->'reviews')='array'
  and jsonb_array_length(dossier->'reviews')<=3
  and not(dossier ? 'rawXml') and not(dossier ? 'sourceFiles')
 ),
 approved boolean not null default false check(approved=false),
 created_at timestamptz not null default now()
);
alter table wutrib.demo_casefiles enable row level security;
revoke all privileges on wutrib.demo_casefiles from public,anon,authenticated;
grant usage on schema wutrib to service_role;
grant select,insert on wutrib.demo_casefiles to service_role;
create or replace function public.wutrib_demo_casefile_save_v1(p_sha text,p_dossier jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $body$
declare v_id uuid;
begin
 if p_sha is null or p_sha !~ '^[0-9a-f]{64}$'
 or p_dossier->>'approval' is distinct from 'NOT_APPROVED'
 or p_dossier->>'fixtureCode' is distinct from 'WU-TRIB-SYNTHETIC-V03'
 then raise exception 'invalid synthetic casefile contract'; end if;
 insert into wutrib.demo_casefiles(idempotency_hash,dossier) values(p_sha,p_dossier)
 on conflict(idempotency_hash) do nothing;
 select id into v_id from wutrib.demo_casefiles where idempotency_hash=p_sha;
 if v_id is null then raise exception 'casefile not persisted';end if;
 return jsonb_build_object('id',v_id);
end;
$body$;
create or replace function public.wutrib_demo_casefile_get_v1(p_id uuid)
returns jsonb language sql stable security invoker set search_path='' as $body$
 select jsonb_build_object('id',id,'casefile',dossier,'createdAt',created_at)
 from wutrib.demo_casefiles where id=p_id;
$body$;
revoke execute on function public.wutrib_demo_casefile_save_v1(text,jsonb) from public,anon,authenticated;
revoke execute on function public.wutrib_demo_casefile_get_v1(uuid) from public,anon,authenticated;
grant execute on function public.wutrib_demo_casefile_save_v1(text,jsonb) to service_role;
grant execute on function public.wutrib_demo_casefile_get_v1(uuid) to service_role;

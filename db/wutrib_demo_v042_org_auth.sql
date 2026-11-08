-- WUTRIB-WO-PLAN-016 / Wave 04.2. Additive tenant-isolated synthetic dossier candidate.
-- Target: Supabase project SOT-10-09-2026 (hcqukuotfwflmebjygam), schema wutrib.
-- No real fiscal documents, no seeded users or organizations, no client grants.

create table wutrib.demo_organizations_v1 (
 org_code text primary key check (org_code ~ '^[A-Z][A-Z0-9_-]{2,31}$'),
 status text not null default 'PAUSED' check (status in ('PAUSED','ACTIVE')),
 created_at timestamptz not null default pg_catalog.now()
);
create table wutrib.demo_org_memberships_v1 (
 org_code text not null references wutrib.demo_organizations_v1(org_code),
 auth_user_id uuid not null,
 role_code text not null check(role_code in ('VIEWER','INVESTIGATOR')),
 active boolean not null default false,
 approved_by uuid,
 approval_evidence text,
 created_at timestamptz not null default pg_catalog.now(),
 primary key (org_code,auth_user_id),
 constraint activation_needs_human_evidence check (
  not active or (approved_by is not null and
   approval_evidence is not null and pg_catalog.length(pg_catalog.btrim(approval_evidence)) >= 12)
 )
);
create table wutrib.demo_org_casefiles_v1 (
 id uuid primary key default extensions.gen_random_uuid(),
 org_code text not null,
 actor_id uuid not null,
 dossier jsonb not null check (wutrib.demo_casefile_valid_v1(dossier)),
 idempotency_hash text not null check (idempotency_hash ~ '^[0-9a-f]{64}$'),
 approved boolean not null default false check(approved=false),
 created_at timestamptz not null default pg_catalog.now(),
 foreign key(org_code,actor_id) references wutrib.demo_org_memberships_v1(org_code,auth_user_id),
 unique(org_code,idempotency_hash)
);
create table wutrib.demo_org_audit_events_v1 (
 id bigint generated always as identity primary key,
 org_code text not null references wutrib.demo_organizations_v1(org_code),
 actor_id uuid not null,
 action text not null check(action in ('SAVE','READ')),
 casefile_id uuid not null references wutrib.demo_org_casefiles_v1(id),
 occurred_at timestamptz not null default pg_catalog.now()
);
create index demo_org_casefiles_recent_v1
 on wutrib.demo_org_casefiles_v1(org_code,created_at desc);
create index demo_org_events_recent_v1
 on wutrib.demo_org_audit_events_v1(org_code,occurred_at desc);
alter table wutrib.demo_organizations_v1 enable row level security;
alter table wutrib.demo_org_memberships_v1 enable row level security;
alter table wutrib.demo_org_casefiles_v1 enable row level security;
alter table wutrib.demo_org_audit_events_v1 enable row level security;
revoke all on wutrib.demo_organizations_v1 from public,anon,authenticated;
revoke all on wutrib.demo_org_memberships_v1 from public,anon,authenticated;
revoke all on wutrib.demo_org_casefiles_v1 from public,anon,authenticated;
revoke all on wutrib.demo_org_audit_events_v1 from public,anon,authenticated;
grant usage on schema wutrib to service_role;
grant select on wutrib.demo_organizations_v1,wutrib.demo_org_memberships_v1 to service_role;
grant select,insert on wutrib.demo_org_casefiles_v1 to service_role;
grant select,insert on wutrib.demo_org_audit_events_v1 to service_role;
grant usage on sequence wutrib.demo_org_audit_events_v1_id_seq to service_role;

-- Identity comes ONLY from the freshly verified Supabase Auth /user response.
-- The organization name, actor UUID, and claimed role from HTTP are NEVER trusted for authorization.
create or replace function wutrib.demo_can_org_action_v1(p_actor uuid,p_org text,p_operation text)
returns boolean language sql stable security invoker set search_path='' as $fn$
 select exists (
  select 1 from wutrib.demo_organizations_v1 o
  join wutrib.demo_org_memberships_v1 m on m.org_code=o.org_code
  where o.org_code=p_org and o.status='ACTIVE'
    and m.auth_user_id=p_actor and m.active=true
    and m.approved_by is not null
    and m.approval_evidence is not null
    and ((p_operation='READ' and m.role_code in ('VIEWER','INVESTIGATOR'))
      or (p_operation='SAVE' and m.role_code='INVESTIGATOR'))
 );
$fn$;
revoke all on function wutrib.demo_can_org_action_v1(uuid,text,text) from public,anon,authenticated;
grant execute on function wutrib.demo_can_org_action_v1(uuid,text,text) to service_role;

create or replace function public.wutrib_demo_org_authorize_v1(
 p_actor uuid,p_org text,p_operation text
)
returns jsonb language sql stable security invoker set search_path='' as $fn$
 select pg_catalog.jsonb_build_object(
  'allowed',wutrib.demo_can_org_action_v1(p_actor,p_org,p_operation));
$fn$;
revoke execute on function public.wutrib_demo_org_authorize_v1(uuid,text,text)
 from public,anon,authenticated;
grant execute on function public.wutrib_demo_org_authorize_v1(uuid,text,text)
 to service_role;

create or replace function public.wutrib_demo_org_casefile_save_v1(
 p_actor uuid,p_org text,p_dossier jsonb
)
returns jsonb language plpgsql volatile security invoker set search_path='' as $fn$
declare v_hash text;v_id uuid;v_existing jsonb;
begin
 if not wutrib.demo_can_org_action_v1(p_actor,p_org,'SAVE') then
  raise exception 'organization denied' using errcode='42501';
 end if;
 if not wutrib.demo_casefile_valid_v1(p_dossier) then
  raise exception 'invalid synthetic casefile contract' using errcode='22023';
 end if;
 v_hash:=pg_catalog.encode(extensions.digest(pg_catalog.convert_to(p_dossier::text,'UTF8'),'sha256'),'hex');
 insert into wutrib.demo_org_casefiles_v1(org_code,actor_id,idempotency_hash,dossier)
 values(p_org,p_actor,v_hash,p_dossier)
 on conflict(org_code,idempotency_hash) do nothing;
 select id,dossier into v_id,v_existing
 from wutrib.demo_org_casefiles_v1
 where org_code=p_org and idempotency_hash=v_hash;
 if v_id is null or v_existing is distinct from p_dossier then
  raise exception 'casefile collision or unavailable' using errcode='22023';
 end if;
 insert into wutrib.demo_org_audit_events_v1(org_code,actor_id,action,casefile_id)
 values(p_org,p_actor,'SAVE',v_id);
 return pg_catalog.jsonb_build_object('id',v_id,'digest',v_hash);
end;
$fn$;
revoke execute on function public.wutrib_demo_org_casefile_save_v1(uuid,text,jsonb)
 from public,anon,authenticated;
grant execute on function public.wutrib_demo_org_casefile_save_v1(uuid,text,jsonb) to service_role;

create or replace function public.wutrib_demo_org_casefile_get_v1(
 p_actor uuid,p_org text,p_id uuid
)
returns jsonb language plpgsql volatile security invoker set search_path='' as $fn$
declare v_record record;
begin
 if not wutrib.demo_can_org_action_v1(p_actor,p_org,'READ') then return null; end if;
 select id,dossier,created_at into v_record
 from wutrib.demo_org_casefiles_v1
 where org_code=p_org and id=p_id;
 if not found then return null; end if;
 insert into wutrib.demo_org_audit_events_v1(org_code,actor_id,action,casefile_id)
 values(p_org,p_actor,'READ',v_record.id);
 return pg_catalog.jsonb_build_object(
  'id',v_record.id,'casefile',v_record.dossier,'createdAt',v_record.created_at);
end;
$fn$;
revoke execute on function public.wutrib_demo_org_casefile_get_v1(uuid,text,uuid)
 from public,anon,authenticated;
grant execute on function public.wutrib_demo_org_casefile_get_v1(uuid,text,uuid)
 to service_role;

-- Retire unscoped service-role RPC access; old unauthenticated demo remains read-only in browser.
revoke execute on function public.wutrib_demo_casefile_get_v1(uuid) from service_role;
revoke execute on function public.wutrib_demo_casefile_save_v2(jsonb) from service_role;

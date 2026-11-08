-- WUTRIB-WO-PLAN-016 / Wave 04.1; SOT-10-09-2026 only.
create or replace function wutrib.demo_casefile_valid_v1(d jsonb)
returns boolean language plpgsql immutable security invoker set search_path='' as $fn$
declare r jsonb; fid text; state text; note text; seen text[]:=array[]::text[];
begin
 if d is null or jsonb_typeof(d)<>'object' then return false;end if;
 if (select count(*) from pg_catalog.jsonb_object_keys(d))<>10 then return false;end if;
 if exists(select 1 from pg_catalog.jsonb_object_keys(d) as x(k)
   where k <> all(array['format','projectCode','woCode','fixtureCode','source',
   'reviewerIdentity','approval','taxConformity','layoutCertification','reviews']))
 then return false;end if;
 if d->>'format' is distinct from 'wutrib.synthetic.casefile.v2'
 or d->>'projectCode' is distinct from 'WU-TRIB'
 or d->>'woCode' is distinct from 'WUTRIB-WO-PLAN-016'
 or d->>'fixtureCode' is distinct from 'WU-TRIB-SYNTHETIC-V03'
 or d->>'source' is distinct from 'SERVER_VALIDATED_SYNTHETIC_FIXTURE'
 or d->>'reviewerIdentity' is distinct from 'UNVERIFIED_OPERATOR'
 or d->>'approval' is distinct from 'NOT_APPROVED'
 or d->>'taxConformity' is distinct from 'NOT_EVALUATED'
 or d->>'layoutCertification' is distinct from 'NOT_PERFORMED'
 then return false;end if;
 if jsonb_typeof(d->'reviews') is distinct from 'array' then return false;end if;
 if pg_catalog.jsonb_array_length(d->'reviews')>3 then return false;end if;
 for r in select value from pg_catalog.jsonb_array_elements(d->'reviews') loop
   if jsonb_typeof(r)<>'object' then return false;end if;
   if (select count(*) from pg_catalog.jsonb_object_keys(r))<>6 then return false;end if;
   if exists(select 1 from pg_catalog.jsonb_object_keys(r) as x(k)
      where k <> all(array['findingId','status','note','approval','fiscalConformity','causeStatus']))
   then return false;end if;
   if jsonb_typeof(r->'findingId')<>'string'
   or jsonb_typeof(r->'status')<>'string'
   or jsonb_typeof(r->'note')<>'string' then return false;end if;
   fid:=r->>'findingId';state:=r->>'status';note:=r->>'note';
   if fid <> all(array[
      'DIFF-35261100000000000000550010000010021000000002',
      'MISS-EFD-35261100000000000000550010000010031000000003',
      'MISS-XML-35261100000000000000550010000010041000000004'])
      or fid=any(seen) then return false;end if;
   if state <> all(array['PENDING','INVESTIGATING','NEEDS_EVIDENCE','REVIEW_NOTE']) then return false;end if;
   if pg_catalog.length(note)>1200 or (state<>'PENDING' and pg_catalog.btrim(note)='')
     then return false;end if;
   if r->>'approval' is distinct from 'NOT_APPROVED'
   or r->>'fiscalConformity' is distinct from 'NOT_EVALUATED'
   or r->>'causeStatus' is distinct from 'HYPOTHESIS_NOT_CONFIRMED'
   then return false;end if;
   seen:=pg_catalog.array_append(seen,fid);
 end loop;
 return true;
exception when others then return false;
end;
$fn$;
revoke all on function wutrib.demo_casefile_valid_v1(jsonb) from public,anon,authenticated;
grant execute on function wutrib.demo_casefile_valid_v1(jsonb) to service_role;
alter table wutrib.demo_casefiles add constraint demo_casefiles_strict_fixture_v041
  check (wutrib.demo_casefile_valid_v1(dossier)) not valid;
alter table wutrib.demo_casefiles validate constraint demo_casefiles_strict_fixture_v041;

create or replace function public.wutrib_demo_casefile_save_v2(p_dossier jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $fn$
declare v_hash text;v_id uuid;v_existing jsonb;
begin
 if not wutrib.demo_casefile_valid_v1(p_dossier) then
   raise exception 'invalid synthetic casefile contract' using errcode='22023';
 end if;
 v_hash:=pg_catalog.encode(extensions.digest(pg_catalog.convert_to(p_dossier::text,'UTF8'),'sha256'),'hex');
 insert into wutrib.demo_casefiles(idempotency_hash,dossier)
 values(v_hash,p_dossier) on conflict(idempotency_hash) do nothing;
 select id,dossier into v_id,v_existing from wutrib.demo_casefiles where idempotency_hash=v_hash;
 if v_id is null or v_existing is distinct from p_dossier then
  raise exception 'casefile collision or unavailable' using errcode='22023';
 end if;
 return pg_catalog.jsonb_build_object('id',v_id,'digest',v_hash);
end;
$fn$;
revoke execute on function public.wutrib_demo_casefile_save_v2(jsonb) from public,anon,authenticated;
grant execute on function public.wutrib_demo_casefile_save_v2(jsonb) to service_role;
revoke execute on function public.wutrib_demo_casefile_save_v1(text,jsonb) from service_role;

create table wutrib.demo_operator_rate_limits(
 operator_sha text not null check(operator_sha ~ '^[0-9a-f]{64}$'),
 bucket_start timestamptz not null,
 request_count integer not null default 1 check(request_count>=1 and request_count<=30),
 primary key(operator_sha,bucket_start)
);
alter table wutrib.demo_operator_rate_limits enable row level security;
revoke all on wutrib.demo_operator_rate_limits from public,anon,authenticated;
grant select,insert,update on wutrib.demo_operator_rate_limits to service_role;
create or replace function public.wutrib_demo_request_gate_v1(p_operator_sha text)
returns jsonb language plpgsql volatile security invoker set search_path='' as $fn$
declare v_count int;v_bucket timestamptz;
begin
 if p_operator_sha is null or p_operator_sha !~ '^[0-9a-f]{64}$' then
  raise exception 'invalid operator fingerprint' using errcode='22023';
 end if;
 v_bucket:=pg_catalog.date_trunc('minute',pg_catalog.now(),'UTC');
 insert into wutrib.demo_operator_rate_limits(operator_sha,bucket_start,request_count)
 values(p_operator_sha,v_bucket,1)
 on conflict(operator_sha,bucket_start)
 do update set request_count=wutrib.demo_operator_rate_limits.request_count+1
 where wutrib.demo_operator_rate_limits.request_count<30
 returning request_count into v_count;
 if v_count is null then
  return pg_catalog.jsonb_build_object('allowed',false,'retryAfterSeconds',60);
 end if;
 return pg_catalog.jsonb_build_object('allowed',true,'remaining',30-v_count);
end;
$fn$;
revoke execute on function public.wutrib_demo_request_gate_v1(text) from public,anon,authenticated;
grant execute on function public.wutrib_demo_request_gate_v1(text) to service_role;

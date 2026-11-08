-- WUTRIB-WO-DATA-022 | normative universe v1.1
-- MIRROR of applied migrations: 2026-11-08, SOT ref hcqukuotfwflmebjygam
-- Never execute in Calculadoras-Smart or expose via anon/authenticated API.
-- Sources are references/candidates, NOT admitted binding tax/clinical content.
create table if not exists wutrib.normative_universe_import_v11 (
  id bigint generated always as identity primary key,
  workbook_sha256 text not null check (workbook_sha256 ~ '^[0-9a-f]{64}$'),
  workbook_name text not null,
  workbook_version text not null,
  source_sheet text not null,
  source_row integer not null check (source_row >= 6),
  registry_kind text not null,
  source_id text,
  record_title text,
  issuer text,
  reference_url text,
  normative_nature text,
  edition text,
  original_status text,
  validation_status text not null default 'NOT_VERIFIED'
    check (validation_status in ('NOT_VERIFIED','PENDING_REVIEW','VERIFIED_BY_HUMAN')),
  applicability_status text not null default 'TO_ASSESS'
    check (applicability_status in ('TO_ASSESS','APPLICABLE','NOT_APPLICABLE','CONDITIONAL')),
  release_status text not null default 'STAGING_ONLY'
    check (release_status = 'STAGING_ONLY'),
  source_headers jsonb not null check (jsonb_typeof(source_headers) = 'array'),
  source_cells jsonb not null check (jsonb_typeof(source_cells) = 'array'),
  source_formulas jsonb not null default '{}'::jsonb check (jsonb_typeof(source_formulas) = 'object'),
  row_digest text not null check (row_digest ~ '^[0-9a-f]{64}$'),
  imported_at timestamptz not null default now(),
  unique (workbook_sha256, source_sheet, source_row)
);
comment on table wutrib.normative_universe_import_v11 is
  'Private, append-only-by-import normative source workbook staging: contains all 16 worksheets and original formula references; no legal applicability approval or production authority.';
create index if not exists normative_import_v11_sheet_idx
 on wutrib.normative_universe_import_v11 (workbook_sha256, source_sheet);
create index if not exists normative_import_v11_source_id_idx
 on wutrib.normative_universe_import_v11 (source_id) where source_id is not null;
create index if not exists normative_import_v11_kind_idx
 on wutrib.normative_universe_import_v11 (registry_kind, validation_status);
alter table wutrib.normative_universe_import_v11 enable row level security;
revoke all on table wutrib.normative_universe_import_v11 from PUBLIC, anon, authenticated;
grant select on table wutrib.normative_universe_import_v11 to service_role;

-- Import helper: applied in second migration, SECURITY INVOKER and admin-only.
-- GPG is a local transport/compression format; not a confidentiality control.
-- Original uploaded workbook digest is a fixed provenance guard for v1.1.
create or replace function wutrib.import_normative_packet_v11(
  p_packet_b64 text,p_packet_passphrase text
) returns jsonb
language plpgsql security invoker
set search_path = pg_catalog,extensions,wutrib
as $fn$
declare
 d jsonb;v_added integer;v_expected integer;v_sheet text;
begin
 if current_user <> 'postgres' then raise exception 'PRIVATE_ADMIN_IMPORT_ONLY'; end if;
 if length(p_packet_b64)>200000 then raise exception 'PACKET_TOO_LARGE'; end if;
 d:=convert_from(extensions.pgp_sym_decrypt_bytea(decode(p_packet_b64,'base64'),p_packet_passphrase),'UTF8')::jsonb;
 if d->>'sha' <> '3107d01b30bf9a49c797309ad4ca2d3888ee291f781986eda95c910406241300'
 then raise exception 'WRONG_SOURCE_WORKBOOK_SHA'; end if;
 v_sheet:=d->>'sheet';
 if v_sheet is null or jsonb_typeof(d->'records')<>'array' or jsonb_typeof(d->'columns')<>'array'
 then raise exception 'INVALID_PACKET_SHAPE'; end if;
 v_expected:=jsonb_array_length(d->'records');
 insert into wutrib.normative_universe_import_v11
 (workbook_sha256,workbook_name,workbook_version,source_sheet,source_row,registry_kind,
  source_id,record_title,issuer,reference_url,normative_nature,edition,original_status,
  source_headers,source_cells,source_formulas,row_digest)
 select d->>'sha',d->>'name',d->>'version',d->>'sheet',(r.value->>0)::integer,d->>'kind',
  nullif(trim((r.value->1)->>0),''),
  nullif(trim((r.value->1)->>coalesce((d->'map'->>'title')::integer,-99)),''),
  nullif(trim((r.value->1)->>coalesce((d->'map'->>'issuer')::integer,-99)),''),
  nullif(trim((r.value->1)->>coalesce((d->'map'->>'url')::integer,-99)),''),
  nullif(trim((r.value->1)->>coalesce((d->'map'->>'nature')::integer,-99)),''),
  nullif(trim((r.value->1)->>coalesce((d->'map'->>'edition')::integer,-99)),''),
  nullif(trim((r.value->1)->>coalesce((d->'map'->>'status')::integer,-99)),''),
  d->'columns',r.value->1,coalesce(r.value->2,'{}'::jsonb),
  encode(extensions.digest(convert_to(d->>'sheet'||':'||r.value::text,'UTF8'),'sha256'),'hex')
 from jsonb_array_elements(d->'records') as r(value)
 on conflict (workbook_sha256,source_sheet,source_row) do nothing;
 get diagnostics v_added=ROW_COUNT;
 return jsonb_build_object('sheet',v_sheet,'received',v_expected,'inserted',v_added,
  'sha',d->>'sha','total_in_sheet',
  (select count(*) from wutrib.normative_universe_import_v11
   where workbook_sha256=d->>'sha' and source_sheet=v_sheet));
end
$fn$;
revoke all on function wutrib.import_normative_packet_v11(text,text)
 from public,anon,authenticated,service_role;
comment on function wutrib.import_normative_packet_v11(text,text) is
 'Restricted import helper for user-supplied workbook v1.1. GPG compression is transport only, not a security boundary. Keep private, do not expose via Data API.';

-- Career promotion control candidate v0.1.0
-- Fail-closed review + release gates. No approval is inferred.

create table if not exists career_review_item_candidate (
  id text primary key,
  item_kind text not null check (item_kind in ('CLAIM','EDITORIAL_DOCUMENT')),
  target_id text not null,
  review_area text not null check (review_area in ('REGULATORY','EDUCATIONAL','EDITORIAL')),
  decision text not null check (decision in ('PENDING','APPROVED','REJECTED','HOLD')),
  required_role text not null,
  evidence_ref text,
  reviewed_at timestamptz,
  status text not null check (status in ('REVIEW_REQUIRED','HOLD_HUMAN','ASSURED'))
);

insert into career_review_item_candidate(id,item_kind,target_id,review_area,decision,required_role,status)
select 'REV-'||canonical_id,'CLAIM',canonical_id,
       case when claim_type='EDUCATIONAL' then 'EDUCATIONAL' else 'REGULATORY' end,
       'PENDING','HUMAN_DOMAIN_REVIEWER','REVIEW_REQUIRED'
from career_claim_candidate
on conflict(id) do nothing;

insert into career_review_item_candidate(id,item_kind,target_id,review_area,decision,required_role,status)
select 'REV-'||id,'EDITORIAL_DOCUMENT',id,'EDITORIAL','PENDING','HUMAN_EDITORIAL_REVIEWER','REVIEW_REQUIRED'
from career_editorial_document_candidate
on conflict(id) do nothing;

create table if not exists career_release_gate_candidate (
  canonical_id text primary key,
  version text not null,
  status text not null check (status in ('CANDIDATE','DRAFT','SOURCE_QUALIFIED','EVIDENCE_BOUND','REVIEW_REQUIRED','HOLD_HUMAN','ASSURED','ELIGIBLE_FOR_RELEASE','RELEASED','RETIRED')),
  updated_at date not null,
  provenance_refs jsonb not null,
  upstream_gate_refs jsonb not null,
  required_approvals jsonb not null,
  evidence_bundle_refs jsonb not null,
  decision text not null check (decision in ('HOLD','REJECTED','APPROVED')),
  replay_hash text not null check (replay_hash ~ '^[a-f0-9]{64}$'),
  deployment_scope text not null,
  reviewed_by text
);

create table if not exists career_publication_candidate (
  canonical_id text primary key,
  version text not null,
  status text not null check (status in ('CANDIDATE','DRAFT','SOURCE_QUALIFIED','EVIDENCE_BOUND','REVIEW_REQUIRED','HOLD_HUMAN','ASSURED','ELIGIBLE_FOR_RELEASE','RELEASED','RETIRED')),
  updated_at date not null,
  provenance_refs jsonb not null,
  artifact_id text not null,
  resolved_projection_id text not null,
  required_gate_ids jsonb not null,
  gate_results jsonb not null,
  human_approval text not null check (human_approval in ('PENDING','APPROVED','REJECTED')),
  output_sha256 text not null check (output_sha256 ~ '^[a-f0-9]{64}$'),
  deployment_target text,
  release_ref text
);
insert into career_release_gate_candidate(canonical_id,version,status,updated_at,provenance_refs,upstream_gate_refs,required_approvals,evidence_bundle_refs,decision,replay_hash,deployment_scope)
 values ('RG-CAREER-SOURCE','0.1.0','HOLD_HUMAN','2026-10-26','["WO-CAREER-YOUTH-001"]'::jsonb,'[]'::jsonb,'["SOURCE_APPLICABILITY_REVIEW"]'::jsonb,'["registers/career/source-snapshots.v1.json"]'::jsonb,'HOLD','ee9fdaa39ffaf720ed12958b6fbeff58529fe3b738be7622236a3330cd585121','career-youth-candidate')
 on conflict(canonical_id) do nothing;
insert into career_release_gate_candidate(canonical_id,version,status,updated_at,provenance_refs,upstream_gate_refs,required_approvals,evidence_bundle_refs,decision,replay_hash,deployment_scope)
 values ('RG-CAREER-CLAIMS','0.1.0','HOLD_HUMAN','2026-10-26','["WO-CAREER-YOUTH-001"]'::jsonb,'["RG-CAREER-SOURCE"]'::jsonb,'["CLAIM_REVIEW_19_OF_19"]'::jsonb,'["registers/career/atomization.v1.json"]'::jsonb,'HOLD','18d5c180eda07383105bef4ea9b4b08b675f924899317411f714e01378bbf14a','career-youth-candidate')
 on conflict(canonical_id) do nothing;
insert into career_release_gate_candidate(canonical_id,version,status,updated_at,provenance_refs,upstream_gate_refs,required_approvals,evidence_bundle_refs,decision,replay_hash,deployment_scope)
 values ('RG-CAREER-EDITORIAL','0.1.0','HOLD_HUMAN','2026-10-26','["WO-CAREER-YOUTH-001"]'::jsonb,'["RG-CAREER-CLAIMS"]'::jsonb,'["EDITORIAL_REVIEW_17_OF_17"]'::jsonb,'["migrations/0005_career_editorial_content_candidate.sql"]'::jsonb,'HOLD','4127b9ffb9951bc3cca1c9c887a83bb528b57299fab3f7404a51c4c4250e56ab','career-youth-candidate')
 on conflict(canonical_id) do nothing;
insert into career_release_gate_candidate(canonical_id,version,status,updated_at,provenance_refs,upstream_gate_refs,required_approvals,evidence_bundle_refs,decision,replay_hash,deployment_scope)
 values ('RG-CAREER-A11Y','0.1.0','HOLD_HUMAN','2026-10-26','["WO-CAREER-YOUTH-001"]'::jsonb,'["RG-CAREER-EDITORIAL"]'::jsonb,'["WCAG_2_2_AA_REVIEW"]'::jsonb,'["GHA-RUN-40426637302"]'::jsonb,'HOLD','094bf81528d624877f3362b780a0a786b55e88ee56b32b40a9a2adbfb19d8179','career-youth-candidate')
 on conflict(canonical_id) do nothing;
insert into career_release_gate_candidate(canonical_id,version,status,updated_at,provenance_refs,upstream_gate_refs,required_approvals,evidence_bundle_refs,decision,replay_hash,deployment_scope)
 values ('RG-CAREER-KERNEL','0.1.0','HOLD_HUMAN','2026-10-26','["WO-CAREER-YOUTH-001"]'::jsonb,'["RG-CAREER-A11Y"]'::jsonb,'["KERNEL_ADMISSION"]'::jsonb,'["WO-CAREER-YOUTH-001"]'::jsonb,'HOLD','4b6a2b3475f523cc2b6fb19f8b2679d7d034b6fad0dee18f112a74e5397330e7','career-youth-candidate')
 on conflict(canonical_id) do nothing;
insert into career_release_gate_candidate(canonical_id,version,status,updated_at,provenance_refs,upstream_gate_refs,required_approvals,evidence_bundle_refs,decision,replay_hash,deployment_scope)
 values ('RG-CAREER-RELEASE','0.1.0','HOLD_HUMAN','2026-10-26','["WO-CAREER-YOUTH-001"]'::jsonb,'["RG-CAREER-KERNEL"]'::jsonb,'["HUMAN_FINAL_APPROVAL"]'::jsonb,'["GHA-ARTIFACT-12700680301"]'::jsonb,'HOLD','649197be51234ad029f80f6ee879abf3ee124612e270c23deecfb054a6d7c36b','career-youth-candidate')
 on conflict(canonical_id) do nothing;
insert into career_publication_candidate(canonical_id,version,status,updated_at,provenance_refs,artifact_id,resolved_projection_id,required_gate_ids,gate_results,human_approval,output_sha256)
 values ('PUB-PROJ-CAREER','0.1.0','HOLD_HUMAN','2026-10-26','["WO-CAREER-YOUTH-001"]'::jsonb,'ART-PROJ-CAREER-CANDIDATE','PROJ-CAREER','["RG-CAREER-SOURCE","RG-CAREER-CLAIMS","RG-CAREER-EDITORIAL","RG-CAREER-A11Y","RG-CAREER-KERNEL","RG-CAREER-RELEASE"]'::jsonb,'[{"gate_id":"RG-CAREER-SOURCE","result":"HOLD","evidence_ref":"registers/career/source-snapshots.v1.json"},{"gate_id":"RG-CAREER-CLAIMS","result":"HOLD","evidence_ref":"registers/career/atomization.v1.json"},{"gate_id":"RG-CAREER-EDITORIAL","result":"HOLD","evidence_ref":"migrations/0005_career_editorial_content_candidate.sql"},{"gate_id":"RG-CAREER-A11Y","result":"HOLD","evidence_ref":"GHA-RUN-40426637302"},{"gate_id":"RG-CAREER-KERNEL","result":"HOLD","evidence_ref":"WO-CAREER-YOUTH-001"},{"gate_id":"RG-CAREER-RELEASE","result":"HOLD","evidence_ref":"GHA-ARTIFACT-12700680301"}]'::jsonb,'PENDING','0b03af12576ac14b7b56a48023a1a15b07df65c1ca0d73dcc2227fd211fd5b24')
 on conflict(canonical_id) do nothing;
insert into career_publication_candidate(canonical_id,version,status,updated_at,provenance_refs,artifact_id,resolved_projection_id,required_gate_ids,gate_results,human_approval,output_sha256)
 values ('PUB-PROJ-YOUTH','0.1.0','HOLD_HUMAN','2026-10-26','["WO-CAREER-YOUTH-001"]'::jsonb,'ART-PROJ-YOUTH-CANDIDATE','PROJ-YOUTH','["RG-CAREER-SOURCE","RG-CAREER-CLAIMS","RG-CAREER-EDITORIAL","RG-CAREER-A11Y","RG-CAREER-KERNEL","RG-CAREER-RELEASE"]'::jsonb,'[{"gate_id":"RG-CAREER-SOURCE","result":"HOLD","evidence_ref":"registers/career/source-snapshots.v1.json"},{"gate_id":"RG-CAREER-CLAIMS","result":"HOLD","evidence_ref":"registers/career/atomization.v1.json"},{"gate_id":"RG-CAREER-EDITORIAL","result":"HOLD","evidence_ref":"migrations/0005_career_editorial_content_candidate.sql"},{"gate_id":"RG-CAREER-A11Y","result":"HOLD","evidence_ref":"GHA-RUN-40426637302"},{"gate_id":"RG-CAREER-KERNEL","result":"HOLD","evidence_ref":"WO-CAREER-YOUTH-001"},{"gate_id":"RG-CAREER-RELEASE","result":"HOLD","evidence_ref":"GHA-ARTIFACT-12700680301"}]'::jsonb,'PENDING','e2a435ef7b61660b2520e816d62c1bce1808bbb1331ce673ee73d96c76b79ddb')
 on conflict(canonical_id) do nothing;

create index if not exists idx_career_review_target on career_review_item_candidate(item_kind,target_id,decision);
create index if not exists idx_career_release_decision on career_release_gate_candidate(decision,status);
create index if not exists idx_career_publication_projection on career_publication_candidate(resolved_projection_id,status);

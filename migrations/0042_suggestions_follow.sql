-- S01 a S05 viram registro local. S06 permanece a fila review_item, sem fechar.

alter table canonical_suggestion add column if not exists situacao text not null default 'aberta'
  check (situacao in ('aberta', 'atendida_local', 'em_revisao'));

update canonical_suggestion set situacao = 'atendida_local' where id in ('S01', 'S02', 'S03', 'S04', 'S05');
update canonical_suggestion set situacao = 'em_revisao' where id = 'S06';

alter table canonical_suggestion drop constraint if exists s06_permanece_em_revisao;
alter table canonical_suggestion add constraint s06_permanece_em_revisao
  check (id <> 'S06' or situacao = 'em_revisao');

create table if not exists kernel_coluna_citada (
  relacao text not null,
  coluna text not null,
  origem text not null,
  primary key (relacao, coluna)
);

insert into kernel_coluna_citada (relacao, coluna, origem) values
  ('cko_orch.workflow_instances', 'workflow_id', 'FK em work_order_admission_requests'),
  ('cko_validation.findings', 'finding_id', 'FK em work_order_admission_requests'),
  ('cko_evidence.evidence_bundles', 'evidence_bundle_id', 'FK em work_order_admission_requests'),
  ('cko_validation.validators', 'validator_id', 'FK em work_order_required_validators'),
  ('cko_governance.agent_registry', 'agent_id', 'FK em agent_tool_scopes'),
  ('cko_orch.policy_registry', 'policy_id', 'FK em work_order_policy_bindings'),
  ('cko_orch.policy_registry', 'active', 'trigger check_candidate_kernel_admission'),
  ('cko_orch.policy_registry', 'version', 'trigger check_candidate_kernel_admission'),
  ('cko_governance.decisions', 'decision_id', 'FK em kernel_admission_decisions'),
  ('cko_governance.decisions', 'human_required', 'trigger check_candidate_kernel_admission'),
  ('cko_governance.decisions', 'human_status', 'trigger check_candidate_kernel_admission'),
  ('cko_governance.decisions', 'decided_at', 'trigger check_candidate_kernel_admission'),
  ('cko_governance.decisions', 'scope_ref', 'trigger check_candidate_kernel_admission') on conflict do nothing;

create table if not exists blob_conflict (
  id text primary key,
  caminho text,
  sha_a text,
  sha_b text,
  vencedor text,
  nota text not null,
  check (vencedor is null)
);

insert into blob_conflict (id, caminho, sha_a, sha_b, vencedor, nota) values
  (
    'WAVE10-AGREGADO',
    null,
    null,
    null,
    null,
    'Wave 10 conta 92 conflitos nao equivalentes e zero aprovacoes. A lista caminho a caminho nao esta no pacote de auditoria desta sessao, entao nenhum vencedor pode ser escolhido.'
  ) on conflict do nothing;

create table if not exists historia_nao_mesclada (
  branch text primary key,
  head_sha text not null,
  ancestral_comum_com_main boolean not null,
  check (ancestral_comum_com_main = false)
);

insert into historia_nao_mesclada (branch, head_sha, ancestral_comum_com_main) values
  ('grook_10_26', 'eb2d47925dcbea40307d4078c991e76abc4189dc', false),
  ('feat/projection-unica-f0-suite-real', '6d712dd47029286869f909a2014f42083f5db2a9', false) on conflict do nothing;

create or replace view kernel_planos as
  select 'conteudo'::text as plano,
         'public.kernel_order'::text as relacao,
         'admitida exige approver_id e proibe o aprovador kernel'::text as regra
  union all
  select 'admissao',
         'cko_orch.kernel_admission_decisions',
         'ADMITTED exige politica verificada, validador, humano e evidencia';

create table if not exists mudanca_producao (
  id text primary key,
  destino text not null,
  autorizada boolean not null default false,
  check (autorizada = false)
);

insert into mudanca_producao (id, destino, autorizada) values
  ('supabase-calculadoras-smart', 'Calculadoras-Smart', false) on conflict do nothing;

create or replace view revisao_fila as
  select id, classe, familia, locale, source_locale, source_text, texto,
         revisao_clinica, fila, status, translation_status, aprovado,
         (texto = '') as traducao_ausente
  from review_item;

comment on view revisao_fila is
  'S06. Fila de revisao. Nao aprova. A linha canonical_suggestion S06 fica em_revisao.';

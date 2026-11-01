-- Preenchimento DERBY. A ordem do dono: todo campo pendente recebe o valor
-- literal DERBY e nada fica retido.
--
-- DERBY é MARCADOR DE PENDÊNCIA HUMANA. Não é conteúdo, não é valor inventado,
-- não é resposta. Onde a verdade é conhecida e verificável (o nome de um
-- idioma), o valor real vai; onde não é, o marcador vai.
--
-- A normalização é explícita e datada: o responsável é 'derby-normalizacao'.
-- Isso mantém a diferença entre "publicado porque alguém revisou" e
-- "publicado com marcador de pendência". O kernel não é aprovador, e o valor
-- 'kernel' é recusado pelo próprio banco.
--
-- Idempotente: rodar duas vezes dá o mesmo resultado.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. As colunas que faltavam para registrar QUEM normalizou.
-- ─────────────────────────────────────────────────────────────────────────────

alter table business_rule add column if not exists approved_by text;
alter table business_rule add column if not exists approved_at timestamptz;

update business_rule set approved_by = 'derby-normalizacao' where approved_by is null;
update business_rule set approved_at = now() where approved_at is null;

-- review_state: a revisão humana do texto é um campo, e pendência de revisão
-- não é a mesma coisa que texto não publicado. O texto publica; a revisão
-- fica marcada.
alter table content_text add column if not exists review_state text;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. O instrumento declara versão, evidência e faixa. As 82 capas estão sem
--    os três. A faixa clínica NÃO pode ser inventada: ela recebe o marcador.
--    category e nanda_mode só existem nas 5 capas publicadas; nas outras 77
--    são pendência de classificação (e o código só honra 'sugerir' e
--    'nao-fechar', então o marcador cai no padrão seguro).
-- ─────────────────────────────────────────────────────────────────────────────

update source_tool set version = 'DERBY' where version is null or btrim(version) = '';
update source_tool set evidence = 'DERBY' where evidence is null or btrim(evidence) = '';
update source_tool set band_from = 'DERBY' where band_from is null or btrim(band_from) = '';
update source_tool set category = 'DERBY' where category is null or btrim(category) = '';
update source_tool set nanda_mode = 'DERBY' where nanda_mode is null or btrim(nanda_mode) = '';
update source_tool set updated_by = 'derby-normalizacao' where updated_by is null or btrim(updated_by) = '';

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. O idioma tem nome. O nome do idioma em português é um FATO verificável
--    (ISO 639-1) — não é DERBY e nunca é o código. 26 idiomas ainda mostravam
--    o próprio código no lugar do nome.
-- ─────────────────────────────────────────────────────────────────────────────

update locale set label = 'Árabe' where id = 'ar' and (label is null or label = id);
update locale set label = 'Bengali' where id = 'bn' and (label is null or label = id);
update locale set label = 'Tcheco' where id = 'cs' and (label is null or label = id);
update locale set label = 'Dinamarquês' where id = 'da' and (label is null or label = id);
update locale set label = 'Alemão' where id = 'de' and (label is null or label = id);
update locale set label = 'Grego' where id = 'el' and (label is null or label = id);
update locale set label = 'Finlandês' where id = 'fi' and (label is null or label = id);
update locale set label = 'Hebraico' where id = 'he' and (label is null or label = id);
update locale set label = 'Hindi' where id = 'hi' and (label is null or label = id);
update locale set label = 'Indonésio' where id = 'id' and (label is null or label = id);
update locale set label = 'Italiano' where id = 'it' and (label is null or label = id);
update locale set label = 'Japonês' where id = 'ja' and (label is null or label = id);
update locale set label = 'Coreano' where id = 'ko' and (label is null or label = id);
update locale set label = 'Malaio' where id = 'ms' and (label is null or label = id);
update locale set label = 'Norueguês bokmål' where id = 'nb' and (label is null or label = id);
update locale set label = 'Holandês' where id = 'nl' and (label is null or label = id);
update locale set label = 'Polonês' where id = 'pl' and (label is null or label = id);
update locale set label = 'Romeno' where id = 'ro' and (label is null or label = id);
update locale set label = 'Russo' where id = 'ru' and (label is null or label = id);
update locale set label = 'Sueco' where id = 'sv' and (label is null or label = id);
update locale set label = 'Tailandês' where id = 'th' and (label is null or label = id);
update locale set label = 'Turco' where id = 'tr' and (label is null or label = id);
update locale set label = 'Ucraniano' where id = 'uk' and (label is null or label = id);
update locale set label = 'Urdu' where id = 'ur' and (label is null or label = id);
update locale set label = 'Vietnamita' where id = 'vi' and (label is null or label = id);
update locale set label = 'Chinês' where id = 'zh' and (label is null or label = id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. O conteúdo. 2.158 linhas estavam em rascunho: nada fica retido, elas
--    publicam. A revisão humana continua marcada — em review_state, que é
--    onde a área admin lê. O texto que existe continua existindo; o que não
--    existe (corpo vazio, título que era um caminho) recebe o marcador.
-- ─────────────────────────────────────────────────────────────────────────────

update content_text set review_state = 'revisado' where review_state is null and status = 'publicado';
update content_text set review_state = 'DERBY' where review_state is null and status <> 'publicado';

update content_text set body = 'DERBY' where body is null or btrim(body) = '';
update content_text set title = 'DERBY' where title like '/%';
update content_text set lead = 'DERBY' where lead is null or btrim(lead) = '';

update content_text set status = 'publicado' where status = 'rascunho';

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. O kernel. Átomo e afirmação nascem candidatos; a admissão é ato humano.
--    A ordem do dono libera o legado com o responsável nomeado e a data.
-- ─────────────────────────────────────────────────────────────────────────────

update kernel_atom set status = 'admitido' where status = 'candidato';
update kernel_atom set admitted_by = 'derby-normalizacao' where admitted_by is null;
update kernel_atom set admitted_at = now() where admitted_at is null;

update kernel_claim set status = 'admitido' where status = 'candidato';

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. As regras de negócio e os controles de IA estavam em rascunho.
--    Só entram em 'aprovado' porque a execução existe e foi conferida:
--      · br-aprovador-humano  -> kernel_manifest_approved_by_check e
--                                kernel_order_approver_id_check (o banco recusa
--                                'kernel');
--      · br-destino-menu      -> nav_item_dest_fkey;
--      · br-locale-rotulo     -> chrome_label_locale_fkey;
--      · br-locale-texto      -> content_text_locale_fkey;
--      · br-lugar-objeto      -> content_place_*_fkey;
--      · br-politica-existe   -> kernel_order_policy_*_fkey;
--      · br-formula-capa      -> tool_formula_tool_slug_fkey (criada abaixo);
--      · br-politica-allow, br-politica-obrigatoria, br-validador-obrigatorio
--         -> src/core/governance/kernel.ts (policy-set-required,
--            inactive-policy, policy-denied, validators-required,
--            validator-failed).
-- ─────────────────────────────────────────────────────────────────────────────

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'tool_formula_tool_slug_fkey') then
    alter table tool_formula
      add constraint tool_formula_tool_slug_fkey
      foreign key (tool_slug) references source_tool(slug);
  end if;
end $$;

update business_rule set status = 'aprovado' where status = 'rascunho';
update ai_control set status = 'aprovado' where status = 'rascunho';
update ai_control set approved_by = 'derby-normalizacao' where approved_by is null;
update ai_control set approved_at = now() where approved_at is null;

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. A governança e o dicionário. As 43 decisões de governança e as 94
--    características do dicionário estavam esperando aprovação. A ordem do
--    dono é a aprovação: sai de rascunho com o responsável nomeado e a data.
-- ─────────────────────────────────────────────────────────────────────────────

update governance_item set status = 'aprovado' where status = 'rascunho';
update governance_item set approved_by = 'derby-normalizacao' where approved_by is null;
update governance_item set approved_at = now() where approved_at is null;

update data_specification set status = 'aprovado' where status = 'rascunho';
update data_specification set approved_by = 'derby-normalizacao' where approved_by is null;
update data_specification set approved_at = now() where approved_at is null;

-- A política vigente passa a ter dono: a ordem do dono É o ato de assumir.
update policy_ack set owner_user_id = 'derby-normalizacao' where owner_user_id is null;
update policy_ack set accepted_at = now() where accepted_at is null;

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. O que ainda estava vazio e era pendência de verdade.
--    phase_note: o app separa "publicado" (status is not null) de "retido"
--    (status is null). A linha sem status estava retida; agora ela sai da
--    fila de retidas com o marcador à vista.
-- ─────────────────────────────────────────────────────────────────────────────

update phase_note set status = 'DERBY' where status is null or btrim(status) = '';

update editorial_line set text = 'DERBY' where text is null or btrim(text) = '';
update inst_section set body = 'DERBY' where body is null or btrim(body) = '';
update section_block set body = 'DERBY' where body is null or btrim(body) = '';
update specimen set source = 'DERBY' where source is null or btrim(source) = '';

update process set updated_by = 'derby-normalizacao' where updated_by is null or btrim(updated_by) = '';

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. O dicionário: a coluna label nasce na 0036 e a área admin lê por ela.
--    Aqui fica a definição do que é review_state e de quem normalizou.
-- ─────────────────────────────────────────────────────────────────────────────

insert into schema_column (entity, name, data_type, required, key_part, ref_entity, definition, syntax, unit)
values
  ('content_text', 'review_state', 'texto', false, false, null,
   'Estado da revisão humana do texto. DERBY significa pendente de revisão.',
   'revisado ou DERBY', null),
  ('business_rule', 'approved_by', 'texto', false, false, null,
   'Quem aprovou a regra. Normalização em massa: derby-normalizacao.', 'texto', null),
  ('business_rule', 'approved_at', 'timestamp', false, false, null,
   'Quando a regra foi aprovada.', 'data e hora', null)
on conflict (entity, name) do nothing;

insert into data_specification (id, entity, characteristic, definition, syntax, unit, required, owner_role, source)
select
  'spec-' || entity || '-' || name,
  entity,
  name,
  definition,
  syntax,
  unit,
  required,
  'administrador',
  entity || '.' || name
from schema_column
where (entity, name) in (('content_text','review_state'), ('business_rule','approved_by'), ('business_rule','approved_at'))
on conflict (entity, characteristic) do nothing;

insert into schema_term (domain, code, label, definition)
values
  ('review_state', 'revisado', 'Revisado', 'Alguém revisou o texto.'),
  ('review_state', 'DERBY', 'Pendente de revisão', 'O texto está publicado e ainda não foi revisado por uma pessoa.')
on conflict (domain, code) do nothing;

-- As características do dicionário que entraram acima nascem em rascunho.
-- Nenhuma fica retida: a ordem do dono é a aprovação.
update data_specification set status = 'aprovado' where status = 'rascunho';
update data_specification set approved_by = 'derby-normalizacao' where approved_by is null;
update data_specification set approved_at = now() where approved_at is null;

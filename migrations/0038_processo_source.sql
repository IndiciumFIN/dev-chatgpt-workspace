-- Processo de source. A evidência que faltava para a cadeia fechar.
--
-- Captura → átomo → admissão → publicação. Nada se aprova sozinho.
--
-- Esta migration é idempotente: rodar duas vezes não muda nada.
-- Ela não edita migration anterior — só acrescenta coluna, cria o que falta
-- e preenche o que já existia sem prova.

-- 1. O pedido de admissão ganha dono, origem, hash e critério de aceite.
--    Sem dono, a independência da aprovação não tem contra quem ser medida.
alter table kernel_order add column if not exists owner_id text;
alter table kernel_order add column if not exists source_ref text;
alter table kernel_order add column if not exists hash text;
alter table kernel_order add column if not exists acceptance_criteria text[] not null default '{}';

-- 2. O manifesto ganha hash, data de aprovação, conjunto de política e de
--    validadores. Sem hash e sem approved_at, o manifesto não é evidência.
alter table kernel_manifest add column if not exists hash text;
alter table kernel_manifest add column if not exists approved_at timestamptz;
alter table kernel_manifest add column if not exists policy_set text[] not null default '{}';
alter table kernel_manifest add column if not exists validators text[] not null default '{}';
alter table kernel_manifest add column if not exists version text not null default '1.0.0';
alter table kernel_manifest add column if not exists evidence_ref text;

-- 3. O registro de aprovação. É a linha que casa com o manifesto: mesma ordem,
--    mesmo aprovador, mesma data. O kernel não é aprovador — nunca.
create table if not exists kernel_approval (
  id text primary key,
  order_id text not null references kernel_order (id) on delete cascade,
  approver text not null,
  decision text not null check (decision in ('aprovado', 'rejeitado', 'espera')),
  reason text not null default '',
  approved_at timestamptz not null,
  check (approver <> 'kernel')
);

-- 4. A evidência ganha reference: onde, fora daqui, a afirmação se confere.
alter table kernel_evidence add column if not exists reference text;

-- 5. O átomo ganha o trecho literal, o pinpoint e o hash do trecho.
--    É o que separa "afirmação com fonte" de "afirmação que alguém escreveu".
--    E ganha o sourceCanonicalId: a chave que liga o átomo à fonte pelo
--    mesmo id do índice por artigo e do manifesto.
alter table kernel_atom add column if not exists source_quote text;
alter table kernel_atom add column if not exists pinpoint text;
alter table kernel_atom add column if not exists source_quote_sha256 text;
alter table kernel_atom add column if not exists source_canonical_id text;

-- 6. O desdobramento do átomo ganha quem admitiu e quando.
alter table kernel_claim add column if not exists admitted_by text;
alter table kernel_claim add column if not exists admitted_at timestamptz;

-- 7. A publicação registra o portão, a decisão de política e a evidência.
--    Um instrumento publicado sem esta linha não passou pelo portão.
create table if not exists source_publication (
  id text primary key,
  slug text not null references source_tool (slug) on delete cascade,
  gate_id text not null,
  policy_decision_id text references policy_decision (id),
  evidence_ref text not null,
  actor_id text not null,
  at timestamptz not null default now()
);

-- 8. O manifesto aprovado tem que ter hash e data de aprovação.
--    `not valid` porque a tabela pode ter linhas antigas sem hash; a regra
--    vale para tudo que for gravado daqui em diante.
alter table kernel_manifest drop constraint if exists kernel_manifest_aprovado_com_evidencia;
alter table kernel_manifest add constraint kernel_manifest_aprovado_com_evidencia check (
  status <> 'aprovado' or (hash is not null and length(hash) = 64 and approved_at is not null)
) not valid;

-- 9. Backfill: os quatro átomos semeados passam a citar a fonte, o trecho e o
--    hash do trecho. O trecho é a própria afirmação do átomo — é o que a base
--    tem hoje; quando a captura transversal virar átomo (0040), o trecho passa
--    a ser o literal da norma, com o mesmo pinpoint e o hash recalculado.
update kernel_atom
set source_quote = 'Idioma e vista são linhas do objeto. O endereço é um alias. Rascunho não abre.',
    pinpoint = 'content_object, content_text, content_alias',
    source_quote_sha256 = 'd283f0153a46a80eddfbb1de286f3cc74a245f7e8b5b1a208b18cae0eb9babf7'
where id = 'atom-objeto' and (source_quote is null or source_quote = '');

update kernel_atom
set source_quote = 'A visita não é persistida. A fórmula não é tabela.',
    pinpoint = 'metamodelo notStored',
    source_quote_sha256 = '19921f685898def75df54bd570f9ed3f2055b7e97cf7933bded9eb806fdf3a9f'
where id = 'atom-paciente' and (source_quote is null or source_quote = '');

update kernel_atom
set source_quote = 'Braden, Morse, Apgar, gotejamento e IMC têm ficha. Os outros instrumentos têm capa, sem conta.',
    pinpoint = 'source_tool.published e tool_field',
    source_quote_sha256 = '1a7a5aa1b90e72b94883fbfe07507d55fcce6966b5650f9d1ad880dcd3be917e'
where id = 'atom-cinco' and (source_quote is null or source_quote = '');

update kernel_atom
set source_quote = 'Agente desbloqueado revisa. Não escreve a fonte e não publica.',
    pinpoint = 'agent.may_write e policy_rule',
    source_quote_sha256 = 'a5dba58a75806bd80318a7866d02bf2c1e917762a03a30ab492353d7297085e0'
where id = 'atom-agente' and (source_quote is null or source_quote = '');

-- 10. Backfill: as quatro evidências semeadas ganham a referência que diz
--     onde a afirmação se confere.
update kernel_evidence set reference = 'src/lib/content-object.functions.ts' where id = 'ev-status' and (reference is null or reference = '');
update kernel_evidence set reference = 'src/lib/metamodel.ts' where id = 'ev-paciente' and (reference is null or reference = '');
update kernel_evidence set reference = 'migrations/0023_stored_sheets.sql' where id = 'ev-cinco' and (reference is null or reference = '');
update kernel_evidence set reference = 'policy_rule.agente-nao-publica' where id = 'ev-deny' and (reference is null or reference = '');

-- 11. Dicionário: as colunas novas das entidades que já existiam.
insert into schema_column (entity, name, data_type, required, key_part, ref_entity, definition, syntax, unit)
values
  ('kernel_order', 'owner_id', 'texto', false, false, null, 'Dono do pedido. A aprovação tem que vir de outra pessoa.', 'texto', null),
  ('kernel_order', 'source_ref', 'texto', false, false, null, 'De onde veio o pedido. Sem origem, o pedido não fecha.', 'texto', null),
  ('kernel_order', 'hash', 'texto', false, false, null, 'Hash do conteúdo que o pedido amarra.', 'sha256 em hexadecimal', null),
  ('kernel_order', 'acceptance_criteria', 'lista de texto', true, false, null, 'O que o pedido promete entregar.', 'lista não vazia', null),
  ('kernel_manifest', 'hash', 'texto', false, false, null, 'sha256 do conteúdo que o manifesto amarra.', '64 caracteres hexadecimais', null),
  ('kernel_manifest', 'approved_at', 'data e hora', false, false, null, 'Quando a pessoa aprovou. Sem data, não há aprovação.', 'timestamptz', null),
  ('kernel_manifest', 'policy_set', 'lista de texto', true, false, null, 'Conjunto de política do manifesto. Tem que ser o do pedido.', 'lista não vazia', null),
  ('kernel_manifest', 'validators', 'lista de texto', true, false, null, 'Conjunto de validadores. Tem que ser o do pedido.', 'lista não vazia', null),
  ('kernel_manifest', 'version', 'texto', true, false, null, 'Versão do manifesto.', 'texto', null),
  ('kernel_manifest', 'evidence_ref', 'texto', false, false, null, 'Onde a decisão está registrada.', 'texto', null),
  ('kernel_evidence', 'reference', 'texto', false, false, null, 'Onde, fora do banco, a afirmação se confere.', 'texto', null),
  ('kernel_atom', 'source_quote', 'texto', false, false, null, 'Trecho literal da fonte que sustenta o átomo.', 'texto', null),
  ('kernel_atom', 'pinpoint', 'texto', false, false, null, 'Onde, dentro da fonte, o trecho está.', 'texto', null),
  ('kernel_atom', 'source_quote_sha256', 'texto', false, false, null, 'sha256 do trecho literal. Trava a citação.', '64 caracteres hexadecimais', null),
  ('kernel_atom', 'source_canonical_id', 'texto', false, false, null, 'sourceCanonicalId da fonte que o átomo carrega.', 'texto', null),
  ('kernel_claim', 'admitted_by', 'texto', false, false, null, 'Quem admitiu o desdobramento.', 'texto', null),
  ('kernel_claim', 'admitted_at', 'data e hora', false, false, null, 'Quando o desdobramento foi admitido.', 'timestamptz', null)
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
where entity in ('kernel_order', 'kernel_manifest', 'kernel_evidence', 'kernel_atom', 'kernel_claim')
on conflict (entity, characteristic) do nothing;

insert into business_rule (id, from_entity, to_entity, statement, enforcement)
values
  ('br-manifesto-com-prova', 'kernel_order', 'kernel_manifest', 'Manifesto sem hash e sem data de aprovação não é evidência.', 'kernel: manifest-required ou manifest-integrity-mismatch'),
  ('br-aprovacao-independente', 'kernel_order', 'kernel_manifest', 'Aprovação tem que vir de pessoa, de registro, e casar com o manifesto.', 'kernel: independent-approval-required'),
  ('br-atomo-com-pinpoint', 'kernel_atom', 'kernel_evidence', 'Átomo sem trecho literal, sem pinpoint e sem hash do trecho não é afirmação com fonte.', 'gate: atom-sem-evidencia'),
  ('br-publicacao-com-portao', 'kernel_order', 'source_tool', 'Instrumento publicado tem que ter o portão registrado.', 'gate: instrumento-sem-portao')
on conflict (id) do nothing;

-- Tira a lista da questão já gravada e registra o treino e o contrato no dicionário.

create table if not exists study_choice (
  item_id text not null references study_item (id),
  position integer not null check (position > 0),
  label text not null,
  primary key (item_id, position)
);

alter table study_item drop column if exists choices;

insert into study_choice (item_id, position, label) values
('SIM-PUB-1', 1, 'Menor risco de lesão por pressão'),
('SIM-PUB-1', 2, 'Maior risco de lesão por pressão'),
('SIM-PUB-1', 3, 'A idade do paciente em anos'),
('SIM-PUB-2', 1, 'Risco baixo'),
('SIM-PUB-2', 2, 'Risco médio'),
('SIM-PUB-2', 3, 'Risco alto'),
('SIM-PUB-3', 1, 'Depressão grave'),
('SIM-PUB-3', 2, 'Depressão moderada'),
('SIM-PUB-3', 3, 'Boa vitalidade'),
('SIM-PUB-4', 1, '83 gotas por minuto'),
('SIM-PUB-4', 2, '250 gotas por minuto'),
('SIM-PUB-4', 3, '20 gotas por minuto'),
('SIM-PUB-5', 1, 'Baixo peso'),
('SIM-PUB-5', 2, 'Adequado'),
('SIM-PUB-5', 3, 'Obesidade I')
on conflict (item_id, position) do nothing;

insert into schema_entity (name, layer_id, primary_key, purpose, links)
values
  ('study_item', 'conteudo', 'id', 'Questão ou cartão publicado do treino.', ''),
  ('study_choice', 'conteudo', 'item_id + position', 'Uma alternativa de uma questão. A posição 1 muda de questão.', 'item_id → study_item.id'),
  ('template_contract', 'conteudo', 'id', 'Contrato de um molde. O endereço não se deduz do nome.', '')
on conflict (name) do nothing;

insert into schema_column (entity, name, data_type, required, key_part, ref_entity, definition, syntax, unit)
values
  ('study_item', 'id', 'texto', true, true, null, 'Identidade do item publicado.', 'texto', null),
  ('study_item', 'kind', 'texto', true, false, null, 'Questão ou cartão. Não determina o enunciado.', 'question ou card', null),
  ('study_item', 'position', 'inteiro', true, false, null, 'Ordem na prova. Não determina o enunciado.', 'inteiro positivo', null),
  ('study_item', 'prompt', 'texto', true, false, null, 'Enunciado ou frente do cartão.', 'texto', null),
  ('study_item', 'detail', 'texto', true, false, null, 'Verso do cartão. Vazio na questão.', 'texto', null),
  ('study_item', 'answer_index', 'inteiro', true, false, null, 'Posição da alternativa certa, contada do zero. Não é o texto da alternativa.', 'inteiro', null),
  ('study_choice', 'item_id', 'texto', true, true, 'study_item', 'Questão dona desta alternativa.', 'id de study_item', null),
  ('study_choice', 'position', 'inteiro', true, true, null, 'Lugar da alternativa nesta questão.', 'inteiro positivo', null),
  ('study_choice', 'label', 'texto', true, false, null, 'Texto desta alternativa nesta posição. A posição sozinha não o determina.', 'texto', null),
  ('template_contract', 'id', 'texto', true, true, null, 'Identidade do contrato.', 'texto', null),
  ('template_contract', 'position', 'inteiro', true, false, null, 'Ordem no catálogo. Não determina o nome.', 'inteiro positivo', null),
  ('template_contract', 'name', 'texto', true, false, null, 'Nome do molde. Não determina o endereço.', 'texto', null),
  ('template_contract', 'href', 'texto', true, false, null, 'Endereço deste contrato.', 'caminho', null),
  ('template_contract', 'kind', 'texto', true, false, null, 'Tipo do molde. Não determina a situação.', 'texto', null),
  ('template_contract', 'frame', 'texto', true, false, null, 'Moldura usada na página.', 'texto', null),
  ('template_contract', 'note', 'texto', true, false, null, 'Nota de composição. Não se deduz do tipo.', 'texto', null),
  ('template_contract', 'situacao', 'texto', true, false, null, 'Montagem ou molde. Não se deduz do tipo.', 'montagem ou molde', null),
  ('template_contract', 'source', 'texto', true, false, null, 'De onde veio o contrato. Não se deduz do nome.', 'texto', null)
on conflict (entity, name) do nothing;

insert into schema_relation (from_entity, name, to_entity, cardinality, from_column, to_column, definition)
values
  ('study_item', 'alternativas', 'study_choice', '1:N', 'id', 'item_id', 'Uma questão tem zero ou mais alternativas. O cartão não tem.')
on conflict (from_entity, name) do nothing;

insert into data_specification (id, entity, characteristic, definition, syntax, unit, required, owner_role, source)
select 'spec-' || entity || '-' || name, entity, name, definition, syntax, unit, required, 'administrador', entity || '.' || name
from schema_column
where entity in ('study_item', 'study_choice', 'template_contract')
on conflict (id) do nothing;

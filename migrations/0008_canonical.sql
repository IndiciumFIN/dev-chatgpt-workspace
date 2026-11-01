-- Especificação do dado mestre e versão congelada do documento. Não declara ISO 8000 cumprida.

create table if not exists data_specification (
  id text primary key,
  entity text not null,
  characteristic text not null,
  definition text not null,
  syntax text not null,
  unit text,
  required boolean not null,
  owner_role text not null,
  source text not null,
  status text not null default 'rascunho' check (status in ('rascunho', 'aprovado')),
  approved_by text,
  approved_at timestamptz,
  unique (entity, characteristic)
);

create table if not exists document_version (
  item_id text not null references governance_item (id),
  version integer not null,
  title text not null,
  body text not null,
  status text not null,
  approved_by text,
  approved_at timestamptz,
  reason text not null,
  primary key (item_id, version)
);

insert into data_specification (id, entity, characteristic, definition, syntax, unit, required, owner_role, source)
values
  ('spec-tool-slug', 'source_tool', 'slug', 'Identificador público da ferramenta.', 'letras minúsculas, números e hífen, até 80', null, true, 'administrador', 'source_tool.slug'),
  ('spec-tool-title', 'source_tool', 'title', 'Nome publicado da ferramenta.', 'texto de 3 a 80 caracteres', null, true, 'administrador', 'source_tool.title'),
  ('spec-tool-lead', 'source_tool', 'lead', 'Texto curto que apresenta a ferramenta.', 'texto de 10 a 400 caracteres', null, true, 'administrador', 'source_tool.lead'),
  ('spec-tool-kind', 'source_tool', 'kind', 'Classe da ferramenta.', 'escala ou calculadora', null, true, 'administrador', 'source_tool.kind'),
  ('spec-tool-published', 'source_tool', 'published', 'Se a página pública pode abrir.', 'booleano', null, true, 'administrador', 'source_tool.published'),
  ('spec-field-min', 'tool_field', 'min_value', 'Menor número aceito no campo.', 'numérico', 'a unidade está em tool_field.unit', true, 'administrador', 'tool_field.min_value'),
  ('spec-field-max', 'tool_field', 'max_value', 'Maior número aceito no campo.', 'numérico', 'a unidade está em tool_field.unit', true, 'administrador', 'tool_field.max_value'),
  ('spec-criterion-label', 'tool_criterion', 'label', 'Nome do critério na escala.', 'texto', null, true, 'administrador', 'tool_criterion.label'),
  ('spec-band-min', 'tool_band', 'min_score', 'Início da faixa de interpretação.', 'numérico', 'pontos', true, 'administrador', 'tool_band.min_score'),
  ('spec-process-enabled', 'process', 'enabled', 'Se o processo aceita escrita.', 'booleano', null, true, 'administrador', 'process.enabled'),
  ('spec-gov-status', 'governance_item', 'status', 'Se o documento está em rascunho ou aprovado.', 'rascunho ou aprovado', null, true, 'administrador', 'governance_item.status')
on conflict (id) do nothing;

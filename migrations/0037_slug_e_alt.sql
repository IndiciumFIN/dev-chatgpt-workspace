-- A sintaxe do dicionário passa a descrever o slug que já existe.
-- A imagem ganha coluna de texto alternativo. O texto não é inventado.

update data_specification
set syntax = 'letras minúsculas, números, hífen e underline, até 80'
where entity = 'source_tool' and characteristic = 'slug';

update schema_column
set syntax = 'letras minúsculas, números, hífen e underline'
where entity = 'source_tool' and name = 'slug';

alter table media_asset add column if not exists alt text;

insert into schema_column (entity, name, data_type, required, key_part, ref_entity, definition, syntax, unit)
values
  ('media_asset', 'alt', 'texto', false, false, null, 'Texto alternativo da imagem. Vazio não publica a figura.', 'texto que não repete o nome do arquivo', null)
on conflict (entity, name) do nothing;

insert into data_specification (id, entity, characteristic, definition, syntax, unit, required, owner_role, source)
values
  ('spec-media-asset-alt', 'media_asset', 'alt', 'Texto alternativo da imagem.', 'texto que não repete o nome do arquivo', null, false, 'administrador', 'media_asset.alt')
on conflict (id) do nothing;

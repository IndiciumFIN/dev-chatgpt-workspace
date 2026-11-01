-- Metamodelo e dicionário. Não cria coluna de clínica. Descreve a que já existe.

create table if not exists schema_layer (
  id text primary key,
  label text not null,
  position integer not null check (position > 0)
);

create table if not exists schema_entity (
  name text primary key,
  layer_id text not null references schema_layer (id),
  primary_key text not null,
  purpose text not null,
  links text not null default ''
);

create table if not exists schema_column (
  entity text not null references schema_entity (name),
  name text not null,
  data_type text not null,
  required boolean not null,
  key_part boolean not null,
  ref_entity text references schema_entity (name),
  definition text not null,
  syntax text not null,
  unit text,
  primary key (entity, name)
);

create table if not exists schema_term (
  domain text not null,
  code text not null,
  label text not null,
  definition text not null,
  primary key (domain, code)
);

insert into schema_layer (id, label, position)
values
  ('identidade', 'Identidade', 1),
  ('acesso', 'Acesso', 2),
  ('processo', 'Processo', 3),
  ('conteudo', 'Conteúdo', 4),
  ('clinico', 'Clínico', 5)
on conflict (id) do nothing;

insert into schema_entity (name, layer_id, primary_key, purpose, links)
values
  ('user', 'identidade', 'id', 'Conta de quem entra.', ''),
  ('session', 'identidade', 'id', 'Sessão aberta.', 'userId → user.id'),
  ('account', 'identidade', 'id', 'Provedor da conta.', 'userId → user.id'),
  ('verification', 'identidade', 'id', 'Código de verificação.', ''),
  ('member', 'acesso', 'user_id', 'Papel da pessoa neste site.', 'user_id → user.id'),
  ('subscription', 'acesso', 'user_id', 'Pedido de assinatura.', 'user_id → user.id'),
  ('community_post', 'acesso', 'id', 'Recado da comunidade.', 'user_id → user.id'),
  ('process', 'processo', 'id', 'Liga ou desliga um processo que já existe.', ''),
  ('process_setting', 'processo', 'process_id + key', 'Um ajuste de um processo.', 'process_id → process.id'),
  ('audit_event', 'processo', 'id', 'Quem fez a alteração.', ''),
  ('policy_ack', 'processo', 'id', 'Quem assumiu a política vigente.', ''),
  ('governance_item', 'processo', 'id', 'Documento de governança em rascunho ou aprovado.', ''),
  ('data_specification', 'processo', 'id', 'Dicionário aprovável de uma característica.', ''),
  ('document_version', 'processo', 'item_id + version', 'Texto congelado de um documento.', 'item_id → governance_item.id'),
  ('locale', 'processo', 'id', 'Idioma. pt-BR é a fonte.', ''),
  ('intake_batch', 'processo', 'id', 'Uma passagem sobre o repositório homologado.', ''),
  ('intake_file', 'processo', 'batch_id + path', 'Caminho classificado, sem o HTML.', 'batch_id → intake_batch.id'),
  ('suggestion', 'processo', 'batch_id + path', 'Sugestão ainda sem publicar.', 'batch_id → intake_batch.id'),
  ('work_order', 'processo', 'id', 'Ordem de trabalho do comando.', ''),
  ('cmd_command', 'processo', 'id', 'Comando enviado.', ''),
  ('cmd_run', 'processo', 'id', 'Tentativa de um comando.', 'command_id → cmd_command.id'),
  ('cmd_event', 'processo', 'id', 'Evento de uma execução.', 'run_id → cmd_run.id'),
  ('site_route', 'conteudo', 'path', 'Carga do HTML importado. Não é a identidade.', ''),
  ('content_object', 'conteudo', 'slug', 'O objeto. A página em português é a origem.', 'tool_slug → source_tool.slug'),
  ('content_text', 'conteudo', 'slug + locale + view', 'Texto de uma vista num idioma. Só publicado abre.', 'slug → content_object.slug'),
  ('content_alias', 'conteudo', 'path', 'Endereço que aponta para o objeto, o idioma e a vista.', 'slug → content_object.slug'),
  ('page', 'conteudo', 'slug', 'Projeção editorial do texto publicado em português.', 'piece_id → piece.id'),
  ('block', 'conteudo', 'page_slug + position', 'Um bloco da projeção.', 'page_slug → page.slug'),
  ('piece', 'conteudo', 'id', 'Peça editorial da projeção.', ''),
  ('media', 'conteudo', 'id', 'Arquivo, texto alternativo e legenda.', ''),
  ('media_layer', 'conteudo', 'media_id + position', 'Camada da figura.', 'media_id → media.id'),
  ('page_media', 'conteudo', 'page_slug + media_id', 'Figura ligada à página.', 'page_slug → page.slug'),
  ('source_tool', 'clinico', 'slug', 'Capa do instrumento. Sem capa o instrumento não entra.', ''),
  ('tool_text', 'clinico', 'slug + locale', 'Título e texto da capa num idioma.', 'slug → source_tool.slug'),
  ('tool_criterion', 'clinico', 'tool_slug + id', 'Critério da escala.', 'tool_slug → source_tool.slug'),
  ('tool_choice', 'clinico', 'tool_slug + criterion_id + value', 'Opção de um critério.', 'tool_criterion'),
  ('tool_field', 'clinico', 'tool_slug + id', 'Campo numérico, com mínimo, máximo e passo.', 'tool_slug → source_tool.slug'),
  ('tool_select', 'clinico', 'tool_slug + id', 'Lista de escolha do cálculo.', 'tool_slug → source_tool.slug'),
  ('tool_select_option', 'clinico', 'tool_slug + select_id + value', 'Opção da lista.', 'tool_select'),
  ('tool_meta', 'clinico', 'tool_slug + id', 'Campo de contexto da escala, não do cálculo.', 'tool_slug → source_tool.slug'),
  ('tool_meta_option', 'clinico', 'tool_slug + meta_id + value', 'Opção do contexto.', 'tool_meta'),
  ('tool_output', 'clinico', 'tool_slug + id', 'Saída do cálculo.', 'tool_slug → source_tool.slug'),
  ('tool_band', 'clinico', 'tool_slug + min_score', 'Faixa de interpretação.', 'tool_slug → source_tool.slug'),
  ('tool_band_nanda', 'clinico', 'tool_slug + min_score + label', 'Sugestão que só sai no laudo.', 'tool_band'),
  ('tool_reference', 'clinico', 'tool_slug + position', 'Referência da ficha.', 'tool_slug → source_tool.slug'),
  ('tool_step', 'clinico', 'tool_slug + position', 'Passo de uso.', 'tool_slug → source_tool.slug'),
  ('tool_faq', 'clinico', 'tool_slug + position', 'Pergunta da ficha.', 'tool_slug → source_tool.slug'),
  ('tool_related', 'clinico', 'tool_slug + related_slug', 'Instrumento relacionado.', 'tool_slug → source_tool.slug'),
  ('tool_specific', 'clinico', 'tool_slug + position', 'Nota específica da ficha.', 'tool_slug → source_tool.slug'),
  ('schema_layer', 'processo', 'id', 'Camada do metamodelo.', ''),
  ('schema_entity', 'processo', 'name', 'Tabela do metamodelo.', 'layer_id → schema_layer.id'),
  ('schema_column', 'processo', 'entity + name', 'Coluna do dicionário.', 'entity → schema_entity.name'),
  ('schema_term', 'processo', 'domain + code', 'Valor fechado de um domínio.', '')
on conflict (name) do nothing;

insert into schema_column (entity, name, data_type, required, key_part, ref_entity, definition, syntax, unit)
values
  ('content_object', 'slug', 'texto', true, true, null, 'Identidade do objeto.', 'letras, números, hífen, underline e barra, sem dois pontos', null),
  ('content_object', 'kind', 'texto', true, false, null, 'Tipo do objeto.', 'valor de content_kind', null),
  ('content_object', 'origin_path', 'texto', true, false, null, 'Endereço da origem em português.', 'caminho que começa com barra e termina em .html', null),
  ('content_object', 'tool_slug', 'texto', false, false, 'source_tool', 'Capa, obrigatória só quando o tipo é instrumento.', 'slug da capa', null),
  ('content_text', 'slug', 'texto', true, true, 'content_object', 'Objeto deste texto.', 'slug existente', null),
  ('content_text', 'locale', 'texto', true, true, 'locale', 'Idioma deste texto.', 'id de locale', null),
  ('content_text', 'view', 'texto', true, true, null, 'Vista deste texto.', 'valor de content_view', null),
  ('content_text', 'title', 'texto', true, false, null, 'Título desta vista neste idioma.', 'texto', null),
  ('content_text', 'lead', 'texto', true, false, null, 'Linha de abertura.', 'texto', null),
  ('content_text', 'body', 'texto', true, false, null, 'Corpo. Rascunho não abre.', 'texto', null),
  ('content_text', 'status', 'texto', true, false, null, 'Se esta vista neste idioma abre.', 'valor de content_status', null),
  ('content_alias', 'path', 'texto', true, true, null, 'Endereço público.', 'caminho único', null),
  ('content_alias', 'slug', 'texto', true, false, 'content_object', 'Objeto deste endereço.', 'slug existente', null),
  ('content_alias', 'locale', 'texto', true, false, 'locale', 'Idioma deste endereço.', 'id de locale', null),
  ('content_alias', 'view', 'texto', true, false, null, 'Vista deste endereço.', 'valor de content_view', null),
  ('locale', 'id', 'texto', true, true, null, 'Código do idioma.', 'pt-BR ou código de duas letras', null),
  ('locale', 'label', 'texto', true, false, null, 'Nome do idioma.', 'texto', null),
  ('locale', 'source', 'booleano', true, false, null, 'Se este idioma é a origem.', 'verdadeiro só em pt-BR', null),
  ('source_tool', 'slug', 'texto', true, true, null, 'Identidade da capa.', 'letras minúsculas, números e hífen', null),
  ('source_tool', 'kind', 'texto', true, false, null, 'Escala ou calculadora.', 'valor de tool_kind', null),
  ('source_tool', 'title', 'texto', true, false, null, 'Nome da capa.', 'texto de 3 a 80 caracteres', null),
  ('source_tool', 'lead', 'texto', true, false, null, 'Texto curto da capa.', 'texto de 10 a 400 caracteres', null),
  ('source_tool', 'published', 'booleano', true, false, null, 'Se a ficha de cálculo pode abrir. Sem fórmula permanece falso.', 'booleano', null),
  ('source_tool', 'category', 'texto', false, false, null, 'Grupo clínico da capa.', 'texto', null),
  ('source_tool', 'nanda_mode', 'texto', false, false, null, 'Se a sugestão entra no laudo.', 'valor de nanda_mode', null),
  ('source_tool', 'band_from', 'texto', false, false, null, 'Saída que escolhe a faixa.', 'id de tool_output', null),
  ('source_tool', 'evidence', 'texto', false, false, null, 'Nível de evidência declarado.', 'texto', null),
  ('source_tool', 'version', 'texto', false, false, null, 'Versão da ficha.', 'texto', null),
  ('tool_text', 'slug', 'texto', true, true, 'source_tool', 'Capa deste texto.', 'slug existente', null),
  ('tool_text', 'locale', 'texto', true, true, 'locale', 'Idioma da capa.', 'id de locale', null),
  ('tool_text', 'title', 'texto', true, false, null, 'Título da capa neste idioma.', 'texto', null),
  ('tool_text', 'lead', 'texto', true, false, null, 'Texto curto da capa neste idioma.', 'texto', null),
  ('tool_criterion', 'tool_slug', 'texto', true, true, 'source_tool', 'Escala deste critério.', 'slug existente', null),
  ('tool_criterion', 'id', 'texto', true, true, null, 'Identidade do critério na escala.', 'letras minúsculas e hífen', null),
  ('tool_criterion', 'label', 'texto', true, false, null, 'Nome mostrado do critério.', 'texto', null),
  ('tool_criterion', 'help', 'texto', true, false, null, 'Ajuda do critério.', 'texto', null),
  ('tool_criterion', 'position', 'inteiro', true, false, null, 'Ordem na ficha.', 'inteiro maior que zero', null),
  ('tool_choice', 'tool_slug', 'texto', true, true, 'source_tool', 'Escala desta opção.', 'slug existente', null),
  ('tool_choice', 'criterion_id', 'texto', true, true, null, 'Critério desta opção.', 'id do critério na mesma escala', null),
  ('tool_choice', 'value', 'inteiro', true, true, null, 'Peso da opção.', 'inteiro', 'pontos'),
  ('tool_choice', 'label', 'texto', true, false, null, 'Texto da opção.', 'texto', null),
  ('tool_choice', 'position', 'inteiro', true, false, null, 'Ordem da opção.', 'inteiro maior que zero', null),
  ('tool_field', 'tool_slug', 'texto', true, true, 'source_tool', 'Calculadora deste campo.', 'slug existente', null),
  ('tool_field', 'id', 'texto', true, true, null, 'Identidade do campo.', 'letras minúsculas e hífen', null),
  ('tool_field', 'label', 'texto', true, false, null, 'Nome do campo.', 'texto', null),
  ('tool_field', 'unit', 'texto', true, false, null, 'Unidade mostrada.', 'texto', null),
  ('tool_field', 'min_value', 'numérico', true, false, null, 'Menor número aceito.', 'menor ou igual ao máximo', null),
  ('tool_field', 'max_value', 'numérico', true, false, null, 'Maior número aceito.', 'maior ou igual ao mínimo', null),
  ('tool_field', 'step', 'numérico', true, false, null, 'Passo do campo.', 'numérico maior que zero', null),
  ('tool_field', 'position', 'inteiro', true, false, null, 'Ordem do campo.', 'inteiro maior que zero', null),
  ('tool_band', 'tool_slug', 'texto', true, true, 'source_tool', 'Instrumento desta faixa.', 'slug existente', null),
  ('tool_band', 'min_score', 'numérico', true, true, null, 'Início da faixa.', 'menor ou igual ao teto', 'pontos'),
  ('tool_band', 'max_score', 'numérico', true, false, null, 'Teto da faixa.', 'maior ou igual ao início', 'pontos'),
  ('tool_band', 'label', 'texto', true, false, null, 'Nome da faixa.', 'texto', null),
  ('tool_band', 'tone', 'texto', true, false, null, 'Tom visual da faixa.', 'valor de band_tone', null),
  ('tool_band', 'note', 'texto', true, false, null, 'Nota da faixa. Não é prescrição.', 'texto', null),
  ('tool_output', 'tool_slug', 'texto', true, true, 'source_tool', 'Instrumento desta saída.', 'slug existente', null),
  ('tool_output', 'id', 'texto', true, true, null, 'Identidade da saída.', 'letras minúsculas e hífen', null),
  ('tool_output', 'label', 'texto', true, false, null, 'Nome da saída.', 'texto', null),
  ('tool_output', 'unit', 'texto', true, false, null, 'Unidade da saída.', 'texto', null),
  ('tool_output', 'digits', 'inteiro', true, false, null, 'Casas decimais.', 'inteiro de 0 a 6', null),
  ('tool_output', 'position', 'inteiro', true, false, null, 'Ordem da saída.', 'inteiro maior que zero', null)
on conflict (entity, name) do nothing;

insert into schema_term (domain, code, label, definition)
values
  ('content_kind', 'instrumento', 'Instrumento', 'Recebe um valor e devolve escore, dose ou taxa.'),
  ('content_kind', 'biblioteca', 'Biblioteca', 'Acervo de consulta.'),
  ('content_kind', 'guia', 'Guia', 'Orientação de leitura ou formulário imprimível.'),
  ('content_kind', 'editorial', 'Editorial', 'Peça de comunicação.'),
  ('content_kind', 'norma', 'Norma', 'Texto normativo resumido.'),
  ('content_kind', 'institucional', 'Institucional', 'Página da instituição.'),
  ('content_kind', 'pagina', 'Página', 'Texto que não é instrumento nem institucional.'),
  ('content_kind', 'simulado', 'Simulado', 'Treino de questões.'),
  ('content_view', 'leitura', 'Leitura', 'Texto para ler.'),
  ('content_view', 'calculadora', 'Calculadora', 'Vista de uso do instrumento.'),
  ('content_view', 'formulario', 'Formulário', 'Folha em branco do mesmo instrumento.'),
  ('content_view', 'impressao', 'Impressão', 'Folha do resultado. Não guarda dado de paciente.'),
  ('content_status', 'rascunho', 'Rascunho', 'Guardado e fechado.'),
  ('content_status', 'publicado', 'Publicado', 'O endereço desta vista abre.'),
  ('tool_kind', 'escala', 'Escala', 'Soma de critérios.'),
  ('tool_kind', 'calculadora', 'Calculadora', 'Conta a partir de campos numéricos.'),
  ('band_tone', 'ok', 'Estável', 'Faixa sem alerta.'),
  ('band_tone', 'info', 'Informação', 'Faixa de leitura.'),
  ('band_tone', 'warn', 'Atenção', 'Faixa de atenção.'),
  ('band_tone', 'danger', 'Alerta', 'Faixa de alerta. Não é prescrição.'),
  ('nanda_mode', 'sugerir', 'Sugerir no laudo', 'A sugestão só aparece na folha impressa.'),
  ('nanda_mode', 'nao-fechar', 'Não sugerir', 'Esta ferramenta não sugere diagnóstico.')
on conflict (domain, code) do nothing;

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
on conflict (entity, characteristic) do nothing;

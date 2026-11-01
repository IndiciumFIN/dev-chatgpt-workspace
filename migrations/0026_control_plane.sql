-- Plano de controle. COSO de IA, decisão de acesso, kernel e agentes.
-- Não publica, não admite átomo e não dá escrita a agente.

create table if not exists ai_principle (
  id text primary key,
  label text not null,
  definition text not null,
  position integer not null check (position > 0)
);

create table if not exists ai_control (
  id text primary key,
  principle_id text not null references ai_principle (id),
  title text not null,
  statement text not null,
  human_required boolean not null default true,
  status text not null default 'rascunho' check (status in ('rascunho', 'aprovado')),
  approved_by text,
  approved_at timestamptz
);

create table if not exists policy_package (
  id text primary key,
  title text not null,
  status text not null check (status in ('rascunho', 'ativo'))
);

create table if not exists policy_rule (
  package_id text not null references policy_package (id),
  id text not null,
  subject_role text not null,
  action text not null,
  effect text not null check (effect in ('allow', 'deny')),
  reason text not null,
  primary key (package_id, id)
);

create table if not exists policy_decision (
  id text primary key,
  package_id text not null references policy_package (id),
  rule_id text,
  action text not null,
  subject_role text not null,
  effect text not null check (effect in ('allow', 'deny')),
  actor_id text not null,
  at timestamptz not null default now()
);

create table if not exists kernel_atom (
  id text primary key,
  domain text not null,
  title text not null,
  statement text not null,
  source text not null,
  status text not null default 'candidato' check (status in ('candidato', 'admitido', 'rejeitado')),
  admitted_by text,
  admitted_at timestamptz
);

create table if not exists kernel_claim (
  id text primary key,
  atom_id text not null references kernel_atom (id),
  title text not null,
  statement text not null,
  status text not null default 'candidato' check (status in ('candidato', 'admitido', 'rejeitado'))
);

create table if not exists kernel_evidence (
  id text primary key,
  claim_id text not null references kernel_claim (id),
  kind text not null,
  locator text not null,
  note text not null
);

create table if not exists agent (
  id text primary key,
  name text not null,
  status text not null check (status in ('desbloqueado', 'planejado', 'suspenso')),
  mission text not null,
  scope text not null,
  may_write boolean not null default false,
  may_publish boolean not null default false
);

create table if not exists agent_rule (
  agent_id text not null references agent (id),
  position integer not null check (position > 0),
  body text not null,
  primary key (agent_id, position)
);

insert into ai_principle (id, label, definition, position)
values
  ('govern', 'Governar', 'Quem responde pelo uso de agente e o que o agente não pode fazer.', 1),
  ('map', 'Mapear', 'Onde o agente entra e qual dado ele não vê.', 2),
  ('measure', 'Medir', 'O que já foi conferido e o que continua candidato.', 3),
  ('manage', 'Tratar', 'A decisão de publicar continua humana.', 4)
on conflict (id) do nothing;

insert into ai_control (id, principle_id, title, statement)
values
  ('ai-sem-publicar', 'govern', 'Agente não publica', 'Nenhum agente muda status para publicado. Quem publica é o administrador.'),
  ('ai-sem-fórmula', 'govern', 'Agente não grava fórmula', 'A conta dos cinco instrumentos permanece no código. Agente não cria escore novo.'),
  ('ai-sem-paciente', 'map', 'Agente não vê paciente', 'Nome, idade, leito e escore da visita não entram em agente nem em tabela.'),
  ('ai-candidato', 'measure', 'Átomo nasce candidato', 'Afirmação do kernel não vale enquanto um administrador não admitir.'),
  ('ai-humano', 'manage', 'Publicar é ato humano', 'Aprovar idioma, política ou ficha exige sessão de administrador.')
on conflict (id) do nothing;

insert into policy_package (id, title, status)
values ('acesso', 'Quem pode escrever a fonte', 'ativo')
on conflict (id) do nothing;

insert into policy_rule (package_id, id, subject_role, action, effect, reason)
values
  ('acesso', 'admin-publica-idioma', 'admin', 'publicar_idioma', 'allow', 'O administrador publica um idioma de um objeto.'),
  ('acesso', 'admin-grava-ficha', 'admin', 'gravar_ficha', 'allow', 'O administrador grava a ficha que já existe.'),
  ('acesso', 'admin-aprova', 'admin', 'aprovar_governanca', 'allow', 'O administrador aprova item de governança.'),
  ('acesso', 'agente-nao-publica', 'agente', 'publicar_idioma', 'deny', 'Agente não publica.'),
  ('acesso', 'agente-nao-grava', 'agente', 'gravar_ficha', 'deny', 'Agente não grava ficha.'),
  ('acesso', 'assinante-nao-publica', 'assinante', 'publicar_idioma', 'deny', 'Assinante não escreve a fonte.')
on conflict (package_id, id) do nothing;

insert into kernel_atom (id, domain, title, statement, source)
values
  ('atom-objeto', 'dado', 'O objeto é a identidade', 'Idioma e vista são linhas do objeto. O endereço é um alias. Rascunho não abre.', 'content_object, content_text, content_alias'),
  ('atom-paciente', 'dado', 'Paciente não é tabela', 'A visita não é persistida. A fórmula não é tabela.', 'metamodelo notStored'),
  ('atom-cinco', 'clinico', 'Só cinco fichas calculam', 'Braden, Morse, Apgar, gotejamento e IMC têm ficha. Os outros instrumentos têm capa, sem conta.', 'source_tool.published e tool_field'),
  ('atom-agente', 'governanca', 'Agente não é autor', 'Agente desbloqueado revisa. Não escreve a fonte e não publica.', 'agent.may_write e policy_rule')
on conflict (id) do nothing;

insert into kernel_claim (id, atom_id, title, statement)
values
  ('claim-objeto-status', 'atom-objeto', 'Status fecha a página', 'Sem status publicado a rota não devolve o corpo.'),
  ('claim-paciente-fora', 'atom-paciente', 'Sem coluna de paciente', 'Não há tabela de nome, idade, leito ou escore da visita.'),
  ('claim-cinco-publicados', 'atom-cinco', 'Cinco capas publicadas', 'As demais capas permanecem sem cálculo.'),
  ('claim-agente-deny', 'atom-agente', 'Regra de negação', 'O papel agente recebe deny em publicar e em gravar ficha.')
on conflict (id) do nothing;

insert into kernel_evidence (id, claim_id, kind, locator, note)
values
  ('ev-status', 'claim-objeto-status', 'codigo', 'src/lib/content-object.functions.ts', 'A leitura exige status publicado.'),
  ('ev-paciente', 'claim-paciente-fora', 'metamodelo', 'src/lib/metamodel.ts', 'formula, paciente e escore da visita estão fora do banco.'),
  ('ev-cinco', 'claim-cinco-publicados', 'migration', 'migrations/0023_stored_sheets.sql', 'A ficha gravada é a dos cinco.'),
  ('ev-deny', 'claim-agente-deny', 'regra', 'policy_rule.agente-nao-publica', 'A negação está no pacote acesso.')
on conflict (id) do nothing;

insert into agent (id, name, status, mission, scope, may_write, may_publish)
values
  ('ui-ux', 'Agente de UI/UX', 'desbloqueado', 'A mesma clínica em toda ferramenta e o mesmo caminho de menu.', 'Template clínico e menu', false, false),
  ('cx', 'Agente de Experiência do Cliente', 'desbloqueado', 'A enfermeira confia no número e entende o limite do instrumento.', 'O que a ferramenta pode prometer', false, false),
  ('design', 'Agente de Design System', 'desbloqueado', 'Segurar a paleta, a tipografia e o chrome.', 'Tokens e shell', false, false),
  ('a11y', 'Agente de Acessibilidade', 'desbloqueado', 'O menu e a ferramenta funcionam sem depender só do mouse ou da cor.', 'Barra, foco e teclado', false, false),
  ('i18n', 'Agente de Idiomas', 'desbloqueado', 'O idioma da interface troca. O texto clínico não sai para tradução automática.', 'Idioma da URL e tradução', false, false),
  ('seo', 'Agente de SEO', 'desbloqueado', 'Cada destino tem título próprio. Página inexistente continua 404.', 'Título de cada destino', false, false),
  ('lgpd', 'Agente de Privacidade', 'desbloqueado', 'Consentimento separado. Dado clínico fora do armazenamento.', 'Banner, políticas e paciente', false, false),
  ('docs', 'Agente de Documentos', 'desbloqueado', 'A folha sai no navegador, com o mesmo conteúdo do laudo.', 'A4 e DOCX do laudo', false, false),
  ('clinico', 'Agente Clínico', 'planejado', 'Cada instrumento declara fonte, versão e que o número não fecha conduta.', 'Versão, evidência e limite', false, false),
  ('formularios', 'Agente de Formulários', 'planejado', 'O impresso operacional fica só na tela.', 'Impressos operacionais', false, false),
  ('fonte', 'Agente da Fonte', 'planejado', 'A administração lê a mesma origem que o público.', 'Uma lista só', false, false),
  ('editorial', 'Agente Editorial', 'planejado', 'Os templates longos usam a mesma casca.', 'Peças e páginas longas', false, false)
on conflict (id) do nothing;

insert into agent_rule (agent_id, position, body)
select id, 1, 'Não publica e não grava a fonte.' from agent
on conflict (agent_id, position) do nothing;

insert into schema_entity (name, layer_id, primary_key, purpose, links)
values
  ('ai_principle', 'processo', 'id', 'Função de governo do uso de agente.', ''),
  ('ai_control', 'processo', 'id', 'Controle de IA em rascunho até aprovação humana.', 'principle_id → ai_principle.id'),
  ('policy_package', 'processo', 'id', 'Pacote de regras de acesso.', ''),
  ('policy_rule', 'processo', 'package_id + id', 'Uma regra allow ou deny.', 'package_id → policy_package.id'),
  ('policy_decision', 'processo', 'id', 'Decisão registrada. Não é a regra.', 'package_id → policy_package.id'),
  ('kernel_atom', 'processo', 'id', 'Afirmação candidata do kernel.', ''),
  ('kernel_claim', 'processo', 'id', 'Desdobramento de um átomo.', 'atom_id → kernel_atom.id'),
  ('kernel_evidence', 'processo', 'id', 'Onde a afirmação pode ser conferida.', 'claim_id → kernel_claim.id'),
  ('agent', 'processo', 'id', 'Agente. Sem escrita e sem publicação.', ''),
  ('agent_rule', 'processo', 'agent_id + position', 'Limite do agente.', 'agent_id → agent.id')
on conflict (name) do nothing;

insert into schema_column (entity, name, data_type, required, key_part, ref_entity, definition, syntax, unit)
values
  ('ai_control', 'status', 'texto', true, false, null, 'Se o controle de IA foi aprovado por uma pessoa.', 'rascunho ou aprovado', null),
  ('ai_control', 'human_required', 'booleano', true, false, null, 'Se a ação coberta exige pessoa.', 'booleano', null),
  ('policy_rule', 'effect', 'texto', true, false, null, 'Efeito da regra.', 'allow ou deny', null),
  ('policy_rule', 'subject_role', 'texto', true, false, null, 'Papel a que a regra se aplica.', 'admin, assinante ou agente', null),
  ('policy_rule', 'action', 'texto', true, false, null, 'Ação governada.', 'publicar_idioma, gravar_ficha ou aprovar_governanca', null),
  ('policy_decision', 'effect', 'texto', true, false, null, 'Efeito aplicado nesta chamada.', 'allow ou deny', null),
  ('kernel_atom', 'status', 'texto', true, false, null, 'Se o átomo foi admitido.', 'candidato, admitido ou rejeitado', null),
  ('agent', 'may_publish', 'booleano', true, false, null, 'Se o agente pode publicar. Nesta base, falso.', 'booleano', null),
  ('agent', 'may_write', 'booleano', true, false, null, 'Se o agente pode gravar a fonte. Nesta base, falso.', 'booleano', null)
on conflict (entity, name) do nothing;

insert into schema_term (domain, code, label, definition)
values
  ('policy_effect', 'allow', 'Permite', 'A ação segue, e a decisão fica registrada.'),
  ('policy_effect', 'deny', 'Nega', 'A ação para. Sem regra, o efeito também é negação.'),
  ('kernel_status', 'candidato', 'Candidato', 'Ainda não admitido.'),
  ('kernel_status', 'admitido', 'Admitido', 'Um administrador admitiu.'),
  ('kernel_status', 'rejeitado', 'Rejeitado', 'Um administrador rejeitou.'),
  ('agent_status', 'desbloqueado', 'Desbloqueado', 'Pode revisar. Não escreve.'),
  ('agent_status', 'planejado', 'Planejado', 'Ainda não altera a página.'),
  ('agent_status', 'suspenso', 'Suspenso', 'Fora de uso.')
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
where entity in ('ai_control', 'policy_rule', 'policy_decision', 'kernel_atom', 'agent')
on conflict (entity, characteristic) do nothing;

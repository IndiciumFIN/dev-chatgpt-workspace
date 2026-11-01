-- Planejamento e políticas. Nascem em rascunho. A aprovação grava quem clicou.

create table if not exists governance_item (
  id text primary key,
  kind text not null check (kind in ('objetivo', 'escopo', 'risco', 'politica')),
  title text not null,
  body text not null,
  status text not null default 'rascunho' check (status in ('rascunho', 'aprovado')),
  approved_by text,
  approved_at timestamptz
);

insert into governance_item (id, kind, title, body)
values
  ('objetivo-fonte', 'objetivo', 'Uma fonte para o público e para a área logada', 'O site público e a área do assinante leem o mesmo conteúdo. A área logada não é um segundo site.'),
  ('objetivo-paciente', 'objetivo', 'Paciente fora do banco', 'Nome, idade, leito e escore da visita ficam só na tela. Não vão para cookie, navegador nem tabela.'),
  ('objetivo-escrita', 'objetivo', 'Só o administrador escreve a fonte', 'Título, ficha, papel e política só mudam com a sessão de administrador.'),
  ('escopo-entra', 'escopo', 'O que este ciclo cobre', 'Tabelas, sessão, ferramenta, trilha, cópia do conteúdo e estes itens de governança.'),
  ('escopo-fora', 'escopo', 'O que este ciclo não cobre', 'FHIR, openEHR, certificado ISO e observabilidade ficam de fora até existir decisão e prova.'),
  ('risco-auth', 'risco', 'Autenticação desligada na pré-visualização', 'A pré-visualização pode abrir sem sessão. Na publicação, a gravação recusa esse estado.'),
  ('risco-primeiro-admin', 'risco', 'A primeira sessão vira administrador', 'Quem entra primeiro recebe o papel admin. A política precisa da sua aprovação consciente.'),
  ('risco-ficha', 'risco', 'A conta ainda nasce no código', 'A ficha só passa a valer no banco depois de Gravar ficha do código. Antes disso, a página usa o catálogo.'),
  ('risco-wcag', 'risco', 'Acessibilidade ainda não medida', 'Teclado, foco, rótulo e contraste da faixa, do menu, do formulário e do resultado ainda não foram medidos.'),
  ('politica-dado', 'politica', 'Política de dado', 'Grava-se conta, papel, conteúdo e recado. Não se grava paciente nem escore. O localStorage guarda só idioma, fonte, contraste, foco, tema e consentimento.'),
  ('politica-acesso', 'politica', 'Política de acesso', 'A escrita exige sessão. O papel admin é conferido no servidor. O id enviado pelo cliente não substitui o id da sessão.'),
  ('politica-seguranca', 'politica', 'Política de segurança da informação', 'Consulta com parâmetro. Publicação com autenticação desligada não grava. A trilha registra quem alterou. A cópia do conteúdo pode ser restaurada.')
on conflict (id) do nothing;

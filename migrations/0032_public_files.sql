-- O que ainda estava só em arquivo. A imagem continua no disco porque o navegador busca o endereço.

create table if not exists media_asset (
  path text primary key,
  kind text not null,
  note text not null
);

create table if not exists crawl_rule (
  position integer primary key,
  directive text not null
);

create table if not exists sitemap_url (
  position integer primary key,
  loc text not null
);

create table if not exists template_family (
  id text primary key,
  position integer not null,
  name text not null,
  text text not null
);

create table if not exists fundamento_pack (
  id text primary key,
  file_name text not null,
  sha256 text not null,
  exact_text boolean not null
);

create table if not exists specimen (
  id text primary key,
  title text not null,
  lead text not null,
  source text not null default ''
);

create table if not exists specimen_module (
  specimen_id text not null references specimen (id),
  position integer not null check (position > 0),
  type text not null,
  title text not null,
  primary key (specimen_id, position)
);

create table if not exists specimen_line (
  specimen_id text not null,
  module_position integer not null,
  position integer not null check (position > 0),
  path text not null,
  text text not null,
  primary key (specimen_id, module_position, position),
  foreign key (specimen_id, module_position) references specimen_module (specimen_id, position)
);

create table if not exists section_page (
  slug text primary key,
  kicker text not null,
  title text not null,
  lead text not null,
  kind text not null
);

create table if not exists section_block (
  slug text not null references section_page (slug),
  position integer not null check (position > 0),
  block_id text not null,
  title text not null,
  body text not null default '',
  primary key (slug, position)
);

create table if not exists section_link (
  slug text not null,
  block_position integer not null,
  position integer not null check (position > 0),
  item_id text not null,
  title text not null,
  text text not null,
  dest_kind text,
  dest_slug text,
  dest_hash text,
  dest_to text,
  dest_model text,
  live boolean not null default false,
  primary key (slug, block_position, position),
  foreign key (slug, block_position) references section_block (slug, position)
);

insert into media_asset (path, kind, note) values ('/artigos/mary-eliza-mahoney.jpg', 'imagem', 'mary-eliza-mahoney.jpg') on conflict (path) do nothing;
insert into media_asset (path, kind, note) values ('/artigos/sepse-na-emergencia.pdf', 'pdf', 'sepse-na-emergencia.pdf') on conflict (path) do nothing;
insert into media_asset (path, kind, note) values ('/artigos/sepse-reavaliacao.svg', 'imagem', 'sepse-reavaliacao.svg') on conflict (path) do nothing;
insert into media_asset (path, kind, note) values ('/artigos/sepse-reconhecimento.svg', 'imagem', 'sepse-reconhecimento.svg') on conflict (path) do nothing;
insert into media_asset (path, kind, note) values ('/brand/calc-icon.webp', 'imagem', 'calc-icon.webp') on conflict (path) do nothing;
insert into media_asset (path, kind, note) values ('/brand/chapeu.webp', 'imagem', 'chapeu.webp') on conflict (path) do nothing;
insert into media_asset (path, kind, note) values ('/brand/enfermeira.webp', 'imagem', 'enfermeira.webp') on conflict (path) do nothing;
insert into media_asset (path, kind, note) values ('/brand/ext-braden.webp', 'imagem', 'ext-braden.webp') on conflict (path) do nothing;
insert into media_asset (path, kind, note) values ('/brand/ext-gasometria.webp', 'imagem', 'ext-gasometria.webp') on conflict (path) do nothing;
insert into media_asset (path, kind, note) values ('/brand/ext-gotejamento.webp', 'imagem', 'ext-gotejamento.webp') on conflict (path) do nothing;
insert into media_asset (path, kind, note) values ('/brand/form-001.webp', 'imagem', 'form-001.webp') on conflict (path) do nothing;
insert into media_asset (path, kind, note) values ('/brand/livro.webp', 'imagem', 'livro.webp') on conflict (path) do nothing;
insert into media_asset (path, kind, note) values ('/brand/logo.webp', 'imagem', 'logo.webp') on conflict (path) do nothing;
insert into media_asset (path, kind, note) values ('/favicon.svg', 'imagem', 'favicon.svg') on conflict (path) do nothing;
insert into media_asset (path, kind, note) values ('/institucional/selo-acessibilidade.webp', 'imagem', 'selo-acessibilidade.webp') on conflict (path) do nothing;
insert into media_asset (path, kind, note) values ('/institucional/selo-lgpd.webp', 'imagem', 'selo-lgpd.webp') on conflict (path) do nothing;
insert into media_asset (path, kind, note) values ('/institucional/selo-sustentabilidade.webp', 'imagem', 'selo-sustentabilidade.webp') on conflict (path) do nothing;
insert into media_asset (path, kind, note) values ('/og.jpg', 'imagem', 'og.jpg') on conflict (path) do nothing;
insert into media_asset (path, kind, note) values ('/robots.txt', 'texto', 'robots.txt') on conflict (path) do nothing;
insert into media_asset (path, kind, note) values ('/sitemap.xml', 'mapa', 'sitemap.xml') on conflict (path) do nothing;
insert into crawl_rule (position, directive) values (1, 'User-agent: *') on conflict (position) do nothing;
insert into crawl_rule (position, directive) values (2, 'Allow: /') on conflict (position) do nothing;
insert into crawl_rule (position, directive) values (3, 'Disallow: /sistema') on conflict (position) do nothing;
insert into crawl_rule (position, directive) values (4, 'Disallow: /pacote') on conflict (position) do nothing;
insert into crawl_rule (position, directive) values (5, 'Sitemap: https://calculadorasdeenfermagem.com.br/sitemap.xml') on conflict (position) do nothing;
insert into sitemap_url (position, loc) values (1, 'https://calculadorasdeenfermagem.com.br/') on conflict (position) do nothing;
insert into sitemap_url (position, loc) values (2, 'https://calculadorasdeenfermagem.com.br/secao/concurso') on conflict (position) do nothing;
insert into sitemap_url (position, loc) values (3, 'https://calculadorasdeenfermagem.com.br/secao/sobre') on conflict (position) do nothing;
insert into sitemap_url (position, loc) values (4, 'https://calculadorasdeenfermagem.com.br/secao/calculadoras') on conflict (position) do nothing;
insert into sitemap_url (position, loc) values (5, 'https://calculadorasdeenfermagem.com.br/secao/escalas') on conflict (position) do nothing;
insert into sitemap_url (position, loc) values (6, 'https://calculadorasdeenfermagem.com.br/secao/conteudos') on conflict (position) do nothing;
insert into sitemap_url (position, loc) values (7, 'https://calculadorasdeenfermagem.com.br/secao/emprego') on conflict (position) do nothing;
insert into sitemap_url (position, loc) values (8, 'https://calculadorasdeenfermagem.com.br/secao/simulados') on conflict (position) do nothing;
insert into sitemap_url (position, loc) values (9, 'https://calculadorasdeenfermagem.com.br/secao/biblioteca') on conflict (position) do nothing;
insert into sitemap_url (position, loc) values (10, 'https://calculadorasdeenfermagem.com.br/secao/contato') on conflict (position) do nothing;
insert into sitemap_url (position, loc) values (11, 'https://calculadorasdeenfermagem.com.br/secao/entrar') on conflict (position) do nothing;
insert into sitemap_url (position, loc) values (12, 'https://calculadorasdeenfermagem.com.br/secao/assinatura') on conflict (position) do nothing;
insert into sitemap_url (position, loc) values (13, 'https://calculadorasdeenfermagem.com.br/secao/politicas') on conflict (position) do nothing;
insert into sitemap_url (position, loc) values (14, 'https://calculadorasdeenfermagem.com.br/secao/termos') on conflict (position) do nothing;
insert into sitemap_url (position, loc) values (15, 'https://calculadorasdeenfermagem.com.br/secao/acessibilidade') on conflict (position) do nothing;
insert into sitemap_url (position, loc) values (16, 'https://calculadorasdeenfermagem.com.br/secao/compromisso') on conflict (position) do nothing;
insert into sitemap_url (position, loc) values (17, 'https://calculadorasdeenfermagem.com.br/secao/mapa') on conflict (position) do nothing;
insert into sitemap_url (position, loc) values (18, 'https://calculadorasdeenfermagem.com.br/secao/glossario') on conflict (position) do nothing;
insert into sitemap_url (position, loc) values (19, 'https://calculadorasdeenfermagem.com.br/secao/nanda') on conflict (position) do nothing;
insert into sitemap_url (position, loc) values (20, 'https://calculadorasdeenfermagem.com.br/ferramentas/braden') on conflict (position) do nothing;
insert into sitemap_url (position, loc) values (21, 'https://calculadorasdeenfermagem.com.br/ferramentas/morse') on conflict (position) do nothing;
insert into sitemap_url (position, loc) values (22, 'https://calculadorasdeenfermagem.com.br/ferramentas/apgar') on conflict (position) do nothing;
insert into sitemap_url (position, loc) values (23, 'https://calculadorasdeenfermagem.com.br/ferramentas/gotejamento') on conflict (position) do nothing;
insert into sitemap_url (position, loc) values (24, 'https://calculadorasdeenfermagem.com.br/ferramentas/imc') on conflict (position) do nothing;
insert into template_family (id, position, name, text) values ('guia', 1, 'Guia', 'Página longa do site homologado: hero, barra de ações, artigo e índice lateral.') on conflict (id) do nothing;
insert into template_family (id, position, name, text) values ('biblioteca', 2, 'Biblioteca', 'Página institucional em módulos, mais as prateleiras de anatomia, seringas, imagem, thumbnail, PDF, slide e infográfico.') on conflict (id) do nothing;
insert into template_family (id, position, name, text) values ('norma', 3, 'Norma', 'Leitura contínua, com índice do texto e uma barra de utilidade.') on conflict (id) do nothing;
insert into template_family (id, position, name, text) values ('editorial', 4, 'Peças editoriais', 'Vinte e uma peças do hub canônico: post, carrossel, protocolo, checklist, documento e ficha.') on conflict (id) do nothing;
insert into template_family (id, position, name, text) values ('formulario', 5, 'Formulário', 'Checklist preenchível. O que for digitado fica só nesta tela.') on conflict (id) do nothing;
insert into template_family (id, position, name, text) values ('laudo', 6, 'Laudo', 'Folha de resultado da escala, visível na tela e na impressão.') on conflict (id) do nothing;
insert into template_family (id, position, name, text) values ('institucional', 7, 'Institucional', 'Página longa no mesmo frame do artigo: trilha, seções e relacionados.') on conflict (id) do nothing;
insert into template_family (id, position, name, text) values ('slides', 8, 'Slides', 'Dez lâminas 16:9 no token do site: capa, sumário, seção, cartões, números, tabela, aviso e fecho.') on conflict (id) do nothing;
insert into template_family (id, position, name, text) values ('ferramenta', 9, 'Ferramenta', 'Escala e calculadora publicadas. A folha A4 acompanha a ferramenta.') on conflict (id) do nothing;
insert into fundamento_pack (id, file_name, sha256, exact_text) values ('pacote', 'CKO_WORKSPACE_FULL_ATOMICO_20261023.zip', '61f3bc0ae65267c118eba94eb44f380177462e47e25d0eaef9b1a4244a612d91', false) on conflict (id) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('en', 'menu', 'concurso', 'Santos exam') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('es', 'menu', 'concurso', 'Concurso Santos') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('fr', 'menu', 'concurso', 'Concours Santos') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('en', 'menu', 'guia-santos', 'Full study guide for the Santos 74/2026 exam (Nurse)') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('es', 'menu', 'guia-santos', 'Guía completa para el concurso Santos 74/2026 (Enfermero)') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('fr', 'menu', 'guia-santos', 'Guide complet du concours Santos 74/2026 (Infirmier)') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('en', 'menu', 'inicio', 'Home') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('es', 'menu', 'inicio', 'Inicio') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('fr', 'menu', 'inicio', 'Accueil') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('en', 'menu', 'sobre', 'About') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('es', 'menu', 'sobre', 'Sobre nosotros') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('fr', 'menu', 'sobre', 'À propos') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('en', 'menu', 'missao', 'Mission, vision and values') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('es', 'menu', 'missao', 'Misión, visión y valores') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('fr', 'menu', 'missao', 'Mission, vision et valeurs') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('en', 'menu', 'objetivo', 'Purpose of the site') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('es', 'menu', 'objetivo', 'Objetivo del sitio') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('fr', 'menu', 'objetivo', 'Objectif du site') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('en', 'menu', 'mapa', 'Site map') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('es', 'menu', 'mapa', 'Mapa del sitio') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('fr', 'menu', 'mapa', 'Plan du site') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('en', 'menu', 'cookies', 'Cookie policy') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('es', 'menu', 'cookies', 'Política de cookies') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('fr', 'menu', 'cookies', 'Politique de cookies') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('en', 'menu', 'retencao', 'Data retention policy') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('es', 'menu', 'retencao', 'Política de retención') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('fr', 'menu', 'retencao', 'Politique de conservation') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('en', 'menu', 'lgpd', 'Data protection') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('es', 'menu', 'lgpd', 'Protección de datos') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('fr', 'menu', 'lgpd', 'Protection des données') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('en', 'menu', 'privacidade', 'Privacy policy') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('es', 'menu', 'privacidade', 'Política de privacidad') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('fr', 'menu', 'privacidade', 'Politique de confidentialité') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('en', 'menu', 'acessibilidade', 'Accessibility policy') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('es', 'menu', 'acessibilidade', 'Política de accesibilidad') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('fr', 'menu', 'acessibilidade', 'Politique d''accessibilité') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('en', 'menu', 'impacto', 'Impact report') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('es', 'menu', 'impacto', 'Informe de impacto') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('fr', 'menu', 'impacto', 'Rapport d''impact') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('en', 'menu', 'verde', 'Green technology') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('es', 'menu', 'verde', 'Tecnología verde') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('fr', 'menu', 'verde', 'Technologie verte') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('en', 'menu', 'politicas', 'Site policies') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('es', 'menu', 'politicas', 'Políticas del sitio') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('fr', 'menu', 'politicas', 'Politiques du site') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('en', 'menu', 'termos', 'Terms of use') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('es', 'menu', 'termos', 'Términos y condiciones') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('fr', 'menu', 'termos', 'Conditions d''utilisation') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('en', 'menu', 'compromisso', 'Digital sustainability') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('es', 'menu', 'compromisso', 'Sostenibilidad digital') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('fr', 'menu', 'compromisso', 'Durabilité numérique') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('en', 'menu', 'calculadoras', 'Calculators') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('es', 'menu', 'calculadoras', 'Calculadoras') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('fr', 'menu', 'calculadoras', 'Calculatrices') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('en', 'menu', 'No ar', 'Live') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('es', 'menu', 'No ar', 'En línea') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('fr', 'menu', 'No ar', 'En ligne') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('en', 'menu', 'Catálogo', 'Catalog') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('es', 'menu', 'Catálogo', 'Catálogo') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('fr', 'menu', 'Catálogo', 'Catalogue') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('en', 'menu', 'todas-calc', 'See all calculators') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('es', 'menu', 'todas-calc', 'Ver todas las calculadoras') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('fr', 'menu', 'todas-calc', 'Voir toutes les calculatrices') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('en', 'menu', 'Escalas', 'Scales') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('es', 'menu', 'Escalas', 'Escalas') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('fr', 'menu', 'Escalas', 'Échelles') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('en', 'menu', 'todas-escalas', 'See all scales') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('es', 'menu', 'todas-escalas', 'Ver todas las escalas') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('fr', 'menu', 'todas-escalas', 'Voir toutes les échelles') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('en', 'menu', 'conteudos', 'Contents') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('es', 'menu', 'conteudos', 'Contenidos') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('fr', 'menu', 'conteudos', 'Contenus') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('en', 'menu', 'nsp', 'Patient safety unit') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('es', 'menu', 'nsp', 'Núcleo de seguridad del paciente') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('fr', 'menu', 'nsp', 'Unité de sécurité des patients') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('en', 'menu', 'sus', 'Public health') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('es', 'menu', 'sus', 'Salud pública') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('fr', 'menu', 'sus', 'Santé publique') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('en', 'menu', 'leis', 'Nursing legislation') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('es', 'menu', 'leis', 'Legislación de enfermería') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('fr', 'menu', 'leis', 'Législation infirmière') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('en', 'menu', 'literatura', 'Literature, NANDA, NIC and NOC') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('es', 'menu', 'literatura', 'Literatura, NANDA, NIC y NOC') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('fr', 'menu', 'literatura', 'Littérature, NANDA, NIC et NOC') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('en', 'menu', 'urgencia', 'Emergency care') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('es', 'menu', 'urgencia', 'Urgencia y emergencia') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('fr', 'menu', 'urgencia', 'Urgences') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('en', 'menu', 'centro', 'Operating room, clinic and work') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('es', 'menu', 'centro', 'Bloque, clínica y trabajo') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('fr', 'menu', 'centro', 'Bloc, clinique et travail') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('en', 'menu', 'materno', 'Obstetrics and neonatology') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('es', 'menu', 'materno', 'Obstetricia y neonatología') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('fr', 'menu', 'materno', 'Obstétrique et néonatologie') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('en', 'menu', 'emprego', 'Job sites') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('es', 'menu', 'emprego', 'Empleo') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('fr', 'menu', 'emprego', 'Emploi') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('en', 'menu', 'simulados', 'Quizzes') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('es', 'menu', 'simulados', 'Simulacros') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('fr', 'menu', 'simulados', 'QCM') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('en', 'menu', 'biblioteca', 'Nursing library') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('es', 'menu', 'biblioteca', 'Biblioteca') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('fr', 'menu', 'biblioteca', 'Bibliothèque') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('en', 'menu', 'formularios', 'Scale forms') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('es', 'menu', 'formularios', 'Formularios de escalas') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('fr', 'menu', 'formularios', 'Formulaires d''échelles') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('en', 'menu', 'acervo', 'Collection') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('es', 'menu', 'acervo', 'Acervo') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('fr', 'menu', 'acervo', 'Fonds') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('en', 'menu', 'blog', 'Nursing blog') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('es', 'menu', 'blog', 'Blog de enfermería') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('fr', 'menu', 'blog', 'Blog infirmier') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('en', 'menu', 'provas', 'Exam papers') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('es', 'menu', 'provas', 'Pruebas de concurso') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('fr', 'menu', 'provas', 'Sujets de concours') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('en', 'menu', 'contato', 'Contact') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('es', 'menu', 'contato', 'Contacto') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('fr', 'menu', 'contato', 'Contact') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('en', 'menu', 'entrar', 'Sign in') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('es', 'menu', 'entrar', 'Entrar') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('fr', 'menu', 'entrar', 'Connexion') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('en', 'menu', 'area', 'Your area') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('es', 'menu', 'area', 'Tu área') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('fr', 'menu', 'area', 'Votre espace') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('en', 'menu', 'admin', 'Administrator') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('es', 'menu', 'admin', 'Administrador') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('fr', 'menu', 'admin', 'Administrateur') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('en', 'menu', 'assinante', 'Subscriber') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('es', 'menu', 'assinante', 'Suscriptor') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('fr', 'menu', 'assinante', 'Abonné') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('en', 'menu', 'assinatura', 'Subscribe') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('es', 'menu', 'assinatura', 'Suscribirse') on conflict (locale, group_id, key) do nothing;
insert into chrome_label (locale, group_id, key, text) values ('fr', 'menu', 'assinatura', 'S''abonner') on conflict (locale, group_id, key) do nothing;
insert into specimen (id, title, lead, source) values ('biblioteca', 'Sinais vitais', 'Biblioteca de Enfermagem com informações sobre temperatura, pulso, frequência respiratória, pressão arterial, saturação de oxigênio, dor e frequência de monitorização.', '') on conflict (id) do nothing;
insert into specimen_module (specimen_id, position, type, title) values ('biblioteca', 1, 'card_grid', 'Parâmetros essenciais') on conflict (specimen_id, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 1, 1, 'items.1.id', 'temperatura') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 1, 2, 'items.1.title', 'Temperatura') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 1, 3, 'items.1.subtitle', '') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 1, 4, 'items.1.description', 'Avaliação do equilíbrio térmico do organismo.') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 1, 5, 'items.1.attributes.unit', '°C') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 1, 6, 'items.2.id', 'pulso-frequencia-cardiaca') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 1, 7, 'items.2.title', 'Pulso (Frequência Cardíaca)') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 1, 8, 'items.2.subtitle', '') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 1, 9, 'items.2.description', 'Número de batimentos cardíacos por minuto.') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 1, 10, 'items.2.attributes.unit', 'bpm') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 1, 11, 'items.3.id', 'frequencia-respiratoria') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 1, 12, 'items.3.title', 'Frequência Respiratória') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 1, 13, 'items.3.subtitle', '') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 1, 14, 'items.3.description', 'Número de incursões respiratórias por minuto.') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 1, 15, 'items.3.attributes.unit', 'irpm') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 1, 16, 'items.4.id', 'pressao-arterial') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 1, 17, 'items.4.title', 'Pressão Arterial') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 1, 18, 'items.4.subtitle', '') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 1, 19, 'items.4.description', 'Força do sangue contra as paredes das artérias.') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 1, 20, 'items.4.attributes.unit', 'mmHg') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_module (specimen_id, position, type, title) values ('biblioteca', 2, 'table', 'Valores de referência (adultos)') on conflict (specimen_id, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 2, 1, 'columns.1.key', 'parameter') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 2, 2, 'columns.1.label', 'Parameter') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 2, 3, 'columns.2.key', 'reference') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 2, 4, 'columns.2.label', 'Reference') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 2, 5, 'rows.1.parameter', 'Temperatura') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 2, 6, 'rows.1.reference', '36,0 – 37,5 °C') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 2, 7, 'rows.2.parameter', 'Pulso (FC)') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 2, 8, 'rows.2.reference', '60 – 100 bpm') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 2, 9, 'rows.3.parameter', 'Frequência Respiratória') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 2, 10, 'rows.3.reference', '12 – 20 irpm') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 2, 11, 'rows.4.parameter', 'Pressão Arterial') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 2, 12, 'rows.4.reference', '90/60 – 120/80 mmHg') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_module (specimen_id, position, type, title) values ('biblioteca', 3, 'step_flow', 'Condutas de enfermagem') on conflict (specimen_id, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 3, 1, 'items.1.id', 'avaliar') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 3, 2, 'items.1.title', 'Avaliar') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 3, 3, 'items.1.subtitle', '') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 3, 4, 'items.1.description', 'Realizar aferição completa dos sinais vitais na ordem padronizada.') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 3, 5, 'items.1.sequence', '1') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 3, 6, 'items.2.id', 'verificar') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 3, 7, 'items.2.title', 'Verificar') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 3, 8, 'items.2.subtitle', '') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 3, 9, 'items.2.description', 'Confirmar identificação do paciente e condições para aferição adequada.') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 3, 10, 'items.2.sequence', '2') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 3, 11, 'items.3.id', 'registrar') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 3, 12, 'items.3.title', 'Registrar') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 3, 13, 'items.3.subtitle', '') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 3, 14, 'items.3.description', 'Anotar valores, horário, local, técnica utilizada e observações.') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 3, 15, 'items.3.sequence', '3') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 3, 16, 'items.4.id', 'interpretar') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 3, 17, 'items.4.title', 'Interpretar') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 3, 18, 'items.4.subtitle', '') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 3, 19, 'items.4.description', 'Comparar com valores de referência e contexto clínico do paciente.') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 3, 20, 'items.4.sequence', '4') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_module (specimen_id, position, type, title) values ('biblioteca', 4, 'list_panel', 'Pistas de triagem e risco') on conflict (specimen_id, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 4, 1, 'items.1.id', 'verde-baixo-risco') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 4, 2, 'items.1.title', 'Verde – Baixo risco') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 4, 3, 'items.1.subtitle', '') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 4, 4, 'items.1.description', 'Parâmetros dentro da normalidade.') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 4, 5, 'items.2.id', 'amarelo-risco-moderado') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 4, 6, 'items.2.title', 'Amarelo – Risco moderado') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 4, 7, 'items.2.subtitle', '') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 4, 8, 'items.2.description', 'Alterações leves, sem instabilidade hemodinâmica.') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 4, 9, 'items.3.id', 'vermelho-alto-risco') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 4, 10, 'items.3.title', 'Vermelho – Alto risco') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 4, 11, 'items.3.subtitle', '') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 4, 12, 'items.3.description', 'Alterações significativas ou instabilidade clínica.') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_module (specimen_id, position, type, title) values ('biblioteca', 5, 'card_grid', 'Alterações mais comuns') on conflict (specimen_id, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 5, 1, 'items.1.id', 'febre') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 5, 2, 'items.1.title', 'Febre') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 5, 3, 'items.1.subtitle', '') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 5, 4, 'items.1.description', 'Temperatura > 37,5 °C.') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 5, 5, 'items.2.id', 'taquicardia-bradicardia') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 5, 6, 'items.2.title', 'Taquicardia / Bradicardia') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 5, 7, 'items.2.subtitle', '') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 5, 8, 'items.2.description', 'FC alterada conforme limite de referência.') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 5, 9, 'items.3.id', 'taquipneia-bradipneia') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 5, 10, 'items.3.title', 'Taquipneia / Bradipneia') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 5, 11, 'items.3.subtitle', '') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 5, 12, 'items.3.description', 'FR alterada conforme limite de referência.') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 5, 13, 'items.4.id', 'hipertensao-hipotensao') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 5, 14, 'items.4.title', 'Hipertensão / Hipotensão') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 5, 15, 'items.4.subtitle', '') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 5, 16, 'items.4.description', 'PA fora dos valores de referência.') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_module (specimen_id, position, type, title) values ('biblioteca', 6, 'status_panel', 'Sinais e sintomas associados') on conflict (specimen_id, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 6, 1, 'groups.1.tone', 'neutral') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 6, 2, 'groups.1.title', 'Items') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 6, 3, 'groups.1.items.1', 'Palidez, cianose, sudorese fria') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 6, 4, 'groups.1.items.2', 'Dispneia, falta de ar, tiragem') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 6, 5, 'groups.1.items.3', 'Confusão mental, sonolência') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 6, 6, 'groups.1.items.4', 'Tontura, fraqueza, síncope') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_module (specimen_id, position, type, title) values ('biblioteca', 7, 'media_grid', 'Vídeos e técnicas') on conflict (specimen_id, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 7, 1, 'items.1.id', 'afericao-da-pa-com-esfigmomanometro') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 7, 2, 'items.1.title', 'Aferição da PA com esfigmomanômetro') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 7, 3, 'items.1.subtitle', '02:45') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 7, 4, 'items.1.description', '') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 7, 5, 'items.2.id', 'afericao-da-temperatura-axilar-e-timpanica') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 7, 6, 'items.2.title', 'Aferição da temperatura (axilar e timpânica)') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 7, 7, 'items.2.subtitle', '03:10') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 7, 8, 'items.2.description', '') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 7, 9, 'items.3.id', 'contagem-da-frequencia-respiratoria') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 7, 10, 'items.3.title', 'Contagem da frequência respiratória') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 7, 11, 'items.3.subtitle', '01:50') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 7, 12, 'items.3.description', '') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 7, 13, 'items.4.id', 'uso-do-oximetro-de-pulso-spo') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 7, 14, 'items.4.title', 'Uso do oxímetro de pulso (SpO₂)') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 7, 15, 'items.4.subtitle', '01:35') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 7, 16, 'items.4.description', '') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_module (specimen_id, position, type, title) values ('biblioteca', 8, 'reference_list', 'Artigos e evidências') on conflict (specimen_id, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 8, 1, 'items.1.id', 'diretrizes-brasileiras-de-monitorizacao-de-sinais-vitais') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 8, 2, 'items.1.title', 'Diretrizes brasileiras de monitorização de sinais vitais') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 8, 3, 'items.1.subtitle', 'COFEN/COREN, 2023') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 8, 4, 'items.1.description', '') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 8, 5, 'items.2.id', 'monitorizacao-de-sinais-vitais-em-pacientes-criticos') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 8, 6, 'items.2.title', 'Monitorização de sinais vitais em pacientes críticos') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 8, 7, 'items.2.subtitle', 'Revista Brasileira de Enfermagem, 2023') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 8, 8, 'items.2.description', '') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 8, 9, 'items.3.id', 'precisao-e-confiabilidade-de-equipamentos') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 8, 10, 'items.3.title', 'Precisão e confiabilidade de equipamentos') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 8, 11, 'items.3.subtitle', 'Rev. Latino-Am. Enfermagem, 2022') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 8, 12, 'items.3.description', '') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_module (specimen_id, position, type, title) values ('biblioteca', 9, 'status_panel', 'Atenção clínica') on conflict (specimen_id, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 9, 1, 'groups.1.tone', 'positive') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 9, 2, 'groups.1.title', 'Cuidados prioritários') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 9, 3, 'groups.1.items.1', 'Avaliar todos os sinais vitais de forma sistemática') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 9, 4, 'groups.1.items.2', 'Utilizar técnica correta e equipamentos calibrados') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 9, 5, 'groups.1.items.3', 'Registrar valores e horário da aferição') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 9, 6, 'groups.1.items.4', 'Identificar e comunicar alterações precocemente') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 9, 7, 'groups.2.tone', 'danger') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 9, 8, 'groups.2.title', 'Avoid Or Monitor') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 9, 9, 'groups.2.items.1', 'Aferições incompletas ou fora da frequência') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 9, 10, 'groups.2.items.2', 'Equipamentos descalibrados ou inadequados') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 9, 11, 'groups.2.items.3', 'Registro incompleto ou ilegível') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 9, 12, 'groups.2.items.4', 'Interpretação isolada dos parâmetros') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_module (specimen_id, position, type, title) values ('biblioteca', 10, 'status_panel', 'Sinais de alerta') on conflict (specimen_id, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 10, 1, 'groups.1.tone', 'neutral') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 10, 2, 'groups.1.title', 'Items') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 10, 3, 'groups.1.items.1', 'Temperatura < 35 °C ou > 38,5 °C') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 10, 4, 'groups.1.items.2', 'FC < 50 bpm ou > 120 bpm') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 10, 5, 'groups.1.items.3', 'FR < 8 irpm ou > 24 irpm') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 10, 6, 'groups.1.items.4', 'PA sistólica < 90 mmHg ou > 180 mmHg') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_module (specimen_id, position, type, title) values ('biblioteca', 11, 'table', 'Frequência de monitorização') on conflict (specimen_id, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 11, 1, 'columns.1.key', 'clinical_state') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 11, 2, 'columns.1.label', 'Clinical State') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 11, 3, 'columns.2.key', 'frequency') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 11, 4, 'columns.2.label', 'Frequency') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 11, 5, 'rows.1.clinical_state', 'Estável / Baixo risco') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 11, 6, 'rows.1.frequency', 'A cada 8 a 12 horas') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 11, 7, 'rows.2.clinical_state', 'Moderado') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 11, 8, 'rows.2.frequency', 'A cada 4 a 6 horas') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 11, 9, 'rows.3.clinical_state', 'Instável / Alto risco') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 11, 10, 'rows.3.frequency', 'A cada 15 a 60 minutos ou contínuo') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_module (specimen_id, position, type, title) values ('biblioteca', 12, 'resource_list', 'Materiais de apoio') on conflict (specimen_id, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 12, 1, 'items.1.id', 'fluxograma-de-sinais-vitais') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 12, 2, 'items.1.title', 'Fluxograma de sinais vitais') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 12, 3, 'items.1.subtitle', '') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 12, 4, 'items.1.description', '') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 12, 5, 'items.1.attributes.format', 'PDF') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 12, 6, 'items.2.id', 'tabela-de-valores-de-referencia') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 12, 7, 'items.2.title', 'Tabela de valores de referência') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 12, 8, 'items.2.subtitle', '') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 12, 9, 'items.2.description', '') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 12, 10, 'items.2.attributes.format', 'PDF') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 12, 11, 'items.3.id', 'checklist-de-monitorizacao') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 12, 12, 'items.3.title', 'Checklist de monitorização') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 12, 13, 'items.3.subtitle', '') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 12, 14, 'items.3.description', '') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 12, 15, 'items.3.attributes.format', 'PDF') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 12, 16, 'items.4.id', 'registro-de-sinais-vitais') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 12, 17, 'items.4.title', 'Registro de sinais vitais') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 12, 18, 'items.4.subtitle', '') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 12, 19, 'items.4.description', '') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('biblioteca', 12, 20, 'items.4.attributes.format', 'PDF') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen (id, title, lead, source) values ('norma', 'Lei nº 7.498, de 25 de junho de 1986', 'Dispõe sobre a regulamentação do exercício da Enfermagem e dá outras providências.', 'Texto transcrito do piloto normativo, fonte Planaltão consolidado.') on conflict (id) do nothing;
insert into specimen_module (specimen_id, position, type, title) values ('norma', 1, 'artigos', 'Lei nº 7.498, de 25 de junho de 1986') on conflict (specimen_id, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('norma', 1, 1, 'art_1', 'Art. 1º É livre o exercício da enfermagem em todo o território nacional, observadas as disposições desta lei.') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('norma', 1, 2, 'art_2', 'Art. 2º A enfermagem e suas atividades auxiliares somente podem ser exercidas por pessoas legalmente habilitadas e inscritas no Conselho Regional de Enfermagem com jurisdição na área onde ocorre o exercício.') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('norma', 1, 3, 'art_3', 'Art. 3º O planejamento e a programação das instituições e serviços de saúde incluem planejamento e programação de enfermagem.') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('norma', 1, 4, 'art_4', 'Art. 4º A programação de enfermagem inclui a prescrição da assistência de enfermagem.') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('norma', 1, 5, 'art_5', 'Art. 5º (VETADO).') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('norma', 1, 6, 'art_6', 'Art. 6º São enfermeiros:') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('norma', 1, 7, 'art_7', 'Art. 7º São Técnicos de Enfermagem:') on conflict (specimen_id, module_position, position) do nothing;
insert into specimen_line (specimen_id, module_position, position, path, text) values ('norma', 1, 8, 'art_8', 'Art. 8º São Auxiliares de Enfermagem:') on conflict (specimen_id, module_position, position) do nothing;
insert into section_page (slug, kicker, title, lead, kind) values ('concurso', 'Guia de estudos', 'Concurso Público de Santos 74/2026', 'Entrada do guia de estudos para enfermeiro, no mesmo lugar do menu homologado. O material completo do edital não é copiado para este preview.', 'pages') on conflict (slug) do nothing;
insert into section_block (slug, position, block_id, title, body) values ('concurso', 1, 'guia', 'O que este atalho abre', 'No site homologado, o botão verde leva ao guia do concurso. Aqui o fluxo para no mesmo tema, sem reproduzir o caderno de questões.') on conflict (slug, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('concurso', 1, 1, 'simulados', 'Simulados do menu', 'Treino de bancas fica na seção de simulados.', 'section', 'simulados', null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('concurso', 1, 2, 'biblioteca', 'Biblioteca de provas', 'O acervo de provas aparece na biblioteca.', 'section', 'biblioteca', 'provas', null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_page (slug, kicker, title, lead, kind) values ('sobre', 'Institucional', 'Sobre nós', 'Missão, objetivo e equipe. Cada um abre a própria página.', 'pages') on conflict (slug) do nothing;
insert into section_page (slug, kicker, title, lead, kind) values ('calculadoras', 'Calculadoras', 'Calculadoras de enfermagem', 'O mesmo grupo do menu. Disponível abre o template clínico. Catalogado mostra o instrumento no lugar certo, sem fingir um cálculo.', 'pages') on conflict (slug) do nothing;
insert into section_block (slug, position, block_id, title, body) values ('calculadoras', 1, 'lista', 'Cálculos', '') on conflict (slug, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('calculadoras', 1, 1, 'calcule-o-balanco-hidrico', 'Calcule o Balanço Hídrico', 'Controle preciso de líquidos.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('calculadoras', 1, 2, 'dimensionamento-unidade-de-internacao', 'Dimensionamento (Unidade de Internação)', 'Unidade de Internação.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('calculadoras', 1, 3, 'dimensionamento-todos-os-setores', 'Dimensionamento (Todos os Setores)', 'UTI, CC, PS, Ambulatório, Hemodiálise, CAPS e mais.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('calculadoras', 1, 4, 'exames-laboratoriais', 'Exames Laboratoriais', 'Calcule os resultados de exames laboratoriais.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('calculadoras', 1, 5, 'gasometria-arterial', 'Gasometria Arterial', 'Interpretação de gasometria arterial.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('calculadoras', 1, 6, 'calculadora-de-gotejamento', 'Calculadora de Gotejamento', 'Calcule a velocidade de infusão.', 'tool', 'gotejamento', null, null, null, true) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('calculadoras', 1, 7, 'idade-gestacional-e-dpp', 'Idade Gestacional e DPP', 'Idade gestacional e data provável do parto.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('calculadoras', 1, 8, 'calculo-de-imc', 'Cálculo de IMC', 'Índice de massa corporal.', 'tool', 'imc', null, null, null, true) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('calculadoras', 1, 9, 'calculo-de-insulina', 'Cálculo de Insulina', 'Cálculo de doses de insulina.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('calculadoras', 1, 10, 'calculo-de-medicamentos', 'Cálculo de Medicamentos', 'Doses e diluições de fármacos.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('calculadoras', 1, 11, 'vacinas-da-crianca', 'Vacinas da Criança', 'Tabela de vacinas.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('calculadoras', 1, 12, 'notificacao-compulsoria', 'Notificação Compulsória', 'Doenças e agravos de notificação.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('calculadoras', 1, 13, 'pressao-arterial-media', 'Pressão Arterial Média', 'PAM a partir da pressão sistólica e diastólica.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('calculadoras', 1, 14, 'superficie-corporal', 'Superfície Corporal', 'Estimativa para doses pediátricas.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('calculadoras', 1, 15, 'parkland', 'Parkland', 'Reposição hídrica em queimaduras.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('calculadoras', 1, 16, 'debito-cardiaco', 'Débito Cardíaco', 'Parâmetros hemodinâmicos básicos.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_page (slug, kicker, title, lead, kind) values ('escalas', 'Escalas', 'Escalas para avaliação', 'Escalas do menu e da home, mais as especialidades do hero. Apgar, Braden e Morse abrem o template.', 'pages') on conflict (slug) do nothing;
insert into section_block (slug, position, block_id, title, body) values ('escalas', 1, 'lista', 'Instrumentos', '') on conflict (slug, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('escalas', 1, 1, 'aldrete-e-kroulik', 'Aldrete e Kroulik', 'Avaliação do paciente em SRPA.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('escalas', 1, 2, 'apache-ii', 'APACHE II', 'Gravidade do paciente em estado grave.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('escalas', 1, 3, 'apgar', 'Apgar', 'Avaliação de recém-nascidos.', 'tool', 'apgar', null, null, null, true) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('escalas', 1, 4, 'asa', 'ASA', 'Estado físico pré-operatório.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('escalas', 1, 5, 'ballard', 'Ballard', 'Maturidade do recém-nascido.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('escalas', 1, 6, 'barthel', 'Barthel', 'Grau de dependência funcional.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('escalas', 1, 7, 'braden', 'Braden', 'Risco de lesão por pressão.', 'tool', 'braden', null, null, null, true) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('escalas', 1, 8, 'bishop', 'Bishop', 'Maturidade do colo uterino.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('escalas', 1, 9, 'fugulin', 'Fugulin', 'Complexidade assistencial.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('escalas', 1, 10, 'glasgow', 'Glasgow', 'Nível de consciência.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('escalas', 1, 11, 'morse', 'Morse', 'Risco de quedas.', 'tool', 'morse', null, null, null, true) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('escalas', 1, 12, 'news', 'NEWS', 'Alerta precoce de deterioração.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('escalas', 1, 13, 'norton', 'Norton', 'Risco de lesão por pressão.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('escalas', 1, 14, 'ramsay', 'Ramsay', 'Nível de sedação.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_block (slug, position, block_id, title, body) values ('escalas', 2, 'especialidades', 'Por especialidade', 'Os chips da home chegam aqui.') on conflict (slug, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('escalas', 2, 1, 'centro-cirurgico', 'Centro Cirúrgico', 'Grupo de escalas desta especialidade no site homologado.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('escalas', 2, 2, 'dor', 'Dor', 'Grupo de escalas desta especialidade no site homologado.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('escalas', 2, 3, 'funcionalidade', 'Funcionalidade', 'Grupo de escalas desta especialidade no site homologado.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('escalas', 2, 4, 'geriatria', 'Geriatria', 'Grupo de escalas desta especialidade no site homologado.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('escalas', 2, 5, 'gestao', 'Gestão', 'Grupo de escalas desta especialidade no site homologado.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('escalas', 2, 6, 'lesao-por-pressao', 'Lesão por Pressão', 'Grupo de escalas desta especialidade no site homologado.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('escalas', 2, 7, 'neonatologia', 'Neonatologia', 'Grupo de escalas desta especialidade no site homologado.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('escalas', 2, 8, 'neurologia', 'Neurologia', 'Grupo de escalas desta especialidade no site homologado.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('escalas', 2, 9, 'obstetricia', 'Obstetrícia', 'Grupo de escalas desta especialidade no site homologado.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('escalas', 2, 10, 'pneumologia', 'Pneumologia', 'Grupo de escalas desta especialidade no site homologado.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('escalas', 2, 11, 'seguranca-do-paciente', 'Segurança do Paciente', 'Grupo de escalas desta especialidade no site homologado.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('escalas', 2, 12, 'terapia-intensiva', 'Terapia Intensiva', 'Grupo de escalas desta especialidade no site homologado.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('escalas', 2, 13, 'urgencia-emergencia', 'Urgência/Emergência', 'Grupo de escalas desta especialidade no site homologado.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_page (slug, kicker, title, lead, kind) values ('conteudos', 'Conteúdos', 'Conteúdos de enfermagem', 'Os grupos do menu Conteúdos. O texto de cada guia longo continua no site homologado on conflict do nothing; aqui a navegação chega no grupo certo.', 'pages') on conflict (slug) do nothing;
insert into section_block (slug, position, block_id, title, body) values ('conteudos', 1, 'nsp', 'Núcleo de Segurança do Paciente', 'Checagem de medicação, medicamentos de alta vigilância e metas internacionais.') on conflict (slug, position) do nothing;
insert into section_block (slug, position, block_id, title, body) values ('conteudos', 2, 'sus', 'Saúde pública', 'Notificação compulsória, SINAN, princípios do SUS, PNAB, participação da comunidade e HumanizaSUS.') on conflict (slug, position) do nothing;
insert into section_block (slug, position, block_id, title, body) values ('conteudos', 3, 'leis', 'Legislações', 'Código de ética, processo de enfermagem, Lei 5.905/1973, Lei 8.080/90 e dimensionamento COFEN.') on conflict (slug, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('conteudos', 3, 1, 'dimensionamento', 'Dimensionamento no catálogo', 'A calculadora de quadro ainda está catalogada.', 'section', 'calculadoras', 'dimensionamento-unidade-de-internacao', null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_block (slug, position, block_id, title, body) values ('conteudos', 4, 'literatura', 'Literatura', 'NANDA, NIC e NOC, teorias e glossário. A NANDA sugerida nas escalas não fecha diagnóstico.') on conflict (slug, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('conteudos', 4, 1, 'nanda', 'Índice NANDA destas escalas', 'Só as sugestões que o template já mostra. Não fecha diagnóstico.', 'section', 'nanda', null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('conteudos', 4, 2, 'glossario', 'Glossário curto', 'Termos dos instrumentos que estão no ar.', 'section', 'glossario', null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('conteudos', 4, 3, 'braden', 'Ver numa escala', 'A Braden mostra como a sugestão aparece.', 'tool', 'braden', null, null, null, true) on conflict (slug, block_position, position) do nothing;
insert into section_block (slug, position, block_id, title, body) values ('conteudos', 5, 'urgencia', 'Urgência e emergência', '5 H, 5 T, time de resposta rápida, suporte avançado de vida e DEA.') on conflict (slug, position) do nothing;
insert into section_block (slug, position, block_id, title, body) values ('conteudos', 6, 'centro', 'Bloco, clínica e trabalho', 'Instrumentais, checklist cirúrgico, SBAR, exames, bundles, NRs e COPSOQ.') on conflict (slug, position) do nothing;
insert into section_block (slug, position, block_id, title, body) values ('conteudos', 7, 'materno', 'Obstetrícia e neonatologia', 'Capurro, IHAC e aleitamento. O Apgar já está no template.') on conflict (slug, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('conteudos', 7, 1, 'apgar', 'Escala de Apgar', 'Minuto separado dos pontos.', 'tool', 'apgar', null, null, null, true) on conflict (slug, block_position, position) do nothing;
insert into section_page (slug, kicker, title, lead, kind) values ('emprego', 'Sites de emprego', 'Sites de vagas de trabalho', 'O mesmo destino do menu Sites de Emprego: instituições de saúde e quadros de vagas para enfermagem. Este preview não publica vaga nem candidatura.', 'pages') on conflict (slug) do nothing;
insert into section_block (slug, position, block_id, title, body) values ('emprego', 1, 'quadro', 'Como o fluxo segue', 'No site homologado a página reúne links de emprego. Aqui o item do menu não cai mais numa página genérica de pacote.') on conflict (slug, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('emprego', 1, 1, 'concurso', 'Concurso Santos', 'O guia de estudos fica no atalho verde do menu.', 'section', 'concurso', null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('emprego', 1, 2, 'simulados', 'Simulados', 'Treino para provas e concursos.', 'section', 'simulados', null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_page (slug, kicker, title, lead, kind) values ('simulados', 'Simulados', 'Simulados de enfermagem', 'Cinco questões e cartões dos instrumentos no ar. A nota fica só nesta visita. Os cadernos longos do menu não são copiados.', 'pages') on conflict (slug) do nothing;
insert into section_block (slug, position, block_id, title, body) values ('simulados', 1, 'treino', 'Neste preview', '') on conflict (slug, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('simulados', 1, 1, 'abrir', 'Treino de 5 questões', 'Cronômetro de 4 minutos. Sem cadastro.', 'section', 'simulados', 'treino', null, null, true) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('simulados', 1, 2, 'cartoes', 'Cartões', 'Seis fichas para virar na mesma página.', 'section', 'simulados', 'cartoes', null, null, true) on conflict (slug, block_position, position) do nothing;
insert into section_block (slug, position, block_id, title, body) values ('simulados', 2, 'lista', 'Provas longas do menu', 'Os cadernos de 30 e 50 questões continuam no site homologado.') on conflict (slug, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('simulados', 2, 1, '1-simulado-para-tecnicos', '1º Simulado para Técnicos', '50 questões das principais bancas, com cronômetro.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('simulados', 2, 2, '1-simulado-para-enfermeiros', '1º Simulado para Enfermeiros', '50 questões com avaliação final de acertos.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('simulados', 2, 3, '2-simulado-para-enfermeiros', '2º Simulado para Enfermeiros', 'Mais de 50 questões novas de bancas e instituições.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('simulados', 2, 4, 'seguranca-do-paciente', 'Segurança do Paciente', '50 questões de MS, IBSP, ANVISA e ISMP.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('simulados', 2, 5, 'notificacao-compulsoria', 'Notificação Compulsória', '50 questões da Portaria GM/MS.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('simulados', 2, 6, 'simulado-sobre-vacinas', 'Simulado sobre Vacinas', '30 questões de MS e SBIm.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('simulados', 2, 7, 'simulado-sobre-pcr', 'Simulado sobre PCR', '30 questões de parada cardiorrespiratória.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_page (slug, kicker, title, lead, kind) values ('biblioteca', 'Biblioteca', 'Biblioteca de enfermagem', 'Formulários, acervo clínico, imagens, PDF, slides e infográfico.', 'pages') on conflict (slug) do nothing;
insert into section_block (slug, position, block_id, title, body) values ('biblioteca', 1, 'formularios', 'Formulários de escalas', 'Mais de 60 escalas em branco para imprimir no plantão. A impressão do template clínico já cobre Braden, Morse, Apgar, gotejamento e IMC.') on conflict (slug, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('biblioteca', 1, 1, 'braden', 'Imprimir a Braden', 'Laudo e memória saem na folha.', 'tool', 'braden', null, null, null, true) on conflict (slug, block_position, position) do nothing;
insert into section_block (slug, position, block_id, title, body) values ('biblioteca', 2, 'acervo', 'Acervo', 'Prateleiras clínicas no mesmo molde da biblioteca. A imagem leva legenda. O PDF abre o arquivo que existe.') on conflict (slug, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('biblioteca', 2, 1, 'anatomia', 'Anatomia', 'Prancha de regiões, não um atlas.', 'model', null, 'anatomia', null, 'biblioteca', true) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('biblioteca', 2, 2, 'seringas', 'Seringas e agulhas', 'Peças nomeadas do dispositivo.', 'model', null, 'seringas', null, 'biblioteca', true) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('biblioteca', 2, 3, 'imagens', 'Imagens', 'Figura com legenda.', 'model', null, 'imagens', null, 'biblioteca', true) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('biblioteca', 2, 4, 'thumbnails', 'Thumbnails', 'Capa 16:9.', 'model', null, 'thumbnails', null, 'biblioteca', true) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('biblioteca', 2, 5, 'pdfs', 'PDFs', 'Arquivo avulso, sem pacote.', 'model', null, 'pdfs', null, 'biblioteca', true) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('biblioteca', 2, 6, 'slides', 'Slides', 'Lâmina 16:9.', 'model', null, 'slides', null, 'biblioteca', true) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('biblioteca', 2, 7, 'infograficos', 'Infográficos', 'Reconhecer, agir e registrar.', 'model', null, 'infograficos', null, 'biblioteca', true) on conflict (slug, block_position, position) do nothing;
insert into section_block (slug, position, block_id, title, body) values ('biblioteca', 3, 'blog', 'Blog de enfermagem', 'História da profissão e pioneiros, no molde do artigo longo.') on conflict (slug, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('biblioteca', 3, 1, 'mahoney', 'Mary Eliza Mahoney', 'Biografia, fotografia histórica e linha do tempo documentada.', 'page', null, null, '/blog/mary-eliza-mahoney', null, true) on conflict (slug, block_position, position) do nothing;
insert into section_block (slug, position, block_id, title, body) values ('biblioteca', 4, 'provas', 'Provas de concurso', 'O acervo de provas é item de biblioteca, separado dos simulados interativos.') on conflict (slug, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('biblioteca', 4, 1, 'simulados', 'Ir para simulados', 'Questões de treino.', 'section', 'simulados', null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_page (slug, kicker, title, lead, kind) values ('contato', 'Fale conosco', 'Contate-nos', 'O menu Fale Conosco abre esta página. A mensagem não é enviada nem gravada.', 'contact') on conflict (slug) do nothing;
insert into section_block (slug, position, block_id, title, body) values ('contato', 1, 'canais', 'Outros caminhos do menu', '') on conflict (slug, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('contato', 1, 1, 'sobre', 'Sobre nós', 'Institucional.', 'section', 'missao-visao-valores', null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('contato', 1, 2, 'politicas', 'Privacidade', 'O que fica e o que não fica salvo.', 'section', 'politicas', null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_page (slug, kicker, title, lead, kind) values ('entrar', 'Conta', 'Entrar', 'A entrada é uma tela própria. O assinante e o administrador não usam o menu público como área de trabalho.', 'enter') on conflict (slug) do nothing;
insert into section_block (slug, position, block_id, title, body) values ('entrar', 1, 'depois', 'Três telas', 'O público navega sem conta. O assinante abre o que foi publicado. O administrador grava essa fonte.') on conflict (slug, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('entrar', 1, 1, 'login', 'Entrar', 'Tela separada do site.', 'page', null, null, '/login', null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('entrar', 1, 2, 'calc', 'Seguir sem conta', 'As ferramentas públicas não pedem entrada.', 'section', 'calculadoras', null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_page (slug, kicker, title, lead, kind) values ('assinatura', 'Assinatura', 'Assine já', 'Pedido sem cobrança. A assinatura só abre a comunidade. As calculadoras públicas continuam livres.', 'subscribe') on conflict (slug) do nothing;
insert into section_block (slug, position, block_id, title, body) values ('assinatura', 1, 'incluso', 'O que a assinatura abre', 'O quadro de recados da área do assinante. O administrador ativa o pedido. Não há cartão.') on conflict (slug, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('assinatura', 1, 1, 'gotejamento', 'Gotejamento', 'Aberto sem conta.', 'tool', 'gotejamento', null, null, null, true) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('assinatura', 1, 2, 'braden', 'Braden', 'Aberto sem conta.', 'tool', 'braden', null, null, null, true) on conflict (slug, block_position, position) do nothing;
insert into section_page (slug, kicker, title, lead, kind) values ('politicas', 'Institucional', 'Políticas do site', 'Privacidade, cookies, retenção e LGPD no mesmo destino do rodapé homologado.', 'pages') on conflict (slug) do nothing;
insert into section_block (slug, position, block_id, title, body) values ('politicas', 1, 'privacidade', 'Política de privacidade', 'Nome, idade e leito digitados numa calculadora ficam só naquela tela. Não entram no navegador.') on conflict (slug, position) do nothing;
insert into section_block (slug, position, block_id, title, body) values ('politicas', 2, 'cookies', 'Política de cookies', 'O banner separa o necessário da tradução automática e da medição de desempenho. Recusar os opcionais não bloqueia a calculadora. Nada disso envia dado de paciente.') on conflict (slug, position) do nothing;
insert into section_block (slug, position, block_id, title, body) values ('politicas', 3, 'retencao', 'Retenção de dados', 'Preferências de fonte, contraste, foco, dislexia, modo escuro, idioma e a escolha de cookies podem ficar no navegador. Desempenho medido fica só na visita. Dado clínico de paciente, não.') on conflict (slug, position) do nothing;
insert into section_block (slug, position, block_id, title, body) values ('politicas', 4, 'lgpd', 'LGPD', 'A pessoa escolhe tradução e medição de desempenho à parte. Não há cookie de marketing. O laudo pode ser impresso em A4 ou baixado em DOCX, sem sair do navegador.') on conflict (slug, position) do nothing;
insert into section_page (slug, kicker, title, lead, kind) values ('termos', 'Institucional', 'Termos e condições de uso', 'As calculadoras e escalas são consultivas. A conduta fica com a equipe e com o protocolo da instituição.', 'pages') on conflict (slug) do nothing;
insert into section_block (slug, position, block_id, title, body) values ('termos', 1, 'uso', 'Uso', 'Não use um escore incompleto. Não troque o equipo sem recalcular. Não aplique o IMC adulto em criança.') on conflict (slug, position) do nothing;
insert into section_page (slug, kicker, title, lead, kind) values ('acessibilidade', 'Institucional', 'Política de acessibilidade', 'A barra segue a WCAG 2.1 nível AA no que este preview cobre: idioma da página, foco visível, atalho para o conteúdo, contraste de texto e de borda, teclado e nome acessível.', 'pages') on conflict (slug) do nothing;
insert into section_block (slug, position, block_id, title, body) values ('acessibilidade', 1, 'barra', 'O que a barra faz', 'A− e A+ mudam o tamanho, sem impedir o zoom do navegador até 200%. Contraste é preto e branco. Dislexia usa Lexend e mais espaço entre letras. Escuro reduz o brilho. Atalhos: Alt+1 conteúdo, Alt+2 menu, Alt+3 busca, Alt+4 rodapé, Alt+0 esta lista. Esc fecha o painel e o foco volta ao botão. O idioma fica na URL (?lang=en, es ou fr) e o html lang acompanha.') on conflict (slug, position) do nothing;
insert into section_block (slug, position, block_id, title, body) values ('acessibilidade', 2, 'wcag', 'Padrões WCAG 2.1 aplicados aqui', '1.3.1 e 4.1.2: botões com nome mesmo quando o rótulo some. 1.4.3 e 1.4.11: texto e borda. 2.1.1: teclado. 2.4.1: pular para o conteúdo. 2.4.7: foco amarelo. 2.4.11, da WCAG 2.2: o banner de cookies não cobre o cálculo. 2.5.5: alvo de 44 px na ferramenta. 3.1.2: a escala permanece em português. 4.1.3: o resultado é anunciado. O eMAG usa esta mesma base.') on conflict (slug, position) do nothing;
insert into section_block (slug, position, block_id, title, body) values ('acessibilidade', 3, 'fila', 'O que continua de fora', 'Não há leitor de tela embutido, VLibras, audiodescrição nem filtro de daltonismo. A tradução automática não altera escalas nem calculadoras.') on conflict (slug, position) do nothing;
insert into section_page (slug, kicker, title, lead, kind) values ('compromisso', 'Sustentabilidade digital', 'Nosso compromisso', 'Acessibilidade digital, sustentabilidade digital e proteção de dados, como no rodapé homologado.', 'pages') on conflict (slug) do nothing;
insert into section_block (slug, position, block_id, title, body) values ('compromisso', 1, 'impacto', 'Relatório de impacto', 'A medição de desempenho, se aceita, fica só nesta visita e não é impressa na página. A meta de referência é LCP até 2,5 s, INP até 200 ms e CLS até 0,1.') on conflict (slug, position) do nothing;
insert into section_block (slug, position, block_id, title, body) values ('compromisso', 2, 'verde', 'Tecnologia verde', 'Uma página de ferramenta para todas as escalas e calculadoras, em vez de um HTML por instrumento.') on conflict (slug, position) do nothing;
insert into section_page (slug, kicker, title, lead, kind) values ('mapa', 'Institucional', 'Mapa do site', 'Os mesmos destinos do menu e do rodapé. Item no ar abre a ferramenta. Os demais abrem a seção.', 'pages') on conflict (slug) do nothing;
insert into section_block (slug, position, block_id, title, body) values ('mapa', 1, 'secoes', 'Seções', '') on conflict (slug, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('mapa', 1, 1, 'inicio', 'Início', 'Home.', 'home', null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('mapa', 1, 2, 'sobre', 'Sobre nós', 'Missão e governança.', 'section', 'missao-visao-valores', null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('mapa', 1, 3, 'calculadoras', 'Calculadoras', 'Catálogo de cálculos.', 'section', 'calculadoras', null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('mapa', 1, 4, 'escalas', 'Escalas', 'Catálogo por especialidade.', 'section', 'escalas', null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('mapa', 1, 5, 'conteudos', 'Conteúdos', 'Grupos do menu.', 'section', 'conteudos', null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('mapa', 1, 6, 'emprego', 'Sites de emprego', 'Vagas.', 'section', 'emprego', null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('mapa', 1, 7, 'simulados', 'Simulados', 'Treino curto nesta visita.', 'section', 'simulados', 'treino', null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('mapa', 1, 8, 'nanda', 'NANDA', 'Índice das sugestões já usadas.', 'section', 'nanda', null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('mapa', 1, 9, 'glossario', 'Glossário', 'Termos dos instrumentos no ar.', 'section', 'glossario', null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('mapa', 1, 10, 'biblioteca', 'Biblioteca', 'Formulários e acervo.', 'section', 'biblioteca', null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('mapa', 1, 11, 'contato', 'Fale conosco', 'Contato.', 'section', 'contato', null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_page (slug, kicker, title, lead, kind) values ('glossario', 'Conteúdos', 'Glossário clínico', 'Os termos dos instrumentos que já calculam aqui. Não substitui o glossário longo do site homologado.', 'pages') on conflict (slug) do nothing;
insert into section_block (slug, position, block_id, title, body) values ('glossario', 1, 'termos', 'Termos', '') on conflict (slug, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('glossario', 1, 1, 'braden', 'Braden', 'Escala de risco de lesão por pressão. Escore de 6 a 23.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('glossario', 1, 2, 'morse', 'Morse', 'Escala de risco de queda. A partir de 45 pontos, risco alto neste template.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('glossario', 1, 3, 'apgar', 'Apgar', 'Vitalidade do recém-nascido. O minuto da avaliação fica separado da soma.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('glossario', 1, 4, 'gotejamento', 'Gotejamento', 'Gotas por minuto a partir do volume, do tempo e do fator do equipo.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('glossario', 1, 5, 'macrogotas', 'Macrogotas', 'Equipo com fator 20 gotas por mL.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('glossario', 1, 6, 'microgotas', 'Microgotas', 'Equipo com fator 60 gotas por mL.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('glossario', 1, 7, 'imc', 'IMC', 'Peso dividido pela altura ao quadrado. A faixa deste template é a do adulto.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('glossario', 1, 8, 'nanda', 'NANDA', 'Sugestão de diagnóstico de enfermagem. Nas escalas, não fecha a conduta.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('glossario', 1, 9, 'laudo', 'Laudo', 'Folha desta avaliação. Pode ser impressa em A4 ou baixada em DOCX, sem sair do navegador.', null, null, null, null, null, false) on conflict (slug, block_position, position) do nothing;
insert into section_page (slug, kicker, title, lead, kind) values ('nanda', 'Conteúdos', 'Índice NANDA', 'Somente as sugestões que Braden, Morse e Apgar já mostram na faixa. Nenhuma delas fecha diagnóstico.', 'pages') on conflict (slug) do nothing;
insert into section_block (slug, position, block_id, title, body) values ('nanda', 1, 'lista', 'Sugestões usadas', 'O título é o mesmo texto que aparece na escala. Abra o instrumento para ver em qual faixa ele entra.') on conflict (slug, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('nanda', 1, 1, 'lesao', 'Risco de lesão por pressão', 'Braden, em todas as faixas com risco.', 'tool', 'braden', null, null, null, true) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('nanda', 1, 2, 'mobilidade', 'Mobilidade física prejudicada', 'Braden de risco muito alto e Morse de risco alto.', 'tool', 'braden', null, null, null, true) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('nanda', 1, 3, 'pele', 'Integridade da pele prejudicada', 'Braden de risco alto.', 'tool', 'braden', null, null, null, true) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('nanda', 1, 4, 'queda', 'Risco de queda', 'Morse de risco médio e alto.', 'tool', 'morse', null, null, null, true) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('nanda', 1, 5, 'gases', 'Troca de gases prejudicada', 'Apgar de depressão grave.', 'tool', 'apgar', null, null, null, true) on conflict (slug, block_position, position) do nothing;
insert into section_link (slug, block_position, position, item_id, title, text, dest_kind, dest_slug, dest_hash, dest_to, dest_model, live) values ('nanda', 1, 6, 'resp', 'Padrão respiratório ineficaz', 'Apgar de depressão grave e moderada.', 'tool', 'apgar', null, null, null, true) on conflict (slug, block_position, position) do nothing;
insert into schema_entity (name, layer_id, primary_key, purpose, links)
values
  ('media_asset', 'conteudo', 'path', 'Arquivo público. O byte fica no disco.', ''),
  ('crawl_rule', 'conteudo', 'position', 'Linha do robots.', ''),
  ('sitemap_url', 'conteudo', 'position', 'Endereço do mapa.', ''),
  ('template_family', 'conteudo', 'id', 'Família de template.', ''),
  ('fundamento_pack', 'processo', 'id', 'Pacote de metadado. Não é o texto da norma.', ''),
  ('specimen', 'conteudo', 'id', 'Amostra de biblioteca ou norma.', ''),
  ('specimen_module', 'conteudo', 'specimen_id + position', 'Bloco da amostra.', 'specimen_id → specimen.id'),
  ('specimen_line', 'conteudo', 'specimen_id + module_position + position', 'Trecho do bloco.', 'specimen_module'),
  ('section_page', 'conteudo', 'slug', 'Página de seção.', ''),
  ('section_block', 'conteudo', 'slug + position', 'Bloco da seção.', 'slug → section_page.slug'),
  ('section_link', 'conteudo', 'slug + block_position + position', 'Item do bloco.', 'section_block')
on conflict (name) do nothing;

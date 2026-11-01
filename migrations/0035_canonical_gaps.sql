-- Fecha os furos do canônico. Não inventa ferramenta nem usuário.

update content_object as object
set kind = 'instrumento'
from source_tool as tool
where object.kind in ('biblioteca', 'pagina')
  and (object.slug = tool.slug or object.origin_path = '/' || tool.slug || '.html');

update content_object set kind = 'editorial'
where kind in ('biblioteca', 'pagina')
  and (origin_path like '%/blog/%' or slug like 'artigo%' or slug like '%\_artigo%' escape '\');

update content_object set kind = 'simulado'
where kind in ('biblioteca', 'pagina') and (origin_path ilike '%simulado%' or slug like '%simulado%');

update content_object set kind = 'norma'
where kind in ('biblioteca', 'pagina') and (
  slug like 'cofen%' or slug like 'coren%' or origin_path ilike '%codigo_de_etica%'
  or origin_path ilike '%codigo-de-etica%' or origin_path ilike '%resolucao%' or origin_path ilike '%portaria%'
);

update content_object set kind = 'institucional'
where kind in ('biblioteca', 'pagina') and (origin_path like '%/institucional/%' or slug like 'politica%' or slug like 'acessibilidade%');

update content_object set kind = 'guia'
where kind in ('biblioteca', 'pagina') and (slug like 'guia%' or slug like 'protocolo%' or slug like 'formulario%');

update content_text set status = 'rascunho'
where status = 'publicado' and btrim(body) = '' and title like '/%';

insert into content_object (slug, kind, origin_path) values
  ('home', 'pagina', '/'),
  ('mary-eliza-mahoney', 'editorial', '/blog/mary-eliza-mahoney')
on conflict (slug) do nothing;

insert into content_text (slug, locale, view, title, lead, body, status) values
  ('home', 'pt-BR', 'leitura', 'Calculadoras de Enfermagem, Simulados e Escalas Clínicas', 'Plataforma clínica com escalas, protocolos e calculadoras de enfermagem.', 'A página inicial reúne as seções publicadas nesta mesa.', 'publicado'),
  ('home', 'en', 'leitura', 'Nursing Calculators, Quizzes and Clinical Scales', 'Clinical platform of scales, protocols and nursing calculators.', 'The home page opens the sections published on this desk.', 'publicado'),
  ('home', 'es', 'leitura', 'Calculadoras de Enfermería, Simulacros y Escalas Clínicas', 'Plataforma clínica con escalas, protocolos y calculadoras de enfermería.', 'La página inicial abre las secciones publicadas en esta mesa.', 'publicado'),
  ('home', 'fr', 'leitura', 'Calculatrices de soins, quiz et échelles cliniques', 'Plateforme clinique d''échelles, de protocoles et de calculatrices.', 'La page d''accueil ouvre les sections publiées.', 'publicado'),
  ('mary-eliza-mahoney', 'pt-BR', 'leitura', 'Mary Eliza Mahoney: biografia e linha do tempo', 'Biografia de Mary Eliza Mahoney (1845–1926), pioneira da enfermagem afro-americana, com fotografia histórica e linha do tempo documentada.', 'Mary Eliza Mahoney (1845–1926) foi a primeira mulher negra diplomada em enfermagem nos Estados Unidos. A página documenta a trajetória, a fotografia histórica e a linha do tempo.', 'publicado')
on conflict (slug, locale, view) do nothing;

insert into content_alias (path, slug, locale, view) values
  ('/', 'home', 'pt-BR', 'leitura'),
  ('/en/index.html', 'home', 'en', 'leitura'),
  ('/es/index.html', 'home', 'es', 'leitura'),
  ('/fr/index.html', 'home', 'fr', 'leitura'),
  ('/blog/mary-eliza-mahoney', 'mary-eliza-mahoney', 'pt-BR', 'leitura')
on conflict (path) do nothing;

insert into content_object (slug, kind, origin_path)
select case when exists (select 1 from content_object as taken where taken.slug = page.slug) then 'secao-' || page.slug else page.slug end,
  'institucional', '/secao/' || page.slug
from section_page as page
where not exists (select 1 from content_object as object where object.origin_path = '/secao/' || page.slug)
on conflict (slug) do nothing;

insert into content_text (slug, locale, view, title, lead, body, status)
select object.slug, 'pt-BR', 'leitura', page.title, page.lead, page.lead, 'publicado'
from section_page as page
join content_object as object on object.origin_path = '/secao/' || page.slug
on conflict (slug, locale, view) do nothing;

insert into content_alias (path, slug, locale, view)
select object.origin_path, object.slug, 'pt-BR', 'leitura'
from content_object as object
where object.origin_path like '/secao/%'
on conflict (path) do nothing;

insert into content_alias (path, slug, locale, view)
select object.origin_path, object.slug, 'pt-BR', case when object.kind = 'instrumento' then 'calculadora' else 'leitura' end
from content_object as object
where not exists (select 1 from content_alias as alias where alias.path = object.origin_path)
  and exists (
    select 1 from content_text as copy
    where copy.slug = object.slug and copy.locale = 'pt-BR' and copy.status = 'publicado'
      and copy.view = case when object.kind = 'instrumento' then 'calculadora' else 'leitura' end
  )
on conflict (path) do nothing;

insert into chrome_label (locale, group_id, key, text) values
  ('pt-BR', 'chrome', 'home', 'Início'),
  ('pt-BR', 'chrome', 'about', 'Sobre Nós'),
  ('pt-BR', 'chrome', 'calcs', 'Calculadoras'),
  ('pt-BR', 'chrome', 'contents', 'Conteúdos'),
  ('pt-BR', 'chrome', 'jobs', 'Sites de Emprego'),
  ('pt-BR', 'chrome', 'exams', 'Simulados'),
  ('pt-BR', 'chrome', 'library', 'Biblioteca de enfermagem'),
  ('pt-BR', 'chrome', 'contact', 'Fale Conosco'),
  ('pt-BR', 'chrome', 'enter', 'Entrar'),
  ('pt-BR', 'chrome', 'subscribe', 'Assine já'),
  ('pt-BR', 'chrome', 'search', 'Buscar calculadoras e escalas'),
  ('pt-BR', 'chrome', 'menu', 'Menu'),
  ('pt-BR', 'chrome', 'system', 'Sistema visual'),
  ('pt-BR', 'chrome', 'pack', 'Pacote de templates'),
  ('pt-BR', 'chrome', 'skip', 'Pular para o conteúdo'),
  ('pt-BR', 'chrome', 'contrast', 'Contraste'),
  ('pt-BR', 'chrome', 'dyslexia', 'Dislexia'),
  ('pt-BR', 'chrome', 'dark', 'Escuro'),
  ('pt-BR', 'chrome', 'shortcuts', 'Atalhos'),
  ('pt-BR', 'chrome', 'a11y', 'Acessibilidade'),
  ('pt-BR', 'chrome', 'language', 'Idioma'),
  ('pt-BR', 'chrome', 'reset', 'Reset'),
  ('pt-BR', 'chrome', 'fontDown', 'A− diminuir fonte'),
  ('pt-BR', 'chrome', 'fontUp', 'A+ aumentar fonte'),
  ('pt-BR', 'chrome', 'close', 'Fechar'),
  ('pt-BR', 'chrome', 'shortcutsTitle', 'Atalhos de teclado'),
  ('pt-BR', 'chrome', 'goContent', 'Ir para o conteúdo'),
  ('pt-BR', 'chrome', 'goMenu', 'Ir para o menu'),
  ('pt-BR', 'chrome', 'goSearch', 'Ir para a busca'),
  ('pt-BR', 'chrome', 'goFooter', 'Ir para o rodapé'),
  ('pt-BR', 'chrome', 'openList', 'Abrir esta lista'),
  ('pt-BR', 'chrome', 'closePanels', 'Fechar painel ou menu'),
  ('pt-BR', 'chrome', 'cookie', 'Usamos cookies para lembrar acessibilidade. A tradução automática e a medição de audiência só acontecem com o seu consentimento.'),
  ('pt-BR', 'chrome', 'accept', 'Aceitar'),
  ('pt-BR', 'chrome', 'reject', 'Recusar opcionais'),
  ('pt-BR', 'chrome', 'customize', 'Personalizar'),
  ('pt-BR', 'chrome', 'saveCookies', 'Salvar escolha'),
  ('pt-BR', 'chrome', 'cookieNecessary', 'Necessários ficam sempre ligados: acessibilidade e o registro desta escolha. A calculadora não depende deles.'),
  ('pt-BR', 'chrome', 'cookieTranslation', 'Tradução automática (MyMemory)'),
  ('pt-BR', 'chrome', 'cookieAudience', 'Medir desempenho desta visita, só neste navegador'),
  ('pt-BR', 'chrome', 'autoNote', 'A interface segue o idioma da URL. Textos institucionais usam tradução automática da MyMemory. Escalas e calculadoras permanecem em português.'),
  ('pt-BR', 'chrome', 'clinicalLock', 'Este instrumento permanece em português. Critérios e pontuação não passam por tradução automática.'),
  ('pt-BR', 'chrome', 'searchPlaceholder', 'Buscar calculadoras, escalas e seções'),
  ('pt-BR', 'chrome', 'institutional', 'Institucional'),
  ('pt-BR', 'chrome', 'sustainability', 'Sustentabilidade Digital'),
  ('pt-BR', 'chrome', 'commitment', 'Nosso Compromisso'),
  ('pt-BR', 'chrome', 'follow', 'Siga-nos'),
  ('pt-BR', 'chrome', 'commitmentText', 'Nosso site adota como princípio de governança o compromisso com altos padrões de acessibilidade digital, sustentabilidade digital e proteção de dados.'),
  ('pt-BR', 'chrome', 'cookiesManage', 'Gerenciar Preferências de Cookies'),
  ('en', 'chrome', 'home', 'Home'),
  ('en', 'chrome', 'about', 'About'),
  ('en', 'chrome', 'calcs', 'Calculators'),
  ('en', 'chrome', 'contents', 'Contents'),
  ('en', 'chrome', 'jobs', 'Jobs'),
  ('en', 'chrome', 'exams', 'Quizzes'),
  ('en', 'chrome', 'library', 'Nursing library'),
  ('en', 'chrome', 'contact', 'Contact'),
  ('en', 'chrome', 'enter', 'Sign in'),
  ('en', 'chrome', 'subscribe', 'Subscribe'),
  ('en', 'chrome', 'search', 'Search calculators and scales'),
  ('en', 'chrome', 'menu', 'Menu'),
  ('en', 'chrome', 'system', 'Visual system'),
  ('en', 'chrome', 'pack', 'Template pack'),
  ('en', 'chrome', 'skip', 'Skip to content'),
  ('en', 'chrome', 'contrast', 'Contrast'),
  ('en', 'chrome', 'dyslexia', 'Dyslexia'),
  ('en', 'chrome', 'dark', 'Dark'),
  ('en', 'chrome', 'shortcuts', 'Shortcuts'),
  ('en', 'chrome', 'a11y', 'Accessibility'),
  ('en', 'chrome', 'language', 'Language'),
  ('en', 'chrome', 'reset', 'Reset'),
  ('en', 'chrome', 'fontDown', 'A− decrease text'),
  ('en', 'chrome', 'fontUp', 'A+ increase text'),
  ('en', 'chrome', 'close', 'Close'),
  ('en', 'chrome', 'shortcutsTitle', 'Keyboard shortcuts'),
  ('en', 'chrome', 'goContent', 'Skip to content'),
  ('en', 'chrome', 'goMenu', 'Skip to menu'),
  ('en', 'chrome', 'goSearch', 'Skip to search'),
  ('en', 'chrome', 'goFooter', 'Skip to footer'),
  ('en', 'chrome', 'openList', 'Open this list'),
  ('en', 'chrome', 'closePanels', 'Close panel or menu'),
  ('en', 'chrome', 'cookie', 'We use cookies to remember accessibility. Automatic translation and audience measurement run only with your consent.'),
  ('en', 'chrome', 'accept', 'Accept'),
  ('en', 'chrome', 'reject', 'Reject optional'),
  ('en', 'chrome', 'customize', 'Customize'),
  ('en', 'chrome', 'saveCookies', 'Save choice'),
  ('en', 'chrome', 'cookieNecessary', 'Necessary cookies stay on: accessibility and this choice. The calculator does not depend on the optional ones.'),
  ('en', 'chrome', 'cookieTranslation', 'Automatic translation (MyMemory)'),
  ('en', 'chrome', 'cookieAudience', 'Measure performance for this visit, only in this browser'),
  ('en', 'chrome', 'autoNote', 'The interface follows the language in the URL. Institutional text uses MyMemory automatic translation. Scales and calculators stay in Portuguese.'),
  ('en', 'chrome', 'clinicalLock', 'This instrument stays in Portuguese. Criteria and scores are not machine-translated.'),
  ('en', 'chrome', 'searchPlaceholder', 'Search calculators, scales and sections'),
  ('en', 'chrome', 'institutional', 'Institutional'),
  ('en', 'chrome', 'sustainability', 'Digital sustainability'),
  ('en', 'chrome', 'commitment', 'Our commitment'),
  ('en', 'chrome', 'follow', 'Follow us'),
  ('en', 'chrome', 'commitmentText', 'This site is governed by a commitment to digital accessibility, digital sustainability and data protection.'),
  ('en', 'chrome', 'cookiesManage', 'Manage cookie preferences'),
  ('es', 'chrome', 'home', 'Inicio'),
  ('es', 'chrome', 'about', 'Sobre nosotros'),
  ('es', 'chrome', 'calcs', 'Calculadoras'),
  ('es', 'chrome', 'contents', 'Contenidos'),
  ('es', 'chrome', 'jobs', 'Empleo'),
  ('es', 'chrome', 'exams', 'Simulacros'),
  ('es', 'chrome', 'library', 'Biblioteca'),
  ('es', 'chrome', 'contact', 'Contacto'),
  ('es', 'chrome', 'enter', 'Entrar'),
  ('es', 'chrome', 'subscribe', 'Suscribirse'),
  ('es', 'chrome', 'search', 'Buscar calculadoras y escalas'),
  ('es', 'chrome', 'menu', 'Menú'),
  ('es', 'chrome', 'system', 'Sistema visual'),
  ('es', 'chrome', 'pack', 'Paquete de plantillas'),
  ('es', 'chrome', 'skip', 'Saltar al contenido'),
  ('es', 'chrome', 'contrast', 'Contraste'),
  ('es', 'chrome', 'dyslexia', 'Dislexia'),
  ('es', 'chrome', 'dark', 'Oscuro'),
  ('es', 'chrome', 'shortcuts', 'Atajos'),
  ('es', 'chrome', 'a11y', 'Accesibilidad'),
  ('es', 'chrome', 'language', 'Idioma'),
  ('es', 'chrome', 'reset', 'Restablecer'),
  ('es', 'chrome', 'fontDown', 'A− reducir texto'),
  ('es', 'chrome', 'fontUp', 'A+ aumentar texto'),
  ('es', 'chrome', 'close', 'Cerrar'),
  ('es', 'chrome', 'shortcutsTitle', 'Atajos de teclado'),
  ('es', 'chrome', 'goContent', 'Ir al contenido'),
  ('es', 'chrome', 'goMenu', 'Ir al menú'),
  ('es', 'chrome', 'goSearch', 'Ir a la búsqueda'),
  ('es', 'chrome', 'goFooter', 'Ir al pie'),
  ('es', 'chrome', 'openList', 'Abrir esta lista'),
  ('es', 'chrome', 'closePanels', 'Cerrar panel o menú'),
  ('es', 'chrome', 'cookie', 'Usamos cookies para recordar la accesibilidad. La traducción automática y la medición de audiencia solo ocurren con su consentimiento.'),
  ('es', 'chrome', 'accept', 'Aceptar'),
  ('es', 'chrome', 'reject', 'Rechazar opcionales'),
  ('es', 'chrome', 'customize', 'Personalizar'),
  ('es', 'chrome', 'saveCookies', 'Guardar elección'),
  ('es', 'chrome', 'cookieNecessary', 'Los necesarios siguen activos: accesibilidad y esta elección. La calculadora no depende de los opcionales.'),
  ('es', 'chrome', 'cookieTranslation', 'Traducción automática (MyMemory)'),
  ('es', 'chrome', 'cookieAudience', 'Medir el rendimiento de esta visita, solo en este navegador'),
  ('es', 'chrome', 'autoNote', 'La interfaz sigue el idioma de la URL. Los textos institucionales usan traducción automática de MyMemory. Las escalas y calculadoras permanecen en portugués.'),
  ('es', 'chrome', 'clinicalLock', 'Este instrumento permanece en portugués. Los criterios y la puntuación no se traducen automáticamente.'),
  ('es', 'chrome', 'searchPlaceholder', 'Buscar calculadoras, escalas y secciones'),
  ('es', 'chrome', 'institutional', 'Institucional'),
  ('es', 'chrome', 'sustainability', 'Sostenibilidad digital'),
  ('es', 'chrome', 'commitment', 'Nuestro compromiso'),
  ('es', 'chrome', 'follow', 'Síganos'),
  ('es', 'chrome', 'commitmentText', 'Este sitio se rige por el compromiso con la accesibilidad digital, la sostenibilidad digital y la protección de datos.'),
  ('es', 'chrome', 'cookiesManage', 'Gestionar preferencias de cookies'),
  ('fr', 'chrome', 'home', 'Accueil'),
  ('fr', 'chrome', 'about', 'À propos'),
  ('fr', 'chrome', 'calcs', 'Calculatrices'),
  ('fr', 'chrome', 'contents', 'Contenus'),
  ('fr', 'chrome', 'jobs', 'Emploi'),
  ('fr', 'chrome', 'exams', 'QCM'),
  ('fr', 'chrome', 'library', 'Bibliothèque'),
  ('fr', 'chrome', 'contact', 'Contact'),
  ('fr', 'chrome', 'enter', 'Connexion'),
  ('fr', 'chrome', 'subscribe', 'S''abonner'),
  ('fr', 'chrome', 'search', 'Rechercher calculateurs et échelles'),
  ('fr', 'chrome', 'menu', 'Menu'),
  ('fr', 'chrome', 'system', 'Système visuel'),
  ('fr', 'chrome', 'pack', 'Pack de modèles'),
  ('fr', 'chrome', 'skip', 'Aller au contenu'),
  ('fr', 'chrome', 'contrast', 'Contraste'),
  ('fr', 'chrome', 'dyslexia', 'Dyslexie'),
  ('fr', 'chrome', 'dark', 'Sombre'),
  ('fr', 'chrome', 'shortcuts', 'Raccourcis'),
  ('fr', 'chrome', 'a11y', 'Accessibilité'),
  ('fr', 'chrome', 'language', 'Langue'),
  ('fr', 'chrome', 'reset', 'Réinitialiser'),
  ('fr', 'chrome', 'fontDown', 'A− réduire le texte'),
  ('fr', 'chrome', 'fontUp', 'A+ agrandir le texte'),
  ('fr', 'chrome', 'close', 'Fermer'),
  ('fr', 'chrome', 'shortcutsTitle', 'Raccourcis clavier'),
  ('fr', 'chrome', 'goContent', 'Aller au contenu'),
  ('fr', 'chrome', 'goMenu', 'Aller au menu'),
  ('fr', 'chrome', 'goSearch', 'Aller à la recherche'),
  ('fr', 'chrome', 'goFooter', 'Aller au pied de page'),
  ('fr', 'chrome', 'openList', 'Ouvrir cette liste'),
  ('fr', 'chrome', 'closePanels', 'Fermer le panneau ou le menu'),
  ('fr', 'chrome', 'cookie', 'Nous utilisons des cookies pour mémoriser l''accessibilité. La traduction automatique et la mesure d''audience ne se font qu''avec votre accord.'),
  ('fr', 'chrome', 'accept', 'Accepter'),
  ('fr', 'chrome', 'reject', 'Refuser les optionnels'),
  ('fr', 'chrome', 'customize', 'Personnaliser'),
  ('fr', 'chrome', 'saveCookies', 'Enregistrer'),
  ('fr', 'chrome', 'cookieNecessary', 'Les cookies nécessaires restent actifs : accessibilité et ce choix. La calculatrice n''en dépend pas.'),
  ('fr', 'chrome', 'cookieTranslation', 'Traduction automatique (MyMemory)'),
  ('fr', 'chrome', 'cookieAudience', 'Mesurer les performances de cette visite, seulement dans ce navigateur'),
  ('fr', 'chrome', 'autoNote', 'L''interface suit la langue de l''URL. Les textes institutionnels utilisent la traduction automatique MyMemory. Les échelles et calculatrices restent en portugais.'),
  ('fr', 'chrome', 'clinicalLock', 'Cet instrument reste en portugais. Les critères et le score ne sont pas traduits automatiquement.'),
  ('fr', 'chrome', 'searchPlaceholder', 'Rechercher calculatrices, échelles et sections'),
  ('fr', 'chrome', 'institutional', 'Institutionnel'),
  ('fr', 'chrome', 'sustainability', 'Durabilité numérique'),
  ('fr', 'chrome', 'commitment', 'Notre engagement'),
  ('fr', 'chrome', 'follow', 'Nous suivre'),
  ('fr', 'chrome', 'commitmentText', 'Ce site est régi par un engagement d''accessibilité numérique, de durabilité numérique et de protection des données.'),
  ('fr', 'chrome', 'cookiesManage', 'Gérer les cookies')
on conflict (locale, group_id, key) do nothing;

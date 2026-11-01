-- Texto alternativo por idioma. Só o português que já foi lido na imagem entra publicado.

create table if not exists media_alt (
  path text not null references media_asset (path),
  locale text not null references locale (id),
  text text not null,
  status text not null default 'rascunho' check (status in ('rascunho', 'publicado')),
  primary key (path, locale)
);

insert into schema_entity (name, layer_id, primary_key, purpose, links)
values
  ('media_alt', 'conteudo', 'path + locale', 'Texto alternativo de uma imagem num idioma.', 'path → media_asset.path; locale → locale.id')
on conflict (name) do nothing;

insert into schema_column (entity, name, data_type, required, key_part, ref_entity, definition, syntax, unit)
values
  ('media_alt', 'path', 'texto', true, true, 'media_asset', 'Imagem deste texto.', 'caminho existente', null),
  ('media_alt', 'locale', 'texto', true, true, 'locale', 'Idioma deste texto.', 'id de locale', null),
  ('media_alt', 'text', 'texto', true, false, null, 'Texto alternativo neste idioma.', 'texto que não repete o nome do arquivo', null),
  ('media_alt', 'status', 'texto', true, false, null, 'Rascunho não substitui o português publicado.', 'rascunho ou publicado', null)
on conflict (entity, name) do nothing;

insert into data_specification (id, entity, characteristic, definition, syntax, unit, required, owner_role, source)
select 'spec-' || entity || '-' || name, entity, name, definition, syntax, unit, required, 'administrador', entity || '.' || name
from schema_column
where entity = 'media_alt'
on conflict (id) do nothing;

insert into media_alt (path, locale, text, status)
select path, 'pt-BR', alt, 'publicado'
from media_asset
where kind = 'imagem' and alt is not null and btrim(alt) <> ''
on conflict (path, locale) do nothing;

insert into media_alt (path, locale, text, status) values
  ('/brand/logo.webp', 'en', 'Site mark: a white cross on a navy square.', 'rascunho'),
  ('/brand/logo.webp', 'es', 'Marca del sitio: cruz blanca sobre un cuadrado azul marino.', 'rascunho'),
  ('/brand/logo.webp', 'fr', 'Marque du site : croix blanche sur un carré bleu marine.', 'rascunho'),
  ('/brand/calc-icon.webp', 'en', 'White calculator with a syringe and a check mark.', 'rascunho'),
  ('/brand/calc-icon.webp', 'es', 'Calculadora blanca con jeringa y una marca de verificación.', 'rascunho'),
  ('/brand/calc-icon.webp', 'fr', 'Calculatrice blanche avec une seringue et une coche.', 'rascunho'),
  ('/brand/chapeu.webp', 'en', 'White nursing cap with a blue cross.', 'rascunho'),
  ('/brand/chapeu.webp', 'es', 'Gorro de enfermería blanco con una cruz azul.', 'rascunho'),
  ('/brand/chapeu.webp', 'fr', 'Coiffe d''infirmière blanche avec une croix bleue.', 'rascunho'),
  ('/brand/enfermeira.webp', 'en', 'Nurse in a blue top, stethoscope around the neck and arms crossed.', 'rascunho'),
  ('/brand/enfermeira.webp', 'es', 'Profesional de enfermería con filipina azul, estetoscopio al cuello y brazos cruzados.', 'rascunho'),
  ('/brand/enfermeira.webp', 'fr', 'Professionnelle en tenue bleue, stéthoscope autour du cou et bras croisés.', 'rascunho'),
  ('/brand/ext-braden.webp', 'en', 'Crop of the nursing cap with a blue cross.', 'rascunho'),
  ('/brand/ext-braden.webp', 'es', 'Recorte del gorro de enfermería con cruz azul.', 'rascunho'),
  ('/brand/ext-braden.webp', 'fr', 'Détail de la coiffe d''infirmière avec une croix bleue.', 'rascunho'),
  ('/brand/ext-gasometria.webp', 'en', 'Crop of the calculator and the syringe.', 'rascunho'),
  ('/brand/ext-gasometria.webp', 'es', 'Recorte de la calculadora y de la jeringa.', 'rascunho'),
  ('/brand/ext-gasometria.webp', 'fr', 'Détail de la calculatrice et de la seringue.', 'rascunho'),
  ('/brand/ext-gotejamento.webp', 'en', 'Crop of the calculator with a check mark.', 'rascunho'),
  ('/brand/ext-gotejamento.webp', 'es', 'Recorte de la calculadora con marca de verificación.', 'rascunho'),
  ('/brand/ext-gotejamento.webp', 'fr', 'Détail de la calculatrice avec une coche.', 'rascunho'),
  ('/brand/form-001.webp', 'en', 'First page of the WIfI assessment form, with wound, ischemia and foot infection.', 'rascunho'),
  ('/brand/form-001.webp', 'es', 'Primera página del formulario de evaluación WIfI, con herida, isquemia e infección del pie.', 'rascunho'),
  ('/brand/form-001.webp', 'fr', 'Première page du formulaire d''évaluation WIfI, avec plaie, ischémie et infection du pied.', 'rascunho'),
  ('/brand/livro.webp', 'en', 'Open blue book with a check mark.', 'rascunho'),
  ('/brand/livro.webp', 'es', 'Libro azul abierto con una marca de verificación.', 'rascunho'),
  ('/brand/livro.webp', 'fr', 'Livre bleu ouvert avec une coche.', 'rascunho'),
  ('/favicon.svg', 'en', 'Site icon: white cross on a navy background.', 'rascunho'),
  ('/favicon.svg', 'es', 'Icono del sitio: cruz blanca sobre fondo azul marino.', 'rascunho'),
  ('/favicon.svg', 'fr', 'Icône du site : croix blanche sur fond bleu marine.', 'rascunho'),
  ('/og.jpg', 'en', 'Share card with the name Calculadoras de Enfermagem and the line scales, protocols and clinical calculators.', 'rascunho'),
  ('/og.jpg', 'es', 'Tarjeta para compartir con el nombre Calculadoras de Enfermagem y la línea escalas, protocolos y calculadoras clínicas.', 'rascunho'),
  ('/og.jpg', 'fr', 'Carte de partage avec le nom Calculadoras de Enfermagem et la ligne échelles, protocoles et calculateurs cliniques.', 'rascunho'),
  ('/artigos/mary-eliza-mahoney.jpg', 'en', 'Black-and-white historical portrait of Mary Eliza Mahoney in a nursing cap and uniform.', 'rascunho'),
  ('/artigos/mary-eliza-mahoney.jpg', 'es', 'Retrato histórico en blanco y negro de Mary Eliza Mahoney con cofia y uniforme de enfermería.', 'rascunho'),
  ('/artigos/mary-eliza-mahoney.jpg', 'fr', 'Portrait historique en noir et blanc de Mary Eliza Mahoney en coiffe et uniforme d''infirmière.', 'rascunho'),
  ('/artigos/sepse-reavaliacao.svg', 'en', 'Illustration of perfusion reassessment in sepsis, with five numbered points.', 'rascunho'),
  ('/artigos/sepse-reavaliacao.svg', 'es', 'Ilustración de la reevaluación de la perfusión en la sepsis, con cinco puntos numerados.', 'rascunho'),
  ('/artigos/sepse-reavaliacao.svg', 'fr', 'Illustration de la réévaluation de la perfusion dans le sepsis, avec cinq points numérotés.', 'rascunho'),
  ('/artigos/sepse-reconhecimento.svg', 'en', 'Illustration of a patient with a monitor and five numbered markers of deterioration.', 'rascunho'),
  ('/artigos/sepse-reconhecimento.svg', 'es', 'Ilustración de un paciente con monitor y cinco marcadores numerados de deterioro.', 'rascunho'),
  ('/artigos/sepse-reconhecimento.svg', 'fr', 'Illustration d''un patient avec un moniteur et cinq repères numérotés de détérioration.', 'rascunho'),
  ('/institucional/selo-acessibilidade.webp', 'en', 'Blue badge with the words inclusive accessibility and a person figure.', 'rascunho'),
  ('/institucional/selo-acessibilidade.webp', 'es', 'Sello azul con la frase accesibilidad inclusiva y la figura de una persona.', 'rascunho'),
  ('/institucional/selo-acessibilidade.webp', 'fr', 'Sceau bleu avec la formule accessibilité inclusive et la figure d''une personne.', 'rascunho'),
  ('/institucional/selo-lgpd.webp', 'en', 'Blue badge with a padlock and the words LGPD, protected data.', 'rascunho'),
  ('/institucional/selo-lgpd.webp', 'es', 'Sello azul con candado y la frase LGPD, datos protegidos.', 'rascunho'),
  ('/institucional/selo-lgpd.webp', 'fr', 'Sceau bleu avec un cadenas et la formule LGPD, données protégées.', 'rascunho'),
  ('/institucional/selo-sustentabilidade.webp', 'en', 'Green badge with the planet and the words digital sustainability.', 'rascunho'),
  ('/institucional/selo-sustentabilidade.webp', 'es', 'Sello verde con el planeta y la frase sostenibilidad digital.', 'rascunho'),
  ('/institucional/selo-sustentabilidade.webp', 'fr', 'Sceau vert avec la planète et la formule durabilité numérique.', 'rascunho')
on conflict (path, locale) do nothing;

insert into chrome_label (locale, group_id, key, text) values
  ('en', 'home', 'tiles.calculators.20.file', 'calculo-rescisao.html'),
  ('en', 'home', 'tiles.calculators.20.title', 'Severance pay calculator (Nursing)'),
  ('en', 'home', 'tiles.calculators.20.text', 'Calculate the amount of your contract severance.'),
  ('es', 'home', 'tiles.calculators.20.file', 'calculo-rescisao.html'),
  ('es', 'home', 'tiles.calculators.20.title', 'Calculadora del valor de la rescisión (Enfermería)'),
  ('es', 'home', 'tiles.calculators.20.text', 'Calcule el valor de su rescisión contractual.'),
  ('fr', 'home', 'tiles.calculators.20.file', 'calculo-rescisao.html'),
  ('fr', 'home', 'tiles.calculators.20.title', 'Calculateur du montant de la rupture de contrat (Soins infirmiers)'),
  ('fr', 'home', 'tiles.calculators.20.text', 'Calculez le montant de votre rupture de contrat.')
on conflict (locale, group_id, key) do nothing;


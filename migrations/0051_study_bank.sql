-- Treino publicado. Cada alternativa é uma linha, não uma lista na questão.

create table if not exists study_item (
  id text primary key,
  kind text not null check (kind in ('question', 'card')),
  position integer not null,
  prompt text not null,
  detail text not null default '',
  answer_index integer not null default 0
);

insert into study_item (id, kind, position, prompt, detail, answer_index) values
('SIM-PUB-1', 'question', 1, 'Na Escala de Braden, um escore menor indica', '', 1),
('SIM-PUB-2', 'question', 2, 'Na Morse, 50 pontos indicam', '', 2),
('SIM-PUB-3', 'question', 3, 'Um Apgar 8, neste template, cai em', '', 2),
('SIM-PUB-4', 'question', 4, '500 mL em 2 horas, equipo de macrogotas (fator 20), ficam em cerca de', '', 0),
('SIM-PUB-5', 'question', 5, 'IMC 24 kg/m² no adulto, neste template, é', '', 1),
('FC-PUB-1', 'card', 1, 'Braden', 'De 6 a 23. Quanto menor o escore, maior o risco de lesão por pressão.', 0),
('FC-PUB-2', 'card', 2, 'Morse', 'Até 24 é risco baixo. De 25 a 44, médio. A partir de 45, alto.', 0),
('FC-PUB-3', 'card', 3, 'Apgar', 'O minuto da avaliação não entra na soma. De 7 a 10 é boa vitalidade neste template.', 0),
('FC-PUB-4', 'card', 4, 'Gotejamento', 'Gotas por minuto = (volume em mL × fator do equipo) ÷ tempo em minutos.', 0),
('FC-PUB-5', 'card', 5, 'Equipo', 'Macrogotas usa fator 20. Microgotas usa fator 60. Trocar o equipo exige novo cálculo.', 0),
('FC-PUB-6', 'card', 6, 'IMC adulto', 'Peso em kg dividido pela altura em metros ao quadrado. Não use a faixa adulta em criança.', 0)
on conflict (id) do nothing;

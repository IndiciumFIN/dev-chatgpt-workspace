-- Fichas das cinco ferramentas do catálogo. Sem escala nova.

-- Capas. No conflito, só categoria e modo NANDA. Título e texto já gravados ficam.
insert into source_tool (slug, kind, title, lead, published, category, nanda_mode)
values
  (
    'braden',
    'escala',
    'Escala de Braden',
    'Estima o risco de lesão por pressão a partir de seis fatores. O escore vai de 6 a 23. Quanto menor, maior o risco.',
    true,
    'Lesão por pressão',
    'sugerir'
  ),
  (
    'morse',
    'escala',
    'Escala de Morse',
    'Estima o risco de queda no adulto hospitalizado. Os pesos não são sequenciais: use o valor indicado em cada item.',
    true,
    'Segurança do paciente',
    'sugerir'
  ),
  (
    'apgar',
    'escala',
    'Escala de Apgar',
    'Avalia o recém-nascido no 1º e no 5º minuto. Cada sinal vale 0, 1 ou 2. O total vai de 0 a 10.',
    true,
    'Neonatologia',
    'sugerir'
  ),
  (
    'gotejamento',
    'calculadora',
    'Calculadora de gotejamento',
    'Converte volume e tempo em mL/hora e em gotas por minuto, conforme o equipo escolhido.',
    true,
    'Terapia infusional',
    'nao-fechar'
  ),
  (
    'imc',
    'calculadora',
    'Cálculo de IMC',
    'Índice de massa corporal para adulto: peso dividido pelo quadrado da altura. Os cortes abaixo são os da Organização Mundial da Saúde para adultos.',
    true,
    'Antropometria',
    'nao-fechar'
  )
on conflict (slug) do update
set category = excluded.category,
    nanda_mode = excluded.nanda_mode;

-- Braden: seis critérios.
insert into tool_criterion (tool_slug, id, label, help, position)
values
  ('braden', 'sensorial', 'Percepção sensorial', 'Capacidade de reagir ao desconforto.', 1),
  ('braden', 'umidade', 'Umidade', 'Grau em que a pele fica exposta à umidade.', 2),
  ('braden', 'atividade', 'Atividade', 'Grau de atividade física.', 3),
  ('braden', 'mobilidade', 'Mobilidade', 'Capacidade de mudar e controlar a posição do corpo.', 4),
  ('braden', 'nutricao', 'Nutrição', 'Padrão habitual de ingestão alimentar.', 5),
  ('braden', 'friccao', 'Fricção e cisalhamento', 'Atrito da pele contra a superfície.', 6)
on conflict do nothing;

insert into tool_choice (tool_slug, criterion_id, value, label, position)
values
  ('braden', 'sensorial', 1, 'Completamente limitada', 1),
  ('braden', 'sensorial', 2, 'Muito limitada', 2),
  ('braden', 'sensorial', 3, 'Levemente limitada', 3),
  ('braden', 'sensorial', 4, 'Nenhuma limitação', 4),
  ('braden', 'umidade', 1, 'Completamente molhada', 1),
  ('braden', 'umidade', 2, 'Muito molhada', 2),
  ('braden', 'umidade', 3, 'Ocasionalmente molhada', 3),
  ('braden', 'umidade', 4, 'Raramente molhada', 4),
  ('braden', 'atividade', 1, 'Acamado', 1),
  ('braden', 'atividade', 2, 'Confinado à cadeira', 2),
  ('braden', 'atividade', 3, 'Anda ocasionalmente', 3),
  ('braden', 'atividade', 4, 'Anda frequentemente', 4),
  ('braden', 'mobilidade', 1, 'Completamente imóvel', 1),
  ('braden', 'mobilidade', 2, 'Muito limitado', 2),
  ('braden', 'mobilidade', 3, 'Levemente limitado', 3),
  ('braden', 'mobilidade', 4, 'Nenhuma limitação', 4),
  ('braden', 'nutricao', 1, 'Muito pobre', 1),
  ('braden', 'nutricao', 2, 'Provavelmente inadequada', 2),
  ('braden', 'nutricao', 3, 'Adequada', 3),
  ('braden', 'nutricao', 4, 'Excelente', 4),
  ('braden', 'friccao', 1, 'Problema', 1),
  ('braden', 'friccao', 2, 'Problema em potencial', 2),
  ('braden', 'friccao', 3, 'Nenhum problema aparente', 3)
on conflict do nothing;

insert into tool_band (tool_slug, min_score, max_score, label, tone, note)
values
  ('braden', 6, 9, 'Risco muito alto', 'danger', 'Reavalie com frequência e acione o protocolo institucional de prevenção.'),
  ('braden', 10, 12, 'Risco alto', 'danger', 'Intensifique mudança de decúbito, proteção de proeminências e revisão da umidade.'),
  ('braden', 13, 14, 'Risco moderado', 'warn', 'Mantenha o plano de prevenção e reavalie se o quadro mudar.'),
  ('braden', 15, 18, 'Risco baixo', 'info', 'Risco presente, porém menor. Continue a inspeção da pele.'),
  ('braden', 19, 23, 'Sem risco', 'ok', 'Sem risco pela Braden neste momento. Reavalie se houver piora clínica.')
on conflict do nothing;

-- Sem NANDA na faixa 19.
insert into tool_band_nanda (tool_slug, min_score, label)
values
  ('braden', 6, 'Risco de lesão por pressão'),
  ('braden', 6, 'Mobilidade física prejudicada'),
  ('braden', 10, 'Risco de lesão por pressão'),
  ('braden', 10, 'Integridade da pele prejudicada'),
  ('braden', 13, 'Risco de lesão por pressão'),
  ('braden', 15, 'Risco de lesão por pressão')
on conflict do nothing;

insert into tool_step (tool_slug, position, body)
values
  ('braden', 1, 'Escolha um item em cada fator. Não deixe critério em branco.'),
  ('braden', 2, 'Some os pontos. O máximo é 23 e o mínimo é 6.'),
  ('braden', 3, 'Leia a faixa e registre o escore no prontuário, junto com a data e o setor.')
on conflict do nothing;

insert into tool_faq (tool_slug, position, question, answer)
values
  ('braden', 1, 'Um escore alto é melhor?', 'Sim. Na Braden, quanto maior o escore, menor o risco.'),
  ('braden', 2, 'Posso calcular com um critério faltando?', 'Não. O template só mostra o escore quando os seis fatores estão preenchidos.')
on conflict do nothing;

insert into tool_reference (tool_slug, position, citation)
values
  ('braden', 1, 'Braden B, Bergstrom N. A conceptual schema for the study of the etiology of pressure sores. Rehabilitation Nursing. 1987 on conflict do nothing;12(1):8-12.'),
  ('braden', 2, 'Paranhos WY, Santos VLCG. Avaliação de risco para úlceras de pressão por meio da escala de Braden, na língua portuguesa. Rev Esc Enferm USP. 1999;33(esp):191-206.')
on conflict do nothing;

insert into tool_related (tool_slug, related_slug, position)
values
  ('braden', 'morse', 1),
  ('braden', 'gotejamento', 2),
  ('braden', 'imc', 3)
on conflict do nothing;

-- Morse: pesos do instrumento, não uma sequência.
insert into tool_criterion (tool_slug, id, label, help, position)
values
  ('morse', 'quedas', 'Histórico de quedas', 'Queda nos últimos 3 meses.', 1),
  ('morse', 'diagnostico', 'Diagnóstico secundário', 'Mais de um diagnóstico médico.', 2),
  ('morse', 'auxilio', 'Auxílio na deambulação', 'Como a pessoa se desloca.', 3),
  ('morse', 'venoso', 'Terapia endovenosa', 'Acesso venoso ou dispositivo heparinizado.', 4),
  ('morse', 'marcha', 'Marcha', 'Modo de andar.', 5),
  ('morse', 'mental', 'Estado mental', 'Percepção da própria capacidade.', 6)
on conflict do nothing;

insert into tool_choice (tool_slug, criterion_id, value, label, position)
values
  ('morse', 'quedas', 0, 'Não', 1),
  ('morse', 'quedas', 25, 'Sim', 2),
  ('morse', 'diagnostico', 0, 'Não', 1),
  ('morse', 'diagnostico', 15, 'Sim', 2),
  ('morse', 'auxilio', 0, 'Nenhum, acamado ou auxílio da enfermagem', 1),
  ('morse', 'auxilio', 15, 'Muletas, bengala ou andador', 2),
  ('morse', 'auxilio', 30, 'Apoia-se na mobília', 3),
  ('morse', 'venoso', 0, 'Não', 1),
  ('morse', 'venoso', 20, 'Sim', 2),
  ('morse', 'marcha', 0, 'Normal, acamado ou cadeira de rodas', 1),
  ('morse', 'marcha', 10, 'Fraca', 2),
  ('morse', 'marcha', 20, 'Comprometida', 3),
  ('morse', 'mental', 0, 'Orientado quanto à capacidade', 1),
  ('morse', 'mental', 15, 'Esquece as limitações', 2)
on conflict do nothing;

insert into tool_band (tool_slug, min_score, max_score, label, tone, note)
values
  ('morse', 0, 24, 'Risco baixo', 'ok', 'Mantenha as precauções básicas de queda.'),
  ('morse', 25, 44, 'Risco médio', 'warn', 'Reforce orientação, campainha ao alcance e ambiente livre.'),
  ('morse', 45, 125, 'Risco alto', 'danger', 'Aplique o protocolo institucional de alto risco de queda.')
on conflict do nothing;

-- Sem NANDA na faixa 0.
insert into tool_band_nanda (tool_slug, min_score, label)
values
  ('morse', 25, 'Risco de queda'),
  ('morse', 45, 'Risco de queda'),
  ('morse', 45, 'Mobilidade física prejudicada')
on conflict do nothing;

insert into tool_step (tool_slug, position, body)
values
  ('morse', 1, 'Marque uma opção em cada item, com o peso já impresso.'),
  ('morse', 2, 'Some os pesos. O escore não vai de 1 em 1.'),
  ('morse', 3, 'Baixo: 0 a 24. Médio: 25 a 44. Alto: 45 ou mais.')
on conflict do nothing;

insert into tool_faq (tool_slug, position, question, answer)
values
  ('morse', 1, 'Por que os pontos pulam de 0 para 25?', 'A Morse usa pesos diferentes por fator. Não converta para uma escala de 0 a 4.'),
  ('morse', 2, 'Serve para criança?', 'Não. Esta versão é a do adulto hospitalizado. Pediatria pede instrumento próprio.')
on conflict do nothing;

insert into tool_reference (tool_slug, position, citation)
values
  ('morse', 1, 'Morse JM, Morse RM, Tylko SJ. Development of a scale to identify the fall-prone patient. Can J Aging. 1989 on conflict do nothing;8(4):366-377.')
on conflict do nothing;

insert into tool_related (tool_slug, related_slug, position)
values
  ('morse', 'braden', 1),
  ('morse', 'apgar', 2),
  ('morse', 'imc', 3)
on conflict do nothing;

-- Apgar: momento fora do escore.
insert into tool_meta (tool_slug, id, label, position)
values
  ('apgar', 'momento', 'Momento', 1)
on conflict do nothing;

insert into tool_meta_option (tool_slug, meta_id, value, label, position)
values
  ('apgar', 'momento', '1', '1º minuto', 1),
  ('apgar', 'momento', '5', '5º minuto', 2),
  ('apgar', 'momento', '10', '10º minuto', 3)
on conflict do nothing;

insert into tool_criterion (tool_slug, id, label, help, position)
values
  ('apgar', 'fc', 'Frequência cardíaca', 'Batimentos por minuto.', 1),
  ('apgar', 'resp', 'Respiração', 'Esforço respiratório.', 2),
  ('apgar', 'tonus', 'Tônus muscular', 'Atividade.', 3),
  ('apgar', 'reflexo', 'Irritabilidade reflexa', 'Resposta ao estímulo.', 4),
  ('apgar', 'cor', 'Cor', 'Coloração da pele.', 5)
on conflict do nothing;

insert into tool_choice (tool_slug, criterion_id, value, label, position)
values
  ('apgar', 'fc', 0, 'Ausente', 1),
  ('apgar', 'fc', 1, 'Abaixo de 100', 2),
  ('apgar', 'fc', 2, '100 ou mais', 3),
  ('apgar', 'resp', 0, 'Ausente', 1),
  ('apgar', 'resp', 1, 'Irregular ou lenta', 2),
  ('apgar', 'resp', 2, 'Regular, choro forte', 3),
  ('apgar', 'tonus', 0, 'Flácido', 1),
  ('apgar', 'tonus', 1, 'Alguma flexão', 2),
  ('apgar', 'tonus', 2, 'Movimentos ativos', 3),
  ('apgar', 'reflexo', 0, 'Sem resposta', 1),
  ('apgar', 'reflexo', 1, 'Careta', 2),
  ('apgar', 'reflexo', 2, 'Choro, tosse ou espirro', 3),
  ('apgar', 'cor', 0, 'Cianótico ou pálido', 1),
  ('apgar', 'cor', 1, 'Corpo róseo, extremidades cianóticas', 2),
  ('apgar', 'cor', 2, 'Totalmente róseo', 3)
on conflict do nothing;

insert into tool_band (tool_slug, min_score, max_score, label, tone, note)
values
  ('apgar', 0, 3, 'Depressão grave', 'danger', 'Sinal de alerta. Siga o protocolo de reanimação neonatal da instituição.'),
  ('apgar', 4, 6, 'Depressão moderada', 'warn', 'Necessita apoio e reavaliação no próximo minuto previsto.'),
  ('apgar', 7, 10, 'Boa vitalidade', 'ok', 'Boa adaptação neste momento. Mantenha a observação de rotina.')
on conflict do nothing;

-- Sem NANDA na faixa 7.
insert into tool_band_nanda (tool_slug, min_score, label)
values
  ('apgar', 0, 'Troca de gases prejudicada'),
  ('apgar', 0, 'Padrão respiratório ineficaz'),
  ('apgar', 4, 'Padrão respiratório ineficaz')
on conflict do nothing;

insert into tool_step (tool_slug, position, body)
values
  ('apgar', 1, 'Marque o momento da avaliação antes de pontuar.'),
  ('apgar', 2, 'Dê 0, 1 ou 2 a cada um dos cinco sinais.'),
  ('apgar', 3, 'Repita a escala no minuto seguinte quando o protocolo pedir. Não reaproveite o escore anterior.')
on conflict do nothing;

insert into tool_faq (tool_slug, position, question, answer)
values
  ('apgar', 1, 'O Apgar decide sozinho a reanimação?', 'Não. Ele descreve a condição. A conduta segue o protocolo neonatal e a equipe presente.'),
  ('apgar', 2, 'Por que o momento fica separado do escore?', '1º, 5º e 10º minuto são registros diferentes. O template não mistura esses valores.')
on conflict do nothing;

insert into tool_reference (tool_slug, position, citation)
values
  ('apgar', 1, 'Apgar V. A proposal for a new method of evaluation of the newborn infant. Curr Res Anesth Analg. 1953 on conflict do nothing;32(4):260-267.')
on conflict do nothing;

insert into tool_related (tool_slug, related_slug, position)
values
  ('apgar', 'braden', 1),
  ('apgar', 'imc', 2),
  ('apgar', 'morse', 3)
on conflict do nothing;

-- Gotejamento: campos numéricos e equipo.
insert into tool_field (tool_slug, id, label, unit, min_value, max_value, step, position)
values
  ('gotejamento', 'volume', 'Volume', 'mL', 1, 10000, 1, 1),
  ('gotejamento', 'horas', 'Horas', 'h', 0, 168, 1, 2),
  ('gotejamento', 'minutos', 'Minutos', 'min', 0, 59, 1, 3)
on conflict do nothing;

insert into tool_select (tool_slug, id, label, position)
values
  ('gotejamento', 'fator', 'Equipo', 1)
on conflict do nothing;

insert into tool_select_option (tool_slug, select_id, value, label, position)
values
  ('gotejamento', 'fator', 20, 'Macrogotas (20 gotas/mL)', 1),
  ('gotejamento', 'fator', 60, 'Microgotas (60 gotas/mL)', 2)
on conflict do nothing;

insert into tool_output (tool_slug, id, label, unit, digits, position)
values
  ('gotejamento', 'mlh', 'Velocidade', 'mL/h', 1, 1),
  ('gotejamento', 'gotas', 'Gotejamento', 'gotas/min', 0, 2)
on conflict do nothing;

insert into tool_step (tool_slug, position, body)
values
  ('gotejamento', 1, 'Informe o volume prescrito e o tempo de infusão.'),
  ('gotejamento', 2, 'Escolha o equipo que está na bancada. Macrogotas usa fator 20. Microgotas usa fator 60.'),
  ('gotejamento', 3, 'Gotas por minuto = (volume × fator) ÷ minutos. mL/hora = volume ÷ horas.')
on conflict do nothing;

insert into tool_faq (tool_slug, position, question, answer)
values
  ('gotejamento', 1, 'Posso trocar macro por micro sem recalcular?', 'Não. O fator muda o número de gotas. Recalcule depois de trocar o equipo.'),
  ('gotejamento', 2, 'O resultado substitui a bomba?', 'Não. Se a prescrição pede bomba de infusão, use a bomba. Este cálculo confere o gotejo gravitacional.')
on conflict do nothing;

insert into tool_reference (tool_slug, position, citation)
values
  ('gotejamento', 1, 'Fórmula clássica de gotejamento: gotas/min = (volume em mL × fator do equipo) / tempo em minutos.')
on conflict do nothing;

insert into tool_related (tool_slug, related_slug, position)
values
  ('gotejamento', 'imc', 1),
  ('gotejamento', 'braden', 2),
  ('gotejamento', 'morse', 3)
on conflict do nothing;

-- IMC: peso, altura e cortes da OMS. Sem NANDA.
insert into tool_field (tool_slug, id, label, unit, min_value, max_value, step, position)
values
  ('imc', 'peso', 'Peso', 'kg', 1, 400, 0.1, 1),
  ('imc', 'altura', 'Altura', 'cm', 50, 250, 1, 2)
on conflict do nothing;

insert into tool_output (tool_slug, id, label, unit, digits, position)
values
  ('imc', 'imc', 'IMC', 'kg/m²', 1, 1)
on conflict do nothing;

insert into tool_band (tool_slug, min_score, max_score, label, tone, note)
values
  ('imc', 0, 18.49, 'Baixo peso', 'info', 'Abaixo de 18,5 kg/m². Interprete junto com a avaliação clínica.'),
  ('imc', 18.5, 24.99, 'Adequado', 'ok', 'Faixa de 18,5 a 24,9 kg/m² para o adulto.'),
  ('imc', 25, 29.99, 'Sobrepeso', 'warn', 'Faixa de 25 a 29,9 kg/m².'),
  ('imc', 30, 34.99, 'Obesidade I', 'warn', 'Faixa de 30 a 34,9 kg/m².'),
  ('imc', 35, 39.99, 'Obesidade II', 'danger', 'Faixa de 35 a 39,9 kg/m².'),
  ('imc', 40, 200, 'Obesidade III', 'danger', 'Igual ou acima de 40 kg/m².')
on conflict do nothing;

insert into tool_step (tool_slug, position, body)
values
  ('imc', 1, 'Use peso em quilogramas e altura em centímetros.'),
  ('imc', 2, 'IMC = peso / (altura em metros)².'),
  ('imc', 3, 'Não use estes cortes em criança, gestante ou idoso sem a referência própria.')
on conflict do nothing;

insert into tool_faq (tool_slug, position, question, answer)
values
  ('imc', 1, 'O IMC fecha um diagnóstico de enfermagem?', 'Não. Ele descreve a relação peso-altura. O template não sugere NANDA a partir só deste número.'),
  ('imc', 2, 'E se a altura estiver em metros?', 'Converta para centímetros. 1,70 m = 170 cm.')
on conflict do nothing;

insert into tool_reference (tool_slug, position, citation)
values
  ('imc', 1, 'World Health Organization. Obesity: preventing and managing the global epidemic. Geneva: WHO on conflict do nothing; 2000. Cortes de IMC para adultos.')
on conflict do nothing;

insert into tool_related (tool_slug, related_slug, position)
values
  ('imc', 'gotejamento', 1),
  ('imc', 'braden', 2),
  ('imc', 'apgar', 3)
on conflict do nothing;

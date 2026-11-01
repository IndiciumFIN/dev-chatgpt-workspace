-- Políticas para aprovação. Não certificam e não nascem aprovadas.

insert into governance_item (id, kind, title, body)
values
  (
    'politica-coso',
    'politica',
    'Controle interno, no modelo COSO',
    'Adotamos os cinco componentes como obrigação, não como auditoria concluída. Ambiente de controle: só o administrador escreve e a aprovação é sua. Avaliação de risco: os riscos deste módulo permanecem visíveis até você aprová-los. Atividade de controle: papel no servidor, consulta com parâmetro e trava da publicação. Informação: a trilha guarda quem alterou. Monitoramento: não há revisão periódica. Aprovar esta política assume essa lacuna. Não é parecer COSO.'
  ),
  (
    'politica-cobit',
    'politica',
    'Governança de TI, no modelo COBIT',
    'Você avalia e dirige ao aprovar estes itens. O planejamento cabe nos objetivos, no escopo e nos riscos. A mudança de fonte passa pelo administrador e fica na trilha. A entrega depende da sessão e da cópia de conteúdo. Não medimos capacidade de processo e não cobrimos os objetivos do COBIT. Aprovar assume o recorte. Não é avaliação COBIT.'
  ),
  (
    'politica-ia',
    'politica',
    'Inteligência artificial, no recorte COSO',
    'A conta das escalas e calculadoras é fórmula fixa, não modelo. É proibido enviar paciente, escore ou rascunho clínico a um modelo. Um recurso de IA só entra com inventário, finalidade, supervisão humana e a sua aprovação neste módulo. Hoje esse inventário não existe. Aprovar não declara controle de IA implantado.'
  ),
  (
    'politica-27001',
    'politica',
    'Segurança da informação, ISO/IEC 27001 e 27002',
    'Obrigação: dado mínimo, acesso de administrador, sessão, trilha e cópia do conteúdo. Não há sistema de gestão certificado, dono externo, gestão de incidente, classificação formal além desta lista nem fornecedor avaliado. Aprovar esta política não emite certificado ISO/IEC 27001.'
  ),
  (
    'politica-25010',
    'politica',
    'Qualidade de produto, ISO/IEC 25010',
    'Medimos correção do motor, a migration repetida e a restauração do conteúdo. Não medimos as oito características do modelo. Acessibilidade da faixa, do menu, do formulário e do resultado continua aberta. Aprovar não declara produto conforme.'
  ),
  (
    'politica-38500',
    'politica',
    'Governança corporativa de TI, ISO/IEC 38500',
    'A responsabilidade de aprovar é sua. O administrador executa. Cada política diz o que já vale e o que falta. Não há conselho, delegação formal nem ciclo de avaliação. Aprovar não declara governança corporativa conforme.'
  ),
  (
    'politica-escopo-normativo',
    'politica',
    'Escopo normativo de TI',
    'Entram, como obrigação e não como certificado: COSO, COBIT no recorte acima, COSO aplicado a IA, ISO/IEC 27001, 27002, 25010 e 38500. Não entram neste ato: as demais normas ISO, ISO/IEC 20000, ISO 22301, NIST, ITIL, FHIR, openEHR e as normas de dispositivo médico. Incluir outra norma exige outro item, em rascunho, para a sua aprovação.'
  )
on conflict (id) do nothing;

-- CANDIDATE ONLY — Career + Youth DB-first model.
-- Local PGLite only. No remote DB, no personal identifiers, no destructive SQL.

create table if not exists career_projection_candidate (
  id text primary key,
  route_slug text not null unique,
  title text not null,
  lead text not null,
  audience text not null check (audience in ('PROFESSIONAL','YOUTH')),
  status text not null check (status in ('CANDIDATE','HOLD_HUMAN'))
);

create table if not exists career_module_candidate (
  id text primary key,
  slug text not null unique,
  title text not null,
  description text not null,
  object_class text not null check (object_class in ('FUNCTIONAL','EDITORIAL','HYBRID')),
  audience text not null check (audience in ('PROFESSIONAL','YOUTH','BOTH')),
  family text not null,
  status text not null check (status in ('CANDIDATE','HOLD_HUMAN')),
  sort_order integer not null default 0
);

create table if not exists career_projection_item_candidate (
  projection_id text not null references career_projection_candidate(id),
  module_id text not null references career_module_candidate(id),
  sort_order integer not null default 0,
  primary key (projection_id,module_id)
);

create table if not exists career_role_candidate (
  id text primary key,
  slug text not null unique,
  title text not null,
  family text not null,
  summary text not null,
  education_path text not null,
  audience text not null check (audience in ('PROFESSIONAL','YOUTH','BOTH')),
  status text not null check (status in ('CANDIDATE','HOLD_HUMAN'))
);

create table if not exists career_skill_candidate (
  id text primary key,
  slug text not null unique,
  name text not null,
  category text not null,
  description text not null,
  status text not null check (status in ('CANDIDATE','HOLD_HUMAN'))
);

create table if not exists career_role_skill_candidate (
  role_id text not null references career_role_candidate(id),
  skill_id text not null references career_skill_candidate(id),
  required_level smallint not null check (required_level between 1 and 5),
  importance text not null check (importance in ('CORE','IMPORTANT','OPTIONAL')),
  primary key (role_id,skill_id)
);

create table if not exists career_path_candidate (
  id text primary key,
  slug text not null unique,
  title text not null,
  summary text not null,
  audience text not null check (audience in ('PROFESSIONAL','YOUTH','BOTH')),
  status text not null check (status in ('CANDIDATE','HOLD_HUMAN'))
);

create table if not exists career_path_step_candidate (
  path_id text not null references career_path_candidate(id),
  step_order integer not null,
  title text not null,
  description text not null,
  object_type text not null,
  object_ref text,
  primary key(path_id,step_order)
);

create table if not exists career_opportunity_type_candidate (
  id text primary key,
  kind text not null unique,
  title text not null,
  description text not null,
  audience text not null check (audience in ('PROFESSIONAL','YOUTH','BOTH')),
  official_source_required boolean not null default true,
  status text not null check (status in ('CANDIDATE','HOLD_HUMAN'))
);

create table if not exists career_credential_candidate (
  id text primary key,
  title text not null,
  category text not null,
  issuer_scope text not null,
  validity_note text not null,
  source_required boolean not null default true,
  status text not null check (status in ('CANDIDATE','HOLD_HUMAN'))
);

create table if not exists career_document_template_candidate (
  id text primary key,
  kind text not null check (kind in ('CV','COVER_LETTER','PORTFOLIO','PROFESSIONAL_SUMMARY')),
  title text not null,
  description text not null,
  audience text not null check (audience in ('PROFESSIONAL','YOUTH','BOTH')),
  status text not null check (status in ('CANDIDATE','HOLD_HUMAN'))
);

create table if not exists career_market_signal_candidate (
  id text primary key,
  metric_key text not null,
  label text not null,
  role_ref text references career_role_candidate(id),
  region text not null default 'BR',
  metric_value numeric,
  unit text,
  source_ref text,
  status text not null check (status in ('SOURCE_REQUIRED','VERIFIED_CANDIDATE'))
);

create table if not exists career_editorial_candidate (
  id text primary key,
  slug text not null unique,
  title text not null,
  dek text not null,
  content_type text not null check (content_type in ('ARTICLE','GUIDE','CAMPAIGN','CHECKLIST','STORY','QUIZ_INTRO')),
  campaign_key text,
  audience text not null check (audience in ('PROFESSIONAL','YOUTH','BOTH')),
  linked_object_type text,
  linked_object_ref text,
  status text not null check (status in ('DRAFT_CANDIDATE','HOLD_HUMAN')),
  sort_order integer not null default 0
);

create table if not exists career_reflection_question_candidate (
  id text primary key,
  prompt text not null,
  dimension text not null,
  weight smallint not null default 1 check (weight between 1 and 5),
  audience text not null check (audience in ('YOUTH','BOTH')),
  status text not null check (status in ('CANDIDATE','HOLD_HUMAN')),
  sort_order integer not null default 0
);

-- Pseudonymous candidate workspace. No name, email, phone, CPF, COREN or other identifiers.
create table if not exists career_profile_candidate (
  participant_key text primary key,
  target_role_id text references career_role_candidate(id),
  stage text not null check (stage in ('EXPLORING','STUDENT','FIRST_JOB','PROFESSIONAL','SPECIALIST','LEADERSHIP','RESEARCH','INTERNATIONAL')),
  goal text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists career_profile_skill_candidate (
  participant_key text not null references career_profile_candidate(participant_key),
  skill_id text not null references career_skill_candidate(id),
  self_level smallint not null check (self_level between 0 and 5),
  updated_at timestamptz not null default now(),
  primary key(participant_key,skill_id)
);

create table if not exists career_application_candidate (
  id text primary key,
  participant_key text not null references career_profile_candidate(participant_key),
  opportunity_kind text not null,
  label text not null,
  stage text not null check (stage in ('SAVED','APPLIED','INTERVIEW','TECHNICAL_STAGE','OFFER','APPROVED','DECLINED','CLOSED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists career_profile_credential_candidate (
  participant_key text not null references career_profile_candidate(participant_key),
  credential_id text not null references career_credential_candidate(id),
  state text not null check (state in ('PLANNED','IN_PROGRESS','COMPLETED','RENEWAL_REVIEW')),
  updated_at timestamptz not null default now(),
  primary key(participant_key,credential_id)
);

create table if not exists career_milestone_candidate (
  id text primary key,
  participant_key text not null references career_profile_candidate(participant_key),
  milestone_type text not null,
  label text not null,
  achieved_on date,
  created_at timestamptz not null default now()
);

insert into career_projection_candidate(id,route_slug,title,lead,audience,status) values
('PROJ-CAREER','carreira','Carreira e Desenvolvimento','Do autoconhecimento à evolução profissional: skills, oportunidades, documentos, aplicações, credenciais, mercado e trilhas conectados ao CKO.','PROFESSIONAL','CANDIDATE'),
('PROJ-YOUTH','jovens','Portal do Jovem','Descobrir profissões, entender a Enfermagem, explorar interesses, caminhos de formação, oportunidades e primeiros passos sem transformar orientação em diagnóstico.','YOUTH','CANDIDATE')
on conflict(id) do nothing;

insert into career_module_candidate(id,slug,title,description,object_class,audience,family,status,sort_order) values
('MOD-CAREER-OVERVIEW','visao-geral','Visão geral','Jornada, estado do perfil e próximos passos.','FUNCTIONAL','PROFESSIONAL','orchestration','CANDIDATE',1),
('MOD-PASSPORT','passaporte','Passaporte profissional','Perfil pseudônimo, skills, credenciais, marcos e objetivos.','FUNCTIONAL','PROFESSIONAL','identity','CANDIDATE',2),
('MOD-SKILLS','skills','Skills e gaps','Competências, nível atual, requisitos de papéis e gaps.','FUNCTIONAL','BOTH','intelligence','CANDIDATE',3),
('MOD-PATHS','trilhas','Trilhas de carreira','Caminhos do estudante ao profissional, especialização, liderança, pesquisa e exterior.','FUNCTIONAL','BOTH','learning','CANDIDATE',4),
('MOD-OPPORTUNITIES','oportunidades','Oportunidades','Família única para vagas, estágio, concursos, residência, voluntariado, bolsas, pesquisa, mentoria e exterior.','FUNCTIONAL','BOTH','opportunity','CANDIDATE',5),
('MOD-APPLICATIONS','candidaturas','Application Tracker','Acompanhar processos salvos, candidatura, entrevista, oferta e fechamento.','FUNCTIONAL','PROFESSIONAL','journey','CANDIDATE',6),
('MOD-CREDENTIALS','credenciais','Credenciais e certificações','Planejar, acompanhar e revisar credenciais sem inventar validade ou autoridade.','FUNCTIONAL','PROFESSIONAL','identity','CANDIDATE',7),
('MOD-DOCUMENTS','documentos','Documentos profissionais','Currículo, carta, portfólio e resumo profissional como projeções do passaporte.','FUNCTIONAL','PROFESSIONAL','documents','CANDIDATE',8),
('MOD-INTERVIEW','entrevistas','Entrevistas e presença profissional','Preparação para entrevistas, LinkedIn, apresentação e posicionamento.','HYBRID','PROFESSIONAL','journey','CANDIDATE',9),
('MOD-MARKET','mercado','Mercado e salários','Sinais de mercado somente quando houver fonte atual verificável.','FUNCTIONAL','BOTH','intelligence','CANDIDATE',10),
('MOD-WORKLIFE','vida-profissional','Vida profissional','Direitos, escalas, negociação, bem-estar e organização do trabalho.','HYBRID','PROFESSIONAL','professional-life','CANDIDATE',11),
('MOD-NETWORK','rede','Networking e mentoria','Conexões, mentoria, comunidades, grupos e desenvolvimento.','FUNCTIONAL','PROFESSIONAL','network','CANDIDATE',12),
('MOD-INTERNATIONAL','exterior','Carreira internacional','Idioma, reconhecimento, registro e preparação por jurisdição.','HYBRID','PROFESSIONAL','international','CANDIDATE',13),
('MOD-EDITORIAL','conteudos-carreira','Conteúdos e campanhas','Guias, histórias, campanhas e checklists editoriais ligados aos objetos canônicos.','EDITORIAL','PROFESSIONAL','editorial','CANDIDATE',14),
('MOD-YOUTH-DISCOVER','descobrir','Descobrir profissões','Explorar áreas, rotinas, formação e possibilidades.','HYBRID','YOUTH','youth','CANDIDATE',1),
('MOD-YOUTH-NURSING','enfermagem-carreira','Enfermagem como carreira','Entender caminhos formativos e trajetórias possíveis.','HYBRID','YOUTH','youth','CANDIDATE',2),
('MOD-YOUTH-REFLECT','autoconhecimento','Explorar interesses','Reflexão educativa por interesses on conflict do nothing; não é teste psicométrico.','FUNCTIONAL','YOUTH','youth','CANDIDATE',3),
('MOD-YOUTH-FIRST','primeiros-passos','Primeiros passos','Estágio, voluntariado, residência, concursos e preparação inicial.','HYBRID','YOUTH','youth','CANDIDATE',4),
('MOD-YOUTH-GAMES','jogos-quizzes','Jogos e quizzes','Experiências educativas conectadas ao mesmo conteúdo canônico.','EDITORIAL','YOUTH','youth','CANDIDATE',5),
('MOD-YOUTH-EDITORIAL','conteudos-jovens','Conteúdos para jovens','Guias e histórias projetados para o público jovem.','EDITORIAL','YOUTH','youth','CANDIDATE',6)
on conflict(id) do nothing;

insert into career_projection_item_candidate(projection_id,module_id,sort_order)
select 'PROJ-CAREER',id,sort_order from career_module_candidate where audience in ('PROFESSIONAL','BOTH')
on conflict do nothing;
insert into career_projection_item_candidate(projection_id,module_id,sort_order)
select 'PROJ-YOUTH',id,sort_order from career_module_candidate where audience in ('YOUTH','BOTH')
on conflict do nothing;

insert into career_role_candidate(id,slug,title,family,summary,education_path,audience,status) values
('ROLE-TECH','tecnico-enfermagem','Técnico de Enfermagem','assistencial','Atuação técnica em diferentes contextos de cuidado, dentro das atribuições profissionais aplicáveis.','Formação e registro profissional compatíveis com a jurisdição e função.','BOTH','CANDIDATE'),
('ROLE-NURSE','enfermeiro','Enfermeiro','assistencial','Trajetória generalista com possibilidades clínicas, gestão, educação e pesquisa.','Graduação e registro profissional compatíveis com a jurisdição.','BOTH','CANDIDATE'),
('ROLE-ICU','enfermagem-uti','Enfermagem em UTI','especialidade','Trajetória voltada a contextos de alta complexidade e trabalho multiprofissional.','Formação profissional, experiência e requisitos específicos conforme instituição/jurisdição.','BOTH','CANDIDATE'),
('ROLE-EMERGENCY','urgencia-emergencia','Urgência e Emergência','especialidade','Trajetória voltada a ambientes de resposta rápida e organização do cuidado.','Requisitos variam por instituição, cargo e jurisdição.','BOTH','CANDIDATE'),
('ROLE-OR','centro-cirurgico','Centro Cirúrgico','especialidade','Trajetória em ambientes perioperatórios, processos, segurança e integração de equipe.','Requisitos variam por instituição, cargo e jurisdição.','BOTH','CANDIDATE'),
('ROLE-APS','atencao-primaria','Atenção Primária','especialidade','Trajetória em promoção, prevenção, acompanhamento e articulação em rede.','Requisitos variam por instituição, cargo e jurisdição.','BOTH','CANDIDATE'),
('ROLE-AUDIT','auditoria-enfermagem','Auditoria em Enfermagem','gestao','Trajetória em análise, conformidade, qualidade, contas e processos.','Experiência e formação complementar podem ser requeridas conforme oportunidade.','PROFESSIONAL','CANDIDATE'),
('ROLE-MANAGEMENT','gestao-enfermagem','Gestão em Enfermagem','gestao','Trajetória em liderança, pessoas, indicadores, qualidade e operações.','Requisitos variam conforme escopo de liderança e instituição.','PROFESSIONAL','CANDIDATE'),
('ROLE-EDU','docencia-enfermagem','Docência e Educação','educacao','Trajetória em ensino, preceptoria, educação permanente e produção educacional.','Requisitos acadêmicos variam conforme instituição e função.','BOTH','CANDIDATE'),
('ROLE-RESEARCH','pesquisa-enfermagem','Pesquisa em Enfermagem','pesquisa','Trajetória em investigação, métodos, evidências, produção científica e implementação.','Formação e requisitos éticos/institucionais variam conforme projeto e papel.','BOTH','CANDIDATE')
on conflict(id) do nothing;

insert into career_skill_candidate(id,slug,name,category,description,status) values
('SK-COMM','comunicacao','Comunicação profissional','transversal','Comunicar com clareza, adaptar linguagem e registrar informações de forma adequada.','CANDIDATE'),
('SK-TEAM','trabalho-equipe','Trabalho em equipe','transversal','Colaborar com equipes e lidar com responsabilidades compartilhadas.','CANDIDATE'),
('SK-SAFETY','seguranca-paciente','Segurança do paciente','profissional','Reconhecer práticas, riscos e responsabilidades relacionadas à segurança.','CANDIDATE'),
('SK-CLINICAL','raciocinio-clinico','Raciocínio clínico','profissional','Organizar informações e apoiar tomada de decisão dentro do escopo profissional.','CANDIDATE'),
('SK-DIGITAL','literacia-digital','Literacia digital','digital','Usar ferramentas digitais, dados e tecnologia de forma crítica e segura.','CANDIDATE'),
('SK-LEAD','lideranca','Liderança','gestao','Organizar trabalho, pessoas, prioridades e comunicação de equipe.','CANDIDATE'),
('SK-QI','qualidade','Qualidade e melhoria','gestao','Trabalhar com processos, indicadores, melhoria e aprendizagem organizacional.','CANDIDATE'),
('SK-EVIDENCE','evidencias','Prática baseada em evidências','pesquisa','Localizar, avaliar e aplicar evidências respeitando contexto e limitações.','CANDIDATE'),
('SK-RESEARCH','metodos-pesquisa','Métodos de pesquisa','pesquisa','Planejar e compreender desenhos, coleta, análise, ética e reprodutibilidade.','CANDIDATE'),
('SK-TEACH','educacao','Educação e preceptoria','educacao','Apoiar aprendizagem, feedback e desenvolvimento de outras pessoas.','CANDIDATE')
on conflict(id) do nothing;

insert into career_role_skill_candidate(role_id,skill_id,required_level,importance) values
('ROLE-NURSE','SK-COMM',4,'CORE'),('ROLE-NURSE','SK-TEAM',4,'CORE'),('ROLE-NURSE','SK-SAFETY',4,'CORE'),('ROLE-NURSE','SK-DIGITAL',3,'IMPORTANT'),
('ROLE-ICU','SK-SAFETY',5,'CORE'),('ROLE-ICU','SK-TEAM',5,'CORE'),('ROLE-ICU','SK-CLINICAL',5,'CORE'),
('ROLE-MANAGEMENT','SK-LEAD',5,'CORE'),('ROLE-MANAGEMENT','SK-QI',5,'CORE'),('ROLE-MANAGEMENT','SK-COMM',5,'CORE'),
('ROLE-RESEARCH','SK-RESEARCH',5,'CORE'),('ROLE-RESEARCH','SK-EVIDENCE',5,'CORE'),('ROLE-RESEARCH','SK-COMM',4,'IMPORTANT'),
('ROLE-EDU','SK-TEACH',5,'CORE'),('ROLE-EDU','SK-COMM',5,'CORE'),('ROLE-AUDIT','SK-QI',5,'CORE'),('ROLE-AUDIT','SK-DIGITAL',4,'IMPORTANT')
on conflict do nothing;

insert into career_path_candidate(id,slug,title,summary,audience,status) values
('PATH-ENTRY','entrada-profissao','Da formação ao primeiro emprego','Exploração, formação, preparação documental, oportunidades e entrada profissional.','BOTH','CANDIDATE'),
('PATH-SPECIALIST','especialista','Caminho de especialização','Mapear área-alvo, gaps, experiência, aprendizagem e credenciais sem assumir requisito universal.','PROFESSIONAL','CANDIDATE'),
('PATH-LEAD','lideranca','Carreira em liderança','Desenvolvimento de gestão, qualidade, pessoas e operações.','PROFESSIONAL','CANDIDATE'),
('PATH-RESEARCH','pesquisa','Carreira em pesquisa','Da alfabetização científica à participação em projetos e produção de evidência.','BOTH','CANDIDATE'),
('PATH-INTERNATIONAL','internacional','Carreira internacional','Idioma, documentação, reconhecimento, registro e preparação por jurisdição.','PROFESSIONAL','CANDIDATE')
on conflict(id) do nothing;

insert into career_path_step_candidate(path_id,step_order,title,description,object_type,object_ref) values
('PATH-ENTRY',1,'Explorar possibilidades','Conhecer papéis e contextos sem fechar escolha prematuramente.','MODULE','MOD-YOUTH-DISCOVER'),
('PATH-ENTRY',2,'Construir base de skills','Registrar competências atuais e gaps do papel desejado.','MODULE','MOD-SKILLS'),
('PATH-ENTRY',3,'Preparar documentos','Gerar currículo, carta e portfólio a partir do passaporte.','MODULE','MOD-DOCUMENTS'),
('PATH-ENTRY',4,'Buscar oportunidades','Explorar estágio, vagas, concursos, residência e voluntariado por fontes verificadas.','MODULE','MOD-OPPORTUNITIES'),
('PATH-ENTRY',5,'Acompanhar candidaturas','Registrar etapas e aprendizados sem guardar PII.','MODULE','MOD-APPLICATIONS'),
('PATH-RESEARCH',1,'Fundamentos de evidência','Desenvolver leitura crítica e busca de evidências.','SKILL','SK-EVIDENCE'),
('PATH-RESEARCH',2,'Métodos de pesquisa','Desenvolver competências de desenho, ética, coleta e análise.','SKILL','SK-RESEARCH'),
('PATH-RESEARCH',3,'Participar de projetos','Conectar oportunidades de pesquisa ao Research Hub.','OPPORTUNITY_TYPE','RESEARCH'),
('PATH-INTERNATIONAL',1,'Escolher jurisdição','Definir país/região e verificar regras atuais.','MODULE','MOD-INTERNATIONAL'),
('PATH-INTERNATIONAL',2,'Mapear requisitos','Idioma, equivalência, registro e documentos variam por jurisdição.','MODULE','MOD-CREDENTIALS')
on conflict do nothing;

insert into career_opportunity_type_candidate(id,kind,title,description,audience,official_source_required,status) values
('OPTYPE-JOB','JOB','Vagas de emprego','Oportunidades profissionais publicadas por fonte identificável.','PROFESSIONAL',true,'CANDIDATE'),
('OPTYPE-INTERNSHIP','INTERNSHIP','Estágios','Oportunidades de formação prática e entrada profissional.','YOUTH',true,'CANDIDATE'),
('OPTYPE-PUBLIC','PUBLIC_EXAM','Concursos e processos públicos','Editais e processos com fonte oficial, datas e validade.','BOTH',true,'CANDIDATE'),
('OPTYPE-RESIDENCY','RESIDENCY','Residências','Programas com requisitos, cronograma e fonte oficial.','BOTH',true,'CANDIDATE'),
('OPTYPE-VOL','VOLUNTEERING','Voluntariado','Oportunidades de contribuição e experiência com organização identificada.','BOTH',true,'CANDIDATE'),
('OPTYPE-SCHOLAR','SCHOLARSHIP','Bolsas','Bolsas de estudo e desenvolvimento com critérios verificáveis.','BOTH',true,'CANDIDATE'),
('OPTYPE-RESEARCH','RESEARCH','Pesquisa','Projetos, grupos, iniciação, bolsas e colaboração em pesquisa.','BOTH',true,'CANDIDATE'),
('OPTYPE-MENTOR','MENTORING','Mentoria','Oportunidades estruturadas de mentoria e desenvolvimento.','PROFESSIONAL',true,'CANDIDATE'),
('OPTYPE-INTL','INTERNATIONAL','Internacionais','Oportunidades cuja elegibilidade depende da jurisdição.','PROFESSIONAL',true,'CANDIDATE')
on conflict(id) do nothing;

insert into career_credential_candidate(id,title,category,issuer_scope,validity_note,source_required,status) values
('CRED-REG','Registro profissional','REGISTRATION','Conselho/autoridade competente','Validade e situação devem ser verificadas na autoridade competente.',true,'CANDIDATE'),
('CRED-BLS','BLS','CERTIFICATION','Emissor reconhecido conforme oportunidade','Validade e aceitação dependem do emissor e da instituição.',true,'CANDIDATE'),
('CRED-ACLS','ACLS','CERTIFICATION','Emissor reconhecido conforme oportunidade','Validade e aceitação dependem do emissor e da instituição.',true,'CANDIDATE'),
('CRED-PALS','PALS','CERTIFICATION','Emissor reconhecido conforme oportunidade','Validade e aceitação dependem do emissor e da instituição.',true,'CANDIDATE'),
('CRED-PICC','Capacitação relacionada a PICC','TRAINING','Instituição/autoridade aplicável','Escopo, validade e habilitação não podem ser inferidos pela plataforma.',true,'CANDIDATE')
on conflict(id) do nothing;

insert into career_document_template_candidate(id,kind,title,description,audience,status) values
('DOC-CV-STUDENT','CV','Currículo — estudante / primeiro emprego','Projeção de formação, experiências, competências e objetivos sem inventar experiência.','YOUTH','CANDIDATE'),
('DOC-CV-PRO','CV','Currículo profissional','Projeção do passaporte com experiência, formação, competências e credenciais.','PROFESSIONAL','CANDIDATE'),
('DOC-COVER','COVER_LETTER','Carta de apresentação','Documento adaptável à oportunidade usando somente fatos fornecidos pelo usuário.','PROFESSIONAL','CANDIDATE'),
('DOC-PORTFOLIO','PORTFOLIO','Portfólio de competências','Organiza skills, marcos e credenciais com evidência quando disponível.','PROFESSIONAL','CANDIDATE')
on conflict(id) do nothing;

insert into career_market_signal_candidate(id,metric_key,label,role_ref,region,metric_value,unit,source_ref,status) values
('MKT-SALARY','salary','Faixa salarial verificada',null,'BR',null,'BRL',null,'SOURCE_REQUIRED'),
('MKT-DEMAND','demand','Demanda por oportunidades',null,'BR',null,'index',null,'SOURCE_REQUIRED'),
('MKT-SKILLS','skills-demand','Skills mais citadas em oportunidades',null,'BR',null,'index',null,'SOURCE_REQUIRED')
on conflict(id) do nothing;

insert into career_editorial_candidate(id,slug,title,dek,content_type,campaign_key,audience,linked_object_type,linked_object_ref,status,sort_order) values
('ED-FIRST-SHIFT','meu-primeiro-plantao','Meu Primeiro Plantão','Conteúdo de preparação e acolhimento para a transição ao trabalho profissional.','GUIDE','FIRST_SHIFT','PROFESSIONAL','PATH','PATH-ENTRY','DRAFT_CANDIDATE',1),
('ED-APPROVED','fui-aprovado','Fui Aprovado','Campanha editorial de conquista e continuidade da jornada profissional.','CAMPAIGN','APPROVED','PROFESSIONAL','PATH','PATH-ENTRY','DRAFT_CANDIDATE',2),
('ED-VALUE','valorizacao-enfermagem','Valorização profissional','Conteúdos e histórias sobre desenvolvimento, identidade e reconhecimento da Enfermagem.','CAMPAIGN','PROFESSIONAL_VALUE','PROFESSIONAL','MODULE','MOD-EDITORIAL','DRAFT_CANDIDATE',3),
('ED-YOUTH-WHAT','o-que-faz-enfermagem','O que a Enfermagem faz?','Introdução editorial para jovens sobre possibilidades e contextos profissionais.','ARTICLE','YOUTH_DISCOVERY','YOUTH','ROLE','ROLE-NURSE','DRAFT_CANDIDATE',1),
('ED-YOUTH-FORM','como-e-a-formacao','Como funciona a formação?','Guia introdutório que deve ser qualificado por fontes educacionais e regulatórias antes de publicação.','GUIDE','YOUTH_DISCOVERY','YOUTH','MODULE','MOD-YOUTH-NURSING','DRAFT_CANDIDATE',2),
('ED-YOUTH-CHOICE','como-explorar-areas','Como explorar áreas sem decidir cedo demais','Conteúdo de orientação para observar interesses, experiências e caminhos.','GUIDE','YOUTH_DISCOVERY','YOUTH','MODULE','MOD-YOUTH-REFLECT','DRAFT_CANDIDATE',3),
('ED-CAREER-Y','carreira-em-y','Carreira em Y','Conteúdo sobre trajetórias de especialização e liderança, sem tratar caminhos como únicos.','ARTICLE','CAREER_PATH','PROFESSIONAL','PATH','PATH-SPECIALIST','DRAFT_CANDIDATE',4),
('ED-NEGOTIATION','negociacao-profissional','Negociação e posicionamento profissional','Conteúdo editorial sobre preparação para conversas de carreira e proposta.','GUIDE','CAREER_MARKET','PROFESSIONAL','MODULE','MOD-MARKET','DRAFT_CANDIDATE',5)
on conflict(id) do nothing;

insert into career_reflection_question_candidate(id,prompt,dimension,weight,audience,status,sort_order) values
('RQ-01','Você se interessa por acompanhar pessoas ao longo do tempo?','CONTINUITY',1,'YOUTH','CANDIDATE',1),
('RQ-02','Você se sente curioso(a) sobre ambientes que exigem resposta rápida?','EMERGENCY',1,'YOUTH','CANDIDATE',2),
('RQ-03','Você gosta de explicar, ensinar ou ajudar alguém a aprender?','EDUCATION',1,'YOUTH','CANDIDATE',3),
('RQ-04','Você gosta de organizar equipes, processos ou projetos?','LEADERSHIP',1,'YOUTH','CANDIDATE',4),
('RQ-05','Você se interessa por perguntas, investigação e produção de conhecimento?','RESEARCH',1,'YOUTH','CANDIDATE',5),
('RQ-06','Você se interessa por promoção de saúde e trabalho em comunidade?','COMMUNITY',1,'YOUTH','CANDIDATE',6),
('RQ-07','Você gosta de tecnologia, dados e ferramentas digitais?','DIGITAL',1,'YOUTH','CANDIDATE',7),
('RQ-08','Você prefere aprender fazendo, observando e praticando em situações reais?','PRACTICAL',1,'YOUTH','CANDIDATE',8)
on conflict(id) do nothing;

create index if not exists idx_career_module_audience on career_module_candidate(audience,sort_order);
create index if not exists idx_career_editorial_audience on career_editorial_candidate(audience,sort_order);
create index if not exists idx_career_role_family on career_role_candidate(family);
create index if not exists idx_career_application_participant on career_application_candidate(participant_key,updated_at);


-- Extended DB-first capabilities recovered from the Career/Youth plan.
create table if not exists career_learning_resource_type_candidate (
  id text primary key,
  kind text not null unique,
  title text not null,
  description text not null,
  source_required boolean not null default true,
  status text not null check (status in ('CANDIDATE','HOLD_HUMAN'))
);

create table if not exists career_interview_scenario_candidate (
  id text primary key,
  kind text not null,
  title text not null,
  description text not null,
  audience text not null check (audience in ('PROFESSIONAL','YOUTH','BOTH')),
  status text not null check (status in ('CANDIDATE','HOLD_HUMAN'))
);

create table if not exists career_network_capability_candidate (
  id text primary key,
  kind text not null,
  title text not null,
  description text not null,
  requires_identity boolean not null default true,
  moderation_required boolean not null default true,
  status text not null check (status in ('CANDIDATE','HOLD_HUMAN'))
);

create table if not exists career_jurisdiction_requirement_candidate (
  id text primary key,
  jurisdiction text not null,
  requirement_kind text not null,
  title text not null,
  description text not null,
  source_ref text,
  status text not null check (status in ('SOURCE_REQUIRED','VERIFIED_CANDIDATE'))
);

create table if not exists career_worklife_capability_candidate (
  id text primary key,
  kind text not null,
  title text not null,
  description text not null,
  normative_source_required boolean not null default true,
  status text not null check (status in ('CANDIDATE','HOLD_HUMAN'))
);

create table if not exists career_youth_activity_candidate (
  id text primary key,
  kind text not null check (kind in ('QUIZ','GAME','CARD_SET','SCENARIO','GUIDED_REFLECTION')),
  title text not null,
  description text not null,
  linked_module_ref text,
  status text not null check (status in ('CANDIDATE','HOLD_HUMAN'))
);

insert into career_module_candidate(id,slug,title,description,object_class,audience,family,status,sort_order) values
('MOD-LEARNING','aprendizagem','Cursos e desenvolvimento','Cursos, certificações, idioma, workshops e educação permanente como tipos de recurso com fonte/validade próprias.','HYBRID','BOTH','learning','CANDIDATE',4),
('MOD-COMPARE','comparador','Comparador de caminhos','Comparar papéis, famílias e skills sem transformar diferenças em ranking de profissões.','FUNCTIONAL','BOTH','intelligence','CANDIDATE',5),
('MOD-ENTREPRENEUR','empreendedorismo','Empreendedorismo','Explorar caminhos profissionais autônomos e projetos sem prometer renda ou substituir orientação jurídica/contábil.','HYBRID','PROFESSIONAL','journey','CANDIDATE',15),
('MOD-YOUTH-HEALTH','saude-jovem','Saúde para jovens','Conteúdos de saúde e cidadania projetados para jovens, governados separadamente do domínio de carreira.','EDITORIAL','YOUTH','youth','CANDIDATE',7)
on conflict(id) do nothing;

insert into career_projection_item_candidate(projection_id,module_id,sort_order)
select 'PROJ-CAREER',id,sort_order from career_module_candidate where audience in ('PROFESSIONAL','BOTH')
on conflict do nothing;
insert into career_projection_item_candidate(projection_id,module_id,sort_order)
select 'PROJ-YOUTH',id,sort_order from career_module_candidate where audience in ('YOUTH','BOTH')
on conflict do nothing;

insert into career_learning_resource_type_candidate(id,kind,title,description,source_required,status) values
('LEARN-FREE','FREE_COURSE','Cursos gratuitos','Cursos e recursos gratuitos cuja disponibilidade e origem precisam ser verificadas.',true,'CANDIDATE'),
('LEARN-PAID','PAID_COURSE','Cursos e especializações','Formação complementar com instituição, carga, modalidade e condições verificáveis.',true,'CANDIDATE'),
('LEARN-CERT','CERTIFICATION','Certificações','Recursos de preparação e certificações ligadas a emissores e requisitos concretos.',true,'CANDIDATE'),
('LEARN-LANG','LANGUAGE','Idiomas e inglês técnico','Recursos de idioma conectados à jornada internacional e profissional.',true,'CANDIDATE'),
('LEARN-CPD','CONTINUING_DEVELOPMENT','Educação permanente','Desenvolvimento contínuo ligado a gaps, objetivos e contexto profissional.',true,'CANDIDATE')
on conflict(id) do nothing;

insert into career_interview_scenario_candidate(id,kind,title,description,audience,status) values
('INT-FIRST','FIRST_JOB','Primeiro emprego','Preparação para apresentar formação, experiências acadêmicas e potencial sem inventar experiência profissional.','BOTH','CANDIDATE'),
('INT-TECH','TECHNICAL','Entrevista técnica','Preparação para raciocinar sobre situações e competências do cargo dentro do escopo permitido.','PROFESSIONAL','CANDIDATE'),
('INT-LEAD','LEADERSHIP','Liderança e gestão','Preparação para discutir pessoas, processos, conflitos, qualidade e resultados com evidências próprias.','PROFESSIONAL','CANDIDATE'),
('INT-RESEARCH','RESEARCH','Pesquisa e academia','Preparação para discutir pergunta, método, ética, evidências e contribuição em projetos.','BOTH','CANDIDATE')
on conflict(id) do nothing;

insert into career_network_capability_candidate(id,kind,title,description,requires_identity,moderation_required,status) values
('NET-MENTOR','MENTORING','Mentoria','Matching e acompanhamento mentor/mentorado requerem identidade, privacidade, regras e moderação.',true,true,'HOLD_HUMAN'),
('NET-NETWORK','NETWORKING','Networking','Conexões profissionais e interesses compartilhados dependem de identidade e controles de abuso.',true,true,'HOLD_HUMAN'),
('NET-GROUP','COMMUNITY_GROUP','Grupos e comunidades','Comunidades por tema, etapa ou objetivo precisam de governança e moderação.',true,true,'HOLD_HUMAN'),
('NET-SQUAD','SQUAD','Squads de desenvolvimento','Pequenos grupos orientados a estudo, carreira ou projetos, dependentes de identidade e regras.',true,true,'HOLD_HUMAN')
on conflict(id) do nothing;

insert into career_jurisdiction_requirement_candidate(id,jurisdiction,requirement_kind,title,description,source_ref,status) values
('JUR-LANG','INTERNATIONAL_GENERIC','LANGUAGE','Idioma','Exigências de idioma variam por país, órgão e empregador.',null,'SOURCE_REQUIRED'),
('JUR-DIPLOMA','INTERNATIONAL_GENERIC','DIPLOMA_RECOGNITION','Reconhecimento de formação','Processos de equivalência/reconhecimento devem vir da autoridade da jurisdição.',null,'SOURCE_REQUIRED'),
('JUR-REG','INTERNATIONAL_GENERIC','PROFESSIONAL_REGISTRATION','Registro profissional','Requisitos de registro e licenciamento dependem da autoridade competente.',null,'SOURCE_REQUIRED'),
('JUR-WORK','INTERNATIONAL_GENERIC','WORK_AUTHORIZATION','Autorização de trabalho','Requisitos migratórios e laborais variam por país e situação individual.',null,'SOURCE_REQUIRED')
on conflict(id) do nothing;

insert into career_worklife_capability_candidate(id,kind,title,description,normative_source_required,status) values
('WL-LABOR','LABOR_CALCULATORS','Ferramentas trabalhistas','Cálculos de jornada, adicionais, desligamento e direitos exigem contratos e fontes normativas vigentes.',true,'HOLD_HUMAN'),
('WL-ROSTER','SHIFT_PLANNER','Escala e plantão','Planejamento de carga, preferências, trocas e cobertura depende de regras institucionais e privacidade.',true,'HOLD_HUMAN'),
('WL-NEGOTIATE','NEGOTIATION','Negociação profissional','Preparação editorial e ferramentas de comparação sem prometer resultados.',false,'CANDIDATE'),
('WL-WELLBEING','WELLBEING','Descompressão e autocuidado','Pausas e recursos educativos sem diagnóstico, com encaminhamento seguro quando aplicável.',true,'HOLD_HUMAN')
on conflict(id) do nothing;

insert into career_youth_activity_candidate(id,kind,title,description,linked_module_ref,status) values
('YACT-REFLECT','GUIDED_REFLECTION','Explorar interesses','Perguntas educativas para observar interesses sem finalidade psicométrica.','MOD-YOUTH-REFLECT','CANDIDATE'),
('YACT-CARDS','CARD_SET','Cartões de profissões','Cartões reutilizáveis para comparar contextos, formação e possibilidades.','MOD-YOUTH-DISCOVER','CANDIDATE'),
('YACT-SCENARIO','SCENARIO','Escolhas de caminho','Cenários educativos para explorar decisões e próximos passos sem resposta única.','MOD-YOUTH-FIRST','CANDIDATE'),
('YACT-QUIZ','QUIZ','Quiz: conhecendo a Enfermagem','Quiz educativo alimentado por conteúdo previamente qualificado.','MOD-YOUTH-NURSING','HOLD_HUMAN'),
('YACT-GAME','GAME','Jogo de jornada profissional','Experiência lúdica que conecta etapas de formação, skills e oportunidades do mesmo banco.','MOD-YOUTH-GAMES','HOLD_HUMAN')
on conflict(id) do nothing;


-- Source/evidence/acquisition layer aligned to existing CKO source + authority_binding + projection contracts.
create table if not exists career_source_candidate (
  id text primary key,
  source_type text not null check (source_type in ('OFFICIAL_LAW','REGULATOR','STANDARD','TERMINOLOGY','PRIMARY_STUDY','GUIDELINE','TEXTBOOK','DATASET_API','SOFTWARE','IMAGE','INTERNAL_GOVERNED')),
  title text not null,
  authority text not null,
  uri text not null,
  pinpoint text not null,
  rights text not null check (rights in ('UNKNOWN','PERMITTED','RESTRICTED','LICENSED','PUBLIC_DOMAIN','NOT_APPLICABLE')),
  jurisdiction text not null,
  retrieved_at date not null,
  sha256 text not null check (sha256 ~ '^[a-f0-9]{64}$'),
  snapshot_ref text not null,
  effective_from date,
  effective_until date,
  language text,
  status text not null check (status in ('CANDIDATE','SOURCE_QUALIFIED','HOLD_HUMAN','RETIRED'))
);

create table if not exists career_authority_binding_candidate (
  id text primary key,
  field_path text not null,
  requirement_id text not null,
  source_id text not null references career_source_candidate(id),
  authority_class text not null check (authority_class in ('REGULATORY','TECHNICAL_STANDARD','AUTHORITATIVE_TERMINOLOGY','CLINICAL_EVIDENCE','INTERNAL_NONCLINICAL')),
  jurisdiction text not null,
  applicable_from date not null,
  applicable_until date,
  decision text not null check (decision in ('ALLOW','HOLD_HUMAN','REJECT','NOT_APPLICABLE_JUSTIFIED')),
  status text not null check (status in ('CANDIDATE','EVIDENCE_BOUND','HOLD_HUMAN','ASSURED'))
);

create table if not exists career_ingestion_run_candidate (
  id text primary key,
  source_id text not null references career_source_candidate(id),
  object_family text not null check (object_family in ('OPPORTUNITY','LEARNING_RESOURCE','MARKET_OBSERVATION','JURISDICTION_REQUIREMENT','EDITORIAL_SOURCE')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  input_count integer not null default 0 check (input_count >= 0),
  accepted_count integer not null default 0 check (accepted_count >= 0),
  rejected_count integer not null default 0 check (rejected_count >= 0),
  deduplicated_count integer not null default 0 check (deduplicated_count >= 0),
  state text not null check (state in ('PLANNED','IMPORTED','VALIDATED','REJECTED','HOLD_HUMAN')),
  evidence_ref text
);

create table if not exists career_opportunity_candidate (
  id text primary key,
  type_id text not null references career_opportunity_type_candidate(id),
  source_id text not null references career_source_candidate(id),
  ingestion_run_id text references career_ingestion_run_candidate(id),
  title text not null,
  organization text not null,
  jurisdiction text not null,
  location_text text,
  source_locator text not null,
  published_at timestamptz,
  expires_at timestamptz,
  dedupe_key text not null unique,
  status text not null check (status in ('SOURCE_QUALIFIED','EVIDENCE_BOUND','EXPIRED','HOLD_HUMAN','RETIRED'))
);

create table if not exists career_learning_resource_candidate (
  id text primary key,
  resource_type_id text not null references career_learning_resource_type_candidate(id),
  source_id text not null references career_source_candidate(id),
  ingestion_run_id text references career_ingestion_run_candidate(id),
  title text not null,
  provider text not null,
  modality text,
  workload_text text,
  price_text text,
  jurisdiction text not null,
  source_locator text not null,
  available_from timestamptz,
  available_until timestamptz,
  dedupe_key text not null unique,
  status text not null check (status in ('SOURCE_QUALIFIED','EVIDENCE_BOUND','EXPIRED','HOLD_HUMAN','RETIRED'))
);

create table if not exists career_market_observation_candidate (
  id text primary key,
  signal_id text not null references career_market_signal_candidate(id),
  source_id text not null references career_source_candidate(id),
  ingestion_run_id text references career_ingestion_run_candidate(id),
  role_ref text references career_role_candidate(id),
  jurisdiction text not null,
  statistic_kind text not null check (statistic_kind in ('POSTED_SALARY','OFFICIAL_STATISTIC','SURVEY_ESTIMATE','MARKET_INDEX')),
  observed_value numeric not null,
  unit text not null,
  period_start date,
  period_end date,
  methodology_note text not null,
  status text not null check (status in ('SOURCE_QUALIFIED','EVIDENCE_BOUND','HOLD_HUMAN','RETIRED'))
);

create table if not exists career_projection_contract_candidate (
  id text primary key,
  projection_kind text not null check (projection_kind in ('CV','COVER_LETTER','PORTFOLIO','PROFESSIONAL_SUMMARY','EDITORIAL','YOUTH_GUIDE')),
  audience text not null check (audience in ('PROFESSIONAL','YOUTH','BOTH')),
  source_object_family text not null,
  cko_projection_schema_ref text not null,
  editorial_projection_schema_ref text,
  allowed_channels text not null,
  sources_gate text not null check (sources_gate in ('PASS','HOLD','FAIL','NOT_APPLICABLE')),
  rights_gate text not null check (rights_gate in ('PASS','HOLD','FAIL','NOT_APPLICABLE')),
  a11y_gate text not null check (a11y_gate in ('PASS','HOLD','FAIL','NOT_APPLICABLE')),
  privacy_gate text not null check (privacy_gate in ('PASS','HOLD','FAIL','NOT_APPLICABLE')),
  human_gate text not null check (human_gate in ('PASS','HOLD','FAIL','NOT_APPLICABLE')),
  status text not null check (status in ('CANDIDATE','HOLD_HUMAN','ASSURED'))
);

create table if not exists career_capability_governance_candidate (
  id text primary key,
  capability_ref text not null,
  identity_required boolean not null default false,
  consent_required boolean not null default false,
  moderation_required boolean not null default false,
  report_required boolean not null default false,
  block_required boolean not null default false,
  audit_log_required boolean not null default true,
  retention_policy_required boolean not null default true,
  age_policy_required boolean not null default false,
  status text not null check (status in ('CANDIDATE','HOLD_HUMAN','ASSURED'))
);

insert into career_projection_contract_candidate(
  id,projection_kind,audience,source_object_family,cko_projection_schema_ref,editorial_projection_schema_ref,allowed_channels,
  sources_gate,rights_gate,a11y_gate,privacy_gate,human_gate,status
) values
('PROJC-CV','CV','PROFESSIONAL','CareerProfile+CareerSkill+CareerCredential','contracts/cko-skeletons/03-contratos-canonicos/bibliotecas-e-conteudo/projection.schema.json','contracts/cko-editorial/schemas/projection_request.schema.json','WEB,PDF,PRINT','PASS','PASS','HOLD','PASS','HOLD','HOLD_HUMAN'),
('PROJC-COVER','COVER_LETTER','PROFESSIONAL','CareerProfile+CareerOpportunity','contracts/cko-skeletons/03-contratos-canonicos/bibliotecas-e-conteudo/projection.schema.json','contracts/cko-editorial/schemas/projection_request.schema.json','WEB,PDF,PRINT','HOLD','PASS','HOLD','PASS','HOLD','HOLD_HUMAN'),
('PROJC-PORTFOLIO','PORTFOLIO','PROFESSIONAL','CareerProfile+CareerSkill+CareerCredential+CareerMilestone','contracts/cko-skeletons/03-contratos-canonicos/bibliotecas-e-conteudo/projection.schema.json','contracts/cko-editorial/schemas/projection_request.schema.json','WEB,PDF,PRINT','PASS','PASS','HOLD','PASS','HOLD','HOLD_HUMAN'),
('PROJC-YOUTH-GUIDE','YOUTH_GUIDE','YOUTH','CareerRole+CareerPath+CareerEditorialProjection','contracts/cko-skeletons/03-contratos-canonicos/bibliotecas-e-conteudo/projection.schema.json','contracts/cko-editorial/schemas/projection_request.schema.json','WEB,PDF,PRINT','HOLD','HOLD','HOLD','PASS','HOLD','HOLD_HUMAN')
on conflict(id) do nothing;

insert into career_capability_governance_candidate(
  id,capability_ref,identity_required,consent_required,moderation_required,report_required,block_required,audit_log_required,retention_policy_required,age_policy_required,status
) values
('CG-NET-MENTOR','NET-MENTOR',true,true,true,true,true,true,true,false,'HOLD_HUMAN'),
('CG-NET-NETWORK','NET-NETWORK',true,true,true,true,true,true,true,false,'HOLD_HUMAN'),
('CG-NET-GROUP','NET-GROUP',true,true,true,true,true,true,true,true,'HOLD_HUMAN'),
('CG-NET-SQUAD','NET-SQUAD',true,true,true,true,true,true,true,true,'HOLD_HUMAN'),
('CG-YOUTH-REFLECT','MOD-YOUTH-REFLECT',false,false,false,false,false,true,false,true,'CANDIDATE'),
('CG-YOUTH-GAMES','MOD-YOUTH-GAMES',false,false,false,false,false,true,false,true,'CANDIDATE'),
('CG-WORKLIFE','MOD-WORKLIFE',false,false,false,false,false,true,true,false,'HOLD_HUMAN')
on conflict(id) do nothing;

create index if not exists idx_career_source_status on career_source_candidate(status,jurisdiction);
create index if not exists idx_career_opportunity_type_status on career_opportunity_candidate(type_id,status);
create index if not exists idx_career_learning_type_status on career_learning_resource_candidate(resource_type_id,status);
create index if not exists idx_career_market_signal_status on career_market_observation_candidate(signal_id,status);

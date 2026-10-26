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
('MOD-YOUTH-REFLECT','autoconhecimento','Explorar interesses','Reflexão educativa por interesses; não é teste psicométrico.','FUNCTIONAL','YOUTH','youth','CANDIDATE',3),
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

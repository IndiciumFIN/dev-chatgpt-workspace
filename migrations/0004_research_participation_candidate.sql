-- CANDIDATE ONLY — Research + Participation local PGLite schema.
-- Non-destructive; no PHI/PII columns; never applied remotely by this candidate.
create table if not exists research_project_candidate (
  id text primary key,
  title text not null,
  summary text not null default '',
  research_type text not null check (research_type in ('QUALITATIVE','QUANTITATIVE','MIXED','REVIEW','IMPLEMENTATION','OTHER')),
  status text not null check (status in ('CANDIDATE','DRAFT','HOLD_HUMAN','READY_FOR_REVIEW')),
  ethics_state text not null check (ethics_state in ('UNASSESSED','REQUIRES_HUMAN_CHECK','DOCUMENTED_NOT_APPLICABLE','APPROVAL_RECORDED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists research_instrument_candidate (
  id text primary key,
  project_id text references research_project_candidate(id),
  kind text not null check (kind in ('SURVEY','INTERVIEW','OBSERVATION','FORM','CHECKLIST','OTHER')),
  title text not null,
  definition_json jsonb not null default '{}'::jsonb,
  status text not null check (status in ('CANDIDATE','DRAFT','HOLD_HUMAN','READY_FOR_REVIEW')),
  created_at timestamptz not null default now()
);
create table if not exists research_risk_candidate (
  id text primary key,
  project_id text references research_project_candidate(id),
  category text not null check (category in ('ETHICS','PRIVACY','METHOD','FINANCIAL','REPUTATION','SECURITY','BIAS','OTHER')),
  description text not null,
  likelihood smallint not null check (likelihood between 1 and 5),
  impact smallint not null check (impact between 1 and 5),
  treatment text not null default '',
  status text not null check (status in ('OPEN','MITIGATING','HOLD_HUMAN','CLOSED_CANDIDATE')),
  created_at timestamptz not null default now()
);
create table if not exists participation_process_candidate (
  id text primary key,
  title text not null,
  description text not null,
  status text not null check (status in ('CANDIDATE','DRAFT','OPEN_CANDIDATE','CLOSED_CANDIDATE','HOLD_HUMAN')),
  official boolean not null default false,
  normative_ref text,
  created_at timestamptz not null default now()
);
create table if not exists participation_statement_candidate (
  id text primary key,
  process_id text not null references participation_process_candidate(id),
  statement text not null,
  display_order integer not null default 0,
  active boolean not null default true
);
create table if not exists participation_contribution_candidate (
  id text primary key,
  process_id text not null references participation_process_candidate(id),
  participant_key text not null,
  contribution_kind text not null check (contribution_kind in ('PULSE','EXPERIENCE','COMMENT','EVIDENCE_NOTE')),
  body text not null default '',
  payload_json jsonb not null default '{}'::jsonb,
  moderation_status text not null default 'RECEIVED' check (moderation_status in ('RECEIVED','REVIEW_REQUIRED','ACCEPTED_CANDIDATE','HIDDEN_CANDIDATE')),
  created_at timestamptz not null default now()
);
create table if not exists participation_proposal_candidate (
  id text primary key,
  process_id text not null references participation_process_candidate(id),
  participant_key text not null,
  title text not null,
  problem text not null,
  proposal text not null,
  status text not null default 'RECEIVED' check (status in ('RECEIVED','REVIEW_REQUIRED','COMMUNITY_PRIORITY','REFERRED_CANDIDATE','CLOSED_CANDIDATE')),
  created_at timestamptz not null default now()
);
create table if not exists participation_reaction_candidate (
  id text primary key,
  proposal_id text not null references participation_proposal_candidate(id),
  participant_key text not null,
  reaction text not null check (reaction in ('SUPPORT','CONCERN')),
  created_at timestamptz not null default now(),
  unique (proposal_id, participant_key)
);
create table if not exists participation_consensus_vote_candidate (
  id text primary key,
  process_id text not null references participation_process_candidate(id),
  statement_id text not null references participation_statement_candidate(id),
  participant_key text not null,
  position text not null check (position in ('AGREE','DISAGREE','UNSURE')),
  profile text not null default 'NAO_INFORMADO',
  region text not null default 'NAO_INFORMADO',
  created_at timestamptz not null default now(),
  unique (statement_id, participant_key)
);
create table if not exists participation_outcome_candidate (
  id text primary key,
  process_id text not null references participation_process_candidate(id),
  title text not null,
  summary text not null,
  outcome_state text not null check (outcome_state in ('COMMUNITY_SYNTHESIS','REFERRED_CANDIDATE','OFFICIAL_RESPONSE_VERIFIED','CLOSED_CANDIDATE')),
  official_evidence_ref text,
  published_at timestamptz not null default now()
);
create index if not exists idx_participation_contribution_process on participation_contribution_candidate(process_id, created_at);
create index if not exists idx_participation_proposal_process on participation_proposal_candidate(process_id, created_at);
create index if not exists idx_participation_vote_statement on participation_consensus_vote_candidate(statement_id, position);
insert into participation_process_candidate (id,title,description,status,official,normative_ref)
values ('PROC-ENFERMAGEM-CIDADA-CANDIDATE-001','Enfermagem Cidadã — laboratório participativo independente','Ambiente candidato para testar escuta, propostas, consenso e devolutiva sem substituir canais oficiais.','OPEN_CANDIDATE',false,'DEC-COFEN-303-2026')
on conflict (id) do nothing;
insert into participation_statement_candidate (id,process_id,statement,display_order) values
('STAT-CIT-001','PROC-ENFERMAGEM-CIDADA-CANDIDATE-001','A identificação da categoria profissional deve ser simples para o cidadão durante o atendimento.',1),
('STAT-CIT-002','PROC-ENFERMAGEM-CIDADA-CANDIDATE-001','Quem participa de uma consulta deve conseguir acompanhar como sua contribuição foi utilizada.',2),
('STAT-CIT-003','PROC-ENFERMAGEM-CIDADA-CANDIDATE-001','A escuta social deve complementar critérios técnicos e evidências na definição de prioridades.',3)
on conflict (id) do nothing;

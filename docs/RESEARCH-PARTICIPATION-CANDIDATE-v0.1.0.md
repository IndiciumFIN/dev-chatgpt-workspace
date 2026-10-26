# Research + Participation Candidate v0.1.0
**Branch:** `feat/research-participation-layer-20261026`  
**WO candidata:** `WO-RES-PART-001`  
**Estado:** CANDIDATE / HOLD_HUMAN · **Kernel:** NOT_SUBMITTED

## Implementado
Research Studio; instrumentos; ética/LGPD/COI; fontes/evidências; equipe/skills; riscos e impactos; análise agregada; escuta cidadã; propostas/cocriação; consenso; devolutiva; relatório vivo e governança.

## Objetos canônicos candidatos
Schemas explícitos: ResearchProject, ResearchInstrument, ResearchRisk, ResearchSkillNeed, ParticipationProcess, ParticipationContribution, ParticipationProposal, ParticipationConsensusVote e ParticipationOutcome. Todos permanecem candidatos e vinculados ao registry de Research/Participation.

## Banco candidato
`migrations/0004_research_participation_candidate.sql` + PGLite local/efêmero. O módulo candidato não lê `DATABASE_URL` e não conecta Neon/Supabase. Não há colunas de nome, e-mail, CPF, telefone, paciente, prontuário ou leito; campos livres rejeitam padrões óbvios de e-mail, CPF e telefone.

## Limites
- ambiente independente e não oficial;
- não substitui Cofen/Corens, Ouvidoria, protocolo administrativo ou CEP/Conep;
- resposta oficial exige evidência verificável;
- rota candidata em noindex;
- migration não contém DELETE, DROP ou TRUNCATE;
- autorização do proprietário permite execução isolada nesta branch, mas não fabrica admissão do Kernel.

## Gate
`npm run audit:research-candidate` verifica isolamento, schema, SQL, rota, noindex, catálogo e ausência de admissão fabricada. Workflow dedicado roda gate + typecheck + testes + build + Chromium real em 360/768/1024/1440, com artefatos de evidência.

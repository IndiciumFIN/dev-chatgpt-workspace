# Career + Youth DB-first Candidate v0.1.0

**Branch:** `feat/career-youth-db-first-20261026`  
**WO:** `WO-CAREER-YOUTH-001`  
**Estado:** CANDIDATE / HOLD_HUMAN  
**Kernel admission:** NOT_SUBMITTED

## Decisão arquitetural

Carreira e Portal do Jovem usam o **mesmo domínio canônico candidato**. O banco contém objetos de carreira e duas projeções por audiência:

- `PROJ-CAREER` → profissionais;
- `PROJ-YOUTH` → jovens.

A UI não mantém catálogo paralelo de módulos. Ela consulta `career_projection_item_candidate` + `career_module_candidate`.

## Separação funcional × editorial

**Funcional/canônico:** passaporte, skills/gaps, papéis, trilhas, tipos de oportunidade, candidaturas, credenciais, documentos, sinais de mercado.

**Editorial/projeção:** Meu Primeiro Plantão, Fui Aprovado, valorização, guias, histórias, conteúdos do Portal do Jovem e materiais de orientação.

Conteúdo editorial referencia objetos canônicos por `linked_object_type` / `linked_object_ref`; ele não vira a fonte da verdade do domínio.

## Portal do Jovem

A projeção YOUTH cobre descoberta de profissões, Enfermagem como carreira, reflexão de interesses, formação/primeiros passos, oportunidades, skills/trilhas e jogos/quizzes. A reflexão implementada é **educativa e não psicométrica**.

## Dados pessoais

O workspace candidato aceita somente uma chave pseudônima e dados de carreira não identificáveis. Não há colunas de nome, e-mail, telefone, CPF ou COREN. O servidor rejeita padrões óbvios de contato em campos livres.

## Mercado e oportunidades

Vagas, concursos, salários, credenciais e requisitos por jurisdição não recebem valor atual inventado. O banco materializa tipos/contratos e mantém sinais como `SOURCE_REQUIRED` até aquisição verificável.

## Banco

`migrations/0004_career_youth_candidate.sql` é executada apenas pelo módulo PGLite candidato `src/lib/career-candidate-db.server.ts`. O módulo não lê `DATABASE_URL` e não conecta Neon/Supabase.

## Rotas candidatas

- `/secao/carreira`
- `/secao/jovens`

Ambas permanecem `noindex, nofollow` até revisão e promoção formal.

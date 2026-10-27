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

## Cobertura DB-first ampliada

Além do núcleo inicial, o banco materializa tipos de recursos de aprendizagem, cenários de entrevista, capacidades de networking/mentoria, requisitos por jurisdição, capacidades de vida profissional e atividades do Portal do Jovem. O registry exige 29 schemas candidatos.

## Dados pessoais

O workspace candidato aceita somente uma chave pseudônima e dados de carreira não identificáveis. Não há colunas de nome, e-mail, telefone, CPF ou COREN. O servidor rejeita padrões óbvios de contato em campos livres.

## Mercado e oportunidades

Vagas, concursos, salários, credenciais e requisitos por jurisdição não recebem valor atual inventado. O banco materializa tipos/contratos e mantém sinais como `SOURCE_REQUIRED` até aquisição verificável.

## Banco

As migrations `0004` (domínio), `0005` (conteúdo) e `0006` (atomização) são executadas em ordem pelo módulo PGLite candidato `src/lib/career-candidate-db.server.ts`. O módulo não lê `DATABASE_URL` e não conecta Neon/Supabase.

## Rotas candidatas

- `/secao/carreira`
- `/secao/jovens`

Ambas permanecem `noindex, nofollow` até revisão e promoção formal.


## Pendências remanescentes
O checklist escopado está em `docs/PENDENCIAS-CAREER-YOUTH-CANDIDATE-v0.1.0.md`. As maiores pendências são fontes externas atuais, revisão humana/Kernel, conteúdo editorial qualificado, jurisdições e governança multiusuário.


## Source / Evidence / Acquisition

A fundação agora reutiliza os contratos CKO existentes de `source`, `authority_binding`, `relation` e `projection`, além de `projection_request` / `resource_binding` editoriais. O banco materializa Source, Authority Binding, Ingestion Run, registros reais de Opportunity/Learning/Market, contratos de projeção e governança de capacidades.

O validador `scripts/validate-career-acquisition-batch.mjs` exige fonte `SOURCE_QUALIFIED`, URI, SHA-256 fornecido, dedupe key e coerência temporal. Ele não grava no banco.


## Editorial content pack

A primeira coleção editorial está materializada em `migrations/0005_career_editorial_content_candidate.sql`.

- 17 documentos pt-BR;
- perfis Article e Pocket Guide reutilizados do `cko-editorial`;
- corpo em blocos de banco, não hardcoded em React;
- `static_nontechnical_copy` para orientação não factual;
- `evidence` para afirmações profissionais/formativas;
- 6 snapshots oficiais em `registers/career/source-snapshots.v1.json`;
- SHA-256 conferido pelo gate `audit:career-content`;
- todos os documentos permanecem com `human_gate=HOLD`;
- o leitor editorial é renderizado a partir de `CareerEditorialDocument + CareerEditorialBlock`.

Run validado desta wave: `40421504298`.


## Atomização / claim-level evidence

A terceira migration, `migrations/0006_career_atomization_candidate.sql`, fecha a linhagem:

`Source → SourceFragment → AtomicFact → CKO Claim → EvidenceBundle → AuthorityBinding → EditorialBlock`.

Estado candidato materializado:
- 6 fontes oficiais snapshotadas;
- 19 fragmentos;
- 19 fatos atômicos;
- 19 claims no formato do contrato CKO `claim.schema.json`;
- 19 evidence bundles candidatos;
- 16 authority bindings regulatórios;
- 3 claims CNCT deliberadamente sem authority binding temporal enquanto edição/vigência permanecerem pendentes;
- bindings claim-by-claim para todos os blocos editoriais factuais não-referência.

`SourceFragment`, `AtomicFact` e `EvidenceBundle` são extensões candidatas desta frente. `Claim` reutiliza o contrato CKO existente; a branch não promove novos contratos globais do CKO.

O gate `scripts/check-career-atomization.mjs` comprova 1:1:
- snapshot factual → fragmento;
- hash da fonte → hash do fragmento → hash do fato;
- fato → claim;
- claim → evidence bundle;
- claim → authority binding quando a validade está qualificada;
- bloco factual → ao menos um claim `SUPPORTS`;
- nenhuma autoaprovação: claims permanecem `REVIEW_REQUIRED/PENDING`.

O leitor editorial candidato expõe a trilha diagnóstica de evidência atômica em `<details>`, incluindo locator, fato, claim e evidence bundle.

Wave validada no workflow `40426337424`, HEAD `1602acbb7f15a87af4b876cf3e4ff28b61cca72a`.

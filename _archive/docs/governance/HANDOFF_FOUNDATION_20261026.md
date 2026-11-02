# Handoff canônico — Fundação COSO IA / OPA / Kernel / Agentes / Importação

**Checkpoint:** 26/10/2026 · **Estado:** `HOLD_HUMAN` · **Leitura obrigatória antes de qualquer continuação**.

> **Regra de precisão:** arquivo commitado ≠ execução de teste ≠ migração aplicada ≠ serviço implantado ≠ promoção autorizada. Nenhum desses estados pode ser inferido de outro.

## 1. Identidade e limites

- **Repositório autorizado nesta frente:** [`IndiciumFIN/dev-chatgpt-workspace`](https://github.com/IndiciumFIN/dev-chatgpt-workspace).
- **Branch existente:** `preview/central-comando-20261026`. **Não criar outra branch**, não reescrever histórico, não excluir árvore antiga.
- **PR:** [#1](https://github.com/IndiciumFIN/dev-chatgpt-workspace/pull/1), em **rascunho (DRAFT)**, sem merge e com HOLD de produção.
- `main` observada antes deste checkpoint: `97684528ae2cfe1a2899e8caa53fbac4b45184ef`; não tocada por esta frente.
- O repositório está identificado em `AGENTS.project.md` como **backup isolado**, não o Kernel corporativo autoritativo.
- Supabase `Calculadoras-Smart`: **consultado apenas em leitura**, nenhum DDL, grant, INSERT, UPDATE ou exclusão autorizado/realizado.
- Vercel: consulta de Preview retornou deployments `READY` anteriores (o mais recente retornado correspondia ao SHA `9d10968b`); **não comprova publicação do HEAD da branch**. Não ligar o serviço HTTP por simplesmente haver um Preview.
- Ativos de front-end administrativos previamente implementados permanecem preservados. Refinamento visual é a **última** prioridade, após contratos, controle e operação.

## 2. Evidência comprovada até o checkpoint

**CI de referência para as capacidades anteriores ao checkpoint:**
- Commit `6710352f2fa7aaeb8a78b738ed87e016ab985953`
- [GitHub Actions 40310026295](https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/40310026295): `SUCCESS`, **284/284 testes, 0 falhas**, com OPA real 1.21.4 fixado por SHA256, testes Rego, bundle RSA efêmero assinado/verificado, rejeição de chave errada e assinatura ausente, requisições HTTP para **OPA loopback**, PGlite, TypeScript e build SPA.
- A verificação posterior deve usar o **run do HEAD atual**, nunca transferir automaticamente a evidência deste SHA para commits novos.

**NOVO mecanismo de continuidade desta rodada:** `docs/governance/FOUNDATION_CONTINUITY_MANIFEST_20261026.json`; `scripts/check-governance-continuity.mjs`; `scripts/governance-continuity.test.mjs`; novo gate no workflow `.github/workflows/verify-bibliotecas.yml`. O gate detecta arquivos ausentes, relaxamento de HOLD, declaração de produção sem evidência e surgimento de rota não homologada. **Não prova, sozinho, a situação remota de Supabase/Vercel/OPA.**

## 3. Inventário de camadas — NÃO confundir estado

| Camada | Versão e evidências | Estado real |
|---|---|---|
| COSO / governança de IA | `docs/governance/FOUNDATION_COSO_OPA_KERNEL_AGENTS_20261026.md`; cruzamentos de frameworks existentes na base | Desenho e contratos candidatos; **sem certificação ou homologação dos controles** |
| OPA / Rego | `contracts/cko-governance/opa/*.rego`, workflow e `scripts/test-opa-real-http.mjs` | **OPA real testado no CI**, com chave/atos sintéticos; **serviço corporativo e grants reais não configurados** |
| Kernel | `src/core/governance/kernel.ts`, testes, migração candidata | Correções de validação **locais**, **não** Kernel corporativo admitindo WOs |
| Agentes | `src/core/governance/agent-authorization.ts`, testes | Preflight determinístico; **nenhuma execução remota ou escrita autorizada** |
| Importação UI | `src/components/admin/admin-bulk-import.tsx`, `bulk-import.ts` | CSV/TSV/JSON, mapeamento, HOLD, hashes e exportação de JSON candidatos; **sem escrita remota** |
| Reconciliação de catálogos | `bulk-import-reconciliation.ts`, `import-read-service.ts`, `import-read-db.server.ts` | Código e testes read-only; **sem banco real conectado** |
| Serviço OPA + contrato HTTP | `import-opa-read.server.ts`, `import-reconcile-http.server.ts` | Testes em mocks/OPA loopback; **rota HTTP administrativa não existe** (tentativa de criação bloqueada pelas ferramentas) |
| Banco/estruturas | cinco migrações candidatas sob `migrations/candidates/20261026_*.sql` | DDL testado em PostgreSQL isolado; **não aplicado ao Supabase** |
| Papel PG restrito | `20261026_import_readonly_role.sql` e testes PGlite | Papel e privilégios testados isoladamente; **não provisionado no Supabase real** |
| Evidências de leitura | `20261026_import_read_evidence_receipts.sql` e testes | Contrato candidato de receipts `UNATTESTED`; **não prova decisão remota assinada** |
| Preview Vercel | deployments `READY` de SHAs anteriores | **Nenhum deploy do HEAD deste checkpoint confirmado** |

**Contagem estrutural candidata:** oito tabelas de governança/WO/OPA/Kernel/agentes, sete complementares de staging, três de reconciliação/histórico e uma de recibos de leitura (**19 tabelas candidatas**, além do papel PostgreSQL candidato); nenhuma foi declarada aplicada ao Supabase real.

**Inventário de banco lido:** `cko_staging.import_packages` existe. As demais tabelas de candidatos de importação e admissão consultadas não foram encontradas no banco real. Fontes, políticas, validadores e pacotes tinham RLS desabilitado à época da consulta; os papéis `anon` e `authenticated` não tinham `USAGE` e `SELECT/INSERT` diretos nessas quatro tabelas. **Auditar** os demais papéis, funções e rotas antes de qualquer alegação de segurança.

## 4. Bloqueios que impedem declarar 100% operacional

1. **FIND/política/validador/WO e autoridade:** a cadeia de governança corporativa ainda não admitiu essas alterações; não criar a aprovação por conta própria.
2. **OPA corporativo:** não há evidência de serviço privado confiável com identidade, dados de grants homologados, bundle assinado e **ativação verificada independentemente**. O campo `bundle_sha256` fornecido pelo próprio PDP não basta como prova criptográfica.
3. **Banco privado:** papel `cko_import_reader` e as cinco migrações candidatas não foram implantados. Revisão de RLS, grants, ownership, assinatura, backups, transação, concorrência e rollback pendente.
4. **API:** a rota HTTP para a administração não está presente em `src/routes/api`; não contornar bloqueio de criação com rota alternativa ou função pública.
5. **Permissões:** RBAC/PEP de servidor, identidade Better Auth real e segregação Maker/Checker/Auditor dependem de validação independente.
6. **Execução:** sem política de escrita, executor transacional idempotente, admissão Kernel ou agentes autorizados. **Sem importação canônica automática**.
7. **Promoção:** sem aprovação de segurança e conteúdo clínico aplicável; PR permanece DRAFT, sem merge main/produção.

## 5. Próximas WOs candidatas — ordem determinística

| Ordem | Etapa | Evidência de aceite | Dependência |
|---|---|---|---|
| 1 | Revisar o FIND da rota API bloqueada e a autorização do runtime privado | Decisão escrita com responsável, política e limites | Revisão humana |
| 2 | Homologar versão das migrações em **banco isolado autorizado** e plano de rollback | Execução SQL, FKs/RLS/grants, concorrência, logs e prova de não escrita canônica | FIND, política, validador, WO |
| 3 | Provisionar **PDP OPA privado** e grants sob fonte aprovada | Bundle assinado, configuração que exige assinatura, digest/ativação comprovada, logs e revogação | WO e autoridade de chaves |
| 4 | Provisionar conexão PG somente leitura em ambiente autorizado | Role real isolada, TLS, testes de ausência de DML/DDL e RLS | WO/segurança |
| 5 | Expor rota autenticada **apenas** após liberação dos bloqueios | Sessão efetiva, autorização OPA, CSRF, limitação, read-only E2E; erro = HOLD | Etapas 1–4 |
| 6 | Formalizar decisão/evidência da leitura e revisão humana | Receipts atestados independentemente, lineage, logs minimizados | Etapa 5 |
| 7 | Planejar e validar caminho **separado** de escrita governada | OPA de escrita, Kernel, idempotência/locks, auditoria e rollback | Etapa 6 |
| 8 | Refinar front-end; promover apenas com aprovação | QA/E2E, acessibilidade, gates clínicos, revisão de release | Etapas anteriores |

**Não reexecutar tarefas concluídas sem mudança de entrada.** Os testes correm automaticamente quando arquivos pertinentes mudam; não criar novos fluxos concorrentes por impaciência. Se houver bloqueador, registrar FIND com causa, evidência e responsável e passar à próxima tarefa não bloqueada. O PMO canônico `registers/pmo/queue.v1.json` permanece somente leitura nesta frente; não inventar que foi atualizado.

## 6. Instrução para nova conversa (copiar sem perder contexto)

> Continue a frente COSO IA / OPA / Kernel / agentes / importação governada do `IndiciumFIN/dev-chatgpt-workspace`. Leia primeiro `docs/governance/HANDOFF_FOUNDATION_20261026.md`, o manifesto JSON `FOUNDATION_CONTINUITY_MANIFEST_20261026.json`, o PR #1 e o **último run CI do HEAD da branch** `preview/central-comando-20261026`. Preserve a `main` e o Supabase. Não criar branch, não reexecutar etapas concluídas, não presumir implantação real por código ou testes. Formalize FIND/WO conforme gates e continue pela primeira pendência não bloqueada. O front-end é a última camada. Confirme os resultados por ações efetivamente executadas.

## 7. Fontes de verdade para auditoria

- Código e PR #1 → artefatos Git versionados, evidências dos diffs e CI do SHA correspondente.
- Estado de teste → GitHub Actions do SHA correspondente, não texto de relato.
- Estado do banco → consulta read-only do Supabase real e relatório dos roles, jamais presença de SQL candidata.
- Estado do deploy → deployment Vercel de **SHA idêntico** ao HEAD, com READY e autorização correspondente.
- Estado de admissão → Kernel corporativo, decisão OPA independente, evidências e sign-off. Sem esses registros, status **HOLD**.

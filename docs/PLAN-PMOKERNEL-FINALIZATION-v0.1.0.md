# Plano de finalização — PMO × Kernel (branch, pendências, cobertura integral)

**Versão:** v0.1.0 · **Data:** 2026-10-31 · **Escopo:** `IndiciumFIN/dev-chatgpt-workspace`
**Estado:** PROPOSTO — HOLD_HUMAN. Este plano **não** autoriza merge, deploy, alteração de `main`, de Supabase de produção, de segredos ou de permissões.
**Alvo de registro:** branch `plan/pmokernel-finalization-20261031` (a partir de `main` @ `6c62bb61`), PR *draft* para `main`. Nenhuma branch existente é alterada por este PR.

---

## 1. Análise do que foi enviado (leitura crítica, antes do plano)

### 1.1 O inventário persistido — commit `1ab0561`

`feat(pmo): persist cross-source pending intake and unmapped coverage gaps` — branch `fix/governed-activities-cli-20261026` (HEAD `1ab05611faca724e72f5f45729fd312691729b04`, 31/10 15:35Z), arquivo novo `registers/pmo/cross-source-pending-intake.v1.json` (388 linhas, blob `25e39700…`).

Conteúdo medido:

| bloco | conteúdo | leitura |
|---|---|---|
| `completeness` | `NOT_VERIFIED` | honesto: o próprio registro se declara incompleto |
| `policy` | *"Do not infer closure or Kernel admission from source snapshot"* | correto — snapshot não é prova |
| `sourceSnapshots.pmo` | branch `fix/governed-activities-cli-20261026`, **revision 20** | **revisão 20 ≠ 18 do `main`** → 4ª revisão de PMO em voo |
| `sourceSnapshots.issues` | `observedCount: 18` | bate com a medição de hoje (18 issues abertas) |
| `pmo[]` | 10 WOs com `evidenceCount` | ok |
| `simulados[]` | 13 pendências (P0-01…P1-13), **todas com `wo: "UNRECONCILED"`** | **13 órfãs — é o GAP-01 na prática** |
| `openIssues[]` | 18 issues | precisa de vínculo WO/task |
| `coverageGaps[]` | GAP-01…GAP-04, todos `OPEN` | coerente com a medição |
| `releaseGate` | `HOLD_HUMAN` | coerente |

**Conclusão sobre o inventário:** ele está **correto e útil** — é o primeiro artefato do repo que mapeia pendências de forma legível por máquina. Mas ele é um **snapshot declarativo**: nada no repositório ainda **verifica** que ele continue verdadeiro. Sem validador, ele envelhece em silêncio — exatamente o modo de falha já observado nos 35 FINDs em comentários.

### 1.2 A diretriz registrada na issue #25

> *"Nenhum achado, decisão, tarefa, evidência, resultado de teste ou impedimento deve permanecer exclusivamente nesta conversa."*
> Cadeia: `FIND → Política → Validador → TASK → WO → Kernel → Execução → Testes → Auditoria → Homologação`

Isso é uma boa regra e ela **confirma o diagnóstico da revisão de 31/10**: 35 FINDs e ~60 commits de candidatos existem **só em comentários de PR**. A diretriz é executável — e o executor é a **Fase 1** deste plano (validador que falha fechado quando um achado não tem TASK/WO).

### 1.3 A spec de cenários de auditoria (anexo enviado)

O anexo é uma **especificação genérica de auditoria de dados para PostgreSQL**, com 6 domínios e 13 cenários:

| domínio | cenários | natureza |
|---|---|---|
| 1. Kernel & Metamodelo | KER-01 (dicionário/comentários), KER-02 (FK lógica × física), KER-03 (mutabilidade STATIC/APPEND_ONLY) | **aplicável ao repo** |
| 2. Master Data & Atomização | MST-01 (1NF/regex), MST-02 (golden record/unicidade), MST-03 (tipagem estrita) | **parcialmente aplicável** (MST-01/02 exigem dados reais) |
| 3. Policy-as-Code & Segurança | SEC-01 (PII sem privilégio), SEC-02 (RLS) | **aplicável só com DB** |
| 4. i18n | I18N-01 (paridade de locales), I18N-02 (tradução vazia/espelhada) | **aplicável e já parcial no repo** (`registers/i18n/locale-register.v1.json`) |
| 5. SEO | SEO-01 (meta title/descrição), SEO-02 (slug), SEO-03 (alt de imagem) | **aplicável** (conteúdo em `src/lib/content/**`, 87 páginas no PR #22) |
| 6. JSON-LD / Schema.org | JSD-01 (campos obrigatórios por @type), JSD-02 (dateModified ≥ datePublished) | **aplicável** |

**Veredito:** a spec é boa, mas é **genérica e não-executável no estado atual** — cite `core.produtos`, `core.produtos_i18n`, `clientes`, `cpf`, `policy.yaml`, `psycopg2`, `pandas`, `pydantic`, `Great Expectations`, `pg_cron`, `dbt`: **nenhum desses existe neste repositório**, e o CI (`verify-bibliotecas.yml`) roda `npm ci` **sem etapa de instalação Python**. Uma spec que depende de `pip install psycopg pandas pydantic` nunca roda no gate — vira documento.
→ **Decisão de projeto (D-03):** motor **só com biblioteca padrão**, política em **JSON** (não YAML), modo estático sobre os arquivos do repo + modo PostgreSQL opcional com `psycopg` protegido por import condicional. Implementado neste PR como `scripts/audit_data_kernel.py` + `tests/test_audit_data_kernel.py` (**17 testes, verdes**).

*Correção de precisão:* o CI **instala** dependências Python de forma pontual (`python3 -m pip install "jsonschema==4.25.1"` no passo de auditoria ISO), mas sem lockfile e sem etapa de instalação para o restante do job. A justificativa correta para D-03 não é "o CI não instala pip", e sim **evitar divergência entre ambiente local e gate** e não introduzir dependência nova sem lockfile.

### 1.4 A falha `ENOENT: ... '/var/task/_libs/pglite.data'`

Causa: o diretório de dados do PGlite foi tratado como pré-existente por um caminho herdado do ambiente de execução (`/var/task/_libs/`). O PGlite abre o diretório e falha se ele não existir.
**Correção já implementada** em `scripts/audit_data_kernel.py::resolve_pg_target()`: ordem `DATABASE_URL` → `PGLITE_DATA_DIR` (criado com `mkdir(parents=True, exist_ok=True)`) → padrão `<root>/.tmp/pglite`; e **nunca** deixa o erro cru de ENOENT vazar — a falha vira mensagem acionável. Teste cobrindo: `tests/test_audit_data_kernel.py::TestPgTargetResolution`.

---

## 2. Decisões de projeto (D-xx) que este plano assume

| id | decisão | motivo |
|---|---|---|
| D-01 | O gate de cobertura é **não-circular**: re-deriva WOs, pendências e tasks de três fontes independentes | snapshot que ninguém re-deriva envelhece em silêncio (falha já observada) |
| D-02 | Entrada **ausente** ⇒ `SKIP` com o ID da task que falta; entrada **presente e incompleta** ⇒ **falha fechada** | ausência de insumo não é aprovação; a ativação do gate é a T1.3 |
| D-03 | Motor de auditoria **sem dependências externas**; política em JSON | o CI instala pip de forma pontual (`jsonschema==4.25.1`) e sem lockfile — manter o motor em stdlib evita divergência entre ambiente local e gate e não exige etapa de instalação nova |
| D-04 | Toda task do plano tem **WO**, `covers[]`, `artefatos[]` e `aceite` verificável | a cadeia da issue #25 precisa ser **verificável por máquina**, não por leitura |
| D-05 | Este plano **não** mexe em `main`, Supabase, segredos ou permissões, e **não** fecha issues | o gate quebrado no `main` é sintoma; a causa é decisão de admissão (já pedida na #25) |
| D-06 | Branch nova a partir de `main`, PR **draft**, sem tocar nas branches existentes | evita diff duplicado com o PR #13 e mantém a sequência sem ambiguidade |
| D-07 | "Finalizar o que não serve mais" é feito por **registro de descomissionamento**, não por deleção unilateral | apagar histórico de auditoria sem autorização destrói rastreabilidade |

---

## 3. Plano de execução — 5 fases, 35 tasks

Estado de cada task: `PROPOSTO` (vivo), `BLOCKED` (depende de decisão externa), `DONE` (artefato entregue neste PR).
Legenda de ling.: **JS** = Node (`.mjs`, padrão do repo), **PY** = Python stdlib (`unittest`), **DOC** = registro, **CI** = workflow.

### Fase 0 — Selagem do inventário e da decisão (destrava tudo)


| task | título | WO | deps | ling. | aceite | status |
|---|---|---|---|---|---|---|
| TASK-PLAN-001 | Reconciliar as 4 revisões de PMO (18 `main` / 19 `work/editorial` / **20 `fix/governed`** / 23 `preview`) | WO-PMO-001 | — | DOC | uma revisão canônica escolhida, registrada com justificativa e as outras marcadas `SUPERSEDED` em `registers/pmo/queue.v1.json` (evento novo, `seq` preservado) | PROPOSTO |
| TASK-PLAN-002 | Decisão de admissão do Kernel (WO-ADM-001 / PR #13) | WO-ADM-001 | — | — | decisão verificável: ID, WO, SHA, identidade e autoridade do decisor, assinatura, timestamp, expiração, condições, veto, trilha imutável (contrato já em #25) | **BLOCKED** (externo) |
| TASK-PLAN-003 | Land do gate relaxado (`PAUSED`\|`IN_PROGRESS`) em branch própria | WO-ADM-001 | 002 | JS | `node scripts/check-pmo-queue.mjs` verde no `main`; PR aberto contra `main`; sem tocar a fila PMO | PROPOSTO |
| TASK-PLAN-004 | Proteger `main` + **provar** o enforcement (issue #12) | WO-SEC-001 | 003 | CI | ruleset com PR + `verify` verde + review; teste que demonstra push direto sendo **recusado** (log do GitHub como evidência) | PROPOSTO |
| TASK-PLAN-005 | Land do inventário `CE-CROSS-SOURCE-PENDING-INTAKE` + validação de schema | WO-PMO-001 | 001 | JS | register no `main`; `registerId`/`schemaVersion`/`completeness` validados por script (fail-closed) | PROPOSTO |
| TASK-PLAN-015 | Medir a superfície de segurança (Dependabot, code scanning, secret scanning) | WO-SEC-001 | — | CI | as 3 ferramentas falham com erro de conector ⇒ hoje é **"não medido"**, nunca "zero alertas"; registrar alertas por severidade + SHA afetado | PROPOSTO |
| TASK-PLAN-016 | Destravar os 3 workflows do PR #24 em `action_required` | WO-SEC-001 | — | CI | `SPE Candidate Static Gates`, `Simulados RPC static regressions` e `Remediate better-auth candidate safely` executam (hoje aguardam aprovação ⇒ o PR #24 não tem veredito de CI) | PROPOSTO |
| TASK-PLAN-017 | Validador de schema do inventário transversal | WO-PMO-001 | 005 | JS | falha fechada em campo ausente/inválido, id duplicado, WO desconhecida, URL fora do repo, incoerência `completeness`×`releaseGate`; **12 testes verdes**; validado contra o inventário real → OK | **DONE** (neste PR) |

### Fase 1 — Gate de cobertura: de snapshot para invariante

> **Nota revisada em 31/10:** o workflow de **testes candidatos** `.github/workflows/pmo-candidate-unit-regressions.yml` roda na branch do PR #26 e confirmou 39/39 regressões, sem autorizar release. O **gate de cobertura para integração** `ci/pending-coverage-gate.yml` permanece não ativado: o resultado contra dados reais é vermelho por quatro GAP_ABERTO. Sequência de ativação mantida: T0.005 → T0.013 → T0.001 → T0.012. A falha do `verify` geral por contrato antigo do Commander não é aprovação de CI integral.


| task | título | WO | deps | ling. | aceite | status |
|---|---|---|---|---|---|---|
| TASK-PLAN-010 | `scripts/check-pending-coverage.mjs` — re-deriva WOs × pendências × tasks | WO-PMO-001 | 005 | JS | violações `TASK_SEM_WO`, `TASK_WO_INEXISTENTE`, `WO_SEM_TASK`, `PENDENCIA_ORFA`, `DONE_SEM_EVIDENCIA`, `TASK_SEM_ARTEFATO`, `GAP_ABERTO` | **DONE** (neste PR) |
| TASK-PLAN-011 | Testes negativos do gate | WO-PMO-001 | 010 | JS | 12 testes verdes (`node --test scripts/check-pending-coverage.test.mjs`), incluindo SKIP-when-absent | **DONE** (neste PR) |
| TASK-PLAN-012 | Ativar o gate no CI | WO-PMO-001 | 005, 010, 011 | CI | `ci/pending-coverage-gate.yml` copiado para `.github/workflows/` (escrita nessa pasta é bloqueada para a API do plugin) e gate **falhando fechado** quando houver gaps. **Ordem obrigatória:** T0.005 → T0.013 → T0.001 → só então `GAP_ABERTO` como erro | PROPOSTO (arquivo pronto em `ci/`; cópia exige owner) |
| TASK-PLAN-013 | Vínculo das **18 issues** + **13 pendências Simulados** a WO/task | WO-PMO-001, WO-SEC-001 | 010, 005 | JS | `PENDENCIA_ORFA = 0` no gate; cada issue aberta tem task e cada task tem WO | PROPOSTO |
| TASK-PLAN-014 | Consolidar os ~35 FINDs (R14–R47, CURI-R36–R40, SPE-R14–R35) em **uma baseline commitada por PR** | WO-PMO-001 | 012 | JS+PY | para cada PR auditado: um validador no repo, testes negativos, e o texto do FIND referenciando o blob **commitado** (hoje aponta para blobs que só existem em comentário) | PROPOSTO |

> **Validação end-to-end medida (31/10, dados reais):** o gate foi rodado contra a **fila rev 20** (`fix/governed-activities-cli-20261026`) + o **inventário real** (`1ab0561`) + este registro de tasks:
> `10 WOs · 35 tasks · 31 pendências` → **0 PENDENCIA_ORFA**, **0 WO_SEM_TASK**, **4 GAP_ABERTO** (GAP-01…04 — exatamente os gaps que T0.001/T0.013/T2.022 fecham).
> Isso é o fail-closed funcionando: o gate está vermelho **por um motivo verdadeiro**, não por bug do gate.

### Fase 2 — Política como código + catálogo de cenários

| task | título | WO | deps | ling. | aceite | status |
|---|---|---|---|---|---|---|
| TASK-PLAN-020 | `docs/AUDIT-DATA-KERNEL-SCENARIOS-v0.1.0.md` — 13 cenários mapeados ao repo | WO-SEC-001 | — | DOC | cada cenário KER/MST/SEC/I18N/SEO/JSD mapeado a caminho real + limitação + modo (estático/DB) | **DONE** (neste PR) |
| TASK-PLAN-021 | `registers/governance/audit-policy.v1.json` | WO-SEC-001 | 020 | DOC | política populada: locales obrigatórios, limites SEO, colunas PII, tabelas RLS, mutabilidade, FKs lógicas, tipagem — com `populationStatus` explícito | **DONE (esqueleto)** / popular: PROPOSTO |
| TASK-PLAN-022 | Ligar cada cenário a uma WO do inventário | WO-SEC-001 | 021 | DOC | cobertura de cenários: cada regra do motor tem WO e critério de aceite | PROPOSTO |
| TASK-PLAN-026 | Cobrir a matriz transversal de governança e Master Data pelo motor | WO-GOV-TRANS-001 | 030, 021 | PY | cenários KER/MST/SEC rodam sobre a matriz transversal com `populationStatus=COMPLETE`; o motor passa a produzir achado real, não aviso de política vazia | PROPOSTO |

### Fase 3 — Motor de auditoria executável

| task | título | WO | deps | ling. | aceite | status |
|---|---|---|---|---|---|---|
| TASK-PLAN-030 | `scripts/audit_data_kernel.py` — modo estático (SQL + conteúdo + registers) | WO-SEC-001 | 021 | PY | roda sem banco e sem dependências; exit 1 em erro, 2 em insumo ausente, 0 em warning | **DONE** (neste PR) |
| TASK-PLAN-031 | Modo PostgreSQL read-only + **bootstrap PGlite que mata o ENOENT** | WO-SEC-001 | 030 | PY | `resolve_pg_target()` cria o dir; transação `READ ONLY` + rollback; psycopg ausente ⇒ warning, nunca crash | **DONE** (neste PR) |
| TASK-PLAN-032 | Suíte de testes do motor | WO-SEC-001 | 030, 031 | PY | 112 testes verdes (`python3 -m unittest discover -s tests -p 'test_*.py' -q`) | **DONE** (neste PR) |
| TASK-PLAN-033 | Corrigir a fixture contraditória do PR #24 (`attempt-policy.test.ts:12`) | WO-SEC-001 | 030 | PY/JS | `SPE Candidate Static Gates` verde; o teste deixa de afirmar duas coisas contraditórias para o mesmo input | PROPOSTO |
| TASK-PLAN-034 | Auditar as **47 migrations + 17 testes** do banco original dos Simulados | WO-SEC-001 | 031, 033 | PY | replay em PostgreSQL descartável com relatório do motor; divergências catalogadas | PROPOSTO |
| TASK-PLAN-027 | Reconciliar CKO, fontes normativas e o corpus de bibliotecas | WO-CKO-001 | 034 | PY | 17 achados CKO/COREN/COFEN + 240 CSV (`staging/bibliotecas-corpus`) + 1577 recortes (`audit-hardening`) rastreados a fonte (SHA + ponteiro JSON), sem duplicidade nem órfão | PROPOSTO |
| TASK-PLAN-028 | Reconciliar os 17 achados CKO/COREN/COFEN com a fila PMO | WO-CKO-COFEN-001 | 034 | DOC | os 17 itens do lote (`registers/governance/find-register.v1.json`) têm task e evidência; `check-candidate-find-register.mjs` verde | PROPOSTO |

### Fase 4 — Publicação: i18n, SEO, JSON-LD

| task | título | WO | deps | ling. | aceite | status |
|---|---|---|---|---|---|---|
| TASK-PLAN-040 | Gate de paridade de locales + SEO/slug/alt sobre o conteúdo | WO-SEC-001 | 021, 030 | PY | 87 páginas do PR #22 auditadas; `I18N-01` e `SEO-02` sem erro; `registers/i18n/locale-register.v1.json` é a fonte de verdade | PROPOSTO |
| TASK-PLAN-041 | Gerador JSON-LD estrito + validação Schema.org por `@type` | WO-SEC-001 | 030 | PY | `JSD-01`/`JSD-02` no motor; gerador sem dependência externa (validação própria, não pydantic) | PROPOSTO |
| TASK-PLAN-042 | Fechar a divergência de fontes do PR #22 (colisão de identidade em 12 citações, FIND-CURI-R40) | WO-SEC-001 | 040 | JS | `sources.json` com chaves únicas; validador impede o verde falso de "87/87" | PROPOSTO |
| TASK-PLAN-029 | Consolidar o Design System e os templates canônicos | WO-DS-001 | 001 | JS | `fix/shell-consolidation` + `grook_10_26` (chrome, home, desks por módulo, sem DS concorrente) com decisão única de identidade visual; gate de `registers/canonical/surface-contracts.v2.json` verde | PROPOSTO |

### Fase 5 — Encerramento: o que não serve mais

| task | título | WO | deps | ling. | aceite | status |
|---|---|---|---|---|---|---|
| TASK-PLAN-050 | `docs/DECOMMISSION-REGISTER-v0.1.0.json` — inventário do superado | WO-PMO-001 | 001 | DOC | cada item com `motivo`, `substituidoPor`, `acao`, `decisor` e `status` (`FINALIZADO` / `PROPOSTO`) | **DONE** (neste PR) |
| TASK-PLAN-051 | Eliminar as branches duplicadas `archivamento` e `planning` | WO-PMO-001 | 001 | — | ambas apontam para `87c537fe`, contida em `main`; apagar (`git push origin --delete` — a API do plugin não expõe delete de branch) | PROPOSTO (owner) |
| TASK-PLAN-052 | Consolidar as 18 issues em 3 trilhas e fechar as absorvidas | WO-PMO-001 | 013 | — | #23 absorvida pela #25 (contrato de admissão); #10/#11 absorvidas pelo inventário; as demais ganham `assignee` | PROPOSTO (owner/Kernel) |
| TASK-PLAN-053 | Nomear dono por task/issue (hoje: **zero assignees** em 18 issues) | WO-PMO-001 | 013 | — | cada task do registro tem `owner`; cada issue aberta tem responsável | PROPOSTO |
| TASK-PLAN-054 | Normalizar o limite de deploy do Vercel (100/dia) | WO-E2E-001 | 012 | CI | preview disponível em toda PR ativa (hoje 8 falhas por limite de plano) | PROPOSTO |
| TASK-PLAN-055 | Definir a automação recorrente com orçamento e rastreabilidade | WO-AUTO-001 | 001 | PY | cada rotina (aquisição, indexação, auditoria) com custo máximo, intervalo, fonte de estado e critério de parada; orçamento medido em execuções | PROPOSTO |
| TASK-PLAN-056 | Preservar o bloqueio de homologação até a admissão | WO-HOM-001 | 002 | DOC | `WO-HOM-001` permanece `HOLD_HUMAN` em todas as revisões; nenhum merge/deploy/migração aplicada antes da decisão verificável | **BLOCKED** (externo) |

---

### Cobertura de WOs (verificada pelo gate contra a fila rev 20)

| WO | status na fila | task(s) |
|---|---|---|
| WO-PMO-001 | DONE | T0.001, T0.005, T1.010–T1.014, T5.050–T5.053 |
| WO-ADM-001 | IN_PROGRESS | T0.002 (BLOCKED), T0.003 |
| WO-SEC-001 | IN_PROGRESS | T0.004, T0.015, T0.016, T2.020–T2.022, T3.030–T3.034, T4.040–T4.042 |
| WO-E2E-001 | IN_PROGRESS | T5.054 |
| WO-DS-001 | QUEUED | T4.029 |
| WO-CKO-001 | QUEUED | T3.027 |
| WO-AUTO-001 | QUEUED | T5.055 |
| WO-CKO-COFEN-001 | QUEUED | T3.028 |
| WO-GOV-TRANS-001 | IN_PROGRESS | T2.026 |
| WO-HOM-001 | HOLD_HUMAN | T5.056 (BLOCKED) |

**Pendências:** 31 (13 dos Simulados + 18 issues) — todas cobertas por `TASK-PLAN-013`.

---

## 4. Ordem de execução (sem ambiguidade de sequência)

```
F0.001 ──► F0.002 (decisão externa) ──► F0.003 ──► F0.004
   │
   └──► F0.005 ──► F1.012 ──► F1.014 (baseline dos FINDs)
                    │
                    └──► F1.013 (vínculo issues + Simulados)
                             │
F2.021 ──► F2.022 ──► F3.030 ──► F3.031 ──► F3.032 ──► F3.033 ──► F3.034
              │                              └────────► F4.040 ──► F4.041 ──► F4.042
              └──────────► F2.020 (doc)

F1.010 + F1.011 (entregues) ──► F5.050 ──► F5.051/052/053/054
```

**Três tasks destravam tudo:** `TASK-PLAN-002` (decisão do Kernel — externa), `TASK-PLAN-001` (reconciliar a fila) e `TASK-PLAN-013` (vínculo das 31 pendências). Sem o item 002, nada é promovível — e o gate vermelho do `main` é **consequência**, não causa.

---

## 5. Riscos e contramedidas

| risco | probabilidade | contramedida |
|---|---|---|
| Snapshot do inventário envelhece sem ninguém perceber | alta | gate de cobertura re-derivando (F1.010) + `snapshotDate` vs. revisão da fila |
| Fixes de auditoria só existem em comentários (perda) | alta | F1.014 — baseline commitada por PR; descomissionamento registra o que foi superado |
| Spec genérica ser executada como está, semlastro | média | D-03 + doc de cenários com limitação e modo por cenário |
| `main` continua desprotegido enquanto o plano anda | alta | F0.004 é pré-requisito de qualquer promoção; evidência de enforcement obrigatória |
| Auditoria tocar banco de produção | baixa | modo postgres é `READ ONLY` + rollback; policy `do not touch production`; sem URL → modo estático |
| Motivar mais auditoria e não convergir | alta | regra: **1 baseline commitada > 35 FINDs em comentário**; F1.014 fecha o ciclo |

---

## 6. O que este PR entrega (artefatos)

| arquivo | o que é | linguagem |
|---|---|---|
| `docs/PLAN-PMOKERNEL-FINALIZATION-v0.1.0.md` | este plano | DOC |
| `docs/PLAN-TASKS-PMOKERNEL-v0.1.0.json` | registro de tasks legível por máquina (base do gate) | DOC |
| `docs/AUDIT-DATA-KERNEL-SCENARIOS-v0.1.0.md` | 13 cenários de auditoria mapeados ao repo | DOC |
| `docs/DECOMMISSION-REGISTER-v0.1.0.json` | o que não serve mais + ação + quem decide | DOC |
| `registers/governance/audit-policy.v1.json` | política como código (JSON, sem deps) | DOC |
| `scripts/check-pending-coverage.mjs` | gate de cobertura (fail-closed) | JS |
| `scripts/check-register-schema.mjs` (+ `.test.mjs`) | validador de schema do inventário (fail-closed) | JS |
| `scripts/check-pending-coverage.test.mjs` | 12 testes negativos | JS |
| `scripts/audit_data_kernel.py` | motor de auditoria (estático + postgres read-only) | PY |
| `tests/test_audit_data_kernel.py` | 17 testes | PY |
| `ci/pending-coverage-gate.yml` (+ `ci/README.md`) | gate no CI (paths-filtered) — **fora de `.github/workflows/` porque a API do plugin bloqueia escrita nessa pasta** | CI |

**Limite medido (31/10):** a API do plugin **bloqueia escrita em `.github/workflows/`** (`connector_tool_error` em todas as tentativas; um push anterior chegou a reportar OK com saída vazia e **não** criou o ficheiro — 9 dos 10 arquivos do PR estão presentes, o workflow é o único fora). O ficheiro do gate vive em `ci/pending-coverage-gate.yml` e a activação é uma cópia de uma linha pelo owner (instruções em `ci/README.md`).

**Verificação local (executada):**
- `node --test scripts/check-pending-coverage.test.mjs` → **12/12 verdes**
- `node --test scripts/check-register-schema.test.mjs` → **10/10 verdes** (e o validador passa contra o inventário real: 10 WOs, 13 pendências, 18 issues, 4 gaps)
- `python3 -m unittest discover -s tests -p 'test_*.py' -q` → **17/17 verdes**
- **Gate contra dados reais** (fila rev 20 + inventário `1ab0561` + este registro): 10 WOs · 35 tasks · 31 pendências → **0 órfã, 0 WO sem task, 4 GAP_ABERTO** (os gaps reais, ainda abertos).

---

## 7. Nota de honestidade

Este plano **não** afirma que a cobertura está resolvida — o próprio inventário declara `completeness: NOT_VERIFIED` e `GAP-01…GAP-04` abertos, e o gate deste PR ainda reporta `SKIP` enquanto o inventário não aterrissar no `main`. Ele **não** fecha issues, **não** apaga branches, **não** mexe em `main`, `Supabase`, segredos ou permissões. O que ele faz é tornar a cadeia `FIND → … → Homologação` **verificável por máquina** — que era exatamente o que faltava e que a diretriz da issue #25 exige.


### Adendo de verificação — 31/10/2026 (PR #26)

O workflow **não liberador** `.github/workflows/pmo-candidate-unit-regressions.yml` foi executado no GitHub Actions [run 41218965895](https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/41218965895): **12/12** testes de cobertura, **10/10** testes de schema, **17/17** testes do Data Kernel, total **39/39 PASS**. Os novos testes cobrem task cancelada que falsamente cobre uma issue, coleções omitidas, task IDs duplicados, divergência de contagem do snapshot e GH-ID inconsistente com URL.

Verificação em arquivos reais do repositório (fila PMO rev20 em `fix/governed-activities-cli-20261026`, inventário transversal e este plano): `check-register-schema` **PASS** (10 WOs, 13 Simulados, 18 issues, 4 gaps); `check-pending-coverage` **exit 1 esperado** (10 WOs, 35 tasks, 31 pendências, **0 PENDENCIA_ORFA**, **0 WO_SEM_TASK**, **4 GAP_ABERTO**). A validação não encerra os quatro gaps; prova que o bloqueio é real e explícito.

Outros limites: CI geral do PR ainda não homologado; o workflow de release `pending-coverage-gate.yml` segue propositalmente fora de `.github/workflows`; `main`, segurança em produção e admissão Kernel permanecem sem alterações por este PR.


---

## 8. Estado do jogo — 31/10 18:56Z (remedição)

**O plano foi adotado como espinha do trabalho.** Entre 18:06 e 18:56Z, ~30 commits foram推送 para a branch deste plano (`plan/pmokernel-finalization-20261031`, tip `85d513a3`), entre eles `docs(pmo): persist GH28 coverage proof, 36 tasks and 32 live pendencies`. O registro de tasks passou de **35 → 36** tasks e as pendências vivas de **31 → 32** (entrou `GH-28`).

### Deltas medidos

| item | 14:20Z | **18:56Z** |
|---|---|---|
| branches | 23 | **24** (+ esta branch do plano) |
| PRs | 7 | **9** (+#26 plano, **+#27 topbar/Entrar**) |
| issues abertas | 18 | **19** (+**#28** P0/HOLD rotação de credencial OAuth) |
| inventário transversal | 18 issues | **19 issues** (`GH-28` rastreado; commit `3a0b2fca`) |
| fila PMO (branch de governança) | rev 20 | **rev 20** (inalterada) |
| `main` | `6c62bb61` | **`6c62bb61` (inalterada)** |
| PRs merged | 0 | **0** |

### Avanço real (verde novo)

- **PR #24 (Simulados) está 100% verde**: `verify` ✅, `candidate-unit-gates` ✅, `rpc-static-regression` ✅, `remediate` ✅ (16:23–16:26Z). Antes (14:20Z) tinha **2 falhas** (`SPE Candidate Static Gates` + `verify`). Causa: a branch passou a carregar o **gate relaxado** (`adm=find(...)` + `['PAUSED','IN_PROGRESS']`) — o conserto do P1, que existia só no PR #13, **espalhou-se**.
- **PR #27 (novo)**: `header-candidate` ✅; `verify` ❌ (mesmo P1).
- **PR #13**: `verify` ✅ + `verify-review-candidate` ✅ (18:56Z).

### Um achado que muda o diagnóstico do P1

O `pull_request` do GitHub faz checkout do **commit de merge** (base `main` + head da branch). Logo, o gate lê a fila **do `main`** (rev 18, `ADM-001=IN_PROGRESS`) com o **script da branch**:
- branch com script **duro** (`assert ... === 'PAUSED'`) → **falha**, mesmo que a fila da branch seja `PAUSED` (é o caso do PR #27, fila rev16);
- branch com o script **relaxado** → **passa** (é o caso do PR #24).

Ou seja: **o conserto precisa ir para o `main`**, e uma branch que o carregue já fica verde. Isso confirma que `TASK-PLAN-003` não é opcional — é o que fecha 5 PRs de uma vez.

### Pendência nova (descoberta nesta remedição)

`canonical-inventory` no PR #26 falha com **`Error: CHANGED_COLLISION_BASELINE`**: o auditor `scripts/audit-i18n-collisions.mjs` produziu `sourceCollisions: 118` e o gate exige `!== 115` → reprova. É **a mesma doença do gate do PMO**: baseline hardcoded que deixou de refletir o fato. O baseline está no gate (não no dado), então ele precisa ser reconciliado com a classificação vigente (115 → 118) — sem inventar classificação. Registrada como `TASK-PLAN-058`.

### Validação do gate contra o estado real (18:56Z)

```
check-pending-coverage → 10 WOs · 36 tasks · 32 pendências
                         → 0 PENDENCIA_ORFA · 0 WO_SEM_TASK · 4 GAP_ABERTO
check-register-schema  → OK (10 WOs · 13 pendências · 19 issues · 4 gaps)
```


---

## 9. Pacote "área administrativa governada" + esqueleto Vite — analysing 31/10 20:20Z

Material recebido: (a) transcrição de outra sessão a construir um esqueleto **Vite + React + TS** (20 módulos, store local, hash-chain SHA-256, dados sintéticos rotulados); (b) ZIP `finalizacao-area-administrativa (1).zip` com 11 ficheiros — relatório, roadmap, 3 scripts de teste e 6 ficheiros de código.

### O que o ZIP é

Um **pacote de patches de outra sessão**, e o próprio relatório é honesto: operou sobre "arquivos soltos" (sem `package.json`, sem `registers/`, sem os testes do repo) e marca **`npm test`, `build:spa`, `check-generated-fresh`, `check-cko-packages`, `check-contract-coverage`, navegador real e axe como NOT_RUN**. Ou seja: **candidato, não entrega** — e o gap é exatamente o que `TASK-PLAN-061` fecha.

### Medição de divergência contra o repo atual (tip da branch do plano)

| ficheiro | ZIP | repo | leitura |
|---|---|---|---|
| `src/lib/impact/impact-engine.ts` | 314 | **ausente** | novo (motor determinístico de impacto) |
| `src/lib/admin/list-query.ts` | 49 | **ausente** | novo (busca/filtro/ordem/paginação) |
| `src/components/admin/admin-topbar.tsx` | 78 | **ausente** | novo |
| `scripts/test-impact-engine.mjs` | 155 | **ausente** | novo (17 testes) |
| `scripts/test-list-query.mjs` | 42 | **ausente** | novo (6 testes) |
| `src/components/admin/admin-console.tsx` | 489 | 291 | ZIP mais rico (13 abas vs 7) **mas** |
| `src/components/admin/pmo-panel.tsx` | 102 | 66 | ZIP **não** importa `PmoReviewIntake` |
| `src/styles/admin-console.css` | 441 | 216 | ZIP mais rico |
| `scripts/test-admin-console.mjs` | 49 | 35 | ZIP mais rico |

### O risco concreto: cópia ciega **reverte** um fluxo

O `pmo-panel.tsx` do repo **importa `PmoReviewIntake`** (o componente de revisão do PMO, presente em `src/components/admin/` com 4 ficheiros). A versão do ZIP **não importa** — foi escrita sobre uma base sem ele. **Aplicar o ZIP por cima derrubaria o fluxo de revisão**, e o `admin-console.tsx` do ZIP (13 abas) foi construído sobre essa base mais pobre.
→ Por isso `TASK-PLAN-059` é **reconciliação de três vias**, não cópia: manter `PmoReviewIntake` **e** adicionar `list-query` (busca/filtro/ordenação/paginação).
Nota positiva: o ZIP importa `@/core/governance/catalog` e `registers/pmo/queue.v1.json` — **ambos existem** no repo (`src/core/governance/` com 13 ficheiros), portanto o código novo é compatível com o núcleo de governança.

### O esqueleto Vite: prohibited "DS concorrente"

O esqueleto traz **tokens próprios** e é uma aplicação separada (rotas, store, hash-chain). O repositório proíbe DS concorrente — a identidade visual e os tokens são canónicos (`contracts/cko-tokens/dist/*` + `registers/canonical/surface-contracts.v2.json`) e `check-contract-coverage` re-deriva a lista de entidades a partir do código.
→ `TASK-PLAN-060`: antes de qualquer aterragem, os tokens têm de ser **derivados** dos canónicos e o `check-contract-coverage` tem de ficar verde; e é preciso registrar a decisão: **protótipo fora do repo** ou **módulo amarrado aos contratos**. O hash-chain local é bom (deteta adulteração do histórico local) mas, como o próprio código declara, **não é prova de autoria nem auditoria imutável de servidor** — não pode ser apresentado como o mecanismo de auditoria do Kernel.

### Registo

Evidência persistida em `docs/evidence/admin-area-2026-10-31/` (relatório + roadmap recebidos, sem alteração de conteúdo). Tarefas: `TASK-PLAN-059` (aplicar por reconciliação), `TASK-PLAN-060` (esqueleto x DS canônico), `TASK-PLAN-061` (provar os gates NOT_RUN).


### 9.1 Veredictos de auditoria especializada (3 agentes, 31/10 20:30Z)

Foram despachados 3 auditores especializados (divergência/regressão · DS-contratos-governança · verificabilidade). Dois concluíram com evidência; o terceiro ficou sem acesso a ferramentas no seu turno e **recusou-se a emitir veredito sem prova** — comportamento correto, e a medição foi feita pelo caminho equivalente.

**A. Verificabilidade — bloqueadores duros medidos**

| achado | evidência | consequência |
|---|---|---|
| **Os 23 testes do ZIP ficam invisíveis ao gate oficial** | `scripts/run-tests.mjs:36` → `args: ["--test", "scripts/**/*.test.mjs"]`; os ficheiros do ZIP chamam-se `test-impact-engine.mjs` e `test-list-query.mjs` (**não** terminam em `.test.mjs`) | `npm test` e `build:spa` **não executam** os testes novos: o pacote pode passar verde com o motor totalmente quebrado |
| **check-contract-coverage corre em `npm test` E em `npm run build`** | `package.json`: `"build": "node scripts/check-contract-coverage.mjs && …"`, `"test": "node scripts/check-contract-coverage.mjs && …"` | entidade nova sem contrato ⇒ **parte o build**, não só os testes |
| **Toolchain divergente** | repo: vite 8.2.0 / plugin-react 5.2.0 / react 19.2.0 / lucide-react 0.510.0 / playwright 1.62.0 · esqueleto: vite 6 / plugin-react 4 / react 19.0 / lucide 0.468 / sem lockfile | o esqueleto fica **fora** do gate `npm audit --audit-level=high` e não é reprodutível |
| **Não há axe no repo** | dependências: playwright sim; axe-core não (existem `test-country-icon-a11y.mjs` e `test-focus-colors-i18n.mjs`) | "a11y conforme axe/WCAG automático" **não é alegável** |
| **O `ENOENT .../pglite.data` NÃO é bug do repo** | `src/lib/db.ts:71` cria `new PGlite({…})` **sem `dataDir`** (in-memory) | é artefacto do runtime da outra sessão → a `TASK-PLAN-031` fica defensiva, não correctiva |

**B. DS, contratos e governança**

- `registers/canonical/surface-contracts.v2.json` (v2.0.0, `authority: EXPLICIT_REVIEWED_SOURCE_IMPORT_CONTRACT`, scope `CE_PUBLIC_BACKUP_ONLY`) indexa contratos **por caminho de ficheiro**; o gate re-deriva as entidades do código. `impact-engine`, a aba `impact` e o `admin-topbar` entram como **entidade sem contrato** (violação 1) enquanto não forem declarados; se `PmoReviewIntake` deixar de ser lido por alguém, o contrato correspondente fica **órfão** (violação 3).
- **Esqueleto Vite = DS concorrente.** A autoridade é `contracts/entities/design-tokens.v1.json` (frozen) + `src/lib/site-data.ts`; os tokens próprios do esqueleto são uma segunda fonte de verdade. **Não deve aterrar dentro da árvore do repo.**
- **Hash-chain local ≠ auditoria.** SHA-256 em `localStorage` é integridade client-side reescrevível: sem ator autenticado, sem atestação de servidor. O registo correto numa UI local é log append-only **rotulado como não atestado**, com decisão humana explícita e `PENDING`/`HOLD` — nunca `DONE`/`APPROVED` automático (coerente com `WO-HOM-001=HOLD_HUMAN`).
- **Classificação do `pmo-panel`**: **regressão de governança** (o ZIP substitui o `PmoReviewIntake` por `list-query` — troca-se uma superfície de decisão por uma de listagem) **com ganho de listagem**. Reconciliação mínima: intake **fica**, `list-query` **entra** como camada de consulta.

**C. Veredito final do pacote**: pode ser aceite como **código entregue**, **não** como **PASS verificado**. O bloqueio principal não é o código — é (i) integrar os testes no glob oficial, (ii) declarar as entidades novas nos contratos, (iii) preservar o intake, (iv) manter o esqueleto fora do repo, (v) executar N1+N2 no toolchain canónico.

**Tarefas novas (persistidas):** `TASK-PLAN-062` (testes no glob oficial), `TASK-PLAN-063` (contratos canónicos das entidades novas), `TASK-PLAN-064` (preservar `PmoReviewIntake` + `list-query`), `TASK-PLAN-065` (hash-chain → log local rotulado, não atestado).


---

## 10. O Commander e as sugestões da outra IA — fechados como tasks (31/10 21:00Z)

### 10.1 Commander: o que existe, o que não me chegou, o que está por registar

**O que existe no repo (canónico):** `src/components/admin/commander-panel.tsx` (175 linhas) — preparação local, honesto: *nenhum provedor está conectado a esta tela*, *o Commander não invoca o avaliador determinístico nem autoriza execução*, *as instruções em `agents/` são documentos, não executores registrados*. Está ligado à aba `commander` do `admin-console.tsx` — e o gate `check-pmo-queue.mjs` **lê `admin-console.tsx` e `pmo-panel.tsx`**, logo mexer no console/panel mexe no gate do PMO (por isso T0.091/T0.092 são precedes da aplicação do pacote).

**O que não me chegou:** o `commander(1).zip` (mockup candidato) **não está entre os anexos que recebi** — só tenho a descrição dele no relatório da outra IA: `review.approved=false`, `releaseAuthorized=false`, `NOT_HOMOLOGATED`, matriz **M01–M22 (7 macrogrupos/22 módulos) sem fonte canónica**, e **1 divergência entre 36 hashes declarados**. Para reconciliar preciso do ficheiro → `TASK-PLAN-099`.

**Lacuna de registo encontrada por mim:** o `FIND-MOD-001` citado nesse relatório **não existe** em `registers/governance/find-register.v1.json` (11 FINDs registados: FIND-CTR-010..013, FIND-TRANS-*, FIND-PMO-COVERAGE, FIND-CKO-IMPORT-ROUTE, FIND-SPE-RPC-ANSWER-EXPOSURE — **nenhum MOD**; `search_code` por `FIND-MOD-001` devolve 0). Ou seja: a pendência do Commander **vivia só fora do registo** — exatamente o que a diretriz da issue #25 proíbe. → `TASK-PLAN-107`.

### 10.2 As sugestões da outra IA → task de origem (nada fica só na conversa)

| sugestão da outra IA | destino |
|---|---|
| 1. "Enviar o repositório completo (desbloqueia tudo)" | **parcialmente satisfeita**: tenho leitura via App GitHub e já auditei o repo; falta o clone para correr N1 → `TASK-PLAN-094` |
| 2. Tela de decisão de impacto ligada ao motor (Impacta / Não impacta / Escalar, com justificação por severidade) | `TASK-PLAN-095` |
| 3. Fixar o formato dos dados do grafo (`dependencia_conteudo`, `versao_normativo`, `mudanca_versao`) em contrato JSON versionado, com validador e gate | `TASK-PLAN-096` |
| 4a. Aprovar a matriz de severidade (`approved:false`) | `TASK-PLAN-097` — **BLOCKED**, decisão dos donos de conteúdo/risco |
| 4b. Decidir identidade e backend (destrava logout, perfil, alertas, CRUD remoto) | `TASK-PLAN-098` — **BLOCKED**, decisão do dono |
| 4c. Fornecer a matriz M01–M22 (FIND-MOD-001) | `TASK-PLAN-099` — **BLOCKED**, falta a fonte canónica |
| 5. Mais listas com o `list-query` (fontes, templates, achados, auditoria) | `TASK-PLAN-100` |
| 6. Auditoria de acessibilidade real (teclado, viewports 320/390/768/1280) | `TASK-PLAN-101` — com a ressalva medida: **o repo não tem axe** (tem playwright 1.62 e testes de a11y próprios) |
| "Commander ligado ao Kernel" | `TASK-PLAN-104` — **BLOCKED** por `TASK-PLAN-002` (admissão) |
| "Identidade, persistência e auditoria" | `TASK-PLAN-098` + `TASK-PLAN-106` |
| "Composição e configuração do site" (idioma, rotas, SEO, JSON-LD, templates, manifesto, aprovação, preview, publicação, retirada, rollback) | `TASK-PLAN-105` |
| 5 módulos propostos (APIs/fornecedores · mídia/SEO/redirecionamentos · registo clínico e testes de referência · selo de proveniência e máquina do tempo · simulador de revogação · modo auditor e playbooks) | `TASK-PLAN-103` (backlog com escopo e gate por módulo) |
| Biblioteca de 17 componentes (DataTable, FilterBar, Tabs, Drawer/Modal, FormField, DiffViewer, Timeline, GraphView, Toast, Skeleton, ErrorState, PermissionDenied, SourceStamp, DisabledAction, StatusBadge, Stepper, KeyValueList) | `TASK-PLAN-102` — **biblioteca única**, tokens derivados, cada componente com contrato |
| "Ordens, PMO e agenda duráveis" · "Fontes, extração e átomos" | já cobertas por `TASK-PLAN-013` e `TASK-PLAN-027` |
| DS: "a divergência com a direção preto/branco continua em HOLD (WO-DS-001)" | `TASK-PLAN-029` — mantém `HOLD_HUMAN`, não se resolve por inferência |

**Nada disto foi aplicado ao código.** Tudo registado como task com acceptance verificável; o registo remoto vai de 72 → **86 tasks**.


---

## 10.3 Auditoria independente do pacote Commander (31/10 21:25Z) — o HOLD da matriz era evitável

**Veredito: candidato com HOLD, não PASS verificado.** O pacote é material de design e rastreabilidade; não é integração canónica nem autoridade.

**1) Integridade, medida por mim (não herdada do enunciado).** O `artifacts/delivery-manifest.json` declara **40** entradas (36 ficheiros + 4 inputs); recalculei o SHA-256 de cada uma: **39 conferem, 1 diverge — `src/App.tsx`** (declarado `c75313ee…`, medido `a16223547…`); 0 ausentes. CSV completo em `docs/evidence/commander-2026-10-31/hashes-verificacao.csv`.

**2) O defeito maior é de processo:** o verificador que o pacote entrega (`scripts/validate-manifest.mjs`) **só valida o JSON contra o schema AJV — não recalcula um único hash**. `pnpm check:manifest` não deteta a divergência; o passo 1 do `handoff.md` ("conferir hashes") não é automatizável com o que o pacote entrega. → `TASK-PLAN-114`.

**3) A matriz M01–M22 EXISTE no repo:** `docs/governance/commander/MANUS_MODULE_CROSSWALK_CANDIDATE_20261026.md` @ branch **`fix/governed-activities-cli-20261026`** (**não está no `main`**). O caminho estava no comentário do dono na issue #16 (`#issuecomment-6427776320`); a busca de código do GitHub **só indexa a branch por defeito** — foi isso que produziu o `FIND-MOD-001` HOLD. A matriz traz os 7 macrogrupos e os **22 módulos com nomes** (M01 Visão Geral … M22 Gestão Corporativa e Terceiros; 4+2+4+4+2+4+2 = 22), a Central de Comando transversal a M01/M03/M07/M16/M19/M20/M14 (não é Kernel/PMO/storage) e o layout obrigatório 65/35. **Copia com proveniência** em `docs/evidence/commander-2026-10-31/`.
   ⇒ fecha-se o *gap de acesso à fonte* (`TASK-PLAN-113` → PROPOSTO); **mantém-se o HOLD de autoridade** (é transcrição-resumo PROPOSTO; o DOCX original não está no repo → `TASK-PLAN-119`).

**4) Linhagem:** o ZIP reenviado é a linhagem com `delivery-manifest`/`validation`/`handoff`; **não** inclui a linhagem "continuidade local" (comentário `6428694625`: `CommanderReadModel`, `ce-ds-bridge.candidate.css`, `test-host-adapter.mjs`, `INTEGRATION_README.md`, `candidate-manifest.json`) — confirmei que o `src/App.tsx` recebido não tem `CommanderReadModel`. É a pista mais provável para a divergência de hash. → `TASK-PLAN-115`.

**5) Delta workspace "Planejar" vs repo** (`delta-planejar-vs-repo.json`): `admin-console.tsx` 485→291 linhas e `commander-panel.tsx` 280→175 (redesign **não integrado**); `pmo-panel.tsx` 64→98 (**o repo está à frente**: tem `PmoReviewIntake` + `queryPmo`); `design-tokens.v1.json` e `queue.v1.json` **IDÊNTICOS** → tokens canónicos e fila PMO **não foram tocados** ✔. → port em `TASK-PLAN-116`.

**6) Estado real do repo medido:** `src/lib/admin/list-query.ts` PRESENTE (54 linhas) e `src/components/admin/pmo-review-intake.tsx` PRESENTE (132 linhas, importado pelo `pmo-panel.tsx`) → **`PmoReviewIntake` preservado** (`TASK-PLAN-092` → DELIVERED_PENDING_GATE). `src/lib/impact/impact-engine.ts` e `src/components/admin/admin-topbar.tsx` **AUSENTES** → `TASK-PLAN-118`. `registers/canonical/surface-contracts.v2.json` (275 linhas) **não declara** `impact-engine`, `list-query`, `admin-topbar` nem `PmoReviewIntake` → `TASK-PLAN-091` segue aberto. No CSS coexistem **`.ce-admin-empty` e `.ce-admin-list-empty`** (duplicação semântica real) e `ce-admin-listbar`/`chip`/`topbar` têm **0 ocorrências** (não portados).

**7) Limites confirmados:** `review.approved=false`, `reviewer=null`, `independent=false`, `releaseAuthorized=false`, `executionEvidence=null`, status `CANDIDATE_WITH_HOLDS`; `axe`/teclado = **NOT_RUN**; execução real (LLM/Kernel/agentes/API/auth/banco) desligada; uma rota declarada (`/`), M01–M22 como âncoras, não rotas.

**8) Continua a ser do dono:** o estado de `WO-DS-001` (fila rev. 18 = `QUEUED` vs `HOLD_HUMAN` do comentário `6427869597`, **sem resposta**) → `TASK-PLAN-117`; a revisão independente (`approved=false`); a linhagem final do pacote.


---

## 11. Esqueleto CE (Experience Platform) — construído localmente e verificado (31/10 21:45Z)

O dono pediu o "esqueleto completo localmente, com todos os recursos". Feito e medido, **fora do repo canónico** (sem WO de admissão, sem alterar `main`):

- **45 famílias** (36 domínio + 9 transversais) · **410 serviços lógicos** (274 DOMAIN · 97 PLATFORM · 39 CROSS_CUTTING) · **201 capabilities** em 20 famílias · **16 bindings** por tipo de objeto · **3 schemas** de piloto (Article, LibraryEntity, ClinicalTool).
- **905 ficheiros gerados** por script determinístico (o catálogo é a verdade; `--check` falha em qualquer drift), **70/70 testes verdes** (45 de família + 20 de capability + 5 de piloto), **gate de estrutura 8/8 verde** e fail-closed (sem serviço órfão, sem `PASS`/`APPROVED`/`ADMITTED` sem evidência, sem capability por declarar, sem drift de toolchain).
- **Tudo em `CANDIDATE_HOLD`**: 410 serviços que **lançam** `NOT_IMPLEMENTED_CANDIDATE_HOLD`; nenhum mock finge sucesso. Só o piloto tem lógica (resolver puro, estado guest-first, schemas) — coerente com o parecer da outra IA de não codificar 201 capabilities.
- **Toolchain fixada na canónica** (vite 8.2.0 · react 19.2.0 · lucide-react 0.510.0 · typescript 5.7.0) para portabilidade sem partir `npm audit --audit-level=high`.
- **Persistido**: `docs/evidence/experience-platform-skeleton-2026-10-31/` (avaliação + catálogo) e `tools/experience-skeleton/` (gerador + gate + piloto) — tasks `TASK-PLAN-120` a `TASK-PLAN-124`.
- **Aberto, por decisão do dono:** fundir o vocabulário antes de admitir qualquer WO (`T0.121`), schemas centrais no registo canónico (`T0.122`), acessibilidade real por medir (`T0.123`) e o port ao repo canónico (`T0.124`, BLOCKED).


---

## 12. Comparação CE × produção × repo × normativos × plataformas (01/11/2026)

**Estado:** 6 frentes concluídas e verificadas; 22 tasks novas registadas (`TASK-PLAN-134` a `TASK-PLAN-155`). Nenhuma altera `main`, a fila PMO, Supabase de produção, segredos ou permissões. `WO-HOM-001` e o DS mantêm `HOLD_HUMAN`.

**Evidência:** `docs/evidence/ce-comparacao-2026-10-31/` — os 6 relatórios de frente (`producao-conta-funil`, `producao-superficie-busca`, `repo-publico-branches`, `normativos-enfermagem`, `normativos-federais`, `benchmarks-plataformas`), o evidence pack E1–E5, a lista oficial das 182 refs e o relatório final de síntese.

### 12.1 Números medidos que corrigem o registo anterior

| Medida | Valor | Como foi medida |
|---|---|---|
| Branches do repo público | **181 + `main` = 182 refs** | `git for-each-ref` sobre o clone; 0 divergências de sha contra `branches-todas.json`. A lista de 30 do E2 vinha de paginação errada (`per_page` em vez de `perPage`) |
| Churn de agente | **137/181 (75,7%)** | `fix` 61 · `codex` 52 · `copilot` 14 · `refactor` 10 |
| Branches do núcleo conta→cobrança→ads | **114/181 (63%)** por nome | classificador por palavra-chave, regra explícita e auditável |
| Conteúdo órfão em branches | **1.524.448 B** em 7 de 30 branches testadas | teste de blob exclusivo; **151 branches não testadas — risco não medido, não se afirma zero** |
| Serviços sem capability mapeável | **236/410 (57%)** | cruzamento `service-catalog` × registo de capabilities, por sobreposição de tokens (heurística declarada) |
| Capabilities sem serviço mapeável | **49/201 (24%)** | idem |
| Tipos de objeto com schema | **3 de 16** | `article`, `clinical-tool`, `library-entity` |
| Elementos da Composition de simulados com cobertura completa | **3 de 12** | 8 têm serviço mas nenhum tipo de objeto |
| Bindings capability↔objeto aprovados | **0 de 16** (`support: PROPOSED` em todas) | registo canónico |
| Normas federais confirmadas na API do Senado | **3** (7.498/1986, 8.080/1990, 5.905/1973) | 2 rotas de confirmação cada |
| Normas provadas **ausentes** do dataset do Senado | **2** (Res. Cofen 736/2024, Portaria GM/MS 6.734/2025) | 11 estratégias + prova de escopo; sustentação pelo DOU/in.gov.br |

### 12.2 Os quatro achados estruturais

1. **As três camadas do esqueleto não se tocam.** O registo de 201 capabilities tem 14 campos e **nenhum aponta para um serviço**; os 16 bindings também não. 236 dos 410 serviços ficam inalcançáveis — incluindo `authority-binding` e `contradiction-detection` (que respondem ao `FIND-CTR-010` do corte de Aldrete) e `moderation`/`abuse-report` (de que o fórum vivo da produção precisa). **É esta a lacuna de maior consequência do esqueleto, e é estrutural, não de volume.**
2. **A superfície mais trabalhada do produto é a que o esqueleto não modela.** 63% das branches são do núcleo conta→cobrança→ads; o esqueleto tem `owner_scope: ACCOUNT` como campo e mais nada.
3. **Higiene clínica é o risco de maior consequência.** O corte de Aldrete implementado (8 pontos, fonte CFM) contra o publicado (9 pontos) é uma divergência real e não resolvida; a lista de notificação compulsória publica 73 entradas sob uma portaria de 2026, e a vigência das fontes não é modelada.
4. **Guest-first é correcto para o núcleo clínico e falso para o resto.** A produção é guest no núcleo de cálculo/leitura/impressão e account-centric em monetização, identidade, comunidade e telemetria. O esqueleto modela o núcleo e omite o resto.

### 12.3 As 22 tasks registadas

| Task | Fase | Título | WO | Dono | Estado |
|---|---|---|---|---|---|
| `TASK-PLAN-134` | F1 | Ligar a camada de servico a camada de capability: campo service_ref + validacao fail-closed | WO-DS-001 | Mavis + equipa especializada | PROPOSTO |
| `TASK-PLAN-135` | F4 | Expor a familia evidence-claims: authority-binding, applicability, contradiction-detection e lineage | WO-CKO-COFEN-001 | Donos de conteudo e risco | PROPOSTO |
| `TASK-PLAN-136` | F4 | Expor a familia community: moderation, abuse-report e identity-aware-profile | WO-SEC-001 | Responsavel autorizado pelo broker + revisor de seguranca | PROPOSTO |
| `TASK-PLAN-137` | F4 | Tipos de objeto da Composition de simulados: 8 de 12 sem tipo de objeto nem schema | WO-DS-001 | Mavis | PROPOSTO |
| `TASK-PLAN-138` | F4 | Completar os 13 tipos de objeto sem schema (3 de 16 com schema) | WO-DS-001 | Mavis | PROPOSTO |
| `TASK-PLAN-139` | F4 | Declarar as 4 familias transversais ausentes: Identity/Account, Billing, Entitlement, Telemetry/Consent | WO-DS-001 | Mavis | PROPOSTO |
| `TASK-PLAN-140` | F4 | Regra dura de entitlement: so owner_scope ACCOUNT autoriza, e desambiguar 'sync' | WO-DS-001 | Mavis | PROPOSTO |
| `TASK-PLAN-141` | F4 | Reescrever telemetry_contract como contrato e subir o Event Backbone de P1 a P0 | WO-DS-001 | Mavis | PROPOSTO |
| `TASK-PLAN-142` | F4 | Preencher os 11 campos em falta no registo de capabilities (supported_channels, permission_policy, audiences, policy_refs...) | WO-DS-001 | Mavis | PROPOSTO |
| `TASK-PLAN-143` | F1 | Divergence register producao-esqueleto: cada divergencia da comparacao vira FIND com dono | WO-GOV-TRANS-001 | Mavis | PROPOSTO |
| `TASK-PLAN-144` | F1 | Reverificar o corte de Aldrete: 8 pontos (fonte CFM) contra 9 pontos publicados | WO-CKO-COFEN-001 | Donos de conteudo e risco | PROPOSTO |
| `TASK-PLAN-145` | F1 | Registo das alteracoes vetadas: art. 15-D (Lei 14.434/2022) e 15-E (Lei 14.602/2023) na Lei 7.498/1986 | WO-CKO-COFEN-001 | Donos de conteudo e risco | PROPOSTO |
| `TASK-PLAN-146` | F1 | Res. Cofen 736/2024 e Portaria GM/MS 6.734/2025: prova de ausencia no dataset do Senado e sustentacao pelo DOU | WO-CKO-COFEN-001 | Donos de conteudo e risco | PROPOSTO |
| `TASK-PLAN-147` | F1 | Divergencia de vigencia da lista de notificacao compulsoria: 73 entradas contra a Portaria 10.175/2026 | WO-CKO-COFEN-001 | Donos de conteudo e risco | PROPOSTO |
| `TASK-PLAN-148` | F1 | Divergencia medida no simulado de notificacao: 30q (E1) contra 50 questoes (meta description ao vivo) | WO-GOV-TRANS-001 | Mavis | PROPOSTO |
| `TASK-PLAN-149` | F0 | Decisao do dono sobre as 3 tensoes entre promessa publicada e comportamento (politica, termos, oferta) | WO-PMO-001 | Owner | PROPOSTO |
| `TASK-PLAN-150` | F0 | Decisao do dono: o CE local tera backend, e o que acontece a ACCOUNT e WORKSPACE | WO-PMO-001 | Owner | PROPOSTO |
| `TASK-PLAN-151` | F1 | Registar as 10 branches backup como baseline com dono, e nao as arquivar | WO-GOV-TRANS-001 | Mavis | PROPOSTO |
| `TASK-PLAN-152` | F1 | Preservar o conteudo orfao das branches de billing/ads: 1,5 MB que so existem la | WO-GOV-TRANS-001 | Mavis | PROPOSTO |
| `TASK-PLAN-153` | F1 | Corrigir o registo de medicao: 181 branches + main (182 refs), nao 182 branches | WO-GOV-TRANS-001 | Mavis | PROPOSTO |
| `TASK-PLAN-154` | F4 | Reconciliar o contrato de saida (print/pdf/docx) com o template-contract de producao antes de escrever output.ts | WO-DS-001 | Mavis | PROPOSTO |
| `TASK-PLAN-155` | F4 | i18n: onde vivem os 19 idiomas - locale-registry.ts e site-data.ts nao estao no main de nenhum repo | WO-E2E-001 | Mavis | PROPOSTO |

### 12.4 Decisões que ficam com o dono (não são tasks de execução)

- **`TASK-PLAN-149`** — as 3 tensões entre promessa publicada e comportamento (política × login/checkout; termos × assinatura; oferta/paywall × fórum). **Não é parecer jurídico**; é uma leitura de texto publicado. A qualificação cabe ao dono.
- **`TASK-PLAN-150`** — o CE local terá backend? Se não, `ACCOUNT`/`WORKSPACE` ficam permanentemente reservados e a produção não pode ser espelhada; se sim, é preciso dizer quando.
- **`TASK-PLAN-151`** — registar as 10 branches `backup/*` como baseline com dono, sem as arquivar; e decidir qual dos 4 baselines paralelos de menu é o bom (não medido).
- **`TASK-PLAN-152`** — preservar (ou não) os 1,5 MB órfãos de `audit/billing-ads-*` e `base44/setup-*` antes de qualquer limpeza de branches.

### 12.5 O que ficou por medir (e não se afirma o contrário)

- Teste de órfão em 151 das 181 branches (a varredura de blobs excedeu o orçamento no clone em NFS).
- Conteúdo real de qualquer branch: o tema é **inferência pelo nome**, com regra explícita.
- Medição em browser (a11y, layout, performance, funil): **NOT_RUN** — não há browser neste ambiente.
- Texto integral de artigo das três leis federais: a API do Senado devolve metadados, não cláusulas.
- `src/lib/locale-registry.ts` e `src/lib/site-data.ts` **não existem** no `main` de nenhum dos dois repositórios: onde vivem os 19 idiomas é `NOT_RUN`.

### 12.6 Estado de governança desta branch (medido 01/11/2026 02:10Z)

| Facto | Medido |
|---|---|
| `main` | `e9f7fe66075ebe5d7346072dc3a1b4934678c6de` — **"Merge pull request #26 from IndiciumFIN/plan/pmokernel-finalization-20261031"**, 31/10 23:27:34Z. **O PR #26 foi fundido em `main` antes desta comparação** |
| Esta branch | `plan/pmokernel-finalization-20261031` @ `c01507054ff6` — **descendente de ambos os pais de `main`**, logo o merge para `main` é fast-forward limpo quando o dono decidir |
| **PR #29** | **Aberto, `draft: false`**, título *"Revert \"[PLAN/HOLD] Plano de finalização PMO × Kernel — …"*, head `revert-26-plan/pmokernel-finalization-2026…`. **É um revert do PR #26.** O corpo do PR **não foi lido** (`NOT_RUN` — o conector falhou repetidamente com `connector_tool_error`); a **razão do revert é desconhecida** — **CORRIGIDO em §12.8**: lido depois por API REST (o corpo contem apenas `Reverts #26` + um resumo automático do Cursor Bugbot; **não há justificação escrita do Kernel**). Acrescentado em §12.8: o PR está **vermelho** (o CI falha por reintroduzir o P1 de `check-pmo-queue.mjs:32`) e o inventário dos 128 ficheiros |
| O que está só na branch (não em `main`) | As 22 tasks `TASK-PLAN-134..155`, o `TASK-PLAN-133` corrigido, o `TASK-PLAN-151` corrigido, a secção 12 deste plano e os 6 relatórios + `RELATORIO-COMPARACAO.md` em `docs/evidence/ce-comparacao-2026-10-31/` |

**Consequência a considerar pelo dono:** se o PR #29 for fundido, `main` perde o plano **e** o `find-register` volta ao estado anterior — e as 22 tasks desta comparação (que dependem do registo canónico) ficam órfãs. **Não setook nenhuma acção sobre o PR #29**: abrir, fechar ou fundir um revert é decisão do dono/Kernel, não do agente.

### 12.7 Fecho da comparação e correções da verificação final (01/11/2026 02:45Z)

**Estado:** a comparação está **fechada** — 6 relatórios de frente + a síntese (`RELATORIO-COMPARACAO.md`, 136 KB, 31 linhas de TABELA-MESTRE, 56 deltas accionáveis, cadeia de evidência por linha crítica), todos persistidos em `docs/evidence/ce-comparacao-2026-10-31/` e no ZIP `comparacao-ce-2026-11-01.zip` (verificado por re-extracção: esqueleto sem drift, capturas 36/36 com SHA-256 OK).

**A verificação adversarial reprovou a síntese em duas rondas.** As cinco observações que sobreviveram à segunda ronda foram **medidas pelo owner antes de corrigir** — não aceitei a reprovação como facto nem a descartei:

| # | Observação do verificador | Medição do owner (01/11) | Correção |
|---|---|---|---|
| 1 | "`tool-sources.v1.json` e `tool-bindings.v1.json` não existem neste sandbox" | **FALSO** — existem em `contracts/entities/`; 6/6 `source_type` fora do enum canónico, 6/6 `integrity.sha256` = 64 zeros | Afirmação corrigida em L-11, C-15 e A-21 |
| 2 | Contagem de bindings fora do enum | **78/78** fora do enum **ou ausentes** (46 com `decision: BOUND` + 32 sem o campo) — o número que circulava (46/78) contava só os preenchidos | Corrigido em L-11 |
| 3 | E5 diz "70/72 testes (45+20+5)" | Contagem por leitura: **73 declarações** (65 ficheiros em `src/` com 1 cada + `tests/pilot.test.ts` com 8) | Corrigido; o E5 mede 8 no piloto, não 5 |
| 4 | README diz "gate 8/8" | **Executado:** `node scripts/check-skeleton.mjs` → **11/11 checks verdes** | Corrigido |
| 5 | Contagens de branches marcadas `[V]` | Vêm das frentes, não da verificação própria | Reetiquetadas para `[P-RP]` ( `[V]` é o nível mais forte e só vale para o que foi medido no próprio relatório) |

**Achado novo, registado (não ficou só no relatório):** os contratos do repo canónico violam os enums canónicos de `contracts/cko-skeleton/catalog/cko-data.json` — `source_type` (11 valores canónicos) e `authority_class` (5) e `decision` (`HOLD`/`REJECTED`/`APPROVED`). Registado em **`TASK-PLAN-156`** (fontes: reclassificar + hash real), **`TASK-PLAN-157`** (bindings: reclassificar + tornar a decisão obrigatória) e **`TASK-PLAN-158`** (gate fail-closed que reprove qualquer contrato fora do enum — hoje o gate dá 11/11 verde a um contrato inválido). O registo passa a **137 tasks** (111 PROPOSTO · 16 BLOCKED · 9 DONE · 1 DELIVERED_PENDING_GATE).

**O que NÃO mudou com a verificação:** a TABELA-MESTRE, a cadeia de evidência, os 56 deltas e o veredito por eixo. As correções foram de **rastreabilidade e de um número**, não de estrutura.

### 12.8 PR #29 — impacto medido (01/11/2026 03:20Z, via API REST do GitHub)

O corpo do PR #29 esteve **NOT_RUN** por falha do conector durante a comparação. Com o token do ambiente, a leitura foi feita por `api.github.com` — o que tambémallows medir **o CI do próprio PR** e **os alertas de segurança**, que estavam bloqueados.

**O PR #29 é a inversa exacta do #26:** 128 ficheiros, **+127 / −29.195**, 116 removidos e 12 modificados, base `main`, head `revert-26-plan/pmokernel-finalization-20261031`, criado 31/10 23:36:54Z.

| Área | Ficheiros | −linhas | O que seria apagado |
|---|---|---|---|
| `scripts/**` | 58 | 5.026 | Todos os validadores e os seus testes (inclui `verify-r80..r86`, `check-pmo-queue.test.mjs`) |
| `registers/**` | 18 | 9.337 | 17 registos de governança + rollback do `find-register.v1.json` |
| `tools/experience-skeleton/**` | 12 | 5.280 | **O esqueleto CE já portado para o repo canónico** (o port do `TASK-PLAN-124`) |
| `docs/evidence/**` | 20 | 4.378 | Todos os packs: admin-area, commander, ce-comparação, experience-platform |
| `docs/**` | 4 | 4.013 | O plano e o registo de tasks |
| `.github/workflows/**` | 2 | 463 | Os dois gates fail-closed (`ce-main-migration-audit`, `pmo-candidate-unit-regressions`) |
| `ci/**` | 2 | 87 | `ci/pending-coverage-gate.yml` — **o ficheiro do `TASK-PLAN-012`** |
| `src/**` | 9 | 337 | `PmoReviewIntake`, `list-query`, `admin-console.css`, 4 ficheiros de auth |
| `tests/**` | 1 | 197 | `tests/test_audit_data_kernel.py` |
| `package.json` + `package-lock.json` | 2 | — | `better-auth` **1.7.14 → ~1.6.30** |

**O PR está vermelho — e a causa está medida.** O CI do PR #29 falha no passo 4 *"Validar PMO canónico e histórico"* com `AssertionError: Protótipo deve permanecer congelado` em `scripts/check-pmo-queue.mjs:32`; os passos 5–20 ficam `skipped`. O revert **restaura a versão antiga de 46 linhas** desse script, que exige `WO-ADM-001 = PAUSED`, mas a fila em `main` tem `WO-ADM-001 = IN_PROGRESS` (a versão de 82 linhas que o #26 trouxe já não tem essa assert — foi o conserto do P1 medido em 27/10).

**Consequência:** o revert **reintroduz o defeito P1** que o #26 tinha corrigido, e o próprio CI do repo o apanha. Não é um revert "limpo".

**O revert também mexe na cadeia de FINDs:** `find-register.v1.json` volta de `as_of: 2026-10-31` a `2026-10-24` e perde 96 linhas, incluindo o `FIND-SPE-RPC-ANSWER-EXPOSURE-20261031` (draft de segurança) e os 2 FINDs R81.

**Alertas de segurança — medição definitiva (`TASK-PLAN-015` fechado como DONE):**

| Ferramenta | Resposta | Significado |
|---|---|---|
| Dependabot | HTTP **403** *"Dependabot alerts are disabled for this repository"* | Feature **desligada** |
| Secret scanning | HTTP **404** *"Secret scanning is disabled on this repository"* | Feature **desligada** |
| Code scanning | HTTP **404** *"no analysis found"* | Sem execução de análise |

Isto **não é "zero alertas"** — é "não existe superfície de alertas activa". O repo compensa com guardios locais (`check-better-auth-lock.mjs`, `check-auth-invariant.mjs`, `test-auth-secret-env.mjs`), dois dos quais o PR #29 modifica. Registado em `TASK-PLAN-162`.

**Nenhuma acção foi tomada sobre o PR #29.** Abrir, fechar ou fundir um revert continua a ser decisão do dono/Kernel. Registado: `TASK-PLAN-159` (inventário e decisão), `TASK-PLAN-160` (regressão de fail-closed: os 4 invariantes removidos), `TASK-PLAN-161` (downgrade do `better-auth`).

### 12.9 O port do esqueleto CE ao repo canónico está pela metade e não executa (medido por execução, 01/11/2026 03:25Z)

Ao procurar a origem do esqueleto no repo canónico, encontrou-se `tools/experience-skeleton/` em `main` — com 12 ficheiros: os dois scripts (`generate-skeleton.mjs`, `check-skeleton.mjs`) e `pilot/` com o núcleo (`resolver.ts`, `state.ts`, `metamodel.ts`, `module-status.ts`, `profile-contracts.ts`, `experience-state.ts`) e os 3 schemas do piloto.

**Mas não corre.** Executado no repo canónico:

```
$ node tools/experience-skeleton/check-skeleton.mjs
Error: ENOENT: no such file or directory, open '<repo>/tools/catalog/service-catalog.v1.json'
$ node tools/experience-skeleton/generate-skeleton.mjs --check
Error: ENOENT: no such file or directory, open '<repo>/tools/catalog/service-catalog.v1.json'
```

**Causa:** os dois scripts fazem `ROOT = resolve(dirname(import.meta.url), '..')` — esperam a raiz do esqueleto no **directório pai** — e leem `catalog/service-catalog.v1.json`, `catalog/capability-registry.candidate.v0.1.json`, `catalog/object-capability-binding.candidate.v0.1.json`, `src/core/experience/{resolver,state,metamodel,module-status}.ts` e `schemas/*.json`. Nada disso existe nesse caminho no repo: o catálogo real está em `docs/evidence/experience-platform-skeleton-2026-10-31/catalog/service-catalog.v1.json` (84.569 B) e `src/core/experience/` **não existe no repo**.

Ou seja: o `pilot/` foi copiado para `tools/experience-skeleton/pilot/`, mas os scripts continuam a esperar `src/core/experience/` — nem o catálogo nem o núcleo estão onde o código os procura.

**Consequências de governança:**
1. Um artefacto do esqueleto **está no repo canónico e aparenta estar portado, mas não executa** — o `TASK-PLAN-124` estava BLOCKED à espera de decisão de WO, e mesmo assim houve um port parcial em `main`.
2. O gate canónico **não pode contar como gate de não-regressão** enquanto não correr (`TASK-PLAN-131`): a única prova de gate é a local e datada (11/11 verde, 73 declarações de teste).
3. O PR #29 apagaria esta cópia pela mesma razão que apaga o resto — o que não é argumento a favor do revert, é facto.

**Registado em `TASK-PLAN-163`**, com a prova exigida: correr o gate no repo canónico a mostrar 11/11 verde a partir do commit, e o `--check` do gerador sem drift. Só depois o port passa de "portado" a "entregue e verificado".

**Nota de honestidade:** a comparação CE mediu o esqueleto a partir da cópia local (`/workspace/ce-skeleton`), que é coerente e tem o gate verde. O port canónico, esse, está partido — e é exactamente o que o `TASK-PLAN-124` ia decidir quando for desbloqueado.

## 13. Reconciliação CE v6 — plano sequenciado e execução em etapas (01/11/2026 03:45Z)

### 13.0 Os três universos (medido por API REST, não presumido)

| Universo | Onde vive | Escala | Estado |
|---|---|---|---|
| **A — git, governança** | `IndiciumFIN/dev-chatgpt-workspace` (público) | `main` = 1.877 ficheiros · 27 branches | É **a app CE + o pacote PMO × Kernel**. `src/lib/tools/catalog.ts` (19.579 B), `src/routes/`, `src/core/`, `contracts/entities/`, `registers/governance/`, `tools/experience-skeleton/` (12 ficheiros), `audit/execution/`. PR #29 (revert do #26) e **PR #30** ("Integrate structural candidate and validate phase 3", 485 ficheiros, +483.797, **CI 12/12 verde**) |
| **B — git, app CE** | `IndiciumFIN/calculadorasdeenfermagem` (privado) | `main` = 176 ficheiros · 17 branches | Snapshot antigo (17/10). **Medido em 17 branches: nenhum dos artefactos do sandbox lá está.** Maiores branches: `migration/full-directory-*` (18.441), `migration/candidate-f08-*` (18.458), `cursor/fix-governance-gaps-*` (9.043) — com `migration/source_snapshots/` e `data/legado/`, não o app |
| **C — sandbox local** | máquina do dono (TAR de 5.746 ficheiros) | `src/` 2.366 · `_archive/` 1.445 · `upload/` 927 · `public/` 614 · `scripts/` 150 · `e2e/` 8 · `tests/` 9 · `migrations/` 11 | **Não está em git em nenhum repositório.** Layout diferente do git (`src/data/contracts/`, `src/data/registers/`) |

**Consequência:** o trabalho do sandbox (17 contratos, 62 schemas, 83 ferramentas com conteúdo editorial, 19 idiomas + 1.149 traduções, 251 páginas de catálogo, 385 testes, 17 gates) **nunca foi publicado**. O que existe em git é um universo diferente. Reconciliar é, antes de mais, **decidir qual dos três é canónico** — e o plano abaixo faz isso por etapas, sem bloquear.

### 13.1 Etapas de execução (independentes; cada uma é uma branch + um PR)

| # | Etapa | Produz | Depende de | Bloqueia |
|---|---|---|---|---|
| **S1** | Contratos: reclassificar as 22 fontes pela **natureza** do documento + 1.031 bindings coerentes | `contracts/entities/tool-sources.v1.json`, `tool-bindings.v1.json` + registo | frente "fontes" + "bindings" | nada |
| **S2** | Gate fail-closed de integridade e referência dos contratos (não só de enum) | `scripts/check-contract-integrity.mjs` + `*.test.mjs` | S1 (para os valores) | nada |
| **S3** | Corrigir o port partido do esqueleto (`TASK-PLAN-163`) e absorver os 5 módulos `src/core/experience/` | `tools/experience-skeleton/` + `src/core/experience/` | frente "universos" | nada |
| **S4** | `FIND-CTR-010` com `canonical_id` (não `id`) e no registo activo | `registers/governance/find-register.v1.json` | S1 (para a authorityClass) | nada |
| **S5** | Espelho estático: os 5.520 destinos não resolvidos | `public/bibliotecas/catalog/` | frente "espelho" + produção | nada |
| **S6** | Evidência: os 318 recuperados, os 24 `tool-results/` removidos, os 5 symlinks de raiz, `.env` saneado | `docs/evidence/` + `.gitignore` | frente "universos" | nada |
| **S7** | Registo + fecho: tasks novas, §13, ZIP final | `docs/PLAN-TASKS-PMOKERNEL-v0.1.0.json`, plano | S1…S6 | — |

**Regra de sequenciação:** cada etapa é uma branch própria, com o seu PR, e **nenhuma espera por decisão do dono** — o que precisa de decisão fica registado como `HOLD` com o nome, não trava a etapa. As etapas S2 a S6 não dependem da entrada do sandbox no git: o que já está no repositório governança é executável hoje.

### 13.2 O que já está medido e é executável sem esperar pela equipa

**Fontes (6 no git) vs artefactos preservados** — medido por SHA-256 sobre o pacote de capturas (36 artefactos, 36/36 com hash válido):

| Fonte | Artefacto preservado | Consequência |
|---|---|---|
| `SRC-CFM-PARECER-28-2020` | **SIM** — `cfm_parecer28_2020.pdf` (`089dba14…`), `cfm28.txt` (`54d2c13d…`), `cofen_search_parecer.html` (`01df1d0d…`) | `integrity.sha256` pode ser o hash real |
| `SRC-REV-ENF-USP-BRADEN-1999` | **NÃO** (só menções no dump do banco) | `NOT_AVAILABLE` + motivo; a fonte fica HOLD |
| `SRC-CAPES-MEC-MANUAL-CONSULTA-RAPIDA` | **NÃO** | idem |
| `SRC-OMS-OBESIDADE-2000` | **NÃO** | idem |
| `SRC-APGAR-1953` | **NÃO** | idem |
| `SRC-GOTEJAMENTO-FORMULA-CLASSICA` | **NÃO** | idem |

**5 das 6 fontes não têm documento preservado.** Uma menção num dump de banco não é o documento-fonte: não é hash, não é integridade. `NOT_AVAILABLE` é ausência honesta; ausência **não** é integridade.

### 13.3 Regras da reconciliação (o que sobe e o que não)

1. **Fonte canónica ≠ cópia.** Um artefacto que existe em dois universos só sobe de uma vez, e a cópia fica marcada (`DUPLICATE_EXPORT`/`EMBEDDED_ONLY`) — não se duplica conteúdo.
2. **O que não corre, não está portado.** O port do esqueleto no repositório canónico **não executa** (`ENOENT`): os scripts esperam `catalog/` e `src/core/experience/` na raiz do repo. Um ficheiro que existe não é um port.
3. **Ausência declarada ≠ valor inventado.** `sha256` sem artefacto é `NOT_AVAILABLE` com motivo; `authority_class` sem fonte é ausência explícita — **nunca** `INTERNAL_NONCLINICAL` por omissão (o parecer V6 mostrou que essa imputação atingiu campos clínicos de Aldrete, Braden e Morse).
4. **Gate só é gate se falhar no caminho certo.** Um portão que aceita `NOT_AVAILABLE` sem motivo, lista vazia e `decision` em conflito com `status`, não é homologação.
5. **O `.env` do backup não é publicado** (valores não vazios) e os 5 symlinks de raiz não são silenciosamente substituídos por cópias.

### 13.4 Decisões do dono que esta reconciliação não pode tomar

- **Qual universo é canónico** para o app CE (o git tem a governança; o sandbox tem o conteúdo).
- **Se o sandbox sobe** (5.746 ficheiros, com 24 saídas de audit removidas) — e por quem.
- **O PR #29** (revert) e o **PR #30** (candidato estrutural, verde) — a reconciliação não os fecha nem os funde.
- **A reclassificação das 22 fontes** quando não há equivalência automática segura (CFM parecer, publicação OMS, calendário de vacinação) — o valor canónico de um parecer de conselho profissional não é "lei".

### 13.5 Execução das etapas S1 e S2 — medida, não afirmada (01/11/2026 04:45Z)

**PR #31 (RASCUNHO, não fundido):** `plan/ce-reconciliacao-v6-20261101` → `main`.

#### 13.5.1 A medição que precedeu a correcção
O portão novo foi corrido **contra o estado real antes de qualquer correcção**: `REPROVADO: 172 violação(ões)` — 6×R1 (`source_type` fora do enum do contrato `source`), 6×R3 (`sha256` = 64 zeros), 78×R4 (`authority_class` fora do enum), 78×R5 (`decision` fora do enum), 4×R8 (autoridade não-interna sem fonte). Cada violação nomeia o item e a linha. **Sem esta leitura, a correcção seria um palpite.**

#### 13.5.2 S1 — contratos no vocabulário canónico, pela natureza do documento
A correcção foi feita **na fonte verdadeira** (`src/lib/tools/governance.ts`, `src/lib/tools/contracts.ts`) e os derivados foram **regenerados pelo gerador do repo** (`node scripts/generate-entity-contracts.mjs` → 183 entidades em 10 contratos). Nenhum JSON/TS gerado foi editado à mão.

| Fonte | Antes | Agora | Natureza do documento | SHA-256 real |
|---|---|---|---|---|
| `SRC-CFM-PARECER-28-2020` | `OFFICIAL_LAW` | `REGULATOR` | parecer de conselho profissional — **não é lei** | `089dba14…` ✅ (PDF no repo) |
| `SRC-REV-ENF-USP-BRADEN-1999` | `STANDARD` | `PRIMARY_STUDY` | artigo científico original | `NOT_AVAILABLE` + motivo |
| `SRC-CAPES-MEC-MANUAL-CONSULTA-RAPIDA` | `GUIDELINE` | `GUIDELINE` | manual institucional | `NOT_AVAILABLE` + motivo |
| `SRC-OMS-OBESIDADE-2000` | `OFFICIAL_LAW` | `GUIDELINE` | relatório de ORGANIZAÇÃO (a OMS **não é** órgão regulador) | `NOT_AVAILABLE` + motivo |
| `SRC-APGAR-1953` | `PRIMARY_STUDY` | `PRIMARY_STUDY` | artigo científico original | `NOT_AVAILABLE` + motivo |
| `SRC-GOTEJAMENTO-FORMULA-CLASSICA` | `STANDARD` | **`INTERNAL_GOVERNED`** | **não existe documento** — prática assistencial adotada internamente | `NOT_AVAILABLE` + motivo |

Bindings: 46 `authority_binding` com `authority_class` no enum do contrato e `decision` `BOUND` → `HOLD_HUMAN` (o `ALLOW` exigiria `validator_ids` **e** `evidence_bundle_ids`, que não existem) e `status` `EVIDENCE_BOUND` → `HOLD_HUMAN`. As 32 `field_definition` **não** recebem autoridade imputada: a autoridade vem do binding referenciado (**32/32 refs resolvem**).

#### 13.5.3 S2 — portão de integridade fail-closed
`scripts/check-contract-integrity.mjs` (14.076 B, 12 regras) + **17 testes** (17/17 verdes), incluindo as duas regras que o parecer V6 apontava e que o portão do sandbox não tinha:
- **Enum escopado ao contrato** — o `decision` tem **três** vocabulários no catálogo CKO (`applicability`, `authority_binding`, `release_gate`); a resolução é feita pelo contrato que rege o registo.
- **Escopo por tipo de objecto** — o ficheiro de bindings mistura 46 `authority_binding` e 32 `field_definition`; imputar `INTERNAL_NONCLINICAL` a uma definição de campo rotularia campos clínicos de Aldrete, Braden e Morse como não-clínicos (o próprio parecer V6 caiu nesta armadilha: chamou a isso "412 classes imputadas").

O **consumidor** foi corrigido em conjunto: `scripts/check-contract-coverage.mjs` exigia `INTERNAL_CONFIG`/`BOUND` — valores que não pertencem a nenhum enum do catálogo — e a verificação de integridade aceitava apenas "truthy" (por isso os 64 zeros passavam).

#### 13.5.4 Prova
| Verificação | Antes | Depois |
|---|---|---|
| `check-contract-integrity.mjs` | REPROVADO — 172 violações | **PASS** — 6 fontes, 46 AB, 32 FD |
| `check-contract-coverage.mjs` | reprovava (exigia o vocabulário legado) | **exit 0** |
| `check-generated-fresh.mjs` | — | **tudo fresco** (derivados regenerados pelo gerador) |
| `node --test check-contract-integrity.test.mjs` | — | **17/17** |
| `npx tsc --noEmit` | 2 erros (`@types/pg`) | 2 erros — **pré-existentes** (devDependency declarada no `package.json`; falta só no clone local) |

#### 13.5.5 Uma correcção de processo que ficou registada
O PDF do parecer do CFM foi **subido como texto**: o `push_files` gravou a string base64 (314.112 B) em vez do binário (235.582 B). Detectado pelo tamanho (base64 de 235.582 B = exactamente 314.112 B) e confirmado pelos primeiros bytes (`JVBER…` em vez de `%PDF-`). Corrigido pela **Git Data API** (blob → tree → commit → ref) e re-verificado byte a byte: os dois ficheiros são idênticos e o SHA-256 remoto é `089dba1488ac8ee0…`, **o mesmo declarado no contrato**. ⇒ *binários não vão por `push_files`.*

### 13.6 As cinco frentes da equipa — o que deliveram e como foi arbitrado (01/11/2026 04:45Z)

| Frente | Entregável | Arbitragem do owner |
|---|---|---|
| `fontes-classificacao` | tabela das 22 fontes com acção, veredicto, rationale e `instrument_kind` | **5/6 coincidem com a implementação do owner; 1 corrigido pelo verificador** (gotejamento → `INTERNAL_GOVERNED`, aceite e já no repo) |
| `bindings-coerencia` | 17 regras / 6 colunas, 14 automatizáveis + 3 com decisão nomeada, cada uma com **teste negativo** | **9/17 regras já cobertas** pelo portão S2; as 8 restantes entram na S3. A regra R05 (fonte sem hash ⇒ `HOLD`) foi implementada |
| `universos-git` | 41 grupos com veredicto (PROMOVER/RECONCILIAR/ARQUIVAR/HOLD/DESCARTAR), destino em git, dependência e bloqueio | **base do §13.1** — 3 grupos `PROMOVER`, 1 `HOLD`, 2 `DESCARTAR` (`.env`, `test-results`), 4 `ARQUIVAR` |
| `gate-fail-closed` | especificação do portão | **convergente** com a S2 (12 regras); a diferença de vocabulário foi resolvida pelo dono |
| `espelho-estatico` | plano do espelho estático | **rejeitado comoobjectivo**: o espelho mede caminhos do **pacote**, não do site vivo (sem browser no sandbox ⇒ medições do site são `NOT_RUN`) |

**Onde o owner tinha razão e o parecer V6 não:** (1) `BOUND` → `HOLD` no vocabulário errado trocava um valor inválido por **outro** valor inválido — o enum do binding é `ALLOW/HOLD_HUMAN/REJECT/NOT_APPLICABLE_JUSTIFIED`; (2) `field_definition` não recebe `authority_class`/`decision`; (3) classificar por **natureza do documento** (a OMS não é regulador; um parecer do CFM não é lei) e não por tradução de rótulo.
**Onde o verificador tinha razão e o owner estava errado:** o gotejamento **não tem documento-fonte nenhum** ⇒ `STANDARD` implicava um standard publicado inexistente ⇒ `INTERNAL_GOVERNED`. Corrigido no repositório antes do registo.

#### 13.6.1 Arbitragem do ciclo 1 da equipa (plano `plan_09af2008`)
| Frente | Verificador | Decisão do owner |
|---|---|---|
| `fontes-classificacao` | canone-integridade: **PASS** | **aceite** — e foi ela que corrigiu o owner (gotejamento) |
| `espelho-estatico` | *não reportou* | **aceite por arbitragem do owner** (o owner re-derivou do E4: 9.063 ocorrências · 5.520 quebras · 250 destinos · top-10 de navegação = 2.880 exactos; 251 páginas de catálogo + 17 templates-piloto = 268 varridas; `ce-bibliotecas-dev@main` tem zero `public/` — a hipótese do briefing era errada) |
| `bindings-coerencia` | canone-integridade: **FAIL** (B1–B3) | **reprovado** → retry: o CSV escreve valores fora do enum, imputa classe a `field_definition` e tem dois testes negativos insatisfazíveis |
| `gate-fail-closed` | Verifier: **FAIL** ((i)–(v)) | **reprovado** → retry: reconciliar a especificação com o portão S2 já executado e corrigir o dedup do agregador e os números |
| `universos-git` | canone-integridade: **FAIL** (G1–G5) | **reprovado** → retry: marcadores com origem, destino concreto, auto-consistência (41 no texto vs 39 no CSV) |

**Nenhum veredicto foi atribuído a quem não o deu:** a `espelho-estatico` está marcada como arbitragem do owner porque o verificador dessa frente não reportou.

### 13.7 Rev.2 — o portão era mais permissivo que o contrato (correcção do registo, 01/11/2026 06:50Z)

**A primeira versão do portão S2 estava errada, e a auditoria independente apanhou isso.** O verificador da frente `gate-fail-closed` devolveu uma lista de defeitos do meu próprio código (D0–D11). O D0 é o importante e foi medido antes de ser acreditado:

> O contrato canónico `source` declara `integrity.sha256.pattern = ^[a-f0-9]{64}$` e `integrity.additionalProperties: false`.
> Portanto `NOT_AVAILABLE`, `integrity.reason` e `integrity.artifact_ref` são **inválidos pelo contrato** — e o meu portão aceitava-os.

**Confirmado por três fontes independentes:**
1. **Os dois schemas são idênticos** — o do catálogo (`cko-data.json`) e o de `contracts/cko-schemas/source.schema.json` (18 propriedades, mesmo conjunto, mesmo `integrity`).
2. **As 43 instâncias canónicas** (`registers/governance/transversal-source-instances/`) têm **todas** `integrity = {sha256, snapshot_ref}` com hash real e snapshot preservado, e nenhuma tem `reason` nem `artifact_ref`.
3. **O materializador** (`scripts/materialize-transversal-public.py:100`) escreve exactamente `"integrity":{"sha256":…,"snapshot_ref":…}`.

⇒ O contrato `source` **não tem — e não pode ter sem WORK ORDER — um estado para "documento não preservado"**. A minha S1 tinha inventado esse estado.

#### 13.7.1 O que mudou
| | Antes | Rev.2 |
|---|---|---|
| Enums/forma | escritos à mão | **derivados do contrato** (`required`, `pattern`, `additionalProperties` lidos do catálogo) |
| Hash | declarado era aceite | **recalculado** do artefacto: hash declarado ≠ hash do ficheiro ⇒ reprova (`R9.HASH_MISMATCH`) |
| Dados que eu inventei | `source_type_rationale`, `integrity.method`, `integrity.artifact_ref`, `integrity.reason` | **removidos** (não existem no contrato); a justificação passou para o registo e o plano |
| Violações derivadas | contadas N vezes | contadas **à parte** (1 defeito no binding = 1 defeito) |
| Localizador da mensagem | `#items[i]` (índice instável) | **linha real** do registo |
| Testes | assinavam **prosa** (`/\[R6\].*contraditório/`) | assinam **códigos estáveis** `[RULE.SUB]` — **23/23**, com fixtures sintéticos independentes do repo |
| Saída | texto | `--json` (contagens para o agregador), código 2 para argumento desconhecido, sem stack trace |

#### 13.7.2 A medição que substitui a afirmação anterior
| | Antes da S1 | Rev.2 |
|---|---|---|
| Violações | **30** (6 `source_type` fora do enum, 6 SHA a 64 zeros, 6 `citacao` fora do contrato, 6 snapshot placeholder, 6 contadas duas vezes) | **16** |
| Erros de dado | 12 | **0** |
| Lacunas de contrato | — | 16, em **3 classes**: 6× `citacao` fora do contrato · 5× `sha256` sem representação · 5× `snapshot_ref` placeholder |

⇒ **A afirmação "PASS" que ficou escrita em §13.5 na rev.1 está superada.** O portão hoje está **vermelho**, e está vermelho porque o repo tem 16 casos que o contrato não representa — não porque os dados estejam errados.

#### 13.7.3 O que ficou registado para o dono (nada disto é meu para decidir)
- **`registers/governance/r86-source-evidence-pending-20261101.v1.json`** — intake de evidência das 5 fontes sem documento preservado (`EVIDENCE_INTAKE_NOT_FORMAL_ADMISSION`, releaseGate `HOLD_HUMAN`, 0 admitidas).
- **`R84-CKO-SRC-EVIDENCE-STATE`** no r86 — emendar o contrato `source` para ter um estado de evidência ausente, ou preservar os documentos. **A segunda via é impossível para `SRC-GOTEJAMENTO-FORMULA-CLASSICA`**: é uma fórmula sem documento, e o enum do contrato inclui `INTERNAL_GOVERNED`, que descreve precisamente esse caso ⇒ **inconsistência interna do contrato**, medida.
- **`R86-CKO-SRC-CITATION-SLOT`** no r86 — o contrato não tem campo `citacao`, embora tenha `language`, `effective_from` e `license_ref`; a prática carrega `citacao` em todas as 6 fontes.
- **`TASK-PLAN-171..174`** no registo canónico.

**Nota de correcção de forma:** o portão de cobertura (`check-contract-coverage.mjs`) foi **revertido** para a regra fiel ao contrato (integridade = hash real + artefacto preservado). A variante "NOT_AVAILABLE com motivo" que eu tinha introduzido na rev.1 era a mesma invenção que o parecer V6ews — e é exactamente o que o contrato não admite. Os dois portões agora reprovam **as mesmas 5 fontes, pela mesma causa nomeada**.

#### 13.7.4 O CI apanhou outra coisa minha (01/11/2026 07:15Z)
A primeira versão desta correcção **acrescentou as duas decisões ao `r84`** e **criou um registo `r85`**. Ambos estavam errados, e o CI do repo disse-me antes de eu publicar:
- **`r84` é um registo fechado e validado**: `scripts/verify-r84-pmo-decision-intake.mjs:56` exige `decisions.length === 4` e indexa-as contra `r83.decisionMatrix[index]` e `r77.decisionsRequired[index]`. Acrescentar decisões quebra um validador fail-closed.
- **Já existia um `r85`** (`r85-pmo-conversation-owner-assent-20261031.v1.json`) com o seu próprio validador (`verify-r85-owner-assent.mjs`).

⇒ **Revertido**: o `r84` ficou intacto e as decisões foram para um registo **novo, `r86`**, que não colide com nada. Registado em `TASK-PLAN-172`/`173`: o intake de decisões do dono que se pode acrescentar é o `r86`, e o `r84` só muda por WORK ORDER.

#### 13.7.5 O CI do repo: uma falha minha e uma pré-existente (01/11/2026 07:30Z)
O CI do PR #31 ficou vermelho em dois sítios, e **um é meu e um não**:

**(a) Meu — o portão de cobertura.** A regra anterior (`!f.integrity?.sha256`) aceitava **64 zeros** como integridade: era isso que segurava o verde do `main`. A rev.2 passou a exigir hash real + artefacto preservado ⇒ as 5 fontes sem documento reprovaram. **rev.3:** o portão passa a aceitar **evidência pendente registada** (`r86`, `HOLD_HUMAN`) e a **imprimi-la** — porque um verde que não nomeia a pendência é um *accept silencioso*. **Fail-closed verificado:** sem o registo `r86`, o portão reprova. O portão de integridade (rev.2) **continua estrito e vermelho** — é ele que mede as 16 lacunas de contrato.

**(b) Pré-existente — `TASK_PLAN_DRIFT` no gate do R78.** `scripts/check-r78-gap-register.mjs:12-13` exige `tasks.length === 37 + 31 = 68` e a linha 17 exige que as candidatas sejam **exactamente** as de id `059-089` ⇒ **qualquer task acima de 089 torna o gate insatisfazível**. Medido: `main` tem **112** tasks (esperado 68) e falha igual; a comparação CE adicionou **84** tasks desde 31/10. O gate só corre em branches candidatas (`pmo-candidate-unit-regressions.yml`), por isso o CI do `main` nunca o apanhou. **Não mexi no registo `r78` para o fazer passar** — registado em `TASK-PLAN-175` para decisão do dono/Kernel.

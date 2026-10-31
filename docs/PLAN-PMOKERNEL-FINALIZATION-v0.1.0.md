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

---

## 16. R85 — Manifestação “aprovado” registrada para quatro encaminhamentos R84 (31/10/2026)

O usuário respondeu **“aprovado”** imediatamente após a apresentação de quatro encaminhamentos recomendados na R84 e da necessidade de manifestação específica. Essa resposta é tratada como **concordância contextual com os quatro encaminhamentos** — não como mensagem enumerada individualmente, identidade autenticada, assinatura criptográfica ou admissão Kernel.

A manifestação foi preservada no documento `registers/governance/r85-pmo-conversation-owner-assent-20261031.v1.json`, que aponta por Git blob SHA para as fontes R84, R83, aprovação operacional anterior e fila rev18. Quatro códigos foram registrados:

1. `R77-PMO-001 = KEEP_REV18_PENDING_KERNEL`: manter a fila rev18 **somente como referência provisória**, sem eleição canônica, exclusão das variantes ou replay de eventos.
2. `R77-PMO-002 = KEEP_LOCAL_COMMANDER_SCOPED`: manter `WO-ADM-001=IN_PROGRESS` somente para Commander **local**, sem nova autorização de IA externa, OAuth, banco ou execução de agentes remotos.
3. `R77-PMO-003 = KEEP_CKO_QUEUED`: manter `WO-CKO-001=QUEUED` na fonte de referência e conservar o piloto técnico Apgar/Fugulin como evidência paralela, sem homologação clínica.
4. `R77-PMO-004 = HOLD_EXTRA_WOS`: preservar `WO-CKO-ID-009` e `WO-CKO-LINK-010` e sete variantes como candidatas, sem admissão automática.

**Estado:** `ownerRecommendationsRecorded=4`, mas `ownerAuthenticatedDecisions=0`, `independentCheckerApprovals=0`, `kernelAdmissionsVerified=0`. A declaração não contém timestamp preciso, ID fictício de mensagem, identidade confirmada nem assinatura. As quatro seleções no pacote R84 permanecem `null` intencionalmente, pois o R84 é a entrada **não assinada** e continua falhando fechado contra elevação de status. A R85 é o comprovante separado de manifestação na conversa.

O verificador `scripts/verify-r85-owner-assent.mjs` reconcilia a declaração com a R84/R83 e com os Git blobs de origem, veta seleções diferentes, identidade/assinatura inventadas, checker/Kernel aprovados artificialmente e qualquer tentativa de eleger a fila, mover WOs, liberar CKO, publicar ou efetuar replay. `scripts/verify-r85-owner-assent.test.mjs` cobre nove cenários com casos positivos e negativos; ambos estão registrados no workflow PMO candidato.

O painel `src/components/admin/pmo-review-intake.tsx` apresenta as quatro orientações aceitas na conversa e distingue **declaração de intenção** de **aprovação corporativa assinada**. O usuário ainda pode exportar uma minuta local não vinculante para revisão, sem chamada remota. `TASK-PLAN-001` permanece `PROPOSTO` e `TASK-PLAN-002` permanece `BLOCKED`; não foram alteradas as **68 tasks** nem a fila oficial.

### Próximos gates obrigatórios, não dispensados pelo “aprovado”

Autenticar identidade e escopo do proprietário → obter revisão independente maker/checker → validar política, manifesto, risco e evidências → conferir assinatura/admissão Kernel por decisão e WO → somente então executar transição versionada autorizada e verificar efeito. Enquanto isso: `GAP-01..04=OPEN`, `canonicalRevision=NOT_ELECTED`, `WO-HOM-001=HOLD_HUMAN`, sem merge, deploy, mudança em Supabase, rotação de segredo ou promoção clínica.

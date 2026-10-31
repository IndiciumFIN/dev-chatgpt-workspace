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

## 3. Plano de execução — 5 fases, 24 tasks

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

### Fase 1 — Gate de cobertura: de snapshot para invariante

> **Nota de ativação (medida em 31/10):** um workflow **novo** só é despachado pelo GitHub depois de existir na branch padrão. Por isso o `pending-coverage-gate.yml` deste PR **não roda** no próprio PR #26 — e é por isso que ele **não** foi ligado ao `verify-bibliotecas.yml` (workflow já existente): alterá-lo agora colocaria o gate em todas as PRs do repositório **antes** de o inventário aterrissar, quebrando o CI de quem tem PR aberto. A sequência correta é `T0.005 → T0.013 → T0.001 → T0.012`. A verificação desta rodada foi **local** (`node --test` → 7/7; `python3 -m unittest` → 17/17) e o gate em si rodou no `verify` do PR #26: ele falha pelo motivo **pré-existente** `Protótipo deve permanecer congelado` (P1), sem falha nova causada pelos artefatos deste plano.


| task | título | WO | deps | ling. | aceite | status |
|---|---|---|---|---|---|---|
| TASK-PLAN-010 | `scripts/check-pending-coverage.mjs` — re-deriva WOs × pendências × tasks | WO-PMO-001 | 005 | JS | violações `TASK_SEM_WO`, `TASK_WO_INEXISTENTE`, `WO_SEM_TASK`, `PENDENCIA_ORFA`, `DONE_SEM_EVIDENCIA`, `TASK_SEM_ARTEFATO`, `GAP_ABERTO` | **DONE** (neste PR) |
| TASK-PLAN-011 | Testes negativos do gate | WO-PMO-001 | 010 | JS | 7 testes verdes (`node --test scripts/check-pending-coverage.test.mjs`), incluindo SKIP-when-absent | **DONE** (neste PR) |
| TASK-PLAN-012 | Ativar o gate no CI | WO-PMO-001 | 005, 010, 011 | CI | `ci/pending-coverage-gate.yml` copiado para `.github/workflows/` (escrita nessa pasta é bloqueada para a API do plugin) e gate **falhando fechado** quando houver gaps. **Ordem obrigatória:** T0.005 → T0.013 → T0.001 → só então `GAP_ABERTO` como erro | PROPOSTO (arquivo pronto em `ci/`; cópia exige owner) |
| TASK-PLAN-013 | Vínculo das **18 issues** + **13 pendências Simulados** a WO/task | WO-PMO-001, WO-SEC-001 | 010, 005 | JS | `PENDENCIA_ORFA = 0` no gate; cada issue aberta tem task e cada task tem WO | PROPOSTO |
| TASK-PLAN-014 | Consolidar os ~35 FINDs (R14–R47, CURI-R36–R40, SPE-R14–R35) em **uma baseline commitada por PR** | WO-PMO-001 | 012 | JS+PY | para cada PR auditado: um validador no repo, testes negativos, e o texto do FIND referenciando o blob **commitado** (hoje aponta para blobs que só existem em comentário) | PROPOSTO |

### Fase 2 — Política como código + catálogo de cenários

| task | título | WO | deps | ling. | aceite | status |
|---|---|---|---|---|---|---|
| TASK-PLAN-020 | `docs/AUDIT-DATA-KERNEL-SCENARIOS-v0.1.0.md` — 13 cenários mapeados ao repo | WO-SEC-001 | — | DOC | cada cenário KER/MST/SEC/I18N/SEO/JSD mapeado a caminho real + limitação + modo (estático/DB) | **DONE** (neste PR) |
| TASK-PLAN-021 | `registers/governance/audit-policy.v1.json` | WO-SEC-001 | 020 | DOC | política populada: locales obrigatórios, limites SEO, colunas PII, tabelas RLS, mutabilidade, FKs lógicas, tipagem — com `populationStatus` explícito | **DONE (esqueleto)** / popular: PROPOSTO |
| TASK-PLAN-022 | Ligar cada cenário a uma WO do inventário | WO-SEC-001 | 021 | DOC | cobertura de cenários: cada regra do motor tem WO e critério de aceite | PROPOSTO |

### Fase 3 — Motor de auditoria executável

| task | título | WO | deps | ling. | aceite | status |
|---|---|---|---|---|---|---|
| TASK-PLAN-030 | `scripts/audit_data_kernel.py` — modo estático (SQL + conteúdo + registers) | WO-SEC-001 | 021 | PY | roda sem banco e sem dependências; exit 1 em erro, 2 em insumo ausente, 0 em warning | **DONE** (neste PR) |
| TASK-PLAN-031 | Modo PostgreSQL read-only + **bootstrap PGlite que mata o ENOENT** | WO-SEC-001 | 030 | PY | `resolve_pg_target()` cria o dir; transação `READ ONLY` + rollback; psycopg ausente ⇒ warning, nunca crash | **DONE** (neste PR) |
| TASK-PLAN-032 | Suíte de testes do motor | WO-SEC-001 | 030, 031 | PY | 17 testes verdes (`python3 -m unittest discover -s tests -p 'test_*.py' -q`) | **DONE** (neste PR) |
| TASK-PLAN-033 | Corrigir a fixture contraditória do PR #24 (`attempt-policy.test.ts:12`) | WO-SEC-001 | 030 | PY/JS | `SPE Candidate Static Gates` verde; o teste deixa de afirmar duas coisas contraditórias para o mesmo input | PROPOSTO |
| TASK-PLAN-034 | Auditar as **47 migrations + 17 testes** do banco original dos Simulados | WO-SEC-001 | 031, 033 | PY | replay em PostgreSQL descartável com relatório do motor; divergências catalogadas | PROPOSTO |

### Fase 4 — Publicação: i18n, SEO, JSON-LD

| task | título | WO | deps | ling. | aceite | status |
|---|---|---|---|---|---|---|
| TASK-PLAN-040 | Gate de paridade de locales + SEO/slug/alt sobre o conteúdo | WO-SEC-001 | 021, 030 | PY | 87 páginas do PR #22 auditadas; `I18N-01` e `SEO-02` sem erro; `registers/i18n/locale-register.v1.json` é a fonte de verdade | PROPOSTO |
| TASK-PLAN-041 | Gerador JSON-LD estrito + validação Schema.org por `@type` | WO-SEC-001 | 030 | PY | `JSD-01`/`JSD-02` no motor; gerador sem dependência externa (validação própria, não pydantic) | PROPOSTO |
| TASK-PLAN-042 | Fechar a divergência de fontes do PR #22 (colisão de identidade em 12 citações, FIND-CURI-R40) | WO-SEC-001 | 040 | JS | `sources.json` com chaves únicas; validador impede o verde falso de "87/87" | PROPOSTO |

### Fase 5 — Encerramento: o que não serve mais

| task | título | WO | deps | ling. | aceite | status |
|---|---|---|---|---|---|---|
| TASK-PLAN-050 | `docs/DECOMMISSION-REGISTER-v0.1.0.json` — inventário do superado | WO-PMO-001 | 001 | DOC | cada item com `motivo`, `substituidoPor`, `acao`, `decisor` e `status` (`FINALIZADO` / `PROPOSTO`) | **DONE** (neste PR) |
| TASK-PLAN-051 | Eliminar as branches duplicadas `archivamento` e `planning` | WO-PMO-001 | 001 | — | ambas apontam para `87c537fe`, contida em `main`; apagar (`git push origin --delete` — a API do plugin não expõe delete de branch) | PROPOSTO (owner) |
| TASK-PLAN-052 | Consolidar as 18 issues em 3 trilhas e fechar as absorvidas | WO-PMO-001 | 013 | — | #23 absorvida pela #25 (contrato de admissão); #10/#11 absorvidas pelo inventário; as demais ganham `assignee` | PROPOSTO (owner/Kernel) |
| TASK-PLAN-053 | Nomear dono por task/issue (hoje: **zero assignees** em 18 issues) | WO-PMO-001 | 013 | — | cada task do registro tem `owner`; cada issue aberta tem responsável | PROPOSTO |
| TASK-PLAN-054 | Normalizar o limite de deploy do Vercel (100/dia) | WO-E2E-001 | 012 | CI | preview disponível em toda PR ativa (hoje 8 falhas por limite de plano) | PROPOSTO |

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
| `scripts/check-pending-coverage.test.mjs` | 7 testes negativos | JS |
| `scripts/audit_data_kernel.py` | motor de auditoria (estático + postgres read-only) | PY |
| `tests/test_audit_data_kernel.py` | 17 testes | PY |
| `ci/pending-coverage-gate.yml` (+ `ci/README.md`) | gate no CI (paths-filtered) — **fora de `.github/workflows/` porque a API do plugin bloqueia escrita nessa pasta** | CI |

**Limite medido (31/10):** a API do plugin **bloqueia escrita em `.github/workflows/`** (`connector_tool_error` em todas as tentativas; um push anterior chegou a reportar OK com saída vazia e **não** criou o ficheiro — 9 dos 10 arquivos do PR estão presentes, o workflow é o único fora). O ficheiro do gate vive em `ci/pending-coverage-gate.yml` e a activação é uma cópia de uma linha pelo owner (instruções em `ci/README.md`).

**Verificação local (executada):** `node --test scripts/check-pending-coverage.test.mjs` → **7/7 verdes** · `python3 -m unittest discover -s tests -p 'test_*.py' -q` → **17/17 verdes**.

---

## 7. Nota de honestidade

Este plano **não** afirma que a cobertura está resolvida — o próprio inventário declara `completeness: NOT_VERIFIED` e `GAP-01…GAP-04` abertos, e o gate deste PR ainda reporta `SKIP` enquanto o inventário não aterrissar no `main`. Ele **não** fecha issues, **não** apaga branches, **não** mexe em `main`, `Supabase`, segredos ou permissões. O que ele faz é tornar a cadeia `FIND → … → Homologação` **verificável por máquina** — que era exatamente o que faltava e que a diretriz da issue #25 exige.

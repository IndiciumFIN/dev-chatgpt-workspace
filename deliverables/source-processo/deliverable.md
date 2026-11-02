# Deliverable — Processo de source funcional

**Tarefa:** source-processo · **Data:** 26/10/2026 · **Árvore:** `/workspace/workspace-repo`
**Branch:** `feat/projection-unica-f0-suite-real` (base `4c17fe7`)

O processo de source está **funcional e documentado por políticas e validadores**. Os quatro elos da
cadeia existem, cada um com o seu portão, e cada portão tem um caminho em que ele falha — provado por
teste, não por afirmação.

---

## 1. A cadeia, elo por elo, com o estado medido

| Elo | O que fecha | Estado medido (26/10) | Portão |
|---|---|---|---|
| **Captura** | `intake_batch` + `intake_file`, com origem declarada (caminho + dia) | `intake_batch`: **0 → 1** linha; `intake_file`: **0 → 6** linhas (1 admitir, 3 espera, 2 recusar; 3 instrumento, 1 formulário, 1 catálogo, 1 mídia; 4 pt-BR, 1 en, 1 es). Idempotente: 2ª gravação com a mesma origem → 1 lote, 6 arquivos. Sem origem declarada → não grava | `scripts/audit-source.mjs` → `intake-file-sem-lote` |
| **Átomo** | `kernel_atom` com `source_quote` + `pinpoint` + `source_quote_sha256`; `kernel_claim` com `kernel_evidence` | 4 átomos, **4/4** com trecho, pinpoint e sha256 (backfill da 0038); 4 desdobramentos com 4 evidências; `kernel_evidence.reference`: 4/4 | `atom-sem-evidencia`, `claim-sem-evidencia`, `evidencia-sem-reference` |
| **Admissão** | kernel fail-closed: pedido + política + validador + manifesto (hash, data) + aprovação independente de outra pessoa + decisão com evidência | 0 pedidos no banco novo (a cadeia é montada no teste, não semeada); a cadeia completa foi provada ponta a ponta em `src/lib/kernel-admit.test.ts`: pedido → `aprovarManifesto` → `admitOrder` → **admit**, com `policy_decision` (allow citando a regra) e `audit_event` gravados | `manifesto-sem-aprovacao-independente`, `decisao-sem-regra` |
| **Publicação** | `decide()` (deny para) + portão `publicar_ferramenta` em `process` **e** `process_setting` + registro em `source_publication` (portão, decisão, evidência) | 5 instrumentos publicados no banco novo, **0** publicados por pessoa (o legado fica publicado — nada retido); `source_publication`: 0 linha no banco novo (a gravação nova é a que registra) | `instrumento-sem-portao`, `publicacao-com-portao-desconhecido` |

O portão do processo conta o schema **sozinho**: **96 tabelas** medidas (94 antes da 0038, +2 novas
delas). Não há número fixo no código.

## 2. A saída de cada gate

### 2.1 Portão do processo — `node scripts/audit-source.mjs` (exit 0)

```
[source] tabelas no banco:          96
[source] capturas (lotes):           0
[source] arquivos capturados:       0
[source] átomos:                    4 (admitidos: 4)
[source] desdobramentos com evidência:4 (evidências: 4)
[source] pedidos de admissão:       0
[source] manifestos:                0 (aprovados: 0)
[source] aprovações humanas:        0
[source] decisões de política:      0
[source] publicações registradas:   0
[source] instrumentos publicados:    5 (pelo processo: 0)
```

### 2.2 Portão do processo — `--self-test` (corrompe UMA linha)

```
VIOLAÇÃO kernel_atom:atom-agente: o átomo "atom-agente" está sem source_quote. [atom-sem-evidencia]
[self-test] ok: o portão falhou e nomeou "atom-agente".
```

O portão também **sai com código 1** sobre banco violado — medido no teste, numa cópia da árvore com
uma migration quebrada (`VIOLAÇÃO intake_file:lote-fantasma`), e dá **a mesma resposta** em duas
execuções seguidas.

### 2.3 Testes do portão — `node --test scripts/audit-source.test.mjs` → **20/20**

A cadeia sadia é montada antes de cada quebra (um portão que acusa de cadeia vazia não prova nada).
Cada violação é provada com a linha culpada nomeada; a negação por falta de regra é provada como
**não** violação; o `--self-test` é provado; e a política OPA é provada deny-by-default.

### 2.4 Kernel — `src/core/governance/kernel.test.ts` → **26/26**

### 2.5 Intake — `src/lib/intake.test.ts` → **7/7** (3 puros + 4 de gravação)

### 2.6 Admissão — `src/lib/kernel-admit.test.ts` → **3/3**

### 2.7 Registro de fontes — `src/core/registry/source-registry.test.ts` → **8/8**

### 2.8 Portão do índice (não pode quebrar) — `node scripts/audit-indice-banco.mjs` (exit 0)

```
[índice] tabelas no banco:        96
[índice] tabelas no dicionário:   96
[índice] linhas no índice:       96
[índice] tabelas com label:      96
[índice] fora do dicionário:     0
```

As duas tabelas novas (`kernel_approval`, `source_publication`) entraram no dicionário pela
`0041_passa_de_aprovacao.sql`, do dono, e no índice em código — o portão do índice segue verde.

## 3. Os 6 casos de recusa, com o motivo

Cada caso quebra UMA coisa e o teste nomeia o motivo (`src/core/governance/kernel.test.ts`):

| # | Caso | Resultado | Motivo |
|---|---|---|---|
| 1 | **sem manifesto** | `hold` | `manifest-required` |
| 2 | **sem política ativa** | `reject` | `inactive-policy:policy.preview-required` |
| 3 | **sem validador** | `reject` | `validators-required` |
| 4 | **aprovação do kernel** | `hold` | `independent-approval-required` |
| 5 | **decisão de política nega** | `reject` | `policy-denied` (e `policy-denied:<código>` quando a regra do conjunto é `deny`) |
| 6 | **hash do manifesto que não confere** | `reject` | `manifest-integrity-mismatch` |

E mais 14 motivos, todos nomeados no mesmo teste: `work-order-missing-id`,
`policy-set-required`, `work-order-missing-owner`, `work-order-source-or-acceptance-missing`,
`manifest-work-order-mismatch`, `manifest-policy-set-mismatch`, `validator-manifest-mismatch`,
`policy-evaluation-unavailable`, `policy-evaluation-error`, `policy-decision-evidence-missing`,
`validator-failed:<id>`, `validator-error:<id>` e o blindagem final `kernel-evaluation-error`
(defeito dentro do kernel vira espera, **nunca** admissão).

## 4. O defeito que a verificação encontrou (e o que ele provou)

Rodar o registro de fontes contra o **schema de verdade** — e não contra um dublê — mostrou que
`src/core/registry/source-registry.ts` gravava e lia uma coluna que **nenhuma migration criava**:
`kernel_atom.source_canonical_id`. A função `gravarAtomaDaFonte` e a leitura `fontesDoBanco`
quebrariam em runtime com `column "source_canonical_id" of relation "kernel_atom" does not exist`.

A correção foi na `0038` (migration nova do escopo, não editada em cima de outra):

```sql
alter table kernel_atom add column if not exists source_canonical_id text;
```

e a característica foi para o dicionário (`schema_column` + `data_specification`), como todas as
outras. O teste novo `src/core/registry/source-registry.test.ts` (8/8) prova o caminho feliz
contra as migrations aplicadas **e** o caminho de falha: fonte sem hash, sem dono, sem origem,
sem validador, com citação trocada (o sha256 recalculado não bate) e fonte repetida com outro
hash são recusados com o motivo nomeado.

O que fica de lição: **`tsc` não pega coluna que não existe em runtime.** Só a execução contra o
banco pega.

## 5. O que ficou NOT_RUN

| Item | Por quê | O que cobre no lugar |
|---|---|---|
| `opa test contracts/cko-governance/opa` | o binário `opa` não está instalado neste sandbox | fixture (12 casos com input e resultado esperado) + 4 testes Node: `default allow := false` presente, `default allow := true` e permissão incondicional ausentes, forma do input conferida, e **todo motivo esperado do fixture escrito no `.rego`** |
| `npm test` / `npm run build` | são do dono no fim (a suíte leva ~4,5 min e há outro worker na árvore) | rodei só o meu escopo: `scripts/audit-source.test.mjs` (20/20) e os três arquivos de teste em `src/` |
| `npx tsc --noEmit` | roda, mas o `node_modules` do repo está quebrado neste sandbox (symlink para `/tmp/appbuild/node_modules`, que não existe) — e a árvore instalada não tem `better-auth` nem `@types/pg`, que estão declarados no `package.json` | **24 erros**, **todos** em `src/lib/auth/**`, `src/lib/app-data/client.server.ts` e `src/lib/db.ts` (falta declaração de `better-auth` e `@types/pg`), em arquivos que não toquei. **Zero** erro em `src/core/**`, `src/lib/kernel-admit.ts`, `src/lib/intake.ts`, `src/lib/policy-decision.ts` e `src/lib/source.functions.ts` |
| medição no **banco vivo** (98 tabelas em 26/10) | sem `DATABASE_URL` neste sandbox | todas as medições são sobre o schema montado pelas migrations (96 tabelas); o portão conta o schema sozinho, então ele vale para os dois bancos |
| **captura real** da origem homologada (nada baixado de novo) | o runbook proíbe repetir download de fonte já preservada, e a preservação das 25 normas já está commitada | o intake grava o lote a partir de uma lista de caminhos e uma origem declarada; o que falta é a passagem real sobre o repositório homologado, que é ato do dono |

## 6. Arquivos tocados

**Novos**
- `src/core/governance/{kernel,types,source-contract,state-machine}.ts` (+ `kernel.test.ts`)
- `src/core/compliance/validators.ts`
- `src/core/registry/source-registry.ts` (+ `source-registry.test.ts`)
- `contracts/cko-governance/opa/{kernel_admission.rego,kernel_admission.test.rego,kernel_admission.fixture.json}`
- `migrations/0038_processo_source.sql`
- `scripts/audit-source.mjs`, `scripts/audit-source.test.mjs`
- `deliverables/source-processo/{entrega.md,entrega.json,deliverable.md}`

**Reescritos**
- `src/lib/kernel-admit.ts` (delega ao kernel; `admitOrder` grava a decisão com evidência; novo
  `aprovarManifesto`)
- `src/lib/intake.ts` (classificação pura + `gravarLote`)

**Ajustados**
- `src/lib/source.functions.ts` (portão `publicar_ferramenta` em `process`/`process_setting` +
  registro da publicação com evidência)
- `src/lib/policy-decision.ts` (devolve o `decisionId`)
- `src/lib/kernel-admit.test.ts`, `src/lib/intake.test.ts` (acompanham a API nova)

**Não tocados (de outra tarefa):** `migrations/0035`, `0036`, `0037`, `0041`,
`src/lib/banco/indice.ts`, `scripts/audit-indice-banco.*`, `audit-evidence/**`, `docs/entregas/**`.

# Entrega — Processo de source funcional

**Tarefa:** source-processo · **Árvore:** `/workspace/workspace-repo` · **Branch:** `feat/projection-unica-f0-suite-real`

O que estava em pedaços agora fecha o caminho: o kernel fail-closed foi portado de
`origin/preview/central-comando-20261026` e endurecido, o intake grava de verdade, a publicação
passa pelo portão registrado e a decisão fica registrada com evidência. O portão do processo
(`scripts/audit-source.mjs`) prova que cada uma dessas rotas falha quando tem de falhar.

O registro completo por chave canônica está em `entrega.json` (26 chaves). Aqui está a prosa.

---

## 1. O kernel fail-closed (portado e endurecido)

`src/core/governance/kernel.ts` — porta de `origin/preview/central-comando-20261026:src/core/governance/kernel.ts`
(leitura; nenhum checkout foi feito). O que mudou ao portar, e por quê:

| Mudança | Motivo |
|---|---|
| `policy-denied:<código>` | a regra com efeito `deny` derruba o pedido antes de perguntar a quem decide; na origem isso só aparecia depois do avaliador |
| `validators-required` | o conjunto de validadores vazio tem motivo próprio, distinto de "o conjunto não casa com o do manifesto" |
| `work-order-missing-owner` | pedido sem dono não tem contra quem medir a independência da aprovação |
| `kernel-evaluation-error` | exceção vira espera, nunca admissão — o blindagem final de todo o caminho |

O resto da doutrina foi preservado: `_work_order` precisa de id, `policy_set`, `source_ref`,
`acceptance_criteria`; o manifesto precisa de hash sha256, `serviceOrderId` igual ao da ordem e
conjunto de validadores igual ao do pedido; a decisão de política precisa de `decisionId` + `bundleRef`;
a aprovação precisa ser independente (`approved_by` ≠ dono, ≠ `kernel`) e casa com um registro de
aprovação. Resultado: `admit` | `hold` | `reject`.

**Os 6 casos da doutrina, com o motivo nomeado** (`src/core/governance/kernel.test.ts`, 26 testes):

| # | Caso | Resultado | Motivo |
|---|---|---|---|
| 1 | sem manifesto | `hold` | `manifest-required` |
| 2 | sem política ativa | `reject` | `inactive-policy:<código>` |
| 3 | sem validador | `reject` | `validators-required` |
| 4 | aprovação do kernel | `hold` | `independent-approval-required` |
| 5 | política que nega | `reject` | `policy-denied` |
| 6 | hash do manifesto que não confere | `reject` | `manifest-integrity-mismatch` |

Mais 14 motivos (id, conjunto de política, dono, origem, regra `deny`, manifesto de outro pedido,
conjunto de política divergente, conjunto de validadores divergente, aprovador não nomeado, aprovação
sem registro que case, avaliador ausente, decisão sem evidência, avaliador que estoura, validador que
falha, validador que estoura) e a prova de que `buildManifest` nunca aprova um candidato.

**`src/lib/kernel-admit.ts` delegou ao kernel.** As três funções públicas continuam (`admit()`,
`manifestStatus()`, `admitOrder()`); o motivo da decisão vem do kernel. `admitOrder()` grava: status
do pedido, manifesto (hash, `approved_at`, conjuntos e `evidence_ref` com o id da decisão),
`policy_decision` (allow com a regra que permitiu; deny com a regra que negate) e `audit_event`.
`aprovarManifesto()` é o processo separado que grava o registro de aprovação que casa com o manifesto
— e recusa o dono do pedido e o valor `kernel`.

## 2. O intake grava de verdade

`classifyPath`, `suggestFromHead` e `suggestionOf` continuam puros. Em cima deles,
`gravarLote(sql, caminhos, origem)` grava `intake_batch` + `intake_file` e devolve o resumo **lido do
banco** (não calculado de memória): quantos `admitir`/`espera`/`recusar`, por módulo e por idioma.

Medido (PGlite com todas as migrations, `homologado/apgar`, 2026-10-26, 6 caminhos):

```
ANTES  : {"lotes":0,"arquivos":0}
1a GRAVAÇÃO: {"batchId":"lote-eda1fa0383c8015c","total":6,
               "porVerdict":{"admitir":1,"espera":3,"recusar":2},
               "porModulo":{"instrumento":3,"formulario":1,"catalogo":1,"midia":1},
               "porIdioma":{"pt-BR":4,"en":1,"es":1}}
DEPOIS : {"lotes":1,"arquivos":6}
2a GRAVAÇÃO (mesma origem): lote-eda1fa0383c8015c -> {"lotes":1,"arquivos":6}
```

Idempotente: a identidade do lote é `sha256(caminho|data)`. Lote **sem origem declarada** (caminho ou
data) não grava — o banco continua vazio e a função recusa.

## 3. A publicação passa pelo portão e a decisão fica registrada

Em `src/lib/source.functions.ts`, o caminho que grava um instrumento (`saveTool` e `saveClinicalSheet`)
agora: (a) consulta a decisão de política (`decide()` — deny para antes de gravar); (b) checa o portão
`publicar_ferramenta` em `process` **e** em `process_setting` (o setting `escrita` = `admin`); (c)
grava a publicação em `source_publication` com o portão, o id da decisão e a evidência (`sha256:` do
conteúdo gravado). `decide()` passou a devolver o `decisionId`, para que a evidência aponte para a
decisão que autorizou.

**Nada fica retido.** O que já estava publicado (o legado, publicado por processo na normalização
DERBY) continua publicado: a exigência vale para a gravação nova, feita por uma pessoa.

## 4. A política OPA

`contracts/cko-governance/opa/kernel_admission.rego` — portada e endurecida: `default allow := false`
(negação por padrão), seis blocos de fato (pedido completo, manifesto amarrado, política com
evidência, validadores passados, aprovação independente, execução não pedida) e 8 `deny_reason`.
`kernel_admission.test.rego` traz 12 casos; `kernel_admission.fixture.json` traz o input e o resultado
esperado de cada um.

O binário `opa` **não está instalado** neste sandbox — o caminho previsto na tarefa. O teste Node
(`scripts/audit-source.test.mjs`) prova o que dá para provar sem o binário: existe
`default allow := false`, não existe `default allow := true` nem permissão incondicional, o fixture
tem a forma que o input do Rego exige e **todo motivo esperado no fixture está escrito no `.rego`**.

## 5. O portão do processo

`scripts/audit-source.mjs` abre um PGlite em memória, aplica **todas** as migrations e conta o schema
sozinho — **96 tabelas medidas**, nenhum número fixo no código.

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

As 6 violações do portão, cada uma com a linha culpada nomeada:

| Violação | Como é provada |
|---|---|
| `intake_file` sem `intake_batch` | a FK é solta no teste; o portão nomeia `intake_file:<lote>/<caminho>` |
| `kernel_atom` sem `source_quote`/`pinpoint`/`source_quote_sha256` | o campo é limpo; o portão nomeia `kernel_atom:<id>` e diz o que falta |
| `kernel_claim` sem `kernel_evidence` | a evidência é apagada; o portão nomeia `kernel_claim:<id>` |
| `kernel_manifest` sem aprovação independente | `approved_by` = `kernel` (a FK/CHECK é solta) ou = o dono do pedido, ou sem hash, sem data ou sem registro que case |
| `policy_decision` sem regra correspondente | decisão `allow` sem regra ou citando regra inexistente — a negação sem regra **não** é violação |
| instrumento publicado sem passar pelo portão registrado | `source_tool.published` com `updated_by` de uma pessoa e sem linha em `source_publication` |

`--self-test` corrompe **uma** linha de propósito e imprime a violação exata:

```
VIOLAÇÃO kernel_atom:atom-agente: o átomo "atom-agente" está sem source_quote. [atom-sem-evidencia]
[self-test] ok: o portão falhou e nomeou "atom-agente".
```

O portão também sai com **código 1** sobre banco violado (medido no teste, numa cópia da árvore com
uma migration quebrada) e dá **a mesma resposta** em duas execuções.

## 6. O que a migration 0038 acrescenta

`migrations/0038_processo_source.sql` — idempotente (aplicada 4 vezes seguidas, o banco fica igual):

- **manifesto**: `hash`, `approved_at`, `policy_set`, `validators`, `version`, `evidence_ref`;
- **evidência**: `reference` (onde a afirmação se confere);
- **átomo**: `source_quote`, `pinpoint`, `source_quote_sha256`, `source_canonical_id`;
- **pedido**: `owner_id`, `source_ref`, `hash`, `acceptance_criteria`;
- **novas**: `kernel_approval` (o registro de aprovação que casa com o manifesto) e `source_publication`
  (portão, decisão e evidência da publicação);
- **backfill**: os 4 átomos semeados passam a citar a fonte, o trecho e o sha256 do trecho; as 4
  evidências semeadas ganham `reference`.

A 0038 **não** cria linha em `schema_entity`: quem fecha o dicionário é a
`0041_passa_de_aprovacao.sql`, do dono, e ela já adiciona `kernel_approval` e `source_publication` com
label — o portão do índice está em 96/96 e passa.

### 6.1 O defeito que a verificação encontrou

`src/core/registry/source-registry.ts` gravava e lia `kernel_atom.source_canonical_id` — coluna que
**nenhuma migration criava**: `gravarAtomaDaFonte` e `fontesDoBanco` quebravam em runtime
(`column "source_canonical_id" of relation "kernel_atom" does not exist`). A intenção estava
documentada (§6) mas a migration não tinha a coluna. Corrigido na 0038
(`alter table kernel_atom add column if not exists source_canonical_id text;`) e coberto pelo teste
novo `src/core/registry/source-registry.test.ts` (8/8), que roda contra as migrations aplicadas e
prova o caminho de falha: fonte sem hash, sem dono, sem origem, sem validador, citação com hash
trocado e fonte repetida com outro hash são recusados com o motivo nomeado.

`tsc` não pegaria isso — só a execução contra o banco pega.

## 7. O que ficou NOT_RUN

- `opa test contracts/cko-governance/opa` — **NOT_RUN**: o binário `opa` não está instalado no sandbox.
  A prova disponível é o fixture + o teste Node.
- `npm test` e `npm run build` — **NOT_RUN**: são do dono no fim (a suíte leva ~4,5 min e há outro
  worker na árvore). Rodei apenas o meu escopo.
- `npx tsc --noEmit` — roda, mas o ambiente está com `node_modules` quebrado (o symlink do repo aponta
  para `/tmp/appbuild/node_modules`, que não existe) e a árvore instalada não tem `better-auth` nem
  `@types/pg`, que estão declarados no `package.json`. Ficam **24 erros**, todos de
  `src/lib/auth/**`, `src/lib/app-data/client.server.ts` e `src/lib/db.ts`, por falta dessas
  declarações — em arquivos que **não** toquei. **Zero** erros em `src/core/**`,
  `src/lib/kernel-admit.ts`, `src/lib/intake.ts`, `src/lib/policy-decision.ts` e
  `src/lib/source.functions.ts` (fora a cascata pré-existente do `@tanstack/react-start`).
- **Banco vivo** (98 tabelas medidas pelo dono em 26/10) — **NOT_RUN**: sem `DATABASE_URL` neste
  sandbox, todas as medições são sobre o schema montado pelas migrations (96 tabelas). O portão conta
  o schema sozinho, então ele vale para os dois bancos.

## 8. Dependências que ficaram abertas

1. **A atomização normativa (0040) tem que substituir o trecho do átomo.** O trecho gravado pela 0038
   é a afirmação do próprio átomo — é o que a base de 26/10 tinha. Quando a captura das 25 normas
   virar átomo, `source_quote` tem que ser o literal da norma, com o mesmo `pinpoint` e o sha256
   recalculado. O portão (`atom-sem-evidencia`) exige os três campos, mas não exige que o trecho venha
   do texto da norma: essa é a lacuna que a 0040 fecha.
2. **A avaliação de política ainda é local.** O avaliador injetado em `admitOrder` é a avaliação do
   conjunto de regras com a decisão gravada em `policy_decision`. O Rego é a candidata local; plugar um
   OPA autenticado é troca de avaliador em `src/lib/kernel-admit.ts`, não de kernel.
3. **A aprovação é um processo separado, com nome.** `aprovarManifesto()` é a porta de entrada, e ela
   recusa o dono e o `kernel`. Quem for fazer a aprovação na área admin tem que chamar essa função (ou
   equivalently gravar `kernel_approval` + manifesto aprovado com a mesma data).
4. **`admit()` passou a devolver Promise.** O kernel é assíncrono. Ninguém no app chama `admit()` fora
   do teste, mas quem chamar tem que fazer `await`.
5. **O `business_rule` novo nasce em rascunho** (convenção do dicionário) e é a 0041 do dono que
   aprova em lote — as regras do portão continuam valendo depois disso.

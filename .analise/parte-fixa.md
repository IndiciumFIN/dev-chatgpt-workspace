# Dicionário do banco — as 67 tabelas sem cobertura

## Resumo

As 67 tabelas que o dicionário não cobria entraram no dicionário: cada uma ganhou nome de uso, camada e finalidade, com a chave primária e as ligações conferidas contra o DDL medido (67 conferidas, 0 problemas). O portão `scripts/audit-indice-banco.mjs` passou de **67 achados e saída 1** para **0 achados e saída 0**, com 166 tabelas no banco, 166 no dicionário e 166 linhas no índice; e ganhou três regras novas que o mantêm fechado: finalidade vazia, chave primária inventada e chave primária divergente da do DDL. Nenhuma entrada nova foi marcada como aprovada: a única linha nova de `data_specification` entrou como `rascunho`, com `approved_by` e `approved_at` nulos.

## 1. As 67 entradas

<!--TABELA-->

### Repartição medida (`.analise/conferir.mjs` e `.analise/medir-chave.mjs`)

| recorte | contagem | como foi medido |
|---|---|---|
| camada `carreira` | 43 | prefixo `career_*` no nome da tabela |
| camada `canonica` | 10 | 8 `canonical_*` + `historia_nao_mesclada` + `blob_conflict` (operação de arquivo e branch) |
| camada `participacao` | 7 | prefixo `participation_*` |
| camada `pesquisa` | 4 | prefixo `research_*` |
| camada `processo` | 2 | `kernel_coluna_citada` e `mudanca_producao` (atravessam domínio) |
| camada `conteudo` | 1 | `review_item` (fila de revisão de texto) |
| **total** | **67** | `schema_entity` tem 166 linhas; o banco público tem 166 tabelas |

| recorte | contagem | observação |
|---|---|---|
| `career_*` | 43 | DDL `0004_career_youth_candidate.sql` (33), `0005_career_editorial_content_candidate.sql` (2), `0006_career_atomization_candidate.sql` (5), `0007_career_promotion_control_candidate.sql` (3) |
| `canonical_*` | 8 | `0038`, `0041`, `0043`, `0044`, `0045`, `0046`, `0047` |
| `participation_*` | 7 | `0004_research_participation_candidate.sql` |
| `research_*` | 4 | `0004_research_participation_candidate.sql` |
| outras | 5 | `historia_nao_mesclada`, `mudanca_producao`, `kernel_coluna_citada`, `review_item`, `blob_conflict` |
| `cko_*` | **0** | medido em `.analise/medir-schemas.mjs`: o schema `public` tem 166 tabelas e as tabelas `cko_*` vivem em schemas próprios (`cko_orch` 9, `cko_governance` 3, `cko_validation` 2, `cko_evidence` 1 = 15 fora do `public`). O dicionário e o portão descrevem o schema `public`, portanto nenhuma delas entra nas 67. O resumo do dono ("4 cko_*") não se confirma nesta árvore; a lista de 67 foi re-derivada de `.analise/tabelas.json` |

### O que o dicionário diz de cada uma

- **Nome de uso**: a `label` que a área admin mostra. Não grita, não é o nome técnico, não repete o nome de outra tabela (o portão reprova os três casos).
- **Camada**: a camada do dicionário (`schema_layer`), com os nomes que o repo já usa nos produtos — Carreira, Camada canônica, Participação social, Pesquisa. As três camadas novas entram na 0036 com `on conflict (id) do nothing`.
- **Finalidade**: a pergunta que a tabela responde, escrita a partir das colunas que carregam sentido na tabela (`.analise/conferir.mjs` mede quais colunas são "portadoras de sentido": identificador, chave estrangeira, carimbo de tempo, booleano e impressão digital não contam).
- **Nenhuma ficou "por derivar"**: as 67 têm ao menos uma coluna portadora de sentido, medida uma a uma. A única ressalva é `canonical_divergence`, que não tem chave primária no DDL — o campo `primary_key` diz `sem chave primária` e a finalidade avisa que o código se repete (medido: `D03` aparece 3 vezes em 16 linhas).

## 2. Portão antes e depois

### Antes (estado HEAD, migrations da branch, 4 ficheiros no estado HEAD)

Cópia medida em `/workspace/pendencias/dicionario-banco/antes` (migrations e scripts do HEAD, `src/lib/banco/indice.ts` e `migrations/0036_indice_do_banco.sql` no HEAD):

```bash
cd /workspace/pendencias/dicionario-banco/antes && node scripts/audit-indice-banco.mjs
```

```
[índice] tabelas no banco:        166
[índice] tabelas no dicionário:   99
[índice] linhas no índice:       99
[índice] tabelas com label:      99
[índice] fora do dicionário:     67
  achado  blob_conflict: a tabela "blob_conflict" existe no banco e o dicionário não a descreve.
  … (67 achados, um por tabela)
HOLD_HUMAN: 67 tables lack schema_entity and index coverage; no automatic labels generated.
```

**Exit code: 1.** As contagens reproduzem exactamente as do dono (166 tabelas no banco, 99 no dicionário, 67 fora).

### Depois (estado entregue)

```bash
cd /workspace/pendencias/dicionario-banco/repo && node scripts/audit-indice-banco.mjs
```

```
[índice] tabelas no banco:        166
[índice] tabelas no dicionário:   166
[índice] linhas no índice:       166
[índice] tabelas com label:      166
[índice] fora do dicionário:     0
```

**Exit code: 0.** O portão continua fechado: ele reprova se houver divergência entre banco, dicionário e índice (`indexAuditReleaseAllowed` exige `violacoes.length === 0`, `tabelasForaDoDicionario === 0` e banco = dicionário = índice), e nenhuma contagem está escrita à mão no código — o número vem do banco a cada execução.

### O que o portão passou a segurar

| regra nova | como acusa | provado por |
|---|---|---|
| `finalidade-vazia` — a tabela está no dicionário e o dicionário não diz o que ela responde | `schema_entity.purpose` vazio | `--self-test` (quebra `canonical_asset`) e teste dedicado |
| `chave-primaria-inventada` — o DDL não declara chave primária e o dicionário declara uma | `pg_constraint` × `schema_entity.primary_key` | `--self-test` (quebra `canonical_divergence`) e teste dedicado |
| `chave-primaria-divergente` — o dicionário declara uma chave diferente da do DDL | `pg_constraint` × `schema_entity.primary_key` | teste dedicado (`tool_band`) |

O `--self-test` agora quebra **uma coisa por rodada** (label vazia, finalidade vazia, chave inventada), prova que o portão acusa **e** que barra a passagem, e devolve o valor original:

```bash
cd /workspace/pendencias/dicionario-banco/repo && node scripts/audit-indice-banco.mjs --self-test
```

```
[self-test] quebrei label de "user". O portão tem que acusar label-vazia:
  VIOLAÇÃO user: schema_entity.label de "user" está vazia: a tabela não tem nome de uso.
[self-test] ok: o portão falhou, nomeou "user" e barrou a passagem.
[self-test] quebrei purpose de "canonical_asset". O portão tem que acusar finalidade-vazia:
  VIOLAÇÃO canonical_asset: schema_entity.purpose de "canonical_asset" está vazia: a tabela não diz o que ela responde.
[self-test] ok: o portão falhou, nomeou "canonical_asset" e barrou a passagem.
[self-test] quebrei primary_key de "canonical_divergence". O portão tem que acusar chave-primaria-inventada:
  VIOLAÇÃO canonical_divergence: o DDL de "canonical_divergence" não declara chave primária e o dicionário declara "code".
[self-test] ok: o portão falhou, nomeou "canonical_divergence" e barrou a passagem.
```

**Exit code: 0** (as três rodadas acusaram).

## 3. Ficheiros alterados

| ficheiro | linhas | +/− | o que mudou |
|---|---|---|---|
| `src/lib/banco/indice.ts` | 1553 | +605/−1 | as 67 entradas novas (nome de uso, camada, finalidade, chave), no formato exacto que as 99 anteriores já usavam |
| `migrations/0036_indice_do_banco.sql` | 274 | +161/−1 | as 67 linhas de `schema_entity` (`on conflict (name) do update set`), as 4 camadas novas em `schema_layer` e a linha nova de `data_specification` da coluna `label` |
| `scripts/audit-indice-banco.mjs` | 341 | +105/−13 | três regras novas (finalidade, chave inventada, chave divergente) e `--self-test` com uma quebra por rodada |
| `scripts/audit-indice-banco.test.mjs` | 311 | +166/−9 | fixture do portão com os números medidos, 4 testes novos e o travão das 67 |
| `src/lib/dictionary.test.ts` | 79 | +8/−2 | só a regex que lê `create table if not exists`: sem a distinção, o teste contava 4 schemas (`cko_orch`, …) como se fossem tabelas. Não mexe em nenhuma regra de `approved_by`/`approved_at` |
| `artifacts/db-indice.json` | 11 | +5/−5 | o relatório do portão reescrito pela própria execução (166/166/166/166/0) |
| `.analise/` (13 ficheiros novos) | 4164 | — | a evidência da derivação: `dump.mjs`, `tabelas.json`, `conferir.mjs`, `medir-chave.mjs`, `medir-idempotencia.mjs`, `medir-schemas.mjs`, `aplicar-camadas.mjs`, `gerar-tabela.mjs`, `isolar-0036.mjs`, `testar-consulta-pk.mjs`, `parte-fixa.md`, `tabela-67.md`, `conferido.json` |

## 4. O que NÃO foi medido

| item | estado | motivo |
|---|---|---|
| `npm test` (suíte completa) | **NOT_RUN** | a tarefa manda explicitamente que o dono rode `npm test` e `npm run build` no fim. Corri só as suites do escopo: `node --test scripts/audit-indice-banco.test.mjs` (13 testes, 13 passam) e `node --experimental-strip-types --import ./scripts/alias-hook.mjs --test src/lib/dictionary.test.ts` (1 teste, passa) |
| `npm run build` | **NOT_RUN** | mesma razão. O typecheck foi corrido: `node_modules/.bin/tsc --noEmit` → **1 erro pré-existente**, `src/routes/blog.mary-eliza-mahoney.tsx(8,38) TS2345`. Medido no estado HEAD também (cópia `antes`, mesmos 4 ficheiros no HEAD): o mesmo erro, o mesmo ficheiro. A causa é `src/routeTree.gen.ts` gerado e desatualizado — a rota `/blog/mary-eliza-mahoney` não está na árvore gerada. Não é deste entregável |
| `npm run lint` | **NOT_RUN** | fora do escopo do dono nesta tarefa; o repo tem ESLint configurado e a tarefa só pede o portão, o teste do portão e o typecheck |
| Telas da área admin para as 67 | **NOT_RUN / fora de escopo** | as 67 entradas ficam com `admin: null`: elas descrevem tabelas de estágio (`*_candidate`) e de operação da camada canônica, que ainda não têm mesa no admin. Abrir mesa para elas é o trabalho de admin-ux, não deste entregável |
| Ligações declaradas das 99 entradas anteriores | **medido, fora de escopo** | `.analise/medir-chave.mjs`: 21 das 166 entidades têm `links` que não bateem com a FK real do DDL (ex.: `tool_band_nanda` declara `tool_band`, a FK real é `tool_slug → tool_band.min_score` + `min_score → tool_band.min_score`). Nenhuma das 67 está nessa lista — as 67 batem todas. As 21 são de entradas anteriores a este entregável e a sua correcção é outra tarefa |
| Defeito pré-existente em `migrations/0033_cross_keys.sql:131` | **medido, não corrigido** | a linha de `content_place` grava `links` como `section_slug → section_page.slug on conflict do nothing; …` — o texto do `on conflict` ficou colado dentro do valor. É uma migration alheia; corrigi-la aqui seria editar migration de outra pessoa |

## 5. Notas

- **Nada aprovado.** `data_specification` tem 0 linhas com `status = 'aprovado'` depois do entregável. A linha nova (`spec-schema_entity-label`, para a coluna `label` de `schema_entity`) está `rascunho`, `approved_by = null`, `approved_at = null` — medido em `.analise/medir-idempotencia.mjs`. A regra do repo (`approved_by ≠ 'derby-normalizacao'` e `approved_at` preenchido quando `status = 'aprovado'`) continua intacta em `src/lib/dictionary.test.ts`.
- **A migração é idempotente.** `.analise/medir-idempotencia.mjs` aplica as 60 migrations, aplica a 0036 outra vez e compara: a segunda passagem **roda sem erro** e `schema_entity`, `schema_layer`, `schema_column` e `data_specification` ficam **inalterados** (4 de 4 comparação igual).
- **Índice e dicionário não podem divergir.** `.analise/conferir.mjs` confere as 67 entradas nos dois lugares (código e banco) e contra o DDL: 0 divergências de nome de uso, 0 de camada, 0 de finalidade, 0 de chave primária (a chave escrita é a chave medida, ou diz "sem chave primária"), 0 ligações declaradas sem FK real e 0 FK real sem ligação declarada.
- **A camada nova não é taxonomia nova.** `'carreira'`, `'canonica'`, `'participacao'` e `'pesquisa'` são os nomes que o repo já usa nos produtos (`produto` em `src/lib/banco/indice.ts`): Carreira, Camada canônica, Participação social, Pesquisa. As camadas que já existiam (`identidade`, `acesso`, `processo`, `conteudo`, `clinico`) não foram mexidas.
- **Patch**: `git add -A && git diff --cached > /workspace/pendencias/dicionario-banco/dicionario-banco.patch`, sem commit. `git apply --check --reverse` passa no estado actual; e `git apply --check` também passa para a frente, sobre os ficheiros do HEAD (cópia em `/workspace/pendencias/dicionario-banco/forward2`): depois de aplicado, os 6 ficheiros ficam byte a byte iguais aos do repo.
- **Comandos para remedir** (o número nunca fica de memória):
  - portão: `node scripts/audit-indice-banco.mjs`
  - prova de que o portão sabe falhar: `node scripts/audit-indice-banco.mjs --self-test`
  - testes do portão: `node --test scripts/audit-indice-banco.test.mjs`
  - teste do dicionário: `node --experimental-strip-types --import ./scripts/alias-hook.mjs --test src/lib/dictionary.test.ts`
  - conferência das 67 contra o DDL: `node .analise/conferir.mjs`
  - chave e finalidade das 166: `node .analise/medir-chave.mjs`
  - onde vivem as tabelas por schema: `node .analise/medir-schemas.mjs`
  - idempotência da 0036: `node .analise/medir-idempotencia.mjs`

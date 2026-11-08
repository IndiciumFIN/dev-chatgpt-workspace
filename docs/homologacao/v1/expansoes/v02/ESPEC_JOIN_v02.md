---
document_id: WUTRIB-DOC-EXP-V02-JOIN
version: 0.2.0
status: DRAFT
wo: WUTRIB-WO-PLAN-018
owner_role: DATA_ARCHITECT
reviewer_role: INTERNAL_AUDIT_AND_FISCAL
approver_role: PRODUCT_OWNER
approved_by: NONE
approved_at: NONE
classification: INTERNAL
---

# EXP-004 — Join Studio e reconciliação de cardinalidade

## Contrato de entrada e tipos de relação
Fonte L e R requerem mesmo escopo autorizado, schema de chave, snapshots íntegros, unidade de observação, período, contexto organizacional e tipo de correspondência. Junção por `orgCode/branchCode` deve ser uma restrição obrigatória, **não apenas filtro opcional**.

Tipos planejados: `INNER`, `LEFT_OUTER`, `RIGHT_OUTER`, `FULL_OUTER`, `LEFT_ANTI`, `RIGHT_ANTI`, `LEFT_SEMI`, `RIGHT_SEMI`; operações temporais `AS_OF` com vigência e comparação numérica por faixa são extensões condicionais, com contrato específico. `FUZZY` produz **candidatos**, não matches fiscais definitivos.

## Processo de pré-join
1. Verificar que ambos os datasets estão íntegros; se qualquer lado for `INCOMPLETE`, bloquear decisão final.
2. Checar tipos comparáveis; valores como chaves fiscais de 44 dígitos e códigos com zeros à esquerda são **strings**, não `number`.
3. Contar nulos, valores únicos, duplicados e distribuição de multiplicidade por chave; `null` não casa com `null` por padrão fiscal, salvo contrato explícito de semântica.
4. Exibir prévia dos pares por chave e estimativa de cardinalidade: 1:1, 1:N, N:1, N:M; simular quantidade de linhas por chave antes de executar. Para chave `k`, máximo potencial `nL(k)*nR(k)` se ambas multiplicidades forem positivas.
5. Definir regra de alocação/agrupamento e tolerância por tipo de dado/tributo; sem ela não fazer agregação automática após N:M.

## Resultado
Produzir `matched_pairs`, `left_unmatched`, `right_unmatched`, `multiplicity_conflicts`, `null_keys`, `coverage`, `input_counts`, `output_counts`, `side_totals` e `lineage`. Cada linha carrega IDs de origem distintos, `joinConfigDigest` e matchType, com destaque de hipótese versus match confirmado.

**Métricas:** `coverage_left = distinct_matched_left_rows / eligible_left_rows`; `coverage_right` análoga, respeitando exclusões e 0 denominador como `UNDEFINED`. Tamanho da saída não é percentual de conciliação e `matched_pair_count` não equivale a documentos distintos.

## Invariantes contábeis e fiscais
- Contagem de linhas preservada por identificador de origem, não por quantidade de pares.
- Totais por lado reconciliados com a população de entrada, não pela soma de valores de linhas expandidas N:M.
- Não compensar automaticamente valores de natureza diferente, estornos, adiantamentos e reversões; manter sinal econômico, origem e unidade.
- Regra de match temporal por período e datas de vigência deve explicitar timezone, inclusão de limites, datas do fato e conhecimento posterior.
- Documento órfão permanece evidência mesmo se um outro documento com mesmo valor for encontrado por fuzzy match.
- Múltiplos matches não são “conciliados” automaticamente apenas por alta similaridade.

## Exemplo de fixture puramente hipotética
`L:` NF1 100, NF2 200; `R:` NF1 100, NF2 150 e NF2 50. O join por chave gera 3 pares, mas a população L continua 2 documentos e R tem 3 linhas. Comparação de totais só será válida com regra explícita de agregação de NF2. A figura hipotética não é registro de cliente.

## Testes futuros NOT_RUN
`JOIN02-01` inner 1:1; `JOIN02-02` left anti; `JOIN02-03` full outer com null; `JOIN02-04` N:M bloqueia soma; `JOIN02-05` chaves compostas com zeros à esquerda; `JOIN02-06` cruzamento entre filiais negado; `JOIN02-07` combinação fora da vigência; `JOIN02-08` duplicidade de arquivo e explosão de linhas; `JOIN02-09` tolerância/decimal; `JOIN02-10` fuzzy não altera estado fiscal.

## UX
Diálogo de seleção de duas fontes com chips de período e filial, construtor de chave, prévia de unicidade, seletor de join com significado textual, aviso de explosão N:M, estimativa de linhas e custo, confirmação explícita, resumo de cobertura de ambos os lados e abas de matches/unmatched/duplicidade. Exportação integral e acessível, independente da paginação de tela.

**Referência pública conceitual:** Microsoft Learn — [Merge Queries](https://learn.microsoft.com/en-us/power-query/merge-queries-overview), que documenta inner/outer/anti e fuzzy textual. **Não** constitui homologação fiscal, nem autoriza copiar seu UI.

**Status:** PLANNED / NOT_RUN.

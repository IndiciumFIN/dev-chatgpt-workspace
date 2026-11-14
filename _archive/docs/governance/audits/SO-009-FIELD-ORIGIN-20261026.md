# SO-009 — Origem real dos identificadores de campo (26/10/2026)

**Estado:** FIND P0; auditoria SELECT; não cria chaves ou promove registros.

## Evidências quantitativas
- 1.199 linhas em `cko_governance.md_tool_field_contract_v2_candidate`.
- 1.199/1.199 `source_field_id` têm separador `::`.
- 1.199/1.199 têm prefixo igual a `tool_slug`.
- 1.182/1.199 representam exatamente `tool_slug || '::' || field_name`; **17 exceções** apontam renomeação, placeholder ou diferença entre nome legado e atual.
- Nenhuma chave composta `source_field_id` corresponde diretamente a `cko_governance.field_catalog.field_id` (catálogo estrutural usa chaves `B1F-...`).
- 1.137 contratos indicam `source_artifact=CALENF-LOCALE-TOOL-CLOSURE-v0.2.0/registries/tool-fields.json`; há outras fontes por instrumento/arquivo.
- Os 38 objetos com `IDENTITY_RECOVERED_FIELD_REGISTRY_RUN032_CANONICAL_ID_HOLD` indicam origem `cko_governance.field_catalog` no MD registry, **mas os IDs de campo têm namespace de instrumento**, sem FK comprovada para `field_catalog`. Essa atribuição deve ser corrigida por prova de linhagem, não por substituição cega.

## 17 exceções verificadas
- `apgar::pacMinuto` -> `evaluationMinute` (potencial alias histórico).
- `biblioteca-carinho-de-emergencia::field-1` ... `field-6` -> `field_1` ... `field_6` (mapeamento de placeholder; qualificar).
- `dimensionamento-cofen`: dez chaves `ttd-...` apontam para `td-...` (avaliar aliases ou erros originais).

## Implementação segura
1. Considerar `source_field_id` como chave imutável de *origem instrumental*, jamais FK direta para catálogo B1.
2. `field_name` é nome de campo do contrato e não deve substituir `source_field_id` sem mapeamento versionado explícito.
3. Exigir contrato de alias `source_field_id -> canonical_field_id` somente onde houver evidência e unicidade; IDs sem prova ficam HOLD.
4. Preservar integralmente as 17 exceções como candidatos a alias; rever os 38 objetos mestres quanto ao tipo e à proveniência.
5. Gate fail-closed: testar duplicação, cardinalidade, versão, direitos, integridade e reversão de consumidores.

## Limites
Os números demonstram padrão determinístico dos IDs; **não comprovam** existência de um arquivo legado acessível nem integridade clínica. Nenhum DML/DDL aplicado.

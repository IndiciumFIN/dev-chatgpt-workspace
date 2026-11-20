# SO-009 — Reconciliação de catálogos de campos (2026-10-26)

Status: FIND / READ_ONLY / HOLD. Não promover objetos nem criar FKs automaticamente.

## Resultado executado
- `md_tool_registry_v2_candidate`: 81 linhas `IDENTITY_RESOLVED` e 12 `HOLD_UNRESOLVED_TOOL_IDENTITY` apontam a `cko_closure.tool_dossiers`; 38 `IDENTITY_RECOVERED_FIELD_REGISTRY_RUN032_CANONICAL_ID_HOLD` apontam a `cko_governance.field_catalog`.
- `md_tool_field_contract_v2_candidate` possui 1.199 registros de campo. Em 1.199/1.199, `source_field_id` e `source_catalog_ref` estão preenchidos.
- Junção literal `f.source_field_id = c.field_id` com `cko_governance.field_catalog`: **0/1.199 correspondências**. Isto é uma discrepância de *namespace* de identidade, não comprovação de 1.199 campos inexistentes.
- Exemplos de `source_field_id`: `adicional-noturno::pacNome`, `adicional-noturno::pacIdade`; exemplos `field_catalog.field_id`: `B1F-...` e família `B1_CKO_GOVERNANCE_...`. São espaços de chaves aparentemente distintos.
- `source_catalog_ref='cko_governance.field_catalog'` no contrato não estabelece correspondência por igualdade com `field_catalog.field_id`. Não adicionar FK diretamente nem substituir IDs sem tabela de tradução/versionamento.
- 38 sem dossiê por slug em `cko_closure.tool_dossiers`; a origem deles é o catálogo de campos, exigindo crosswalk funcional específico.

## FIND-CKO-FIELD-NAMESPACE-009 — P0
**Fato:** referência textual a um catálogo e IDs presentes não demonstram uma chave estrangeira válida. 
**Risco:** uma migração FK ingênua quebra integridade ou fabrica links; falsa promoção.
**Próxima tarefa:** identificar tabela/namespace de origem efetiva dos 1.199 IDs compostos, detectar equivalências somente por prova, validar cardinalidade/versão/ownership e remediar os 38 mestres conforme classe de objeto. Se necessário, propor crosswalk tipado que *não* duplique mestres.
**Gates:** contrato → validador → testes negativos → WO → Kernel → auditoria independente; continuar HOLD.
**Origem das evidências:** consultas SELECT ao Supabase Calculadoras-Smart em 26/10/2026. 

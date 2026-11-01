# CE / Supabase — leitura independente do banco implantado (candidata, 2026-11-01)

**Autoridade:** inventário factual somente leitura. **Escopo:** `Calculadoras-Smart`, PostgreSQL 17.6.  
**Observação do servidor:** 2026-11-01 20:42:35 UTC (consulta metadata).  
**Branch de planejamento:** `plan/ce-best-excellence-supabase-readonly-20261101`; PR #37 contra `canonical/foundation-20261101`.  
**Gate:** `HOLD_HUMAN`. Não equivale a admissão pelo Kernel, compliance, revisão clínica ou homologação.

## Método e limites

Consultas SQL exclusivamente `SELECT` por conexão Supabase autorizada, sobre `pg_catalog`, `information_schema`, `supabase_migrations.schema_migrations` (contagem) e contagens agrupadas de tabelas operacionais existentes. Não houve DDL, DML, execução de migrations, acesso a dados clínicos, exposição de segredos, `db pull`, `db push` nem deploy. Os scripts de terminal preparados na PR são distintos destas leituras via conexão: ainda precisam de uma prova de execução real pelo runner `psql`.

## 1. Crosswalk com o contrato estrutural existente

Origem versionada: `contracts/cko-governance/structural-table-registry.v1.json`, no HEAD-base `3fcf566892d21fff3a37882db28c653bb1840ed1`.

| Estado | Quantidade | Diagnóstico |
|---|---:|---|
| `existing_reused` presentes em `pg_class` | 12/12 | Reutilizar. Nenhum missing entre estes 12 objetos. |
| `candidates` já existentes | 0/8 | São explicitamente `CANDIDATE_NOT_APPLIED`; ausência esperada, não autoriza criação. |
| Migrations no ledger remoto | 240 | Versões em padrão temporal; NÃO comparar número da pasta `migrations/` por simples igualdade de nome. |
| Portões gerais da candidata | FAIL | PR #36 e fundação ainda não homologadas. |

As oito candidatas estão nomeadas no registro: `cko_orch.work_order_admission_requests`, `work_order_policy_bindings`, `policy_bundle_artifacts`, `work_order_policy_evaluations`, `work_order_required_validators`, `work_order_validator_results`, `kernel_admission_decisions`, `cko_governance.agent_tool_scopes`. Exigir teste de equivalência funcional com tabelas existentes antes de propor qualquer nova migration.

## 2. Acervo real existente a aproveitar

| Inventário remoto | Contagem |
|---|---:|
| `cko_governance.normative_reference_catalog` | 362 |
| `cko_governance.field_normative_bindings` | 10.925 |
| `cko_governance.normative_document_extractions` | 33 |
| `cko_regulatory.acquisition_queue` | 43 |
| `cko_evidence.sources` | 157 |
| `cko_validation.validators` | 77 |
| `cko_validation.validator_executors` | 48 |
| `cko_orch.policy_registry` | 22 |

**Atenção:** contagem de registros não implica completude, aprovação, fonte oficial verificada ou teste executado.

### Filas de aquisição

`QUEUED 18`; `ACQUIRED_PENDING_VALIDATION 9`; `NO_CHANGE 6`; `IN_PROGRESS 5`; `CHANGE_ALREADY_OPEN 3`; `FAILED 1`; `COMPLETE 1` — soma 43.

### Extração normativa

`PASS 16`; `PENDING_INDEPENDENT_REPERFORMANCE 5`; `PASS_METADATA_SCOPE 4`; `HOLD_FULL_TEXT_NOT_CONTROLLED 3`; `CANDIDATE_UNCHECKED 2`; `PASS_METADATA_ONLY_NO_CLAUSE_EXTRACTION 2`; `CANDIDATE_CONTEXT_ONLY 1` — soma 33.

`PASS` aqui é estado registrado na origem, não atestado desta auditoria independente; examinar evidência e aprovação antes de promoção.

### Qualificação de sources

`CONTROLLED_DISCOVERY 76`; `PENDING_BOARD_REVIEW 43`; `ACCREDITED 30`; `VISUAL_SECONDARY_CONTROLLED 3`; `IDENTITY_SECONDARY_CONTROLLED 2`; `OBSERVED_LIVE 1`; `CONTROLLED_DERIVED 1`; `PENDING_RIGHTS_REVIEW 1` — soma 157.

### Validadores

77 cadastrados: `ACTIVE 70`; `CONTROLLED_CONTRACT_CANDIDATE 7`.  
48 executores: `IMPLEMENTED 16`; `EXECUTABLE_FAIL_CLOSED 13`; `EXECUTABLE 6`; `PARTIAL 6`; `DECLARED 5`; `IMPLEMENTED_PACKAGE_PENDING_RELEASE_BINDING 1`; `EXECUTABLE_DECLARED_UNIVERSE 1`.

`ACTIVE` de catálogo não significa `IMPLEMENTED` no executor. Precisa crosswalk por validator_id e versão, observando se a implementação possui testes adversariais.

## 3. RLS: inventário, não exploração

| Schema | Tabelas-base | RLS habilitado | RLS desabilitado |
|---|---:|---:|---:|
| `public` | 48 | 48 | 0 |
| `calculadoras_de_enfermagem` | 22 | 22 | 0 |
| `cko_governance` | 88 | 3 | 85 |
| `cko_orch` | 27 | 0 | 27 |
| `cko_evidence` | 7 | 0 | 7 |
| `cko_regulatory` | 9 | 0 | 9 |
| `cko_validation` | 21 | 0 | 21 |

Os schemas `cko_*` podem ser deliberadamente privados. **Não inferir vazamento por RLS desligado**; antes, comprovar exposição no Data API, `GRANT/REVOKE`, `USAGE`, proprietário, views, funções `SECURITY DEFINER` e policies efetivas. Nenhuma mudança remota foi feita.

## 4. Frentes paralelas governadas, usando WOs existentes

| Frente | WO/registro a consultar | Próximo teste determinístico |
|---|---|---|
| Normativos transversais | `WO-GOV-TRANS-001` e `transversal-standards-candidates.v1.json` | Fonte/edição/licença/atualidade + amostragem de cláusulas |
| Enfermagem COFEN/COREN | `WO-CKO-COFEN-001`, 17 achados do pacote | Hash do ZIP original, parser/OCR, segmentação, evidência independente |
| Fila de aquisição | `cko_regulatory.acquisition_queue` | `acquisition_id` ↔ source ↔ output ↔ checksum ↔ WO |
| Validação | `cko_validation.validators`, `validator_executors` | cobertura, status e teste negativo por `validator_id` |
| Fundamentos | `structural-table-registry.v1.json` e `docs/governance/04-work-order-model.md` | vínculos WO→política→validador→Kernel |
| SQL/Segurança | migrations locais × ledger remoto + grants | crosswalk de versão, execução e autorização; SEM aplicar migration |

## 5. Achados candidatos — sem duplicar registros canônicos

- **CE-SUPA-XW-01:** 12 objetos previstos para reúso realmente existem; prosseguir com metadados/qualidade sem criar substitutos.
- **CE-SUPA-XW-02:** 8 tabelas candidatas ausentes; manter `CANDIDATE_NOT_APPLIED`, exigir prova de necessidade e ausência de equivalentes.
- **CE-SUPA-NORM-01:** 43 aquisições e 33 extrações mostram filas e estados heterogêneos; não promover em bloco.
- **CE-SUPA-VAL-01:** 77 validadores vs. 48 registros de executores; exige reconciliação por identidade/versão e lacunas reais.
- **CE-SUPA-SEC-01:** verificar ACL/exposição efetiva dos schemas `cko_*` e `SECURITY DEFINER`, sem alegar vulnerabilidade automaticamente.
- **CE-SUPA-MIG-01:** 240 registros históricos; conciliar origem/SHAs do Git e famílias de migration antes de qualquer migração nova.

Estes códigos são rótulos **desta auditoria candidata**, NÃO novos FINDs/WO automaticamente admitidos; o vinculador deve apontá-los aos registros existentes ou pedir avaliação de equivalência.

## 6. Reprodutibilidade no Git

- `scripts/sql/ce-supabase-catalog-readonly.sql` — catálogo estrutural;
- `scripts/sql/ce-supabase-governance-readonly.sql` — agregados das mesmas tabelas;
- `scripts/ce-supabase-inventory-readonly.sh` — runner `psql` sem token;
- `scripts/ce-reconcile-supabase-catalog.mjs` — crosswalk offline;
- `tests/ce-reconcile-supabase-catalog.test.mjs` — testes positivos/negativos.

**Pendências de aceitação:** executar os dois SQLs pelo runner real (com role PostgreSQL somente leitura), confrontar integridade dos JSONs e as versões das migrations, repetir testes em CI, ampliar as 33 branches pré-existentes a reconciliação recursiva (mais a branch desta PR), auditar conexão Drive e arbitrar WOs/aliases. Nenhum critério de release foi relaxado.

**Estado de encerramento desta rodada:** inventário observado, baseline candidata versionável; `HOLD_HUMAN`, sem merge, sem deploy, sem schema write.

## 7. Crosswalk documental reservado — NORM-KERNEL (Drive)

Em leitura autorizada, foram localizados o blueprint `blueprint-norm-kernel.md`, `POL-NK-001.md`, `POL-NK-002.md`, `POL-NK-003.md` e `source_playbook.md`. Este relatório registra somente a avaliação operacional, **sem copiar conteúdo nem URLs privadas para o repositório público**.

- A `WO` exigida em `docs/governance/04-work-order-model.md` nasce no planejamento, representa o ciclo de vida completo e deve vincular tarefas, fontes, validadores, políticas e evidências.
- A `ServiceOrder / NK-OS` de `POL-NK-002` é um ato específico do NORM-KERNEL exigido para modificar registros normativos. É **subordinada e vinculada à WO**, não um substituto nem uma cadeia independente.
- `POL-NK-001` determina norma granular por campo e pin hash do anexo; `POL-NK-003` exige capacidades explícitas, default deny, Kernel guardião, segregação de validação/aprovação e ato humano para emendas estruturais.
- O `source_playbook.md` obriga fonte registrada, estado de licença, job com OS, hash no download, parser/atomização com evidências, retries justificados e bloqueio de publicação sem gates.
- Há **versões/pins históricos aparentes** nos textos consultados (cabeçalhos, emendas e anexos podem apontar a revisões distintas). Não presumir qual é o documento atual ou declarar DRIFT sem comparar os anexos reais, hashes e política ativa admitida no runtime.

**GAP documental prioritário:** mapear `WO` ↔ `ServiceOrder` ↔ `SourceRegistry` ↔ `NormDocument` ↔ `ExtractionRun` ↔ `NormAtom` ↔ `field_norms` ↔ `EvidenceRegistry` aos objetos reais do Supabase, seus contratos Git e evidências de execução. Qualquer lacuna permanece `NOT_VERIFIED`.

**Conferência independente de SQL agregado:** o corpo `SELECT` de `scripts/sql/ce-supabase-governance-readonly.sql` foi executado pelo conector Supabase sem mutações e retornou os mesmos totais do item 2. O shell `psql` permanece sem comprovação de execução remota, pois requer acesso PostgreSQL próprio e role de leitura.


## 8. Leitura de permissões — qualificação do risco (2026-11-01 20:47:22 UTC)

O SQL agregado versionado foi ampliado com `has_schema_privilege` e `has_function_privilege` e seu corpo `SELECT` foi reexecutado com sucesso via Supabase. Resultado observado:

- `anon` e `authenticated` possuem `USAGE` no schema `public`, **não** possuem `USAGE` em `calculadoras_de_enfermagem`, `cko_evidence`, `cko_governance`, `cko_orch`, `cko_regulatory`, `cko_validation`.
- Funções `SECURITY DEFINER`: `cko_governance` 35 (20 com privilégio de `EXECUTE` reportado para cada papel), `cko_orch` 36 (zero), `cko_regulatory` 1 (zero), `cko_validation` 28 (22), `public` 56 (zero).
- **Interpretação controlada:** `EXECUTE` sobre função em schema sem `USAGE` não basta para invocação direta por esses papéis. Ainda é necessário mapear wrappers/rpc expostos, encadeamento `SECURITY DEFINER`, `search_path` e ACLs no runtime antes de concluir segurança ou vulnerabilidade.

Classificação atual `SECURITY_REVIEW_REQUIRED`, **não `CONFIRMED_EXPOSURE`**. Nenhuma permissão, policy ou função foi alterada.

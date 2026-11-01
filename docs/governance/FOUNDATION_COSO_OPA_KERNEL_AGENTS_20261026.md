# Fundação COSO IA / OPA / Kernel / Agentes — implantação candidata, sem promoção

**Data:** 2026-10-26  
**Origem:** `IndiciumFIN/dev-chatgpt-workspace`, branch `preview/central-comando-20261026`.  
**Limite de autoridade:** backup público isolado (AGENTS.project.md); **não é o Kernel governado de produção**.

## Escopo executado e evidência

- Reconciliadas via consultas **somente leitura** do Supabase `Calculadoras-Smart` as estruturas existentes (não se alterou o banco):
  - `cko_governance`: 88 tabelas; `cko_orch`: 27; `cko_validation`: 21; `cko_ai`: 17; `cko_evidence`: 7.
  - 240 migrações registradas na data da leitura. Os números são inventário observado, não status de homologação.
  - Reutilizar `cko_orch.policy_registry`, `cko_orch.workflow_instances`, `cko_orch.idempotency_keys`, `cko_orch.outbox_events`, `cko_governance.decisions`, `cko_governance.agent_registry`, `cko_governance.control_framework_nodes`, `cko_governance.control_framework_mappings`, `cko_validation.findings`, `cko_validation.validators`, `cko_evidence.evidence_bundles`. Nenhum cadastro concorrente desses objetos será criado.
- Migração SQL **candidata, não executada**: `migrations/candidates/20261026_governance_kernel_opa_agents.sql`.
- Registro estrutural versionado: `contracts/cko-governance/structural-table-registry.v1.json`.
- Política Rego candidata e testes: `contracts/cko-governance/opa/kernel_admission.rego` e `kernel_admission_test.rego`.
- Kernel local: `src/core/governance/kernel.ts` e testes negativos para manifestos, políticas, aprovação independente e validadores.
- Guardião determinístico para agente: `src/core/governance/agent-authorization.ts` e testes. **É pré-checagem; não autoriza execução remota.**

## Relacionamentos da estrutura candidata

```text
[cko_validation.findings]                [cko_orch.workflow_instances]
               \                          /
              [work_order_admission_requests] ---- [cko_evidence.evidence_bundles]
                       |
          +------------+---------------+
          |            |               |
  [policy_bindings] [required_validators] [kernel_admission_decisions]
          |            |               /       \
  [policy_registry] [validators]   [policy_evaluations] [governance.decisions]
          |            |               | 
  [policy_bundle_artifacts] [validator_results] ------ [evidence_bundles]
                       |
                 [agent_tool_scopes] ---- [governance.agent_registry]
```

**As relações são estruturais e de proveniência, não atestam poderes de execução.** Os oito registros candidatos adicionam vínculos, sem substituir cadastros mestres existentes. PKs, FKs, índices, constraints, RLS + FORCE e revogações em tabelas novas estão na migração.

## Aplicação disciplinada dos referenciais

O COSO ICIF (5 componentes) e COSO ERM servem como estrutura de controles e riscos. O material COSO 2026 para IA generativa, ISO/IEC 42001, ISO/IEC 23894, NIST AI RMF e OWASP Agentic definem dimensões complementares de avaliação, com direitos e aplicabilidade por fonte. **Nenhuma norma foi declarada integralmente implementada ou certificada.**

`cko_governance.control_framework_nodes` e `control_framework_mappings` são a fonte de referência para crosswalks. Exigir dossiê de evidências com `source_id`, edição, aplicabilidade e localização de requisito antes de confirmar controles específicos.

## Regras de segurança

1. Falha de fonte, licença, política, validador, aprovação, integridade ou avaliação OPA **bloqueia apenas a operação dependente**.
2. OPA funciona como PDP; executor/backend funciona como PEP. Um resultado na UI ou em callback local **não** executa nem homologa uma WO.
3. Uma aprovação humanamente registrada exige independência maker/checker/auditor; o Kernel não se autoaprova.
4. O runtime do agente nunca transforma `reads`, `writes` ou `tool_allowlist` declaradas em permissão sem avaliar o contexto da WO e a política vigente.
5. RLS sem grants públicos em tabelas candidatas; nenhum `service_role` no front-end. Triggers e constraints fornecem defesa em profundidade, mas **não substituem autenticação e autorização de serviço**.
6. A execução de migração, a revisão de RLS existente e a integração remota requerem reconciliar owner, versão, backup, teste em ambiente isolado e WO admitida.
7. Sem alteração, supressão ou renomeação das taxonomias canônicas; campos candidatos deverão passar por revisão antes de virar verdade corporativa.

## FINDs de arquitetura a formalizar antes de produção

- **Kernel local:** `buildManifest` autorizava aprovação automática; `evaluateWorkOrder` aceitava zero validadores e verificava apenas presença de política ativa. Correção local feita; não demonstra conformidade do Kernel corporativo.
- **OPA:** a compilação e os testes candidatos agora rodam no **OPA v1.21.4 real em CI**, com assinatura/verificação de bundles usando chaves de teste efêmeras. Ainda **não são autenticados nem aplicados pelo serviço OPA corporativo**. O identificador de decisão passado por callback local pode ser simulado; exigir atestação verificável no servidor.
- **Migração:** DDL **não executado**, portanto não há prova de compilação SQL, transação ou comportamento do trigger no banco.
- **Decisão humana:** tabela `cko_governance.decisions` registra decisão e estado, mas vínculo de identidade e segregação precisa ser comprovado por serviço de identidade e evidências de atuação, não por rótulo.
- **Agentes:** pré-checagem não é autorização. Não existem integrações operacionais autorizadas entre agente, ferramenta e Kernel neste backup.
- **COSO IA:** mapear cada risco/controle aos nós canônicos e às evidências licenciadas; a existência de um framework mapeado não prova eficácia do controle.

## Gates ainda obrigatórios

1. FIND formal → política existente ou proposta de atualização → validador → tarefa e WO.
2. Auditoria do inventário e compatibilidade do DDL com `Calculadoras-Smart` (somente leitura até homologação).
3. Auditoria das funções PostgreSQL, lock/fencing/idempotência e integridade dos resultados de OPA.
4. Teste de migração em banco de desenvolvimento isolado: FKs, triggers, RLS/GRANT, tentativas de bypass, transações e concorrência.
5. Execução real de `opa test` e verificação de bundle: **CI CONCLUÍDO, ambiente corporativo ainda HOLD**; ver `docs/governance/OPA_REAL_ENGINE_AND_SIGNED_BUNDLES_20261026.md`.
6. Maker ≠ Checker ≠ Auditor; revisão de capacidade clínica/legal conforme aplicabilidade.
7. Auditoria independente e promoção autorizada. Não fazer merge para `main` nem deploy de produção antes disso.

**Resultado:** camada estrutural **versionada como candidata** no GitHub. Banco, agentes remotos e produção continuam inalterados.

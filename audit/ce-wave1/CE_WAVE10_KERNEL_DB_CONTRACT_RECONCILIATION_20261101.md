# CE — Wave 10 | Base estrutural: Kernel, evidências e DDL candidato

**Status: CANDIDATE / HOLD_HUMAN / NO_MERGE / NO_DB_WRITE**

## Reutilização de código existente, não reinvenção

Foram lidos e confrontados `src/core/kernel/*` da candidata com
`audit/ce-wave1/staged-source/src/core/kernel/*`, e os ramos
`implementation-governed-ecosystem`, `feat/projection-unica-f0-suite-real` e `grook_10_26`.

- [Commit 4c679983](https://github.com/IndiciumFIN/dev-chatgpt-workspace/commit/4c6799831605508f0ecc54fe14098604df5f3221): **reutilização byte a byte** dos blobs do próprio staging do Git:
  - `src/core/kernel/findings.ts` — SHA blob `129ec18b96bf7979f7b870c76dc026fe8f2c1a5b`: produz somente achado não assinado (`hash=""`, `signature=""`), exige identidade, motivo, ator e data.
  - `src/core/kernel/crypto.server.ts` — SHA blob `921b455410f0d688bbf8487f0737da4cb58951a1`: primitiva Ed25519 com canonicalização, SHA-256 e conferência de expiração; **prova integridade da evidência, não autoriza execução**.
  - `src/core/kernel/crypto.server.test.ts` — SHA blob `4d5855b28e0e50921ef6a5b68be5c6053056fba4`; `findings.test.ts` novo, com testes negativos para campos ausentes e não aceitação de hash/assinatura enviados pelo chamador.
- [Commit e4e70833](https://github.com/IndiciumFIN/dev-chatgpt-workspace/commit/e4e7083306dd3701c2c8ea8b84deb55de4a84758): `src/core/compliance/validators.ts` deixa de interpretar contêiner vazio, string em branco, propriedades herdadas ou números não finitos como evidência presente. `validators.test.ts` cobre casos positivos, negativos e preservação de `HOLD`. **Isto comprova apenas presença, nunca validade, origem ou licença da evidência.**

As rotinas `src/lib/kernel-admit.ts` dos históricos sem ancestral comum foram examinadas **somente como fonte**; versões antigas podem criar admissão por um `approverId` passado pelo chamador ou por um avaliador de política local que devolve `allow: true`. Não se promove esse caminho para a aplicação sem reestruturação de autoridade, políticas, serviços, identidade, prova externa e testes.

## Execução real de CI

No commit `e4e7083306dd3701c2c8ea8b84deb55de4a84758`:
- [Run 41283630868](https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/41283630868): **success**, contendo tipagem, `npm test`, verificações de contratos, auditoria de execução e build.
- [Run 41283630761](https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/41283630761): **success**, checkout Git full history e conferência `27/27` branches de origem, `sourceFailures=0`.
- [Run 41283630797](https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/41283630797): **success**, OPA candidato.
- [Run 41283630733](https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/41283630733): **success**, regressões PMO.

Relatório canônico no runtime:
- 149 conflitos path/blob (57 equivalências semânticas *candidatas*, **92** conflitos não equivalentes);
- 521 paths com duplicação de blob; 10.929 paths pendentes distintos;
- 149/149 mapeamentos candidatos WO, **0 aprovações formais**;
- corpus 8.250/8.250 indexado como candidato, **0 licenças evidenciadas**, 44 problemas estruturais e 590 textos vazios.

Esses valores são do snapshot da execução, não um contador permanente; o HEAD de planejamento avançou repetidamente. As mudanças feitas em arquivos auditados **não significam homologação de qualquer um dos 92 conflitos**.

## Banco: reconciliação somente leitura em 2026-11-01

Projeto Supabase `Calculadoras-Smart`, via `SELECT` nos catálogos `pg_class` / `pg_attribute`, sem DDL, DML, permissões, triggers ou migrações:

**Dez relações-base presentes:**
`cko_evidence.evidence_bundles`;
`cko_governance.agent_registry`, `cko_governance.control_framework_mappings`, `cko_governance.decisions`;
`cko_orch.idempotency_keys`, `cko_orch.outbox_events`, `cko_orch.policy_registry`, `cko_orch.workflow_instances`;
`cko_validation.findings`, `cko_validation.validators`.

As colunas de referência `evidence_bundle_id`, `agent_id`, `decision_id`, `policy_id`, `workflow_id`, `finding_id` e `validator_id` constam do catálogo sob seus respectivos esquemas.

**Oito relações candidatas não presentes:** `cko_orch.work_order_admission_requests`, `work_order_policy_bindings`, `policy_bundle_artifacts`, `work_order_policy_evaluations`, `work_order_required_validators`, `work_order_validator_results`, `kernel_admission_decisions`; `cko_governance.agent_tool_scopes`.

Elas permanecem **exclusivamente propostas** no arquivo original `migrations/candidates/20261026_governance_kernel_opa_agents.sql`. Não executar o arquivo sem reconciliação de FKs, histórico de migrations, segregação maker-checker, RLS/grants, efeitos em funções de trigger e admissões verificadas. RLS false em schemas privados **não** prova exposição pública; privilégios e schema exposto são gates separados.

## Próxima sequência (base antes da interface)

1. Modelo relacional e dicionário do Kernel: reconcile as oito relações candidatas contra dez relações de base, FKs e contratos existentes, sem duplicar o esquema.
2. Contrato e verificador externo Ed25519 + key IDs/revogação; não embutir chaves no cliente nem permitir `ADMIT_CANDIDATE` como autorização de deploy.
3. Resolver os conflitos `P0` de segurança, modelos, admission e PMO por hashes e dependências; os caminhos de `src/lib/kernel-admit.ts` de históricos sem ancestral não devem ser copiados sem revisão.
4. Revisão independente e autorização criptoverificável; só depois mudanças de banco e promoção ao `main`.

**Este relatório não é registro de autorização nem substitui o manifesto canônico e os registros WO/FIND.**

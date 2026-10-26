# Doutrina da governança — o que o kernel executa

Esta é a doutrina da outra linhagem (`origin/preview/central-comando-20261026`),
**portada** — não reescrita. Os 25 documentos vêm com a proveniência no commit
de origem e a conferência de hash no acervo transversal.

O original está preservado em `README-ORIGEM.md` (o índice da linhagem de
origem, que descreve a estrutura dela). Este arquivo é o índice **deste**
repositório: o que vale aqui, o que é referência, e o que ainda não existe.

## Por que a doutrina é o contrato do kernel

O kernel (`src/core/governance/kernel.ts`) é *fail-closed*: nenhuma requisição
passa sem ordem de trabalho, política ativa, manifesto, evidência e aprovação
independente. Cada uma dessas exigências tem um documento aqui que a explica —
a doutrina é a razão escrita de o código recusar.

| Documento | O que estabelece | Onde o kernel executa |
|---|---|---|
| `01-metamodelo.md` | as entidades, o que é projection e o que é fonte de verdade | `src/lib/db.ts`, `migrations/0036_indice_do_banco.sql` |
| `02-domain-model.md` | o domínio do site (conteúdo, ferramenta, biblioteca, editorial) | `src/lib/banco/indice.ts` (96 tabelas, 96 rótulos) |
| `03-policy-model.md` | o que é uma política, a versão, a vinculação e o escopo | `src/core/governance/source-contract.ts` |
| `04-work-order-model.md` | a ordem de trabalho, quem pede e quem confere | `work_order` (tabela do banco) |
| `05-manifest-and-evidence.md` | o manifesto, o sha256, a evidência e o recibo | `src/core/registry/source-registry.ts` |
| `06-kernel-governance.md` | a decisão do kernel: `admit`, `hold`, `reject` | `src/core/governance/kernel.ts` + a OPA |
| `07-preview-deploy.md` | a prévia e a publicação controlada | `scripts/auditar-fonte.mjs`, o painel de status |
| `08-risk-controls.md` | os controles de risco e a classificação | `ai_control`, `governance_item` (43 itens) |
| `09-audit-and-monitoring.md` | a auditoria e o monitoramento contínuo | `scripts/audit-source.mjs` (20/20) |
| `TRANSVERSAL-ACQUISITION-RUNBOOK.md` | como um documento público é adquirido, com hash | `audit-evidence/transversal-acquisition/` (79/79 blobs) |
| `TRANSVERSAL-STANDARDS-BASELINE-v0.1.0.md` | a linha de base das normas | o acervo preservado com SHA-256 |
| `ADMIN_BATCH_IMPORT_20261026.md` | a importação em lote, com reconciliação | `migrations/candidates/20261026_governed_admin_bulk_import.sql` (a portar) |
| `OPA_REAL_ENGINE_AND_SIGNED_BUNDLES_20261026.md` | a OPA como motor real, com pacote assinado | `contracts/cko-governance/opa/kernel_admission.rego` (portado) |
| `OPA_SIGNED_RUNTIME_PG_LEAST_PRIVILEGE_20261026.md` | o runtime com privilégio mínimo | pendente de portar |
| `HANDOFF_FOUNDATION_20261026.md` | a entrega da fundação | `docs/entregas/` |
| `IMPORT_RECONCILIATION_HANDOFF_20261026.md` | a reconciliação da importação | `migrations/candidates/20261026_governed_import_reconciliation.sql` (a portar) |
| `IMPORT_READ_ONLY_OPA_BACKEND_20261026.md` | o backend de leitura com OPA | `src/core/governance/import-opa-read.server.ts` (a portar) |
| `FOUNDATION_CONTINUITY_MANIFEST_20261026.json` | o manifesto de continuidade | `src/core/governance/platform-artifact.ts` (a portar) |
| `FOUNDATION_COSO_OPA_KERNEL_AGENTS_20261026.md` | COSO, OPA, kernel e agentes | `src/core/governance/agent-authorization.ts` (a portar) |
| `CKO_SPECIALIST_ORCHESTRATION_20261026.md` | a orquestração de especialistas | a roster de agentes do Mavis |
| `audits/SO-009-*.md` | a auditoria de rastreabilidade, namespace e origem dos campos | `src/lib/banco/indice.ts` (o dicionário é a origem) |

## O que é doutrina e o que é código

A doutrina **explica**; o código **executa**; o portão **prova**. Nenhum dos três
substitui o outro:

- a doutrina sem código é um documento;
- o código sem doutrina é um script sem razão;
- os dois sem portão são uma afirmação.

Neste repositório, cada afirmação da doutrina que o código executa tem um
portão correspondente (`scripts/auditar-fonte.mjs`, `scripts/audit-source.mjs`,
`scripts/preencher-derby.mjs`, `scripts/audit-indice-banco.mjs`) e a
verificação final (#9) confere os quatro juntos.

## O que ainda não existe aqui

- a `work_order_admission_requests` e as tabelas `cko_orch.*` da linhagem de
  origem (a minha `work_order` é mais simples);
- o runtime OPA assinado (tenho a política nega-por-padrão, não o pacote
  assinado);
- a importação em lote com reconciliação (o código e a migration candidata
  estão na linhagem de origem e são o próximo port).

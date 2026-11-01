# CE — Evidências auditáveis das Waves 5, 6 e 7

**Estado: `AUDIT_ONLY / HOLD_HUMAN / KERNEL_ADMISSION_NOT_VERIFIED`.**

Os três pacotes ZIP são preservados **byte a byte** em `archives/` e verificados pelos SHA-256 e Git blob SHA em [`MANIFEST.v1.json`](./MANIFEST.v1.json). Arquivos pequenos estão descompactados em `extracted/` para revisão e `git diff`. A evidência bruta `ce-wave6/evidence/runtime-report.json` (3,56 MB) permanece dentro do ZIP da Wave 6; sua proveniência primária é o [GitHub Actions run 41252304361](https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/41252304361).

## Pacotes

| Wave | Pacote ZIP | SHA-256 | Evidência |
|---|---|---|---|
| 5 | `CE-WAVE5-reconciliacao-readonly.zip` | `02294c0d0962c445ab6649d373648b5c2426dcc7369475b037dcb0b5eb117dfb` | Gerador read-only e snapshots fixados; **HEADs antigos** |
| 6 | `CE-WAVE6-evidencias-reconciliacao.zip` | `74e2d8c1e27b2bf51985ce7478fe7f5b3da63903b05ee0623abe69044bb0bb98` | Artefatos do GitHub Actions 31/10 e análise de delta |
| 7 | `CE-WAVE7-fulltree-auditoria.zip` | `83ebf2b73d938c727ba1be2eefbd032a53df5cf8010dce9b72e36f322f6db456` | Árvores Git completas por SHA; **colisões globais não consolidadas** |

## Integração canônica

- Source of truth existente: `registers/governance/main-migration-scope.v1.json`.
- Auditor existente: `scripts/audit-main-migration.mjs`.
- Registro PMO existente: `registers/pmo/queue.v1.json`.
- A branch de planejamento evoluiu durante Waves 6–7. Nenhum manifesto com HEAD pinado deve ser aplicado sem atualizar a fotografia e verificar a população completa.
- **Não executar** `--apply`, `--commit`, migrations, promoção à main ou deploy com base nestes arquivos.
- Todas as alterações deste commit são **exclusivamente evidência auditável**, sem tocar aplicações, scripts ativos, regras de CI, tabelas ou gates.
- Próximas ações: recálculo global de colisões, revisão por camada de contratos e admissão independente do Kernel.

A issue [#25](https://github.com/IndiciumFIN/dev-chatgpt-workspace/issues/25) reúne o rastreamento FIND/política/WO, sem transferir a autoridade para este diretório.

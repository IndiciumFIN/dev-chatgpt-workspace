# Research Hub / CKO — Handoff de encerramento da atividade de conciliação
**Data:** 2026-10-26 · **Status da atividade:** ENCERRADA_COM_PENDENCIAS_TRANSFERIDAS · **Não significa entrega do Hub em produção.**
**Repositório:** IndiciumFIN/dev-chatgpt-workspace · **Branch:** feat/research-hub-governed-20261026

## Resumo verificável
- Código funcional **candidato** está versionado na [PR #19](https://github.com/IndiciumFIN/dev-chatgpt-workspace/pull/19), originado em `feat/research-participation-layer-20261026`; HEAD auditado `53f896fd6afcce66fc6d059b377024971e7a2c3f`.
- Correção do validador PMO e CLI de atividades candidatas estão na [PR #13](https://github.com/IndiciumFIN/dev-chatgpt-workspace/pull/13). **Extrair seletivamente** somente o reparo governado, sem importar demais fluxos por conveniência.
- Solicitação formal à autoridade de WO: [Issue #23](https://github.com/IndiciumFIN/dev-chatgpt-workspace/issues/23) — **OPEN / HOLD**. O Issue **não é admissão** do Kernel.
- Os testes específicos do Hub passaram no [run 40411365855](https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/40411365855) sobre o HEAD da PR #19; o pipeline global **falhou** no [run 40411413972](https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/40411413972), na asserção obsoleta do estado do PMO.
- Estado do projeto: **7/30 capacidades com alguma implementação específica candidata parcial, 7/30 apenas com base reutilizável, 16/30 sem implementação específica evidenciada, 0/30 homologadas**. Percentuais de cobertura de evidências, **não** progresso de esforço.
- Seis experiências participativas adicionais já têm elementos candidatos e **não entram** no denominador de 30 capacidades.
- `WO-RES-PART-001`: `HOLD_HUMAN` e `kernel_admission=NOT_SUBMITTED`. Nenhum Kernel corporativo aprovou execução, publicação ou coleta de participantes.
- Não houve merge da PR #19 para `main`, deploy desta integração nem migração em Supabase por esta atividade.

## Entregáveis versionados neste handoff
- [PENDENCIAS.md](PENDENCIAS.md): FINDs, riscos, owners a definir e critérios de fechamento.
- [CAPACIDADES-30.csv](CAPACIDADES-30.csv): matriz com denominador fixo, prioridade, status e âncora para reutilização.
- [ARQUIVOS-LOCAIS.json](ARQUIVOS-LOCAIS.json): índice SHA-256 dos 10 ZIPs incrementais anteriores, agora preservados byte-a-byte dentro do arquivo agregado de 19 pacotes no Git.
- [EVIDENCIAS-E-SHAs.json](EVIDENCIAS-E-SHAs.json): readback de origem e estado dos gates.
- [RETOMADA.md](RETOMADA.md): ordem de execução em futuro ciclo governado.

## O que está encerrado
**Somente** o trabalho de auditoria, reconciliação, documentação e entrega de handoff desta rodada. Os FINDs foram **transferidos e permanecem abertos**; nenhum código candidato passa a ter status canônico por efeito deste commit.

## Cuidados de integridade
Não criar segundo Hub nem novos schemas equivalentes sem crosswalk MD/REG; não alterar `main`; não modificar fila PMO manualmente; não converter `NOT_SUBMITTED` em `ADMITTED`; não confundir hashes SHA-256 de arquivo com assinatura ou aprovação humana. O próprio workspace é backup isolado e não Kernel corporativo autoritativo.

## Arquivamento binário confirmado (2026-10-26)

Todos os 19 ZIPs históricos foram armazenados no Git como entradas de [archives/CKO_RESEARCH_HUB_TODOS_OS_PACOTES_20261026.zip](archives/CKO_RESEARCH_HUB_TODOS_OS_PACOTES_20261026.zip), arquivo real de 263.473 bytes. Git blob `d53fab58f43ed9937fd246e2ccc6fd077658d6d3`, equivalente ao `git hash-object` do arquivo original; SHA-256 `57645b110ba4bbdb5b4e550b7042145d11a7750f20008601e09b1c1c8ea2b962`. O FIND `ARTIFACT-001` fica encerrado **somente para arquivamento dos bytes**. Isso não implica admissão, merge, deploy ou correção de código.

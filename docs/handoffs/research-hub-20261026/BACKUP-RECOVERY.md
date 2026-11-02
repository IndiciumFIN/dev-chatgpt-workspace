# Snapshot completo da frente de Pesquisa — 2026-10-26

Branch de arquivo/recovery. Contém todos os objetos Git do candidato Research + Participation da PR #19, os 7 documentos de encerramento da conciliação e cópias INERTES de artefatos PMO da PR #13. Não publicar, não fazer merge, não usar como prova de admissibilidade.

**Origem da aplicação de pesquisa:** `feat/research-participation-layer-20261026` @ `53f896fd6afcce66fc6d059b377024971e7a2c3f` (PR #19).

**Origem do handoff:** `feat/research-hub-governed-20261026` @ `01574c5bfbe366a6ede9c0aee6bf2e3a907d92a1` (7 arquivos preservados por Git SHA).

**Origem de reparo de gate PMO e package.json:** `fix/governed-activities-cli-20261026` (PR #13; cópias apenas em `docs/handoffs/research-hub-20261026/backup-from-pr13`, sem alterar código ativo).

**Pacotes ZIP locais v0.1.0–v0.1.9:** indexados em `ARQUIVOS-LOCAIS.json` com SHA-256; inventário não garante presença binária. Em particular os patches v0.1.5–v0.1.9 permanecem candidatos não implantados até a inclusão e verificação dos respectivos bytes.

**Regra:** `WO-RES-PART-001 = HOLD_HUMAN`, `kernel_admission = NOT_SUBMITTED`. Handoff documental concluído; funcionalidades, CI global, LGPD, segurança e homologação pendentes. Ver [Issue #23](https://github.com/IndiciumFIN/dev-chatgpt-workspace/issues/23). Nunca concluir aprovação da existência deste backup.

## Backup binário agora arquivado no Git

Arquivo integral: [archives/CKO_RESEARCH_HUB_TODOS_OS_PACOTES_20261026.zip](archives/CKO_RESEARCH_HUB_TODOS_OS_PACOTES_20261026.zip). SHA-256: `57645b110ba4bbdb5b4e550b7042145d11a7750f20008601e09b1c1c8ea2b962`. Tamanho: 263.473 bytes. Git blob: `d53fab58f43ed9937fd246e2ccc6fd077658d6d3`. Ele **contém todos os 19 ZIPs históricos** como entradas na pasta `pacotes/`, preservando seus bytes; [PACOTES-RECUPERACAO.json](PACOTES-RECUPERACAO.json) lista os hashes de cada um. **Os 19 ZIPs estão no arquivo agregado, não como 19 arquivos Git independentes.**

O arquivo de backup é inerte, não executa pipelines e não representa admissão de Work Order, autorização de merge, ativação de coleta nem homologação.

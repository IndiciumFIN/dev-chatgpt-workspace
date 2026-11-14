# CE — Handoff mestre de continuidade e preservação (18/10/2026)

## Instrução obrigatória para próxima conversa
Retomar **sem reexecutar** as verificações já comprovadas. Fonte da verdade: GitHub `IndiciumFIN/calculadorasdeenfermagem`. Não solicitar nem acessar Google Drive. Supabase Calculadoras-Smart (`pgsybzggewhinaniybiy`) apenas confronto READ_ONLY até autorização. Não alterar main, excluir ou deduplicar destrutivamente. Toda mutação: FIND formal → política aplicável ou governada → validador → tarefa → WO → admissão comprovada pelo Kernel → execução isolada → testes → auditoria → promoção autorizada; commits com readback.

## Evidência executada nesta conversa (GitHub, leitura direta)
- Branch `migration/full-directory-20261017` commit `bad54d1d9b6d281a0a2bb8077895e2ad45571b68`: 19.119 arquivos, 2.580 diretórios, árvore Git completa (truncated=false).
- 18.958 arquivos em `migration/`; 5 snapshots: `cursor-drive-sa-key-refactor` 9.366; `cursor-fix-governance-gaps-ec54` 9.363; `staging-wo-kernel-normativos-cli-20261016` 79; `cursor-wf-gdrive-sakey` 78; `cursor-wf-v3` 69.
- Dois maiores snapshots comparados por caminho relativo e Git blob SHA: **9.356 idênticos**, **7 divergentes**, **3 exclusivos do primeiro**, **0 exclusivos do segundo**; união de 9.366 caminhos. Os 7 divergentes e 3 exclusivos constam em `CE_SNAPSHOT_RECON_20261018.zip`. Não homologar automaticamente.
- Outros snapshots confrontados com o maior: `staging-wo-kernel-normativos-cli-20261016`: 46 iguais, 21 divergentes, 12 exclusivos; `cursor-wf-gdrive-sakey`: 46 iguais, 21 divergentes, 11 exclusivos; `cursor-wf-v3`: 46 iguais, 21 divergentes, 2 exclusivos. **Apenas comparações diretas ao snapshot primário**: os exclusivos entre snapshots menores ainda precisam ser deduplicados entre si.
- Branch `audit/ce04-reconciliation-tasks-20261017` commit `2a1250d2d5c8c159be2ede462306822c0cb70943`: 238 arquivos, 40 diretórios, árvore completa.
- Branch `integration/canonical-main-20261017` commit `c704c3cf9241cde7697acb860e598bd01bd58cf5`: 134 arquivos, 28 diretórios, árvore completa.
- Handoff remoto `docs/handoffs/CE_CONTINUATION_STATE_20261017.json` recuperado da branch audit: 65 arquivos CE04, 38 tarefas, 22 conflitos, 303 outbox pendentes, 61 proveniências não verificadas; **valores históricos, não nova auditoria em tempo real**.
- Documento `docs/governance/CE04_WO_ADMISSION_BLOCKER_20261017.candidate.json`: política `CE-GOV-WO-ADMISSION-001` ausente, validador não disponível, WO `WO-CE04-RECON-20261017` ainda `DRAFT_NOT_ADMITTED`; sem autorização de mutação.

## Histórico a reutilizar, não confundir com homologação
- Rodadas R33–R72 com ZIPs normativos locais; diretórios R06–R72 com lacunas. Resultado anterior declarado 1.020/1.020 rastreabilidade estrutural, **não aprovação de conteúdo ou publicação**.
- CE04 65/65 SHA256 historicamente documentados e 6 arquivos fracionados; 22 conflitos não resolvidos; evitar reexecutar checks que já têm hash e proveniência válidos.
- O pacote `CE_PRESERVATION_REGISTER_20261018.zip` indexa 293 artefatos de seleção anterior. Este handoff inclui **cópias integrais** de artefatos locais selecionados com SHA256 por arquivo em `LOCAL_ARTIFACTS_SHA256.csv`.

## Próximos microlotes determinísticos
1. Ler este handoff e `STATE.json`; comparar hashes de artefatos locais; consultar estado GitHub HEAD antes de reutilizar.
2. Reconciliar **os três snapshots menores entre si**, preservando os 7+ divergentes; produzir matriz `REQUIRED × PRESENT × VALIDATED × PASS` e HOLD_HUMAN.
3. Inventariar as **demais branches** por árvores Git completas e classificar por SHA, caminho e conteúdo; diferenciar arquivos por branch, caminhos distintos e blobs únicos.
4. Reaproveitar matrizes R33–R72, CE04 65 e tarefas 38; vincular evidências ao registro-mestre, sem duplicação de trabalho.
5. Formalizar FIND de lacunas, política, validador, tarefas, WO e obter recibo real de admissão Kernel antes de qualquer gravação remota.
6. Após autorização, commits em branch isolada, testes, auditoria independente, readback e handoff por microlote; main protegida.

## Status e limites
Esta sessão realizou leitura e comparação de metadados GitHub; não baixou todos os 19.119 arquivos, não realizou auditoria semântica, não revalidou Supabase e não gravou no GitHub. O backup local não substitui a fonte GitHub nem comprova aprovação. Preservar integralmente o ZIP de continuidade e seus hashes.
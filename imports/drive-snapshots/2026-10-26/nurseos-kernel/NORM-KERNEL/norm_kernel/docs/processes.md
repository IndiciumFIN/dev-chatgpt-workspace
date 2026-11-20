# NORM-KERNEL — Processos (documentação de todos os processos) v1.0.0

Norma: POL-NK-008 C1 — processo novo nasce AQUI + OS de governança própria +
rastreio até produção. Toda entrada/saída/aresta declarada; máquinas de
estado vivem no ANEXO (v1.4.0, dados), nunca neste documento.

## P-01 — Criação de registro governado
- **Entrada:** OS create (requester, payload_draft SEM id — o kernel gera, POL-NK-006 C1).
- **Saída:** registro born-status per anexo + ServiceOrder assinada (generated_id).
- **Arestas:** chamado por jobs de extração (P-04) e processos de governança; produz registros consumidos pelo front-end.
- **OS kind:** create · **Gates:** intake, meta-audit, deploy gate (cobertura por OS).

## P-02 — Transição de status
- **Entrada:** OS transition (target_id, new_status) · **Saída:** status alterado conforme `lifecycles` do anexo.
- **Arestas:** materialização (P-07) usa transições; valid exige confidence ≥ 0.85 (R8).
- **OS kind:** transition · **Gates:** máquina do anexo (G12 valida a codificação).

## P-03 — Emenda constitucional (mudança de metamodelo)
- **Entrada:** OS amendment com documento NK-EMENDA-NNNN (matriz de impactos completa: entities/fields/gates/validators/render/migration/repin/rollback; checksum sha256; url pública).
- **Saída:** emenda validada pelo kernel → aprovação HUMANA (Leivis) → aplicação: novo anexo + re-pin (POL-NK-001) + cascade de redeploy das funções com novo pin.
- **Arestas:** muda o anexo → todas as funções re-pinnam → G4-pin verifica → evidência nova.
- **OS kind:** amendment · **Gates:** kernel (matriz completa) + humano. Nada aplicado sem dupla aprovação (INV-006/007/012).

## P-04 — Job de extração (normativo real)
- **Entrada:** item de backlog (NK-BL-NNNN) · **Saída:** run + documento + átomos + evidência + front-end regenerado.
- **Arestas:** playbook de fontes (regras de ouro, fichas por fonte, tentativas); tracking ponta a ponta BL↔JOB↔OS↔run↔doc↔átomos↔evidência.
- **OS kinds:** create (doc/run) · **Gates:** G1-G12 + deploy gate.

## P-05 — Investigação de finding
- **Entrada:** bloqueio de gate/OS de auditoria · **Saída:** finding 5W fechado com dupla aprovação.
- **Arestas:** nasce automático de bloqueios (POL-NK-006 C3); alimenta prevenção (novas cláusulas/gates).
- **OS kind:** registro em findings.json (imutável, C4) · **Gates:** G10.

## P-06 — Run de pipeline governado
- **Entrada:** `pipeline.py --os NK-OS-NNNN [--run NK-RUN-NNNN]` · **Saída:** 13 gates + evidência assinada + re-registro automático das camadas + entrada no ledger de tasks.
- **Arestas:** sem --os e com drift → BLOCKED + finding automático; com --os → kernel atualiza register/manifest/ledger atomicamente (POL-NK-006 C4).
- **Gates:** G1-G12 + pin · **Ledger:** kernel_tasks.json (referência cruzada, POL-NK-008 C3).

## P-07 — Materialização, versionamento e restauração (POL-NK-004)
- **Entrada:** OS de transição do kernel · **Saída:** artefato na camada destino; versão anterior → versionamento; errada → quarantena; restauração = id novo com conteúdo anterior.
- **Gates:** G8 (deploy só de produção, OS de validação, cadeias version_of íntegras).

## P-08 — Meta-processo: criação de processo novo (POL-NK-008 C1)
- **Entrada:** necessidade de processo inexistente · **Saída:** documentação neste arquivo + OS de governança nova referenciando o processo + registro no artifact_register + rastreio até produção.
- **Passos:** (1) documentar entrada/saída/arestas/OS/gates; (2) OS de governança nova; (3) registro com checksum+norma; (4) se muda comportamento → emenda (P-03) para codificar no anexo; (5) rastrear até produção.
- **Gates:** G9 (registro) + G12 (codificação) + G11 (se nasce de backlog).

## Ledger de tasks (registers/kernel_tasks.json)
Toda task do kernel: os_id, run_id, evidence_id, artifacts[], ts — referência
cruzada register↔artefato. Validação: G12 (bloqueante).

# CKO PMO de Conteúdo — v0.1.0 (candidato)

PMO de **59 atividades rastreáveis**, em caminho isolado, com gates, dependências, responsáveis por função, evidências de aceite, RACI, riscos, decisões, indicadores e estratégia de execução. Nenhuma aprovação clínica foi concedida nesta branch.

**Não substituir** o PMO Google Sheets ou `registers/pmo/queue.v1.json` antes de reconciliação de schema/IDs. Não alterar `main` automaticamente. Todas as atividades ficam sujeitas ao workflow de governança existente (FIND→policy→validator→TASK→WO→Kernel→tests→promotion).

Referências: `cko/canonical-content/2026-11-14` na branch editorial; PR #36 como fonte de contratos a revisar; baseline M03 mantida fora do repositório público.

Files: `PMO_WBS.csv`, `PMO_COMPLETO.md`, `GATES.md`, `RACI_AGENTES.md`, `RISKS.csv`, `DECISION_LOG.csv`, `KPIS.md`, `BRANCH_AUDIT.md`.


## Atualização de 14/11/2026
O lote M05 foi **inserido e conferido** nas abas já existentes do PMO Mestre no Google Sheets; detalhes no arquivo `REGISTRY_LOCATION_AND_WRITE_RECEIPT.md` e no recibo JSON. A reconciliação com o Supabase continua pendente, e os 3 claims ECG continuam CANDIDATE. Não houve merge na `main`.


A consulta read-only ao Supabase identificou ausência de correspondências exatas para os 29 IDs M05 consultados; a frente B59 permanece IN_PROGRESS, sem migrar dados. Recibo atualizado: 55 linhas novas no PMO Mestre.


## Plano integrado ponta a ponta — proposta PP00–PP13 (14/11/2026)
- [`PLANO_INTEGRADO_PONTA_A_PONTA_20261114.md`](./PLANO_INTEGRADO_PONTA_A_PONTA_20261114.md): sequência de escopo, corpus, provas, conhecimento, conteúdos, runtime, QA, publicação e monitoramento.
- [`GATE_CROSSWALK_TRIPLO_20261114.md`](./GATE_CROSSWALK_TRIPLO_20261114.md): mapear **DRIVE_EXEC:G0–G9**, **R04:G0–G12** e **GIT_CKO:G0–G10** sem confundir nomes iguais.
- [`WBS_EXTENSOES_PONTA_A_PONTA_CANDIDATAS.csv`](./WBS_EXTENSOES_PONTA_A_PONTA_CANDIDATAS.csv): 16 pacotes complementares **propostos, não admitidos**; não adicionar ao denominador de 59 tarefas.
- PMO Mestre Google Sheets: **PMO-013** criado na linha 14, em `DRAFT_FOR_GOVERNED_REVIEW`, com link ao plano; PMO-012 e demais registros preservados.
- PMO-011 já descreve piloto separado de Corpus Acquisition Engine `SOT-10-09-2026`: projeto e funções existem; isolamento por nova organização não está comprovado; requer ADR e auditoria, sem reuso automático.

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


## Trilha de carreira — atualização do nome e execução
A frente antes denominada Currículos agora se chama **Trilha de carreira**. Objetos de UC, módulo, ementa e carga horária são preservados como dados-fonte; ver `TRILHA_CARREIRA_CONTRATO_E_MIGRACAO.md`. A primeira trilha candidata de Cardiologia está no PR #66 e passou no [Actions run #43568372281](https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/43568372281). A ADR de ambiente `ADR_CKO_002_CORPUS_INFRA_ISOLATION_PROPOSED.md` e a fila `b59/B59_ALIAS_ADMISSION_QUEUE.csv` seguem em HOLD.


## Checkpoint M06 — expansão de Trilha de carreira e P0 direitos IA
`CHECKPOINT_TRILHA_B59_SOT_20261114.md` contém relatório e links para os dois workflows independentes PASS (candidate-only). O PMO mestre recebeu 6 linhas novas e as próximas ações; a área de Trabalho e Urgência ganhou 39 grupos-fonte sem progressão profissional inventada. Proteção TDM externo ainda não implementada.


## M06 — direitos para envio externo a IA (somente candidato)
O PR #68 contém validador puro, 27 casos negativos, versão candidata `deepseek-atomize.v6.candidate.ts` e SQL em `SCHEMA_PROPOSAL_DO_NOT_APPLY.sql` — **sem implantação**. Actions [#43571430279](https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/43571430279) PASS. O PMO mestre recebeu HOLD/CHANGE_IMPACT, e `b59/B59_SOURCE_RIGHTS_TDM_BOUNDARY.md` esclarece por que `ALLOWED_FOR_OFFICIAL_TEXT` não equivale a autorização para DeepSeek.


## M07 — Restrições em PostgreSQL descartável
[Checkpoint M07](./M07_CHECKPOINT_SYNTHETIC_DB_AND_HOLDS.md): CI #43572600708 PASS para Node + Postgres 16 sintético; replay/idempotência ainda bloqueia release. R19, D018, FIND e PXC-017 propostos e documentados; 59 atividades atuais preservadas.


## M08 — Conteúdo canônico e atômico: primeiro lote executado
[M08 checkpoint](./M08_CANONICAL_ATOMIC_CONTENT_CHECKPOINT.md). Agora temos **34 claims/34 knowledge atom candidates, 33 evidence spans, 3 content masters, 8 questões e 10 flashcards**, derivados de fontes oficiais comprovadas. [Arquivo completo Drive](https://drive.google.com/file/d/1cuXkb1bCg4lwtFtHL9B9aiANY1ioIhEk/view?usp=drivesdk), índices de 28.001 átomos e 9.102 vínculos. **76 registros de dados gravados e conferidos no PMO_MASTER original**; M08 CI [#43575253083](https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/43575253083) PASS estrutural. Aprovações clínicas e direitos = ZERO.


## Sincronização integral M08/M09 para Git privado
[Recibo de integração](./GIT_CONTENT_SYNC_20261114.md). O conteúdo completo (34 arquivos internos nos dois ZIPs, incluindo índices de 28.001 átomos/9.102 links) e o snapshot dos **104 registros M08/M09** foram gravados na [PR CE privada #39](https://github.com/IndiciumFIN/calculadorasdeenfermagem/pull/39). CI [#43579697365](https://github.com/IndiciumFIN/calculadorasdeenfermagem/actions/runs/43579697365) PASS. `main` e Supabase não modificados; revisão clínica/direitos ainda HOLD.

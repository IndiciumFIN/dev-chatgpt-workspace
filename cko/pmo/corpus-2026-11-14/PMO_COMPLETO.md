# PMO canônico de Conteúdo — proposta operacional

**Data de corte:** 2026-11-14; **branch:** `cko/pmo-corpus-canonical-20261114`; **natureza:** PMO de reconciliação, não substitui a planilha-mestre no Drive.

## Linha-base observada
- Recuperação M03: 6 ZIPs CRC íntegros, 2 SQLite `integrity_check=ok`, 213/213 hashes de conteúdo v1.7.7 e 205/205 v1.7.6.
- 1.055 tópicos (170 U/E e 885 Enfermagem do Trabalho), 118 fontes, 326 autoridades, 124 documentos, 28.001 átomos textuais, 80.261 referências de índice e 9.102 mapeamentos candidatos (contagens históricas).
- Cardiologia: 10 UCs x 30h, UC08 conflito textual de oito eixos com UC07 e nome coincidente com UC09. Centro Cirúrgico/CME: ementas específicas não recuperadas.
- GitHub acessível: repositório público `IndiciumFIN/dev-chatgpt-workspace` com branches de CKO. Outro repositório CE não autorizado na conexão corrente. PR #36 em draft com 13.550 arquivos alterados; não integrar em massa.
- PMO Mestre existente (Google Sheets): `CORPUS & KNOWLEDGE PMO — Calculadoras de Enfermagem`, com PMO_MASTER, SOURCE_REGISTER, DOCUMENT_REGISTER, EVIDENCE_ATOMS, CLAIM_LEDGER, RIGHTS_REGISTER, HOLD_HUMAN, CHANGE_IMPACT, R00-R07 e outras abas. Não sobrescrever.

## Governação obrigatória
`FIND → política aplicável → validador → TASK → WO → Kernel → testes/auditoria → promoção`. Coleta curricular **não é evidência clínica**. Falha em direito, vigência, proveniência, aprovação clínica ou segurança resulta em `HOLD_HUMAN` para a operação dependente; o trabalho não dependente pode continuar. Use IDs, versões, hashes e event log; nunca eliminar arquivos só pela semelhança nominal.

## Portfólio de entregáveis
1. **Corpus**: mapeamento de fonte/documento/evidence/claim/knowledge, modelo de versões e rights op-specific.
2. **Editorial**: especialidades associadas many-to-many, conteúdo único contextualizado, contrato de projeção já existente, PDFs e mídias derivados.
3. **PMO**: WBS de 56 atividades, matriz de gates, RACI, RAID, changelog, branch audit, métricas e plano de release.
4. **Qualidade**: CSV/JSON schema, FKs, provenance hash, clinical signoff, license clearance, segurança e WCAG/SEO.
5. **CI/DevOps**: PRs candidatos, checks e rollback; sem modificações na `main` ou banco de produção.

## Status do backlog (não confundir com % de conclusão)
- DONE_SCOPE: 3
- DONE_TECHNICAL: 3
- DONE_EDITORIAL: 1
- IN_PROGRESS: 1
- TODO: 41
- DONE_STRUCTURAL: 1
- HOLD_HUMAN: 3
- WAITING_SOURCE: 1
- DRAFT_EDITORIAL: 2

Os itens DONE_TECHNICAL sinalizam testes de integridade estritamente técnicos, não liberação científica. `DRAFT_EDITORIAL` não implica publicação. Os indicadores de progresso devem separar volume, cobertura e aprovação, não somar porcentagens heterogêneas.

## Sequência
- **Onda 0 (execução em curso)**: branch audit, snapshots, M03/README, controles.
- **Onda 1 (P0)**: direitos + fontes oficiais + UC08 H/Human + crosswalk ID.
- **Onda 2 (P0)**: claim lineage, seleção dos 2 pilotos, direitos por operação.
- **Onda 3 (P1)**: produção evidence-led, educação e reuso de contratos editoriais existentes.
- **Onda 4 (P1/P2)**: CI, auditoria 360, PRs/merge seletivo e handoff.

Duração e datas de fim **não estimadas**: dependem de autorização, volume de documentos e da revisão clínica. O PMO mantém dependências explícitas em vez de prometer prazos sem capacidade confirmada.


## Emenda — Cadastro fonte/rights/claim no PMO mestre (14/11/2026)
O PMO Google Sheets recebeu 53 registros de lote M05/registry catalog, preservando linhas anteriores. Ver `REGISTRY_LOCATION_AND_WRITE_RECEIPT.md`. A condição `MASTER_ATIVO` refere-se ao cadastro lógico, não a uma homologação científica nem ao espelhamento do Supabase.


**Emenda M05-ID (14/11/2026):** PMO contém agora 59 atividades; 55 linhas adicionadas nas abas do PMO Mestre e catalogação de registries. Supabase investigado apenas por SELECT: 0/29 IDs M05 com correspondência textual exata, hipótese de namespaces diferentes; ver `REGISTRY_LOCATION_AND_WRITE_RECEIPT.md`, B59 e o conflito `CONFLICT-M05-SUPABASE-ID-CROSSWALK`. Sem importação, merge ou publicação.


## Atualização de nomenclatura — Trilha de carreira (14/11/2026)
A frente de produto é **Trilha de carreira**; UCs, ementas, carga horária e os identificadores `CURRICULUM/UC/MODULE` permanecem como documentação-fonte e contratos existentes. B20 recebeu atualização de evidência retificada (51 módulos, 295 tópicos detalhados, UC08 oito eixos não desdobrados), preservando D012/D013 e o histórico de extração anterior. Ver `TRILHA_CARREIRA_CONTRATO_E_MIGRACAO.md`.


## Checkpoint da Trilha de carreira e ambiente
A nomenclatura funcional mudou para **Trilha de carreira** (D012) com preservação dos IDs originais, e a versão retificada Cardiologia corrigiu B20 para 51 módulos/295 tópicos. O piloto de corpus SOT tem ADR-CKO-002 proposto e HOLD de isolamento/Edge Functions. Cinco aliases do B59 estão pendentes; testes estruturais da Trilha passaram no Actions #43568372281. Ver plano integral e recibos no PMO Mestre.


## M06 — Trilha de carreira, snapshots e direitos de IA externa
Veja `CHECKPOINT_TRILHA_B59_SOT_20261114.md`, auditoria SOT estática, B59 comparações SHA, novo FIND PR #68 e gate documental CI. B18/B24 avançam somente em metadados; direitos e homologações não avançam automaticamente.


## M07 — Hardening de preflight TDM sem mutação de produção
Testes PostgreSQL 16 descartáveis passaram em Actions #43572600708, FKs compostas e grant único; mock mostrou lacuna de reenvio persistente. Registrados R19, D018 e pacote candidato PXC-017. Nenhuma alteração no SOT ou adoção de DDL. Ver M07_CHECKPOINT_SYNTHETIC_DB_AND_HOLDS.md.

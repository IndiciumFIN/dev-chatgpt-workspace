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

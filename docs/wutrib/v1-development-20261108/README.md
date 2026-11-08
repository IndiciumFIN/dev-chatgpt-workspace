---
document_id: WUTRIB-V1-DEV-INDEX-001
version: 0.1.0
status: DRAFT_TECHNICAL_INCREMENT
work_order: WUTRIB-WO-DEV-020
approved_by: NONE
---

# WU-TRIB V1 — desenvolvimento guiado pelo PMO

Este diretório registra a primeira implementação de um **subconjunto técnico e sintético** do WU-TRIB e a sua ligação com a baseline V1.0.0-rc.0, as normas aplicáveis e a WO-DEV-020.

## Entregas desta onda

| Documento/artefato | Finalidade |
|---|---|
| [INCREMENTO_001.md](INCREMENTO_001.md) | Limites do motor, provas técnicas, evidências e avaliação normativa |
| [MATRIZ_RTM_INCREMENTO_001.json](MATRIZ_RTM_INCREMENTO_001.json) | Sete controles rastreando PMO/GAP → regra/contrato → código → teste → fonte |
| [Núcleo V1](../../../src/v1/vertical-core.mjs) | Reconciliador sintético EFD × NF-e normalizada × Protheus |
| [Contrato de entrada](../../../contracts/v1-synthetic-vertical.input.schema.json) | Esquema sintético versionado, sem homologação XSD ou NF-e |
| [25+ testes atualizados](../../../tests/v1-vertical.test.mjs) | 27 testes funcionais/negativos, 111 regressões incluídos esses 27 |
| [PMO e WO020](../../../PMO/WUTRIB/wo/WUTRIB-WO-DEV-020.json) | Nove tarefas DEV dentro do quadro de 72 atividades |
| [Workflow de CI](../../../.github/workflows/wutrib-v1-vertical-slice.yml) | Tests, artefato JSON de exemplo e atualização controlada do PMO |

## Verificação do incremento

[CI de referência: 42525445947](https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/42525445947), com **27/27 testes V1, 111/111 regressões (incluem os 27 novos) e 20/20 testes do PMO**. A fonte original, o parser web existente e a aplicação Vercel em produção permanecem inalterados.

O resultado do exemplo é **uma correspondência técnica e três ocorrências de investigação**, extraídos de três NF-e normalizadas, três C100 e quatro linhas fictícias de ERP. É um caso ilustrativo e **não** taxa de detecção, disponibilidade, carga máxima ou qualidade fiscal mensurada.

## Próximas ondas e alçadas

**V1-002 (proposta):** integração de parser XML seguro e XSD oficiais versionados, com cadeia de origem e fixture NF-e sintética. Exige aprovação de edição, normas e oráculos.  
**V1-003 (proposta):** console funcional do operador, dashboard, filtros, abertura de caso, exportação e acessibilidade WCAG 2.2 com UAT.  
**V1-004 (proposta):** fontes Protheus por release, lineage F2D/F2B real somente sob autorização, contratos de segurança e IAM nominal.  
**V1-005 (proposta):** meta-testes dos validadores, cargas/volumetria, segurança, SCI, DR/rollback, revisão fiscal e Go/No-Go.

Essas ondas não são entregas feitas nem cronogramas aprovados. O PMO requer requisitos, fonte e WO admissível para cada novo incremento. As **26 lacunas originais continuam abertas, 30 testes de homologação NOT_RUN e sete gates HOLD_HUMAN**.

**Decisão atual:** desenvolvimento técnico em branch isolada, pronto para revisão; **NO MERGE, NO LIVE DATA, NO SUPABASE MIGRATION, NO VERCEL DEPLOY, NO PRODUCTION GO**.

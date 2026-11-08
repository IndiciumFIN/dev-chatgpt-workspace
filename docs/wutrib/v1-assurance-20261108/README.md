---
document_id: WUTRIB-V1-ASSURANCE-INDEX-001
version: 0.1.0
status: DRAFT_NOT_APPROVED
baseline: 1.0.0-rc.0
approved_by: NONE
---

# Revisão independente de desenho V1 — normas, concorrentes e excelência operacional

**Revisão de 08/11/2026.** Este pacote é um adendo à [baseline de escopo V1](../v1-baseline-20261108/README.md) e à [PR #48](https://github.com/IndiciumFIN/dev-chatgpt-workspace/pull/48). **Não atualiza o escopo da V1 automaticamente, nem cria código, migration, teste executado ou deploy.**

## Artefatos desta revisão

| ID | Arquivo | Cobertura |
|---|---|---|
| WUTRIB-V1-ASSURANCE-NORM-001 | [Normativos e aplicabilidade](PARECER_NORMATIVO_APLICABILIDADE_V1.md) | Comparativo de 19 referências técnicas/metodológicas e contratos críticos EFD, NF-e e Protheus |
| WUTRIB-V1-ASSURANCE-MARKET-001 | [Benchmark das plataformas](BENCHMARK_PLATAFORMAS_E_REFERENCIAS_V1.md) | Capacidade anunciada de 12 referências de produto/ecossistema e gap WU-TRIB |
| WUTRIB-V1-ASSURANCE-FISCAL-001 | [Contratos fiscais mínimos](CONTRATOS_MINIMOS_EFD_NFE_PROTHEUS_V1.md) | EFD C100/C190/C170 condicional, IDTRIB e tabelas FISA170 e três roteiros ponta a ponta |
| WUTRIB-V1-ASSURANCE-QUAL-001 | [Nove qualidades, uso, capacidade e SCI](QUALIDADE_USO_CAPACIDADE_SUSTENTABILIDADE_V1.md) | Mapeamento ISO 25010:2023, ISO 25019, ISO 25040, WCAG e ISO 21031 |
| WUTRIB-V1-ASSURANCE-GAPS-001 | [Registro JSON de 26 lacunas](MATRIZ_LACUNAS_E_CORRECOES_V1.json) | 16 P0, 10 P1; 17 candidatas a bloquear o freeze formal, todas em revisão |
| WUTRIB-V1-ASSURANCE-DECISION-001 | [Decisão e gates](PLANO_DECISAO_E_GATES_V1.md) | Gate A: escopo; Gate B: desenvolvimento; Gate C: homologação/produção |
| WUTRIB-V1-ASSURANCE-MANIFEST-001 | [Manifesto documental](MANIFESTO_ASSURANCE_V1.json) | Versionamento, proveniência, comparações e limitações |

## Conclusão provisória

A V1 está **bem orientada arquiteturalmente**, porém:
- falta explicitar o subset EFD ICMS/IPI e as exceções por emissão, inclusive a ausência legítima de C170 em diversos cenários de NF-e própria;
- falta detalhar a linhagem FISA170/TES por tributo, IDTRIB, tabela/versão e estabelecimento;
- faltam procedimentos verticais e oráculos independentes, para que os módulos gerem um resultado auditável e não apenas um dashboard;
- faltam critérios de mensuração para todas as nove características de qualidade de produto ISO 25010:2023, além de capacidade, UAT, a11y, SCI, recuperação e segurança;
- artefatos e testes anteriores são principalmente planejamento (NOT_RUN), não certificação.

**Recomendação:** corrigir contratos e critérios antes do sign-off de escopo, sem acrescentar automaticamente novos módulos à V1. A apresentação comercial até validação substantiva deve restringir-se a **auditoria técnica e conciliação fiscal assistidas**.

**Status:** DESENHO DOCUMENTADO, COM LACUNAS CRÍTICAS. Escopo V1.0.0-rc.0 continua em Draft e produção NO-GO.

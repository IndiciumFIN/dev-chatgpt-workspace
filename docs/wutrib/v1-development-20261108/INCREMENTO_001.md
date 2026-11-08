---
document_id: WUTRIB-V1-DEV-INC-001
version: 0.2.0
status: DEVELOPMENT_CANDIDATE_NOT_HOMOLOGATED
parent_scope: 1.0.0-rc.0
work_order: WUTRIB-WO-DEV-020
approved_by: NONE
approved_at: NONE
---

# Incremento V1-001 — conciliação sintética NF-e × EFD × Protheus

## Objetivo e fronteira

Desenvolver uma parte funcional dos procedimentos PROC-V1-01/02/03 sobre **NF-e previamente normalizadas, dados sintéticos e um subconjunto de registros EFD**. O código novo é separado do motor demonstrativo existente. NÃO certifica arquivos fiscais, não valida XML/XSD ou assinaturas, não transmite NF-e, não calcula tributos oficiais, não consulta o ERP, não executa homologação nem autoriza produção.

## Artefatos de código e contrato

- src/v1/vertical-core.mjs — motor offline Node.js 22, sem banco ou serviços externos.
- contracts/v1-synthetic-vertical.input.schema.json — contrato formal JSON Schema 2020-12; ainda não executado com validador JSON Schema independente, sem alegação de conformidade completa ao esquema.
- tests/fixtures/v1-synthetic-case.mjs — fontes fictícias e chaves artificiais com DV sintaticamente válido (não autorização SEFAZ).
- tests/v1-vertical.test.mjs — 27 cenários positivos, negativos, precisão, cardinalidade, contexto EFD e origem de tributo.
- scripts/demo-v1-crosscheck.mjs — comando reexecutável que imprime JSON e não grava em banco.
- .github/workflows/wutrib-v1-vertical-slice.yml — CI read-only, testa núcleo, PMO e regressões, publica artefato sintético.

## Rastreabilidade ao PMO

| Gap | Requisito implementado parcialmente | Evidência em teste | Falta para homologação |
|---|---|---|---|
| GAP-001 / 003 | C100/C190, C170 não universal, COD_VER, emissão própria e COD_SIT | Testes de ausência de C170, casos fora de contexto, COD_VER errado | Guia completo, variações UF/perfil, PVA e regras por edição |
| GAP-002 / 026 | IDTRIB conservador em SD1/SD2/SFT e referências sintéticas F2D/F2B | Campo errado rejeitado; sem IDTRIB permanece UNKNOWN | Snapshot autorizado, tabela física, vínculo F2D→F2B e revisão fiscal |
| GAP-004 | Three-way match controlado, sem produto cartesiano por N:M | 1 correspondência e 3 ocorrências; duplicatas bloqueiam | Importação XML raw, UI, testes empresariais |
| GAP-005 / 017 | Códigos como strings, valores decimais BigInt e cardinalidade | 0.01+0.02 = 0.03, sem arredondamento binário | Data quality por campo e relatório de completude da obrigação |
| GAP-006 / 011 | Não gerar conformidade tributária ou aprovação automática | FiscalConformity NOT_EVALUATED e workpaper não aprovado | Corpus legal e oráculos para cada regra |
| GAP-007 / 012 | Testes estruturados e assertivas independentes do core | CI com testes e regressão, sem testar auditores fiscais | Mutation formal e qualificação independente dos validadores |
| GAP-016 / 022 | SHA256 dos bytes EFD e registros normalizados, replay determinístico | Mesmo input→mesmo digest; mudanças→digest novo | WORM, assinatura eletrônica, política de retenção e revisor humano |
| GAP-008/013/014/015 | Qualidade, segurança, UX, capacidade, sustentabilidade | Limites básicos do contrato sintético | UAT, WCAG manual, p95/p99, stress, RTO/RPO, SCI |

## Referências técnicas e limites de evidência

- SPED oficial, Guia EFD ICMS/IPI v3.2.4 publicado 10/09/2026: https://www.gov.br/sped/pt-br/assuntos/comunicados/efd-icms-ipi/nova-versao-do-guia-pratico-da-efd-icms-ipi-2 — referência para controlar registro, perfil, COD_VER e exceções, sem equivalência automática a PVA.
- TOTVS origem TES/FISA170: https://centraldeatendimento.totvs.com/hc/pt-br/articles/35357410638231-CROSS-Segmentos-TOTVS-Backoffice-Linha-Protheus-FIS-FISA170-Como-confirmar-se-os-impostos-est%C3%A3o-sendo-gerados-pelo-Configurador-de-Tributos-ou-TES — IDTRIB em D1_IDTRIB, D2_IDTRIB, FT_IDTRIB.
- TOTVS trilha F2D/F2B: https://centraldeatendimento.totvs.com/hc/pt-br/articles/37535417591319-Cross-Segmento-Backoffice-Linha-Protheus-SIGAEST-Como-identificar-impostos-do-Configurador-de-Tributos-nas-Notas-Fiscais — referências não significam cálculo de tributo homologado.
- ISO/IEC/IEEE 29119-3:2021: https://www.iso.org/standard/79429.html — documentação de testes, sem reivindicar conformidade ao texto integral licenciado.
- ISO/IEC 25010:2023: https://www.iso.org/standard/78176.html — nove características de qualidade; apenas parte coberta pelo teste atual.
- OWASP ASVS 5.0: https://asvs.owasp.org/ — referência para entradas, autorização e segurança. Não houve DAST nem IAM real.

## Resultado CI verificado

Execução: https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/42525445947.
- 27 de 27 casos novos V1 passaram.
- 111 de 111 testes de regressão de aplicação passaram, INCLUINDO os 27 novos (não somar como diferentes).
- 20 de 20 testes do agente PMO passaram.
- Dataset sintético: 3 NF-e normalizadas, 3 C100, 4 snapshots ERP → 1 match técnico, 3 findings.
- Workpaper ficou aberto, sem aceites, e a conformidade fiscal ficou NOT_EVALUATED.
- O resultado inclui hash SHA-256 da entrada, publicado como artefato de CI.

## Pendências e tratamento

A execução usou dados normalizados, não XML original/XSD/assinatura; o parser EFD cobre apenas C100 e contagem de C170/C190, sem certificar outros registros ou o encerramento do arquivo. A origem FISA170/TES continua candidata, pois fontes e snapshots são fictícios.

Limites de 1 MiB EFD e 1000 registros NF-e/ERP são restrições de segurança do protótipo, **não** capacidade máxima medida. Testes de carga, UX, acessibilidade, sustentabilidade, segurança autenticada, recuperação e aceites fiscais continuam pendentes.

**PMO operacional:** 72 registros (26 GAPs, 30 testes de homologação ainda NOT_RUN, 7 gates HOLD_HUMAN e 9 tarefas DEV). O agente atualizou DEV-002/003/004 para IN_PROGRESS e DEV-005/006 para READY_FOR_REVIEW com evidências calculadas, sem sign-off.

**FIND de processo:** o registro WO-DEV-020 foi formalizado após os primeiros commits desta sessão. Isso requer revisão de sequenciamento pelo PMO; não atribuir retroativamente admissão do Kernel ou sign-off. Nenhum merge nem deploy foi realizado.

**Parecer:** incremento funcional e testes sintéticos verificados; homologação fiscal e produção NO-GO.

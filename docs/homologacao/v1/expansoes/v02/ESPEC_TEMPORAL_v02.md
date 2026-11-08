---
document_id: WUTRIB-DOC-EXP-V02-TEMPORAL
version: 0.2.0
status: DRAFT
wo: WUTRIB-WO-PLAN-018
owner_role: FISCAL_AND_DATA_ARCHITECT
reviewer_role: TAX_SPECIALIST_AND_INTERNAL_AUDIT
approver_role: PRODUCT_OWNER
approved_by: NONE
approved_at: NONE
classification: INTERNAL
---

# EXP-012/015 — Inteligência temporal tributária e mudanças de parâmetros

## Problema e escopo
Comparar alterações entre competências de ICMS, PIS, COFINS, IPI e, quando oficialmente aplicável, IBS/CBS, sem confundir variação de valor com mudança de lei. Dados de snapshots ERP, regras fiscais, master data, leiautes e documentos deverão ser separados por competência, UF, regime, fonte, versão e release.

## Modelo temporal obrigatório (candidato)
- `validFrom / validTo`: quando o dado, regra ou parâmetro era aplicável à operação (tempo de negócio).
- `recordedAt / supersededAt`: quando o sistema capturou/conheceu aquela informação (tempo de registro).
- `documentEventAt`: emissão, cancelamento, correção ou retificação, vinculada ao documento e sua sequência.
- `fiscalPeriod`: competência/apuração e timezone/contexto.
- `sourceRelease`: SPED COD_VER, XML NT/XSD e Protheus release; novos releases não substituem silenciosamente o contexto histórico.

**Bitemporalidade**: consultas `AS_VALID_AT` (visão histórica aplicável) e `AS_KNOWN_AT` (o que se sabia na data da auditoria). Não usar hora de captura como data de vigência normativa.

## Taxonomia de mudanças
`DELTA_OBSERVED`: diferença mensurável entre períodos e populações conhecidas.
`DELTA_SOURCE`: edição/fonte normativa mudou, com URL original, vigência e escopo confirmados.
`DELTA_CONFIG`: TES/SF4, FISA170, regra de base/alíquota, release/parametrização ERP alterados entre snapshots autorizados.
`DELTA_BUSINESS`: volume, mix, preço, destino, categoria, cliente, regime ou natureza de operação mudou.
`DELTA_DATAQUALITY`: cobertura, qualidade, duplicidade ou ausência de registros e cadastros mudou.
`DELTA_UNEXPLAINED`: origem não demonstrável, contexto conflitante ou efeito residual sem evidência suficiente.

Os rótulos são **categorias de explicação candidata**; `DELTA_SOURCE` não equivale automaticamente a imposto incorreto.

## Estatísticas e decomposição
Para população comparável do mesmo tributo e base: `aliquota_efetiva = soma(valor_tributo) / soma(base_calculo)`. A média aritmética simples das alíquotas por linha pode distorcer a comparação. Denominador zero, unidades incompatíveis e base líquida negativa sem contexto devem produzir `UNDEFINED` e exclusões registradas.

`delta_taxa = taxa_B - taxa_A`, com unidade `pontos percentuais`, além de variação relativa `(taxa_B/taxa_A)-1` somente quando denominador válido. Para impactos monetários, decompor base/quantidade, preço, mix, classificação, regra, configuração, regime, efeitos de retificação e resíduo; `sum(componentes) + residual == delta_total` segundo tolerância previamente aprovada. Distinção entre **análise econômica** e **regra jurídica** é obrigatória.

## Trilha de investigação planejada
Selecionar empresa/filial, tributo e períodos; verificar completude das origens e cadastros; alinhar unidades e regras de vigência; calcular comparabilidade; mostrar métricas e contribuições; examinar parâmetros e fontes; abrir achado `TEMPORAL_CHANGE_CANDIDATE` com evidências e hipóteses; somente fiscal responsável confirma a causa e a conclusão jurídica.

O sistema não aplicará uma norma “mais recente” retroativamente. Período de transição da Reforma Tributária do Consumo será tratado por fontes oficiais de cada competência e cenário; testes de 2026 não são alíquotas universais.

## UI e visualizações previstas
Painel lado a lado com períodos, total de documentos, base, tributo, alíquota efetiva, população comparável e exclusões; gráfico de ponte das diferenças com tabela equivalente acessível; linha do tempo de norma e de parâmetros ERP, destaque de dados ainda não disponíveis e ação de investigação sem aprovação automática.

## Casos futuros (todos NOT_RUN)
`TMP02-01` mesma regra/mix e volumes diferentes; `TMP02-02` mudança de TES sem alteração de norma; `TMP02-03` regra futura não aplicável ao documento antigo; `TMP02-04` retificação após captura; `TMP02-05` mix provoca taxa média diferente; `TMP02-06` alteração de regime; `TMP02-07` base zero/negativa; `TMP02-08` incompletude de fonte; `TMP02-09` soma da decomposição não fecha; `TMP02-10` obrigação/edição SPED incompatível; `TMP02-11` snapshots de empresas diferentes; `TMP02-12` transição IBS/CBS com fonte e vigência comprovadas.

## Fontes orientadoras verificadas
- Receita Federal [Guia EFD ICMS/IPI 3.2.4, publicado em 10/09/2026](https://www.gov.br/sped/pt-br/assuntos/comunicados/efd-icms-ipi/nova-versao-do-guia-pratico-da-efd-icms-ipi-2). É preciso examinar o guia original e sua aplicabilidade antes de codificar regras.
- TOTVS [FISA170 — procedimentos e perfis do Configurador](https://centraldeatendimento.totvs.com/hc/pt-br/articles/360055360933-Cross-Segmento-TOTVS-Backoffice-Linha-Protheus-FIS-FISA170-Procedimentos-de-configura%C3%A7%C3%A3o-e-utiliza%C3%A7%C3%A3o-da-rotina-Configurador-de-Tributos?sort_by=created_at).
- TOTVS [exemplo de TES híbrida com IBS/CBS no FISA170](https://centraldeatendimento.totvs.com/hc/pt-br/articles/36312155068823-CROSS-Segmentos-TOTVS-Backoffice-Linha-Protheus-FIS-Como-configurar-o-cClasstrib-410-para-opera%C3%A7%C3%B5es-Isentas-no-fisa170-forma-Hibrida). Exemplo de fornecedor não define regra tributária universal.
- TOTVS [releases do Configurador de Tributos](https://centraldeatendimento.totvs.com/hc/pt-br/articles/35436184155927-CROSS-Segmentos-TOTVS-Backoffice-Linha-Protheus-FIS-FISA170-Os-recursos-do-Configurador-de-Tributos-est%C3%A3o-dispon%C3%ADveis-em-quais-vers%C3%B5es-do-Protheus).

**Estado:** DRAFT / NO EXECUTION / NO LEGAL OR TAX OPINION.

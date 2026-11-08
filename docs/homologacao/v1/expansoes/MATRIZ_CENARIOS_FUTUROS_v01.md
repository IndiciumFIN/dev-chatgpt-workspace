---
document_id: WUTRIB-DOC-EXP-003
version: 0.1.0
status: DRAFT
wo: WUTRIB-WO-PLAN-018
owner_role: QUALITY_ASSURANCE
reviewer_role: TAX_AND_DATA_SPECIALISTS
approver_role: PRODUCT_OWNER
approved_by: NONE
approved_at: NONE
classification: INTERNAL
---

# Matriz de cenários futuros para módulos de análise e mudança temporal

**Não executado:** esta matriz contém casos e oráculos de aceitação propostos para uso **posterior**. Nenhum PASS abaixo é resultado de teste; o texto PASS_EM_TESTE_FUTURO nomeia uma expectativa, não um status atual. Todas as linhas estão NOT_RUN e pendentes de contrato, fixture, owner e revisão.

## Cenários a projetar por módulo

| Caso | Área | Cenário | Oráculo desejado | Tipo de resultado esperado |
|---|---|---|---|---|
| EXT-01 | Extrator | Arquivo íntegro com esquema conhecido | Manifesto com contagem, tamanho, hash real, origem, vigência e versão; fonte original intacta | PASS_EM_TESTE_FUTURO |
| EXT-02 | Extrator | Arquivo truncado ou esquema desconhecido | Quarentena e BLOCKED, sem emitir ‘0 registros’ como volume completo | BLOCKED |
| EXT-03 | Extrator | Mesmo snapshot recebido duas vezes | Idempotência e identificação de duplicata, sem duplicar população | PASS_EM_TESTE_FUTURO |
| EXT-04 | Extrator | Snapshot ERP de outra filial ou sem permissão | Deny; não contaminar staging nem evidência de outra empresa | FAIL_DE_ACESSO/BLOCKED |
| JOIN-01 | Join | 1:1 por chave composta | Contagem e totais reconciliados; linhas rastreáveis a duas fontes | PASS_EM_TESTE_FUTURO |
| JOIN-02 | Join | 1:N legítimo | Cardinalidade anunciada; agregação após join apenas por regra explícita | PASS_EM_TESTE_FUTURO |
| JOIN-03 | Join | N:M de itens com chave incompleta | Bloqueio de somatório e alerta de multiplicação sem regra de alocação | BLOCKED |
| JOIN-04 | Join | LEFT ANTI / RIGHT ANTI com itens órfãos | Unmatched de cada lado separado; nenhuma omissão silenciada | PASS_EM_TESTE_FUTURO |
| JOIN-05 | Join | Valores nulos, zeros, chave como texto com zeros à esquerda | Null não equivale a zero, chave preserva zeros e tipagem, sem correspondência fabricada | PASS_EM_TESTE_FUTURO |
| JOIN-06 | Join | Fuzzy match de participante | Somente candidato à verificação, sem join fiscal definitivo ou cadastro sobrescrito | REVIEW_REQUIRED |
| SEL-01 | Seleção | Filtro composto e limite de data inclusivo/exclusivo | Expressão, população e exclusões reproduzíveis; TZ explícito | PASS_EM_TESTE_FUTURO |
| SEL-02 | Amostragem | Mesmo seed e população válida | Mesma amostra e probabilidade documentada; auditor consegue reproduzir | PASS_EM_TESTE_FUTURO |
| SEL-03 | Amostragem | Seleção por itens de alto valor/risco | Identificada como dirigida; sistema não projeta estatisticamente para população | PASS_EM_TESTE_FUTURO |
| SEL-04 | Amostragem | População faltante ou unidade sem probabilidade definida | BLOCKED para inferência; registrar insuficiência da base | BLOCKED |
| ERR-01 | Erros | Schema inválido vs campo de cadastro faltante | Categorias distintas, severidade proposta e causas registradas | PASS_EM_TESTE_FUTURO |
| ERR-02 | Erros | Regra fiscal sem edição aplicável | BLOCKED/HOLD, não ‘irregularidade comprovada’ | BLOCKED |
| ERR-03 | Erros | Mesmo documento com múltiplas ocorrências | Agrupamento por documento sem diminuir quantidade de eventos/evidências | PASS_EM_TESTE_FUTURO |
| ERR-04 | Erros | Falha do executor ou timeout | ERROR separado de FAIL; nenhum artefato de conclusão fiscal gerado | ERROR |
| ANOM-01 | Anomalias | Valor extremo, mas operação legítima | Anomalia explicada, não erro comprovado; fechamento somente humano | REVIEW_REQUIRED |
| ANOM-02 | Anomalias | Sazonalidade conhecida e grupo de comparação não homogêneo | Evitar score incorreto; declarar impossibilidade de inferir sem base comparável | BLOCKED/REVIEW_REQUIRED |
| ANOM-03 | Anomalias | Drift de população e muitos novos produtos | Alertar mudança de distribuição; revisão de baseline e critérios | REVIEW_REQUIRED |
| TEMP-01 | Períodos | Alíquota efetiva varia apenas por mix/preço/volume | Classificar DELTA_BUSINESS e não imputar automaticamente mudança de norma | PASS_EM_TESTE_FUTURO |
| TEMP-02 | Períodos | Parâmetro SX6/SF4/FISA170 muda, sem norma alterada | DELTA_CONFIG com snapshot, release e autor; não rotular DELTA_SOURCE | PASS_EM_TESTE_FUTURO |
| TEMP-03 | Períodos | Fonte normativa nova com vigência futura | Mostrar mudança planejada, não aplicar retroativamente a documento anterior | PASS_EM_TESTE_FUTURO |
| TEMP-04 | Períodos | Alíquota muda sem fonte oficial verificável | DELTA_OBSERVED/DELTA_UNEXPLAINED; conformidade NOT_EVALUATED | REVIEW_REQUIRED |
| TEMP-05 | Períodos | Regime de tributação do contribuinte mudou | Separar mudança de base/regime do efeito de regra; manter comparabilidade e rastreio | PASS_EM_TESTE_FUTURO |
| TEMP-06 | Períodos | Retificação e documento cancelado após competência | Preservar histórico bitemporal: data do fato, vigência da regra, data de captura/correção | PASS_EM_TESTE_FUTURO |
| TEMP-07 | Períodos | Transição IBS/CBS, obrigações e parametrização em 2026/2027 | Usar cronograma oficial atualizado por período, natureza e evento; não aplicar valores de teste indiscriminadamente | REVIEW_REQUIRED |
| REC-01 | Reconciliação | XML × EFD × ERP × Contabilidade | Quatro lados independentes, total por lado, cobertura, data de corte, divergências e exceções | PASS_EM_TESTE_FUTURO |
| REC-02 | Reconciliação | Estorno, devolução, antecipação e sinal invertido | Natureza econômica e sinais explicados; sem ‘zerar’ por compensações indevidas | PASS_EM_TESTE_FUTURO |
| GOV-01 | Governança | Revisão fiscal e resolução de achado | Findings com fiscalConformity NOT_EVALUATED, assinatura humana e trilha de mudanças | REVIEW_REQUIRED |
| UX-01 | Acessibilidade | Caminho inteiro do Studio por teclado/leitor de tela | WCAG 2.2 AA aplicável; foco, estado, filtro, exportação e visualização de evidências sem barreiras | MANUAL_TEST_REQUIRED |
| CAP-01 | Capacidade | Grandes arquivos e join com cardinalidade excessiva | Orçamento/custo estimado, plano por chunk, proteção de RAM e encerramento seguro | PERFORMANCE_TEST_REQUIRED |

## Variação tributária: decomposição numérica e explicação

**Métrica candidata** para um conjunto homogêneo do mesmo tributo/natureza: `taxa_efetiva = SUM(valor_tributo)/SUM(base_calculo)`. Não tomar a média simples das alíquotas linha a linha, pois produtos com bases muito diferentes distorcem a comparação. Se base zero, desconhecida ou incompatível, reportar a exclusão e cobertura; evitar divisão por zero. Não somar tributos com natureza ou base jurídica incomparável.

**Delta bruto observado**: `taxa_efetiva_periodo_B - taxa_efetiva_periodo_A`. O delta é só estatística. Para propor causa deve-se separar, com método aprovado: efeito-volume, efeito-preço/mix, efeito-base, efeito-regime, efeito-classificação, efeito-parâmetro ERP, efeito de fonte legal vigente e efeito residual não explicado. O conjunto de contribuições precisa reconciliar com o delta do indicador escolhido, ou apresentar erro residual explícito.

**Tabelas históricas conceituais candidatas** (sem DDL, sem criar banco agora):
- `source_snapshot`: arquivo/tabela/release/hash/empresa/filial/competência/instante de captura;
- `masterdata_validity`: cadastro/código/atributos + intervalo de validade e fonte;
- `tax_rule_effectivity`: regra/UF/regime/operação/edição normativa + intervalo legal aplicável;
- `erp_config_history`: snapshot SF4/SX6/FISA170 + vigência declarada, autor e release;
- `period_comparison_run`: dois períodos, cobertura, população, parâmetros, resultado por dimensão e versão;
- `change_evidence`: coluna/fato que variou, tipo de delta, origem, hipótese de causa, revisor;
- `review_decision`: identificação, alçada, justificativa, sign-off ou HOLD.

A bitemporalidade é importante: distinguir quando uma alteração **era válida para uma operação** de quando a plataforma **tomou conhecimento dela**. Isso evita que novos documentos reescrevam silenciosamente a interpretação de um relatório anterior.

### Exemplos fictícios de interpretação

- Duas competências com tributação efetiva diferente e itens novos: **variação observada/possível efeito-mix**, não mudança legislativa.
- Mesma mercadoria e CFOP, mas TES alterada sem registro de publicação legal: **mudança de configuração ERP candidata**, condicionada a snapshot e validação do regime/UF.
- Alteração publicada oficialmente mas ainda não vigente na data do documento: **mudança normativa futura**, sem recálculo retroativo automático.
- Documento cancelado e reemitido após o fechamento: **evento de documento com duas linhas temporais**, não necessariamente omissão fiscal.
- Movimento sujeito ao período de transição da reforma tributária: a lei e as obrigações devem ser consultadas na edição aplicável por competência, tipo de operação e regime; o WU-TRIB não pode utilizar simplesmente as alíquotas de teste de 2026 como regra universal.

## Fontes para definição dos futuros oráculos

- SPED: guia prático EFD ICMS/IPI 3.2.4, publicado em 10/09/2026: https://www.gov.br/sped/pt-br/assuntos/comunicados/efd-icms-ipi/nova-versao-do-guia-pratico-da-efd-icms-ipi-2
- Receita Federal: PVA EFD ICMS/IPI versão 6.2.0, publicado em 04/11/2026: https://www.gov.br/sped/pt-br/assuntos/comunicados/efd-icms-ipi/publicacao-do-programa-efd-icms-ipi-versao-6-2.0
- Receita Federal: marcos legais da Reforma Tributária do Consumo: https://www.gov.br/receitafederal/pt-br/acesso-a-informacao/acoes-e-programas/programas-e-atividades/reforma-tributaria-do-consumo/legislacao/principais-marcos-regulatorios
- TOTVS: exemplo de FISA170 modo híbrido (TES e Configurador para tributos distintos): https://centraldeatendimento.totvs.com/hc/pt-br/articles/36312155068823-CROSS-Segmentos-TOTVS-Backoffice-Linha-Protheus-FIS-Como-configurar-o-cClasstrib-410-para-opera%C3%A7%C3%B5es-Isentas-no-fisa170-forma-Hibrida
- TOTVS: inconsistência entre campo físico e dicionário SX3/SX2 por filial: https://centraldeatendimento.totvs.com/hc/pt-br/articles/29988705874583-Cross-Segmentos-Backoffice-Protheus-SIGAFAT-Help-O-campo-do-arquivo-n%C3%A3o-existe-no-dicion%C3%A1rio-na-atualiza%C3%A7%C3%A3o-de-dicion%C3%A1rio
- CFC NBC TA 530: https://cfc.org.br/tecnica/normas-brasileiras-de-contabilidade/nbc-ta-de-auditoria-independente/
- ISACA COBIT 2019 objetivos: https://www.isaca.org/resources/news-and-trends/industry-news/2019/defining-target-capability-levels-in-cobit-2019-a-proposal-for-refinement

**Não se trata de transcrição do texto das normas.** As referências oficiais devem ser obtidas por processo de ingestão licenciada/autorizada quando a regra for realmente implementada. Cálculos, interpretações e thresholds terão de ser aprovados por profissionais competentes antes de utilização empresarial.

## Critérios mínimos para admitir futuros testes

Cada cenário deve receber: ID de requisito, controle RCM, owner, contrato de entrada/saída, dataset fictício com hash, expected/observed, teste negativo, contexto legal e temporal, ambiente, limite de recursos, revisores e registro de exceções. O plano de meta-validadores v0.3.0 deve testar falsos positivos, falsos negativos, mutation testing, falhas e replay.

**Estado:** todos os 33 cenários são NOT_RUN. Não há alegação de homologação nem aprovação fiscal.

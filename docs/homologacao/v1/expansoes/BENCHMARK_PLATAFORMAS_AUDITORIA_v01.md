---
document_id: WUTRIB-DOC-EXP-001
version: 0.1.0
status: DRAFT
wo: WUTRIB-WO-PLAN-018
owner_role: PRODUCT_STRATEGY
reviewer_role: FISCAL_AUDIT_AND_DATA_ARCHITECTURE
approver_role: PRODUCT_OWNER
approved_by: NONE
approved_at: NONE
classification: INTERNAL
---

# Benchmark funcional — soluções fiscais e ferramentas de auditoria de dados

**Data da observação:** 2026-11-08. **Natureza:** expansão proposta do WU-TRIB; nenhuma funcionalidade nova implementada, testada ou homologada. As afirmações sobre concorrentes descrevem funcionalidades que **seus fornecedores anunciam**; não foram verificadas em instalação independente e não demonstram preços, cobertura integral ou superioridade.

## 1. Referência compartilhada pelo usuário

As duas capturas mostram a central visual de *Kolossus Auditor* e uma tela de *Auditoria e Cruzamentos*, com estrutura de domínio, seleção de módulos e painéis gráficos. Títulos visíveis: Auditoria e Cruzamentos, Gráficos, Monitoramento Tributário Automático, Consulta de Regra Tributária, Regra Tributária em Lote, Editor de Arquivos SPED, Auditoria de XML, Gestor de Riscos, Simples, Recuperador de Tributos e Controle de Estoque.

**Uso autorizado:** referência de funcionalidades para levantamento. **Não** replicar o layout, marca, elementos gráficos, vídeo, telas, nomenclatura protegida ou estrutura de navegação em código. Todo eventual design deve seguir o design system próprio do WU-TRIB e avaliação de acessibilidade.

## 2. Soluções de mercado — evidências e limite da observação

| Solução | Capacidades divulgadas em fonte oficial | Lição possível para WU-TRIB | Limite |
|---|---|---|---|
| Kolossus Auditor (Thomson Reuters / Domínio / ASIS) | Integração com Escrita Fiscal para XMLs; auditoria/cross-check de NF-e e obrigações; SPED Editor; consulta tributária; estoque; recuperação de tributos; monitoramento | Biblioteca de procedimentos fiscais com origens e protocolo, módulos acopláveis | Não reproduzir regras proprietárias nem presumir cobertura por UF/release |
| e-Auditoria | Cinco etapas de auditoria de arquivos: estrutura, cruzamentos, riscos, oportunidades e laudo assistido por IA; validações de classificação, valores, períodos e registros | Separar validação estrutural, análise cruzada, risco, hipótese e relatório | Texto de marketing; a regra fiscal deve ser validada por fonte oficial própria |
| Caseware IDEA | Join/append; análise de outliers/duplicatas/gaps; amostragem aleatória, sistemática, estratificada; histórico reexecutável; importação de sistemas/planilhas | Studio generalista de operações de dados com linhagem, sem depender de auditoria fiscal específica | Modelo e limitações reais do fornecedor não foram testados |
| Diligent ACL Analytics | Importação somente leitura, análise integral/amostral, duplicidades, gaps, stratify, extract, join, rotinas automatizáveis e resultados exportáveis | Preservação de fonte original e construção de pipelines auditáveis | Não copiar comandos proprietários ou supor equivalência |
| MindBridge | Análise de risco com IA sobre grandes populações, padrões/anomalias e priorização de transações | Anomalia como **alerta explicável** e evidência para investigação | Algoritmos internos, taxa de detecção e performance não foram testados |
| Microsoft Power Query | Inner, left/right/full outer, left/right anti, chaves múltiplas e fuzzy match com condições | Tipos de join explicitados e prévia de cardinalidade e cobertura | Função de transformação; não valida tributo |
| Alteryx | Ferramentas de limpeza, filtro, fórmula, amostragem e preparação de dados | Paleta de operações reutilizáveis e sequenciamento de transformações | Exemplos de ferramenta analítica, não benchmark de homologação |

### Evidências públicas consultadas
- Kolossus, visão e integração: https://suporte.dominioatendimento.com/central/faces/solucao.html?codigo=4425
- Kolossus, funcionalidades: https://suporte.dominioatendimento.com/central/faces/solucao.html?codigo=9805
- Kolossus, sequência para cruzamentos: https://suporte.dominioatendimento.com/central/faces/solucao.html?codigo=5513
- e-Auditoria, etapas de auditoria: https://www.e-auditoria.com.br/solucoes/para-auditar-arquivos/
- e-Auditoria, cruzamentos: https://www.e-auditoria.com.br/solucoes/para-auditar-arquivos/cruzamento-de-informacoes/
- Caseware IDEA: https://www.caseware.com/us/products/idea/
- IDEA, treinamento funcional: https://prd-webflow.caseware.com/training/ci101-introduction-to-idea-data-analysis
- Diligent ACL Analytics: https://help.diligentoneplatform.com/helpdocs/analytics-19/en-us/Content/analytics/getting_started/what_is_acl_analytics.htm
- MindBridge: https://www.mindbridge.ai/technology/
- Power Query join: https://learn.microsoft.com/en-us/power-query/merge-queries-overview
- Alteryx preparação: https://help.alteryx.com/live-query/en/google-bigquery-tools/workflow-data-preparation-tools.html

**Nota de evidência:** todas as referências são públicas, não downloads de programas instalados ou acesso às bibliotecas de regras dos fornecedores. Para os itens sem evidência independente de comportamento, a coluna de requisitos WU-TRIB é proposta, não constatação de equivalência.

## 3. Oportunidade de diferenciação — hipótese, não resultado

O desenho proposto separa duas experiências:

1. **Audit Data Studio:** operações agnósticas ao tributo (importar, extrair, join, filtrar, perfilar, amostrar, calcular, comparar, agrupar, identificar anomalias e gerar papéis de trabalho).
2. **Fiscal Audit Library:** verificações versionadas por obrigação, tributo, UF, vigência, regime, fornecedor ERP, release, entidade/filial e documentação oficial.

Uma terceira camada **Audit Governance** deve controlar aprovação, explicabilidade, evidências, WO, RCM, alçadas, versionamento e observabilidade. Nenhuma dessas camadas será implementada durante a atual etapa documental.

**Valor potencial:** cada rotina fiscal usa o mesmo executor com controles comuns, sem duplicar o código de join ou seleção. Isso reduz retrabalho **como hipótese de engenharia**, a validar futuramente por custo, precisão, cobertura, satisfação do usuário e manutenção.

## 4. Riscos de adotar práticas externas sem análise

- Uso de IA para laudo não implica que a classificação de risco ou conclusão fiscal esteja correta. Separar informação confirmada, anomalia, hipótese e decisão humana.
- A quantidade de “milhares de verificações” anunciada por fornecedores não estabelece qualidade ou pertinência de uma regra; o WU-TRIB precisa de evidência, versão e teste para cada regra.
- Um join 1:N ou N:M pode aumentar valores e criar falsos achados; todas as plataformas devem ser estudadas quanto a cardinalidade, tipos e integridade.
- Uma correlação entre mudança de alíquota e período não prova mudança de legislação: pode refletir mudança de produto, operação, regime, parâmetro, desconto, base ou problema de dado.
- Digitalização sem controle de proveniência e identidade pode produzir laudos irreproduzíveis.

## 5. Próxima avaliação futura — não autorizada

Avaliar essas plataformas por roteiro padronizado: importação de fixtures, abrangência de join, mudança de períodos, tratamento de dados incompletos, reversão de transformações, amostragem, vínculo a evidências, controle de filtros e tempo de resposta. Registrar versão/plano de cada fornecedor, resultados, prints permitidos/licenças e limitações. **Nenhum benchmark empírico foi executado em produtos de terceiros nesta etapa.**

**Status:** DOCUMENTAÇÃO DRAFT / BENCHMARK DE RECURSOS DIVULGADOS / SEM ALTERAÇÃO DO WU-TRIB.

---
document_id: WUTRIB-DOC-EXP-V02-MASTER
version: 0.2.0
status: DRAFT
wo: WUTRIB-WO-PLAN-018
owner_role: PRODUCT_ARCHITECTURE
reviewer_role: FISCAL_INTERNAL_AUDIT_SECURITY_QA
approver_role: PRODUCT_OWNER
approved_by: NONE
approved_at: NONE
classification: INTERNAL
---

# Plano diretor v0.2.0 — evolução modular Audit Data Studio

## Decisão estratégica proposta

A estrutura continua com três camadas funcionais: **Audit Data Studio** (transformações não fiscais e diagnósticos), **Fiscal Audit Library** (procedimentos tributários com vigência e oráculos oficiais) e **Audit Governance** (WO, RCM, evidência, revisão e release). O aprofundamento foca o conjunto `EXP-001`, `EXP-004`, `EXP-005/007`, `EXP-010`, `EXP-011` e `EXP-012/015`. Os demais 22 módulos do catálogo 0.1.0 permanecem `BACKLOG_DRAFT`.

**Problema profissional:** análises fiscais ad hoc exigem extrair múltiplas origens, normalizar, juntar, selecionar populações, explicar exceções, investigar anomalias e reconciliar mudanças históricas, sem perder os controles de evidência. Reproduzir apenas a lista de módulos comerciais não demonstra que as análises são corretas.

## Camadas e contratos

1. **Aquisição:** source_contract + read-only snapshot + original bytes digest; sem acesso por inferência de empresa ou filial.
2. **Dados:** dataset_manifest + schema de campos + precisão decimal + qualidade de origem + catálogo mestre; todos tipados e de escopo conhecido.
3. **Operações:** operação pura, versionada, com parâmetros; entrada tipada, orçamento e oráculo; saída com linhagem, cardinalidade e rejeições.
4. **Análises:** exceção factual ou sinal de anomalia, risco e base comparável; discrepância numérica não recebe julgamento fiscal por padrão.
5. **Revisão:** casefile + observações + decisão de revisor identificado + riscos residuais; sem autoaprovação.
6. **Proveniência:** WO → requisito → risco/controle RCM → contrato de fontes → execução → linhas e transformação → achado → evidência e reteste → decisão → release.

Cada módulo terá interface **imutável** de entrada/saída por versão, mesmo quando seu executor futuro for web, worker ou batch. Um módulo de transformação pode ter operação válida sem estar qualificado como *validador fiscal*.

## Metas de qualidade e critérios previamente acordados

- **Adequação:** provar requisitos com casos positivos, negativos e de limites (ISO/IEC 25010 e 29119-2/-3/-4 como referências).
- **Segurança e privacidade:** Auth, segregação por organização/filial, preservação de dados, política de retenção, limites de requisições e minimização (OWASP ASVS e LGPD, conforme aplicáveis).
- **Dados:** precisão, consistência, integridade, completude, linhagem, versão e vigência (ISO/IEC 25012 como referência).
- **Eficiência:** tempo, memória, custo, tamanho de payload, p95/p99 concorrente e degradação; limites **não estipulados** até baseline autorizado.
- **Acessibilidade:** WCAG 2.2 AA para tarefas de configuração, navegação, confirmação, filtragem, seleção e evidências, inclusive teclado e leitura de telas.
- **Sustentabilidade:** demanda de CPU/memória/transferência e energia/emissões estimadas com unidade funcional, origem dos fatores e limites de cobertura; não criar alegação de carbono não medida.
- **Auditoria:** documentação de população, método, objetivos, workpapers, revisões, conclusões e follow-up, sem converter padrões profissionais em validação automática.

## Escopo por família e priorização candidata

| Onda futura | Componentes | Critério para admitir implementação | Gate |
|---|---|---|---|
| EXP-PLAN-0 | Aprovação dos requisitos do v0.2 | Owners, RCM, dados permitidos, baseline e orçamento aprovados | HOLD_HUMAN |
| EXP-PLAN-1 | Fonte, metamodelo, perfis, schema | Definição de oráculos e semântica dos dados; compatibilidade por release ERP | HOLD_HUMAN |
| EXP-PLAN-2 | Extractor e Join | Provas de integridade, cardinalidade e anti-joins, usando apenas fixtures | NOT_RUN |
| EXP-PLAN-3 | Filtros e amostragem | Universo, exclusões, seleção, método, replay, risco de projeção | NOT_RUN |
| EXP-PLAN-4 | Erros e anomalias | Distinção evento/causa/risco, calibração e revisão independente | NOT_RUN |
| EXP-PLAN-5 | Comparação tributária temporal | Bitemporalidade, fonte oficial, períodos, mix, configuração, regime | NOT_RUN |
| EXP-PLAN-6 | UX, capacidade, segurança e emissão | UAT, WCAG manual, SLO, avaliação de carga e papéis de trabalho | NOT_RUN |

Não iniciar EXP-PLAN-2 antes de controles de dataset e de entrada aprovados. Nenhuma decisão GO/NO-GO está implícita neste planejamento.

## Riscos de arquitetura e mitigação exigida

- *Explosão de cardinalidade*: join N:M gera duplicação e inflação de totais. Exigir estimador e bloqueio antes de agregar.
- *Conversão de dados*: cast de valores decimais para float, perda de zeros à esquerda e datas sem timezone podem distorcer resultados. Exigir canonização versionada e dados brutos preservados.
- *Mistura de populações*: diferenças de organização, filial, período ou regime podem produzir variações falsas. Exigir escopo compatível e versão de dados.
- *Oráculo circular*: comparar um validador com resultado gerado por ele mesmo invalida independência. Aplicar meta-validação e casos externos autorizados.
- *Anomalias rotuladas como infração*: score estatístico não comprova ilegalidade. Causa e juízo humano independentes.
- *Alteração tributária presumida*: mudança de taxa efetiva não prova alteração de norma. Vincular fontes, condições e vigência.
- *Falsa aceitação*: script concluído, documento criado ou porcentagem de cobertura não equivale a UAT, conformidade nem autorização.

## Dependências a manter distintas

- **22 módulos**: funções e transformações propostas na expansão v0.1.
- **28 validadores**: controles técnicos/analíticos e meta-validação previstos, não equivalentes aos engines.
- **50 modelos documentais**: templates da governança v0.1, não documentos preenchidos.
- **33 casos v0.1 e matriz v0.2**: desenho de testes, **não** resultados.
- **WUTRIB-WO-PLAN-018**: autoridade documental existente; qualquer WO futura executiva dependerá de abertura/admissão própria.

## Limites de mudança

**Proibido nesta etapa:** criar APIs, alterar HTML/CSS/JS do produto, criar ou migrar tabelas, configurar autenticação, ativar dados reais, executar stress de banco, modificar CE, mudar CI/CD, criar Vercel deployment, merge, homologar ou assinar termo.

A publicação desta especificação gera somente evidência de **planejamento versionado**.

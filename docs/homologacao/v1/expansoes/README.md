---
document_id: WUTRIB-DOC-EXP-INDEX
version: 0.1.0
status: DRAFT
wo: WUTRIB-WO-PLAN-018
owner_role: PRODUCT_STRATEGY
reviewer_role: QA_AND_FISCAL
approver_role: PRODUCT_OWNER
approved_by: NONE
approved_at: NONE
classification: INTERNAL
---

# Expansão funcional — Audit Data Studio e inteligência fiscal

**Proposta registrada em 2026-11-08, sem execução.** As referências visuais fornecidas pelo usuário são utilizadas apenas para levantar funcionalidades, sem copiar marcas, código ou telas.

## Documentos de planejamento

- [Benchmark das soluções de mercado](BENCHMARK_PLATAFORMAS_AUDITORIA_v01.md): Kolossus, e-Auditoria, IDEA, Diligent ACL, MindBridge, Power Query e Alteryx; distingue o que os fornecedores anunciam de observação empírica.
- [Plano detalhado de expansão](PLANO_EXPANSAO_AUDIT_DATA_STUDIO_v01.md): três superfícies de produto, arquitetura, extractor, join, filtros, seleção e amostragem, erros, anomalias, comparação entre períodos, UX e gates.
- [Catálogo JSON de 22 módulos candidatos](CATALOGO_MOTORES_ANALITICOS.v01.json): identidade, dependências, entradas, saídas, riscos, aceite mínimo e status.
- [Matriz de 33 cenários de testes futuros](MATRIZ_CENARIOS_FUTUROS_v01.md): oráculos esperados, casos negativos, regressões, reformulação de variáveis e análise temporal.

## Decisões já estabelecidas e limites

1. Diferenciar **Engine de transformação**, **Validador técnico**, **Regra fiscal** e **Decisão profissional**. Um join pode funcionar corretamente sem que o tratamento tributário resultante seja adequado.
2. `fiscalConformity=NOT_EVALUATED` em todos os motores e achados não revisados. Anomalia não é erro; delta observado não é mudança legislativa comprovada.
3. Não modificar o Design System existente ou replicar a interface de Kolossus/e-Auditoria/IDEA.
4. Não ativar dados empresariais ou autorizações sem WO, contratos, proveniência, fontes oficiais e testes do plano de validadores.
5. Não modificar aplicações, bancos, CI/CD, Supabase, Vercel, rotinas e deploys agora.

## Compatibilidade documental

Extensão vinculada ao catálogo canônico v0.3.0 (WO-018). Os **50 modelos documentais** previamente criados continuam intactos; os quatro D051-D054 propostos para métodos e amostragem continuam candidatos não criados. A estratégia de **28 validadores** continua em DRAFT e não deve ser confundida com os 22 módulos de aplicação.

**Status de todos os documentos desta expansão: DRAFT / NÃO HOMOLOGADO.**

## Aprofundamento adicional v0.2.0 — sem execução

[Índice do aprofundamento e das 17 peças documentais](v02/README.md) · [Plano diretor aprofundado](v02/PLANO_DIRETOR_v02.md) · [Matriz de 68 testes futuros](v02/MATRIZ_TESTES_v02.json) · [Riscos e controles RCM/RTM](v02/RCM_E_RTM_v02.md).

O conteúdo anterior v0.1.0 e as 22 capacidades propostas permanecem intactos. O novo pacote registra requisitos detalhados para seis famílias prioritárias e contratos JSON apenas planejados. **Nenhum teste foi executado, nem houve atualização de banco, aplicação, CI/CD ou Vercel.**

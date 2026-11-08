---
document_id: WUTRIB-DOC-EXP-V02-UX
version: 0.2.0
status: DRAFT
wo: WUTRIB-WO-PLAN-018
owner_role: UX_PRODUCT
reviewer_role: ACCESSIBILITY_AND_AUDIT_OPERATIONS
approver_role: PRODUCT_OWNER
approved_by: NONE
approved_at: NONE
classification: INTERNAL
---

# Experiência planejada — Audit Data Studio, módulos analíticos e evidências

**Design System:** preservar cores, tipografia, identidade e padrões de navegação WU-TRIB já aprovados. Nenhuma interface deve reproduzir as capturas de Kolossus, vídeos ou aparência de terceiros. Não são mockups implementados.

## Objetivos de experiência

Uma pessoa que atua com auditoria deve perceber claramente **onde está**, **qual população está analisando**, **quais fontes e regras sustentam cada resultado**, **o que foi ou não processado**, **o que pode ser aprovado** e **qual ação é reversível**. Reduzir carga cognitiva por exposição progressiva sem esconder informações essenciais ou inundar a tela de cards decorativos.

## Fluxos críticos de usuário

| Fluxo | Etapas e ação principal | Confirmação necessária | Tratamento de falha |
|---|---|---|---|
| Importar/Extrair | Origem→empresa/filial→período→contrato→prévia→captura | Fonte, classificação e limites autorizados | Incompleto ≠ vazio; exibir quarentena |
| Join | Fontes→chaves→tipo→prévia cardinalidade→execução→matches/unmatched | N:M e custo/contagem quando há risco | Bloquear soma sem alocação |
| Seleção | População→filtros→seleção dirigida ou amostra→revisar cobertura | Método, seed e exclusões | População não íntegra = BLOCKED |
| Anomalias | Coorte→método→baseline→sinais→explicação→investigação | Nenhuma conclusão fiscal automática | Sem base comparável = INSUFFICIENT |
| Mudança temporal | Selecionar períodos→comparabilidade→decomposição→origens→investigar | Fonte normativa e vigência para atribuir causa legal | Periodicidade/release divergente = HOLD |
| Gestão de exceções | Fila→filtro→evidência→ação/atribuição→revisão | Alçada somente na decisão final | Sem evidência não vira resolvido |
| Relatório | Escopo→seções→cobertura/limitações→prévia→exportar | Confirmação de versão e sign-off quando aplicável | Export deve incluir tudo, não só linhas visíveis |

## Componentes que precisam funcionar, não apenas existir

**Topbar:** contexto da empresa/filial/competência e identidade da sessão, breadcrumb, indicador de ambiente DEMO/ENTERPRISE, busca por procedimento e acesso às fontes. **Sidebar:** núcleos de funções por finalidade; não criar submenus sem páginas e interações reais. **Tabelas:** 50 linhas ou virtualização por contrato de UX; busca, filtros, campos fixos e exportação total, seleção persistente após paginação, colunas acessíveis. **Procedimento:** metadados, status, riscos, histórico de parâmetros, “prévia de custo/contagem”, execução e workpaper. **Histórico temporal:** comparação lado a lado, filtros de população, contribuição e linha do tempo legível por teclado.

## Estados visuais e semânticos

`NOT_STARTED`, `RUNNING`, `SUCCEEDED`, `FAILED`, `BLOCKED`, `PARTIAL`, `CANCELLED`, `NO_RESULTS`, `EMPTY_VALID_DATASET`. Um dataset vazio tecnicamente válido é diferente de falta de arquivo ou de resultado de filtro. Comunicar operações longas com status progressivo e permitir cancelamento efetivo quando seguro; jamais inventar porcentagem de progresso não mensurada.

## Acessibilidade e heurísticas

WCAG 2.2 AA por fase e critério aplicável; foco, semântica, tabelas e formulários, live region sem ruído, contraste, zoom 200% e 400% quando aplicável, reflow, leitores de tela/teclado. ISO 9241-11 e 9241-210 orientam testes humanos de eficácia, eficiência e satisfação; não presumir conformidade pelo scanner. Hicks/Fitts e heurísticas de Nielsen podem informar decisões, não substituir prova empírica com usuários.

## Métricas de avaliação futura

Tempo para importar e entender cobertura, tempo para configurar join, incidência de erro N:M não percebido, sucesso em recuperar achado e fonte, porcentagem de tarefas sem mouse, taxa de retorno à página, tempo de reconciliação, satisfação por tarefa e compreensão de “anomalia ≠ irregularidade”.

## Microtarefas para UAT (não executadas)

`UX02-01` importa arquivo truncado e consegue explicar o bloqueio; `UX02-02` identifica duplicidade N:M antes de executar; `UX02-03` faz left anti e exporta todos os resultados; `UX02-04` diferencia filtro e amostra estatística; `UX02-05` explica por que delta de alíquota não prova lei alterada; `UX02-06` revisa evidência com teclado; `UX02-07` localiza limitações de dataset; `UX02-08` reabre investigação e entende a história.

**Status:** EXPERIÊNCIA DOCUMENTADA / NÃO IMPLEMENTADA / NÃO VALIDADA COM USUÁRIOS.

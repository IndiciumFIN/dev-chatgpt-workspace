---
document_id: WUTRIB-V1-INDEX-001
version: 1.0.0-rc.0
status: CANDIDATE_SCOPE_FREEZE
wo_lineage: WUTRIB-WO-PLAN-018
approved_by: NONE
approved_at: NONE
---

# WU-TRIB V1 — baseline funcional candidata, 08/11/2026

**Objetivo:** “colocar uma pedra” na definição da primeira versão de WU-TRIB, sem criar falsa homologação. A arquitetura e os contratos tornam-se **candidatos a congelamento de escopo**, para discussão e aprovação humana. **Sem implementação, execução de auditoria, alteração de código, dados reais ou deploy nesta revisão.**

## Entradas da análise

- Pesquisa R1: `deep-research-report.md` (347 linhas, hash no parecer).
- Pesquisa R2: `deep-research-report (1).md` (225 linhas, hash no parecer).
- [Plano WU-TRIB v0.1.0](../../homologacao/v1/expansoes/README.md), [aprofundamento v0.2.0](../../homologacao/v1/expansoes/v02/README.md) e [PR47 de avaliação normativa](../../governanca-multidominio/revisao-20261108/README.md). Os arquivos originais da pesquisa são identificados por nome/hash, não copiados integralmente para o repositório.
- Registro documental canônico e catálogo de 28 validadores permanecem históricos. A V1 **não** engloba o produto Calculadoras de Enfermagem.

## Documentos de decisão e aceite

| Documento | Finalidade | Estado |
|---|---|---|
| [Parecer e decisão de escopo](PARECER_E_DECISAO_ESCOPO_V1.md) | Síntese crítica R1×R2 e critérios de V1 | CANDIDATE |
| [Matriz de reconciliação](MATRIZ_DE_RECONCILIACAO_DAS_PESQUISAS_V1.md) | 39 macrotemas, todos com destino explícito | CANDIDATE |
| [Catálogo funcional V1 corrigido](CATALOGO_FUNCIONAL_V1_CORRIGIDO.json) | 22 módulos; restauração documentada de 21 linhas com campos deslocados | CANDIDATE |
| [Arquitetura e contratos](ARQUITETURA_E_CONTRATOS_V1.md) | Cinco ledgers, fontes, formatos, dicionários, regra temporal, provas | CANDIDATE |
| [Registro de decisões ADR/RFC](REGISTRO_DECISOES_E_CONTROLE_MUDANCAS_V1.md) | 20 decisões e mudança controlada | CANDIDATE |
| [Matriz de 30 testes e 7 gates](MATRIZ_DE_TESTES_E_GATES_V1.json) | Verificações mínimas, oráculos e status NOT_RUN | PLANNED |
| [Fontes normativas e benchmark](REGISTRO_DE_FONTES_V1.json) | 27 fontes e níveis de verificação por emissor ou fornecedor | TO_ASSESS |
| [Checklist de aprovação de escopo](CHECKLIST_FECHAMENTO_ESCOPO_V1.md) | Critérios para transformar 1.0.0-rc em baseline 1.0.0 de escopo | HOLD_HUMAN |
| [Manifesto de baseline](MANIFESTO_V1.json) | Fonte, hash, versão, IDs, caminhos, estados e bloqueios | CANDIDATE |

## Escopo V1 candidato

**13 mínimos de produto:** Extrator, perfilamento, normalização, Join, seleção/filtros, cadastro mestre restrito, duplicidades/gaps, classificação de erros, reconciliação multiorigem sintética, validação estrutural restrita, investigação, evidência e dashboard.

**5 módulos delimitados:** amostragem, estratificação, anomalias estatísticas, alterações entre períodos, alterações em parametrizações Protheus. Seus subescopos não viram garantias de conformidade.

**4 módulos após V1:** simulação fiscal substantiva, recuperação/créditos, conciliação contábil/estoque multilateral, compositor visual/agendamento. Outros documentos fiscais, obrigações, conectores live, guias, retificação e IA também permanecem fora do release V1 e dentro da visão de evolução.

## O que está efetivamente congelado nesta versão candidata

Rastreabilidade dos requisitos e decisões documentais, não uma “V1 pronta”. Uma futura assinatura deverá congelar o commit exato, a fonte/edição e o parecer de owner, Fiscal/Protheus, QA, Segurança/Privacidade, UX/Operações conforme escopo. **Nenhum assinante foi inventado.**

**GO/NO-GO atual:** `NO_GO_IMPLEMENTATION_OR_PRODUCTION`; `SCOPE_CANDIDATE_READY_FOR_REVIEW`.

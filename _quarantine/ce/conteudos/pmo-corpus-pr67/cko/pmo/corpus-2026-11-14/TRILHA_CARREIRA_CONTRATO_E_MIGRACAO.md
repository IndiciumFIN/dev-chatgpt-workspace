# Trilha de carreira — contrato semântico e estratégia de migração

**Estado:** nome funcional aprovado em D012; o desenho de dados abaixo é `PROPOSED_NOT_ADMITTED` (D013), aguardando fontes e decisão arquitetural. **Não** houve DDL nem renomeação de coluna, FK, tabela, JSON schema ou UCs históricas.

## Decisão e fronteira
- **Exibição:** "Trilha de carreira" substitui "Currículos" nos painéis, relatórios e atividades de produto. Não confundir trilha com simples catálogo de aulas: ela requer objetivos, competências, estágios, opções de progressão, requisitos e avaliação.
- **Origem:** manter terminologia da ementa exatamente recebida. Objetos legados `CURRICULUM`, `UC`, `MODULE`, `LearningObjective` e IDs `CARDIOLOGIA-UC-xx` são referências de proveniência; não se alteram por rename.
- **Fonte canônica de fatos:** `SOURCE → DOCUMENT → SPAN/ATOM → CLAIM → KNOWLEDGE_ATOM`. A Trilha de carreira referencia conhecimento aprovado; nenhuma ementa, por si só, comprova requisito profissional.
- **Aprovações:** itens que caracterizam atribuições, títulos ou habilitações profissionais dependem de normativos oficiais e aprovação humana; conteúdo clínico e licença têm gates distintos.

## Entidades futuras sugeridas (não materializadas)
| Objeto | Papel | Campos imprescindíveis | Status |
|---|---|---|---|
| CareerPath | trilha lógica | id, versão, especialidade, público, objetivos, jurisdição, proveniência | PROPOSED |
| CareerStage | etapa de aprendizagem/progressão | path_id, order, prerequisite_refs, competency_refs, source_ids | PROPOSED |
| Competency | competência verificável | competency_id, statement, source_span_ids, scope, review | PROPOSED |
| LearningUnitRef | link de UC original sem duplicá-la | canonical_uc_id, source_id, source_version, workload_hours, stage_id | PROPOSED |
| CredentialRequirement | titulação/certificação/habilitação, se houver fonte | credential_id, authority_id, legal_basis, effective_date, jurisdiction | PENDING_SOURCE |
| CareerAssessment | avaliação formativa vinculada a competências aprovadas | objective_id, claim_refs, assessor, test_version, result | PROPOSED |
| CareerContentProjection | conteúdos e simulados derivados | knowledge_atom_refs, template_id, locale, format, rights_status | PROPOSED |

## Migração de nomes sem perda de evidência
1. Criar alias `career_path_display_label` no front-end/PMO e manter `curriculum_id`, `unit_id`, `module_id` nas referências.
2. Registrar `LEGACY_CURRICULUM → CAREER_PATH_LEARNING_UNIT_REF` como *proposta de relação*, sem equivalência exata presumida.
3. Para cada etapa proposta, exigir `source_id`, versão, trecho ou ementa da instituição e `review_status`.
4. Exigir decisões específicas para UC08/UC07/UC09, Centro Cirúrgico/CME e credenciais.
5. Testar compatibilidade com contratos existentes em `contracts/cko-schemas`, grafo e dashboard; bloquear drift e duplicações.
6. Somente depois de validação, emitir migração candidata com rollback e gate de governança. Não mudar Supabase agora.

## Baseline factual que não deve ser apagada
- Cardiologia: 10 UCs, 300 horas; **51 módulos e 295 tópicos detalhados**; UC08 oito eixos de ementa recebida, **zero módulos próprios**. A primeira extração tinha 58 módulos/326 tópicos; continua registrada como versão anterior, não como dado atual.
- Urgência e Emergência (170 tópicos) e Enfermagem do Trabalho (885 tópicos) são **universos de temas** no SQLite, não etapas de carreira prontas.
- Centro Cirúrgico e CME requerem fonte institucional/ementas; nenhuma competência ou pré-requisito legal foi aprovado a partir de tópicos sem documento.
- Templates editoriais de artigo, caso, quiz, flashcard etc. são projeções da base de conhecimento, não equivalem a CareerPath.

## Verificações da alteração de nomenclatura
- B20–B24 rotulados funcionalmente "Trilha de carreira" no PMO WBS, IDs e status preservados.
- `PLANO_INTEGRADO_PONTA_A_PONTA_20261114.md`: fase PP04, controle de aceite e especialidades com novo nome.
- `GATE_CROSSWALK_TRIPLO_20261114.md`: eixo PP04 atualizado; gates legados G3 preservados conforme nome original das fontes.
- `WBS_EXTENSOES_PONTA_A_PONTA_CANDIDATAS.csv`: PXC-006/PXC-015 atualizados, **não admitidos**.
- Aprovada somente a escolha do nome; implantação de entidade/serviço ainda é `HOLD_ADR`.

**Data:** 2026-11-14. **Origem da nomenclatura:** decisão do usuário nesta conversa. Não confundir com título oficial de curso.

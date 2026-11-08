---
document_id: CROSS-DOC-INDEX-001
version: 0.1.0
status: DRAFT
wo_lineage: WUTRIB-WO-PLAN-018
owner_role: PMO_GOVERNANCE
reviewer_role: DOMAIN_QUALITY_SECURITY
approver_role: DOMAIN_AUTHORITIES
approved_by: NONE
approved_at: NONE
classification: INTERNAL
---

# Avaliação normativa e estratégia de validadores — WU-TRIB + Calculadoras de Enfermagem

**Data:** 08/11/2026 · **Estado:** `DRAFT / HOLD_HUMAN` · **Tipo:** Avaliação pré-implementação, sem auditoria de conteúdo ou testes de software.

A avaliação considera integralmente o anexo de 309 linhas, os planos WU-TRIB v0.1 e v0.2, os três scripts de auditores antigos, os 28 validadores candidatos v0.3 e fontes primárias oficiais. Trata o domínio clínico e fiscal **separadamente**; compartilhar processo de documentação não implica compartilhar regras, runtime, base de dados ou aprovação.

## Artefatos canônicos desta revisão

| Artefato | Descrição | Estado |
|---|---|---|
| [Parecer pré-implantação](PARECER_PRE_IMPLANTACAO_v01.md) | Método e limites da evidência, 20 correções, domínios, fontes, decisão | DRAFT |
| [Inventário de 55 referências](FONTES_NORMATIVAS_MULTIDOMINIO_v01.json) | Edição/URL, primazia, status de verificação, direitos e aplicabilidade | DRAFT |
| [Cobertura de 62 tópicos](MATRIZ_COBERTURA_TOPICOS_v01.json) | Rastreia cada tema discutido a área, validação, prioridade e HOLD | DRAFT |
| [Qualificação dos validadores](PLANO_REQUALIFICACAO_VALIDADORES_v01.md) | Limitações verificadas no código, camadas, 16 meta-testes, independência | DRAFT |
| [30 riscos residuais](MATRIZ_RISCOS_RESIDUAIS_v01.json) | Severidade proposta, owner, gate, tratamento e aceite ausente | HOLD_HUMAN |
| [Engines e gates](ESTRATEGIA_ENGINES_E_GATES_v01.md) | Engenharia fiscal/clínica separadas, benchmarking, 12 gates antes de implantação | DRAFT |
| [13 candidatos clínicos](VALIDADORES_CLINICOS_CANDIDATOS_v01.json) | Hipóteses de novos validadores para enfermagem, sem acesso ao código CE | PROPOSED |
| [Manifesto](MANIFESTO_REVISAO_v01.json) | IDs de documentos, controle de estado, dados de proveniência e dependências | DRAFT |

## Limites inegociáveis

**Avaliar antes de implementar** significa nesta fase:
- verificar a documentação, fonte, edição e pertinência, identificar pontos cegos e propor testes;
- **não** executar scripts de auditoria, testes de negócio, carga, plugins/IA fiscais, queries de dados empresariais, alterações SQL, merges ou deployments;
- manter separadas CE e WU-TRIB: o repositório CE não foi acessado por esta conexão; erros passados ou ausências **não podem ser atribuídos** ao produto clínico atual sem inspeção;
- reconhecer que número de modelos, scripts, checks ou referências não demonstra qualidade/eficácia/homologação;
- exigir contrato, dados sintéticos, oráculo independente e aprovação de alçada antes de qualquer próxima fase.

**WO existente:** `WUTRIB-WO-PLAN-018` é apenas a linhagem do planejamento WU-TRIB; **não** se cria uma WO clínica fictícia, nem se altera Supabase por este pacote. Uma futura decisão transversal requer owner próprio, escopo, referência de WO e permissão explícita.

## Resultados da revisão

A estratégia necessita reforçar auditoria dos próprios validadores; o código observado do meta-validator verifica regex e exclui a si próprio. O catálogo normativa antigo era verificação de metadados, não conteúdo. Mesmo que o runner retornasse PASS em uma execução anterior, não há evidência suficiente de qualificação normativa completa.

Existem 55 referências bibliográficas **catalogadas**, não 55 fontes com texto integral/licença/aplicabilidade homologados; 62 tópicos **rastreáveis**, não 62 testes realizados; 30 riscos **identificados/planejados**, não 30 riscos aceitos; e 13 validadores clínicos **propostos**, não software implementado.

## Próxima decisão

Review por fiscal, enfermeiro responsável, qualidade, segurança/privacidade, governança/PMO e jurídico conforme domínio → decidir aplicabilidade/autoridade de corpus → aprovar oráculos e políticas de testes → apenas então autorizar tarefa executiva específica. Sem isso: `NO_GO / HOLD_HUMAN`.

**Permanecem em Draft** todos os artefatos desta revisão. A PR deverá ser mantida em Draft, sem merge, sem alteração em CE e sem deploy.

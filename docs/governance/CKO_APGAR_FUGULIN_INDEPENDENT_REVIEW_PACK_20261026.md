# Homologação independente — pacote operacional do piloto CKO

**Local de execução:** banco canônico Supabase Calculadoras-Smart · **origem:** `candidate-canonical-tool-graph.json` coletado em 26/10/2026  
**Fase:** CHECKER_REQUIRED / HUMAN_HOLD · **Nenhuma decisão presumida**

Este pacote organiza verificações que dependem de pessoas autorizadas. **Não contém um formulário de aprovação preenchido, certificado de conformidade ou parecer clínico automático.**

## Apgar — seis requisitos ainda candidatos
Todos pertencem ao registro `NDE-APGAR-AAP-ACOG-2015-CAND`, obtido de fonte AAP/ACOG 2015 com acesso por metadados, não homologado.

| Claim | Requisito extraído | Status | Checker presente? |
|---|---|---|---|
| `CLM-APGAR-5-COMPONENTS-20260901` | `REG-APGAR-COMPONENTS` | CANDIDATE_UNCHECKED | **Não** |
| `CLM-APGAR-5-COMPONENTS-20260901` | `REG-APGAR-DOMAIN` | CANDIDATE_UNCHECKED | **Não** |
| `CLM-APGAR-NO-ASPHYXIA-DX-20260901` | `REG-APGAR-NO-ASPHYXIA-DX` | CANDIDATE_UNCHECKED | **Não** |
| `CLM-APGAR-NO-ASPHYXIA-DX-20260901` | `REG-APGAR-NO-INDIVIDUAL-PROGNOSIS` | CANDIDATE_UNCHECKED | **Não** |
| `CLM-APGAR-TIMING-20260901` | `REG-APGAR-TIMING-1-5` | CANDIDATE_UNCHECKED | **Não** |
| `CLM-APGAR-TIMING-20260901` | `REG-APGAR-TIMING-REPEAT` | CANDIDATE_UNCHECKED | **Não** |

**Checker de evidência e fonte:** obter fonte oficial na edição exata; verificar trecho localizado de cada requisito; checar redação do claim, correspondência científica, autoridade, jurisdição, direitos de reprodução, data, hash real/snapshot durável, status e assinatura. **Depois** inserir aprovação por ferramenta governada, jamais atualizar a linha silenciosamente. Tarefa `TASK-CKO-PILOT-EVIDENCE-20261026`.

**Checker de cálculo:** revisar os cinco critérios e opções candidatos, sem utilizar um escore sintético como validação científica. Resolver motor, rule pack e vetores clínicos “ouro” com dupla verificação para intervalo, categorias, tempo de avaliação e erros de entrada. Revisar termos de interpretação e limitações de uso. Tarefa `TASK-CKO-PILOT-RULE-20261026`.

**Checker de versão/publicação:** reconciliar `OV-APGAR-SUCCESSOR-0.2.0` e seus 1.215 testes **declarados** com reexecução independente; verificar que o frontend não promova conteúdo a partir de `publicacao='publicada'` enquanto o Kernel mantém HOLD. Tarefa `TASK-CKO-PILOT-RUNTIME-20261026`.

## Fugulin — variantes por completar
O catálogo inspecionado inclui **10 campos**, dos quais **0** têm opções de pontuação enumeradas. Não usar como motor de classificação.

### Bloqueios de revisão
- Resgatar a edição original e a versão de **9 áreas**, com interpretação própria e autorização do uso;
- Resgatar a edição/versão de **12 áreas**, sem misturar categorias e seus limites;
- Resolver com fonte primária/errata e especialista a sobreposição do valor **34** encontrada em uma fonte secundária, antes de admitir qualquer implementação;
- Vincular Parecer Normativo COFEN nº 1/2024 e Resolução nº 743/2024 ao papel de normativo de dimensionamento, sem confundi-los com a autoria do algoritmo específico;
- Criar somente através de Kernel autorizado os IDs de variantes e relações que estejam faltando, com testes de faixa e descontinuidade.

Tarefa: `TASK-CKO-PILOT-FUGULIN-20261026`.

## Critérios gerais de aceite (não executados)
1. Fonte/versão original comprovadas e direito/licença para cada finalidade e mídia.
2. Fonte → snapshot/hash → fragmento/requisito → claim → regra + versão, com relação verificável e sem órfãos.
3. Classificação da natureza da autoridade por campo e decisão de aplicabilidade temporal/jurisdicional.
4. Engine e validador específicos materializados, governados e testados com negativos e pontos de borda; não `null`.
5. Casos-ouro de especialistas, resultados e classificação sem sobreposição; múltiplos idiomas sem mudança de matemática.
6. Revisor clínico, revisor de direitos e auditor independente identificados, com decisões registradas.
7. FIND, política, validador, tarefa, WO, admissão Kernel e evidências de testes vinculados.
8. Exemplar editorial com capa da versão certa, referências válidas, formatos derivados/UX acessível e gate de publicação.
9. Aprovação explicitamente limitada ao objeto/versão/canal, sem liberar retroativamente outras versões.
10. Teste DB→motor→UI e rollback comprovados em staging antes de promoção.

**Estado atual:** engenharia do piloto CI PASS; todos os itens acima que exigem ações de especialistas estão em HOLD e as WOs permanecem `NOT_SUBMITTED`.

## Links internos
- [Relatório da prova técnica](../../audits/CKO_DB_FIRST_VERTICAL_SLICE_REPORT_20261026.md)
- [Matriz normativa](../../audits/CKO_PILOT_NORMATIVE_APPLICABILITY_20261026.md)
- [Fila PMO](../../../registers/pmo/queue.v1.json)
- [FINDs, tarefas e WOs candidatos](../../../registers/governance/candidates/)

# M04 — Lacunas de direitos e evidência (12 temas selecionados)

Fonte: `canonical_corpus.sqlite` recuperado no M03, representado pelo índice de referências versionado no PR #66 e conferido por leitura da branch. **Amostra selecionada, não auditoria do corpus inteiro.**

## Cobertura da amostra
- 12 IDs reais de `topics.topic_uid`.
- 651 linhas de candidato de evidência somadas por tópico; **não representam 651 átomos únicos, claims válidos, estudos independentes ou conteúdos aprovados**.
- 6 temas de Urgência com candidatos exclusivamente classificados como restritos/referência humana nos status registrados.
- 4 temas de Urgência com misturas de status `DEFAULT_ACTIVE`, condicionais e/ou restritos.
- 2 temas de Saúde do Trabalhador sem vínculos na tabela de candidato de átomos deste snapshot.
- 3 recursos educacionais em `HOLD_HUMAN` e sem `source_claim_ids`, ainda sem conteúdo clínico liberado.
- Publicação clínica aprovada nesta onda: **0**.

## Direitos
O status `DEFAULT_ACTIVE` da recuperação NÃO comprova direito de redistribuir, traduzir, adaptar ou comercializar. As categorias de origem incluem `LICENSE_QUARANTINED` e `HUMAN_REFERENCE_ONLY`. Documentos com tais status devem permanecer fora de PRs públicos e de qualquer publicação until rights/permitted-use review.

## Próxima operação com prova
Para cada tema, revisar as fontes primárias e o trecho referenciado em um ambiente que tenha direito de consulta; registrar documento/versão/hash/span/jurisdição, separar claims e direitos por operação, reconciliar duplicatas, obter aprovação clínica e só então preencher `source_claim_ids` dos recursos M04. Temas OH exigem atomização ou fontes equivalentes verificadas.

Sem revisão científica/documental nesta etapa, a relação curricular permanece `RELATED_TO` (candidate) e `clinical_publishable=false`.

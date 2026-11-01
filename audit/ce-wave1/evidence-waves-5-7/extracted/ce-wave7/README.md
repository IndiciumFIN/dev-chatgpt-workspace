# CE Wave 7 — Auditoria das 27 árvores Git, sem truncamento

**Estado:** HOLD_HUMAN · READ_ONLY. Nenhum merge, commit, DDL ou deploy.

## Novas evidências verificadas

- 27 HEADs/27 árvores recursivas lidas diretamente por API GitHub, com `truncated=false`.
- 1.877 arquivos blob na `main`; 2.304 na branch candidata de integração;
  8.847 na branch histórica de projeção.
- 26 branches de origem comparadas path/blob com a `main`. Contagens individuais
  são factuais e separadas em exclusivos, mesmo caminho/diferente e idênticos.
- A branch `plan/pmokernel-finalization-20261031` **avançou durante a rodada**:
  `0346c3f` -> `ccae449` -> `57242ec`. O HEAD mais recente foi reconsultado
  e sua árvore inteira (1.884 blobs, sem truncamento) verificada. No novo estado: 142 tasks.
- A PR #29 (revert de #26) está aberta e o CI falha no passo
  `Validar PMO canônico e histórico`. A validação na PR exige que WO-ADM-001
  esteja `PAUSED`, mas a `main` registra `IN_PROGRESS`.
- A PR #30 continua aberta, sem assinatura verificável do Kernel.

## Limites que não podem ser esquecidos

- Recontagem global de caminhos colidentes *entre todas as 26 branches*
  **NÃO foi concluída**, porque lotes são separados e colisões entre lotes
  não foram recombinadas. Foram 124 colisões no lote A e 21 no lote B.
  Não somar os números (há interseções).
- Os 27 HEADs não são fotografia transacional/atômica de toda a organização;
  revalidar refs imediatamente antes de qualquer operação.
- Contagem path/blob versus main não indica arquivos seguros para promoção,
  licenciamento, homologação clínica ou mesmo ausência de conflito de merge.
- O auditor canônico continua sendo `scripts/audit-main-migration.mjs`.
  O registro canônico permanece desatualizado com 23 fontes;
  estas saídas são *candidatas* e não devem ser promovidas automaticamente.

## Próximas etapas

1. Reconciliar o registro canônico para 26 origens, mantendo sua autoridade única.
2. Reexecutar o auditor original com todos os refs presentes e HEAD pinning.
3. Atualizar a análise global de conflitos e validar conteúdo/contratos/WO.
4. Reconciliação do Kernel e revisão independente; somente com admissão válida
   considerar aplicação à branch candidata e CI/merge.

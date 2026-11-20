# FIND-CE-PMO-20261026 — Divergência preexistente entre estado do PMO e validador

**Tipo:** candidato de governança / CI. **Situação:** OPEN, sem admissão Kernel e sem correção aplicada.
**Escopo:** `IndiciumFIN/dev-chatgpt-workspace`, branch derivada de `main@6c62bb61791631681979b229ccfbb05f7f5ac411`.

## Evidência e reprodução
- `registers/pmo/queue.v1.json` na main de origem informa que `WO-ADM-001` está `IN_PROGRESS` e que o proprietário autorizou a evolução administrativa em 26/10/2026.
- `scripts/check-pmo-queue.mjs` exige expressamente `q.items[0].status === 'PAUSED'` na linha do teste `'Protótipo deve permanecer congelado'`.
- O GitHub Actions falhou no job de PMO com `AssertionError: Protótipo deve permanecer congelado` mesmo após reverter nesta branch a modificação provisória na fila, restaurando o arquivo exatamente ao blob da main.
- Execução observada: https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/40422320270.
- O teste de contratos isolado do MEM passou: https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/40422320252.

## Análise
A divergência é do contrato e da decisão de liberação do protótipo, não do código editorial de Curiosidades. Não desabilitar o validador, nem voltar indevidamente a tarefa administrativa para `PAUSED` como um atalho. Submeter decisão ao proprietário e seguir cadeia formal FIND → política → validador → WO → testes → aprovação.

## Estado da branch
- A tentativa inicial de adicionar `WO-MEM-CUR-001` à fila canônica foi revertida e o blob da fila na branch é igual ao da main.
- A ordem documental permanece em `docs/curiosidades/WORK_ORDER_MEM_20261026.md`; não se declara a integração ao PMO concluída.
- Publicação e promoção continuam bloqueadas pelos gates editoriais próprios.

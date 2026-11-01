# Wave 6 — Reconciliação diferencial de evidências (somente leitura)

**STATUS: HOLD_HUMAN / RECONCILIATION ONLY / NÃO EXECUTAR PATCH.**

Este pacote consolida artefatos reais recuperados da execução GitHub Actions
[41252304361](https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/41252304361)
de 31/10/2026, e os compara com os 27 HEADs verificados individualmente no GitHub.

- Snapshot antigo: 23 branches de origem e main `6c62bb6`.
- Snapshot atual: 26 branches de origem e main `e9f7fe6`.
- Entre os 24 refs antigos (main + 23 fontes): 22 estáveis, 2 movidos (main e plan/pmokernel).
- Três refs novos: auditoria Wave 1, revert da PR #26 e integração estrutural.
- O snapshot antigo encontrou **118 colisões**, 57 candidatas equivalentes e
  61 exigindo revisão; esses números não são uma recontagem do estado atual.
- PMO histórico: 28 eventos distintos candidatos, 2 colisões de seq e 2 WOs contestadas;
  nenhum estado foi automaticamente eleito.
- `historical-collision-backlog.csv`: 61 colisões históricas pendentes de revalidação
  (mapeamentos para WO são candidatos, nunca admissões).
- `evidence/`: resultados originais extraídos do GitHub Actions, sem modificações;
  hashes em `wave6-delta-readonly.json`.

## Limitações obrigatórias

1. O checkout integral atual não pôde ser obtido neste ambiente por falha de DNS
   para github.com. Assim, o audit `scripts/audit-main-migration.mjs` NÃO foi
   reexecutado na população atual das 27 refs.
2. A auditoria anterior pode ser usada como evidência histórica verificável,
   mas seus 118 conflitos, 10.796 paths e as 57 equivalências são do baseline
   antigo. Mudanças em main e em uma branch fonte alteram a reconciliação.
3. Não alterar `registers/governance/main-migration-scope.v1.json` ou PMO,
   não efetuar merge ou DDL, nem registrar admissão do Kernel sem comprovante assinado.
4. Em checkout confiável com refs completos: executar primeiro o auditor original
   e em seguida o utilitário Wave 5. Checar refs antes/depois e validar o resultado
   contra esta evidência histórica. Somente a saída dessa execução pode demonstrar
   cobertura atual de blobs.

Nenhum commit, merge, DDL ou deploy realizado para gerar este pacote.

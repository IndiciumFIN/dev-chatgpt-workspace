# CE — Wave 1 — Auditoria integral das árvores Git (26 branches)

**Resultado:** verificação recursiva 26/26, 0 respostas truncadas, 26 refs rechecadas sem drift. **Código remoto e Supabase não alterados.**

Fonte de base: `integration/structural-overlay-20261101` no SHA `081c61ac6c6ea674934d1cad3c310e96476fc9a1` (2.246 itens Git não diretórios).

## Matriz de reconciliação contra a integração

| Branch | Itens | Exclusivos da origem | Exclusivos da integração | Idênticos | Colisões |
|---|---:|---:|---:|---:|---:|
| `main` | 1.877 | 0 | 369 | 1.838 | 39 |
| `archivamento` | 1.760 | 0 | 486 | 1.708 | 52 |
| `audit-hardening-2026-10-24` | 1.733 | 0 | 513 | 1.678 | 55 |
| `backup/research-hub-complete-20261026` | 1.797 | 28 | 477 | 1.715 | 54 |
| `feat/career-youth-db-first-20261026` | 1.824 | 50 | 472 | 1.720 | 54 |
| `feat/curiosidades-mem-87-20261026` | 1.876 | 7 | 377 | 1.818 | 51 |
| `feat/projection-unica-f0-suite-real` | 8.847 | 8.566 | 1.965 | 202 | 79 |
| `feat/research-hub-governed-20261026` | 1.768 | 7 | 485 | 1.712 | 49 |
| `feat/research-participation-layer-20261026` | 1.785 | 16 | 477 | 1.715 | 54 |
| `fix/governed-activities-cli-20261026` | 1.810 | 19 | 455 | 1.744 | 47 |
| `fix/shell-consolidation` | 1.762 | 0 | 484 | 1.709 | 53 |
| `grook_10_26` | 305 | 123 | 2.064 | 112 | 70 |
| `idioma/consolidado-19` | 2.985 | 1.106 | 367 | 1.763 | 116 |
| `idioma/de-v1` | 1.895 | 16 | 367 | 1.765 | 114 |
| `idioma/pt-PT-v1` | 1.895 | 73 | 424 | 1.765 | 57 |
| `implementation-governed-ecosystem` | 1.792 | 1 | 455 | 1.737 | 54 |
| `import/drive-cko-nurseos-20261026` | 1.997 | 236 | 485 | 1.712 | 49 |
| `integration/structural-overlay-20261101` | 2.246 | 0 | 0 | 2.246 | 0 |
| `plan/pmokernel-finalization-20261031` | 1.884 | 7 | 369 | 1.835 | 42 |
| `planning` | 1.760 | 0 | 486 | 1.708 | 52 |
| `preview/central-comando-20261026` | 1.836 | 14 | 424 | 1.766 | 56 |
| `revert-26-plan/pmokernel-finalization-20261031` | 1.761 | 0 | 485 | 1.712 | 49 |
| `simulados-enfermagem-db-canonico` | 1.801 | 21 | 466 | 1.733 | 47 |
| `staging/bibliotecas-corpus-20261026` | 1.865 | 105 | 486 | 1.711 | 49 |
| `viladocuidado` | 1.786 | 5 | 465 | 1.731 | 50 |
| `work/editorial-canonical-learning-20261026` | 1.797 | 30 | 479 | 1.713 | 54 |

**Definições:** “exclusivos da origem” são caminhos apenas na branch comparada; “exclusivos da integração”, caminhos apenas no overlay; “colisão” indica SHA, modo ou tipo diferente no mesmo caminho; “idênticos”, mesma identidade de árvore. Os valores são contagens por comparação e **não** representam total de caminhos únicos entre todas as branches.

## Diagnóstico base-first

- `schemas/`: mesma árvore Git nas 23 branches em que a pasta existe; 3 outras não possuem a pasta.
- `migrations/`: 10 subárvores distintas inspecionadas recursivamente e nenhuma colisão por mesmo caminho/versão de blob. Persistem migrações com ordinal `0004` de origens diferentes e modelos alternativos de admissão (`kernel_order` nas duas branches sem ancestral).
- `contracts/`: 7 versões de subárvore, 739 caminhos distintos, quatro colisões: `entities/brand-assets.v1.json`, `entities/routes.v1.json`, `cko-governance/opa/kernel_admission.rego`, `cko-governance/opa/kernel_admission_test.rego`.
- Catálogo de rotas: main contém 25 itens; MEM 26; i18n 26; integração 31. Regenerar a partir do conjunto efetivo de rotas e contratos.
- Banco Supabase `Calculadoras-Smart`: 160 tabelas nas cinco áreas CKO examinadas; 12 tabelas de referência existentes, 8 candidatas de WO/Kernel ainda ausentes. Sem DDL nesta rodada.

## Verificações e limites

- Comparação full-tree Git concluída por API, sem clone Git local. Não é uma revisão semântica completa nem comprova a precisão clínica ou editorial.
- A comparação foi feita **de cada branch para a integração**, não par a par entre todas as branches.
- Arquivos LFS externos, se existirem, não foram inspecionados separadamente.
- Integridade do pacote v0.6.4: PASS; 37/37 testes Node PASS; instalador `--apply` rejeitado (exit 2).
- Admissão de Kernel não verificada; main desprotegida; merge e deployment permanecem HOLD.

## Sequência seguinte

1. Registrar esta auditoria e preservar hashes de origem; solucionar quatro conflitos de contrato.
2. Reconciliar o modelo legado `kernel_order` com as oito tabelas candidatas CKO sem criar autoridade paralela.
3. Testar migrações de Carreira/Pesquisa e as já existentes (Simulados/Vila/OPA) em PostgreSQL descartável e com políticas/RLS apropriadas.
4. Submeter WOs e gates reais ao Kernel, executar CI completa no SHA resultante e revisão independente.
5. Separar admissão de commit em branch candidata de eventual promoção à `main`; proteger a main antes do merge.

**Gates atuais:** `AUDIT_PASS / ADMISSION_NOT_VERIFIED / REMOTE_CODE_UNCHANGED / MERGE_HOLD`.

Referência: https://github.com/IndiciumFIN/dev-chatgpt-workspace/issues/25

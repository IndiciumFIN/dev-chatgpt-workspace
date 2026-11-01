# CE — Reconciliação estrutural Wave 1 — 01/11/2026

**Estado:** AUDITORIA CANDIDATA / HOLD_HUMAN. **Nenhum commit, merge, DDL, ou deploy foi executado nesta rodada.**

## Fontes e limites

- Repo: https://github.com/IndiciumFIN/dev-chatgpt-workspace
- Branch candidata: `integration/structural-overlay-20261101` no SHA `081c61ac6c6ea674934d1cad3c310e96476fc9a1`.
- `main` no SHA `e9f7fe66075ebe5d7346072dc3a1b4934678c6de`; proteção da branch desativada.
- Inspecionadas as **26 árvores Git raiz** via GitHub; analisados recursivamente os **10 diretórios únicos de migrations/** e **7 diretórios únicos de contracts/**. Isto não representa a auditoria full-tree de todas as pastas das 26 branches.
- Dados estruturais do projeto Supabase `Calculadoras-Smart`: consultas somente leitura de schemas, colunas e privilégios.

## Achados por camada

| Camada | Resultado confirmado | Decisão |
| --- | --- | --- |
| `schemas/` | 23 branches com o mesmo SHA de árvore `cfe5d48cdd0a432dcba5f1859e7b4e0912a02408`; 3 branches sem a pasta | Reutilizar, sem reimplementação |
| `migrations/` | 10 árvores distintas; comparação recursiva não achou mesmo caminho com blobs divergentes | Não confundir ausência de colisão de arquivo com compatibilidade SQL |
| `contracts/` | 7 árvores distintas, 739 caminhos; **4 caminhos** com hashes de conteúdo diferentes | Resolver versões, não usar merge cego |
| Banco CKO | 160 tabelas, 160 com PK e 175 FKs, RLS habilitada em 3 | Reusar estruturas e validar proteção efetiva |
| Admissão | 12 tabelas de referência presentes; 8 candidatas não presentes | Nenhum DDL sem Kernel |

### Quatro colisões materiais em contracts/

1. `entities/brand-assets.v1.json` — duas versões.
2. `entities/routes.v1.json` — quatro versões: 25 rotas na main, 26 nas branches MEM/i18n, 31 na integração. **Regenerar do inventário real de rotas** após reconciliar as dependências, não simplesmente escolher o maior arquivo.
3. `cko-governance/opa/kernel_admission.rego` — três versões (história independente, i18n e integração), com regras de aceitação distintas.
4. `cko-governance/opa/kernel_admission_test.rego` — duas versões; precisa acompanhar a política eleita.

### Migrações sem colisão de caminho, mas com dependências

- A integração já contém **candidatos** de governança/OPA, Simulados e Vila.
- Carreira e Pesquisa têm migrações candidatas próprias ainda fora da integração. Não aplicar sem validar dependências e executor.
- Existem migrações com prefixo `0004` para domínios distintos: numerais iguais não autorizam assumir mesma ordem ou que pertencem ao mesmo runner.
- Duas branches **sem ancestral comum** contêm `migrations/0027_kernel_admission.sql` com tabelas `kernel_order`, `kernel_order_policy`, `kernel_validator`, `kernel_manifest`. Essa arquitetura difere dos oito objetos candidatos `cko_orch.*`/`cko_governance.*`. Exige crosswalk e decisão de autoridade **antes** de criar novas tabelas.

## Testes executados novamente

- Integridade dos 35 arquivos: PASS.
- Suíte Node dos scripts de governança: **37/37 PASS**.
- Gate estrutural local: `SNAPSHOT_VALID_HOLD` (não é autorização de promoção).
- Teste de rejeição do instalador: `--apply --work-order WO-PMO-001` → `EXTERNAL_KERNEL_ADMISSION_VERIFIER_NOT_CONFIGURED:LOCAL_WRITE_DENIED` (exit 2).

## Próxima ordem de execução

1. Verificar WO/Kernel e política **real** para o escopo exato dos arquivos/SHAs; não aceitar texto de issue como assinatura.
2. Reconciliar as quatro colisões de `contracts/`, com testes negativos de política e reconciliação das rotas geradas.
3. Executar a auditoria **full-tree** no checkout Git integral e comparar 26 refs antes/depois; sem essa prova, não alegar cobertura integral de blobs.
4. Reconciliar modelos `kernel_order` vs CKO e migrations de Carreira/Pesquisa, preservando um único modelo de autoridade. Validar PostgreSQL descartável.
5. Com admissão assinada e gates testados, preparar commit atômico somente na branch candidata, depois CI completo e revisão independente.
6. Somente então avaliar separadamente proteção da main, merge e deploy; homologação clínica permanece independente.

**Links de controle:** [Issue #25](https://github.com/IndiciumFIN/dev-chatgpt-workspace/issues/25) · [PR #30](https://github.com/IndiciumFIN/dev-chatgpt-workspace/pull/30).

**Status final:** `BASE_FIRST_AUDIT_DONE_PARTIAL_SCOPE / KERNEL_ADMISSION_NOT_VERIFIED / REMOTE_CODE_UNCHANGED / MERGE_HOLD`.

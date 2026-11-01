# CE — Continuidade aplicada, preservação canônica (01/11/2026)

**Branch candidata**: `canonical/local-20261101` / PR #32 (DRAFT/HOLD), base `8503b67fec3dd428cd47b31a8dfd2361672e5647`. Não autoriza merge, deploy, SQL em produção nem publicação clínica.

Os 29 HEADs foram reencontrados. A comparação full-tree R12 foi realizada antes desta operação; não equivale a uma nova auditoria de todos os blobs. O crosswalk identifica SHA, caminho, owner candidato, origem, aliases e estado.

- 57 pares de contratos CKO com SHA idêntico: `contracts/cko-schemas/` indicado como origem de autoria **candidata**, `src/data/contracts/cko-schemas/` espelho de compatibilidade. Nenhuma mudança de imports ou admissão clínica.
- 31 schemas de carreira e nove de pesquisa/participação já existem em `_archive/schemas/` com blobs idênticos aos de branches de origem. Evitar cópias.
- 12 templates UI, oito perfis, registries de biblioteca inventariados separadamente; não se somam como templates homologados.
- Três variantes de Registry da branch de projeção são `SOURCE_ONLY_HOLD` porque suas escritas não estão reconciliadas ao Kernel.
- Registro histórico saneado contém nove hashes e seis deltas. ZIP original privado verificado por SHA-256 `601aac72a8859d37762cb0a5984a8d01d30e811c3d883942569bf6e7de936888`; os TAR SHA-256 têm origem em auditoria anterior, sem novo recálculo.
- Índices históricos integrais de 55.033 e 2.307 linhas seguem preservados no pacote privado, com hashes no JSON; não publicados em repositório público antes de auditoria de conteúdo sensível.
- O verificador é apenas integridade de Git blobs e estado de HOLD. Não substitui a cadeia FIND → política → validador → TASK → WO → Kernel → testes/auditoria → homologação.

**Pendências mantidas:** 67 lacunas do dicionário, 10 colisões de migrations, replay 0040, assinatura OPA, $ref semânticos e CI completo. Reutilizar `audit/ce-continuity/P1_DB_DICTIONARY_AND_MIGRATION_GAPS_20261101.md`.

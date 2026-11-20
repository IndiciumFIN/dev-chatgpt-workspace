# CE W2.4 — auditoria integral dos arquivos de 23 branches órfãs

**20/11/2026.** Baseline da `main` congelado em `80d5e19778b90d69c621eea381a152fbcd7e9912`, tree `da0a511a58a7a8204a2848f31a2c5fd6ace99154`. O inventário W2 antigo é preservado como snapshot de comparação de raiz, sem alterar seu SHA.

## Resultado com prova

**23/23 (100%) branches órfãs enumeradas por arquivo**, agrupadas em **22 árvores de origem distintas**. A árvore recursiva de cada origem retornou `truncated=false`, incluindo `fix/pendencias-camadas-20261101` com 16.895 entradas recursivas. A união de arquivos não-tree foi comparada com a `main` fixada por SHA de objeto Git e modo, em [seis manifestos de lote](../../registers/governance/ce-w2-4-orphan-full-file-index-20261120.v1.json) verificados por testes adversariais. A branch `planning` reutiliza a evidência Git de `archivamento`.

| Comparação (ocorrências nas 22 origens, não arquivos globais únicos) | Contagem |
| --- | ---: |
| E — conteúdo e modo idênticos | 36.591 |
| D — bytes divergentes | 2.579 |
| S — apenas origem | 23.335 |
| C — apenas main | 25.317 |
| T — tipo ou modo divergente | 4.637 |
| Potenciais conflitos diretório vs arquivo | 0 |

**Governança:** `FULL_DELTA_INVENTORIED` alcançado para as 23 origens órfãs, porém `TRIAGED=false`, `INTEGRATED_OR_DISPOSED=false`, `INDEPENDENTLY_VERIFIED=false`, **0/48 SEALED**. A enumeração de caminhos não satisfaz licença, responsabilidade clínica ou prova de equivalência semântica; não há autorização de merge, execução de SQL ou deploy.

## Fila inicial orientativa (menor S+D+T)

| Branch | Arquivos S+D+T | Conflitos arquivo/diretório |
| --- | ---: | ---: |
| `grook_10_26` | 47 | 0 |
| `fix/ce-route-component-contract-freshness-20261114` | 56 | 0 |
| `fix/ce-generated-contract-fresh-20261115` | 57 | 0 |
| `review/grook-na-main` | 74 | 0 |
| `canonical/supabase-skeleton-20261101` | 220 | 0 |
| `fix/ce-admin-e2e-hierarchy-20261101` | 398 | 0 |
| `integration/structural-overlay-20261101` | 398 | 0 |
| `audit-hardening-2026-10-24` | 421 | 0 |

A fila serve apenas para dimensionar trabalho por caminho. Prioridade efetiva de risco considera autorização, Kernel/OPA, migrations, segurança, conteúdo clínico e direitos, independentemente do volume.

## Próximas fases para `SEALED`

1. Não repetir a varredura íntegra enquanto o SHA da origem e a evidência não mudarem; utilizar index e manifestos como origem controlada para revisão por item.
2. Classificar individualmente S/D/T, comprovar tratamento dos E e retenção dos C, direitos, destino, versão, hashes e WO/FIND.
3. Cruzar contratos com Supabase Calculadoras-Smart, evidências Drive privadas e normativos oficiais, sem publicar identificadores sensíveis nem executar DDL/DML.
4. Integrar apenas objetos seguros na `main` em lotes pequenos, testes/CI sobre o SHA final, revisão independente e plano de reversão.
5. Somente após os gates da norma CE.BRANCH.CLOSURE.v1 atualizar `SEALED` e `no_revisit=true`. Não apagar branches apenas por serem antigas.

**Registro:** [índice W2.4](../../registers/governance/ce-w2-4-orphan-full-file-index-20261120.v1.json) / [teste de cobertura](../../scripts/ce-w2-4-orphan-full-file-index.test.mjs). O W2 antigo conserva seus percentuais históricos. 

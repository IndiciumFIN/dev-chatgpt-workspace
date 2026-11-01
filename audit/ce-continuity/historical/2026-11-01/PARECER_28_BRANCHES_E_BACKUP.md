# Parecer cumulativo de reconciliação — CE / 28 branches

**Data-base:** 2026-11-01. **Estado:** `CANDIDATE_AUDIT_ONLY / HOLD_HUMAN / NO_MERGE / NO_DB_WRITE`.

## Escopo e método

- Inventário integral do TAR `sandbox-canonico-completo.tar.gz`: **16.433 arquivos regulares**, 318.419.740 bytes descompactados, sem caminhos inseguros.
- SHA-256 para comparação com o backup `sandbox-completo (2).tar.gz`: **10.687 adicionados, 90 alterados, zero removidos, 5.656 idênticos**.
- SHA-1 no formato Git blob para os **16.433 arquivos** do TAR; confronto com cada uma das **28 Git trees recursivas** no GitHub, sem truncamento. Os SHAs das 28 branches estão na matriz CSV.
- Comparação de **cada branch com `main`** por caminhos/SHAs, e de **cada branch com o TAR** por caminho/hash (idêntico, alterado, ausente), verificando ainda se arquivos ausentes do caminho têm o mesmo blob em outra pasta do TAR.
- Foram comparados por hash os **57 SQL** nos caminhos de migrations entre o TAR e todas as branches: nos caminhos presentes em cada branch, todos os hashes corresponderam ao TAR, sem colisão nessa família.
- Limite de interpretação: Git tree comprova conteúdo versionado, **não** execução, aprovação clínica, migração aplicada, implantação em Vercel nem licença.

## Resumo da reconciliação

| Métrica | Resultado |
|---|---:|
| Arquivos no TAR | 16.433 |
| Git branches auditadas | 28/28 |
| Git trees truncadas | 0 |
| Arquivos iguais à versão anterior | 5.656 |
| Arquivos novos versus anterior | 10.687 |
| Arquivos modificados versus anterior | 90 |
| Arquivos removidos versus anterior | 0 |
| Corpus `artifacts/fonte` coincidente com `feat/projection-unica-f0-suite-real` | 8.254/8.254 |
| Importação Drive coincidente com `import/drive-cko-nurseos-20261026` | 230/236 |
| Arquivos editoriais coincidentes com `staging/bibliotecas-corpus-20261026` | 105/105 |
| Migrations SQL do pacote | 57 (todas presentes nas árvores auditadas, quando o caminho existe, com mesmo hash) |
| Esqueleto `src/families` no TAR | 865 (não versionado nos caminhos correspondentes em nenhuma branch) |
| Núcleo `src/core/experience` no TAR | 5 (não versionado nos caminhos correspondentes em nenhuma branch) |

## Tabela exaustiva — todas as 28 branches

Colunas: **Git** = arquivos da branch; **=main** = mesmo caminho/mesmo blob da `main`; **+main** = caminhos exclusivos da branch em relação à `main`; **=TAR** = mesmo caminho/mesmo blob do TAR; **ΔTAR** = mesmo caminho, blob divergente; **fora-TAR** = caminho da branch não existe no TAR; **conteúdo realocado** = caso anterior cujo blob existe noutro caminho do TAR; **sem blob no TAR*** = caso anterior cujo conteúdo não existe em nenhuma pasta do TAR (não inclui versões divergentes em mesmo caminho).

| Branch | SHA | Git | =main | +main | =TAR | ΔTAR | fora-TAR | realocados | sem blob* |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `main` | `e9f7fe66` | 1.877 | 1.877 | 0 | 708 | 80 | 1.089 | 1.061 | 28 |
| `archivamento` | `87c537fe` | 1.760 | 1.728 | 0 | 611 | 78 | 1.071 | 1.042 | 29 |
| `audit-hardening-2026-10-24` | `9c9ca464` | 1.733 | 1.697 | 0 | 588 | 78 | 1.067 | 1.038 | 29 |
| `audit/ce-wave1-evidence-20261101` | `e6fc8f01` | 1.924 | 1.877 | 47 | 755 | 80 | 1.089 | 1.061 | 28 |
| `backup/research-hub-complete-20261026` | `4204f3cb` | 1.797 | 1.744 | 36 | 625 | 87 | 1.085 | 1.057 | 28 |
| `feat/career-youth-db-first-20261026` | `ad4c6838` | 1.824 | 1.743 | 63 | 629 | 82 | 1.113 | 1.085 | 28 |
| `feat/curiosidades-mem-87-20261026` | `4131831b` | 1.876 | 1.741 | 115 | 717 | 84 | 1.075 | 1.047 | 28 |
| `feat/projection-unica-f0-suite-real` | `6d712dd4` | 8.847 | 204 | 8.568 | 8.567 | 66 | 214 | 184 | 30 |
| `feat/research-hub-governed-20261026` | `01574c5b` | 1.768 | 1.749 | 7 | 619 | 77 | 1.072 | 1.044 | 28 |
| `feat/research-participation-layer-20261026` | `53f896fd` | 1.785 | 1.744 | 24 | 619 | 81 | 1.085 | 1.057 | 28 |
| `fix/governed-activities-cli-20261026` | `95a416c1` | 1.810 | 1.753 | 47 | 638 | 86 | 1.086 | 1.057 | 29 |
| `fix/shell-consolidation` | `c68e3009` | 1.762 | 1.727 | 2 | 612 | 79 | 1.071 | 1.042 | 29 |
| `grook_10_26` | `eb2d4792` | 305 | 115 | 123 | 209 | 68 | 28 | 1 | 27 |
| `idioma/consolidado-19` | `a325db74` | 2.985 | 1.719 | 1.225 | 667 | 87 | 2.231 | 2.142 | 89 |
| `idioma/de-v1` | `9a12fad8` | 1.895 | 1.724 | 135 | 665 | 88 | 1.142 | 1.051 | 91 |
| `idioma/pt-PT-v1` | `314199bc` | 1.895 | 1.724 | 135 | 665 | 88 | 1.142 | 1.110 | 32 |
| `implementation-governed-ecosystem` | `e16f0fb6` | 1.792 | 1.728 | 32 | 636 | 80 | 1.076 | 1.043 | 33 |
| `import/drive-cko-nurseos-20261026` | `cd851c4c` | 1.997 | 1.749 | 236 | 842 | 77 | 1.078 | 1.044 | 34 |
| `integration/structural-overlay-20261101` | `621f73b5` | 2.332 | 1.835 | 455 | 1.028 | 122 | 1.182 | 1.137 | 45 |
| `plan/ce-reconciliacao-v6-20261101` | `e162ae06` | 1.891 | 1.868 | 14 | 711 | 84 | 1.096 | 1.061 | 35 |
| `plan/pmokernel-finalization-20261031` | `57242ec5` | 1.884 | 1.874 | 7 | 712 | 83 | 1.089 | 1.061 | 28 |
| `planning` | `87c537fe` | 1.760 | 1.728 | 0 | 611 | 78 | 1.071 | 1.042 | 29 |
| `preview/central-comando-20261026` | `3f004049` | 1.836 | 1.723 | 76 | 666 | 87 | 1.083 | 1.051 | 32 |
| `revert-26-plan/pmokernel-finalization-20261031` | `bfcb0333` | 1.761 | 1.749 | 0 | 612 | 77 | 1.072 | 1.044 | 28 |
| `simulados-enfermagem-db-canonico` | `415a02a8` | 1.801 | 1.752 | 40 | 649 | 77 | 1.075 | 1.047 | 28 |
| `staging/bibliotecas-corpus-20261026` | `d81736c7` | 1.865 | 1.735 | 105 | 717 | 77 | 1.071 | 1.043 | 28 |
| `viladocuidado` | `f0d5579c` | 1.786 | 1.749 | 25 | 625 | 84 | 1.077 | 1.049 | 28 |
| `work/editorial-canonical-learning-20261026` | `38a33fce` | 1.797 | 1.748 | 36 | 626 | 81 | 1.090 | 1.061 | 29 |

**Nota sobre a coluna “sem blob*”:** é a diferença `fora-TAR − realocados`. Ela não conta as versões de arquivos que existem no mesmo caminho mas apresentam SHA diferente. Portanto, **não representa todo o conteúdo distinto entre Git e TAR**. O total por branch também inclui arquivos de histórico, contratos e evidências, não necessariamente funcionalidades operacionais.

## Achados específicos confirmados

### A. Patrimônio de arquivos preservado, mas ainda não promovido

- Os **8.254 arquivos** de `artifacts/fonte` apresentam a **mesma árvore Git SHA-1** que `feat/projection-unica-f0-suite-real`: `b4be52b8f1a3807dacea23ef07ce57c6c9d2c078`. Isso prova integridade de conteúdo, não liberação editorial.
- Os **105 arquivos** de `bibliotecas-corpus` estão idênticos aos da branch `staging/bibliotecas-corpus-20261026`.
- Os **230 arquivos** de `imports/drive-snapshots` estão idênticos aos da branch de importação.
- O conteúdo dos 865 arquivos de `src/families` e dos cinco módulos `src/core/experience` está no TAR, mas **não está versionado nesses caminhos em nenhuma das 28 branches consultadas**. Reaproveitar não implica ativar seus serviços candidatos.

### B. Seis contratos JSONC ainda exclusivos da branch de importação

Na árvore `import/drive-cko-nurseos-20261026`, a pasta `imports/drive-snapshots/2026-10-26/nurseos-kernel/Workflows-NK-Guard/` possui seis `.jsonc` não encontrados no TAR: `DictionaryTerm`, `ExtractionRun`, `NormAtom`, `NormDocument`, `NormSource`, `ServiceOrder`. Não foram perdidos: **continuam no Git**. Recuperar apenas sob o processo canônico de proveniência.

### C. Conflitos de versão e autoridade

- A `main` tem **708** hashes iguais no mesmo caminho, **80** diferentes no mesmo caminho, e **1.089** caminhos ausentes do TAR. Destes 1.089, **1.061** têm blob idêntico em outra pasta; os **28 restantes são somente os casos de caminho ausente e blob sem cópia**, não contando os 80 de versão divergente.
- A candidata `integration/structural-overlay-20261101` tem **1.028** no mesmo caminho/mesmo hash; **122** divergências de hash; **1.182** caminhos ausentes do TAR, dos quais **1.137** apresentam conteúdo idêntico em outra pasta.
- A branch `idioma/consolidado-19` apresenta **87** divergências de hash nos mesmos caminhos e **89** casos de arquivo sem caminho equivalente nem blob em outra pasta (sem considerar os 87 divergentes). A alemã `idioma/de-v1` registra **91** casos nessa classe.
- `archivamento` e `planning` apontam para o **mesmo commit** `87c537fe...`; duplicação de branch não significa conteúdo perdido.
- As branches `feat/projection-unica-f0-suite-real` e `grook_10_26` não possuem ancestral comum com a `main` no endpoint de comparação Git usado anteriormente. Exigem cherry-pick/cópia seletiva em candidata auditada, não merge histórico indiscriminado.

### D. Evidência mais recente do GitHub não está toda no TAR

A PR #30 está aberta na branch de integração, com HEAD consultado `621f73b5...` e **497 arquivos alterados**. Nessa branch foram lidos diretamente:

- [`Wave 8 — auditoria canônica`](https://github.com/IndiciumFIN/dev-chatgpt-workspace/blob/integration/structural-overlay-20261101/audit/ce-wave1/CE_WAVE8_AUDITORIA_CANONICA_20261101.md): snapshot anterior de 146 colisões; zero aprovações formais.
- [`Wave 9 — Kernel fail-closed`](https://github.com/IndiciumFIN/dev-chatgpt-workspace/blob/integration/structural-overlay-20261101/audit/ce-wave1/CE_WAVE9_KERNEL_FAIL_CLOSED_20261101.md): bloqueio de assinaturas falsas, de admissão/execução não verificadas e revisão OPA; não significa verificador externo configurado.
- [`Wave 10 — Kernel/DB`](https://github.com/IndiciumFIN/dev-chatgpt-workspace/blob/integration/structural-overlay-20261101/audit/ce-wave1/CE_WAVE10_KERNEL_DB_CONTRACT_RECONCILIATION_20261101.md): o relatório do runtime do CI no snapshot da execução descreve **149 colisões** (57 equivalências semânticas candidatas, **92 não equivalentes**), 521 paths de hash duplicado, 10.929 paths pendentes distintos e **zero aprovações formais**; 8.250 páginas candidatas, zero licenças comprovadas, 44 problemas estruturais e 590 textos vazios.

Esses são **resultados declarados e registrados nos relatórios de CI GitHub da candidata**, não nova execução local independente de todo o pipeline. O HEAD de planejamento pode avançar; toda promoção requer recálculo com SHAs congelados.

### E. Banco e catálogos preservados em perspectiva

- O TAR contém **57 migrations SQL**, incluindo metamodelo, dicionário e geração de tabelas; o registro anterior do Supabase Calculadoras-Smart tinha **487 tabelas, 49 views e 240 migrations registradas** em leitura direta. São universos diferentes, não numeradores equivalentes.
- A migration `0043_listas_viram_tabelas.sql` normaliza listas anteriormente representadas em arrays para tabelas-filhas. Sua presença no TAR não comprova execução no Supabase.
- O relatório `audit-report.json` contido no TAR ainda mostra **20/21** cenários aprovados e falha `MST-04`, geração de contratos. Isso é um snapshot do pacote, não o resultado atualizado do CI remoto.
- O TAR inclui o arquivo `.env` (40 bytes), cujo conteúdo **não foi exposto** nesta auditoria. Precisa de revisão de segredos antes de compartilhar/publicar; Git não deve incorporar valores sensíveis.
- `artifacts/pendencias.txt` reporta **7.045 pendências brutas** em categorias heterogêneas; o PMO anterior registrou **137 tarefas** e o snapshot de operação traz outras contagens. Não somar ou converter automaticamente esses objetos em novas tarefas.

## Parecer de reconciliação

**Resultado:** `RECOVERY_SUBSTANTIAL / HISTORY_DIVERGENT / RELEASE_HOLD`. O backup é um corpus de união e recuperação, **não uma branch pronta**. Nenhuma das 28 árvores Git é idêntica ao backup integral. A matriz demonstra reaproveitamento amplo, mas ainda diferenças de conteúdo, componentes locais candidatos e requisitos de licenciamento, Kernel e evidência.

**Próxima execução dentro das WOs existentes:** (i) pinagem do snapshot Git e matriz de 149 colisões atualizada; (ii) resolver a autoridade das diferenças P0 entre contratos/OPA/Kernel e source; (iii) vincular `src/families` e os cinco módulos de experiência a contratos e serviços reais sem reintroduzir variantes paralelas; (iv) verificar seis JSONC de NK-Guard; (v) executar testes negativos, gates e validação clínica; (vi) liberar merge seletivo somente com admissão criptoverificável e revisão humana.

**Não executado:** merge, commits, mudança no banco, deploy, publicação clínica ou resolução automática de conflitos.
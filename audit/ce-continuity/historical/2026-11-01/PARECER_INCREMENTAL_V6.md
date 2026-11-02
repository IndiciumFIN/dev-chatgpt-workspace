# CE — Parecer incremental do sandbox v6

**Pacotes confrontados:** `sandbox-completo (1).tar.gz` (v5) e `sandbox-completo (2).tar.gz` (v6).  
**Método:** leitura direta dos dois TARs, SHA-256 individual dos arquivos regulares, comparação de JSON, inspeção estática de scripts, validações independentes dos dados, cotejo nominal de caminhos na `main` e na branch `integration/structural-overlay-20261101`.

## Escopo e continuidade
Este documento complementa a auditoria anterior das demais pastas, arquivo `_archive/`, catálogo de 410 serviços, 83 ferramentas, bibliotecas, 137 tarefas históricas do PMO, Supabase e repositórios. **Não cria fila de demandas** nem substitui esses inventários. A comparação é do pacote local: não houve publicação, execução de script de reconciliação, merge ou alteração no banco.

## Delta físico comprovado
- v5: 5.768 arquivos regulares; v6: 5.746.
- **2 arquivos novos**: `scripts/check-enum-conformity.mjs`, `scripts/reconcile-all.py`.
- **15 arquivos modificados**: nove registros de auditoria dentro de `audit/registers/`, registro do gate `audit/execution/execution-gates-latest.json`, script do agregador `scripts/audit-execution-gates.mjs`, duas entidades (`tool-sources.v1.json`, `tool-bindings.v1.json`), dois registros adicionais (`surface-binding-register.v2.json`, `find-register.v1.json`), (ver CSV para a lista exata).
- **24 removidos**: todos sob `tool-results/`, sem cópia idêntica em v6; ainda presentes no backup anterior. **Não concluir que não houve perda de evidências**: essas saídas precisam ficar recuperáveis na cadeia de auditoria original.
- **5.729 idênticos** por caminho e SHA-256; `_archive/` (1.445), `upload/` (927), `public/` (614) e migrations (11) sem mudança.

## Alterações semânticas
1. **22 fontes** mantidas; `source_type` recodificado de tipos originais (e.g. NORMATIVA, MANUAL) para valores padronizados. **22/22** `sha256` substituídos de 64 zeros por `NOT_AVAILABLE`; **22/22** continuam com `snapshot_ref=PENDING_SNAPSHOT`. Isso não estabelece integridade.
2. **1.031 bindings** mantidos; **1.031** decisões novas/convertidas para `HOLD` (antes: 619 `BOUND`, 412 sem decisão). Todos continuam com `status=EVIDENCE_BOUND`; **1.031/1.031** sem `validator_ids` e sem `evidence_bundle_ids`; 416 sem `source_ids`.
3. Autoridade recodificada: 609 `CLINICAL`→`CLINICAL_EVIDENCE`; 6 `TECHNICAL`→`TECHNICAL_STANDARD`; 4 `INTERNAL_CONFIG`→`INTERNAL_NONCLINICAL`; **412 classes ausentes imputadas como `INTERNAL_NONCLINICAL`**. Há campos clínicos de Aldrete, Braden e Morse nesse grupo. Isso é classificação não fundamentada, não aprovação.
4. Valores de tipos de fontes sem equivalência automática segura: parecer do CFM e publicação OMS são rotulados `OFFICIAL_LAW`; página do Calendário Nacional de Vacinação como `DATASET_API`. Necessário cotejo com ontologia/terminologia e tipo da fonte, não mera tabela de tradução.
5. Um novo finding `FIND-CTR-010` foi adicionado ao `src/data/registers/governance/find-register.v1.json`, levando 8→9. Seu registro usa `id` enquanto os oito existentes usam `canonical_id`; três caminhos de evidência não resolvem diretamente na árvore atual, embora PDF e HTML estejam localizáveis no ZIP interno `upload/comparacao-ce-2026-11-01 (2).zip`. O código `WO-CKO-COFEN-001` é citado na fila PMO ativa, mas a relação específica com Aldrete exige validação. A divergência clínica 8 versus 9 pontos **não foi homologada neste diagnóstico**.
6. Novo gate `scripts/check-enum-conformity.mjs` confirma somente se tipos/decisões pertencem a conjuntos fixos e rejeita `sha256` com 64 zeros. **Não exige SHA-256 real válido, snapshot, vínculos de evidência, validators, instâncias não vazias, autorização, nem verifica se um campo é clínico**. `NOT_AVAILABLE` passa; lista vazia também passaria. Não é gate de homologação.
7. `scripts/audit-execution-gates.mjs` passou de 19 para 20 entradas no resultado, com `enum-conformity` como `PASS`; o identificador `tool-states` ainda aparece **duas vezes** (20 entradas/19 IDs distintos). Agregador ainda precisa de deduplicação.
8. `scripts/reconcile-all.py` usa diretório absoluto `/home/z/my-project`, regrava arquivos de contrato e registro, apaga symlinks quebrados e remove pastas de cache (`.tanstack`, `.vercel/output`, `tool-results`). **Não executado nesta auditoria**, pois é mutável/destrutivo e não usa admissão do Kernel; além disso, procura `registers/governance/find-register.v1.json`, enquanto o registro ativo está em `src/data/registers/governance/find-register.v1.json`, podendo criar um cadastro paralelo. Não usar como processo canônico de merge sem revisão.
9. O próprio `audit/execution/execution-gates-latest.json` continua com `releaseGate: BLOCKED`. O `audit-report.md` permanece em 20/21 cenários (MST-04 com 3 falhas de frescor). Não há comprovação de homologação visual/E2E/produção nova.
10. O backup contém um `.env` com atribuições não vazias; seus valores não foram exibidos, reproduzidos ou incluídos nos relatórios. Revisar antes de compartilhar/publicar arquivos compactados.

## Repositório
Foram verificadas as rotas exatas dos dois scripts novos, dos bindings e do registro de findings na `main` e na `integration/structural-overlay-20261101`: **não aparecem nesses caminhos nas refs consultadas**. PR #30 permanece aberta na consulta e a presença no TAR não comprova integração remota. Isso não demonstra ausência em outras branches ou caminhos.

## Decisão
**RECUPERAÇÃO FÍSICA PRESERVADA / INTEGRAÇÃO AINDA EM HOLD.** A v6 melhora a explicitação dos bloqueios e adota vocabulário controlado, mas introduz classificações artificiais e um gate limitado que pode aprovar dados não homologados. Manter os percentuais prévios de 56% maturidade e 43% conclusão somente como estimativas históricas não recalculadas, sem declarar incremento.

## Continuidade sem nova demanda
Reconciliar esses fatos com as tarefas PMO e a cadeia FIND→política→validador→tarefa→WO→Kernel já existentes; ajustar autoridade semântica das 22 fontes e dos 416 campos imputados, preservar a relação com os snapshots históricos e validar que o gate fail-closed real verifica integridade e referência, sem novas matrizes paralelas.
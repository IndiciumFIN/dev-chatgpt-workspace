# Auditoria independente — Backup completo (3ª versão)

**Arquivo analisado:** `/mnt/data/sandbox-backup-completo (2).tar.gz`  
**Comparação:** `/mnt/data/sandbox-backup-completo (1).tar.gz`  
**Data-base:** 2026-11-01  
**Escopo:** leitura integral dos arquivos regulares do TAR, comparação SHA-256, inspeção de código, testes seletivos de módulos e verificadores, consulta pontual em GitHub. **Não** inclui homologação clínica, build integral, E2E em navegador, read-back de produção, auditoria integral de todas as branches, nem alterações remotas.

## 1. Integridade e mudança

| Métrica | v2 | v3 | Diferença |
|---|---:|---:|---:|
| Arquivos regulares | 5.203 | 5.221 | +18 |
| Entradas TAR | 6.120 | 6.139 | +19 |
| Arquivos idênticos no mesmo caminho | — | 5.180 | — |
| Arquivos alterados no mesmo caminho | — | 23 | — |
| Novos caminhos de arquivo | — | 18 | — |
| Arquivos removidos | — | 0 | — |
| Links simbólicos | 37 | 37 | 0 |
| Caminhos inseguros | 0 | 0 | 0 |

**SHA-256 do TAR v3:** `bc2e60fa2e820dc90bc12aab383ea0275d1381dfc054fef0142e2b47a0e50564`.  
**SHA-256 do TAR v2:** `146353b81ea68f52cbec25468b8c235c62fd203d5824058737895329e1829edd`.

Nenhuma alteração foi identificada em `migrations/` (11 arquivos), `src/routes/` (50 arquivos), `public/` (301 arquivos), nem na árvore `upload/` (924 arquivos); todas essas entradas são idênticas em conteúdo entre as versões. A maioria dos novos caminhos está em `src/lib/tools/` e `scripts/`.

## 2. Evoluções verificadas

1. `src/lib/db.ts`: `DB_ENABLED = true` foi substituído por `false`, alinhado com o código consultado na `main`. `getSql()` e `getPglite()` têm guardas de rejeição.
2. `scripts/audit-kernel.py`: o verificador deixa de confiar na palavra `PASS` se o processo terminou com código não zero; a decisão inicial já usa `result.returncode == 0`.
3. `src/lib/tools/tool-states.ts`: nova máquina de sete estados com `getState`/`canTransition`. O classificador identifica 83/83 ferramentas como `CANDIDATE_HOLD` nesta cópia.
4. `src/lib/tools/clinical-truth.ts`: nova função `assertClinicalTruth` que verifica existência de `sourceIds` e de algum `AuthorityBinding` com prefixo de campo para a ferramenta.
5. `src/lib/tools/consumer-recognition.ts`: nova função de reconhecimento de papel e contexto, com regras estáticas para pediatria, gestão e trabalhista.
6. `src/data/registers/canonical/*`: bindings estáticos de rotas e templates foram corrigidos; `scripts/audit-canonical-bindings.mjs` agora termina com sucesso.
7. `docs/PENDENCIAS.md`: novo documento de pendências gerado.

Essas mudanças **não implicam** autorização de publicação, validação científica, integração ao renderer nem implantação do banco.

## 3. Testes independentes executados

| Teste | Resultado |
|---|---|
| `node --experimental-strip-types --test src/lib/tools/tool-states.test.ts` | PASS 23/23 |
| `node --experimental-strip-types --test src/lib/tools/clinical-truth.test.ts` | PASS 9/9 |
| `node --experimental-strip-types --test src/lib/tools/consumer-recognition.test.ts` | PASS 13/13 |
| `node scripts/check-tool-states.mjs` | PASS: 83 `CANDIDATE_HOLD` |
| `node scripts/check-clinical-truth.mjs` | PASS com 63 placeholders tolerados |
| `node scripts/check-consumer-recognition.mjs` | PASS, mas validação incompleta |
| `node scripts/audit-canonical-bindings.mjs` | PASS |
| `node scripts/audit-surface-bindings-v2.mjs` | PASS: 50 contratos, 0 homologação visual |
| `node scripts/check-cko-packages.mjs` | **FAIL: 655 problemas no manifesto** |

O relatório incorporado `audit/execution/execution-gates-latest.json` contém 16 resultados `PASS`, 3 `PRESENT`, **dois registros com o mesmo identificador `tool-states`**, e `releaseGate: BLOCKED`. `PRESENT` não equivale à execução de build ou E2E. `check-cko-packages.mjs` não faz parte da lista de casos desse agregador.

O outro relatório (`audit-report.json`) informa 95,2% (20/21) com geração anterior à versão dos novos gates; não constitui resultado de homologação final.

## 4. Achados, severidade e propostas

### F-01 — Crítico: gate de isolamento aceita um estado proibido

**Evidência:** `scripts/check-isolation.mjs` contém a condição `if (!/const DB_ENABLED = false as const/.test(db)) ok('DB_ENABLED is true — PGLite local ativo (intencional)')`. Se o valor mudar para `true`, o próprio gate continua registrando um `PASS`. O script também usa `ok` quando `getSql()` ou `getPglite()` **resolvem**, em vez de bloquear incondicionalmente. O estado atual do módulo está com `false`, mas o guardião não é fail-closed em futuras alterações.

**Correção:** fazer `DB_ENABLED !== false` falhar; resolução de `getSql/getPglite` deve falhar; introduzir testes de mutação que comprovem erro com a chave ativada; preservar política de indisponibilidade do DB até decisão Kernel.

### F-02 — Alto: gate de consumidor não valida a implementação nova

**Evidência:** `scripts/check-consumer-recognition.mjs` lê `cr.TOOL_VISIBILITY ?? {}` mas `consumer-recognition.ts` não exporta `TOOL_VISIBILITY`. Para cada ferramenta, o fallback é `['anonymous','authenticated','subscriber','admin']`, fazendo a checagem de anonymous passar por padrão. A função real `recognizeConsumer` **não é chamada** pelo verificador. Uma chamada direta a `recognizeConsumer` bloqueia `student + educational + Apgar`, porém o gate avalia apenas o fallback global. Além disso, não foram encontradas importações funcionais deste módulo nas rotas ou componentes de renderização do backup.

**Correção:** parametrizar perfis canônicos e escopos de acesso por contrato, sem usar defaults permissivos; exercitar `recognizeConsumer` com matriz explícita; validar integrações e evitar restrições de perfis arbitrárias sem justificativa legal/UX.

### F-03 — Alto: gate de verdade clínica aceita placeholders e ignora bindings reais

**Evidência:** `scripts/check-clinical-truth.mjs` importa `catalog.ts` e `governance.ts`, porém **não executa** `assertClinicalTruth()`. O gate reporta `PASS` apesar de **63 placeholders** `SRC-CLINICAL-PENDING`/similares; não verifica `AuthorityBinding` por campo nem vínculo com bundle de evidência/validador. A implementação unitária de `assertClinicalTruth()` checa apenas presença de fonte + prefixo do binding, não verifica existência, validade, proveniência ou integridade da fonte apontada.

**Correção:** separar `STRUCTURAL_PASS`, `EVIDENCE_PENDING` e `CLINICALLY_APPROVED`. Em publicação, exigir vínculo fonte-campo-regra, apontamento verificável, auditoria clínica e decisão de autoridade; placeholders nunca podem homologar clinicamente.

### F-04 — Alto: máquina de estados ainda não bloqueia a projeção real

**Evidência:** `getState` retorna `CANDIDATE_HOLD` nas 83 ferramentas da cópia, porém não foi localizada importação do módulo nas rotas/componentes. A função recebe apenas `status`, `publicacao` e `holds`, sem `md_gate` nem decisão de admissão do Kernel. Em entrada sintética `status=RELEASED`, `publicacao=publicada`, sem holds, retorna `RELEASED` independentemente do `md_gate`.

**Correção:** acoplar ao fluxo de publicação com evidência de admissão do Kernel, `md_gate` OPEN e assinatura/versionamento; testar cenários negativos end-to-end e diferenciar estado derivado de estado autorizativo.

### F-05 — Alto: marcação de publicação contraditória persiste

**Evidência:** os 83 registros de `src/data/contracts/entities/clinical-tools.v1.json` continuam com `publicacao=publicada`, mas 77 estão em `status=CANDIDATE`; 76 têm `holds` explícitos e 63 não possuem `source_ids` no registro de entidade. Esse arquivo é **idêntico** ao da versão anterior.

**Correção:** reconciliar sinalizadores com a fonte autoritativa da publicação, sem apagar históricos; publicação deve depender da decisão válida de release, não da string `publicada` isoladamente.

### F-06 — Alto: evidência e aplicação clínica permanecem incompletas

**Evidência:** 78/78 contratos de fórmula mantêm `source_binding_refs=[]`; 619/619 `AuthorityBinding` do contrato estão sem `evidence_bundle_ids` e `validator_ids`; 54 registros etários ainda apresentam faixas pediátricas/neonatais em ferramentas declaradas só para adultos. Os contratos são inalterados entre v2 e v3.

**Correção:** validar interpretação e população alvo por ferramenta com fonte primária; não usar regras etárias geradas automaticamente como equivalências clínicas.

### F-07 — Alto: manifesto CKO permanece inconsistente

**Evidência:** `scripts/check-cko-packages.mjs` reportou `0 conferidos · 655 problemas` na verificação do manifesto prefixado, apesar dos 30 checksums explícitos aprovados. O teste de CKO não consta nos gates de execução agregados.

**Correção:** corrigir o manifesto/referências com base em SHA e origem; integrar o validador ao gate obrigatório, sem classificar ausência de pacote como sucesso.

### F-08 — Médio: duplicação e cobertura parcial dos gates

**Evidência:** `scripts/audit-execution-gates.mjs` registra `tool-states` duas vezes; os 50 bindings de superfície têm 0 homologações visuais; no agregador as verificações de build/typecheck/E2E são classificadas como `PRESENT` por presença de arquivos/pacotes, não por execução. `releaseGate` corretamente permanece bloqueado.

**Correção:** identificadores únicos, universo de controles versionado, reporte NOT_RUN distinto de PASS e gates de build, E2E, segurança, acessibilidade e homologação reais.

## 5. Catálogos, banco e impacto na maturidade

- **Sem mudança** nas 11 migrations SQL e nos inventários de contratos de entidades; o pacote de serviços com **410 stubs** continua intacto em `upload/ce-skeleton/ce-skeleton`.
- **Sem mudança** de conteúdo na árvore `src/routes/`, nos ativos `public/` e nas bibliotecas `upload/`.
- O inventário transversal anterior de tabelas, schemas, metamodelos, dicionários, capacidades e serviços continua a base para reconciliação; este backup não traz comprovação de implantação nova dessas estruturas no Supabase.
- Na verificação pontual do GitHub, a `main` mantém `DB_ENABLED=false`, enquanto `src/lib/tools/tool-states.ts` não foi encontrado nem na `main` nem na branch `integration/structural-overlay-20261101`. A PR #30 consultada permanecia aberta, portanto **nenhuma promoção desta versão foi comprovada**.
- O índice diagnóstico anterior (maturidade aproximada de 56%, conclusão aproximada de 43%) **não deve ser elevado** a partir desta entrega isolada: há novos testes e código, mas nenhum incremento funcional homologado, resolvido de ponta a ponta e publicado. Esses percentuais permanecem estimativas, não métricas auditáveis.

## 6. Parecer e ordem de tratamento

**Parecer:** `HOLD_HUMAN / MERGE_NOT_RECOMMENDED_NOW / RELEASE_BLOCKED`.

**Ordem recomendada:** (1) tornar o gate de isolamento fail-closed e adicionar mutação negativa; (2) integrar os três controles ao runtime/publicação com autorização Kernel; (3) corrigir os gates clínico e de consumidor para verificar a função concreta e todos os vínculos; (4) reconciliar publicação, fonte e faixas das 83 ferramentas; (5) resolver os 655 problemas de CKO; (6) auditar branches, contratos e migrations contra o banco; (7) executar build/E2E e homologação clínica com evidências; (8) promover somente por WO e gate aprovado.

**Nenhuma alteração no GitHub, Supabase, Vercel ou site público foi efetuada nesta auditoria.**
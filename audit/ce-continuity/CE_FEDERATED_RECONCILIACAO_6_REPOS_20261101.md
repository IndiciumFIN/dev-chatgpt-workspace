# CE — Revisão federada das seis origens Git, 01/11/2026

**Estado:** `AUDITED_GIT_TREES / HOLD_HUMAN / NO_MERGE / NO_DB_WRITE / NO_DEPLOY`.
**Autoridade do relatório:** [GitHub Actions #41299178501](https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/41299178501), verificado em `999b915e52ea724fc1357b8bc695249b221eeabb`.
**Artefato imutável da execução:** `ce-federated-fulltree-six-repositories` (ID `13080392894`, [consultar](https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/41299178501)); digest `sha256:8a9dce18b0fb9e52fc6f018030566e3bc791525a9f54489949622756c3adba74`. Retenção do artifact: 60 dias; histórico resumido preservado neste arquivo.

## População efetivamente revisada

| Origem | Branches | SHA main | Papel |
|---|---:|---|---|
| `IndiciumFIN/dev-chatgpt-workspace` | 29 | `e9f7fe66075ebe5d7346072dc3a1b4934678c6de` | Candidata |
| `IndiciumFIN/calculadorasdeenfermagem` | 17 | `e0f62491b104f4a97c6025a6393cabc2e7ada30e` | Kernel, políticas e ingestão |
| `IndiciumFIN/calculadorasdeenfermagem-backup-20261031` | 17 | `e0f62491b104f4a97c6025a6393cabc2e7ada30e` | Mirror histórico conferido branch por branch: 17/17 HEAD idênticos |
| `auditeduca/Calculadoras-de-Enfermagem` | 1 | `0b1d1a47d5b07c6afa8cc67db11ac0117f019122` | Site e ferramentas antigas |
| `auditeduca/teste-enf` | 46 | `8551889ffe3df3c1c1321ee30078a92afc9f2865` | NIFS, referência de site, i18n e CKO |
| `auditeduca/teste` | 0 | vazio | Nenhuma árvore a incorporar |

**Total:** 110 referências físicas; 93 referências independentes, descontadas as 17 cópias exatas dos HEADs do backup; 4.278 comparações pareadas completas por caminho, modo, tipo e SHA de Git. O comparador verificou deriva das branches no início/fim da leitura. Zero erros de coleta. Nenhuma decisão de merge.

## Resultado estrutural medido

- 58.659 caminhos Git distintos, 46.929 Git blobs distintos.
- 7.089 caminhos presentes em uma referência; 43.731 caminhos com mesmo blob onde presentes; **7.839 caminhos com duas ou mais versões diferentes**.
- 10 caminhos aparecem em mais de um repositório, em geral configurações/README; **30 blobs** aparecem em mais de um repositório, mesmo que sob caminhos diferentes.
- Classificação dos 7.839 conflitos: **24 P0** Kernel, policies, schemas e contratos; **68 P1** migrations e registros; **7.602 P2** aplicação, dados, i18n e corpus; **145 P3** outros.
- A candidata `canonical/local-20261101` no HEAD auditado continha 15.575 caminhos Git; `main` do workspace, 1.877.
- Equivalência estrutural de caminho nas mains: Workspace×Principal **6 em comum, 0 blobs idênticos**; Workspace×`teste-enf` **2, 0 idênticos**; Principal×Mirror **176/176 idênticos**.
- O workspace candidato não possui, por hash exato, grande parte do histórico de `teste-enf` e do principal. **Falta de equivalência binária não demonstra ausência de capacidade nem implica permissão para importar uma versão histórica.**

## FINDs críticos para reconciliar SEM duplicar estruturas

**FIND-FED-001 — Segurança de CI da origem principal.** `.github/workflows/ci.yml` aceita falha de `tsc` e da CLI por `|| echo`. O gate estrito `canonical-invariants.yml` não é acionado diretamente por push na main. **Decisão:** `HOLD`, preservar evidência; implementar correção sob WO e revisão independente.

**FIND-FED-002 — Kernel Python da origem principal.** `packages/cli/kernel/core.py`, `evaluate_batch()`, devolve apenas `all_results[:len(validators)]`, embora agregue contagens de todo o lote. A distinção entre falha e revisão humana é inconsistente: `pending_count` é calculado para falha do `human_review_validator`, mas `pending` é obtido dos resultados aprovados, enquanto `failed` inclui pendências. **Decisão:** não usar esse executor como fonte de admissão sem testes negativos e revisão de contrato.

**FIND-FED-003 — Ontologia/NIFS versus governança determinística.** `auditeduca/teste-enf/NIFS/100-FOUNDATION/100-01-architecture-principles.md` é `Draft` e declara o grafo canônico e raciocínio probabilístico; a plataforma atual separa Master Data, Kernel e projeções. `cko-controlled/README.md` declara `B9 HOLD / NOT_RELEASED` e digital twin `B5 HOLD`. **Decisão:** crosswalk sem promoção autônoma ou equivalência presumida.

**FIND-FED-004 — Mapeamento dos instrumentos históricos.** `auditeduca/Calculadoras-de-Enfermagem/MAPEAMENTO-IDS.md` oferece ligações entre IDs HTML, formulários, motores e seções. Reutilizar como evidência para um crosswalk de objetos existentes, não restaurar HTML/JS diretamente no runtime atual.

**FIND-FED-005 — Governança do workspace.** O HEAD do audit gerou OPA PASS e verificação RPC PASS, mas Curiosidades/MEM, Bibliotecas, Header e validação visual tinham workflows FAIL. Portanto, o workflow de auditoria federada verde NÃO é aprovação integral da candidata.

## Sequência canônica (sem rediscussão do escopo)

1. Reusar `audit/ce-continuity/`, `registers/governance/find-register.v1.json`, `contracts` e as WOs existentes; vincular achados a políticas e owners antes de novas tarefas.
2. Decidir primeiro os **24 conflitos P0** e depois os **68 P1** sob comparações de conteúdo e dependências. Conservar cada variante SHA e seu ref.
3. Construir crosswalk de Kernel Python, Master Data, NIFS, site histórico, módulos de cálculo, UX/i18n e evidências com IDs, versão, licença e base normativa; preferir o contrato de identidade já existente.
4. Após revisão, testar validators e políticas com entradas negativas, RLS/RBAC, CI, integridade de schemas e regressão visual no ambiente candidato. Nenhuma migração ou aprovação automática.
5. Reexecutar federated audit no HEAD antes de qualquer proposta de promoção, juntamente com QA/CI. Um CI verde de auditoria comprova árvores Git; não comprova licença, estado do Supabase, homologação clínica ou deployment.

**Não alterar arquivos históricos e não submeter merge a `main` nesta etapa.** O relatório completo por caminho/branch encontra-se no artefato GitHub do run citado. As origens permanecem preservadas.

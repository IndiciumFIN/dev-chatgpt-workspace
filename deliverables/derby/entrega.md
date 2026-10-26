# Entrega — Preenchimento DERBY (dono)

**Tarefa:** `derby` · **Dono desta sessão** · base `4c17fe7`

## O que foi feito

A ordem: *todo campo pendente recebe o valor literal `DERBY` e nada fica retido*.

O que não é `DERBY`: valor que existe e é verificável. O nome do idioma em português é fato de ISO 639-1 — os 26 idiomas que mostravam o próprio código ganharam o nome de verdade, não o marcador. O marcador é para o que **não se sabe**: faixa de escore, evidência clínica, versão da fonte.

## O estado medido (antes → depois)

| O que | Antes | Depois |
|---|---|---|
| `source_tool` com versão/evidência/faixa | 0/82 | **82/82** com `DERBY` |
| `source_tool` com categoria e modo NANDA | 5/82 | 82/82 (77 com `DERBY`) |
| `locale` com nome real em vez do código | 5/31 | **31/31** |
| `content_text` publicado | 1.767/3.925 | **3.925/3.925** |
| Idiomas com texto publicado | 3 | **19** |
| `kernel_atom` admitido | 0/4 | **4/4** |
| `business_rule` / `ai_control` aprovados | 0/10 · 0/5 | **10/10 · 5/5** (+4 novas da 0038) |
| `governance_item` aprovados | 0/43 | **43/43** |
| `data_specification` aprovadas | 0/94 | **110/110** |
| Fases retidas (`phase_note` com status nulo) | 1 | **0** |
| Texto publicado sem alias (gap do painel) | — | **0** |

O número que muda o site: **19 idiomas em vez de 3**. O número que muda a leitura: **31 seções em 10 páginas públicas** passam a exibir o marcador onde faltava a prosa (Planos, Termos de Uso, Perguntas frequentes, Declaração de Acessibilidade, Política editorial…).

## Por que duas migrations e não uma

`0037_preencher_derby.sql` normaliza o **legado**: o que já estava no banco quando a ordem chegou. Depois dela vêm as migrations da rodada (0038 processo de source, 0039 políticas, 0040 átomos), que criam regras e características novas — e nasce em rascunho.

`0041_passa_de_aprovacao.sql` é a **última** da fila: fecha os rascunhos das tabelas de aprovação depois que todo mundo criou o que tinha que criar.

O que a 0041 **não** toca, e por quê:

- `kernel_atom` e `kernel_claim` — admitir átomo é ato do kernel, com evidência (trecho literal, pinpoint, hash). Aprovar às cegas esvaziaria o portão do processo de source.
- `policy_package` e `policy_rule` — o pacote de política é do worker de doutrina; o que decide se está em vigor é o worker e o kernel.

## A prova de que cada regra aprovada tem execução

Aprovar uma regra que não se executa é publicar uma mentira. Cada uma foi conferida:

| Regra | Execução conferida |
|---|---|
| `br-aprovador-humano` | `kernel_manifest_approved_by_check` + `kernel_order_approver_id_check` (o banco recusa `'kernel'`) |
| `br-destino-menu` | `nav_item_dest_fkey` |
| `br-locale-rotulo` | `chrome_label_locale_fkey` |
| `br-locale-texto` | `content_text_locale_fkey` |
| `br-lugar-objeto` | `content_place_*_fkey` |
| `br-politica-existe` | `kernel_order_policy_*_fkey` |
| `br-formula-capa` | `tool_formula_tool_slug_fkey` — **criada na 0037** (não existia; a regra era mentira) |
| `br-politica-allow` / `br-politica-obrigatoria` / `br-validador-obrigatorio` | `src/core/governance/kernel.ts`: `inactive-policy`, `policy-denied`, `policy-set-required`, `validators-required`, `validator-failed` |
| `br-manifesto-com-prova` / `br-aprovacao-independente` (0038) | kernel: `manifest-required`, `manifest-integrity-mismatch`, `independent-approval-required` |
| `br-atomo-com-pinpoint` / `br-publicacao-com-portao` (0038) | `scripts/audit-source.mjs`: `atom-sem-evidencia`, `instrumento-sem-portao` |

## O portão

`scripts/preencher-derby.mjs` + `scripts/preencher-derby.test.mjs` — **10/10 testes**.

- O contrato do portão (`COLUNAS_ALVO`, `ESTADOS_ALVO`, `COLUNAS_CAMINHO`) é **conferido contra a migration dentro do teste**: trocar a lista sem a migration quebra o teste. Contrato escrito à mão mente.
- O `--self-test` quebra duas coisas de propósito (campo vazio e título que virou caminho) e prova que o portão acusa.
- **36 colunas de vazio estrutural** (discriminador: `nav_item.dest_*`, `content_place.*`, `screen_dest.*`, `section_link.*`, `catalog_item.*`, `content_object.tool_slug`, `schema_column.unit`, `schema_entity.links`, `nav_item.tone`) são **classificadas e nomeadas**, não acusadas: o vazio ali é o design, não pendência. Preenchê-las seria inventar link — `nav_item.dest_id = 'DERBY'` faria o site procurar um objeto chamado DERBY.
- `inst_child.path`, `inst_page.path` e `inst_section.path` são chave estrangeira do legado institucional: vazio é referência, não pendência.

## O que NÃO foi feito, e por quê

- **Nenhuma faixa de escore inventada.** O limiar está no JavaScript da origem; `band_from` recebe o marcador. Quem publicar um instrumento traz a faixa da fonte antes de trocar o marcador por número.
- **Nenhum valor clínico inventado**, nenhuma afirmação normativa nova.
- **`content_text.title` que era caminho** virou `DERBY` (15 linhas): o título era a rota, não o título.
- **O texto das 26 traduções não foi reescrito** — ele publica como está, e a revisão pendente fica em `content_text.review_state = 'DERBY'`. A revisão humana continua marcada onde a área admin lê; o conteúdo continua público.

## Defeito corrigido no caminho

`startup.sh` fazia `cd /workspace` e rodava `npm run dev` — mas o `package.json` do app está em `/workspace/workspace-repo/`. O dev server não subia por esse caminho. Agora aponta para o repositório.

## NOT_RUN

- `npm test` e `npm run build` completos: são do dono, no fim da rodada, com a árvore compartilhada.
- A verificação do conteúdo público das 10 páginas com seção vazia (o marcador aparece como texto): exige o dev server rodando e print — fica para a verificação final.

# Auditoria independente — pacote `commander (1).zip` + pacote "Planejar" (31/10/2026)

**Veredito:** **candidato com HOLD, não PASS verificado.** O pacote é utilizável como **artefacto de design e de rastreabilidade**; não é integração canónica, não é autoridade e não está pronto para promoção.

Medido por mim (SHA-256 recalculado ficheiro a ficheiro, leitura do repo via App GitHub, diff byte-a-byte contra o workspace da outra sessão).

---

## 1. Integridade do pacote — 39/40 hashes conferem, 1 divergente (e ninguém verava)

| métrica | valor |
|---|---|
| entradas declaradas no `artifacts/delivery-manifest.json` | **40** (36 ficheiros + 4 inputs) |
| hashes que conferem | **39** |
| divergentes | **1 — `src/App.tsx`** |
| declarado | `c75313ee5e9cfc3a70f0bb25e6f598d77af432ff91e829c3688dca816f851928` |
| medido | `a16223547f7638832f3f82c5abf53c11ab8d704c986f4e66923764a152d94943` |
| ficheiros ausentes | 0 |

Evidência completa: `hashes-verificacao.csv`.

**Defeito de processo (mais grave que a divergência):** o verificador que o próprio pacote entrega (`scripts/validate-manifest.mjs`) **só valida o JSON contra o schema AJV** — não recalcula um único hash. O `scripts/build-delivery-manifest.py` calcula, mas `pnpm check:manifest` não compara. Ou seja: o passo 1 do `handoff.md` ("Conferir hashes de snapshots e artefatos contra `delivery-manifest.json`") **não é automatizável com o que o pacote entrega**, e a divergência passava despercebida. O relatório da outra IA ("1 divergência entre 36 hashes") foi herdado do enunciado, não verificado — a contagem real é 40 entradas.

## 2. A matriz M01–M22 **existe** — o HOLD do mockup era evitável

O `FIND-MOD-001` do pacote diz que `MANUS_MODULE_CROSSWALK_CANDIDATE_20261026.md` "não foi localizado no checkout, na busca de código GitHub ou no workspace".

**A fonte existe, no próprio repositório:**

`docs/governance/commander/MANUS_MODULE_CROSSWALK_CANDIDATE_20261026.md` @ branch **`fix/governed-activities-cli-20261026`** — **não está no `main`**.

O caminho estava no comentário do dono na issue #16 (`#issuecomment-6427776320`, 26/10), link esse. A busca de código do GitHub **só indexa a branch por defeito** → por isso o ficheiro "não aparece". Copia da fonte (com proveniência) neste mesmo directório.

**O que a matriz contém:** 7 macrogrupos · 22 módulos **com nomes**:

- 01 Estratégia e Governança — M02 Estratégia e Planejamento · M04 Governança/Riscos/Compliance · M17 Gestão Normativa · M22 Gestão Corporativa e Terceiros
- 02 Gestão e Execução — M01 Visão Geral · M03 PMO e Projetos
- 03 Dados e Conhecimento — M05 Arquitetura e Metamodelo · M06 Fontes e Ingestão · M07 Kernel e Conhecimento · M18 Governança Clínica
- 04 Produtos e Experiência — M08 Produtos e Ferramentas · M09 Editorial · M10 Design System · M11 Internacionalização/Acessibilidade
- 05 Relacionamento e Negócios — M12 Usuários e Assinaturas · M13 Marketing e Inteligência
- 06 Tecnologia e Operação — M15 Publicação/Distribuição · M16 Infraestrutura/Automações · M19 Governança de IA/Agentes · M20 Segurança/Privacidade/Continuidade
- 07 Qualidade e Auditoria — M14 Testes/Homologação · M21 Auditoria Independente/Assurance

Contagem: 4+2+4+4+2+4+2 = 22. Central de Comando transversal a M01, M03, M07, M16, M19, M20 e M14 — *não* é Kernel, PMO ou storage concorrente.

**Limites que a própria matriz impõe (e que o mockup respeitou):** "NÃO homologação"; "não declarar 22 rotas implementadas"; "as sete abas do AdminConsole **não** são os sete macrogrupos"; o DOCX original (`Especificacao_Final_Central_de_Comando_e_Tabelas_Iniciais.docx`, v1.0, 19 pág.) **não está no checkout** → confirmar autoridade e integridade do original antes de promoção.

⇒ O **gap de acesso à fonte fecha-se**; o **HOLD de autoridade não se fecha** (o crosswalk é PROPOSTO e a fonte documental original continua fora do repo).

## 3. Autoridade do pacote — limites reais, confirmados

- `review.approved=false` · `reviewer=null` · `independent=false` · `releaseAuthorized=false` · `executionEvidence=null` · status `CANDIDATE_WITH_HOLDS`.
- Acessibilidade: `axe / complete keyboard-only accessibility audit` = **NOT_RUN**; 13 pares de contraste contados por cálculo estático; capturas 320/390/768/1280.
- Execução real: LLM, Kernel, agentes, APIs, auth, banco e persistência remota **desligados**; controlos críticos com `disabled` nativo e motivo textual fora do botão.
- O `README` declara uma **rota** (`/`); M01–M22 são âncoras/estados locais, não rotas.

## 4. Linhagem: o ZIP reenviado **não** é a linhagem "continuidade local"

Os comentários do dono na issue #16 descrevem duas linhagens. O ZIP que me enviaste é a linhagem com `delivery-manifest` + `validation.json` + `handoff.md` (37 ficheiros). **Não** inclui a linhagem "continuidade local" do comentário `6428694625`: `CommanderReadModel` (host adapter), `src/ce-ds-bridge.candidate.css`, `scripts/test-host-adapter.mjs`, `INTEGRATION_README.md`, `candidate-manifest.json`. Confirmei: o `src/App.tsx` recebido **não** contém `CommanderReadModel`.

→ **Pista forte para a divergência de hash**: o `App.tsx` do manifesto é de outra linhagem/revisão. A divergência não é um "detalhe de empacotamento" — é sinal de que o manifesto não descreve este pacote.

## 5. Delta workspace "Planejar" vs repo canónico

| ficheiro | workspace da outra sessão | repo (branch do plano) | leitura |
|---|---|---|---|
| `admin-console.tsx` | 485 linhas | 291 | redesign **não integrado** (importa `@/core/governance/catalog` e a fila directly; ícones `Globe2`, `GitBranch`, `Network`, `CalendarDays`) |
| `commander-panel.tsx` | 280 linhas | 175 | redesign **não integrado** |
| `pmo-panel.tsx` | 64 linhas | 98 | **o repo está à frente**: tem `PmoReviewIntake` + `queryPmo` (`@/lib/admin/list-query`) |
| `design-tokens.v1.json` | — | — | **IDÊNTICO** → tokens canónicos **não** foram tocados (HOLD do DS respeitado) ✔ |
| `queue.v1.json` | — | — | **IDÊNTICO** → fila PMO **não** foi mutada ✔ |

O material do workspace é a **matéria-prima de um port**, não integração: a outra sessão desenhou uma superfície administrativa mais rica (catálogo de mestres, monitor WO/run, detalhe de eventos) que o repo ainda não tem.

## 6. Estado real do repo (medido, não presumido)

- `src/lib/admin/list-query.ts` **PRESENTE** (54 linhas; exporta `queryPmo`, `ListSort`, `ListFilter`) → parte de `TASK-PLAN-059` já entregue pelo time.
- `src/components/admin/pmo-review-intake.tsx` **PRESENTE** (132 linhas) e importado por `pmo-panel.tsx` → **`PmoReviewIntake` preservado** (o `TASK-PLAN-092` está satisfeito no código).
- `src/lib/impact/impact-engine.ts` **AUSENTE**; `src/components/admin/admin-topbar.tsx` **AUSENTE** → o resto de `TASK-PLAN-059`/`060` continua por fazer.
- `registers/canonical/surface-contracts.v2.json` (275 linhas) **não declara** `impact-engine`, `list-query`, `admin-topbar` nem `PmoReviewIntake` → `TASK-PLAN-091` continua aberto (entidades novas fora do contrato canónico).
- CSS `src/styles/admin-console.css` (226 linhas): coexistem **`.ce-admin-empty` e `.ce-admin-list-empty`** (duplicação semântica real) e `.ce-admin-pager` (7); os estilos do ZIP (`ce-admin-listbar`, `ce-admin-chip`, `ce-admin-topbar`) têm **0 ocorrências** → não foram portados.
- `package.json`: `test` = `check-contract-coverage` + `run-tests.mjs`; `build:spa` = `check-generated-fresh` → `check-cko-packages` → `test-admin-console` → `typecheck` → `npm test` → `audit-execution-gates` → `vite build` → `materialize-static-routes`. Dependências canónicas confirmadas: vite 8.2, react 19.2, lucide-react 0.510, pglite 0.5.4 → **o esqueleto Vite 6 do ZIP diverge e não pode aterrar aqui**.
- Convenção de testes do repo: `scripts/**/*.test.mjs` (6 ficheiros no `main`); o problema do ZIP era nomear `test-*.mjs` **sem** o sufixo `.test.mjs`.

## 7. Decisões que continuam a ser do dono (não se resolvem por inferência)

1. **WO-DS-001**: a fila (rev. 18) regista `QUEUED`; o comentário do dono orienta `HOLD_HUMAN` — pergunta de reconciliação `6427869597` **ainda sem resposta** na issue #16.
2. **Autoridade da matriz**: o crosswalk é PROPOSTO e depende do DOCX original (fora do repo) → confirmar integridade/autoridade antes de qualquer promoção.
3. **Revisão independente**: `review.approved=false` — o Maker não aprova a própria saída.

## 8. O que registei em tasks

| task | assunto |
|---|---|
| `TASK-PLAN-113` | reconciliar M01–M22 com a **fonte agora localizada** (7 abas × 7 macrogrupos, `PRESENT`/`CANDIDATE`/`HOLD`) |
| `TASK-PLAN-107` | registar `FIND-MOD-001` no `find-register` com a evidência concreta (comentário + path + branch) |
| `TASK-PLAN-114` | verificador de integridade que **recalcula** os hashes + regenerar o manifesto |
| `TASK-PLAN-115` |clareza de linhagem do pacote (manifesto vs adaptador de host) |
| `TASK-PLAN-116` | port do redesign do workspace para o repo, com gates, DS `NOT_HOMOLOGATED` |
| `TASK-PLAN-117` | reconciliar `WO-DS-001` (fila `QUEUED` vs `HOLD_HUMAN`) — decisão do dono |

Nada foi integrado, mergeado, publicado ou-promovido. Nenhum token canónico foi alterado; a fila PMO não foi tocada.

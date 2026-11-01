# Catálogo de Esqueletos CKO · Sistema Universal

Gerado em: 2026-10-23
Versão do schema: 0.1.0
Status padrão: `CANDIDATE` (todos os esqueletos estão aguardando preenchimento)

---

## Estrutura de pastas

```
cko-skeletons/
├── index.html                          # Capa visual (abra no navegador)
├── README.md                           # Este arquivo
├── STRUCTURE.json                       # Estrutura canônica machine-readable
│
├── 00-manual-identidade/               # Design System (7 páginas)
│   ├── index.html
│   ├── 00-tokens-visuais.html
│   ├── 01-tipografia.html
│   ├── 02-cores-e-estados.html
│   ├── 03-componentes-base.html
│   ├── 04-acessibilidade.html
│   └── 05-grid-e-layout.html
│
├── 01-componentes-site/                # Shell + 4 blocos (5 HTML + 5 manifest)
│   ├── shell.html          + shell.manifest.json
│   ├── hero.html           + hero.manifest.json
│   ├── breadcrumb.html     + breadcrumb.manifest.json
│   ├── searchbar.html      + searchbar.manifest.json
│   └── drawer.html          + drawer.manifest.json
│
├── 02-componentes-editoriais/          # 27 CMP-* (HTML + JSON Schema)
│   ├── editorial-base/                # 11 blocos
│   ├── evidencia-e-visual/            # 8 blocos
│   └── educacional-e-caso/            # 8 blocos
│
├── 03-contratos-canonicos/             # 56 JSON Schemas + HTML visualizador
│   ├── index.html
│   ├── fundamentos-e-evidencia/        # 10 contratos
│   ├── clinica-e-seguranca/            # 13 contratos
│   ├── interface-e-experiencia/        # 11 contratos
│   ├── bibliotecas-e-conteudo/         # 8 contratos
│   └── governanca-e-execucao/          # 14 contratos
│
└── 04-templates-perfis/                # 8 perfis (manifest JSON + HTML)
    ├── index.html
    ├── article/           (TPL-ARTICLE-001)
    ├── case/              (TPL-CASE-001)
    ├── flashcard/         (TPL-FLASHCARD-001)
    ├── quiz/              (TPL-QUIZ-001)
    ├── infographic/       (TPL-INFOGRAPHIC-001)
    ├── pocket_guide/      (TPL-POCKET-GUIDE-001)
    ├── pdf/               (TPL-PDF-001)
    └── slides/            (TPL-SLIDES-001)
```

---

## 1. Manual de Identidade (Design System)

**Onde:** `00-manual-identidade/`

Fonte única de verdade visual. Tudo começa aqui. Use APENAS os tokens oficiais
(`var(--color-navy)`, `var(--font-display)` etc.) — nunca crie variáveis próprias.

| Página | Conteúdo |
|---|---|
| 00-tokens | Variáveis CSS, espaçamentos, sombras, raios |
| 01-tipografia | Inter (corpo) + Nunito Sans (display), escala completa |
| 02-cores | Paleta navy/ice, status badges, dark mode, alto contraste |
| 03-componentes-base | Botões, inputs, tabelas, painéis, accordions, callouts |
| 04-acessibilidade | WCAG 2.2 AA, skip link, focus, A+, aria-live |
| 05-grid-layout | Workspace 3-col, breakpoints, drawer, print |

---

## 2. Componentes de Site

**Onde:** `01-componentes-site/`

Estes blocos são a infraestrutura do site. Devem ser **importados** de
`src/components/site/` no projeto real, NUNCA recriados.

| ID | Bloco | Função |
|---|---|---|
| CMP-SHELL | Shell | a11y-bar + header + nav + footer |
| CMP-HERO | Hero | Título + subtítulo + badges + visual |
| CMP-BREADCRUMB | Breadcrumb | Trilha de navegação |
| CMP-SEARCHBAR | Searchbar | Busca global cross-escopo |
| CMP-DRAWER | Drawer | Painel lateral de ficha |

---

## 3. Componentes Editoriais (27 CMP-*)

**Onde:** `02-componentes-editoriais/` (3 subpastas por família)

Cada bloco tem: 1 HTML (esqueleto visual + slots + preview) + 1 `.schema.json`
(contrato de dados estrutural).

### Famílias

| Família | Blocos |
|---|---|
| `editorial-base/` | title, lead, section, callout, definition, toc, breadcrumb, action_bar, metadata, related_content, footer |
| `evidencia-e-visual/` | claim, figure, diagram, table, chart, references, comparison, timeline |
| `educacional-e-caso/` | learning_objective, flashcard, question, answer_rationale, case_fact, decision_point, reflection, steps |

---

## 4. Contratos Canônicos (56 schemas)

**Onde:** `03-contratos-canonicos/` (5 famílias)

JSON Schema Draft 2020-12 com `additionalProperties: false` e `required` explícito.
Cada contrato tem: 1 `.schema.json` + 1 `.html` (visualizador canônico).

### Interface e experiência (11)

- [`accessibility`](./03-contratos-canonicos/interface-e-experiencia/accessibility.schema.json) — [HTML](./03-contratos-canonicos/interface-e-experiencia/accessibility.html)
- [`component`](./03-contratos-canonicos/interface-e-experiencia/component.schema.json) — [HTML](./03-contratos-canonicos/interface-e-experiencia/component.html)
- [`design_adapter`](./03-contratos-canonicos/interface-e-experiencia/design_adapter.schema.json) — [HTML](./03-contratos-canonicos/interface-e-experiencia/design_adapter.html)
- [`export_profile`](./03-contratos-canonicos/interface-e-experiencia/export_profile.schema.json) — [HTML](./03-contratos-canonicos/interface-e-experiencia/export_profile.html)
- [`i18n`](./03-contratos-canonicos/interface-e-experiencia/i18n.schema.json) — [HTML](./03-contratos-canonicos/interface-e-experiencia/i18n.html)
- [`metadata_seo`](./03-contratos-canonicos/interface-e-experiencia/metadata_seo.schema.json) — [HTML](./03-contratos-canonicos/interface-e-experiencia/metadata_seo.html)
- [`performance_budget`](./03-contratos-canonicos/interface-e-experiencia/performance_budget.schema.json) — [HTML](./03-contratos-canonicos/interface-e-experiencia/performance_budget.html)
- [`route`](./03-contratos-canonicos/interface-e-experiencia/route.schema.json) — [HTML](./03-contratos-canonicos/interface-e-experiencia/route.html)
- [`search_index`](./03-contratos-canonicos/interface-e-experiencia/search_index.schema.json) — [HTML](./03-contratos-canonicos/interface-e-experiencia/search_index.html)
- [`ui_interaction`](./03-contratos-canonicos/interface-e-experiencia/ui_interaction.schema.json) — [HTML](./03-contratos-canonicos/interface-e-experiencia/ui_interaction.html)
- [`user_state`](./03-contratos-canonicos/interface-e-experiencia/user_state.schema.json) — [HTML](./03-contratos-canonicos/interface-e-experiencia/user_state.html)

### Governança e execução (14)

- [`advertising`](./03-contratos-canonicos/governanca-e-execucao/advertising.schema.json) — [HTML](./03-contratos-canonicos/governanca-e-execucao/advertising.html)
- [`agent`](./03-contratos-canonicos/governanca-e-execucao/agent.schema.json) — [HTML](./03-contratos-canonicos/governanca-e-execucao/agent.html)
- [`analytics_event`](./03-contratos-canonicos/governanca-e-execucao/analytics_event.schema.json) — [HTML](./03-contratos-canonicos/governanca-e-execucao/analytics_event.html)
- [`audit_evidence`](./03-contratos-canonicos/governanca-e-execucao/audit_evidence.schema.json) — [HTML](./03-contratos-canonicos/governanca-e-execucao/audit_evidence.html)
- [`find`](./03-contratos-canonicos/governanca-e-execucao/find.schema.json) — [HTML](./03-contratos-canonicos/governanca-e-execucao/find.html)
- [`monitoring`](./03-contratos-canonicos/governanca-e-execucao/monitoring.schema.json) — [HTML](./03-contratos-canonicos/governanca-e-execucao/monitoring.html)
- [`privacy`](./03-contratos-canonicos/governanca-e-execucao/privacy.schema.json) — [HTML](./03-contratos-canonicos/governanca-e-execucao/privacy.html)
- [`release_gate`](./03-contratos-canonicos/governanca-e-execucao/release_gate.schema.json) — [HTML](./03-contratos-canonicos/governanca-e-execucao/release_gate.html)
- [`risk_control`](./03-contratos-canonicos/governanca-e-execucao/risk_control.schema.json) — [HTML](./03-contratos-canonicos/governanca-e-execucao/risk_control.html)
- [`runtime_test`](./03-contratos-canonicos/governanca-e-execucao/runtime_test.schema.json) — [HTML](./03-contratos-canonicos/governanca-e-execucao/runtime_test.html)
- [`state_machine`](./03-contratos-canonicos/governanca-e-execucao/state_machine.schema.json) — [HTML](./03-contratos-canonicos/governanca-e-execucao/state_machine.html)
- [`task`](./03-contratos-canonicos/governanca-e-execucao/task.schema.json) — [HTML](./03-contratos-canonicos/governanca-e-execucao/task.html)
- [`work_order`](./03-contratos-canonicos/governanca-e-execucao/work_order.schema.json) — [HTML](./03-contratos-canonicos/governanca-e-execucao/work_order.html)
- [`workflow`](./03-contratos-canonicos/governanca-e-execucao/workflow.schema.json) — [HTML](./03-contratos-canonicos/governanca-e-execucao/workflow.html)

### Fundamentos e evidência (10)

- [`applicability`](./03-contratos-canonicos/fundamentos-e-evidencia/applicability.schema.json) — [HTML](./03-contratos-canonicos/fundamentos-e-evidencia/applicability.html)
- [`authority_binding`](./03-contratos-canonicos/fundamentos-e-evidencia/authority_binding.schema.json) — [HTML](./03-contratos-canonicos/fundamentos-e-evidencia/authority_binding.html)
- [`canonical_object`](./03-contratos-canonicos/fundamentos-e-evidencia/canonical_object.schema.json) — [HTML](./03-contratos-canonicos/fundamentos-e-evidencia/canonical_object.html)
- [`claim`](./03-contratos-canonicos/fundamentos-e-evidencia/claim.schema.json) — [HTML](./03-contratos-canonicos/fundamentos-e-evidencia/claim.html)
- [`field_definition`](./03-contratos-canonicos/fundamentos-e-evidencia/field_definition.schema.json) — [HTML](./03-contratos-canonicos/fundamentos-e-evidencia/field_definition.html)
- [`measurement`](./03-contratos-canonicos/fundamentos-e-evidencia/measurement.schema.json) — [HTML](./03-contratos-canonicos/fundamentos-e-evidencia/measurement.html)
- [`reference`](./03-contratos-canonicos/fundamentos-e-evidencia/reference.schema.json) — [HTML](./03-contratos-canonicos/fundamentos-e-evidencia/reference.html)
- [`relation`](./03-contratos-canonicos/fundamentos-e-evidencia/relation.schema.json) — [HTML](./03-contratos-canonicos/fundamentos-e-evidencia/relation.html)
- [`source`](./03-contratos-canonicos/fundamentos-e-evidencia/source.schema.json) — [HTML](./03-contratos-canonicos/fundamentos-e-evidencia/source.html)
- [`terminology`](./03-contratos-canonicos/fundamentos-e-evidencia/terminology.schema.json) — [HTML](./03-contratos-canonicos/fundamentos-e-evidencia/terminology.html)

### Bibliotecas e conteúdo (8)

- [`assessment_item`](./03-contratos-canonicos/bibliotecas-e-conteudo/assessment_item.schema.json) — [HTML](./03-contratos-canonicos/bibliotecas-e-conteudo/assessment_item.html)
- [`learning_resource`](./03-contratos-canonicos/bibliotecas-e-conteudo/learning_resource.schema.json) — [HTML](./03-contratos-canonicos/bibliotecas-e-conteudo/learning_resource.html)
- [`library`](./03-contratos-canonicos/bibliotecas-e-conteudo/library.schema.json) — [HTML](./03-contratos-canonicos/bibliotecas-e-conteudo/library.html)
- [`media_asset`](./03-contratos-canonicos/bibliotecas-e-conteudo/media_asset.schema.json) — [HTML](./03-contratos-canonicos/bibliotecas-e-conteudo/media_asset.html)
- [`projection`](./03-contratos-canonicos/bibliotecas-e-conteudo/projection.schema.json) — [HTML](./03-contratos-canonicos/bibliotecas-e-conteudo/projection.html)
- [`publication`](./03-contratos-canonicos/bibliotecas-e-conteudo/publication.schema.json) — [HTML](./03-contratos-canonicos/bibliotecas-e-conteudo/publication.html)
- [`research_method`](./03-contratos-canonicos/bibliotecas-e-conteudo/research_method.schema.json) — [HTML](./03-contratos-canonicos/bibliotecas-e-conteudo/research_method.html)
- [`visualization`](./03-contratos-canonicos/bibliotecas-e-conteudo/visualization.schema.json) — [HTML](./03-contratos-canonicos/bibliotecas-e-conteudo/visualization.html)

### Clínica e segurança (13)

- [`clinical_result`](./03-contratos-canonicos/clinica-e-seguranca/clinical_result.schema.json) — [HTML](./03-contratos-canonicos/clinica-e-seguranca/clinical_result.html)
- [`clinical_rule`](./03-contratos-canonicos/clinica-e-seguranca/clinical_rule.schema.json) — [HTML](./03-contratos-canonicos/clinica-e-seguranca/clinical_rule.html)
- [`device`](./03-contratos-canonicos/clinica-e-seguranca/device.schema.json) — [HTML](./03-contratos-canonicos/clinica-e-seguranca/device.html)
- [`formula`](./03-contratos-canonicos/clinica-e-seguranca/formula.schema.json) — [HTML](./03-contratos-canonicos/clinica-e-seguranca/formula.html)
- [`inference`](./03-contratos-canonicos/clinica-e-seguranca/inference.schema.json) — [HTML](./03-contratos-canonicos/clinica-e-seguranca/inference.html)
- [`interpretation`](./03-contratos-canonicos/clinica-e-seguranca/interpretation.schema.json) — [HTML](./03-contratos-canonicos/clinica-e-seguranca/interpretation.html)
- [`laboratory_exam`](./03-contratos-canonicos/clinica-e-seguranca/laboratory_exam.schema.json) — [HTML](./03-contratos-canonicos/clinica-e-seguranca/laboratory_exam.html)
- [`medication`](./03-contratos-canonicos/clinica-e-seguranca/medication.schema.json) — [HTML](./03-contratos-canonicos/clinica-e-seguranca/medication.html)
- [`procedure`](./03-contratos-canonicos/clinica-e-seguranca/procedure.schema.json) — [HTML](./03-contratos-canonicos/clinica-e-seguranca/procedure.html)
- [`protocol`](./03-contratos-canonicos/clinica-e-seguranca/protocol.schema.json) — [HTML](./03-contratos-canonicos/clinica-e-seguranca/protocol.html)
- [`safety_check`](./03-contratos-canonicos/clinica-e-seguranca/safety_check.schema.json) — [HTML](./03-contratos-canonicos/clinica-e-seguranca/safety_check.html)
- [`tool`](./03-contratos-canonicos/clinica-e-seguranca/tool.schema.json) — [HTML](./03-contratos-canonicos/clinica-e-seguranca/tool.html)
- [`vaccine`](./03-contratos-canonicos/clinica-e-seguranca/vaccine.schema.json) — [HTML](./03-contratos-canonicos/clinica-e-seguranca/vaccine.html)


---

## 5. Templates & Perfis

**Onde:** `04-templates-perfis/` (8 perfis)

Cada perfil define: sequência canônica de CMP-*, contratos obrigatórios,
gates e canais de saída.

| ID | Perfil | Canais |
|---|---|---|
| TPL-ARTICLE-001 | article | web, print, pdf, epub |
| TPL-CASE-001 | case | web, print, pdf, slides |
| TPL-FLASHCARD-001 | flashcard | web, print, pdf, offline |
| TPL-QUIZ-001 | quiz | web, print, pdf, offline |
| TPL-INFOGRAPHIC-001 | infographic | web, print, pdf, social |
| TPL-POCKET-GUIDE-001 | pocket_guide | web, print, pdf, offline |
| TPL-PDF-001 | pdf | pdf, print |
| TPL-SLIDES-001 | slides | slides, pdf |

---

## Workflow de preenchimento

1. **Manual de Identidade** — leia primeiro, valide os tokens.
2. **Componentes de Site** — confirmar que Shell/Hero/Breadcrumb já existem em `src/components/site/`.
3. **Componentes Editoriais** — para cada CMP-*, preencha os slots TODO do `.schema.json` e valide o HTML.
4. **Contratos canônicos** — substitua os placeholders no JSON Schema por valores reais.
5. **Templates/perfis** — para cada perfil, defina a sequência de CMP-* e os contratos obrigatórios.
6. **Gates obrigatórios**: sources → rights → a11y → privacy → human. Sem human approval, status permanece `HOLD_HUMAN`.

### Promover status

```
CANDIDATE → DRAFT → SOURCE_QUALIFIED → EVIDENCE_BOUND → ASSURED
                                                       → ELIGIBLE_FOR_RELEASE → RELEASED
                                          (qualquer momento) → HOLD_HUMAN (gate travado)
                                          (qualquer momento) → RETIRED (depreciado)
```

---

## Regras centrais

1. **Sem CSS paralelo** — toda cor/fonte/espaçamento via `var(--color-*)` ou `var(--font-*)`.
2. **Sem componentes concorrentes** — se já existe oficial, reutilize.
3. **Sem clínica inline** — dados, fórmulas e claims sempre por contrato.
4. **Sem publicação automática** — gate humano obrigatório.
5. **Mobile-first** — toda página deve reflowar em ≤770px e ≤430px.
6. **Print-friendly** — esconder actions/sidebar/drawer em `@media print`.

---

## Como regenerar este pacote

```bash
cd /home/z/my-project
python3 scripts/parse_cko.py           # valida extração
python3 scripts/gen_manual_identidade.py
python3 scripts/gen_componentes_site.py
python3 scripts/gen_componentes_editoriais.py
python3 scripts/gen_contratos.py
python3 scripts/gen_templates.py
python3 scripts/gen_indice_master.py    # este arquivo
```

Todos os scripts persistem em `/home/z/my-project/scripts/` e podem ser editados e re-executados.

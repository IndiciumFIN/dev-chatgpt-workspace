# CE Experience Platform — Matriz de Capacidades v0.1.0

**Status:** CANDIDATE / HOLD_HUMAN  
**Registry:** `registers/canonical/experience-capability-registry.candidate.v0.1.json`

## Cobertura do registry

| Família | Capabilities |
|---|---:|
| CAPTURE | 9 |
| CLINICAL_EXPERIENCE | 11 |
| COMMAND_ACTION | 6 |
| CONTINUITY | 8 |
| DISCOVERY | 13 |
| FEEDBACK | 5 |
| FOLLOW_ALERT | 11 |
| HELP | 13 |
| LEARNING | 10 |
| LIFECYCLE | 9 |
| ORGANIZATION | 9 |
| OUTPUT | 8 |
| PERSONALIZATION | 9 |
| PREVIEW | 13 |
| QUALITY | 8 |
| SETTINGS | 13 |
| SHARING_COLLAB | 12 |
| TRIAGE | 6 |
| VIEWS | 14 |
| WORKSPACE | 14 |

**Total:** 201 capabilities em 20 famílias.

> Contagem representa vocabulário lógico reutilizável. Não equivale a quantidade de componentes, endpoints ou microsserviços.

## Estado atual da branch → destino canônico

| Atual | O que já resolve | Limitação | Destino canônico |
|---|---|---|---|
| `template-contract.ts` | tools por tipo de template | mistura capability, derivado e formato | Template slots + CapabilityResolver |
| `PageTools` | favorite, print/PDF, TTS, DOCX, clear, report | estado local e ações hardcoded | ActionBar renderer |
| `LibraryActions` | favorite, share, print/PDF, coleção | duplicação de PageTools | ActionBar renderer + bindings |
| `Hint` | tooltip/popover de campo | conteúdo preso ao componente | HelpContent + HelpBinding |
| `ToolViewBar` | padrão/beira/offline | setting local em sessionStorage | SettingsRegistry + ViewPreference |
| `StudyDesk` | quiz/flashcard de demonstração | dados hardcoded e sem persistência | Learning Experience |
| `local-workbench-store` | estado local admin | escopo específico | StorageAdapter candidato |
| `local-publication-register` | draft/published + revision events | publicação local/admin | referência para Lifecycle/Event, não reutilizar diretamente |
| `preview-host-bridge` | preview técnico/embed | não é preview de produto | preservar; ProductPreview separado |
| `related-content` | cards relacionados | relação/projeção local | Relation/Recommendation projection |
| `component-contract.ts` | inventário de componentes e status | componente ≠ capability | Renderer/Component Registry |
| `surface-contracts.v2` | presença estática de imports | não mede comportamento/visual | manter como Surface Contract |
| `surface-binding-register.v2` | reconciliação estática | não mede capabilities | adicionar Capability Binding paralelo |
| Career candidate DB | progress, projection, content, governance | escopo Carreira | consumir Experience Platform global |
| auth | identidade | ainda não é requisito universal | AccountAdapter opcional |
| local/session storage | estados locais | chaves e semântica fragmentadas | ExperienceState + StoragePolicy |

## Capability ≠ UI control

Exemplos:

| Capability | Renderizações possíveis |
|---|---|
| FAVORITE | coração, estrela, menu contextual, command palette |
| PREVIEW | drawer, modal, quick card, side panel |
| HELP | tooltip, popover, inline, drawer, guide |
| OUTPUT | menu Exportar, botão Imprimir, quick action |
| SETTINGS | página, drawer, modal, inline controls |
| SAVED_VIEW | sidebar item, dropdown, home card |
| ALERT | toggle, action menu, saved-search workflow |

O renderer muda por canal; a capability e seu estado permanecem estáveis.

## Output formats

`CAP-OUTPUT` é a capability. Formatos são adapters:

| Adapter | Exemplos de validators |
|---|---|
| HTML | semantic structure, links, a11y |
| PRINT | print CSS, page breaks |
| PDF | pagination, metadata, links, PDF accessibility |
| DOCX | styles, headings, tables |
| PPTX | overflow, contrast, speaker notes |
| XLSX | cell types, formulas, filters/panes |
| CSV | delimiter/encoding/schema |
| JSON | schema validation |
| Markdown | structure/links |
| Image | resolution, alt/rights |
| Clipboard | sanitization |
| QR | destination integrity |
| Email | template/render/link integrity |
| OfflinePackage | completeness/cache/rights |

## Settings scopes

Precedência proposta:

`SYSTEM → ACCOUNT → DEVICE → WORKSPACE → MODULE → VIEW/OBJECT`.

OutputSettings é subdomínio de Settings, não propriedade fixa de PDF.

## Preview profiles iniciais

- ArticlePreview;
- GuidePreview;
- LibraryEntityPreview;
- ClinicalToolPreview;
- NormPreview;
- SourcePreview;
- AssetPreview;
- CoursePreview;
- TrailPreview;
- JobOpportunityPreview;
- CompetitionPreview;
- ResidencyPreview;
- ResearchProjectPreview;
- OutputPreview;
- DiffPreview.

Os profiles de tipos ainda não globais permanecem candidatos.

## Experience state policy

| Estado | Guest | Local | Account | Sync |
|---|---|---|---|---|
| Favorite | sim | sim | opcional | opcional |
| ReadLater | sim | sim | opcional | opcional |
| Recent | sim | sim | opcional | opcional |
| ViewPreference | sim | sim | opcional | opcional |
| Progress não sensível | sim | sim | opcional | opcional |
| Personal Note | política | sim | opcional | opcional |
| Clinical input/result | policy específica | policy específica | não herdar automaticamente | não herdar automaticamente |
| Alert | sim se local | sim | opcional | opcional |
| Share/private link | não necessariamente | não | conta/permission | servidor |

## Benchmark → decisão arquitetural

| Referência | Padrão observado | Decisão CE |
|---|---|---|
| Raindrop | coleções, tags, highlights, hygiene, batch actions | Organization + Quality + Workspace |
| Readwise Reader | unified reading inbox, annotations, filtered views, TTS | Capture/Triage + Views + Annotation |
| Zotero | collections, tags, saved searches, duplicates | Collection ≠ SavedView; hygiene |
| Airtable | vários tipos de view sobre o mesmo dado; personal/locked | ViewDefinition com scopes |
| Linear | favoritos incluem custom views; command access | FavoriteView + Command Palette |
| Notion | Home configurável com Recents/Favorites | Dashboard composition |
| Figma | version history/checkpoints/branching | Lifecycle/Version UX separado de release |

## Padrões proibidos após homologação futura

- novo `useState` de Favorite por componente;
- criar `course_favorite`/ `article_favorite`;
- adicionar formato novo a `pageToolIds`;
- criar `PdfService` como domínio transversal;
- salvar setting novo em chave avulsa sem SettingDefinition;
- escrever conteúdo de tooltip diretamente no renderer quando for conhecimento reutilizável;
- criar view nova duplicando tabela/dados;
- fazer login obrigatório para estado local básico sem política explícita;
- misturar PersonalCollection com coleção editorial;
- usar technical preview bridge como ProductPreview contract.

## Próxima decisão humana

Antes da Wave 1 de implementação, revisar:
1. famílias e IDs;
2. capabilities redundantes;
3. tipos de objeto alvo;
4. guest/account baseline;
5. storage/privacy classes;
6. formato do CapabilityBinding;
7. naming final em inglês/PT-BR para UI versus IDs técnicos.

Somente após isso criar schemas e resolver runtime.

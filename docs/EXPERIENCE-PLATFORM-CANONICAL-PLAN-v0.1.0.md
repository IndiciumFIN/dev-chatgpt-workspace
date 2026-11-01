# CE Experience Platform — Planejamento Canônico v0.1.0

**Status:** CANDIDATE / HOLD_HUMAN  
**Objetivo:** estabelecer a camada transversal de experiência do ecossistema Calculadoras de Enfermagem sem criar silos por página, domínio ou formato.

## 1. Decisão arquitetural

A plataforma deve separar:

1. **Canonical Object** — o que a coisa é.
2. **Capability** — o que pode ser feito com ela.
3. **Capability Binding** — quais capabilities aquele tipo de objeto suporta.
4. **Context** — usuário/guest, canal, audiência, permissão, estado, locale, dispositivo.
5. **Resolver** — quais ações são permitidas agora.
6. **Renderer** — como a capability aparece nesta superfície.
7. **State** — estado persistível da experiência.
8. **Event** — fato ocorrido na experiência.
9. **Output** — projeção/renderização para um formato.
10. **Governance** — privacy, a11y, rights, release e audit.

### Invariantes

- Capability ≠ Component.
- Capability ≠ Template.
- Capability ≠ Output format.
- Capability ≠ Canonical Object.
- View ≠ Data.
- Collection editorial ≠ Collection pessoal.
- Canonical Relation ≠ Personal Relation.
- Preview técnico ≠ Product Preview.
- HelpContent ≠ Tooltip.
- PDF/DOCX/PPTX/XLSX ≠ serviços de primeiro nível.
- Guest state não deve exigir login por padrão.
- Sync é uma capability adicional, não pré-condição do estado local.
- Nenhum renderer pode inventar capability ausente no binding.
- Nenhuma capability pode ultrapassar policy/release gate.

## 2. Metamodelo mínimo

### ExperienceCapability

Campos mínimos:

```text
capability_id
name
family
kind
state_contract_ref?
action_contract_ref?
supported_channels
guest_support
authenticated_support
storage_policy
sync_policy
privacy_class
permission_policy
offline_behavior
accessibility_contract_ref
telemetry_contract_ref
help_profile_ref?
preview_profile_ref?
output_profile_refs?
release_status
```

### ObjectCapabilityBinding

```text
object_type
capability_id
support
resolver
channels
audiences?
permissions?
state_constraints?
format_constraints?
policy_refs?
```

### ExperienceState

```text
state_id
owner_scope        SESSION | LOCAL_DEVICE | ACCOUNT | WORKSPACE
owner_ref?
object_ref
object_type
capability_id
state_payload
created_at
updated_at
sync_state
privacy_class
retention_policy_ref
```

Nunca criar `course_favorite`, `article_favorite`, `calculator_favorite` etc. O estado é polimórfico por `object_ref + capability_id`.

## 3. Capability Resolver

Entrada:

```text
CanonicalObject
ObjectCapabilityBinding
Context
Policy
Entitlement
CurrentState
Channel
Audience
Device
Locale/Jurisdiction
```

Saída:

```text
AvailableAction[]
DisabledAction[]
HiddenAction[]
Reason[]
HelpBinding[]
```

O resolver não executa a ação; apenas determina disponibilidade e razão.

Exemplo:

```text
Competition + Guest + Web + BR
→ FAVORITE: allowed/local
→ FOLLOW: allowed/local
→ ALERT: allowed/local or account-sync optional
→ COMPARE: allowed
→ OUTPUT: allowed [HTML, PRINT, PDF]
→ APPLICATION: not applicable
```

## 4. Action Bar universal

A Action Bar é renderer do resolver.

Ordem sugerida:
- ação primária contextual;
- Favorite;
- Later;
- Basket;
- Collection;
- Compare;
- Preview;
- Share;
- Output;
- More.

No mobile, overflow/bottom sheet é permitido; no desktop, barra horizontal ou contextual.

Não hardcodar IDs de formato como ações universais.

## 5. Personal Organization

Objetos:
- Favorite;
- Bookmark;
- Pin;
- ReadLater;
- Collection;
- CollectionItem;
- Basket;
- BasketItem;
- PersonalTag;
- StudyQueue.

Semântica:
- Favorite = importância.
- Bookmark = posição/trecho.
- Pin = acesso rápido.
- Follow = futuras mudanças.
- Later = intenção de consumo.
- Collection = organização persistente.
- Basket = seleção de trabalho temporária.

## 6. Capture + Triage

Pipeline:

`Capture → Inbox → Triage → Later/In Progress/Completed/Archive`.

Entradas:
URL, file, share sheet, clipboard, drag/drop, browser extension e OCR futuro.

Capture não promove objeto canônico automaticamente; conteúdos externos entram por ingestion/governance apropriados.

## 7. Views

`ViewDefinition`:

```text
view_id
target_object_type
scope             SYSTEM | PERSONAL | SHARED | LOCKED
query
filters
sort
grouping
layout
visible_fields
owner_ref?
pinned
favorite
version
```

Layouts candidatos:
grid, list, table, gallery, timeline, calendar, kanban.

SavedView armazena uma consulta; Collection armazena associação explícita.

## 8. Search & Discovery

Serviços:
- global;
- local/module;
- in-object;
- facets;
- filters;
- sort/group;
- autocomplete;
- search history;
- saved search;
- semantic/voice como capability futura.

SearchIndex é infraestrutura; Search Experience é capability.

## 9. Preview Platform

`PreviewProfile` deve ser específico por tipo de objeto, porém resolvido por motor único.

Profiles iniciais:
- ArticlePreview;
- CoursePreview;
- OpportunityPreview;
- CompetitionPreview;
- ClinicalToolPreview;
- LibraryEntityPreview;
- NormPreview;
- SourcePreview;
- AssetPreview;
- OutputPreview;
- DiffPreview.

Propriedades:
```text
profile_id
object_type
fields
sections
actions
evidence_visibility
source_visibility
preview_surface
responsive_behavior
```

Superfícies:
quick, drawer, modal, detail, inline.

Objetivo: inspecionar sem perder contexto do catálogo.

## 10. Settings Platform

`SettingDefinition`:

```text
setting_id
scope
type
default
validation
inheritance
storage
sync_policy
privacy_class
channels
```

Scopes:
SYSTEM, ACCOUNT, DEVICE, WORKSPACE, MODULE, VIEW, OBJECT, OUTPUT.

Exemplos:
- locale;
- accessibility;
- notification;
- privacy;
- view layout;
- density;
- default filters;
- tool mode;
- output paper/orientation;
- include references/QR/cover;
- offline preference.

Resolução:
`SYSTEM default → account → device → workspace → module → view/object override`.

## 11. Contextual Help

Modelo:
`HelpContent → HelpBinding → HelpRenderer`.

HelpContent pode ligar:
- glossary term;
- formula definition;
- claim;
- source;
- canonical object;
- example;
- guide.

Renderizadores:
tooltip, popover, inline, drawer, modal, guided help.

Assim `Tooltip` deixa de ser fonte de conteúdo.

## 12. Output Platform

Modelo:

`Object → Projection → OutputProfile → OutputRequest → Renderer → FormatAdapter → FormatValidator → Artifact`.

FormatAdapters candidatos:
HTML, PDF, PRINT, DOCX, PPTX, XLSX, CSV, JSON, Markdown, PNG/JPEG/WEBP, Clipboard, QR, Email, OfflinePackage.

OutputProfile exemplos:
- clinical-result;
- article;
- study-pack;
- pocket;
- presentation;
- report;
- data-export.

Cada adapter possui validators específicos. Exemplo:
- PDF: paginação, links, metadados, acessibilidade;
- DOCX: estilos, headings, tables;
- PPTX: overflow, notes, contrast;
- XLSX: tipos, fórmulas, panes.

Preview deve preceder render quando o canal permitir.

## 13. Continuity

Objetos/estados:
- RecentItem;
- InteractionHistory;
- Progress;
- Completion;
- ResumeState;
- LastPosition;
- SessionResume.

A Home/Minha Área consome essas projeções; não mantém banco próprio.

## 14. Annotation

Estados pessoais:
- Note;
- Highlight;
- Annotation;
- PersonalRelation.

PersonalRelation nunca altera CanonicalRelation.

Trechos precisam de locator estável e version-aware.

## 15. Follow, Alerts, Calendar

```text
Follow
SavedSearch
SavedFilter
ObjectSubscription
AlertRule
Reminder
Notification
Digest
CalendarEvent
```

Exemplo:
`SavedView/Query → AlertRule → Event match → Notification`.

CalendarEvent é derivado de datas de CourseOffering, Competition, Residency, Credential etc.

## 16. Lifecycle & Recovery

Dois níveis:

### Personal lifecycle
Inbox → Later → In Progress → Completed → Archive.

### Object/workspace lifecycle
Draft → Review → Assured → Released → Retired.

Capabilities:
Trash, Restore, SoftDelete, VersionHistory, CompareVersions, VersionPreview, RestoreVersion, Undo/Redo, ConflictResolution.

Nunca confundir Archive pessoal com Retired canônico.

## 17. Quality/Hygiene

Capabilities de experiência podem expor resultados de serviços governados:
- duplicate detection;
- broken link;
- stale content;
- expiration;
- source changed;
- integrity;
- rights/license.

A detecção pode ser automática; merge/promoção respeitam governança.

## 18. Learning Experience

Não hardcodar quizzes/cards em surfaces.

Objetos/serviços:
- Question;
- Attempt;
- Flashcard;
- ReviewState;
- Progress;
- Completion;
- StudyQueue;
- CoursePlayerState.

Capabilities:
continue learning, flashcards, spaced repetition, quiz attempt, simulation attempt, learning history, learning mode.

## 19. Clinical Experience

Capabilities:
- calculation history;
- last inputs;
- presets;
- example data;
- calculation steps;
- copy/save result;
- simulator;
- converter;
- safety alert;
- related resources.

Dados clínicos/sensíveis têm policy própria e não herdam automaticamente a persistência de estados pessoais comuns.

## 20. Guest, account e sync

Modelo recomendado:

```text
Guest
→ Session State
→ Local Device State
→ optional account claim/sync

Authenticated
→ Account State
→ optional cross-device sync
```

Capability define:
- guest allowed?;
- local storage allowed?;
- account sync allowed?;
- retention?;
- export/delete?;
- privacy class.

Login não deve ser condição para Favorite/ReadLater/Recents/View Preferences quando policy permitir.

## 21. Event backbone

Eventos candidatos:

```text
OBJECT_VIEWED
PREVIEW_OPENED
FAVORITE_SET
READ_LATER_SET
COLLECTION_ITEM_ADDED
BASKET_ITEM_ADDED
VIEW_SAVED
SEARCH_SAVED
FOLLOW_SET
ALERT_TRIGGERED
PROGRESS_CHANGED
OUTPUT_REQUESTED
OUTPUT_RENDERED
SHARE_CREATED
HELP_OPENED
SETTING_CHANGED
VERSION_RESTORED
DUPLICATE_FOUND
SOURCE_CHANGED
```

Eventos canônicos não dependem de GA/telemetry vendor.

## 22. Privacy, security e accessibility

Toda capability declara:
- privacy class;
- retention;
- storage scope;
- export/delete behavior;
- a11y contract;
- abuse/rate constraints.

Output, Preview, Share e Offline devem respeitar rights/licensing.

## 23. Admin

Admin é task-oriented.

Módulo Experience:
- Capability Registry;
- Object Bindings;
- Preview Profiles;
- Help Registry;
- Settings Registry;
- Output Profiles/Adapters;
- Saved/System Views;
- Lifecycle/Quality;
- Event/Telemetry Registry.

O admin não deve editar grafo bruto como fluxo principal.

## 24. Builder

Builder não cria a lógica de Favorite/Preview/Output.

Ele seleciona declarativamente:
- object type;
- template;
- slots;
- capabilities permitidas;
- action placement;
- preview profile;
- help bindings;
- output profiles;
- settings surface.

Runtime resolve as ações.

## 25. Benchmark de mercado

Referências oficiais consultadas em 2026-10:
- Raindrop.io — collections/tags/highlights/full-text/duplicates/broken-links/reminders/batch actions.
- Readwise Reader — unified inbox, imports, highlights/notes, filtered views, TTS e sharing.
- Zotero — collections, tags, saved searches, duplicate items.
- Airtable — múltiplas views sobre o mesmo dado; personal/collaborative/locked views.
- Linear — favoritos incluindo custom views e command access.
- Notion — Home com Favorites/Recents e seções configuráveis.
- Figma — branching/version history/checkpoints antes de merge.

A proposta não copia interfaces; usa os padrões arquiteturais recorrentes como evidência de maturidade.

## 26. Estado da branch avaliada

### Já existe e deve ser reaproveitado
- template contracts;
- surface/route contracts;
- PageTools;
- LibraryActions;
- Hint;
- ToolViewBar;
- local publication register;
- technical preview bridge;
- auth;
- local state primitives;
- clinical history/memory concepts;
- feedback/report;
- related content.

### Precisa ser promovido a capability global
- favorite;
- listen/TTS;
- reading state/time;
- share;
- view preference;
- progress;
- feedback;
- preview;
- help;
- output;
- related content.

### Precisa ser criado
- Capability Registry;
- ObjectCapabilityBinding;
- Resolver;
- ExperienceState;
- SavedView;
- Settings Registry;
- Help Registry;
- Preview Profiles;
- Output Profiles;
- Lifecycle/Recovery;
- Capture/Inbox;
- Batch Actions;
- Follow/Alert;
- Event contract.

## 27. Não objetivos desta wave

- não refatorar runtime;
- não apagar PageTools/LibraryActions;
- não alterar main;
- não criar microsserviços físicos;
- não promover registry candidato para canônico homologado;
- não assumir sync/cloud;
- não alterar Kernel.

## 28. Critério de promoção futura

O modelo só deve sair de CANDIDATE_HOLD quando:
1. metamodelo aprovado;
2. IDs estabilizados;
3. schemas criados;
4. guest/auth policies definidas;
5. privacy/a11y contracts definidos;
6. bindings de objetos revisados;
7. adapter de compatibilidade implementado;
8. runtime resolver testado;
9. migração sem regressão comprovada;
10. Kernel/release gates aplicáveis concluídos.

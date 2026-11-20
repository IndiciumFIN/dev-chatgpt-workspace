# CE Experience Platform — Roadmap de Migração v0.1.0

**Status:** CANDIDATE_PLAN  
**Princípio:** control-plane first, closure-first, pilot-first, sem regressão.

## Wave 0 — Freeze semântico

Objetivo: impedir criação de novas ações locais incompatíveis.

Entregas:
- Capability Registry candidato;
- ObjectCapabilityBinding candidato;
- nomenclatura oficial;
- FINDs documentados;
- regra: novo recurso transversal exige capability ID antes de componente específico.

Sem alteração visual.

## Wave 1 — Schemas/control plane

Criar schemas candidatos:
- experience_capability;
- object_capability_binding;
- experience_state;
- experience_event;
- saved_view;
- preview_profile;
- setting_definition;
- help_content/help_binding;
- output_profile/output_request;
- lifecycle_transition.

Gates:
- IDs únicos;
- Draft 2020-12;
- sem formato específico no nível de capability, salvo adapters;
- sem PII obrigatório;
- release HOLD.

## Wave 2 — Capability Resolver

Criar resolver puro/determinístico.

Entrada:
object type + binding + context + policy + state.

Saída:
AvailableAction/DisabledAction/Reason.

Testar sem UI.

Piloto sugerido:
**Article + LibraryEntity + ClinicalTool**, porque já possuem ações redundantes e permitem provar generalidade.

## Wave 3 — State substrate

Introduzir storage adapter:

```text
SessionAdapter
LocalDeviceAdapter
AccountAdapter (futuro)
SyncAdapter (futuro)
```

Migrar primeiro:
- Favorite;
- ReadLater;
- Recent;
- ViewPreference.

Não migrar dados clínicos nessa wave.

## Wave 4 — Action Bar unificada

Criar renderer único sobre resolver.

Compatibilidade:
- PageTools continua;
- LibraryActions continua;
- ActionBar nova roda em paralelo no piloto;
- snapshot/E2E compara ações.

Depois de paridade comprovada:
- PageTools vira adapter/compat layer;
- lógica duplicada é removida incrementalmente.

## Wave 5 — Preview + Help

### Preview
Profiles:
Article, LibraryEntity, ClinicalTool, Course/Opportunity quando globais.

### Help
Migrar `Hint`:
conteúdo deixa de morar no componente; Hint vira renderer.

Não misturar preview técnico/embed com product preview.

## Wave 6 — Settings

Introduzir registry e inheritance.

Migrar `cde-vista` do ToolViewBar para setting declarativo:
`SETTING-CLINICAL-VIEW-MODE`.

Compat layer lê chave antiga e promove para novo estado, sem apagar valor legado até reconciliação.

## Wave 7 — Output

Substituir semântica:
`pdf/docx/print` → `CAP-OUTPUT` + format adapters.

Primeiro preservar UI existente.

Exemplo de binding:
```text
ClinicalTool
 CAP-OUTPUT:
   profiles: [clinical-result]
   formats: [PRINT, DOCX]
```

Para Guide:
```text
Guide
 CAP-OUTPUT:
   profiles: [guide]
   formats: [PRINT, PDF]
```

Não remover formato até validator equivalente existir.

## Wave 8 — Views/Search/Collections

Materializar:
SavedView, SmartCollection, SavedSearch.

Pilotar em Bibliotecas:
- grid/list/gallery;
- filters;
- personal saved view;
- collection;
- basket.

Depois reutilizar em Cursos/Concursos/Vagas.

## Wave 9 — Lifecycle/Recovery

Criar Archive/Trash/Restore/VersionPreview/Diff.

Primeiro aplicar a objetos pessoais/workspaces.

Conteúdo canônico governado continua usando release/governance lifecycle próprio.

## Wave 10 — Learning Experience

Retirar hardcode do `StudyDesk`.

Substituir por:
QuestionBank → Attempt → Progress → Flashcard/ReviewState.

Preservar StudyDesk como specimen até paridade.

## Wave 11 — Event backbone / telemetry

Emitir eventos canônicos sem acoplar vendor.

Validar:
- eventos não contém dados clínicos indevidos;
- consent/analytics policy;
- retry/idempotency quando necessário.

## Wave 12 — Guest/Auth/Sync

Somente depois do estado local estabilizado.

Definir migration path:
GuestLocalState → AccountClaim → SyncedState.

Conflitos:
- last-write-wins não é default universal;
- Collections/Notes podem exigir merge;
- settings podem usar precedence;
- attempts/history são append-oriented.

## Wave 13 — expansão global

Depois dos pilotos:
- Course;
- Trail;
- JobOpportunity;
- Competition;
- Residency;
- ResearchProject;
- Norm;
- Question;
- Simulation;
- Organization;
- MediaAsset.

## Matriz de prioridade

### P0
Capability Registry, Binding, Resolver, State, Action Bar, Preview, Settings, Help, Output.

### P1
Saved Views, Saved Search, Collections/Basket, Lifecycle/Recovery, Event Backbone.

### P2
Capture/Inbox, Follow/Alerts, Collaboration, advanced semantic/voice search, sync.

## Critérios de não regressão

Cada migração deve demonstrar:
- mesma ação existente continua disponível;
- labels/a11y não pioram;
- estado legado é lido;
- nenhum dado é apagado automaticamente;
- output existente permanece reproduzível;
- noindex/candidate rules preservadas;
- E2E desktop/mobile;
- audit trail da alteração.

## Rollback

Toda wave deve:
- manter compat adapter;
- permitir feature flag ou binding disable;
- não converter estado destrutivamente;
- registrar migration version;
- conservar export do estado legado.

## Arquivos alvo futuros

Prováveis novos módulos:
```text
src/core/experience/capabilities.ts
src/core/experience/resolver.ts
src/core/experience/state.ts
src/core/experience/events.ts
src/core/experience/views.ts
src/core/experience/preview.ts
src/core/experience/settings.ts
src/core/experience/help.ts
src/core/experience/output.ts
src/components/experience/action-bar.tsx
```

Esses caminhos são proposta, não implementação homologada.

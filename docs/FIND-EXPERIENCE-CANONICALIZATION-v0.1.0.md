# FIND — Canonicalização da Experience Platform v0.1.0

**Status:** CANDIDATE_FINDINGS  
**Branch avaliada:** `feat/career-youth-db-first-20261026`  
**Escopo:** experiência transversal; nenhum runtime foi alterado nesta wave documental.

## Resumo

A branch já possui capacidades relevantes de experiência, porém elas estão distribuídas por templates, componentes e estados locais sem um registro canônico global. O principal risco não é ausência de funcionalidades isoladas; é **duplicação semântica e acoplamento entre capability, componente, formato e template**.

## FIND-EXP-001 — não existe Experience Capability Registry global

Não foi localizado registro canônico equivalente a `Favorite`, `Preview`, `Settings`, `Help`, `SavedView`, `Lifecycle`, `Output`, `Alert` etc.

**Impacto:** cada superfície decide capacidades localmente.  
**Proposta:** `registers/canonical/experience-capability-registry.candidate.v0.1.json`.

## FIND-EXP-002 — ações estão codificadas por template

`src/lib/template-contract.ts` define `pageToolIds` como:

- favorite;
- print;
- pdf;
- readingTime;
- listen;
- docx;
- clear;
- report.

O template escolhe ferramentas diretamente.

**Problema canônico:** `PDF` e `DOCX` são formatos/adapters, enquanto `favorite` é uma capability persistível e `readingTime` é informação derivada. Eles não pertencem ao mesmo nível de abstração.

**Proposta:** Template declara slots/surfaces; `CapabilityResolver` decide ações; `OutputService` resolve formatos.

## FIND-EXP-003 — Favorite é apenas estado de componente/visita

`src/components/site/page-tools.tsx` mantém `favorite` com `useState`. A própria UI informa "Nos favoritos desta visita".

`src/components/templates/library-canonical.tsx` repete lógica semelhante em `LibraryActions`.

**Impacto:** comportamento divergente, sem persistência comum, sem guest/account model e sem sincronização declarativa.

**Proposta:** `FavoriteState` transversal + renderer reutilizável.

## FIND-EXP-004 — Action Bars duplicadas

Existem pelo menos:
- `PageTools`;
- `LibraryActions`;
- ações específicas de ferramentas clínicas.

**Impacto:** labels, estados, acessibilidade, disponibilidade e analytics tendem a divergir.

**Proposta:** Action Bar declarativa sobre `CapabilityBinding`.

## FIND-EXP-005 — Preview técnico != Preview de produto

A branch contém `preview-host-bridge`, `preview-embedder-origin` e regras de embed/origin.

Esse preview é infraestrutura técnica para hospedar/renderizar superfícies, não um serviço de experiência do usuário com profiles de Course/Competition/Article/Source/Output etc.

**Proposta:** preservar a infraestrutura atual e introduzir `PreviewCapability` + `PreviewProfile` sem reutilizar nomes de forma ambígua.

## FIND-EXP-006 — Help está embutido em componentes

`Hint` em `src/components/tools/interface.tsx` implementa tooltip/popover local. `component-contract.ts` registra `tooltip` como componente.

**Problema:** Tooltip é apenas uma superfície. O conteúdo de ajuda deveria ser canônico e poder renderizar como tooltip, popover, inline, drawer ou guide.

**Proposta:** `HelpContent + HelpBinding + HelpRenderer`.

## FIND-EXP-007 — Settings não possuem registry nem escopo

`ToolViewBar` persiste `cde-vista` em `sessionStorage` e decide `padrao/beira/offline` localmente.

Existem preferências implícitas em diferentes superfícies, mas não há contrato uniforme para:
- ACCOUNT;
- DEVICE;
- WORKSPACE;
- MODULE;
- VIEW;
- OBJECT;
- OUTPUT.

**Proposta:** `SettingsRegistry` com herança, default, validação e storage policy.

## FIND-EXP-008 — Output está fragmentado por formato

Hoje `print`, `pdf` e `docx` aparecem como ferramentas de primeiro nível.

**Proposta:** `OutputRequest → Projection → OutputProfile → Renderer → FormatAdapter → Validator`.

Formatos candidatos:
HTML, PDF, PRINT, DOCX, PPTX, XLSX, CSV, JSON, Markdown, image, clipboard, QR, email e offline package.

## FIND-EXP-009 — View não é objeto canônico da experiência

Bibliotecas já possuem alternâncias locais de view e a arquitetura aceita grade/lista, porém não existe `ViewDefinition` reutilizável com:
- query;
- filters;
- sort;
- grouping;
- layout;
- visible fields;
- scope;
- owner;
- lock;
- pin/favorite.

**Proposta:** `SYSTEM_VIEW | PERSONAL_VIEW | SHARED_VIEW | LOCKED_VIEW`.

## FIND-EXP-010 — lifecycle/recovery de usuário não está formalizado

O projeto tem forte governança/versionamento técnico e o `local-publication-register` possui revision/event history, mas a experiência pública não tem contratos transversais para:
Archive, Trash, Restore, Undo, Redo, Version Preview, Diff e Restore Version.

**Proposta:** separar lifecycle do objeto canônico de lifecycle do estado pessoal.

## FIND-EXP-011 — StudyDesk é piloto local e não Learning Experience canônica

`src/components/site/study.tsx` contém questões e flashcards hardcoded e informa que nada é salvo.

**Impacto:** útil como prova visual, mas não reutiliza Question Bank, Attempt, Progress, StudyQueue ou SpacedRepetition.

**Proposta:** manter como specimen/piloto até substituição por bindings canônicos. Não promover como fonte de verdade.

## FIND-EXP-012 — surface contracts medem import estático, não capability parity

`surface-contracts.v2.json` e `surface-binding-register.v2.json` são valiosos para integridade estrutural, porém o próprio registro declara `STATIC_PASS_NOT_VISUAL`.

**Proposta:** não sobrecarregá-los. Criar camada separada:
`ObjectType → CapabilityBinding → Surface/Channel Resolver`.

## FIND-EXP-013 — guest/auth/local não possui política unificada

Há estados locais em React, `sessionStorage`, `localStorage`, workbench local e módulo de autenticação.

**Proposta:** política explícita por capability:
- `SESSION`;
- `LOCAL_DEVICE`;
- `ACCOUNT`;
- `SYNCED_ACCOUNT`;
- `WORKSPACE`.

Baseline sugerido: Favoritos, Ler Depois, Recentes, View Preferences e progresso não sensível devem poder funcionar sem login quando tecnicamente seguro.

## FIND-EXP-014 — faltam Event/Telemetry contracts da experiência

Ações como favorite, preview, compare, export, alert, resume e view-change não possuem evento canônico transversal.

**Proposta:** `ExperienceEvent` separado de analytics vendor-specific.

## FIND-EXP-015 — faltam serviços de higiene da experiência

Não há camada pública uniforme para:
- duplicate detection;
- broken links;
- stale content;
- source changed;
- expiration;
- rights check.

Alguns controles existem em governança/ingestion, mas não como capability consumível.

## FIND-EXP-016 — não há Action Resolver por contexto

Hoje o template/componente decide diretamente o que renderizar.

**Proposta:**
`Object + CapabilityBinding + User/Guest + Channel + Audience + Permission + State + Policy → AvailableAction[]`.

## Decisão proposta

Não substituir imediatamente componentes existentes. Criar o Control Plane de Experience primeiro, depois migrar renderizadores incrementalmente.

**Regra de não regressão:** nenhuma action atual deve desaparecer por causa da canonicalização; primeiro ela ganha binding e só depois o código local é retirado.

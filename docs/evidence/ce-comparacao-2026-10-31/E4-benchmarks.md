# E4 — Plataformas de referência (o que "excelência" significa neste domínio)

Benchmark oficial do próprio plano (`docs/EXPERIENCE-PLATFORM-CANONICAL-PLAN-v0.1.0.md`, secção 25, referências consultadas em 2026-10):
- **Raindrop.io** — collections/tags/highlights/full-text/duplicates/broken-links/reminders/batch actions.
- **Readwise Reader** — unified inbox, imports, highlights/notes, filtered views, TTS e sharing.
- **Zotero** — collections, tags, saved searches, duplicate items. (Coleções ≠ Saved Searches: coleção é associação persistida; Saved Search é consulta persistida; SmartCollection é projeção dinâmica.)
- **Airtable** — múltiplas views sobre o mesmo dado; views pessoais/colaborativas/bloqueadas.
- **Linear** — favoritos incluindo custom views e command access.
- **Notion** — Home com Favorites/Recents e seções configuráveis.
- **Figma** — branching / version history / checkpoints antes de merge.

Do texto do dono (blueprint): **Capture → Inbox → Triage → Later / In Progress / Completed / Archive** (referência Readwise Reader) · Coleções e Saved Searches como objetos distintos (referência Zotero) · Lifecycle & recovery promovidos a gap real (referência Figma: histórico e checkpoints em branches) · **Guest continua first-class** (Guest → Session State → Local Device State → optional account/sync) · A "Área" deixa de ser uma tela e passa a ser composição configurável de projeções (Favoritos · Continuar · Recentes · Ler depois · Coleções · Cesta · Trilhas · Cursos · Simulados · Concursos · Vagas · Candidaturas · Alertas · Calendário · Passaporte) — referência Notion Home.

## Consequências para o esqueleto (o que o benchmark exige que ele tenha)
- Saved Views/Search **e** Collections como **objetos distintos** → o esqueleto tem `views.ts` declarado como ausente.
- Lifecycle & recovery (archive/trash/restore/undo/redo/version/diff/conflict) → ausente.
- Event backbone com duplicados, links quebrados, stale objects (higiene do Zotero/Raindrop) → ausente.
- Triage de capture/inbox → ausente.
- Guest-first é uma **decisão de arquitetura**, não um detalhe → já está no `ExperienceState` canónico (owner_scope SESSION/LOCAL_DEVICE), mas sem sync/account.
- "Área" configurável = Home por projeções → exige **Views/Projections**, que o blueprint lista como serviço mas o esqueleto não implementa.

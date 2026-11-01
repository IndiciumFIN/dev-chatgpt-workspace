# Vila do Cuidado — piloto candidato 0.1.0
Branch: `viladocuidado`. Main untouched. No production deployment.
## Scope
- `/viladocuidado`: React educational exploration, filters and interactive steps; no persistence or personal data.
- `src/lib/vila-canonical.ts`: candidate content registry, explicit identifiers, source references and template binding.
- `contracts/vila`: JSON Schema plus required template slots.
- `migrations/candidate/vila`: PostgreSQL schema candidate, NOT APPLIED and not a production migration.
## Boundaries
- Content is invented editorial demonstration, not an approved clinical source.
- Visual style is a candidate, not a claim to match an approved Vila brand.
- No child data, PHI, logins or anonymous remote mutation paths.
- No linkage to Supabase or production; no implicit qualification of evidence.
- WO `docs/viladocuidado/wo-candidate.v0.1.0.json` remains NOT_SUBMITTED/HOLD_HUMAN.
- Route is noindex; publication requires human review, approved design, policy admission and executed QA.
## Required verification
Run `npm run typecheck`, `npm test`, `npm run build:spa`, then capture mobile/desktop visual QA. No test result can be claimed without actually running it.

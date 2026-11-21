# Source-generated contract reconciliation — 2026-11-15

Generator `scripts/generate-entity-contracts.mjs` executed in GitHub Actions #43681572484 on commit `967a5cc40086a16758c82a88d06063d35c1cdb7c`.

| Derived contract | Previous count | Reconciled | Loss | Decision |
| --- | ---: | ---: | ---: | --- |
| clinical-tools.v1.json | 7 | 7 | 0 | PASS: same content by ID, only ordering changed |
| routes.v1.json | 31 | 51 | 0 | PASS: 20 newly observed paths |
| components.v1.json | 17 | 19 | 0 | PASS: 2 newly observed components |
| chrome-bands.v1.json | 11 | 0 | 11 | HOLD_DESIGN_SYSTEM_CHROME; no overwrite |

The generated `src/lib/contract-index.generated.ts` cannot be promoted yet because it loses all 11 chrome tokens, whose declarations no longer exist in `src/styles.css`. The old chrome contract remains pinned for traceability, not as proof of live consumption.

The tools `aldrete` and `exames-laboratoriais` are included from `candidateTools`, with `publicacao=candidata`. Source IDs and binding status are derived from the declared field-level normative registry; `EVIDENCE_BOUND` is **not** clinical approval. All release permissions remain HOLD.

## Generated-output hashes
- `contracts/entities/clinical-tools.v1.json`: SHA256 `47cbf95fc3a79fc913735269511533ac863c87a03b75d9dead8318a5fcfb2bba` (7 → 7, added 0).
- `contracts/entities/routes.v1.json`: SHA256 `072967ee64706dcb43349f29751b6c80695e8636f6ffd2f2329b1ae8b15152b9` (31 → 51, added 20).
- `contracts/entities/components.v1.json`: SHA256 `1eed35eb329a71633be8d8b754059976ff28cab38184f3baf0df4b11301ead90` (17 → 19, added 2).

**Release:** NO-GO. Do not remove the 11 chrome tokens or claim that historic token values still drive the UI without a new source-backed design-system reconciliation. No Supabase changes or deployment.

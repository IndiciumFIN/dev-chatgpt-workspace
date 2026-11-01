# SO-009 — Auditoria integrada B3/B4, dossiês e preview
**Data da observação:** 2026-10-26  
**Fonte:** Supabase Calculadoras-Smart (consultas SELECT); GitHub PR #1, SHA 37620805920315c149546a532bec342b603d32d1  
**Status:** EVIDENCE_RECORDED / CANDIDATE / NO_KERNEL_ADMISSION  
**Responsabilidade:** CKO audit/read-only; IA MiniMax detém implementação de preview.

## Evidências observadas
| Origem | Indicador | Valor |
|---|---|---:|
| cko_closure.tool_dossiers | Dossiês cadastrados | 93 |
| cko_governance.md_tool_registry_v2_candidate | Identity resolved | 81 |
| ... | Identity recovered but canonical master hold | 38 |
| ... | Unresolved tool identity | 12 |
| cko_governance.b3_object_crosswalk_v1_candidate | Clinical tool / materialized | 77 |
| ... | LABOR logical tool/materialized | 3 |
| ... | Legacy LABOR aliases | 4 |
| ... | Master materialization missing | 38 |
| ... | Identity unresolved | 12 |
| cko_governance.b4_e2e_binding_registry_v1_candidate | Canonical object scoped hold | 84 |
| ... | Legacy aliases mapped | 4 |
| ... | Unresolved placeholders scoped hold | 12 |
| cko_evidence.sources | Sources | 157 |
| cko_evidence.snapshots | Snapshots | 78 |
| cko_evidence.claims | Claims | 41 |
| cko_governance.b2_source_fanin_v1_candidate | Required snapshots absent | 67 |
| src/lib/admin-module-registry.ts | Modules | 21 |
| ... | Sends / receives | 60 / 54 |
| ... | Directional differences, awaiting contract | 22 |

### Six identity-resolved objects with no fields
`checagem`, `diagnosticosnanda`, `metasinternacionais`, `notificacao-compulsoria`, `regrasmedicacoes`, `vigilancia`.

All six found in `cko_closure.tool_dossiers`, `object_class=tool`, `publication_state=HOLD`, `clinical_state=HOLD`, `review_state=PENDING`, `canonical_promotion=false`.
**No automatic reclassification:** names cannot establish actual semantic type.

## Structured findings
- **FIND-B3-001 / P0:** 38 recovered rows have fields and dossier reference but no canonical master UUID, route, version, or canonical object ref. Require historical identity/materialization proof.
- **FIND-B3-002 / P0:** 12 unresolved records have UUID and dossier link, but no route, version, canonical object ref or field binding.
- **FIND-B3-003 / P1:** Six resolved clinical tools have zero field count and downstream HOLD; require semantic type review.
- **FIND-B4-004 / P1:** Existing B4 and MD E2E registries have declared PK but zero outbound FKs; do not confuse with absence of PK. Layer-stage bindings have two FKs.
- **FIND-PREVIEW-005 / P1:** 21 modules with 22 disagreements between forward and reverse declared edges. Contract semantics not yet agreed.
- **FIND-SOURCE-006 / P0:** 67 sources require snapshots but have none according to projection; inspect rights and source-specific policy first.
- **FIND-EVIDENCE-007 / P1:** Of 99 claim evidence refs, 85 resolve to source/snapshot/fragment; 14 remain external/unclassified; 46 assertion refs resolve.
- **FIND-RUNTIME-008 / P0 before deployment:** HTTP reconciliation is an injectable candidate boundary; no proof of operational backend/OAuth/OPA/PG least privilege.

## Linkage contract — REQUIRED x PRESENT x VALIDATED x PASS
Every admitted object requires identity and immutable version; source, supporting evidence, applicable policy, validator and decision; upstream/downstream typed relationships, route/render binding if published, rights and jurisdiction. Projected UI menus and MDX are consumers, never authoritative masters.

## Execution ledger
- Completed: Supabase read-only catalog and aggregate checks, branch patch audit, SO #9 and issue #10, specialized read-only SQL scripts.
- Not completed: running all read-only audits as a single report, reference resolver for external citations, 38/12/6 remediations, crosswalk module↔B3/B4↔MDX, CI gates, independent approval.
- No SQL mutations, no corporate Kernel promotion, no merge to main. This note documents observation, not an admitted migration.

## Next checkpoints
1. Recover canonical dossiers/versions for 38 records (do not invent IDs).
2. Review 12 unresolved semantic identities and six fieldless objects.
3. Inspect rights, version, route, reviewer evidence and validator integrity.
4. Reuse B3/B4/MD E2E before proposing any new registry; resolve module edge semantics.
5. Run failure cases and reverse-impact checks in isolated environment; then independent checker/WO/Kernel admission.

**References:** GitHub issues #9, #10 and PR #1.

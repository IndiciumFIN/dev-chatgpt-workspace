# CKO specialist execution contract — 2026-10-26
State: CANDIDATE. Scope: preview branch and read-only catalog checks. No autonomous agents executed.

## Orchestrator
Owns task IDs, dependencies, checkpoint ledger, merge criteria and exception routing. The orchestrator cannot approve its own output, change the canonical Kernel, or authorize production.

## Deterministic specialist lanes
| Lane | Input | Output | Gate |
|---|---|---|---|
| SOURCE | source/snapshot/fragment/assertion catalogs | missing required snapshot; broken links | integrity and applicability |
| EVIDENCE | claim JSONB arrays | typed reference resolution, external citation HOLD | schema, target keys and rights |
| SCHEMA | pg_catalog and schema registry | PK/FK/UK/RLS crosswalk, migration candidates | independent DB review |
| KNOWLEDGE | Claim/Requirement/Rule/ContentModule schemas and bindings | REQUIRED×PRESENT×VALIDATED×PASS crosswalk | review and version pins |
| SECURITY | policies, OPA, agent grants and decisions | signed evaluation chain, role segregation and revocation tests | independent Checker |
| PMO/AUDIT | FIND/WO evidence and branch CI | reproducible inventory and closure report | distinct Auditor |

## Execution invariants
1. Only reading and candidate file creation are authorized in this run; no remote DDL, write grants or main branch edits.
2. Every candidate must carry canonical identity, version, provenance, evidence and a typed dependency to its upstream record. Staging candidates may hold incomplete relations, but release cannot.
3. Unknown reference type, absent mandatory edge, license uncertainty or outdated source => scoped HOLD, never blanket PASS.
4. A reference to URL/PMID alone is not evidence of an approved source.
5. No simulated report may be labelled actual agent execution or independent approval.
6. Replay completed validations only if input hash or validator version changes.
7. CI/Kernel admission of real changes requires separate attested WO, policy and reviewer approval.

## Observed baseline
- 161 tables, 175 declared FKs across 6 inspected Supabase schemas.
- 157 sources, 78 snapshots, 41 claims; 67 sources with mandatory snapshot missing according to current projection.
- 99 evidence references, 85 resolved to three canonical targets and 14 unclassified; 46 assertion references resolved.
- Query-only checks found zero orphan fragments, assertions and source links; no full MDX dependency graph verified.

## Next gates
Crosswalk remaining references, determine snapshot policy per source, confirm link-type schema and versioning, test a database migration in an isolated authorized environment, integrate module/projection references, then independent sign-off.

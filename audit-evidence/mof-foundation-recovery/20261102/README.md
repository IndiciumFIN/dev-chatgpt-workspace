# CKO M3 / MOF recovery — evidence-first, non-promotable

**Work order:** `WO-CE-DB-SKELETON-001` (candidate; Kernel admission not proven).
**State:** `PRE_CANONICAL / HOLD_HUMAN`; no production changes, merges, or claims of normative conformity.

## Sources recovered
Original project files are preserved in `sources/`:
- NORMATIVE_BASIS.md, M3_NORMATIVE_CROSSWALK.json, METAMODEL_REFERENCE_BASIS.md
- SOURCE_REGISTRY.json and 04_M3_M0_MASTER_PLAN.md

From the user's previous controlled file library; filenames and content preserved for provenance. A historical package is NOT a new approved standard.

## Read-only observed Supabase 2026-11-02
`pgsybzggewhinaniybiy`: 45 schemas, 606 total tables, 562 application tables, 6486 total columns, 6074 application columns, 49 views.
Selected live **row counts**: normative_reference_catalog=362; metadata_framework_registry=7; metadata_profile_registry=4; metadata_field_registry=37; field_catalog=2496; agent_registry=89; agent_work_items=438; cko_flow.processes=12; pipeline_stages=24; architecture_layer_catalog=63.
Normative catalog lookup of MOF and ISO 11179 identifiers/titles returned 0 matching rows; search is a bounded observation, not exhaustive synonym matching.

## Avoid duplicated tables / duplicate governance
Existing physical tables: `cko_governance.normative_reference_catalog`, `metadata_*_registry`, `field_catalog`, `agent_registry`, `agent_work_items`, `pipeline_stages`, `architecture_layer_catalog`, `cko_flow.processes`, `cko_orch.workflow_instances`, `ce_platform.object_types`, `object_relations`.
Do **not** create another Kernel, normative registry, agent registry or field dictionary without verified semantic gap and accepted WO. MOF's M3/M2/M1/M0 are levels of abstraction, not justification for four redundant physical tables.

## Recovered external reference identifiers
- OMG MOF 2.5.1: https://www.omg.org/spec/MOF/2.5.1 (REFERENCE_ONLY)
- ISO/IEC 11179-3:2023: https://www.iso.org/standard/78915.html (PARTIAL)
- ISO/IEC 11179-35:2023: https://www.iso.org/standard/81727.html (PARTIAL)
- ISO/IEC 11179-3:2023/Amd 1:2026: https://www.iso.org/standard/89914.html (PARTIAL)
- JSON Schema 2020-12: https://json-schema.org/draft/2020-12 (implementation)
- W3C PROV-O: https://www.w3.org/TR/prov-o/ (reference)
No proprietary ISO text included. The extracted M3 source and crosswalk explicitly disallow a claim of full compliance.

## Executable controls
`node scripts/ce-agents/audit-mof-foundation.mjs` checks recovered source and required structural tables against pinned read-only snapshots. `scripts/ce-agents/seed-mof-reference-local.mjs` is guarded against any non-loopback URL; it adds official **metadata only** to the isolated local reconstruction and verifies all six reference IDs.

## Gate and next source needs
The local 562-table skeleton does not yet recreate 2234 defaults, 1834 constraints, 1111 indexes, 94 policy name references, 49 views and database functions/triggers/grants. The existing snapshots are insufficient to reconstruct all definitions/permissions. Full schema-only read-only source acquisition remains blocked until authorized `CE_DB_READONLY_URL` or equivalent signed schema export is available. Keep Kernel, clinical, normative and production gates at `HOLD_HUMAN`.

# CKO School — Definition Family Audit

**Status:** `FAIL_REMEDIATION_REQUIRED`  
**Scope:** Definition-family semantics and currently recovered physical artifacts.  
**Canonical mutation:** NO.

## Finding principal

`Definition` is overloaded across the project. The recovered Foundation specification and physical artifacts support multiple distinct meanings. They cannot share one unconstrained `Definition` schema.

## Physically recovered definition-related artifacts

Recovered/inspected: **6** physical artifacts or contracts.

Important observations:

1. `content/m3/definition.json`, `02_CKO_M3_META_METAMODEL...definition.json`, and the v0.3 `*.definition.json` files are **descriptor-shaped**. They contain artifact/version/status/role/model-chain/non-claims metadata and do not contain the full M3 `classes/relationships/constraints/bindings` payload.
2. `cko.m3.metamodel-definition.schema.json` is a different concept: it requires a full metamodel definition (`metamodel`, `identity`, `version`, `root_class`, `classes`, `relationships`, `constraints`, `bindings`).
3. Therefore the word `definition` currently hides at least two distinct M3 concepts:
   - Artifact Definition Descriptor;
   - Metamodel Definition.
4. Bootstrap `content/m3/definition.json` points to `content/m3/meta_metamodel.schema.json` even though its shape is a descriptor. This is a **role/schema mismatch**, not merely missing required fields.
5. The v0.3 definition descriptor is byte-identical in two physical packages and must be one semantic source with multiple materializations.
6. `job_definition` is separately supported by the Foundation and has a physical M2 candidate.
7. `gate_definition`, `monitor_definition`, content `Definition`, `RegistryItem.Definition` and `ConceptDefinition` are distinct concepts in the Foundation spec; physical contracts/instances for them are not yet proven in this bounded corpus.

## Definition kinds recovered from project evidence

- ARTIFACT_DEFINITION_DESCRIPTOR
- METAMODEL_DEFINITION
- JOB_DEFINITION
- GATE_DEFINITION
- MONITOR_DEFINITION
- CONTENT_DEFINITION
- REGISTRY_ITEM_DEFINITION_SECTION
- CONCEPT_DEFINITION
- DEFINITION_OF_DONE (governance criteria, not automatically an artifact type)

## Rule

Do **not** create a universal `Definition` object.

The correct chain is:

`definition_kind → artifact/profile applicability → field contracts → schema/contract → validator → evidence`

A Definition subsection is not promoted to a standalone artifact merely because it contains the word “Definition”.

## Test result

- Tests executed: **22**
- PASS: **14**
- FAIL/HOLD findings created: **8**

The next remediation target is the M3 Artifact Definition Descriptor contract and the wrong bootstrap schema binding. This must be fixed without changing the full M3 metamodel-definition schema.

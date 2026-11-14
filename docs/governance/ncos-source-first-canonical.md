# NCOS — canonical authority: source, atom, editorial and projections

**Correction to the database-first interpretation of issue #57.**
The physical SQL catalog is a *downstream projection consistency test*, not a source of clinical or editorial truth.

The existing, versioned CKO contracts remain authoritative:
\`source.schema.json\`, \`claim.schema.json\`, \`authority_binding.schema.json\`,
\`field_definition.schema.json\`, \`canonical_object.schema.json\`, \`relation.schema.json\`,
and the existing editorial projection/template contracts. No new evidence-status vocabulary is created.

## Dependency graph

1. **Normative/scientific sources:** Identify issuer, edition, effective period, jurisdiction, rights, retrieval, pinpoint and verified bytes. Metadata does not prove a clause or license to redistribute.
2. **Editorial sources:** Attribute authored texts, readings and pedagogical interpretation. Preserve original editor, versions, citations and rights. Editorial provenance does not become normative evidence by a template or page link.
3. **Extract and atomize:** only from material actually inspected and permitted for that transformation. Each atomic assertion must retain source + source locator/pinpoint + content hash + applicable edition + rights + transformation provenance + distinction between verbatim text and paraphrase. Never manufacture atoms from titles, filenames or field names.
4. **Canonical object + claim + relation:** resolve identity, topic, scope, temporality, jurisdiction, conflicts and explicit supersession; retain contradictory candidates and rejected sources for audit. The CKO is the source of semantic truth, not a physical table or static page.
5. **Authority binding + field definition:** every *clinical or regulatory* field, threshold, formula and rule must trace back to a qualified source and the exact supporting atom/claim, not just a bibliographic reference. Unsupported bindings fail closed.
6. **Editorial projection:** articles, simulations, visual resources, flashcards, multilingual pages and other channels bind to canonical objects/claims and may contribute their own attributed educational commentary, without copying or overriding the clinical rule.
7. **Technical projection:** relational tables/FKs, PGlite/Neon, API, components and UI reconcile with the admitted semantic model. PostgreSQL DDL can protect storage integrity but does not decide clinical meanings, synonyms, applicability, copyright, human approval, or normative supremacy.

## Execution, automation and current findings

- \`node scripts/ncos-source-lineage-audit.mjs --enforce\` rechecks all current clinical sources, bindings, fields, tools and editorial module provenance against the existing JSON schemas. It generates a read-only SHA256-backed crosswalk into \`audit-evidence/ncos-canonical-source-lineage/lineage-candidate.v1.json\`. It performs no remote reads/writes and no clinical atomization.
- \`node --test scripts/ncos-source-lineage.test.mjs\` exercises negative examples: missing snapshot, noncanonical enum, orphan binding, missing editorial provenance, duplicate identity.
- Known issues found in initial source review: six sources contain all-zero hashes and pending snapshot references despite SOURCE_QUALIFIED status; source_type vocabulary differs from the canonical schema; authority_binding enum/validity differ; editorial provenance references a prior package, not a verified clause.
- The crosswalk MUST report these as FAIL/HOLD with facts, not auto-replace them or downgrade the approved JSON Schema to accommodate incompatible records.
- CKO atom/claim corpus admission, source license review and complete canonical-object graph remain **NOT_VERIFIED**. Public laws extracted into snapshots are candidate inputs, not automatically qualified CKO claims. Protected terminologies and standards must not be copied, sent to a model or republished without the required rights.
- The 397-column SQL-dictionary drift in issue #57 is **downstream**. No generated SQL column description may be promoted without canonical CKO concepts, accepted authority/evidence bindings and projection crosswalk.
- Reconciliation retains historical identifiers, models, ontologies, scope conflicts and canonical versions. Work proceeds through FIND → policy → validator → task → WO → Kernel → tests/audit → promotion, Maker ≠ Checker ≠ Auditor.

**Gate:** Reject release if a published clinical field lacks traceable source/atom, any required lineage is dangling, applicable sources conflict without disposition, rights are unresolved, editorial content is silently used as normative authority, or a database projection contradicts the canonical contract. Nonclinical/editorial-only operations can advance independently where rights and approvals permit.

**Scope:** NCOS/CE only. No WU-TRIB. No merge, production migration or OAuth change.

# CKO Universal Editorial & Learning Template System — v0.2.0

This package is the first materialized contract layer derived from the verified **CKO Deep Research — Visual Content & Resource Libraries v1.0** handoff.

## Source verification

- Source ZIP SHA-256: `7ca39f4578df5c32090160383c48cc572eb1fae9fbb9a9596f0ed4f8944b5866`
- Declared upstream file hashes checked: **14/14 PASS**
- Upstream controlled records: **61** = 10 visual policies + 29 Nursing Image Library categories + 22 DesignOS resource families
- Upstream state: **PASS_WITH_SCOPED_HOLDS**
- The six upstream holds remain scoped to asset acquisition/rights/licensing/sensitive imagery and do not block editorial contract design.

## Non-negotiable architecture

```text
MASTER DATA / CANONICAL OBJECT
        ↓
CLAIM / EVIDENCE / TERMINOLOGY / ONTOLOGY
        ↓
VISUAL RESOURCE REGISTRY
        ↓
EDITORIAL PROJECTION CONTRACT
        ↓
TEMPLATE PROFILE + RENDERER
        ↓
HTML | PDF | SLIDES | EPUB | OG/SOCIAL
```

A template stores **references and layout semantics**, not duplicated clinical facts or duplicated media truth.

## Included profiles

1. Article
2. Case
3. Flashcard
4. Quiz
5. Infographic
6. Pocket Guide
7. PDF / paged editorial
8. Slides

## Included implementation material

- JSON Schema contracts for projection request, block instance, template manifest, assessment item and resource binding.
- Template registry and 8 profile manifests.
- Component registry.
- Upstream `related_content` normalization: **64/64 labels classified** into orthogonal axes.
- Overlay registry for procedures, checklists, object pages, interactive media, study paths and other reusable patterns.
- OPA/Rego publication gates.
- Reference web renderer and demo.
- Example canonical-reference bundle (IDs only; no independent clinical truth).
- Validation tests and evidence report.

## Closure boundary

This v0.2.0 closes **architecture + contracts + profile registry**. It intentionally does not claim final pixel-QA, final print fidelity, or final third-party asset ingestion.

# Universal Editorial & Learning Template System — Architecture

## 1. Primary invariant

`Canonical Object → Claim/Evidence → Visual Resource Registry → Template/Renderer → Projection`

The direction is one-way for factual authority. A projection can emit telemetry, feedback and evidence, but it cannot silently overwrite canonical truth.

## 2. Layer responsibilities

| Layer | Owns | Must not own |
|---|---|---|
| Master Object / MD | identity, attributes, versions | channel layout |
| Claim/Evidence | assertions, source lineage, authority, temporal validity | decorative styling |
| Visual Resource Registry | reusable media identity, rights, provenance, fidelity, accessibility | unsupported facts |
| Editorial Projection Contract | requested audience/channel/template, canonical references, selection rules | copied source facts |
| Template Profile | block grammar, allowed/required roles, responsive/paged behavior | canonical clinical content |
| Renderer | transforms resolved projection model into channel output | new medical inference |
| Runtime assertions | validates bindings, rights, accessibility, evidence, holds | source truth creation |
| Automatic evidence | records what version rendered, from what IDs, with what gate result | hidden mutation |

## 3. Universal block grammar

Every profile is composed from the same block vocabulary. A block has a semantic role, a source binding and a presentation configuration. Examples:

- `title`, `lead`, `section`, `claim`, `figure`, `diagram`, `table`, `chart`, `callout`, `definition`, `steps`, `timeline`, `comparison`, `references`;
- learning-specific: `learning_objective`, `flashcard`, `question`, `answer_rationale`, `case_fact`, `decision_point`, `reflection`;
- navigation/publication: `toc`, `breadcrumb`, `action_bar`, `metadata`, `related_content`, `footer`.

## 4. Resolution model

A template request contains canonical IDs. The resolver must materialize a read-only **Resolved Projection Model (RPM)** with the exact version of every referenced object, claim, evidence and resource. Renderers consume the RPM, never the raw database ad hoc.

## 5. Profile hierarchy

```text
MASTER PROFILE
  ├─ DOMAIN overlay (optional)
  ├─ OBJECT overlay (optional)
  └─ CHANNEL profile
       ├─ Article
       ├─ Case
       ├─ Flashcard
       ├─ Quiz
       ├─ Infographic
       ├─ Pocket Guide
       ├─ PDF
       └─ Slides
```

Overrides are constrained to presentation and sequencing unless a new canonical version/change request is created upstream.

## 6. Rights and visual fidelity

Visual resources are selected only when the registry says the requested channel/use is permitted. Fidelity class is part of selection. A V0/V1 decorative image cannot satisfy a technical-object requirement that asks for V3/V4/V5.

## 7. Assessment model

Quiz and case decision points reference governed content and explicit evidence. Interchange can map to QTI 3, but QTI is a projection/interchange format, not the source of truth.

## 8. Accessibility

The projection gate blocks missing required alternatives: simple alt, extended description, underlying chart data/table, captions/transcripts, or 3D fallback where the resource role requires them.

## 9. Evidence emitted by every render

At minimum: `projection_id`, `template_version`, `renderer_version`, canonical object versions, claim/evidence IDs, resource IDs/versions, rights gate result, accessibility gate result, policy result, output hash and timestamp.


## 10. Why 64 upstream labels do not mean 64 templates

The upstream `related_content_map.json` contains **64 unique labels**, but they mix six orthogonal concerns: base editorial profiles/shells, composition patterns, channels, canonical-object contexts, interactive resource patterns, and purpose/governance contexts. UE-LTS normalizes **64/64** labels into those axes. This prevents template explosion and preserves one reusable grammar. See `registry/related_content_normalization.json`.

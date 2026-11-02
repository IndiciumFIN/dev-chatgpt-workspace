# MOF, ISO 11179 and relational normal forms — source-acquisition gate

**Source of truth:** original publishers only. **WO:** `WO-CE-DB-SKELETON-001`. **Status:** `PRE_CANONICAL / HOLD_HUMAN`.

## Verified MOF primary sources

- [OMG MOF 2.5.1 specification — official PDF](https://www.omg.org/spec/MOF/2.5.1/PDF), identifier `formal/2019-10-01`.
- [Official MOF XMI](https://www.omg.org/spec/MOF/20131001/MOF.xmi).
- [Official CMOF OCL constraints](https://www.omg.org/spec/MOF/20131001/CMOFConstraints.ocl).
- [Official EMOF OCL constraints](https://www.omg.org/spec/MOF/20131001/EMOFConstraints.ocl).

The official PDF was independently inspected via its public web rendering and the copyright page; **the PDF bytes were not downloaded to this execution container** because DNS outbound access failed. The official PDF restricts copying/reposting. Do not commit the PDF, copyrighted source clauses, XML or OCL blindly to this repository. The CKO historical M3 JSON Schema is **project-authored**, not the official MOF specification.

## ISO 11179 metadata

The publisher URLs are verified for ISO/IEC 11179-3:2023, -35:2023, -31:2023 and Amendment 1:2026. These official documents are distinct from an official OMG MOF PDF. Public abstracts support use as a **reference**, not clause-level compliance. ISO's copyright and AI-use restrictions must be evaluated prior to downloading/ingesting protected contents.

## First normal form = 1FN / 1NF

**1FN is a relational database design criterion, not the title of a standalone ISO/MOF norm.** For canonical Supabase reconstruction, evaluate:
- **1FN:** each column value atomic according to its declared domain; no repeating groups.
- **2FN:** every nonprime attribute fully dependent on a candidate key (especially composite keys).
- **3FN:** eliminate disallowed transitive dependencies; review business meanings and candidate keys.
- **BCNF:** every nontrivial functional dependency has a superkey determinant.
- **4FN/5FN:** analyze multivalued and join dependencies where relevant.

References:
- [IBM explanation of 1NF–5NF](https://www.ibm.com/think/topics/database-normalization).
- [Microsoft database-design normalization guide](https://support.microsoft.com/en-us/access/database-design-basics).

A PostgreSQL JSONB column is **not automatically** a 1FN violation: check whether it represents a deliberate bounded value, a versioned object, a separate relation, or an anti-pattern. A deterministic schema scan can find suspicious arrays, JSONB, repeating column naming or missing keys, but **cannot certify 2FN, 3FN, BCNF, 4FN or 5FN without validating real functional dependencies and intended semantics**.

## Release gate

Source acquisition is **not complete**, no original norm PDFs are stored here. Continue using official links and rights-qualified evidence records. Do not claim ISO/MOF conformance, full physical DDL parity, or database normalization across all 562 application tables until independent tests are supported by verified functional dependencies and signed governance decisions.

# Checkpoint M06: Consistency and concurrency gap analysis (candidate only)

## Evidence of SOT schema (read-only)
Inspected `pg_constraint`: `corpus_documents(source_id)` FK → `corpus_sources(id)`, `corpus_fragments(document_id)` FK → `corpus_documents(id)`, and `corpus_document_files(document_id,sha256_hex)` UNIQUE. Existing relationships **do not make permission.source_id/document_id/fragment_id mutually consistent** when each is a separate FK.

`SCHEMA_HARDENED_PROPOSAL_DO_NOT_APPLY.sql` proposes composite foreign keys to enforce matching source→document and document→fragment→origin SHA, with a lookup to actual document file hash. Because the reference tables would receive new UNIQUE constraints and an FK, assess backwards compatibility, locks, extensions, RLS and existing data before migration. **No DDL was run.**

## Concurrency simulation (not a real database proof)
`rights-reservation-contract.mjs` injects an **atomic adapter contract**, and `rights-reservation-contract.test.mjs` exercises mock-grant revocation before reservation, during confirmation, changed SHA, expiry, errors, stale lease and concurrent dispatch. It checks no outbound mock call before grant confirmation.

**Important:** a JS in-memory adapter is not a Postgres transaction. Real deployment needs one DB-backed, independently audited reservation/claim mechanism with atomic version checks, deterministic idempotency key per payload, a bounded lease, reconciliation of orphan claims, provider timeouts and revocation ordering. Even that cannot recall bytes already transmitted; legal approval must precede dispatch.

## Known gap explicitly demonstrated
The test labelled "request must NOT assume global exactly-once delivery across retries" shows that two sequential calls can dispatch twice in the mock. Production needs a durable idempotency token and transactional claim. This is a **blocking failure of product-readiness**, even though all contract tests pass.

## Next go/no-go
- Gate `PXC-009`: validate compound foreign keys on disposable Postgres with synthetic seeds, not SOT.
- Gate `B28/PXC-002`: approve rights policy by document, provider, operation and transfer, plus LGPD and legal owner.
- Gate `WO`: implement and run atomic reservation/idempotency with real concurrent Postgres sessions; verify RLS, revocation, failure logging.
- Gate `GIT_CKO:G8`: integration+security tests, rollback and independent review.
- **No SQL apply**, **no Edge Function deploy**, **no production external request**.

External platform notes: Supabase RLS in public schemas, service-role bypass RLS and restricted Data API grants; docs reviewed 2026-11-14. Supabase CLI v3 introduced hosted-change confirmations (2026-11-04); never run an unreviewed migration via guessed CLI commands.

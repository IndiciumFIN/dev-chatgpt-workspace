# Disposable Postgres constraint tests

GitHub Actions starts **PostgreSQL 16 in a disposable service container** with synthetic records and credentials (`localhost`). It executes the proposed schema **ONLY THERE**. Negative tests require composite foreign keys, file SHA FK, uniqueness of active grants and blocked `anon/authenticated` SELECT; history after revocation remains.

The workflow has no production credentials or Supabase remote connection, no provider outbound requests, and it does **not** prove live SOT migration safety, idempotency, rights, or transactionality. Any DDL of SOT still requires a separate approved ADR and migration.

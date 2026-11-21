-- CE / P0 PUBLICATION SAFETY: fail closed on INSERT without an explicit publication decision.
-- App database ONLY. Historical migrations are immutable; no prior row is rewritten.
-- Rows with published=true remain unchanged and MUST be audited separately for approval.
-- This is a candidate migration; running it against a real database requires target,
-- backup, transaction, independent review and manual approval (scripts/migrate.mjs).

alter table source_tool
  alter column published set default false;

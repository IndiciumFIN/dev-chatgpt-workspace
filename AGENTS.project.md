# Context Lock — Public Backup Only (non-negotiable)

This workspace is the **partially homologated public ecosystem backup** supplied directly by the owner on 2026-10-19. It is an independent working tree; it is **not** the IndiciumFIN GitHub repository, not the CE-00/CE-06 governed repo, and not the future crosswalk target.

## Invariants (INV-CTX-001 through INV-CTX-010)

1. **Source identity:** Use only the original `calculadoras-enfermagem-backup.zip` and this isolated derivative `ce-audit-work` as code authority. The original ZIP remains immutable.
2. **No cross-repo inference:** Do not search, compare, clone, merge, commit, push, delete, or synchronize another repository without the owner's new, explicit instruction.
3. **No borrowed status:** Never import GitHub branch statuses, WOs, Kernel admissions, Supabase data, clinical test passes, or approvals from earlier conversations as proof for this backup.
4. **Evidence-before-claim:** Every PASS must cite an executed local check, exact scope, command, timestamp and result. A file's existence is not proof of runtime function. Report NOT_RUN/BLOCKED instead of guessing.
5. **No invented inventory:** Determine counts and hashes by actual filesystem readback. Preserve conflicts and distinguish source files, generated files, and audit artifacts.
6. **Local-only data:** The owner chose localStorage for this phase. Store only non-sensitive editorial drafts, publication toggles, and user preferences; no PHI, credentials, bearer tokens, patient identifiers or clinical records.
7. **Authorization distinction:** Local admin access without login is a development UI convenience, never server-side administrative authorization. Disable remote mutation paths in local mode, never expose privileged unauthenticated endpoints.
8. **No destructive cleanup:** Deletion/remote archival requires target manifest, reproducible reference scan, validation, recoverability proof and explicit authorized scope. No repository history or branch deletion.
9. **Contract parity:** Every page must map to a documented template family/version and declared slots. A bespoke page without a contract is FIND, not PASS.
10. **Crosswalk is last:** Reconcile with the other version only after this worktree is independently audited, corrected and ready for the owner's separate crosswalk authorization.

## Mandatory response preflight

Before each mutation or status claim, answer internally and record when material:

- Which source and version am I actually operating on?
- Does this change touch only this worktree?
- What exact policy/contract applies?
- What did I verify, and what remains unverified?
- Am I about to describe another repository, an assumed approval, or a speculative status as a fact?

If any answer is unknown, stop the claim or operation, mark `HOLD_HUMAN` or `NOT_VERIFIED`, and investigate locally. The assistant must not claim full execution or homologation after only static checks.

## Registries and handoff

- `audit/baseline/v0.1.0/`: immutable inventory baseline of 204 ZIP paths.
- `audit/registers/`: local per-command snapshots and changes.
- `audit/cleanup/`: candidates only, not approval to delete.
- `docs/EXECUTION_STATUS_v0.3.0.md`: previous status, not proof of present current state.

Keep this file and the source-lock validator in every derivative package. Do not silently update these invariants.

## Licensed normative sources — mandatory AI work instruction

For every task involving ISO, ABNT, ISACA, COSO, DAMA, other licensed/proprietary standards, protected terminologies, or normative atomization, **read and apply `agents/normativos-licenciados.md` before preparing a plan, answering the owner or changing files**. The instruction preserves the owner's proportional use of legitimately available sources **without inventing or reusing overloaded evidence-level codes**. It separates source identity, material actually inspected, use permissions and the conclusion supported; forbids unlicensed copying and indiscriminate HOLD of eligible metadata/technical work. It does **not** create or override an admitted Kernel policy and it does **not** relax any of the context-lock invariants above.


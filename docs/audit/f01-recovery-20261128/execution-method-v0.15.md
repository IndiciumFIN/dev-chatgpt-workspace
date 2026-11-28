# Phase execution method v0.15

Decision: execute all in-scope demands of each phase before consolidated remediation and independent reperformance. F01 remains HOLD; F02–F14 remain blocked. This is a working method, not a change to canonical Kernel authority.

1. Freeze and reconcile the original phase demand population, including all original acceptance criteria; never silently remove or redefine demands.
2. Execute every demand in the phase. Register findings without blocking unrelated work. Respect actual technical dependencies, safety and existing authorization controls.
3. Perform full-phase audit and consolidated remediation. Preserve historical identity and evidence. No automatic admission or remote mutation.
4. Independently reperform tests, reconcile findings, evidence, source SHA and artifacts, and rebuild phase documentation.
5. Transition only after all required criteria are evidenced and homologated by the applicable authority. Unknown or unverified criteria remain HOLD.

Track five separate metrics: scope coverage, implementation, validation, remediation and homologation. Each has an explicit numerator and denominator; unknown denominator means unmeasured, not 100%.

Demand register fields: original requirement reference, stable demand key, scope, acceptance criteria, horizontal/vertical/transversal impacts, dependencies, physical paths, implementation status, validation status, findings, remediation status, evidence references, source commit, artifact digest and homologation status.

Keep working on audit/cko-f01-recovery-20261128 only. Public repository: publish safe code and reviewed projections only. No dump, private data or secrets. No merge or promotion. Final full documentation reconstruction remains mandatory.

Next: reconcile the original 17 F01 criteria and complete the remaining in-phase scope (holds, audit authority, pipeline bindings and consolidated gate), then remediate and reperform. Do not confuse this working list with the original acceptance population.

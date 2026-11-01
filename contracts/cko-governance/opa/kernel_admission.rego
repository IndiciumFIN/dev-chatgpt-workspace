package cko.kernel_admission

import rego.v1

# Candidate-only policy. No live OPA service is configured in this repository.
# All authorization is denied without explicit facts from trusted components.
default allow := false

nonempty(x) if {
  is_string(x)
  count(trim(x, " ")) > 0
}

unique_string_list(xs) if {
  is_array(xs)
  count(xs) > 0
  every x in xs { nonempty(x) }
  count(xs) == count({x | some x in xs})
}

allow if {
  nonempty(input.work_order.id)
  nonempty(input.work_order.source_ref)
  nonempty(input.work_order.find_ref)
  nonempty(input.work_order.task_ref)
  nonempty(input.work_order.owner)
  nonempty(input.work_order.approver)
  input.work_order.owner != input.work_order.approver
  unique_string_list(input.work_order.policy_set)

  input.manifest.service_order_id == input.work_order.id
  input.manifest.status == "approved"
  input.manifest.approved_by == input.work_order.approver
  nonempty(input.manifest.approved_at)
  regex.match("^[a-f0-9]{64}$", input.manifest.hash)
  unique_string_list(input.manifest.validators)
  input.manifest.policy_set == input.work_order.policy_set

  input.policy.allow == true
  input.policy.bundle_signature_verified == true
  nonempty(input.policy.bundle_ref)
  nonempty(input.policy.decision_ref)
  nonempty(input.policy.decision_evidence_ref)
  input.policy.work_order_ref == input.work_order.id
  input.policy.input_hash == input.manifest.hash

  is_array(input.validator_results)
  count(input.validator_results) == count(input.manifest.validators)
  every run in input.validator_results {
    run.result == "PASS"
    run.id in input.manifest.validators
    nonempty(run.evidence_ref)
    nonempty(run.run_ref)
  }
  count({run.id | some run in input.validator_results}) == count(input.validator_results)

  input.approval.human_required == true
  input.approval.human_status == "APPROVED"
  input.approval.scope_ref == input.work_order.id
  input.approval.actor_ref == input.work_order.approver
  nonempty(input.approval.evidence_ref)
  input.approval.actor_ref != input.work_order.owner

  input.execution.requested == false
}

deny_reason contains "no_valid_policy_or_evidence" if not input.policy.allow
deny_reason contains "missing_independent_approval" if input.work_order.owner == input.work_order.approver
deny_reason contains "unsigned_policy_bundle" if input.policy.bundle_signature_verified != true
deny_reason contains "no_validators" if count(input.manifest.validators) == 0
deny_reason contains "execution_not_authorized_here" if input.execution.requested != false

package cko.kernel_admission

import rego.v1

# Candidate-only policy. No live OPA service is configured in this repository.
# All authorization is denied without explicit facts from trusted components.
#
# Fail-closed: a regra que falta é uma negação. `default allow := false` é o
# primeiro fato do arquivo — se o resto sumir, a política continua negando.
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

sha256_hex(x) if {
  is_string(x)
  regex.match("^[a-f0-9]{64}$", x)
}

# O pedido tem de ser completo, com dono, aprovador e origem.
pedido_completo if {
  nonempty(input.work_order.id)
  nonempty(input.work_order.source_ref)
  nonempty(input.work_order.task_ref)
  nonempty(input.work_order.find_ref)
  nonempty(input.work_order.owner)
  nonempty(input.work_order.approver)
  input.work_order.owner != input.work_order.approver
  unique_string_list(input.work_order.policy_set)
  unique_string_list(input.work_order.acceptance_criteria)
}

# O manifesto amarra o pedido: mesma ordem, mesmo hash, mesmo conjunto de política.
manifesto_amarrado if {
  input.manifest.service_order_id == input.work_order.id
  input.manifest.status == "approved"
  input.manifest.approved_by == input.work_order.approver
  nonempty(input.manifest.approved_at)
  sha256_hex(input.manifest.hash)
  unique_string_list(input.manifest.validators)
  unique_string_list(input.manifest.policy_set)
  input.manifest.policy_set == input.work_order.policy_set
}

# A decisão de política vem com evidência: bundle assinado e referência de decisão.
politica_com_evidencia if {
  input.policy.allow == true
  input.policy.bundle_signature_verified == true
  nonempty(input.policy.bundle_ref)
  nonempty(input.policy.decision_ref)
  nonempty(input.policy.decision_evidence_ref)
  input.policy.work_order_ref == input.work_order.id
  input.policy.input_hash == input.manifest.hash
}

# Todo validador do manifesto rodou, passou e deixou rastro.
validadores_passaram if {
  is_array(input.validator_results)
  count(input.validator_results) == count(input.manifest.validators)
  every run in input.validator_results {
    run.result == "PASS"
    run.id in input.manifest.validators
    nonempty(run.evidence_ref)
    nonempty(run.run_ref)
  }
  count({run.id | some run in input.validator_results}) == count(input.validator_results)
}

# A aprovação é de uma pessoa, independente do dono, e casa com o manifesto.
aprovacao_independente if {
  input.approval.human_required == true
  input.approval.human_status == "APPROVED"
  input.approval.scope_ref == input.work_order.id
  input.approval.actor_ref == input.work_order.approver
  input.approval.actor_ref == input.manifest.approved_by
  input.approval.approved_at == input.manifest.approved_at
  nonempty(input.approval.evidence_ref)
  input.approval.actor_ref != input.work_order.owner
}

allow if {
  pedido_completo
  manifesto_amarrado
  politica_com_evidencia
  validadores_passaram
  aprovacao_independente
  input.execution.requested == false
}

deny_reason contains "no_valid_policy_or_evidence" if not input.policy.allow
deny_reason contains "missing_independent_approval" if input.work_order.owner == input.work_order.approver
deny_reason contains "unsigned_policy_bundle" if input.policy.bundle_signature_verified != true
deny_reason contains "no_validators" if count(input.manifest.validators) == 0
deny_reason contains "execution_not_authorized_here" if input.execution.requested != false
deny_reason contains "missing_manifest" if input.manifest.status != "approved"
deny_reason contains "manifest_hash_mismatch" if not sha256_hex(input.manifest.hash)
deny_reason contains "approval_does_not_match_manifest" if input.approval.actor_ref != input.manifest.approved_by

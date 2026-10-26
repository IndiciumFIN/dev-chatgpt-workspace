package cko.kernel_admission

import rego.v1

# Testes da política de admissão. Rodar: `opa test contracts/cko-governance/opa`.
# Cada caso quebra UMA coisa e exige que a política negue. Política que passa
# em tudo não é garantia.

base_input := {
  "work_order": {
    "id": "wo-1",
    "task_ref": "task-1",
    "find_ref": "find-1",
    "owner": "dono",
    "approver": "revisor",
    "source_ref": "transversal-public.lei-12-965-2014.source",
    "policy_set": ["source.admitir"],
    "acceptance_criteria": ["atomo-com-pinpoint"],
  },
  "manifest": {
    "service_order_id": "wo-1",
    "status": "approved",
    "approved_by": "revisor",
    "approved_at": "2026-10-26T12:00:00Z",
    "hash": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "validators": ["schema", "pinpoint"],
    "policy_set": ["source.admitir"],
  },
  "policy": {
    "allow": true,
    "bundle_signature_verified": true,
    "bundle_ref": "bundle://cko-governance/1.0.0",
    "decision_ref": "decisao-1",
    "decision_evidence_ref": "evidencia/decisao-1",
    "work_order_ref": "wo-1",
    "input_hash": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  },
  "validator_results": [
    {"id": "schema", "result": "PASS", "evidence_ref": "evidencia/schema", "run_ref": "run/schema"},
    {"id": "pinpoint", "result": "PASS", "evidence_ref": "evidencia/pinpoint", "run_ref": "run/pinpoint"},
  ],
  "approval": {
    "human_required": true,
    "human_status": "APPROVED",
    "scope_ref": "wo-1",
    "actor_ref": "revisor",
    "approved_at": "2026-10-26T12:00:00Z",
    "evidence_ref": "evidencia/aprovacao",
  },
  "execution": {"requested": false},
}

test_pedido_completo_admite if {
  allow with input as base_input
}

test_sem_politica_ativa_nega if {
  not allow with input as object.union(base_input, {"policy": object.union(base_input.policy, {"allow": false})})
  "no_valid_policy_or_evidence" in deny_reason with input as object.union(base_input, {"policy": object.union(base_input.policy, {"allow": false})})
}

test_bundle_sem_assinatura_nega if {
  not allow with input as object.union(base_input, {"policy": object.union(base_input.policy, {"bundle_signature_verified": false})})
  "unsigned_policy_bundle" in deny_reason with input as object.union(base_input, {"policy": object.union(base_input.policy, {"bundle_signature_verified": false})})
}

test_sem_manifesto_aprovado_nega if {
  not allow with input as object.union(base_input, {"manifest": object.union(base_input.manifest, {"status": "draft"})})
  "missing_manifest" in deny_reason with input as object.union(base_input, {"manifest": object.union(base_input.manifest, {"status": "draft"})})
}

test_manifesto_de_outro_pedido_nega if {
  not allow with input as object.union(base_input, {"manifest": object.union(base_input.manifest, {"service_order_id": "wo-2"})})
}

test_hash_invalido_nega if {
  not allow with input as object.union(base_input, {"manifest": object.union(base_input.manifest, {"hash": "abc"})})
  "manifest_hash_mismatch" in deny_reason with input as object.union(base_input, {"manifest": object.union(base_input.manifest, {"hash": "abc"})})
}

test_sem_validador_nega if {
  not allow with input as object.union(base_input, {"manifest": object.union(base_input.manifest, {"validators": []})})
  "no_validators" in deny_reason with input as object.union(base_input, {"manifest": object.union(base_input.manifest, {"validators": []})})
}

test_validador_que_falhou_nega if {
  not allow with input as object.union(base_input, {"validator_results": [
    {"id": "schema", "result": "FAIL", "evidence_ref": "evidencia/schema", "run_ref": "run/schema"},
    {"id": "pinpoint", "result": "PASS", "evidence_ref": "evidencia/pinpoint", "run_ref": "run/pinpoint"},
  ]})
}

test_dono_que_aprova_o_proprio_nega if {
  not allow with input as object.union(base_input, {"work_order": object.union(base_input.work_order, {"owner": "revisor"})})
  "missing_independent_approval" in deny_reason with input as object.union(base_input, {"work_order": object.union(base_input.work_order, {"owner": "revisor"})})
}

test_aprovacao_que_nao_casa_com_o_manifesto_nega if {
  not allow with input as object.union(base_input, {"approval": object.union(base_input.approval, {"actor_ref": "outro"})})
  "approval_does_not_match_manifest" in deny_reason with input as object.union(base_input, {"approval": object.union(base_input.approval, {"actor_ref": "outro"})})
}

test_execucao_pedida_nega if {
  not allow with input as object.union(base_input, {"execution": {"requested": true}})
  "execution_not_authorized_here" in deny_reason with input as object.union(base_input, {"execution": {"requested": true}})
}

test_sem_fatos_a_politica_nega if {
  not allow with input as {}
}

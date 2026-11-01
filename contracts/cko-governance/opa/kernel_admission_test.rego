package cko.kernel_admission

import rego.v1

fixture := {
	"work_order": {"id": "WO-CAND-001", "source_ref": "source://qualified", "find_ref": "FIND-1", "task_ref": "TASK-1", "owner": "maker", "approver": "reviewer", "policy_set": ["POLICY-1"]},
	"manifest": {"service_order_id": "WO-CAND-001", "status": "approved", "approved_by": "reviewer", "approved_at": "2026-10-26T12:00:00Z", "hash": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "validators": ["VALIDATOR-1"], "policy_set": ["POLICY-1"]},
	"policy": {"allow": true, "bundle_signature_verified": true, "bundle_ref": "BUNDLE-1", "decision_ref": "DEC-1", "decision_evidence_ref": "evidence://opa", "work_order_ref": "WO-CAND-001", "input_hash": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"},
	"validator_results": [{"id": "VALIDATOR-1", "result": "PASS", "evidence_ref": "evidence://test", "run_ref": "RUN-1"}],
	"approval": {"human_required": true, "human_status": "APPROVED", "scope_ref": "WO-CAND-001", "actor_ref": "reviewer", "evidence_ref": "evidence://approval"},
	"execution": {"requested": false},
}

test_admits_complete_scoped_candidate if {
	allow with input as fixture
}

test_defaults_to_deny_without_input if {
	not allow with input as {}
}

test_fails_without_source if {
	not allow with input as object.union(fixture, {"work_order": object.union(fixture.work_order, {"source_ref": ""})})
}

test_fails_when_self_approved if {
	not allow with input as object.union(fixture, {"work_order": object.union(fixture.work_order, {"approver": "maker"})})
}

test_fails_without_independent_approval if {
	not allow with input as object.union(fixture, {"approval": object.union(fixture.approval, {"actor_ref": "maker"})})
}

test_fails_for_unsigned_bundle if {
	not allow with input as object.union(fixture, {"policy": object.union(fixture.policy, {"bundle_signature_verified": false})})
}

test_fails_for_missing_validators if {
	not allow with input as object.union(fixture, {"validator_results": []})
}

test_fails_for_duplicate_validator_results if {
	not allow with input as object.union(fixture, {
		"manifest": object.union(fixture.manifest, {"validators": ["VALIDATOR-1", "VALIDATOR-2"]}),
		"validator_results": [fixture.validator_results[0], fixture.validator_results[0]],
	})
}

test_fails_for_failed_validator if {
	not allow with input as object.union(fixture, {"validator_results": [{"id": "VALIDATOR-1", "result": "FAIL", "evidence_ref": "evidence://test", "run_ref": "RUN-1"}]})
}

test_fails_for_execution_request if {
	not allow with input as object.union(fixture, {"execution": {"requested": true}})
}

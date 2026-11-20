package cko.import_read

import rego.v1

# Candidate; bundles/data must be independently approved, signed and deployed
# to a trusted OPA service. An imported CSV never populates this grant table.
default allow := false

allow if {
 input.action == "imports.reconcile.read"
 is_string(input.actor_id)
 count(trim(input.actor_id," ")) > 0
 input.profile_id in {"sources","policies","validators"}
 supported := {
  "sources":"cko_evidence.sources",
  "policies":"cko_orch.policy_registry",
  "validators":"cko_validation.validators"
 }
 input.destination == supported[input.profile_id]
 regex.match("^[a-f0-9]{64}$",input.source_sha256)
 is_string(input.request_nonce)
 regex.match("^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$",input.request_nonce)
 is_number(input.record_count)
 input.record_count >= 1
 input.record_count <= 10000
 data.cko_trusted.import_read_grants[input.actor_id][input.profile_id] == true
}

# The hash value describes the deployed policy bundle, verified by the
# deployment controller. It is NOT cryptographic proof in the API response.
bundle_sha256 := data.cko_trusted.bundle_sha256


# Bind every allow response to the exact invocation; a cached or replayed
# decision with another nonce/actor/file/operation must be rejected by the PEP.
context := {
 "request_nonce":input.request_nonce,
 "actor_id":input.actor_id,
 "profile_id":input.profile_id,
 "destination":input.destination,
 "source_sha256":input.source_sha256,
 "record_count":input.record_count,
} if allow

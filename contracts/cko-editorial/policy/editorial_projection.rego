package cko.editorial

default allow := false

# Expected input contains resolved projection facts from the resolver/registry.
allow if {
  input.template.facts_from_canonical_only == true
  input.template.resources_from_registry_only == true
  input.gates.evidence == "PASS"
  input.gates.rights == "PASS"
  input.gates.accessibility == "PASS"
  input.gates.fidelity == "PASS"
  count(input.blocking_holds) == 0
}

deny_reason contains "evidence_gate" if input.gates.evidence != "PASS"
deny_reason contains "rights_gate" if input.gates.rights != "PASS"
deny_reason contains "accessibility_gate" if input.gates.accessibility != "PASS"
deny_reason contains "fidelity_gate" if input.gates.fidelity != "PASS"
deny_reason contains "blocking_hold" if count(input.blocking_holds) > 0

deny_reason contains "facts_not_canonical" if input.template.facts_from_canonical_only != true
deny_reason contains "resources_not_registry_bound" if input.template.resources_from_registry_only != true

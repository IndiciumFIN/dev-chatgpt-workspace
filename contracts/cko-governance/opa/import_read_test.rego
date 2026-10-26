package cko.import_read

import rego.v1

fixture := {
 "action":"imports.reconcile.read","actor_id":"verified-1","profile_id":"sources",
 "destination":"cko_evidence.sources",
 "source_sha256":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
 "record_count":2
}
trusted := {"bundle_sha256":"bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb","import_read_grants":{"verified-1":{"sources":true}}}
test_authorized_read if { allow with input as fixture with data.cko_trusted as trusted }
test_unknown_actor_denied if {
 not allow with input as object.union(fixture,{"actor_id":"other"}) with data.cko_trusted as trusted
}
test_imported_data_cannot_grant_role if {
 not allow with input as object.union(fixture,{"actor_id":"other","role":"admin","grant":true}) with data.cko_trusted as trusted
}
test_wrong_destination_denied if {
 not allow with input as object.union(fixture,{"destination":"public.users"}) with data.cko_trusted as trusted
}
test_write_denied if {
 not allow with input as object.union(fixture,{"action":"imports.write"}) with data.cko_trusted as trusted
}
test_missing_bundle_data_denied if { not allow with input as fixture with data.cko_trusted as {} }
test_large_file_denied if {
 not allow with input as object.union(fixture,{"record_count":10001}) with data.cko_trusted as trusted
}

import hashlib
import json
import unittest
from ce_i18n_bulk_audit import inspect

PATH = "registers/i18n/incoming/de/contracts/headerAccessibility__contrast.json"
def probe(obj, path=PATH, bad_hash=False):
    raw = json.dumps(obj).encode() if isinstance(obj,dict) else obj
    sha = hashlib.sha1(b"blob "+str(len(raw)).encode()+b"\0"+raw).hexdigest()
    return inspect(raw,path,"0"*40 if bad_hash else sha,"100644")[0]
def record():
    return {"locale":"de","key":"headerAccessibility.contrast","canonical_id":"cko:i18n:de:headerAccessibility.contrast","value":"Kontrast","status":"DRAFT","translation_status":"DRAFT","clinical_review":"NOT_APPLICABLE"}
class AuditTests(unittest.TestCase):
    def test_candidate(self): self.assertEqual(probe(record()),"STAGING_CANDIDATE")
    def test_locale(self): self.assertEqual(probe({**record(),"locale":"en"}),"HOLD_IDENTITY_OR_STATE")
    def test_clinical(self): self.assertEqual(probe({**record(),"clinical_review":"PENDING"}),"HOLD_CLINICAL_REVIEW")
    def test_invalid_json(self): self.assertEqual(probe(b"{"),"HOLD_JSON")
    def test_duplicate(self): self.assertEqual(probe(b'{"x":1,"x":2}'),"HOLD_JSON")
    def test_nonfinite(self): self.assertEqual(probe(b'{"x":NaN}'),"HOLD_JSON")
    def test_integrity(self): self.assertEqual(probe(record(),bad_hash=True),"HOLD_BLOB_INTEGRITY")
    def test_non_contract(self): self.assertEqual(probe(record(),"registers/i18n/incoming/index.json"),"HOLD_NON_CONTRACT_REVIEW")
    def test_credential(self): self.assertEqual(probe({**record(),"value":"-----BEGIN PRIVATE KEY-----"}),"HOLD_CREDENTIAL_PATTERN")
if __name__=="__main__": unittest.main()

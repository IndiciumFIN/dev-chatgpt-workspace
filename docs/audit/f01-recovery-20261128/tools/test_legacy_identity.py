import unittest
from legacy_identity import evaluate
E={'canonical_id':'A','object_uuid':'00000000-0000-4000-8000-000000000001','current_version_ref':'V'}
V={'object_version_id':'V','object_ref':'A'}
R={'relationship_id':'R','source_id':'A','target_id':'A'}
A={'alias_id':'X','canonical_id':'A'}
class Tests(unittest.TestCase):
    def test_legacy(self):
        r=evaluate([E],[V],[R],[A]); self.assertEqual((r['legacy_entities'],r['legacy_versions'],r['legacy_relationships'],r['legacy_aliases']),(1,1,1,1)); self.assertFalse(r['authorization'])
    def test_duplicate_uuid(self):
        with self.assertRaises(ValueError): evaluate([E,dict(E,canonical_id='B')],[],[],[])
    def test_invalid_uuid(self):
        with self.assertRaises(ValueError): evaluate([dict(E,object_uuid='bad')],[],[],[])
    def test_bad_version(self):
        self.assertEqual(evaluate([E],[dict(V,object_ref='B')],[],[])['legacy_current_version_invalid'],1)
    def test_v7(self):
        r=evaluate([dict(E,object_uuid='00000000-0000-7000-8000-000000000001')],[V],[],[]); self.assertEqual(r['legacy_entities'],0); self.assertEqual(r['kernel'],'HOLD')
if __name__=='__main__': unittest.main()

import unittest
from lineage_check import evaluate
P=dict(object_version_id='P',parent_version_id=None,parent_hash=None,content_hash='a')
C=dict(object_version_id='C',parent_version_id='P',parent_hash='b',content_hash='c')
A=dict(correction_id='A',child_object_version_id='C',parent_version_id='P',recorded_parent_hash='b',observed_parent_content_hash='a',correction_status='APPROVED_ATTESTATION',raw_history_preserved='t',mutation_performed='f',approved_by='reviewer',approved_at='date',evidence_refs='["E"]',root_cause_status='UNDETERMINED')
class Tests(unittest.TestCase):
    def test_attestation_not_resolution(self):
        r=evaluate([P,C],[A]); self.assertEqual(r['structurally_matching_attestations'],1); self.assertEqual(r['resolved_exceptions'],0); self.assertFalse(r['authorization'])
    def test_mutation(self): self.assertEqual(evaluate([P,C],[dict(A,mutation_performed='t')])['structurally_matching_attestations'],0)
    def test_missing_evidence(self): self.assertEqual(evaluate([P,C],[dict(A,evidence_refs='[]')])['structurally_matching_attestations'],0)
    def test_missing_parent(self): self.assertEqual(evaluate([C],[])['status_counts']['PARENT_MISSING'],1)
    def test_cycle(self): self.assertEqual(evaluate([dict(P,parent_version_id='C'),C],[])['cycle_affected_versions'],2)
    def test_duplicate(self):
        with self.assertRaises(ValueError): evaluate([P,P],[])
if __name__=='__main__': unittest.main()

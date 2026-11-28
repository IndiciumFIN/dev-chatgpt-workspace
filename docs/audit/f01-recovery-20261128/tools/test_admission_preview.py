import unittest
from admission_preview import preview

T=[{'entity_type_id':'A'}, {'entity_type_id':'LABOR_TOOL','id_pattern':r'^WK-[0-9]{3}$'}, {'entity_type_id':'DEVICE_COHORT','id_pattern':r'^COHORT-[A-Z0-9-]+$'}]
P=[{'entity_type_id':'A','id_policy_id':'P','status':'ACTIVE','reuse_forbidden':'t','legacy_preservation_rule':'preserve','strategy_code':'EXISTING_OR_FAIL_CLOSED'}]
E=[{'canonical_id':'WK-001','entity_type_id':'LABOR_TOOL'}]
class Tests(unittest.TestCase):
    def test_valid_stays_hold(self):
        r=preview(T,P,E); self.assertFalse(r['authorization']); self.assertEqual(r['kernel'],'HOLD'); self.assertEqual(r['candidates'][1]['mismatch_count'],0)
    def test_bad_id(self):
        self.assertIn('EXISTING_ID_PATTERN_MISMATCH',preview(T,P,[dict(E[0],canonical_id='BAD')])['candidates'][1]['blockers'])
    def test_drift(self):
        self.assertIn('TYPE_PATTERN_MISMATCH',preview([T[0],dict(T[1],id_pattern='.*'),T[2]],P,E)['candidates'][1]['blockers'])
    def test_existing_policy(self):
        self.assertIn('POLICY_ALREADY_PRESENT_OR_TYPE_ABSENT',preview(T,P+[dict(P[0],entity_type_id='LABOR_TOOL',id_policy_id='Q')],E)['candidates'][1]['blockers'])
    def test_empty_cohort_not_approved(self):
        r=preview(T,P,E)['candidates'][0]; self.assertEqual(r['existing_count'],0); self.assertEqual(r['status'],'HOLD')
if __name__=='__main__': unittest.main()

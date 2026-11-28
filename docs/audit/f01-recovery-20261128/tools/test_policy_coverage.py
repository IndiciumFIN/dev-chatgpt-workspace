import unittest
from policy_coverage import evaluate

T = {'entity_type_id': 'A'}
P = {'entity_type_id': 'A', 'id_policy_id': 'P', 'status': 'ACTIVE',
     'reuse_forbidden': 't', 'legacy_preservation_rule': 'preserve',
     'strategy_code': 'EXISTING_OR_FAIL_CLOSED'}
E = {'canonical_id': 'A-1', 'entity_type_id': 'A'}

class Tests(unittest.TestCase):
    def test_clean_still_hold(self):
        r = evaluate([T], [P], [E])
        self.assertEqual(r['missing_types'], [])
        self.assertFalse(r['authorization'])
        self.assertEqual(r['kernel'], 'HOLD')
    def test_missing(self):
        r = evaluate([T, {'entity_type_id': 'B'}], [P], [E, {'canonical_id':'B-1','entity_type_id':'B'}])
        self.assertEqual((r['missing_types'], r['affected_entities']), (['B'], 1))
    def test_invalid(self):
        self.assertEqual(evaluate([T], [dict(P, reuse_forbidden='f')], [E])['invalid_policy_types'], ['A'])
    def test_orphan(self):
        self.assertEqual(evaluate([T], [dict(P, entity_type_id='B')], [E])['orphan_policy_types'], ['B'])
    def test_unknown(self):
        self.assertEqual(evaluate([T], [P], [dict(E, entity_type_id='B')])['unknown_entity_types'], ['B'])
    def test_duplicate(self):
        with self.assertRaises(ValueError):
            evaluate([T], [P, P], [E])
    def test_empty(self):
        with self.assertRaises(ValueError):
            evaluate([T], [], [E])

if __name__ == '__main__':
    unittest.main()

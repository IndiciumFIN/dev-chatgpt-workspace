import csv
import tempfile
import unittest
from pathlib import Path
from validate import evaluate

class Tests(unittest.TestCase):
    def run_case(self, ids, versions):
        with tempfile.TemporaryDirectory() as t:
            p=Path(t)
            for name, headers, rows in [
                ("i.csv",["canonical_id","uuid_version","policy_id","pattern_result"],ids),
                ("v.csv",["version_id","parent_id","status","cycle"],versions)]:
                with (p/name).open("w",newline="") as f:
                    w=csv.writer(f); w.writerow(headers); w.writerows(rows)
            return evaluate(p/"i.csv",p/"v.csv")
    def test_clean_still_hold(self):
        r=self.run_case([["A","7","P","MATCH"]],[["V","","ROOT","False"]])
        self.assertFalse(r["authorization"])
        self.assertEqual(r["kernel"],"HOLD")
    def test_legacy_missing(self):
        r=self.run_case([["A","4","","MATCH"]],[["V","X","HASH_MISSING","False"]])
        self.assertEqual((r["legacy_uuid"],r["missing_policy"],r["missing_parents"]),(1,1,1))
    def test_cycle(self):
        r=self.run_case([["A","7","P","MATCH"]],[["V","W","HASH_MATCH","False"],["W","V","HASH_MATCH","False"]])
        self.assertTrue(r["cycle_detected"])
    def test_duplicate(self):
        with self.assertRaises(ValueError):
            self.run_case([["A","7","P","MATCH"],["A","7","P","MATCH"]],[["V","","ROOT","False"]])

if __name__=="__main__":
    unittest.main()

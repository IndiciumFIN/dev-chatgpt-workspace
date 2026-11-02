import json, pathlib, unittest
class AttemptContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.schema=json.loads((pathlib.Path(__file__).resolve().parents[1]/"attempt-lifecycle.v0.1.0.schema.json").read_text())
    def test_has_separate_study_and_exam_modes(self):
        self.assertEqual(self.schema["properties"]["mode"]["enum"],["SIMULADO","ESTUDO"])
    def test_never_reveal_study_policy_in_simulado(self):
        rule=self.schema["allOf"][0]
        self.assertEqual(rule["if"]["properties"]["mode"]["const"],"SIMULADO")
        self.assertEqual(rule["then"]["properties"]["answer_visibility"]["not"]["const"],"STUDY_EXPLICIT")
    def test_post_completion_needs_finalized_state(self):
        rule=self.schema["allOf"][1]
        self.assertEqual(rule["then"]["properties"]["state"]["enum"],["GRADED","CLOSED"])
if __name__=="__main__":unittest.main()

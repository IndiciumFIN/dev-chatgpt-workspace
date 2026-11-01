import importlib.util, pathlib, unittest
modpath=pathlib.Path(__file__).resolve().parents[1]/'scripts'/'spe_validate_extraction.py'
spec=importlib.util.spec_from_file_location('validator',modpath)
module=importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
class ValidatorTests(unittest.TestCase):
    def test_missing_is_hold(self):
        r=module.validate({})
        self.assertEqual(r['status'],'HOLD')
        self.assertFalse(r['eligible_for_promotion'])
    def test_corruption_is_fail(self):
        r=module.validate({'source':{'page_count':1},'pages':[{'page_number':1,'text':'(cid:89)'}]})
        self.assertEqual(r['checks']['VAL-PDF-002'],'FAIL')
        self.assertEqual(r['status'],'FAIL')
    def test_approval_not_auto(self):
        d={'source':{'page_count':1},'pages':[{'page_number':1,'text':'Questão 1'}], 'questions':[{'question_id':'Q1','ordinal_in_source':1,'choices':[{'key':'A'},{'key':'B'}], 'page_number':1,'locator':'bbox-01','source_id':'S','extraction_run_id':'RUN1','extractor_version':'v1'}], 'answer_key':[{'question_id':'Q1','choice_key':'A'}], 'cross_extractor_agreement':True,'dedup':{'sha256_unique':True,'drive_id_unique':True},'schema_validated':True}
        r=module.validate(d)
        self.assertEqual(r['status'],'PASS')
        self.assertFalse(r['eligible_for_promotion'])
if __name__=='__main__': unittest.main()

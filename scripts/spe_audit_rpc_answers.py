#!/usr/bin/env python3
"""Static audit of legacy v1.4.0 ZIP; reads archive only. Exit 0=exposure found."""
import re,zipfile,json,sys
def audit(archive):
 with zipfile.ZipFile(archive) as z:
  sources={p.split('/')[-1]:z.read(p).decode('utf-8') for p in z.namelist() if '/supabase/migration_sources/' in p and p.endswith('.sql')}
 checks={}
 for name in ('0024_api_functions.sql','0031_cms_working_copies_option_lifecycle.sql','0038_api_assessment_runtime.sql'):
  s=sources.get(name,''); fn='api.evaluate_question_set' if name.startswith('0038') else 'api.evaluate_question'
  checks[name]={'has_rpc':bool(re.search(r'function\s+'+re.escape(fn)+r'\s*\(',s,re.I)),
   'anon_grant':bool(re.search(r'grant\s+execute\s+on\s+function\s+'+re.escape(fn)+r'\s*\([^;]+\)\s+to\s+anon\s*,\s*authenticated\s*;',s,re.I|re.S)),
   'answer_ids':('correct_option_ids' in s) if not name.startswith('0038') else None,
   'calls_grading':bool(re.search(r'api\.evaluate_question\s*\(',s,re.I)) if name.startswith('0038') else None}
 found=all(x['has_rpc'] and x['anon_grant'] for x in checks.values()) and all(checks[k]['answer_ids'] for k in list(checks)[:2]) and checks['0038_api_assessment_runtime.sql']['calls_grading']
 return {'finding':'SPE-RPC-ANSWER-EXPOSURE','confirmed_static':found,'checks':checks}
if __name__=='__main__':
 if len(sys.argv)!=2: sys.exit('usage: python scripts/spe_audit_rpc_answers.py original-v1.4.0.zip')
 result=audit(sys.argv[1]);print(json.dumps(result,indent=2));sys.exit(0 if result['confirmed_static'] else 2)

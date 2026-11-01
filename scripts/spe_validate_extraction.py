#!/usr/bin/env python3
"""Candidate VAL-PDF-001..010 validator. No runtime promotion authorization."""
import json, re, sys, pathlib
def validate(d):
    checks = {}
    def mark(code, ok, present=True):
        checks[code] = 'PASS' if (present and ok) else ('FAIL' if present else 'HOLD')
    pages=d.get('pages'); total=d.get('source',{}).get('page_count')
    mark('VAL-PDF-001',isinstance(pages,list) and len(pages)==total and {p.get('page_number') for p in pages}==set(range(1,total+1)),isinstance(pages,list) and isinstance(total,int) and total>0)
    strings=[str(p.get('text','')) for p in (pages or [])]
    corrupted=any(re.search(r'\(cid:\d+\)|\ufffd',s) for s in strings)
    mark('VAL-PDF-002',not corrupted, bool(strings) and all('text' in p for p in pages))
    questions=d.get('questions')
    nums=[q.get('ordinal_in_source') for q in (questions or [])]
    mark('VAL-PDF-003',all(isinstance(x,int) for x in nums) and len(nums)==len(set(nums)) and nums==sorted(nums),isinstance(questions,list) and bool(questions))
    mark('VAL-PDF-004',all(isinstance(q.get('choices'),list) and len(q['choices'])>=2 and len({v.get('key') for v in q['choices']})==len(q['choices']) for q in (questions or [])),isinstance(questions,list) and bool(questions))
    answers=d.get('answer_key'); ids={q.get('question_id') for q in (questions or [])}
    mark('VAL-PDF-005',all(a.get('question_id') in ids and a.get('choice_key') in {c.get('key') for q in (questions or []) if q.get('question_id')==a.get('question_id') for c in q.get('choices',[])} for a in (answers or [])),isinstance(questions,list) and isinstance(answers,list) and bool(answers))
    agreement=d.get('cross_extractor_agreement');mark('VAL-PDF-006',agreement is True,agreement is not None)
    mark('VAL-PDF-007',all(isinstance(q.get('page_number'),int) and q.get('locator') for q in (questions or [])),isinstance(questions,list) and bool(questions))
    dedup=d.get('dedup') or {};mark('VAL-PDF-008',dedup.get('sha256_unique') is True and dedup.get('drive_id_unique') is True,isinstance(d.get('dedup'),dict))
    mark('VAL-PDF-009',d.get('schema_validated') is True,'schema_validated' in d)
    mark('VAL-PDF-010',all(q.get('source_id') and q.get('extraction_run_id') and q.get('extractor_version') for q in (questions or [])),isinstance(questions,list) and bool(questions))
    return {'status':'PASS' if all(s=='PASS' for s in checks.values()) else ('FAIL' if 'FAIL' in checks.values() else 'HOLD'), 'checks':checks, 'eligible_for_promotion': all(s=='PASS' for s in checks.values()) and d.get('review',{}).get('human_approved') is True and d.get('rights',{}).get('eligible') is True}
if __name__=='__main__':
    if len(sys.argv)!=2: sys.exit('usage: spe_validate_extraction.py canonical.json')
    result=validate(json.loads(pathlib.Path(sys.argv[1]).read_text(encoding='utf-8')))
    print(json.dumps(result,ensure_ascii=False,indent=2))
    sys.exit(1 if result['status']=='FAIL' else 0)

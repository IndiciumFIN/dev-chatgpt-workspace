"""Read-only hold evidence inventory; primary-key matches are not proof of authority."""
import csv,json,sys
from pathlib import Path
from collections import defaultdict

def evaluate(root):
    root=Path(root)
    keys={'entities':'canonical_id','object_versions':'object_version_id','findings':'finding_id','runs':'validation_run_id','test_runs':'test_run_id','sources':'source_id','snapshots':'snapshot_id','evidence_bundles':'evidence_bundle_id','decisions':'decision_id','change_requests':'change_request_id','assurance_checkpoints':'checkpoint_id','ipe_evaluations':'ipe_evaluation_id','agent_registry':'agent_id','responsibilities':'responsibility_id','audit_lens_runs':'audit_run_id'}
    idx=defaultdict(set)
    for name,key in keys.items():
        files=list(root.glob('*/'+name+'.json'))
        if len(files)!=1: raise ValueError('missing or ambiguous table '+name)
        for r in json.loads(files[0].read_text()):
            if r[key]: idx[r[key]].add(name)
    holds=json.loads((root/'cko_governance/scoped_holds.json').read_text())
    rows=[]; refs=[]
    for h in holds:
        if h['owner_layer_id']!='CKO-MD' or h['status']!='ACTIVE': continue
        ev=json.loads(h['evidence_refs'] or '[]')
        if not isinstance(ev,list) or any(not isinstance(x,str) or not x.strip() for x in ev): raise ValueError('invalid evidence references')
        ev=sorted(set(ev)); found=[x for x in ev if x in idx]
        for x in ev: refs.append(dict(hold_id=h['scoped_hold_id'],reference=x,matched_tables=';'.join(sorted(idx.get(x,[]))),status='LOCATED' if x in idx else 'NOT_IN_INDEX'))
        rows.append(dict(hold_id=h['scoped_hold_id'],hold_class=h['hold_class'],blocking_scope=h['blocking_scope'],subject_ref=h['subject_ref'],authority_ref=h['authority_ref'],subject_key_tables=';'.join(sorted(idx.get(h['subject_ref'],[]))),authority_key_tables=';'.join(sorted(idx.get(h['authority_ref'],[]))),declared_evidence=len(ev),located_evidence=len(found),unlocated_evidence=len(ev)-len(found),condition_present=bool(h['condition_expression']),reason_present=bool(h['reason']),status='HOLD'))
    if not rows or len({r['hold_id'] for r in rows})!=len(rows): raise ValueError('invalid hold population')
    summary=dict(holds=len(rows),indexed_tables=len(keys),subject_key_matches=sum(bool(r['subject_key_tables']) for r in rows),authority_key_matches=sum(bool(r['authority_key_tables']) for r in rows),holds_with_evidence=sum(r['declared_evidence']>0 for r in rows),holds_all_evidence_located=sum(r['declared_evidence']>0 and r['unlocated_evidence']==0 for r in rows),holds_partial_evidence=sum(0<r['located_evidence']<r['declared_evidence'] for r in rows),holds_no_evidence_located=sum(r['located_evidence']==0 for r in rows),evidence_links=len(refs),located_links=sum(r['status']=='LOCATED' for r in refs),distinct_evidence_refs=len({r['reference'] for r in refs}),conditions_present=sum(r['condition_present'] for r in rows),reasons_present=sum(r['reason_present'] for r in rows),resolved=0,kernel='HOLD',authorization=False)
    return rows,refs,summary
if __name__=='__main__':
    rows,refs,summary=evaluate(sys.argv[1]); out=Path(sys.argv[2]);out.mkdir(parents=True,exist_ok=True)
    for name,data in [('holds.csv',rows),('evidence_links.csv',refs)]:
        with (out/name).open('w',newline='',encoding='utf-8') as f:
            w=csv.DictWriter(f,fieldnames=list(data[0]));w.writeheader();w.writerows(data)
    (out/'summary.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps(summary))

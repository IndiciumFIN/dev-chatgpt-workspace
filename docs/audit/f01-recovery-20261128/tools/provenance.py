import json, sys
from pathlib import Path
from collections import Counter

def audit(root):
    def load(name):
        files=list(Path(root).glob('*/'+name+'.json'))
        if len(files)!=1: raise ValueError('missing or ambiguous '+name)
        return json.loads(files[0].read_text())
    def index(rows,key):
        values=[r[key] for r in rows]
        if any(not v for v in values) or len(set(values))!=len(values): raise ValueError('invalid key '+key)
        return set(values)
    versions=load('object_versions'); sources=load('sources'); snapshots=load('snapshots'); agents=load('agent_registry'); entities=load('entities')
    sid=index(sources,'source_id'); snid=index(snapshots,'snapshot_id'); aid=index(agents,'agent_id'); vid=index(versions,'object_version_id')
    counts=Counter(); distinct_missing=set()
    for v in versions:
        refs=json.loads(v['source_refs'] or '[]')
        if not isinstance(refs,list):
            counts['nonarray_source_refs']+=1; refs=[]
        counts['versions_with_source_refs' if refs else 'versions_without_source_refs']+=1
        counts['source_ref_occurrences']+=len(refs)
        for r in refs:
            if not isinstance(r,str) or not r.strip():
                counts['nonstring_or_empty_ref']+=1; continue
            counts['source_or_snapshot_key_match' if r in sid or r in snid else 'source_ref_outside_index']+=1
            if r not in sid and r not in snid: distinct_missing.add(r)
        counts['creator_registered_agent' if v['created_by'] in aid else 'creator_not_agent_key']+=1
    return dict(versions=len(versions),sources=len(sources),snapshots=len(snapshots),agents=len(agents),entities=len(entities),snapshot_source_missing=sum(r['source_id'] not in sid for r in snapshots),entity_current_version_missing=sum(r['current_version_ref'] not in vid for r in entities),distinct_source_refs_outside_index=len(distinct_missing),counts=dict(counts),status='HOLD',scope='Exact key matches in recovered projection only; no semantic authority or creator identity proof.')

if __name__=='__main__': print(json.dumps(audit(sys.argv[1]),indent=2))

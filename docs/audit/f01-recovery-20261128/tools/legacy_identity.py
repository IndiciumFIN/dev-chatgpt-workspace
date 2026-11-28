"""Read-only identity preservation checker. Never authorizes mutation."""
import json, sys, uuid
from collections import Counter
from pathlib import Path

def index(rows,key):
    out={}
    for row in rows:
        k=row[key]
        if not isinstance(k,str) or not k.strip() or k in out:
            raise ValueError('empty or duplicate '+key)
        out[k]=row
    return out

def evaluate(entities, versions, relationships, aliases):
    if not entities: raise ValueError('empty entity population')
    e=index(entities,'canonical_id')
    ids={k:uuid.UUID(v['object_uuid']) for k,v in e.items()}
    if len(set(ids.values()))!=len(ids): raise ValueError('duplicate UUID')
    if any(u.variant!=uuid.RFC_4122 for u in ids.values()): raise ValueError('invalid UUID variant')
    legacy={k for k,u in ids.items() if u.version!=7}
    v=index(versions,'object_version_id'); r=index(relationships,'relationship_id'); a=index(aliases,'alias_id')
    return dict(entities=len(e),uuid_versions=dict(sorted(Counter(str(u.version) for u in ids.values()).items())),legacy_entities=len(legacy),legacy_versions=sum(x['object_ref'] in legacy for x in v.values()),legacy_relationships=sum(x['source_id'] in legacy or x['target_id'] in legacy for x in r.values()),legacy_aliases=sum(x['canonical_id'] in legacy for x in a.values()),legacy_current_version_invalid=sum(bool(e[k].get('current_version_ref')) and (e[k]['current_version_ref'] not in v or v[e[k]['current_version_ref']]['object_ref']!=k) for k in legacy),kernel='HOLD',authorization=False,scope='direct semantic references only; preserve UUIDs; indirect consumers and authority pending')

if __name__=='__main__':
    root=Path(sys.argv[1]); paths=['cko_master/entities','cko_governance/object_versions','cko_master/relationships','cko_master/aliases']; print(json.dumps(evaluate(*(json.loads((root/(p+'.json')).read_text(encoding='utf-8')) for p in paths)),indent=2))

"""Read-only lineage and attestation consistency checker; no admission authority."""
import json, sys
from collections import Counter
from pathlib import Path

def evaluate(versions, corrections):
    idx = {v['object_version_id']: v for v in versions}
    if not idx or len(idx) != len(versions) or '' in idx:
        raise ValueError('invalid version population')
    if len({c['correction_id'] for c in corrections}) != len(corrections):
        raise ValueError('duplicate correction')
    counts = Counter(); matches = set(); exceptions = 0; cycles = 0
    for k,v in idx.items():
        p = v['parent_version_id']; h = v['parent_hash']; parent = idx.get(p)
        status = ('ROOT' if not p else 'PARENT_MISSING' if parent is None else
                  'HASH_MISSING' if not h else 'HASH_MATCH' if h == parent['content_hash'] else 'HASH_MISMATCH')
        counts[status] += 1
        seen = set(); node = k
        while node in idx and node not in seen:
            seen.add(node); node = idx[node]['parent_version_id']
        cycles += node in seen
        if status not in ('HASH_MATCH','ROOT'):
            exceptions += 1
            for c in corrections:
                if parent and c['child_object_version_id']==k and c['parent_version_id']==p and c['recorded_parent_hash']==h and c['observed_parent_content_hash']==parent['content_hash']:
                    if c['correction_status']=='APPROVED_ATTESTATION' and c['raw_history_preserved']=='t' and c['mutation_performed']=='f' and c['approved_by'] and c['approved_at'] and isinstance(json.loads(c['evidence_refs']),list) and json.loads(c['evidence_refs']):
                        matches.add(c['correction_id'])
    return dict(versions=len(versions),status_counts=dict(counts),exceptions=exceptions,cycle_affected_versions=cycles,corrections=len(corrections),structurally_matching_attestations=len(matches),undetermined_root_causes=sum(c['root_cause_status']=='UNDETERMINED' for c in corrections),resolved_exceptions=0,kernel='HOLD',authorization=False,scope='recorded hashes and attestation fields only; content digests and approval authority not verified')

if __name__=='__main__':
    root=Path(sys.argv[1]); print(json.dumps(evaluate(*(json.loads((root/(n+'.json')).read_text()) for n in ('object_versions','object_version_lineage_corrections'))),indent=2))

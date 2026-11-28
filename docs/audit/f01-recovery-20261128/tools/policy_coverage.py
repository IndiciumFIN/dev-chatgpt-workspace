"""Read-only candidate F01 policy coverage check, using extracted JSON tables."""
import json
import sys
from collections import Counter
from pathlib import Path


def index(rows, key):
    out = {}
    for row in rows:
        value = row[key]
        if not isinstance(value, str) or not value.strip() or value in out:
            raise ValueError(f'invalid or duplicate {key}')
        out[value] = row
    return out


def evaluate(types, policies, entities):
    if not types or not policies or not entities:
        raise ValueError('empty population')
    t = index(types, 'entity_type_id')
    p = index(policies, 'entity_type_id')
    index(policies, 'id_policy_id')
    index(entities, 'canonical_id')
    counts = Counter(e['entity_type_id'] for e in entities)
    missing = sorted(set(t) - set(p))
    invalid = sorted(k for k, v in p.items() if v['status'] != 'ACTIVE'
                     or v['reuse_forbidden'] not in ('t', True)
                     or not isinstance(v['legacy_preservation_rule'], str)
                     or not v['legacy_preservation_rule'].strip()
                     or not isinstance(v['strategy_code'], str)
                     or not v['strategy_code'].strip())
    return {'types': len(t), 'policies': len(p), 'entities': len(entities),
            'missing_types': missing, 'affected_entities': sum(counts[k] for k in missing),
            'orphan_policy_types': sorted(set(p)-set(t)),
            'unknown_entity_types': sorted(set(counts)-set(t)),
            'invalid_policy_types': invalid,
            'strategy_counts': dict(sorted(Counter(v['strategy_code'] for v in p.values()).items())),
            'kernel': 'HOLD', 'authorization': False,
            'scope': 'structural coverage; strategy semantics and authority not homologated'}


if __name__ == '__main__':
    if len(sys.argv) != 2:
        raise SystemExit('usage: policy_coverage.py <directory containing extracted master JSON>')
    root = Path(sys.argv[1])
    tables = [json.loads((root / (n+'.json')).read_text(encoding='utf-8'))
              for n in ('entity_types', 'id_policies', 'entities')]
    print(json.dumps(evaluate(*tables), indent=2))

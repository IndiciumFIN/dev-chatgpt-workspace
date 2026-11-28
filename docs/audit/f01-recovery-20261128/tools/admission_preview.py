"""Read-only candidate policy admission preview; never grants authority."""
import json, re, sys
from pathlib import Path
from policy_coverage import evaluate

def preview(types, policies, entities):
    coverage = evaluate(types, policies, entities)
    candidates = {'LABOR_TOOL': r'^WK-[0-9]{3}$', 'DEVICE_COHORT': r'^COHORT-[A-Z0-9-]+$'}
    result = []
    for kind, pattern in sorted(candidates.items()):
        declared = [t for t in types if t['entity_type_id'] == kind]
        population = [e for e in entities if e['entity_type_id'] == kind]
        mismatch = sum(re.fullmatch(pattern, e['canonical_id']) is None for e in population)
        blockers = ['AUTHORITY_NOT_HOMOLOGATED', 'STRATEGY_SEMANTICS_NOT_HOMOLOGATED']
        if len(declared) != 1 or declared[0].get('id_pattern') != pattern:
            blockers.append('TYPE_PATTERN_MISMATCH')
        if kind not in coverage['missing_types']:
            blockers.append('POLICY_ALREADY_PRESENT_OR_TYPE_ABSENT')
        if mismatch:
            blockers.append('EXISTING_ID_PATTERN_MISMATCH')
        result.append(dict(entity_type=kind, pattern=pattern, existing_count=len(population), mismatch_count=mismatch, candidate_strategy='EXISTING_OR_FAIL_CLOSED', preserve_existing=True, reuse_forbidden=True, blockers=blockers, status='HOLD'))
    return dict(candidates=result, authorization=False, kernel='HOLD')

if __name__ == '__main__':
    root=Path(sys.argv[1])
    print(json.dumps(preview(*(json.loads((root/(n+'.json')).read_text()) for n in ('entity_types','id_policies','entities'))),indent=2))

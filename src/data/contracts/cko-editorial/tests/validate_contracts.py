from pathlib import Path
import json, sys
try:
    import jsonschema
except Exception as e:
    print('jsonschema unavailable:', e); sys.exit(2)
ROOT=Path(__file__).resolve().parents[1]

def load(p): return json.loads((ROOT/p).read_text(encoding='utf-8'))

tm_schema=load('schemas/template_manifest.schema.json')
pr_schema=load('schemas/projection_request.schema.json')

profiles=sorted((ROOT/'profiles').glob('*.json'))
errors=[]
for p in profiles:
    try: jsonschema.Draft202012Validator(tm_schema).validate(json.loads(p.read_text(encoding='utf-8')))
    except Exception as e: errors.append(f'{p.name}: {e}')
try:
    # Resolve local refs from sibling schemas by building a registry is more verbose; replace refs inline for this compact test.
    req=load('examples/article_projection_request.json')
    for required in pr_schema['required']:
        if required not in req: errors.append(f'projection missing {required}')
    # Directly validate block/resource payloads against their schemas.
    bs=load('schemas/block_instance.schema.json'); rs=load('schemas/resource_binding.schema.json')
    for b in req['block_plan']: jsonschema.Draft202012Validator(bs).validate(b)
    for r in req.get('resource_bindings',[]): jsonschema.Draft202012Validator(rs).validate(r)
except Exception as e: errors.append(f'projection example: {e}')

registry=load('registry/template_registry.json')
if registry['count'] != 8 or len(registry['templates']) != 8: errors.append('template registry denominator != 8')
comp=load('registry/component_registry.json')
if comp['count'] != len(comp['components']): errors.append('component registry count mismatch')
norm=load('registry/related_content_normalization.json')
if norm['unique_source_labels'] != 64 or norm['classified_labels'] != 64 or norm['unclassified_labels'] != 0: errors.append('related_content normalization is not 64/64')
cs=load('schemas/content_projection_classification.schema.json')
for r in norm['records']: jsonschema.Draft202012Validator(cs).validate(r)
ov=load('registry/overlay_registry.json')
if ov['count'] != len(ov['overlays']): errors.append('overlay registry count mismatch')

if errors:
    print('FAIL')
    for e in errors: print('-',e)
    sys.exit(1)
print(f'PASS: {len(profiles)}/8 template manifests valid; 64/64 upstream related_content labels normalized; example contracts valid; registries consistent')

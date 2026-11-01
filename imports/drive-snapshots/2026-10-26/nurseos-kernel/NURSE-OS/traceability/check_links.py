#!/usr/bin/env python3
"""
TRACEABILITY CHECK — tudo deve ser linkado
==========================================
Regra (POL-026): nenhum artefato chega ao front-end sem provir do MD fonte
com base legal registrada. Este verificador constrói o grafo de links e
bloqueia se algo estiver órfão. O front-end consome o resultado VERIFICADO.
"""
import json, os, sys, hashlib

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..")

def load(p): return json.load(open(os.path.join(ROOT, p), encoding="utf-8"))

links = load("traceability/links.json")
policies = {p["policy_id"]: p for p in load("policy-engine/policies.json")["policies"]}
runs = [r["run_id"] for r in load("policy-engine/runs.json")["runs"]]
verticals = load("policy-engine/verticals.json")["verticals"]

# parse do documento-mestre em seções (MD é a fonte)
doc_path = os.path.join(ROOT, "architecture/nursing-intelligence-os-v2.md")
sections, current, buf = [], None, []
for line in open(doc_path, encoding="utf-8"):
    if line.startswith("## "):
        if current: sections.append((current, "\n".join(buf)))
        current, buf = line[3:].strip(), []
    elif current:
        buf.append(line)
if current: sections.append((current, "\n".join(buf)))

def find_sections(pid):
    return [s[0][:70] for s in sections if pid in s[1]]

errors, graph = [], {"generated_at": "2026-09-03", "chain": links["chain"], "policies": {}, "verticals": []}

for pid, p in policies.items():
    meta = links["policies"].get(pid)
    secs = find_sections(pid)
    if not secs:
        errors.append(f"{pid}: órfã — não aparece em nenhuma seção do MD fonte")
        continue
    if not meta or not meta.get("legal_basis"):
        errors.append(f"{pid}: sem base legal registrada em links.json")
        continue
    missing_runs = [r for r in meta.get("runs", []) if r not in runs]
    if missing_runs:
        errors.append(f"{pid}: referencia runs inexistentes: {missing_runs}")
    graph["policies"][pid] = {
        "title": p["title"], "severity": p.get("severity", "blocking"),
        "version": p.get("version", "1.0"), "status": p.get("status"),
        "source_md": {"doc": "architecture/nursing-intelligence-os-v2.md", "sections": secs},
        "legal_basis": meta["legal_basis"], "runs": meta.get("runs", []),
    }

for v in verticals:
    graph["verticals"].append({"vertical_id": v["vertical_id"], "name": v["name"], "status": v["status"],
                               "mission_ref": v.get("mission_ref"), "run_ref": v.get("run_ref"),
                               "outcome_ref": v.get("outcome_ref")})

# POL-026 v1.1 — norma granular por CAMPO evidencia aderência (não é exibida; sustenta)
fn = load("traceability/field_norms.json")
field_graph = []
for f in fn["fields"]:
    ent, fld = f["entity"], f["field"]
    if ent not in fn["entity_fields"] or fld not in fn["entity_fields"][ent]:
        errors.append(f"campo órfão: {ent}.{fld} não existe no snapshot de entidades")
        continue
    if not f.get("norm") or not f.get("evidencia"):
        errors.append(f"campo sem norma/evidência: {ent}.{fld}")
        continue
    field_graph.append(f)
graph["field_adherence"] = field_graph

if errors:
    print("TRACEABILITY: FAILED")
    for e in errors: print(f"  [ORPHAN] {e}")
    sys.exit(1)

out = os.path.join(HERE, "links-verified.json")
json.dump(graph, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
chk = hashlib.sha256(json.dumps(graph, sort_keys=True, ensure_ascii=False).encode()).hexdigest()[:16]
print(f"TRACEABILITY: OK — {len(graph['policies'])} políticas, {len(graph['verticals'])} verticais, "
      f"{len(graph['field_adherence'])} campos com norma granular evidenciando aderência — grafo {chk}…")
sys.exit(0)

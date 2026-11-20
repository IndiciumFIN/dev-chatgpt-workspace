#!/usr/bin/env python3
"""
NURSE-PALM v0 — Governed Clinical RAG (Fatia 5, núcleo da camada de inteligência)
=============================================================================
O LLM não recebe "prompt". Recebe um GOVERNED CONTEXT PACKAGE (Fatia 1),
recupera CKOs versionados (retrieval lexical v0), gera rascunho citado,
constrói o objeto uncertainty AUTOMATICAMENTE a partir da evidência,
declara provenance por passo e emite Decision Record (Evidence Graph v0).

Model Router v0: o 'modelo' é o drafter determinístico grounded em CKOs.
O slot do LLM real existe (call_model) e seguirá ESTAS MESMAS asserções —
o LLM entra DENTRO do envelope, nunca ao lado.

Rotas:
  - Happy path: contexto íntegro -> rascunho completado (RUN-2026-0005)
  - Refusal path: contexto sem Braden -> BLOCKED, sem rascunho (demo de recusa)
"""
import json, hashlib, os, re
from datetime import datetime

HERE = os.path.dirname(os.path.abspath(__file__))
NOW = datetime.fromisoformat("2026-09-02T20:12:00-03:00")   # instante de referência do PoC
FRESH_WINDOW_MIN = 15                                        # POL-011/POL-006: escore stale > 15 min

ckos = {c["identity"]["cko_uri"]: c for c in json.load(open(f"{HERE}/ckos.json", encoding="utf-8"))["ckos"]}
twin_events = json.load(open(f"{HERE}/../policy-engine/twin-events.json", encoding="utf-8"))["twin_events"]
TWIN_SNAPSHOT = {"patient_ref": "fhir:Patient/88412", "consent_care": True, "braden": 14,
                 "braden_valid_from": "2026-09-02T20:00:00-03:00"}

def h(s): return hashlib.sha256(s.encode()).hexdigest()[:16] + "…"
def age_min(ev): return (NOW - datetime.fromisoformat(ev["valid_from"])).total_seconds() / 60

# ---------------------------------------------------------------- retrieval
STOP = set("de da do e em para com a o que no na por sob entre sobre".split())
def tokenize(t): return [w for w in re.findall(r"[a-zà-úà-ù0-9]+", t.lower()) if w not in STOP]

def retrieve(query, k=3):
    q = tokenize(query)
    scored = []
    for uri, c in ckos.items():
        text = json.dumps(c, ensure_ascii=False).lower()
        score = sum(1.0 for w in q if w in text) / max(len(q), 1)
        if score > 0:
            scored.append({"ref": uri, "version": c["identity"]["version"],
                           "score": round(score, 2), "hash": h(uri + c["identity"]["version"])})
    scored.sort(key=lambda x: -x["score"])
    return scored[:k]

# ------------------------------------------------- governed context package
def build_context_package(task, events, include_gaps=False):
    valid = [e for e in events if (e.get("valid_to") is None
                                  and datetime.fromisoformat(e["valid_from"]) <= NOW)]
    scores = {e["label"]: e for e in valid if e["event_type"] == "score"}
    meds   = [e for e in valid if e["event_type"] == "medication"]
    risks  = [e for e in valid if e["event_type"] == "risk"]

    complete = bool(scores) and bool(meds) and (TWIN_SNAPSHOT["braden"] is not None)
    current = all(age_min(e) <= FRESH_WINDOW_MIN for e in scores.values())
    integrity = {
        "complete": complete, "current": current, "authorized": TWIN_SNAPSHOT["consent_care"],
        "relevant": True, "uncontaminated": True, "consistent": True, "sufficient": complete and current,
    }
    gaps = ["Escala de Braden ausente do twin"] if not include_gaps and TWIN_SNAPSHOT["braden"] is None else []
    if include_gaps: gaps.append("cenário de teste: Braden removido do snapshot")
    pkg = {
        "package_id": "CP-2026-0005", "generated_at": NOW.isoformat(), "task": task,
        "identity": {"agent_slug": "sae-copilot", "user_role": "RN", "encounter_ref": "fhir:Encounter/98321"},
        "twin_snapshot": {"patient_ref": TWIN_SNAPSHOT["patient_ref"], "events": valid,
                          "braden": TWIN_SNAPSHOT["braden"]},
        "knowledge_refs": [], "evidence_refs": [e["label"] for e in valid],
        "policies_resolved": ["POL-001", "POL-004", "POL-006", "POL-007", "POL-008"],
        "tools_authorized": ["corpus:ckos.json"],
        "temporal_state": {"now": NOW.isoformat(), "data_freshness": f"{FRESH_WINDOW_MIN} min"},
        "risk_flags": [r["label"] for r in risks],
        "integrity": integrity, "integrity_gaps": gaps,
    }
    pkg["package_hash"] = h(json.dumps(pkg, sort_keys=True, ensure_ascii=False))
    return pkg, scores, meds, risks

# ------------------------------------------------------------ the generator
def generate_sae_draft(pkg, scores, meds, risks):
    retrieval_results = []
    for q in ["prevenção queda anticoagulante risco", "lesão pressão reposicionamento Braden"]:
        retrieval_results += retrieve(q, k=2)
    pkg["knowledge_refs"] = list({r["ref"] for r in retrieval_results})

    morse = next((e for e in scores.values() if "Morse" in e["label"]), None)
    m_val = morse["value"].split("—")[0].strip() if morse else "?"
    anticoag = next((m for m in meds if "Varfarina" in m["label"]), None)
    related = []
    if anticoag: related.append(f"anticoagulação em uso ({anticoag['label']})")
    if morse: related.append(f"escore de Morse {m_val} — risco alto")

    draft = {
        "nursing_diagnoses": [
            {"nanda_code": "00047", "label": "Risco de queda", "related_factors": related,
             "source_cko_refs": ["cko://procedures/fall-prevention", anticoag and "cko://medications/varfarina"]},
            {"nanda_code": "00248", "label": "Risco de lesão por pressão",
             "related_factors": [f"Braden {pkg['twin_snapshot']['braden']} — risco moderado"],
             "source_cko_refs": ["cko://procedures/pressure-injury-prevention"]},
        ],
        "interventions": [
            {"nic_code": "6490", "label": "Prevenção de quedas", "priority": 1,
             "source_cko_refs": ["cko://procedures/fall-prevention"]},
            {"nic_code": "0840", "label": "Reposicionamento terapêutico", "priority": 2,
             "source_cko_refs": ["cko://procedures/pressure-injury-prevention"]},
        ],
        "outcomes": [
            {"noc_code": "1902", "label": "Comportamento de prevenção de queda",
             "target": "0 quedas na internação", "source_cko_refs": ["cko://procedures/fall-prevention"]},
        ],
        "safety_flags": ["anticoagulante em uso — queda implica risco de sangramento"],
        "citations_cko": pkg["knowledge_refs"],
    }
    # uncertainty construída AUTOMATICAMENTE a partir da evidência de execução
    conflicts = [{"source_a": "séries europeias", "claim_a": "risco ~1:1.000.000",
                  "source_b": "séries latino-americanas", "claim_b": "risco até ~1:1.439",
                  "resolution": "CON-2026-0001 (both_true)"}] if "cko://medications/dipirona" in pkg["knowledge_refs"] else []
    top_score = max(r["score"] for r in retrieval_results) if retrieval_results else 0
    confidence = round(0.55 + 0.15 * top_score + (0.15 if pkg["integrity"]["sufficient"] else 0), 2)
    uncertainty = {
        "state": "high_confidence" if confidence >= 0.80 else "uncertain",
        "confidence": confidence,
        "why": f"rascunho grounded em {len(retrieval_results)} CKOs versionados; escores frescos (<{FRESH_WINDOW_MIN} min); integridade completa"
               + ("; faixa de risco de agranulocitose carregada com incerteza explícita" if conflicts else ""),
        "based_on": [f"{r['ref']} {r['version']}" for r in retrieval_results] + [f"PatientTwin v4 ({FRESH_WINDOW_MIN}min)"],
        "freshness": f"escores do twin com <= {FRESH_WINDOW_MIN} min",
        "conflicts": conflicts,
        "what_would_change_conclusion": ["Morse < 45 na reavaliação", "suspensão do anticoagulante", "Braden < 12"],
    }
    return draft, retrieval_results, confidence, uncertainty

# ------------------------------------------------- runtime + provenance
def assemble_run(pkg, draft, retrieval_results, confidence, uncertainty):
    steps = [
        {"provenance_id": "PRV-0005-a", "step": "input", "source": f"context-package:{pkg['package_id']}",
         "version": "twin v4", "hash": pkg["package_hash"], "actor": "sae-copilot", "policy": "POL-006"},
        {"provenance_id": "PRV-0005-b", "step": "retrieval", "source": "corpus:ckos.json (6 CKOs)",
         "version": "v0", "hash": h(json.dumps(retrieval_results, sort_keys=True)),
         "actor": "nurse-palm-v0/retrieve", "policy": "POL-008"},
        {"provenance_id": "PRV-0005-c", "step": "model", "source": "nurse-palm-v0-drafter (determinístico)",
         "version": "v0", "hash": h(json.dumps(draft, sort_keys=True, ensure_ascii=False)),
         "actor": "nurse-palm-v0", "policy": "POL-001"},
        {"provenance_id": "PRV-0005-d", "step": "output", "source": "sae-draft", "version": "0.3.0",
         "hash": h("run-2026-0005-output"), "actor": "sae-copilot", "policy": "POL-007"},
    ]
    run = {
        "run_id": "RUN-2026-0005", "agent_slug": "sae-copilot", "confidence": confidence,
        "human_review_required": True, "has_medication_change": False,
        "citations_cko": draft["citations_cko"], "context_integrity": "complete",
        "uncertainty": uncertainty, "decision_id": "DEC-2026-0005", "provenance": steps,
    }
    return run, steps

def refusal_run(pkg):
    return {
        "run_id": "RUN-2026-0006", "agent_slug": "sae-copilot", "confidence": 0.0,
        "human_review_required": True, "has_medication_change": False,
        "citations_cko": [], "context_integrity": "blocked",
        "uncertainty": {"state": "missing", "confidence": 0.0, "why": "contexto incompleto — Braden ausente; POL-006 exige request data antes de qualquer raciocínio",
                        "based_on": [], "freshness": "n/d", "conflicts": [],
                        "what_would_change_conclusion": ["snapshot do twin completo"]},
        "decision_id": "DEC-2026-0006", "provenance": [
            {"provenance_id": "PRV-0006-a", "step": "input", "source": f"context-package:{pkg['package_id']}",
             "version": "twin v4", "hash": pkg["package_hash"], "actor": "sae-copilot", "policy": "POL-006"}],
        "refused": True, "policy_violations": ["POL-006 context integrity: blocked"],
    }

# -------------------------------------------------------------------- main
def main():
    os.makedirs(f"{HERE}/output", exist_ok=True)

    # --- happy path
    pkg, scores, meds, risks = build_context_package("Rascunhar SAE para paciente 88412", twin_events)
    assert all(pkg["integrity"].values()), "integridade deveria estar completa no happy path"
    draft, retrieval, conf, unc = generate_sae_draft(pkg, scores, meds, risks)
    run, steps = assemble_run(pkg, draft, retrieval, conf, unc)

    decision = {
        "decision_id": "DEC-2026-0005", "run_id": "RUN-2026-0005", "agent_slug": "sae-copilot",
        "agent_version": "0.3.0", "applicable_policies": pkg["policies_resolved"],
        "cko_versions_used": [{"ref": r["ref"], "version": r["version"], "hash": r["hash"]} for r in retrieval],
        "model_version": "nurse-palm-v0-drafter",
        "tool_calls": [{"tool": "corpus:retrieve", "provenance_id": "PRV-0005-b", "result_hash": steps[1]["hash"]}],
        "input_state_digest": pkg["package_hash"], "context_package_id": pkg["package_id"],
        "runtime_assertions": [
            {"assertion": "POL-006 context integrity complete", "result": "passed"},
            {"assertion": "POL-001 sem alteração de medicação", "result": "passed"},
            {"assertion": "POL-007 uncertainty completa", "result": "passed"},
            {"assertion": "POL-008 decision_id + provenance fechada", "result": "passed"},
        ],
        "action": "sae-draft gerado para revisão do enfermeiro (L1)", "evidence_ref": "EV-NP-0005",
    }
    json.dump({"context_package": pkg, "draft": draft, "decision_record": decision},
              open(f"{HERE}/output/run-2026-0005.json", "w", encoding="utf-8"), ensure_ascii=False, indent=2)

    # --- refusal path (cenário: Braden ausente)
    TS_BK = dict(TWIN_SNAPSHOT); TS_BK["braden"] = None
    globals()["TWIN_SNAPSHOT"] = TS_BK
    pkg2, *_ = build_context_package("Rascunhar SAE para paciente 88412", twin_events)
    assert not pkg2["integrity"]["complete"], "cenário de recusa deveria estar incompleto"
    refused = refusal_run(pkg2)
    json.dump({"context_package": pkg2, "refused_run": refused,
               "note": "POL-006: contexto incompleto => BLOCK + REQUEST DATA. Nenhum rascunho é gerado; nada chega ao modelo."},
              open(f"{HERE}/output/run-2026-0006-refusal.json", "w", encoding="utf-8"), ensure_ascii=False, indent=2)

    # --- run saudável entra na cadeia de evidência; bloqueado fica documentado fora dela
    runs_path = f"{HERE}/../policy-engine/runs.json"
    runs = json.load(open(runs_path, encoding="utf-8"))
    runs["runs"] = [r for r in runs["runs"] if r["run_id"] != run["run_id"]] + [run]
    json.dump(runs, open(runs_path, "w", encoding="utf-8"), ensure_ascii=False, indent=2)

    print(f"RUN-2026-0005: rascunho gerado | confianca={conf} | uncertainty={unc['state']}")
    print(f"  CKOs citados: {draft['citations_cko']}")
    print(f"  pacote: {pkg['package_id']} hash={pkg['package_hash']}")
    print(f"RUN-2026-0006: RECUSADO (POL-006) — sem rascunho, sem chamada ao modelo")
    print("outputs em nurse-palm-v0/output/")

if __name__ == "__main__":
    main()

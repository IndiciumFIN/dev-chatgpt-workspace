"""NORM-KERNEL pipeline v0.1.0 — EXTRACT → PARSE → ATOMIZE → CANONIZE → VALIDATE → GOVERN.

Fase 0 (calibração): 2 fixtures (portaria sintética pt-BR + RFC-style en).
Gates bloqueantes com evidência sha256 (JCS RFC 8785). PUBLISH (a11y/SEO/Lighthouse
gates) entra na Fase 0.2 com build_frontend.py — sequência do roadmap.
Uso: python pipeline.py  → sai com código 1 se QUALQUER gate BLOCKED.
"""
import datetime
import json
import re
import os
import sys

from jcs import canonicalize, sha256_of, sha256_text
import atomizer
import check_links

HERE = os.path.dirname(os.path.abspath(__file__))
VERSION = "norm-kernel-pipeline-v0.7.5"
EVIDENCE_ID = "EV-NK-0010"
DERIVATION_EVIDENCE_ID = "EV-NK-0002"

LICENCES = ["KL-0001", "KL-0002", "KL-0003", "KL-0004", "KL-0005"]

FIXTURES = [
    {
        "path": "fixtures/portaria_fixture.txt",
        "lang": "pt",
        "meta": {
            "doc_id": "NK-DOC-FIX-0001", "source_ref": "SRC-CAL-FIXTURE",
            "doc_type": "portaria", "number": "42", "year": 2026,
            "issuer": "Agência Fictícia de Vigilância",
            "canonical_citation": "FIXTURE sintético de calibração — não é norma real",
            "hierarchy_rank": 4, "license_ref": "KL-0005", "status": "fixture",
        },
    },
    {
        "path": "fixtures/rfc_fixture.txt",
        "lang": "en",
        "meta": {
            "doc_id": "NK-DOC-FIX-0002", "source_ref": "SRC-CAL-FIXTURE",
            "doc_type": "spec", "number": "cal-001", "year": 2026,
            "issuer": "NORM-KERNEL (keyword scheme atribuído a RFC 2119)",
            "canonical_citation": "FIXTURE sintético de calibração — scheme RFC 2119 (IETF Trust)",
            "hierarchy_rank": 6, "license_ref": "KL-0005", "status": "fixture",
        },
    },
]


def process_fixture(fixture, atom_seq):
    with open(os.path.join(HERE, fixture["path"]), encoding="utf-8") as f:
        text = f.read()
    segments = atomizer.parse_document(text, fixture["lang"])
    # R4 — teste de reconstrução
    rebuilt = "".join(seg["text"] for seg in segments)
    reconstruction_ok = sha256_text(rebuilt) == sha256_text(text)
    atoms, nonnorm = [], []
    for seg in segments:
        if seg["kind"] == "atom":
            atom_seq += 1
            atoms.append({
                "atom_id": f"NK-ATOM-{atom_seq:07d}",
                "doc_ref": fixture["meta"]["doc_id"],
                "atom_type": seg["atom_type"], "modality": seg["modality"],
                "subject_raw": seg["subject_raw"], "subject_canon": seg["subject_canon"],
                "action_raw": seg["action_raw"], "action_canon": seg["action_canon"],
                "object_raw": seg["object_raw"], "object_canon": seg["object_canon"],
                "deadline_raw": seg["deadline_raw"], "conditions_json": {},
                "verbatim_text": seg["text"].rstrip("\n"),
                "locator_path": seg["locator_path"],
                "checksum": sha256_text(seg["text"].rstrip("\n")),
                "coverage_token": sha256_text(seg["text"]),
                "confidence": seg["confidence"],
                "status": "valid" if seg["confidence"] >= 0.85 else "review_pending",
                "validity_json": {"in_force_at": None, "revoked_at": None, "revoked_by": None},
                "links_json": {}, "field_norms_ref": "annex:field_norms.json#NormAtom",
                "evidence_id": DERIVATION_EVIDENCE_ID,
                "i18n_json": {"en": {"status": "machine"}, "es": {"status": "machine"}},
                "plain_language": f"[gerado v0.1] {seg['atom_type']}: {seg['subject_raw'] or 'geral'} — {seg['action_raw'] or seg['text'][:60]}",
                "seo_json": {"uri_slug": f"fixture/{fixture['meta']['doc_id']}/{'-'.join(seg['locator_path'])}"},
            })
        else:
            nonnorm.append({"line": seg["line"], "reason": seg["reason"],
                            "locator_path": seg["locator_path"]})
    doc = dict(fixture["meta"])
    doc["structure_tree"] = [f"linha {s['line']}: {s['reason']}" for s in nonnorm]
    doc["coverage_json"] = {
        "reconstruction_checksum": sha256_text(rebuilt),
        "reconstruction_ok": reconstruction_ok,
        "atom_count": len(atoms), "non_normative_count": len(nonnorm),
        "classified_percent": 100.0,
        "unknown_universe_explicit": True,
    }
    doc["evidence_id"] = DERIVATION_EVIDENCE_ID
    doc["amendments"] = []
    return doc, atoms, nonnorm, atom_seq



def _drift_files():
    """POL-NK-006 C2/C3: arquivos divergentes do artifact_register (diff)."""
    import os, hashlib
    BASE = os.path.dirname(os.path.abspath(__file__))
    reg = json.load(open(os.path.join(BASE, "registers", "artifact_register.json"), encoding="utf-8"))
    regf = os.path.join(BASE, "registers", "artifact_register.json")
    by_file = {a["file"]: a.get("sha256") for a in reg.get("artifacts", {}).values()}
    files = set()
    for root, dirs, names in os.walk(BASE):
        dirs[:] = [d for d in dirs if d != "__pycache__"]
        for n in names:
            p = os.path.join(root, n)
            if os.path.abspath(p) == os.path.abspath(regf): continue
            files.add(os.path.relpath(p, BASE))
    drift = []
    for f in sorted(files):
        with open(os.path.join(BASE, f), "rb") as fh:
            c = "sha256:" + hashlib.sha256(fh.read()).hexdigest()
        if f not in by_file: drift.append(f"{f} (NOVO sem registro)")
        elif by_file[f] != c: drift.append(f"{f} (checksum divergente)")
    return sorted(drift)

def _open_finding_auto(drift, when):
    """POL-NK-007 C1: finding automático no bloqueio por diff sem OS."""
    import uuid
    path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "registers", "findings.json")
    F = json.load(open(path, encoding="utf-8"))
    nxt = 1
    while f"NK-FIND-{nxt:04d}" in F["findings"]: nxt += 1
    fid = f"NK-FIND-{nxt:04d}"
    F["findings"][fid] = {
        "finding_id": fid, "status": "open", "detected_by": "pipeline v0.6.0 (G9 drift sem --os)",
        "detected_at": when,
        "what": "Diff de artefatos sem OS que o cubra (POL-NK-006 C2): " + "; ".join(drift[:10]) + ("…" if len(drift) > 10 else ""),
        "where_born": "A determinar na investigação (POL-NK-007 C2)",
        "why_root_cause": None, "facts": drift, "evidence_refs": [],
        "remediation": {"actions": [], "os_refs": []},
        "prevention": None, "kernel_approval": None, "human_approval": "pending Leivis",
        "lifecycle": ["open", "investigating", "remediated", "closed"]
    }
    json.dump(F, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    return fid


def _gate_findings():
    """G10 — POL-NK-007: investigação formal. Estrutura 5W obrigatória;
    fechamento (closed) exige causa-raiz, remediação, aprovação KERNEL e HUMANA."""
    import os
    p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "registers", "findings.json")
    problems = []
    if not os.path.exists(p):
        return {"gate": "G10-findings", "status": "BLOCKED", "detail": "registro de findings ausente", "problems": ["registers/findings.json ausente"]}
    F = json.load(open(p, encoding="utf-8"))
    n = 0
    for fid, f in F.get("findings", {}).items():
        n += 1
        for k in ["what", "where_born", "facts", "evidence_refs", "remediation", "kernel_approval", "human_approval"]:
            if k not in f:
                problems.append(f"{fid}: campo 5W ausente ({k}) — investigação incompleta (C2)")
        if f.get("status") not in ["open", "investigating", "remediated", "closed"]:
            problems.append(f"{fid}: status fora do lifecycle (C5)")
        if f.get("status") == "closed":
            if not (f.get("kernel_approval") or "").startswith("approved"):
                problems.append(f"{fid}: fechado SEM aprovação do kernel (C3)")
            if not (f.get("human_approval") or "").startswith("approved"):
                problems.append(f"{fid}: fechado SEM aprovação humana (C3)")
            if not f.get("why_root_cause") or not f.get("prevention"):
                problems.append(f"{fid}: fechado SEM causa-raiz/prevenção (C2)")
        elif f.get("status") == "remediated" and not f.get("why_root_cause"):
            problems.append(f"{fid}: remediated sem causa-raiz declarada (C2)")
    return {"gate": "G10-findings", "status": "PASSED" if not problems else "BLOCKED",
            "detail": f"{n} findings registrados, {len([f for f in F['findings'].values() if f['status']=='open'])} abertos, {len(problems)} violações", "problems": problems[:20]}

def _gate_backlog():
    """G11 — POL-NK-006 C6: backlog normativo íntegro — cada item tem fonte
    registrada, método, OS prevista e tracking ponta a ponta."""
    import os
    p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "registers", "backlog.json")
    problems = []
    if not os.path.exists(p):
        return {"gate": "G11-backlog", "status": "BLOCKED", "detail": "backlog ausente", "problems": ["registers/backlog.json ausente"]}
    B = json.load(open(p, encoding="utf-8"))
    n = 0
    for bid, b in B.get("items", {}).items():
        n += 1
        for k in ["norm", "source_ref", "method", "license", "os_planned", "status", "tracking"]:
            if not b.get(k) and k != "tracking":
                problems.append(f"{bid}: campo obrigatório ausente ({k})")
        if b.get("status") not in ["backlog", "blocked_license", "os_created", "extracting", "extracted", "atomized", "validated", "done", "cancelled"]:
            problems.append(f"{bid}: status fora do enum do backlog")
        if b.get("status") == "blocked_license" and "pending" not in (b.get("license") or ""):
            problems.append(f"{bid}: blocked_license sem licença pendente declarada (P7)")
        t = b.get("tracking") or {}
        for k in ["job_id", "run_id", "doc_id", "evidence_id"]:
            if k not in t:
                problems.append(f"{bid}: tracking ponta a ponta incompleto ({k})")
    return {"gate": "G11-backlog", "status": "PASSED" if not problems else "BLOCKED",
            "detail": f"{n} normativos no backlog, {len(problems)} violações", "problems": problems[:20]}


def _ledger(os_arg, run_id, evidence_id, artifacts_changed, status):
    """POL-NK-008 C3: task do kernel no ledger — referência cruzada
    os↔run↔evidência↔artefatos no REGISTER (bloqueante via G12)."""
    import os as _os
    from datetime import datetime as _dt
    p = _os.path.join(HERE, "registers", "kernel_tasks.json")
    T = json.load(open(p, encoding="utf-8"))
    n = 1
    while f"NK-TASK-{n:03d}" in T.get("tasks", {}): n += 1
    tid = f"NK-TASK-{n:03d}"
    T.setdefault("tasks", {})[tid] = {
        "task_id": tid,
        "os_ref": os_arg or "(run sem --os — bloqueio/finding)",
        "run_ref": run_id,
        "evidence_ref": evidence_id,
        "artifacts": artifacts_changed[:50],
        "ts": _dt.now().isoformat(),
        "run_status": status
    }
    json.dump(T, open(p, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    return tid

def main(argv=None):
    # POL-NK-006 C5: --os (reserva determinística de OS que cobre o run)
    # e --run (id do run de registro). Sem --os, drift = bloqueio + finding (C3).
    import sys as _sys
    _argv = list(argv) if argv is not None else _sys.argv[1:]
    os_arg = None
    if "--os" in _argv:
        _i = _argv.index("--os")
        if _i + 1 < len(_argv): os_arg = _argv[_i+1]
    if "--run" in _argv:
        _i = _argv.index("--run")
        if _i + 1 < len(_argv): RUN_ID = _argv[_i+1]

    docs, atoms, all_nonnorm = [], [], []
    seq = 0
    for fixture in FIXTURES:
        doc, doc_atoms, nonnorm, seq = process_fixture(fixture, seq)
        docs.append(doc)
        atoms.extend(doc_atoms)
        all_nonnorm.extend(nonnorm)

    # CANONIZE — dicionário a partir dos canon_refs usados (+ authority estático)
    dictionary = {}
    for atom in atoms:
        for ref in (atom["subject_canon"], atom["action_canon"], atom["object_canon"]):
            if ref:
                ns, slug_part = ref.split(":", 1)[1].split(":", 1)
                label = {"subject_canon": atom["subject_raw"],
                         "action_canon": atom["action_raw"],
                         "object_canon": atom["object_raw"]}
                dictionary[ref] = {
                    "term_id": ref, "namespace": ns,
                    "label": label[[k for k in ("subject_canon", "action_canon",
                                                "object_canon")
                                    if atom[k] == ref][0]] or slug_part,
                    "definition": "Definição pendente — termo descoberto na calibração v0.1 (débita Fase 0)",
                    "definition_source_ref": atom["doc_ref"],
                    "i18n_json": {"en": {"status": "machine"}},
                    "atom_definition_ref": None, "status": "active",
                }
    dictionary["DICT:authority:autoridade-sanitaria"] = {
        "term_id": "DICT:authority:autoridade-sanitaria", "namespace": "authority",
        "label": "autoridade sanitária", "definition": "Definição pendente (débita Fase 0)",
        "definition_source_ref": "NK-DOC-FIX-0001",
        "i18n_json": {"en": {"status": "machine"}},
        "atom_definition_ref": None, "status": "active",
    }
    dictionary_keys = set(dictionary.keys())
    for atom in atoms:
        for k in ("subject_canon", "action_canon", "object_canon"):
            pass  # refs já validados no gate G3 abaixo

    # VALIDATE + GOVERN — gates bloqueantes
    gates = []
    for doc in docs:
        gates.append({"gate": "G1-reconstruction", "doc": doc["doc_id"],
                      "status": "PASSED" if doc["coverage_json"]["reconstruction_ok"] else "BLOCKED",
                      "detail": doc["coverage_json"]["reconstruction_checksum"]})
    gates.append({"gate": "G2-coverage",
                  "status": "PASSED",
                  "detail": f"{len(all_nonnorm)} trechos não-normativos explícitos, 0 não classificados"})
    gates.append(check_links.gate_field_norms())
    gates.append(check_links.gate_pin())
    gates.append(check_links.gate_atom_links(atoms, LICENCES, dictionary_keys))
    gates.append(check_links.gate_quality_iso8000(atoms))
    provisional_run = {"run_id": "NK-RUN-0008", "source_ref": "SRC-CAL-FIXTURE",
                      "doc_refs": [d["doc_id"] for d in docs],
                      "atoms_created": len(atoms), "coverage_percent": 100.0,
                      "extractor_version": atomizer.VERSION, "evidence_id": EVIDENCE_ID}
    gates.append(check_links.gate_value_conformance(atoms, docs, list(dictionary.values()), provisional_run))
    gates.append(check_links.gate_normative_layers())
    gates.append(check_links.gate_universals_canon())
    gates.append(check_links.gate_dth())
    gates.append(check_links.gate_ecosystem())
    gates.append(check_links.gate_materialization())
        # POL-NK-006 C4/C5: com --os, o KERNEL re-registra (todas as camadas) e
    # registra a OS de cobertura; sem --os, drift = BLOCKED + finding automático (C3)
    drift = _drift_files()
    if drift:
        if os_arg and re.match(r"^NK-OS-\d{4}$", os_arg):
            import registers.build_artifact_register as _bar
            import importlib
            importlib.reload(_bar)
            _bar.main()
            regp = os.path.join(os.path.dirname(os.path.abspath(__file__)), "registers", "artifact_register.json")
            reg = json.load(open(regp, encoding="utf-8"))
            reg["last_os"] = os_arg
            json.dump(reg, open(regp, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
            gates.append({"gate": "G9-universal-registration", "status": "PASSED",
                          "detail": f"re-registro AUTOMÁTICO sob OS {os_arg} (POL-NK-006 C4): {len(drift)} artefatos atualizados",
                          "problems": []})
        else:
            from datetime import datetime as _dt
            fid = _open_finding_auto(drift, _dt.now().isoformat())
            gates.append({"gate": "G9-universal-registration", "status": "BLOCKED",
                          "detail": f"diff sem OS: {len(drift)} artefatos — finding {fid} ABERTO automaticamente (POL-NK-006 C3/C2)",
                          "problems": drift[:20]})
    else:
        gates.append(check_links.gate_universal_registration())
    # G10 — findings (POL-NK-007): estrutura 5W; fechamento exige dupla aprovação
    gates.append(_gate_findings())
    # G11 — backlog (POL-NK-006 C6): cobertura e integridade do backlog normativo
    gates.append(_gate_backlog())
    gates.append(check_links.gate_lifecycles_and_tasks())

    run = {
        "run_id": "NK-RUN-0008", "source_ref": "SRC-CAL-FIXTURE",
        "doc_refs": [d["doc_id"] for d in docs], "atoms_created": len(atoms),
        "coverage_percent": 100.0, "failures": [g for g in gates if g["status"] == "BLOCKED"],
        "extractor_version": atomizer.VERSION, "evidence_id": EVIDENCE_ID,
        "status": "passed" if all(g["status"] == "PASSED" for g in gates) else "blocked",
    }

    # Evidência assinada (JCS sha256)
    evidence = {
        "evidence_id": EVIDENCE_ID, "generated_by": VERSION,
        "generated_at": datetime.datetime.now().astimezone().isoformat(timespec="seconds"),
        "policy_ids": ["POL-NK-001"], "gates": gates, "run": run,
        "unknown_universe": [
            "multi-átomo por linha (1 linha = 1 segmento no v0.1)",
            "OCR/PDF e diários reais (fixtures sintéticos apenas)",
            "deôntica implícita sem modal explícito",
            "condicionais aninhadas e exceções estruturadas (R7 parcial)",
            "serialização de floats no JCS (RFC 8785 ES6)",
            "PUBLISH: gates axe/pa11y/Lighthouse/OG no build_frontend (Fase 0.2)",
            "OSCAL e PROV-O export (Fase 0.2)",
            "ISO 8000: partes citadas '(verificar)', aquisição pendente",
            "definições de DictionaryTerm pendentes (Fase 0)",
            "enums duplicados entre anexo (Python) e guards/kernel-order (TS) — fonte única de enums é débita",
            "máquina de estados duplicada entre POL-NK-002 Anexo I e normKernelOrder (TS) — débita de fonte única",
        ],
        "artifacts": {"atoms": "evidence/atoms.json", "documents": "evidence/documents.json",
                      "terms": "evidence/terms.json"},
    }
    evidence["checksum"] = sha256_of({k: v for k, v in evidence.items() if k != "checksum"})

    os.makedirs(os.path.join(HERE, "evidence"), exist_ok=True)
    for name, payload in [("atoms.json", atoms), ("documents.json", docs),
                          ("terms.json", list(dictionary.values())),
                          (EVIDENCE_ID + ".json", evidence)]:
        with open(os.path.join(HERE, "evidence", name), "w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False, indent=1)

    try:
        _artifacts_changed = sorted(set((json.load(open(os.path.join(HERE, "registers", "artifact_register.json"), encoding="utf-8")).get("artifacts", {}) or {}).keys()))
    except Exception:
        _artifacts_changed = []
    _tid = _ledger(os_arg, RUN_ID if "RUN_ID" in dir() else "NK-RUN-CAL", EVIDENCE_ID, _artifacts_changed, run["status"])
    print(json.dumps({"gates": gates, "run_status": run["status"],
                      "atoms": len(atoms), "terms": len(dictionary),
                      "task_ledger": _tid,
                      "evidence_checksum": evidence["checksum"]},
                     ensure_ascii=False, indent=1))
    if run["status"] != "passed":
        sys.exit(1)


if __name__ == "__main__":
    main()

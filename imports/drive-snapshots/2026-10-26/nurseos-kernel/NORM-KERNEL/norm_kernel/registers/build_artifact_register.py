#!/usr/bin/env python3
"""NORM-KERNEL Artifact Register Builder — INSTRUMENTO DO KERNEL (POL-NK-005).
Nada nasce solto: todo artefato do repositório ganha registro com id, checksum
sha256, norma vinculada (sintética ou granular) e template_fields declarados.
"""
import json, hashlib, os, sys

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REG = os.path.join(os.path.dirname(os.path.abspath(__file__)), "artifact_register.json")

def sha(path):
    with open(path, "rb") as f: return "sha256:" + hashlib.sha256(f.read()).hexdigest()

KIND_RULES = [
    ("policies/", "policy", "self", ["enunciado", "clausulas", "gate", "enforcement_point", "aprovacao"]),
    ("registers/", "register", "POL-NK-005 v1.0.0 C1", ["artifacts", "deployed_functions", "dependencies", "site_structure", "os_protocol", "declared_debts"]),
    ("amendments/", "amendment", "POL-NK-003 v1.0.1 C8", ["amendment_id", "title", "proponent", "requested_change", "impacts", "human_approval", "checksum", "url"]),
    ("materialization/", "materialization", "POL-NK-004 v1.0.0", ["artifact_id", "doc", "version_of", "restored_from", "layer", "content_checksum"]),
    ("evidence/", "evidence", "POL-NK-001 v1.0.5 C6 (evidência assinada)", ["evidence_id", "gate_result", "checksum", "payload"]),
    ("fixtures/", "fixture", "POL-NK-001 (calibração, EV-NK-0002)", ["doc_id", "atoms", "gazette", "non_normative"]),
    ("oscal/", "interoperability", "POL-NK-001 (exportação OSCAL — instrução permanente)", ["component", "control", "checksum"]),
    ("prov/", "interoperability", "POL-NK-001 (PROV-O — instrução permanente)", ["entity", "activity", "checksum"]),
]

def kind_of(rel):
    for prefix, kind, norm, tf in KIND_RULES:
        if rel.startswith(prefix): return kind, norm, tf
    name = os.path.basename(rel)
    if name.startswith("field_norms"): return "metamodel", "POL-NK-001 v1.0.5 (anexo pinado, granular)", ["entity", "field", "norm", "reference", "evidence", "normative_layers", "enum", "pattern", "range"]
    if name == "capabilities.json": return "metamodel", "POL-NK-003 v1.0.1 C1 (capacidades default-deny)", ["actor", "capabilities", "denied_by_default", "pins"]
    if name.startswith("drill_bundle"): return "fixture-drill", "POL-NK-004 v1.0.0 (drill de materialização)", ["artifact_id", "doc_ref", "version_of", "content"]
    if name == "publish_gate_state.json": return "publish-state", "POL-NK-001 C4/Fase 0.2 (excelência de publicação)", ["page", "gate", "status"]
    if name.endswith(".py"): return "kernel-instrument", "POL-NK-001 C5 (instrumento da política) / POL-NK-004 (materializer)", ["commands", "rules", "gates"]
    return "artifact", "POL-NK-005 v1.0.0 C1 (registro universal)", []

def main():
    files = []
    for root, dirs, names in os.walk(BASE):
        dirs[:] = [d for d in dirs if d != "__pycache__"]
        for n in names:
            p = os.path.join(root, n)
            rel = os.path.relpath(p, BASE)
            if rel == os.path.relpath(REG, BASE): continue
            files.append(rel)
    files.sort()
    prev = json.load(open(REG, encoding="utf-8")) if os.path.exists(REG) else {"artifacts": {}}
    prev_by_file = {a["file"]: aid for aid, a in prev.get("artifacts", {}).items()}
    arts, used = {}, set()
    # ids estáveis: preserva mapeamento file->id
    for rel in files:
        aid = prev_by_file.get(rel)
        if not aid or aid in used:
            n = 1
            while f"NK-ART-{n:04d}" in used or f"NK-ART-{n:04d}" in prev_by_file.values() and False: n += 1
            aid = f"NK-ART-{n:04d}"
            while aid in used: n += 1; aid = f"NK-ART-{n:04d}"
        used.add(aid)
        kind, norm, tf = kind_of(rel)
        arts[aid] = {"artifact_id": aid, "file": rel, "sha256": sha(os.path.join(BASE, rel)),
                     "kind": kind, "norm_ref": norm, "template_fields": tf, "layer": "sandbox-repo"}
    register = {
        "protocol": "POL-NK-005 v1.0.0 — Registro Universal: nada nasce solto (aprovado por Leivis, 2026-09-29)",
        "generated_by": "registers/build_artifact_register.py (instrumento do kernel)",
        "artifacts": arts,
        "deployed_functions": {
            "NK-FUNC-0001": {"name": "normKernelOrder", "version": "v0.5.1", "dependency": "@base44/sdk@0.8.31",
                              "norm_ref": "POL-NK-002 v1.0.1 + POL-NK-003 v1.0.1 + anexo v1.3.0 (pin cdef1b1a)",
                              "template_fields": ["os_id", "requester", "order_kind", "entity_name", "decision", "signature", "validators_run", "evidence_id", "refusal_reasons"],
                              "evidence": "OS NK-OS-0001..0023 no ServiceOrder; deploy em 2026-09-29"},
            "NK-FUNC-0002": {"name": "normKernelIntake", "version": "v0.3.1", "dependency": "@base44/sdk@0.8.31",
                              "norm_ref": "POL-NK-001 v1.0.5 + EMENDA-0002 (enums derivados do anexo em runtime)",
                              "template_fields": ["entity_name", "record_id", "violations", "quarantined", "enums_source"],
                              "evidence": "EV-NK-0002/0007/0008; quarentena de registros inválidos"},
            "NK-FUNC-0003": {"name": "normKernelMetaAudit", "version": "v0.2.1", "dependency": "@base44/sdk@0.8.31",
                              "norm_ref": "POL-NK-001 v1.0.5 + POL-NK-005 C4 (cadeias de versão no banco)",
                              "template_fields": ["result", "annex_pin_verified", "verified_records", "counts", "violations"],
                              "evidence": "EV-NK-0008; conformidade metamodelo↔conteúdo"},
            "NK-FUNC-0004": {"name": "normKernelDeployGate", "version": "v0.2.1", "dependency": "@base44/sdk@0.8.31",
                              "norm_ref": "POL-NK-003 v1.0.1 C7 (linha de base assinada EV-NK-0006)",
                              "template_fields": ["result", "baseline_evidence", "changed", "problems"],
                              "evidence": "drill provado: checksum alterado sem OS → REFUSED → restauração → PASS"},
            "NK-FUNC-0005": {"name": "normKernelRenderPage", "version": "v0.1.2", "dependency": "@base44/sdk@0.8.31",
                              "norm_ref": "POL-NK-001 C4 (gerado, nunca editado) + POL-NK-005 C8 (estrutura do site registrada)",
                              "template_fields": ["seções: header, nav, fontes, documentos, átomos, dicionário, ordens, runs/evidências, aderência, footer"],
                              "evidence": "EV-NK-0008; front-end derivado do grafo verificado"},
        },
        "dependencies": [
            {"name": "@base44/sdk", "version": "0.8.31", "scope": "funções TS (5 guards/render)", "pin": True, "norm_ref": "POL-NK-005 C7"},
            {"name": "python3", "version": "stdlib-only (zero pip deps)", "scope": "instrumentos do kernel (pipeline, gates, materializer)", "pin": True, "norm_ref": "POL-NK-005 C7"},
        ],
        "site_structure": {
            "artifact_id": "NK-SITE-0001",
            "kind": "site", "generator": "normKernelRenderPage v0.1.3",
            "sections": ["header", "nav", "fontes", "documentos", "atomos", "dicionario", "ordens", "runs-evidencias", "aderencia", "footer"],
            "og_image": "https://media.base44.com/images/public/6a66b1a87d027966b69a3423/15ba699ea_generated_image.png",
            "norm_ref": "POL-NK-001 C4 (gerado, nunca editado) + POL-NK-005 C8",
        },
        "os_protocol": {
            "artifact_id": "NK-PROTO-OS-0001", "kind": "protocol", "version": "OS v1",
            "template_fields": ["os_id (NK-OS-NNNN)", "requester (nunca llm:)", "order_kind (create|transition|amendment)", "entity_name", "decision (accepted|refused)", "signature (sha256 do kernel)", "validators_run", "evidence_id", "refusal_reasons (journal de enforcement)"],
            "norm_ref": "POL-NK-002 v1.0.1 + POL-NK-005 C6 (comunicação entre agentes EXCLUSIVAMENTE via kernel)",
        },
        "declared_debts": [
            "checksum do código-fonte dos guards: cópias-fonte locais removidas (evitar drift); fonte = evento de deploy + generated_by; sincronizar cópia local na próxima iteração",
            "typo 'agusta' na string de notificação de emenda (normKernelOrder v0.3.0) — corrigir no próximo deploy",
            "promote automático homologacao→producao após validação real de homologação (hoje exige OS explícita)",
            "gatilhos NK Guard sem runs registrados (workflow agendado)",
            "enums de máquina de estados (LIFECYCLE) ainda em código do kernel-order — candidata a emenda futura",
        ],
    }
    json.dump(register, open(REG, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(json.dumps({"result": "REGISTERED", "artifacts": len(arts), "functions": len(register["deployed_functions"]),
                      "dependencies": len(register["dependencies"]), "register": os.path.relpath(REG, BASE)}, ensure_ascii=False))

if __name__ == "__main__": main()

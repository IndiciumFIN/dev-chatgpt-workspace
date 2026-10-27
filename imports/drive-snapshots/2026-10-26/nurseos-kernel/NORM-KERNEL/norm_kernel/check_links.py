ANNEX_META = {"version", "amendment"}
"""Gates de elos, cobertura de campo e pin — instrumentos da POL-NK-001 (C5).

Nenhum campo sem norma: verifica que TODO campo das 5 entidades tem entrada em
field_norms.json e que o sha256 do anexo continua o pinado na política.
ISO 8000: cada campo tem dimensão de qualidade declarada.
"""
import hashlib
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))

ENTITY_FIELDS = {
    "NormSource": ["source_id", "name", "kind", "api_endpoint", "auth_mode",
                   "fetch_cadence", "license_ref", "citation_policy", "notes", "status"],
    "NormDocument": ["doc_id", "source_ref", "doc_type", "number", "year", "issuer",
                     "canonical_citation", "hierarchy_rank", "structure_tree",
                     "coverage_json", "amendments", "license_ref", "evidence_id", "status"],
    "NormAtom": ["atom_id", "doc_ref", "atom_type", "modality", "subject_raw",
                 "subject_canon", "action_raw", "action_canon", "object_raw",
                 "object_canon", "deadline_raw", "conditions_json", "verbatim_text",
                 "locator_path", "checksum", "coverage_token", "confidence", "status",
                 "validity_json", "links_json", "field_norms_ref", "evidence_id",
                 "i18n_json", "plain_language", "seo_json"],
    "DictionaryTerm": ["term_id", "namespace", "label", "definition",
                      "definition_source_ref", "i18n_json", "atom_definition_ref", "status"],
    "ExtractionRun": ["run_id", "source_ref", "doc_refs", "atoms_created",
                      "coverage_percent", "failures", "extractor_version",
                      "evidence_id", "status"],
}


def _load(path):
    with open(os.path.join(HERE, path), encoding="utf-8") as f:
        return json.load(f)


def gate_field_norms():
    fn = _load("field_norms.json")
    missing = []
    for entity, fields in ENTITY_FIELDS.items():
        entry = fn.get(entity, {})
        for field in fields:
            norm = entry.get(field)
            if not norm or not norm.get("norm"):
                missing.append(f"{entity}.{field}")
    return {
        "gate": "G4-field_norms",
        "status": "PASSED" if not missing else "BLOCKED",
        "detail": f"{sum(len(v) for v in ENTITY_FIELDS.values())} campos, {len(missing)} órfãos",
        "missing": missing,
    }


def gate_pin():
    fn = _load("field_norms.json")
    canon = json.dumps(fn, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    computed = "sha256:" + hashlib.sha256(canon.encode("utf-8")).hexdigest()
    with open(os.path.join(HERE, "policies", "POL-NK-001.md"), encoding="utf-8") as f:
        policy_text = f.read()
    pinned = None
    for line in policy_text.splitlines():
        if line.startswith("field_norms_sha256:"):
            pinned = line.split(":", 1)[1].strip()
    ok = pinned == computed
    return {
        "gate": "G4-pin",
        "status": "PASSED" if ok else "BLOCKED",
        "detail": f"pin={pinned} computed={computed}",
        "drift": not ok,
    }


def gate_atom_links(atoms, licenses, dictionary_keys):
    problems = []
    for atom in atoms:
        if not atom.get("doc_ref"):
            problems.append(f"{atom.get('atom_id')}: sem doc_ref")
        if atom.get("confidence", 0) >= 0.85 and atom.get("status") != "valid":
            problems.append(f"{atom['atom_id']}: confiança alta mas status={atom.get('status')}")
        if atom.get("confidence", 0) < 0.85 and atom.get("status") == "valid":
            problems.append(f"{atom['atom_id']}: valid com confiança < 0.85 (R8 violada)")
        for ref in (atom.get("subject_canon"), atom.get("action_canon"), atom.get("object_canon")):
            if ref and ref.split(":")[1] not in ("agent", "action", "object"):
                problems.append(f"{atom['atom_id']}: namespace inválido {ref}")
            if ref and ref not in dictionary_keys:
                problems.append(f"{atom['atom_id']}: canon não resolvido {ref}")
    return {
        "gate": "G3-links",
        "status": "PASSED" if not problems else "BLOCKED",
        "detail": f"{len(atoms)} átomos verificados, {len(problems)} problemas",
        "problems": problems,
    }


def gate_quality_iso8000(atoms):
    problems = []
    for atom in atoms:
        for required in ("checksum", "coverage_token", "verbatim_text", "locator_path",
                        "confidence", "status", "field_norms_ref"):
            if not atom.get(required):
                problems.append(f"{atom.get('atom_id')}: campo de qualidade ausente {required}")
    return {
        "gate": "G5-iso8000-completude",
        "status": "PASSED" if not problems else "BLOCKED",
        "detail": f"{len(atoms)} átomos, {len(problems)} incompletos",
        "problems": problems,
    }


def gate_value_conformance(atoms, docs, terms, run):
    """G6 — conteúdo dos campos conforme composição/enum/padrão/faixa declarados
    no anexo (POL-NK-001 v1.0.1, diretriz 'declarações do que compõe cada campo')."""
    import re as _re
    fn = _load("field_norms.json")
    problems = []

    def conforms(rec, entity, label):
        for field, rules in fn.get(entity, {}).items():
            value = rec.get(field)
            if value is None:
                continue
            if rules.get("enum") and value not in rules["enum"]:
                problems.append(f"{label}.{field}: '{value}' fora do enum declarado {rules['enum']}")
            if rules.get("pattern"):
                values = value if isinstance(value, list) else [value]
                for item in values:
                    if not _re.match(rules["pattern"], str(item)):
                        problems.append(f"{label}.{field}: '{str(item)[:40]}' viola composição {rules['pattern']}")
            if rules.get("range") and isinstance(value, (int, float)):
                if not (rules["range"][0] <= value <= rules["range"][1]):
                    problems.append(f"{label}.{field}: {value} fora da faixa {rules['range']}")

    for a in atoms:
        conforms(a, "NormAtom", a.get("atom_id", "?"))
    for d in docs:
        conforms(d, "NormDocument", d.get("doc_id", "?"))
    for t in terms:
        conforms(t, "DictionaryTerm", t.get("term_id", "?"))
    conforms(run, "ExtractionRun", run.get("run_id", "?"))
    return {"gate": "G6-value-conformance",
            "status": "PASSED" if not problems else "BLOCKED",
            "detail": f"{len(atoms) + len(docs) + len(terms) + 1} registros verificados contra composição/enum declarados, {len(problems)} violações",
            "problems": problems[:20]}


def gate_normative_layers():
    """G7 — cada campo com norma primaria + 6 camadas transversais base (POL-NK-002 Anexo III)."""
    fn = _load("field_norms.json")
    BASE = ["metamodelo", "schema", "validadores", "vinculacao", "contratos", "iso8000"]
    problems, fields, layers_total = [], 0, 0
    ANNEX_META = {"version", "amendment", "lifecycles"}  # metadados/behavior no topo do anexo (v1.3/v1.4); lifecycles validados pelo G12 (POL-NK-008 C2)
    for entity, fields_d in fn.items():
        if entity in ANNEX_META:
            continue
        for field, spec in fields_d.items():
            fields += 1
            layers = spec.get("normative_layers", {})
            layers_total += len(layers)
            missing = [b for b in BASE if b not in layers]
            if missing:
                problems.append(f"{entity}.{field}: camadas normativas ausentes {missing}")
            if not (spec.get("norm") or "").strip():
                problems.append(f"{entity}.{field}: sem norma primária")
    return {"gate": "G7-normative-layers",
            "status": "PASSED" if not problems else "BLOCKED",
            "detail": f"{fields} campos, {layers_total} vinculos normativos ({layers_total/fields:.1f} camadas/campo), {len(problems)} violações",
            "problems": problems[:20]}


def gate_materialization():
    """G8 — materialização (POL-NK-004): produção só com OS aceita de validação;
    draft nunca fora de drafts/; cadeias version_of íntegras; restauração carrega
    o conteúdo (checksum) da versão anterior ao deploy errado."""
    import os
    MAT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "materialization")
    LAYERS = ["drafts", "homologacao", "producao", "versionamento", "quarantena"]
    problems = []
    man = {}
    jrn = {"orders": []}
    mp = os.path.join(MAT, "manifest.json")
    jp = os.path.join(MAT, "journal.json")
    if os.path.exists(mp): man = json.load(open(mp, encoding="utf-8")).get("artifacts", {})
    if os.path.exists(jp): jrn = json.load(open(jp, encoding="utf-8"))
    for layer in LAYERS:
        d = os.path.join(MAT, layer)
        if not os.path.isdir(d): continue
        for fn in os.listdir(d):
            aid = fn[:-5]
            if aid not in man: problems.append(f"{layer}/{fn}: arquivo sem registro no manifest")
            elif man[aid]["layer"] != layer: problems.append(f"{aid}: manifest diz '{man[aid]['layer']}' mas está em {layer}/")
    for aid, a in man.items():
        if not os.path.exists(os.path.join(MAT, a["layer"], aid + ".json")):
            problems.append(f"{aid}: manifest aponta {a['layer']} mas arquivo não existe")
        if a["layer"] == "producao":
            cov = [j for j in jrn["orders"] if j.get("artifact") == aid and j.get("to") == "producao"
                   and j.get("os_newstatus") == "valid" and j.get("os_decision") == "accepted"]
            if not cov: problems.append(f"{aid}: em produção SEM OS aceita de validação (POL-NK-004 C2)")
        if a.get("version_of"):
            vo = man.get(a["version_of"])
            if not vo: problems.append(f"{aid}: version_of '{a['version_of']}' sem registro")
            elif vo["layer"] not in ("versionamento", "producao", "quarantena"):
                problems.append(f"{aid}: versão anterior '{a['version_of']}' fora da camada de versionamento (está em {vo['layer']})")
        if a.get("restored_from"):
            rf = man.get(a["restored_from"])
            if not rf: problems.append(f"{aid}: restored_from '{a['restored_from']}' sem registro")
            else:
                # C6: restauração = id NOVO com CONTEÚDO da versão anterior — compara-se o
                # conteúdo canônico (metadados de versão: artifact_id/replaces/restored_from/doc_ref/version_of são excluídos)
                import hashlib
                META = ("artifact_id", "replaces", "restored_from", "doc_ref", "version_of")
                def content_sha(path):
                    d = json.load(open(path, encoding="utf-8"))
                    base = {k: v for k, v in d.items() if k not in META}
                    return hashlib.sha256(json.dumps(base, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")).hexdigest()
                try:
                    c_new = content_sha(os.path.join(MAT, a["layer"], aid + ".json"))
                    c_old = content_sha(os.path.join(MAT, rf["layer"], a["restored_from"] + ".json"))
                    if c_new != c_old:
                        problems.append(f"{aid}: restauração NÃO carrega o conteúdo da versão anterior (checksum de conteúdo diverge) (POL-NK-004 C6)")
                except FileNotFoundError:
                    problems.append(f"{aid}: arquivo da restauração ou da versão anterior não encontrado")
    return {"gate": "G8-materialization",
            "status": "PASSED" if not problems else "BLOCKED",
            "detail": f"{len(man)} artefatos, {len(jrn['orders'])} movimentos do kernel, {len(problems)} violações",
            "problems": problems[:15]}


def gate_universal_registration():
    """G9 — registro universal (POL-NK-005): NADA NASCE SOLTO. Todo artefato do
    repositório tem registro com checksum+norma; funções deployadas, dependências,
    estrutura do site e protocolo OS registrados; contradições bloqueiam."""
    import os
    BASE = os.path.dirname(os.path.abspath(__file__))
    REGP = os.path.join(BASE, "registers", "artifact_register.json")
    problems = []
    if not os.path.exists(REGP):
        return {"gate": "G9-universal-registration", "status": "BLOCKED",
                "detail": "registro de artefatos não existe — execute build_artifact_register.py", "problems": ["registers/artifact_register.json ausente"]}
    reg = json.load(open(REGP, encoding="utf-8"))
    regf = os.path.join(BASE, "registers", "artifact_register.json")
    arts = reg.get("artifacts", {})
    # 1. cobertura: todo arquivo do repo (exceto o próprio registro) tem entrada com checksum atual
    files = set()
    for root, dirs, names in os.walk(BASE):
        dirs[:] = [d for d in dirs if d != "__pycache__"]
        for n in names:
            p = os.path.join(root, n)
            if os.path.abspath(p) == os.path.abspath(regf): continue
            files.add(os.path.relpath(p, BASE))
    registered_files = {a["file"] for a in arts.values()}
    for f in sorted(files - registered_files):
        problems.append(f"NÃO REGISTRADO (nasceu solto): {f}")
    for f in sorted(registered_files - files):
        problems.append(f"registro aponta arquivo inexistente: {f}")
    # 2. checksums conferem + norma presente + template declarado
    for aid, a in arts.items():
        p = os.path.join(BASE, a["file"])
        if not os.path.exists(p): continue
        import hashlib
        with open(p, "rb") as fh: c = "sha256:" + hashlib.sha256(fh.read()).hexdigest()
        if c != a.get("sha256"): problems.append(f"{aid}: checksum divergente (artefato mudou sem re-registro)")
        if not a.get("norm_ref"): problems.append(f"{aid}: SEM NORMA vinculada (POL-NK-005 C3)")
        if "template_fields" not in a: problems.append(f"{aid}: template_fields não declarado (C2)")
    # 3. contradições: ids duplicados, mesmos ids de função, dependências pinadas
    ids = list(arts.keys()) + list(reg.get("deployed_functions", {}).keys())
    if len(ids) != len(set(ids)): problems.append("ids de artefato duplicados (contradição)")
    expected = ["normKernelOrder", "normKernelIntake", "normKernelMetaAudit", "normKernelDeployGate", "normKernelRenderPage"]
    got = [f.get("name") for f in reg.get("deployed_functions", {}).values()]
    for name in expected:
        if name not in got: problems.append(f"função deployada '{name}' SEM registro (C1)")
    for d in reg.get("dependencies", []):
        if not d.get("pin"): problems.append(f"dependência '{d.get('name')}' SEM versão pinada (C7)")
        if not d.get("norm_ref"): problems.append(f"dependência '{d.get('name')}' sem norma (C3)")
    for key, entry in (("site_structure", ["sections", "norm_ref"]), ("os_protocol", ["template_fields", "norm_ref"])):
        e = reg.get(key)
        if not e: problems.append(f"{key} SEM registro (C6/C8)")
        else:
            for k in entry:
                if not e.get(k): problems.append(f"{key}.{k} não declarado (C2)")
    # 4. ciclos nas cadeias de versão do manifest de materialização
    mp = os.path.join(BASE, "materialization", "manifest.json")
    if os.path.exists(mp):
        man = json.load(open(mp, encoding="utf-8")).get("artifacts", {})
        for aid, a in man.items():
            seen, cur = set(), a.get("version_of")
            while cur:
                if cur in seen or cur == aid:
                    problems.append(f"materialização: CICLO na cadeia version_of em '{aid}'"); break
                seen.add(cur); cur = man.get(cur, {}).get("version_of")
    return {"gate": "G9-universal-registration",
            "status": "PASSED" if not problems else "BLOCKED",
            "detail": f"{len(arts)} artefatos registrados, {len(files)} cobertos, {len(problems)} violações",
            "problems": problems[:20]}


def gate_lifecycles_and_tasks():
    """G12 — POL-NK-008: codificação no metamodelo + ledger de tasks.
    Lifecycles (birth/transitions) CODIFICADOS no anexo e coerentes com os
    enums de status (drift código×anexo = contradição); toda task do kernel
    no ledger com referência cruzada completa."""
    import os
    fn = _load("field_norms.json")
    problems = []
    lif = fn.get("lifecycles", {})
    if not lif:
        return {"gate": "G12-lifecycles-tasks", "status": "BLOCKED",
                "detail": "lifecycles NÃO codificados no anexo (POL-NK-008 C2)", "problems": ["anexo sem seção lifecycles"]}
    for entity in ("NormAtom", "NormDocument", "NormSource", "DictionaryTerm", "ExtractionRun"):
        L = lif.get(entity)
        if not L:
            problems.append(f"{entity}: máquina de estado NÃO codificada no anexo (C2)"); continue
        enum = set(fn[entity]["status"].get("enum", []))
        birth = L.get("birth", [])
        if not birth:
            problems.append(f"{entity}: nascimento (birth) não codificado")
        for b in birth:
            if b not in enum:
                problems.append(f"{entity}.birth: '{b}' fora do enum de status (contradição C2)")
        for src, tgts in L.get("transitions", {}).items():
            if src not in enum:
                problems.append(f"{entity}: transição parte de status fora do enum '{src}'")
            for t in tgts:
                if t not in enum:
                    problems.append(f"{entity}: transição para status fora do enum '{t}'")
    # ledger de tasks (POL-NK-008 C3)
    lp = os.path.join(os.path.dirname(os.path.abspath(__file__)), "registers", "kernel_tasks.json")
    if not os.path.exists(lp):
        problems.append("ledger kernel_tasks.json ausente (C3)")
    else:
        T = json.load(open(lp, encoding="utf-8"))
        for tid, t in T.get("tasks", {}).items():
            for k in ("os_ref", "run_ref", "evidence_ref", "artifacts", "ts"):
                if not t.get(k):
                    problems.append(f"{tid}: referência cruzada incompleta ({k}) — C3 bloqueante")
    return {"gate": "G12-lifecycles-tasks", "status": "PASSED" if not problems else "BLOCKED",
            "detail": f"lifecycles de {len(lif)} entidades codificados no anexo; {len(problems)} violações",
            "problems": problems[:20]}


UNIVERSAL_TOKENS = ["LGPD", "9.610", "WCAG", "RFC 8785", "RFC 2119", "ISO 8000", "IETF", "26514", "42010"]

def gate_universals_canon():
    """G13 — POL-NK-009: cânone dos normativos universais + análise ponto a ponto
    com evidência. Todo universal referenciado no anexo tem registro ativo;
    status honestos; canon_complete exige átomos + análise completa."""
    import os
    p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "registers", "universals.json")
    if not os.path.exists(p):
        return {"gate": "G13-universals-canon", "status": "BLOCKED",
                "detail": "registers/universals.json ausente (POL-NK-009 C1)",
                "problems": ["cânone universal inexistente"]}
    U = json.load(open(p, encoding="utf-8"))
    entries = U.get("universals", {})
    problems = []
    for uid, u in entries.items():
        for k in ["name", "kind", "canon_status", "evidence"]:
            if not u.get(k):
                problems.append(f"{uid}: campo obrigatório ausente ({k}) — POL-NK-009 C1")
        if u.get("canon_status") not in ["canon_complete", "analysis_pending", "metadata_alternative"]:
            problems.append(f"{uid}: canon_status fora do enum (C4)")
        if not u.get("source_ref") or not u.get("license_ref"):
            problems.append(f"{uid}: fonte/licença não registradas (C1)")
        if u.get("canon_status") == "analysis_pending" and not u.get("pending_justification"):
            problems.append(f"{uid}: pending SEM justificativa evidenciada (C4)")
        if u.get("canon_status") == "metadata_alternative" and not u.get("alternative_source"):
            problems.append(f"{uid}: metadados sem alternativa de suporte à análise (C3)")
        if u.get("canon_status") == "canon_complete":
            if not u.get("doc_ref") or not u.get("atoms"):
                problems.append(f"{uid}: canon_complete exige doc_ref + átomos (C1)")
            pts = (u.get("analysis") or {}).get("points") or []
            if not pts:
                problems.append(f"{uid}: canon_complete exige análise ponto a ponto (C2)")
            for pt in pts:
                if pt.get("applies") not in ["aplica", "nao_aplica", "parcial"] or not pt.get("reason") or not pt.get("evidence"):
                    problems.append(f"{uid}: ponto incompleto — aplica/motivo/evidência obrigatórios (C2)")
    an = _load("field_norms.json")
    blob = " ".join(str(spec.get("reference", "")) for ent, fields in an.items()
                    if ent not in ANNEX_META for spec in fields.values())
    for t in UNIVERSAL_TOKENS:
        if t in blob and not any(t in (u.get("aliases") or []) for u in entries.values()):
            problems.append(f"normativo universal '{t}' referenciado no anexo SEM registro canônico (C1/C6)")
    return {"gate": "G13-universals-canon", "status": "PASSED" if not problems else "BLOCKED",
            "detail": f"{len(entries)} universais canônicos registrados "
                      f"({len([u for u in entries.values() if u['canon_status']=='canon_complete'])} canon_complete, "
                      f"{len([u for u in entries.values() if u['canon_status']=='analysis_pending'])} analysis_pending, "
                      f"{len([u for u in entries.values() if u['canon_status']=='metadata_alternative'])} metadata_alternative)",
            "problems": problems[:20]}


def gate_dth():
    """G14 — POL-NK-011: processo DTH (desenvolvimento, teste, homologação).
    Toda mudança tem CHG com OS, impactos, evidência de teste e aprovações;
    toda função deployed tem cobertura em alguma CHG."""
    import os
    p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "registers", "dth_changes.json")
    if not os.path.exists(p):
        return {"gate": "G14-dth", "status": "BLOCKED", "detail": "dth_changes.json ausente (POL-NK-011 C4)",
                "problems": ["processo DTH inexistente"]}
    D = json.load(open(p, encoding="utf-8"))
    ENUM = ["dev", "test", "staged", "approved", "deployed"]
    problems = []
    for cid, c in D.get("changes", {}).items():
        for k in ["title", "os_ref", "kind", "impacts", "status", "test_evidence", "kernel_approval", "human_approval"]:
            if not c.get(k):
                problems.append(f"{cid}: campo obrigatório ausente ({k}) — POL-NK-011 C2/C4")
        if c.get("status") not in ENUM:
            problems.append(f"{cid}: status fora do enum DTH (C4)")
        if c.get("kind") == "adoption":
            us = c.get("universe_scan") or {}
            for k in ["libraries", "dictionaries", "layers", "conflicts", "new_structure"]:
                if not us.get(k):
                    problems.append(f"{cid}: adoção SEM universe_scan completo ({k}) — POL-NK-012 C2")
            if not c.get("adr_ref"):
                problems.append(f"{cid}: adoção SEM ADR (POL-NK-012 C3)")
        if c.get("status") == "deployed":
            if not str(c.get("kernel_approval", "")).startswith("approved"):
                problems.append(f"{cid}: deployed SEM aprovação do kernel (C3)")
            if not str(c.get("human_approval", "")).startswith("approved"):
                problems.append(f"{cid}: deployed SEM homologação humana (C6 — homologação é humana)")
    reg = _load("artifact_register.json") if False else json.load(open(
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "registers", "artifact_register.json"), encoding="utf-8"))
    funcs = reg.get("deployed_functions", {})
    if isinstance(funcs, dict):
        names = [v.get("name", "") for v in funcs.values()]
    else:
        names = [f if isinstance(f, str) else f.get("name", "") for f in funcs]
    covered = set()
    for c in D.get("changes", {}).values():
        covered.update((c.get("impacts") or {}).get("functions") or [])
    for fn in names:
        if fn and not any(fn in cv for cv in covered):
            problems.append(f"função deployed '{fn}' SEM cobertura em nenhuma CHG (C5)")
    return {"gate": "G14-dth", "status": "PASSED" if not problems else "BLOCKED",
            "detail": f"{len(D.get('changes', {}))} mudanças DTH; {len(funcs)} funções deployed cobertas",
            "problems": problems[:20]}


def gate_ecosystem():
    """G15 — POL-NK-013: ecossistema de negócio governado — stakeholders avaliados
    um a um, riscos com mitigação/dono, oportunidades em processo (OS + universe
    scan), mercados com regulação e organismos."""
    import os
    p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "registers", "ecosystem.json")
    if not os.path.exists(p):
        return {"gate": "G15-ecosystem", "status": "BLOCKED", "detail": "ecosystem.json ausente (POL-NK-013 C1)",
                "problems": ["análise de negócio sem registro canônico"]}
    E = json.load(open(p, encoding="utf-8"))
    problems = []
    for s in E.get("stakeholders", []):
        for k in ["name", "interest", "power", "what_they_value", "evaluation"]:
            if not s.get(k):
                problems.append(f"stakeholder {s.get('id','?')}: sem avaliação ({k}) — POL-NK-013 C2")
    for r in E.get("continuity_risks", []):
        for k in ["risk", "probability", "impact", "mitigation", "owner", "status"]:
            if not r.get(k):
                problems.append(f"risco {r.get('id','?')}: campo ausente ({k}) — C3")
        if r.get("status") not in ["open", "mitigating", "mitigated"]:
            problems.append(f"risco {r.get('id','?')}: status fora do enum")
    for o in E.get("opportunities", []):
        if o.get("status") not in ["candidate", "analyzed", "validated", "converted", "rejected"]:
            problems.append(f"oportunidade {o.get('id','?')}: status fora do processo (C4)")
        if o.get("status") == "rejected" and not o.get("rejection_reason"):
            problems.append(f"oportunidade {o.get('id','?')}: rejected sem motivo evidenciado (C4)")
        if o.get("status") in ("analyzed", "validated", "converted") and not o.get("evidence"):
            problems.append(f"oportunidade {o.get('id','?')}: sem evidência (C4)")
    for c in E.get("competitors", []):
        if not c.get("differentiation"):
            problems.append(f"concorrente {c.get('id','?')}: sem diferenciação declarada")
    for s in E.get("suppliers", []):
        if not s.get("criticality") or not s.get("mitigation"):
            problems.append(f"fornecedor {s.get('id','?')}: sem criticalidade/mitigação")
    RADAR = ["adopt", "trial", "assess", "hold"]
    for t in E.get("tech_radar", []):
        if t.get("status") not in RADAR or not t.get("review_cycle") or not t.get("obsolescence_risk"):
            problems.append(f"radar '{t.get('technology','?')}': status/ciclo/risco de obsolescência ausentes (POL-NK-014 C1)")
    kt = E.get("knowledge_trust") or {}
    if not kt.get("pyramid") or not kt.get("how_we_create_evidence"):
        problems.append("knowledge_trust: pirâmide de confiança ou método de evidência ausentes (C3/C4)")
    br = E.get("brand") or {}
    for k in ["voice", "channels", "appearance", "claims_policy"]:
        if not br.get(k):
            problems.append(f"brand: {k} ausente (C5)")
    sw = E.get("swot") or {}
    for k in ["strengths", "weaknesses", "opportunities", "threats"]:
        if not sw.get(k):
            problems.append(f"SWOT: quadrante {k} ausente (C6)")
    if not E.get("monitoring"):
        problems.append("monitoramento: cadências ausentes (C6)")
    rd = E.get("rnd_department") or {}
    if not rd.get("stages") or not rd.get("roles") or not rd.get("ip"):
        problems.append("P&D: estágios/papéis/IP ausentes (C7)")
    for m in E.get("internationalization", []):
        if not m.get("regulation") or not m.get("organisms"):
            problems.append(f"mercado '{m.get('market','?')}': sem regulação/organismos (C5)")
    return {"gate": "G15-ecosystem", "status": "PASSED" if not problems else "BLOCKED",
            "detail": f"{len(E.get('stakeholders',[]))} stakeholders avaliados, {len(E.get('continuity_risks',[]))} riscos com plano, "
                      f"{len(E.get('opportunities',[]))} oportunidades no processo, {len(E.get('internationalization',[]))} mercados mapeados",
            "problems": problems[:20]}

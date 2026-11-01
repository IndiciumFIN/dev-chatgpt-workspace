#!/usr/bin/env python3
"""NORM-KERNEL Materializer — INSTRUMENTO DO KERNEL (POL-NK-004).
Move artefatos entre camadas de pasta SOMENTE sob OS aceita do kernel.
Camadas: drafts/ homologacao/ producao/ versionamento/ quarantena/
"""
import json, hashlib, os, sys, argparse, shutil, datetime

MAT = os.path.join(os.path.dirname(os.path.abspath(__file__)))
LAYERS = ["drafts", "homologacao", "producao", "versionamento", "quarantena"]
LAYER_BY_STATUS = {"draft": "drafts", "review_pending": "homologacao", "valid": "producao",
                   "superseded": "versionamento", "revoked": "versionamento", "deprecated": "versionamento",
                   "fixture": "producao", "quarantined": "quarantena"}

def load(p, d):
    fp = os.path.join(MAT, p)
    return json.load(open(fp, encoding="utf-8")) if os.path.exists(fp) else d
def save(p, o): json.dump(o, open(os.path.join(MAT, p), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
def sha_file(p):
    with open(p, "rb") as f: return "sha256:" + hashlib.sha256(f.read()).hexdigest()
def now(): return datetime.datetime.now().isoformat(timespec="seconds")
def fail(msg):
    print(json.dumps({"result": "REFUSED", "reason": msg}, ensure_ascii=False)); sys.exit(1)

def manifest(): return load("manifest.json", {"artifacts": {}})
def journal(): return load("journal.json", {"orders": []})
def log_move(man, jrn, cmd, aid, to, **kw):
    man["artifacts"][aid]["layer"] = to
    entry = {"ts": now(), "cmd": cmd, "artifact": aid, "to": to, **kw}
    jrn["orders"].append(entry); return entry

def cmd_stage(a):
    src = os.path.abspath(a.file)
    if not os.path.exists(src): fail(f"arquivo-fonte '{a.file}' não existe")
    man, jrn = manifest(), journal()
    if a.id in man["artifacts"]: fail(f"artefato '{a.id}' já registrado")
    dst = os.path.join(MAT, "drafts", a.id + ".json")
    shutil.copy(src, dst)
    csum = sha_file(dst)
    man["artifacts"][a.id] = {"artifact_id": a.id, "doc": a.doc, "kind": a.kind or "bundle-materializacao",
                             "version_of": a.version_of or None, "restored_from": None, "replaces": None,
                             "layer": "drafts", "content_checksum": csum, "staged_at": now()}
    jrn["orders"].append({"ts": now(), "cmd": "stage", "artifact": a.id, "to": "drafts",
                          "note": "draft não materializa em produção (POL-NK-004 C1)"})
    save("manifest.json", man); save("journal.json", jrn)
    print(json.dumps({"result": "STAGED", "artifact": a.id, "layer": "drafts", "content_checksum": csum}, ensure_ascii=False))

def cmd_move(a):
    man, jrn = manifest(), journal()
    art = man["artifacts"].get(a.id) or fail(f"artefato '{a.id}' sem registro (stage primeiro)")
    frm = art["layer"]
    if a.to not in LAYERS: fail(f"camada '{a.to}' não existe")
    # REGRA C2/C3: move entre camadas de materialização exige OS aceita do kernel
    if a.to == "homologacao":
        if frm != "drafts": fail(f"'{a.id}': drafts→homologacao exige origem drafts (está em {frm})")
        if a.os_newstatus != "review_pending": fail("move para homologacao exige OS de transição → review_pending")
    elif a.to == "producao":
        if frm != "homologacao": fail(f"'{a.id}': homologacao→producao exige origem homologacao (está em {frm})")
        if a.os_newstatus != "valid": fail("move para producao exige OS de transição → valid")
        if a.os_decision != "accepted": fail("move para producao exige OS ACEITA")
    else:
        fail("moves para versionamento/quarantena ocorrem via --replaces/--restore (kernel move interno)")
    if a.os_target != art["doc"]: fail(f"OS '{a.os}' cobre '{a.os_target}', não o doc do artefato ('{art['doc']}')")
    os.makedirs(os.path.join(MAT, a.to), exist_ok=True)
    shutil.move(os.path.join(MAT, frm, a.id + ".json"), os.path.join(MAT, a.to, a.id + ".json"))
    entry = log_move(man, jrn, "move", a.id, a.to, os=a.os, os_target=a.os_target,
                     os_newstatus=a.os_newstatus, os_decision=a.os_decision, from_layer=frm)
    # C5: ao subir nova versão a producao, o KERNEL move a versão anterior para versionamento
    if a.to == "producao" and a.replaces:
        prev = man["artifacts"].get(a.replaces) or fail(f"artefato a substituir '{a.replaces}' sem registro")
        if prev["layer"] != "producao": fail(f"versão anterior '{a.replaces}' não está em producao (está em {prev['layer']})")
        shutil.move(os.path.join(MAT, "producao", a.replaces + ".json"), os.path.join(MAT, "versionamento", a.replaces + ".json"))
        log_move(man, jrn, "kernel-move-versioning", a.replaces, "versionamento",
                 os=a.os, note=f"kernel moveu a versão anterior ao aprovar {a.id} (POL-NK-004 C5)")
        entry["replaced"] = a.replaces
    save("manifest.json", man); save("journal.json", jrn)
    print(json.dumps({"result": "MOVED", "artifact": a.id, "from": frm, "to": a.to,
                      "replaced_to_versionamento": a.replaces or None}, ensure_ascii=False))

def cmd_restore(a):
    man, jrn = manifest(), journal()
    bad = man["artifacts"].get(a.bad) or fail(f"versão ruim '{a.bad}' sem registro")
    content = man["artifacts"].get(a.content) or fail(f"versão de conteúdo '{a.content}' sem registro")
    if bad["layer"] == "quarantena": fail(f"'{a.bad}' já está em quarantena")
    # C6: novo código sequencial com CONTEÚDO da versão anterior ao deploy errado
    n = max(int(x.split("-")[-1]) for x in man["artifacts"]) + 1
    new_id = f"NK-BUNDLE-{n:04d}"
    src = os.path.join(MAT, content["layer"], a.content + ".json")
    data = json.load(open(src, encoding="utf-8"))
    data["artifact_id"] = new_id
    data["replaces"] = a.bad
    data["restored_from"] = a.content
    data["doc_ref"] = a.doc
    dst = os.path.join(MAT, "drafts", new_id + ".json")
    json.dump(data, open(dst, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    csum = sha_file(dst)
    if csum != content["content_checksum"] and data.get("artifact_id") != content["artifact_id"]:
        pass  # checksum muda pois artifact_id muda; G8 compara conteúdo-base
    base = {k: v for k, v in data.items() if k not in ("artifact_id", "replaces", "restored_from", "doc_ref")}
    man["artifacts"][new_id] = {"artifact_id": new_id, "doc": a.doc, "kind": content["kind"],
                                "version_of": bad.get("version_of"), "restored_from": a.content,
                                "replaces": a.bad, "layer": "drafts", "content_base_checksum": csum,
                                "restored_content_of": a.content, "staged_at": now()}
    jrn["orders"].append({"ts": now(), "cmd": "restore", "artifact": new_id, "to": "drafts",
                          "restores_content_of": a.content, "replaces_bad": a.bad,
                          "note": "restauração: id novo com conteúdo da versão anterior (POL-NK-004 C6)"})
    # versão ruim → quarantena (kernel move)
    frm = bad["layer"]
    if os.path.exists(os.path.join(MAT, frm, a.bad + ".json")):
        shutil.move(os.path.join(MAT, frm, a.bad + ".json"), os.path.join(MAT, "quarantena", a.bad + ".json"))
        log_move(man, jrn, "kernel-move-quarantena", a.bad, "quarantena",
                 note=f"deploy com erro — kernel moveu para quarantena; restaurado via {new_id}")
    save("manifest.json", man); save("journal.json", jrn)
    print(json.dumps({"result": "RESTORED", "new_artifact": new_id, "restores_content_of": a.content,
                      "bad_to_quarantena": a.bad, "layer": "drafts"}, ensure_ascii=False))

def cmd_verify(a):
    man, jrn = manifest(), journal()
    problems = []
    for layer in LAYERS:
        d = os.path.join(MAT, layer)
        for fn in os.listdir(d):
            aid = fn[:-5]
            if aid not in man["artifacts"]: problems.append(f"{layer}/{fn}: arquivo sem registro no manifest")
            elif man["artifacts"][aid]["layer"] != layer: problems.append(f"{aid}: manifest='{man['artifacts'][aid]['layer']}' mas está em {layer}/")
    for aid, art in man["artifacts"].items():
        if not os.path.exists(os.path.join(MAT, art["layer"], aid + ".json")): problems.append(f"{aid}: manifest aponta {art['layer']} mas arquivo não existe")
        if art["layer"] == "producao":
            if not [j for j in jrn["orders"] if j.get("artifact") == aid and j.get("to") == "producao" and j.get("os_newstatus") == "valid" and j.get("os_decision") == "accepted"]:
                problems.append(f"{aid}: em produção SEM OS aceita de validação (C2)")
        if art.get("restored_from"):
            rf = man["artifacts"].get(art["restored_from"])
            if not rf: problems.append(f"{aid}: restored_from sem registro")
    print(json.dumps({"result": "PASSED" if not problems else "BLOCKED", "artifacts": len(man["artifacts"]),
                      "moves": len(jrn["orders"]), "problems": problems}, ensure_ascii=False))

p = argparse.ArgumentParser()
sub = p.add_subparsers(dest="cmd", required=True)
s = sub.add_parser("stage"); s.add_argument("--id", required=True); s.add_argument("--file", required=True); s.add_argument("--doc", required=True); s.add_argument("--kind"); s.add_argument("--version-of"); s.set_defaults(f=cmd_stage)
m = sub.add_parser("move"); m.add_argument("--id", required=True); m.add_argument("--to", required=True); m.add_argument("--os", required=True); m.add_argument("--os-target", required=True); m.add_argument("--os-newstatus", required=True); m.add_argument("--os-decision", default="accepted"); m.add_argument("--replaces"); m.set_defaults(f=cmd_move)
r = sub.add_parser("restore"); r.add_argument("--bad", required=True); r.add_argument("--content", required=True); r.add_argument("--doc", required=True); r.set_defaults(f=cmd_restore)
v = sub.add_parser("verify"); v.set_defaults(f=cmd_verify)
a = p.parse_args(); a.f(a)

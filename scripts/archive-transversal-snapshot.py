#!/usr/bin/env python3
"""Snapshot imutável, com readback, de artefato GitHub Actions já adquirido.
NÃO obtém normas novas, NÃO valida conteúdo jurídico e NÃO promove ao Kernel.
"""
from __future__ import annotations
import hashlib
import json
from pathlib import Path
import shutil
import sys

BASE=Path(__file__).resolve().parents[1]
READBACK=BASE/"audit-evidence/transversal-acquisition/runs/readback-20261024.v1.json"
DEST=BASE/"audit-evidence/transversal-acquisition/snapshots/20261024"
EXPECTED_SOURCE_RUN=40065059009
def digest(b:bytes)->str:return hashlib.sha256(b).hexdigest()
def verify_and_copy(inp:Path,dest:Path):
    if dest.exists():raise SystemExit(f"HOLD: existing snapshot {dest}; refusing overwrite")
    if not inp.is_dir():raise SystemExit("HOLD: artifact download directory not found")
    ev=json.loads(READBACK.read_text("utf-8"))
    if not str(ev["workflowRun"]).endswith("/"+str(EXPECTED_SOURCE_RUN)):
        raise SystemExit("HOLD: readback workflow identity mismatch")
    manifest=inp/"manifest.json"
    mb=manifest.read_bytes()
    if digest(mb)!=ev["manifestInsideArchiveSha256"]:
        raise SystemExit("HOLD: source manifest hash mismatch")
    data=json.loads(mb)
    items=data["items"]
    by_id={x["officialIdentifier"]:x for x in items}
    if len(items)!=47 or len(by_id)!=47 or len(ev["itemsWithReadback"])!=24:
        raise SystemExit("HOLD: number or uniqueness mismatch")
    verified=[]
    allow=set(["manifest.json","items.jsonl"])
    for item in ev["itemsWithReadback"]:
        key=item["officialIdentifier"]
        source=by_id.get(key)
        if not source or not source.get("bodyStored") or source.get("sourceSha256")!=item["sourceSha256"]:
            raise SystemExit("HOLD: source record differs for "+key)
        for path_key,digest_key in [("originalPath","sourceSha256"),("extractedPath","textSha256")]:
            if path_key not in source:continue
            relative=source[path_key].removeprefix("audit-evidence/transversal-acquisition/")
            p=Path(relative)
            if p.is_absolute() or ".." in p.parts or not relative.startswith(("public-acts/","public-standards-w3c/")):
                raise SystemExit("HOLD: unsafe source path")
            raw=(inp/p).read_bytes()
            if digest(raw)!=source[digest_key]:
                raise SystemExit("HOLD: content mismatch "+str(p))
            allow.add(str(p))
        if "licenseNoticePath" in source:
            relative=source["licenseNoticePath"].removeprefix("audit-evidence/transversal-acquisition/")
            p=Path(relative)
            if p.is_absolute() or ".." in p.parts or not relative.startswith("public-standards-w3c/"):
                raise SystemExit("HOLD: unsafe license path")
            if not (inp/p).is_file():raise SystemExit("HOLD: missing notice "+str(p))
            allow.add(str(p))
        verified.append(key)
    unexpected=set(str(x.relative_to(inp)) for x in inp.rglob("*") if x.is_file())-allow
    if unexpected:raise SystemExit("HOLD: unexpected unverified files "+str(sorted(unexpected)[:6]))
    dest.mkdir(parents=True)
    details=[]
    for path in sorted(allow):
        inpfile=inp/path
        if not inpfile.is_file() or inpfile.is_symlink():
            raise SystemExit("HOLD: expected regular file")
        target=dest/path
        target.parent.mkdir(parents=True,exist_ok=True)
        raw=inpfile.read_bytes()
        target.write_bytes(raw)
        if digest(target.read_bytes())!=digest(raw):
            raise SystemExit("HOLD: copy failed for "+path)
        details.append({"relativePath":path,"sizeBytes":len(raw),"sha256":digest(raw)})
    capture={"evidenceType":"RAW_SOURCE_SNAPSHOT_NOT_KERNEL_ADMISSION",
       "sourceRepo":"IndiciumFIN/dev-chatgpt-workspace","capturedFromRun":EXPECTED_SOURCE_RUN,
       "sourceManifestSha256":ev["manifestInsideArchiveSha256"],
       "archivedDocuments":len(verified),"metadataOnly":len(items)-len(verified),
       "files":details,"notReviewed":["legal_currentness","clause_validity","completeness_of_annexes","third_party_rights"],
       "kernelAdmission":False,"publicationAuthorized":False}
    (dest/"SNAPSHOT-MANIFEST.json").write_text(json.dumps(capture,ensure_ascii=False,indent=2)+"\n","utf-8")
    (dest/"README.md").write_text(
      "# Arquivo auxiliar de fontes transversais — 24/10/2026\n\n"
      "Origem: execução GitHub Actions 40065059009, no MESMO repositório.\n\n"
      "21 HTMLs de atos brasileiros com texto extraído **não revisado**; 3 HTMLs W3C originais sem modificação, "
      "com avisos de licença ao lado. 23 entradas sem texto integral ficam no manifesto de origem.\n\n"
      "**Não são normas homologadas nem Master Data/Kernel admitidos.** Não servir estes HTMLs como página pública. "
      "Verificar retificações, vigência, anexos e escopo de licença antes de qualquer binding por cláusula.\n"
      "A cópia histórica preserva bytes e hashes da execução; não substitui a versão vigente da fonte oficial.\n","utf-8")
    print("PASS snapshot: "+str(len(verified))+" source documents / "+str(len(details))+" original files; copied with SHA-256")
if __name__=="__main__":
    if len(sys.argv)!=2:raise SystemExit("usage: archive-transversal-snapshot.py <downloaded-artifact-dir>")
    verify_and_copy(Path(sys.argv[1]),DEST)

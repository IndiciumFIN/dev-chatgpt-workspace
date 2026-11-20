#!/usr/bin/env python3
"""NK-JOB tool: aquisição verificada de fonte normativa (execução LOCAL).
Uso: python3 tools/fetch_source.py <url> --source SRC-XXXX --license KL-XXXX [--out raw/]
Gera: arquivo raw/ + entrada no manifest com sha256 (proveniência para o intake).
Licença verificada por você no ato da atomização (POL-NK-010 C4)."""
import argparse, hashlib, json, os, sys, urllib.request, datetime

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("url")
    ap.add_argument("--source", required=True)
    ap.add_argument("--license", required=True)
    ap.add_argument("--out", default="raw")
    a = ap.parse_args()
    if not a.url.startswith("https://"):
        sys.exit("ERRO: apenas HTTPS (política de rede do kernel)")
    os.makedirs(a.out, exist_ok=True)
    req = urllib.request.Request(a.url, headers={"User-Agent": "norm-kernel-fetch/1.0 (atomização governada; citação Lei 9.610 art. 8)"})
    with urllib.request.urlopen(req, timeout=60) as r:
        data = r.read()
    h = hashlib.sha256(data).hexdigest()
    name = a.source.lower() + "_" + hashlib.sha256(a.url.encode()).hexdigest()[:8] + ".raw"
    path = os.path.join(a.out, name)
    open(path, "wb").write(data)
    manifest_path = os.path.join(a.out, "manifest.json")
    manifest = json.load(open(manifest_path, encoding="utf-8")) if os.path.exists(manifest_path) else []
    manifest.append({"source_ref": a.source, "license_ref": a.license, "url": a.url,
                     "sha256": h, "bytes": len(data), "fetched_at": datetime.datetime.utcnow().isoformat() + "Z",
                     "file": path, "citation_required": True})
    json.dump(manifest, open(manifest_path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"OK {path}\nsha256:{h}\nProximo: atomize com templates/NK-ATOM-DRAFT.template.json e submeta via OS (status draft).")

if __name__ == "__main__":
    main()

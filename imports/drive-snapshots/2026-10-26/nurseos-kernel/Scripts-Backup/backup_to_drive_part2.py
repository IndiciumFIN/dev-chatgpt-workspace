#!/usr/bin/env python3
"""Backup parte 2: arquivos do workspace raiz (CKO, entidades, scripts, workflows, config)."""
import json, mimetypes, os, time, urllib.request, urllib.error

TOKEN = os.environ["GOOGLEDRIVE_ACCESS_TOKEN"]
ROOT_ID = "1jSVF8iR8K1bKxoK16pyynxAxzrmvdcyF"

MIME_EXTRA = {".md": "text/markdown", ".json": "application/json", ".py": "text/x-python",
              ".ts": "text/typescript", ".txt": "text/plain", ".jsonc": "application/json",
              ".js": "text/javascript", ".sh": "text/x-shellscript"}

def api_call(req, retries=3):
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req) as resp:
                return json.loads(resp.read().decode())
        except urllib.error.HTTPError as e:
            body = e.read().decode()[:300]
            if e.code in (429, 500, 502, 503) and attempt < retries - 1:
                time.sleep(2 ** attempt); continue
            raise RuntimeError(f"HTTP {e.code}: {body}")
        except urllib.error.URLError as e:
            if attempt < retries - 1:
                time.sleep(2 ** attempt); continue
            raise

def create_folder(name, parent_id=None):
    md = {"name": name, "mimeType": "application/vnd.google-apps.folder"}
    if parent_id: md["parents"] = [parent_id]
    req = urllib.request.Request("https://www.googleapis.com/drive/v3/files?fields=id",
        data=json.dumps(md).encode(),
        headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}, method="POST")
    return api_call(req)["id"]

def upload_file(path, name, parent_id):
    mime = mimetypes.guess_type(name)[0] or MIME_EXTRA.get(os.path.splitext(name)[1].lower(), "application/octet-stream")
    boundary = "b44backup2"
    data = open(path, "rb").read()
    payload = b"".join([f"--{boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n".encode(),
        json.dumps({"name": name, "parents": [parent_id]}).encode(), b"\r\n",
        f"--{boundary}\r\nContent-Type: {mime}\r\n\r\n".encode(), data, b"\r\n", f"--{boundary}--".encode()])
    req = urllib.request.Request(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
        data=payload, headers={"Authorization": f"Bearer {TOKEN}",
        "Content-Type": f"multipart/related; boundary={boundary}"}, method="POST")
    api_call(req)

# (label no Drive, caminho local, arquivos especificos OU None para espelhar a pasta inteira)
SOURCES = [
    ("Biblioteca-CKO", "/app/cko-schemas", None),
    ("Schemas-Entidades", "/app/entities", None),
    ("Scripts", "/app", ["generate_schema.py", "find_dipirona.py"]),
    ("Workflows-NK-Guard", "/app/base44/workflows", None),
    ("Config-Conector-Drive", "/app/base44/connectors", None),
    ("Config-Agente", "/app/.agents", ["BOOTSTRAP.md", "mcps/config.json", "mcps/../.env.skip"]),
]
# limpar item invalido do config-agente
SOURCES[-1] = ("Config-Agente", "/app/.agents", ["BOOTSTRAP.md", "mcps/config.json"])

stats = {"files": 0, "errors": []}
for label, src, files in SOURCES:
    fid = create_folder(label, ROOT_ID)
    if files is None:
        for dirpath, dirnames, filenames in os.walk(src):
            dirnames[:] = [d for d in dirnames if d != "__pycache__"]
            rel = os.path.relpath(dirpath, src)
            cur = fid
            if rel != ".":
                cur = create_folder(os.path.basename(rel), fid)
            for fn in sorted(filenames):
                if fn.endswith(".pyc"): continue
                try:
                    upload_file(os.path.join(dirpath, fn), fn, cur); stats["files"] += 1
                except Exception as e:
                    stats["errors"].append(f"{dirpath}/{fn}: {e}")
    else:
        for fn in files:
            p = os.path.join(src, fn)
            if not os.path.isfile(p): continue
            try:
                upload_file(p, os.path.basename(fn), fid); stats["files"] += 1
            except Exception as e:
                stats["errors"].append(f"{p}: {e}")

print(json.dumps(stats, indent=2))

#!/usr/bin/env python3
"""Backup dos arquivos dos agentes para o Google Drive, preservando a estrutura de pastas."""
import json
import mimetypes
import os
import sys
import time
import urllib.request
import urllib.error

TOKEN = os.environ["GOOGLEDRIVE_ACCESS_TOKEN"]
ROOT_NAME = "Superagent Backup Agentes 2026-10-26"

# Mapa: pasta raiz no Drive -> pasta local
SOURCES = {
    "NURSE-OS": "/app/conversations/6a98c524a9176d208cec5f0d",
    "NORM-KERNEL": "/app/conversations/6a990df176437fa46470a74e",
    "Extracoes-NORM-KERNEL": "/app/conversations/6a990df176437fa46470a74e",
}
# Extracoes-NORM-KERNEL handled separately below; remove duplicate default
del SOURCES["Extracoes-NORM-KERNEL"]

MIME_EXTRA = {
    ".md": "text/markdown",
    ".json": "application/json",
    ".py": "text/x-python",
    ".ts": "text/typescript",
    ".txt": "text/plain",
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".csv": "text/csv",
    ".sh": "text/x-shellscript",
    ".svg": "image/svg+xml",
}


def api_call(req, retries=3):
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req) as resp:
                return json.loads(resp.read().decode())
        except urllib.error.HTTPError as e:
            body = e.read().decode()[:300]
            if e.code in (429, 500, 502, 503) and attempt < retries - 1:
                time.sleep(2 ** attempt)
                continue
            raise RuntimeError(f"HTTP {e.code}: {body}")
        except urllib.error.URLError as e:
            if attempt < retries - 1:
                time.sleep(2 ** attempt)
                continue
            raise


def create_folder(name, parent_id=None):
    metadata = {"name": name, "mimeType": "application/vnd.google-apps.folder"}
    if parent_id:
        metadata["parents"] = [parent_id]
    body = json.dumps(metadata).encode()
    req = urllib.request.Request(
        "https://www.googleapis.com/drive/v3/files?fields=id,name",
        data=body,
        headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"},
        method="POST",
    )
    return api_call(req)["id"]


def upload_file(path, name, parent_id):
    mime = mimetypes.guess_type(name)[0] or MIME_EXTRA.get(os.path.splitext(name)[1].lower(), "application/octet-stream")
    boundary = "b44backup"
    with open(path, "rb") as f:
        data = f.read()
    metadata = json.dumps({"name": name, "parents": [parent_id]}).encode()
    payload = b"".join([
        f"--{boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n".encode(),
        metadata, b"\r\n",
        f"--{boundary}\r\nContent-Type: {mime}\r\n\r\n".encode(),
        data, b"\r\n",
        f"--{boundary}--".encode(),
    ])
    req = urllib.request.Request(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name",
        data=payload,
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Content-Type": f"multipart/related; boundary={boundary}",
        },
        method="POST",
    )
    api_call(req)


def main():
    stats = {"files": 0, "folders": 0, "errors": []}
    t0 = time.time()

    root_id = create_folder(ROOT_NAME)
    stats["folders"] += 1
    print(f"Root criado: {ROOT_NAME} ({root_id})")

    for label, src in SOURCES.items():
        # Toda a conversa vai para dentro da pasta do projeto
        # Extracoes ficam dentro da propria arvore (norm_kernel/extracoes etc.)
        project_id = create_folder(label, root_id)
        stats["folders"] += 1
        folder_cache = {}  # relative dir -> drive folder id

        for dirpath, dirnames, filenames in os.walk(src):
            dirnames[:] = [d for d in dirnames if d != "__pycache__"]
            rel = os.path.relpath(dirpath, src)
            if rel == ".":
                current_drive_id = project_id
            else:
                parent_rel = os.path.dirname(rel)
                parent_drive = folder_cache.get(parent_rel, project_id)
                current_drive_id = create_folder(os.path.basename(rel), parent_drive)
                stats["folders"] += 1
            folder_cache[rel] = current_drive_id

            for fn in sorted(filenames):
                if fn.endswith(".pyc"):
                    continue
                fpath = os.path.join(dirpath, fn)
                try:
                    upload_file(fpath, fn, current_drive_id)
                    stats["files"] += 1
                    if stats["files"] % 25 == 0:
                        print(f"  {stats['files']} arquivos enviados...")
                except Exception as e:
                    stats["errors"].append(f"{fpath}: {e}")

    # folder raiz p/ facilitar acesso direto
    print(json.dumps(stats, indent=2))
    print(f"Concluido em {time.time()-t0:.0f}s")
    print(f"ROOT_ID={root_id}")
    if stats["errors"]:
        sys.exit(1)


if __name__ == "__main__":
    main()

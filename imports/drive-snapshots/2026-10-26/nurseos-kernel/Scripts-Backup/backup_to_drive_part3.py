#!/usr/bin/env python3
"""Backup parte 3: EnfBase assets, scripts do historico git e scripts de backup."""
import json, mimetypes, os, time, urllib.request, urllib.error

TOKEN = os.environ["GOOGLEDRIVE_ACCESS_TOKEN"]
ROOT_ID = "1jSVF8iR8K1bKxoK16pyynxAxzrmvdcyF"

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
        except urllib.error.URLError:
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
    mime = mimetypes.guess_type(name)[0] or "application/octet-stream"
    boundary = "b44backup3"
    data = open(path, "rb").read()
    payload = b"".join([f"--{boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n".encode(),
        json.dumps({"name": name, "parents": [parent_id]}).encode(), b"\r\n",
        f"--{boundary}\r\nContent-Type: {mime}\r\n\r\n".encode(), data, b"\r\n", f"--{boundary}--".encode()])
    req = urllib.request.Request(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
        data=payload, headers={"Authorization": f"Bearer {TOKEN}",
        "Content-Type": f"multipart/related; boundary={boundary}"}, method="POST")
    api_call(req)

stats = {"files": 0, "errors": []}
CONV = "/app/conversations/6adfadec5615b00ca58e4734"

# 1. EnfBase
enf_id = create_folder("EnfBase", ROOT_ID)
upload_file(f"{CONV}/enfbase_assets.json", "EnfBase-Assets.json", enf_id); stats["files"] += 1

# 2. Historico git (scripts geradores antigos com os dados dos CKOs)
git_id = create_folder("Historico-Git", ROOT_ID)
for fn in sorted(os.listdir("/tmp/backup3/historico-git")):
    try:
        upload_file(f"/tmp/backup3/historico-git/{fn}", fn, git_id); stats["files"] += 1
    except Exception as e:
        stats["errors"].append(fn)

# 3. Scripts do backup (reprodutibilidade)
sc_id = create_folder("Scripts-Backup", ROOT_ID)
for p, n in [(f"{CONV}/backup_to_drive.py", "backup_to_drive.py"),
             (f"{CONV}/backup_to_drive_part2.py", "backup_to_drive_part2.py"),
             (f"{CONV}/backup_to_drive_part3.py", "backup_to_drive_part3.py"),
             (f"{CONV}/functions/exportEntitiesToDrive.ts", "exportEntitiesToDrive.ts")]:
    if os.path.isfile(p):
        upload_file(p, n, sc_id); stats["files"] += 1

print(json.dumps(stats, indent=2))

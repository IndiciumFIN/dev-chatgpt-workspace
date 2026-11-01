#!/usr/bin/env python3
"""Vila: unpack verified unique assets for Git and optional Supabase Storage upload.
Usage: python scripts/vila_publish_assets.py --archive MASTER.zip --output public/vila --manifest vila-assets-manifest.json
Default is local staging only; --upload requires env SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
Never commit keys. No overwritten files or remote objects.
"""
import argparse, hashlib, json, os, pathlib, re, sys, urllib.request, urllib.error, zipfile
IMAGE_EXT={".png",".jpg",".jpeg",".webp",".svg",".gif"}
def digest(b): return hashlib.sha256(b).hexdigest()
def safe_name(s):
    s=re.sub(r"[^a-zA-Z0-9._-]+","-",s.strip()).strip(".-")
    return s or "image"
def main():
    p=argparse.ArgumentParser()
    p.add_argument("--archive",required=True)
    p.add_argument("--output",default="public/vila/archive")
    p.add_argument("--manifest",default="docs/viladocuidado/VILA_ASSET_MANIFEST_COMPLETE.json")
    p.add_argument("--upload",action="store_true")
    p.add_argument("--bucket",default="vila-do-cuidado")
    a=p.parse_args()
    url=os.getenv("SUPABASE_URL","").rstrip("/")
    key=os.getenv("SUPABASE_SERVICE_ROLE_KEY","")
    if a.upload and (not url or not key):
        p.error("--upload requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
    out=pathlib.Path(a.output); out.mkdir(parents=True,exist_ok=True)
    entries=[]; by_hash={}; errors=[]; uploaded=0; skipped=0
    with zipfile.ZipFile(a.archive) as z:
        if z.testzip() is not None: raise RuntimeError("Archive CRC check failed")
        for info in z.infolist():
            if info.is_dir() or pathlib.PurePosixPath(info.filename).suffix.lower() not in IMAGE_EXT: continue
            if info.file_size>100_000_000: raise RuntimeError("Image exceeds 100MB bound: "+info.filename)
            data=z.read(info); sha=digest(data)
            if sha not in by_hash:
                ext=pathlib.PurePosixPath(info.filename).suffix.lower()
                fn=sha+ext
                target=out/fn
                if target.exists():
                    if digest(target.read_bytes())!=sha: raise RuntimeError("Local collision: "+str(target))
                else: target.write_bytes(data)
                by_hash[sha]={"sha256":sha,"path":target.as_posix(),"storage_path":"archive/"+fn,
                              "size":len(data),"original_paths":[],"storage_state":"NOT_UPLOADED"}
            by_hash[sha]["original_paths"].append(info.filename)
    for v in by_hash.values():
        if a.upload:
            b=pathlib.Path(v["path"]).read_bytes()
            if digest(b)!=v["sha256"]: raise RuntimeError("Hash mismatch: "+v["path"])
            target=url+"/storage/v1/object/"+a.bucket+"/"+v["storage_path"]
            req=urllib.request.Request(target,b,method="POST",headers={"Authorization":"Bearer "+key,
                  "apikey":key,"Content-Type":"application/octet-stream","x-upsert":"false"})
            try:
                with urllib.request.urlopen(req,timeout=60) as resp:
                    if resp.status not in (200,201): raise RuntimeError("Unexpected storage status "+str(resp.status))
                uploaded+=1; v["storage_state"]="UPLOADED"
            except urllib.error.HTTPError as e:
                # Existing remote object is NOT proof of same hash. Leave unresolved, no overwrite.
                v["storage_state"]="REMOTE_EXISTS_UNVERIFIED" if e.code==409 else "ERROR"
                errors.append({"sha256":v["sha256"],"http_status":e.code})
                skipped+=1
        entries.append(v)
    report={"archive":str(a.archive),"image_entries":sum(len(v["original_paths"]) for v in entries),
            "unique_sha256":len(entries),"exact_duplicate_entries":sum(len(v["original_paths"])-1 for v in entries),
            "uploaded_this_run":uploaded,"upload_errors":errors,"images":entries,
            "note":"Upload is not DB registration, approval or verification of existing remote blobs."}
    dest=pathlib.Path(a.manifest);dest.parent.mkdir(parents=True,exist_ok=True)
    dest.write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n")
    print(json.dumps({k:v for k,v in report.items() if k!="images"},indent=2))
    if errors: return 2
    return 0
if __name__=="__main__": sys.exit(main())

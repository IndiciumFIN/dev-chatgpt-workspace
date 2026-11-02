#!/usr/bin/env python3
"""Deterministic official normative-file acquisition probe, ephemeral bytes only.

Only the publisher URLs are allowed; no protected PDF/XMI/OCL is committed or uploaded.
The evidence manifest contains hashes, media metadata and verification outcomes only.
"""
import hashlib, json, os, ssl, subprocess, sys, tempfile, urllib.request, urllib.parse
from datetime import datetime, timezone
from pathlib import Path
BASE=Path(__file__).resolve().parents[2]
OUT=BASE/"artifacts/ce-agents/official-mof-source-integrity.json"
TARGETS=[
 ("OMG-MOF-2.5.1","https://www.omg.org/spec/MOF/2.5.1/PDF","pdf","formal/2019-10-01","NORMATIVE"),
 ("OMG-MOF-20131001-XMI","https://www.omg.org/spec/MOF/20131001/MOF.xmi","xml","ptc/14-08-10","NORMATIVE"),
 ("OMG-CMOF-20131001-OCL","https://www.omg.org/spec/MOF/20131001/CMOFConstraints.ocl","ocl","ptc/14-08-10","INFORMATIVE_IN_MOF_COVER"),
 ("OMG-EMOF-20131001-OCL","https://www.omg.org/spec/MOF/20131001/EMOFConstraints.ocl","ocl","ptc/14-08-10","INFORMATIVE_IN_MOF_COVER")
]
def get_one(item):
    name,url,kind,doc_id,classification=item
    result={"source_id":name,"publisher":"OMG","url":url,"document_id":doc_id,"classification":classification,"binary_committed":False,"status":"HOLD_SOURCE_UNAVAILABLE"}
    req=urllib.request.Request(url,headers={"User-Agent":"CE-Canonical-Source-Integrity-Audit/1.0","Accept":"*/*"})
    try:
        with urllib.request.urlopen(req,timeout=40,context=ssl.create_default_context()) as r:
            final=r.geturl()
            u=urllib.parse.urlsplit(final)
            if u.scheme!="https" or u.hostname not in ("www.omg.org","omg.org"):
                raise ValueError("OFF_DOMAIN_REDIRECT")
            content=r.read(30_000_001)
            if len(content)>30_000_000:raise ValueError("SOURCE_SIZE_EXCEEDS_BOUND")
            if kind=="pdf":
                if not content.startswith(b"%PDF-") or len(content)<10000:raise ValueError("INVALID_PDF_MAGIC_OR_SIZE")
            elif kind=="xml":
                import xml.etree.ElementTree as ET
                ET.fromstring(content)
                if len(content)<500:raise ValueError("INVALID_XMI_LENGTH")
            else:
                s=content.decode("utf-8-sig",errors="replace")
                if len(s)<100 or "<html" in s.lower():raise ValueError("INVALID_OCL_OR_HTML_RESPONSE")
            result.update({"final_url":final,"bytes":len(content),"sha256":hashlib.sha256(content).hexdigest(),
                           "content_type":r.headers.get("Content-Type"),"status":"FETCHED_AND_FORMAT_VERIFIED",
                           "original_bytes_retained":False})
            if kind=="pdf" and subprocess.run(["bash","-lc","command -v pdfinfo >/dev/null"],capture_output=True).returncode==0:
                with tempfile.NamedTemporaryFile(suffix=".pdf") as t:
                    t.write(content);t.flush()
                    res=subprocess.run(["pdfinfo",t.name],capture_output=True,text=True,timeout=15)
                    for line in res.stdout.splitlines():
                        if line.startswith("Pages:"):
                            result["pages"]=int(line.split(":",1)[1].strip())
                            break
    except Exception as e:
        result["error_type"]=type(e).__name__
        result["error_message"]=str(e)[:240]
    return result
rows=[get_one(item) for item in TARGETS]
status="OFFICIAL_BINARY_FETCH_VERIFIED" if all(x["status"]=="FETCHED_AND_FORMAT_VERIFIED" for x in rows) else "HOLD_SOURCES_NOT_ALL_FETCHED"
manifest={"recordType":"OFFICIAL_MOF_EPHEMERAL_SOURCE_INTEGRITY_MANIFEST","checkedAtUTC":datetime.now(timezone.utc).isoformat(),
  "workOrder":"WO-CE-DB-SKELETON-001","status":status,"source_count":len(rows),"verified_count":sum(x["status"]=="FETCHED_AND_FORMAT_VERIFIED" for x in rows),
  "downloaded_in_github_actions_runner_only":True,"original_binary_content_committed":False,"release":"HOLD_HUMAN",
  "copyright":"No full text, XMI or OCL content written to Git, archives or workflow artifacts. Retain only hash/byte/media evidence.",
  "sources":rows}
OUT.parent.mkdir(parents=True,exist_ok=True)
OUT.write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"status":status,"verified":manifest["verified_count"],"total":len(rows),"failed_sources":[r["source_id"] for r in rows if r["status"]!="FETCHED_AND_FORMAT_VERIFIED"],"release":"HOLD_HUMAN"}))
sys.exit(0 if status=="OFFICIAL_BINARY_FETCH_VERIFIED" else 2)

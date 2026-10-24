#!/usr/bin/env python3
"""Obter cópias de atos legais oficiais públicos, com checkpoint e proveniência.
Sem OCR, sem interpretação normativa, sem acesso a fontes pagas.
Somente URLs do catálogo versionado no repositório autorizado.
"""
import concurrent.futures
import datetime
import hashlib
import html
from html.parser import HTMLParser
import json
import pathlib
import re
import ssl
import sys
import time
import unicodedata
from urllib import request, error, parse

ROOT = pathlib.Path(__file__).resolve().parents[1]
CATALOG = ROOT / "registers/governance/transversal-standards-candidates.v1.json"
OUT = ROOT / "audit-evidence/transversal-acquisition"
MAX_BYTES = 5 * 1024 * 1024
ALLOW_HOSTS = {"www.planalto.gov.br", "planalto.gov.br"}
UA = "Mozilla/5.0 (compatible; CE-GovernedSourceArchive/1.0; public-official-acts)"
BLOCK_COPIES = {"www.iso.org", "committee.iso.org", "www.ifrs.org", "www.isaca.org"}
def sha(data): return hashlib.sha256(data).hexdigest()
def slug(s):
    s = unicodedata.normalize("NFKD", s)
    s = "".join(x for x in s if not unicodedata.combining(x))
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")[:84]
class BodyText(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.depth = 0
        self.parts = []
    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style", "noscript"): self.depth += 1
        if not self.depth and tag in ("p","br","tr","div","h1","h2","h3","li","td","th","article","section"):
            self.parts.append("\n")
    def handle_endtag(self, tag):
        if tag in ("script", "style", "noscript"): self.depth=max(0,self.depth-1)
        if not self.depth and tag in ("p","tr","div","h1","h2","h3","li","td","th","article","section"):
            self.parts.append("\n")
    def handle_data(self, data):
        if not self.depth: self.parts.append(data)
def decode(raw, content_type):
    encs=[]
    m=re.search(r"charset\s*=\s*['\"]?([\w-]+)", content_type or "", re.I)
    if m:encs.append(m.group(1))
    m=re.search(br"<meta[^>]+charset\s*=\s*[\"']?([A-Za-z0-9_-]+)", raw[:4500], re.I)
    if m: encs.append(m.group(1).decode("ascii", "ignore"))
    encs+=["utf-8","windows-1252","iso-8859-1"]
    for enc in dict.fromkeys(encs):
        try:return raw.decode(enc),enc
        except (UnicodeError,LookupError):pass
    return raw.decode("latin-1"),"latin-1-fallback"
def check_identity(identifier, extracted):
    match=re.match(r"^(Lei|Decreto)\s+([\d.]+)/(\d{4})$", identifier, re.I)
    if not match:return False
    name,num,year=match.groups()
    digits=num.replace(".","")
    expression=r"(?<!\d)"+r"\s*\.?\s*".join(map(re.escape,list(digits)))+r"(?!\d)"
    # Law title must be present near top, and the number must occur in that title/context.
    top=extracted[:12000].lower()
    return name.lower() in top and (bool(re.search(expression, top)) or num in top) and len(extracted)>1200
def download_one(row):
    ident=row["officialIdentifier"]
    url=row["officialSourceUrl"]
    r={"officialIdentifier":ident,"sourceUrl":url,"outcome":"NOT_ATTEMPTED",
       "checkedAt":datetime.datetime.now(datetime.timezone.utc).isoformat(),"bodyStored":False}
    host=(parse.urlparse(url).hostname or "").lower()
    if not ident.startswith(("Lei ","Decreto ")) or host not in ALLOW_HOSTS:
        r["outcome"]="METADATA_ONLY_OR_LICENSE_REVIEW"
        r["reason"]="Apenas atos oficiais brasileiros com URL primária Planalto são elegíveis a download integral nesta execução."
        return r
    last=None
    for attempt in range(2):
        try:
            req=request.Request(url,headers={"User-Agent":UA,"Accept":"text/html,application/xhtml+xml;q=0.9,*/*;q=0.1"})
            with request.urlopen(req,timeout=18,context=ssl.create_default_context()) as resp:
                final=resp.url
                final_host=(parse.urlparse(final).hostname or "").lower()
                if final_host not in ALLOW_HOSTS:
                    r.update(outcome="HOLD_REDIRECT_OUTSIDE_OFFICIAL_HOST",redirectTo=final)
                    return r
                body=resp.read(MAX_BYTES+1)
                ctype=resp.headers.get("Content-Type","")
                r.update(httpStatus=resp.status,finalUrl=final,contentType=ctype)
            if len(body)>MAX_BYTES:
                r.update(outcome="HOLD_SIZE_CAP",receivedBytes=len(body))
                return r
            if not ("html" in ctype.lower() or b"<html" in body[:1000].lower()):
                r.update(outcome="HOLD_UNSUPPORTED_MIME",receivedBytes=len(body))
                return r
            decoded,charset=decode(body,ctype)
            parser=BodyText(); parser.feed(decoded)
            t=html.unescape("".join(parser.parts))
            t="\n".join(re.sub(r"[\t \u00a0]+"," ",line).strip() for line in t.splitlines())
            t=re.sub(r"\n{3,}","\n\n",t).strip()+"\n"
            r.update(receivedBytes=len(body),detectedCharset=charset,sourceSha256=sha(body))
            if not check_identity(ident,t):
                r.update(outcome="HOLD_IDENTITY_OR_CONTENT",textChars=len(t),reason="Título, número ou teor insuficiente; proibido marcar como extraído.")
                return r
            folder=OUT/"public-acts"/slug(ident);folder.mkdir(parents=True,exist_ok=True)
            (folder/"original.html").write_bytes(body)
            text=t.encode("utf-8")
            (folder/"extracted.txt").write_bytes(text)
            r.update(outcome="DOWNLOADED_UNREVIEWED",bodyStored=True,
                     originalPath=str((folder/"original.html").relative_to(ROOT)),
                     extractedPath=str((folder/"extracted.txt").relative_to(ROOT)),
                     textSha256=sha(text),textChars=len(t),
                     limitations="Extração automatizada sem revisão jurídica, literal, cláusula ou vigência. HTML original preservado.")
            return r
        except Exception as exc:
            last=f"{type(exc).__name__}: {str(exc)[:250]}"
            if attempt==0:time.sleep(1)
    r.update(outcome="HOLD_NETWORK_OR_ORIGIN",reason=last)
    return r

def main():
    d=json.loads(CATALOG.read_text("utf-8"))
    OUT.mkdir(parents=True,exist_ok=True)
    additions=d.get("coverageExpansion",{}).get("items",[])
    existing=d.get("standards",[])
    assert len(existing)==18 and len(additions)==29, "Catalog must be reconciled before acquisition"
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        results=list(pool.map(download_one,additions))
    for x in existing:
        results.append({"officialIdentifier":x.get("id"),"sourceUrl":x.get("officialMetadataUrl"),
           "outcome":"METADATA_ONLY_LICENSE_OR_APPLICABILITY_REVIEW",
           "bodyStored":False,"reason":"Não fazer cópia integral de ISO/ISACA/W3C sem qualificação dos direitos e do uso pretendido."})
    results.sort(key=lambda x:x["officialIdentifier"])
    statuses={}
    for x in results:statuses[x["outcome"]]=statuses.get(x["outcome"],0)+1
    manifest={"sourceRepository":"IndiciumFIN/dev-chatgpt-workspace",
     "sourceCatalog":"registers/governance/transversal-standards-candidates.v1.json",
     "sourceCatalogSha256":sha(CATALOG.read_bytes()),"executedAt":datetime.datetime.now(datetime.timezone.utc).isoformat(),
     "scope":"Fonte oficial de atos normativos brasileiros, apenas links do catálogo; metadados para referências licenciadas.",
     "purpose":"Acervo auxiliar de aquisição em GitHub Actions; NÃO Kernel/REG/Master Data admitidos.",
     "items":results,"summary":{"items":len(results),"byOutcome":statuses},
     "safety":{"crossRepositorySources":False,"externalUpload":False,"protectedStandardFullTextCopied":False,
        "kernelAdmission":False,"publicationAuthorized":False,"clinicalValidation":False}}
    (OUT/"manifest.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n","utf-8")
    with (OUT/"items.jsonl").open("w",encoding="utf-8") as out:
        for x in results:out.write(json.dumps(x,ensure_ascii=False)+"\n")
    print(json.dumps(manifest["summary"],ensure_ascii=False))
    # Return success when every item has explicit status; failed URLs are evidence, not silent success.
    assert len(results)==47
if __name__=="__main__":main()

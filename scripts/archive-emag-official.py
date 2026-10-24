#!/usr/bin/env python3
"""Coleta isolada do Modelo de Acessibilidade em Governo Eletrônico (eMAG) v3.1.
Cópia pública de fonte única oficial, CC BY 4.0, sem promover ao Kernel.
"""
from html.parser import HTMLParser
from urllib import request,parse
from pathlib import Path
import datetime,hashlib,json,re,sys

ROOT=Path(__file__).resolve().parents[1]
CATALOG=ROOT/"registers/governance/transversal-standards-candidates.v1.json"
OUT=ROOT/"audit-evidence/transversal-acquisition/snapshots/20261024-extended/emag"
OFFICIAL_URL="https://emag.governoeletronico.gov.br/"
LICENSE_URL="https://creativecommons.org/licenses/by/4.0/"
class Extract(HTMLParser):
    def __init__(self):super().__init__(convert_charrefs=True);self.ignore=0;self.parts=[]
    def handle_starttag(self, tag, attrs):
        if tag in {"script","style","noscript"}:self.ignore+=1
        if not self.ignore and tag in {"p","h1","h2","h3","li","section","tr","br","div"}:self.parts.append("\n")
    def handle_endtag(self,tag):
        if tag in {"script","style","noscript"}:self.ignore=max(0,self.ignore-1)
    def handle_data(self,data):
        if not self.ignore:self.parts.append(data)
def sha(b):return hashlib.sha256(b).hexdigest()
def main():
    reg=json.loads(CATALOG.read_text("utf-8"))
    item=next(x for x in reg["coverageExpansion"]["items"] if x["officialIdentifier"]=="eMAG")
    if item["officialSourceUrl"]!=OFFICIAL_URL:raise SystemExit("HOLD: unexpected official eMAG URL")
    if OUT.exists():raise SystemExit("HOLD: snapshot already exists")
    req=request.Request(OFFICIAL_URL,headers={"User-Agent":"Mozilla/5.0 (compatible; CE-OfficialEvidence/1.0)","Accept":"text/html"})
    with request.urlopen(req,timeout=30) as resp:
        target=resp.url
        contentType=resp.headers.get("Content-Type","")
        raw=resp.read(6*1024*1024+1)
    if parse.urlparse(target).hostname!="emag.governoeletronico.gov.br":raise SystemExit("HOLD: redirect outside issuer website")
    if len(raw)>6*1024*1024 or b"<html" not in raw[:2000].lower():raise SystemExit("HOLD: size/type")
    decoded=None
    for enc in ["utf-8","windows-1252","iso-8859-1"]:
        try:decoded=raw.decode(enc);break
        except UnicodeError:pass
    if decoded is None:raise SystemExit("HOLD: decoding")
    normalized=re.sub(r"\s+"," ",decoded.lower())
    if "emag" not in normalized or ("versão 3.1" not in normalized and "versao 3.1" not in normalized and "versão 3.1" not in normalized[:15000]):
        raise SystemExit("HOLD: can't confirm eMAG version 3.1")
    if "creativecommons.org/licenses/by/4.0" not in decoded.lower() and "atribuição 4.0 internacional" not in normalized:
        raise SystemExit("HOLD: official CC BY 4.0 license not visible; no copying")
    parser=Extract();parser.feed(decoded)
    extracted="\n".join(x.strip() for x in "".join(parser.parts).splitlines() if x.strip())+"\n"
    if len(extracted)<12000:raise SystemExit("HOLD: text too short")
    OUT.mkdir(parents=True)
    files={
        "original.html":raw,
        "extracted.txt":extracted.encode("utf-8"),
        "LICENSE-AND-ATTRIBUTION.txt":(
            "Fonte: Governo Federal, Modelo de Acessibilidade em Governo Eletrônico (eMAG), versão 3.1, abril/2014.\n"
            "URL original: "+OFFICIAL_URL+"\n"
            "Licença indicada no documento: Creative Commons Atribuição 4.0 Internacional (CC BY 4.0).\n"
            "Texto da licença: "+LICENSE_URL+"\n"
            "original.html é cópia histórica sem alteração; extracted.txt é conversão técnica não homologada.\n"
            "Não há endosso governamental; sempre conferir atualizações na origem.\n").encode("utf-8")
    }
    for n,b in files.items():(OUT/n).write_bytes(b)
    m={"identifier":"eMAG","title":"Modelo de Acessibilidade em Governo Eletrônico 3.1",
       "sourceUrl":OFFICIAL_URL,"finalUrl":target,"retrievedAt":datetime.datetime.now(datetime.timezone.utc).isoformat(),
       "license":LICENSE_URL,"rights":"Publicada sob CC BY 4.0, atribuição preservada",
       "artifacts":{n:{"sha256":sha(b),"sizeBytes":len(b)} for n,b in files.items()},
       "review":"EXTRACTION_UNREVIEWED","kernelAdmission":False,"publicationAuthorized":False}
    (OUT/"evidence.json").write_text(json.dumps(m,ensure_ascii=False,indent=2)+"\n","utf-8")
    print("PASS original eMAG v3.1 "+str(len(raw))+" bytes SHA256="+sha(raw)+"; extracted="+str(len(extracted))+" characters")
if __name__=="__main__":main()

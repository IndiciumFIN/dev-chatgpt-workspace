#!/usr/bin/env python3
"""Independente: cada seção do índice reproduz EXATAMENTE os bytes indexados."""
import hashlib,json,pathlib,re
ROOT=pathlib.Path(__file__).resolve().parents[1]
BASE=ROOT/"audit-evidence/transversal-acquisition/article-index/20261024"
SOURCE=ROOT/"registers/governance/transversal-source-instances/public/public-materialization-manifest.json"
HEAD=re.compile(rb"(?im)^[ \t]*Art\.[ \t]*(\d{1,4}(?:-[a-z])?)(?:\xc2\xba|\xc2\xb0|o|\.)?(?=[ \t\r\n-])")
def sha(x):return hashlib.sha256(x).hexdigest()
def load(x):return json.loads(x.read_text("utf8"))
def main():
    manifest=load(BASE/"index-manifest.json")
    sm=load(SOURCE)
    official={x["identifier"]:x for x in sm["items"] if x["identifier"].startswith(("Lei ","Decreto ","Resolução ANPD "))}
    assert len(official)==21 and manifest["sourcesIndexed"]==21
    assert manifest["normativeRequirementsVerified"]==0 and manifest["kernelAdmission"] is False
    assert manifest["extractionReviewed"] is False
    assert {x["identifier"] for x in manifest["items"]}==set(official)
    total=0
    for entry in manifest["items"]:
        doc=load(ROOT/entry["indexPath"])
        ident=entry["identifier"]
        text=(ROOT/doc["extractedTextPath"]).read_bytes()
        orig=(ROOT/doc["officialOriginalPath"]).read_bytes()
        assert sha(text)==doc["extractedTextSha256"] and len(text)==doc["extractedTextBytes"]
        assert sha(orig)==doc["originalSha256"]==official[ident]["originalSha256"]
        assert doc["sourceCanonicalId"]==official[ident]["sourceCanonicalId"]
        records=doc["articles"]
        assert len(records)==entry["articleOccurrences"]
        pre_end=doc["prefixBeforeFirstArticle"]["endByte"]
        assert sha(text[:pre_end])==doc["prefixBeforeFirstArticle"]["sha256"]
        starts=[m.start() for m in HEAD.finditer(text)]
        # Correlação exata do parser independente sobre bytes.
        assert len(starts)==len(records),"Header count mismatch "+ident
        assert [x["startByte"] for x in records]==starts,"Header offset mismatch "+ident
        assert pre_end==(starts[0] if starts else len(text))
        cursor=pre_end
        for ordinal,r in enumerate(records,1):
            assert r["occurrence"]==ordinal
            assert r["startByte"]==cursor
            assert r["endByte"]>cursor and r["endByte"]<=len(text)
            block=text[r["startByte"]:r["endByte"]]
            assert sha(block)==r["sliceSha256"]
            assert block.startswith(r["articleLabel"].encode("utf-8"))
            cursor=r["endByte"]
        assert cursor==len(text),"Missing/truncated tail "+ident
        if records:
            altered=bytearray(text[records[0]["startByte"]:records[0]["endByte"]])
            altered[0]^=1
            assert sha(altered)!=records[0]["sliceSha256"],"Negative test failed"
        assert doc["kernelAdmission"] is False and doc["reviewed"] is False
        total+=len(records)
    assert total==manifest["totalArticleOccurrences"]
    assert {str(p.relative_to(ROOT)) for p in (BASE/"sources").glob("*.json")} == {x["indexPath"] for x in manifest["items"]}
    print("PASS index integrity:",len(official),"Brazilian acts,",total,"byte-exact article occurrences; NO normative claim/KERNEL.")
if __name__=="__main__":main()

#!/usr/bin/env python3
"""Índice mecânico de cabeçalhos Art. em 21 atos brasileiros já arquivados.
Não cria claim, requisito jurídico, classificação/nível ou admissão Kernel.
Não extrai conteúdo W3C/ISO, não faz rede, não modifica nenhuma fonte.
"""
import datetime
import hashlib
import json
from pathlib import Path
import re

ROOT=Path(__file__).resolve().parents[1]
SOURCE_MANIFEST=ROOT/"registers/governance/transversal-source-instances/public/public-materialization-manifest.json"
SNAPSHOT=ROOT/"audit-evidence/transversal-acquisition/snapshots/20261024"
ARCHIVE_MANIFEST=SNAPSHOT/"manifest.json"
INDEX=ROOT/"audit-evidence/transversal-acquisition/article-index/20261024"
DAY="2026-10-24"
# Não busca remissões na mesma linha, apenas início de linha "Art. <número>".
HEAD=re.compile(r"(?im)^[ \t]*Art\.[ \t]*(\d{1,4}(?:-[a-z])?)(?:[º°o]|\.)?(?=[ \t\r\n-])")
def sha(data):return hashlib.sha256(data).hexdigest()
def dump(path,obj):
    path.parent.mkdir(parents=True,exist_ok=True)
    if path.exists():raise RuntimeError("HOLD: artigo já indexado, preservar execução anterior: "+str(path))
    path.write_text(json.dumps(obj,ensure_ascii=False,sort_keys=True,indent=2)+"\n",encoding="utf8")
def main():
    if INDEX.exists():raise SystemExit("HOLD: índice já existe, não reexecutar.")
    p=json.loads(SOURCE_MANIFEST.read_text("utf-8"))
    am=json.loads(ARCHIVE_MANIFEST.read_text("utf-8"))
    source_items={x["identifier"]:x for x in p["items"]}
    archive_items={x["officialIdentifier"]:x for x in am["items"] if x.get("bodyStored")}
    eligible=sorted(
        x for x in p["items"] if x["identifier"] in archive_items
        and x["sourcePath"].startswith("registers/governance/transversal-source-instances/public/source/")
        and x["identifier"].startswith(("Lei ","Decreto ","Resolução ANPD "))
    ,key=lambda x:x["identifier"])
    assert len(eligible)==21 and len(archive_items)==24, "HOLD: escopo histórico divergente"
    all_results=[]
    for source in eligible:
        ident=source["identifier"]
        arch=archive_items[ident]
        src=json.loads((ROOT/source["sourcePath"]).read_text("utf-8"))
        assert src["canonical_id"]==source["sourceCanonicalId"] and src["status"]=="CANDIDATE"
        assert src["source_type"] in ("OFFICIAL_LAW","REGULATOR")
        original=ROOT/source["originalPath"]
        orig_bytes=original.read_bytes()
        assert sha(orig_bytes)==source["originalSha256"]==src["integrity"]["sha256"]==arch["sourceSha256"]
        extracted=Path(arch["extractedPath"])
        assert str(extracted).startswith("audit-evidence/transversal-acquisition/snapshots/20261024/public-acts/")
        text_bytes=(ROOT/extracted).read_bytes()
        assert sha(text_bytes)==arch["textSha256"],"HOLD: extracted text not identical to snapshot"
        text=text_bytes.decode("utf-8")
        hits=list(HEAD.finditer(text))
        starts=[]
        prev_char=prev_byte=0
        for hit in hits:
            current=prev_byte+len(text[prev_char:hit.start()].encode("utf-8"))
            starts.append(current)
            prev_char,prev_byte=hit.start(),current
        records=[]
        for i,hit in enumerate(hits):
            start=starts[i]
            end=starts[i+1] if i+1<len(starts) else len(text_bytes)
            piece=text_bytes[start:end]
            assert piece and piece.decode("utf-8").startswith(hit.group(0))
            records.append({
                "sourceCanonicalId":src["canonical_id"],
                "articleLabel":hit.group(0).strip(),
                "articleNumberAsPrinted":hit.group(1),
                "occurrence":i+1,
                "startByte":start,
                "endByte":end,
                "sliceSha256":sha(piece),
                "reviewed":False
            })
        prefix=text_bytes[:starts[0]] if starts else text_bytes
        numerals=[x["articleNumberAsPrinted"] for x in records]
        repeated=sorted(set(x for x in numerals if numerals.count(x)>1))
        doc={
            "sourceCanonicalId":src["canonical_id"],
            "sourceIdentifier":ident,
            "sourcePath":source["sourcePath"],
            "officialOriginalPath":source["originalPath"],
            "originalSha256":source["originalSha256"],
            "extractedTextPath":str(extracted),
            "extractedTextSha256":sha(text_bytes),
            "extractedTextBytes":len(text_bytes),
            "prefixBeforeFirstArticle":{"endByte":len(prefix),"sha256":sha(prefix)},
            "articleOccurrences":len(records),
            "repeatedArticleNumbersForReview":repeated,
            "possibleMultipleActsOrAnnexes":bool(repeated or re.search(r"(?im)^[ \t]*ANEXO\b",text)),
            "scopeLimitations":["Cabeçalhos identificados por padrão textual, sujeitos a falsos positivos e omissões.",
                                "Artigos posteriores a um anexo podem reiniciar a numeração; revisão humana necessária.",
                                "Textos extraídos não foram revisados quanto a atualização, vigência, anexos e completude.",
                                "Nenhuma afirmação normativa/claim, requisito ou vínculo por cláusula produzido."],
            "kernelAdmission":False,
            "reviewed":False,
            "articles":records
        }
        name=source["sourceCanonicalId"].removesuffix(".source")+".json"
        dump(INDEX/"sources"/name,doc)
        all_results.append({
            "identifier":ident,"sourceCanonicalId":src["canonical_id"],
            "indexPath":str((INDEX/"sources"/name).relative_to(ROOT)),
            "articleOccurrences":len(records),
            "possibleMultipleActsOrAnnexes":doc["possibleMultipleActsOrAnnexes"],
            "repeatedArticleNumberCount":len(repeated),
            "hasNoArticleHeadings":not bool(hits)
        })
    assert len(all_results)==21
    report={
        "catalogScope":"IndiciumFIN/dev-chatgpt-workspace ONLY",
        "generatedOn":DAY,
        "purpose":"Índice textual de ocorrência de artigo sem interpretação jurídica",
        "sourceManifest":str(SOURCE_MANIFEST.relative_to(ROOT)),
        "sourceSnapshot":str(ARCHIVE_MANIFEST.relative_to(ROOT)),
        "sourcesIndexed":len(all_results),
        "totalArticleOccurrences":sum(x["articleOccurrences"] for x in all_results),
        "sourcesWithNoArticleHeadings":sum(x["hasNoArticleHeadings"] for x in all_results),
        "sourcesWithPossibleMultipleActsOrAnnexes":sum(x["possibleMultipleActsOrAnnexes"] for x in all_results),
        "rightsScope":"Atos oficiais brasileiros já arquivados; W3C, eMAG, ISO e IFRS excluídos deste índice.",
        "extractionReviewed":False,
        "normativeRequirementsVerified":0,
        "kernelAdmission":False,
        "approvalOrRelease":False,
        "items":all_results
    }
    dump(INDEX/"index-manifest.json",report)
    print("INDEX",report["sourcesIndexed"],"public acts;",report["totalArticleOccurrences"],"raw Art. headings;",
          report["sourcesWithNoArticleHeadings"],"without headings;",report["sourcesWithPossibleMultipleActsOrAnnexes"],"with annex/duplicate flags. NO normative claims.")
if __name__=="__main__":main()

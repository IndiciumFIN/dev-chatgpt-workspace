#!/usr/bin/env python3
"""Instâncias CANDIDATE de 25 documentos públicos já arquivados no MESMO repositório.

Usa os schemas CKO existentes. Não baixa nada, não analisa cláusula, não promove.
Separação de material de origem, direitos e conclusão testada; sem nomenclatura nova.
"""
import hashlib,json,pathlib,re,datetime
from jsonschema import Draft202012Validator

R=pathlib.Path(__file__).resolve().parents[1]
CAT=R/"registers/governance/transversal-standards-candidates.v1.json"
PMO=R/"registers/pmo/queue.v1.json"
HISTORY=R/"audit-evidence/transversal-acquisition/snapshots/20261024"
HISTORY_MANIFEST=HISTORY/"manifest.json"
EMAG=R/"audit-evidence/transversal-acquisition/snapshots/20261024-extended/emag"
DEST=R/"registers/governance/transversal-source-instances/public"
SCHEMAS={
 "source":R/"contracts/cko-schemas/source.schema.json",
 "audit":R/"contracts/cko-schemas/audit_evidence.schema.json"}
DAY="2026-10-24"
def json_bytes(obj):return (json.dumps(obj,ensure_ascii=False,sort_keys=True,indent=2)+"\n").encode()
def sha(data):return hashlib.sha256(data).hexdigest()
def readjson(path):return json.loads(path.read_text(encoding="utf-8"))
def put(name,data):
    p=DEST/name
    if p.exists():raise RuntimeError("HOLD: existing file "+str(p))
    p.parent.mkdir(parents=True,exist_ok=True)
    raw=json_bytes(data)
    p.write_bytes(raw)
    return raw
def k(identifier):
    if identifier.startswith("TRV-"):return identifier.lower()
    return re.sub("[^a-z0-9]+","-",identifier.lower()).strip("-")
def main():
    if DEST.exists():raise SystemExit("HOLD: public source candidates exist; no rerun/overwrite")
    cat=readjson(CAT);pmo=readjson(PMO)
    assert cat["version"]=="0.1.2" and pmo["revision"]==13, "HOLD: metadata or PMO revision drift"
    assert cat["sourceContractReview"]["materializationStatus"]=="CANDIDATES_MATERIALIZED"
    assert len(cat["coverageExpansion"]["excludedByApplicability"])==1
    all_ref={i["officialIdentifier"]:i for i in cat["coverageExpansion"]["items"]}
    all_ref.update({i["id"]:i for i in cat["standards"]})
    history=readjson(HISTORY_MANIFEST)
    stored=[x for x in history["items"] if x.get("bodyStored")]
    assert len(stored)==24 and len({x["officialIdentifier"] for x in stored})==24
    emag_ev=readjson(EMAG/"evidence.json")
    assert emag_ev["identifier"]=="eMAG"
    sources=[]
    for item in stored:
        ident=item["officialIdentifier"]; source_ref=all_ref.get(ident)
        assert source_ref, "HOLD missing catalog ref "+ident
        original_rel=item["originalPath"].removeprefix("audit-evidence/transversal-acquisition/")
        assert original_rel.startswith(("public-acts/","public-standards-w3c/"))
        orig=HISTORY/original_rel
        assert orig.is_file() and not orig.is_symlink()
        expected=item["sourceSha256"]
        assert sha(orig.read_bytes())==expected, "HOLD original bytes mismatch: "+ident
        issuer=source_ref.get("publisher",source_ref.get("authority"))
        title=source_ref.get("documentName",source_ref.get("name"))
        date=(item.get("checkedAt") or "2026-10-24")[:10]
        if ident.startswith(("Lei ","Decreto ")):
            source_type="OFFICIAL_LAW"; rights="UNKNOWN"; jurisdiction="Brasil"; license_ref=None
        elif ident.startswith("Resolução ANPD"):
            source_type="REGULATOR";rights="UNKNOWN";jurisdiction="Brasil";license_ref=None
        else:
            source_type="STANDARD";rights="LICENSED";jurisdiction="Internacional"
            lic=item.get("licenseNoticePath")
            assert lic and item.get("licenseUrl")=="https://www.w3.org/copyright/document-license/"
            notice=HISTORY/lic.removeprefix("audit-evidence/transversal-acquisition/")
            assert notice.is_file()
            license_ref=str(notice.relative_to(R))
        sources.append({"identifier":ident,"title":title,"issuer":issuer,"version":"snapshot-"+date,
           "sourceType":source_type,"rights":rights,"jurisdiction":jurisdiction,
           "uri":item["finalUrl"],"date":date,"original":orig,"sha":expected,
           "sourceRecord":item,"license_ref":license_ref})
    assert "eMAG" in all_ref
    emag_orig=EMAG/"original.html"
    assert sha(emag_orig.read_bytes())==emag_ev["artifacts"]["original.html"]["sha256"]
    sources.append({"identifier":"eMAG","title":"Modelo de Acessibilidade em Governo Eletrônico 3.1",
      "issuer":"Governo Federal","version":"3.1; snapshot-2026-10-24",
      "sourceType":"GUIDELINE","rights":"LICENSED","jurisdiction":"Brasil",
      "uri":emag_ev["finalUrl"],"date":"2026-10-24","original":emag_orig,
      "sha":emag_ev["artifacts"]["original.html"]["sha256"],
      "sourceRecord":emag_ev,"license_ref":str((EMAG/"LICENSE-AND-ATTRIBUTION.txt").relative_to(R))})
    assert len(sources)==25 and len({i["identifier"] for i in sources})==25
    validators={i:Draft202012Validator(readjson(path),format_checker=Draft202012Validator.FORMAT_CHECKER)
                for i,path in SCHEMAS.items()}
    manifest=[]
    for entry in sources:
        key=k(entry["identifier"])
        srcid="transversal-public."+key+".source"
        src={
          "schema_version":"0.1.0","canonical_id":srcid,
          "version":entry["version"],"status":"CANDIDATE","updated_at":DAY,
          "provenance_refs":[str(HISTORY_MANIFEST.relative_to(R)) if entry["identifier"]!="eMAG" else str((EMAG/"evidence.json").relative_to(R)),str(entry["original"].relative_to(R))],
          "source_type":entry["sourceType"],"title":entry["title"],
          "authority":entry["issuer"],
          "locator":{"uri":entry["uri"],"pinpoint":"Documento completo arquivado; nenhuma cláusula individual verificada"},
          "rights":entry["rights"],"jurisdiction":entry["jurisdiction"],
          "retrieved_at":entry["date"],
          "integrity":{"sha256":entry["sha"],"snapshot_ref":str(entry["original"].relative_to(R))}
        }
        if entry["license_ref"]:src["license_ref"]=entry["license_ref"]
        validators["source"].validate(src)
        # Contraexemplo: sem licença/rights, a fonte não é válida segundo o schema.
        missing=dict(src);del missing["rights"]
        assert not validators["source"].is_valid(missing)
        raw=put("source/"+key+".json",src)
        audit={
            "schema_version":"0.1.0","canonical_id":srcid+".audit-evidence",
            "version":"1.0.0","status":"CANDIDATE","updated_at":DAY,
            "provenance_refs":src["provenance_refs"],
            "artifact_ref":str((DEST/"source"/(key+".json")).relative_to(R)),
            "validator_id":"scripts/materialize-transversal-public.py",
            "test_case_id":"archived-original-sha256-and-source-json-schema-2020-12",
            "result":"PASS","run_at":datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "input_sha256":entry["sha"],"output_sha256":sha(raw),
            "runner_version":"1.0.0",
            "limit_statement":"PASS APENAS integridade SHA-256 do documento já arquivado e validação do schema da fonte. Sem revisão do teor, anexos, vigência, direitos completos, requisitos por cláusula ou admissão Kernel."
        }
        validators["audit"].validate(audit)
        put("audit-evidence/"+key+".json",audit)
        manifest.append({"identifier":entry["identifier"],"sourceCanonicalId":srcid,
          "sourcePath":str((DEST/"source"/(key+".json")).relative_to(R)),
          "sourceJsonSha256":sha(raw),"originalSha256":entry["sha"],
          "originalPath":str(entry["original"].relative_to(R)),
          "sourceStatus":"CANDIDATE","evidenceScope":"byte_integrity_and_schema_only",
          "normativeClausesVerified":0,"kernelAdmission":False})
    report={"catalog":str(CAT.relative_to(R)),"generatedOn":DAY,
       "sourceSchema":str(SCHEMAS["source"].relative_to(R)),
       "auditSchema":str(SCHEMAS["audit"].relative_to(R)),
       "sourceCandidateCount":25,"schemaAndOriginalHashChecks":25,
       "auditEvidenceCandidates":25,"normativeClausesVerified":0,
       "kernelAdmission":False,
       "limitation":"O SHA do source aponta aos bytes originais oficiais preservados, não atesta completude jurídica ou licença irrestrita.",
       "items":manifest}
    put("public-materialization-manifest.json",report)
    # Escrever SOMENTE metadados resumidos no cadastro e PMO; snapshots imutáveis.
    cat["publicSourceContractReview"]={
      "asOf":DAY,"status":"CANDIDATES_MATERIALIZED",
      "sourceSchemaRef":str(SCHEMAS["source"].relative_to(R)),
      "auditSchemaRef":str(SCHEMAS["audit"].relative_to(R)),
      "manifestRef":str((DEST/"public-materialization-manifest.json").relative_to(R)),
      "sourceCandidatesSchemaValidated":25,"sourceOriginalHashesVerified":25,
      "normativeRequirementsVerified":0,"kernelAdmission":"NOT_ADMITTED",
      "rightsLimitation":"LICENCED/UNKNOWN não implica redistribuição irrestrita. Verificar por finalidade.",
      "applicability":"HOLD_REVIEW","policyApplicabilityNotCertified":True
    }
    CAT.write_bytes(json_bytes(cat))
    w=next(x for x in pmo["items"] if x["id"]=="WO-GOV-TRANS-001")
    w["next"]="25 documentos públicos agora possuem instâncias source CANDIDATE e evidências de hash/schemas. Próximos passos: elegibilidade por aplicabilidade/direitos, revisão de vigência/anexos, requisitos por cláusula, checker e admissão Kernel. 18 ISO permanecem apenas metadados em HOLD."
    w["updatedOn"]=DAY
    w["evidence"]=list(dict.fromkeys(w["evidence"]+["https://github.com/IndiciumFIN/dev-chatgpt-workspace/blob/main/"+str((DEST/"public-materialization-manifest.json").relative_to(R))]))
    pmo["revision"]=14;pmo["updatedOn"]=DAY
    pmo["events"].append({"seq":16,"workId":"WO-GOV-TRANS-001","to":"IN_PROGRESS","date":DAY,
      "reason":"Materializadas 25 fontes públicas CANDIDATE a partir de originais hash-checkados e 25 evidências estruturais; sem atomização de cláusulas ou admissão."})
    PMO.write_bytes(json_bytes(pmo))
    print("PASS 25 fontes públicas originais + 25 registros de evidência; todos CANDIDATE; Kernel: NÃO.")
if __name__=="__main__":main()

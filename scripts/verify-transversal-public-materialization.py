#!/usr/bin/env python3
"""Gate somente-leitura, independente da geração, de 25 fontes públicas candidatas.
Passa somente para integridade, schema e escopo do material obtido — nunca para validade jurídica.
"""
import hashlib,json,pathlib,re
from jsonschema import Draft202012Validator
R=pathlib.Path(__file__).resolve().parents[1]
ROOT=R/"registers/governance/transversal-source-instances/public"
C=R/"registers/governance/transversal-standards-candidates.v1.json"
H=R/"audit-evidence/transversal-acquisition/snapshots/20261024/manifest.json"
E=R/"audit-evidence/transversal-acquisition/snapshots/20261024-extended/emag/evidence.json"
SC={"source":R/"contracts/cko-schemas/source.schema.json",
    "audit":R/"contracts/cko-schemas/audit_evidence.schema.json"}
def load(p):return json.loads(p.read_text("utf-8"))
def sha(raw):return hashlib.sha256(raw).hexdigest()
def key(identifier):
    if identifier.startswith("TRV-"):return identifier.lower()
    return re.sub("[^a-z0-9]+","-",identifier.lower()).strip("-")
def main():
    c=load(C);m=load(ROOT/"public-materialization-manifest.json");history=load(H)
    assert c["publicSourceContractReview"]["status"]=="CANDIDATES_MATERIALIZED"
    assert c["publicSourceContractReview"]["kernelAdmission"]=="NOT_ADMITTED"
    assert c["publicSourceContractReview"]["normativeRequirementsVerified"]==0
    assert c["publicSourceContractReview"]["sourceCandidatesSchemaValidated"]==25
    assert m["sourceCandidateCount"]==m["auditEvidenceCandidates"]==25
    assert m["normativeClausesVerified"]==0 and m["kernelAdmission"] is False
    assert len(m["items"])==25
    original={v["officialIdentifier"]:v for v in history["items"] if v.get("bodyStored")}
    assert len(original)==24 and len(set(original))==24
    original["eMAG"]=load(E)
    assert set(x["identifier"] for x in m["items"])==set(original)
    validators={}
    for typ,p in SC.items():
        schema=load(p);Draft202012Validator.check_schema(schema)
        validators[typ]=Draft202012Validator(schema,format_checker=Draft202012Validator.FORMAT_CHECKER)
    for item in m["items"]:
        name=item["identifier"];k=key(name)
        sourcefile=ROOT/"source"/(k+".json")
        auditfile=ROOT/"audit-evidence"/(k+".json")
        source=load(sourcefile)
        audit=load(auditfile)
        validators["source"].validate(source)
        validators["audit"].validate(audit)
        assert source["canonical_id"]==item["sourceCanonicalId"]
        assert item["sourcePath"]==str(sourcefile.relative_to(R))
        assert source["source_type"] in {"STANDARD","OFFICIAL_LAW","REGULATOR","GUIDELINE"}
        assert source["status"]==audit["status"]==item["sourceStatus"]=="CANDIDATE"
        assert source["integrity"]["snapshot_ref"]==item["originalPath"]
        orig=(R/item["originalPath"]).read_bytes()
        assert sha(orig)==item["originalSha256"]==source["integrity"]["sha256"]
        assert sha(sourcefile.read_bytes())==item["sourceJsonSha256"]==audit["output_sha256"]
        assert audit["input_sha256"]==item["originalSha256"]
        assert audit["artifact_ref"]==item["sourcePath"]
        assert audit["result"]=="PASS" and "APENAS integridade" in audit["limit_statement"]
        assert "nenhuma cláusula individual verificada" in source["locator"]["pinpoint"]
        assert item["kernelAdmission"] is False and item["normativeClausesVerified"]==0
        if name in {"WCAG 2.2","W3C SHACL","TRV-010","eMAG"}:
            assert source["rights"]=="LICENSED" and source.get("license_ref")
            assert (R/source["license_ref"]).is_file()
        else:
            assert source["rights"]=="UNKNOWN" and "license_ref" not in source
        if name=="eMAG":
            assert source["source_type"]=="GUIDELINE"
            assert item["originalSha256"]==original[name]["artifacts"]["original.html"]["sha256"]
        else:
            assert source["locator"]["uri"]==original[name]["finalUrl"]
            assert original[name]["sourceSha256"]==item["originalSha256"]
        # Teste negativo: o contrato recusa fonte sem integridade.
        incomplete=dict(source);incomplete.pop("integrity")
        assert not validators["source"].is_valid(incomplete)
    assert {p.name for p in (ROOT/"source").glob("*.json")}=={key(x)+".json" for x in original}
    assert {p.name for p in (ROOT/"audit-evidence").glob("*.json")}=={key(x)+".json" for x in original}
    assert c["summary"]["currentActiveReferences"]==46
    assert len(c["coverageExpansion"]["excludedByApplicability"])==1
    print("PASS: 25 originais preservados, 25 fontes CANDIDATE, 25 evidências, esquemas/hashes/identidade/licenças e testes negativos; 0 requisitos normativos, 0 admissão.")
if __name__=="__main__":main()

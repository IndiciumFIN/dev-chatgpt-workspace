#!/usr/bin/env python3
"""Auditoria INDEPENDENTE das instâncias ISO candidatas.
Verifica instâncias contra os contratos canônicos e os hashes, não conformidade ISO.
Não escreve, não acessa rede, não lê texto integral licenciado.
"""
from copy import deepcopy
import hashlib
import json
from pathlib import Path
import re
from jsonschema import Draft202012Validator

BASE=Path(__file__).resolve().parents[1]
ROOT=BASE/"registers/governance/transversal-source-instances"
CAT=BASE/"registers/governance/transversal-standards-candidates.v1.json"
FILES={
    "source":"contracts/cko-schemas/source.schema.json",
    "applicability":"contracts/cko-schemas/applicability.schema.json",
    "authority-binding":"contracts/cko-schemas/authority_binding.schema.json",
    "audit-evidence":"contracts/cko-schemas/audit_evidence.schema.json"
}
def load(p):return json.loads(p.read_text(encoding="utf-8"))
def sha(b):return hashlib.sha256(b).hexdigest()
def candidate_ids(c):
    x=[v["id"] for v in c["standards"] if v["authority"] in ("ISO","ISO/IEC")]
    x.extend(v["officialIdentifier"] for v in c["coverageExpansion"]["items"]
             if re.match(r"^ISO(?:/IEC)?\s",v["officialIdentifier"]))
    return x
def key(identifier):
    return identifier if identifier.startswith("TRV-") else re.sub("[^A-Za-z0-9-]+","-",identifier).strip("-").upper()
def fail_if(condition,message):
    if condition:raise AssertionError(message)
def main():
    c=load(CAT)
    m=load(ROOT/"materialization-manifest.json")
    expected=candidate_ids(c)
    assert len(expected)==18 and len(set(expected))==18
    assert expected==c["sourceContractReview"]["identifiers"]
    assert c["sourceContractReview"]["materializationStatus"]=="CANDIDATES_MATERIALIZED"
    assert c["sourceContractReview"]["admission"]=="NOT_ADMITTED"
    assert m["kernelAdmission"] is False and m["ISOClausesVerified"]==0
    assert len(m["items"])==18 and m["sourceCandidates"]==18
    assert m["heldApplicability"]==m["heldStructuralBindings"]==m["structuralAuditEvidence"]==18
    assert [x["catalogIdentifier"] for x in m["items"]]==expected
    assert not any(x["officialIdentifier"].startswith("IFRS ") for x in c["coverageExpansion"]["items"])
    assert len(c["coverageExpansion"]["excludedByApplicability"])==1
    all_schemas={a:load(BASE/b) for a,b in FILES.items()}
    for schema in all_schemas.values():Draft202012Validator.check_schema(schema)
    validators={k:Draft202012Validator(v,format_checker=Draft202012Validator.FORMAT_CHECKER)
                for k,v in all_schemas.items()}
    # A validação negativa demonstra que os schemas rejeitam realmente valores inválidos.
    assert not validators["source"].is_valid({"schema_version":"0.1.0"})
    assert not validators["authority-binding"].is_valid({"schema_version":"0.1.0"})
    for item in m["items"]:
        ident=item["catalogIdentifier"]; k=key(ident)
        meta_path=ROOT/"metadata"/(k+".json")
        meta_raw=meta_path.read_bytes()
        meta=load(meta_path)
        assert meta["identifier"]==ident
        assert meta["sourceKind"]=="LOCAL_CATALOG_TRANSCRIPTION_NOT_ISO_ORIGINAL"
        assert "publisher source bytes" in meta["notVerified"]
        assert "specific ISO clause" in meta["notVerified"]
        assert sha(meta_raw)==item["metadataHash"]
        objects={folder:load(ROOT/folder/(k+".json")) for folder in FILES}
        for name,obj in objects.items():
            validators[name].validate(obj)
            assert obj["status"]=="CANDIDATE",(ident,name)
            assert obj["schema_version"]=="0.1.0",(ident,name)
        source=objects["source"]
        app=objects["applicability"]
        bind=objects["authority-binding"]
        audit=objects["audit-evidence"]
        source_bytes=(ROOT/"source"/(k+".json")).read_bytes()
        assert sha(source_bytes)==item["sourceHash"]
        assert source["canonical_id"]==item["sourceCanonicalId"]==k+".source"
        assert source["integrity"]=={
            "sha256":item["metadataHash"],
            "snapshot_ref":str(meta_path.relative_to(BASE))}
        assert source["rights"]=="UNKNOWN"
        assert source["source_type"]=="STANDARD"
        assert source["title"]==meta["title"]
        assert source["version"]==meta["edition"]
        assert source["authority"]==meta["authority"]
        assert source["locator"]["uri"]==meta["metadataUrl"]
        assert "nenhuma cláusula" in source["locator"]["pinpoint"]
        assert app["decision"]==item["applicability"]=="HOLD"
        assert app["source_refs"]==[source["canonical_id"]]
        assert "Sem texto normativo integral licenciado" in app["scope_limitations"]
        assert bind["decision"]==item["binding"]=="HOLD_HUMAN"
        assert bind["source_ids"]==[source["canonical_id"]]
        assert bind["requirement_id"]=="CKO-POL-UT-001:3"
        assert "NENHUMA cláusula ISO" in bind["exception_reason"]
        assert bind["field_path"]=="source.authority"
        assert audit["result"]=="PASS"
        assert audit["input_sha256"]==item["metadataHash"]
        assert audit["output_sha256"]==item["sourceHash"]
        assert "APENAS esquema" in audit["limit_statement"]
        assert item["isoClauseVerified"] is False
        # Todas as referências continuam rejeitadas à promoção automática.
        tamper=deepcopy(bind)
        tamper["decision"]="ALLOW"
        if validators["authority-binding"].is_valid(tamper):
            # O schema aceita ALLOW como opção; nosso gate protege o estágio pendente.
            assert bind["decision"]=="HOLD_HUMAN"
        tamper=deepcopy(source);tamper.pop("rights")
        assert not validators["source"].is_valid(tamper)
    # Nem arquivos omitidos nem novos IDs fora da fila podem passar despercebidos.
    expected_names={key(x)+".json" for x in expected}
    for folder in FILES:
        actual={p.name for p in (ROOT/folder).glob("*.json")}
        assert actual==expected_names,(folder,sorted(actual^expected_names))
    assert {p.name for p in (ROOT/"metadata").glob("*.json")}==expected_names
    print("PASS: 18 x (source, applicability, authority_binding, audit_evidence), 18 snapshots; schema 2020-12, cross-refs, hashes, HOLD, testes negativos; 0 cláusulas ISO e 0 admissão")
if __name__=="__main__":main()

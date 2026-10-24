#!/usr/bin/env python3
"""Materialização determinística de fontes ISO como CANDIDATAS, somente metadados internos.
Não acessa ISO, não afirma licença ou cláusula, não altera a política CKO.
"""
import json,hashlib,pathlib,re,datetime
from jsonschema import Draft202012Validator

R=pathlib.Path(__file__).resolve().parents[1]
C=R/'registers/governance/transversal-standards-candidates.v1.json'
P=R/'registers/pmo/queue.v1.json'
O=R/'registers/governance/transversal-source-instances'
DATE='2026-10-24'
SC={
 'source':'contracts/cko-schemas/source.schema.json',
 'applicability':'contracts/cko-schemas/applicability.schema.json',
 'binding':'contracts/cko-schemas/authority_binding.schema.json',
 'audit':'contracts/cko-schemas/audit_evidence.schema.json'}
def b(v):return (json.dumps(v,ensure_ascii=False,sort_keys=True,indent=2)+'\n').encode()
def h(x):return hashlib.sha256(x).hexdigest()
def save(rel,data):
 p=O/rel
 if p.exists():raise RuntimeError('HOLD duplicate '+str(p))
 p.parent.mkdir(parents=True,exist_ok=True)
 raw=b(data);p.write_bytes(raw)
 return raw
def main():
 if O.exists():raise SystemExit('HOLD: generation already exists, no overwrite')
 c=json.loads(C.read_text());p=json.loads(P.read_text())
 assert c['sourceContractReview']['materializationStatus']=='RUN_PENDING'
 assert c['version']=='0.1.2' and p['revision']==11
 assert len(c['standards'])==18 and len(c['coverageExpansion']['items'])==28
 assert len(c['coverageExpansion']['excludedByApplicability'])==1
 rows=[(x['id'],x['authority'],x['edition'],x['name'],x['officialMetadataUrl'],x['domains'])
      for x in c['standards'] if x['authority'] in ('ISO','ISO/IEC')]
 for x in c['coverageExpansion']['items']:
  if re.match(r'^ISO(?:/IEC)?\s',x['officialIdentifier']):
   rows.append((x['officialIdentifier'],'ISO/IEC' if x['officialIdentifier'].startswith('ISO/IEC') else 'ISO',
    x['officialIdentifier'].split(' ',1)[1],x['documentName'],x['officialSourceUrl'],[x['area']]))
 assert len(rows)==18 and [x[0] for x in rows]==c['sourceContractReview']['identifiers']
 sch={k:json.loads((R/v).read_text()) for k,v in SC.items()}
 for v in sch.values():Draft202012Validator.check_schema(v)
 files=[];record=[]
 for identifier,authority,edition,title,url,domains in rows:
  key=identifier if identifier.startswith('TRV-') else re.sub('[^A-Za-z0-9-]+','-',identifier).strip('-').upper()
  meta={'sourceKind':'LOCAL_CATALOG_TRANSCRIPTION_NOT_ISO_ORIGINAL',
    'originalCatalog':str(C.relative_to(R)),'catalogAsOf':c['asOf'],
    'identifier':identifier,'authority':authority,'edition':edition,'title':title,'metadataUrl':url,
    'materialActuallyInspected':'local versioned catalogue, not publisher HTML or licensed PDF',
    'notVerified':['publisher source bytes','specific ISO clause','standard current edition','reproduction license','ISO compliance']}
  raw=save('metadata/'+key+'.json',meta)
  snap=str((O/'metadata'/ (key+'.json')).relative_to(R))
  src={'schema_version':'0.1.0','canonical_id':key+'.source','version':edition,'status':'CANDIDATE','updated_at':DATE,
       'provenance_refs':[str(C.relative_to(R)),snap],
       'source_type':'STANDARD','title':title,'authority':authority,
       'locator':{'uri':url,'pinpoint':'Metadados do catálogo local; nenhuma cláusula da norma consultada'},
       'rights':'UNKNOWN','jurisdiction':'Internacional','retrieved_at':DATE,
       'integrity':{'sha256':h(raw),'snapshot_ref':snap}}
  Draft202012Validator(sch['source']).validate(src)
  invalid=dict(src);del invalid['rights']
  assert not Draft202012Validator(sch['source']).is_valid(invalid)
  sr=save('source/'+key+'.json',src)
  app={'schema_version':'0.1.0','canonical_id':key+'.applicability','version':'1.0.0',
       'status':'CANDIDATE','updated_at':DATE,'provenance_refs':[snap],
       'jurisdiction':'Brasil (avaliação do produto)',
       'population_ref':'calculadorasdeenfermagem.com.br',
       'indications':['Candidato a avaliação no domínio '+', '.join(domains)],
       'exclusions':['Nenhum requisito por cláusula ISO comprovado'],
       'decision':'HOLD','source_refs':[src['canonical_id']],
       'scope_limitations':['population_ref aponta apenas para o produto; substituir por referência canônica de população quando homologada',
         'Sem decisão formal de aplicabilidade/obrigatoriedade','Sem texto normativo integral licenciado']}
  Draft202012Validator(sch['applicability']).validate(app)
  save('applicability/'+key+'.json',app)
  binding={'schema_version':'0.1.0','canonical_id':key+'.authority-binding','version':'1.0.0',
       'status':'CANDIDATE','updated_at':DATE,'provenance_refs':['docs/CKO-POL-UT-001.md',snap],
       'field_path':'source.authority','requirement_id':'CKO-POL-UT-001:3',
       'source_ids':[src['canonical_id']],'authority_class':'TECHNICAL_STANDARD',
       'validity':{'jurisdiction':'Internacional (avaliação interna)','applicable_from':DATE},
       'decision':'HOLD_HUMAN',
       'exception_reason':'Somente vínculo estrutural ao parágrafo 3 da política interna, NENHUMA cláusula ISO comprovada; fonte e edição dependem de validação humana',
       'validator_ids':['scripts/materialize-transversal-iso.py'],'evidence_bundle_ids':[snap]}
  Draft202012Validator(sch['binding']).validate(binding)
  save('authority-binding/'+key+'.json',binding)
  ev={'schema_version':'0.1.0','canonical_id':key+'.audit-evidence','version':'1.0.0',
      'status':'CANDIDATE','updated_at':DATE,'provenance_refs':[snap,'scripts/materialize-transversal-iso.py'],
      'artifact_ref':str((O/'source'/ (key+'.json')).relative_to(R)),
      'validator_id':'scripts/materialize-transversal-iso.py',
      'test_case_id':'source-applicability-authority-binding-json-schema',
      'result':'PASS','run_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),
      'input_sha256':h(raw),'output_sha256':h(sr),'runner_version':'1.0.0',
      'limit_statement':'PASS APENAS esquema e hash de metadados locais. ISO integral/cláusulas não adquiridos. Applicability HOLD, binding HOLD_HUMAN; sem Kernel.'}
  Draft202012Validator(sch['audit']).validate(ev)
  save('audit-evidence/'+key+'.json',ev)
  record.append({'catalogIdentifier':identifier,'sourceCanonicalId':src['canonical_id'],
    'sourceJson':str((O/'source'/ (key+'.json')).relative_to(R)),
    'sourceHash':h(sr),'metadataHash':h(raw),'applicability':'HOLD','binding':'HOLD_HUMAN',
    'linkedPolicy':'CKO-POL-UT-001 §3 (política interna, NÃO ISO)','isoClauseVerified':False})
  files.append(key)
 report={'sourceRegistry':'registers/governance/transversal-standards-candidates.v1.json',
   'schemaRefs':SC,'generatedOn':DATE,'sourceCandidates':18,'heldApplicability':18,'heldStructuralBindings':18,
   'structuralAuditEvidence':18,'ISOClausesVerified':0,'kernelAdmission':False,
   'scopeLimit':'Evidência estrutural apenas; não certificado ISO nem extração de norma licenciada',
   'items':record}
 save('materialization-manifest.json',report)
 s=c['sourceContractReview']
 s.update({'materializationStatus':'CANDIDATES_MATERIALIZED','candidateSourceInstancesSchemaValidated':18,
 'candidateApplicabilityHeld':18,'candidateStructuralAuthorityBindingsHeld':18,
 'candidateAuditEvidenceSchemaValidated':18,'metadataSnapshotsHashed':18,
 'canonicalSourceInstancesVerified':0,'canonicalRequirementBindingsVerified':0,
 'normativeClauseTestsVerified':0,'admission':'NOT_ADMITTED'})
 c['summary']['sourceCandidatesSchemaValidated']=18;C.write_bytes(b(c))
 p['revision']=12;p['updatedOn']=DATE
 w=next(x for x in p['items'] if x['id']=='WO-GOV-TRANS-001')
 w['next']='18 fontes ISO candidatas e vínculos estruturais HOLD validados por schemas. Qualificar edição, direitos e fonte original; revisar população e requisitos por cláusula antes de qualquer admissão.'
 w['evidence']=list(dict.fromkeys(w['evidence']+['https://github.com/IndiciumFIN/dev-chatgpt-workspace/blob/main/registers/governance/transversal-source-instances/materialization-manifest.json']))
 w['updatedOn']=DATE
 p['events'].append({'seq':14,'workId':w['id'],'to':'IN_PROGRESS','date':DATE,
 'reason':'Materializados 18 conjuntos ISO: source candidatos, applicability HOLD, authority_binding HOLD_HUMAN e audit_evidence PASS estrutural; sem cláusulas/Kernel.'})
 P.write_bytes(b(p))
 print('PASS 18 fontes+18 aplicabilidades HOLD+18 vínculos HOLD_HUMAN+18 auditorias estruturais; 0 ISO clauses')
if __name__=='__main__':main()

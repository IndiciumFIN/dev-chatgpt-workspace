"""Synthetic-only negative tests for local SHA/offset reconciliation."""
from __future__ import annotations

import csv
import hashlib
import importlib.util
import io
import json
import pathlib
import unittest
import zipfile

ROOT=pathlib.Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('cko_local_audit',ROOT/'verify_local_capture.py')
mod=importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


def dump_csv(rows, fields, sep):
    b=io.StringIO(newline='')
    w=csv.DictWriter(b,fieldnames=fields,delimiter=sep,lineterminator='\n')
    w.writeheader();w.writerows(rows)
    return b.getvalue().encode('utf-8')


def fixture(*,mutate_derived=False,flag_verified=False,release_flag=False,bad_url=False):
    payloads={}
    reg=[]
    cross=[]
    groups={'429-2012':4,'514-2016':2,'736-2024':9,'754-2024':8}
    for version,count in groups.items():
        act='BR-COFEN-RES-'+version
        doc='DOC-'+act
        root=mod.PREFIX+'dados/'+act+'/'
        url=mod.SOURCE_DOCS[doc]
        raw=f'<html>FAKE DOCUMENT {version}</html>'.encode()
        raw_sha=hashlib.sha256(raw).hexdigest()
        fragments=[f'Art. {i}º conteúdo sintético.\n'.encode('utf-8') for i in range(1,count+1)]
        derived=b''.join(fragments)
        offsets={}
        ev_rows=[]
        claims=[]
        off=0
        for i,frag in enumerate(fragments,1):
            ev_id=f'EV-DOC-{version}-{i:03d}'
            offsets[ev_id]={'evidence_atom_id':ev_id,'utf8_byte_start':off,'utf8_byte_end':off+len(frag)}
            off+=len(frag)
            ev_rows.append({'evidence_atom_id':ev_id,'document_version_id':doc,
                            'fragment_sha256':hashlib.sha256(frag).hexdigest(),
                            'locator':f'Art. {i}º',
                            'verified_against_primary':flag_verified})
            cid=f'CLM-{version.split("-")[0]}-{i:03d}'
            claims.append({'claim_id':cid,'source_evidence_atom_ids':[ev_id],
                           'clinical_release_allowed':False,'status':'CANDIDATE'})
            cross.append({'claim_candidate_id':cid,'evidence_refs':ev_id,
                          'document_version_ids':doc,'clinical_release_allowed':
                          'true' if release_flag else 'false',
                          'canonical_claim_id':'','publication_decision':'HOLD'})
        raw_path=f'dados/{act}/raw/document.html'
        txt_path=f'dados/{act}/derivado/texto.txt'
        payloads[mod.PREFIX+raw_path]=raw
        payloads[mod.PREFIX+txt_path]=derived+b'!' if mutate_derived and version=='754-2024' else derived
        payloads[root+'acquisition.json']=json.dumps({
            'http_status':200,'error':None,'official_primary_url':
            'https://not-the-source.example/' if bad_url and version=='754-2024' else url,
            'raw_sha256':raw_sha}).encode()
        payloads[root+'extraction.json']=json.dumps({
            'official_primary_url':url,'raw_file':raw_path,
            'derived_text_file':txt_path,'raw_sha256':raw_sha,
            'derived_text_sha256':hashlib.sha256(derived).hexdigest(),
            'derived_text_bytes':len(derived)}).encode()
        payloads[root+'atoms/evidence_atoms.jsonl']='\n'.join(json.dumps(v,ensure_ascii=False) for v in ev_rows).encode('utf-8')
        payloads[root+'atoms/evidence_offsets.jsonl']='\n'.join(json.dumps(v) for v in offsets.values()).encode()
        payloads[root+'atoms/clinical_claims_candidates.jsonl']='\n'.join(json.dumps(v) for v in claims).encode()
        reg.append({'act_id':act,'official_primary_url':url,'raw_sha256':raw_sha})
    payloads[mod.PREFIX+'registros/00_source_registry.csv']=dump_csv(reg,
        ['act_id','official_primary_url','raw_sha256'],',')
    f=io.BytesIO()
    with zipfile.ZipFile(f,'w',compression=zipfile.ZIP_DEFLATED) as z:
        for name,data in payloads.items():z.writestr(name,data)
    c=dump_csv(cross,['claim_candidate_id','evidence_refs','document_version_ids',
                      'clinical_release_allowed','canonical_claim_id','publication_decision'],';')
    return f.getvalue(),c


def inspect_pair(a,c):
    return mod.inspect(a,c,hashlib.sha256(a).hexdigest(),hashlib.sha256(c).hexdigest())


class SourceBoundLocalAudit(unittest.TestCase):
    def test_all_synthetic_chains_pass_locally_without_any_release(self):
        a,c=fixture()
        rows,report=inspect_pair(a,c)
        self.assertEqual(len(rows),23)
        self.assertEqual(report['source_versions'],4)
        self.assertEqual(report['fragment_bytes_and_locator_consistency'],23)
        self.assertEqual(report['claims_historical_revoked_norm'],4)
        self.assertEqual(report['primary_semantic_independent_verifications'],0)
        self.assertFalse(report['global_admission_pass'])
        self.assertFalse(report['publication_allowed'])

    def test_malicious_true_verification_flag_is_never_trusted(self):
        a,c=fixture(flag_verified=True)
        rows,report=inspect_pair(a,c)
        self.assertEqual(report['primary_semantic_independent_verifications'],0)
        self.assertTrue(all(not r['primary_source_semantics_independently_reviewed'] for r in rows))

    def test_re_pinned_archive_cannot_hide_mutated_derived_text(self):
        a,c=fixture(mutate_derived=True)
        with self.assertRaisesRegex(mod.IntegrityHold,'derived text hash/length broken'):
            inspect_pair(a,c)

    def test_external_crosswalk_sha_pin_required(self):
        a,c=fixture()
        with self.assertRaisesRegex(mod.IntegrityHold,'external SHA-256 pin mismatch'):
            mod.inspect(a,c,hashlib.sha256(a).hexdigest(),'0'*64)

    def test_self_release_and_false_origin_url_are_rejected(self):
        for kwargs in ({'release_flag':True},{'bad_url':True}):
            with self.subTest(kwargs=kwargs),self.assertRaises(mod.IntegrityHold):
                inspect_pair(*fixture(**kwargs))

    def test_duplicate_legacy_claim_is_rejected(self):
        a,c=fixture()
        c=c.replace(b'CLM-429-002',b'CLM-429-001')
        with self.assertRaisesRegex(mod.IntegrityHold,'duplicate legacy claim IDs'):
            inspect_pair(a,c)

    def test_stale_zip_member_names_are_rejected(self):
        a,c=fixture()
        buff=io.BytesIO(a)
        with zipfile.ZipFile(buff,'a') as z:
            z.writestr(mod.PREFIX+'registros/00_source_registry.csv',b'forged')
        with self.assertRaisesRegex(mod.IntegrityHold,'duplicate-name'):
            inspect_pair(buff.getvalue(),c)

if __name__=='__main__':unittest.main()

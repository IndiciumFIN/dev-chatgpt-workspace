import csv, hashlib, json, re, sys, zipfile
from pathlib import Path

def verify(index, root):
    rows=list(csv.DictReader(Path(index).read_text(encoding='utf-8').splitlines()))
    if not rows or len({r['file'] for r in rows})!=len(rows):
        raise ValueError('Empty or duplicate manifest')
    results=[]
    for r in rows:
        name=r['file']; expected=r['sha256']; p=Path(root)/name
        if Path(name).name!=name or not re.fullmatch('[a-f0-9]{64}',expected):
            raise ValueError('Invalid manifest entry')
        item={'file':name,'expected_sha256':expected,'disposition':r['disposition'],'status':'HOLD','entries':0}
        try:
            with p.open('rb') as f: actual=hashlib.file_digest(f,'sha256').hexdigest()
            with zipfile.ZipFile(p) as z:
                item['entries']=len(z.infolist()); item['crc_ok']=z.testzip() is None
            item['actual_sha256']=actual
            item['status']='PASS' if actual==expected and item['crc_ok'] else 'FAIL'
        except (OSError,zipfile.BadZipFile,RuntimeError) as exc:
            item['error_type']=type(exc).__name__
        results.append(item)
    return {'total':len(results),'pass':sum(r['status']=='PASS' for r in results),'entries':sum(r['entries'] for r in results),'results':results,'scope':'Archive hash and CRC only; not content authority or restoration.'}

if __name__=='__main__':
    result=verify(sys.argv[1],sys.argv[2]); print(json.dumps(result,indent=2)); sys.exit(0 if result['pass']==result['total'] else 1)

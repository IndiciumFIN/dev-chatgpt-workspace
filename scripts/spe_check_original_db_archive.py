#!/usr/bin/env python3
"""Source-only inspection, does not connect to a database."""
import hashlib,json,re,sys,zipfile
def inspect(path):
 with open(path,"rb") as f: digest=hashlib.sha256(f.read()).hexdigest()
 with zipfile.ZipFile(path) as z:
  crc=z.testzip()
  migrations=sorted(n for n in z.namelist() if re.search(r"/supabase/migration_sources/[0-9]{4}_[^/]+[.]sql$",n))
  tests=sorted(n for n in z.namelist() if re.search(r"/supabase/tests/database/[0-9]{3}_[^/]+[.]test[.]sql$",n))
  numbers=[int(n.rsplit("/",1)[-1][:4]) for n in migrations]
  sql=[z.read(n).decode("utf-8") for n in migrations]
  test_sql=[z.read(n).decode("utf-8") for n in tests]
  return {"source_sha256":digest,"zip_crc_pass":crc is None,"migration_count":len(migrations),
    "migration_sequence_0001_0047":numbers==list(range(1,48)),
    "test_count":len(tests),
    "tests_have_plan":all(re.search(r"select\s+plan\([0-9]+\)",s,re.I) for s in test_sql),
    "tests_have_rollback":all(re.search(r"\brollback\s*;",s,re.I) for s in test_sql),
    "security_definer_occurrences":sum(len(re.findall(r"\bsecurity\s+definer\b",s,re.I)) for s in sql),
    "postgres_execution":"NOT_RUN"}
if __name__=="__main__":
 if len(sys.argv)!=2:raise SystemExit("Usage: spe_check_original_db_archive.py original-v1.4.0.zip")
 print(json.dumps(inspect(sys.argv[1]),indent=2))

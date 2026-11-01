#!/usr/bin/env python3
"""Candidate SQL structure check. Never connects to a database."""
from pathlib import Path
import json,re
sql=(Path(__file__).resolve().parents[1]/"migrations/candidate/vila/0002_vila_canonical_full_candidate.sql").read_text()
tables=re.findall(r"CREATE TABLE vila_canonical_candidate\.([a-z_]+)",sql)
refs=re.findall(r"REFERENCES vila_canonical_candidate\.([a-z_]+)",sql)
result={"table_count":len(tables),"fk_reference_count":len(refs),"missing_fk_targets":sorted(set(refs)-set(tables)),"duplicate_tables":len(set(tables))!=len(tables),"rls_enable_present":"ENABLE ROW LEVEL SECURITY" in sql,"revokes_public_present":"REVOKE ALL ON ALL TABLES IN SCHEMA vila_canonical_candidate" in sql,"sql_executed":False}
print(json.dumps(result,indent=2))
assert len(tables)==22 and not result["missing_fk_targets"] and not result["duplicate_tables"]
assert result["rls_enable_present"] and result["revokes_public_present"]

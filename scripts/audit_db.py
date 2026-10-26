"""Audita as chaves do banco depois que o relatório foi gerado."""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPORT = ROOT / "artifacts" / "db-audit.json"
MIGRATIONS = ROOT / "migrations"

REQUIRED = [
    "content_place_object_fkey",
    "content_place_section_slug_fkey",
    "content_place_inst_path_fkey",
    "screen_dest_place_id_fkey",
    "screen_dest_tool_fkey",
    "tool_formula_tool_fkey",
    "chrome_label_locale_fkey",
    "content_text_locale_fkey",
    "content_alias_locale_fkey",
    "nav_item_parent_fkey",
    "nav_item_dest_fkey",
    "section_link_dest_fkey",
    "catalog_item_dest_fkey",
    "inst_child_child_fkey",
    "member_user_fkey",
    "subscription_user_fkey",
    "community_post_user_fkey",
]

failures = []

for path in sorted(MIGRATIONS.glob("*.sql")):
    body = re.sub(r"--.*$", "", path.read_text(encoding="utf-8"), flags=re.M)
    if re.search(r"\bjsonb\b|\bjson\b|\[\]", body, re.I):
        failures.append(f"{path.name}: lista ou JSON")
    if re.search(r"create table", body, re.I) and not re.search(r"primary key", body, re.I):
        failures.append(f"{path.name}: tabela sem chave primária")

proof = (ROOT / "it-book" / "docs" / "normalizacao.md").read_text(encoding="utf-8")
for path in sorted(MIGRATIONS.glob("*.sql")):
    for name in re.findall(r"create table if not exists \"?(\w+)\"?", path.read_text(encoding="utf-8"), re.I):
        if f"| {name} |" not in proof:
            failures.append(f"normalização sem {name}")

if not REPORT.exists():
    failures.append("relatório ausente")
else:
    report = json.loads(REPORT.read_text(encoding="utf-8"))
    present = set(report["constraints"])
    for name in REQUIRED:
        if name not in present:
            failures.append(f"falta a chave {name}")
    for row in report["orphans"]:
        if row["n"] != 0:
            failures.append(f"{row['check_id']}: {row['n']}")
    if report["counts"]["places"] < 1 or report["counts"]["dests"] < 1:
        failures.append("lugar ou destino vazio")
    if report["counts"]["relations"] < 11:
        failures.append("dicionário de relações incompleto")

if failures:
    print("\n".join(failures))
    sys.exit(1)
print(f"auditoria ok: {len(REQUIRED)} chaves e zero órfãos")

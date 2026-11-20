#!/usr/bin/env python3
"""Migra o inventário e grava a revisão automática de cada caminho.

A máquina confere o hash do arquivo com o hash do inventário. Conferido não é
aprovação humana e não altera review_item. Hash diferente fica DIVERGENTE.
Arquivo sem blob fica AUSENTE. Segredo fica SEGREDO. Nada disso autoriza produção.
"""

from __future__ import annotations

import argparse
import importlib.util
import json
import subprocess
import sys
from collections import Counter
from pathlib import Path

VEREDITOS = ("CONFERIDO", "DIVERGENTE", "AUSENTE", "SEGREDO")
REVISOR = "migrar-com-revisao.py"


def load_migracao():
    path = Path(__file__).with_name("migrar-canonico.py")
    spec = importlib.util.spec_from_file_location("migrar_canonico", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def secret(path: str) -> bool:
    return path == ".env" or path.endswith("/.env") or "/.env." in f"/{path}"


def hash_existing(repo: Path, paths: list[str]) -> dict[str, str]:
    if not paths:
        return {}
    result = subprocess.run(
        ["git", "-C", str(repo), "hash-object", "--stdin-paths"],
        input="\n".join(paths) + "\n",
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=True,
    )
    hashes = result.stdout.splitlines()
    if len(hashes) != len(paths):
        raise SystemExit("hash-object devolveu quantidade diferente de caminhos")
    return dict(zip(paths, hashes))


def write_sql(path: Path, rows: list[tuple[str, str, str, str, str]]) -> None:
    quote = lambda value: "'" + value.replace("'", "''") + "'"
    lines = [
        "-- Revisao automatica por hash. Nao e aprovacao humana.\n",
        "create table if not exists canonical_auto_review (\n",
        "  path text primary key,\n",
        "  veredito text not null check (veredito in ('CONFERIDO','DIVERGENTE','AUSENTE','SEGREDO')),\n",
        "  blob_esperado text not null,\n",
        "  blob_encontrado text not null default '',\n",
        "  regra text not null,\n",
        "  revisor text not null default 'migrar-com-revisao.py'\n",
        "    check (revisor = 'migrar-com-revisao.py'),\n",
        "  revisao_humana boolean not null default false check (revisao_humana = false)\n",
        ");\n",
    ]
    chunk: list[str] = []

    def flush() -> None:
        if not chunk:
            return
        lines.append(
            "insert into canonical_auto_review (path, veredito, blob_esperado, blob_encontrado, regra) values\n"
            + ",\n".join(chunk)
            + "\non conflict (path) do nothing;\n"
        )
        chunk.clear()

    for item in rows:
        chunk.append("(" + ", ".join(quote(part) for part in item) + ")")
        if len(chunk) == 300:
            flush()
    flush()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("".join(lines))


def main() -> int:
    mig = load_migracao()
    parser = argparse.ArgumentParser(description="Migra e revisa automaticamente pelo hash do inventário.")
    parser.add_argument("--repo", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--inventario", type=Path, required=True)
    parser.add_argument("--relatorio", type=Path, default=None)
    parser.add_argument("--sql", type=Path, default=None)
    parser.add_argument("--aplicar", action="store_true")
    args = parser.parse_args()
    repo = args.repo.resolve()
    inventory = mig.load_inventory(args.inventario)
    sources = mig.blob_sources(repo)

    pending: dict[str, list[tuple[str, str]]] = {}
    present = [row["path"] for row in inventory if (repo / row["path"]).is_file() and not secret(row["path"])]
    found = hash_existing(repo, present)

    if args.aplicar:
        for row in inventory:
            path = row["path"]
            sha = row["git_blob_sha1"]
            if secret(path) or found.get(path) == sha or (path in found and found[path] != sha):
                continue
            if sha in sources and not (repo / path).exists():
                pending.setdefault(sha, []).append((path, row.get("mode", "100644")))
        for sha, targets in pending.items():
            mig.write_blob(repo, sha, [(mig.safe_target(repo, path), mode) for path, mode in targets])
        written = [path for targets in pending.values() for path, _mode in targets]
        found.update(hash_existing(repo, written))

    rows: list[tuple[str, str, str, str, str]] = []
    for row in inventory:
        path = row["path"]
        expected = row["git_blob_sha1"]
        if secret(path):
            rows.append((path, "SEGREDO", expected, "", "caminho de segredo nao e migrado nem conferido"))
            continue
        actual = found.get(path, "")
        if actual == expected:
            rows.append((path, "CONFERIDO", expected, actual, "hash do arquivo igual ao hash do inventario"))
        elif actual:
            rows.append((path, "DIVERGENTE", expected, actual, "hash local diferente; nenhum vencedor foi escolhido"))
        elif expected in sources:
            rows.append((path, "AUSENTE", expected, "", "blob existe no clone, mas o arquivo nao foi gravado"))
        else:
            rows.append((path, "AUSENTE", expected, "", "blob nao existe em nenhuma branch; o corpo nao foi inventado"))

    counts = Counter(veredito for _path, veredito, *_rest in rows)
    report = {
        "inventario": len(rows),
        "vereditos": {name: counts.get(name, 0) for name in VEREDITOS},
        "revisor": REVISOR,
        "revisao_humana": False,
        "aprovacao_clinica": False,
        "completo": counts.get("DIVERGENTE", 0) == 0 and counts.get("AUSENTE", 0) == 0 and counts.get("SEGREDO", 0) == 0,
    }
    destination = args.relatorio or (repo / "audit/canonical-local/revisao-automatica.json")
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    if args.sql:
        write_sql(args.sql, rows)
    print(json.dumps(report, ensure_ascii=False))
    return 0 if report["completo"] else 2


if __name__ == "__main__":
    sys.exit(main())

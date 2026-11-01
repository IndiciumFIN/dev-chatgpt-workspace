#!/usr/bin/env python3
"""Migra o inventário do backup para esta árvore, sem promover revisão.

Recupera somente o arquivo ausente cujo blob Git já está neste clone.
Não sobrescreve caminho com hash diferente. Não apaga arquivo que só existe
aqui. Não marca revisado, não envia ao remoto e não altera o Supabase.

Saída 0 quando não falta nada recuperável. Saída 2 quando ainda há arquivo
sem blob ou com hash divergente: a migração rodou, mas não está fechada.
"""

from __future__ import annotations

import argparse
import codecs
import csv
import json
import os
import stat
import subprocess
import sys
import zipfile
from collections import Counter
from pathlib import Path

PRECEDENCIA = (
    "origin/integration/structural-overlay-20261101",
    "origin/main",
    "origin/import/drive-cko-nurseos-20261026",
    "origin/feat/projection-unica-f0-suite-real",
)


def unquote(path: str) -> str:
    if path.startswith('"') and path.endswith('"'):
        return codecs.decode(path[1:-1], "unicode_escape").encode("latin1").decode()
    return path


def git(repo: Path, *args: str, input_bytes: bytes | None = None) -> bytes:
    result = subprocess.run(
        ["git", "-C", str(repo), *args],
        input=input_bytes,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=True,
    )
    return result.stdout


def local_tree(repo: Path) -> dict[str, str]:
    files: dict[str, str] = {}
    for line in git(repo, "ls-tree", "-r", "HEAD").decode(errors="replace").splitlines():
        meta, path = line.split("\t", 1)
        mode, kind, sha = meta.split()
        if kind == "blob":
            files[unquote(path)] = sha
    return files


def load_inventory(path: Path) -> list[dict[str, str]]:
    if path.suffix == ".zip":
        with zipfile.ZipFile(path) as archive:
            name = next(n for n in archive.namelist() if n.endswith("archive_files.csv"))
            text = archive.read(name).decode()
        return list(csv.DictReader(text.splitlines()))
    with path.open(newline="") as handle:
        return list(csv.DictReader(handle))


def safe_target(repo: Path, relative: str) -> Path:
    if relative.startswith("/") or relative.startswith("\\") or "\x00" in relative:
        raise SystemExit(f"caminho recusado: {relative}")
    parts = Path(relative).parts
    if ".." in parts:
        raise SystemExit(f"caminho recusado: {relative}")
    target = (repo / relative).resolve()
    if not str(target).startswith(str(repo.resolve()) + os.sep):
        raise SystemExit(f"caminho fora do repositorio: {relative}")
    return target


def blob_sources(repo: Path) -> dict[str, str]:
    branches = [
        line.strip()
        for line in git(repo, "for-each-ref", "--format=%(refname:short)", "refs/remotes/origin")
        .decode()
        .splitlines()
        if line.strip() and line.strip() != "origin"
    ]
    ordered = [name for name in PRECEDENCIA if name in branches]
    ordered += sorted(set(branches) - set(ordered))
    found: dict[str, str] = {}
    for branch in ordered:
        for line in git(repo, "ls-tree", "-r", branch).decode(errors="replace").splitlines():
            meta, _path = line.split("\t", 1)
            _mode, kind, sha = meta.split()
            if kind == "blob" and sha not in found:
                found[sha] = branch.removeprefix("origin/")
    return found


def write_blob(repo: Path, sha: str, targets: list[tuple[Path, str]]) -> None:
    content = git(repo, "cat-file", "blob", sha)
    first = targets[0][0]
    first.parent.mkdir(parents=True, exist_ok=True)
    first.write_bytes(content)
    for target, _mode in targets[1:]:
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(content)
    for target, mode in targets:
        if mode.endswith("755"):
            target.chmod(target.stat().st_mode | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)


def sql_quote(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def main() -> int:
    parser = argparse.ArgumentParser(description="Migra o inventário do backup para a árvore local.")
    parser.add_argument("--repo", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--inventario", type=Path, required=True)
    parser.add_argument("--relatorio", type=Path, default=None)
    parser.add_argument("--sql", type=Path, default=None)
    parser.add_argument("--aplicar", action="store_true", help="Grava os arquivos recuperáveis. Sem isto, só conta.")
    args = parser.parse_args()
    repo = args.repo.resolve()
    inventory = load_inventory(args.inventario)
    local = local_tree(repo)
    sources = blob_sources(repo)

    recovered: list[tuple[str, str, str]] = []
    divergent: list[tuple[str, str, str]] = []
    missing_blob: list[str] = []
    already = 0
    skipped_secret = 0
    by_sha: dict[str, list[tuple[str, str]]] = {}

    for row in inventory:
        path = row["path"]
        sha = row["git_blob_sha1"]
        mode = row.get("mode", "100644")
        if path == ".env" or path.endswith("/.env") or "/.env." in f"/{path}":
            skipped_secret += 1
            continue
        current = local.get(path)
        if current == sha:
            already += 1
            continue
        if current is not None:
            divergent.append((path, sha, current))
            continue
        if sha not in sources:
            missing_blob.append(path)
            continue
        by_sha.setdefault(sha, []).append((path, mode))

    if args.aplicar:
        for sha, targets in by_sha.items():
            paths = [(safe_target(repo, path), mode) for path, mode in targets]
            write_blob(repo, sha, paths)
            branch = sources[sha]
            for path, _mode in targets:
                recovered.append((path, sha, branch))

    report = {
        "inventario": len(inventory),
        "ja_iguais": already,
        "recuperaveis": sum(len(v) for v in by_sha.values()),
        "recuperados": len(recovered),
        "hash_divergente_nao_sobrescrito": len(divergent),
        "sem_blob": len(missing_blob),
        "segredo_ignorado": skipped_secret,
        "revisado": False,
        "completo": len(divergent) == 0 and len(missing_blob) == 0,
        "aplicar": args.aplicar,
    }
    destination = args.relatorio or (repo / "audit/canonical-local/migracao-relatorio.json")
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps(report, ensure_ascii=False))
    print("sem_blob_por_pasta", Counter(path.split("/")[0] for path in missing_blob).most_common(8))

    if args.aplicar and args.sql:
        lines = [
            "-- Arquivos recuperados do blob ja presente no clone. Nao revisado.\n",
            "create table if not exists canonical_migration_recovered (\n",
            "  path text primary key,\n",
            "  blob text not null,\n",
            "  origem text not null,\n",
            "  revisado boolean not null default false check (revisado = false)\n",
            ");\n",
        ]
        chunk: list[str] = []

        def flush() -> None:
            if not chunk:
                return
            lines.append(
                "insert into canonical_migration_recovered (path, blob, origem) values\n"
                + ",\n".join(chunk)
                + "\non conflict (path) do nothing;\n"
            )
            chunk.clear()

        for path, sha, branch in recovered:
            chunk.append(f"({sql_quote(path)}, {sql_quote(sha)}, {sql_quote(branch)})")
            if len(chunk) == 300:
                flush()
        flush()
        args.sql.parent.mkdir(parents=True, exist_ok=True)
        args.sql.write_text("".join(lines))

    return 0 if report["completo"] else 2


if __name__ == "__main__":
    sys.exit(main())

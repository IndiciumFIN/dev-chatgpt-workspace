#!/usr/bin/env python3
"""Baixa o TAR do backup e só aceita se o conteúdo bater com o inventário.

Não existe URL publicada. O GitHub, o Drive e o disco desta sessão não tinham
o arquivo. Passe --url, ou deixe o script achar uma cópia local ou um asset
de release com o nome esperado. Sem isso, ele para.

Depois do download, compara os caminhos com archive_files.csv. São 16.433
arquivos e 318.419.740 bytes descompactados no parecer de 2026-11-01. O
.binário do .tar.gz em si não tem hash certificado. .env não é extraído.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import subprocess
import sys
import tarfile
import zipfile
from pathlib import Path

ESPERADOS = (
    "sandbox-completo (4).tar.gz",
    "sandbox-completo (4).tar(2).gz",
)
ARQUIVOS = 16433
BYTES = 318419740
REPO_GITHUB = "IndiciumFIN/dev-chatgpt-workspace"


def inventario(path: Path) -> dict[str, dict[str, str]]:
    if path.suffix == ".zip":
        with zipfile.ZipFile(path) as archive:
            name = next(item for item in archive.namelist() if item.endswith("archive_files.csv"))
            text = archive.read(name).decode()
        rows = csv.DictReader(text.splitlines())
    else:
        with path.open(newline="") as handle:
            rows = csv.DictReader(handle)
    return {row["path"]: row for row in rows}


def copia_local(raiz: Path) -> Path | None:
    candidatos = [
        raiz / "backup" / nome for nome in ESPERADOS
    ] + [
        Path("/workspace/attachments") / nome for nome in ESPERADOS
    ]
    for candidato in candidatos:
        if candidato.is_file() and candidato.stat().st_size > 0:
            return candidato
    return None


def asset_de_release() -> str | None:
    result = subprocess.run(
        ["gh", "release", "list", "--repo", REPO_GITHUB, "--json", "tagName,assets", "--limit", "20"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    if result.returncode != 0 or not result.stdout.strip():
        return None
    for release in json.loads(result.stdout):
        for asset in release.get("assets") or []:
            if asset.get("name") in ESPERADOS:
                return asset["url"]
    return None


def baixar(url: str, destino: Path) -> None:
    destino.parent.mkdir(parents=True, exist_ok=True)
    parcial = destino.with_suffix(destino.suffix + ".parcial")
    comando = ["curl", "-fL", "--retry", "3", "--continue-at", "-", "-o", str(parcial), url]
    subprocess.run(comando, check=True)
    parcial.replace(destino)


def segredo(caminho: str) -> bool:
    return caminho == ".env" or caminho.endswith("/.env") or "/.env." in f"/{caminho}"


def conferir(arquivo: Path, tabela: dict[str, dict[str, str]]) -> dict[str, int]:
    with tarfile.open(arquivo, "r:*") as pacote:
        membros = [item for item in pacote.getmembers() if item.isfile()]
        nomes = []
        tamanho = 0
        for item in membros:
            nome = item.name.lstrip("./")
            if nome.startswith("sandbox-completo/") or nome.startswith("workspace/"):
                nome = nome.split("/", 1)[1]
            nomes.append(nome)
            tamanho += item.size
    iguais = sum(1 for nome in nomes if nome in tabela)
    return {
        "membros": len(membros),
        "bytes": tamanho,
        "caminhos_no_inventario": iguais,
        "fora_do_inventario": len(nomes) - iguais,
        "inventario_ausente_no_tar": len(tabela) - iguais,
    }


def extrair_ausentes(arquivo: Path, tabela: dict[str, dict[str, str]], repo: Path, presentes: set[str]) -> int:
    gravados = 0
    with tarfile.open(arquivo, "r:*") as pacote:
        for item in pacote.getmembers():
            if not item.isfile():
                continue
            nome = item.name.lstrip("./")
            if "/" in nome and nome.split("/", 1)[0] in {"sandbox-completo", "workspace"}:
                nome = nome.split("/", 1)[1]
            if segredo(nome) or nome not in tabela or nome in presentes:
                continue
            extraido = pacote.extractfile(item)
            if extraido is None:
                continue
            conteudo = extraido.read()
            blob = hashlib.sha1(b"blob %d\0" % len(conteudo) + conteudo).hexdigest()
            digest = hashlib.sha256(conteudo).hexdigest()
            linha = tabela[nome]
            if blob != linha["git_blob_sha1"] or digest != linha["sha256"]:
                continue
            destino = (repo / nome).resolve()
            if not str(destino).startswith(str(repo.resolve()) + "/"):
                continue
            destino.parent.mkdir(parents=True, exist_ok=True)
            destino.write_bytes(conteudo)
            gravados += 1
    return gravados


def principais(repo: Path) -> set[str]:
    result = subprocess.run(
        ["git", "-C", str(repo), "ls-files"],
        stdout=subprocess.PIPE,
        text=True,
        check=True,
    )
    return set(result.stdout.splitlines())


def main() -> int:
    parser = argparse.ArgumentParser(description="Baixa o TAR do backup e confere o inventário.")
    parser.add_argument("--repo", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--url", default="")
    parser.add_argument("--inventario", type=Path, required=True)
    parser.add_argument("--destino", type=Path, default=None)
    parser.add_argument("--extrair-ausentes", action="store_true")
    args = parser.parse_args()
    repo = args.repo.resolve()
    destino = (args.destino or (repo / "backup" / ESPERADOS[0])).resolve()
    tabela = inventario(args.inventario)
    if len(tabela) != ARQUIVOS:
        raise SystemExit(f"inventario tem {len(tabela)} caminhos; o parecer registra {ARQUIVOS}")

    origem = args.url or asset_de_release()
    if origem:
        print("baixando", origem)
        baixar(origem, destino)
    else:
        achado = copia_local(repo)
        if achado is None:
            print("TAR nao publicado. Passe --url. Nomes aceitos:", ", ".join(ESPERADOS))
            return 2
        destino = achado
        print("usando copia local", destino)

    resumo = conferir(destino, tabela)
    resumo["bytes_esperados"] = BYTES
    resumo["bytes_batem"] = resumo["bytes"] == BYTES
    resumo["arquivos_batem"] = resumo["membros"] == ARQUIVOS and resumo["inventario_ausente_no_tar"] == 0
    if args.extrair_ausentes and resumo["arquivos_batem"]:
        resumo["extraidos"] = extrair_ausentes(destino, tabela, repo, principais(repo))
    elif args.extrair_ausentes:
        resumo["extraidos"] = 0
        print("extracao recusada: o TAR nao bate com o inventario")
    print(json.dumps(resumo, ensure_ascii=False))
    return 0 if resumo["arquivos_batem"] else 2


if __name__ == "__main__":
    sys.exit(main())

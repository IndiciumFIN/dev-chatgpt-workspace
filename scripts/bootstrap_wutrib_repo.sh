#!/usr/bin/env bash
# WO WUTRIB-WO-PLAN-016: bootstrap privado, isolado e assistido.
# Requer git/gh no computador autenticado com permissão de criar repositórios.
set -euo pipefail
OWNER=IndiciumFIN
SOURCE=dev-chatgpt-workspace
TARGET=wutrib-auditor
BRANCH=wutrib/demo-persistence-v04-20261108
for binary in git gh; do command -v "$binary" >/dev/null || { echo "Falta $binary" >&2; exit 1; }; done
gh auth status >/dev/null 2>&1 || { echo 'Faça gh auth login primeiro' >&2; exit 1; }
if gh repo view "$OWNER/$TARGET" >/dev/null 2>&1; then
  echo "O destino $OWNER/$TARGET já existe; não será sobrescrito" >&2
  exit 1
fi
umask 077
DIR="$(mktemp -d)"
trap 'rm -rf "$DIR"' EXIT
git clone --quiet --no-tags --single-branch --branch "$BRANCH" "https://github.com/$OWNER/$SOURCE.git" "$DIR/repo"
cd "$DIR/repo"
SHA="$(git rev-parse HEAD)"
# A origem tem somente a árvore WU-TRIB, mas verifique os caminhos antes de publicar.
if find . -type f -not -path './.git/*' | grep -E -i 'calculadorasdeenfermagem|\.env$|\.pem$'; then
  echo 'Arquivo proibido encontrado. Migração cancelada' >&2;exit 1
fi
rm -rf .git
git init -q -b main
printf '%s\n' "# WU-TRIB origem: IndiciumFIN/$SOURCE" "" "Commit de referência: $SHA" "WO: WUTRIB-WO-PLAN-016" > ORIGIN_PROVENANCE.md
git add -A
git -c user.name="WU-TRIB Bootstrap" -c user.email="noreply@users.noreply.github.com" commit -q -m "chore(wutrib): independent candidate snapshot of $SHA"
gh repo create "$OWNER/$TARGET" --private --description "WU-TRIB | auditor fiscal demonstrativo independente do CE" --source . --remote origin --push
echo "Destino privado criado: https://github.com/$OWNER/$TARGET"
echo 'Rever Branch Protection, secrets, e CI antes de conectar o Vercel.'

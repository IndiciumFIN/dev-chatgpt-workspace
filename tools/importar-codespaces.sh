#!/usr/bin/env bash
# Importação inicial sem checkout local, sem branches adicionais e sem --force.
set -euo pipefail

REMOTE="https://github.com/IndiciumFIN/dev-chatgpt-workspace.git"
EXPECTED_ZIP_SHA256="9a4233b6160a0009de3c20c962cc78297763ab9b8675038215b56815682823ae"
EXPECTED_HEAD="8a384c6d5b70d91cbeda6adb272584c7df288731"
ARCHIVE="${1:-WORKSPACE-chatgpt-IMPORTACAO-2026-10-23.zip}"

die() { printf 'BLOQUEADO: %s\n' "$*" >&2; exit 1; }
for binary in git unzip sha256sum mktemp; do
  command -v "$binary" >/dev/null 2>&1 || die "Ferramenta necessária ausente: $binary"
done
[[ -f "$ARCHIVE" ]] || die "ZIP não encontrado: $ARCHIVE. Envie o ZIP no Explorer do Codespaces."
actual_zip_sha="$(sha256sum "$ARCHIVE" | awk '{print $1}')"
[[ "$actual_zip_sha" == "$EXPECTED_ZIP_SHA256" ]] || die "Checksum ZIP divergente: $actual_zip_sha"
echo "OK: arquivo original validado pelo SHA-256."

[[ -d .git ]] || die "Abra o terminal na raiz do Codespace deste repositório."
current_origin="$(git remote get-url origin 2>/dev/null || true)"
case "$current_origin" in
  "$REMOTE"|"https://github.com/IndiciumFIN/dev-chatgpt-workspace"|"git@github.com:IndiciumFIN/dev-chatgpt-workspace.git"|"git@github.com:IndiciumFIN/dev-chatgpt-workspace") ;;
  *) die "Este Codespace não pertence ao repositório autorizado ($current_origin)" ;;
esac
[[ "$(git branch --show-current)" == "main" ]] || die "O Codespace deve estar na main do repositório de destino."
[[ -z "$(git status --porcelain --untracked-files=no)" ]] || die "O Codespace tem alterações em arquivos versionados; interrompendo."

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
unzip -q "$ARCHIVE" -d "$tmp" || die "ZIP não pôde ser extraído."
src="$tmp/branch-bibliotecas"
[[ -d "$src/.git" ]] || die "Histórico Git não está presente no pacote."
[[ "$(git -C "$src" rev-parse HEAD)" == "$EXPECTED_HEAD" ]] || die "Commit HEAD não corresponde ao esperado."
[[ "$(git -C "$src" branch --show-current)" == "dev/bibliotecas" ]] || die "Branch local do pacote inesperada."
[[ "$(git -C "$src" rev-list --count HEAD)" == "5" ]] || die "Número de commits originais diferente de cinco."
[[ -z "$(git -C "$src" status --porcelain)" ]] || die "Pacote contém alterações Git pendentes."
[[ "$(git -C "$src" remote get-url origin)" == "$REMOTE" ]] || die "Remote do pacote divergente."
echo "OK: cinco commits originais íntegros, HEAD $EXPECTED_HEAD."

# Não alteramos main com --force. Criamos um commit de integração com dois pais,
# preservando os cinco commits originais como segundo pai do merge.
remote_heads="$(git ls-remote --heads "$REMOTE")" || die "Não foi possível consultar o GitHub."
[[ "$(printf '%s\n' "$remote_heads" | grep -c 'refs/heads/' || true)" == "1" ]] || die "Há quantidade inesperada de branches remotas."
remote_sha="$(printf '%s\n' "$remote_heads" | awk '$2 == "refs/heads/main" {print $1}')"
[[ -n "$remote_sha" ]] || die "main remota não encontrada."
local_sha="$(git rev-parse HEAD)"
[[ "$local_sha" == "$remote_sha" ]] || die "A main mudou no GitHub desde que este Codespace foi criado."

git -C "$src" fetch --no-tags origin main >/dev/null
fetched="$(git -C "$src" rev-parse FETCH_HEAD)"
[[ "$fetched" == "$remote_sha" ]] || die "main remota mudou durante a verificação."
tree="$(git -C "$src" rev-parse "HEAD^{tree}")"
integration="$(
  GIT_AUTHOR_NAME="ChatGPT Workspace Import" \
  GIT_AUTHOR_EMAIL="noreply@users.noreply.github.com" \
  GIT_COMMITTER_NAME="ChatGPT Workspace Import" \
  GIT_COMMITTER_EMAIL="noreply@users.noreply.github.com" \
  git -C "$src" commit-tree "$tree" \
    -p "$remote_sha" \
    -p "$EXPECTED_HEAD" \
    -m "chore(import): integrar cinco commits auditados ao workspace exclusivo"
)"
[[ "$(git -C "$src" rev-parse "$integration^1")" == "$remote_sha" ]] || die "Pai remoto do commit de integração divergente."
[[ "$(git -C "$src" rev-parse "$integration^2")" == "$EXPECTED_HEAD" ]] || die "Pai original do commit de integração divergente."
echo "Enviando integração sem --force e sem criar branches..."
git -C "$src" push origin "$integration:refs/heads/main" || die "O GitHub rejeitou o push; nenhum force foi usado."
echo "IMPORTAÇÃO CONCLUÍDA: cinco commits originais preservados e main atualizada por fast-forward."
echo "Commit de integração: $integration"

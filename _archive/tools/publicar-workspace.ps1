# Importacao inicial exclusiva do workspace privado. Nao cria branches adicionais.
# Executar NA RAIZ deste pacote apos autenticar o Git local no GitHub.
$ErrorActionPreference = 'Stop'
$Repo = 'https://github.com/IndiciumFIN/dev-chatgpt-workspace.git'
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw 'Git nao encontrado. Instale Git for Windows ou use um terminal com git.' }
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw 'Node.js 22 nao encontrado; instale a versao requerida antes de importar.' }
$major = (& node -p 'process.versions.node.split(".")[0]').Trim()
if ($major -ne '22') { throw "Node.js $major detectado; use Node.js 22 para o preflight." }
if (-not (Test-Path '.git')) { throw 'Execute na pasta extraida branch-bibliotecas que contem .git.' }
$current = (& git rev-parse --abbrev-ref HEAD).Trim()
if ($LASTEXITCODE -ne 0 -or $current -ne 'dev/bibliotecas') { throw "Branch local inesperada ($current); importacao bloqueada." }
if ((& git status --porcelain).Length -gt 0) { throw 'Ha mudancas locais: commit ou rever antes de importar.' }
& node scripts/check-generated-fresh.mjs
if ($LASTEXITCODE -ne 0) { throw 'Gate de frescor reprovado.' }
& node scripts/check-cko-packages.mjs
if ($LASTEXITCODE -ne 0) { throw 'Gate de pacotes CKO reprovado.' }
& node scripts/check-contract-coverage.mjs
if ($LASTEXITCODE -ne 0) { throw 'Gate de cobertura reprovado.' }
$remoteOut = @(& git remote get-url origin 2>$null)
$remote = if ($LASTEXITCODE -eq 0 -and $remoteOut.Count -gt 0) { [string]$remoteOut[0] } else { '' }
if (-not $remote) { & git remote add origin $Repo; $remote=$Repo }
if ($remote -ne $Repo) { throw "Origin nao e o workspace autorizado: $remote" }
$refs = @(& git ls-remote origin)
if ($LASTEXITCODE -ne 0) { throw 'Nao foi possivel confirmar o remoto. Verifique login/permissoes e rede.' }
if ($refs.Count -gt 0 -and $refs[0]) { throw 'Remoto ja possui commits; importacao inicial bloqueada para evitar sobrescrita.' }
& git push origin 'HEAD:refs/heads/main'
if ($LASTEXITCODE -ne 0) { throw 'O GitHub rejeitou o push: nada sera forçado.' }
Write-Host 'IMPORTADO: quatro commits originais mais commit de remediacao, historico preservado; main inicial publicada sem --force.'

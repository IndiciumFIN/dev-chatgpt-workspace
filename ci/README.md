# CI — ficheiros que precisam de acao manual do owner

`pending-coverage-gate.yml` **nao esta** em `.github/workflows/` porque a API do plugin
bloqueia escrita nessa pasta (erro `connector_tool_error` em toda a tentativa, medido em
31/10). O conteudo e identico ao que seria instalado.

## Como ativar (owner, na ordem)

```bash
# 1. so depois de T0.005 (inventario no main), T0.013 (vinculos) e T0.001 (gaps fechados)
cp ci/pending-coverage-gate.yml .github/workflows/pending-coverage-gate.yml
git add .github/workflows/pending-coverage-gate.yml
git commit -m "ci(pmo): ativa o gate de cobertura de pendencias"
```

## Por que nao ligamos no verify-bibliotecas.yml

`verify-bibliotecas.yml` ja existe na branch padrao e roda em todas as PRs. Liga-lo ao gate
antes de o inventario aterrissar colocaria um gate **que falha fechado** em todas as PRs do
repositorio enquanto `GAP-01..GAP-04` estiverem abertos — quebrando o CI de quem tem PR
aberto (neste momento: 7 PRs drafts). A ordem correta e **T0.005 -> T0.013 -> T0.001 ->
T0.012**.

## Verificacao local (o que o gate faz, sem CI)

```bash
node --test scripts/check-pending-coverage.test.mjs          # 7/7 verdes
node scripts/check-pending-coverage.mjs                       # SKIP se o inventario nao aterrissou
python3 -m unittest discover -s tests -p 'test_*.py' -q       # 17/17 verdes
```

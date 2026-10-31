# Backup do estado CE — 31/10/2026 22:11Z

Equipa de comparação **cancelada a pedido do dono** (as 6 frentes estavam em curso; nenhum entregável
foi concluded). Este ZIP é o estado exacto do trabalho até ao cancelamento.

## O que está completo e verificado
| peça | estado | como se reproduz |
|---|---|---|
| **Esqueleto CE** (45 famílias · 410 serviços · 201 capabilities · 905 ficheiros gerados) | ✅ | `node scripts/generate-skeleton.mjs` · gate 11/11 · 72/72 testes |
| **Lacunas do esqueleto** vs plano canónico (10 módulos, metamodelo, P1/P2) | ✅ | `GAPS-2026-10-31.md` |
| **Auditoria do pacote Commander** (39/40 hashes OK; `src/App.tsx` divergente; matriz M01–M22 localizada) | ✅ | `docs/evidence/commander-2026-10-31/` |
| **Auditoria do pacote "área administrativa"** | ✅ | `docs/evidence/admin-area-2026-10-31/` |
| **Plano PMO × Kernel** + registo de 112 tasks | ✅ | `docs/PLAN-PMOKERNEL-FINALIZATION-v0.1.0.md` + `PLAN-TASKS-...json` |
| **Evidence pack da comparação** (produção, repo+branches, normativos, plataformas, esqueleto) | ✅ | `02-evidencia/` |

## O que ficou em curso (não concluído)
- Equipa de comparação: `producao-conta-funil`, `producao-superficie-busca`, `repo-publico-branches`,
  `normativos-enfermagem`, `normativos-federais`, `benchmarks-plataformas` — **todos em curso, nenhum
  entregável concluído**. O plano YAML e o estado estão em `05-plano-equipa/`.
- **Única evidência bruta preservada**: `04-equipa-parcial/normativos-federais/` — 45 ficheiros com as
  respostas reais da API de Dados Abertos do Senado (catálogos + extrações das 5 normas). É dado
  primário público e fica utilizável.

## Medições do owner que corrigem registos anteriores
1. **182 branches** no repo público `kauesp0007/calculadoras-de-enfermagem` (a contagem anterior de 30
   era paginação errada: `per_page` em vez de `perPage`). Lista completa em `02-evidencia/branches-todas.json`.
2. `src/lib/locale-registry.ts` e `src/lib/site-data.ts` **não existem no `main`** do repo público nem do
   privado — onde vivem os 19 idiomas e os tokens canónicos é **NOT_RUN**.
3. Na API do Senado o parâmetro correcto é **tipo+número+ano** (`palavras` é ignorado).

## Como retomar
- O esqueleto regenera: `cd 01-esqueleto-ce && node scripts/generate-skeleton.mjs && node scripts/check-skeleton.mjs`.
- A comparação retoma com o plano YAML de `05-plano-equipa/` (re-lançar com `team run`), ou refaz-se
  frente a frente com o evidence pack de `02-evidencia/` já completo e corrigido.
- Nada foi mergeado, publicado ou promovido: `main` intacto, fila PMO intacta, tokens canónicos intactos.

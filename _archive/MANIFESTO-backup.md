# CE — Backup de trabalho
**Projeto:** Calculadoras de Enfermagem (CE)
**Base:** `CE_PUBLIC_BACKUP_EXECUTION_v2.7.1.zip` (release original, imutável)
**Natureza:** árvore de trabalho modificada. O ZIP original NÃO foi alterado.

## Correções que-was-bloqueador

1. **`src/lib/translate.ts`** — `headerLocales` era usado sem nenhum import.
   O bundler não achava binding e o módulo explodia no carregamento:
   `ReferenceError: headerLocales is not defined`.
   Todas as rotas respondiam HTTP 500. O `npm run build` saía com exit 0 mesmo assim.
   Correção: uma linha de import.
   Efeito: `/`, `/ferramentas/*`, `/secao/*` voltaram a 200.

## Idioma

2. **`src/routes/pacote.tsx`, `src/routes/secao.$slug.tsx`** — a busca aceitava
   só 4 idiomas hardcoded (`pt-BR | en | es | fr`). Passou a usar o tipo `Locale`
   completo, alinhado com os 19 idiomas de `src/lib/locale-registry.ts`:
   `pt-BR, en, es, de, it, fr, hi, zh, ar, ja, ru, ko, tr, nl, pl, sv, id, vi, uk`.

## Marca e ícones

3. **`public/brand/logo.svg`** (NOVO) — substitui `logo.webp`, que tinha 48×32 px
   e era exibido em 64×64: distorção anisotrópica medida de **1,5×** (largura ×1,33,
   altura ×2,0). Vetor medido em `ratio 1.0`, upscale 1,0×. Só cores da paleta canônica.
4. **`shell.tsx`, `home-page.tsx`, `slide-deck.tsx`** — migrados para o vetor.
5. **`src/lib/figma-alignment.ts:30`** — o contrato apontava para
   `src/templates/Logo.tsx`, que não existe, e travava o `.webp` como única marca.
   Reconciliado mantendo `veredito: "nao-promover"` e a intenção de não haver rival.

## Shell

6. **`src/styles.css`** — eixos NOVOS, nenhum valor de token alterado:
   - `--icon-xs/sm/md/lg/xl` + `--icon-stroke` — substituem tamanhos soltos de 14/17/18/19/22px
   - `--chrome-utility 44`, `--chrome-a11y 44`, `--chrome-header 64`, `--chrome-total`, `--chrome-tablet`, `--chrome-gap 16`
   - `--hit-target 44`, `--radius-control/panel/pill`
   - Chrome fixo desktop: **168px → 152px**
   - Alvos de toque: `.scale-chip` 22→44px, `.hint-btn` 28→44px, `.scroll-btn` 34→44px, skip-link 40→44px
7. **`src/components/site/shell.tsx`** — quatro glifos novos na barra de acessibilidade
   (Contraste, Fonte para dislexia, Modo escuro, Atalhos de teclado); anel de estado
   selecionado nos 4 `.focus-dot`; **wordmark removido** do cabeçalho.
8. **`src/lib/agents.ts`** — o contrato dizia *"Barra de acessibilidade de 36 px e
   header branco de 60 px"*. 36px era menor que o próprio alvo de toque que a barra
   deveria proteger. Reconciliado para os tokens medidos.

## Publicação local

9. **`src/lib/local-workbench-store.ts`** — `initialWorkbench()` nasce com
   `published: true` (decisão do dono do produto). O backup público abre com as
   calculadoras visíveis. A separação rascunho/publicado continua intacta:
   publicar ainda exige a ação explícita `PUBLISHED`.

## Medido no navegador (build de produção, Chromium)

| | original v2.7.1 | agora |
|---|---|---|
| distorção do logo | ratio 1,5 | **1,0** |
| chrome fixo desktop | 168px | **152px** |
| alvos abaixo de 44px | 55 | **1** (link inline, isento pela WCAG 2.5.8) |
| wordmark no cabeçalho | duplicado | **ausente** |
| overflow horizontal 390/1024/1440 | — | **0** |
| `/ferramentas/braden` | "não publicada nesta base local" | **formulário completo** |

## Gates

- `scripts/test-header-p0-v267`, `test-header-v269`, `test-mobile-focus-v268`,
  `test-country-icon-a11y-v265`, `test-country-icon-evidence`,
  `test-focus-colors-i18n`, `test-country-icons` — **7/7 PASS**
- `scripts/check-local-publication.mjs` — **8/8 PASS**
- `scripts/audit-static.mjs` — **8 pass / 3 fail** (inalterado; os 3 fail são
  pré-existentes e não são de design: `admin-controls-clinical-content`,
  `has-tool-engine-unit-tests`, `has-runtime-visual-evidence`)
- `npx tsc --noEmit` — restam **2 erros pré-existentes** em `src/lib/db.ts`
  (~195 e ~211), idênticos aos da v0.8.0

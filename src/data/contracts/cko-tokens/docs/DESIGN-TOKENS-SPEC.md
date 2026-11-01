# CKO Universal Content Design Tokens v1.0

Sistema de tokens para artigos/conteúdos, flashcards, infográficos, simulados,
casos clínicos, e-books, guias de bolso e guias de estudo.

## Famílias

- `editorial-content`
- `study-guide`
- `quick-reference`
- `book-publication`
- `assessment`
- `clinical-simulation`
- `visual-learning`

## Estratos

1. **Primitives** — cor, tipografia, spacing, radius, shadows, motion, breakpoints.
2. **Semantic** — light/dark, texto, superfícies, ações, borders e estados.
3. **Typography** — display, body, labels, prose.
4. **Layout** — containers, grid, density, touch targets, ratios de mídia.
5. **Components** — hero, cards, buttons, tables, flashcards, quiz, caso clínico, infográfico, e-book, guia de bolso.
6. **Families** — accent, accent-soft, container e density de cada família.
7. **Print** — A4/Letter, margens, escala tipográfica e regras de quebra.
8. **Accessibility** — contraste, foco, touch target, reduced motion e legibilidade.

## Regras

- Cor institucional principal: `#1A3E74`.
- Títulos: `Nunito Sans`.
- Corpo: `Inter`.
- Azul e neutros formam a identidade dominante.
- Vermelho é reservado para risco/erro.
- Âmbar é reservado para atenção.
- Cyan funciona como estado positivo/confirmatório para evitar dependência excessiva do verde.
- Corpo mínimo: 16 px.
- Touch target mínimo: 44 px.
- Medida editorial preferida: 68–70 ch.
- Focus ring sempre visível.
- Componentes consomem **semantic tokens**; primitives ficam na fundação.
- Família altera composição/accent, não semântica de erro/warning/foco.

## Exemplo

```html
<link rel="stylesheet" href="cko-universal-content-tokens.css">

<body
  data-theme="light"
  data-content-family="study-guide"
  data-density="comfortable">
```

```css
.card {
  background: var(--cko-surface);
  color: var(--cko-text-primary);
  border: 1px solid var(--cko-border-subtle);
  border-radius: var(--cko-card-radius);
  padding: var(--cko-card-padding);
}
```

## Impressão

Baseline A4:
- 210 × 297 mm
- margens 16 / 14 / 18 / 14 mm
- body 10.5 pt
- H1 24 pt
- H2 17 pt
- H3 13 pt

Cards, tabelas, questões e flashcards devem evitar quebra interna sempre que possível.

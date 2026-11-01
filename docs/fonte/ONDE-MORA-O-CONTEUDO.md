# ONDE MORA O CONTEÚDO DA FONTE (medido em 26/10/2026 — leia antes da migration 0042)

Este documento existe porque **duas tabelas pareciam guardar a mesma coisa e não guardam**. Quem for escrever a recuperação precisa saber qual é a que o visitante lê.

## A rota pública

- `/institucional/<hub>/<página>` → redireciona para `/secao/<slug>` (`src/routes/institucional.$hub.$page.tsx` + `src/lib/institutional-target.ts`).
- `/secao/<slug>` → `readLiveSection(slug)` (`src/lib/stored.functions.ts`).
- O slug NÃO aceita barra (`inputValidator`: `/^[a-z0-9-]{1,80}$/`). O casamento com a página institucional acontece por `inst_page.path endsWith('/' + slug)`.

## A tabelas que servem (medido)

| caminho | quem lê | situação |
|---|---|---|
| `section_page` + `section_block` + `content_object` | 18 páginas de seção, 34 blocos | **canônico**, servido na 1ª opção do `readLiveSection` |
| `inst_page` + `inst_section` | 29 páginas, **142 seções** | **legado**, servido no `else` (fallback) — é o que serve as páginas institucionais |
| `content_object` (kind `institucional` = 32) + `content_text` | 1.721 objetos / 3.925 textos | existe, mas `content_place.object_slug` está **NULL** em todas as 28 linhas com `inst_path` — o elo entre a página legada e o objeto canônico **não existe** |

Ou seja: **as páginas institucionais públicas são servidas pela tabela legada `inst_section`.** Escrever o texto recuperado em `content_text` sem ligar o `content_place` **não muda nada para o visitante**.

## O que a extração original perdeu (medido em `inst_section`)

- 142 seções: **111 com texto real** e **31 com o marcador DERBY** (que era "PENDENTE" do autor, ou frase truncada).
- 0 corpo vazio, 0 corpo curto que não seja DERBY.
- Os **títulos** de vários blocos são um **esqueleto de planejamento que nunca existiu** ("1. Direito de arrependimento: 7 dias", "1. Gratuito e Premium", "2. Recurso por recurso"): não estão no repositório de origem. São títulos de plano, não conteúdo.

## O que a migration 0042 tem que fazer

1. O **conjunto de seções** vem da FONTE, não do banco. Se a fonte tem 5 seções e o banco tem 6, a 6ª é esqueleto: registra no `CONFRONTO.md` e **não publica esqueleto como se fosse texto** (título de seção inventado + corpo DERBY é pior que omitir).
2. O **corpo** é literal da fonte (ver a política de literalidade no prompt da tarefa).
3. O **título** de cada seção: se a fonte tem título, ele manda; se não tem, o título do banco é esqueleto → vai para o achado.
4. Onde a fonte **não tem** o texto: o marcador DERBY fica, e a pendência vai **nomeada** (arquivo, seção, o que falta).

## O filtro de tamanho (corrigido pelo dono em 26/10/2026)

`readLiveSection`/`readInstPage` filtravam blocos com `text.length >= 24`. O marcador DERBY tem 5 caracteres e **era descartado**: a pendência sumia da tela sem aviso. Medido antes/depois no site no ar:

| rota | antes | depois |
|---|---|---|
| `/institucional/assinante/planos` | 5 seções, 0 marcador visível | 8 seções, 3 marcadores visíveis |
| `/institucional/assinante/perguntas-frequentes` | 5 seções, 0 marcador visível | 9 seções, 4 marcadores visíveis |

Agora o filtro só descarta corpo vazio (`text.length > 0`). A 0042 pode contar com o marcador visível.

## other: onde o DERBY ainda está

- `content_text` (view `leitura`, locale `pt-BR`): **15 linhas** com `body = 'DERBY'` e `title = 'DERBY'`. São de outras páginas — a 0042 tem que dizer se a fonte tem o texto delas também.
- `source_tool` (82): `version`, `evidence`, `band_from`, `category`, `nanda_mode` = DERBY. **A faixa de escore é a exceção que NUNCA vira marcador inventado**: se a fonte trouxer a faixa real (no sinalizador do instrumento), recupera o valor literal; se não trouxer, DERBY + o instrumento nomeado.

# Continuidade do ecossistema

Documento de trabalho. Não cria tela nem tabela nova. Descreve como seguir no computador e como a área logada passa a ser a fonte, sem um segundo design system.

Data de referência: 19 de outubro de 2026.

## 1. Continuar no computador

O site é um app TanStack Start. A prévia usa a porta 8080. No computador, na pasta do projeto:

```bash
npm install
npm run dev
```

Abre `http://127.0.0.1:8080`.

Conferir antes de considerar um ajuste pronto:

```bash
npm run typecheck
npm run test
npm run build
```

Sem `DATABASE_URL`, o banco é PGLite, gravado na pasta do projeto. Com `DATABASE_URL`, o mesmo SQL fala com Postgres. Supabase entra por essa variável, não por um cliente paralelo. A string fica no painel do Supabase, em Database, connection string, modo session ou transaction. Não cole a chave `service_role` no navegador.

O que não se mexe:

- A casca do preview (`__grok`, página de instalação, pill da marca).
- A paleta: marinha `#1A3E74`, céu `#4A90E2`, foco amarelo `#FF0`, Nunito Sans no título, Inter no texto.
- Um componente por função. Trilha, hero, ferramentas, índice e conteúdo relacionado já existem.
- Dado de paciente não vai para cookie, `localStorage` nem banco.

## 2. O que já é verdade

Há três papéis de leitura, não três sites.

| Quem | Rota | O que vê |
|---|---|---|
| Público | `/`, `/secao`, `/ferramentas` | O mesmo conteúdo publicado |
| Assinante | `/assinante` | O mesmo site, mais o que for marcado como de assinante |
| Administrador | `/admin` | A fonte. O primeiro usuário vira administrador. Os seguintes entram como assinante |

O banco atual, em `migrations/`, tem quatro tabelas:

- `member`: usuário e papel (`subscriber` ou `admin`).
- `source_tool`: slug, tipo, título, lead e se está publicado. O cálculo em si ainda mora em `src/lib/tools/catalog.ts`.
- `subscription`: pedido, ativo ou recusado.
- `community_post`: recado da área, com ocultar.

Páginas, peças, contratos e arquivos ainda nascem do código e da pasta `public/`. O admin lista isso. Não edita o miolo.

## 3. Fonte única

Uma linha publicada é a que o público lê. O código deixa de ser o texto e passa a ser o molde.

Regra: o administrador grava. O template só lê o que está publicado. Se a linha não existe ou não está publicada, a página não inventa conteúdo.

O que continua no código, porque é regra e não conteúdo:

- Contrato de cada tipo de página (`src/lib/template-contract.ts`).
- Molde da escala e da calculadora (`src/lib/component-contract.ts`).
- Motor de cálculo (`src/lib/tools/engine.ts`).
- Casca: cabeçalho, barra, rodapé, cookies.

O que passa para o banco, porque é conteúdo:

- Página, seção, peça, instrumento, mídia, norma, formulário e laudo de modelo.

## 4. Módulos do administrador

A área `/admin` usa o frame `area`. Não usa o menu público. Cada módulo é uma seção da mesma página, ou uma rota filha, com o mesmo hero e a mesma lista. Não se desenha um painel novo por módulo.

| Módulo | Grava | O público lê |
|---|---|---|
| Páginas | Título, lead, família, seções, publicado | `/secao/$slug` e páginas institucionais |
| Templates | Tipo, contrato já existente, peça ligada | `/modelos/$id` |
| Instrumentos | Critérios ou campos, faixas, referência, publicado | `/ferramentas/$slug` |
| Biblioteca | Módulos e prateleiras (anatomia, dispositivo, imagem, PDF, slide, infográfico) | A página de biblioteca |
| Mídia | Arquivo, legenda, camadas, texto alternativo | Figura dentro da página |
| Pessoas | Papel do membro e estado da assinatura | `/assinante` e o próprio `/admin` |
| Comunidade | Ocultar recado | A área logada |
| Normas e peças | Texto e tipo editorial | Norma e peça |

O instrumento clínico não se edita como HTML. O formulário do admin preenche a ficha que o motor já entende: slug, tipo `escala` ou `calculadora`, critérios ou campos, faixas, referências. NANDA, se existir, fica no laudo, não num campo da tela pública.

Publicar é um botão. Rascunho não aparece no menu. Despublicar tira do menu e devolve 404, sem apagar a linha.

Quem não é administrador recebe erro. A função já exige isso em `requireAdmin`.

## 5. Assinante, do ponto de vista de quem usa

A área logada não é um segundo site. É o mesmo conteúdo, com a sessão.

O assinante vê:

- O site público inteiro.
- O estado da própria assinatura: pedido, ativo ou recusado.
- Favoritos desta conta, se um dia forem gravados. Hoje o favorito não pode ir para cookie de paciente. Favorito de página pode ser uma linha `user_id` + `path`, sem dado clínico.
- Recados da comunidade, sem o botão de ocultar.

O assinante não vê:

- Edição de texto, mídia ou instrumento.
- Lista de outras pessoas.
- Dado de paciente de cálculo. Esse dado continua só na visita, na memória da página.

A rota `/assinante/ferramentas/$slug` mostra a mesma ferramenta. A diferença permitida é a vista, não outro cálculo.

## 6. Master data

Um registro canônico por coisa. O template não copia o texto.

| Registro | Chave | Campos mínimos |
|---|---|---|
| `page` | slug | tipo, título, lead, publicado |
| `block` | page_id + ordem | título, texto |
| `tool` | slug | tipo, ficha JSON do motor, publicado |
| `piece` | id (`TPL-001`) | tipo editorial, dados JSON |
| `media` | id | caminho, alt, legenda, camadas |
| `member` | user_id | papel |
| `subscription` | user_id | estado |

A ficha JSON do instrumento segue o tipo que `catalog.ts` já usa. Não se cria um formato paralelo para o admin.

Leitura pública: `where published = true`. O admin lê também o rascunho.

Quando a linha do banco e o arquivo do código discordam, vale o banco se a linha existir. O arquivo serve de semente na primeira migração, como `source_tool` já faz.

## 7. Supabase

Não instalar um segundo SDK para ler conteúdo se `DATABASE_URL` já aponta para o Postgres do Supabase. As migrations em `migrations/` rodam lá com `npm run db:migrate`.

Passos, nesta ordem:

1. Criar o projeto no Supabase.
2. Copiar a connection string para `DATABASE_URL` no ambiente de produção. Não commitar.
3. Rodar as migrations que já existem.
4. Só então acrescentar tabelas novas (`page`, `block`, `media`, ficha completa do instrumento) numa migration `0004`. Não alterar na mão pelo SQL editor sem gravar o arquivo.
5. Autenticação continua a que o app já tem. O `user_id` da tabela `member` é o id dessa sessão. Não abrir um segundo login do Supabase Auth no meio do fluxo, senão existem duas sessões.

Storage do Supabase, se for usado, guarda o binário da imagem. A linha `media` guarda o caminho, o alt e as camadas. A página não monta URL secreta no cliente.

Política: a chave pública não escreve. Escrita só no servidor, depois de `requireAdmin`.

Dado clínico de paciente não entra em tabela nenhuma.

## 8. Template que consome a fonte

O componente não muda por conteúdo. Muda o registro que ele recebe.

| Tipo | Componente que já existe | Lê |
|---|---|---|
| Seção | `ArticlePage` com `kind="secao"` | `page` + cards |
| Página longa | `ArticlePage` com `artigo`, `guia`, `biblioteca` ou `norma` | `page` + `block` + mídia |
| Editorial | `ArticlePage` + `EditorialView` | `piece` |
| Ferramenta | `ClinicalToolPage` | `tool` |
| Laudo | `ClinicalSheet` | o resultado da visita, não o banco |

Criar um template novo só cabe se nenhum `kind` existente descreve a página. Até lá, o conteúdo novo é uma linha, não um arquivo de layout.

## 9. Imagem em camadas

Uma figura publicada tem até quatro camadas, nesta ordem, de baixo para cima:

1. Fundo. Cor da marca ou fotografia já existente em `public/`.
2. Marca. `public/brand/logo.webp`, canto previsto, sem redesenhar.
3. Título curto, em Nunito Sans, cor branca se o fundo for marinha.
4. Legenda fora da imagem, em texto real, não queimada no pixel.

O admin escolhe o fundo, liga ou desliga a marca, escreve o título e a legenda. O público recebe uma figura com `alt` igual à legenda. Não se gera um componente por ilustração.

Formatos que já existem e não se duplicam:

- Capa 16:9 para thumbnail.
- Quadrado para post.
- 1,91:1 para o card de compartilhamento, que já é `public/og.jpg`.
- Prancha de anatomia e desenho de seringa continuam SVG com lista ao lado. A lista é a camada de texto. O desenho não é a única informação.

Arquivo novo entra em `public/` ou no storage, com nome estável. Trocar o desenho não troca o slug da página.

## 10. Ordem para implementar depois

1. Migration `0004` com `page`, `block` e a ficha completa em `source_tool`, sem apagar as colunas atuais.
2. O admin passa a editar título, lead e publicado da página, e a ficha do instrumento que já está no ar (Braden, Morse, Apgar, gotejamento, IMC).
3. A rota pública lê o banco e cai no arquivo só se a linha não existir.
4. Módulo de mídia com as quatro camadas, primeiro para as imagens que já estão em `public/brand` e `public/institucional`.
5. Assinante: mesma página, mais o estado da própria assinatura. Sem editor.
6. Só então instrumentos novos (Aldrete, APACHE II e outros), com fonte escrita na ficha. Sem NANDA na tela. Sem mortalidade sem referência.

Não fazer nesta ordem: kit visual novo, segundo login, gráfico de biblioteca, dado de paciente no Supabase.

# Auditoria das rotas públicas — site no ar

| | |
|---|---|
| Árvore | `/workspace/workspace-repo` |
| Branch | `feat/projection-unica-f0-suite-real` |
| HEAD medido | `27fc7fa` — "DERBY: o portão classifica o vazio por design declarado, não por estatística" |
| Servidor | `npm run dev` (Vite 8.3.4) em `http://127.0.0.1:8080`, log em `/tmp/dev-derby.log` |
| Banco | PGLite em memória, migrations aplicadas no boot (`src/lib/db.ts`, sem `DATABASE_URL`) |
| Data | 2026-10-26, 16:12–16:22 UTC |
| Escopo | 20 rotas, leitura pura. Nenhum arquivo do repo editado. |

Medição: `fetch` com `redirect: "manual"` para registrar a cadeia de saltos, depois o corpo final.
Contagem de `h1`/`h2` no HTML servido. Busca de `DERBY` no **texto visível** (removendo `<script>`, `<style>` e
comentários antes de extrair o texto) e, em separado, no **HTML bruto** (sem remover nada).
`bytes` = tamanho do corpo final em bytes. `vis chars` = caracteres de texto visível no `<body>` (sem `<script>`).

---

## 1. Tabela

| rota | código | bytes | h1 | h2 | DERBY visível | DERBY HTML bruto | vis chars | veredito |
|---|---|---|---|---|---|---|---|---|
| `/` | 200 | 929.436 | 1 | 7 | 0 | 2 | 5.512 | **ALERTA** — DERBY no HTML bruto |
| `/ferramentas/braden` | 200 | 932.643 | 1 | 13 | **2** | 7 | 4.808 | **BLOQUEANTE** — DERBY visível |
| `/ferramentas/aldrete` | **404** | 910.724 | 1 | 4 | 0 | 2 | 1.111 | ACEITO — falha fechada (ver §3) |
| `/ferramentas/balancohidrico` | **404** | 910.773 | 1 | 4 | 0 | 2 | 1.111 | ACEITO — falha fechada (ver §3) |
| `/secao/calculadoras` | 200 | 920.238 | 1 | 5 | **1** | 4 | 3.014 | **BLOQUEANTE** — DERBY visível |
| `/secao/escalas` | 200 | 923.832 | 1 | 6 | **1** | 4 | 4.125 | **BLOQUEANTE** — DERBY visível |
| `/assinante` | 200 | 899.165 | **0** | **0** | 0 | 2 | 19 | **ALERTA** — 200 sem h1 no HTML servido |
| `/institucional` | 200 (307→307→200) | 918.682 | 1 | 8 | 0 | 2 | 2.653 | **ALERTA** — DERBY no HTML bruto |
| `/institucional/editorial` | 200 (307→200) | 920.672 | 1 | 11 | **1** | 4 | 3.238 | **BLOQUEANTE** — DERBY visível |
| `/institucional/editorial/fontes-e-evidencias` | 200 (307→200) | 919.413 | 1 | 7 | **3** | 8 | 2.914 | **BLOQUEANTE** — DERBY visível |
| `/institucional/assinante/planos` | 200 (307→200) | 917.404 | 1 | 6 | **3** | 2.228 | 2.228 | **BLOQUEANTE** — DERBY visível |
| `/institucional/privacidade/politica-de-privacidade` | 200 (307→200) | 918.103 | 1 | 9 | 0 | 2 | 2.489 | **ALERTA** — DERBY no HTML bruto |
| `/blog/mary-eliza-mahoney` | 200 | 934.154 | 1 | 13 | 0 | 2 | 9.634 | **ALERTA** — DERBY no HTML bruto |
| `/modelos` | 200 | 917.137 | 1 | 5 | 0 | 2 | 3.172 | OK |
| `/pacote` | 200 | 916.156 | 1 | 4 | **1** | 3 | 2.941 | **BLOQUEANTE** — DERBY visível |
| `/sistema` | 200 | 920.859 | 1 | 11 | **1** | 3 | 4.598 | **BLOQUEANTE** — DERBY visível |
| `/admin` | 200 | 899.146 | **0** | **0** | 0 | 2 | 19 | **ALERTA** — 200 sem h1 no HTML servido |
| `/sessao` | 200 | 899.152 | **0** | **0** | 0 | 2 | 21 | **ALERTA** — 200 sem h1 no HTML servido |
| `/conta` | 200 | 899.027 | **0** | **0** | 0 | 2 | **0** | **BLOQUEANTE** — 200 com corpo vazio e indexável |
| `/login` | 200 | 899.486 | 1 | 0 | 0 | 2 | 168 | OK |

**500: nenhum.** Durante as duas rodadas completas de medição (20 rotas + link-check de 126 destinos internos),
`/tmp/dev-derby.log` recebeu **0** ocorrências de `status: 500`. O único 500 do log (16:15:25) é
`Error: aborted … code: 'ECONNRESET'` — a conexão do meu próprio cliente foi derrubada pelo shell, não é defeito de rota.
As únicas mensagens do log são depreciações de `createServerFn().inputValidator()`.

**Cadeias de redirecionamento** (`beforeLoad` → `throw redirect`, 307):

| rota pedida | salto 1 | salto 2 | final |
|---|---|---|---|
| `/institucional` | `/secao/sobre` | `/secao/missao-visao-valores` | 200 |
| `/institucional/editorial` | `/secao/politica-editorial` | — | 200 |
| `/institucional/editorial/fontes-e-evidencias` | `/secao/fontes-e-evidencias` | — | 200 |
| `/institucional/assinante/planos` | `/secao/planos` | — | 200 |
| `/institucional/privacidade/politica-de-privacidade` | `/secao/politicas` | — | 200 |

**Link-check interno:** 126 `href` internos únicos extraídos das páginas 200. Um único destino não-200:
`/secao/sobre` → 307 (redirecionamento normal, já coberto acima). **Nenhum link público aponta para
`/ferramentas/aldrete` nem para `/ferramentas/balancohidrico`** — os cartões "Balanço Hídrico" e "Aldrete e Kroulik"
são `<article>` sem link.

---

## 2. Achados

### BLOQUEANTE 1 — `DERBY` visível ao público em 8 rotas

`DERBY` é o marcador de pendência humana. A própria migration que o escreve diz, em
`migrations/0037_preencher_derby.sql:4-6`:

> "DERBY é MARCADOR DE PENDÊNCIA HUMANA. **Não é conteúdo**, não é valor inventado, não é resposta."

Renderizado como texto de página, ele vira conteúdo público indevido. Trechos literais capturados no corpo:

| rota | trecho renderizado | campo de origem | migration que preenche |
|---|---|---|---|
| `/ferramentas/braden` | `Versão DERBY` · `Evidência: DERBY` | `source_tool.version`, `source_tool.evidence` | `0037_preencher_derby.sql:38-39` |
| `/secao/calculadoras` | `<h2>Cálculos</h2>` seguido de `<p><span lang="pt-BR">DERBY</span></p>` | `section_block.body` | `0037_preencher_derby.sql:166` |
| `/secao/escalas` | `<h2>Instrumentos</h2>` seguido de `<p><span lang="pt-BR">DERBY</span></p>` | `section_block.body` | `0037_preencher_derby.sql:166` |
| `/institucional/editorial` → `/secao/politica-editorial` | `4. Classificação por risco DERBY` | `inst_section.body` | `0030_stored_files.sql:7900` + `0037:165` |
| `/institucional/editorial/fontes-e-evidencias` → `/secao/fontes-e-evidencias` | `1. Ordem de prioridade DERBY` · `2. O que não usamos como fonte DERBY` · `4. Quando as fontes divergem DERBY` | `inst_section.body` | `0030_stored_files.sql:7877,7878,7880` + `0037:165` |
| `/institucional/assinante/planos` → `/secao/planos` | `1. Gratuito e Premium DERBY` · `2. Recurso por recurso DERBY` · `3. Preço e condições DERBY` | `inst_section.body` | `0030_stored_files.sql:7847-7849` + `0037:165` |
| `/pacote` | `F19–F34 · Outros produtos: DERBY` (linhas vizinhas dizem `Publicado`) | `phase_note.status` | `0037_preencher_derby.sql:162` |
| `/sistema` | `F19–F34 · Outros produtos: DERBY` (linhas vizinhas dizem `Publicado`) | `phase_note.status` | `0037_preencher_derby.sql:162` |

Agravantes por rota:

- `/ferramentas/braden` — instrumento **publicado**: mostra `Versão DERBY` e `Evidência: DERBY`. A versão do
  instrumento e a fonte da evidência clínica estão vazias e o marcador aparece como se fosse o valor.
- `/institucional/editorial/fontes-e-evidencias` — a página **que promete descrever a política de fontes** não
  tem uma única fonte: as três regras de origem e prioridade renderizam o marcador. É a página institucional que
  deveria ser a evidência de que a norma de fontes existe.
- `/institucional/assinante/planos` — página de **preço**: `1. Gratuito e Premium DERBY`, `3. Preço e condições DERBY`.
- `/pacote` e `/sistema` — a coluna de status da tabela de fases alterna `Publicado` e `DERBY` na mesma linha visual.

**Por que é BLOQUEANTE:** marcador interno de pendência renderizado como texto público. Ou o valor real entra, ou a
seção sai do ar. Não existe terceira opção aceitável.

**Correção:** preencher de fato os campos pendentes (`source_tool.version`, `source_tool.evidence`,
`inst_section.body`, `section_block.body`, `phase_note.status`) ou remover a seção inteira da publicação.
Para `phase_note.status`, o vocabulário precisa ser fechado (`Publicado` / `Pendente` / `Não se aplica`) — não
admite marcador.

**Regra que deveria existir:** nenhum valor de pendência pode chegar ao HTML público. Duas camadas:

1. *Renderização*: o componente que renderiza `section_block.body` / `inst_section.body` / `phase_note.status`
   tem de tratar o valor do marcador como ausência — se `body === "DERBY"`, renderizar o bloco sem o parágrafo
   (não renderizar o parágrafo vazio nem o texto do marcador). O mesmo para `source_tool.version` / `.evidence`
   na capa do instrumento: campo vazio → rótulo omitido.
2. *Banco/publicação*: query de controle que reprova a publicação quando a linha publicada contém o marcador:
   ```sql
   select count(*) from content_text where status='publicado' and (body='DERBY' or lead='DERBY' or title='DERBY')
   union all select count(*) from inst_section where body='DERBY'
   union all select count(*) from section_block where body='DERBY'
   union all select count(*) from phase_note where status='DERBY'
   union all select count(*) from source_tool where version='DERBY' or evidence='DERBY';
   ```
   Qualquer resultado ≠ 0 barra a publicação.

### BLOQUEANTE 2 — `DERBY` no HTML bruto de 20/20 rotas

Mesmo nas 12 rotas onde o marcador **não** é visível, ele vem no payload SSR serializado dentro de `<script>`.
Duas ocorrências em **todas** as 20 rotas measure, 3 a 8 nas que também são visíveis:

```
$R[8110]={id:"F19–F34",name:"Outros produtos",status:"DERBY",detail:"Aplicativo, extensão, API e anatomia 3D …"}
$R[8214]={id:"biblioteca",title:"Sinais vitais",…,source:"DERBY",modules:[…]}
```

Não aparece no `ld+json` (verificado: o bloco `application/ld+json` de `/ferramentas/braden` está limpo de DERBY).
O vazamento está no payload de dados que o servidor entrega ao navegador.

**Correção:** o `DERBY` não pode ser serializado para o cliente. O objeto de fase `F19–F34` e o módulo de
biblioteca precisam sair do payload público ou carregar o status como valor do vocabulário fechado.
A serialização de `source_tool` para o cliente também deve omitir `version`/`evidence` quando forem o marcador.

**Gate sugerido (HTTP, roda contra o site no ar, bloqueia se casar):**
```
# visível: o marcador no texto renderizado
curl -s "$URL" | sed -E 's#<script\b[^>]*>.*?</script>##g; s#<style\b[^>]*>.*?</style>##g; s#<!--.*?-->##g' \
  | grep -nE '\bDERBY\b' && exit 1
# bruto: o marcador em qualquer lugar do HTML
curl -s "$URL" | grep -nE '\bDERBY\b' && exit 1
```
Rodar sobre as 20 rotas. A segunda linha é a que fecha o vazamento do payload.

### BLOQUEANTE 3 — `/conta`: 200 com corpo visivelmente vazio, indexável

| atributo | valor |
|---|---|
| código | 200 |
| bytes | 899.027 (quase todos são payload SSR + cliente de dev) |
| texto visível no `<body>` | **0 caracteres** |
| `h1` / `h2` | 0 / 0 |
| `<title>` | `Calculadoras de Enfermagem` (fallback do `__root`, sem sufixo) |
| `rel=canonical` | **ausente** |
| `robots` | **ausente** → a rota fica indexável |

Causa: `src/routes/conta.tsx:3` monta só `<Navigate to="/sessao" />`, um redirecionamento **de cliente**. Não existe
`beforeLoad` com `throw redirect` (ao contrário de `/institucional/*`, que devolve 307 de servidor). O SSR renderiza
a página vazia e o `__root` entra com o título padrão.

Para quem executa JavaScript, o `/conta` cai em `/sessao` → `/login` (ou `/` sem autenticação) — funcionando.
Para quem não executa (bot, preview de rede social, leitor de tela sem JS), sobra uma página em branco com 200.

**Atenção ao tamanho:** o critério dos 2 KB **não** pega esta rota — o corpo tem 899 KB por causa do payload de
desenvolvimento. A detecção correta é por texto visível, não por bytes.

**Correção:** `src/routes/conta.tsx` deve fazer o redirecionamento no servidor, no mesmo padrão de
`src/routes/institucional.$hub.$page.tsx`:
```ts
beforeLoad: () => { throw redirect({ to: "/sessao" }); },
```
e declarar `head` com `robots: noindex` e `canonical` — ou, se a rota não é pública, `noindex` é obrigatório.

**Gate sugerido:**
```
# rota 200 cujo texto visível é menor que 200 caracteres
curl -s "$URL" | sed -E 's#<script\b[^>]*>.*?</script>##g; s#<[^>]+># #g' | tr -s ' ' \
  | awk 'length($0)<200 {print "ROTA VAZIA: " ENVIRON["URL"]}'
```
E uma checagem de par: `200` **e** sem `<h1>` **e** sem `noindex` → reprovar.

### ALERTA 4 — 200 sem `h1` no HTML servido: `/assinante`, `/admin`, `/sessao`

O texto visível do corpo é, respectivamente, `Abrindo a sua área…` (19 e 19 caracteres) e `Separando a sua área…`
(21 caracteres). O conteúdo real só existe depois que o `useRole()` resolve no cliente.

Não é bloqueio: as três são áreas privadas e todas têm `robots: noindex`. Mas o HTML que o servidor entrega para
uma área de assinante é um placeholder sem `h1` e sem `h2` — se um dia o `noindex` cair, a página entra no índice
sem título de primeira ordem.

**Correção:** renderizar o cabeçalho da área (`<h1>`) já no servidor, antes da resolução de sessão.
**Gate:** `curl -s "$URL" | grep -c '<h1'` deve ser ≥ 1 em toda rota 200, exceto redirecionadores de servidor.

### ALERTA 5 — 8 rotas 200 sem `rel=canonical`

`/assinante`, `/modelos`, `/pacote`, `/sistema`, `/admin`, `/sessao`, `/conta`, `/login`.

As 12 rotas restantes têm canonical absoluto correto (`https://calculadorasdeenfermagem.com.br/…`). As 8 acima não.
Dessas, só **`/conta`** é indexável (`noindex` ausente) — e é a mesma rota do BLOQUEANTE 3. `/modelos`, `/pacote` e
`/sistema` têm `noindex` mas são as páginas de inventário que o dono trata como públicas: sem canonical, uma
versão duplicada de `/pacote` seria indexável como se fosse a canônica.

**Correção:** incluir `languageLinks()` (que já emite o canonical) nos `head` de `/modelos`, `/pacote`, `/sistema`
e `/conta`. Para `/admin`, `/sessao`, `/login`, `/assinante` o canonical é irrelevante se o `noindex` estiver firme —
mas a assimetria com as demais rotas deve ser intencional e documentada.

### OBSERVAÇÃO 6 — 404 com `canonical` e `title` genérico

`/ferramentas/aldrete` e `/ferramentas/balancohidrico` devolvem 404 com página de erro completa (`h1` "Página não
encontrada", 1.111 caracteres visíveis) — o tratamento de 404 é correto. Porém:

- `<title>Ferramenta</title>` — o fallback de `src/routes/ferramentas.$slug.tsx:14`, sem o sufixo da marca e sem
  indicar 404. O título de uma página de erro é o que o buscador exibe.
- `<link rel="canonical" href="https://calculadorasdeenfermagem.com.br/ferramentas/aldrete"/>` — canonical em página
  404 afirma ao buscador que a URL inexistente é a versão canônica do próprio conteúdo.

**Correção:** a página 404 deve sair sem canonical e com `robots: noindex, follow`, e o `title` deve ser
`Página não encontrada · Calculadoras de Enfermagem`.

### OBSERVAÇÃO 7 — `/sessao` entrega 200 com `title` próprio, `/conta` entrega 200 com `title` genérico

`/sessao` tem `head` próprio (`Abrindo a área · Calculadoras de Enfermagem`, `noindex`). `/conta` não tem `head`
nenhum e herda o do `__root`. A diferença é consequência direta do BLOQUEANTE 3.

---

## 3. `/ferramentas/aldrete` e `/ferramentas/balancohidrico` — 404 ACEITO

**Código: 404. Veredito: ACEITO — o site falha fechado por desenho.** A razão, verificada no código e no banco:

1. `src/routes/ferramentas.$slug.tsx:8-11` — o loader chama `readTool({ data: params.slug })`; se o instrumento não
   existir na fonte ou não estiver publicado, `throw notFound()`. O `catch(() => null)` impede que qualquer falha da
   fonte vire 200 com conteúdo parcial.
2. `src/lib/source.functions.ts:167-174` — `readTool` lê `source_tool` e, se não houver linha para o slug, lança
   `"Ferramenta fora da fonte."` **antes** de qualquer fallback de catálogo. Não há caminho que devolva conteúdo de
   um instrumento não publicado.
3. `src/lib/tools/catalog.ts:291-294` — o catálogo publicado (`tools`) é `braden, morse, apgar, gotejamento, imc`.
   `aldrete` está em `candidateTools`, cujo comentário diz: *"Fora do menu e do sitemap. A branch de auditoria exige
   homologação humana antes do índice."*
4. `balancohidrico` **não existe** nem no catálogo publicado nem em `candidateTools` — o instrumento está em
   `src/lib/content-kind.ts:6` (lista de tipos permitidos) e aparece como referência bibliográfica em
   `migrations/0014_site_route.sql:27` e `0015_site_route_body.sql:872` (`body = 'Carregando conteúdo protegido…'`),
   nunca como instrumento publicado.
5. `source_tool` é populado por `seed()` (`src/lib/source.functions.ts:33-40`) a partir de `tools` — só os cinco
   publicados. Não há linha `source_tool` para `aldrete` nem para `balancohidrico`; e no modelo de conteúdo
   (`content_object` + `content_alias` + `content_text`, migrations `0020`/`0029`) nenhum dos dois tem
   `content_text.status = 'publicado'`.

Os dois 404 são coerentes com o design de fail-closed e **não são achado**. Ficam registrados aqui para deixar
constante a razão exigida.

Ressalva de conteúdo, que **não** é sobre o 404: em `/secao/calculadoras` e `/secao/escalas` as listas
"Cálculos" e "Instrumentos" anunciam "Balanço Hídrico" e "Aldrete e Kroulik" como cards, com o marcador `DERBY`
(BLOQUEANTE 1). Os cards não são links — não geram link quebrado — mas anunciam instrumentos que não abrem. Se o
card é para o instrumento, ele aponta para uma 404; se o instrumento não está no índice, o card não deveria estar
na lista pública.

---

## 4. NÃO EXECUTADO / FORA DE ESCOPO

Nada das 20 rotas ficou **NOT_RUN**: as 20 foram medidas, com código, bytes, `h1`, `h2`, DERBY visível, DERBY bruto,
`<title>`, `canonical` e `noindex`.

Sobre reprodutibilidade, para que o documento não afirme mais do que prova: a tabela da seção 1 é a **única
medição evidenciada aqui**, feita no HEAD `27fc7fa`, entre 16:12 e 16:22 UTC. A execução foi feita duas vezes
durante a tarefa e devolveu os mesmos números, mas a segunda execução não está registrada em tabela separada
neste relatório — quem quiser conferir deve repetir a medição no mesmo HEAD. O que o relatório garante é o que
está na tabela: uma medição, com o HEAD, o horário, o servidor e o método declarados no cabeçalho.

Fica **NOT_RUN** o que estava fora do pedido:

| item | motivo |
|---|---|
| DOM pós-hidratação (h1/h2/DERBY depois do JS) | o pedido mede o corpo servido. As 4 rotas com `h1=0` no servidor (`/assinante`, `/admin`, `/sessao`, `/conta`) só se confirmam no browser. Não havia Chromium instalado no sandbox (Playwright sem browser baixado). |
| Auditoria de renderização em navegador (client-side 404, erro de console, hydration) | fora do escopo; exigiria browser headless. |
| `content_text` / `content_object` do banco lidos por SQL direto | o PGLite é **em memória** (`src/lib/db.ts:109-121`, sem `dataDir`): o estado vive no processo do dev server e não é acessível de fora. A verificação do banco foi feita por leitura de código e das migrations que o populam. |
| Varredura de `<img>` sem `alt`, contraste, navegação por teclado | fora do escopo desta tarefa (o pedido é código/bytes/h1/h2/DERBY). |
| Rotas fora das 20 listadas pelo dono | fora do escopo. |
| `npm run build` / `preview` (porta 8081) | fora do escopo: o pedido é o site no ar em dev. |
| Benchmark de performance, Lighthouse, Core Web Vitals | fora do escopo. |

---

## 5. Ambiente — o que precisou ser reparado antes de medir

O `node_modules` do repositório é um symlink para `/tmp/appbuild/node_modules` (fora da árvore, `node_modules` está
no `.gitignore`). **Todos os binários nativos naquela cópia estavam truncados**:

| arquivo | tamanho na cópia | tamanho real |
|---|---|---|
| `@rolldown/binding-linux-x64-gnu/*.node` | 783.360 | 19.620.096 |
| `@rolldown/binding-linux-x64-musl/*.node` | 783.360 | 19.701.552 |
| `@tailwindcss/oxide-linux-x64-gnu/*.node` | 799.744 | 2.997.400 |
| `@tailwindcss/oxide-linux-x64-musl/*.node` | 799.744 | 3.015.776 |
| `lightningcss-linux-x64-gnu/*.node` | 783.360 | 10.032.264 |
| `lightningcss-linux-x64-musl/*.node` | 783.360 | 10.032.056 |
| `@tailwindcss/node/node_modules/lightningcss-linux-x64-{gnu,musl}/*.node` | 750.592 | 10.036.152 / 10.040.456 |

O sintoma era `SIGBUS` (exit 135) no `require` do binding: `file` reportava `missing section headers at 19620032`
num arquivo de 783 KB. **O dev server não subia** — `npm run dev` morria com `spawn vite ENOENT` e depois com
`Bus error` antes de imprimir `VITE ready`.

**Reparo (fora do repositório, nada do repo editado):** `npm install` em `/tmp/appbuild`, com o `package.json` e o
`package-lock.json` copiados para lá. `npm ci` não serve: o lockfile está fora de sincronia com o `package.json`
(`Invalid: lock file's ajv@6.15.0 does not satisfy ajv@8.20.0`, `Missing: fast-uri@3.1.9 from lock file`), então
`npm ci` aborta com `EUSAGE`. Depois do `npm install`, os 8 `.node` passaram na verificação de ELF
(nenhum `missing section headers`) e o Vite 8.3.4 subiu.

Estado do repositório no fim da auditoria: `git status --short` limpo, `package.json` e `package-lock.json` do repo
sem diff, branch `feat/projection-unica-f0-suite-real` inalterada, nenhum commit, push, checkout, stash ou reset
feito por esta auditoria. O único arquivo escrito no repositório é este relatório.

---

## 6. Sumário para o dono

| severidade | quantidade | rotas |
|---|---|---|
| BLOQUEANTE | 3 achados | DERBY visível (8 rotas) · DERBY no HTML bruto (20/20) · `/conta` 200 vazio e indexável |
| ALERTA | 2 achados | 200 sem `h1` (3 rotas) · 8 rotas sem canonical |
| OBSERVAÇÃO | 2 achados | canonical em 404 · title genérico em `/conta` |
| 500 | **0** | — |
| 404 esperado | 2 rotas | `/ferramentas/aldrete`, `/ferramentas/balancohidrico` (falha fechada, ver §3) |

**Nenhum 500. Nenhuma rota 200 sem `<title>`. Nenhuma link público quebrado.** O que trava a publicação é o
marcador `DERBY` aparecendo ao leitor: em 8 rotas como texto, em 20 rotas dentro do HTML que o servidor entrega.

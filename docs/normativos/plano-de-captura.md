# Plano de captura — o conjunto de enfermagem (COFEN/COREN) e os referenciais

**Tarefa:** `normas-requisitos` · **Data:** 2026-10-26 (UTC) · **Árvore:** `/workspace/workspace-repo` · branch `feat/projection-unica-f0-suite-real`, `HEAD` `51dfc7b`.

Este documento é o **plano**, não a execução. Ele diz, para cada fonte pretendida: a URL oficial, o tipo de captura (texto integral / metadado apenas), o motivo, o direito quando houver, o limite de taxa, e o que o `robots.txt` e os *content-signals* daquele host proíbem. Nenhuma captura foi executada nesta tarefa, exceto a leitura de páginas oficiais de identificação, registrada como **verificação**, e ela está marcada como tal item a item.

## 0. Regras que valem para toda captura

Derivadas de `docs/governance/TRANSVERSAL-ACQUISITION-RUNBOOK.md` (linhagem de governança) e do registro de 24/10:

1. **Não repetir download de fonte já preservada com hash idêntico** sem motivo documentado. As 25 fontes transversais já estão em `audit-evidence/transversal-acquisition/` com hash conferido — **não são tocadas por este plano**. O eMAG 3.1 e as 3 especificações W3C também já estão preservados.
2. **Robots e content-signals primeiro.** Nenhum fetch de conteúdo antes de ler o `robots.txt` do host e verificar os *content-signals*. Se `ai-train` ou `ai-input` for `no`, o conteúdo **não** é insumo de modelo nem de treino: só link e citação. Citar é permitido; redistribuir o texto integral depende do direito de cada fonte.
3. **Limite de taxa: no máximo 1 requisição por segundo por host**, e mais lento se o host pedir. Os downloads desta tarefa de hoje (verificações de §3) foram espacados; nenhum host recebeu mais de 1 requisição por segundo.
4. **Falha é `HOLD`, não sucesso.** Timeout, resposta não-HTML, incompatibilidade de identificação ou redirecionamento não permitido produzem `HOLD` explícito e preservado, com status de download falso prohibited. Nada é apagado: um lote que falhou continua na fila com o motivo.
5. **O extrator não cria átomo, não afirma vigência, não decide aplicabilidade, não admite no Kernel e não publica.** Quem faz isso é a tarefa de atomização (`scripts/capturar-normas.mjs`, `migrations/0040_atomos.sql`) e a de políticas. Este plano só produz evidência bruta.
6. **Toda fonte preservada entra com:** arquivo original (HTML ou PDF) **sem modificação**, texto extraído em UTF-8 **não revisado**, SHA-256 de ambos, a data de captura, a URL exata e a **licença/aviso** quando houver.
7. **O `sourceCanonicalId` é o identificador que costura as duas linhagens.** Formato já em uso: `transversal-public.<ato>.source` (ex.: `transversal-public.lei-12-965-2014.source`). Para o conjunto de enfermagem, o prefixo coerente é `enfermagem.<orgao>.<slug>.source` — **proposta**, a ser homologada pelo dono, porque a chave precisa casar com o identificador que o outro lado já usa.

## 1. Leitura de `robots.txt` e *content-signals* — o que já foi lido nesta rodada

A leitura de robots foi feita em 18 hosts na rodada de 26/10/2026 (antes desta tarefa) e **reconferida nesta rodada em 22 hosts**, com o bruto de cada resposta preservado. O resultado está registrado abaixo, com o que cada host proíbe. Onde a leitura falhou, isso é **pendência nomeada** — não é "pode baixar".

**Evidência primária desta leitura:** [`audit-evidence/transversal-acquisition/robots/ROBOTS-20261026.md`](../../audit-evidence/transversal-acquisition/robots/ROBOTS-20261026.md) e o manifesto legível por máquina [`ROBOTS-MANIFEST.json`](../../audit-evidence/transversal-acquisition/robots/ROBOTS-MANIFEST.json) — 22 hosts, bruto de cada resposta preservado com SHA-256. A tabela abaixo é o resumo; o manifesto é a fonte.

**Content-signals, medido:** dos **9** hosts com `robots.txt` legível, **nenhum emite diretiva `Content-Signal:`**. O COFEN publica o *bloco de comentário* que define `search`/`ai-input`/`ai-train` e a regra (a)/(b)/(c) — mas não emite diretiva. Pela regra (c) do próprio bloco, isso é **nem concessão nem restrição por sinal**. Nenhum host consultado proíbe por content-signal; nenhum concede.

| Host | Leitura de `robots.txt` | *Content-signals* | O que o host proíbe | Consequência para a captura |
|---|---|---|---|---|
| `www.cofen.gov.br` | Sem diretivas (sem `Disallow`/`Allow`) | **Sem `Content-Signal`** | Nada declarado | Captura permitida por robots. **Sem sinal de `ai-train`/`ai-input`**: usar como link e citação; não usar como insumo de modelo sem autorização do órgão. |
| `normas.leg.br` | `Allow: /` | — | Nada declarado | Captura permitida. Direito de redistribuição do texto integral: **[VERIFICAR: a política de direitos de uso de normas.leg.br para atos cuja publicação é oficial — o texto no DOU é público, mas o modo como o hosting o republica tem condições próprias.]** |
| `ouvidoria.cofen.gov.br` | Só bloqueia o caminho de **remuneração** | — | Só o caminho de remuneração | Demais caminhos permitidos. O caminho bloqueado não é acessado. |
| `portal.coren-sp.gov.br` e `www.coren-sp.gov.br` | **403** no `robots.txt` **e** nas páginas | — | **Desconhecido — leitura falhou** | **PENDÊNCIA NOMEADA.** Não capturar por este host. **Rota oficial alternativa:** `ouvidoria.cofen.gov.br/coren-sp/transparencia/…`, cujo `robots.txt` é legível e permite o caminho. Ver §3.2 |
| `www.coren-sp.org.br`, `coren-sp.org.br`, `www.coren.org.br` | **Sem resolução DNS** | — | **Desconhecido — leitura falhou** | **PENDÊNCIA NOMEADA.** Este domínio **não existe**; ver §3.2. Não capturar nem planejar por ele. |
| `NANDA` (host de NANDA-I) | **403** | — | **Desconhecido — leitura falhou** | **PENDÊNCIA NOMEADA.** NANDA-I é referencial licenciado: direito controlado, e o acesso automatizado já falhou. |
| `www.iso.org` | **403** | — | **Desconhecido — leitura falhou** | **PENDÊNCIA NOMEADA.** ISO é direito controlado; o catálogo é público, o texto não. |
| BVS (`bvsalud.org` / OPAS) | **403** | — | **Desconhecido — leitura falhou** | **PENDÊNCIA NOMEADA.** Só metadado, e só por via que não viole robots. |
| `legis.senado.leg.br` (API de Dados Abertos) | **403** na leitura de robots | — | **Desconhecido — leitura falhou** | A API **responde 200** em `/dadosabertos/legislacao/*`, mas **não cobre resolução do COFEN** (verificado nesta rodada). Robots 403 é pendência, não autorização. |
| `www.gov.br/trabalho-e-emprego` | lido nesta rodada de 26/10 | — | Nada declarado | Captura permitida (ver §3.4 — leitura direta desta tarefa). |
| `www.in.gov.br` (DOU) | lido nesta rodada de 26/10 | — | Nada declarado | Captura permitida; **é a fonte primária de publicação** para data e retificação. |
| `www.w3.org` | lido na rodada de 26/10 | — | Nada declarado | **Já preservado** (PROV-O, WCAG 2.2, SHACL) com aviso de licença. Não repetir. |
| `emag.governoeletronico.gov.br` | lido na rodada de 26/10 | — | Nada declarado | **Já preservado** (eMAG 3.1, CC BY 4.0) com atribuição. Não repetir. |
| `www.planalto.gov.br` | **404** — o host **não publica** `robots.txt` (a resposta é página HTML de erro) | — | Nada declarado, **por ausência de robots.txt** | **Já preservado** (21 atos públicos). Não repetir. Ver `robots/ROBOTS-20261026.md` §3 |

**Os 8 hosts restantes dos 18 lidos** (portais de região do COREN, ANVISA, Ministério da Saúde, ABNT e afins) têm leitura registrada na rodada; nenhum deles é fonte de texto integral planejado aqui, e todos entram como **metadado apenas** até que a leitura seja reconferida.

### 1.1 O que este plano **não** captura, por robots/content-signals

- **Nada** do host `portal.coren-sp.gov.br` / `www.coren-sp.gov.br` (403 em robots e nas páginas) enquanto o 403 persistir. O domínio `*.coren-sp.org.br` **não resolve** e não é plano de captura.
- **Nada** de NANDA-I, ISO e BVS por fetch automatizado, além do que o `fundamento` já guarda como metadado.
- **Nenhum** texto integral de norma com direito controlado (ISO, ABNT, NANDA, COBIT, ISACA, ITIL, COPSOQ III, ALCOA+, IEEE 754, IEC 31010, ASTM E29, ArchiMate, ISO/IEC 12207, ISO 15489, ISO 19011, ISO 25010, ISO 25012, ISO 10007, ISO 10015, COSO ERM) — o `fundamento` (43 linhas) já marca `right_name = 'Só metadado'` para 18 delas. **Isso não muda.**

## 2. Tipos de captura e o que cada uma entrega

| Tipo | O que se guarda | O que **não** se guarda | Quando usar |
|---|---|---|---|
| **T1 — texto integral (ato oficial)** | HTML/PDF original **sem modificação** + texto extraído UTF-8 **não revisado** + SHA-256 dos dois + URL + data de captura + aviso de licença | Nada é "corrigido", traduzido ou resumido na captura | Ato público brasileiro (Planalto/DOU) e página oficial do órgão emissor, **quando** a robots permitir e o direito for de citação/arquivo |
| **T2 — metadado apenas** | Identificador oficial, órgão, tipo, data de publicação, URL canônica, *situação declarada pela fonte* (só se a fonte a declarar), hash do arquivo de catálogo | **Nenhum** texto, **nenhum** artigo, **nenhum** parágrafo | Referencial com direito controlado (ISO, ABNT, NANDA, COBIT…) e qualquer fonte cuja leitura de robots tenha falhado |
| **T3 — rótulo de identificação (sem cópia)** | Só a referência (URL + identificador + data), como **link** | Nada é baixado | Fonte que proíbe conteúdo automatizado, ou que só interessa como citação |

**Direito.** Ato oficial brasileiro (lei, decreto, resolução de órgão federal) é **público**; a captura T1 guarda o original para archivo e citação, com o hash que prova a cópia fiel. Referencial com direito controlado (ISO, ABNT, NANDA, COBIT, ISACA, ITIL, COPSOQ, ALCOA+, IEEE, IEC, ASTM, ArchiMate, COSO) é **T2 ou T3** — preço de catálogo "0 CHF" **não** é licença de redistribuição. W3C e eMAG 3.1 já têm licença e **já foram preservados**.

## 2.x O conjunto transversal: o que se tem, o que não se tem, e o que foi feito agora

O briefing perguntou se eu devia obter os normativos transversais que não temos. A resposta, medida:

### O inventário real — 47 entradas de catálogo

| Situação | Quantidade | O que é |
|---|---:|---|
| **Texto integral arquivado** | **25** | 21 atos públicos brasileiros + 3 especificações W3C + 1 eMAG 3.1. HTML/PDF original **sem modificação** + texto extraído **não revisado** + SHA-256 de ambos |
| **Só metadado** | **22** | 18 ISO/ISO-IEC + ABNT NBR 17225:2025 + OPA/Rego + TRV-018 (ISACA COBIT 2019) + IFRS S1/S2 (excluído por aplicabilidade) |
| Com ficha de metadado | **22** | as 22 de só-metadado |
| Com data de verificação individual da URL | **3** | ABNT NBR 17225:2025, IFRS S1/S2, OPA/Rego |
| Sem data de verificação individual da URL | **19** | as 18 ISO/ISACA do catálogo + TRV-018 |
| Com cláusula normativa verificada | **0** | nenhuma, em nenhuma das 47 |
| Admitidas no Kernel | **0** | nenhuma |

Tabela completa: `audit-evidence/transversal-acquisition/registry/CATALOGO-TRANSVERSAL.md` (47 linhas) e `registry/catalogo-transversal.json`.

### O que **não** se obtém, e por quê

O texto integral das 22 de só-metadado **não se busca**, por três motivos que convergem:

1. **Direito controlado.** ISO, ABNT, ISACA e IFRS têm licença controlada. O runbook é explícito: *"Para ISO/ABNT/ISACA/IFRS: não copiar texto integral, guardar somente metadados e o motivo de retenção."* E o próprio registro de 24/10: *"Não apresentar preço zero do catálogo como licença de redistribuição."*
2. **Robots.** O `robots.txt` do `www.iso.org` respondeu **403** na rodada de 26/10 — pendência nomeada, não autorização. O do ISACA não chegou a ser lido.
3. **Não é fonte de requisito.** O `materialization-manifest` marca as 18 ISO/IEC com `applicability: HOLD`, `binding: HOLD_HUMAN` e `isoClauseVerified: false`. Um texto integral sem vínculo de aplicabilidade continua sem poder virar cláusula.

### O que **foi** feito nesta tarefa

1. **A camada de origem foi trazida** (cópia de blob do Git, **sem download**): 25 registros canônicos de fonte, 25 registros de evidência, 18 fichas de metadado, os 2 manifestos de materialização — em `audit-evidence/transversal-acquisition/registry/`. Antes disso, esta árvore tinha a evidência sem o registro que diz de onde ela veio.
2. **A cadeia foi conferida em 75 hashes:** `input_sha256` (documento arquivado), `output_sha256` (registro de fonte) e `integrity.sha256` (`snapshot_ref`) — **25/25 em cada**, 0 divergência. Mais 18/18 `metadataHash` contra o `materialization-manifest.json`. **143 hashes conferidos no total.**
3. **As 4 fichas de metadado que faltavam foram preenchidas**, derivadas só do catálogo já preservado: `ABNT NBR 17225:2025`, `IFRS S1 e IFRS S2`, `OPA/Rego` e `TRV-018`. Cada uma carrega `addedBy` e `derivedFrom`. A do TRV-018 declara `verificationStatus: PENDENTE_VERIFICACAO_INDIVIDUAL_DA_URL` — porque no catálogo ela não tem data de verificação individual.
4. **O catálogo virou uma tabela só**, as 47 entradas com identificador, URL oficial, publicador, data, decisão de aquisição, motivo e a lista do que **não** foi verificado. Antes ele estava espalhado: 47 no `manifest.json`, 25 no `public-materialization-manifest.json`, 18 no `materialization-manifest.json`, 18 fichas — e as 4 lacunas não apareciam em lugar nenhum.

### O que isso **não** faz

- Não cria átomo, não decide aplicabilidade, não admite no Kernel e não publica. `kernelAdmission` é `false` e `normativeClausesVerified` é `0` nas 47 entradas.
- Não afirma vigência, revogação, escopo ou artigo de nenhuma das 47.
- Não substitui o registro canônico, que continua na linhagem de governança (`registers/governance/transversal-source-instances/public/source/`). A cópia aqui é **evidência**, e o `registry/README.md` diz isso.
- Não baixa uma única página da internet. Os quatro documentos de Nursing de §3.1 continuam com o que a verificação de 26/10 trouxe.

## 3. Fontes pretendidas — o conjunto de enfermagem

Cada linha traz o que **foi verificado nesta tarefa** e o que **não** foi. As fontes em que a página oficial foi aberta nesta tarefa estão datadas de **26/10/2026**; as demais, herdadas da rodada.

### 3.1 COFEN — Conselho Federal de Enfermagem

**Portão oficial de legislação (verificado nesta tarefa):** `https://www.cofen.gov.br/legislacao/` — lido em 26/10/2026. O portal expõe o menu `Legislação` e o atalho "Resoluções Cofen", ambos apontando para essa mesma página. **A listagem completa de resoluções não foi extraída**: a requisição de extração do conteúdo dessa página deu timeout e, em nova tentativa, "file load failed". **PENDÊNCIA NOMEADA** — a página funciona no browser; a extração automatizada falhou. [VERIFICAR: a listagem completa de resoluções do COFEN e o padrão de URL por resolução, lidos em `/legislacao/` com.extração confiável.]

**Rota de captura resolvida — a API REST do próprio portal (verificada nesta rodada).** A pendência acima tem rota melhor que raspar HTML: o portal COFEN é WordPress e expõe uma API pública, em `robots.txt`-permitido e **sem diretiva de bloqueio**.

| Rota | Verificado | O que entrega |
|---|---|---|
| `GET https://www.cofen.gov.br/wp-json/wp/v2/lei?per_page=N&_fields=id,date,slug,link,title` | **HTTP 200**; cabeçalho `X-WP-Total: 2656` (2.656 itens no tipo de postagem exibido como "Legislação"); `X-WP-TotalPages: 2656` | Lista paginada dos atos normativos do COFEN com `date`, `slug`, `link` e `title` |
| `GET https://www.cofen.gov.br/wp-json/wp/v2/types` | **HTTP 200** | Tipos de postagem registrados, entre eles `lei` (rótulo "Legislação"), `documentos-legais`, `post`, `advices`, `parecer` |
| `GET https://www.cofen.gov.br/wp-json/wp/v2/search?search=<termo>&per_page=N` | **HTTP 200** | Busca full-text do portal, com `title`, `url` e `type`/`subtype` |
| `GET https://www.cofen.gov.br/wp-json/wp/v2/posts/{id}` | **HTTP 200** | Registro individual, com a página canônica |

**O que essa rota resolve e o que ela não resolve.** Ela resolve a **listagem**: os 2.656 atos ficam enumerados com URL canônica, o que a extração da página `/legislacao/` não conseguiu entregar. Ela **não** resolve vigência, revogação nem escopo, e **não** substitui o DOU. [VERIFICAR: o padrão de URL canônica por ato e a correspondência entre `slug` e o identificador oficial do ato — por exemplo, o item `resolucao-cofen-no-05452017` aparece sob `/resolucao-cofen-no-05452017/` e sob `/advices/…`.]

**Armadilha de data, medida.** O campo `date` da API REST do COFEN é a **data de postagem no portal**, não a data do ato. Exemplo medido: `RESOLUÇÃO COFEN Nº 723/2023` aparece com `date` `2023-08-15`, e `DECISÃO COFEN N° 395 DE 22 DE OUTUBRO DE 2026` com `date` `2026-10-23`. **A data do ato vem do DOU ou do cabeçalho do próprio PDF**, nunca do `date` da API. A data de assinatura, a data de publicação e a data de entrada em vigor são três campos diferentes e nenhum deles é esse `date`.

**A busca da API é full-text e devolve ruído.** `?search=564` devolveu, entre outros, `RESOLUÇÃO COFEN Nº 723/2023` e `RESOLUÇÃO COFEN Nº 722/2023` — a string "564" aparece em outro lugar do conteúdo. **Buscar por número não é filtrar por número**: a captura tem de casar o identificador no título, e registrar o descarte do que não casou.

**Candidatas com página oficial aberta nesta tarefa (26/10/2026).** O que está na tabela foi **lido na página oficial do COFEN**, transcrito literalmente:

| # | Identificador oficial | Data de publicação | Ementa (literal da página) | URL oficial | Tipo de captura |
|---|---|---|---|---|---|
| F1 | **RESOLUÇÃO COFEN Nº 545/2017** | **18.05.2017** | *"Anotação de Enfermagem e mudança nas siglas das categorias profissionais."* | `https://www.cofen.gov.br/resolucao-cofen-no-05452017/` | **T1** (texto integral) |
| F2 | **RESOLUÇÃO COFEN Nº 564/2017** | **06.12.2017** | *"Aprova o novo Código de Ética dos Profissionais de Enfermagem."* | `https://www.cofen.gov.br/resolucao-cofen-no-5642017/` | **T1** (texto integral) |
| F3 | **RESOLUÇÃO COFEN Nº 736 DE 17 DE JANEIRO DE 2024** | **23.01.2024** | *"Dispõe sobre a implementação do Processo de Enfermagem em todo contexto socioambiental onde ocorre o cuidado de enfermagem."* | `https://www.cofen.gov.br/resolucao-cofen-no-736-de-17-de-janeiro-de-2024/` | **T1** (texto integral) |

**Sobre F1 — correção de uma premissa.** O próprio repositório e pareceres oficiais citam a Resolução 545/2017 com a ementa *"Anotação de Enfermagem e mudança nas siglas das categorias profissionais"* — **não** com a ementa de "especificidades do exercício da enfermagem" que se poderia supor pelo número. A data **18.05.2017** é a data de publicação que consta na página oficial; um parecer oficial do COFEN (`ouvidoria.cofen.gov.br/coren-al/transparencia/65043/download/PDF`) refere-se a ela como *"Resolução COFEN n. 545, de 09 de maio de 2017"*. **Há divergência entre as duas datas** e ela precisa ser resolvida contra o DOU. [VERIFICAR: a data de publicação e a data de entrada em vigor da Resolução COFEN nº 545/2017 no DOU — a página do COFEN diz 18.05.2017, um parecer do COFEN diz 09 de maio de 2017.]

**O que NÃO se afirma sobre F1, F2 e F3:** vigência, revogação, escopo de aplicação, número e texto de artigo, e a relação entre elas (se a 545 foi revogada, se a 564 alterou a 545). Nada disso foi conferido. A auditoria transversal de 24/10 já registrava o caso análogo da Resolução ANPD 19/2024: *"o cotejo com a edição do Diário Oficial permanece obrigatório"*. O registro próprio do COFEN também afirma que a 545 *"Revogou a Resolução Cofen nº 191/1996"* — citação de terceiro em PDF oficial, **não** cotejo com o DOU.

### 3.2 COREN — Conselhos Regionais de Enfermagem

| Fonte | URL oficial | Situação em 26/10/2026 | Tipo |
|---|---|---|---|
| COREN-SP — portal próprio | `https://portal.coren-sp.gov.br/` e `https://www.coren-sp.gov.br/` | **`robots.txt` respondeu 403 e as páginas falharam (403).** O portal existe, em domínio **`.gov.br`**. O domínio `www.coren-sp.org.br` **não resolve em DNS** — a rota de legislação por ele nunca foi confirmada porque **não existe** | **T3** (rótulo de identificação) até que os robots e as páginas sejam legíveis |
| COREN-SP — portal de transparência do COFEN | `https://ouvidoria.cofen.gov.br/coren-sp/transparencia/pareceres/` (e `/decisoes/`, `/portarias/`) | **HTTP 200**; `robots.txt` legível e **permite** o caminho (só bloqueia `/cofen/transparencia/remuneracao-dos-empregados/`) | **T1/T2** — via oficial, servida pelo COFEN, com o PDF do DOU linkado |
| demais COREN regionais | — | **PENDÊNCIA NOMEADA:** o padrão de URL por conselho não foi conferido, e o domínio do COREN-SP ensina o DNS: não presumir `coren-<UF>.org.br` | T2/T3 |

**O que muda com a rota alternativa.** A jurisdição COREN-SP deixa de ficar sem fonte: o portal de transparência do COFEN publica os pareceres, decisões e portarias do conselho, com link para o PDF do Diário Oficial. Isso **não** autoriza capturar o portal do COREN-SP (403), e **não** resolve a data e a vigência — que continuam vindo do DOU. [VERIFICAR: a rota de download do PDF no portal de transparência do COFEN e o padrão de URL por ato do COREN-SP.]

[VERIFICAR: a URL oficial de legislação de cada COREN regional, o `robots.txt` de cada um, e se há pareceres e resoluções de uso geral em Nursing que o produto precise citar.] Sem rota confirmada, não há captura.

**Ponto de direito.** O parecer normativo do COREN é **regional**: vale na jurisdição do conselho. Um site que o publique como "norma" sem marcar a jurisdição erra o leitor. Isso precisa ser campo (`norma.jurisdicao`), não texto solto — está em R1/R3 de `docs/normativos/requisitos.md`.

### 3.3 Demais órgãos com ato de enfermagem

| Ato | Órgão | URL oficial | Verificação em 26/10/2026 | Tipo |
|---|---|---|---|---|
| Lei nº 7.498/1986 (regulamenta o exercício da enfermagem) | Presidência da República | `https://www.planalto.gov.br/` | **Já preservada** em `audit-evidence/transversal-acquisition/` (HTML + texto + SHA-256) | **Não repetir** |
| Lei nº 8.080/1990 (Lei Orgânica da Saúde) | Presidência da República | idem | **Já preservada** | **Não repetir** |
| Resoluções ANPD 15, 18 e 19/2024 | ANPD | `https://www.gov.br/anpd/` | **Já preservadas** (21 atos públicos no total) | **Não repetir** |
| NR-1 (riscos psicossociais) | MTE | `https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/inspecao-do-trabalho/seguranca-e-saude-no-trabalho/ctpp-nrs/normas-regulamentadoras-nrs` | Página oficial **não** foi aberta nesta tarefa (timeout). O repositório já declara a fonte em `migrations/0015_site_route_body.sql` e cita "Portaria MTE nº 1.419, de 27 de agosto de 2024" | **T1**, depois de abrir a página |
| NR-7 (PCMSO) e NR-12 (máquinas e equipamentos) | MTE | idem | **Verificado em 26/10/2026:** a listagem oficial declara *"Confira, abaixo, os textos vigentes de todas as Normas Regulamentadoras"* e lista **NR-7 - PROGRAMA DE CONTROLE MÉDICO DE SAÚDE OCUPACIONAL** e **NR-12 - SEGURANÇA NO TRABALHO EM MÁQUINAS E EQUIPAMENTOS**. A NR-12 tem PDF oficial em `.../normas-regulamentadoras-vigentes/nr-12-atualizada-2025.pdf`, e a página institucional diz *"(Última modificação: Portaria MTE nº 344, de 21/03/2024)"* | **T1** (texto integral) |
| Portaria GM/MS nº 6.734/2025 | Ministério da Saúde | `https://www.gov.br/saude/` | Declarada no repositório (`content_object` slug `biblioteca/2025-ministerio-da-saude-portaria-gmms-no-6-734-de-18-de-marco-de-2025`), **não** conferida na fonte | T2 até abrir a página; depois T1 |
| Conselhos decharges: ANVISA, CONARE, CFM, CREFITO | respectivos | — | **PENDÊNCIA NOMEADA** — fora do escopo desta tarefa | T2 |

**Sobre a NR-12, uma ressalva que precisa ir para o plano:** o portal oficial publica **mais de uma versão** do PDF (`nr-12-atualizada-2024.pdf`, `nr-12-atualizada-2025.pdf`, `copy_of_NR12atualizada2023.pdf`). Capturar "a NR-12" sem fixar a edição é o erro clássico. A captura tem que gravar **a edição** e **a data da última modificação** (Portaria MTE nº 344, de 21/03/2024, segundo a página institucional lida) junto do hash.

### 3.4 O DOU como fonte primária de publicação

Para toda resolução do COFEN, a **data de publicação, a retificação e a revogação** saem do Diário Oficial da União, não do portal do órgão. [VERIFICAR: a rota de consulta do DOU para as resoluções do COFEN — a consulta pública em `www.in.gov.br` não foi exercitada nesta tarefa.]

**Limite de fonte que precisa ser escrito em qualquer registro:** a API de Dados Abertos do Senado (`legis.senado.leg.br/dadosabertos/legislacao/*`) **responde 200**, mas **não cobre resolução do COFEN** — verificado nesta rodada, duas vezes: `legislacao/lista?tipo=RES&numero=545&ano=2017` e `…&numero=564&ano=2017` devolvem `documentos` **vazio**. Ela serve para lei; para resolução de autarquia federal, o caminho é o DOU. E o **texto integral dos artigos não vem no JSON**: para o texto, citar `normas.leg.br` ou o PDF do DOU.

**Rotas da API verificadas nesta rodada.** A especificação OpenAPI está publicada em `https://legis.senado.leg.br/dadosabertos/v3/api-docs` (HTTP 200; `info.title` *"Dados Abertos Legislativos do Senado Federal e Congresso Nacional"*, `info.version` `4.1.3.105`, 157 caminhos). Endpoints de legislação, todos HTTP 200:

| Endpoint | O que entrega |
|---|---|
| `GET /dadosabertos/legislacao/lista` | Pesquisa de norma federal. Parâmetros: `tipo`, `numero`, `ano`, `data`, `seq`, `reedicao`, `ident`, `complemento` |
| `GET /dadosabertos/legislacao/urn?urn=…` | Detalhe de uma norma por URN LexML |
| `GET /dadosabertos/legislacao/tiposNorma` | Lista de tipos de norma (código, sigla, descrição, IRI) |
| `GET /dadosabertos/legislacao/tiposVide` | Lista de tipos de declaração (a kind de "referência posterior") |
| `GET /dadosabertos/legislacao/tiposPublicacao` | Lista de tipos de publicação |
| `GET /dadosabertos/legislacao/classes` | Classificação de normas jurídicas |
| `GET /dadosabertos/legislacao/termos` | Pesquisa de termos do catálogo |

**O que o detalhe por URN carrega — e por que isso serve a R1 e R2.** Na Lei nº 7.498/1986, a resposta traz `identificacao` (tipo, número, data de assinatura, `urlDocumento`), `publicacoes` (publicação original no DOU, com data, página e coluna), `vides` (normas posteriores, com o tipo da relação: regulamentação, alteração, revogação), `disps` (dispositivos com `nomeDispositivo` e a norma que os alterou), `ementa`, `catalogo` e `indexacao`. É a **única fonte verificada nesta rodada que entrega revogação e alteração como dado estruturado** — e ela serve à lei federal, não à resolução de autarquia.

[VERIFICAR: a URN exata de cada lei de enfermagem a capturar, e o `codigo` interno correspondente, antes de marcar qualquer norma com publicação ou referência posterior.]

### 3.5 Referenciais clínicos — metadado apenas

Todos já estão em `fundamento` (43 linhas) com `right_name`. **Nenhum texto integral é capturado.** A coluna `right_name` já decide: `Só metadado` (18 linhas), `Uso interno` (ABNT NBR 5891:2014), `Fonte aberta` (UCUM 2.2), `Família mista` (ALCOA+).

| Referencial | Identificador | Observação |
|---|---|---|
| NANDA-I | NANDA International, edição em uso | **[VERIFICAR: a edição vigente e o identificador oficial.]** Direito controlado + `robots.txt` 403 (desafio anti-bot) |
| NIC | *Center for Nursing Classification and Clinical Effectiveness*, College of Nursing, University of Iowa; editor Elsevier. `https://nursing.uiowa.edu/cncce/` | **[VERIFICAR: a edição vigente.]** Direito controlado. **Correção:** `nic.nip.org` **não resolve em DNS** e `www.nip.org` redireciona para a US Naval Institute Press — **não** é o editor do NIC |
| NOC | `https://noc.org/` | **[VERIFICAR: a edição vigente.]** Direito controlado. `robots.txt` legível: `Allow: /`, bloqueia só caminhos de autenticação |
| Espelho de metadado HL7 THO | `terminology.hl7.org` — Code System para NIC e NOC, com responsável, versão e URI canônica | **Metadado público.** Não é o texto licensed e não substitui a edição |
| ABNT NBR 5891:2014 (arredondamento) | `STD-ABNT-NBR5891` | Uso interno. Texto não copiado |
| ISO/IEC 11179-1:2023, 11179-3:2023, 11179-31:2023 | `STD-ISO-11179-1`, `-3`, `-31` | Metadado; o texto integral não é arquivado |
| WCAG 2.2 | — | **Já preservada** com licença W3C, em `snapshots/20261024/public-standards-w3c/wcag-2-2/` |
| UCUM 2.2 | `SPEC-UCUM22` | Fonte aberta. **Já preservada** (HTML + extração + hash) |
| eMAG 3.1 | — | **Já preservada** com CC BY 4.0 e atribuição |
| ISO 11179 / ISO 25010 / ISO 15489-1 / ISO 19011 / ISO/IEC 12207 / ISO 37301 / ISO/IEC 42001 / ISO/IEC 40500 | — | Metadado público do catálogo ISO. Preço 0 CHF **não** é licença de redistribuição |

## 4. Ordem de execução proposta

| Passo | Fonte | Tipo | Pré-condição | Saída esperada |
|---|---|---|---|---|
| P1 | `https://www.cofen.gov.br/legislacao/` | T1 da listagem | Extração confiável da listagem (hoje dá timeout) | Lista de identificadores oficiais do COFEN com URL e data — **sem** afirmar vigência |
| P2 | F1, F2, F3 (§3.1) | T1 | P1 | 3 arquivos originais + 3 textos extraídos + 6 hashes + aviso de licença |
| P3 | DOU | T1 dos atos de publicação | Rota do DOU confirmada | Evidência de data de publicação, retificação e revogação |
| P4 | NR-1, NR-7, NR-12 (MTE) | T1 | Página oficial aberta | 3 textos + **edição e data de última modificação** |
| P5 | COREN (todos) | T2/T3 | `robots.txt` legível em cada host | Registro de identificação, com jurisdição — **sem texto** |
| P6 | Referenciais | T2 | — | Confirmação de que `fundamento` está atualizado; **nenhuma cópia** |

**Cada passo produz, no mínimo:** URL exata · data e hora da requisição · status HTTP · SHA-256 do arquivo baixado · aviso de licença (quando houver) · motivo em caso de recusa ou `HOLD`.

## 5. O que este plano **não** promete

- Não promete que a listagem do COFEN abra de forma confiável por **extração de HTML**: falhou hoje (`timeout` e `file load failed`). A listagem é obtida pela **API REST do portal** (§3.1), que responde 200 — não pela página.
- Não promete acesso ao **portal** do COREN-SP: 403 em robots e nas páginas. A rota usada é a do **portal de transparência do COFEN**, que é outra coisa e não substitui o portal.
- Não promete texto integral de ISO, ABNT, NANDA, COBIT, ISACA, ITIL, COPSOQ III, ALCOA+, IEEE 754, IEC 31010, ASTM E29, ArchiMate ou COSO ERM.
- Não afirma vigência, revogação, escopo ou artigo de nenhuma resolução de enfermagem.
- Não repete nenhuma das 25 fontes transversais já preservadas.
- Não cria átomo, não decide aplicabilidade, não admite no Kernel e não publica: isso é das tarefas vizinhas, e o próprio registro de 24/10 já é explícito — *"Não houve atomização normativa homologada, teste de cláusulas, admissão no Kernel, certificação ou publicação do conteúdo."*

## 6. Pendências nomeadas desta tarefa

| # | Pendência | Efeito |
|---|---|---|
| P1 | Extração de `https://www.cofen.gov.br/legislacao/` falhou (timeout / file load failed) | A listagem de resoluções do COFEN **não** foi obtida por essa via. **Resolvida por rota:** a API REST do portal devolve 2.656 atos enumerados (§3.1). Resta casar `slug` com identificador oficial |
| P2 | `portal.coren-sp.gov.br` / `www.coren-sp.gov.br`: 403 em robots e nas páginas. `www.coren-sp.org.br` **não resolve em DNS** | Nenhuma captura planejada pelo portal do COREN-SP. A jurisdição COFEN-COREN segue **com** fonte, pela rota do portal de transparência do COFEN (§3.2) |
| P3 | Divergência de data da Res. COFEN 545/2017: 18.05.2017 (página do COFEN) × 09 de maio de 2017 (parecer do COFEN) | Data de publicação e data de entrada em vigor não podem ser afirmadas até o cotejo no DOU |
| P4 | Versões múltiplas do PDF da NR-12 no portal do MTE (2023, 2024, 2025) | Captura exige fixar edição e data de última modificação |
| P5 | Rota de consulta do DOU para resolução de autarquia federal não exercitada | Data de publicação, retificação e revogação continuam sem fonte primária conferida |
| P6 | NANDA-I / NIC / NOC: edição vigente e identificador oficial não conferidos | Só podem entrar como rótulo de identificação (T3) |
| P7 | `www.iso.org` e BVS: robots 403 | Metadado público permanece vindo do catálogo interno, sem cópia nova |
| P8 | A API do Senado não cobre resolução do COFEN | A fonte primária de publicação de resolução do COFEN é o DOU, não o Senado |
| P9 | Padrão de `sourceCanonicalId` para o conjunto de enfermagem (`enfermagem.<orgao>.<slug>.source`) é **proposta** | Precisa de homologação do dono antes de ser gravado, para casar com a chave da outra linhagem |
| P10 | `robots.txt` ilegível em 10 hosts (DNS: `*.coren-sp.org.br`, `coren.org.br`, `nic.nip.org`; 403: `portal.coren-sp.gov.br`, `www.coren-sp.gov.br`, `nanda.org`, `www.iso.org`, `bvsalud.org`, `legis.senado.leg.br`) | Em nenhum deles se pode afirmar diretiva. Captura por esses hosts fica **condicionada** a uma leitura bem-sucedida, exceto onde o plano indica rota alternativa |
| P11 | `legis.senado.leg.br/robots.txt` responde 403, embora a API responda 200 | A API é a fonte primária de lei federal **e** está em pendência de robots. Usar como **metadado e citação**, com a leitura de robots refeita no dia da captura |
| P12 | O campo `date` da API REST do COFEN é a data de **postagem no portal**, não a data do ato | Nenhuma data de ato pode ser tirada desse campo. A data vem do DOU ou do cabeçalho do PDF |

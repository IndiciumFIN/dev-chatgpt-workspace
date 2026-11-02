# Requisitos de um site de normativos — o confronto com o que existe hoje

**Tarefa:** `normas-requisitos` · **Data da medição:** 2026-10-26 (UTC) · **Árvore:** `/workspace/workspace-repo` · branch `feat/projection-unica-f0-suite-real`, `HEAD` `51dfc7b` + arquivos de trabalho de outras tarefas da rodada.

Este documento confronta o que o site tem hoje com os 11 requisitos de um site de normativos confiável. Cada item traz (a) **o que existe**, com a tabela, rota ou arquivo onde isso está; (b) **o que falta**, como tarefa nomeada; (c) **onde isso deveria morar no banco** — a tabela nova ou a coluna.

## Método e limites desta medição

- Banco medido aplicando `migrations/*.sql` (38 arquivos, ordem alfabética) num PGlite em memória, exatamente como o portão `scripts/audit-indice-banco.mjs` faz. Comando: `node scripts/audit-indice-banco.mjs`.
- **O número de tabelas é contado, nunca fixado.** Às **2026-10-26 12:50 UTC** a medição deu **96 tabelas** no banco, **94** no dicionário e **2 fora** (`kernel_approval` e `source_publication`, de `migrations/0038_processo_source.sql`, de outra tarefa). Às **13:01 UTC** o índice foi atualizado por essa outra tarefa: o portão passou a dar **96 / 96 / 96 com label / 0 fora**. Os dois números estão aqui porque **a árvore se moveu durante a tarefa** — e porque o portão não fixa número, ele conta o schema. Quem vier depois tem que rodar o portão de novo, não copiar o número desta página.
- **Divergência com o briefing:** o briefing dizia "1.767 rotas" e "só 4 com kind='norma'". A medição confirma **1767** — mas esse número é `content_text` com `status='publicado' AND review_state='revisado'`, não uma tabela de rotas. E `kind='norma'` deu **24** em `content_object`, não 4. As 4 vinham da `site_route`, tabela **retirada** em `migrations/0029_retire_duplicates.sql`. O detalhamento está em [R11](#11-cadeia-de-revisão-com-responsável).
- **`source_quote`:** o briefing dizia "coluna INEXISTENTE". Ela **existe** em `kernel_atom`, criada por `migrations/0038_processo_source.sql` (tarefa "processo de source", fora do meu escopo). O que não existe é `source_quote` em **nenhuma** tabela do conteúdo que o site publica. Ver [R4](#4-evidência-por-campo).
- `docs/governance/**` e `contracts/cko-schemas/**` **não existem nesta árvore** (a linhagem de governança é outra). Portanto o portão available aqui é `scripts/audit-indice-banco.mjs` e os contratos aplicáveis a esta entrega são os do contrato de handoff `docs/entregas/FORMATO-DE-ENTREGA.md` e o registro `docs/entregas/REGISTRO-DE-ESCRITA.md`. Isso está registrado como `NOT_RUN` no fim do documento.
- **Nenhuma afirmação normativa deste documento.** Onde a fonte não foi vista, há marcador `[VERIFICAR: ...]`.

---

## R1 — Identificação e vigência da norma

**O que existe.**
- A identificação existe **no título e no slug** do conteúdo: `content_object.slug` e `content_text.title`. Exemplo medido: `content_object` tem o slug `biblioteca/2017-conselho-federal-de-enfermagem-resolucao-cofen-no-5642017` com `origin_path` `/biblioteca/2017-conselho-federal-de-enfermagem-resolucao-cofen-no-5642017.html` (`content_object.kind='norma'`, 24 linhas).
- **A vigência não existe.** Não há nenhuma coluna de vigência em nenhuma tabela: a busca por `vigenc|revog|escopo|licen|sha|hash|copyright` em `information_schema.columns` devolveu `account.scope`, `agent.scope`, `data_specification.source`, `fundamento_pack.sha256`, `intake_batch.source`, `kernel_atom.source`, `locale.source`, `specimen.source`. Nenhuma é vigência.
- O slug carrega o ano (`...-no-5642017`), o que **é** uma codificação informal de edição — mas não é campo consultável, e o próprio `src/lib/normative-desk.ts` registra isso: *"Ano e emenda ficam no registro. O identificador não carrega a edição."* (linha `versao`, estado `Aberto`).
- A resolução COFEN nº 564/2017 aparece em `migrations/0014_site_route.sql:53` com o título *"Código de Ética de Enfermagem: Guia Resumo — Calculadoras de Enfermagem"* e a lead cita *"Resolução COFEN 564/2017"*. É a referência editorial, não um campo de vigência.

**O que falta.**
1. `T-R1.1` — tabela de norma com identificador oficial, órgão emissor, tipo, data de publicação, data de entrada em vigor, situação (vigente/revogada/altera) e escopo, **um campo por vez**, populada a partir da fonte oficial conferida.
2. `T-R1.2` — resolver o que "vigente" significa para cada ato: a data de publicação no DOU **não** é a data de entrada em vigor quando há vacatio legis. [VERIFICAR: para cada resolução COFEN candidata, a data de publicação no DOU e a data de entrada em vigor, conferidas no DOU.]
   **Rota de captura já verificada** (ver `docs/normativos/plano-de-captura.md` §3.1 e §3.4): a API REST do portal do COFEN (`GET https://www.cofen.gov.br/wp-json/wp/v2/lei`, **HTTP 200**, `X-WP-Total: 2656`) enumera os atos com URL canônica; a API de Dados Abertos do Senado (`GET /dadosabertos/legislacao/urn?urn=…`, **HTTP 200**) traz `publicacoes` com o DOU (data, página, coluna) e **`vides`** com as normas posteriores — mas **não cobre resolução do COFEN** (`lista?tipo=RES&numero=545&ano=2017` e `…&numero=564&ano=2017` devolvem `documentos` vazio). **Armadilha medida:** o campo `date` da API do COFEN é a data de **postagem no portal**, não a data do ato.
3. `T-R1.3` — ligação entre o texto publicado (`content_text`) e a norma que ele interpreta, hoje inexistente: `content_text` não tem nenhuma coluna que diga de qual norma é o resumo.

**Onde deve morer.**
- Tabela nova `norma` (ver a proposta consolidada em [R12](#r12--onde-cada-coisa-deve-morar-resumo-da-migração)), com `identificador_oficial` como chave natural e `content_object.slug` referenciando-a por coluna nova `content_object.norma_id`.
- Coluna `norma.situacao` com domínio fechado (`vigente`, `revogada`, `alterada`, `parcialmente_revogada`, `indeterminada`) e `norma.vigencia_inicio`, `norma.vigencia_fim`, `norma.observacao_vigencia` (texto livre para a data de corte da verificação).

---

## R2 — Revogação e alterações

**O que existe.**
- **Nada estruturado.** A única menção a revogação que existe em toda a árvore é uma citação dentro do texto transcrito de um PDF oficial (`migrations/0015_site_route_body.sql`, Referências): *"A Resolução Cofen nº 545/2017. Revogou a Resolução Cofen nº 191/1996."* — ou seja, a revogação vive **dentro do corpo textual de uma página**, sem campo, sem data e sem vínculo.
- `document_version` tem a forma certa (`item_id`, `version`, `status`, `approved_by`, `approved_at`, `reason`) mas está **vazia (0 linhas)** e não é lida por nenhuma rota.
- O `index-manifest` da aquisição transversal já tem o vocabulário certo para a parte técnica: por fonte, `repeatedArticleNumbersForReview`, `possibleMultipleActsOrAnnexes`, `repeatedArticleNumberCount` (21 fontes, 1577 fatias). Isso é **extração de artigo**, não revogação.

**O que falta.**
1. `T-R2.1` — registrar revogação como **dado**, com a norma que revoga, a norma revogada, a data e o trecho literal. Hoje não há onde.
   **Fonte já verificada para a lei federal:** a API de Dados Abertos do Senado entrega a relação como dado estruturado — no detalhe por URN, o campo **`vides`** lista as normas posteriores com o tipo da relação (regulamentação, alteração, revogação) e o campo **`disps`** liga cada dispositivo alterado à norma que o alterou. Verificado nesta rodada em `legis.senado.leg.br/dadosabertos/legislacao/urn?urn=urn:lex:br:federal:lei:1986-06-25;7498` (HTTP 200). **Limite:** essa API **não cobre resolução do COFEN** — para resolução de autarquia federal, revogação e retificação vêm do **DOU**. [VERIFICAR: a URN exata de cada lei a capturar e o `codigo` correspondente, antes de marcar qualquer norma com referência posterior.]
2. `T-R2.2` — tratar a retificação como caso de primeiro classe: a Resolução ANPD 19/2024 foi objeto de retificação em 2025 e o próprio registro de 24/10 (`docs/governance/TRANSVERSAL-ACQUISITION-STATUS-20261024.md`, outra linhagem) diz que *"o cotejo com a edição do Diário Oficial permanece obrigatório"*. O modelo de dados atual não tem `retifica` nem `retificada_por`.
3. `T-R2.3` — `T-R2.3.1` — popular `document_version` ou decidir que ela é a mesa errada (hoje ela não é lida por nada).

**Onde deve morer.**
- Tabela nova `norma_relacao` (`norma_id`, `norma_relacionada_id`, `tipo` ∈ `revoga`, `revogada_por`, `altera`, `alterada_por`, `retifica`, `retificada_por`, `complementa`, `substitui`; `data`, `pinpoint`, `source_quote`).
- `document_version` recebe `norma_id` se for mantida; caso contrário, uma `norma_versao` própria, porque `document_version` hoje não tem dono de leitura.

---

## R3 — Escopo e aplicabilidade

**O que existe.**
- `fundamento` tem **43 linhas** com `id`, `name`, `domain`, `right_name` e `priority` — é o registro de referências normativas do produto, lido pela área admin (`src/components/admin/governance.tsx:51-56`, que filtra por `id`, `name` e `domain`). O `right_name` já codifica o direito: `Só metadado`, `Uso interno`, `Fonte aberta`, `Família mista`.
- `specimen` tem 2 linhas e `specimen_line` 170 — o texto de um piloto normativo (Lei nº 7.498/1986 transcrita) com a procedência declarada em texto livre: `specimen.source = 'Texto transcrito do piloto normativo, fonte Planaltão consolidado.'`
- A aplicabilidade **existe como conteúdo, não como coluna**: `src/lib/normative-desk.ts` mostra a cadeia `fonte → versao → atomo → requisito → ferramenta` com `fonte: Parcial`, `versao: Aberto`, `atomo: Bloqueado`, `requisito: Não emitido`, `ferramenta: No código`.

**O que falta.**
1. `T-R3.1` — escopo e aplicabilidade por norma, em campos: a quem se aplica, a quem **não** se aplica, exceções e exclusões. A exclusão é justamente o que a auditoria de 24/10 registrou no caso IFRS S1/S2 (`NOT_APPLICABLE_JUSTIFIED`) — hoje esse julgamento não tem onde ser gravado.
2. `T-R3.2` — separar **o que a norma diz** de **o que ela permite** de **o que a literatura discute**. Hoje o site não tem nenhuma tabela que sustente essa separação; o `specimen` mistura os três no mesmo `specimen_line.text`.
3. `T-R3.3` — `T-R3.3.1` — a decisão de aplicabilidade precisa registrar quem decidiu e por quê, como `policy_decision` registra, e não como texto solto em `specimen.source`.

**Onde deve morer.**
- Colunas novas em `norma`: `escopo_texto`, `aplicavel_a`, `nao_aplicavel_a`, `excecoes`.
- Tabela nova `norma_aplicabilidade` (`norma_id`, `escopo`, `justificativa`, `exclusoes`, `decisao` ∈ `aplicavel`, `nao_aplicavel_justificado`, `hold_humano`, `decidido_por`, `decidido_em`).
- `fundamento` recebe `norma_id` (nullable) e passa a apontar para a norma em vez de repetir `name` em texto.

---

## R4 — Evidência por campo

**O que existe.**
- `kernel_atom` **tem** `source_quote`, `pinpoint` e `source_quote_sha256` (colunas criadas por `migrations/0038_processo_source.sql`, linha 42-44, e descritas em `schema_column` na linha 119-121: *"Trecho literal da fonte que sustenta o átomo."*). As 4 linhas de `kernel_atom` estão preenchidas e com hash.
- `fundamento_pack` tem `sha256` e `exact_text` (1 linha, o pacote atômico).
- `intake_file` e `intake_batch` (tabelas de captura) têm `source`.
- **O que não existe:** nenhuma coluna de evidência em `content_text`, `content_object`, `content_alias`, `fundamento` ou `specimen`. A página pública de uma norma é um `content_text.body` com a fonte citada no final do texto, sem hash e sem vínculo verificável.

**O que falta.**
1. `T-R4.1` — `source_quote` (ou equivalente) em **todo** campo que carrega uma afirmação normativa publicada: hoje um parágrafo que resume a Resolução 564/2017 na página `/codigo_de_etica_enfermagem.html` não tem como dizer de qual artigo saiu.
2. `T-R4.2` — o hash do trecho literal, para travar a citação contra alteração do texto publicado. O padrão já existe em `kernel_atom.source_quote_sha256` e não precisa ser inventado.
3. `T-R4.3` — `pinpoint` no mesmo formato do `article-index`: rótulo impresso (`"Art. 3º"`), número impresso, byte inicial, byte final e `sliceSha256`. O `article-index/20261024` já produz 1577 fatias com esse formato, **com `reviewed: false`** — ou seja, o insumo existe, mas não foi revisado.

**Onde deve morer.**
- Colunas novas em `content_text`: `source_quote`, `source_quote_sha256`, `pinpoint`, `norma_id` (nullable) — para o texto publicado.
- Tabela nova `evidencia_campo` (`entidade`, `entidade_id`, `campo`, `pinpoint`, `source_quote`, `source_quote_sha256`, `source_canonical_id`, `revisado_por`, `revisado_em`, `status`) quando a evidência precisar ser many-to-many (um parágrafo apoiado em dois artigos).

---

## R5 — Busca com filtro

**O que existe.**
- A busca pública é **substring dentro de uma seção**: `src/components/site/section-page.tsx:91-95`, função `matches`:
  ```ts
  function matches(item: CatalogItem, query: string) {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return `${item.title} ${item.text}`.toLowerCase().includes(q);
  }
  ```
  Ela filtra `section.blocks` — os blocos **de uma seção**. Não há índice, nem full-text, nem filtro por órgão, tipo, ano, situação de vigência, escopo ou identificador oficial.
- A busca da área admin é melhor, mas restrita: `src/components/admin/governance.tsx:53-54` filtra `fundamento` por `id + name + domain` e por um seletor de domínio. É busca de metadado, sobre 43 registros, sem vigência e sem trecho.
- Não há busca que atravesse as 24 páginas `kind='norma'` nem que encontre pelo identificador oficial (`"564/2017"`, `"Resolução COFEN nº 564"`).

**O que falta.**
1. `T-R5.1` — busca pública de norma com filtro por: órgão emissor, tipo, situação de vigência, ano do identificador, escopo e identifier oficial exato.
2. `T-R5.2` — busca que **não confunda** a norma com o guia que a resume: hoje `/legislacoes.html` e `/biblioteca/...-resolucao-cofen-no-5642017.html` são o mesmo tipo (`norma`) e não se distinguem por um campo.
3. `T-R5.3` — busca por trecho literal, para achar a norma pelo texto de um artigo: só é possível depois de R4.

**Onde deve morer.**
- Colunas novas em `norma` (e índice): `orgao_emissor`, `tipo_norma`, `situacao`, `ano_identificador`, `identificador_busca` (normalizado, para casar `"564/2017"`, `"nº 564/2017"`, `"564 2017"`).
- O índice de busca não é uma tabela nova: é `pg_trgm`/GIN sobre `norma.identificador_busca` e `content_text` — a decisão fica para quem escreve a migration, não para este documento.

---

## R6 — Transparência editorial

**O que existe.**
- **A Central Editorial existe e é real**: `inst_page` tem 29 linhas, e há 6 páginas editoriais (`migrations/0030_stored_files.sql`): `editorial/politica-editorial`, `editorial/fontes-e-evidencias`, `editorial/correcoes-e-erratas`, `editorial/aviso-clinico`, `editorial/uso-responsavel-de-ia`, `editorial/auditoria-governanca-regulatoria`. `inst_section` tem 142 linhas no total.
- Há um canal de correção no produto: `src/components/site/page-tools.tsx:100` ("Reportar correção") e `src/components/tools/tool-desk.tsx:83` ("Corrigir"), ambos apontando para a seção `contato`.
- `src/lib/normative-desk.ts` declara, em texto, os limites da mesa admin: *"Nada desta mesa vai a publicado. Aprovar um cartão não abre o portão."*
- A regra editorial existe, mas **fora do banco**: é TypeScript em `src/lib/normative-desk.ts` (`deskGates`, `extractionQueue`, `lineageSteps`, `atomQueue`) e em `src/lib/admin-catalog.ts` (`adminModules` com `purpose`, `submodules`, `receives`, `sends`, `screen`).

**O que falta.**
1. `T-R6.1` — a política editorial como **dado versionado**, com data de vigência e responsável, não como array de string em código. Hoje mudar a política é um deploy; o site não consegue dizer qual política estava valendo quando uma norma foi publicada.
2. `T-R6.2` — política de **correção e errata** com vínculo ao item corrigido. A página `editorial/correcoes-e-erratas` existe, mas não há tabela que relacione a errata à norma afetada.
3. `T-R6.3` — a página de norma precisa declarar, no próprio texto, o **grau de fidelidade** ao original: o `index-manifest` já distingue `RAW_SOURCE_SNAPSHOT_NOT_KERNEL_ADMISSION` e `extractionReviewed: false`; nada disso chega ao leitor.
4. `T-R6.4` — `T-R6.4.1` — `editorial_line` tem 5 linhas de exemplo (TPL-001) e existe para carregar texto editorial; falta ligar a linha editorial à norma a que ela se refere.

**Onde deve morer.**
- Tabela nova `editorial_politica` (`id`, `tipo`, `versao`, `vigencia_inicio`, `texto`, `responsavel`, `aprovada_por`, `aprovada_em`, `status`) — ou, se a página `inst_page` for mantida como fonte, `editorial_line` recebe `norma_id` e `vigencia_inicio`.
- Tabela nova `errata` (`norma_id`, `data`, `descricao`, `source_quote`, `pinpoint`, `publicada_em`).

---

## R7 — Declaração de acessibilidade (WCAG)

**O que existe.**
- A página `acessibilidade/declaracao-de-acessibilidade` existe e **declara um padrão**: *"Adotamos como referência as Diretrizes de Acessibilidade para Conteúdo Web (WCAG) 2.2, nível AA"*.
- O código tem o que a declaração promete: `skip-link` (`src/components/site/shell.tsx:192`), `role="toolbar"` na barra de acessibilidade (linha 264), `aria-label` nos controles, `role="dialog"` nos diálogos, foco gerenciado no menu lateral (linha 418).
- A especificação **WCAG 2.2** está preservada com hash em `audit-evidence/transversal-acquisition/snapshots/20261024/public-standards-w3c/wcag-2-2/` (HTML original sem modificação + `LICENSE-AND-ATTRIBUTION.txt`), com licença de redistribuição da W3C.
- **Pendências dentro da própria declaração** (medidas no texto atual): a seção *"5. Limitações conhecidas"* tem o corpo literal `PENDENTE: listar as limitações conhecidas e o prazo previsto para cada correção.` e a seção *"6. Encontrou uma barreira?"* termina com `Prazo de resposta: PENDENTE.`

**O que falta.**
1. `T-R7.1` — preencher as duas pendências acima. Uma declaração de acessibilidade que declara um padrão e não declara limitações conhecidas nem prazo de resposta é incompleta por si.
2. `T-R7.2` — **datar** a declaração e registrar a data da última avaliação. O texto hoje não tem data de avaliação; a WCAG 2.2 preservada dá o padrão de referência, mas não a constatação.
3. `T-R7.3` — a conformidade **declarada** precisa de evidência: qual o escopo avaliado (quais páginas), por quem, e o resultado. Sem isso, "nível AA" é afirmação sem lastro.
4. `T-R7.4` — canal de reporte de barreira com prazo: existe o e-mail `ciadeenfermagem@gmail.com` no texto; falta o prazo preenchido.

**Onde deve morer.**
- Colunas novas em `inst_page` (ou tabela nova `acessibilidade_declaracao`): `padrao_referencia` (`WCAG 2.2`), `nivel` (`AA`), `data_avaliacao`, `escopo_avaliado`, `resultado`, `ultima_revisao`, `proxima_revisao`.
- Tabela nova `acessibilidade_pendencia` (`pagina`, `descricao`, `prazo`, `status`, `resolvido_em`).

---

## R8 — Sustentabilidade digital

**O que existe.**
- A **Central de Sustentabilidade Digital existe**: `inst_page` tem `sustentabilidade` (hub), `sustentabilidade/compromisso-e-praticas`, `sustentabilidade/metodologia-de-medicao` e `sustentabilidade/relatorios-de-sustentabilidade`.
- O repositório já guarda o **eMAG 3.1** com CC BY 4.0 e atribuição, em `audit-evidence/transversal-acquisition/snapshots/20261024-extended/emag/` (4 arquivos: `original.html`, `extracted.txt`, `evidence.json`, `LICENSE-AND-ATTRIBUTION.txt`).
- A auditoria transversal preservou **3 especificações W3C** com aviso de licença ao lado: PROV-O, WCAG 2.2 e SHACL.

**O que falta.**
1. `T-R8.1` — a página "Relatórios de sustentabilidade digital" precisa de **número com data de medição e metodologia declarada**, não de promessa. O eMAG 3.1 é de abril/2014 (dado do próprio `LICENSE-AND-ATTRIBUTION.txt` preservado) — usá-lo como métrica atual sem registrar essa defasagem seria erro.
2. `T-R8.2` — os relatórios são estáticos hoje; não há série histórica, nem data de coleta, nem o que foi medido em cada página. Sem `data_medição` e `escopo`, o número não é auditável.
3. `T-R8.3` — o `evidence.json` do eMAG e o `index-manifest` são evidência **de aquisição**, não de medição de sustentabilidade. Não devem ser contabilizados como relatório.

**Onde deve morer.**
- Tabela nova `sustentabilidade_medicao` (`data_medicao`, `escopo`, `metodo`, `indicador`, `valor`, `unidade`, `fonte`, `nota`).
- Colunas novas em `inst_page` para `sustentabilidade/relatorios-de-sustentabilidade`: `ultima_medicao`, `proxima_medicao`.

---

## R9 — LGPD e privacidade

**O que existe.**
- A **Central de Privacidade existe**: `inst_page` tem `privacidade` (hub), `privacidade/politica-de-privacidade` e `privacidade/cookies-e-consentimento`.
- O texto da política é concreto e verificável: *"Não exigimos cadastro para usar as calculadoras. Os dados clínicos digitados são processados no seu navegador e não são enviados aos nossos servidores."* e *"Os valores digitados nas calculadoras são processados no seu navegador e não ficam salvos em cookies nem são enviados aos nossos servidores."*
- O consentimento tem banner: `src/components/site/shell.tsx:484`, `<div className="cookie-banner" role="dialog" aria-labelledby="cookie-title">`.
- Há um banner de transparência sobre IA: `privacidade/cookies-e-consentimento` seção 6 — *"Ferramentas de IA podem apoiar pesquisa, organização e conferência do texto, mas não constituem autoridade científica ou regulatória e não substituem a revisão humana, a competência profissional nem as fontes oficiais."*
- As tabelas que guardam dado pessoal existem e são legíveis no dicionário: `user`, `session`, `account`, `verification`, `member`, `subscription`, `community_post`.

**O que falta.**
1. `T-R9.1` — a política precisa de **data de vigência, responsável e prazo de resposta** ao titular, e o registro de requisições de derechos (acesso, portabilidade, eliminação). Hoje não há tabela de requisição de titular — a central `assinante/conta-e-exclusao-de-dados` promete a exclusão, e não há onde registrar o pedido.
2. `T-R9.2` — inventário de dado pessoal por tabela/coluna, com base legal e prazo de retenção. Hoje o dicionário (`schema_entity`, `schema_column`) descreve **nome e propósito**, mas não o **tratamento** — não há coluna de dado pessoal, base legal ou retenção. Como a COI/ANPD exige inventário, isso é lacuna concreta.
3. `T-R9.3` — `T-R9.3.1` — o banner de cookie precisa registrar o consentimento versionado (versão do texto aceito + data), para provar o que o titular aceitou. A tabela `policy_ack` existe e está vazia — é o lugar natural.
4. `T-R9.4` — a política rege os dados do **usuário**; ela não diz nada sobre os dados que a **aquisição normativa** cria (metadado, hash, trecho). Um site de normativos que publica norma pública cria um registro de leitura; isso precisa estar na política.

**Onde deve morer.**
- Colunas novas em `schema_column` (ou tabela nova `dado_pessoal`): `eh_dado_pessoal`, `base_legal`, `prazo_retencao`, `titular`.
- Tabela nova `request_titular` (`tipo`, `descricao`, `status`, `recebido_em`, `respondido_em`, `respondido_por`).
- `policy_ack` passa a receber a versão do texto de consentimento aceito.

---

## R10 — Canal de contato

**O que existe.**
- **Existe e é navegável**: `nav_item` id `contato` (posição 9, "Fale Conosco", `dest_kind='section'`, `dest_slug='contato'`), mais `institutional-target.ts:6` mapeia `sobre/fale-conosco → section: contato`, e `inst_page` tem `sobre/fale-conosco`.
- Há **dois canais de uso normativo** dentro do produto: "Reportar correção" (`src/components/site/page-tools.tsx:100`) e "Corrigir" (`src/components/tools/tool-desk.tsx:83`).
- O formulário de contato renderiza em `src/components/site/section-page.tsx:225-226` (seção `contato-form`, "Mensagem").
- A declaração de acessibilidade dá o e-mail direto: `ciadeenfermagem@gmail.com`.
- Existe uma seção `contato` com `kind = "contact"` no componente de seção (`section-page.tsx:215`).

**O que falta.**
1. `T-R10.1` — o formulário de contato **não grava em tabela nenhuma**: `onContact` (`section-page.tsx`) só seta `sent` local. Não há fila de mensagens, prazo, responsável nem histórico. A promessa institucional de "Fale conosco" não tem backend.
2. `T-R10.2` — **não há canal específico para "esta norma está desatualizada"**. Os dois links existentes ("Reportar correção", "Corrigir") apontam para o mesmo contato genérico, sem o identificador da norma anexado, sem `pinpoint` e sem prioridade de triagem.
3. `T-R10.3` — prazo de resposta declarado. Na declaração de acessibilidade ele está escrito `Prazo de resposta: PENDENTE.`
4. `T-R10.4` — o relatório de correção precisa gerar registro versionado (quem reportou, o que, o que foi feito, quando), para alimentar a errata (R6.2).

**Onde deve morer.**
- Tabela nova `contato_mensagem` (`canal`, `assunto`, `corpo`, `norma_id` nullable, `pinpoint` nullable, `status`, `recebido_em`, `prazo_resposta`, `respondido_em`, `respondido_por`).
- Tabela nova `sugestao_correcao` ou reaproveitamento de `suggestion` (que hoje tem 0 linhas) com `norma_id` e `pinpoint`.

---

## R11 — Cadeia de revisão com responsável

**O que existe.**
- A cadeia de aprovação do Kernel **existe no desenho** e está sendo completada por outra tarefa: `migrations/0038_processo_source.sql` cria `kernel_approval` (`order_id`, `approver`, ...), acrescenta `owner_id`, `source_ref`, `hash` e `acceptance_criteria` a `kernel_order`, e `hash`, `approved_at`, `policy_set`, `validators`, `evidence_ref` a `kernel_manifest`. O `kernel_atom` já tem `admitted_by` e `admitted_at` — as 4 linhas existentes estão com `admitted_by = 'derby-normalizacao'` e `admitted_at = '2026-10-26T12:48:55.149Z'`.
- A revisão editorial **existe como campo**: `content_text.review_state`, com dois valores em uso — `revisado` (1767 linhas) e `DERBY` (2158 linhas).
- `document_version` tem `approved_by`, `approved_at`, `reason` — e está **vazia**.
- `ops_record` existe e está **vazia** (0 linhas) — é a mesa de registro operacional, criada em `migrations/0034_ops_record.sql`.
- `policy_rule` tem 16 linhas; `policy_decision`, `policy_ack` existem.

**O que falta.**
1. `T-R11.1` — `review_state` tem **dois** estados e nenhum dono: `revisado` não diz **quem** revisou nem **quando**, e `DERBY` não diz o que falta. Falta a terceira peça: responsável, data e evidência da revisão.
2. `T-R11.2` — **independência da aprovação**: a regra de que o Kernel não é aprovador existe no código (`src/lib/normative-desk.ts`: *"Agente desbloqueado revisa. Não escreve a fonte e não publica."* — e está fixado como átomo `atom-agente`), mas não há coluna que impeça o aprovador de ser o mesmo que redigiu.
3. `T-R11.3` — `T-R11.3.1` — `document_version` e `ops_record` vazias são duas telas de revisão que não registram nada. Ou entram em uso, ou saem do dicionário — deixar mesa vazia no dicionário é pior que não tê-la.
4. `T-R11.4` — cadeia que vai da **fonte oficial** até a **publicação**: hoje ela é uma lista estática (`lineageSteps` em `src/lib/normative-desk.ts`) com estado literal escrito à mão ("Parcial", "Aberto", "Bloqueado", "Não emitido", "No código"). Esse texto envelhece e mente. Precisa vir do banco.
5. `T-R11.5` — o estado `DERBY` em 2158 linhas de `content_text` é o marcador honesto de pendência humana; **cada uma dessas 2158 linhas precisa dizer o que falta** para virar revisada, e não apenas carregar o rótulo.

**Onde deve morer.**
- Colunas novas em `content_text`: `reviewed_by`, `reviewed_at`, `review_note`.
- `document_version` recebe `norma_id` e passa a ser lida; `ops_record` passa a registrar cada passagem da cadeia.
- Tabela nova `norma_cadeia` (`norma_id`, `etapa` ∈ `fonte`, `versao`, `captura`, `atomo`, `admissao`, `revisao`, `publicacao`; `status`, `responsavel`, `em`, `evidencia_ref`) — é a tabela que substitui `lineageSteps`.

---

## R12 — Onde cada coisa deve morar (resumo da migração)

Consolidado. A coluna `norma` e as tabelas `norma_relacao`, `norma_aplicabilidade`, `norma_cadeia`, `editorial_politica`, `errata`, `contato_mensagem`, `sustentabilidade_medicao`, `acessibilidade_pendencia` e `request_titular` são **tabelas novas**; as demais são **colunas novas**. Os números de migration não são fixados aqui — a reserva desta rodada é `0038` (processo de source), `0039` (políticas) e `0040` (átomos), e nenhuma delas é minha.

| Requisito | Tabela/coluna nova | Tabela existente que ganha coluna |
|---|---|---|
| R1 identificação e vigência | `norma` | `content_object.norma_id` |
| R2 revogação e alterações | `norma_relacao` | `document_version.norma_id` |
| R3 escopo e aplicabilidade | `norma_aplicabilidade` | `norma.escopo_texto`, `norma.aplicavel_a`, `norma.nao_aplicavel_a`, `norma.excecoes`, `fundamento.norma_id` |
| R4 evidência por campo | `evidencia_campo` | `content_text.source_quote`, `content_text.source_quote_sha256`, `content_text.pinpoint`, `content_text.norma_id` |
| R5 busca com filtro | — (índice GIN/trgm) | `norma.orgao_emissor`, `norma.tipo_norma`, `norma.situacao`, `norma.ano_identificador`, `norma.identificador_busca` |
| R6 transparência editorial | `editorial_politica`, `errata` | `editorial_line.norma_id`, `editorial_line.vigencia_inicio` |
| R7 acessibilidade | `acessibilidade_pendencia` | `inst_page.padrao_referencia`, `inst_page.nivel`, `inst_page.data_avaliacao`, `inst_page.escopo_avaliado` |
| R8 sustentabilidade digital | `sustentabilidade_medicao` | `inst_page.ultima_medicao`, `inst_page.proxima_medicao` |
| R9 LGPD e privacidade | `request_titular`, `dado_pessoal` | `schema_column.eh_dado_pessoal`, `schema_column.base_legal`, `schema_column.prazo_retencao`, `policy_ack.versao_texto` |
| R10 canal de contato | `contato_mensagem` | `suggestion.norma_id`, `suggestion.pinpoint` |
| R11 cadeia de revisão | `norma_cadeia` | `content_text.reviewed_by`, `content_text.reviewed_at`, `content_text.review_note` |

**Regra que atravessa todos:** nenhuma coluna de vigência, escopo, evidência ou revisão pode ser preenchida com texto de blog, com resumo de terceiro ou com memória. Onde a fonte oficial não foi conferida, o valor é `DERBY` e a pendência fica nomeada — nunca uma afirmação inventada.

---

## Lista de NOT_RUN desta tarefa

| # | O que não foi verificado | Por quê | Quem resolve |
|---|---|---|---|
| N1 | `docs/governance/**` e `contracts/cko-schemas/**` | Não existem nesta árvore (linhagem de governança é outra). O portão aplicável aqui é `scripts/audit-indice-banco.mjs`; o gate do Kernel é `NOT_RUN` | Verificação final, sobre a linhagem que os contém |
| N2 | Vigência de qualquer resolução de enfermagem | Não conferi o DOU nesta tarefa; a tarefa de atomização e a de captura são donas disso | Captura |
| N3 | `kind='norma'` = 24 vs 4 do briefing | Divergência explained (a `site_route` foi retirada em 0029); falta reconciliar com a medição do dono | Dono / verificação final |
| N4 | Número de tabelas no banco **vivo** (Neon) | Só medi o PGlite local (96 em 2026-10-26 12:50 UTC). O dono reportou 98 em 26/10 | Dono, com `DATABASE_URL` |
| N5 | `migrations/0038_processo_source.sql` e `migrations/0037_preencher_derby.sql` | São de outras tarefas e entraram na árvore durante a medição; a contagem de tabelas que registrei as inclui | Tarefas donas, depois |
| N6 | Acessibilidade real (auditoria WCAG) | Só li o que o site **declara** e o que o código mostra; não rodei auditoria nem leitor de tela | Tarefa de acessibilidade |
| N7 | LGPD: base legal e prazo por coluna | Não existe o dado no banco; inferir seria inventar | Tarefa de LGPD / privacidade |
| N8 | Formulário de contato: onde a mensagem vai | `onContact` não grava; não há fila. Não criei a tabela porque é migration de outra tarefa | Tarefa de conteúdo / backend |

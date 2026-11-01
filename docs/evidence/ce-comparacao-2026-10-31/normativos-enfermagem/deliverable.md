# Deliverable — Normativos de enfermagem: o que a produção afirma e que fonte sustenta cada afirmação

**Agente:** `normas-enfermagem` · **Data:** 2026-11-01 · **Pacote:** `evidence_pack/E3-normativos.md` (+ `E1-producao.md`)
**Árvore de trabalho:** `/workspace/workspace-repo` (leitura apenas) · **Capturas desta frente:** `outputs/normativos-enfermagem/capturas-2026-11-01/`

---

## 1. Summary

Auditei as 15 afirmações normativas que a produção publica (extraídas de E1 e confirmadas nas páginas reais do produto) contra a fonte preservada, e capturei **6 fontes primárias** que o repo ainda não tinha (Parecer Normativo COFEN 1/2024, Res. COFEN 736/2024, Res. COFEN 564/2017, Res. COFEN 545/2017, Parecer CFM 28/2020, Portaria GM/MS 6.734/2025) — todas com SHA-256 registado e pinpoints anotados. O resultado: **4 afirmações sustentadas**, **4 apenas metadado**, **6 não verificadas** e **2 divergentes** (A3 é contada nos dois primeiros estados: o ato está confirmado, o Anexo não) — a divergência de Aldrete (corte de 9 pontos no site contra "8 pontos ou mais" do CFM) está agora provada com a fonte primária em mãos, e há ainda três achados novos de risco clínico que o repo não registava (obsolência da lista de notificação compulsória, base NANDA/NIC sem edição nem direitos, e colisão de contrato entre `tool-sources.v1.json`/`tool-bindings.v1.json` e os schemas CKO canónicos). O esqueleto CE não pode admitir nenhum objeto clínico-normativo sem `authorityBinding` por campo; hoje ele não tem schema para `Norm` nem campos de origem/edição/pinpoint/direitos nos outros três.

---

## 2. Método, limites e regras aplicadas

### 2.1 As quatro perguntas (doutrina `agents/normativos-licenciados.md` §2, rev 1.1.0)

Cada linha das tabelas responde separadamente a: **(a)** qual é a fonte; **(b)** que material foi consultado; **(c)** que direitos existem; **(d)** o que a evidência comprova. As colunas da Tabela 1 são essas respostas, não níveis.

### 2.2 Como cada afirmação é verificada (as quatro perguntas da doutrina, não um enum)

A doutrina canónica (`agents/normativos-licenciados.md`, CKO-AI-INS-LIC-001 rev 1.1.0) **proíbe inventar enums para classificar evidência** e diz que as quatro perguntas **não são níveis nem estados**. Por isso esta frente **não classifica** as afirmações: para cada uma, responde separadamente a (a) fonte, (b) material consultado, (c) direitos, (d) o que a evidência comprova.

**Correção (rev. 2, owner):** a versão anterior desta secção definia quatro rótulos transversais (`SUSTENTADA` / `METADADO APENAS` / `NÃO VERIFICADA` / `DIVERGENTE`) para classificar as afirmações. Isso é exactamente o enum que a doutrina proíbe, e foi removido. As **observações de facto** que os rótulos descreviam foram mantidas — mas reescritas como respostas às quatro perguntas, e a **classificação canónica** ficou registada como FIND (secção 6), porque só o processo de governança a pode criar.

| Pergunta | Como esta frente responde |
|---|---|
| **(a) Qual é a fonte?** | A norma invocada pela produção, com o identificador oficial quando existe (id Senado, número/ano, publicação no DOU com página e coluna). |
| **(b) Que material foi consultado?** | É dito **o que se tem**: texto integral do ato (capturado e com SHA-256 em `capturas-2026-11-01/`), apenas o enunciado/ementa e o índice de dispositivos, ou nada. A tabela 1 diz, em cada linha, exactamente o que foi obtido. |
| **(c) Que direitos existem para o uso proposto?** | Aplicação proporcional: leitura de fonte oficial e citação com pinpoint. **Distribuição, licenciamento e reutilização de conteúdo normativo não estão comprovados** → onde interessa (terminologias NANDA/NIC), o átomo fica `HOLD`. Os PDFs do Cofen foram **citados por link, não redistribuídos**. |
| **(d) O que a evidência comprova?** | Distingue-se o que o material sustenta (existência, identificação, vigência, texto de cláusula) do que **não** sustenta (interpretação clínica, faixa de escore, classificação diagnóstica). |

**Invariante mantida:** *metadado oficial não demonstra conteúdo de cláusula; norma citada não significa certificação; hash atesta os bytes comparados, não a correção do conteúdo.*

**Sobre a palavra "sustentada" que aparece na Tabela 1:** é usada como **descrição operacional desta frente** ("o material obtido sustenta esta afirmação específica"), não como estado canónico. Onde a classificação em rótulos é necessária para o processo, ela fica em FIND (secção 6) e é o Kernel que decide.

### 2.3 Captura: regras aplicadas

- **robots.txt lido antes de cada host.** `in.gov.br` → `User-agent: * / Disallow: /` → **nenhum conteúdo do DOU foi usado como insumo**. `cofen.gov.br` → `robots.txt` devolveu página de WAF (418) → sem diretivas legíveis; os PDFs oficiais foram obtidos e citados como link, não redistribuídos. `sistemas.cfm.org.br` → `robots.txt` 403. `gov.br` e `bvsms.saude.gov.br` → permitidos. `normas.leg.br` → `Allow: /`. `lexml.gov.br` → `Allow: /urn`, `Crawl-delay: 5`.
- **Rate limit:** 1 req/s por host, com intervalo de 1,5 s nas capturas do mesmo host.
- **Registo de cada captura:** URL, HTTP, data, SHA-256 e motivo da recusa em `capturas-2026-11-01/SHA256SUMS.txt` e na secção 8.
- **Manifesto de integridade (rev. 2, owner):** o `SHA256SUMS.txt` foi **reconstruído** e agora cobre **os 36 ficheiros capturados**, um por linha, em formato `sha256sum` verificável (`sha256sum -c SHA256SUMS.txt` → **36/36 OK**). A versão anterior tinha **22 linhas** (ficheiros por capturar) e continha uma **auto-referência inválida** — a primeira linha era o SHA-256 do ficheiro *vazio* (`e3b0c442…b855`) atribuído ao próprio manifesto, e `sha256sum -c` acusava 1 divergência. **O manifesto já não se inclui a si próprio.** Regra que fica registada: **o hash atesta a integridade dos BYTES comparados, não a correção do conteúdo nem a licitude da fonte** — um PDF que volta com o hash certo pode continuar a ser um PDF que não diz o que a linha da tabela afirma.
- **Nada foi apagado.** Nenhum ficheiro pré-existente do repo foi modificado; nenhuma criação no `main`.
- **Limite técnico do Senado (repetido, com todas as letras):** a API de Dados Abertos do Senado **não devolve texto integral de artigos**. Devolve identificação, ementa, catálogo/sumário, `vides` (referências posteriores), `edivs`, `disps` (referências por dispositivo) e indexação. Onde uso "metadado apenas" para as três leis, é porque o texto dos artigos **não** foi obtido.

### 2.4 O que mudou em relação ao E1

O E1 declarava `web_fetch` do site como falhado por timeout. ** nesta frente o site respondeu** (HTTP 200 em todas as páginas normativas capturadas) e o `sitemap.xml` (1.804 URLs) foi obtido. Isto permitiu verificar afirmações que o E1 só tinha por extração indexada. Divergência entre E1 e o observado: o E1 diz "30q" para o simulado de notificação compulsória; a `<meta description>` ao vivo diz **"50 questões"** — registo as duas.

---

## 3. Tabela 1 — Afirmação normativa visível na produção → fonte exigida → estado → obrigação para o esqueleto → evidência

### 3.1 Fontes primárias obtidas nesta frente

| # | Fonte | SHA-256 (prefixo) | Pinpoints anotados |
|---|---|---|---|
| F1 | **Parecer Normativo COFEN nº 1/2024/COFEN** — "Parâmetros para o planejamento da força de trabalho da Enfermagem pelo Enfermeiro", 15 mar. 2024, SEI 0243666, 35 p. | `7155c480a442fb2c…` | itens 1.1 (IST ≥ 15 % = 8,3 % férias + 6,7 % ausências), 1.2 (RT +5 %), 1.5 (+10 % se ≥30 % com limitação), 2.2 (SCP admitidos), 2.8 (4/6/10/10/18 h por paciente), 3.0 (33/33/36/42/52 % enfermeiros), Anexo I (APS/WISN), Anexo II (caderno de exercício: internação, UTI, pediatria) |
| F2 | **Resolução COFEN nº 736, de 17 jan. 2024** — Processo de Enfermagem, SEI 0208733, 4 p. | `8a8a9ecb5987a308…` | art. 1º, 3º, 4º (§1º–§5º), 6º, 7º, 8º, 14 |
| F3 | **Resolução COFEN nº 564, de 6 dez. 2017** (página do DOU, Nº 233, p. 157) + **Anexo** (Código de Ética, 16 p.) | `09bd6ab2ea4cef05…` / `2e11e82bb80952af…` | art. 1º (aprova o Código anexo), 2º (aplica-se a…), 3º, 4º+PU, 5º (vigência 120 dias; revoga Res. 311/2007) |
| F4 | **Resolução COFEN nº 545/2017** — PDF oficial, 4 p., **sem camada de texto** | `7b4dbdbecba0378b…` | ementa **não extraível por texto** — exige OCR + revisão humana |
| F5 | **Parecer CFM nº 28/2020** (Parecer nº 2806/2020 CRM-PR), 5 p., com camada de texto | `089dba1488ac8ee0…` | seção "critérios para a alta": tabela da Escala de Aldrete e Kroulik modificada (1995) e a frase do corte |
| F6 | **Portaria GM/MS nº 6.734, de 18 mar. 2025** — DOU Seção 1, Nº 61, 31 mar. 2025, p. 82, código `05152025033100082` | `cf645bbdbc299874…` | art. 1º, 2º, 3º + Anexo 1 (Lista Nacional de Notificação Compulsória) |

### 3.2 Tabela principal

| # | Afirmação normativa visível na produção | Fonte exigida | Estado | Obrigação para o esqueleto CE | Evidência |
|---|---|---|---|---|---|
| **A1** | "Parecer COFEN 1/2024" / "Dimensionamento de Enfermagem (Carga de Trabalho — Parecer Cofen 01/2024)" / "Dimensionamento — Todos os Setores (COFEN 01/2024)" | PN COFEN 1/2024, texto integral + Anexos I/II | **SUSTENTADA** | `authorityBinding` **obrigatório por campo** (cada fórmula, cada parâmetro, cada exemplo), com `pinpoint` no item do Parecer; `CANDIDATE_HOLD` até a fórmula ser reexecutada contra os vetores do Anexo II | F1; páginas `prod_dimensionamento.html`, `prod_guia_rapido_dimensionamento_de_enfermagem.html` (reproduz e sinaliza as inconsistências aritméticas do próprio Parecer: "82,5" vs 83; "15 + 19 = 33") |
| **A2** | "Resolução Cofen 736/2024 (processo de enfermagem)" | Res. COFEN 736/2024 | **SUSTENTADA** | `authorityBinding` por afirmação (as 5 etapas do Processo de Enfermagem, art. 4º §1º–§5º) | F2; art. 14 revoga a Res. COFEN 358/2009 (confirma a vigência afirmada) |
| **A3** | "Código de Ética dos Profissionais de Enfermagem" (página `codigo_de_etica_enfermagem.html`, guia fundamental, simulado) | Res. COFEN 564/2017 + **Anexo** (texto do Código) | **METADADO APENAS** (o ato) / **NÃO VERIFICADA** (o texto do Código) | O `Anexo` oficial é um PDF de **16 páginas sem camada de texto**: qualquer átomo dele nasce `OCR_UNREVIEWED` e fica **HOLD_HUMAN** até revisão humana com double check. `authorityBinding` do tipo `source` (564) pode ser `ALLOW`; o binding do `Anexo` não | F3: art. 1º–5º do ato (vigência **120 dias** após 06/12/2017; revoga Res. COFEN 311/2007). `prod_codigo_de_etica_enfermagem.html` cita o PDF do Anexo como fonte |
| **A4** | "Lei 7.498/86" (regulamentação do exercício da enfermagem) | Lei 7.498/1986, texto de artigos | **METADADO APENAS** | `authorityBinding` pode ser `ALLOW` **apenas** para afirmações de identidade/ementa; qualquer afirmação de conteúdo de artigo (art. 3º, art. 15-A) exige texto preservado → **HOLD** | `extracao.json#lei_7498_1986`: id Senado 549374, ementa, publicação DOU 26/06/1986 p. 9273 col. 1, 4 `vides`, 10 dispositivos alterados (arts. 15-A…15-E, art. 23 PU; Leis 14.434/2022 e 14.602/2023 com trechos vetados) |
| **A5** | "Lei 8.080/90 (SUS)" | Lei 8.080/1990, texto de artigos | **METADADO APENAS** | idem A4. **Atenção ao volume de alterações:** 43 `vides`, 93 dispositivos alterados (últimos: Leis 15.471/2026, 15.233/2025, 15.126/2025, 14.977/2024) — a edição vigente em 2026 não é a de 1990 | `extracao_confirmadas.json#lei_8080_1990`: id Senado 549956, DOU 20/09/1990 p. 18055 col. 1; `vides` = 43 (da Lei 8.142/1990 à Lei 15.471/2026) e 93 dispositivos tocados — **cifras confirmadas de forma independente** pela frente federal (`outputs/normativos-federais/deliverable.md` §5.4 e §5.5), que mediu a mesma lei na mesma fonte |
| **A6** | "Lei 5.905/73 (Cofen/Corens ns)" | Lei 5.905/1973, texto de artigos | **METADADO APENAS** | idem A4. A produção **cita artigos** (arts. 1º, 2º, 8º, 10 PU, 11, 15, 18) → exige texto preservado antes de qualquer `authorityBinding` de conteúdo | `extracao.json#lei_5905_1973`: id Senado 547781, ementa, DOU 13/07/1973 p. 6825 col. 1, `vides`=1, **0 dispositivos alterados** |
| **A7** | "Portaria GM/MS 6.734/2025" (simulado de notificação compulsória: `<meta description>` = "Simulado gratuito … (Portaria GM/MS Nº 6.734/2025). 50 questões com gabarito e referências") | Portaria GM/MS 6.734/2025 **+ a lista consolidada em vigor** | **METADADO APENAS→ SUSTENTADA quanto ao ato; DIVERGENTE quanto à vigência da lista** | `authorityBinding` para o ato pode ser `ALLOW`; para o **conteúdo da lista** tem de ser a Portaria de Consolidação GM/MS nº 4/2017 **na versão consolidada em vigor**, não a portaria alteradora isolada | F6 (art. 1º–3º + Anexo 1 integral). Ver **A8** para a divergência |
| **A8** | "Lista nacional de notificação compulsória" (páginas `lista-de-doencas-de-notificacao-compulsoria.html` e `notificacao-compulsoria.html` = "conforme Portaria GM/MS Nº 10.175/2026", "73 entradas") | Lista Nacional em vigor na data de aplicação | **DIVERGENTE (obsoleta)** | **FIND obrigatório**: o esqueleto tem de modelar `vigência` da fonte (data de aplicação) e `effective_until`; o item da lista **renumera** entre versões | F6 (item 4 = Botulismo) vs. `bvsms_prt11211_2026.html` (item 4 = Anomalias congênitas, item 5 = Botulismo). Portaria GM/MS 11.211/2026 (13 mai. 2026) **remove a covid-19**, inclui **caxumba** e **febre do oropouche**, altera nomenclaturas (Varicela, PFA, Poliomielite, ESAVI, SRAG, *Haemophilus influenzae*) e **periodicidades** (difteria → imediata ao MS; tétano) — **nenhuma das duas páginas públicas reflete esta alteração** |
| **A9** | "NANDA-I (2018)" e "NIC" (calculadora "Diagnósticos NANDA (2018)", `diagnosticosnanda.html`, `/banco_nanda.json`, `/banco_nic_completo.json`) | Edição da terminologia (e a edição de cada código); direitos de reprodução | **NÃO VERIFICADA** + **DIVERGENTE (rótulo)** | `CANDIDATE_HOLD` obrigatório. Vinculação a `terminology.schema.json` (`code_system`, `code_system_version`, `concept_code`, `canonical_label_key`, `rights`). Sem `code_system_version` e sem `rights` comprovado → HOLD | `prod_banco_nanda.json`: 281 itens com `definicao`, `caracteristicas_definidoras`, `fatores_de_risco`, `condicoes_associadas`; `ano_inclusao` preenchido em **2 de 281** (ambos "2024") — **não há campo de edição**; **25 rótulos distintos de `dominio`**, com variantes duplicadas do mesmo domínio ("Segurança / proteção" 55× e "Domínio 11. Segurança / proteção" 5×; "Atividade / repouso" 23×, "Atividade / descanso" 11×, "Atividade/repouso" 4×). `prod_banco_nic_completo.json`: 593 itens com `definicao` **e `atividades`**. A própria página declara: *"Os diagnósticos aqui divulgados correspondem a apenas 90% do total."* |
| **A10** | "PNAB" (`guia_rapido_pnab.html`) | Portaria GM/MS nº 2.436/2017 + atualizações | **NÃO VERIFICADA** | `authorityBinding` obrigatório; HOLD até fonte preservada | Sem qualquer fonte preservada no repo (ver `contracts/entities/tool-sources.v1.json`: 6 fontes, nenhuma do MS) |
| **A11** | "SINAN" (`sinan.html`) | Portaria GM/MS nº 2.407/2004, alterada pela 1.378/2013; Nota Técnica 62/2022 | **NÃO VERIFICADA** | idem A10 | idem |
| **A12** | "AHA/SBC (PCR)" (`simulado_pcr.html`, `biblioteca/10-causas-de-pcr.html`) | Diretriz AHA/SBC vigente na data | **NÃO VERIFICADA** | idem A10 | idem |
| **A13** | "IBSP", "ISMP", "ANVISA" (`biblioteca/2017-anvisa-praticas-seguras…`, `biblioteca/2020-anvisa-higienizacao…`) | Norma do órgão emissor + edição | **NÃO VERIFICADA** | idem A10 | idem |
| **A14** | "Aldrete" — corte de escore | Parecer CFM nº 28/2020 | **DIVERGENTE** | **FIND de severidade alta**; `authorityBinding` por faixa (`tool.aldrete.bands.ok`) obrigatório; o valor em vigor tem de ser o da fonte, e o corte do site **tem de ser corrigido ou a ferramenta mantida em HOLD** | F5: *"De acordo com a escala, o paciente poderia ter alta da SRPA quando somasse **8 pontos ou mais**, ponderando as questões clínicas e o estado geral."* — e a tabela do Parecer reproduz exatamente os 5 critérios e os limiares de SpO₂ que o repo implementa. O site estático (`prod_aldrete.html`, `lastmod 2026-10-27`) contém `if (calcScore >= 9) { … } else if (calcScore >= 7) { … }`; o repo (`src/lib/tools/catalog.ts`) implementa 8/7/0–6. **FIND-CTR-010 confirmado com fonte primária em mãos** |
| **A15** | "Escoras e faixas" em geral (Braden, Morse, Apgar, IMC, Exames laboratoriais) | Fonte por campo | **SUSTENTADA (parcial) / DIVERGENTE (parcial)** | `authorityBinding` por campo já existe no repo — mas **não valida** contra o schema canónico (ver secção 5) | `tool-sources.v1.json` tem **6 fontes**, com os identificadores lidos directamente do ficheiro no `main` (`contracts/entities/tool-sources.v1.json`, revisto pelo owner em 01/11): `SRC-CFM-PARECER-28-2020` (Aldrete/CFM) · `SRC-REV-ENF-USP-BRADEN-1999` (Braden/Rev USP) · `SRC-CAPES-MEC-MANUAL-CONSULTA-RAPIDA` (Morse/CAPES) · `SRC-OMS-OBESIDADE-2000` (IMC/OMS) · `SRC-APGAR-1953` (Apgar) · `SRC-GOTEJAMENTO-FORMULA-CLASSICA` (fórmula de gotejamento); `clinical-tools.v1.json` tem 6 ferramentas `EVIDENCE_BOUND` e 1 `CANDIDATE` (`CE-TOOL-exames-laboratoriais`, com HOLDs UTC-053/UTC-056: "as faixas vem da base do site, sem regra de pontuacao versionada"; "faixa por sexo existe em 10 dos 149 exames") |

### 3.3 Leitura do quadro

- **Texto obtido e sustentante: 4** (A1, A2, A7 quanto ao ato, A15 parcial) — **nenhuma delas está registada como fonte no `contracts/entities/tool-sources.v1.json` do repo**, que tem 6 entradas e nenhuma delas é COFEN 01/2024, Res. 736/2024 ou a Portaria 6.734/2025.
- **Metadado apenas: 4** (A3 quanto ao ato, A4, A5, A6).
- **Não verificadas: 6** (o Anexo de A3, A9, A10, A11, A12, A13).
- **Divergentes: 2** (A8 e A14), ambas com fonte primária em mãos.

---

## 4. Tabela 2 — As afirmações de maior risco clínico e o que a doutrina exige de cada uma

Ordenadas por dano potencial ao paciente se a afirmação estiver errada.

| # | Afirmação de alto risco | Risco concreto | O que a doutrina exige (as 4 perguntas) | Estado |
|---|---|---|---|---|
| **R1** | **Aldrete: "alta com 8 pontos ou mais"** | Um paciente com 8 pontos (critério atingido segundo o CFM) é exibido pelo site como "Manter em Observação" (faixa amarela). O site **cita a fonte que ele contradiz** — a divergência é auto-referida. | (a) fonte: Parecer CFM nº 28/2020; (b) material: texto integral, 5 p., SHA-256 `089dba…`; (c) direitos: `PUBLIC_DOMAIN` (fundamento `LEI-9.610-1998`); (d) o que prova: **o corte de 8 e os 5 critérios com os limiares de SpO₂** — nada mais (não prova conformidade da implementação nem alta segura). | **DIVERGENTE** |
| **R2** | **Lista de notificação compulsória (itens, periodicidade, remoção da covid-19)** | Resposta errada em prova de concurso; e, no serviço, notificar/notificar errado é dano. A **numeração dos itens muda entre versões** (item 4 = Botulismo em 06.734/2025; item 4 = Anomalias congênitas e 5 = Botulismo em 11.211/2026). | (a) fonte: Portaria de Consolidação GM/MS nº 4/2017, Anexo V, Anexo 1, **na versão em vigor na data do(simulado)**; (b) material: Anexo 1 integral (F6, 1 p. DOU + BVS/MS); (c) direitos: `PUBLIC_DOMAIN`; (d) o que prova: **a lista e as periodicidades daquela data**, nada sobre a lista de outra data. → exige `effective_from`/`effective_until` no modelo. | **DIVERGENTE** (páginas públicas param em 10.175/2026; a última alteração é 11.211/2026) |
| **R3** | **Parâmetros de dimensionamento de enfermagem (IST 15 %, 4/6/10/10/18 h, 33/33/36/42/52 %, fórmula QP)** | Um quadro calculado com o IST fora do lugar ou com a proporção errada **excede a força de trabalho disponível** — risco de omission of care documentado na literatura citada pelo próprio Parecer. | (a) fonte: PN COFEN 1/2024; (b) material: 35 p., SHA-256 `7155c48…`; (c) direitos: `PUBLIC_DOMAIN`; (d) o que prova: **cada parâmetro, no item que o fixa** — e o Parecer **contém erros aritméticos próprios** (82,5 vs 83; "15+19=33"), pelo que qualquer valor derivado tem de ser reexecutado, não copiado. | **SUSTENTADA** (com a obrigação de reexecução e de registar as divergências do próprio ato) |
| **R4** | **Diagnósticos NANDA e intervenções NIC publicados** | Ferramenta que "sugere diagnóstico" com base incompleta: a própria produção diz que publica **90 %** do total. O esqueleto tem a mesma prudência ("A NANDA sugerida nas escalas não fecha diagnóstico") — mas a base serve a **calculadora NANDA**, que é diferente. | (a) fonte: NANDA International / NIC — **edição não declarada no dado**; (b) material: `banco_nanda.json` (281 itens), `banco_nic_completo.json` (593 itens); (c) direitos: **obra protegida (Thieme)** — Definitions, Defining Characteristics e Activity Lists são texto protegido; **reprodução integral sem autorização comprovada → HOLD** (distribuir ≠ ler); (d) o que prova: **que existe um ficheiro JSON**; não prova edição, completude, nem licença. | **NÃO VERIFICADA + HOLD de direitos** |
| **R5** | **Faixas de exames laboratoriais (149 exames; faixa por sexo em 10)** | Faixa de referência errada → leitura errada de resultado laboratorial. | (a) fonte: a fonte de cada exame (a fonte do laboratório, o método, a edição do livro de referência) — **não** a "base do site"; (b) material: ausente; (c) direitos: a definir; (d) o que prova: nada. | **NÃO VERIFICADA** — HOLD já registado no repo (UTC-053, UTC-056) |
| **R6** | **Base do conceito diagnóstico NANDA (281 itens, 25 rótulos de domínio, `ano_inclusao` em 2/281)** | Vocabulary de classificação **não canónico**: domínios duplicados com grafias diferentes; sem edição, uma sugestão de diagnóstico pode ser indexada num domínio que não existe na taxonomia. | (a) fonte: NANDA-I, edição a fixar; (b) material: o JSON; (c) direitos: HOLD; (d) o que prova: que o ficheiro existe. → exige `terminology.schema.json` com `code_system_version` e `canonical_label_key`. | **NÃO VERIFICADA** — o repo **não tem fonte nenhuma** para NANDA/NIC |
| **R7** | **Notificação compulsória: obriga a quê e a quem** (Portaria de Consolidação, art. 3º; Lei 6.259/1975, art. 8º; NT 62/2022) | Afirmar quem tem obrigação de notificar (médico, outro profissional de saúde, responsável pelo serviço) é afirmação de dever legal. | (a) fonte: Portaria de Consolidação GM/MS nº 4/2017, Anexo V, Cap. I, art. 3º; (b) material: texto oficial (URL oficial de gov.br/saude disponível; DOU com robots `Disallow: /` → captura por via institucional); (c) direitos: `PUBLIC_DOMAIN`; (d) o que prova: **o texto do art. 3º, se capturado**; hoje só há metadado de portarias alteradoras. | **NÃO VERIFICADA** |
| **R8** | **Escala de Aldrete: "a decisão de alta cabe ao médico responsável"** (a produção já o diz; o repo também) | Afirmação de limite de atuação profissional. | (a) fonte: Res. COFEN 736/2024 art. 6º (diagnóstico e prescrição de enfermagem são privativos do enfermeiro) e Parecer CFM 28/2020 (ementa: "compete ao médico responsável … avaliar se o paciente tem condições de alta"); (b) material: F2 e F5; (c) direitos: `PUBLIC_DOMAIN`; (d) o que prova: **os limites de cada ator, não a autorização de alta**. | **SUSTENTADA** |
| **R9** | **Processo de Enfermagem em 5 etapas (avaliação, diagnóstico, planejamento, implementação, evolução)** | Uma quinta etapa fora de ordem ou ausente altera o documentoassistencial. | (a) fonte: Res. COFEN 736/2024, art. 4º §1º–§5º; (b) material: F2; (c) direitos: `PUBLIC_DOMAIN`; (d) o que prova: **a estrutura em 5 etapas inter-relacionadas**, e que "os diagnósticos… podem ser apoiados nos Sistemas de Linguagem Padronizada" (art. 3º) — "podem", não "devem". | **SUSTENTADA** |
| **R10** | **Código de Ética: vigência e âmbito** (aplica-se a enfermeiros, técnicos, auxiliares, obstetrizes, parteiras e atendentes; vigência 120 dias após 06/12/2017; revoga a Res. 311/2007) | Simulado que responde sobre o Código errado (ou sobre o Código de 2007, revogado). | (a) fonte: Res. COFEN 564/2017, art. 1º–5º; (b) material: página do DOU (F3, com camada de texto); o **Anexo** (o Código) é imagem pura de 16 p.; (c) direitos: `PUBLIC_DOMAIN`; (d) o que prova: **vigência, âmbito e revogação** — **não** o conteúdo dos 71 artigos do Código, que exige OCR revisado. | **METADADO APENAS** para o ato / **NÃO VERIFICADA** para o Código |

---

## 5. Como o metamodelo do esqueleto tem de expressir isto

### 5.1 O que existe hoje no esqueleto CE

| Objeto | Schema | `authorityBinding` | `origem` | `edição` | `pinpoint` | `direitos` | `vigência` | `status` |
|---|---|---|---|---|---|---|---|---|
| `ClinicalTool` | `schemas/clinical-tool.v1.json` | **parcial** — `{sourceId, authority, rule, interpretation, result}`, `sourceId` obrigatório, restantes `null` | ❌ | ❌ | ❌ (o `rule` é texto livre) | ❌ | ❌ | `CANDIDATE_HOLD` \| `ADMITTED` \| `RETIRED` |
| `Article` | `schemas/article.v1.json` | ❌ (só `sourceRefs: string[]`) | ❌ | ❌ | ❌ | parcial — `rights.{status,sourceRef}` com `status` livre | ❌ | idem |
| `LibraryEntity` | `schemas/library-entity.v1.json` | ❌ (`terminologyRefs: string[]`) | ❌ | ❌ | ❌ | ❌ | ❌ | idem |
| `Norm` | **não existe** | — | — | — | — | — | — | é um `object_type` no binding registry (1 de 16) sem schema |

`metamodel.ts` do esqueleto tem 20 campos de capability e 10 de binding; **nenhum campo de fonte, edição, vigência ou direitos**. O `ClinicalTool.authorityBinding` atual não distingue `source` de `material consultado` de `direitos` — é uma string. O `status` do `ClinicalTool` é `CANDIDATE_HOLD | ADMITTED | RETIRED`, o que **não é** o `status` canónico do CKO (`source.schema.json`: `CANDIDATE | DRAFT | SOURCE_QUALIFIED | EVIDENCE_BOUND | REVIEW_REQUIRED | HOLD_HUMAN | ASSURED | ELIGIBLE_FOR_RELEASE | RELEASED | RETIRED`) e **não é** o `decision` do `authority_binding.schema.json` (`ALLOW | HOLD_HUMAN | REJECT | NOT_APPLICABLE_JUSTIFIED`).

### 5.2 Campos que faltam, por schema (proposta — a alteração de esquema é por governança, não por este relatório)

**`ClinicalTool`**
1. `authorityBinding.sourceIds[]` — lista, não escalar (uma calculadora tem fontes por campo).
2. `authorityBinding.sourceRef` → apontar para uma entrada que **valide** `source.schema.json` (com `locator.pinpoint`, `rights`, `jurisdiction`, `retrieved_at`, `integrity.sha256`, `integrity.snapshot_ref`, `effective_from`/`effective_until`).
3. `authorityBinding.edition` e `authorityBinding.effectiveFrom` / `effectiveUntil` — obrigatórios para qualquer conteúdo **versionado** (Lista de Notificação, taxonomia NANDA/NIC, PN 01/2024).
4. `authorityBinding.pinpoint` por campo — item do Parecer, artigo, quadro, linha da tabela. Hoje o `rule` é texto livre: um texto livre não é um pinpoint verificável.
5. `authorityBinding.rights` — `UNKNOWN | PERMITTED | RESTRICTED | LICENSED | PUBLIC_DOMAIN | NOT_APPLICABLE` (`source.schema.json`); e `rights.scope` para distinguir leitura / extração / armazenamento / uso interno / redistribuição / envio a terceiro (doutrina §3).
6. `authorityBinding.decision` — `ALLOW | HOLD_HUMAN | REJECT | NOT_APPLICABLE_JUSTIFIED`; **não** `BOUND` (ver 5.4).
7. `authorityBinding.authorityClass` — `REGULATORY | TECHNICAL_STANDARD | AUTHORITATIVE_TERMINOLOGY | CLINICAL_EVIDENCE | INTERNAL_NONCLINICAL`; **não** `CLINICAL` / `TECHNICAL` / `INTERNAL_CONFIG` (ver 5.4).
8. `authorityBinding.evidenceRefs` → `audit_evidence.schema.json` (`result: PASS|FAIL|HOLD`, `input_sha256`, `output_sha256`, `runner_version`, `limit_statement`).
9. `authorityBinding.observedMaterial` — a **segunda** pergunta da doutrina (metadado-only vs texto integral vs licença), hoje não registada em lado nenhum.
10. `normativeAssertions[]` — lista de **átomos** com `enunciado`, `pinpoint`, `sourceRef`, `quote` (literal), `edition`, `appliesTo`. É o que impede a reificação de uma ementa em cláusula.
11. `terminologyBindings[]` — para NANDA/NIC/NOC: `codeSystem`, `codeSystemVersion`, `conceptCode`, `canonicalLabelKey`, `rights` (`terminology.schema.json`).
12. `notifiableListVersion` / `effectiveFrom` por item — para a Lista Nacional (o **item** tem de saber a versão em que foi publicado).

**`Article`**
- `authorityBinding` estruturado (não `sourceRefs: string[]`); `sourceRefs` passa a ser `[{sourceId, pinpoint, quote, accessedAt, rightsStatus}]` (`reference.schema.json` já existe e tem `source_id`, `citation_style`, `locator`, `accessed_at`, `rights_status` — o `Article` **não o usa**).
- `edition`, `jurisdiction`, `effectiveFrom/Until` (hoje só há `updatedAt`).
- `rights.status` deve passar a ser o enum canónico, não string livre.
- `body` exige `bodyRights` distinto de `rights`: publicar o corpo de obra protegida é ato diferente de a referenciar.

**`LibraryEntity`**
- `terminologyRefs` passa a `[{codeSystem, codeSystemVersion, conceptCode, canonicalLabelKey, rights, mappingRefs}]`.
- `authorityBinding` para o termo normalizado vs. o rótulo de exibição: são **duas** fontes diferentes (a taxonomia canónica e a decisão editorial de rotular).

**`Norm` (schema novo, ausente)**
- `normType`, `issuingAuthority`, `officialIdentifier`, `title`, `edition`, `jurisdiction`, `publication` (DOU: data, edição, secção, página, código de autenticidade), `effectiveFrom`, `effectiveUntil`, `viges`, `revokes[]`, `amendedBy[]`, `relatedActs[]`, `source` (que aponta para `source.schema.json`), `rightTexts[]` (cada um com `rights`, `pinpoint`, `quote`, `ocrMethod`, `ocrReviewedBy`), `atoms[]`, `claims[]`.
- Sem isto, o esqueleto **não tem onde meter** a Res. 736/2024, o PN 01/2024, a Lei 5.905/1973, a Portaria 6.734/2025 — que são objetos de primeira classe do produto.

### 5.3 Onde o `CANDIDATE_HOLD` é obrigatório (regra fail-closed)

| Situação | `status` | Fundamento |
|---|---|---|
| Qualquer `ClinicalTool`/`Article`/`LibraryEntity`/`Norm` **sem** `authorityBinding` completo (fonte + pinpoint + edição quando versionado + direitos) | `CANDIDATE_HOLD` | doutrina §2/§3; `UTC-001`, `UTC-002` |
| Faixa, escore, dosagem, classificação diagnóstica **sem fonte preservada** (integridade com `sha256` real e `snapshot_ref` preenchido) | `CANDIDATE_HOLD` | `UTC-053`, `UTC-056`, `UTC-080/081/082` |
| Conteúdo extraído por **OCR sem revisão humana** | `CANDIDATE_HOLD` + `HOLD_HUMAN` | `FND-COFEN-003`; auditoria CKO/COREN/COFEN 23/10/2026 |
| Fonte com `rights` ≠ comprovado (`UNKNOWN`, `LICENSED`, `RESTRICTED`) para ato de **redistribuição** | `CANDIDATE_HOLD` na operação dependente | doutrina §3 (leitura ≠ redistribuição) |
| Divergência entre a fonte e o valor publicado | `CANDIDATE_HOLD` **+ FIND** | doutrina §6; FIND-CTR-010 (Aldrete) |
| Fonte federal via API do Senado (metadado sem texto de artigo) | `CANDIDATE_HOLD` para conteúdo de artigo | limite técnico da API (ver 2.3) |
| Conteúdo cujo **número/ordem depende da edição** (Lista Nacional, taxonomia) sem `effectiveFrom` | `CANDIDATE_HOLD` | achado de vigência (A8/R2) |

**Regra nova que o esqueleto precisa:** `status: ADMITTED` **não pode** coexistir com `authorityBinding.decision = HOLD_HUMAN`, `rights ≠ comprovado`, `integrity.sha256` igual a `0000…0`, ou `snapshot_ref = PENDING_SNAPSHOT`. Hoje o esqueleto tem `CANDIDATE_HOLD` como valor por omissão, mas não tem o validador que recusa a promoção nestas condições — e o gate do repo tem 3 schemas de piloto, não 16.

### 5.4 Colisão de contrato verificada (bloqueia a promoção)

Validei os dois contratos do repo contra os schemas canónicos que a doutrina manda usar. **Nenhum dos dois passa.**

| Ficheiro | Itens | Defeito apurado |
|---|---|---|
| `contracts/entities/tool-sources.v1.json` | 6 | `source_type` fora do enum de `source.schema.json` em **6/6**: `NORMATIVA` (×2), `VALIDACAO`, `GUIA`, `ARTIGO`, `TECNICA` — o enum canónico é `OFFICIAL_LAW | REGULATOR | STANDARD | TERMINOLOGY | PRIMARY_STUDY | GUIDELINE | TEXTBOOK | DATASET_API | SOFTWARE | IMAGE | INTERNAL_GOVERNED`. Campo `citacao` presente em 6/6 com `additionalProperties: false` → inválido. `integrity.sha256` = `0000…0` e `snapshot_ref` = `PENDING_SNAPSHOT` em 6/6 → **o hash não atesta nada**. |
| `contracts/entities/tool-bindings.v1.json` | 78 | `authority_class` fora do enum em **46**: `CLINICAL` (36), `TECHNICAL` (6), `INTERNAL_CONFIG` (4) — o enum canónico é `REGULATORY | TECHNICAL_STANDARD | AUTHORITATIVE_TERMINOLOGY | CLINICAL_EVIDENCE | INTERNAL_NONCLINICAL`. `decision` fora do enum em **46**: `BOUND` — o canónico é `ALLOW | HOLD_HUMAN | REJECT | NOT_APPLICABLE_JUSTIFIED`. `validity.applicable_from` ausente em **46**. `source_ids`/`requirement_id`/`authority_class`/`validity`/`decision` ausentes em **32** (bindings de campo de definição). Campos fora do schema em **32**: `applicability_ref`, `authority_binding_ref`, `message_key`, `privacy_policy`, `semantic_concept_ref`, `value_type`, `unit_ref`. |

**Leitura:** o `note` do próprio `tool-sources.v1.json` afirma *"Fontes normativas (CKO source.schema.json)"* — a afirmação é verdadeira quanto à intenção e falsa quanto ao resultado. Isto é o tipo de divergência que a doutrina manda tratar como **FIND**, não como correção silenciosa.

### 5.5 Onde a fonte preservada tem de entrar (o repo tem a estrutura; falta o conteúdo)

O repo **já tem** a infraestrutura de preservação, criada para os 25 atos transversais:

```
audit-evidence/transversal-acquisition/snapshots/<data>/public-acts/<ato>/original.html
audit-evidence/transversal-acquisition/snapshots/<data>/public-acts/<ato>/extracted.txt
registers/governance/transversal-source-instances/public/source/<ato>.json
registers/governance/transversal-source-instances/public/public-materialization-manifest.json
```

Nenhum dos **25** atos preservados é de enfermagem: são Lei 9.610/98, 12.965/14, WCAG 2.2, W3C SHACL, ANPD, e-SIC. **As 15 normas que a produção afirma não têm uma única entrada nesta árvore.** E os 78 bindings de `tool-bindings.v1.json` apontam para 6 fontes que não estão aqui.

---

## 6. Achados a abrir (sem cunhar identificadores — a numeração é do processo de governança)

| Severidade | Título | Fato | Evidência | Efeito no esqueleto |
|---|---|---|---|---|
| **ALTA** | Divergência de corte na escala de Aldrete entre site e fonte | O site estático publica corte de 9 pontos; a fonte que ele próprio declara (Parecer CFM nº 28/2020) fixa "8 pontos ou mais"; o repo implementa 8 | F5 (`089dba…`) vs. `prod_aldrete.html` (`calcScore >= 9`, `lastmod 2026-10-27`) | `authorityBinding` por **faixa** obrigatório; o valor publicado tem de vir da fonte |
| **ALTA** | Lista de Notificação Compulsória servida em versão superada e com numeração instável | As páginas públicas ancoram em 10.175/2026; a última alteração é 11.211/2026 (13 mai. 2026), que remove a covid-19, inclui caxumba e oropouche e altera periodicidades; a numeração dos itens muda entre versões (4 = Botulismo → 4 = Anomalias congênitas / 5 = Botulismo) | F6 + `bvsms_prt11211_2026.html` | `effectiveFrom`/`effectiveUntil` por item e por afirmação |
| **ALTA** | Contratos de fonte e de binding não validam contra os schemas CKO canónicos | 6/6 fontes com `source_type` fora do enum e `citacao` proibida; 46/78 bindings com `authority_class`/`decision` fora do enum e sem `applicable_from`; 32 bindings sem `source_ids` | secção 5.4 | nenhum `ADMITTED` enquanto persistir |
| **ALTA** | Taxonomia NANDA/NIC publicada sem edição, sem vocabulário canónico e sem direitos comprovados | `banco_nanda.json`: 281 itens, `ano_inclusao` em 2/281, 25 rótulos de domínio com variantes duplicadas do mesmo domínio; `banco_nic_completo.json`: 593 itens com `definicao` e `atividades`; a página declara "90 % do total" | capturas `prod_banco_*.json` | `terminology.schema.json` com `code_system_version` e `rights`; HOLD de redistribuição |
| **MÉDIA** | Fontes preservadas com integridade não atestada | `sha256` = 64 zeros e `snapshot_ref` = `PENDING_SNAPSHOT` em 6/6 fontes | `tool-sources.v1.json` | o hash só passa a atestar quando for o do ficheiro realmente guardado |
| **MÉDIA** | Referência cruzada a FIND inexistente | `src/lib/tools/catalog.ts` comenta "(FIND-CTR-009)" para os 7 HOLDs do Aldrete; o registo existente é **FIND-CTR-010** e não há FIND-CTR-009 | `find-register.v1.json` vs. `catalog.ts` | corrigir a referência (mutação sem WORK ORDER: apenas abrir FIND) |
| **MÉDIA** | PDFs oficiais de COFEN sem camada de texto (imagem pura) | Res. 545/2017 (4 p.) e o Anexo da Res. 564/2017 (16 p.) não têm texto extraível | F3/F4 | `ocrMethod` + `ocrReviewedBy` no modelo; HOLD_HUMAN até revisão |
| **MÉDIA** | Esqueleto sem schema para `Norm` | `Norm` é 1 dos 16 `object_type` do binding registry, sem schema; 13 dos 16 object types também não têm schema | `ce-skeleton/catalog/object-capability-binding.candidate.v0.1.json` | schema `Norm` novo |
| **BAIXA** | Ausência de `edition`/`jurisdiction`/`vigência` nos schemas de piloto | `Article` só tem `updatedAt`; `LibraryEntity` não tem `rights` | `ce-skeleton/schemas/*.v1.json` | secção 5.2 |

---

## 7. O que NÃO foi verificado — motivo e comando exacto

Tudo o que se segue é **NOT_RUN**. Nenhum comando foi corrido para estes itens; nenhum conteúdo foi inventado.

### 7.1 Texto de artigo das três leis federais (A4, A5, A6)

**Motivo:** a API do Senado devolve metadados, catálogo, `vides`, `edivs` e `disps` — **não** texto de artigo. `planalto.gov.br` devolveu "Acesso Negado" (bloqueio da WAF da Presidência) a partir deste sandbox; `in.gov.br` tem `robots.txt` com `Disallow: /`; `normas.leg.br` é uma SPA Angular e o texto não veio no HTML.

```bash
# 7.1.1 — texto consolidado (normas.leg.br; robots Allow: /)
curl -sL -A 'Mozilla/5.0' 'https://normas.leg.br/?urn=urn:lex:br:federal:lei:1986-06-25;7498' -o /tmp/le7498.html
curl -sL -A 'Mozilla/5.0' 'https://normas.leg.br/?urn=urn:lex:br:federal:lei:1990-09-19;8080' -o /tmp/le8080.html
curl -sL -A 'Mozilla/5.0' 'https://normas.leg.br/?urn=urn:lex:br:federal:lei:1973-07-12;5905' -o /tmp/le5905.html
# o texto vem por API interna da SPA: inspecionar as chamadas XHR em DevTools ou
# tentar o backend LexML/Senado (ver 7.1.2)

# 7.1.2 — mesma informação em formato legível por máquina (LexML; robots Allow: /urn, Crawl-delay 5)
curl -sL -A 'Mozilla/5.0' 'https://www.lexml.gov.br/urn/urn:lex:br:federal:lei:1986-06-25;7498' -o /tmp/lexml7498.html
sleep 5   # Crawl-delay declarado em robots.txt
curl -sL -A 'Mozilla/5.0' 'https://www.lexml.gov.br/urn/urn:lex:br:federal:lei:1990-09-19;8080' -o /tmp/lexml8080.html
sleep 5

# 7.1.3 — Planalto, a partir de uma rede não bloqueada (o bloqueio é de IP, não de robots)
curl -sL -A 'Mozilla/5.0' 'https://www.planalto.gov.br/ccivil_03/leis/l7498.htm'   -o /tmp/pl7498.html
curl -sL -A 'Mozilla/5.0' 'https://www.planalto.gov.br/ccivil_03/leis/l8080.htm'   -o /tmp/pl8080.html
curl -sL -A 'Mozilla/5.0' 'https://www.planalto.gov.br/ccivil_03/leis/l5905.htm'   -o /tmp/pl5905.htm

# 7.1.4 — metadados e dispositivos alterados (já preservados; reexecutar para atualizar)
curl -sL -H 'Accept: application/json' 'https://legis.senado.leg.br/dadosabertos/legislacao/LEI-n/7498/1986' -o /tmp/sen7498.json
curl -sL -H 'Accept: application/json' 'https://legis.senado.leg.br/dadosabertos/legislacao/LEI-n/8080/1990' -o /tmp/sen8080.json
curl -sL -H 'Accept: application/json' 'https://legis.senado.leg.br/dadosabertos/legislacao/LEI-n/5905/1973' -o /tmp/sen5905.json
curl -sL -H 'Accept: application/json' 'https://legis.senado.leg.br/dadosabertos/legislacao/DEC/94406/1987' -o /tmp/sen94406.json
```

### 7.2 Texto do Anexo da Res. COFEN 564/2017 (o Código de Ética) — A3, R10

**Motivo:** o PDF oficial (16 p., `2e11e82b…`) é **imagem pura**; `pdftotext` devolve 0 linhas. A auditoria de 23/10/2026 já tinha registado `FND-COFEN-003` (OCR da Res. 545 sem revisão humana, `PAGE_EMPTY_OCR:3`). O mesmo mecanismo aplica-se ao Anexo.

```bash
# 7.2.1 — OCR local (tesseract com por) + registo do método e do revisor
pdftoppm -r 400 -png 'capturas-2026-11-01/cofen564anexo.pdf' /tmp/anexo564
for p in /tmp/anexo564-*.png; do tesseract "$p" "${p%.png}" -l por; done
# 7.2.2 — método e revisor têm de entrar no registo: OCR_UNREVIEWED -> HOLD_HUMAN
#         até double check humano (conforme auditoria 23/10/2026, FND-COFEN-003)
```

### 7.3 Lista Nacional de Notificação Compulsória consolidada e em vigor — A8, R2, R7

**Motivo:** o texto do Anexo 1 consolidado **não** foi capturado para a versão em vigor; o DOU está fora de `robots.txt` para captura automática.

```bash
# 7.3.1 — Anexo 1 na versão da Portaria 6.734/2025 (JÁ CAPTURADO: cf645bbd…, 1 p.)
# 7.3.2 — versão em vigor: confirmar qual é a última alteração e capturar a lista consolidada
curl -sL -A 'Mozilla/5.0' 'https://bvsms.saude.gov.br/bvs/saudelegis/gm/2026/prt11211_14_05_2026.html' -o /tmp/prt11211.html
curl -sL -A 'Mozilla/5.0' 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/z/zika-virus/legislacao/portaria-de-consolidacao-no-4-de-28-de-setembro-de-2017.pdf' -o /tmp/prtcons4.pdf
# 7.3.3 — a lista consolidada em vigor tem de ser extraída da Portaria de Consolidação
#         (Anexo V, Anexo 1) NA VERSÃO CONSOLIDADA, não de uma portaria alteradora isolada
# 7.3.4 — NOTA: qualquer afirmação sobre "item N" da lista tem de levar a versão
```

### 7.4 NANDA-I / NIC / NOC — A9, R4, R6

**Motivo:** (i) não existe fonte preservada no repo; (ii) o `banco_nanda.json` da produção **não declara edição**; (iii) **direitos**: Definitions, Defining Characteristics e Activity Lists são obra protegida (Thieme) — a leitura pode não equivaler a autorização para reproduzir/redistribuir. Não capturei nem reproduzi conteúdo protegido.

```bash
# 7.4.1 — identificação editorial (metadados, sem texto protegido)
#         NANDA International — verificar a edição em vigor e o registo da edição por código
# 7.4.2 — NÃO extrair nem redistribuir definições/atividades sem licença escrita
# 7.4.3 — o que SÓ pode correr agora: registar a fonte com rights=LICENSED,
#         snapshot=PENDING e manter tudo em CANDIDATE_HOLD
# 7.4.4 — a versão canónica do produto que publica os ficheiros deve indicar a edição
#         por item (hoje: ano_inclusao em 2 de 281 registos)
```

### 7.5 PNAB, SINAN, AHA/SBC, IBSP, ISMP, ANVISA — A10, A11, A12, A13

**Motivo:** nenhuma fonte preservada no repo para nenhuma delas.

```bash
# 7.5.1 — PNAB (RDC/Portaria): confirmar a norma e as alterações vigentes
curl -sL -A 'Mozilla/5.0' 'https://bvsms.saude.gov.br/bvs/saudelegis/gm/2017/prt2436_03_10_2017.html' -o /tmp/pnab.html
# 7.5.2 — SINAN
curl -sL -A 'Mozilla/5.0' 'https://bvsms.saude.gov.br/bvs/saudelegis/gm/2004/prt2407_06_08_2004.html' -o /tmp/sinan.html
curl -sL -A 'Mozilla/5.0' 'https://bvsms.saude.gov.br/bvs/saudelegis/gm/2013/prt1378_10_10_2013.html' -o /tmp/sinan1378.html
# 7.5.3 — ANVISA (RDC 36/2013, já citado no PN 01/2024): confirmar a edição vigente
curl -sL -A 'Mozilla/5.0' 'https://antigo.anvisa.gov.br/.../RDC_36_2013_COMP.pdf' -o /tmp/rdc36.pdf
# 7.5.4 — AHA/SBC (PCR): a diretriz vigente na data do simulado; a referência oficial é da AHA,
#         não uma "norma" nacional — o esqueleto tem de modelar "guideline" como fonte_type
# 7.5.5 — IBSP e ISMP: identificar o documento (edição, data) antes de qualquer citação
```

### 7.6 Conteúdo dos simulados (gabaritos)

**Motivo:** o conteúdo dos simulados é carregado por `/js/access/premium-content-loader.js` e não está no HTML público. **Não contornei o controlo de acesso.** Só foi lido o `<meta name="description">` público, que é o que E1 também viu.

```bash
# 7.6.1 — para o simulado de notificação compulsória (o meta público diz Portaria GM/MS 6.734/2025, 50 questões)
#         as questões, o gabarito e as referências só se obtêm com o conteúdo premium,
#         por via legítima (subscrição do produto ou acesso interno do dono)
# 7.6.2 — com o conteúdo em mãos: fixar a versão da lista (7.3) por questão e datar cada item
```

### 7.7 Things não verificadas por falta de acesso: App GitHub / remotos

**Motivo:** sem acesso à App GitHub, como instruído. `git push`, WORK ORDER, promoção, `mutation_allowed` e a emissão de `registers/governance/find-register.v1.json` **não** foram executados. Nada foi commitado; nada foi escrito no repositório.

---

## 8. Registo de capturas desta frente

Todas em `outputs/normativos-enfermagem/capturas-2026-11-01/`. Hashes completos em `SHA256SUMS.txt`.

| Ficheiro | Origem | HTTP | SHA-256 (prefixo) |
|---|---|---|---|
| `cofen_pn01_2024.pdf` / `.txt` / `.html` | `cofen.gov.br/wp-content/uploads/2024/03/Parecer-Normativo-1-2024.pdf` + página do Parecer | 200 | `7155c480a442fb2c…` |
| `cofen736.pdf` / `.txt` | `cofen.gov.br/wp-content/uploads/2024/01/Resolucao-Cofen-no-736-2024-…pdf` | 200 | `8a8a9ecb5987a308…` |
| `cofen564.pdf` / `.txt` / `cofen564page.html` | `cofen.gov.br/wp-content/uploads/2017/12/Resolução-564-17.pdf` (página do DOU) | 200 | `09bd6ab2ea4cef05…` |
| `cofen564anexo.pdf` / `.txt` | `cofen.gov.br/wp-content/uploads/2017/12/ANEXO-RESOLUÇÃO-COFEN-Nº-564-2017.pdf` | 200 | `2e11e82bb80952af…` |
| `cofen545.pdf` / `.txt` | `cofen.gov.br/wp-content/uploads/2017/05/RES.-545-17.pdf` | 200 | `7b4dbdbecba0378b…` |
| `cfm_parecer28_2020.pdf` / `cfm28.txt` | `sistemas.cfm.org.br/normas/arquivos/pareceres/PR/2020/2806_2020.pdf` | 200 | `089dba1488ac8ee0…` |
| `port6734_2025.pdf` / `.txt` | `gov.br/aids/…/portaria-gm-ms-no-6-734-de-18-de-marco-de-2025.pdf/@@display-file/file` | 200 | `cf645bbdbc299874…` |
| `bvsms_prt11211_2026.html` | `bvsms.saude.gov.br/bvs/saudelegis/gm/2026/prt11211_14_05_2026.html` | 200 | `f55d931a16688297…` |
| `prod_*.html`, `prod_sitemap.xml`, `prod_banco_*.json` | `www.calculadorasdeenfermagem.com.br` (robots: `Allow: /`; `/doc/` e `/downloads/` bloqueados) | 200 | ver `SHA256SUMS.txt` |
| `nl_7498.html` | `normas.leg.br/?urn=…;7498` — **SPA, sem texto de artigo** | 200 | `ac27de17b1214543…` |
| `gov_notif.html` | `gov.br/saude/…/notificacao-compulsoria` | **404** | `6bbcea2b37bd092c…` |
| `prod_banco_nanda_completo.json` | `www.calculadorasdeenfermagem.com.br/banco_nanda_completo.json` | **404** (o `banco_nanda.json` existe; o "_completo" não) | `6bbcea2b37bd092c…` (página 404) |

**Recusa registada:** `in.gov.br` — `robots.txt` = `User-agent: * / Disallow: /`. **Foi feita 1 requisição a esse host antes de o `robots.txt` ser lido** (a página do DOU da Res. COFEN 736/2024); **o corpo foi descartado e não foi usado como fonte** em nenhuma linha deste relatório. Nenhuma outra requisição foi feita a esse host.

---

## 9. Notas para o verificador

1. **Nenhum invento de número, artigo, data ou faixa.** Onde não havia fonte, a linha diz "NÃO VERIFICADA" e a secção 7 dá o comando. Nenhum `pino` foi escrito sem o trecho literal que o sustenta (F1, F2, F3, F5, F6).
2. **Não criei identificadores de FIND.** A secção 6 descreve os achados com severidade; a numeração é do processo de governança (`registers/governance/find-register.v1.json` + WORK ORDER), conforme a doutrina.
3. **Não toquei no repositório.** `workspace-repo` foi só lido. Nenhum commit, nenhum push, nenhuma escrita em `main`. Escrevi apenas neste directório de saída.
4. **Não rodei `npm test` nem `npm run build`** (instrução do briefing). Não foi necessário correr testes: nenhuma alteração de código foi feita.
5. **O `FIND-CTR-010` passa de "reportado" a "provado com fonte primária"** — a fonte que o repo declara (`SRC-CFM-PARECER-28-2020`) foi capturada, tem SHA-256 real (`089dba…`, substitui o placeholder de 64 zeros) e o seu texto confirma o corte de 8 pontos contra os 9 do site.
6. **A divergência 8↔9 é anterior à minha captura e continua viva:** o `sitemap.xml` do site dá `lastmod 2026-10-27` para `aldrete.html`.
7. **Inconsistência interna da produção, verificada:** o simulado de notificação compulsória ancora em **6.734/2025** (meta tag pública) e as páginas de lista ancoram em **10.175/2026**; a última alteração consolidada é **11.211/2026**. Três versões em circulação, uma só lista em vigor.
8. **Uma ressalva sobre a própria produção:** o guia rápido de dimensionamento (`prod_guia_rapido_dimensionamento_de_enfermagem.html`) reproduz fielmente os parâmetros do Parecer **e sinaliza as inconsistências aritméticas do próprio Parecer** (82,5 vs 83; "15 + 19 = 33"). É um sinal de boa-fé que o esqueleto deve preservar, não de corrigir.
9. **O que não fiz de propósito:** não capturei nem reproduzi texto de NANDA/NIC além de contar registos e domínios (que é o mínimo para provar que não há edição nem vocabulário canónico); não contornei o acesso premium dos simulados; não tentei extrair o texto de artigo das leis por caminho que violasse `robots.txt`.

---

## 10. Ficheiros criados / modificados

| Ficheiro | Acção |
|---|---|
| `outputs/normativos-enfermagem/deliverable.md` | **criado** (este documento) |
| `outputs/normativos-enfermagem/capturas-2026-11-01/` | **criado** — 36 ficheiros de evidência (6 PDFs oficiais, 4 HTML oficiais, 12 páginas/JSON da produção, `SHA256SUMS.txt`, extrações `.txt`) |
| `workspace-repo/` | **nenhuma alteração** (só leitura) |
| `evidence_pack/` | **nenhuma alteração** (só leitura) |

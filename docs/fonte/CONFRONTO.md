# Confronto da fonte com o banco

O que o banco tem, o que a fonte tem, e o que foi perdido entre as duas coisas.

**A fonte.** `github.com/kauesp0007/calculadoras-de-enfermagem`, commit
`fc608936deb2fee96e6deaad5f3ea6e1c7e0d6da`, clonado em `/workspace/fase1/repo-origem`
(14.379 arquivos). É o site público do Calculadoras de Enfermagem, em HTML
estático, com 19 idiomas.

**O banco.** 34 migrations, 96 tabelas, 3.925 textos, 142 seções institucionais.
Foi semeado por uma **extração com perda**: o esqueleto sobreviveu (os títulos das
seções), o corpo não.

---

## 1. O catálogo

`scripts/extrair-catalogo-fonte.mjs` extrai **todo** o HTML da origem, sem
truncar nada, com os metadados completos (title, description, canonical,
og:*, twitter:*, lang, kicker, lead, o corpo inteiro) e o sha256 de cada
arquivo. A fonte é bilíngue no mesmo arquivo (`<span lang="en">`), então o
linearizador separa o texto por idioma.

| Papel | Páginas |
|---|---|
| vivo (site público) | 2.101 |
| tradução (19 idiomas) | 2.332 |
| ferramenta (automações) | 2.220 |
| backup | 1.720 |
| documentação | 1 |
| **total** | **8.376** |

O índice fica em `artifacts/fonte/catalogo.json` (no repositório). O corpo
inteiro de cada página fica em `/workspace/fase1/catalogo-fonte/paginas/`
(8.376 arquivos, um por sha256) — é grande demais para o repositório, e o hash
do índice é o que o amarra ao clone.

## 2. O confronto, com números

`scripts/confrontar-fonte.mjs` confronta o catálogo com o banco e grava
`artifacts/fonte/confronto.json`.

| Medida | Valor |
|---|---|
| Páginas no banco (`inst_page`) | 29 |
| Seções institucionais | 142 |
| Seções com corpo | 124 (87,3%) |
| Seções sem corpo (DERBY ou gancho do autor) | 41 |
| Correspondências declaradas e recuperadas | 16 |
| Gancho do autor normalizado em texto sobrevivente | 10 |
| Achados nomeados (sem correspondência na fonte) | 18 |
| Caracteres publicados nas seções | 27.113 |

## 3. O que a perda era

Três formatos de perda, todos medidos:

1. **Corpo vazio** (31 seções): a extração não achou o corpo e a 0037 gravou o
   marcador `DERBY`.
2. **Gancho do autor** (10 seções): o texto do autor sobreviveu, mas com a
   palavra `PENDENTE` no lugar do dado — "Formas aceitas (cartão, Pix,
   boleto): PENDENTE.", "…com antecedência de PENDENTE dias.", "Amostra fixa:
   PENDENTE. Frequência: PENDENTE.". Nenhuma delas é conteúdo: é um buraco
   declarado.
3. **Página que nunca existiu** (1): a página "Centrais institucionais"
   (kind `hub`, path `''`) não está em lugar nenhum da fonte — é artefato da
   extração, e o portão do DERBY a classifica como pendência de chave (veja
   `DECLARACOES_ESTRUTURAIS` em `scripts/preencher-derby.mjs`).

## 4. O que foi recuperado, e como

A correspondência está em `mappings/recuperacao-fonte.json` — uma tabela
explícita e revisada, com a razão de cada linha. A migration
`migrations/0042_recuperar_fonte.sql` é **gerada** a partir dela por
`scripts/gerar-migration-recuperacao.mjs`, que também recusa gerar a migration
se alguma pendência estiver sem dono na tabela (mapeada ou nomeada).

O texto vai **literal**, com a proveniência no comentário de cada comando: o
arquivo de origem, o sha256, a seção de origem e o motivo da correspondência.

**Regra que a migration segue:** uma seção pendente só é recuperada quando a
fonte tem **uma** seção do mesmo assunto, cujo texto o site já publica. Não há
resumo, não há paráfrase, não há número que não esteja no texto da fonte. A
faixa clínica nunca é inventada.

**O que NÃO foi recuperado (18 achados nomeados).** Onde a fonte não tem o
assunto, a pendência fica com o marcador e vira achado com nome, na tabela
`pendenciasSemCorrespondencia` e na seção 6 abaixo. São páginas que são
escrita do autor: a oferta comercial, a FAQ, as limitações conhecidas, os
conflitos de interesse, a metodologia de medição.

## 5. O portão

`scripts/auditar-fonte.mjs --check` (e `--self-test`) prova que a recuperação
está certa:

- o texto no banco é **idêntico** ao texto da fonte, caractere a caractere —
  um portão que só checasse "o campo não está vazio" passaria com texto
  inventado;
- a migration cita o sha256 de cada arquivo de origem;
- nenhum gancho `PENDENTE` sobrou (no banco inteiro, não só em `inst_section`);
- toda pendência que sobrou está nomeada como achado — e nenhum achado
  obsoleto;
- o `--self-test` quebra o texto recuperado e o gancho, e prova que o portão
  acusa os dois.

## 6. Os 18 achados (pendência que só o autor fecha)

| Página | Seção | Por quê não há texto na fonte |
|---|---|---|
| acessibilidade/declaracao-de-acessibilidade | 5. Limitações conhecidas | a fonte não lista limitações do site |
| assinante/condicoes-da-assinatura | 3. Renovação e reajuste | condição comercial do autor |
| assinante/condicoes-da-assinatura | 5. Recibos e nota fiscal | emissão fiscal do autor |
| assinante/conta-e-exclusao-de-dados | 1. O que fica na sua conta | a política do app na fonte diz que ele não coleta dados; a conta é do autor |
| assinante/perguntas-frequentes | 1. Uso da plataforma | pergunta e resposta do autor |
| assinante/perguntas-frequentes | 2. Assinatura Premium | pergunta e resposta do autor |
| assinante/perguntas-frequentes | 3. Cancelamento e reembolso | pergunta e resposta do autor |
| assinante/perguntas-frequentes | 4. Privacidade | pergunta e resposta do autor |
| assinante/planos | 1. Gratuito e Premium | oferta comercial do autor |
| assinante/planos | 2. Recurso por recurso | oferta comercial do autor |
| assinante/planos | 3. Preço e condições | preço do autor |
| editorial/fontes-e-evidencias | 1. Ordem de prioridade | a hierarquia de fontes é do autor |
| editorial/fontes-e-evidencias | 4. Quando as fontes divergem | a fonte não tem essa seção |
| privacidade/cookies-e-consentimento | 5. Referências e fontes | a política da fonte não tem bibliografia |
| sobre/equipe-e-autores | 3. Conflitos de interesse | declaração do autor |
| sustentabilidade/metodologia-de-medicao | 3. Limites das estimativas | a fonte descreve práticas, não limites |
| sustentabilidade/metodologia-de-medicao | 5. Referências e fontes | a fonte não tem bibliografia |
| sustentabilidade/relatorios-de-sustentabilidade | 1. Relatórios publicados | os relatórios ainda não existem |

## 7. O que a fonte tem e o banco não tem

O confronto também lista **2.097 páginas** que estão na fonte e não têm lugar
no banco (a biblioteca com 1.400 materiais, os guias rápidos, os simulados, o
mapa do site, os 19 idiomas das páginas estáticas). O inventário completo está
em `artifacts/fonte/confronto.json`, em `soNaFonte`.

Esse é o trabalho que sobra para a frente da fonte: o acervo publicado que
ainda não tem lugar no banco.

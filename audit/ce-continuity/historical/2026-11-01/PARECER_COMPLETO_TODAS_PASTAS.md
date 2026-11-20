# Auditoria transversal de todas as pastas — pacote sandbox-completo.tar.gz

**Escopo:** leitura estática de todas as 4.518 entradas regulares do TAR atual, SHA-256 por arquivo, cruzamento com os 5.221 arquivos do backup anterior (`sandbox-backup-completo (2).tar.gz`) e preservação dos achados anteriores sobre GitHub, Supabase, produção, CKO e Kernel. O parecer anterior de `_archive/` continua válido; este documento o complementa, não cria projeto ou backlog paralelo. **Não houve merge, alteração de banco ou deploy.**

## Resultado executivo

O problema predominante é **fragmentação de fontes e caminhos**, não falta generalizada de conteúdo. O projeto está separado entre aplicação (`src/`), contratos/registros (`src/data/`), serviços gerados em `upload/`, ativos públicos (`public/`), verificação (`scripts/`, `.github/workflows/`, `tests/`, `e2e/`) e acervo de evidências/documentos no `_archive/`. Há caminhos históricos consumidos ainda hoje; logo, `_archive/` não pode ser excluído com segurança só por seu nome.

- **4.518** arquivos regulares no atual, contra **5.221** no anterior.
- **4.252 hashes de conteúdo distintos** no pacote atual (266 entradas excedentes por repetição de hash, sem afirmar equivalência semântica).
- **514** arquivos em `_archive/`; dos quais 178 idênticos no mesmo caminho ativo, 7 idênticos em outro caminho, 13 com conteúdo divergente no caminho correspondente e 316 sem cópia idêntica fora de `_archive/`.
- **230 caminhos novos**, **11 alterados** e **933 ausentes da localização anterior**. Entre os 933 ausentes, 615 têm hash idêntico em outro caminho; dos 318 sem hash equivalente, **316 estavam em `_archive/download/`** e **2 em `upload/ce-skeleton/.../acoes/download/`**. A versão anterior preserva os 318 bytes originais.
- **Arquivo `.env` presente** com valores não vazios; nenhum valor foi copiado neste parecer. Tratar como potencial exposição antes de qualquer compartilhamento/publicação.
- **Nenhuma nova homologação de produção** comprovada pela reorganização, portanto a estimativa anterior de maturidade (56%) e conclusão (43%) não deve ser atualizada com base em quantidade de arquivos.

## Todas as pastas de primeiro nível

| Pasta | Arquivos regulares | Papel no mesmo sistema | Conclusão de classificação |
|---|---:|---|---|
| `src/` | 2.366 | Aplicação + contratos/registros | **Ativo misturado**: é necessário distinguir runtime de entradas editoriais, candidatas e geradas |
| `upload/` | 922 | Esqueleto de serviços, catálogo, material recebido | **Fonte candidata segregada**, não evidência de 410 serviços implantados |
| `_archive/` | 514 | Evidência, documentação, histórico, scripts, parte de dependências ainda consumidas | **Preservar e reconciliar**; não retirar por nome |
| `public/` | 301 | Imagens, branding, assets públicos | **Ativos únicos** que não devem ser descartados por comparação com HTML antigo |
| `skills/` | 167 | Ferramentas auxiliares | 167/167 têm equivalentes byte a byte em `_archive/skills`; cópia, não outra capacidade |
| `scripts/` | 148 | Geradores, validadores, auditorias | 145 hashes exclusivos no pacote; têm efeito nos gates, não confundir com produção |
| `tool-results/` | 23 | Saídas de inspeção | Evidências de execução, não contratos canônicos |
| `audit/` | 11 | Estado atual de auditoria | Contrapõe estados históricos; preservar ambos com timestamp |
| `migrations/` | 11 | SQL candidato no pacote | 11/11 também no archive; **não** são espelho das 240 migrations do Supabase registradas anteriormente |
| `.github/workflows/` | 11 | Pipelines | Referências a `audit-evidence/`; exigem resolução dos alvos de links simbólicos para execução coerente |
| `tests/` | 9 | Testes isolados e E2E | Não representam todo o conjunto de testes, pois há testes em `src/` e `scripts/` |
| `e2e/` | 8 | Suites E2E | Presença de teste não comprova execução/homologação em produção |
| `test-results/` | 9 | Artefatos e relatórios de testes | Estados transitórios por execução |
| `docs/` | 4 | Documentação ativa de alto nível | A maior parte do acervo documental do TAR está em `_archive/docs/` (115 arquivos) |
| arquivos/configuração na raiz | 14 | README, package, relatórios, `.env`, lock, configurações, etc. | Não devem ser classificados conjuntamente como catálogo |

## Profundidade de `src/` — conteúdo que deve permanecer no inventário anterior

- `src/data/` tem **2.081 arquivos**: `contracts/` **747**, `registers/` **1.333**, `i18n-content/` **1**.
- `src/data/contracts/`: `cko-skeletons/` **351** (manual visual, componentes e templates), `cko-bibliotecas/` **190** (108 bindings, 47 schemas, 27 entidades e outros), `cko-skeleton/` **67**, `cko-schemas/` **63**, `cko-editorial/` **31**, `entities/` **17**, `cko-tokens/` **17**, `cko-governance/` **6** e `vila/` **5**.
- `cko-skeleton/` e `cko-schemas/` compartilham **54 arquivos com hash idêntico** entre as árvores. Isso é duplicidade física identificada, não razão suficiente para escolher/excluir uma autoridade de importação.
- `src/data/registers/i18n/` tem **1.174 arquivos**, dos quais **1.140** estão em `incoming/` (19 idiomas × 60 arquivos). Inclui ainda candidatos, índices e registros de revisão. Não interpretar `incoming` como traduzido/publicado sem os gates de tradução e tela.
- `src/data/registers/governance/` tem **149 arquivos**, dos quais **142** em instâncias de fontes transversais; parte é material normativo/metadata, não homologação por si só.
- `src/routes/` tem **50 arquivos**; `src/components/` **61**, `src/lib/` **121**, `src/core/` **32**. `src/lib/research/`, `src/lib/career/`, `src/lib/tools/` e componentes administrativos demonstram código já existente fora do catálogo estrito das 83 ferramentas.
- Os módulos `tool-states`, `clinical-truth` e `consumer-recognition` são referenciados, no escopo de código analisado, essencialmente por testes e scripts de auditoria, não por rotas e renderers. Manter achado anterior: a política isolada ainda não prova integração de runtime.

## `upload/` — não confundir catálogo com serviço implementado

- Há **917 arquivos** em `upload/ce-skeleton/ce-skeleton` (incluindo 863 sob `src/families/`), com catálogo de **410 serviços**, 201 capacidades e bindings candidatos. O README do próprio esqueleto declara que os serviços não são todos implementados.
- A árvore atual apresenta **409 `index.ts`** para os serviços onde o registro principal declara 410. Os arquivos `src/families/acoes/download/contract.ts` e `index.ts` constavam no backup anterior, mas não estão no atual; preservados como candidatos recuperáveis em staging, sem escrita na fonte.
- Outros **5 arquivos** em `upload/` incluem três notas/textos recebidos, uma avaliação e um ZIP do esqueleto. Contam como material de entrada/alternativa de transporte, não como cinco módulos extras.

## `public/` — diferenciar fonte, render e exportação

- **301 arquivos**, dos quais **262 em `public/bibliotecas/`** (240 em `assets/` e 22 em `anatomia/`). Os 262 possuem hashes distintos, e não foram identificadas cópias byte a byte no TAR atual.
- A ausência de HTML antigo de preview em `_archive/download/` não implica ausência das imagens AVIF publicadas nem, inversamente, que o HTML seja reproduzível integralmente dos AVIF. Não equiparar representações diferentes.
- Persistem branding, artigos e arquivos web (sitemap/robots/ícones); verificar relação com projeções, sem derivar status clínico do simples arquivo público.

## Arquivos anteriores ausentes da posição antiga

- **252 arquivos** da antiga `_archive/download/cko-image-library` (251 HTML + 1 JSON), total ~7,3 MB descompactados.
- **59 arquivos** da antiga `_archive/download/cko-templates-piloto` (30 HTML + 29 PNG), total ~14,8 MB.
- **5 outros itens** do `_archive/download/` (README, 3 relatórios de auditoria e 1 schema), e **2 arquivos** do serviço `acoes/download`.
- Alguns materiais que mudaram de serialização podem não ter hash idêntico mesmo quando semanticamente equivalentes. O inventário por SHA é indicador exato de bytes, não prova de perda nem redundância semântica.

## `scripts`, `.github`, `audit` e links

- **11 workflows** e **148 scripts** existem no TAR, mas essa presença não comprova que todos estejam em `.github` da `main`, nem que tenham sido executados contra produção.
- Os workflows referenciam `audit-evidence/` em diferentes pontos; o symlink principal `audit-evidence -> audit/audit-evidence` não resolve dentro do TAR. `audit-run` apresenta problema análogo. Já `schemas -> _archive/schemas` resolve e confirma dependência de arquivos arquivados.
- O relatório ativo indica **20/21** cenários aprovados; o histórico em `_archive/` indica 21/21 numa data anterior. O gate atual permanece `BLOCKED`. Não somar ou substituir resultados.
- `tool-results/` contém saídas de inspeção; deve preservar proveniência, mas não constitui autoridade de contrato ou aprovação.

## Metamodelos, banco e interfaces — reconciliação com a auditoria anterior

Não houve nova leitura integral do banco ou execução E2E nesta etapa. Mantêm-se os números **consultados anteriormente** para o Supabase Calculadoras-Smart: 41 schemas, 487 tabelas, 49 views e 240 migrations, além de 45 tipos de entidade, 90 tipos de relação, 2.496 linhas no catálogo de campos e 1.164 entidades. O TAR atual não substitui o inventário do banco.

A maturidade estimada de **56%** e a conclusão estimada de **43%** foram calculadas anteriormente por avaliação ponderada. A simples reorganização neste pacote não fornece evidência de mudança desses índices.

## Disposição sem abrir demanda paralela

A mesma reconciliação já existente deve receber os rótulos de inventário `ACTIVE_RUNTIME`, `ACTIVE_CONTRACT`, `CANDIDATE`, `ARCHIVED_DEPENDENCY`, `ARCHIVED_EVIDENCE`, `IDENTICAL_DUPLICATE`, `PATH_MOVED`, `CONFLICT`, `HISTORICAL_PREVIEW` e `MISSING_IN_CURRENT_PRESENT_IN_PRIOR`. Não se trata de uma nova implementação, nova arquitetura ou proposta de outra fonte da verdade. Os caminhos e hashes completos estão nos CSVs anexos.

**Parecer:** preservar todos os acervos até reconciliação de autoridade, inclusive `_archive/`; não reimportar skills e migrations byte a byte; não tratar HTML antigo, scripts ou serviços candidatos como produto ativo. Nenhuma alteração remota foi efetuada.
# Entrega — normas: confronto e plano de captura

**Tarefa:** `normas-requisitos` · **Data:** 2026-10-26 (UTC) · **Árvore:** `/workspace/workspace-repo` · branch `feat/projection-unica-f0-suite-real`, `HEAD` `51dfc7b`

## 1. Resumo

Conferi a preservação existente da aquisição transversal (79 arquivos, 79/79 blobs idênticos à linhagem de governança e 50/50 entradas do `SNAPSHOT-MANIFEST.json` com SHA-256 e tamanho conferidos, **0 divergências**), sem repetir nenhum download. Medi o estado real do site e escrevi o confronto com os 11 requisitos de um site de normativos (`docs/normativos/requisitos.md`) e o plano de captura do conjunto de enfermagem (`docs/normativos/plano-de-captura.md`, com robots/content-signals por host, tipo de captura, direito e limite de 1 req/s). Nenhuma afirmação normativa sem fonte: onde a fonte oficial não foi vista, há marcador `[VERIFICAR: ...]`.

## 2. Conferência de hash


| Métrica | Valor |
|---|---|
| Arquivos em `audit-evidence/transversal-acquisition/` | **79** |
| Entradas no `SNAPSHOT-MANIFEST.json` | 50 |
| Entradas do manifesto conferidas (SHA-256 **e** tamanho) | **50 / 50** |
| Divergências de hash | **0** |
| Entradas ausentes | **0** |
| Arquivos fora do manifesto (índice por artigo, readback, eMAG estendido, README, o próprio manifesto) | 29 |
| Blobs idênticos a `origin/preview/central-comando-20261026` (`git hash-object`) | **79 / 79** |
| Blobs divergentes / órfãos | **0** / **0** |
| Fontes indexadas / fatias de artigo | 21 / **1577**, todas com `reviewed: false` |
| `kernelAdmission` · `extractionReviewed` · `approvalOrRelease` | `false` · `false` · `false` |

**Segunda camada, por hash de conteúdo.** A conferência de blob prova que os bytes são os da outra linhagem; não prova que o conteúdo bate com o que cada manifesto afirma. Por isso foi rodada uma conferência por **SHA-256 de conteúdo** sobre **96 pontos de referência** que existem dentro da própria árvore, mais as **1.577 fatias de artigo**:

| Camada | Referência | Conferências | Divergências | Ausentes |
|---|---|---:|---:|---:|
| A — `SNAPSHOT-MANIFEST.json` | `files[].sha256` **e** `files[].sizeBytes` | **50** | **0** | **0** |
| A — o manifesto contra si mesmo | `sourceManifestSha256` contra `manifest.json` | **1** | **0** | **0** |
| B — eMAG | `evidence.json → artifacts[*].sha256` **e** `sizeBytes` | **3** | **0** | **0** |
| C — índice por artigo | `extractedTextSha256` e `originalSha256` das 21 fontes | **42** | **0** | **0** |
| **Total** | | **96** | **0** | **0** |
| C — fatias de artigo | `articles[].sliceSha256` contra os bytes `[startByte, endByte)` | **1.577** | **0** | **0** |

**Nenhum arquivo foi corrigido em silêncio:** arquivo que não confere é FAIL registrado, com hash esperado e obtido. Não houve nenhum FAIL.

**Nenhum download foi repetido** — o runbook proíbe repetir download de fonte já preservada com hash idêntico sem motivo documentado. Registro completo em `audit-evidence/transversal-acquisition/CONFERENCIA-HASH.md`.

### Tabela por arquivo

| arquivo | bytes | SHA-256 (recalculado) | manifesto | blob vs linhagem B |
|---|---:|---|---|---|
| `article-index/20261024/index-manifest.json` | 9436 | `812c27571f44f482c4b9975cb8a312f81249c0604dd4301088e4dbbbfc902d91` | SEM-MANIFESTO | idêntico |
| `article-index/20261024/sources/transversal-public.decreto-7-962-2013.json` | 4857 | `adde5dd3ae3f50005a5a8f53a3e2033da3dec8fd8231ed10689f6ada5224528d` | SEM-MANIFESTO | idêntico |
| `article-index/20261024/sources/transversal-public.decreto-8-771-2016.json` | 24487 | `0f98c05341b6668fa9117332c3e4aedb260239196423452a4cc85455e70454b6` | SEM-MANIFESTO | idêntico |
| `article-index/20261024/sources/transversal-public.lei-10-098-2000.json` | 12414 | `8a5952298e2761df563a62068be376b8f6c77a220c06dc5fb6a2e778dc3e4b51` | SEM-MANIFESTO | idêntico |
| `article-index/20261024/sources/transversal-public.lei-10-436-2002.json` | 3105 | `962fbc4c46a40dafc9b429cc841582ec32c1c41470a92b01983a5459c5d6cfa4` | SEM-MANIFESTO | idêntico |
| `article-index/20261024/sources/transversal-public.lei-12-187-2009.json` | 5508 | `3b41121b07f99b9989ae107972a0d73459823303f64b3887859df691b8e367c0` | SEM-MANIFESTO | idêntico |
| `article-index/20261024/sources/transversal-public.lei-12-305-2010.json` | 24139 | `af0097932cb217bd0adff6fbc2664c39621066de7d2bbd7a6f8fab66f7577df7` | SEM-MANIFESTO | idêntico |
| `article-index/20261024/sources/transversal-public.lei-12-965-2014.json` | 15161 | `0a4a732fc4e1a4a065529c9472f27b5d2d9f676a7e063076d7cb299678db94be` | SEM-MANIFESTO | idêntico |
| `article-index/20261024/sources/transversal-public.lei-13-146-2015.json` | 47654 | `54b3cc6cf2f69aee866235f1211d6e16501e3455562e567c173a91f06e6f4aca` | SEM-MANIFESTO | idêntico |
| `article-index/20261024/sources/transversal-public.lei-13-709-2018.json` | 30010 | `507da35d09ecacdc7d782e5a521cc5c06d754018e56fdd49e057f2e81c017d9f` | SEM-MANIFESTO | idêntico |
| `article-index/20261024/sources/transversal-public.lei-13-787-2018.json` | 3790 | `7b7ee7c1a915cfa2c63428418739fdcd13842143e4fc41d0ba9af338340b9a53` | SEM-MANIFESTO | idêntico |
| `article-index/20261024/sources/transversal-public.lei-14-874-2024.json` | 23422 | `661b42cb682f8547bb5490f954776fa8b9ff570307a7177ecd146fdd7389ce44` | SEM-MANIFESTO | idêntico |
| `article-index/20261024/sources/transversal-public.lei-15-042-2024.json` | 25177 | `4ab413dabe139b84c7569bbfced9d68baa4f9d0f1f85448eac3c107b1c7adac4` | SEM-MANIFESTO | idêntico |
| `article-index/20261024/sources/transversal-public.lei-15-211-2025.json` | 18672 | `0e083d23608425e7e6069c21d426a75f2447a4a2a63a58085149256ccceeb8b5` | SEM-MANIFESTO | idêntico |
| `article-index/20261024/sources/transversal-public.lei-8-069-1990.json` | 114927 | `ef808cf1f4ef7389f18608f9804579080efb0007fe7c548ba286e8fe049dbf52` | SEM-MANIFESTO | idêntico |
| `article-index/20261024/sources/transversal-public.lei-8-078-1990.json` | 46436 | `109dd9efe97fc9e4f9085cdac8b899d586d5a959900a5c7a80ed77eb94612f5a` | SEM-MANIFESTO | idêntico |
| `article-index/20261024/sources/transversal-public.lei-9-279-1996.json` | 87307 | `1015bf35a0a5ec4342873a31d5b2c0744ff78af4fe4a9a6e1c009ff468557010` | SEM-MANIFESTO | idêntico |
| `article-index/20261024/sources/transversal-public.lei-9-609-1998.json` | 6854 | `24523d52ec9fdc60f383f7c906831d7e05a3ca0b9404c1fd6be21de8fb6ca51f` | SEM-MANIFESTO | idêntico |
| `article-index/20261024/sources/transversal-public.lei-9-610-1998.json` | 46104 | `a71d6f632fb4dc7720736678579093b4b82da5e89a5b361a706c32b56782af8c` | SEM-MANIFESTO | idêntico |
| `article-index/20261024/sources/transversal-public.resolu-o-anpd-15-2024.json` | 10887 | `8727a68777d8537bc9379d14c94e4d376dd402bd8e4accb2a5a87e01e51d759f` | SEM-MANIFESTO | idêntico |
| `article-index/20261024/sources/transversal-public.resolu-o-anpd-18-2024.json` | 9459 | `2e9a5dd1da4f07afec32b6bf63313f443c7b24dc5324418397352b9477086b6f` | SEM-MANIFESTO | idêntico |
| `article-index/20261024/sources/transversal-public.resolu-o-anpd-19-2024.json` | 14031 | `0401449178c30acd0d0139c1d8f1df36b4a7bfb154341273f08f9ef6bbdb2e7e` | SEM-MANIFESTO | idêntico |
| `runs/readback-20261024.v1.json` | 6622 | `e495d978584997840ba432833f11d258aebc990caf3e414c6003e5e1dae5b7c7` | SEM-MANIFESTO | idêntico |
| `snapshots/20261024-extended/emag/LICENSE-AND-ATTRIBUTION.txt` | 495 | `88d3b9e0e0ee1d84758503cc9cc8302220e4b8418ab39441dba4144055939e43` | SEM-MANIFESTO | idêntico |
| `snapshots/20261024-extended/emag/evidence.json` | 935 | `0a0722367511f816f0b137372e91d949982fcc5c0a38d2619fb63d07bc2cdf14` | SEM-MANIFESTO | idêntico |
| `snapshots/20261024-extended/emag/extracted.txt` | 135421 | `48bec70b52d4b1aa0e8913949b3f4200801b4b4b59b6ffd862d7d6a994a64218` | SEM-MANIFESTO | idêntico |
| `snapshots/20261024-extended/emag/original.html` | 245459 | `5672612e5a59233889e47b9d0103429a26cd712e6a24dde05be28b84030c2d68` | SEM-MANIFESTO | idêntico |
| `snapshots/20261024/README.md` | 662 | `222b75f1aac4f48cd128f6aa3429a2e0167b8e6bdb726c6a9a9385f644835418` | SEM-MANIFESTO | idêntico |
| `snapshots/20261024/SNAPSHOT-MANIFEST.json` | 10001 | `633ee0e687da0ed502d1f732cd77a0ed222059e989a8cfc43d9e541c9da6be94` | SEM-MANIFESTO | idêntico |
| `snapshots/20261024/items.jsonl` | 29364 | `8ac4ee40f61932fd6e36a3cf2df6fe6f65d431712c07c4b137f247be7f72132d` | OK | idêntico |
| `snapshots/20261024/manifest.json` | 33906 | `523cc07649f643b4849077980ae60c92f13ed13a78621d1d6be73e6388b1907c` | OK | idêntico |
| `snapshots/20261024/public-acts/decreto-7-962-2013/extracted.txt` | 5636 | `cc010e802045b3835e2c9be21f59fbc22b48afb901b5ec7a06ad1fede8c48234` | OK | idêntico |
| `snapshots/20261024/public-acts/decreto-7-962-2013/original.html` | 16589 | `1d2d0fe6d37f6c6b31cfdbbacb1fc202eeab708b840b29cc0dd754e37bf49738` | OK | idêntico |
| `snapshots/20261024/public-acts/decreto-8-771-2016/extracted.txt` | 36134 | `8a8cf57ea287042039f3f0942776513fa6de5e1cbc8988b089a55c567d168509` | OK | idêntico |
| `snapshots/20261024/public-acts/decreto-8-771-2016/original.html` | 113231 | `29873f0d0384c5238e7012170caae7f657753cefb6b16ebe45bf5365f0995f0b` | OK | idêntico |
| `snapshots/20261024/public-acts/lei-10-098-2000/extracted.txt` | 23672 | `8dd2456da613295cf2763547fe228bfee7f5528dfd2cedde429da87095016edd` | OK | idêntico |
| `snapshots/20261024/public-acts/lei-10-098-2000/original.html` | 47957 | `66d794d5cf43b803f9d6a5d70adf12aa10457640b6aae94ab558b1241f6f38a4` | OK | idêntico |
| `snapshots/20261024/public-acts/lei-10-436-2002/extracted.txt` | 2155 | `38b38682e7e376ba1165cf444a7cfcf75bff9bfc78ca319946dddb2150e307b9` | OK | idêntico |
| `snapshots/20261024/public-acts/lei-10-436-2002/original.html` | 6161 | `3a3d874f876df2e7bb0d3ff81acdf0696d4b1cf7f37728b7b39deb86a1f6f07a` | OK | idêntico |
| `snapshots/20261024/public-acts/lei-12-187-2009/extracted.txt` | 15551 | `b1aeae4d8d5d5e5eab42d30d12946920dd4954ef49d908ba40bcd1d4b070a7fb` | OK | idêntico |
| `snapshots/20261024/public-acts/lei-12-187-2009/original.html` | 33254 | `df9d011abfcaf6e0f7b022b18d28dfd7a0809f2b7da4e333de75726febc4e11a` | OK | idêntico |
| `snapshots/20261024/public-acts/lei-12-305-2010/extracted.txt` | 67069 | `89d0258f91e87d499f697d3a6e946be7c86cee7b9b7e7c100a67bb2f3aa3c5fd` | OK | idêntico |
| `snapshots/20261024/public-acts/lei-12-305-2010/original.html` | 148676 | `b4bd117ec1173ac3bdc22e28191b73b2c8cd521af4f39913af9cc79f560bb638` | OK | idêntico |
| `snapshots/20261024/public-acts/lei-12-965-2014/extracted.txt` | 45633 | `9f0874a37fbb0eedce78277febbe49626ebea1e689b5cb5a1cfc5f03ea00006f` | OK | idêntico |
| `snapshots/20261024/public-acts/lei-12-965-2014/original.html` | 119976 | `b26560d6cd96441ac3bcfca539ef8b68789dd80d0837ff239f06ef090bad9ba1` | OK | idêntico |
| `snapshots/20261024/public-acts/lei-13-146-2015/extracted.txt` | 119090 | `e031f7b8490cfaafd9cb59a12a842998a19340bf03d3a7acc2889fc1adffe837` | OK | idêntico |
| `snapshots/20261024/public-acts/lei-13-146-2015/original.html` | 243670 | `39d944e1a5cafd741aac541b26f0fcc3c1dc5bf3faf263798599c98aac105157` | OK | idêntico |
| `snapshots/20261024/public-acts/lei-13-709-2018/extracted.txt` | 83239 | `49bfc3b233232bb15dec064bdd4424a4e5284167d6e173ce6e680817d9a26800` | OK | idêntico |
| `snapshots/20261024/public-acts/lei-13-709-2018/original.html` | 230913 | `b62d6c823ea01f17637b03ccd3bfa59edd9de95d744e30f12b86e4a4a71a8c99` | OK | idêntico |
| `snapshots/20261024/public-acts/lei-13-787-2018/extracted.txt` | 4249 | `50ef955ebcfa9fe19351d7b8c0d6f9dfa310af0c3f8a9ea4d5a8de92cfe87334` | OK | idêntico |
| `snapshots/20261024/public-acts/lei-13-787-2018/original.html` | 15333 | `76dd23b58f3707b0180a1d77b6772eb99d5fcf076515989b7bc32ea4f5eb2521` | OK | idêntico |
| `snapshots/20261024/public-acts/lei-14-874-2024/extracted.txt` | 67613 | `499c39206e8d2159cdbc93adf5d6fabca86a12f6dc118da54ec0c967223413a3` | OK | idêntico |
| `snapshots/20261024/public-acts/lei-14-874-2024/original.html` | 162553 | `73ddc5e4c76695934fc1cd251ac9500fff4414d28294d109656d2e21e0f21ecb` | OK | idêntico |
| `snapshots/20261024/public-acts/lei-15-042-2024/extracted.txt` | 83489 | `14dee18b781f49b1afe082d54ee1a5a8c5da5fb54bec9ccef42c57c714001f40` | OK | idêntico |
| `snapshots/20261024/public-acts/lei-15-042-2024/original.html` | 193606 | `ae798beb68d7b5ffcee3a9f12a21aaca12731b7cc25cc2d67126679c4f9e212d` | OK | idêntico |
| `snapshots/20261024/public-acts/lei-15-211-2025/extracted.txt` | 49582 | `492942a1da9c2dcea47d84c897f214d87d33995226d66ea819d5935045bc6d14` | OK | idêntico |
| `snapshots/20261024/public-acts/lei-15-211-2025/original.html` | 114549 | `723c3c7254ef0742ef25bc940e81a0382701c208edc21d14655e023be4d41e6d` | OK | idêntico |
| `snapshots/20261024/public-acts/lei-8-069-1990/extracted.txt` | 262209 | `8e70a7fee963e6d07376a0628c5ec99ca8043a4b23d47cad08166a5335a578a5` | OK | idêntico |
| `snapshots/20261024/public-acts/lei-8-069-1990/original.html` | 533276 | `c4050e9986705dbae64b763f154e8c0dcdd9d971750ab98704c0825e28ef83bd` | OK | idêntico |
| `snapshots/20261024/public-acts/lei-8-078-1990/extracted.txt` | 86849 | `611758db13202fad2d5b85bd2f18f1bb82fcda344fd5cb2c42a0164a7b745eff` | OK | idêntico |
| `snapshots/20261024/public-acts/lei-8-078-1990/original.html` | 170672 | `4f37bdc8c0b1d0c5605c08b5a653bd836c7c882baba111cd9ee2ca8611befab1` | OK | idêntico |
| `snapshots/20261024/public-acts/lei-9-279-1996/extracted.txt` | 114256 | `cc240a31ec29704bf186a083b9625f5415ede1087788b5fb3fe7247c519a0a76` | OK | idêntico |
| `snapshots/20261024/public-acts/lei-9-279-1996/original.html` | 263647 | `2ed97e312e629fc7dbb3787280dc8149c0e51f8878f95031b2106c12c2e5ddcc` | OK | idêntico |
| `snapshots/20261024/public-acts/lei-9-609-1998/extracted.txt` | 12391 | `7a63f2f28d34b2af36c85b02c9aa5648b4579f692dc155c77a313c1d05061dd7` | OK | idêntico |
| `snapshots/20261024/public-acts/lei-9-609-1998/original.html` | 21993 | `9d51305dc7af621708f6af1733e0d7630307b716d7e40c89d3864fcc171cc26a` | OK | idêntico |
| `snapshots/20261024/public-acts/lei-9-610-1998/extracted.txt` | 76217 | `1079f8238a26c697f3acfd774a7a9f2d8dd06c52cd18583315dbfa2da72a4c8b` | OK | idêntico |
| `snapshots/20261024/public-acts/lei-9-610-1998/original.html` | 148434 | `f79e1dd2898a1b91e4b1cfe2f654b1ac23c49ec967924c326fd2e91d9f582560` | OK | idêntico |
| `snapshots/20261024/public-acts/resolucao-anpd-15-2024/extracted.txt` | 25400 | `bcec7adf207be87147de231187524e72d2fa699ce5f1ef7428f5cd48d7320f85` | OK | idêntico |
| `snapshots/20261024/public-acts/resolucao-anpd-15-2024/original.html` | 77541 | `6cb59670af64123f857fce1f9ea4f6af5031f74d552960468fff39b758fbccbc` | OK | idêntico |
| `snapshots/20261024/public-acts/resolucao-anpd-18-2024/extracted.txt` | 13614 | `446e7a8a7949d74ae79b77ed517d1b1e18dca41b539b25ea2838dc093d2c4b16` | OK | idêntico |
| `snapshots/20261024/public-acts/resolucao-anpd-18-2024/original.html` | 59214 | `ffa31b9b90a688792b71b4f4306494ad829180949e9ae5f0b841abb03aba2316` | OK | idêntico |
| `snapshots/20261024/public-acts/resolucao-anpd-19-2024/extracted.txt` | 68787 | `86c315ab23a3b8dba1fdc3a41ec7f7d6bbb1461724479a702de524f0674c64b8` | OK | idêntico |
| `snapshots/20261024/public-acts/resolucao-anpd-19-2024/original.html` | 706693 | `07521072455d70cd98dc758ee3d2c8870b447a5a20f52572058400b07506052c` | OK | idêntico |
| `snapshots/20261024/public-standards-w3c/trv-010/LICENSE-AND-ATTRIBUTION.txt` | 364 | `d5842e63473ee596d424e2b0c999d726be043ff2692b35354acec98cdd794358` | OK | idêntico |
| `snapshots/20261024/public-standards-w3c/trv-010/original.html` | 464179 | `6b96671ab84faf12ce3f041aca12c3f93a6df2ed242348810743179a68e69555` | OK | idêntico |
| `snapshots/20261024/public-standards-w3c/w3c-shacl/LICENSE-AND-ATTRIBUTION.txt` | 365 | `d030730e5840ded3c01c5878252aca9e7e32e724288abd26d143e127446d56db` | OK | idêntico |
| `snapshots/20261024/public-standards-w3c/w3c-shacl/original.html` | 531275 | `ccca77caed771f42ea649c03d190b9c7ea0b82286c22c457b9edc8087c9ad0f8` | OK | idêntico |
| `snapshots/20261024/public-standards-w3c/wcag-2-2/LICENSE-AND-ATTRIBUTION.txt` | 365 | `f8e14069fc69809a225dd1ddc8dd7e6811be17e4b1bb27979b1bdb50868e273c` | OK | idêntico |
| `snapshots/20261024/public-standards-w3c/wcag-2-2/original.html` | 512457 | `6e3c5fe397257cae509a2fb4752b73062cf8cbeb92c2cec618989b17e4cf7057` | OK | idêntico |

## 3. O confronto — 11 requisitos

Detalhe completo, com arquivo/tabela/rota, tarefa nomeada e destino no banco: **`docs/normativos/requisitos.md`** (11 seções R1–R11 + R12 de consolidação; 8 itens de NOT_RUN).

| # | Requisito | O que existe (medido) | O que falta (tarefa nomeada) | Onde deve morar |
|---|---|---|---|---|
| R1 | Identificação e vigência da norma | Identificação no `slug`/`title` de `content_object` e `content_text` (24 `kind='norma'`). **Nenhuma coluna de vigência em nenhuma tabela** | `T-R1.1`..`T-R1.3` — data de publicação ≠ data de entrada em vigor; vínculo texto publicado ↔ norma | tabela nova `norma` + `content_object.norma_id` |
| R2 | Revogação e alterações | Nada estruturado. A única revogação no repositório vive **dentro do texto** de uma página (`migrations/0015_site_route_body.sql`). `document_version` tem a forma certa e **0 linhas** | `T-R2.1`..`T-R2.3` — revogação como dado; retificação como caso de 1ª classe | tabela nova `norma_relacao` + `document_version.norma_id` |
| R3 | Escopo e aplicabilidade | `fundamento` com 43 linhas (`id`, `name`, `domain`, `right_name`, `priority`); `specimen`/`specimen_line` (170 linhas) com procedência em texto livre | `T-R3.1`..`T-R3.3` — escopo, exceções, e a decisão de aplicabilidade com responsável | `norma_aplicabilidade` + colunas em `norma` |
| R4 | Evidência por campo | `kernel_atom.source_quote`, `.pinpoint`, `.source_quote_sha256` **existem** (criadas por `migrations/0038_processo_source.sql`, fora do meu escopo) e as 4 linhas estão preenchidas. **Em nenhuma** tabela do conteúdo publicado | `T-R4.1`..`T-R4.3` — trecho literal + hash + pinpoint no texto público | colunas em `content_text` + `evidencia_campo` |
| R5 | Busca com filtro | `src/components/site/section-page.tsx:91` — `includes()` de substring sobre os blocos de **uma** seção. Admin filtra `fundamento` por `id+name+domain` | `T-R5.1`..`T-R5.3` — filtro por órgão, tipo, vigência, ano, identificador oficial; busca por trecho | colunas indexadas em `norma` |
| R6 | Transparência editorial | **A Central Editorial existe**: 6 páginas em `inst_page` (política editorial, fontes e evidências, correções e erratas, aviso clínico, uso responsável de IA, auditoria de governança regulatória). Regras vivem em TypeScript, não no banco | `T-R6.1`..`T-R6.4` — política versionada com vigência e responsável; errata vinculada à norma | `editorial_politica` + `errata` + `editorial_line.norma_id` |
| R7 | Declaração de acessibilidade (WCAG) | `acessibilidade/declaracao-de-acessibilidade` existe e declara **WCAG 2.2, nível AA**; o código tem skip-link, `role="toolbar"`, foco gerenciado. A especificação está preservada com hash | `T-R7.1`..`T-R7.4` — preencher os dois `PENDENTE:` que a própria declaração contém; datar; escopo da avaliação | `acessibilidade_pendencia` + colunas em `inst_page` |
| R8 | Sustentabilidade digital | `sustentabilidade` + 3 páginas existem; eMAG 3.1 preservado com CC BY 4.0 e atribuição; 3 especificações W3C preservadas com aviso de licença | `T-R8.1`..`T-R8.3` — número com data e metodologia; série histórica; não contar evidência de aquisição como medição | `sustentabilidade_medicao` + colunas em `inst_page` |
| R9 | LGPD e privacidade | `privacidade` + 2 páginas existem, com texto concreto (dados processados no navegador); banner de cookie com `role="dialog"`; nota de transparência sobre IA; `policy_ack` (vazia) pronta | `T-R9.1`..`T-R9.4` — vigência e prazo; inventário de dado pessoal por coluna; consentimento versionado; dado de leitura do acervo | `request_titular` + `dado_pessoal` + colunas em `schema_column` |
| R10 | Canal de contato | `nav_item` `contato` (posição 9) + `institutional-target.ts:6` + `inst_page` `sobre/fale-conosco`; links "Reportar correção" e "Corrigir"; e-mail `ciadeenfermagem@gmail.com`. **O formulário não grava em tabela nenhuma** (`onContact` só seta estado local) | `T-R10.1`..`T-R10.4` — fila de mensagem; canal específico de norma desatualizada, com `norma_id` e `pinpoint`; prazo | `contato_mensagem` + `suggestion.norma_id` |
| R11 | Cadeia de revisão com responsável | `content_text.review_state` ∈ {`revisado` (1767), `DERBY` (2158)}; `kernel_atom.admitted_by`/`admitted_at`; `migrations/0038` cria `kernel_approval`. `document_version` e `ops_record` **vazias** | `T-R11.1`..`T-R11.5` — quem revisou e quando; independência entre redator e aprovador; cadeia vinda do banco, não de array em código | `norma_cadeia` + colunas `reviewed_by`/`reviewed_at`/`review_note` |

### Estado medido que sustenta o confronto

Medido aplicando `migrations/*.sql` (38 arquivos) num PGlite em memória, como faz o portão `scripts/audit-indice-banco.mjs`, em **2026-10-26 12:50 UTC**:

- **Tabelas: 96** no banco · **96** no dicionário · **96** com label · **0 fora** (medição de **2026-10-26 13:01 UTC**). Às 12:50 UTC eram 96/94/94 com **2 fora** (`kernel_approval`, `source_publication`, de `migrations/0038_processo_source.sql`); o índice foi atualizado por essa outra tarefa no intervalo. O número é **contado pelo portão**, nunca fixado em texto — a árvore se moveu durante a medição.
- **1767** = `content_text` com `status='publicado' AND review_state='revisado'`. **2158** linhas com `review_state='DERBY'`.
- `content_object` = 1721; por `kind`: biblioteca 1388, instrumento 82, editorial 79, guia 53, pagina 43, institucional 32, **norma 24**, simulado 20.
- `content_alias` = 3942 · `content_text` = 3925 · `inst_page` = 29 · `inst_section` = 142 · `nav_item` = 74 · `fundamento` = 43 · `policy_rule` = 16 · `kernel_atom`/`kernel_claim`/`kernel_evidence` = 4 cada · `intake_batch` = 0 · `suggestion` = 0 · `ops_record` = 0 · `document_version` = 0.
- **`site_route` não existe mais**: foi retirada em `migrations/0029_retire_duplicates.sql`. O modelo de rota é `content_object` + `content_alias` + `content_text`.
- Colunas de evidência no banco inteiro: `kernel_atom.source_quote`, `.pinpoint`, `.source_quote_sha256` (as três) e mais nada. `source` existe em `data_specification`, `intake_batch`, `kernel_atom`, `locale` (booleano) e `specimen`.

**Correção de duas premissas do briefing** (medido, não opinado): (1) "só 4 com `kind='norma'`" — são **24** em `content_object`; as 4 vinham da `site_route`, tabela retirada em 0029. (2) "coluna `source_quote` INEXISTENTE" — ela **existe** em `kernel_atom` desde `migrations/0038_processo_source.sql`; o que não existe é `source_quote` em qualquer tabela do conteúdo **publicado**.


## 3.bis A camada de origem do conjunto transversal

O briefing perguntou se eu devia obter os normativos transversais que não temos. **Sim — e foi feito o que o runbook permite.** Inventário medido do catálogo de 47 entradas:

| Situação | Quantidade |
|---|---:|
| Texto integral arquivado (21 atos + 3 W3C + 1 eMAG) | **25** |
| Só metadado (18 ISO/ISO-IEC + ABNT + OPA/Rego + ISACA + IFRS) | **22** |
| Com ficha de metadado | **22** (antes: 18 — faltavam 4) |
| Com data de verificação individual da URL | **3** (antes: 0 materializado nesta árvore) |
| Com cláusula normativa verificada | **0** |
| Admitidas no Kernel | **0** |

O que foi feito, **sem um único download**:

1. **A camada de origem foi trazida** da linhagem de governança por cópia de blob do Git: 25 registros canônicos de fonte, 25 registros de evidência, 18 fichas de metadado e os 2 manifestos de materialização — em `audit-evidence/transversal-acquisition/registry/`. Antes, esta árvore tinha a evidência sem o registro que diz de onde ela veio.
2. **75 hashes conferidos** na cadeia: `input_sha256` (documento arquivado), `output_sha256` (registro de fonte) e `integrity.sha256` (`snapshot_ref`) — **25/25 em cada**, 0 divergência. Mais 18/18 `metadataHash`. **Total da tarefa: 143 hashes conferidos.**
3. **As 4 fichas de metadado faltantes foram preenchidas** a partir do catálogo já preservado (`ABNT NBR 17225:2025`, `IFRS S1 e IFRS S2`, `OPA/Rego`, `TRV-018`), cada uma com `addedBy` e `derivedFrom`. A do TRV-018 carrega `verificationStatus: PENDENTE_VERIFICACAO_INDIVIDUAL_DA_URL` — é a única do grupo sem data de verificação.
4. **As 47 entradas viraram uma tabela só** (`registry/CATALOGO-TRANSVERSAL.md` + `registry/catalogo-transversal.json`), com identificador, URL oficial, publicador, data, decisão, motivo e a lista do que não foi verificado.

O que **não** foi feito, e por quê: o texto integral das 22 de só-metadado **não se obtém** — direito controlado (o runbook manda "não copiar texto integral" de ISO/ABNT/ISACA/IFRS), `robots.txt` do ISO em 403, e as 18 ISO/IEC estão com `applicability: HOLD` / `binding: HOLD_HUMAN` / `isoClauseVerified: false`. Obter o texto sem esses três resolvidos produziria evidência sem direito e sem aplicabilidade.

## 4. O plano de captura — resumo

Detalhe completo: **`docs/normativos/plano-de-captura.md`**.

- **Nenhum download repetido.** As 25 fontes transversais, o eMAG 3.1 e as 3 especificações W3C já estão preservados com hash — fora do alcance deste plano.
- **Robots/content-signals lidos nesta rodada, com evidência primária:** [`audit-evidence/transversal-acquisition/robots/ROBOTS-20261026.md`](../../audit-evidence/transversal-acquisition/robots/ROBOTS-20261026.md) e o manifesto [`ROBOTS-MANIFEST.json`](../../audit-evidence/transversal-acquisition/robots/ROBOTS-MANIFEST.json) — **22 hosts**, bruto de cada resposta preservado com SHA-256, 1 requisição/s por host. Resultado: **9** `robots.txt` legíveis, **3** sem `robots.txt` publicado (404), **10** com leitura falhada (**pendência nomeada**). **Content-signals: 0 de 9 hosts emitem diretiva `Content-Signal:`** — o COFEN publica o bloco de comentário que define o padrão, mas não emite diretiva; pela regra (c) do próprio bloco, isso é **nem concessão nem restrição**. **`www.coren-sp.org.br` não resolve em DNS** — o portal do COREN-SP está em `portal.coren-sp.gov.br` / `www.coren-sp.gov.br`, ambos **403**; a rota oficial alternativa, `ouvidoria.cofen.gov.br/coren-sp/transparencia/…`, responde **200** e tem `robots.txt` legível.
- **Limite de taxa:** 1 requisição por segundo por host, mais lento se o host pedir. Aplicado nas verificações desta tarefa.
- **Três tipos de captura:** T1 texto integral (ato oficial, com hash do original e do texto extraído); T2 metadado apenas (referencial de direito controlado); T3 rótulo de identificação, sem cópia (host que proíbe ou cujo robots falhou).
- **Direito:** ato oficial brasileiro é público (arquivo e citação, com o hash que prova a cópia fiel); ISO/ABNT/NANDA/COBIT/ISACA/ITIL/COPSOQ/ALCOA+/IEEE/IEC/ASTM/ArchiMate/COSO são **T2/T3** — preço de catálogo "0 CHF" não é licença de redistribuição; W3C e eMAG 3.1 têm licença e já foram preservados.
- **Fontes candidatas com identificador oficial e data de verificação** — 3 conferidas na página oficial do COFEN em 26/10/2026, com ementa transcrita literalmente:

| Identificador oficial | Publicação | Ementa (literal da fonte) | URL oficial | Tipo |
|---|---|---|---|---|
| RESOLUÇÃO COFEN Nº 545/2017 | 18.05.2017 | "Anotação de Enfermagem e mudança nas siglas das categorias profissionais." | `https://www.cofen.gov.br/resolucao-cofen-no-05452017/` | T1 |
| RESOLUÇÃO COFEN Nº 564/2017 | 06.12.2017 | "Aprova o novo Código de Ética dos Profissionais de Enfermagem." | `https://www.cofen.gov.br/resolucao-cofen-no-5642017/` | T1 |
| RESOLUÇÃO COFEN Nº 736 DE 17 DE JANEIRO DE 2024 | 23.01.2024 | "Dispõe sobre a implementação do Processo de Enfermagem em todo contexto socioambiental onde ocorre o cuidado de enfermagem." | `https://www.cofen.gov.br/resolucao-cofen-no-736-de-17-de-janeiro-de-2024/` | T1 |

  Portão oficial: `https://www.cofen.gov.br/legislacao/` (verificado em 26/10/2026 — a extração da listagem deu timeout, **pendência nomeada**).
- **Rota de captura do COFEN resolvida nesta rodada:** a API REST do próprio portal, em `robots.txt`-permitido — `GET https://www.cofen.gov.br/wp-json/wp/v2/lei` responde **200** com `X-WP-Total: 2656` (2.656 atos enumerados com `date`, `slug`, `link`, `title`); `GET /wp-json/wp/v2/types` e `GET /wp-json/wp/v2/search?search=…` também **200**. **Armadilha medida:** o campo `date` da API é a data de **postagem no portal**, não a data do ato — a data vem do DOU ou do cabeçalho do PDF. E a busca é full-text: `?search=564` devolve a Resolução 723/2023, porque "564" aparece noutro lugar do conteúdo. **Buscar por número não é filtrar por número.**
- **Rotas do Senado verificadas nesta rodada:** especificação OpenAPI em `https://legis.senado.leg.br/dadosabertos/v3/api-docs` (**200**, `info.version` `4.1.3.105`, 157 caminhos); endpoints `GET /dadosabertos/legislacao/lista`, `/urn`, `/tiposNorma`, `/tiposVide`, `/tiposPublicacao`, `/classes`, `/termos` (**200**). O detalhe por URN traz `publicacoes` (DOU), **`vides`** (normas posteriores: regulamentação, alteração, revogação), **`disps`** (dispositivos com a norma que os alterou), `ementa`, `catalogo`, `indexacao` — a **única fonte verificada que entrega revogação e alteração como dado estruturado**, e ela serve à **lei federal**, não à resolução de autarquia. **Não cobre resolução do COFEN:** `legislacao/lista?tipo=RES&numero=545&ano=2017` e `…&numero=564&ano=2017` devolvem `documentos` **vazio**.
  Demais candidatos (COREN, NR-1, NR-7, NR-12, Portaria GM/MS 6.734/2025, NANDA-I, NIC, NOC, ABNT NBR 5891, ISO/IEC 11179) entram **só com identificador e data de verificação**, com `[VERIFICAR: ...]` onde a fonte não foi vista. **Nenhuma vigência, escopo ou artigo é afirmado.**

## 5. Lista de NOT_RUN

| # | O que não foi executado | Por quê | Quem resolve |
|---|---|---|---|
| N1 | `docs/governance/**` e `contracts/cko-schemas/**` | Não existem nesta árvore (linhagem de governança é outra). O portão aplicável aqui é `scripts/audit-indice-banco.mjs`; o gate do Kernel é `NOT_RUN` | Verificação final, sobre a linhagem que os contém |
| N2 | Captura de qualquer norma de enfermagem | Não é a tarefa desta rodada. O plano existe; a execução é da tarefa de captura | Tarefa de captura |
| N3 | Atomização normativa | Fora do meu escopo (`scripts/capturar-normas.mjs`, `migrations/0040_atomos.sql`, `docs/normativos/atomizacao.md` são de outro worker) | Tarefa de atomização |
| N4 | Vigência, revogação, escopo e artigos das resoluções F1/F2/F3 | Não conferi o DOU. A página do COFEN diz 18.05.2017 para a 545/2017; um parecer oficial do COFEN diz 09 de maio de 2017 — divergência não resolvida | Tarefa de captura, contra o DOU |
| N5 | Extração da listagem `https://www.cofen.gov.br/legislacao/` **por HTML** | `timeout` e depois "file load failed". **Resolvida por rota alternativa** nesta rodada: a API REST do portal (`/wp-json/wp/v2/lei`) devolve 2.656 atos enumerados. Resta casar `slug` com identificador oficial | Tarefa de captura |
| N6 | `portal.coren-sp.gov.br` / `www.coren-sp.gov.br` (robots, rotas, legislação) | 403 em robots e nas páginas. **`www.coren-sp.org.br` não resolve em DNS** — o domínio do plano anterior não existe | Tarefa de captura, pela rota `ouvidoria.cofen.gov.br/coren-sp/transparencia/…` |
| N7 | NANDA-I / NIC / NOC: edição vigente e identificador oficial | Robots 403 (NANDA) e direito controlado. **NIC:** `nic.nip.org` não resolve e `www.nip.org` redireciona para a US Naval Institute Press — o titular é o *Center for Nursing Classification and Clinical Effectiveness* (University of Iowa), editor Elsevier | Tarefa de captura |
| N8 | Números de tabelas no banco **vivo** (Neon) | Medi o PGlite local (96 em 26/10 12:50 UTC). O dono reportou 98 em 26/10 — não reproduzido aqui | Dono, com `DATABASE_URL` |
| N9 | `migrations/0037_preencher_derby.sql` e `migrations/0038_processo_source.sql` | Entraram na árvore durante a medição e são de outras tarefas; a contagem de tabelas que registrei as inclui | Tarefas donas |
| N10 | Auditoria real de acessibilidade (WCAG) | Só li o que o site **declara** e o que o código mostra; não rodei auditoria nem leitor de tela | Tarefa de acessibilidade |
| N11 | Base legal e prazo de retenção por coluna (LGPD) | O dado não existe no banco; inferir seria inventar | Tarefa de LGPD / privacidade |
| N12 | Fila real de mensagens de contato | `onContact` não grava; não criei a tabela porque é migration de outra tarefa | Tarefa de conteúdo / backend |
| N13 | `npm test` e `npm run build` | Proibido nesta rodada (o dono roda no fim; ~4,5 min) | Dono |
| N14 | `robots.txt` do `www.isaca.org` | Não lido nesta rodada; a entrada TRV-018 (COBIT 2019) segue sem data de verificação individual da URL | Tarefa de captura |
| N15 | Edição vigente das 19 referências com só data de catálogo (18 ISO/ISACA + TRV-018) | O `notVerified` de cada ficha já declara "standard current edition" e "publisher source bytes"; o ISO responde 403 em robots | Tarefa de captura, por via que não viole robots |
| N16 | Registro canônico de origem (`registers/governance/transversal-source-instances/public/source/`) | Continua só na linhagem de governança; a cópia em `registry/` é evidência, não registro canônico | Verificação final, ao juntar as duas linhagens |
| N17 | `robots.txt` de **10 hosts** (DNS: `*.coren-sp.org.br`, `coren.org.br`, `nic.nip.org`; 403: `portal.coren-sp.gov.br`, `www.coren-sp.gov.br`, `nanda.org`, `www.iso.org`, `bvsalud.org`, `legis.senado.leg.br`) | Leitura falhou. Em nenhum deles se pode afirmar diretiva; captura por esses hosts fica condicionada a uma leitura bem-sucedida | Tarefa de captura, no dia |
| N18 | `robots.txt` de `legis.senado.leg.br` em particular, embora a API responda 200 | 403 no caminho do robots. A API fica como **metadado e citação**, com a leitura refeita no dia da captura | Tarefa de captura |
| N19 | Casamento entre `slug` da API do COFEN e identificador oficial do ato | A listagem existe; o identificador oficial, o tipo e a data **por ato** ainda não foram casados | Tarefa de captura |
| N20 | Data de assinatura, de publicação e de entrada em vigor por ato do COFEN | O `date` da API REST do COFEN é a **data de postagem no portal**, não a data do ato | Tarefa de captura, contra o DOU |

## 6. O que esta entrega **não** fez, deliberadamente

- Não baixou nenhuma fonte. Não repetiu nenhum download.
- Não escreveu migration. Não tocou `0035`, `0036`, `0037`, `0038`, `0039`, `0040`.
- Não escreveu átomo, claim ou evidence.
- Não editou `docs/entregas/FORMATO-DE-ENTREGA.md` nem `docs/entregas/REGISTRO-DE-ESCRITA.md`.
- Não fez `checkout`, `branch`, `commit`, `push`, `stash` nem `reset`.
- Não inventou número de resolução, artigo, data, escopo ou classificação.

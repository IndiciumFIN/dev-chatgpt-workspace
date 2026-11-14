# Conferência de hash — aquisição transversal

**Data:** 2026-10-26 (UTC) · **Árvore:** `/workspace/workspace-repo` · **HEAD:** `51dfc7b` · **Linhagem de origem:** `origin/preview/central-comando-20261026`

## Resultado

| Métrica | Valor |
|---|---|
| Arquivos **preservados da linhagem de origem** em `audit-evidence/transversal-acquisition/` | **79** |
| Arquivos **adicionados por esta tarefa** (conferência, camada de origem, leitura de robots) | **102** — 24 em `robots/` (22 brutos de `robots.txt` + manifesto + este registro), 77 em `registry/` e 1 nesta página |
| Arquivos na árvore, no total | **181** |
| Entradas no `SNAPSHOT-MANIFEST.json` | 50 |
| Entradas do manifesto com SHA-256 **e** tamanho conferidos | **50 / 50** |
| Entradas do manifesto que **divergem** | **0** |
| Entradas do manifesto **ausentes** | **0** |
| Arquivos fora do manifesto (índice por artigo, readback, eMAG estendido, README, o próprio manifesto) | 29 |
| Blobs **idênticos** à linhagem de governança (`git hash-object`) | **79 / 79** |
| Blobs divergentes | **0** |
| Arquivos órfãos (só em uma das duas linhagens) | **0** em qualquer lado |
| Fontes indexadas | 21 (`sourceCanonicalId` `transversal-public.*.source`) |
| Fatias de artigo no índice | **1577**, todas com `reviewed: false` |
| `kernelAdmission` / `extractionReviewed` / `approvalOrRelease` | `false` / `false` / `false` |

**Nenhum download foi repetido.** O runbook (`docs/governance/TRANSVERSAL-ACQUISITION-RUNBOOK.md`) proíbe repetir download de fonte já preservada com hash idêntico sem motivo documentado. Esta tarefa apenas **conferiu**.

## Como a conferência foi feita

1. Para cada entrada de `snapshots/20261024/SNAPSHOT-MANIFEST.json` (50): ler o arquivo em `audit-evidence/transversal-acquisition/snapshots/20261024/<relativePath>`, recalcular SHA-256 e comparar com `sha256` e com `sizeBytes`.
2. Para cada um dos 79 arquivos da árvore: calcular o blob com `git hash-object` e comparar com o blob da mesma ruta em `origin/preview/central-comando-20261026` (`git ls-tree -r`).
3. Os 29 arquivos fora do manifesto não têm hash de referência: a conferência deles é a comparação de blob acima.

## Segunda camada — conferência por hash de conteúdo, não só por blob

A conferência de blob prova que os bytes são os da outra linhagem. Ela **não** prova que o conteúdo bate com o que cada manifesto afirma. Por isso foi rodada uma **segunda conferência, por SHA-256 de conteúdo**, sobre **96 pontos de referência** que existem dentro da própria árvore, mais as **1.577 fatias de artigo**:

| Camada | Referência | Conferências | Divergências | Ausentes |
|---|---|---:|---:|---:|
| A — `SNAPSHOT-MANIFEST.json` | `files[].sha256` **e** `files[].sizeBytes` | **50** | **0** | **0** |
| A — o manifesto contra si mesmo | `sourceManifestSha256` contra `manifest.json` | **1** | **0** | **0** |
| B — eMAG | `evidence.json → artifacts[*].sha256` **e** `sizeBytes` | **3** | **0** | **0** |
| C — índice por artigo | `extractedTextSha256` e `originalSha256` de cada uma das 21 fontes | **42** | **0** | **0** |
| **Total de conferências de hash** | | **96** | **0** | **0** |
| C — fatias de artigo | `articles[].sliceSha256` contra os bytes `[startByte, endByte)` do texto extraído | **1.577** | **0** | **0** |

**Método da camada C.** Para cada uma das 1.577 entradas de `articles[]`, o SHA-256 foi recalculado sobre o intervalo de bytes `[startByte, endByte)` — **extremo final exclusivo** — do arquivo `extracted.txt` da fonte. As **1.577** conferiram. O modo exclusivo é o único que produz o hash esperado; o inclusivo (`endByte + 1`) não reproduz nenhum deles.

**Cobertura.** As 96 conferências cobrem 78 dos 79 arquivos da árvore. O arquivo restante é `snapshots/20261024-extended/emag/evidence.json` — que é **ele próprio um manifesto**, o registro dos três artefatos do eMAG. A cobertura dele é a própria conferência de que os 3 artefatos que ele declara batem.

**Nenhum arquivo foi corrigido em silêncio.** A regra desta conferência é: arquivo que não confere é **FAIL registrado**, com hash esperado e hash obtido, e **não** é reescrito. Não houve nenhum FAIL.

## Camada de origem — 25 registros de fonte + 22 fichas de metadado

A evidência bruta estava na árvore; a camada que diz **de onde** veio cada arquivo (registro canônico de fonte + registro de evidência) estava só na linhagem de governança. Ela foi trazida **por cópia de blob do Git — sem download** para `audit-evidence/transversal-acquisition/registry/`, e os elos foram conferidos contra os arquivos desta árvore. Ver `registry/README.md` para a proveniência e o aviso de que a cópia é evidência, não registro canônico.

### Cadeia de origem — 25 fontes: arquivo → hash → registro de fonte

Três elos conferidos para cada uma das 25 fontes preservadas, todos contra os arquivos **desta** árvore:

| `sourceCanonicalId` | Autoridade | Direitos | Arquivo preservado | `input_sha256` bate | `output_sha256` bate | `integrity.sha256` bate |
|---|---|---|---|---|---|---|
| `transversal-public.decreto-7-962-2013.source` | Presidência da República | UNKNOWN | `snapshots/20261024/public-acts/decreto-7-962-2013/original.html` | OK | OK | OK |
| `transversal-public.decreto-8-771-2016.source` | Presidência da República | UNKNOWN | `snapshots/20261024/public-acts/decreto-8-771-2016/original.html` | OK | OK | OK |
| `transversal-public.emag.source` | Governo Federal | LICENSED | `snapshots/20261024-extended/emag/original.html` | OK | OK | OK |
| `transversal-public.lei-10-098-2000.source` | Presidência da República | UNKNOWN | `snapshots/20261024/public-acts/lei-10-098-2000/original.html` | OK | OK | OK |
| `transversal-public.lei-10-436-2002.source` | Presidência da República | UNKNOWN | `snapshots/20261024/public-acts/lei-10-436-2002/original.html` | OK | OK | OK |
| `transversal-public.lei-12-187-2009.source` | Presidência da República | UNKNOWN | `snapshots/20261024/public-acts/lei-12-187-2009/original.html` | OK | OK | OK |
| `transversal-public.lei-12-305-2010.source` | Presidência da República | UNKNOWN | `snapshots/20261024/public-acts/lei-12-305-2010/original.html` | OK | OK | OK |
| `transversal-public.lei-12-965-2014.source` | Presidência da República | UNKNOWN | `snapshots/20261024/public-acts/lei-12-965-2014/original.html` | OK | OK | OK |
| `transversal-public.lei-13-146-2015.source` | Presidência da República | UNKNOWN | `snapshots/20261024/public-acts/lei-13-146-2015/original.html` | OK | OK | OK |
| `transversal-public.lei-13-709-2018.source` | Presidência da República | UNKNOWN | `snapshots/20261024/public-acts/lei-13-709-2018/original.html` | OK | OK | OK |
| `transversal-public.lei-13-787-2018.source` | Presidência da República | UNKNOWN | `snapshots/20261024/public-acts/lei-13-787-2018/original.html` | OK | OK | OK |
| `transversal-public.lei-14-874-2024.source` | Presidência da República | UNKNOWN | `snapshots/20261024/public-acts/lei-14-874-2024/original.html` | OK | OK | OK |
| `transversal-public.lei-15-042-2024.source` | Presidência da República | UNKNOWN | `snapshots/20261024/public-acts/lei-15-042-2024/original.html` | OK | OK | OK |
| `transversal-public.lei-15-211-2025.source` | Presidência da República | UNKNOWN | `snapshots/20261024/public-acts/lei-15-211-2025/original.html` | OK | OK | OK |
| `transversal-public.lei-8-069-1990.source` | Presidência da República | UNKNOWN | `snapshots/20261024/public-acts/lei-8-069-1990/original.html` | OK | OK | OK |
| `transversal-public.lei-8-078-1990.source` | Presidência da República | UNKNOWN | `snapshots/20261024/public-acts/lei-8-078-1990/original.html` | OK | OK | OK |
| `transversal-public.lei-9-279-1996.source` | Presidência da República | UNKNOWN | `snapshots/20261024/public-acts/lei-9-279-1996/original.html` | OK | OK | OK |
| `transversal-public.lei-9-609-1998.source` | Presidência da República | UNKNOWN | `snapshots/20261024/public-acts/lei-9-609-1998/original.html` | OK | OK | OK |
| `transversal-public.lei-9-610-1998.source` | Presidência da República | UNKNOWN | `snapshots/20261024/public-acts/lei-9-610-1998/original.html` | OK | OK | OK |
| `transversal-public.resolu-o-anpd-15-2024.source` | Autoridade Nacional de Proteção de Dados | UNKNOWN | `snapshots/20261024/public-acts/resolucao-anpd-15-2024/original.html` | OK | OK | OK |
| `transversal-public.resolu-o-anpd-18-2024.source` | Autoridade Nacional de Proteção de Dados | UNKNOWN | `snapshots/20261024/public-acts/resolucao-anpd-18-2024/original.html` | OK | OK | OK |
| `transversal-public.resolu-o-anpd-19-2024.source` | Autoridade Nacional de Proteção de Dados | UNKNOWN | `snapshots/20261024/public-acts/resolucao-anpd-19-2024/original.html` | OK | OK | OK |
| `transversal-public.trv-010.source` | W3C | LICENSED | `snapshots/20261024/public-standards-w3c/trv-010/original.html` | OK | OK | OK |
| `transversal-public.w3c-shacl.source` | World Wide Web Consortium | LICENSED | `snapshots/20261024/public-standards-w3c/w3c-shacl/original.html` | OK | OK | OK |
| `transversal-public.wcag-2-2.source` | World Wide Web Consortium | LICENSED | `snapshots/20261024/public-standards-w3c/wcag-2-2/original.html` | OK | OK | OK |

| Métrica | Valor |
|---|---|
| `input_sha256` (hash do documento arquivado) confere | **25 / 25** |
| `output_sha256` (hash do registro de fonte) confere | **25 / 25** |
| `integrity.sha256` (`snapshot_ref`) confere | **25 / 25** |
| Divergências | **0** |

### Candidatos ISO/IEC — 18 fichas de metadado

| Identificador | Aplicabilidade | Vínculo | `metadataHash` | Cláusula ISO verificada |
|---|---|---|---|---|
| TRV-001 | HOLD | HOLD_HUMAN | OK | não |
| TRV-002 | HOLD | HOLD_HUMAN | OK | não |
| TRV-003 | HOLD | HOLD_HUMAN | OK | não |
| TRV-004 | HOLD | HOLD_HUMAN | OK | não |
| TRV-005 | HOLD | HOLD_HUMAN | OK | não |
| TRV-006 | HOLD | HOLD_HUMAN | OK | não |
| TRV-007 | HOLD | HOLD_HUMAN | OK | não |
| TRV-008 | HOLD | HOLD_HUMAN | OK | não |
| TRV-009 | HOLD | HOLD_HUMAN | OK | não |
| TRV-011 | HOLD | HOLD_HUMAN | OK | não |
| TRV-012 | HOLD | HOLD_HUMAN | OK | não |
| TRV-013 | HOLD | HOLD_HUMAN | OK | não |
| TRV-014 | HOLD | HOLD_HUMAN | OK | não |
| TRV-015 | HOLD | HOLD_HUMAN | OK | não |
| TRV-016 | HOLD | HOLD_HUMAN | OK | não |
| TRV-017 | HOLD | HOLD_HUMAN | OK | não |
| ISO/IEC 40500:2025 | HOLD | HOLD_HUMAN | OK | não |
| ISO 14001:2026 | HOLD | HOLD_HUMAN | OK | não |

| Métrica | Valor |
|---|---|
| `metadataHash` confere contra `materialization-manifest.json` | **18 / 18** |
| Divergências | **0** |
| `applicability` | `HOLD` nas 18 |
| `binding` | `HOLD_HUMAN` nas 18 |
| `isoClauseVerified` | `false` nas 18 |


**Total de hashes conferidos nesta tarefa: 50 (manifesto) + 75 (cadeia de origem) + 18 (fichas de metadado) = 143.** Divergências: **0**.

## Divergências

**Nenhuma.** Um arquivo que não conferisse seria FAIL registrado nesta página, com o hash esperado e o obtido. Não houve.

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

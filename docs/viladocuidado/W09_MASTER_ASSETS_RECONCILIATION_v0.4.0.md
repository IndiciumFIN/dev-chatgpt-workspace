# Vila do Cuidado — W09 Reconciliação integral de imagens
Situação: HASH_RECONCILED_LOCAL / BINARY_GITHUB_UPLOAD_PENDING

## Achados verificados no pacote mestre
- ZIP íntegro (CRC PASS), 854 arquivos regulares, 332 entradas de imagem.
- 254 hashes SHA-256 de imagem distintos; 78 entradas são cópias byte-a-byte.
- O pacote incremental W04 contém oito PNGs; **8/8 conferem por SHA-256 com o consolidado original**.
- O manifesto integral, com os 254 hashes e caminhos originais, foi produzido como `VILA_ASSET_MANIFEST_FULL_v0.4.0.json` no artefato local.
- O ZIP W04 `VILA-W04-pronto-para-incorporar-v0.3.0.zip` contém os oito PNGs com caminho de destino `public/vila`. Manter o ZIP original e não importar imagens repetidas.

## Decisão de arquitetura
Reutilizar `ce_platform.media_assets` e `canonical_objects` no Supabase; ligar assets a conteúdo por IDs canônicos e bindings após checagem de origem/direitos.
A fonte oficial de bytes continua sendo o consolidado preservado, não URLs externos nem ilustrações geradas por IA.

## Itens não concluídos
1. Os binários não foram publicados no GitHub nesta operação: o conector usado nesta etapa não transferiu bytes da sessão local.
2. Não foram gravados no Supabase Storage nem cadastrados registros em `ce_platform.media_assets`.
3. A verificação cobre todos os arquivos de imagem por SHA; **não** assegura que as 254 peças têm licença, qualidade e destino aprovados.
4. Os demais tipos de arquivo do pacote (854 no total) necessitam classificação, dedup e crosswalk próprios.
5. A branch `viladocuidado` precisa reconciliar alterações da `main` preservando a linha histórica.

## Segurança
Não usar a migration `0002_vila_canonical_full_candidate.sql` indiscriminadamente: existem componentes equivalentes em `ce_platform`. Kernel WO continua HOLD para aplicação de mudanças de schema.
# W10 — Publicação de metadados candidatos no Supabase
Estado: METADATA_COMMITTED_AND_READBACK / STORAGE_BINARY_NOT_UPLOADED / HOLD_HUMAN
Projeto: Calculadoras-Smart (`pgsybzggewhinaniybiy`).

## Leitura pós-escrita
- `ce_platform.canonical_objects`: 8 objetos com IDs `vila.asset.*`.
- `ce_platform.media_assets`: 8 objetos ligados ao registro canônico.
- Hashes SHA-256 distintos: 8.
- Estado de publicação `HOLD_HUMAN`: 8.
- `storage_ref IS NULL`: 8; nenhum PNG foi enviado ao Storage pelo conector.
- Os títulos e hashes provêm de `contracts/vila/vila-asset-import.v0.2.0.json`; origem 2026-08-26.
- Cadastro com condições anti-duplicação por ID; nenhum novo schema/tabela foi criado.

## Falhas e recuperação
A operação inicial gravou o cadastro canônico, mas não gravou as mídias: o INSERT da segunda tabela consultava dados inseridos na mesma instrução e não conseguiu enxergá-los no snapshot do SELECT. Executado INSERT separado e readback 8/8 em ambas as tabelas.

## Bloqueios remanescentes
1. Upload real dos 8 PNGs e dos 246 demais binários únicos (após direitos/qualificação) ao Supabase Storage; conector disponibilizado não tem comando de upload de bytes.
2. Evitar duplicatas por SHA entre assets existentes e novos, não somente por IDs.
3. Vincular os registros aos slots visuais reais, sem substituir o asset histórico.
4. Completar auditoria de direitos, acessibilidade e conteúdo das 254 imagens.
5. Resolver Work Order/Kernel para promoção/publicação; todos os objetos criados em HOLD.
6. Classificar os demais arquivos do consolidado (ZIP de 854 entradas), antes de declarar completude.
7. A migration candidata de 22 tabelas permanece não aplicada, por sobreposição com `ce_platform`.

Não declarar o site atualizado nem os binários acessíveis.

# W04 — Importação determinística dos 8 assets originais

Fonte: Drive, pacote mestre 2026-08-26, SHA-256 `98291b0432233002000f5d2be7a18a60e6ae950da26454be56cc008608556d6d`.

## Execução isolada
1. Coloque W01, W02 e W03 descompactados **não**: mantenha os três arquivos .zip no mesmo diretório `/caminho/pacotes`.
2. Execute `python3 scripts/vila-import-assets.py --packages /caminho/pacotes` para validar todas as entradas sem escrever.
3. Execute `python3 scripts/vila-import-assets.py --packages /caminho/pacotes --apply` para gravar apenas os 8 arquivos `public/vila/`.
4. Reexecute sem `--apply` e compare hashes; rode `npm run typecheck && npm test && npm run build:spa`.
5. Revise o diff, crie commit apenas na branch `viladocuidado` e capture screenshots mobile/desktop.

**Fail-closed:** arquivos ausentes, ZIP corrompido, hash divergente, nome fora de `public/vila` ou arquivo destino com outros bytes interrompem a importação. O script não apaga arquivos e não acessa produção.

## Evidência observada nesta execução
- 3 pacotes locais: ZIP CRC `PASS`.
- 8 arquivos: SHA-256 e tamanho físico `PASS` (3.278.554 bytes totais).
- **GitHub binários:** `NOT_COMMITTED`; ferramenta de transferência binária direta indisponível neste fluxo.
- **Aplicação publicada, typecheck e runtime:** `NOT_RUN`.

**Nota:** as referências `/vila/*` já estão na UI; o fallback impede imagem quebrada até a importação ocorrer. Nenhuma publicação é autorizada.

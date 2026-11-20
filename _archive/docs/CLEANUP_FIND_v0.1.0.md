# FIND — limpeza controlada do diretório

**Data:** 2026-10-19. **Base:** backup público parcialmente homologado. **Status:** FIND aberto; sem admissão de exclusão no Kernel.

## Procedimento executado

`node scripts/clean-directory.mjs` executado em modo `DRY_RUN_ONLY`. Foram encontrados três candidatos: dois arquivos SQL de conteúdo idêntico, um SVG sem referência literal e um marcador de ambiente vazio.

## Bloqueios

- A duplicação SQL pode atender a dois mecanismos de migração; validar os dois caminhos e seus consumers.
- SVG pode ser referenciado dinamicamente, inclusive por dados editoriais não incluídos no ZIP.
- Marcador `.node_modules.lock` pode ter função de ambiente de build; verificar em ambiente isolado.
- Falta política de exclusão aplicável homologada nesta base, validador de dependências, WO com escopo exato e admissão verificável no Kernel.

## Critério de remoção

Provar ausência de consumidor, sucesso de build/testes e renderização no ambiente isolado; criar manifesto de retenção remota com hash e readback, política+validador+WO; obter admissão do Kernel; remover somente arquivos exatos admitidos; repetir todos os testes e preservar histórico.

## Resultado

Nenhuma exclusão. `audit/cleanup/candidates-v0.1.0.json` contém evidências da triagem. Não usar a existência de candidato como prova de obsolescência.

# Base pública isolada — v1.6.0

## Correção
- FIND: catálogo recém-inicializado trazia `published=true` sem evento de aprovação.
- Correção: `initialWorkbench()` cria ferramentas com `published=false`; projeções públicas e de assinante só exibem após salvar rascunho e publicar explicitamente.
- Teste de comportamento com sequência: estado inicial não publicado → salvar rascunho → confirmar sem publicação → salvar rascunho aprovado → publicar → conferir estado publicado.

## Gates executados
- `npm run audit:publication`: PASS (estrutural e runtime)
- `npm run audit:isolation`: 7/7 PASS
- `npm run audit:context`: 7/7 PASS
- `npm run audit:surfaces:v2`: 23/23 contratos, sem FIND estático, 0 homologações visuais
- `npm ci --offline --ignore-scripts --no-audit --no-fund`: FAIL ENOTCACHED (`ajv`); build e typecheck não executados.

## Ressalvas
- NÃO houve screenshots ou execução browser.
- `localStorage` não constitui log inviolável nem transação atômica entre abas.
- Instalações que já armazenaram `v2` mantêm seu estado existente; esta alteração protege inicializações sem publicação prévia.
- A alteração não executa remoção de arquivos, integração remota nem crosswalk externo.

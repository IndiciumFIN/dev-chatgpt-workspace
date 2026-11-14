# Backup público — execução v1.7.0 (ambiente e renderização)

## Escopo
Somente a árvore v1.6.0 recebida nesta conversa. Nenhum GitHub, Supabase, Kernel ou repositório externo consultado. Banco remoto continua proibido.

## FIND-ENV-001
O npm não consegue alcançar registry.npmjs.org: `EAI_AGAIN`, reproduzido com `npm ping --fetch-retries=0 --fetch-timeout=10000`. A tentativa offline anterior falhou com `ENOTCACHED` (ajv). O cache npm não substitui a instalação reproduzível. `node_modules` não existe. A causa do erro atual é de resolução DNS do ambiente, não um defeito comprovado do código. Não remover lockfile nem usar `--force` ou `--legacy-peer-deps` como solução presumida.

## Mudança
- `scripts/check-render-readiness.mjs`: pré-flight não destrutivo, lockfile, dependências, módulos e DNS opcional, relatório JSON, exit code falha fechada.
- `package.json`: comando `npm run audit:render:readiness`.
- `audit/execution/render-readiness-latest.json`: evidência atual, sem quaisquer credenciais.
- Atualização de registros e manifesto de arquivo.

## Evidências desta rodada
- `node scripts/check-isolation.mjs`: PASS 7/7.
- `node scripts/check-context-invariants.mjs`: PASS 7/7.
- `node scripts/check-local-publication.mjs`: PASS 9/9.
- `node --experimental-strip-types scripts/test-local-publication.mjs`: PASS.
- `node scripts/audit-surface-bindings-v2.mjs`: 23 contratos explícitos, 0 findings estáticos, 0 homologações visuais.
- `node scripts/check-render-readiness.mjs --network --write-report`: EXIT 1 esperado. 9 verificações, 5 PASS e 4 FAIL (node_modules, vite, typescript, react e DNS: **5 falhas**; 4 PASS). 
- Compilação, renderização e capturas reais: NÃO EXECUTADAS, não certificadas.

## Próxima execução quando npm registry estiver acessível
1. `npm ping --fetch-retries=0`; 2. `npm ci --ignore-scripts` (avaliar postinstall necessários antes de retirar `--ignore-scripts`); 3. `npm run audit:render:readiness`; 4. `npm run typecheck`; 5. `npm run build`; 6. `npm run dev` somente em loopback; 7. capturar /admin, /assinante e páginas públicas com Chromium/Playwright e fazer comparação visual comprovada.

O pré-flight não concede autorização de integração remota. Falha de DNS ou instalação é bloqueante apenas para compilação/renderização, não justifica afirmar que a aplicação está incorreta ou correta.

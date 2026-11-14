> NOTA HISTORICA (2026-10-23): este relatorio foi produzido antes da criacao do novo workspace exclusivo. Para destino Git atual e remediacao de `FIND-CKO-PACKAGING-001`, leia `docs/WORKSPACE-HANDOFF-2026-10-23.md`.

# Auditoria de release — bibliotecas — 2026-10-23

## Escopo e identidade

- Fonte: `REPOSITORIO-branch-bibliotecas.zip`, confrontada com `branch-bibliotecas-1-FUNCIONAL.zip` e `branch-bibliotecas-2-VERSIONADO.zip`.
- Histórico preservado: `1ede48c`, `308129a`, `82ece93`.
- Trabalho adicional somente na branch local preexistente `dev/bibliotecas`; a `main` local foi preservada.
- Repositório remoto acessível: `IndiciumFIN/ce-bibliotecas-dev` (privado), `main` remota em `fa70e9e5395f7344349555274795dc39fec8072a`; **não é a mesma árvore da baseline local**.
- Não existe remote `origin` no ZIP fornecido. Nenhum push, branch remoto, merge ou deploy foi efetuado.

## Evidências e limitações

| Controle | Resultado |
|---|---|
| Árvore Git ZIP e três commits anteriores | PASS na extração |
| Check-generated-fresh | PASS; 7 artefatos derivados |
| Check-cko-packages | PASS; 30 verificações diretas + 625 entradas no manifesto |
| Check-contract-coverage | PASS; 183 entidades, 10 contratos |
| Negativo: catálogo TS inválido deve bloquear coverage | PASS; exit 1, sem regex fallback |
| Negativo: catálogo TS inválido deve bloquear freshness | PASS; exit 1 |
| 12 gates independentes | 12 PASS, mas três verificações ambientais BLOCKED (vite, tsc do projeto, playwright) |
| `npm ci` | NÃO CONCLUÍDO: limite de execução/rede do ambiente; tentativa offline insuficiente |
| 200 testes Node/TS | NÃO REPRODUZIDOS neste ambiente |
| `tsc --noEmit` | BLOQUEADO pela ausência de node_modules/types; não é evidência de erro no código |
| `npm run build:spa` | NÃO REPRODUZIDO; o ZIP declara 52 HTML, sem verificação de build novo |
| Verificação JSON | 612 JSONs válidos, 1 arquivo de evidência SEO vazio (`audit-evidence/.../live-probe.json`) e `tsconfig.json` com comentários JSONC (esperado para TypeScript) |
| Navegação, acessibilidade e comparação visual | NÃO HOMOLOGADAS; sem build executável e captura E2E |

## Achados classificados

### P0 — publicação remota não autorizada por contrato de branch

A `main` remota contém uma estrutura reduzida, não a árvore da baseline ZIP. Publicar nela sobrescreveria um estado divergente, quebrando o requisito de preservar `main` e não criar novas branches remotas. O `dev/bibliotecas` local não é branch remota conhecida. **HOLD** até definir o destino Git remoto e sua política de mudança.

### P0 — acesso Vercel insuficiente para deploy/diagnóstico por escopo

Os projetos `ce-bibliotecas-dev` e `ce-bibliotecas-dev-private` existem no escopo `team_DYBNuYQyhhw6GKeDZhNwW7fP`; ambos indicam deploy em `ERROR`, falha `BUILD_UTILS_SPAWN_1`, `npm run build` exit 1, originado da `main` remota `fa70e9e`. A leitura detalhada de logs/alteração por escopo retorna 403; o vínculo Vercel precisa de autorização ao escopo. Não se pode afirmar a causa raiz do build somente pelo erro de saída.

Ambos estão configurados com SSO em `all_except_custom_domains`: avaliar proteção de todos os domínios conforme requisito privado. Nenhum deploy foi realizado.

### P1 — build Vercel incompatível com o artefato estático alegado

O `vercel.json` original executa `npm run build` (Nitro/SSR), enquanto a materialização das 52 rotas estáticas existe em `npm run build:spa`. Foi corrigido no candidato local para `npm run build:spa`. **A correção depende de build remoto/local comprovado antes de ser promovida.**

### P1 — regra de autenticação sem default seguro no ZIP

O helper `mergeAppEnv` original, quando `.grok/app-env.json` não existia e `VITE_AUTH_ENABLED` não vinha do ambiente, não fixava `false`. O cliente interpreta valor ausente como autenticação ativada. Foi definido default `false` no wrapper local, sem impedir futuros overrides explícitos. A variável de runtime na Vercel permanece independente: precisa ser fixada/verificada no projeto, sem enviar credenciais.

### P1 — extração runtime degradava para regex antigo

Os scripts de geração e coverage ainda tinham fallback para regex se a importação runtime falhasse, o que poderia mascarar entidade ausente. Também usavam dump fixo em `/tmp`, com risco de leitura residual ou concorrente. Introduzido `scripts/load-tool-contracts.mjs`: dump temporário único, schema mínimo, slugs únicos, limpeza `finally` e erro **HOLD** sem fallback. Os dois gates passaram no caso normal e falharam com catálogo inválido.

### P1 — páginas estáticas não equivalem a HTML SEO individualizado

`materialize-static-routes.mjs` copia o mesmo `_shell.html` para cada caminho. Isso habilita URLs estáticas, mas **não prova** título, metadados, corpo/JSON-LD específicos em HTML pré-renderizado para cada URL. Exige teste de SEO de resposta inicial e avaliação de prerender real; não confundir 52 arquivos HTML com 52 páginas SSR/SSG distintas.

### P2 — pendências declaradas na própria baseline

`docs/PENDENCIAS.md` reporta 54 pendências, incluindo cinco desvios de template, oito templates sem página, doze UTC abertos e 41 schemas CKO ausentes. O `md_gate` permanece CLOSED. Aldrete continua candidata com sete HOLDs. Nenhuma promoção clínica foi autorizada por esta auditoria.

## Controles adicionados ao candidato

- `scripts/load-tool-contracts.mjs`: extração determinística, isolada, fail-closed.
- `scripts/generate-entity-contracts.mjs` e `scripts/check-contract-coverage.mjs`: leitura do mesmo mecanismo runtime, sem regex-fallback.
- `scripts/with-app-env.mjs`: auth OFF na falta da flag no fluxo npm local.
- `vercel.json`: comando de build SPA para as rotas materializadas.
- `package.json`: o `build:spa` agora exige frescor, CKO, TypeScript, testes e gates antes de gerar o output; sem gates verdes não há build de deploy.
- `.github/workflows/verify-bibliotecas.yml`: verificação somente-leitura para PR direcionado à `main` e push à branch `dev/bibliotecas` quando existente no remoto; **não cria branch, não faz push nem deploy**.

## Para homologar a publicação

1. Definir repositório e branch remotos permitidos, sem substituir a `main` divergente ou criar branch sem autorização.
2. Instalar dependências com `npm ci`; reproduzir 200 testes, typecheck, 12 gates, `npm run build:spa` e E2E/SEO/a11y.
3. Rever discrepâncias clínicas e de template; manter `md_gate` fechado e conteúdo candidato fora da liberação.
4. Obter acesso ao escopo Vercel, verificar configuração privada, variável `VITE_AUTH_ENABLED=false`, ausência de conexão a DB real, comando de build, proteção do domínio, logs.
5. Publicar somente como preview protegido, verificar URL e então decidir promoção formal.

**Resultado:** candidato corrigido e auditável, **NÃO HOMOLOGADO para publicação**. Publicação remota deliberadamente não realizada.

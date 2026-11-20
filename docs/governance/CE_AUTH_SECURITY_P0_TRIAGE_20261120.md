# CE — triagem de segurança P0 da PR #72 (20/11/2026)

**Origem:** [PR #72](https://github.com/IndiciumFIN/dev-chatgpt-workspace/pull/72), head fixado em `a4e74c30b210b6fb2dfc9cba285118690455bc73`.  
**Base de reconciliação:** `IndiciumFIN/dev-chatgpt-workspace@e63fab97642f07be4ee770b4de6be0ece4f36e0b`.  
**Situação:** CORREÇÃO DE CÓDIGO INTEGRADA EM LOTE ESPECÍFICO, COM GATES PENDENTES; a branch #72 **NÃO** está `SEALED` por esta alteração.

## Falha encontrada

A `main` continha um literal usado como segredo do cliente de pré-visualização OAuth em `src/lib/auth/preview.ts`. O valor **não é reproduzido neste relatório**. Remover o literal da árvore atual é necessário, mas insuficiente: **a credencial já foi publicada na história Git**. Sua revogação/rotação deve ser feita na infraestrutura do emissor e confirmada por evidência independente. Não reescrever o histórico nem apagar PRs/branches sem avaliação de dependências, impacto e autorização.

O projeto também permitia habilitação implícita de autenticação quando `VITE_AUTH_ENABLED` estivesse ausente e fallback para um `DEV_USER_ID` compartilhado se não houvesse URL de banco. O segundo comportamento é inseguro fora do desenvolvimento local.

## Mudanças aprovadas para este lote

- `src/lib/auth/preview.ts`: trocar segredo literal por leitura de variável de ambiente **somente servidor** `GROK_PREVIEW_CLIENT_SECRET`; sem fallback secreto hardcoded; ajustar comentários da rota de callback Better Auth.
- `src/lib/auth/server.ts`: autenticação somente com `VITE_AUTH_ENABLED=true` **e credenciais configuradas**. Uma configuração inexistente não liga autenticação.
- `src/lib/auth/client.ts`: mesma semântica explícita no cliente.
- `src/lib/auth/verify.server.ts`: compartilhamento de identidade somente quando `NODE_ENV=development`, sem indicadores de deploy Vercel e sem `DATABASE_URL`; caso contrário lançar `UnauthorizedError`.
- `scripts/check-auth-invariant.mjs` e seu teste: alinhar estado dev/build com a regra `value === "true"`.
- `src/lib/auth/providers.ts` e `scripts/with-app-env.mjs`: esclarecer callback e política de ausência de flag.
- `scripts/auth-p0-runtime-gates.test.mjs`: ativar no `npm test` a suíte existente de verificação de segredo, além de provas negativas para configuração implícita e fallback.

## Gate e resultados (não antecipar)

1. **Código:** após commit, verificar bytes do arquivo ativo e ausência de credenciais literais sem imprimir qualquer segredo.
2. **CI:** exigir sucesso de todos os testes e build no commit SHA exato.
3. **Histórico Git:** credencial prévia ainda pode existir em commits antigos — `HOLD` até prova de revogação/rotação no emissor.
4. **Autenticação operacional:** ensaiar comportamento real no ambiente protegido com login habilitado e configuração aprovada; teste estrutural não substitui E2E.
5. **Preview público:** revisar adicionalmente host/proxy e identidade compartilhada; política de desenvolvimento isolado não é autorização para login compartilhado em preview remoto.
6. **RLS e LGPD:** não modificar Supabase; revisar vínculo da identidade autenticada aos dados antes de liberar.
7. **Branch #72:** manter `OPEN` até confronto integral dos nove caminhos com a nova `main`, direitos/segurança/testes/revisão independente e fechamento do ledger `CE.BRANCH.CLOSURE.v1`.

**Decisões expressas:** nenhum merge cego, nenhuma deleção/reescrita de histórico, nenhum banco alterado, nenhuma liberação clínica/deploy. O commit de correção é um delta mínimo para mitigar risco da árvore ativa, não uma certificação da segurança de todos os ambientes.

# CE / W2.6-G2/S1 — decisão sobre seis diferenças históricas P0_SECURITY

**Issue:** #111 · **Pai:** #106 · **Fase:** desenvolvimento, segurança code-level, não certificação de produção.
**Proprietário:** Cauê Zipfel — aprovação de homologação/release diferida. **Coordenação:** Leivis Lima.

## Evidência e delimitação

O snapshot de `grook_10_26` é commit `2eacacafd95c106e58a33372ee96bc6a6442439f`, árvore `d8de6c9a983e9ad4ecb95fb5aec68bd2389d0b8b`. A base atual examinada foi `main` em `5fcb5d2c59d90164ccc58f13406f702a23e8018b`, árvore `3ae236ec55f0680c5b9f652430c7c1194da8cb39`. Os bytes dos dois lados foram lidos e os SHA Git de cada objeto confrontados com o inventário #104; detalhes por objeto e risco residual estão no manifesto `registers/governance/ce-w26-grook-p0-security-s1-20261121.v1.json`.

## Decisões do lote (seis objetos)

| Objeto histórico | Decisão de integração **DEV**, não de release | Teste e limitação |
|---|---|---|
| `scripts/check-auth-invariant.mjs` | `SUPERSEDED_WITH_PROOF`: auth passa de habilitar por ausência de `false` a exigir `true` literal | Testes Node de predicado, desacordo dev/build e estado indeterminado; não é autenticação real |
| `scripts/check-auth-invariant.test.mjs` | `SUPERSEDED_WITH_PROOF`: expectativa sem flag passa de ON para OFF | Testes independentes e sem simular sucesso da provedora de OAuth |
| `scripts/with-app-env.mjs` | `SUPERSEDED_WITH_PROOF` **somente de comentário**, sem alteração executável neste objeto | Comentário atualizado para refletir opt-in explícito; não prova env de deploy |
| `src/lib/auth/server.ts` | `SUPERSEDED_WITH_PROOF`: servidor desabilita auth salvo valor exato `true` e credenciais disponíveis | Invariante de código e testes de flag; não comprova OAuth real, issuer ou sessão de produção |
| `src/lib/auth/verify.server.ts` | `SUPERSEDED_WITH_PROOF`: identidade sintética apenas em desenvolvimento local sem Vercel nem banco remoto; fora disso rejeita com `UnauthorizedError` | Inspeção de guarda e regressão estática; não é teste de SSR/HTTP com banco real |
| `src/lib/db.ts` | `SUPERSEDED_WITH_PROOF`: guard de DB explícito antes de escolher banco no deploy Vercel | Testes reais de guard com envs negativos; não verifica qual banco, credenciais, grants ou RLS |

O teste novo `scripts/ce-w26-grook-security-s1.test.mjs` executa o predicado real `authEnabledFromEnvValue`, o guard real `assertDatabaseConfiguredForDeployment` e verificações estáticas de código/SHAs. **Não** executa o login do provedor, SSR do usuário ou acesso ao Supabase. Testes específicos já existentes de autenticação e DB continuam no `npm test`. O script `scripts/ce-w26-grook-security-s1-verify.mjs` impede falsificar direitos, rotações, publicação ou baixa de branch.

## Contagem cumulativa e bloqueios

Inventário completo: 48 divergências. Lote anterior P1_TEST: **3**. Este lote P0_SECURITY: **6**. Total com disposição limitada à fase DEV: **9/48 = 18,75%**. Pendentes: **39/48 (81,25%)** — 7 segurança, 6 clínica, 16 runtime, 10 UI. A branch histórica `grook_10_26` permanece OPEN, sem `DEV_RECONCILED` nem `SEALED_FOR_RELEASE`.

**HOLD_CRITICO:** a credencial OAuth encontrada em código histórico requer prova independente de rotação/revogação no emissor (issue #92) e scanner de histórico Git (issue #91); nenhuma credencial deve ser reproduzida nos documentos, logs ou issues. A presença de um `DATABASE_URL` não identifica o banco que alimenta Vercel nem comprova RLS (issue #100). Não publicar, acessar produção, modificar banco remoto, importar arquivos privados ou aprovar uso clínico com esta evidência.

## Checklist de fechamento do lote #111

Exigir `verify` e `ce-integration-gate` PASS no mesmo HEAD da PR; merge com expected SHA, readback de main/tree e `verify` pós-merge no merge SHA; somente então fechar a issue #111 e atualizar a issue #106. A avaliação de encerramento das branches ocorre **depois do merge**, exigindo comparação de árvores, estado de PR, desvio histórico e cobertura semântica; não apagar refs.

**Rollback:** PR com reversão dos arquivos de controle do lote, sem restaurar automaticamente comportamentos `auth on` legados e sem apagar o inventário ou recibos.

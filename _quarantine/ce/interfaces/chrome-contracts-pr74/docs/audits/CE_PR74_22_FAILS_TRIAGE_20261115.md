# CE / NCOS — triagem executável dos 22 FAIL herdados (2026-11-15)

**Fonte operacional:** [GitHub Actions #43671855369](https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/43671855369), commit `db5614f15a3616c34b37412916a3b710a52496cb`, PR #74.
**Comparação histórica:** o [dossiê da PR #74](./CE_CONTRATOS_FECHAMENTO_TECNICO_PR74_20261114.md) registra baseline main 470 testes, 438 PASS e 24 FAIL; candidata 470 testes, 440 PASS e 22 FAIL, sem novas falhas por nome na comparação.
**Decisão:** `HOLD_TESTS`; sem alegar revisão funcional, clínica, jurídica ou publicação.

## Grupos de falhas (classificação pelo arquivo de teste)

| Grupo | Quantidade | Correção admissível | Bloqueio |
| --- | ---: | --- | --- |
| SOURCE_MISSING_SKILL | 4 | Recuperar a origem/autorização do pacote oficial .grok/skills/og e verificar a dependência de runtime, sem escrever SKILL fictícia | HOLD_SOURCE |
| PLATFORM_OG_PWA | 11 | Reconciliar injector e precedência real dos metadados, ícones, manifest, OG/Twitter; testes por documento e streaming | HOLD_PLATFORM |
| HEADER_AUTH | 4 | Alinhar implementação de Entrar/login à autenticação real, DS e traduções; considerar PR #72 após rotação/segurança | HOLD_AUTH |
| MIGRATION_CONTRACT | 1 | Inspecionar plano de migrations e paths reais, sem executar SQL nem alterar testes de plano para esconder objetos | HOLD_DATABASE |
| AUTH_ENV | 2 | Reconciliar contrato de app-env e estado real do template sem publicar login falso, credenciais ou configuração mock | HOLD_AUTH |

## Casos exatos extraídos dos logs

| ID do teste | Grupo | Arquivo de teste | Nome reportado |
| ---: | --- | --- | --- |
| 52 | SOURCE_MISSING_SKILL | `scripts/brand-check.test.mjs` | SKILL.md and AGENTS.md name the marker path and bound this script uses |
| 53 | SOURCE_MISSING_SKILL | `scripts/brand-check.test.mjs` | the sections that own the brand-task prohibition never affirm a wait |
| 54 | SOURCE_MISSING_SKILL | `scripts/brand-check.test.mjs` | SKILL.md tells the pass to self-check with the flag this CLI accepts |
| 128 | AUTH_ENV | `scripts/check-auth-invariant.test.mjs` | the build side resolves the template's shipped app-env |
| 228 | PLATFORM_OG_PWA | `scripts/grok-head-precedence.test.mjs` | app que declara apple-touch-icon nao recebe o padrao da plataforma |
| 229 | PLATFORM_OG_PWA | `scripts/grok-head-precedence.test.mjs` | app que declara manifest nao recebe o padrao da plataforma |
| 232 | PLATFORM_OG_PWA | `scripts/grok-head-precedence.test.mjs` | a checagem e pelo TIPO da tag, nao pelo href — qualquer src conta |
| 243 | PLATFORM_OG_PWA | `scripts/grok-pwa-plugin.test.mjs` | platform chrome overwrites share-card metas and always sets og:title |
| 255 | PLATFORM_OG_PWA | `scripts/grok-pwa-plugin.test.mjs` | published grok.me slug is still a title fallback |
| 259 | PLATFORM_OG_PWA | `scripts/grok-pwa-plugin.test.mjs` | emits og:image for a public host and prefers a custom card |
| 260 | PLATFORM_OG_PWA | `scripts/grok-pwa-plugin.test.mjs` | placeholder og:image appends site.color when it is 6-digit hex |
| 261 | PLATFORM_OG_PWA | `scripts/grok-pwa-plugin.test.mjs` | document title entities are not double-escaped on og:title |
| 263 | PLATFORM_OG_PWA | `scripts/grok-pwa-plugin.test.mjs` | injects into documents with no head element |
| 264 | PLATFORM_OG_PWA | `scripts/grok-pwa-plugin.test.mjs` | streaming injector matches </HEAD> case-insensitively |
| 269 | PLATFORM_OG_PWA | `scripts/grok-pwa-plugin.test.mjs` | uses the app name in the injected title tag |
| 284 | HEADER_AUTH | `scripts/header-entry.test.mjs` | Entrar is always visible in the topbar and routes to /login |
| 285 | HEADER_AUTH | `scripts/header-entry.test.mjs` | header reuses canonical translations and existing styling |
| 286 | HEADER_AUTH | `scripts/header-entry.test.mjs` | login remains gated by the real existing authentication switch |
| 287 | HEADER_AUTH | `scripts/header-entry.test.mjs` | disabled authentication cannot expose a fake sign-in form |
| 307 | MIGRATION_CONTRACT | `scripts/migration-plan.test.mjs` | the auth schema ships outside the globbed directory |
| 453 | AUTH_ENV | `scripts/with-app-env.test.mjs` | the template ships auth off |
| 469 | SOURCE_MISSING_SKILL | `scripts/write-atomic.test.mjs` | every hand-over the og skill prints is one this script accepts |

## Critérios de aceite obrigatórios

1. **Preservar testes originais**: não adicionar `skip`, `|| true`, `echo skipped`, patch manual de outputs de geração nem falsear uma resposta do produto.
2. Reproduzir cada falha, registrar comando/log/HEAD e demonstrar alteração do código de produção ou da fonte oficial legitimamente recuperada, sem inventar documentos de `.grok`.
3. Rodar somente o subset de cada grupo após a correção, depois a suíte completa; reportar novo total de FAIL sem dedução de aprovação clínica.
4. PR #72 (auth) requer revogação/rotação de credencial, E2E e revisão independente; PR #71 (SSR) depende de preview externo. Não mesclar para contornar status.
5. O fechamento clínico continua separado (direitos, evidência atômica, revisor COFEN, Kernel/WO, RLS, LGPD). O gate de deploy permanece `NO_GO`.

**Provenance:** IDs, arquivos e nomes vieram dos registros `not ok` da execução indicada. Causas e remediações acima são **classificações técnicas para investigação**, não diagnósticos comprovados de todas as falhas. Não há código corrigido ou status alterado por este dossiê.

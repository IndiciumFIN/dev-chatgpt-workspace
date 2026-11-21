# CE / W2.6-G2/S2 — OAuth, identidade e primeiro administrador

**Lote:** #113 · **Pai:** #106 · **Fase:** desenvolvimento; NÃO é laudo de segurança, homologação ou release.
**Proprietário:** Cauê Zipfel (aprovação diferida) · **Coordenação:** Leivis Lima.

## Provas e fontes

- Fonte histórica `grook_10_26` @ `2eacacafd95c106e58a33372ee96bc6a6442439f`, árvore `d8de6c9a983e9ad4ecb95fb5aec68bd2389d0b8b`.
- Base da `main` comparada @ `87da72f59261348bc1975dfc57fbba5cbab7745b`, árvore `99d096f1876d48077f38d6de5298a3d24cc6479b`.
- Os sete pares de arquivos foram lidos dos **dois commits fixos**; os quatorze Git blob SHA foram confrontados com o inventário #104. O manifesto não contém a credencial antiga nem trechos do literal.
- A dependência está travada em `better-auth@1.7.15` (manifesto e lock verificados em `scripts/check-better-auth-lock.test.mjs`). A migração oficial de Better Auth 1.7 exige `signIn.oauth2({ providerId })` → `signIn.social({ provider })`, remoção de `genericOAuthClient()` e alteração de callbacks: https://github.com/better-auth/better-auth/blob/main/docs/content/docs/guides/1-7-upgrade-guide.mdx . Isso fundamenta o contrato de código, **não** o funcionamento do broker real.

## Decisões por objeto — sem liberação de produção

| Arquivo | Disposição DEV | Evidência | Limite aberto |
|---|---|---|---|
| `src/lib/auth/client.ts` | `SUPERSEDED_WITH_PROOF` | Client OAuth migrado para `signIn.social`, sem plugin anterior; auth habilitada somente com `true` | Login OAuth real, cookies e IdP não verificados |
| `src/lib/auth/gate-identity.test.ts` | `SUPERSEDED_WITH_PROOF` | Hooks `before/after` isolam flag de autenticação nos testes positivos e restauram o ambiente; permanecem cenários negativos de token | Não prova identidade externa real |
| `src/lib/auth/popup.server.ts` | `SUPERSEDED_WITH_PROOF` | API servidor passa para `auth.api.signInSocial({body:{provider,...}})`; typecheck em Better Auth 1.7 | PKCE, redirect do broker e callback não foram executados em ambiente real |
| `src/lib/auth/providers.ts` | `SUPERSEDED_WITH_PROOF` **somente de comentário** | Endereço explicativo do callback atual reflete Better Auth 1.7, IDs dos providers preservados | Não atesta allowlist/configuração no emissor |
| `src/lib/source.functions.ts` | `SUPERSEDED_WITH_PROOF` | Primeiro visitante passa a `subscriber` em vez de promover implicitamente a `admin`; testes com PostgreSQL descartável/PGlite verificam múltiplos usuários e concorrência; fixture admin restrita a CI/PGlite | RBAC/RLS em banco operacional e login real ainda abertos |
| `src/routes/login.tsx` | `SUPERSEDED_WITH_PROOF` | Remoção de atalho restrito quando auth off, aviso com `role=status` e `aria-live` | UI não é fronteira de autorização |
| `src/lib/auth/preview.ts` | **`HOLD_ISSUER_ROTATION_AND_HISTORY_SCAN`** | Credencial literal histórica substituída no código atual por variável de ambiente, mas histórico Git permanece | Falta comprovante de revogação/rotação emitido pelo issuer (#92), histórico escaneado (#91), broker E2E e revisão independente |

## Testes e limites

O script `scripts/ce-w26-grook-security-s2-verify.mjs` cruza **48 caminhos**, os três arquivos tratados no S0/P1_TEST, os seis tratados no S1 e os seis neste S2, preservando um HOLD e outros 32 pendentes. Valida SHA de blob do conteúdo canônico, origem histórica, denominação dos riscos, prova do pacote e ausência de falsa homologação. O script de testes S2 inclui casos adversariais de SHA falso, linha ausente/duplicada, prova de issuer simulada, `SEALED` falso, regressão de default auth, primeiro admin e contrato OAuth de Better Auth 1.7.

Testes existentes também devem passar na CI: `scripts/ce-first-admin-bootstrap.test.mjs` (SQL executado em PGlite descartável), `scripts/admin-e2e-fixture.test.mjs`, `scripts/auth-p0-runtime-gates.test.mjs`, `scripts/check-better-auth-lock.test.mjs`, além de `src/lib/auth/gate-identity.test.ts`. Nada disso substitui testes OAuth/SSO com IdP autorizado, RLS real ou scanner completo de segredos.

## Percentuais sem confusão de escopo

- 48 divergências históricas da branch `grook_10_26` integralmente inventariadas.
- **15/48 = 31,25%** com disposição **limitada à fase DEV** (3 testes + 6 segurança S1 + 6 segurança S2).
- **33/48 = 68,75% pendentes**: 1 `HOLD_ISSUER` de segurança, 6 clínicas, 16 runtime, 10 UI.
- `grook_10_26` continua **OPEN**, sem `DEV_RECONCILED`, sem `SEALED`, sem `no_revisit`. Branch técnica poderá receber `DEV_RECONCILED` **somente** após merge e CI pós-merge no SHA exato.
- As 69 refs do censo incluem 54 CE/CKO/NCOS, 14 WU-TRIB isoladas e `main`. O marco histórico de 48 branches da norma W2 é outro denominador: não reescrever censo antigo.

## Próxima decisão sobre branches

Antes de baixar qualquer branch, verificar HEAD live, tree SHA, ancestralidade, PRs ainda abertas, inventário recursivo completo `truncated=false`, decisões por objeto, direitos, normativos, provedores e checks no SHA da main. Refs históricas com apenas hash de raiz ou PR mergeada **não** são fechadas. `SEALED_FOR_RELEASE` depende da prova independente e da aprovação do proprietário quando aplicável; o adendo DEV não a dispensa.

**Proibições:** nenhum segredo em issue/artefato, DDL/DML remoto, deploy, simulação de aprovação, exclusão de branch ou alegação de credencial rotacionada. Se CI ou evidência falhar, manter PR aberta e registrar HOLD; rollback por PR de reversão dos registros/testes, sem ressuscitar autenticação implícita.

# CE W2.5.1 — Resultado auditável da fila de risco das órfãs

**20/11/2026 — fonte GitHub Actions [run 44706372476](https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/44706372476), SUCCESS em `main@b56ae8a86e700e47e4f7f4b411968eb2a7d91cf3`.**

O [registro versionado](../../registers/governance/ce-w2-5-orphan-risk-screen-results-20261120.v1.json) armazena as métricas extraídas do teste W2.5 executado no GitHub, e o [teste de consistência](../../scripts/ce-w2-5-orphan-risk-screen-results.test.mjs) exige que sejam reproduzíveis a partir dos seis manifestos W2.4.

| Medida | Contagem | Significado |
| --- | ---: | --- |
| Órfãs com inventário completo | **23/23** | Cobertura estrutural, não homologação |
| SHAs exclusivos | **22** | `planning` e `archivamento` compartilham commit |
| Diferenças D/S/T nas origens | **30.551** | Ocorrências por origem, pode repetir o mesmo objeto |
| Objetos distintos por caminho/blob/modo | **15.374** | Reutilização potencial da mesma inspeção |
| Objetos com ocorrência em múltiplas fontes | **9.273** | Deduplicação de esforço, não de direitos |
| P0 | **842** | Risco preliminar de segurança, Kernel, migrations, CI e direitos |
| P1 | **4.522** | Código, contratos, aplicação e testes |
| P2 | **25.187** | Estáticos e histórico; direitos ainda necessários |

A menor branch possui 47 diferenças, `grook_10_26`, das quais **11 P0**. Outras três origens de menor volume possuem 56, 57 e 74 diferenças (respectivamente 13, 13 e 15 P0). A fila orienta a revisão: **menor número de arquivos não equivale a baixo risco**.

## Primeira inspeção por conteúdo: oito arquivos da origem grook_10_26

Foram comparados seus blobs Git com a `main` fixada em `80d5e19778b90d69c621eea381a152fbcd7e9912`: `src/lib/auth/preview.ts`, `scripts/check-auth-invariant.mjs`, `scripts/migration-plan.test.mjs`, `src/lib/kernel-admit.ts`, `scripts/migrate.mjs`, `src/lib/auth/server.ts`, `src/lib/auth/providers.ts` e `package.json`. O registro detalha os hashes de ambos os lados e os respectivos encaminhamentos **preventivos**.

A origem histórica de `auth/preview.ts` não apresenta a mesma leitura de segredo por variável de ambiente verificada no código canônico. A `main` contém ainda validação explícita de habilitação em `check-auth-invariant.mjs`, e uma correção sobre migrations da raiz em `migration-plan.test.mjs`. Portanto, **é inadequado substituir automaticamente estas versões pelos blobs antigos**. Isto não demonstra que todas as diferenças foram resolvidas, nem dispensa a rotação externa da credencial OAuth já identificada anteriormente.

**Estado:** priorização estrutural W2.5 comprovada; inspeção inicial de conteúdo em 8 arquivos; **nenhuma disposição final, nenhuma integração funcional, nenhuma branch `SEALED`**. Cross Supabase/Drive, direitos, revisão independente e gates clínicos continuam exigidos.

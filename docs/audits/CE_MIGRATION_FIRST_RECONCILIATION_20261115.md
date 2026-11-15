# Migration-first: reconciliação anti-duplicidade — 2026-11-15

**Estado:** `HOLD_HUMAN`; somente leitura da base e do GitHub. Nenhuma migration executada ou tabela alterada.

## Evidências e destinos separados

| Inventário | Volume observado | Identidade de destino | Estado |
| --- | ---: | --- | --- |
| Workspace `migrations/*.sql` | 58 arquivos numerados 0001–0058 | Aplicação Neon / PGlite, via `DATABASE_URL` e ledger `_migrations` | **HOLD_TARGET_LEDGER** |
| Workspace `migrations/auth/` | 1 SQL com mesmo hash Git de `migrations/0001_auth.sql` | Opt-in Better Auth contraditório no código atual | **HOLD_DUPLICATE_AUTH** |
| Workspace `migrations/candidates/` | 5 SQL | Não operacional | **HOLD_SOURCE** |
| Workspace `migrations/candidate/simulados-enfermagem/` | 3 SQL | Não operacional | **HOLD_SOURCE** |
| Workspace `migrations/candidate/vila/` | 1 SQL | Não operacional | **HOLD_SOURCE** |
| Calculadoras `supabase/migrations/` | 2 SQL | Supabase Calculadoras-Smart candidato, sem aplicação comprovada | **HOLD_SEMANTIC_OVERLAP** |
| Supabase Calculadoras-Smart | 255 migrations remotas únicas | `pgsybzggewhinaniybiy` | **PRESERVAR** |
| Supabase SOT/WU-TRIB | 18 migrations remotas únicas | `hcqukuotfwflmebjygam` | **FORA DO ESCOPO CE** |

`0001_auth.sql` é idêntico (Git blob `08c6b01fef9b46e72470fb66ea967d5f84e9bdb5`) em raiz e `auth/`. O teste original `migration-plan.test.mjs` supõe autenticação opcional, mas a raiz já contém a migração. Não apagar ou reativar sem conferir o banco Neon, clientes Better Auth e PR #72.

Os arquivos locais Supabase `20261011000000_initial_schema.sql` e `20261011120000_registry.sql` não estão na história de 255 migrations remotas. As tabelas `public.normatives`, `public.atoms`, `public.calculators` e `public.registry` também não existem no remoto consultado. **Não criar automaticamente**: já há sobreposição conceitual com `cko_governance.normative_reference_catalog`, `xlf_publication.content_atom`, `xlf_reg.registry_item`, `ce_platform.clinical_tools` e `ce_platform.canonical_objects`. A relação exige comparação de colunas, PK, FK, RLS, direitos, semântica e dados; não foi homologada.

O ledger `_migrations` da aplicação guarda apenas nome/data, sem hash de SQL. A consulta ao Supabase não revela o histórico do banco Neon e **não permite calcular quantas das 58 já foram executadas**. Os 255 registros Supabase têm SQL registrado em `statements`, mas `idempotency_key` nula. Não inferir duplicação a partir disso.

## Ordem operacional: antes de qualquer migration

1. **Separar destinos:** Neon/PGlite, Supabase CE e Supabase SOT nunca compartilham um plano de aplicação.
2. Capturar o **ledger real do Neon** (ambiente sem segredos expostos), respectivos esquemas e restauração testada. Comparar os 58 nomes com hashes fonte e diffs físicos. Congelar arquivos já aplicados.
3. Tratar a duplicação `0001_auth.sql` com uma única fonte ativa e testar Better Auth; revisar PR #72 e a separação de build já existente na PR #71.
4. Levantar crosswalk dos 2 SQL Supabase locais com as entidades canônicas existentes; classificar `APPLIED_EXACT`, `EXISTS_EQUIVALENT_NEEDS_PROOF`, `MISSING_DELTA`, `CONFLICT`, `OUT_OF_SCOPE`. O delta efetivo continua **INDETERMINADO**, não 58+2+9.
5. Validar delta isoladamente no PostgreSQL compatível: teste de primeira aplicação, segunda execução (idempotência), rollbacks, integridade PK/FK, RLS, grants, views, funções e regressão do app. Sem seeds reais.
6. **HOLD_HUMAN** para WO nominal, backup/restore e aprovação de promoção. Não executar `db:migrate`, `supabase db push`, `migration repair`, SQL DDL/DML ou merge com efeito no banco até liberação específica.

## Gate técnico entregue

`node scripts/migration-preflight.mjs --report` é **somente leitura**: inventaria a raiz e subpastas, calcula SHA-256, identifica nomes/hashes duplicados e lacunas de versão. Retorna exit 2 diante de HOLD. `scripts/migrate.mjs` consulta o preflight **antes de abrir conexão**; exige WO, liberação nominal, plano SHA-256 e host correspondente. Bloqueia uso deste migrador da aplicação contra `*.supabase.co`. A presença do duplicado de auth mantém a operação bloqueada mesmo se variáveis de aprovação forem inseridas.

**Limite importante:** isso não garante equivalência semântica com SQL previamente aplicado; antes de liberar é necessário obter snapshot confiável do banco real e conciliar o conteúdo de cada migration. Variáveis de ambiente não constituem prova autônoma de aprovação humana.

Referências oficiais: https://supabase.com/docs/guides/deployment/database-migrations e https://supabase.com/changelog/supabase-cli-v3.

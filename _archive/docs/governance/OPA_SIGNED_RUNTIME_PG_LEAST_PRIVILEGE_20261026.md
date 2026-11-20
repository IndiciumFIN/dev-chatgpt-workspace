# Gate de segurança: OPA assinado em runtime + papel de leitura PostgreSQL
Data: 2026-10-26  
Projeto: `IndiciumFIN/dev-chatgpt-workspace`, branch `preview/central-comando-20261026` (backup isolado).  
**Estado:** CANDIDATE / HOLD_HUMAN — sem main, Supabase, chave de produção ou rota operacional.

## Gate OPA: políticas executadas pelo motor, não mocks

A versão OPA **v1.21.4** é obtida de release oficial e verificada por SHA-256 antes do uso. O CI:
1. executa `opa check --strict` e `opa test --fail-on-empty`;
2. gera, com chaves **efêmeras**, um bundle contendo as políticas candidatas e um único conjunto de grants sintéticos;
3. verifica assinatura do bundle e nega chave incorreta/bundle não assinado;
4. inicia `opa run --server` vinculado apenas a **127.0.0.1**, usando `--bundle` e `--verification-key`;
5. faz requisições reais à API REST de políticas, passando pelo adaptador TypeScript de OPA; exige `decision_id`, autoriza somente o ator/perfil sintéticos e nega ator desconhecido, perfil sem grant e operação de escrita.

A *fixture* `cko_trusted` dentro do bundle é **sintética de CI**. Não há concessões reais nem publicação de serviço. O campo `bundle_sha256` informado pela política representa um valor interno controlado por dados do bundle: **não é, sozinho, um atestado criptográfico do hash do arquivo efetivamente ativado**. A prova de assinatura de ativação é exercida apenas pelo CLI com chave pública de CI. A produção exige atestação independente da cadeia de supply chain, distribuição, chave, configuração `bundles[].signing` e revisão de identidade de serviços.

### FIND-OPA-CI-001 (corrigido)

O runner detectou recursão de `data.cko.import_read` na primeira compilação. A referência de grants mudou para `data.cko_trusted`; casos positivos/negativos passaram. Este achado deve ficar na trilha de governança, sem interpretar o sucesso como homologação de produção.

## Gate de banco: papel dedicado com privilégio mínimo

Foi verificado em leitura no Supabase `Calculadoras-Smart` que **não havia papel com nome contendo "import" ou "reader"** no inventário consultado em 26/10/2026. Isso não descarta papéis existentes com outros nomes.

Migração SQL candidata **não executada**: `migrations/candidates/20261026_import_readonly_role.sql`.

- Cria `cko_import_reader` com `LOGIN`, **PASSWORD NULL**, sem SUPERUSER/CREATEDB/CREATEROLE/REPLICATION/BYPASSRLS, `NOINHERIT` e conexão limitada a duas sessões.
- Concede `USAGE` somente aos schemas canônicos estritamente necessários.
- Concede **SELECT por coluna**, conforme contrato real inspecionado nas tabelas `cko_evidence.sources`, `cko_orch.policy_registry` e `cko_validation.validators`. Não há `SELECT` genérico por schema/tabela.
- Configura padrão de transação somente leitura, timeouts e `search_path=pg_catalog`.
- Não altera registros, RLS, esquemas, credenciais, `anon` ou `authenticated`.
- Senha e autenticação do servidor só poderão ser habilitadas fora do Git, com WO e ambiente autorizados.

A implementação `src/core/governance/import-read-db.server.ts` foi reforçada: antes de qualquer SELECT de catálogo, verifica em transação `REPEATABLE READ, READ ONLY` a identidade `current_user`, o snapshot, `transaction_read_only=on` e a ausência de `rolsuper`, `rolbypassrls`, `rolcreatedb`, `rolcreaterole`, permissões de INSERT/UPDATE/DELETE/TRUNCATE nas três tabelas e CREATE nos três schemas.

Testes: `src/core/governance/import-read-role.test.ts` executa o SQL no PGlite e demonstra SELECT autorizado, coluna não autorizada negada, tabela extra negada, INSERT e CREATE negados. `import-read-db.test.ts` testa recusas a roles elevadas, transações com escrita habilitada e falhas de leitura.

## Pré-condições de liberação, ainda BLOQUEANTES

- Serviço OPA HTTPS privado efetivo com autenticação de serviço, bundles assinados/validados e **versão ativada atestada por componente independente**.
- Papel PostgreSQL provisionado e testado com credencial segregada em ambiente isolado autorizado; revisar grants de PUBLIC, heranças de roles, funções com `SECURITY DEFINER`, privilégios de executores, conexões e RLS.
- Sessão Better Auth real, revogação, RBAC e PEP no backend com identidade obtida exclusivamente do servidor.
- Rota de API registrada legalmente no runtime correto (tentativa anterior de criar arquivo de rota foi bloqueada por ferramenta; nenhuma rota alternativa foi publicada).
- OPA de **leitura** não admite WOs nem autoriza gravação. Qualquer importação canônica exige política própria de escrita, Kernel, revisão independente, controle de concorrência e auditoria.
- Testes de estresse, timeout, logs com minimização de dados e observabilidade de decisões antes de produção.

**Critério de aceite atual:** somente `OPA_CI_REAL_REST_SIGNED_BUNDLE_TESTED` e `PG_ROLE_DDL_CANDIDATE_TESTED_IN_ISOLATED_POSTGRES`; sem declaração de deploy/produção.

# CE — Auditoria de base: execução da Wave 1 (v0.6.4)

**Status: READ_ONLY / CANDIDATE / HOLD_HUMAN.** Nenhum merge, DDL, deploy ou admissão foi realizado.

## Evidência verificada em 01/11/2026

- GitHub: 26 refs, incluindo main `e9f7fe66075ebe5d7346072dc3a1b4934678c6de` e integração `081c61ac6c6ea674934d1cad3c310e96476fc9a1`.
- Supabase `Calculadoras-Smart`, projeto `pgsybzggewhinaniybiy`: 160 tabelas físicas em cinco schemas CKO: 88 governance; 27 orch; 21 validation; 17 ai; 7 evidence.
- As 160 tabelas possuem PK. Há 175 restrições FK no conjunto: 81+35+25+28+6. A contagem é por *restrição*, não por coluna nem por tabela.
- RLS está habilitada em 3/160 tabelas; **nenhuma das 160** tinha privilégios diretos SELECT/INSERT/UPDATE/DELETE para `anon` ou `authenticated` no momento da leitura. Essa verificação não atesta segurança de views, RPC, funções privilegiadas ou API.
- As 12 tabelas reaproveitáveis listadas em `contracts/cko-governance/structural-table-registry.v1.json` existem; as 8 tabelas novas do mesmo contrato não existem. Não aplicar DDL até reconciliação/WO e PostgreSQL descartável.
- Um catálogo de 240 migrações foi encontrado. Não foi executado teste de compatibilidade DDL em Postgres isolado.
- PR #30: HEAD de integração indicado acima. Último CI conhecido (mesmo SHA) contém 8 sucessos, 2 falhas, 1 ignorado. Nenhum PASS corresponde a liberação para publicação.
- `main` permanece sem proteção de branch evidenciada. Tratar promoção como bloqueada.

## Correção incremental do inventário (BASE-00)

- Auditoria bidirecional por **todos** os paths de cada tree: SOURCE_ONLY, CANDIDATE_ONLY, COLLISION e IDENTICAL.
- Verificação exata da população de refs, SHAs e `merge-base`. História não relacionada gera classificação explícita, jamais `--allow-unrelated-histories`.
- Rejeita modo de arquivo divergente e refs ausentes ou alteradas; gera relatório sem aprovar conflitos.
- O script exige checkout real no SHA de integração; esta instância não alcança o Git remoto via `git`, logo **não há relatório full-tree executado contra o repositório real nesta sessão**. O inventário completo é candidato a execução de CI, não resultado presente.

## Ordem fixada: identidade e origem → banco/PK/FK → DDL candidato → governança → domínio → serviços → aplicação → publicação.

Próximo gate: executar o novo inventário em checkout completo, reconciliar os paths de `migrations/`, `schemas/`, `contracts/` e `registers/` com os catálogos reais. Verificar então admissão do Kernel sobre escopo/SHA/WO e auditoria independente. A `main` não pode ser alterada por esta execução.

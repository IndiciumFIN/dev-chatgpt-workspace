# Continuidade: reconciliação de importações, serviço de leitura e trilha estrutural
Data: 2026-10-26
Estado: **CANDIDATE / HOLD_HUMAN — nenhum deploy de serviço ou banco**.

## O que foi verificado em leitura (Supabase Calculadoras-Smart)

As tabelas `cko_staging.import_packages`, `cko_evidence.sources`,
`cko_orch.policy_registry` e `cko_validation.validators` existem, com PKs
`import_package_id`, `source_id`, `policy_id` e `validator_id`.

Na consulta de 26/10/2026: **RLS desabilitado nas quatro tabelas**, mas os
papéis `anon` e `authenticated` não tinham privilégios `USAGE` nos schemas
ou `SELECT`/`INSERT` nessas tabelas. Portanto, não foi observada exposição
direta desses papéis; outros papéis, rotas, funções e políticas ainda requerem
auditoria. Não concluir conformidade ou segurança integral por essa leitura.

## O que foi implantado no GitHub, sem alteração do Supabase

1. **`src/core/governance/bulk-import-reconciliation.ts`**: reconciliador
   determinístico; somente resultados de preflight. Estados:
   - `HOLD_INVALID_ROW`: invalidado na ingestão
   - `HOLD_NO_CATALOG`: sem consulta
   - `HOLD_INCOMPLETE_LOOKUP`: consulta parcial, offline ou inconsistente
   - `NEW_CANDIDATE`: identidade ausente de um snapshot **alegado completo**
   - `UNCHANGED_CANDIDATE`: campos enviados coincidentes
   - `CONFLICT_HOLD`: divergência em um ou mais campos

   **Nenhum desses estados autoriza gravar ou atualizar.** Comparação avalia
   somente os campos efetivamente enviados; `UNCHANGED_CANDIDATE` não significa
   identidade integral de todos os metadados canônicos.

2. **`src/core/governance/import-read-service.ts`**: contrato de repositório
   para futura execução exclusivamente no backend, exigindo ator autenticado,
   permissão `governance:imports:reconcile`, SQL de seleção de tabelas permitidas,
   parâmetros, até 250 identificadores por consulta e token de snapshot.
   **Não está ligado a rotas, banco, autenticação real ou browser.** O objeto
   `ServerVerifiedActor` só pode ser construído por autenticador confiável;
   aceitar o mesmo JSON vindo do cliente seria vulnerabilidade.

3. **`migrations/candidates/20261026_governed_import_reconciliation.sql`**:
   migração candidata, não aplicada, dependente da migração de staging anterior:
   - `cko_staging.import_reconciliation_runs`
   - `cko_staging.import_reconciliation_rows`
   - `cko_staging.import_lifecycle_events`

   FKs ligam o histórico ao pacote de importação e às linhas corretas, com
   RLS + FORCE, privilégios públicos revogados, checks de resultados e triggers
   que rejeitam atualização/exclusão comum do histórico. Consultas completas
   são explicitamente `LOOKUP_COMPLETE_UNATTESTED`; decisão externa não é
   atestada apenas por ter sido gravada. Usuários altamente privilegiados podem
   alterar triggers: não chamar de imutabilidade criptográfica.

4. Testes determinísticos e de PostgreSQL isolado:
   `bulk-import-reconciliation.test.ts`,
   `import-read-service.test.ts`,
   `reconciliation-sql.test.ts`.

## Arquitetura restante (gates)

**Arquivo → staging → validação → reconciliação por leitura autenticada
→ divergências/FINDs → política OPA verificada → aprovação independente
→ WO → admissão no Kernel → execução transacional → auditoria**.

**Nenhuma operação direta é concedida à interface administrativa.** A conexão
entre serviço de leitura e banco requer credencial/role de menor privilégio
somente no servidor; a escrita futura exige PEP no backend, decisões OPA
atestadas e verificação canônica de identidade, direitos de uso, esquema,
licença, versões e integridade dos hashes.

FINDs de implementação antes da promoção:
- Auditar exposição de schemas, funções, grants, triggers e papéis de serviço.
- Definir decisão de segurança para falta de RLS nas tabelas privadas existentes,
  sem editar permissões herdadas por mera suposição.
- Homologar as duas migrações em ambiente isolado autorizado, com concorrência,
  reversão, execução de funções e verificação de zero bypass.
- Integrar autenticador **real** de servidor e leitura transacional consistente;
  não confiar em snapshots JSON externos como evidência de consulta de banco.
- Criar comprovantes OPA assinados e revalidação no Kernel/PEP, de modo que
  nenhum upload ative políticas, agente ou publicação.
- Planejar idempotência, lotes, retries, detecção de duplicados **no banco**
  e bloqueio de atualizações concorrentes por versão/ETag/hash.
- Fazer auditoria independente de segregação, limites, licenças e evidências
  antes de produzir WO e propor promoção.

**Preservação:** `main`, Supabase real e publicação permanecem inalterados.
A branch de trabalho é um backup isolado, não o Kernel corporativo definitivo.

# Análise das pendências por camada

Data: 2026-11-01. Escopo: a mesa local `grook_10_26` no commit `bb08b21f`, mais o que está no disco e ainda não foi commitado, e as pontas abertas no GitHub. Isto não homologa conteúdo clínico e não executa a suíte da PR #31.

A autorização humana de continuidade não muda o resultado de um teste e não transforma rascunho em conteúdo homologado. Nesta mesa, `admit()` recusa aprovador `kernel` e devolve `hold` com o motivo `human-approval-required`.

## Resultado

| Ordem | Camada | O que a lista dizia | O que esta conferência achou |
| --- | --- | --- | --- |
| 1 | Banco e migrations | 67 tabelas sem dicionário; conflitos SQL e idempotência | Não reproduzido nesta mesa. As migrations daqui não guardam JSON nem lista. A prova que aplica o banco inteiro, no commit, achou dicionário e tabela em par. A prova antiga ainda para em `0034_ops_record.sql` e por isso mente sobre tabelas posteriores. |
| 2 | CKO e metamodelos | 57 schemas duplicados; 16 violações na PR #31 | 56 schemas JSON com o mesmo nome e bytes diferentes, mais o README repetido. A cópia desta mesa é `cko-schemas`. As outras são esqueleto e editorial importados, ainda sem reconciliação. As 16 violações não estão no texto da ponta atual da PR #31. |
| 3 | Governança, OPA e Kernel | Exigir teste OPA real e verificação de assinatura | Confirmado como lacuna. `src/lib/kernel-admit.ts` só olha política ativa, efeito allow, validador e aprovador humano. Não chama OPA. O arquivo `kernel_admission_test.rego` traz `bundle_signature_verified: true` como dado de teste, não como verificação. |
| 4 | Serviços e segurança | Credencial OAuth histórica, RBAC e RLS | Não há `client_secret` nem chave em `src/lib/auth`. Também não há `ROW LEVEL SECURITY` nas migrations. O papel é regra da aplicação (administrador e assinante), não isolamento no banco. |
| 5 | Conteúdo e idiomas | 1.092 caminhos exclusivos na branch de 19 idiomas | Não reproduzido. `idioma/consolidado-19` tem 2.986 arquivos na árvore e não tem ancestral em comum com `grook_10_26`. Sem ancestral, esse número não é um conjunto exclusivo. |
| 6 | Painel e experiência | Homologar rotas, autenticação, acessibilidade e fluxos | Continua pendente. Não houve homologação nesta rodada. A autorização humana não fecha este item. |
| 7 | CI, merge e publicação | Falhas das PRs #31 e #32; build e liberação | As duas seguem abertas, em rascunho e em HOLD. A #31 avançou para `70bc1181`. A mensagem desse commit diz 341 testes, 340 verdes, 0 falhas, e o portão `HOLD_HUMAN`. A PR #30 não está mais na lista de abertas. O build desta mesa não foi repetido nesta análise. |

## 1. Banco

No disco há 54 arquivos em `migrations/`. Nenhuma migration atual contém `json`, `jsonb` ou `[]`.

O número 67 não apareceu ao cruzar `create table` com os registros de `schema_entity` desta mesa. A auditoria executada sobre o commit `bb08b21f`, com todas as migrations daquele commit, não achou entidade sem tabela nem tabela sem entidade.

O que ainda está frouxo é o teste `src/lib/dictionary.test.ts`: a lista aplicada vai só até `0034_ops_record.sql`. Tabelas criadas depois, entre elas `media_alt`, `repo_source` e `repo_file`, existem no banco e no dicionário, mas essa prova não as carrega. Isso é prova velha, não são 67 tabelas descobertas.

As migrations `0041` a `0053` estão no disco e fora do Git. `0052` e `0053` é que registram `study_item`, `study_choice`, `template_contract` e `repo_branch`.

## 2. Schemas

Há 56 schemas JSON com o mesmo nome e bytes diferentes. O `README.md` também se repete. Juntos são os 57 nomes. A lista dos JSON está em `schemas-duplicados.csv`.

A fonte a preservar nesta mesa é `src/data/contracts/cko-schemas`. As cópias em `cko-skeleton`, `cko-skeletons` e `cko-editorial` não devem ser tratadas como segunda fonte publicada. Reconciliar significa escolher um arquivo por nome, não somar os três.

A PR #31, ponta `70bc1181` de 2026-11-01 14:03 UTC, não descreve 16 violações contratuais. Descreve suíte verde e portão humano ainda fechado. Essa suíte não foi executada aqui. O número 16 fica sem evidência nesta conferência.

## 3. Kernel e OPA

`admit()` exige conjunto de políticas, política ativa com efeito `allow`, ao menos um validador e um aprovador que não seja `kernel`. Isso está em `src/lib/kernel-admit.ts`.

Não há, nesse caminho, avaliação Rego, pacote OPA assinado nem conferência de assinatura. Restaurar essa exigência continua pendente. Um campo `bundle_signature_verified: true` dentro de um JSON de teste não conta como verificação.

## 4. Segurança

Nesta árvore de trabalho, os arquivos de autenticação não carregam segredo de cliente. Isso não varre o histórico antigo de outro repositório.

Não há política de linha no Postgres. Quem publica e quem administra é decidido no código, com o papel da sessão. Isolamento por empresa e RLS não estão implantados.

## 5. Idiomas

`origin/idioma/consolidado-19` está em `3dc979a7`. A árvore tem 2.986 caminhos. O diff contra `bb08b21f` não serve como contagem de exclusivos, porque as histórias não se encontram. Os 1.174 arquivos em `src/data/registers/i18n` desta mesa são candidatos copiados do backup. Não estão publicados.

## 6. Painel

Rotas, autenticação, acessibilidade e fluxos completos não foram homologados nesta análise. A decisão de continuidade não substitui esse ensaio.

## 7. Publicação

Abertas em https://github.com/IndiciumFIN/dev-chatgpt-workspace :

- PR #32, `canonical/local-20261101`, rascunho e HOLD.
- PR #31, `plan/ce-reconciliacao-v6-20261101`, rascunho e HOLD, ponta nova `70bc1181`.
- PR #30 não aparece mais entre as abertas.

Nada disso foi integrado. Liberar publicação continua fechado enquanto o portão humano e os testes da própria PR não forem aceitos no lugar deles, não por uma frase de continuidade.

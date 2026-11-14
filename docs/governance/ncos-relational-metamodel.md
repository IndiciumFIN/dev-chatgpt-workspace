# NCOS — metamodelo e dicionário relacional derivado

Escopo: PR #52, runtime NCOS integrado. A fonte física é o PostgreSQL real obtido por replay das migrations principais em banco efêmero; não uma regex de DDL. Biblioteca existente: @electric-sql/pglite, com introspecção via pg_catalog.

Comando de geração: node scripts/ncos-schema-sync.mjs
Comando de bloqueio: node scripts/ncos-schema-sync.mjs --enforce
Testes negativos: node --test scripts/ncos-schema-integrity.test.mjs

Arquivos automáticos gerados a cada execução: catalog.v1.json (tabelas, colunas, PK, FK, CHECK, RLS); dictionary-candidate.v1.json (metadados conciliados com schema_entity/schema_column); relationships.v1.json e relationships.v1.mmd (grafo físico, com indicação separada dos vínculos declarados); gate.v1.json (achados e evidências).

A biblioteca nunca escreve no Neon/Supabase, nunca altera schema_entity/schema_column no banco de produção e nunca supõe um papel pelo nome da tabela. Colunas sem descrição permanecem HOLD_MISSING_DEFINITION e a decisão de homologação fica com o responsável. Cada arquivo inclui o digest das migrations e status candidato.

Bloqueios fail-closed: fonte com tabela sem PK; FK inválida; tabela, coluna ou relação física sem dicionário correspondente; relacionamento descrito sem FK sustentando-o; RLS crítica ausente; falha na prova negativa de órfão. Uma relação lógica pode ser válida sem FK física, mas exige decisão documentada e não deve receber rótulo de integridade referencial aplicada.

A atualização automática significa REGERAR as versões candidatas a cada CI e bloquear drift, não executar DDL ou preencher descrições imaginadas. Aplicação de migrations reais, sincronização do dicionário persistente, promoção à main e publicação seguem HOLD_HUMAN com revisão de segurança, Kernel e evidências de rollback. Não toca WU-TRIB nem gates do backup histórico.

Relationships declared in schema_column are classified by exact FK column mappings: DIRECT_FK, TRANSITIVE_FK (equality-preserving composite chains), or UNBACKED_DECLARATION. Only the last is a review hold; no FK is inferred from naming.

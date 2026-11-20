# Importação governada em lote — Administração (2026-10-26)

**Estado:** CANDIDATE / HOLD_HUMAN · **sem escrita remota, sem admissões, sem alteração da main e sem DDL aplicada**.

## Por que a importação entra na fundação

Para cadastrar políticas, fontes e validadores, a importação tabular deve produzir pacotes **auditáveis**, jamais acessar diretamente os mestres. A implementação presente cobre **pré-validação local e exportação JSON**, não é importador operacional de produção.

## Arquitetura e bases existentes reconciliadas

Leitura no Supabase `Calculadoras-Smart` em 26/10/2026:
- `cko_staging.import_packages`: tabela estrutural existente que deve ser **reutilizada** como identidade do lote.
- `cko_orch.quarantine`, `public.ingest_intakes`, `vdc_ai.intake_batches`, `vdc_ai.intake_items`: estruturas de ingestão/quarentena já existentes, com responsabilidades distintas; não duplicar nem pressupor equivalência.
- Cadastros existentes selecionados para a primeira onda: `cko_evidence.sources`, `cko_orch.policy_registry` e `cko_validation.validators`. Os campos vêm da inspeção de colunas dos mestres. **Nenhum desses mestres foi alterado**.

Migração **candidata e NÃO APLICADA**: `migrations/candidates/20261026_governed_admin_bulk_import.sql`. Contém sete tabelas complementares:
1. `cko_staging.import_profile_versions` — contrato do perfil, desabilitado por padrão.
2. `cko_staging.import_package_contracts` — vincula um pacote existente a um perfil/versionamento e hash da origem.
3. `cko_staging.import_column_mappings` — mapeamentos coluna da origem → campo destino (unívocos por pacote).
4. `cko_staging.import_chunks` — checkpoints de 250 linhas e hash SHA-256.
5. `cko_staging.import_row_candidates` — registro por linha, estado candidato/HOLD/rejeitado, identidade e hash.
6. `cko_staging.import_row_findings` — erros e evidências por linha/campo.
7. `cko_staging.import_review_events` — revisão e proposta para WO, vinculada a evidências e decisão humana.

FKs para as tabelas existentes, PKs/índices, RLS+FORCE, revogação de privilégios públicos. **Não existe UPDATE direto no objeto canônico**; os registros de staging também não concedem permissão de execução.

## Experiência do administrador

`Administração → Dados e Conhecimento → Fontes e Ingestão → Importação em lote`

1. Selecionar cadastro: Fontes e licenças, Políticas ou Validadores.
2. Baixar o template CSV com as colunas **reconciliadas** com o cadastro.
3. Selecionar arquivo `.csv`, `.tsv` ou `.json`; XLSX **não está ativo**: requer análise própria de fórmulas, macros, formatos e licença da biblioteca.
4. Mapeamento sugerido de cabeçalho para campos; mapeamento corrigível manualmente.
5. Validar valores, formatos, tipo, obrigatoriedade, IDs e duplicidade **dentro do lote**; filas com `CANDIDATE` e `HOLD`.
6. Conferir linhas/erros e exportar pacote `CKO_STAGING_IMPORT_CANDIDATE`, acompanhado do hash do arquivo, hashes por grupo de 250 registros, totais e referências.
7. O pacote **não é submetido** para o banco; o valor constante `has_remote_write: false` e `status: NOT_SUBMITTED` indicam isso.

Limites desta versão: **5 MiB, 10.000 registros e 60 colunas, 4.096 caracteres por célula**; UTF-8; CSV/TSV com aspas e quebras de linha permitidas, JSON como array de objetos. Cabeçalhos ambíguos, linhas malformadas, duplicados intralote, valores com prefixos de fórmulas e dados sem campos obrigatórios são retidos ou rejeitados.

**Não enviar dados de pacientes, credenciais, documentos sigilosos ou dados pessoais sensíveis ao preview.** O arquivo é lido no navegador, mas seu conteúdo poderá ser mantido em memória até o fechamento da página. Não conectar a GA4, observabilidade ou logs.

## Gates obrigatórios antes de gravar no banco

1. Validar a **migração SQL** em ambiente de teste autorizado, reconciliando RLS, roles, índices, FK, consistência de perfil por pacote e procedimentos de rollback.
2. Formalizar **FIND → política → validador → WO**. Avaliar OPA em serviço confiável, com bundle versionado e decisão verificável.
3. **Autenticação + RBAC/RLS + PEP** no backend; nenhuma escrita direta do navegador nos mestres.
4. Fazer comparação com os IDs existentes para distinguir novo, idêntico, conflito e versão sucessora. Até lá, a deduplicação implementada considera **apenas o arquivo recebido**.
5. Implementar validação semântica específica por tipo, FK, licença, vigência, consentimento, normativa, schema e versão canônica.
6. Exigir revisão humana independente e assinatura de evidências quando aplicável; importar não significa aprovação ou promoção.
7. Revalidar no servidor cada byte/hash, arquivo/tamanho/MIME, perfil/versão, cada linha e total; não confiar no status local da UI.
8. Implementar persistência transacional por lotes com idempotência e locks/fencing, tratamento de parcialidade e relatório de reprovação.
9. **XLSX** apenas depois de parser confiável, limites de planilha/células e tratamento de fórmulas/macro com ensaios adversariais.
10. Homologar WCAG, mobile, regressões E2E e testes de segurança.

## Contratos de código

- Parser/validador: `src/core/governance/bulk-import.ts`.
- Testes de regra: `src/core/governance/bulk-import.test.ts`.
- Área administrativa: `src/components/admin/admin-bulk-import.tsx` e `src/styles/admin-bulk-import.css`.
- Schema de pacote: `contracts/cko-governance/staging-import-candidate.schema.json`.
- DDL candidata: `migrations/candidates/20261026_governed_admin_bulk_import.sql`.
- Teste estrutural: `src/core/governance/bulk-import-staging.test.ts`.
- Teste Chromium/Playwright: `scripts/admin-ux-e2e.mjs`.

## Normas e referências de pesquisa

- Supabase Docs: Import data into Supabase — https://supabase.com/docs/guides/database/import-data
- OWASP File Upload Cheat Sheet — https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html
- OWASP CSV Injection Testing — https://wstg.owasp.org/latest/4-Web_Application_Security_Testing/07-Injection/21-CSV_Injection/

A migração, UI e checks **não comprovam** execução real de Rego/OPA, backend conectado, teste de rollback, licenciamento de fontes ou homologação clínica.

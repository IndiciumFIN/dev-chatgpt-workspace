# CE Best Excellence — Supabase CLI e reconciliação canônica (candidato)

**Data:** 2026-11-01  
**Estado:** INVENTORY_ONLY / HOLD_HUMAN / NOT_HOMOLOGATED  
**Base:** `canonical/foundation-20261101@3fcf566892d21fff3a37882db28c653bb1840ed1`  
**Destinação:** planejamento; NÃO aplicar em `main`, Supabase ou Vercel.

## Decisão de engenharia

O GitHub mantém os contratos, esquemas, evidências e decisões versionadas. O banco PostgreSQL/Supabase é a fonte observável do estado implantado. O Kernel e a WO determinam admissão e homologação; nenhum dump, teste ou `PASS` técnico confere autoridade sozinho.

A WO começa no planejamento e acompanha tudo. Seu contrato final será consolidado após cruzarmos fontes, normas, tarefas, validações, governança e ciclo de vida. FIND é condicional à origem, não uma etapa obrigatória para toda WO.

## Linha de base realmente observada

- 33 branches listadas no repositório; relações commit-a-commit examinadas contra a candidata. Diferenças amplas ainda requerem reconciliação recursiva de conteúdo.
- 12 PRs abertas na observação anterior; PR #36 permanece candidata, não homologada.
- Supabase `Calculadoras-Smart`, leitura atual: 362 referências normativas, 10.925 vínculos por campo, 33 extrações, 157 sources, 43 filas de aquisição, 77 validadores e 22 políticas.
- Estruturas a reutilizar: `cko_governance.normative_reference_catalog`, `field_normative_bindings`, `field_catalog`, `metadata_field_registry`, `normative_document_extractions`, `cko_regulatory.acquisition_queue`, `source_routing`, `cko_evidence.sources`, `cko_validation.validators`, `cko_orch.policy_registry`.
- Contratos no Git: `contracts/cko-schemas/`, `contracts/cko-skeletons/`, `contracts/cko-governance/structural-table-registry.v1.json`; WOs existentes `WO-GOV-TRANS-001` e `WO-CKO-COFEN-001`. Não gerar homônimos.
- Existe diferença material entre `migrations/` da aplicação local (PGLite) e o banco remoto com schemas `cko_*`: não exigir igualdade literal de todas as tabelas.

## Uso seguro no terminal

**Nunca cole credenciais no código, chat, URL, workflow ou logs.** Se uma credencial foi exposta, revogue-a. PAT do Supabase Management API **não é** senha PostgreSQL. Use um role PostgreSQL somente leitura, conexão via `PGSERVICE`/`.pg_service.conf` e `PGPASSFILE`/`.pgpass` local, fora do repositório.

Verifique os comandos disponíveis **na versão instalada**, pois flags de alvo remoto mudam:
```bash
supabase --version
supabase --help
supabase db dump --help
supabase migration list --help
psql --version
```

Configure `PGSERVICE` ou `PGHOST` + `PGDATABASE` e autenticação em arquivo de senha protegido. Em seguida:
```bash
bash scripts/ce-supabase-inventory-readonly.sh
node --test tests/ce-reconcile-supabase-catalog.test.mjs
```

Os relatórios ficam fora do repositório por padrão (`/tmp/ce-db-reconcile/<timestamp>/catalog.json` e `reconciliation.json`); a variável `CE_REPORT_DIR` pode alterar o destino. Antes de versionar relatórios, faça revisão de classificação e exposição de informações.

## Limites verificáveis

1. O SQL **não lê linhas de dados**, corpos de funções ou conteúdos protegidos. Inventaria schemas, objetos, colunas, constraints, políticas RLS (metadados, sem expressões) e assinaturas de funções.
2. O reconciliador offline encontra referências reutilizadas ou candidatas no registro estrutural; não tenta aplicar migrations nem interpretar normativos.
3. Estado de RLS `enabled` **não comprova eficácia**, e existência de validação não comprova execução.
4. Colisões locais de migrations são bloqueio de promoção. Históricos remotos ainda precisam de reconciliação própria e inventário das versões efetivamente aplicadas.
5. `db dump` pode complementar o inventário de estrutura. `db pull`, `db push`, `migration repair`, `db reset`, `migration up` e `db diff` com geração de arquivos NÃO fazem parte deste lote.

## Trilhas simultâneas (sem dependência artificial)

| Frente | Entrada preexistente | Saída candidata | Gate |
|---|---|---|---|
| A — Arquitetura | 44 camadas, metamodelos, dicionários e Master Data | crosswalk objeto×contrato×tabela×consumidor | baseline versionada |
| B — Normativos | catálogos, `WO-GOV-TRANS-001`, COFEN/COREN | source e aplicabilidade revisadas; direitos, edição, vigência e cláusulas | sem aprovação inferida |
| C — Aquisição | source routing, fila, APIs, parsers, F0–F10 | contratos entrada/saída; hash, integridade, erro, retry, quota | transições fail-closed |
| D — Políticas | OPA, Kernel, validadores | avaliação independente e controle de identidade/autoridade | nenhum PASS sintético |
| E — Dados | SQL real, migrations Git, bindings | reconciliação estrutural e plano de mudanças | sem schema write |
| F — Piloto | conteúdo e templates existentes | um fluxo real fonte→content→canal | TEST PASS + HOMOLOGAÇÃO |

## Próxima decisão técnica exigida

Comparar o snapshot gerado via terminal com as definições do Git e as tabelas/versões remotas; classificar cada divergência como `REUSE`, `ADAPT`, `CONFLICT`, `NOT_APPLICABLE`, `MISSING` ou `NOT_VERIFIED`. Vincular cada ação a tarefa e WO existentes, ou criar WO de planejamento somente após análise de equivalência. Não executar alterações remotas sem admissão do Kernel.

**Este documento não afirma que CLI, testes locais, migrações ou deploy já foram executados com sucesso.**

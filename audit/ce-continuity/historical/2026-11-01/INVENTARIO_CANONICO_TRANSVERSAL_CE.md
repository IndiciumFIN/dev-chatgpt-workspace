# Inventário canônico transversal — Calculadoras de Enfermagem

**Data:** 2026-11-01  
**Escopo:** backup `sandbox-backup-completo (1).tar.gz`; GitHub `IndiciumFIN/dev-chatgpt-workspace`; Supabase `Calculadoras-Smart`, exclusivamente em leitura.  
**Decisão:** `INVENTORY_COMPLETE_FOR_SCOPED_SOURCES / MERGE_HOLD / DB_MUTATION_NOT_AUTHORIZED`.

## 1. Conclusão executiva

O projeto já possui estruturas relevantes em banco, código e registros canônicos. Um novo catálogo independente de ferramentas, metamodelos ou dicionários criaria risco de duplicidade. Recomenda-se montar **um índice transversal de referências e autoridades**, conciliando os objetos existentes sem substituí-los.

### Inventário verificado

| Fonte | Objeto | Quantidade | Grau de evidência |
|---|---|---:|---|
| Supabase, pg_catalog | Schemas | 41 | Observação direta READ_ONLY |
| Supabase, pg_catalog | Tabelas | 487 | Observação direta READ_ONLY; nomes e RLS por tabela |
| Supabase, pg_catalog | Views | 49 | Observação direta READ_ONLY; sem inspecionar sua definição de segurança |
| Supabase, API migrations | Migrations registradas | 240 | Observação direta |
| Supabase, pg_class | Tabelas com RLS habilitado | 206 | Observação direta; não equivale a garantia de isolamento |
| Registro do backup + Supabase | Tabelas reutilizáveis no registro estrutural | 12/12 existentes | Comparação por to_regclass |
| Registro do backup + Supabase | Tabelas candidatas no registro estrutural | 0/8 existentes | Comparação por to_regclass |
| Backup ativo | Arquivos de definição de schema/metamodelo | 260 | 260 definições; não tabelas implantadas |
| Backup ativo | Instâncias/esqueletos referenciando schemas | 67 | Não são definições de metamodelo |
| Backup ativo | Enumerações/constantes declaradas em schemas | 1.085 | 598 enum + 487 const; **não** são 1.085 dicionários únicos |
| Backup ativo | Referências JSON Schema `$ref` | 124 | Referências sintáticas, ainda não validadas todas |
| Backup ativo | Contratos de entidades, registros heterogêneos | 1.643 | Não confundir com número de ferramentas |
| Backup | Serviços lógicos | 410, 45 famílias | Todos `CANDIDATE_HOLD` |
| Backup | Capacidades | 201 | Candidatas |
| Backup | Ferramentas do catálogo misto | 83 | Nem todas homologadas; não cobre tudo da plataforma |
| Backup | Arquivos SQL | 11 em `migrations/` | DDL local; não indica implantação |
| Backup ativo (inclui script de auditoria) | Nomes distintos de tabelas extraídos de SQL | 31 | DDL estático; 35 declarações, 4 duplicadas de auth |
| Backup ativo | Colunas extraídas de SQL | 285 | Parser estático, sujeito a verificação PostgreSQL |
| Backup ativo | Bibliotecas / editorial (itens em registros específicos) | 155 | Soma de tipos heterogêneos |
| Backup ativo | Coleções JSON detectadas heuristicamente | 474 | **Arquivos** com arrays; não 474 catálogos distintos |
| Backup ativo | Grupos com arquivos estruturalmente idênticos (SHA-256) | 56 | Duplicação de conteúdo, não permissão para excluir |
| Backup | Arquivos regulares | 5.203 | Hash e caminho listados no CSV |
| GitHub | Branches identificadas | 27 | Listagem direta; diff contra `main` por branch com limites de API |

### Outros indicadores do Supabase — contagem de registros, não validação de conteúdo

| Objeto | Registros |
|---|---:|
| `cko_master.entity_types` | 45 |
| `cko_master.relation_types` | 90 |
| `cko_master.entities` | 1.164 |
| `cko_master.relationships` | 7.558 |
| `cko_governance.field_catalog` | 2.496 |
| `cko_governance.metadata_field_registry` | 37 |
| `cko_governance.reference_data_registry` | 99 |
| `cko_governance.md_tool_registry_v2_candidate` | 131 |
| `cko_governance.platform_capabilities` | 21 |
| `xlf_md.code_list_item` | 107 |
| `xlf_graph.predicate` | 35 |
| `cko_validation.validators` | 77 |
| `cko_evidence.sources` | 157 |

Há potencial sobreposição de terminologias e metamodelos entre o CKO local e os cadastros do banco. `COUNT(*)` não prova unicidade, vigência, direitos ou qualidade de registros.

## 2. Tabelas — separação de fontes

O inventário disponibiliza **487 tabelas live**, com schema, nome completo e flag de RLS; **49 views**; 41 agregados por schema e 20 tabelas diretamente reconciliadas com o registro estrutural. O backup contém 31 nomes distintos em scripts SQL, mas alguns pertencem a scripts candidatos ou a um script de auditoria, e 4 declarações de autenticação são uma duplicação literal entre `migrations/0001_auth.sql` e `migrations/auth/0001_auth.sql`.

Os 12 nomes do registro `existing_reused` foram encontrados no Supabase. Os oito nomes do registro `candidates` não foram encontrados. Antes de sugerir novas tabelas, pesquisar equivalências em `cko_governance`, `cko_orch`, `cko_validation`, `cko_master`, `cko_staging`, `public` e nos demais schemas existentes, incluindo views e funções.

RLS habilitado em 206 tabelas; desabilitado em 281. Este número **não é diagnóstico de vulnerabilidade**: avaliar permissões, exposição da Data API, policies, segurança das views e privilégios por papel. Não houve teste de acesso anônimo/autenticado nem alterações de política.

## 3. Metamodelos, dicionários e fontes de autoridade

- **Metamodelos:** 260 definições; 67 instâncias/esqueletos. Há 56 grupos de duplicatas literais em fontes estruturais, incluindo cópias de schemas CKO; não eliminar nada antes de determinar os `$id` e as referências consumidas.
- **Vocabulários declarativos:** 598 enumerações e 487 `const` identificadas nos schemas. Uma declaração repetida em vários contratos não equivale a um novo dicionário. Referências a NANDA, NIC, NOC, CIPE, SNOMED e LOINC não comprovam a presença dos vocabulários completos nem seus direitos de uso.
- **Cadastros live:** `cko_master.entity_types`, `cko_master.relation_types`, `cko_governance.field_catalog`, `cko_governance.reference_data_registry`, `xlf_md.code_list_item`, `xlf_graph.predicate` e outros são candidatos a autoridades a serem reconciliadas antes de criar estruturas duplicadas.
- **Relações:** 92 ocorrências de relacionamento SQL no material local e 124 `$ref` de schemas; os dados live incluem 7.558 linhas em `cko_master.relationships`. Não se atribui equivalência sem avaliar semântica, chaves, direção e vigência.

## 4. Ferramentas e serviços

O catálogo misto de 83 ferramentas inclui itens clínicos e quatro trabalhistas. Outras funcionalidades de pesquisa, carreira, educação, administrativas e profissionais estão distribuídas em componentes e serviços, não integralmente no mesmo catálogo. O `ce-skeleton` preserva 410 serviços lógicos, mas todos permanecem candidatos. A arquitetura alvo é um **índice federado de ferramentas** que referencia os cadastros existentes, não uma quarta fonte de verdade.

Persistem riscos do backup mais recente: 77 ferramentas ainda em estado `CANDIDATE` apesar de 83 marcadas publicadas; 54 faixas etárias incongruentes; 78 fórmulas sem `source_binding_refs`; falhas dos gates legados e de integridade CKO. **Esses achados não foram considerados resolvidos neste inventário.**

## 5. GitHub — reconciliação de 27 branches

A comparação da lista de branches com a `main` foi efetuada em leitura. Estão identificadas frentes estruturalmente relevantes de carreira, pesquisa, simulados, editoriais, bibliotecas, idiomas, importação Drive e integração estrutural. Algumas branches são divergentes e duas (`feat/projection-unica-f0-suite-real`, `grook_10_26`) não possuem ancestral comum detectável pela API de comparação. As diferenças com 300 arquivos retornados podem estar **truncadas** pela API; não representam auditoria exaustiva das árvores. A PR #30 da integração estrutural demanda reconciliação nominal e autorização específica.

**Nenhum merge, push, deploy, DDL, alteração RLS ou mutação em dados foi realizado.**

## 6. Sequência determinística recomendada

1. Fixar SHAs e inventário integral de árvores de todas as branches, com atenção aos dois históricos independentes e aos diffs truncados.
2. Identificar autoridades por entidade, tipo, campo, relação, dicionário, ferramenta, capacidade, serviço e release gate.
3. Confrontar PK/FK, tipos, constraints, RLS/policies, funções e migrações do Supabase com todos os DDL candidatos, sem aplicar migrações.
4. Construir crosswalk `objeto → tipo/metamodelo → campos → dicionário → fonte → evidência → contrato → serviço → interface → gate`.
5. Reconciliar duplicatas por SHA, por `$id`, por nome canônico e por semântica, preservando aliases e proveniência.
6. Abrir FINDs para lacunas, selecionar políticas/validadores e só depois criar TASK/WO. Kernel deve admitir qualquer execução.
7. Validar conteúdo, segurança, testes de contrato, CI/E2E e revisão clínica; promover seletivamente, nunca pelo status visual de publicação.

## 7. Arquivos produzidos

- `inventario_canonico_transversal_ce_2026-11-01.xlsx` — matriz com abas para Supabase, SQL, schemas, dicionários, catálogos, entidades, serviços, capacidades, ferramentas, branches, backlog.
- `ce_inventario_supabase_tabelas_2026-11-01.csv` — 487 tabelas com schema/nome/RLS.
- `ce_inventario_supabase_views_2026-11-01.csv` — 49 views com schema/nome.
- `ce_inventario_inventario_arquivos_2026-11-01.csv` — manifesto completo de 5.203 arquivos com SHA-256.
- `ce_inventario_metamodelos_definicoes_2026-11-01.csv` e `ce_inventario_instancias_cko_2026-11-01.csv` — separação entre contrato e instância.
- CSVs auxiliares, snapshots JSON e script SQL somente leitura dentro do pacote ZIP.

**Limites de auditoria:** inventário descritivo e reconciliação estrutural pontual; não representa inspeção integral de colunas/policies das 487 tabelas, materialização de todos os conteúdos das branches, testes completos ou homologação da segurança clínica. Estado de consolidação: **HOLD_HUMAN**.
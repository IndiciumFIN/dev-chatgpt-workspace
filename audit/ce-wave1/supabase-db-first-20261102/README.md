# CE — reconstrução canônica DB-first | 2026-11-02

**Decisão do proprietário:** o Supabase ativo é fonte de inventário; a representação canônica governada deverá ser reconstruída, validada e versionada no GitHub **antes** da reconciliação de conteúdo das branches. A auditoria prévia integral de refs é um gate de integridade anterior a qualquer escrita, não é a etapa de consolidação das branches.

## Estado verificável

Repositório: `IndiciumFIN/dev-chatgpt-workspace`; candidata existente: `canonical/foundation-20261101`; projeto de origem somente leitura: `pgsybzggewhinaniybiy` (Calculadoras-Smart).

| Evidência Git | Universo |
|---|---|
| `live-schema-readonly.v1.json` | 35 schemas de aplicação; 562 tabelas; 6.074 colunas, metadados de tipos, nulabilidade, default-present e RLS |
| `live-constraints-indexes-readonly.v1.json` | 1.834 constraints e 1.111 índices com definições da instância ativa |
| `live-policies-routines-views-readonly.v1.json` | 94 policies, 186 triggers, 342 assinaturas de funções com hash (sem corpos) e 46 views de aplicação |
| Fora do escopo de aplicação | `extensions` tem 2 views adicionais; não confundir com as 46 de aplicação |
| Dump histórico fornecido | 482 tabelas (443 de aplicação + 39 de infraestrutura). A produção possui mais 119 tabelas de aplicação em `ce_platform` e `ce_research_candidate` |
| Componente de governança reutilizado | `registers/governance/r78-gap-wo-execution-20261031.v1.json`; `WO-GOV-TRANS-001`; `registers/governance/main-migration-scope.v1.json` |

Todas as três evidências são **EVIDENCE_ONLY / HOLD_HUMAN** e não são migrations, backups restauráveis nem licenças para execução. Não alteraram dados, roles, políticas, schema ou sites.

## Ordem de conclusão, sem matriz ou branch concorrente

1. Auditar todas as branches, PRs, SHAs e árvores antes de qualquer mutação; registrar mudanças simultâneas e falhar fechado.
2. Fixar **base canônica do banco no Git** usando o material das três evidências e os contratos/migrations existentes. Completar definição exata de tipos/typmods, defaults seguros, FKs, dependências, views, funções, grants, ownership, extensões, RLS, triggers, seeds e dicionários; não inventar SQL ausente.
3. Reconciliar tabela+coluna+tipo+constraint+dependência com o Supabase ativo por checksums e cobertura nominal, com diferenças explícitas. Testar scripts em ambiente isolado com rollback; consolidar numeração de migrations sem reexecutar arquivos históricos.
4. Vínculo `FIND → política → validador → TASK → WO → admissão real do Kernel` e revisão independente. Sem essas provas, continuar `HOLD_HUMAN`; nunca autoaprovar.
5. Somente com a **base estrutural validada** começar a seleção de contribuições das demais branches, identificando colisões e identidades sem merge cego.
6. Submeter PR/CI/testes negativos/E2E, revisão humana exigida, homologação e promoção autorizada a `main`/produção.

## Isolamento obrigatório de domínio

`contabilidade_cfc.*`, `account_palm.*`, `public.cfc_internal_*` e `cko_governance.cfc_*` podem constar do inventário de evidências, mas **não** devem ser copiados ou promovidos para os canais de enfermagem. Não apagar material histórico nem tratar prefixos como única prova de proveniência.

## Lacunas ainda abertas

- O snapshot estrutural não retém todos os typmods nem os valores textuais dos defaults. O arquivo de funções retém SHA de definições e assinaturas, **não** os 342 corpos executáveis.
- Falta conferir grants, roles, ownership, extensões, SECURITY DEFINER/search_path, RLS para schemas expostos, triggers e dependências cruzadas; RLS ligado não comprova política adequada.
- Os SQLs extraídos dos anexos são fontes candidatas (podem incluir sintaxe inválida, DDL parcial e domínios segregados); não executar em produção.
- As 36 branches foram inventariadas em leitura integral sem truncamento; a reconciliação de conteúdo e gates ocorre **depois** da reconstrução validada do Supabase.
- A `main` permanece sem autorização de merge; Kernel e revisão clínica/editorial/normativa exigem evidência específica.

**Gate atual:** `SCHEMA_RECONSTRUCTION_IN_PROGRESS / HOLD_HUMAN / NO_SUPABASE_WRITE / NO_MAIN_MERGE / NO_DEPLOY`.

# Catálogo de cenários de auditoria — Data Kernel (13 cenários mapeados ao repositório)

**Versão:** v0.1.0 · **Data:** 2026-10-31 · **WO:** WO-SEC-001
**Origem:** especificação genérica de auditoria PostgreSQL recebida em anexo, reescrita para o que este repositório realmente possui.
**Executor:** `scripts/audit_data_kernel.py` (só biblioteca padrão) · **Política:** `registers/governance/audit-policy.v1.json`
**Estado:** PROPOSTO — read-only, sem tocar produção.

---

## 0. Regra de transposição (o que mudou da spec original e por quê)

| spec original | decisão neste repo | motivo |
|---|---|---|
| `pandas`, `pydantic`, `Great Expectations`, `psycopg2`, `yaml` | **eliminados** | o CI roda `npm ci` e não instala pip; dependência nova = código morto |
| `policy.yaml` | `audit-policy.v1.json` | JSON é stdlib; YAML exigiria PyYAML |
| tabelas `core.produtos`, `core.produtos_i18n`, `clientes` | `review_item`, `source`, `audit_log`, `ce_curiosidades_v1.pages` | a spec citava tabelas que não existem aqui |
| `pg_cron` + tabela `audit.logs_execucao` | **relatório em arquivo** (JSON/Markdown) + gate de CI | sem escrita no banco; rastreabilidade em git |
| `dbt` | scripts `check-*.mjs` / `audit-*.mjs` | padrão já vigente no repo (106 scripts) |
| "corrigir automaticamente" (normalizar slug, preencher alt) | **read-only por padrão** | correção automática em dado clínico/editorial é decisão editorial, não de auditoria |

---

## 1. Domínio 1 — Kernel & Metamodelo (infraestrutura)

### KER-01 · Dicionário de dados sincronizado
- **Risco:** tabela/coluna criada por migração sem descrição no catálogo → metadado cego.
- **Regra:** toda coluna em schema de negócio precisa de descrição em `pg_catalog.pg_description`.
- **Modo:** PostgreSQL (read-only). **Não implementável estaticamente** — depende do catálogo vivo.
- **Onde:** `information_schema.columns` ⨝ `pg_description`.
- **Status:** implementado no motor (modo postgres) · política de tabelas/alvos a popular (T2.022).

### KER-02 · FK lógica × constraint física
- **Risco:** dependência documentada e não implantada → órfãos silenciosos.
- **Regra:** toda relação declarada em `audit-policy.logicalRelations` precisa existir como `REFERENCES` no DDL.
- **Modo:** **estático** (parse dos `.sql` de migração) + PostgreSQL para o estado real.
- **Onde:** `migrations/**/*.sql`, `supabase/migrations/**/*.sql`.
- **Status:** **implementado e testado** (`TestSqlAudits::test_fk_logica_ausente_erro`).

### KER-03 · Mutabilidade de tabelas estruturais
- **Risco:** tabela de log (APPEND_ONLY) ou de parâmetro (STATIC) sofrendo `UPDATE`/`DELETE`.
- **Regra:** tabelas classificadas como STATIC/APPEND_ONLY não podem ter mutação destrutiva.
- **Modo:** estático (DDL) e PostgreSQL (`pg_stat_user_tables.n_tup_upd/n_tup_del`).
- **Onde:** `audit-policy.tables[].mutability`.
- **Status:** **implementado e testado**.

---

## 2. Domínio 2 — Master Data, Atomização e Tipagem

### MST-01 · Atomização (1NF)
- **Risco:** `endereco_completo = "Av. X, 1000 - Apto 42"` → um campo com três conceitos.
- **Regra:** colunas marcadas como atômicas não podem conter delimitadores de composição.
- **Modo:** **estático sobre amostras** (regex) ou PostgreSQL (amostragem). Cuidado: sem dado real, a regra só pode ser aplicada ao que está versionado no repo.
- **Limite honesto:** o repositório não tem o dump do banco; o detector só atua sobre os JSON de conteúdo e o DDL versionado. **Não é** auditoria do banco de produção.
- **Status:** **especificado, não implementado** — entra quando o inventário de dados do repo existir (T2.022).

### MST-02 · Unicidade do registro mestre (golden record)
- **Risco:** mesma entidade sob chaves distintas por erro de digitação.
- **Regra:** uma chave de negócio normalizada (só dígitos) → no máximo um registro ativo.
- **Modo:** PostgreSQL (`REGEXP_REPLACE` + `GROUP BY` + contagem de ativos).
- **Status:** **especificado, não implementado** (depende de inventário de tabelas com `is_active`).

### MST-03 · Tipagem estrita
- **Risco:** data em `VARCHAR`, flag em `INTEGER`, valor monetário em `float`.
- **Regra:** `*_at`/`*_date` → `TIMESTAMPTZ`; flags → `BOOLEAN`; dinheiro → `NUMERIC`.
- **Modo:** **estático** sobre o DDL.
- **Status:** **implementado e testado** (`TestSqlAudits::test_tipagem_incorreta_erro`).

---

## 3. Domínio 3 — Policy-as-Code e Segurança

### SEC-01 · PII acessível por role indevida
- **Risco:** BI/analista com `SELECT` direto em coluna PII, sem hash ou view de mascaramento.
- **Regra:** nenhuma role fora do grupo autorizado pode ter `SELECT` em coluna marcada `is_pii`.
- **Modo:** PostgreSQL (`information_schema.column_privileges`) + `audit-policy.security.piiColumns`.
- **Status:** implementado no motor (modo postgres) · **política a popular** com as colunas PII reais (T2.022).

### SEC-02 · RLS desligada em tabela multi-tenant
- **Risco:** vazamento horizontal entre clientes.
- **Regra:** toda tabela com isolamento por tenant precisa de `rowsecurity = true`.
- **Modo:** PostgreSQL (`pg_catalog.pg_tables.rowsecurity`).
- **Status:** implementado no motor · política a popular.

### SEC-03 *(novo, derivado do achado do repo)* — Gate de cobertura como política
- **Risco:** pendência declarada e nunca vinculada a WO — passa despercebida.
- **Regra:** toda WO ativa tem task; toda task tem WO; toda pendência tem vínculo; nenhum gap aberto.
- **Modo:** **estático** (arquivos do repo).
- **Status:** **implementado e testado** — `scripts/check-pending-coverage.mjs` (7 testes).

---

## 4. Domínio 4 — Internacionalização

### I18N-01 · Paridade de locales
- **Risco:** novo idioma lançado sem as traduções correspondentes → tela vazia.
- **Regra:** para cada registro público, existe tradução para todos os locales obrigatórios.
- **Fonte de verdade:** `registers/i18n/locale-register.v1.json` (`locales[]`, `defaultLocale`).
- **Modo:** **estático** sobre os JSON de conteúdo.
- **Status:** **implementado e testado**.

### I18N-02 · Tradução vazia ou espelhada
- **Risco:** registro de tradução existe, mas o conteúdo é vazio ou cópia literal do original (burlar o gate sem traduzir).
- **Regra:** conteúdo não vazio e diferente do original, exceto no locale padrão.
- **Modo:** estático. **Limite:** a spec original propunha distância de edição (Levenshtein) — aqui usa-se igualdade normalizada, porque distância exige corpus de referência e produz falso positivo com termos técnicos (ex.: "Protocolo" em pt/es). Distância fica como **heurística opcional**, não como bloqueio.
- **Status:** **implementado e testado**.

---

## 5. Domínio 5 — SEO e metadados públicos

### SEO-01 · Limites de meta title e description
- **Regra:** `metaTitle` 30–60 caracteres; `metaDescription` 120–160.
- **Modo:** estático sobre o conteúdo.
- **Status:** **implementado** (severidade `warning` — o limite do buscador é heurística, não norma).

### SEO-02 · Higiene e unicidade de slug
- **Regra:** `^[a-z0-9-]+$` e slug único no acervo.
- **Modo:** estático. **Status:** **implementado e testado** (slug inválido e slug duplicado).

### SEO-03 · Texto alternativo de imagem
- **Regra:** `alt_text` preenchido, descritivo e **não** igual ao nome do arquivo.
- **Modo:** estático sobre os JSONs de conteúdo com mídia.
- **Status:** **especificado, não implementado** — depende de o conteúdo versionado expor `alt_text` (conferir com o PR #22).

---

## 6. Domínio 6 — JSON-LD / Schema.org

### JSD-01 · Campos obrigatórios por `@type`
- **Regra:** `Product` exige `name/image/sku/price/priceCurrency`; `Article` exige `headline/image/datePublished/dateModified/author`; `Organization` exige `name/url/logo`; `BreadcrumbList` exige `position/item/name`.
- **Modo:** estático + gerador.
- **Status:** **especificado**; gerador sem dependência externa é a T4.041 (a spec original usava pydantic — aqui a validação é própria, para não depender de pip).

### JSD-02 · Coerência temporal
- **Regra:** `dateModified ≥ datePublished`.
- **Modo:** estático. **Status:** **implementado e testado**.

---

## 7. Cobertura e lacunas desta matriz

| cenário | modo | estado | bloqueado por |
|---|---|---|---|
| KER-01 | DB | implementado | inventário de tabelas reais (T2.022) |
| KER-02 | estático + DB | implementado | — |
| KER-03 | estático + DB | implementado | classificação de mutabilidade real (T2.022) |
| MST-01 | estático/DB | especificado | inventário de dados |
| MST-02 | DB | especificado | tabelas com chave de negócio e `is_active` |
| MST-03 | estático | implementado | — |
| SEC-01 | DB | implementado | lista real de colunas PII (T2.022) |
| SEC-02 | DB | implementado | lista real de tabelas multi-tenant (T2.022) |
| SEC-03 | estático | implementado | — |
| I18N-01 | estático | implementado | — |
| I18N-02 | estático | implementado | — |
| SEO-01 | estático | implementado | — |
| SEO-02 | estático | implementado | — |
| SEO-03 | estático | especificado | campo `alt_text` no conteúdo |
| JSD-01 | estático | especificado | gerador (T4.041) |
| JSD-02 | estático | implementado | — |

**Cobertura de execução sem banco: 10 de 16** — e todos os 6 restantes estão explicitamente bloqueados por um insumo de inventário, não por falta de código.

# WU-TRIB · Wave 04 · Evidências de engenharia

Data: 2026-11-08. WO: WUTRIB-WO-PLAN-016, PLANNING, sem homologação fiscal. Esta evidência não é autorização para dados reais, aprovação fiscal ou promoção da API.

## Escopo implementado e segregação

- Base de código v0.3: wutrib/web-pilot-20261108, SHA 86a34e7e5b491b283d89161206debc88103248d8.
- Branch candidata: wutrib/demo-persistence-v04-20261108. Interface pública permanece v0.3, sem chamadas remotas, sem login e sem credenciais.
- Contrato privado versionado: db/wutrib_demo_v04.sql; handler do lado servidor: api/demo-casefiles.js; normalizador: src/demo-persistence-contract.js; teste negativo: tests/demo-persistence.test.mjs.
- Novo esquema de dados: não foi criado outro projeto; reutilizou-se SOMENTE SOT-10-09-2026 (ref hcqukuotfwflmebjygam), esquema wutrib isolado. Calculadoras-Smart não foi alterado.

## Provas concluídas

1. CI v0.4: https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/42487073560 — 51/51 testes Node, cinco agentes determinísticos e revisão contratual SQL PASS.
2. Migração Supabase: wutrib_demo_casefiles_v04_private_20261108, aplicada com sucesso. Tabela wutrib.demo_casefiles adicional com RLS ENABLED; anon_select=false, authenticated_insert=false, service_insert=true.
3. RPCs public.wutrib_demo_casefile_save_v1 e public.wutrib_demo_casefile_get_v1: anon e authenticated EXECUTE=false, service_role EXECUTE=true. Ambas são SECURITY INVOKER e requerem autorização explícita de tabela.
4. Teste SQL com SET LOCAL ROLE service_role: salvar, repetir e ler dossiê inteiramente fictício aprovado tecnicamente. A tabela continha somente 1 registro sintético após teste idempotente; approval=NOT_APPROVED, taxConformity=NOT_EVALUATED. Identificador técnico: aae8016a-c3a0-4041-81eb-8e2cd6baa2cf.
5. Preview Vercel exclusivo: dpl_9WRqLeqpi3xSKQ8n9eVEW7Sg3b97, commit aplicativo d0a65617bebcf50381495d2e94b713cbd17479e9, status READY, sem alias de produção.
6. CI HTTPS: https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/42487524266 — página e assets via HTTPS PASS; GET /api/demo-casefiles sem configuração devolveu 503 com DEMO_PERSISTENCE_DISABLED (fail closed). 51/51 Node e cinco agentes PASS.

## Achados, limites e gates restantes

- A credencial de operador e a chave service_role NÃO foram inseridas no Vercel. A API não aceita tráfego operacional até habilitação controlada. O fluxo HTTPS 201/GET com autorização ainda NÃO foi testado; HTTP 503 indica que o desligamento seguro funciona.
- Não há autenticação empresarial, RLS multiempresa, rate limiting distribuído, assinatura ou imutabilidade forte de revisões; a identidade do revisor segue UNVERIFIED_OPERATOR.
- Sem garantia automática contra a digitação de informações empresariais reais no campo de nota. Manter uso com dados estritamente sintéticos.
- O backend é candidato dentro do repositório compartilhado e não deve ser confundido com um novo repositório GitHub independente. Draft PR bloqueia merge sem revisão.
- Security Advisor sinaliza INFO para RLS sem política em tabelas privadas, incluindo demo_casefiles. Este comportamento é intencional; não adicionar política de acesso ao público para silenciar o aviso.
- Homologação fiscal, XSD/EFD oficiais, rastreio Protheus e autorização para dados reais permanecem HOLD_HUMAN.

Fonte técnica de desenho de permissões: documentação oficial Supabase Securing your API (https://supabase.com/docs/guides/api/securing-your-api) e Postgres Roles (https://supabase.com/docs/guides/database/postgres/roles).

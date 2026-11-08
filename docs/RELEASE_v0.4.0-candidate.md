# WU-TRIB v0.4.0 — persistência demonstrativa candidata

WO: WUTRIB-WO-PLAN-016, PLANNING. Implantação separada da versão principal v0.3; não representa homologação tributária. Os 3 achados permitidos derivam exclusivamente das fixtures sintéticas da v0.3. A interface continua desconectada de rede e sem login. Não há envio de XML/EFD ou integração Protheus.

## Infraestrutura e fronteiras

O banco correto é SOT-10-09-2026 (ref hcqukuotfwflmebjygam), não Calculadoras-Smart. A nova tabela wutrib.demo_casefiles é privada, com RLS e sem GRANT aos papéis anon/authenticated. As RPCs public.wutrib_demo_casefile_save_v1 e public.wutrib_demo_casefile_get_v1 são SECURITY INVOKER, com EXECUTE exclusivamente para service_role. O serviço apenas registra um resumo normalizado e notas sintéticas.

A função Vercel api/demo-casefiles.js exige o header Authorization: Bearer, comparado em tempo constante com credencial de operador mantida exclusivamente no servidor. Não há CORS permissivo. POST aceita apenas fixtureCode e até três reviews com identificadores conhecidos; não aceita XML, notas maiores que 1200 caracteres nem estados de aprovação. GET exige UUID. O hash SHA-256 de payload canonizado fornece idempotência. Não identifica o revisor individual e NÃO assina a revisão.

As notas continuam sendo texto livre digitado pelo operador: o sistema não garante que estejam livres de dados reais. Nunca registrar dados pessoais, comerciais, tributários ou identificadores verdadeiros. O token temporário de operador não substitui login empresarial, RBAC, rate limit ou controle multiempresa.

## Configuração protegida (não configurada nesta candidata)

Variáveis de ambiente do lado servidor do projeto Vercel WU-TRIB, jamais na aplicação pública:
- WUTRIB_OPERATOR_TOKEN: valor aleatório com pelo menos 32 caracteres.
- WUTRIB_SUPABASE_URL: https://hcqukuotfwflmebjygam.supabase.co
- WUTRIB_SUPABASE_SERVICE_ROLE_KEY: credencial service_role somente servidor, guardada em secrets.

Sem configuração completa a API retorna 503; sem token válido retorna 401. O navegador público mantém CSP connect-src none. Não configurar secrets nem fazer deploy principal até revisão do candidato.

## Gates de aceitação

1. Validar cinco agentes determinísticos, regressões Node e testes negativos de API em CI.
2. Rever e aplicar SOMENTE no Supabase SOT o contrato versionado db/wutrib_demo_v04.sql, aditivo, mantendo todas as tabelas existentes intactas.
3. Verificar RLS e ausência de EXECUTE para anon/authenticated nas duas RPCs, e EXECUTE para service_role; verificar security advisors.
4. Verificar a resposta HTTPS sem credenciais, o isolamento do projeto Vercel, a ausência de vazamento e os gates de autenticação antes da ativação do serviço.
5. Testar 201/GET e idempotência a partir de um operador autorizado, quando as credenciais forem configuradas em ambiente seguro.
6. Só após gates completos considerar promoção. Dados empresariais reais, conclusões fiscais, RBAC, auditoria assinada e Protheus seguem HOLD_HUMAN.

Exemplo de payload de operador: {"fixtureCode":"WU-TRIB-SYNTHETIC-V03","reviews":[]}. Dossiê JSON exportado pela v0.3 não é aceito diretamente: exige normalização específica para impedir gravação acidental de dados importados.

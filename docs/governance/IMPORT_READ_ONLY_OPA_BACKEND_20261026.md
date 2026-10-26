# Serviço de reconciliação: sessão verificada → OPA PDP → leitura PostgreSQL

Data: 2026-10-26  
Estado: **CANDIDATO / FAIL-CLOSED / SEM ROTA HTTP EXPOSTA / SEM DEPLOY**.

## Escopo concluído nesta etapa

Componentes versionados na branch de prévia:

- `src/core/governance/import-opa-read.server.ts`: cliente OPA de autorização
  **somente leitura**, com URL HTTPS fixa, token do servidor, timeout, decisão
  negada por padrão, exigência de `decision_id` e hash de bundle esperado.
- `contracts/cko-governance/opa/import_read.rego`: política candidata baseada
  em grants dentro de dados de política **confiáveis**, nunca em JSON importado,
  campos de usuário, URL ou credenciais vindos do cliente.
- `contracts/cko-governance/opa/import_read_test.rego`: casos de deny / allow
  **ainda sem execução no binário OPA**.
- `src/core/governance/import-read-db.server.ts`: pool PostgreSQL separado da
  autenticação, transação REPEATABLE READ READ ONLY, `statement_timeout`,
  papel `current_user` comparado com o papel provisionado, snapshot único para
  todos os chunks, SQL allowlisted com array de IDs parametrizado.
- `src/core/governance/import-reconcile-http.server.ts`: contrato de
  processamento HTTP com negação antes de qualquer acesso ao banco quando
  flags, sessão, política ou origin não estiverem validados. A carga é
  **revalidada no servidor** usando parser e mapeamento canônicos. Resposta não
  contém payload da fonte nem realiza escrita.
- Testes negativos em `import-opa-read.test.ts`,
  `import-read-db.test.ts`, `import-reconcile-http.test.ts`.

### Bloqueio explícito da exposição HTTP

A criação do arquivo de rota `src/routes/api/admin.import.reconcile.ts`
foi **bloqueada pelas configurações de segurança do ambiente de ferramentas**.
Não foi criada rota alternativa nem utilizado desvio do bloqueio. Os módulos
do serviço existem para revisão e testes isolados, mas **a área administrativa
não está integrada a eles**.

## Configuração futura — nenhum segredo registrado no Git

| Nome | Exigência |
|---|---|
| `VITE_AUTH_ENABLED` | Deve ser explicitamente `true`; o usuário `dev-user` nunca serve |
| `CKO_IMPORT_READ_ENABLED` | `true` somente após homologação independente; padrão OFF |
| `CKO_IMPORT_READ_DATABASE_URL` | credencial de papel com SELECT estritamente limitado aos três mestres; apenas servidor |
| `CKO_IMPORT_READ_DB_ROLE` | papel esperado no PostgreSQL, comprovado via `current_user` |
| `CKO_OPA_IMPORT_READ_URL` | endpoint HTTPS fixo `/v1/data/cko/import_read` em domínio privado confiável |
| `CKO_OPA_IMPORT_READ_TOKEN` | credencial de serviço do PDP, nunca ao navegador |
| `CKO_OPA_IMPORT_BUNDLE_SHA256` | hash esperado do bundle deployado; é *pinning*, não prova criptográfica da assinatura |

O OPA deve ser provisionado separadamente com bundle **assinado e verificado**
por um componente confiável. Os grants de ator/profile dentro de `data.cko`
precisam vir de uma fonte de autoridade aprovada. Uma resposta OPA com
`decision_id` e hash coincidente não constitui assinatura por si só. Para
obter `decision_id`, configurar o serviço OPA conforme seus recursos de logs
de decisão. A identidade do ator decorre de `auth.api.getSession` do Better
Auth em rota servidor; não usar `requireUserId`, pois contém fallback de
`dev-user` em desenvolvimento.

### Escopo de política limitado

A política permite, apenas mediante grant confiável:
- ação `imports.reconcile.read`;
- perfis `sources`, `policies`, `validators`;
- destinos `cko_evidence.sources`, `cko_orch.policy_registry`,
  `cko_validation.validators`;
- até 10.000 registros pré-validados, em SELECT por lotes de no máximo 250 IDs.

Não existe operação de `INSERT`, `UPDATE`, `DELETE`, promoção, publicação,
admissão Kernel ou ativação de agente.

### Modelo de ameaça e requisitos adicionais

1. **Sem identidade presumida:** login efetivo e grant OPA verificado para cada
   solicitação. Só o backend pode atribuir `ServerVerifiedActor`.
2. **SSRF/OPA:** URL fixa HTTPS de origem confiável, sem URL fornecida pelo
   arquivo ou operador; plano de rede deve impor egress controlado.
3. **Papel SQL:** role de leitura com grants selecionados e sem `BYPASSRLS`
   ou direitos de criação/execução indevida; autenticação via segredo servidor.
4. **Confidencialidade:** corpo máximo 7 MiB, arquivo até 5 MiB; saída JSON
   contém apenas classificações, IDs, campos divergentes e referências
   técnicas — não envia valores originais armazenados no banco.
5. **Snapshots:** uma transação REPEATABLE READ READ ONLY evita variações
   entre os chunks durante uma consulta; não substitui verificação de
   concorrência imediatamente antes de qualquer gravação autorizada.
6. **Autorização independente de gravação:** política de *read* não aprova
   geração de WO, alterações de registros, Kernel, agentes ou publicação.
7. **CSRF:** POST JSON com verificação de `Origin` e
   `Sec-Fetch-Site`; autenticação e OPA continuam obrigatórios.
8. **Host estático:** Vercel/SPA somente estático não executa esta rota
   de servidor. É necessário runtime de servidor compatível e autorizado.
9. **Integridade:** hash SHA-256 calculado no backend para o conteúdo recebido.
   O hash não atesta licença, proveniência normativa nem validade clínica.
10. **Segurança do banco existente:** consulta read-only de 26/10/2026
    confirmou RLS desabilitado nos quatro mestres analisados, mas `anon`
    e `authenticated` sem acesso direto de schema ou SELECT/INSERT. Revisar
    demais grants/papéis/funções antes da integração.

## Status dos gates

- Código de preflight e testes isolados: implementados.
- Rotas HTTP e interface de reconciliação online: **NÃO IMPLEMENTADAS**.
- OPA instalado/com bundle assinado e policy tests reais: **NÃO COMPROVADOS**.
- Papel somente leitura provisionado no Supabase: **NÃO COMPROVADO**.
- Aplicação das 10 tabelas candidatas de staging/reconciliação:
  **NÃO EXECUTADA**.
- OPA admission + Kernel corporativo + executor:
  **HOLD_HUMAN, sem promoção e sem qualquer escrita**.

Próxima WO: provisionar ambiente de integração isolado, papel de leitura,
PDP e identidade vinculada, validar bundle, então integrar rota e E2E.
A `main`, o Supabase existente e os dados clínicos permanecem inalterados.

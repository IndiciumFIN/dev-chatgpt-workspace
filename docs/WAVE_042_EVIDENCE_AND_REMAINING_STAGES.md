# WU-TRIB — Wave 04.2: identidade individual, isolamento organizacional

Data: 2026-11-08. WO WUTRIB-WO-PLAN-016 / PLANNING.
Escopo: exclusivamente ocorrências sintéticas, sem aprovação fiscal e sem dados empresariais.

## Referências verificadas

- GitHub origem: IndiciumFIN/dev-chatgpt-workspace, branch wutrib/demo-persistence-v04-20261108, PR #41 Draft.
- Migração SOT 10-09-2026 / hcqukuotfwflmebjygam: wutrib_demo_v042_auth_org_tenant_20261108.
- Arquivo de origem: db/wutrib_demo_v042_org_auth.sql, commit 7c9f53eef456b4016c531dc46a2c59a483fd6d07.
- Preview Vercel: https://wutrib-auditor-web-piloto-f4ei7ebx8-leivisml-7739s-projects.vercel.app — deployment dpl_3yGmVxYAX8k7UQkdBMLDjRi4P1VF, READY, target=null, sem alias de produção, commit ca0686158437274078d8e3358d0b15933a7f549b.
- CI: https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/42490869283 — SUCCESS, seis agentes determinísticos, 65/65 testes Node, HTTPS smoke e API 503 fail-closed.

## Controles implementados

1. A API exige feature flag explícita WUTRIB_DEMO_AUTH_ENABLED=true, URL fixa SOT, publishable key e service-role exclusivamente do servidor. Sem configuração retorna HTTP 503.
2. Um token compartilhado antigo não autentica. Identidade individual validada remotamente via GET /auth/v1/user usando JWT do Supabase Auth; identidade anônima e identidade sem confirmação são rejeitadas. Nenhum user_metadata determina permissão.
3. Autorização em banco exige organização ACTIVE, vínculo active=true com aprovação documentada, papel INVESTIGATOR para SAVE e VIEWER ou INVESTIGATOR para READ.
4. Novas tabelas privadas: demo_organizations_v1, demo_org_memberships_v1, demo_org_casefiles_v1, demo_org_audit_events_v1. RLS habilitado em todas; anon e authenticated sem grants. Nenhum usuário, organização ou dossiê real foi cadastrado.
5. Gravação de dossiê vinculada à organização; hash gerado pelo PostgreSQL; unicidade por organização e digest; autor do evento armazenado separadamente da fixture. Leitura e escrita auditadas.
6. RPCs legadas sem isolamento por organização tiveram EXECUTE de service_role revogado; somente novas funções segregadas são acessíveis ao serviço. O dossiê histórico sintético v0.4 foi preservado.
7. Rate limit de 30 operações autenticadas por minuto por usuário-organização, persistido no banco. Não é proteção contra inundação anônima de borda.

## Provas SQL executadas (transação com ROLLBACK)

- Duas organizações falsas ativas e três vínculos falsos foram criados somente na transação.
- INVESTIGATOR de A: SAVE e SAVE repetido retornaram o mesmo ID e digest; GET em A retornou NOT_APPROVED.
- Mesmo usuário, autorizado como VIEWER em B, não conseguiu ler por B o ID que pertencia a A (resultado NULL).
- VIEWER de A: SAVE negado por insufficient_privilege, READ permitido.
- Foram registrados quatro eventos SAVE/READ na transação revertida.
- Verificação após rollback: 0 organizações, 0 memberships, 0 dossiês organizacionais e 0 eventos organizacionais; uma fixture sintética legada preservada.

## Pendências / riscos

- Ainda não há usuário real, MFA configurado, sessão validada por E2E, organização piloto aprovada, WAF, rate limiting anônimo ou política de retenção homologada.
- A homepage pública permanece v0.3 com CSP connect-src none; não possui console de login e persistência. Essa integração de interface é uma etapa separada.
- O Auth validado por servidor não garante revogação instantânea de access token; revisar expiração/SSO/MFA. Fontes oficiais:
  https://supabase.com/docs/reference/javascript/auth-getuser
  https://supabase.com/docs/guides/auth/jwts
- Security advisor SOT: INFO rls_enabled_no_policy em tabelas privadas intencionalmente sem grants públicos; WARN auth_leaked_password_protection requer revisão antes do uso nominal.
- A aplicação candidata não foi promovida à produção, não há credenciais ativadas nem repositório GitHub independente.

## Cinco etapas restantes para fechar este piloto sintético

1. GitHub separado PRIVADO IndiciumFIN/wutrib-auditor, migrar snapshot da branch com scripts/bootstrap_wutrib_repo.sh; configurar proteção da main e CI no destino. HOLD (conector sem permissão de criar repo).
2. Identidade individual: autenticação real de operador, concessão nominal por organização, aprovação humana com evidência, revisar MFA/expiração e segregação VIEWER/INVESTIGATOR. HOLD.
3. Console web autenticado: login, busca, gravação e recuperação de dossiê por organização, interface responsiva e design system consistente; sem misturar UI pública ou expor service-role. HOLD.
4. Segurança operacional: WAF e limite de acesso anônimo, segredos apenas Vercel protegido, rotação, política de retenção e auditoria, testes HTTPS E2E com sessão real e sem vazamentos. HOLD.
5. Revisão final, autorização e promoção controlada somente do piloto sintético no Vercel WU-TRIB; rollback documentado. NÃO constitui homologação tributária nem autorização para produção fiscal. HOLD.

Checklist pós-wave: 9 PASS e 5 HOLD (14 tarefas), WO permanece PLANNING. Para dados reais do Protheus será necessária WO posterior, com normas oficiais, ambiente homologável e auditoria fiscal.

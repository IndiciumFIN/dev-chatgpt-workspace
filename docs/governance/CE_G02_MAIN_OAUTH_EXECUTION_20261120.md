# CE/CKO/NCOS — G02/P0: proteger a main e revogar credencial de prévia

**Data-base:** 20/11/2026. **Repositório:** IndiciumFIN/dev-chatgpt-workspace. **Natureza:** instrução executável e evidência somente leitura, não comprovação de configuração aplicada.

## 1. Observações verificadas

- HEAD observado antes deste registro: 7f221584e8491c028beebc5fdb60985251e9fb18.
- Consulta GET /repos/IndiciumFIN/dev-chatgpt-workspace/branches/main: protected=false, required_status_checks.enabled=off; sem checks exigidos pelo servidor.
- Consulta GET /repos/IndiciumFIN/dev-chatgpt-workspace/rulesets: lista vazia. Endpoint de proteção clássica retorna HTTP 403 para esta integração: não extrapolar a permissão para escrita.
- O check GitHub Actions chamado **verify** foi SUCCESS no commit 7f221584e8491c028beebc5fdb60985251e9fb18 (run 44775660399), mas não é obrigatório para promover mudanças.
- A main atual lê a credencial de prévia apenas da variável de servidor GROK_PREVIEW_CLIENT_SECRET, conforme src/lib/auth/preview.ts; nenhuma credencial histórica é reproduzida neste documento.
- Há histórico documentado de segredo OAuth de prévia versionado. A ausência do valor no HEAD NÃO comprova revogação pelo emissor, limpeza do histórico nem inexistência de cópias.
- A issue #12 e a issue #28 continuam com seus critérios de encerramento pendentes. **G02 = HOLD; RELEASE_SECURITY = NO_GO.**

## 2. Execução exclusiva do administrador GitHub — proteção efetiva

1. Acessar https://github.com/IndiciumFIN/dev-chatgpt-workspace/settings/rules . Abrir **New ruleset > New branch ruleset** (a localização exata pode variar com a UI). Nome sugerido: CE-G02-MAIN-PROTECTED. Target: **Default branch / main**, apenas este repositório. Mudar **Enforcement** para **Active**.
2. Habilitar **Restrict deletions** e **Block force pushes**. Não permitir bypass irrestrito por administradores ou apps; se a conta exigir exceção operacional, delimitar e registrar cada bypass, e considerar o gate preventivo incompleto.
3. **Perfil recomendado, GO de segurança:** habilitar **Require a pull request before merging**, **Require status checks to pass**, e selecionar exatamente o check publicado **verify** (GitHub Actions: Verificar bibliotecas — sem deploy). Exigir atualização com a base antes de mesclar quando aplicável. Exigir **1 aprovação independente** quando houver revisor com acesso apropriado; não usar autoaprovação ou falso checker. Considerar proteção por review obrigatória somente se houver revisor real, para não travar indevidamente um repositório de único mantenedor.
4. **Incompatibilidade explícita:** PR obrigatório exige ao menos uma branch de origem. A regra anterior de escrever exclusivamente na main sem novas branches não pode coexistir com proibição efetiva de push direto. Recomendação: permitir apenas branch temporária curta por mudança, excluir depois do merge; continuar com a **main como única branch canônica de produto**. Não criar novas branches permanentes de projeto.
5. **Perfil provisório, se a decisão for manter push direto:** aplicar os bloqueios de exclusão/force-push da etapa 2, sem exigir PR. Não chamar isso de G02 concluído; testes de CI após o push não impedem a chegada de código não validado. Registrar essa exceção e seu responsável.
6. Salvar e conferir em https://github.com/IndiciumFIN/dev-chatgpt-workspace/rules e GET /repos/IndiciumFIN/dev-chatgpt-workspace/branches/main que a main está protegida. Verificar se o ruleset ACTIVE tem target correto e se o check **verify** está exigido. Não fazer push destrutivo/force-push real como teste negativo.
7. Testar uma PR regular sem bypass; a interface deve impedir merge enquanto **verify** não tiver passado. Se exigir revisão, testar rejeição sem aprovação independente. Registrar URL da regra, evidência visual sanitizada, SHA exato e data. Só então atualizar a issue #12 e o registro G02.

## 3. Execução exclusiva do proprietário do broker OAuth — rotação/revogação

1. Identificar o proprietário do emissor **https://auth.grok.me** / cliente de prévia **grok_preview**; a integração descrita em src/lib/auth/preview.ts é controlada pelo broker, não pela configuração de branch do GitHub.
2. No painel administrativo desse broker e nas configurações seguras do deploy correspondente, **revogar/invalidar o segredo antigo** e gerar credencial nova. Se a rotação não puder ocorrer prontamente, desabilitar temporariamente o cliente de prévia segundo o procedimento do provedor. Não compartilhar segredo, token, prints com valores ou arquivos .env neste repositório público nem no chat.
3. Atualizar exclusivamente as variáveis secretas no **servidor/broker** e nos ambientes autorizados. Evitar build que injete segredo no cliente; GROK_PREVIEW_CLIENT_SECRET não deve ser exposto por variáveis públicas do frontend.
4. Validar, com testes controlados no emissor, que a credencial antiga não autentica mais (prova negativa) e que a nova credencial funciona (prova positiva). Confirmar redirect URI /api/auth/callback/:id, PKCE, sessão, logout, separação de identidades e rejeição de acesso admin/assinante sem papel permitido.
5. Examinar escopo de exposição no histórico, forks, pipelines, logs e painéis de **Security > Secret scanning** ou mecanismos equivalentes. Não declarar 'zero exposição' apenas por remoção de literal do HEAD. Se a origem do segredo for de terceiro, solicitar formalmente a revogação ao proprietário e manter HOLD até comprovante.
6. Guardar recibo de revogação/rotação, timestamp, identificador não sensível do segredo e resultados dos testes em cofre privado. Publicar somente referência sanitizada/attestation, sem segredo. Atualizar issue #28 após comprovação.

## 4. Critérios de aceite testáveis

- G02_SERVER_ENFORCEMENT: main protected=true e ruleset ACTIVE com push direto controlado, force-push/deletion blocked, check verify requerido e PR/revisão implementados conforme o perfil GO; nenhuma exceção não documentada.
- G02_CI: PR gate verifica check **verify** no SHA exato. Status verde isolado na main não comprova enforcement.
- OAUTH_REVOKED: resposta/atestado do broker prova inutilização do segredo histórico; não basta deletar a string do código.
- OAUTH_E2E: autenticação, PKCE/callback e negativas 401/403/RBAC executados no ambiente efetivo, incluindo sessão de usuário trocado.
- SECURITY_REVIEW: revisão independente do alcance e do fluxo; registro de responsável e data.
- Nenhuma alteração automática no banco Supabase ou migração por esta atividade.

## 5. Material de verificação

- https://github.com/IndiciumFIN/dev-chatgpt-workspace/issues/12
- https://github.com/IndiciumFIN/dev-chatgpt-workspace/issues/28
- https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/44775660399
- https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/creating-rulesets-for-a-repository
- https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets
- https://docs.github.com/en/code-security/tutorials/secure-your-organization/respond-to-a-security-incident

**Disposição atual:** instrução e evidência preparadas; alteração de regras não disponível no conector, revogação do broker não acessível; ambos **HOLD_EXTERNAL_ACTION**. Não mudar status para PASS sem prova posterior.

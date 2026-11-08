# WU-TRIB · Wave 04.1 — evidências de fechamento técnico

Data 2026-11-08. WO WUTRIB-WO-PLAN-016 em PLANNING, sem aprovação fiscal ou autenticação empresarial. Esta documentação complementa WAVE_04_EVIDENCE.md, sem substituir evidências anteriores.

## Fonte e publicação

- Branch isolada: wutrib/demo-persistence-v04-20261108; commit de implantação 3caf461a7eadb73ab8e7da53427bcc9b2fba838b.
- Commit do CI final de 04.1: 6c32c7126ac590570a5b3789196b4885ba71f38d.
- CI final: https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/42488896317 — SUCCESS; 54/54 testes Node; seis agentes determinísticos PASS.
- Preview Vercel exclusivo: dpl_EDcd2WivRt2ty7UMWnrjMEZHaEWY; https://wutrib-auditor-web-piloto-6r7fz1zt7-leivisml-7739s-projects.vercel.app — READY, sem alias da produção. HTTPS smoke: HTML + assets PASS; API sem credenciais 503 DEMO_PERSISTENCE_DISABLED.
- Repositório atual ainda COMPARTILHADO com o projeto maior. Script de bootstrap privado e de branch única: scripts/bootstrap_wutrib_repo.sh. Não executado, pois o conector GitHub disponível não cria repositórios. Sem prova de repo independente.

## Migrações auditáveis

- Inicial da versão 0.4: wutrib_demo_casefiles_v04_private_20261108.
- Hardening: wutrib_demo_v041_strict_contract_rate_gate_20261108.
- Banco: somente Supabase SOT-10-09-2026, ref hcqukuotfwflmebjygam, esquema wutrib. Nenhuma mudança aplicada a Calculadoras-Smart.
- Garantias positivas verificadas: RLS nas tabelas demo_casefiles e demo_operator_rate_limits; service_role executa save_v2, request_gate_v1 e get_v1; somente dados sintéticos.
- Garantias negativas verificadas: anon e authenticated não executam save_v2/request_gate_v1; a RPC de gravação antiga save_v1 perdeu EXECUTE de service_role; acesso público às tabelas negado.
- Validação em SQL: payload sintético aprovado; ALTERAÇÃO para APPROVED, rawXml, findingId desconhecido e estado CLOSED devolvem FALSE. Registro sintético v0.4 anterior permanece válido.
- Prova DB: duas gravações idênticas retornaram a mesma identidade, a leitura recuperou approval NOT_APPROVED e status INVESTIGATING, e o digest é calculado pelo próprio PostgreSQL. Ensaio revertido no final.
- Prova de quota: 30 requisições permitidas na mesma janela por fingerprint sintético, 31ª negada. Ensaio revertido no final.
- O registro sintético original da v0.4 permaneceu preservado. Novo sistema tem digests em formato PostgreSQL jsonb; o digest antigo do cliente só permanece para o registro histórico.

## Condições de segurança

- Sem credenciais instaladas no Vercel para ativar a API. Não existe login individual de operador nem RBAC/multiempresa. Um token compartilhado seria provisório, não controle suficiente para dados empresariais.
- Rate limiter é somente para requisições já autenticadas: proteção na borda de requisições anônimas, monitoramento, retenção de contadores e rotação segura de credenciais continuam HOLD.
- Security Advisor INFO rls_enabled_no_policy para tabelas privadas é esperado: acesso público não foi habilitado. Warning de auth_leaked_password_protection no projeto requer revisão separada antes do login empresarial.
- Sem validação XSD da NF-e ou leiaute EFD homologado; sem regras tributárias certificadas, nenhuma evidência do Protheus e nenhuma autorização para dados empresariais reais.
- A v0.3 principal do Vercel não foi alterada; a main do repositório CE não foi modificada.

## Critérios para desbloquear a API

1. GitHub privado independente de fato, com branch principal protegida e CI replicado; verificar identidade e permissionamento.
2. Autenticação individual, autorização por organização/usuário, rotação de segredo, WAF, limites anônimos e retenção.
3. Testes HTTPS autenticados POST/GET/idempotência com credenciais somente em ambiente protegido e sem vazamento em logs.
4. Revisão de segurança aprovada para dados estritamente sintéticos. Dados fiscais reais seguem HOLD_HUMAN.

As aprovações técnicas aqui descritas não representam homologação fiscal ou aprovação de uso produtivo.

# WU-TRIB · Wave 04.1 · reforço de segurança

WO WUTRIB-WO-PLAN-016, PLANNING. É uma candidata técnica; a interface principal permanece na v0.3 com dados exclusivamente fictícios. A API HTTP continua desligada sem credenciais.

## Reforços de contrato

- O próprio banco exige somente os dez campos conhecidos do dossiê e seis campos por revisão, com os três IDs das fixtures v0.3, estados válidos e invariantes NOT_APPROVED, NOT_EVALUATED, HYPOTHESIS_NOT_CONFIRMED.
- RPC save_v2 calcula o hash canônico a partir de JSONB no servidor, confere conflito e torna inviável informar um hash de idempotência arbitrário. A função save_v1 permanece para rastreabilidade, mas perde EXECUTE de service_role.
- Gate de 30 operações autenticadas por minuto por fingerprint de token, persistido em tabela privada com RLS. Não registra token bruto, IP nem dados empresariais.
- O gate não protege requisições sem autenticação na borda; WAF/quotas de infraestrutura, retenção de contadores e login nominal ainda são pendências.
- Nenhuma política pública é criada e nenhum segredo é enviado ao navegador. O projeto Supabase de destino é somente SOT-10-09-2026, ref hcqukuotfwflmebjygam, esquema wutrib.

## Procedimentos e responsabilidades

1. Verificar CI da branch wutrib/demo-persistence-v04-20261108: agente fiscal, segurança, UX, triagem, release e testes Node.
2. Revisar e aplicar db/wutrib_demo_v041_hardening.sql no projeto SOT, sob a mesma WO. A migration é aditiva, não altera outras tabelas fiscais ou o Calculadoras-Smart.
3. Testar os papéis anon, authenticated, service_role; exercitar validação negativa, GET, inserção v2 idempotente e quota em transação controlada.
4. Publicar somente preview Vercel sem variáveis de ambiente; provar HTTP 503 sem configuração e integridade de assets. Promover apenas após controles de autenticação, antiautomação e consentimento organizacional.

## Repositório independente

O conector GitHub disponível não oferece a criação de novos repositórios. Scripts/bootstrap_wutrib_repo.sh registra uma migração assistida via gh para o repositório PRIVADO IndiciumFIN/wutrib-auditor, com snapshot de branch e commit de origem; não replica branches do CE. Executar o script somente com autenticação GitHub do proprietário e revisão da árvore, proteção de main e segredos.

## HOLD

Credenciais de API em Vercel, autenticação empresarial, isolamento de usuários e empresas, logging de ator, retenção definida e registros fiscais reais seguem bloqueados. Nenhuma aprovação fiscal é concedida.

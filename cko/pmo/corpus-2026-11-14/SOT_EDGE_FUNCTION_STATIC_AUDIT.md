# Auditoria estática do piloto Corpus Engine — funções e envio externo de texto

**Data:** 14/11/2026. **Projeto:** `SOT-10-09-2026` (`hcqukuotfwflmebjygam`).
**Método:** leitura das 9 Edge Functions por conexão Supabase, sem invocá-las, sem executar transações, sem consultar segredos e sem copiar código potencialmente sensível para o repositório.

## Resultado
- 9 funções `ACTIVE`: 6 `verify_jwt=true`; 3 `verify_jwt=false`.
- As três públicas foram inspecionadas: `corpus-test-ui` responde 410; `corpus-demo-health` e `corpus-public-health` implementam diagnóstico de rede sem autenticação, sem acesso a DB ou secrets **pelo código de entrada examinado**. Isso **reduz** o risco de acesso indevido presumido anteriormente, mas não substitui teste dinâmico de disponibilidade/abuso.
- Seis protegidas incluem controle explícito de bearer token e checagem de role `corpus_operators` no código consultado.
- **FIND PRIORITÁRIO:** `deepseek-atomize` lê `corpus_fragments.text_content` e o envia no corpo de requisição à API externa DeepSeek; grava propostas como `DRAFT_AI`. Não encontrei no código dessa função um check específico de direitos da fonte/documento para a operação `EXTERNAL_AI_TDM` antes desse envio. Não comprova que não exista controle upstream; esse fluxo deve ser bloqueado até demonstração do gate.
- `dou-inlabs` é write-capable, faz download do INLABS, grava objeto em storage e registros em tabelas; não é apenas diagnóstico.
- `corpus-connectivity` usa CORS `*`, mas valida JWT e papel de operador. CORS amplo isoladamente não é evidência de bypass de autenticação; revisar política e retorno.
- Nenhuma função foi invocada dinamicamente. Não houve exploração, exfiltração, publicação, nova chave nem escrita no Supabase.

## Gate obrigatório antes de uso de external AI
`ALLOW_EXTRNAL_AI_TDM` exige, para o fragmento atual: `source_id`, `document_id`, `snapshot_id`, integridade/hash, rights_record válido por **operação external AI**, jurisdição, política de dados/privacidade e titularidade verificadas, ação aprovada e auditável. Se não houver vínculo e prova, `DENY + HOLD_RIGHTS + FIND`. Um JWT de `reviewer` não prova direitos de processamento. A verificação precisa ocorrer **antes** da chamada ao provedor externo, não só antes da publicação.

## Testes propostos, sem modificar ambiente
- Documento com `LICENSE_QUARANTINED` → deny, zero outbound request.
- Documento com licença indeterminada → deny.
- Documento `DEFAULT_ACTIVE` para recuperação local, mas não para TDM externo → deny.
- `rights_record` inválido/vencido/da versão errada → deny.
- `rights_record` aprovado explicitamente para provider e operação, sem dado pessoal → permitir apenas em sandbox autorizado, após revisão de arquitetura; log de evento sem texto integral.
- Snapshot não ligado ao fragmento ou alteração de hash → deny.
- Fluxo pública de health: somente GET/HEAD/OPTIONS, nenhum acesso a secret ou DB; testes de rate limit e monitoramento em ambiente aprovado.

**Conclusão:** `SOT_OPERATIONAL_AI_INGESTION=HOLD`; piloto continua preservado, funções não alteradas. ADR-CKO-002 ainda não foi assinado.

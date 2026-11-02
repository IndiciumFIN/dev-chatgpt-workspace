# Commander · protocolo de entrega determinística das IAs (candidato)

**Data:** 2026-10-26 · **Issue mestre:** #14 · **PR:** #13 DRAFT/HOLD.
**PMO único:** registers/pmo/queue.v1.json. Delegação em registers/commander/lanes.v1.json é proposta de responsabilidades, NÃO um segundo PMO.

## Funcionamento nesta fase
Commander mostra WOs do PMO e a proposta de frentes especializadas. Nenhum agente é despachado por UI, issue ou CLI automaticamente. A API DeepSeek permanece opcional no gov:assist com opt-in explícito e apenas metadados mínimos autorizados.
Os issues #15 (MiniMax), #16 (Manus), #17 (DeepSeek) e #18 (Auditor) são caixas de entrega. Issues NÃO constituem admissão Kernel, execução, aprovação ou promoção.

## Entradas imutáveis
- main 6c62bb61791631681979b229ccfbb05f7f5ac411; preview 3f004049945ebaa50e4efee313092974b83a5bf2; PR #13 inicia em 5b116957b6a8cb2719aad216b9a3250ba76c1890.
- Contratos existentes: AGENTS.project.md, AGENTS.md, agents/normativos-licenciados.md, contracts/cko-schemas/agent.schema.json; direito de uso e Kernel/OPA têm precedência.
- Falta de run/evidência => NOT_RUN ou HOLD, nunca PASS presumido.

## Arquivos esperados de cada agente
delivery-manifest.json conforme docs/governance/commander/agent-delivery.schema.json; findings.json; validation.json; handoff.md. Cada output inclui arquivo, origem, SHA-256, executor + recibo de run, status e limites de direitos. O Checker não aprova seu próprio patch.

## Trilho obrigatório para execução futura
FIND → política → validador → WO → decisão OPA → admissão Kernel → executor isolado → testes → auditoria independente → autorização humana.

## Política de execução
Sem branch nova, sem main, merge, deploy, DDL, escrita remota, acesso a segredos, transmissão de conteúdo clínico/licenciado/identificável para modelos. Saída de IA é entrada não confiável, incapaz de executar comandos. Não reexecutar trabalho idempotente com mesmo input SHA e validador.

## Critérios de aceite
1. Todas as equipes vinculadas a WOs reais do PMO.
2. Separação MAKER/AUDITOR e referências da fonte identificadas.
3. Schema, hashes e critérios verificáveis em readback.
4. Commander exibe 'não despachado' em todas as delegações.
5. CI verde no SHA final, PR permanece DRAFT/HOLD até gates corporativos.

**Limitação:** a existência de issues não comunica automaticamente estas tarefas a ferramentas externas como Manus/MiniMax/DeepSeek sem integração/permissões próprias.

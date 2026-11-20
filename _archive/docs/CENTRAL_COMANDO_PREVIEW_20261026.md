# Central de Comando — prévia isolada (2026-10-26)

**Estado:** implementação visual R3 preliminar, somente leitura; **não homologada para produção**.

## Origem e limites
- Especificação: *Especificacao_Final_Central_de_Comando_e_Tabelas_Iniciais.docx* (v1.0; 7 macrogrupos, 22 módulos, 215 tabelas lógicas).
- Fonte existente do PMO: `registers/pmo/queue.v1.json`, com dados exibidos exatamente como registros versionados em Git. Não existe polling, stream nem sincronização contínua.
- FINDs exibidos: `registers/governance/imports/cko-coren-cofen-20261023/pending-candidates.v1.json` (candidatos não admitidos).
- Interface: `/central-comando`. Link contextual na barra de ferramentas de `/admin`.
- A rota não publica conteúdo clínico e não concede privilégios. A prévia hospedada precisa permanecer sob proteção de acesso na Vercel.

## Hierarquia aprovada
1. Topo: monitor operacional (65%) ao lado de comunicação (35%), responsivo.
2. Abaixo: caixa de prompt com modos Consulta / Preparação / Execução Controlada.
3. Abaixo: seleção de WO e ação Executar **desabilitada**.
4. Base: oito cards, cada um abre detalhamento no mesmo contexto; o catálogo de 215 tabelas permite busca por domínio e B0/B1.

## Controles obrigatórios
- A escrita remota, execução, envio de prompt e chamadas LLM/API/Kernel estão bloqueados.
- "Homologada" não é sinônimo de "Executável"; nenhum registro no PMO disponível comprova homologação atual.
- Números de agentes, gates e telemetria são indisponíveis (—), sem inventar métricas.
- Campos de prompt são rascunhos apenas em memória do React; nenhum backend nem localStorage guarda mensagens.
- Tabelas propostas são inventário, não migrações. Não se deve executar DDL sem inventário, dicionário, política, RBAC/RLS, revisão e autorização.
- O acesso não é autorizado no frontend: controles reais exigem autenticação e checagem server-side antes de permitir operação sensível.

## Critérios para próxima onda
1. R0: confrontar o catálogo lógico com schema real do Supabase e arquivos Git (EXISTENTE/REUTILIZAR/AJUSTAR/CRIAR/HOLD).
2. R1: contratos, política de políticas, validação de privilégios e testes negativos.
3. R2: WO homologada, evidência, locks, idempotência, runners e gates reais.
4. R3: somente após integração autenticada: eventos ordenados, replay, dashboards reais e auditoria independente de telemetria.
5. R4: executar sob WO válida após revalidação transacional de políticas e controles.

## Validação necessária
- `npm run typecheck`
- `npm test`
- `npm run build:spa`
- Teste de rota `/central-comando` em desktop/mobile, navegação por teclado, foco visível e contraste.
- Verificar que nenhum comando aciona rede ou modifica Git/Vercel/Supabase.
- Verificar que a publicação da rota ocorre apenas em Preview, sem promoção para Production.

Esta mudança não reabre nem encerra a WO-ADM-001; permanece como protótipo isolado, sujeito a reconciliação/homologação.

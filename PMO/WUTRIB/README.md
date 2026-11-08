# PMO WU-TRIB — controle canônico de atividades V1

**Estado:** versão piloto de governança (não homologada), WO planejada WUTRIB-WO-PLAN-019, parent WUTRIB-WO-PLAN-018. Branch isolada de WU-TRIB. O agente é **determinístico**; não usa LLM para alterar tarefas, não altera banco, Supabase, Vercel, regras fiscais, sites nem a plataforma Calculadoras de Enfermagem.

## Estrutura

| Diretório | Propósito |
|---|---|
| wo/ | WO de criação do PMO, checklist, autorização e gate de admissão no Kernel |
| data/activities.v1.json | Quadro versionado: 26 lacunas da PR49, 30 grupos de testes da PR48, 7 gates |
| data/events.v1.json | Journal append-only lógico: seq, hash SHA-256 e hash anterior, histórico de alterações |
| agent/pmo-controller.mjs | Reconciliador e controlador de transições, operando em arquivos locais |
| contracts/ | Schema de dados do quadro e regras de autoridade |
| tests/ | Testes negativos, idempotência, segurança dos estados e cadeia de eventos |
| reports/ | Sumário JSON e relatório Markdown, gerados deterministicamente |
| .github/workflows/wutrib-pmo-controller.yml | Validação no GitHub e atualização restrita na branch de PMO |

## Fontes e rastreabilidade

- **GAP-001 a GAP-026:** docs/wutrib/v1-assurance-20261108/MATRIZ_LACUNAS_E_CORRECOES_V1.json — 16 P0, 10 P1.
- **T01 a T30 e GV1-00 a GV1-06:** docs/wutrib/v1-baseline-20261108/MATRIZ_DE_TESTES_E_GATES_V1.json — todos NOT_RUN ou HOLD_HUMAN.
- As 50 peças de documentação, 28 validadores candidatos e 22 engines da visão anterior são **outras dimensões**; o PMO importa somente atividades estruturadas selecionadas, sem declarar módulos implementados.
- A relação WO→tarefa→origem→controle/risco→teste→evidência→revisor→decisão existe **como contrato de governança**; para homologação terá de ser preenchida, validada e admitida pelo Kernel.

## Comandos locais — Node.js 22 ou superior

A partir da raiz do repositório:

- Verificar integridade e cadeia do journal, sem escrever: node PMO/WUTRIB/agent/pmo-controller.mjs check
- Exibir inventário e estados: node PMO/WUTRIB/agent/pmo-controller.mjs status
- Prévia de reconciliação das matrizes: node PMO/WUTRIB/agent/pmo-controller.mjs sync
- Aplicar reconciliação permitida e atualizar relatórios: node PMO/WUTRIB/agent/pmo-controller.mjs sync --write
- Atualizar atividade de planejamento: node PMO/WUTRIB/agent/pmo-controller.mjs transition --id WUTRIB-PMO-GAP-001 --to IN_PROGRESS --actor usuario --reason "Preparando documentação e oráculos" --write
- Encaminhar para revisão: node PMO/WUTRIB/agent/pmo-controller.mjs transition --id WUTRIB-PMO-GAP-001 --to READY_FOR_REVIEW --actor usuario --reason "Documento disponível para revisão" --evidence docs/wutrib/v1-assurance-20261108/CONTRATOS_MINIMOS_EFD_NFE_PROTHEUS_V1.md --write
- Reconhecer alteração de fonte após revisão: node PMO/WUTRIB/agent/pmo-controller.mjs ack --id WUTRIB-PMO-GAP-001 --actor revisor --reason "Mudança avaliada frente à fonte" --write
- Testes do AGENTE (não da ferramenta fiscal): node --test PMO/WUTRIB/tests/pmo-controller.test.mjs

**Observação de segurança:** o parâmetro actor é um identificador declarado, **não autenticação ou assinatura eletrônica**. A revisão assinada precisa ocorrer em processo/GitHub com identidade efetivamente verificável e autoridade documental. O hash encadeado identifica adulteração local simples, mas a imutabilidade depende de proteção do repositório e da revisão de commits; não é blockchain.

## Regras de transição

| Tipo | Estados possíveis no PMO | Permissão do agente |
|---|---|---|
| GAP (análise/documentação) | OPEN → IN_PROGRESS ↔ BLOCKED → READY_FOR_REVIEW | Atualiza com ator/motivo e arquivo de evidência para revisão |
| TEST (planejado) | NOT_RUN, BLOCKED (até admissão executiva) | **Não executa** testes nem pode declarar PASS/DONE |
| GATE (alçada) | HOLD_HUMAN | **Não modifica** — exige aceite externo identificado |

Todos os estados finais APPROVED, PASS, DONE, CLOSED, RELEASED e GO são **proibidos ao agente**. Com mudança da fonte, itens existentes são atualizados em metadados sem perder o estado nem a evidência e ganham drift=true. Item retirado da matriz de origem **permanece** e requer revisão, não é apagado silenciosamente.

## Agendamento e atualização no GitHub

O workflow proposto valida o PMO no PR e, em push autorizado na branch **wutrib/pmo-v1-controller-20261108**, executa sync --write; se o quadro/relatório mudar, comita **somente arquivos do PMO**, com usuário github-actions[bot]. O job de escrita é bloqueado para forks/PRs e não chama agentes fiscais. A execução no servidor depende das permissões do GitHub Actions/branch; scripts não prometem sucesso antes da verificação do run.

**Importante:** a agenda schedule do GitHub Actions é lida do branch padrão. Enquanto o workflow estiver apenas na branch candidata e a PR estiver Draft, **a execução diária agendada não está ativa**. Após aprovação humana de integração, será necessário configurar a agenda na branch padrão ou procedimento dedicado, considerando proteção e menor privilégio. Nenhum merge ou deploy está autorizado por esta WO.

## Critérios de admissão do PMO

1. Testes do agente e integridade documental devem passar em CI.
2. Todos os 63 registros rastreados, sem perda de IDs, fonte ou decisão humana.
3. Reexecução idempotente de sync; journal detecta alteração de eventos; nenhum PASS automático.
4. O workflow não escreve fora de PMO/WUTRIB/data e reports, não altera arquivos de origem nem código.
5. Qualquer ativação de job recorrente que mude repositório deve ter owner, política de revisão de commits e aprovação do Kernel.
6. Para homologação fiscal, continuar valendo todas as condições da baseline PR48/49, não substituídas por este PMO.

**NO_GO para produção e homologação fiscal.**

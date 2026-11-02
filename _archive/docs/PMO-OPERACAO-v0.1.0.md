# PMO canônico — v0.1.0 · 2026-10-23

## Decisão do proprietário
O protótipo da administração está **congelado**. O PMO é a única evolução permitida no console nesta fase; a execução deve seguir a fila do projeto. Toda alteração de prioridade, estado, FIND e evidência exige atualização do registro e commit verificável.

## Fonte única e UX
- Registro: `registers/pmo/queue.v1.json` — fonte canônica versionada no repositório autorizado `IndiciumFIN/dev-chatgpt-workspace`.
- Consumidor: aba inicial **PMO · fila** em `/admin` e `/oficina-local`; filtros somente de visualização; nenhum armazenamento da fila em localStorage.
- Gestão: assistente altera o registro via GitHub; a interface é atualizada após novo build/deploy. Ainda não existe edição multiusuário, sincronização de status ao vivo nem auditoria imutável.
- Validação: `node scripts/check-pmo-queue.mjs`. Um `DONE` sem evidência é bloqueado. A origem de cada evidência é restrita ao repositório autorizado. Revisão clínica e regulamentar continuam sujeitas a aprovação humana.
- Estados: `QUEUED`, `IN_PROGRESS`, `PAUSED`, `BLOCKED`, `HOLD_HUMAN`, `DONE`. Não inventar percentuais de conclusão.
- Em caso de erro descoberto depois do fechamento, gerar FIND, causa e correção; registrar tarefa no final da fila, mantendo os gates bloqueantes aplicáveis.

## Equipe proposta (não presumir acesso)
| Papel | Responsável/candidato | Responsabilidade e limite |
|---|---|---|
| Coordenação | ChatGPT | Escopo, decomposição, execução via integrações autorizadas, PMO, revisão de evidências |
| Engenharia e UX | MiniMax (plugin oferecido, não verificado nesta sessão) | Revisão de interfaces e código em ambiente isolado, sujeito à integração |
| Revisão independente | DeepSeek (API oferecida, não configurada) | Revisões adversariais, análises comparativas, saídas restritas a proposta |
| Controle | Scripts determinísticos, schemas, GitHub Actions | PASS/FAIL/HOLD comprováveis, sem arbitrariedade do LLM |
| Homologação | Proprietário e profissionais competentes | Decisões de risco, conteúdo clínico, regulatório e liberação crítica |

Até a ativação formal e verificada de MiniMax/DeepSeek, as ordens executáveis ficam com ChatGPT e validadores existentes. Não gravar token/API key no repositório, frontend, logs ou chat. Eventual integração DeepSeek deve ocorrer apenas em executor server-side com secret, políticas de minimização/redação de dados, orçamento e autorização de saída.

## Próxima execução
`WO-SEC-001`: triagem da vulnerabilidade npm alta, autorização administrativa e LGPD. Não usar `npm audit fix` cego; criar FIND e teste de regressão, preservar modo remoto bloqueado.

## Pendências
- `FIND-PMO-001`: sincronização operacional da fila ainda exige commit, não atualização por eventos de uma base central.
- `FIND-PMO-002`: MiniMax/DeepSeek não conectados ao executor autenticado.
- `FIND-PMO-003`: /admin ainda não é área de gestão multiusuário nem aprovação de conteúdo clínico.

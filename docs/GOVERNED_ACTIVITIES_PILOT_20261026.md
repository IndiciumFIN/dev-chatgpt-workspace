# Piloto de atividades governadas — proposta técnica isolada

**Não é um novo Kernel, PMO, banco de dados, executor remoto nem política.** O piloto consome exclusivamente `registers/pmo/queue.v1.json` e não altera a fonte. Sem server/API persistente. Executar numa branch candidata, não na `main`.

## Comandos funcionais

```sh
npm run gov:validate
npm run gov:scan
npm run gov:report
npm run gov:plan -- --wo=WO-ADM-001
npm run gov:assist -- --wo=WO-ADM-001
```

O `plan` prepara atividades candidatas com dependências e cadeia de admissão. `assist` sem flags não chama nenhuma API: apenas pré-visualiza os campos públicos mínimos propostos para envio externo.

Com consentimento explícito e uma chave `DEEPSEEK_API_KEY` configurada apenas no ambiente protegido, o operador **pode optar** por sugestões assistivas:

```sh
npm run gov:assist -- --wo=WO-ADM-001 --send --confirm-public-metadata
```

**Importante:** este comando compartilha somente ID, prioridade, estado e contagem de dependências; não compartilha texto clínico, contratos, código-fonte, PHI, segredos, URLs privadas ou corpus. O serviço recebe a solicitação e devolve até três microtarefas textuais candidatas, que **não executam nada** e não entram automaticamente no PMO. Evite colocá-lo em CI. O modelo `deepseek-flash` e endpoint são configurados conforme documentação oficial da API DeepSeek; caso a conta não aceite o modelo, o erro da API será reportado sem tentar um fallback com saída não validada.

## Gates de adoção

1. Reconciliar WOs e decisões no registro original. Nenhuma status transition será feita por IA.
2. Executar `node --test scripts/test-gov-activities.mjs` no CI, sem nenhuma chamada de rede.
3. Homologar restrições de compartilhamento de dados com terceiros (LGPD, licenças, operador, finalidade e retenção) antes de usar `--send` com dados reais.
4. Somente depois aprovar uma arquitetura de adaptador/proxy autenticado para o painel — segredo nunca no front-end, navegador ou VITE env.
5. Executor real futuro requer OPA distribuído, identidade, Kernel admitido, leases, idempotência, RBAC, auditoria e revisão humana.

## Auditoria independente recebida

O HEAD `main` em `6c62bb6` recebeu Commander in-memory e `WO-ADM-001` está `IN_PROGRESS`, com evento de autorização e escopo limitado. O workflow principal falha porque `scripts/check-pmo-queue.mjs` permanece codificando `WO-ADM-001=PAUSED`; o workflow browser já passou. **Afirmar "engenharia 0% pendente" não é sustentado no GitHub pelo CI do HEAD.** O protótipo permanece sem LLM/Kernel/agentes, sem autorização remota e sem DB corporativo.

O total de 56 schemas CKO e percentuais clínicos citados na auditoria externa só devem ser usados com inventário, critério `IMPLEMENTED` e denominador materializado; arquivos declarativos existentes não equivalem a aplicação em banco. Não reduzir essas dimensões a um percentual composto.

## Semântica dos estados

- `CANDIDATE_FOR_PREFLIGHT`: dependências com status `DONE`, mas **não** significa autorização de execução.
- `ACTIVE_WITH_SCOPE_LIMITS`: WO em andamento, sempre sujeita à decisão/escopo vigentes.
- `HOLD_HUMAN`, `PAUSED`, `BLOCKED`, `WAITING_DEPENDENCIES`: não executáveis.
- `CLOSED`: tarefa `DONE` com evidências declaradas; validação independente ainda depende das fontes.

Nenhum documento deste piloto deve ser usado para contornar `WO-HOM-001=HOLD_HUMAN`, `WO-DS-001`, `md_gate` ou a necessidade de aprovação para merges/deploys.
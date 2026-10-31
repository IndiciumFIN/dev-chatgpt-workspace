# R88 — Auditoria independente do backup CE (31/10/2026)

**Natureza:** evidência técnica de candidato, `HOLD_HUMAN`. NÃO é revisão clínica nem aprovação Kernel, e não promove artefatos.

## Fontes preservadas

- ZIP recebido: `backup-ce-estado-2026-10-31.zip`; SHA-256 `162d70c83d6a4fc5442d3a4cacfef54ef9cf623b42b352a9251aa7fd53900ffc`.
- Material anterior: `ce-experience-skeleton-v0.1.0.zip`; SHA-256 `3f6c50c2fb4b2b53ca2df5e1560219fd231aecda0641126545a29b6415b63c26`.
- Backup contém 1479 entradas, incluindo 1388 na pasta `01-esqueleto-ce`, plano PMO snapshot 112 tarefas, evidence pack e extração federais parcial. O manifesto `00-LEIA-ME.md` declara seis frentes de comparação canceladas sem entregáveis concluídos.
- O arquivo `02-evidencia/branches-todas.json` contém 182 entradas de branch do repo público e 24 do privado **como snapshot**, não verificação live de todas as pontas.

## Auditoria reproduzida no container, escopo LOCAL (não CI GitHub)

- Base local: 45 famílias, 410 serviços, 201 capabilities e 16 tipos; `node scripts/generate-skeleton.mjs --check` sem drift; **72/72** testes originais com descoberta recursiva explícita.
- Novo achado **P0**: `LibraryEntity` referencia `CAP-RELATED-CONTENT`, ausente das 201 capabilities da PR #21. Nenhum alias foi inventado ou removido da fonte: **FIND-001 OPEN_HOLD**.
- Novo achado **P0**: o resolver entregava `available=true` para binding `PROPOSED`. Corrigido no piloto e no arquivo candidato do PR #26: sem admissão, `available=false` com justificativa.
- Bug do gerador: `acoes.export` produzia `export function export()`, inválida em TypeScript. Corrigido o prefixo da função para `run_`; stubs agora SEMPRE lançam `NOT_IMPLEMENTED_CANDIDATE_HOLD` mesmo que a string de status seja alterada. Código candidato corrigido no PR #26.
- Bug do comando de teste: `npm test` executava apenas **35** dos testes, pois o glob não percorria todas as pastas. Runner local `scripts/run-all-tests.mjs` percorre recursivamente. **80/80 via `npm test`**, incluindo **8 testes adicionais** de falha fechada.
- Novo `scripts/verify-security-invariants.mjs` local valida status de fonte, referências, IDs duplicados, população EXATA de arquivos, symlinks e reprodutibilidade byte-a-byte via `--check`. Gate combinado: **11/12**, último FAIL deliberado por referência inválida. Testes estruturais 80/80 não anulam este HOLD.
- TypeScript: typecheck sem erro em ambiente de auditoria com TS global 5.8.3 e declarações Node 22.19.7 disponibilizadas; **`npm ci` / toolchain TS 5.7 não executado**, pois o ZIP não tem lockfile. `@types/node` foi acrescentado ao candidato local.

## Arquivos externos disponibilizados à revisão

- `ce-experience-skeleton-hardened-r88.zip`, SHA-256 `fd08c1ec2a0ead845c26209516f5dd01823d418a6c8fab14d7425918e49911cd`, com 928 arquivos dentro de `ce-skeleton/`.
- `RELATORIO-R88-ESQUELETO-CE.md` e `ce-skeleton/registers/r88-skeleton-security-findings.candidate.v1.json`.

## Dependências não fechadas

1. Checker autorizado precisa resolver `CAP-RELATED-CONTENT` na fonte PR #21 (renomear com equivalência provada ou retirar a associação com rastreabilidade); sem isso o gate correto segue FAIL.
2. O repositório privado na branch do PR #26 contém **o gerador e o resolver candidatos, não os 905 arquivos gerados da cópia local**. Estes permanecem não-portados até WO/Kernel; os demais patches/gates do ZIP também são locais.
3. A última checagem de GitHub tinha 112 tasks, mas snapshot do backup trazia `TASK-PLAN-132=IN_PROGRESS`, enquanto o remoto `TASK-PLAN-132=BLOCKED`: não sobrescrever a autoridade atual. Validador de PMO ainda acusa `TASK_PLAN_DRIFT`, por expansão pendente de reconciliação; sem arbitragem de admissão.
4. Faltam 16 FINDs da PR #21 no registro canônico, metamodelo definitivo, 13 schemas de objeto, 8 módulos-alvo, contratos de evento/API, testes de direitos e acessibilidade, E2E, security review e matriz de ownership de 410 serviços.

**Controles:** nenhuma alteração na `main`, fila PMO, permissões, produção, Supabase ou segredos. `HOLD_HUMAN` até correção e aprovação independente.
